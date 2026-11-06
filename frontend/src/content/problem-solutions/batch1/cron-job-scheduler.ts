import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'CronJobSchedulerService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_jobs', 'Map<string, Job>'),
    attr('-', '_schedules', 'Map<string, Schedule>'),
    attr('-', '_job_queues', 'Map<string, JobQueue>'),
    attr('-', '_workers', 'Map<string, Worker>'),
  ], [
    method('+', 'createJob', 'name: string', 'Job'),
    method('+', 'createSchedule', 'name: string', 'Schedule'),
    method('+', 'createJobQueue', 'name: string', 'JobQueue'),
    method('+', 'createWorker', 'name: string', 'Worker'),
    method('+', 'getJob', 'id: string', 'Job'),
    method('+', 'getSchedule', 'id: string', 'Schedule'),
    method('+', 'getJobQueue', 'id: string', 'JobQueue'),
    method('+', 'getWorker', 'id: string', 'Worker'),
    method('+', 'closeJob', 'id: string', 'Job'),
  ], 'facade'),
  cls('n1', 'Job', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Schedule', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'JobQueue', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Worker', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
]

const edges = [
  edge('e1', 'n0', 'n1', 'composition', 'right', 'left'),
  edge('e2', 'n0', 'n2', 'composition', 'right', 'left'),
  edge('e3', 'n0', 'n3', 'composition', 'right', 'left'),
  edge('e4', 'n0', 'n4', 'composition', 'right', 'left'),
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("cron-job-scheduler")


class Job:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Job.id is required")
        if not name or not name.strip():
            raise ValueError("Job.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Job.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Job {self.id} has invalid status={self.status}")
        log.info("[Job.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Job {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Job.close] id=%s -> CLOSED", self.id)


class Schedule:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Schedule.id is required")
        if not name or not name.strip():
            raise ValueError("Schedule.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Schedule.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Schedule {self.id} has invalid status={self.status}")
        log.info("[Schedule.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Schedule {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Schedule.close] id=%s -> CLOSED", self.id)


class JobQueue:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("JobQueue.id is required")
        if not name or not name.strip():
            raise ValueError("JobQueue.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[JobQueue.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"JobQueue {self.id} has invalid status={self.status}")
        log.info("[JobQueue.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"JobQueue {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[JobQueue.close] id=%s -> CLOSED", self.id)


class Worker:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Worker.id is required")
        if not name or not name.strip():
            raise ValueError("Worker.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Worker.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Worker {self.id} has invalid status={self.status}")
        log.info("[Worker.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Worker {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Worker.close] id=%s -> CLOSED", self.id)


class CronJobSchedulerService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._jobs: Dict[str, Job] = {}
        self._schedules: Dict[str, Schedule] = {}
        self._job_queues: Dict[str, JobQueue] = {}
        self._workers: Dict[str, Worker] = {}
        log.info("[CronJobSchedulerService.__init__] system ready; managing: Job, Schedule, JobQueue, Worker")

    def create_job(self, name: str) -> Job:
        """UML: CronJobSchedulerService.create_job(name) -> Job"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Job name is required")
        with self._lock:
            item_id = f"JOB-{self._seq:04d}"
            self._seq += 1
            obj = Job(item_id, cleaned)
            obj.validate()
            self._jobs[item_id] = obj
            log.info("[CronJobSchedulerService.create_job] stored %s in _jobs (count=%s)", item_id, len(self._jobs))
            return obj

    def get_job(self, item_id: str) -> Job:
        with self._lock:
            obj = self._jobs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Job id: {item_id}")
            log.info("[CronJobSchedulerService.get_job] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_schedule(self, name: str) -> Schedule:
        """UML: CronJobSchedulerService.create_schedule(name) -> Schedule"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Schedule name is required")
        with self._lock:
            item_id = f"SCH-{self._seq:04d}"
            self._seq += 1
            obj = Schedule(item_id, cleaned)
            obj.validate()
            self._schedules[item_id] = obj
            log.info("[CronJobSchedulerService.create_schedule] stored %s in _schedules (count=%s)", item_id, len(self._schedules))
            return obj

    def get_schedule(self, item_id: str) -> Schedule:
        with self._lock:
            obj = self._schedules.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Schedule id: {item_id}")
            log.info("[CronJobSchedulerService.get_schedule] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_job_queue(self, name: str) -> JobQueue:
        """UML: CronJobSchedulerService.create_job_queue(name) -> JobQueue"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("JobQueue name is required")
        with self._lock:
            item_id = f"JOB-{self._seq:04d}"
            self._seq += 1
            obj = JobQueue(item_id, cleaned)
            obj.validate()
            self._job_queues[item_id] = obj
            log.info("[CronJobSchedulerService.create_job_queue] stored %s in _job_queues (count=%s)", item_id, len(self._job_queues))
            return obj

    def get_job_queue(self, item_id: str) -> JobQueue:
        with self._lock:
            obj = self._job_queues.get(item_id)
            if obj is None:
                raise KeyError(f"unknown JobQueue id: {item_id}")
            log.info("[CronJobSchedulerService.get_job_queue] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_worker(self, name: str) -> Worker:
        """UML: CronJobSchedulerService.create_worker(name) -> Worker"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Worker name is required")
        with self._lock:
            item_id = f"WOR-{self._seq:04d}"
            self._seq += 1
            obj = Worker(item_id, cleaned)
            obj.validate()
            self._workers[item_id] = obj
            log.info("[CronJobSchedulerService.create_worker] stored %s in _workers (count=%s)", item_id, len(self._workers))
            return obj

    def get_worker(self, item_id: str) -> Worker:
        with self._lock:
            obj = self._workers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Worker id: {item_id}")
            log.info("[CronJobSchedulerService.get_worker] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_job(self, item_id: str) -> Job:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._jobs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Job id: {item_id}")
            log.info("[CronJobSchedulerService.close_job] closing %s via Job.close()", item_id)
            obj.close()
            return obj

    def list_active_jobs(self) -> List[Job]:
        with self._lock:
            active = [o for o in self._jobs.values() if o.status == "ACTIVE"]
            log.info("[CronJobSchedulerService.list_active_jobs] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct CronJobSchedulerService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = CronJobSchedulerService()

    log.info("========== STEP 2: Create primary Job objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_job("alpha-job")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_job("beta-job")

    log.info("========== STEP 3: Create Schedule (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_schedule("sample-schedule")

    log.info("========== STEP 4: Create JobQueue (UML class) ==========")
    system.create_job_queue("sample-job_queue")

    log.info("========== STEP 5: Create Worker (UML class) ==========")
    system.create_worker("sample-worker")

    log.info("========== STEP 6: Inspect active Job list ==========")
    system.list_active_jobs()

    log.info("========== STEP 7: Close first Job ==========")
    system.close_job(first.id)

    log.info("========== STEP 8: Expected failure - close again ==========")
    try:
        system.close_job(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Job.close: %s", err)

    log.info("========== STEP 9: Expected failure - missing id ==========")
    try:
        system.get_job("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_job: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_jobs()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Job {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Job(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Job.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Job.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Job.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("Job " + id + " invalid status");
    }
    System.out.println("[Job.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Job " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Job.close] id=" + id + " -> CLOSED");
  }
}


class Schedule {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Schedule(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Schedule.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Schedule.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Schedule.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("Schedule " + id + " invalid status");
    }
    System.out.println("[Schedule.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Schedule " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Schedule.close] id=" + id + " -> CLOSED");
  }
}


class JobQueue {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  JobQueue(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("JobQueue.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("JobQueue.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[JobQueue.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("JobQueue " + id + " invalid status");
    }
    System.out.println("[JobQueue.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("JobQueue " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[JobQueue.close] id=" + id + " -> CLOSED");
  }
}


class Worker {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Worker(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Worker.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Worker.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Worker.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("Worker " + id + " invalid status");
    }
    System.out.println("[Worker.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Worker " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Worker.close] id=" + id + " -> CLOSED");
  }
}

public class CronJobSchedulerService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Job> jobs = new LinkedHashMap<>();
  private final Map<String, Schedule> schedules = new LinkedHashMap<>();
  private final Map<String, JobQueue> job_queues = new LinkedHashMap<>();
  private final Map<String, Worker> workers = new LinkedHashMap<>();

  public CronJobSchedulerService() {
    System.out.println("[CronJobSchedulerService.__init__] system ready");
  }

  public Job createJob(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Job name required");
    }
    lock.lock();
    try {
      String id = String.format("JOB-%04d", seq++);
      Job obj = new Job(id, name.trim());
      obj.validate();
      jobs.put(id, obj);
      System.out.println("[CronJobSchedulerService.createJob] stored " + id + " count=" + jobs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Job getJob(String id) {
    lock.lock();
    try {
      Job obj = jobs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Job id: " + id);
      }
      System.out.println("[CronJobSchedulerService.getJob] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Schedule createSchedule(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Schedule name required");
    }
    lock.lock();
    try {
      String id = String.format("SCH-%04d", seq++);
      Schedule obj = new Schedule(id, name.trim());
      obj.validate();
      schedules.put(id, obj);
      System.out.println("[CronJobSchedulerService.createSchedule] stored " + id + " count=" + schedules.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Schedule getSchedule(String id) {
    lock.lock();
    try {
      Schedule obj = schedules.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Schedule id: " + id);
      }
      System.out.println("[CronJobSchedulerService.getSchedule] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public JobQueue createJobQueue(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("JobQueue name required");
    }
    lock.lock();
    try {
      String id = String.format("JOB-%04d", seq++);
      JobQueue obj = new JobQueue(id, name.trim());
      obj.validate();
      job_queues.put(id, obj);
      System.out.println("[CronJobSchedulerService.createJobQueue] stored " + id + " count=" + job_queues.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public JobQueue getJobQueue(String id) {
    lock.lock();
    try {
      JobQueue obj = job_queues.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown JobQueue id: " + id);
      }
      System.out.println("[CronJobSchedulerService.getJobQueue] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Worker createWorker(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Worker name required");
    }
    lock.lock();
    try {
      String id = String.format("WOR-%04d", seq++);
      Worker obj = new Worker(id, name.trim());
      obj.validate();
      workers.put(id, obj);
      System.out.println("[CronJobSchedulerService.createWorker] stored " + id + " count=" + workers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Worker getWorker(String id) {
    lock.lock();
    try {
      Worker obj = workers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Worker id: " + id);
      }
      System.out.println("[CronJobSchedulerService.getWorker] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Job closeJob(String id) {
    lock.lock();
    try {
      Job obj = jobs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Job id: " + id);
      }
      System.out.println("[CronJobSchedulerService.closeJob] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Job> listActiveJobs() {
    lock.lock();
    try {
      List<Job> out = new ArrayList<>();
      for (Job o : jobs.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[CronJobSchedulerService.listActiveJobs] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct CronJobSchedulerService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    CronJobSchedulerService system = new CronJobSchedulerService();
    System.out.println("========== STEP 2: Create Job objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Job first = system.createJob("alpha-job");
    system.createJob("beta-job");
    System.out.println("========== STEP 3: Create Schedule ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createSchedule("sample-schedule");
    System.out.println("========== STEP 4: Create JobQueue ==========");
    system.createJobQueue("sample-job_queue");
    System.out.println("========== STEP 5: Create Worker ==========");
    system.createWorker("sample-worker");
    System.out.println("========== Inspect active list ==========");
    system.listActiveJobs();
    System.out.println("========== Close first Job ==========");
    system.closeJob(first.getId());
    try {
      system.closeJob(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getJob("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Job {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Job.id required')
    }

    if (!name?.trim()) {
      throw new Error('Job.name required')
    }
    console.log(\`[Job.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Job \${this.id} invalid status\`)
    }
    console.log(\`[Job.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Job \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Job.close] id=\${this.id} -> CLOSED\`)
  }
}


class Schedule {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Schedule.id required')
    }

    if (!name?.trim()) {
      throw new Error('Schedule.name required')
    }
    console.log(\`[Schedule.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Schedule \${this.id} invalid status\`)
    }
    console.log(\`[Schedule.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Schedule \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Schedule.close] id=\${this.id} -> CLOSED\`)
  }
}


class JobQueue {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('JobQueue.id required')
    }

    if (!name?.trim()) {
      throw new Error('JobQueue.name required')
    }
    console.log(\`[JobQueue.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`JobQueue \${this.id} invalid status\`)
    }
    console.log(\`[JobQueue.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`JobQueue \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[JobQueue.close] id=\${this.id} -> CLOSED\`)
  }
}


class Worker {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Worker.id required')
    }

    if (!name?.trim()) {
      throw new Error('Worker.name required')
    }
    console.log(\`[Worker.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Worker \${this.id} invalid status\`)
    }
    console.log(\`[Worker.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Worker \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Worker.close] id=\${this.id} -> CLOSED\`)
  }
}

class CronJobSchedulerService {
  private seq = 1
  private jobs = new Map<string, Job>()
  private schedules = new Map<string, Schedule>()
  private job_queues = new Map<string, JobQueue>()
  private workers = new Map<string, Worker>()
  constructor() {
    console.log('[CronJobSchedulerService.__init__] system ready')
  }

  createJob(name: string): Job {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Job name required')
    }
    const id = \`JOB-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Job(id, cleaned)
    obj.validate()
    this.jobs.set(id, obj)
    console.log(\`[CronJobSchedulerService.createJob] stored \${id} count=\${this.jobs.size}\`)
    return obj
  }

  getJob(id: string): Job {
    const obj = this.jobs.get(id)
    if (!obj) {
      throw new Error(\`unknown Job id: \${id}\`)
    }
    console.log(\`[CronJobSchedulerService.getJob] found id=\${obj.id}\`)
    return obj
  }

  createSchedule(name: string): Schedule {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Schedule name required')
    }
    const id = \`SCH-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Schedule(id, cleaned)
    obj.validate()
    this.schedules.set(id, obj)
    console.log(\`[CronJobSchedulerService.createSchedule] stored \${id} count=\${this.schedules.size}\`)
    return obj
  }

  getSchedule(id: string): Schedule {
    const obj = this.schedules.get(id)
    if (!obj) {
      throw new Error(\`unknown Schedule id: \${id}\`)
    }
    console.log(\`[CronJobSchedulerService.getSchedule] found id=\${obj.id}\`)
    return obj
  }

  createJobQueue(name: string): JobQueue {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('JobQueue name required')
    }
    const id = \`JOB-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new JobQueue(id, cleaned)
    obj.validate()
    this.job_queues.set(id, obj)
    console.log(\`[CronJobSchedulerService.createJobQueue] stored \${id} count=\${this.job_queues.size}\`)
    return obj
  }

  getJobQueue(id: string): JobQueue {
    const obj = this.job_queues.get(id)
    if (!obj) {
      throw new Error(\`unknown JobQueue id: \${id}\`)
    }
    console.log(\`[CronJobSchedulerService.getJobQueue] found id=\${obj.id}\`)
    return obj
  }

  createWorker(name: string): Worker {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Worker name required')
    }
    const id = \`WOR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Worker(id, cleaned)
    obj.validate()
    this.workers.set(id, obj)
    console.log(\`[CronJobSchedulerService.createWorker] stored \${id} count=\${this.workers.size}\`)
    return obj
  }

  getWorker(id: string): Worker {
    const obj = this.workers.get(id)
    if (!obj) {
      throw new Error(\`unknown Worker id: \${id}\`)
    }
    console.log(\`[CronJobSchedulerService.getWorker] found id=\${obj.id}\`)
    return obj
  }

  closeJob(id: string): Job {
    const obj = this.getJob(id)
    console.log(\`[CronJobSchedulerService.closeJob] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveJobs(): Job[] {
    const active = [...this.jobs.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[CronJobSchedulerService.listActiveJobs] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct CronJobSchedulerService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new CronJobSchedulerService()
  console.log('========== STEP 2: Create Job objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createJob('alpha-job')
  system.createJob('beta-job')
  console.log('========== STEP 3: Create Schedule ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createSchedule('sample-schedule')
  console.log('========== STEP 4: Create JobQueue ==========')
  system.createJobQueue('sample-job_queue')
  console.log('========== STEP 5: Create Worker ==========')
  system.createWorker('sample-worker')
  system.listActiveJobs()
  console.log('========== Close first Job ==========')
  system.closeJob(first.id)
  try {
    system.closeJob(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getJob('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Job {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Job(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Job requires id and name");
    }
    cout << "[Job.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("Job invalid status");
    }
    cout << "[Job.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Job cannot close");
    }
    status_ = "CLOSED";
    cout << "[Job.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Schedule {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Schedule(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Schedule requires id and name");
    }
    cout << "[Schedule.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("Schedule invalid status");
    }
    cout << "[Schedule.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Schedule cannot close");
    }
    status_ = "CLOSED";
    cout << "[Schedule.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class JobQueue {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  JobQueue(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("JobQueue requires id and name");
    }
    cout << "[JobQueue.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("JobQueue invalid status");
    }
    cout << "[JobQueue.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("JobQueue cannot close");
    }
    status_ = "CLOSED";
    cout << "[JobQueue.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Worker {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Worker(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Worker requires id and name");
    }
    cout << "[Worker.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("Worker invalid status");
    }
    cout << "[Worker.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Worker cannot close");
    }
    status_ = "CLOSED";
    cout << "[Worker.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class CronJobSchedulerService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Job> jobs_;
  unordered_map<string, Schedule> schedules_;
  unordered_map<string, JobQueue> job_queues_;
  unordered_map<string, Worker> workers_;
public:
  CronJobSchedulerService() {
    cout << "[CronJobSchedulerService.__init__] system ready" << endl;
  }

  Job createJob(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Job name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "JOB-%04d", seq_++);
    Job obj{buf, name};
    obj.validate();
    jobs_.emplace(obj.id(), obj);
    cout << "[CronJobSchedulerService.createJob] stored " << obj.id() << endl;
    return obj;
  }

  Job getJob(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = jobs_.find(id);
    if (it == jobs_.end()) {
      throw out_of_range("unknown Job id");
    }
    cout << "[CronJobSchedulerService.getJob] found " << id << endl;
    return it->second;
  }

  Schedule createSchedule(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Schedule name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SCH-%04d", seq_++);
    Schedule obj{buf, name};
    obj.validate();
    schedules_.emplace(obj.id(), obj);
    cout << "[CronJobSchedulerService.createSchedule] stored " << obj.id() << endl;
    return obj;
  }

  Schedule getSchedule(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = schedules_.find(id);
    if (it == schedules_.end()) {
      throw out_of_range("unknown Schedule id");
    }
    cout << "[CronJobSchedulerService.getSchedule] found " << id << endl;
    return it->second;
  }

  JobQueue createJobQueue(const string& name) {
    if (name.empty()) {
      throw invalid_argument("JobQueue name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "JOB-%04d", seq_++);
    JobQueue obj{buf, name};
    obj.validate();
    job_queues_.emplace(obj.id(), obj);
    cout << "[CronJobSchedulerService.createJobQueue] stored " << obj.id() << endl;
    return obj;
  }

  JobQueue getJobQueue(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = job_queues_.find(id);
    if (it == job_queues_.end()) {
      throw out_of_range("unknown JobQueue id");
    }
    cout << "[CronJobSchedulerService.getJobQueue] found " << id << endl;
    return it->second;
  }

  Worker createWorker(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Worker name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "WOR-%04d", seq_++);
    Worker obj{buf, name};
    obj.validate();
    workers_.emplace(obj.id(), obj);
    cout << "[CronJobSchedulerService.createWorker] stored " << obj.id() << endl;
    return obj;
  }

  Worker getWorker(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = workers_.find(id);
    if (it == workers_.end()) {
      throw out_of_range("unknown Worker id");
    }
    cout << "[CronJobSchedulerService.getWorker] found " << id << endl;
    return it->second;
  }

  Job closeJob(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = jobs_.find(id);
    if (it == jobs_.end()) {
      throw out_of_range("unknown Job");
    }
    cout << "[CronJobSchedulerService.closeJob] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct CronJobSchedulerService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  CronJobSchedulerService system;
  cout << "========== STEP 2: Create Job ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createJob("alpha-job");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createJob("beta-job");
  system.createSchedule("sample-schedule");
  system.createJobQueue("sample-job_queue");
  system.createWorker("sample-worker");
  system.closeJob(first.id());
  try {
    system.closeJob(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getJob("MISSING-ID");
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  return 0;
}
`

const goCode = `package main

import (
  "fmt"
  "sync"
)

type Job struct {
  ID     string
  Name   string
  Status string
}

func NewJob(id, name string) (*Job, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Job requires id and name")
  }
  obj := &Job{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Job.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Job) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Job invalid status")
  }
  fmt.Printf("[Job.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Job) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Job %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Job.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Schedule struct {
  ID     string
  Name   string
  Status string
}

func NewSchedule(id, name string) (*Schedule, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Schedule requires id and name")
  }
  obj := &Schedule{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Schedule.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Schedule) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Schedule invalid status")
  }
  fmt.Printf("[Schedule.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Schedule) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Schedule %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Schedule.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type JobQueue struct {
  ID     string
  Name   string
  Status string
}

func NewJobQueue(id, name string) (*JobQueue, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("JobQueue requires id and name")
  }
  obj := &JobQueue{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[JobQueue.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *JobQueue) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("JobQueue invalid status")
  }
  fmt.Printf("[JobQueue.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *JobQueue) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("JobQueue %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[JobQueue.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Worker struct {
  ID     string
  Name   string
  Status string
}

func NewWorker(id, name string) (*Worker, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Worker requires id and name")
  }
  obj := &Worker{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Worker.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Worker) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Worker invalid status")
  }
  fmt.Printf("[Worker.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Worker) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Worker %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Worker.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type CronJobSchedulerService struct {
  mu  sync.Mutex
  seq int
  jobs map[string]*Job
  schedules map[string]*Schedule
  job_queues map[string]*JobQueue
  workers map[string]*Worker
}

func NewCronJobSchedulerService() *CronJobSchedulerService {
  fmt.Println("[CronJobSchedulerService.__init__] system ready")
  return &CronJobSchedulerService{
    seq: 1,
    jobs: map[string]*Job{},
    schedules: map[string]*Schedule{},
    job_queues: map[string]*JobQueue{},
    workers: map[string]*Worker{},
  }
}

func (s *CronJobSchedulerService) CreateJob(name string) (*Job, error) {
  if name == "" {
    return nil, fmt.Errorf("Job name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("JOB-%04d", s.seq)
  s.seq++
  obj, err := NewJob(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.jobs[id] = obj
  fmt.Printf("[CronJobSchedulerService.CreateJob] stored %s\\n", id)
  return obj, nil
}

func (s *CronJobSchedulerService) GetJob(id string) (*Job, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.jobs[id]
  if !ok {
    return nil, fmt.Errorf("unknown Job id: %s", id)
  }
  fmt.Printf("[CronJobSchedulerService.GetJob] found %s\\n", id)
  return obj, nil
}

func (s *CronJobSchedulerService) CreateSchedule(name string) (*Schedule, error) {
  if name == "" {
    return nil, fmt.Errorf("Schedule name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SCH-%04d", s.seq)
  s.seq++
  obj, err := NewSchedule(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.schedules[id] = obj
  fmt.Printf("[CronJobSchedulerService.CreateSchedule] stored %s\\n", id)
  return obj, nil
}

func (s *CronJobSchedulerService) GetSchedule(id string) (*Schedule, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.schedules[id]
  if !ok {
    return nil, fmt.Errorf("unknown Schedule id: %s", id)
  }
  fmt.Printf("[CronJobSchedulerService.GetSchedule] found %s\\n", id)
  return obj, nil
}

func (s *CronJobSchedulerService) CreateJobQueue(name string) (*JobQueue, error) {
  if name == "" {
    return nil, fmt.Errorf("JobQueue name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("JOB-%04d", s.seq)
  s.seq++
  obj, err := NewJobQueue(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.job_queues[id] = obj
  fmt.Printf("[CronJobSchedulerService.CreateJobQueue] stored %s\\n", id)
  return obj, nil
}

func (s *CronJobSchedulerService) GetJobQueue(id string) (*JobQueue, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.job_queues[id]
  if !ok {
    return nil, fmt.Errorf("unknown JobQueue id: %s", id)
  }
  fmt.Printf("[CronJobSchedulerService.GetJobQueue] found %s\\n", id)
  return obj, nil
}

func (s *CronJobSchedulerService) CreateWorker(name string) (*Worker, error) {
  if name == "" {
    return nil, fmt.Errorf("Worker name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("WOR-%04d", s.seq)
  s.seq++
  obj, err := NewWorker(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.workers[id] = obj
  fmt.Printf("[CronJobSchedulerService.CreateWorker] stored %s\\n", id)
  return obj, nil
}

func (s *CronJobSchedulerService) GetWorker(id string) (*Worker, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.workers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Worker id: %s", id)
  }
  fmt.Printf("[CronJobSchedulerService.GetWorker] found %s\\n", id)
  return obj, nil
}

func (s *CronJobSchedulerService) CloseJob(id string) (*Job, error) {
  obj, err := s.GetJob(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[CronJobSchedulerService.CloseJob] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct CronJobSchedulerService ==========")
  system := NewCronJobSchedulerService()
  fmt.Println("========== STEP 2: Create Job ==========")
  first, _ := system.CreateJob("alpha-job")
  system.CreateJob("beta-job")
  system.CreateSchedule("sample-schedule")
  system.CreateJobQueue("sample-job_queue")
  system.CreateWorker("sample-worker")
  system.CloseJob(first.ID)
  if _, err := system.CloseJob(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetJob("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Job {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Job(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Job requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Job.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Job invalid status");
    }
    Console.WriteLine("[Job.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Job " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Job.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Schedule {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Schedule(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Schedule requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Schedule.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Schedule invalid status");
    }
    Console.WriteLine("[Schedule.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Schedule " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Schedule.close] id=" + Id + " -> CLOSED");
  }
}


sealed class JobQueue {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public JobQueue(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("JobQueue requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[JobQueue.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("JobQueue invalid status");
    }
    Console.WriteLine("[JobQueue.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("JobQueue " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[JobQueue.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Worker {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Worker(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Worker requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Worker.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Worker invalid status");
    }
    Console.WriteLine("[Worker.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Worker " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Worker.close] id=" + Id + " -> CLOSED");
  }
}

sealed class CronJobSchedulerService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Job> _jobs = new();
  private readonly Dictionary<string, Schedule> _schedules = new();
  private readonly Dictionary<string, JobQueue> _job_queues = new();
  private readonly Dictionary<string, Worker> _workers = new();
  public CronJobSchedulerService() {
    Console.WriteLine("[CronJobSchedulerService.__init__] system ready");
  }

  public Job CreateJob(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Job name required");
    }
    lock (_gate) {
      var id = string.Format("JOB-{0:D4}", _seq++);
      var obj = new Job(id, name.Trim());
      obj.Validate();
      _jobs[id] = obj;
      Console.WriteLine("[CronJobSchedulerService.CreateJob] stored " + id);
      return obj;
    }
  }

  public Job GetJob(string id) {
    lock (_gate) {
      if (!_jobs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Job id: " + id);
      }
      Console.WriteLine("[CronJobSchedulerService.GetJob] found " + id);
      return obj;
    }
  }

  public Schedule CreateSchedule(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Schedule name required");
    }
    lock (_gate) {
      var id = string.Format("SCH-{0:D4}", _seq++);
      var obj = new Schedule(id, name.Trim());
      obj.Validate();
      _schedules[id] = obj;
      Console.WriteLine("[CronJobSchedulerService.CreateSchedule] stored " + id);
      return obj;
    }
  }

  public Schedule GetSchedule(string id) {
    lock (_gate) {
      if (!_schedules.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Schedule id: " + id);
      }
      Console.WriteLine("[CronJobSchedulerService.GetSchedule] found " + id);
      return obj;
    }
  }

  public JobQueue CreateJobQueue(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("JobQueue name required");
    }
    lock (_gate) {
      var id = string.Format("JOB-{0:D4}", _seq++);
      var obj = new JobQueue(id, name.Trim());
      obj.Validate();
      _job_queues[id] = obj;
      Console.WriteLine("[CronJobSchedulerService.CreateJobQueue] stored " + id);
      return obj;
    }
  }

  public JobQueue GetJobQueue(string id) {
    lock (_gate) {
      if (!_job_queues.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown JobQueue id: " + id);
      }
      Console.WriteLine("[CronJobSchedulerService.GetJobQueue] found " + id);
      return obj;
    }
  }

  public Worker CreateWorker(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Worker name required");
    }
    lock (_gate) {
      var id = string.Format("WOR-{0:D4}", _seq++);
      var obj = new Worker(id, name.Trim());
      obj.Validate();
      _workers[id] = obj;
      Console.WriteLine("[CronJobSchedulerService.CreateWorker] stored " + id);
      return obj;
    }
  }

  public Worker GetWorker(string id) {
    lock (_gate) {
      if (!_workers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Worker id: " + id);
      }
      Console.WriteLine("[CronJobSchedulerService.GetWorker] found " + id);
      return obj;
    }
  }

  public Job CloseJob(string id) {
    var obj = GetJob(id);
    Console.WriteLine("[CronJobSchedulerService.CloseJob] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct CronJobSchedulerService ==========");
    var system = new CronJobSchedulerService();
    Console.WriteLine("========== STEP 2: Create Job ==========");
    var first = system.CreateJob("alpha-job");
    system.CreateJob("beta-job");
    system.CreateSchedule("sample-schedule");
    system.CreateJobQueue("sample-job_queue");
    system.CreateWorker("sample-worker");
    system.CloseJob(first.Id);
    try {
      system.CloseJob(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetJob("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const cronJobSchedulerSolution: ProblemSolution = {
  slug: 'cron-job-scheduler',
  title: 'Job Scheduler (Cron-like Task Runner) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a task scheduler that runs jobs at fixed intervals or specific times, similar to a basic cron system. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Schedule a job to run once at a specific time',
      'Schedule a recurring job at a fixed interval',
      'Cancel a scheduled job before it runs',
      'Support job priority for execution ordering',
      'Retry a failed job up to N times',
      'List all pending and completed jobs',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Schedule a job to run once at a specific time?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Schedule a recurring job at a fixed interval?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Cancel a scheduled job before it runs?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support job priority for execution ordering?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Retry a failed job up to N times?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. CronJobSchedulerService is the facade stereotype. Job, Schedule, JobQueue, Worker are concrete domain classes with id/name/status and validate/close.',
          'Composition edges mean the facade stores and lifetime-owns those objects in maps - reflected directly in the code fields.',
        ],
        callout: {
          title: 'Beginner tip',
          body: 'If a class appears on the UML, it must appear in the code with the same name. Do not invent a generic Record type that the diagram never shows.',
        },
      },
      {
        heading: 'Build the demo around the facade API',
        paragraphs: [
          'Call create methods for each UML type, then exercise close on the primary entity and show the two failure paths the diagram implies: illegal state and missing id.',
        ],
        numbered: [
          'Construct CronJobSchedulerService.',
          'createJob twice and create the related UML classes.',
          'closeJob once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'CronJobSchedulerService', responsibility: 'UML facade - orchestrates Job Scheduler (Cron-like Task Runner).', keyMembers: ['create*', 'get*', 'closeJob'] },
    { name: 'Job', responsibility: 'UML class - domain object for Job Scheduler (Cron-like Task Runner).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Schedule', responsibility: 'UML class - domain object for Job Scheduler (Cron-like Task Runner).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'JobQueue', responsibility: 'UML class - domain object for Job Scheduler (Cron-like Task Runner).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Worker', responsibility: 'UML class - domain object for Job Scheduler (Cron-like Task Runner).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from CronJobSchedulerService to Job, Schedule, JobQueue, Worker. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on CronJobSchedulerService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
        ],
      },
      {
        heading: 'Validation lives on the domain class',
        paragraphs: [
          'validate() and close() sit on each domain type exactly as in the UML method compartments, so invariants stay next to the data they protect.',
        ],
      },
    ],
    classResponsibilities: [
    { name: 'CronJobSchedulerService', responsibility: 'UML facade - orchestrates Job Scheduler (Cron-like Task Runner).', keyMembers: ['create*', 'get*', 'closeJob'] },
    { name: 'Job', responsibility: 'UML class - domain object for Job Scheduler (Cron-like Task Runner).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Schedule', responsibility: 'UML class - domain object for Job Scheduler (Cron-like Task Runner).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'JobQueue', responsibility: 'UML class - domain object for Job Scheduler (Cron-like Task Runner).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Worker', responsibility: 'UML class - domain object for Job Scheduler (Cron-like Task Runner).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'CronJobSchedulerService exposes create/get/close and owns composed collections.' },
      { name: 'Composition', why: 'UML filled diamonds mean ownership.', howApplied: 'Domain instances live in facade maps and are not shared elsewhere in the demo.' },
    ],
    decisions: [
      {
        decision: 'Identical class names across UML and all six languages',
        rationale: 'Beginners can map diagram boxes to code without renaming.',
      },
    ],
    solid: {
      paragraphs: [
        'SRP: domain classes validate themselves; the facade only orchestrates. DIP: callers depend on the facade API, not on map internals.',
      ],
    },
    extensibility: [
      'Add new UML classes as new composed types on the facade.',
      'Replace in-memory maps with repositories without changing domain method names.',
    ],
  },
  implementationIntro: [
    'Every language implements the same UML types. Read the logs in main() top to bottom - each line names the class and method that just ran.',
  ],
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    narrative: [
      'main constructs CronJobSchedulerService, creates UML domain objects, closes the primary Job, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct CronJobSchedulerService.',
      'createJob for alpha and beta.',
      'create remaining UML classes.',
      'closeJob(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createJob("alpha..."); closeJob(id)',
        output: '[Job.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeJob(alreadyClosed) or getJob("MISSING-ID")',
        output: '[main] expected failure: ...',
        explanation: 'Illegal transitions and missing ids throw; main catches and logs them.',
      },
    ],
  },
  followUps: [
    {
      question: 'How do you prove the code matches the UML?',
      answer: 'Every class box name appears as a type; every facade method in the diagram is callable in main; composition is a real owned map.',
    },
    {
      question: 'Where should new behavior go?',
      answer: 'If the UML shows the method on a domain class, implement it there. Only orchestration belongs on the facade.',
    },
    {
      question: 'How do you keep beginners oriented?',
      answer: 'Log ClassName.methodName on every important step so the console narrates the diagram.',
    },
    {
      question: 'What about inheritance on the UML?',
      answer: 'When a later problem shows a generalization edge, introduce a base type and subclasses with the same names - do not flatten them into one Record.',
    },
    {
      question: 'How do you test this?',
      answer: 'Unit-test domain validate/close; integration-test the facade create/get/close paths including the two failure cases in main.',
    },
  ],
  extras: {
    edgeCases: { paragraphs: ['Empty names, double-close, and unknown ids.'] },
    commonMistakes: {
      paragraphs: ['Inventing a Record class not on the UML, and putting domain validation only in the facade.'],
    },
    complexity: ['Map operations are O(1) average for create/get.'],
    testing: { paragraphs: ['Happy create/close, double-close, missing get.'] },
    extensions: ['Persistence', 'Extra UML associations', 'Domain events'],
    takeaways: ['UML names == code names', 'Facade owns composition', 'Logged main teaches the design'],
  },
}
