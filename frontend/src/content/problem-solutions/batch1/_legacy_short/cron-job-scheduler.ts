import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('sc', 'Scheduler', 40, 40, [
    attr('-', 'queue', 'JobQueue'),
    attr('-', 'jobs', 'Map<string, Job>'),
    attr('-', 'pool', 'WorkerPool'),
    attr('-', 'retryPolicy', 'RetryPolicy'),
    attr('-', 'clock', 'Clock'),
  ], [
    method('+', 'scheduleOnce', 'task, delay, priority, maxRetries', 'string'),
    method('+', 'scheduleInterval', 'task, interval, priority, maxRetries', 'string'),
    method('+', 'cancel', 'jobId: string', 'bool'),
    method('+', 'listPending', '', 'List<Job>'),
    method('+', 'listCompleted', '', 'List<Job>'),
    method('+', 'start / stop', '', 'void'),
  ], 'facade'),
  cls('jq', 'JobQueue', 400, 20, [
    attr('-', 'heap', 'MinHeap<Job>'),
  ], [
    method('+', 'push', 'job: Job', 'void'),
    method('+', 'peek', '', 'Job?'),
    method('+', 'pop', '', 'Job'),
  ]),
  cls('jb', 'Job', 400, 190, [
    attr('-', 'id', 'string'),
    attr('-', 'task', 'Task'),
    attr('-', 'nextRunTime', 'Timestamp'),
    attr('-', 'priority', 'int'),
    attr('-', 'interval', 'Duration?'),
    attr('-', 'maxRetries', 'int'),
    attr('-', 'attempts', 'int'),
    attr('-', 'status', 'JobStatus'),
  ], [
    method('+', 'isRecurring', '', 'bool'),
  ]),
  enm('js', 'JobStatus', 400, 460, ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']),
  cls('wp', 'WorkerPool', 40, 340, [
    attr('-', 'workers', 'int'),
    attr('-', 'ready', 'Queue<Job>'),
  ], [
    method('+', 'submit', 'job: Job', 'void'),
    method('+', 'shutdown', '', 'void'),
  ]),
  iface('rp', 'RetryPolicy', 720, 20, [
    method('+', 'delayFor', 'attempt: int', 'Duration'),
  ]),
  cls('eb', 'ExponentialBackoff', 720, 140, [
    attr('-', 'base', 'Duration'),
    attr('-', 'factor', 'double'),
    attr('-', 'max', 'Duration'),
  ], [
    method('+', 'delayFor', 'attempt: int', 'Duration'),
  ]),
  iface('ck', 'Clock', 720, 330, [
    method('+', 'now', '', 'Timestamp'),
  ]),
  cls('sk', 'SystemClock', 720, 430, [], [
    method('+', 'now', '', 'Timestamp'),
  ]),
]

const edges = [
  edge('e1', 'sc', 'jq', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e2', 'jq', 'jb', 'aggregation', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'orders by nextRunTime' }),
  edge('e3', 'sc', 'wp', 'composition', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e4', 'jb', 'js', 'dependency', 'bottom', 'top'),
  edge('e5', 'sc', 'rp', 'aggregation', 'top@50', 'left', { label: 'uses' }),
  edge('e6', 'eb', 'rp', 'realization', 'top', 'bottom'),
  edge('e7', 'sc', 'ck', 'aggregation', 'bottom@85', 'left', { label: 'reads time' }),
  edge('e8', 'sk', 'ck', 'realization', 'top', 'bottom'),
  edge('e9', 'wp', 'jb', 'dependency', 'right', 'left', { label: 'executes' }),
]

const py = `from __future__ import annotations
import heapq
import itertools
import threading
import time
import uuid
from abc import ABC, abstractmethod
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from enum import Enum
from typing import Callable, Dict, List, Optional


class JobStatus(Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class Clock(ABC):
    @abstractmethod
    def now(self) -> float:
        ...


class SystemClock(Clock):
    def now(self) -> float:
        return time.time()


class RetryPolicy(ABC):
    @abstractmethod
    def delay_for(self, attempt: int) -> float:
        """Seconds to wait before retry number 'attempt' (1-based)."""


class ExponentialBackoff(RetryPolicy):
    def __init__(self, base: float = 0.5, factor: float = 2.0, max_delay: float = 60.0):
        self.base, self.factor, self.max_delay = base, factor, max_delay

    def delay_for(self, attempt: int) -> float:
        return min(self.max_delay, self.base * (self.factor ** (attempt - 1)))


@dataclass(eq=False)
class Job:
    id: str
    task: Callable[[], None]
    next_run: float
    priority: int = 0
    interval: Optional[float] = None
    max_retries: int = 0
    status: JobStatus = JobStatus.PENDING
    attempts: int = 0
    runs: int = 0
    last_error: Optional[str] = None

    def is_recurring(self) -> bool:
        return self.interval is not None


class JobQueue:
    """Min-heap keyed by (next_run, -priority, seq). Cancelled jobs are skipped lazily."""

    def __init__(self) -> None:
        self._heap: List[tuple] = []
        self._seq = itertools.count()

    def push(self, job: Job) -> None:
        heapq.heappush(self._heap, (job.next_run, -job.priority, next(self._seq), job))

    def peek(self) -> Optional[Job]:
        return self._heap[0][3] if self._heap else None

    def pop(self) -> Job:
        return heapq.heappop(self._heap)[3]


class Scheduler:
    def __init__(self, workers: int = 4, retry: Optional[RetryPolicy] = None,
                 clock: Optional[Clock] = None):
        self._clock = clock or SystemClock()
        self._retry = retry or ExponentialBackoff()
        self._queue = JobQueue()
        self._jobs: Dict[str, Job] = {}
        self._completed: List[Job] = []
        self._pool = ThreadPoolExecutor(max_workers=workers)
        self._cv = threading.Condition()
        self._running = False
        self._dispatcher: Optional[threading.Thread] = None

    # ---- public API ----
    def start(self) -> None:
        with self._cv:
            if self._running:
                return
            self._running = True
        self._dispatcher = threading.Thread(target=self._dispatch_loop, daemon=True)
        self._dispatcher.start()

    def stop(self) -> None:
        with self._cv:
            self._running = False
            self._cv.notify_all()
        if self._dispatcher:
            self._dispatcher.join()
        self._pool.shutdown(wait=True)

    def schedule_once(self, task: Callable[[], None], delay: float = 0.0,
                      priority: int = 0, max_retries: int = 0) -> str:
        return self._add(task, delay, None, priority, max_retries)

    def schedule_interval(self, task: Callable[[], None], interval: float,
                          initial_delay: Optional[float] = None,
                          priority: int = 0, max_retries: int = 0) -> str:
        if interval <= 0:
            raise ValueError("interval must be positive")
        return self._add(task, interval if initial_delay is None else initial_delay,
                         interval, priority, max_retries)

    def cancel(self, job_id: str) -> bool:
        with self._cv:
            job = self._jobs.get(job_id)
            if job is None or job.status in (JobStatus.COMPLETED, JobStatus.FAILED,
                                             JobStatus.CANCELLED):
                return False
            job.status = JobStatus.CANCELLED  # lazy removal from the heap
            self._cv.notify_all()
            return True

    def list_pending(self) -> List[Job]:
        with self._cv:
            jobs = [j for j in self._jobs.values()
                    if j.status in (JobStatus.PENDING, JobStatus.RUNNING)]
            return sorted(jobs, key=lambda j: (j.next_run, -j.priority))

    def list_completed(self) -> List[Job]:
        with self._cv:
            return list(self._completed)

    # ---- internals ----
    def _add(self, task, delay, interval, priority, max_retries) -> str:
        if max_retries < 0:
            raise ValueError("max_retries must be >= 0")
        job = Job(id=str(uuid.uuid4()), task=task, next_run=self._clock.now() + max(0.0, delay),
                  priority=priority, interval=interval, max_retries=max_retries)
        with self._cv:
            self._jobs[job.id] = job
            self._queue.push(job)
            self._cv.notify_all()
        return job.id

    def _dispatch_loop(self) -> None:
        with self._cv:
            while self._running:
                job = self._queue.peek()
                if job is None:
                    self._cv.wait()
                    continue
                if job.status is JobStatus.CANCELLED:
                    self._queue.pop()
                    continue
                delay = job.next_run - self._clock.now()
                if delay > 0:
                    self._cv.wait(timeout=delay)
                    continue
                self._queue.pop()
                job.status = JobStatus.RUNNING
                self._pool.submit(self._execute, job)

    def _execute(self, job: Job) -> None:
        with self._cv:
            if job.status is JobStatus.CANCELLED:
                return
        error: Optional[str] = None
        try:
            job.task()
        except Exception as exc:  # task failures never kill a worker
            error = repr(exc)
        with self._cv:
            if job.status is JobStatus.CANCELLED:
                return
            now = self._clock.now()
            if error is None:
                job.attempts = 0
                job.runs += 1
                if job.interval is not None:
                    job.next_run = max(job.next_run + job.interval, now)
                    self._requeue(job)
                else:
                    self._finish(job, JobStatus.COMPLETED)
                return
            job.attempts += 1
            job.last_error = error
            if job.attempts <= job.max_retries:
                job.next_run = now + self._retry.delay_for(job.attempts)
                self._requeue(job)
            else:
                self._finish(job, JobStatus.FAILED)

    def _requeue(self, job: Job) -> None:
        job.status = JobStatus.PENDING
        self._queue.push(job)
        self._cv.notify_all()

    def _finish(self, job: Job, status: JobStatus) -> None:
        job.status = status
        self._completed.append(job)


def demo() -> None:
    sched = Scheduler(workers=2, retry=ExponentialBackoff(base=0.1))
    sched.start()
    sched.schedule_once(lambda: print("hello (priority 5)"), delay=0.1, priority=5)

    state = {"n": 0}

    def flaky() -> None:
        state["n"] += 1
        print("flaky attempt", state["n"])
        if state["n"] < 3:
            raise RuntimeError("boom")

    sched.schedule_once(flaky, max_retries=3)
    tick_id = sched.schedule_interval(lambda: print("tick"), interval=0.2)
    time.sleep(1.2)
    sched.cancel(tick_id)
    print("pending:", [j.id[:6] for j in sched.list_pending()])
    print("completed:", [(j.id[:6], j.status.value) for j in sched.list_completed()])
    sched.stop()


if __name__ == "__main__":
    demo()
`

const java = `import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

enum JobStatus { PENDING, RUNNING, COMPLETED, FAILED, CANCELLED }

interface Clock { long nowMillis(); }

class SystemClock implements Clock {
  public long nowMillis() { return System.currentTimeMillis(); }
}

interface RetryPolicy { long delayMillis(int attempt); }

class ExponentialBackoff implements RetryPolicy {
  private final long baseMs, maxMs; private final double factor;
  ExponentialBackoff(long baseMs, double factor, long maxMs) {
    this.baseMs = baseMs; this.factor = factor; this.maxMs = maxMs;
  }
  public long delayMillis(int attempt) {
    return (long) Math.min(maxMs, baseMs * Math.pow(factor, attempt - 1));
  }
}

interface Task { void run() throws Exception; }

class Job {
  final String id; final Task task; final int priority;
  final Long intervalMs; final int maxRetries; final long seq;
  long nextRun; JobStatus status = JobStatus.PENDING;
  int attempts, runs; String lastError;

  Job(String id, Task task, long nextRun, int priority, Long intervalMs, int maxRetries, long seq) {
    this.id = id; this.task = task; this.nextRun = nextRun; this.priority = priority;
    this.intervalMs = intervalMs; this.maxRetries = maxRetries; this.seq = seq;
  }
  boolean isRecurring() { return intervalMs != null; }
  public String toString() { return id.substring(0, 6) + ":" + status + ":runs=" + runs; }
}

/** Min-heap by (nextRun, -priority, seq). Not thread-safe; Scheduler guards it. */
class JobQueue {
  private final PriorityQueue<Job> heap = new PriorityQueue<>(
      Comparator.<Job>comparingLong(j -> j.nextRun)
          .thenComparingInt(j -> -j.priority)
          .thenComparingLong(j -> j.seq));
  void push(Job j) { heap.add(j); }
  Job peek() { return heap.peek(); }
  Job pop() { return heap.poll(); }
}

class Scheduler {
  private final Clock clock; private final RetryPolicy retry;
  private final JobQueue queue = new JobQueue();
  private final Map<String, Job> jobs = new HashMap<>();
  private final List<Job> completed = new ArrayList<>();
  private final ExecutorService pool;
  private final ReentrantLock lock = new ReentrantLock();
  private final Condition wake = lock.newCondition();
  private boolean running; private long seq;
  private Thread dispatcher;

  Scheduler(int workers, RetryPolicy retry, Clock clock) {
    this.pool = Executors.newFixedThreadPool(workers);
    this.retry = retry; this.clock = clock;
  }

  void start() {
    lock.lock();
    try { if (running) return; running = true; } finally { lock.unlock(); }
    dispatcher = new Thread(this::dispatchLoop, "dispatcher");
    dispatcher.setDaemon(true);
    dispatcher.start();
  }

  void stop() throws InterruptedException {
    lock.lock();
    try { running = false; wake.signalAll(); } finally { lock.unlock(); }
    if (dispatcher != null) dispatcher.join();
    pool.shutdown();
    pool.awaitTermination(5, TimeUnit.SECONDS);
  }

  String scheduleOnce(Task t, long delayMs, int priority, int maxRetries) {
    return add(t, delayMs, null, priority, maxRetries);
  }

  String scheduleInterval(Task t, long intervalMs, int priority, int maxRetries) {
    if (intervalMs <= 0) throw new IllegalArgumentException("interval must be positive");
    return add(t, intervalMs, intervalMs, priority, maxRetries);
  }

  boolean cancel(String jobId) {
    lock.lock();
    try {
      Job j = jobs.get(jobId);
      if (j == null || j.status == JobStatus.COMPLETED || j.status == JobStatus.FAILED
          || j.status == JobStatus.CANCELLED) return false;
      j.status = JobStatus.CANCELLED; // lazily dropped from the heap
      wake.signalAll();
      return true;
    } finally { lock.unlock(); }
  }

  List<Job> listPending() {
    lock.lock();
    try {
      List<Job> out = new ArrayList<>();
      for (Job j : jobs.values())
        if (j.status == JobStatus.PENDING || j.status == JobStatus.RUNNING) out.add(j);
      out.sort(Comparator.<Job>comparingLong(j -> j.nextRun).thenComparingInt(j -> -j.priority));
      return out;
    } finally { lock.unlock(); }
  }

  List<Job> listCompleted() {
    lock.lock();
    try { return new ArrayList<>(completed); } finally { lock.unlock(); }
  }

  private String add(Task t, long delayMs, Long intervalMs, int priority, int maxRetries) {
    if (maxRetries < 0) throw new IllegalArgumentException("maxRetries must be >= 0");
    lock.lock();
    try {
      Job j = new Job(UUID.randomUUID().toString(), t, clock.nowMillis() + Math.max(0, delayMs),
          priority, intervalMs, maxRetries, seq++);
      jobs.put(j.id, j); queue.push(j); wake.signalAll();
      return j.id;
    } finally { lock.unlock(); }
  }

  private void dispatchLoop() {
    lock.lock();
    try {
      while (running) {
        Job job = queue.peek();
        if (job == null) { wake.await(); continue; }
        if (job.status == JobStatus.CANCELLED) { queue.pop(); continue; }
        long delay = job.nextRun - clock.nowMillis();
        if (delay > 0) { wake.await(delay, TimeUnit.MILLISECONDS); continue; }
        queue.pop();
        job.status = JobStatus.RUNNING;
        pool.submit(() -> execute(job));
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    } finally { lock.unlock(); }
  }

  private void execute(Job job) {
    lock.lock();
    try { if (job.status == JobStatus.CANCELLED) return; } finally { lock.unlock(); }
    String error = null;
    try { job.task.run(); } catch (Exception e) { error = e.toString(); }
    lock.lock();
    try {
      if (job.status == JobStatus.CANCELLED) return;
      long now = clock.nowMillis();
      if (error == null) {
        job.attempts = 0; job.runs++;
        if (job.isRecurring()) {
          job.nextRun = Math.max(job.nextRun + job.intervalMs, now);
          requeue(job);
        } else finish(job, JobStatus.COMPLETED);
        return;
      }
      job.attempts++; job.lastError = error;
      if (job.attempts <= job.maxRetries) {
        job.nextRun = now + retry.delayMillis(job.attempts);
        requeue(job);
      } else finish(job, JobStatus.FAILED);
    } finally { lock.unlock(); }
  }

  private void requeue(Job j) { j.status = JobStatus.PENDING; queue.push(j); wake.signalAll(); }
  private void finish(Job j, JobStatus s) { j.status = s; completed.add(j); }
}

class Demo {
  public static void main(String[] args) throws Exception {
    Scheduler s = new Scheduler(2, new ExponentialBackoff(100, 2.0, 5_000), new SystemClock());
    s.start();
    s.scheduleOnce(() -> System.out.println("hello (priority 5)"), 100, 5, 0);
    int[] n = {0};
    s.scheduleOnce(() -> {
      System.out.println("flaky attempt " + (++n[0]));
      if (n[0] < 3) throw new RuntimeException("boom");
    }, 0, 0, 3);
    String tick = s.scheduleInterval(() -> System.out.println("tick"), 200, 0, 0);
    Thread.sleep(1200);
    s.cancel(tick);
    System.out.println("pending=" + s.listPending() + " completed=" + s.listCompleted());
    s.stop();
  }
}
`

const ts = `type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
type Task = () => void | Promise<void>

interface Clock { now(): number }
const systemClock: Clock = { now: () => Date.now() }

interface RetryPolicy { delayFor(attempt: number): number }

class ExponentialBackoff implements RetryPolicy {
  constructor(private base = 500, private factor = 2, private max = 60_000) {}
  delayFor(attempt: number): number {
    return Math.min(this.max, this.base * this.factor ** (attempt - 1))
  }
}

class Job {
  status: JobStatus = 'PENDING'
  attempts = 0
  runs = 0
  lastError?: string
  constructor(
    public readonly id: string,
    public readonly task: Task,
    public nextRun: number,
    public readonly priority: number,
    public readonly interval: number | null,
    public readonly maxRetries: number,
    public readonly seq: number,
  ) {}
  isRecurring() { return this.interval !== null }
}

class MinHeap<T> {
  private a: T[] = []
  constructor(private less: (x: T, y: T) => boolean) {}
  get size() { return this.a.length }
  peek(): T | undefined { return this.a[0] }
  push(v: T) {
    this.a.push(v)
    let i = this.a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (!this.less(this.a[i], this.a[p])) break
      ;[this.a[i], this.a[p]] = [this.a[p], this.a[i]]
      i = p
    }
  }
  pop(): T | undefined {
    if (this.a.length === 0) return undefined
    const top = this.a[0]
    const last = this.a.pop()!
    if (this.a.length > 0) {
      this.a[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1, r = l + 1
        let m = i
        if (l < this.a.length && this.less(this.a[l], this.a[m])) m = l
        if (r < this.a.length && this.less(this.a[r], this.a[m])) m = r
        if (m === i) break
        ;[this.a[i], this.a[m]] = [this.a[m], this.a[i]]
        i = m
      }
    }
    return top
  }
}

interface ScheduleOptions { priority?: number; maxRetries?: number }

class Scheduler {
  // timeline: earliest nextRun first (ties: higher priority, then FIFO)
  private queue = new MinHeap<Job>((a, b) =>
    a.nextRun !== b.nextRun ? a.nextRun < b.nextRun
      : a.priority !== b.priority ? a.priority > b.priority : a.seq < b.seq)
  // due jobs waiting for a free worker: highest priority first
  private ready = new MinHeap<Job>((a, b) =>
    a.priority !== b.priority ? a.priority > b.priority : a.seq < b.seq)
  private jobs = new Map<string, Job>()
  private completed: Job[] = []
  private active = 0
  private seq = 0
  private running = false
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor(
    private workers = 4,
    private retry: RetryPolicy = new ExponentialBackoff(),
    private clock: Clock = systemClock,
  ) {}

  start() { this.running = true; this.arm() }
  stop() {
    this.running = false
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
  }

  scheduleOnce(task: Task, delayMs = 0, opts: ScheduleOptions = {}): string {
    return this.add(task, delayMs, null, opts)
  }

  scheduleInterval(task: Task, intervalMs: number, opts: ScheduleOptions = {}): string {
    if (intervalMs <= 0) throw new Error('interval must be positive')
    return this.add(task, intervalMs, intervalMs, opts)
  }

  cancel(id: string): boolean {
    const job = this.jobs.get(id)
    if (!job || ['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)) return false
    job.status = 'CANCELLED' // lazily dropped from the heaps
    return true
  }

  listPending(): Job[] {
    return [...this.jobs.values()]
      .filter(j => j.status === 'PENDING' || j.status === 'RUNNING')
      .sort((a, b) => a.nextRun - b.nextRun || b.priority - a.priority)
  }

  listCompleted(): Job[] { return [...this.completed] }

  private add(task: Task, delayMs: number, interval: number | null, opts: ScheduleOptions): string {
    const maxRetries = opts.maxRetries ?? 0
    if (maxRetries < 0) throw new Error('maxRetries must be >= 0')
    const job = new Job(
      crypto.randomUUID(), task, this.clock.now() + Math.max(0, delayMs),
      opts.priority ?? 0, interval, maxRetries, this.seq++,
    )
    this.jobs.set(job.id, job)
    this.queue.push(job)
    this.arm()
    return job.id
  }

  /** Single timer aimed at the head of the heap. */
  private arm() {
    if (!this.running) return
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    while (this.queue.peek()?.status === 'CANCELLED') this.queue.pop()
    const head = this.queue.peek()
    if (!head) return
    this.timer = setTimeout(() => this.drain(), Math.max(0, head.nextRun - this.clock.now()))
  }

  private drain() {
    const now = this.clock.now()
    for (let h = this.queue.peek(); h && h.nextRun <= now; h = this.queue.peek()) {
      this.queue.pop()
      if (h.status === 'CANCELLED') continue
      h.status = 'RUNNING'
      this.ready.push(h)
    }
    this.pump()
    this.arm()
  }

  /** Worker pool: at most 'workers' tasks in flight. */
  private pump() {
    while (this.active < this.workers && this.ready.size > 0) {
      const job = this.ready.pop()!
      this.active++
      void this.execute(job).finally(() => { this.active--; this.pump() })
    }
  }

  private async execute(job: Job): Promise<void> {
    if (job.status === 'CANCELLED') return
    let error: string | null = null
    try { await job.task() } catch (e) { error = String(e) }
    if (job.status === 'CANCELLED') return
    const now = this.clock.now()
    if (error === null) {
      job.attempts = 0
      job.runs++
      if (job.interval !== null) {
        job.nextRun = Math.max(job.nextRun + job.interval, now)
        this.requeue(job)
      } else this.finish(job, 'COMPLETED')
      return
    }
    job.attempts++
    job.lastError = error
    if (job.attempts <= job.maxRetries) {
      job.nextRun = now + this.retry.delayFor(job.attempts)
      this.requeue(job)
    } else this.finish(job, 'FAILED')
  }

  private requeue(job: Job) {
    job.status = 'PENDING'
    this.queue.push(job)
    this.arm()
  }

  private finish(job: Job, status: JobStatus) {
    job.status = status
    this.completed.push(job)
  }
}

export { Scheduler, ExponentialBackoff, Job }
export type { Task, RetryPolicy, Clock, JobStatus }
`

const cpp = `#include <algorithm>
#include <chrono>
#include <cmath>
#include <condition_variable>
#include <functional>
#include <iostream>
#include <map>
#include <memory>
#include <mutex>
#include <optional>
#include <queue>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

using Millis = std::chrono::milliseconds;
using TimePoint = std::chrono::steady_clock::time_point;

enum class JobStatus { Pending, Running, Completed, Failed, Cancelled };

struct Clock {
  virtual ~Clock() = default;
  virtual TimePoint now() const = 0;
};
struct SystemClock : Clock {
  TimePoint now() const override { return std::chrono::steady_clock::now(); }
};

struct RetryPolicy {
  virtual ~RetryPolicy() = default;
  virtual Millis delayFor(int attempt) const = 0;
};

class ExponentialBackoff : public RetryPolicy {
  Millis base_, max_;
  double factor_;
public:
  explicit ExponentialBackoff(Millis base = Millis(500), double factor = 2.0,
                              Millis max = Millis(60000))
      : base_(base), max_(max), factor_(factor) {}
  Millis delayFor(int attempt) const override {
    double d = static_cast<double>(base_.count()) * std::pow(factor_, attempt - 1);
    return Millis(static_cast<long long>(std::min<double>(d, static_cast<double>(max_.count()))));
  }
};

struct Job {
  std::string id;
  std::function<void()> task;
  int priority = 0;
  std::optional<Millis> interval;
  int maxRetries = 0;
  unsigned long long seq = 0;
  TimePoint nextRun;
  JobStatus status = JobStatus::Pending;
  int attempts = 0, runs = 0;
  std::string lastError;
  bool isRecurring() const { return interval.has_value(); }
};
using JobPtr = std::shared_ptr<Job>;

struct JobInfo { std::string id; JobStatus status; int runs; int attempts; };

// "a goes after b" -> priority_queue top() is the earliest job.
struct JobLater {
  bool operator()(const JobPtr& a, const JobPtr& b) const {
    if (a->nextRun != b->nextRun) return a->nextRun > b->nextRun;
    if (a->priority != b->priority) return a->priority < b->priority;
    return a->seq > b->seq;
  }
};

class Scheduler {
  std::unique_ptr<Clock> clock_;
  std::unique_ptr<RetryPolicy> retry_;
  std::priority_queue<JobPtr, std::vector<JobPtr>, JobLater> queue_;  // min-heap by nextRun
  std::queue<JobPtr> ready_;                                          // due, waiting for a worker
  std::map<std::string, JobPtr> jobs_;
  std::vector<JobPtr> completed_;
  std::vector<std::thread> workers_;
  std::thread dispatcher_;
  std::mutex mu_;
  std::condition_variable wake_, readyCv_;
  bool running_ = false;
  unsigned long long seq_ = 0;
  int poolSize_;

public:
  Scheduler(int workers, std::unique_ptr<RetryPolicy> retry = std::make_unique<ExponentialBackoff>(),
            std::unique_ptr<Clock> clock = std::make_unique<SystemClock>())
      : clock_(std::move(clock)), retry_(std::move(retry)), poolSize_(workers) {}
  ~Scheduler() { stop(); }

  void start() {
    std::lock_guard<std::mutex> lk(mu_);
    if (running_) return;
    running_ = true;
    for (int i = 0; i < poolSize_; ++i) workers_.emplace_back([this] { workerLoop(); });
    dispatcher_ = std::thread([this] { dispatchLoop(); });
  }

  void stop() {
    {
      std::lock_guard<std::mutex> lk(mu_);
      if (!running_) return;
      running_ = false;
    }
    wake_.notify_all();
    readyCv_.notify_all();
    if (dispatcher_.joinable()) dispatcher_.join();
    for (auto& w : workers_) w.join();
    workers_.clear();
  }

  std::string scheduleOnce(std::function<void()> task, Millis delay = Millis(0),
                           int priority = 0, int maxRetries = 0) {
    return add(std::move(task), delay, std::nullopt, priority, maxRetries);
  }

  std::string scheduleInterval(std::function<void()> task, Millis interval,
                               int priority = 0, int maxRetries = 0) {
    if (interval.count() <= 0) throw std::invalid_argument("interval must be positive");
    return add(std::move(task), interval, interval, priority, maxRetries);
  }

  bool cancel(const std::string& id) {
    std::lock_guard<std::mutex> lk(mu_);
    auto it = jobs_.find(id);
    if (it == jobs_.end()) return false;
    auto st = it->second->status;
    if (st == JobStatus::Completed || st == JobStatus::Failed || st == JobStatus::Cancelled)
      return false;
    it->second->status = JobStatus::Cancelled;  // lazily dropped from the heap
    wake_.notify_all();
    return true;
  }

  std::vector<JobInfo> listPending() {
    std::lock_guard<std::mutex> lk(mu_);
    std::vector<JobPtr> v;
    for (auto& [id, j] : jobs_)
      if (j->status == JobStatus::Pending || j->status == JobStatus::Running) v.push_back(j);
    std::sort(v.begin(), v.end(), [](const JobPtr& a, const JobPtr& b) {
      return a->nextRun != b->nextRun ? a->nextRun < b->nextRun : a->priority > b->priority;
    });
    std::vector<JobInfo> out;
    for (auto& j : v) out.push_back({j->id, j->status, j->runs, j->attempts});
    return out;
  }

  std::vector<JobInfo> listCompleted() {
    std::lock_guard<std::mutex> lk(mu_);
    std::vector<JobInfo> out;
    for (auto& j : completed_) out.push_back({j->id, j->status, j->runs, j->attempts});
    return out;
  }

private:
  std::string add(std::function<void()> task, Millis delay, std::optional<Millis> interval,
                  int priority, int maxRetries) {
    if (maxRetries < 0) throw std::invalid_argument("maxRetries must be >= 0");
    std::lock_guard<std::mutex> lk(mu_);
    auto job = std::make_shared<Job>();
    job->id = "job-" + std::to_string(seq_);
    job->seq = seq_++;
    job->task = std::move(task);
    job->priority = priority;
    job->interval = interval;
    job->maxRetries = maxRetries;
    job->nextRun = clock_->now() + (delay.count() > 0 ? delay : Millis(0));
    jobs_[job->id] = job;
    queue_.push(job);
    wake_.notify_all();
    return job->id;
  }

  void dispatchLoop() {
    std::unique_lock<std::mutex> lk(mu_);
    while (running_) {
      if (queue_.empty()) { wake_.wait(lk); continue; }
      JobPtr job = queue_.top();
      if (job->status == JobStatus::Cancelled) { queue_.pop(); continue; }
      if (job->nextRun > clock_->now()) { wake_.wait_until(lk, job->nextRun); continue; }
      queue_.pop();
      job->status = JobStatus::Running;
      ready_.push(job);
      readyCv_.notify_one();
    }
  }

  void workerLoop() {
    for (;;) {
      JobPtr job;
      {
        std::unique_lock<std::mutex> lk(mu_);
        readyCv_.wait(lk, [this] { return !running_ || !ready_.empty(); });
        if (ready_.empty()) return;  // stopping and drained
        job = ready_.front();
        ready_.pop();
      }
      execute(job);
    }
  }

  void execute(const JobPtr& job) {
    {
      std::lock_guard<std::mutex> lk(mu_);
      if (job->status == JobStatus::Cancelled) return;
    }
    std::string error;
    bool ok = true;
    try { job->task(); }
    catch (const std::exception& e) { ok = false; error = e.what(); }
    catch (...) { ok = false; error = "unknown error"; }

    std::lock_guard<std::mutex> lk(mu_);
    if (job->status == JobStatus::Cancelled) return;
    auto now = clock_->now();
    if (ok) {
      job->attempts = 0;
      job->runs++;
      if (job->isRecurring()) {
        job->nextRun = std::max(job->nextRun + *job->interval, now);
        requeue(job);
      } else finish(job, JobStatus::Completed);
      return;
    }
    job->attempts++;
    job->lastError = error;
    if (job->attempts <= job->maxRetries) {
      job->nextRun = now + retry_->delayFor(job->attempts);
      requeue(job);
    } else finish(job, JobStatus::Failed);
  }

  void requeue(const JobPtr& j) { j->status = JobStatus::Pending; queue_.push(j); wake_.notify_all(); }
  void finish(const JobPtr& j, JobStatus s) { j->status = s; completed_.push_back(j); }
};

int main() {
  Scheduler s(2, std::make_unique<ExponentialBackoff>(Millis(100)));
  s.start();
  s.scheduleOnce([] { std::cout << "hello (priority 5)\\n"; }, Millis(100), 5);
  auto n = std::make_shared<int>(0);
  s.scheduleOnce([n] {
    std::cout << "flaky attempt " << ++*n << "\\n";
    if (*n < 3) throw std::runtime_error("boom");
  }, Millis(0), 0, 3);
  auto tick = s.scheduleInterval([] { std::cout << "tick\\n"; }, Millis(200));
  std::this_thread::sleep_for(Millis(1200));
  s.cancel(tick);
  std::cout << "pending=" << s.listPending().size()
            << " completed=" << s.listCompleted().size() << "\\n";
  s.stop();
}
`

const goCode = `package main

import (
	"container/heap"
	"fmt"
	"math"
	"sync"
	"time"
)

type JobStatus int

const (
	Pending JobStatus = iota
	Running
	Completed
	Failed
	Cancelled
)

func (s JobStatus) String() string {
	return [...]string{"PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"}[s]
}

type Clock interface{ Now() time.Time }
type systemClock struct{}

func (systemClock) Now() time.Time { return time.Now() }

type RetryPolicy interface{ DelayFor(attempt int) time.Duration }

type ExponentialBackoff struct {
	Base, Max time.Duration
	Factor    float64
}

func (e ExponentialBackoff) DelayFor(attempt int) time.Duration {
	d := float64(e.Base) * math.Pow(e.Factor, float64(attempt-1))
	return time.Duration(math.Min(d, float64(e.Max)))
}

type Task func() error

type Job struct {
	ID         string
	Task       Task
	Priority   int
	Interval   time.Duration // 0 => one-time
	MaxRetries int

	seq      uint64
	nextRun  time.Time
	status   JobStatus
	attempts int
	runs     int
	lastErr  error
}

type JobInfo struct {
	ID      string
	Status  JobStatus
	NextRun time.Time
	Runs    int
	LastErr error
}

// jobHeap is a min-heap by (nextRun, -priority, seq).
type jobHeap []*Job

func (h jobHeap) Len() int { return len(h) }
func (h jobHeap) Less(i, j int) bool {
	a, b := h[i], h[j]
	if !a.nextRun.Equal(b.nextRun) {
		return a.nextRun.Before(b.nextRun)
	}
	if a.Priority != b.Priority {
		return a.Priority > b.Priority
	}
	return a.seq < b.seq
}
func (h jobHeap) Swap(i, j int) { h[i], h[j] = h[j], h[i] }
func (h *jobHeap) Push(x any)   { *h = append(*h, x.(*Job)) }
func (h *jobHeap) Pop() any {
	old := *h
	n := len(old)
	it := old[n-1]
	*h = old[:n-1]
	return it
}

type Scheduler struct {
	mu        sync.Mutex
	queue     jobHeap
	jobs      map[string]*Job
	completed []*Job
	seq       uint64

	clock   Clock
	retry   RetryPolicy
	workers int
	ready   chan *Job
	wake    chan struct{}
	stop    chan struct{}
	stopOne sync.Once
	wg      sync.WaitGroup
}

func NewScheduler(workers int, retry RetryPolicy, clock Clock) *Scheduler {
	if clock == nil {
		clock = systemClock{}
	}
	return &Scheduler{
		jobs: map[string]*Job{}, clock: clock, retry: retry, workers: workers,
		ready: make(chan *Job), wake: make(chan struct{}, 1), stop: make(chan struct{}),
	}
}

func (s *Scheduler) Start() {
	for i := 0; i < s.workers; i++ {
		s.wg.Add(1)
		go s.worker()
	}
	s.wg.Add(1)
	go s.dispatch()
}

func (s *Scheduler) Stop() {
	s.stopOne.Do(func() { close(s.stop) })
	s.wg.Wait()
}

func (s *Scheduler) ScheduleOnce(t Task, delay time.Duration, priority, maxRetries int) string {
	return s.add(t, delay, 0, priority, maxRetries)
}

func (s *Scheduler) ScheduleInterval(t Task, interval time.Duration, priority, maxRetries int) string {
	if interval <= 0 {
		panic("interval must be positive")
	}
	return s.add(t, interval, interval, priority, maxRetries)
}

func (s *Scheduler) Cancel(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	j, ok := s.jobs[id]
	if !ok || j.status == Completed || j.status == Failed || j.status == Cancelled {
		return false
	}
	j.status = Cancelled // lazily dropped from the heap
	s.signal()
	return true
}

func (s *Scheduler) ListPending() []JobInfo { return s.snapshot(func(j *Job) bool { return j.status == Pending || j.status == Running }) }

func (s *Scheduler) ListCompleted() []JobInfo {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]JobInfo, 0, len(s.completed))
	for _, j := range s.completed {
		out = append(out, info(j))
	}
	return out
}

func info(j *Job) JobInfo {
	return JobInfo{ID: j.ID, Status: j.status, NextRun: j.nextRun, Runs: j.runs, LastErr: j.lastErr}
}

func (s *Scheduler) snapshot(keep func(*Job) bool) []JobInfo {
	s.mu.Lock()
	defer s.mu.Unlock()
	var out []JobInfo
	for _, j := range s.jobs {
		if keep(j) {
			out = append(out, info(j))
		}
	}
	return out
}

func (s *Scheduler) signal() {
	select {
	case s.wake <- struct{}{}:
	default:
	}
}

func (s *Scheduler) add(t Task, delay, interval time.Duration, priority, maxRetries int) string {
	if maxRetries < 0 {
		maxRetries = 0
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if delay < 0 {
		delay = 0
	}
	j := &Job{
		ID: fmt.Sprintf("job-%d", s.seq), Task: t, Priority: priority,
		Interval: interval, MaxRetries: maxRetries, seq: s.seq,
		nextRun: s.clock.Now().Add(delay), status: Pending,
	}
	s.seq++
	s.jobs[j.ID] = j
	heap.Push(&s.queue, j)
	s.signal()
	return j.ID
}

func (s *Scheduler) dispatch() {
	defer s.wg.Done()
	timer := time.NewTimer(time.Hour)
	defer timer.Stop()
	for {
		wait := time.Hour
		s.mu.Lock()
		for s.queue.Len() > 0 {
			top := s.queue[0]
			if top.status == Cancelled {
				heap.Pop(&s.queue)
				continue
			}
			if d := top.nextRun.Sub(s.clock.Now()); d > 0 {
				wait = d
				break
			}
			heap.Pop(&s.queue)
			top.status = Running
			s.mu.Unlock() // handing off may block while every worker is busy
			select {
			case s.ready <- top:
			case <-s.stop:
				return
			}
			s.mu.Lock()
		}
		s.mu.Unlock()

		if !timer.Stop() {
			select {
			case <-timer.C:
			default:
			}
		}
		timer.Reset(wait)
		select {
		case <-timer.C:
		case <-s.wake:
		case <-s.stop:
			return
		}
	}
}

func (s *Scheduler) worker() {
	defer s.wg.Done()
	for {
		select {
		case j := <-s.ready:
			s.execute(j)
		case <-s.stop:
			return
		}
	}
}

func safeRun(t Task) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic: %v", r)
		}
	}()
	return t()
}

func (s *Scheduler) execute(j *Job) {
	s.mu.Lock()
	if j.status == Cancelled {
		s.mu.Unlock()
		return
	}
	s.mu.Unlock()

	err := safeRun(j.Task)

	s.mu.Lock()
	defer s.mu.Unlock()
	if j.status == Cancelled {
		return
	}
	now := s.clock.Now()
	if err == nil {
		j.attempts = 0
		j.runs++
		if j.Interval > 0 {
			next := j.nextRun.Add(j.Interval)
			if next.Before(now) {
				next = now
			}
			j.nextRun = next
			s.requeue(j)
		} else {
			s.finish(j, Completed)
		}
		return
	}
	j.attempts++
	j.lastErr = err
	if j.attempts <= j.MaxRetries {
		j.nextRun = now.Add(s.retry.DelayFor(j.attempts))
		s.requeue(j)
	} else {
		s.finish(j, Failed)
	}
}

func (s *Scheduler) requeue(j *Job) {
	j.status = Pending
	heap.Push(&s.queue, j)
	s.signal()
}

func (s *Scheduler) finish(j *Job, st JobStatus) {
	j.status = st
	s.completed = append(s.completed, j)
}

func main() {
	s := NewScheduler(2, ExponentialBackoff{Base: 100 * time.Millisecond, Factor: 2, Max: 5 * time.Second}, nil)
	s.Start()
	s.ScheduleOnce(func() error { fmt.Println("hello (priority 5)"); return nil }, 100*time.Millisecond, 5, 0)
	n := 0
	s.ScheduleOnce(func() error {
		n++
		fmt.Println("flaky attempt", n)
		if n < 3 {
			return fmt.Errorf("boom")
		}
		return nil
	}, 0, 0, 3)
	tick := s.ScheduleInterval(func() error { fmt.Println("tick"); return nil }, 200*time.Millisecond, 0, 0)
	time.Sleep(1200 * time.Millisecond)
	s.Cancel(tick)
	fmt.Println("pending:", len(s.ListPending()), "completed:", s.ListCompleted())
	s.Stop()
}
`

const csharp = `using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

public enum JobStatus { Pending, Running, Completed, Failed, Cancelled }

public interface IClock { long NowMs { get; } }
public sealed class SystemClock : IClock {
  public long NowMs => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
}

public interface IRetryPolicy { long DelayMs(int attempt); }
public sealed class ExponentialBackoff : IRetryPolicy {
  readonly long _baseMs, _maxMs; readonly double _factor;
  public ExponentialBackoff(long baseMs = 500, double factor = 2.0, long maxMs = 60_000) {
    _baseMs = baseMs; _factor = factor; _maxMs = maxMs;
  }
  public long DelayMs(int attempt) =>
    (long)Math.Min(_maxMs, _baseMs * Math.Pow(_factor, attempt - 1));
}

public sealed class Job {
  public string Id { get; }
  public Action Task { get; }
  public int Priority { get; }
  public long? IntervalMs { get; }
  public int MaxRetries { get; }
  public long Seq { get; }
  public long NextRun { get; internal set; }
  public JobStatus Status { get; internal set; } = JobStatus.Pending;
  public int Attempts { get; internal set; }
  public int Runs { get; internal set; }
  public string? LastError { get; internal set; }

  public Job(string id, Action task, long nextRun, int priority, long? intervalMs, int maxRetries, long seq) {
    Id = id; Task = task; NextRun = nextRun; Priority = priority;
    IntervalMs = intervalMs; MaxRetries = maxRetries; Seq = seq;
  }
  public bool IsRecurring => IntervalMs.HasValue;
  public override string ToString() => Id[..6] + ":" + Status + ":runs=" + Runs;
}

/// <summary>Min-heap keyed by (nextRun, -priority, seq). Guarded by the Scheduler lock.</summary>
public sealed class JobQueue {
  readonly PriorityQueue<Job, (long, int, long)> _heap = new();
  public void Push(Job j) => _heap.Enqueue(j, (j.NextRun, -j.Priority, j.Seq));
  public Job? Peek() => _heap.TryPeek(out var j, out _) ? j : null;
  public Job Pop() => _heap.Dequeue();
}

public sealed class Scheduler : IDisposable {
  readonly IClock _clock; readonly IRetryPolicy _retry; readonly int _workers;
  readonly JobQueue _queue = new();
  readonly Dictionary<string, Job> _jobs = new();
  readonly List<Job> _completed = new();
  readonly BlockingCollection<Job> _ready = new();
  readonly object _gate = new();
  readonly List<Thread> _threads = new();
  bool _running; long _seq;

  public Scheduler(int workers = 4, IRetryPolicy? retry = null, IClock? clock = null) {
    _workers = workers; _retry = retry ?? new ExponentialBackoff(); _clock = clock ?? new SystemClock();
  }

  public void Start() {
    lock (_gate) {
      if (_running) return;
      _running = true;
    }
    _threads.Add(new Thread(DispatchLoop) { IsBackground = true });
    for (int i = 0; i < _workers; i++) _threads.Add(new Thread(WorkerLoop) { IsBackground = true });
    foreach (var t in _threads) t.Start();
  }

  public void Stop() {
    lock (_gate) { _running = false; Monitor.PulseAll(_gate); }
    _threads[0].Join();           // dispatcher first, then drain workers
    _ready.CompleteAdding();
    foreach (var t in _threads.Skip(1)) t.Join();
  }

  public void Dispose() { if (_running) Stop(); }

  public string ScheduleOnce(Action task, long delayMs = 0, int priority = 0, int maxRetries = 0) =>
    Add(task, delayMs, null, priority, maxRetries);

  public string ScheduleInterval(Action task, long intervalMs, int priority = 0, int maxRetries = 0) {
    if (intervalMs <= 0) throw new ArgumentException("interval must be positive");
    return Add(task, intervalMs, intervalMs, priority, maxRetries);
  }

  public bool Cancel(string jobId) {
    lock (_gate) {
      if (!_jobs.TryGetValue(jobId, out var j)) return false;
      if (j.Status is JobStatus.Completed or JobStatus.Failed or JobStatus.Cancelled) return false;
      j.Status = JobStatus.Cancelled; // lazily dropped from the heap
      Monitor.PulseAll(_gate);
      return true;
    }
  }

  public IReadOnlyList<Job> ListPending() {
    lock (_gate)
      return _jobs.Values.Where(j => j.Status is JobStatus.Pending or JobStatus.Running)
                  .OrderBy(j => j.NextRun).ThenByDescending(j => j.Priority).ToList();
  }

  public IReadOnlyList<Job> ListCompleted() { lock (_gate) return _completed.ToList(); }

  string Add(Action task, long delayMs, long? intervalMs, int priority, int maxRetries) {
    if (maxRetries < 0) throw new ArgumentException("maxRetries must be >= 0");
    lock (_gate) {
      var j = new Job(Guid.NewGuid().ToString(), task, _clock.NowMs + Math.Max(0, delayMs),
                      priority, intervalMs, maxRetries, _seq++);
      _jobs[j.Id] = j; _queue.Push(j);
      Monitor.PulseAll(_gate);
      return j.Id;
    }
  }

  void DispatchLoop() {
    lock (_gate) {
      while (_running) {
        var job = _queue.Peek();
        if (job is null) { Monitor.Wait(_gate); continue; }
        if (job.Status == JobStatus.Cancelled) { _queue.Pop(); continue; }
        long delay = job.NextRun - _clock.NowMs;
        if (delay > 0) { Monitor.Wait(_gate, (int)Math.Min(delay, int.MaxValue)); continue; }
        _queue.Pop();
        job.Status = JobStatus.Running;
        _ready.Add(job);
      }
    }
  }

  void WorkerLoop() {
    foreach (var job in _ready.GetConsumingEnumerable()) Execute(job);
  }

  void Execute(Job job) {
    lock (_gate) { if (job.Status == JobStatus.Cancelled) return; }
    string? error = null;
    try { job.Task(); } catch (Exception e) { error = e.Message; }

    lock (_gate) {
      if (job.Status == JobStatus.Cancelled) return;
      long now = _clock.NowMs;
      if (error is null) {
        job.Attempts = 0; job.Runs++;
        if (job.IsRecurring) {
          job.NextRun = Math.Max(job.NextRun + job.IntervalMs!.Value, now);
          Requeue(job);
        } else Finish(job, JobStatus.Completed);
        return;
      }
      job.Attempts++; job.LastError = error;
      if (job.Attempts <= job.MaxRetries) {
        job.NextRun = now + _retry.DelayMs(job.Attempts);
        Requeue(job);
      } else Finish(job, JobStatus.Failed);
    }
  }

  void Requeue(Job j) { j.Status = JobStatus.Pending; _queue.Push(j); Monitor.PulseAll(_gate); }
  void Finish(Job j, JobStatus s) { j.Status = s; _completed.Add(j); }
}

public static class Program {
  public static void Main() {
    using var s = new Scheduler(2, new ExponentialBackoff(100));
    s.Start();
    s.ScheduleOnce(() => Console.WriteLine("hello (priority 5)"), 100, priority: 5);
    int n = 0;
    s.ScheduleOnce(() => {
      Console.WriteLine("flaky attempt " + (++n));
      if (n < 3) throw new InvalidOperationException("boom");
    }, maxRetries: 3);
    var tick = s.ScheduleInterval(() => Console.WriteLine("tick"), 200);
    Thread.Sleep(1200);
    s.Cancel(tick);
    Console.WriteLine("pending=" + s.ListPending().Count + " completed=" + s.ListCompleted().Count);
  }
}
`

export const cronJobSchedulerSolution: ProblemSolution = {
  slug: 'cron-job-scheduler',
  title: 'Cron Job Scheduler - Solution',
  overview: {
    introduction:
      'Design an in-process scheduler that runs one-time and recurring jobs at the right moment, supports cancellation, priorities and retries with backoff, and lets callers inspect pending and completed work. The interview focus is the data structure that finds the next due job cheaply (a min-heap by next run time), a clean separation between “deciding when” (dispatcher) and “doing the work” (worker pool), and safe handling of failures and concurrency.',
    constraints: [
      'Jobs are either one-time (run at a delay/time) or interval-based (repeat every N units).',
      'A job can be cancelled before it runs, or between recurrences.',
      'Higher priority wins when several jobs are due at the same moment.',
      'A failed job is retried up to N times using exponential backoff before being marked FAILED.',
      'The caller can list pending jobs and completed (finished or failed) jobs.',
    ],
    assumptions: [
      'In-process scheduler; persistence across restarts and distributed leader election are out of scope.',
      'Interval jobs use fixed-rate semantics: the next run is the previous scheduled time plus the interval, never in the past.',
      '“Priority” breaks ties among due jobs (and orders the ready queue when workers are saturated); it does not preempt a running job.',
      'Cancelling an already-running job prevents future runs but does not interrupt the in-flight execution.',
      'Cron expressions (“0 9 * * MON”) are a parsing layer on top that produces nextRunTime; the core engine only needs a timestamp.',
    ],
    clarificationQuestions: [
      'Do we need cron-expression syntax, or are delay and fixed-interval enough for v1?',
      'Fixed-rate or fixed-delay for recurring jobs (what if a run takes longer than the interval)?',
      'Does a retry count against the recurrence, i.e. do we retry within a run or just wait for the next tick?',
      'Should completed jobs be kept forever, or bounded (ring buffer / TTL)?',
      'Do tasks need to be idempotent, and is at-least-once execution acceptable?',
      'Is persistence or restart recovery required?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Ask “how do I always know what runs next?” - that is a priority queue keyed on time. Then separate three concerns: ordering (JobQueue), timing (dispatcher thread that sleeps until the head is due), and execution (worker pool). Retries and recurrence are just “re-insert the job with a new nextRunTime”.',
    breakdown: [
      'Model Job: id, task, nextRunTime, priority, optional interval, maxRetries, attempts, status.',
      'Store pending jobs in a min-heap ordered by (nextRunTime, priority desc, insertion order).',
      'A single dispatcher waits on a condition variable until the head is due or the queue changes.',
      'Due jobs are handed to a bounded worker pool so slow tasks never block timing.',
      'On completion: recurring → recompute nextRunTime and re-insert; failure → backoff delay and re-insert; exhausted → FAILED.',
      'Cancellation flips status; the heap drops cancelled entries lazily when they surface.',
    ],
    entities: [
      { name: 'Scheduler', responsibility: 'Public façade: schedule, cancel, list, start/stop; owns queue, registry, pool and completed history.' },
      { name: 'Job', responsibility: 'Unit of work with schedule metadata, retry counters and lifecycle status.' },
      { name: 'JobQueue', responsibility: 'Min-heap ordered by nextRunTime then priority; O(log n) push/pop, O(1) peek.' },
      { name: 'WorkerPool', responsibility: 'Bounded set of workers executing due jobs concurrently.' },
      { name: 'RetryPolicy / ExponentialBackoff', responsibility: 'Computes delay before retry attempt k (base × factor^(k−1), capped).' },
      { name: 'Clock', responsibility: 'Injectable time source so scheduling logic is deterministic in tests.' },
      { name: 'JobStatus', responsibility: 'PENDING → RUNNING → COMPLETED | FAILED | CANCELLED (and RUNNING → PENDING for retries/recurrence).' },
    ],
    relationships: [
      'Scheduler composes JobQueue and WorkerPool (same lifetime).',
      'JobQueue aggregates Jobs it orders; Scheduler also keeps a registry for id lookup.',
      'Scheduler depends on RetryPolicy and Clock abstractions (injected).',
      'WorkerPool executes Jobs but never decides when they run.',
    ],
    patternsAndOop: [
      'Strategy: RetryPolicy (exponential, linear, none) swapped without touching Scheduler.',
      'Producer-consumer: dispatcher produces ready jobs, workers consume them.',
      'Priority queue / heap: the core data structure for “next due job”.',
      'Dependency injection of Clock for deterministic tests.',
      'State-style lifecycle via JobStatus with guarded transitions.',
    ],
    stepByStep: [
      'Clarify one-time vs interval, retry semantics, and priority meaning.',
      'Sketch Job and the min-heap; justify O(log n) insert and O(1) peek.',
      'Write the dispatcher loop: peek → wait until due → pop → submit.',
      'Write execute(): run, then branch on success/failure/recurrence.',
      'Add cancel (lazy deletion) and list pending/completed under the same lock.',
      'Discuss concurrency, missed runs, and extensions (cron syntax, persistence).',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Scheduler is a façade over three cooperating parts: a time-ordered JobQueue, a dispatcher that sleeps until the head is due, and a WorkerPool that runs tasks. Retry timing is a pluggable policy and time is injectable. Everything that mutates job state happens under one lock, so cancellation, retries and listing never race.',
    classResponsibilities: [
      { name: 'Scheduler', responsibility: 'Validates input, registers jobs, runs the dispatcher loop, applies post-run state transitions.' },
      { name: 'Job', responsibility: 'Carries schedule, priority, retry counters and status; mutated only by the Scheduler.' },
      { name: 'JobQueue', responsibility: 'Orders pending jobs by (nextRunTime, priority, sequence).' },
      { name: 'WorkerPool', responsibility: 'Executes jobs concurrently with a fixed upper bound.' },
      { name: 'ExponentialBackoff', responsibility: 'Pure function from attempt number to delay with a cap.' },
      { name: 'SystemClock', responsibility: 'Production time source; replaced by a fake in tests.' },
    ],
    interfacesAndAbstractions: [
      'RetryPolicy abstracts backoff so linear/jittered/no-retry strategies plug in.',
      'Clock abstracts time so tests can advance time without sleeping.',
      'Task is just a callable - the scheduler never knows what the job does.',
    ],
    relationships: [
      'Composition Scheduler→JobQueue/WorkerPool: they cannot be shared across schedulers.',
      'Aggregation Scheduler→RetryPolicy/Clock: injected, swappable collaborators.',
      'Dependency WorkerPool→Job: workers consume jobs but do not own them.',
    ],
    solid: [
      'SRP: queue orders, dispatcher times, workers execute, policy computes delay.',
      'OCP: new retry/backoff behaviour is a new RetryPolicy, not an edit to Scheduler.',
      'LSP: any RetryPolicy returns a non-negative delay for attempt ≥ 1.',
      'ISP: small interfaces (Clock.now, RetryPolicy.delayFor).',
      'DIP: Scheduler depends on Clock/RetryPolicy abstractions.',
    ],
    patterns: [
      { name: 'Strategy', why: 'Retry/backoff policy varies independently of scheduling.' },
      { name: 'Producer-Consumer', why: 'Decouples timing (dispatcher) from execution (workers) so long tasks never delay other jobs.' },
      { name: 'Façade', why: 'Scheduler exposes five simple operations over several moving parts.' },
    ],
    decisions: [
      {
        decision: 'Min-heap keyed by (nextRunTime, −priority, sequence).',
        rationale: 'Head is always the next job to fire; insert/pop are O(log n) and peek is O(1). Sequence makes order deterministic for equal keys.',
        tradeoff: 'Arbitrary removal is O(n), so cancel uses lazy deletion instead.',
      },
      {
        decision: 'Lazy deletion for cancel.',
        rationale: 'Flip status to CANCELLED in O(1) and let the dispatcher discard it when it reaches the head.',
        tradeoff: 'Cancelled entries linger in memory until they surface; fine unless cancelling millions of far-future jobs (then use an indexed heap).',
      },
      {
        decision: 'Single dispatcher thread + worker pool instead of one timer per job.',
        rationale: 'One sleeper bounds thread/timer count and keeps ordering logic in one place.',
        tradeoff: 'Dispatcher latency depends on lock contention; acceptable for in-process scheduling.',
      },
      {
        decision: 'Exponential backoff with a cap, retries re-enter the same heap.',
        rationale: 'Retry is “just another nextRunTime”, so no special-case code path exists.',
        tradeoff: 'Without jitter many failing jobs retry in lockstep (thundering herd) - add jitter if asked.',
      },
      {
        decision: 'Fixed-rate recurrence that never schedules in the past.',
        rationale: 'Avoids drift for normal runs and avoids a burst of catch-up runs after a stall.',
        tradeoff: 'Missed ticks are skipped rather than replayed; offer a misfire policy if required.',
      },
    ],
    extensibility:
      'Cron expressions plug in as a NextRunCalculator that returns the following timestamp for a job after each run. Persistence means writing jobs to a store and reloading them into the heap on boot. Distributed execution replaces the in-memory queue with a leased, database-backed queue; the dispatcher/worker split stays the same.',
  },
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    steps: [
      'scheduleOnce / scheduleInterval creates a Job with nextRunTime = now + delay, pushes it on the heap and wakes the dispatcher.',
      'The dispatcher peeks the head. If it is cancelled it is discarded; if it is not yet due the dispatcher sleeps until then (or until woken by a new, earlier job).',
      'A due job is popped, marked RUNNING and handed to the worker pool.',
      'A worker runs the task outside the lock, then re-acquires the lock to apply the outcome.',
      'Success: one-time jobs become COMPLETED; interval jobs get nextRunTime += interval (never in the past) and re-enter the heap.',
      'Failure: attempts++; if attempts ≤ maxRetries, nextRunTime = now + backoff(attempts) and the job re-enters the heap; otherwise it is FAILED.',
      'cancel(id) marks the job CANCELLED; listPending / listCompleted read status snapshots under the lock.',
    ],
    examples: [
      {
        title: 'Flaky job with 3 retries',
        input: 'scheduleOnce(flaky, delay=0, maxRetries=3) with base backoff 100ms; flaky fails twice then succeeds',
        output: 'Runs at t≈0, t≈100ms, t≈300ms → status COMPLETED, attempts reset to 0',
        explanation:
          'Failure #1 waits 100·2⁰=100ms, failure #2 waits 100·2¹=200ms (cumulative 300ms). The third attempt succeeds, so the job moves to the completed list without ever reaching FAILED.',
      },
      {
        title: 'Priority tie-break',
        input: 'Two jobs both due at t=1000: A(priority 1), B(priority 5)',
        output: 'B is popped before A',
        explanation: 'The heap compares nextRunTime first; on equal times the higher priority sorts earlier. Sequence number breaks any remaining tie so ordering is deterministic.',
      },
      {
        title: 'Cancel a recurring job',
        input: 'scheduleInterval(tick, 200ms); cancel(id) after ~1s',
        output: 'cancel returns true; no further ticks; job not in pending list',
        explanation: 'Status flips to CANCELLED. If it is mid-run, the worker sees CANCELLED after the task and does not requeue. Otherwise the dispatcher drops the stale heap entry when it surfaces.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you support real cron expressions?',
      answer:
        'Introduce a Schedule abstraction with nextAfter(timestamp). OneTime returns none after first run, FixedRate adds an interval, CronSchedule parses fields and finds the next matching minute. The heap and dispatcher are unchanged; only how nextRunTime is computed changes.',
    },
    {
      question: 'Why a heap rather than a sorted list or one timer per job?',
      answer:
        'A sorted list makes insert O(n); one timer per job explodes thread/timer counts and scatters ordering logic. A heap gives O(log n) insert and O(1) peek with a single sleeping dispatcher.',
    },
    {
      question: 'How do you prevent a slow job from blocking others?',
      answer:
        'The dispatcher only moves due jobs into a ready queue. Workers execute them in parallel up to the pool size. If workers are saturated, the ready queue (ordered by priority in the TypeScript version) holds them - consider bounding it and adding metrics for queue lag.',
    },
    {
      question: 'What if the process restarts?',
      answer:
        'Persist jobs (id, schedule, nextRunTime, attempts, status) and reload them into the heap on boot. Decide on a misfire policy: run immediately, skip, or replay missed ticks. Execution then becomes at-least-once, so tasks should be idempotent.',
    },
    {
      question: 'How do you scale to many scheduler instances?',
      answer:
        'Move the queue to shared storage (database row with next_run_at + lease/lock, or Redis sorted set). Each instance claims due jobs atomically (SELECT … FOR UPDATE SKIP LOCKED) and runs them. Heartbeats/lease expiry recover jobs from crashed nodes.',
    },
    {
      question: 'How would you add jitter and a max-delay cap to backoff?',
      answer:
        'Wrap the delay in a JitteredBackoff decorator: delay = min(cap, base·factor^(k−1)) then multiply by a random factor in [0.5, 1.0]. It implements the same RetryPolicy interface, so Scheduler is untouched.',
    },
    {
      question: 'How do you test this deterministically?',
      answer:
        'Inject a fake Clock and a synchronous executor. Advance the fake clock and call the dispatcher step directly, asserting run order, retry delays, interval drift, and cancellation without sleeping.',
    },
  ],
  extras: {
    edgeCases: [
      'Cancelling a job that is currently running (no new runs, in-flight call finishes).',
      'Cancelling an unknown id or an already finished job returns false.',
      'A new job with an earlier nextRunTime than the head must wake the dispatcher.',
      'Interval shorter than task duration - fixed-rate clamps next run to now instead of piling up.',
      'maxRetries = 0 means a single attempt, then FAILED.',
      'Task throws or panics - the worker must survive and record the error.',
      'Scheduler stopped while jobs are pending.',
    ],
    commonMistakes: [
      'Running tasks while holding the scheduler lock (blocks scheduling and cancel).',
      'Busy-waiting or polling every few ms instead of waiting until the head is due.',
      'Forgetting to notify the dispatcher when a sooner job is inserted.',
      'Mutating a job’s nextRunTime while it is still inside the heap.',
      'Resetting retry attempts incorrectly for recurring jobs.',
      'Letting one failing task kill a worker thread.',
    ],
    complexity:
      'schedule: O(log n). dispatch of the next job: O(log n). cancel: O(1) (lazy). listPending: O(n log n) because of sorting. Space: O(n) for jobs plus completed history.',
    testing: [
      'Fake clock: assert exact nextRunTime after success, failure and recurrence.',
      'Backoff sequence 100, 200, 400 … capped at max.',
      'Equal nextRunTime ordered by priority then insertion order.',
      'Cancel before run, during run, and for recurring jobs.',
      'Concurrency stress: N jobs on W workers never exceed W in flight.',
      'Failing task with maxRetries=2 runs exactly 3 times then FAILED.',
    ],
    extensions: [
      'Cron expression parser and misfire policies.',
      'Job persistence and recovery.',
      'Per-job timeout and cancellation tokens.',
      'Metrics (queue lag, success/failure counts) and a dead-letter list.',
      'Distributed scheduling with leases.',
    ],
    takeaways: [
      'A time-ordered min-heap answers “what runs next?” in O(1).',
      'Separate dispatching (time) from executing (workers).',
      'Retries and recurrence are both just “re-insert with a new nextRunTime”.',
      'Prefer lazy deletion for cancel; never run user code under the lock.',
    ],
  },
}
