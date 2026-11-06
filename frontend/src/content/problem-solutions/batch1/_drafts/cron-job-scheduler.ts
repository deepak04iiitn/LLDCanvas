import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  // Left column: pluggable policies (retry + time source)
  iface('rp', 'RetryPolicy', GRID.x(0), GRID.y(0), [
    method('+', 'delayFor', 'attempt: int', 'Duration'),
  ]),
  cls('eb', 'ExponentialBackoff', GRID.x(0), GRID.y(1), [
    attr('-', 'base', 'Duration'),
    attr('-', 'factor', 'double'),
    attr('-', 'max', 'Duration'),
  ], [
    method('+', 'delayFor', 'attempt: int', 'Duration'),
  ]),
  iface('ck', 'Clock', GRID.x(0), GRID.y(2), [
    method('+', 'now', '', 'Timestamp'),
  ]),
  cls('sk', 'SystemClock', GRID.x(0), GRID.y(3), [], [
    method('+', 'now', '', 'Timestamp'),
  ]),

  // Centre: the façade and the thing that executes
  cls('sc', 'Scheduler', GRID.x(1), GRID.y(0), [
    attr('-', 'queue', 'JobQueue'),
    attr('-', 'jobs', 'Map<String, Job>'),
    attr('-', 'completed', 'List<Job>'),
    attr('-', 'pool', 'WorkerPool'),
    attr('-', 'retryPolicy', 'RetryPolicy'),
    attr('-', 'clock', 'Clock'),
  ], [
    method('+', 'scheduleOnce', 'task, delay, priority, maxRetries', 'String'),
    method('+', 'scheduleInterval', 'task, interval, priority, maxRetries', 'String'),
    method('+', 'cancel', 'jobId: String', 'boolean'),
    method('+', 'listPending', '', 'List<Job>'),
    method('+', 'listCompleted', '', 'List<Job>'),
    method('+', 'start / stop', '', 'void'),
  ], 'facade'),
  cls('wp', 'WorkerPool', GRID.x(1), GRID.y(1.7), [
    attr('-', 'workers', 'int'),
    attr('-', 'ready', 'Queue<Job>'),
  ], [
    method('+', 'submit', 'job: Job', 'void'),
    method('+', 'shutdown', '', 'void'),
  ], 'executor'),

  // Right: ordering + the unit of work
  cls('jq', 'JobQueue', GRID.x(2), GRID.y(0), [
    attr('-', 'heap', 'MinHeap<Job>'),
  ], [
    method('+', 'push', 'job: Job', 'void'),
    method('+', 'peek', '', 'Job?'),
    method('+', 'pop', '', 'Job'),
  ], 'min-heap'),
  cls('jb', 'Job', GRID.x(3), GRID.y(0), [
    attr('-', 'id', 'String'),
    attr('-', 'task', 'Task'),
    attr('-', 'nextRun', 'Timestamp'),
    attr('-', 'priority', 'int'),
    attr('-', 'interval', 'Duration?'),
    attr('-', 'maxRetries', 'int'),
    attr('-', 'attempts', 'int'),
    attr('-', 'status', 'JobStatus'),
  ], [
    method('+', 'isRecurring', '', 'boolean'),
  ]),
  enm('js', 'JobStatus', GRID.x(3), GRID.y(1.5), ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']),
]

const edges = [
  edge('e1', 'sc', 'jq', 'composition', 'right@20', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e2', 'jq', 'jb', 'aggregation', 'right@30', 'left@30', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'orders' }),
  edge('e3', 'jb', 'js', 'dependency', 'bottom', 'top'),
  edge('e4', 'sc', 'wp', 'composition', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e5', 'wp', 'jb', 'dependency', 'right', 'left@75', { label: 'executes' }),
  edge('e6', 'sc', 'rp', 'aggregation', 'left@20', 'right', { label: 'uses' }),
  edge('e7', 'eb', 'rp', 'realization', 'top', 'bottom'),
  edge('e8', 'sc', 'ck', 'aggregation', 'left@80', 'right', { label: 'reads time' }),
  edge('e9', 'sk', 'ck', 'realization', 'top', 'bottom'),
]

//@@py

//@@java

//@@ts

//@@cpp

//@@goCode

//@@csharp

export const cronJobSchedulerSolution: ProblemSolution = {
  slug: 'cron-job-scheduler',
  title: 'Design a Job Scheduler (Cron-like Task Runner) - Complete LLD Guide',
  overview: {
    introduction: [
      'A cron-style job scheduler looks deceptively small: “run this function later, and maybe keep running it every N seconds.” In an interview it is a surprisingly rich question because it forces you to answer one crisp algorithmic question - “how do I always know what runs next without scanning every job?” - and then surround that answer with the unglamorous parts of real systems: cancellation, retries, priorities, failures that must not kill the process, and listing what is pending versus finished.',
      'The interviewer is usually not asking you to parse “0 9 * * MON”. They want to see that you reach for a time-ordered priority queue, that you separate three concerns that beginners tend to mash together - deciding when something is due, actually running it, and deciding what to do afterwards - and that you can explain what happens under concurrency: a job being cancelled while it is running, a new job arriving that is due sooner than the one the scheduler is sleeping for, a task that throws.',
      'This guide walks the problem in the order you would live it at a whiteboard. We clarify the semantics (fixed-rate versus fixed-delay, what “priority” really means), find the nouns and verbs, notice that retries and recurrence are the same operation in disguise, draw the UML, and then implement a complete medium-level in-process scheduler in six languages with a runnable demo. By the end you should be able to defend every class and every trade-off out loud.',
      'We stay inside the practice-problem brief: one-time and recurring jobs, cancellation, priority ordering, retries up to N times with exponential backoff, and listing pending and completed jobs, for thousands of jobs with sub-second dispatch latency. We deliberately do not build persistence, cron-expression parsing or distributed leader election - but we point at exactly where each would plug in so you can answer those follow-ups confidently.',
    ],
    constraints: [
      'Jobs are either one-time (run once after a delay or at a time) or recurring (repeat every fixed interval).',
      'A job can be cancelled before it runs, or between recurrences; a cancelled job never runs again.',
      'When several jobs are due at the same moment, the higher-priority job goes first.',
      'A failed job is retried up to N times with exponential backoff before it is marked FAILED.',
      'Callers can list pending jobs and completed jobs (finished or failed).',
      'Thousands of jobs must be schedulable, and a due job should be dispatched within about a second of its scheduled time.',
    ],
    assumptions: [
      'In-process scheduler. Persistence across restarts and distributed leader election are out of scope; we mention them as follow-ups.',
      'Recurring jobs use fixed-rate semantics: the next run is the previous scheduled time plus the interval, but never earlier than “now”, so a stall does not trigger a burst of catch-up runs.',
      'Priority is a tie-breaker among jobs that are due at the same instant. It does not preempt a job that is already running.',
      'Cancelling a job that is currently executing prevents any future run but does not interrupt the in-flight call.',
      'Cron expressions are a layer on top: something that produces the next timestamp. The core engine only needs a timestamp.',
      'If a recurring job exhausts its retries it is marked FAILED and stops recurring - one bad job should not retry forever.',
    ],
    clarificationQuestions: [
      {
        question: 'Do we need real cron-expression syntax, or are a delay and a fixed interval enough for v1?',
        why: 'Cron syntax is a parser plus a “next matching minute” calculator. If it is out of scope you can say that parsing sits behind a Schedule abstraction and keep the core engine timestamp-based.',
      },
      {
        question: 'For recurring jobs: fixed-rate (every N seconds on the clock) or fixed-delay (N seconds after the previous run finishes)? And what if a run takes longer than the interval?',
        why: 'This decides how nextRun is recomputed and whether runs can pile up. Fixed-rate with a “never in the past” clamp is the safest default, but you must say it out loud.',
      },
      {
        question: 'Does a retry count against the recurrence - do we retry within a run, or just wait for the next tick?',
        why: 'It determines whether a failed run re-enters the queue with a backoff delay or simply waits for the next interval. We retry with backoff and reset the counter after a success.',
      },
      {
        question: 'What does “priority” mean: ordering among due jobs, or the ability to preempt a running one?',
        why: 'Preemption would need cancellable tasks and is a much bigger design. Ordering is a one-field change to the heap comparator.',
      },
      {
        question: 'Must tasks be idempotent, and is at-least-once execution acceptable?',
        why: 'Retries and restart recovery both imply at-least-once. Exactly-once is a different (and much harder) conversation.',
      },
      {
        question: 'Is persistence or restart recovery required, and how long must completed jobs be kept?',
        why: 'If yes, jobs need a store and a misfire policy on boot. If no, an in-memory map and a history list are enough - but note that an unbounded history list is a memory leak waiting to happen.',
      },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'Start with the question the whole design answers',
        paragraphs: [
          'Before drawing a single class, ask yourself: “At any instant, how do I know which job should fire next?” If you answer with “loop over all jobs and check,” you are O(n) per tick, which is the wrong answer for thousands of jobs. If you answer with “keep the jobs ordered by their next run time,” you have found the core of the design - a min-heap (priority queue) keyed by nextRun. Peeking the soonest job is O(1); inserting and removing is O(log n).',
          'Say this out loud early. Interviewers love hearing the data-structure choice before the classes, because it shows the classes are being derived from a real constraint rather than guessed from the problem title.',
        ],
        callout: {
          title: 'Interview tip',
          body: 'Lead with “a min-heap keyed by next run time, plus a single dispatcher that sleeps until the head is due.” That one sentence covers the data structure, the latency requirement and the thread model.',
        },
      },
      {
        heading: 'Clarify the semantics that change the code',
        paragraphs: [
          'Four questions genuinely alter the implementation: fixed-rate versus fixed-delay recurrence, whether priority preempts, whether a retry consumes a recurrence, and whether we need cron syntax. Ask them quickly, write the answers on the board, and then treat them as constraints.',
          'Our answers: fixed-rate clamped to “now”, priority is only a tie-breaker, a failed run retries with backoff and a success resets the attempt counter, and cron syntax is a layer that merely produces a timestamp. Notice that none of these answers require a different architecture - they only change a few lines - which is exactly what you want from a clean design.',
        ],
      },
      {
        heading: 'Separate three concerns: ordering, timing, executing',
        paragraphs: [
          'A very common first draft has one thread per job that sleeps and then runs. It works for ten jobs and collapses at ten thousand: you have thousands of sleeping threads, no global ordering and no place to put priority. The clean decomposition is a pipeline of three small responsibilities.',
          'Ordering belongs to the JobQueue, a min-heap of jobs. Timing belongs to one dispatcher loop that peeks the head, sleeps until it is due (or until something earlier arrives), and then pops it. Executing belongs to a bounded worker pool so a slow task can never delay the dispatcher or other jobs. This is the classic producer-consumer split: the dispatcher produces due jobs, the workers consume them.',
        ],
        numbered: [
          'JobQueue: “which job is next?” - pure data structure, no threads.',
          'Dispatcher loop: “is it due yet?” - owns the waiting, holds the lock only briefly.',
          'WorkerPool: “run it” - runs user code outside the lock, survives task failures.',
        ],
      },
      {
        heading: 'Notice that retries and recurrence are the same operation',
        paragraphs: [
          'This is the insight that makes the whole design small. A recurring job that succeeded and a failing job that needs a retry both end the same way: “set a new nextRun and put the job back in the heap.” The only difference is how the new time is computed - interval for success, backoff delay for failure. A one-time job that succeeded, or a job that ran out of retries, simply is not put back; it moves to the completed list.',
          'Because every outcome is “re-insert with a new nextRun or finish,” there are no special code paths for retry versus recurrence. That is why we can state the post-run logic in four lines, and why adding cron-style schedules later only changes the line that computes nextRun.',
        ],
      },
      {
        heading: 'Discovering entities and responsibilities',
        paragraphs: [
          'Job is the unit of work: an id, the task to run, its nextRun time, a priority, an optional interval (present means recurring), maxRetries, an attempts counter and a status. Status is a small enum - PENDING, RUNNING, COMPLETED, FAILED, CANCELLED - and only the Scheduler mutates it.',
          'Scheduler is the façade callers see: schedule once, schedule at an interval, cancel, list pending, list completed, start and stop. It owns the queue, a registry of jobs by id (so cancel is a lookup), the worker pool, and the history list. Two behaviours vary independently of scheduling, so they become injected abstractions: RetryPolicy (how long to wait before attempt k) and Clock (what time it is), which also makes the whole thing testable without sleeping.',
        ],
      },
      {
        heading: 'Relationships and the concurrency story',
        paragraphs: [
          'Scheduler composes the JobQueue and WorkerPool: they share its lifetime and are not shared with any other scheduler. JobQueue aggregates Jobs - it orders them but the Scheduler’s registry also references them. Scheduler depends on RetryPolicy and Clock abstractions, which are injected and replaceable. WorkerPool executes jobs but never decides when they run.',
          'For concurrency, give the interviewer a single sentence: all mutation of job state and the heap happens under one lock; user code always runs outside that lock; the dispatcher waits on a condition variable so it wakes immediately when a sooner job is added or a job is cancelled. That is enough to prove you understand the three classic bugs: running tasks under the lock, polling in a busy loop, and forgetting to wake the dispatcher.',
        ],
        callout: {
          title: 'What “medium level” means here',
          body: 'One heap, one dispatcher, one lock, a bounded worker pool, exponential backoff, lazy cancellation and a demo that exercises priority, retry, recurrence and cancel. No persistence, no cron parser, no distributed locks - but also no half-implemented methods.',
        },
      },
      {
        heading: 'Step-by-step path to the final diagram',
        paragraphs: [
          'Draw Scheduler in the middle. To its right put JobQueue and Job with a composition edge to the queue and an aggregation edge to Job. Below Scheduler put WorkerPool. Hang JobStatus off Job. On the far left stack the two pluggable policies, each as an interface with its implementation below. Then narrate the dispatch loop while you point at the arrows.',
          'Implement in this order: Job and JobStatus, the retry policy, the queue ordering, schedule/cancel, the dispatcher loop, the post-run logic (success, recurrence, failure), and finally the list methods. Leave cron syntax and persistence for the follow-up discussion.',
        ],
        numbered: [
          'Clarify recurrence, priority and retry semantics; write them down.',
          'Pick the min-heap keyed by (nextRun, priority, sequence).',
          'Sketch Job, JobStatus, JobQueue; inject RetryPolicy and Clock.',
          'Write the dispatcher loop: peek → wait until due → pop → submit.',
          'Write the post-run logic: success / recurrence / retry / FAILED.',
          'Add cancel (lazy deletion) and list methods under the same lock.',
          'Discuss concurrency, missed runs, cron, persistence and scale.',
        ],
      },
    ],
    entities: [
      { name: 'Scheduler', responsibility: 'Façade: schedule, cancel, list, start/stop. Owns the queue, id registry, worker pool and completed history.', keyMembers: ['scheduleOnce', 'scheduleInterval', 'cancel', 'listPending'] },
      { name: 'Job', responsibility: 'Unit of work with schedule metadata, retry counters and lifecycle status.', keyMembers: ['nextRun', 'priority', 'interval', 'attempts', 'status'] },
      { name: 'JobQueue', responsibility: 'Min-heap ordered by (nextRun, priority, sequence). O(log n) push/pop, O(1) peek.', keyMembers: ['push', 'peek', 'pop'] },
      { name: 'WorkerPool', responsibility: 'Bounded set of workers that execute due jobs concurrently.', keyMembers: ['submit', 'shutdown'] },
      { name: 'RetryPolicy / ExponentialBackoff', responsibility: 'Computes the delay before retry k as min(max, base × factor^(k−1)).', keyMembers: ['delayFor'] },
      { name: 'Clock / SystemClock', responsibility: 'Injectable time source so scheduling logic is testable.', keyMembers: ['now'] },
      { name: 'JobStatus', responsibility: 'PENDING → RUNNING → COMPLETED | FAILED | CANCELLED (RUNNING → PENDING again for retries and recurrence).' },
    ],
  },
  uml: { nodes, edges },
  umlCaption:
    'Centre: Scheduler (façade) with its WorkerPool below. Right: the time-ordered JobQueue and the Job it orders, with JobStatus beneath. Left: the two injected policies - RetryPolicy and Clock - each an interface with one implementation. Spacing follows the 340×260 grid so composition and realization edges stay readable.',
  designExplanation: {
    sections: [
      {
        heading: 'Architecture in one paragraph',
        paragraphs: [
          'Think of the scheduler as a small factory line. Jobs enter at the Scheduler façade and are placed on a time-ordered shelf (the JobQueue). One dispatcher looks at the front of the shelf; if the front item is not due it sleeps exactly as long as needed, and if something earlier arrives it wakes up and re-checks. When an item is due, the dispatcher hands it to a worker. After the worker finishes, the Scheduler decides the next step - finish, re-insert for the next interval, or re-insert after a backoff delay. Every decision about job state happens under one lock; the user’s task code never does.',
        ],
      },
      {
        heading: 'Why a min-heap keyed by (nextRun, priority, sequence)',
        paragraphs: [
          'The heap’s comparator is a tuple. The first element, nextRun, is what makes the head always the next job to fire. The second is the negated priority so that, for equal times, higher priority sorts first. The third is a monotonically increasing sequence number so that jobs with identical time and priority come out in insertion order - which makes behaviour deterministic and tests stable. Without a sequence number, equal keys leave the order undefined and some languages’ heaps will even try to compare the Job objects themselves.',
          'The costs are the ones you want to quote: push and pop are O(log n), peek is O(1). A sorted list would make insert O(n); one timer per job would make timer count equal job count and scatter the ordering logic across threads.',
        ],
      },
      {
        heading: 'The dispatcher loop',
        paragraphs: [
          'The dispatcher holds the lock only while it inspects the queue. It peeks the head; with an empty queue it waits indefinitely on the condition variable; with a cancelled head it pops and discards it; with a head that is not yet due it waits with a timeout equal to the remaining delay. Any of schedule(), cancel() or stop() notifies the condition variable, so the dispatcher re-evaluates immediately - that is how a newly added job that is due sooner than the current head gets noticed.',
          'When the head is due, the dispatcher pops it, flips its status to RUNNING and submits it to the worker pool. It does not run the task itself: a slow task would block every other job and prevent new jobs from being scheduled.',
        ],
      },
      {
        heading: 'What happens after a task runs',
        paragraphs: [
          'The worker runs the task outside the lock, catches any exception (a failing task must never kill a worker), then re-acquires the lock to apply the outcome. If the job was cancelled in the meantime, nothing is requeued. On success the attempt counter resets, and a one-time job becomes COMPLETED while a recurring job gets nextRun = max(nextRun + interval, now) and goes back into the heap. On failure the attempts counter increments; if attempts ≤ maxRetries the job gets nextRun = now + delayFor(attempts) and goes back into the heap, otherwise it is FAILED.',
          'The “max(…, now)” clamp is the fixed-rate subtlety. If a run takes longer than the interval, or the process stalls for a minute, naive “nextRun + interval” would be in the past and produce a burst of back-to-back catch-up runs. Clamping to now means missed ticks are skipped instead of replayed - a deliberate, explainable choice.',
        ],
      },
      {
        heading: 'Cancellation by lazy deletion',
        paragraphs: [
          'Removing an arbitrary element from a binary heap is O(n) unless you maintain an index of heap positions. For an interview, there is a far simpler trick: flip the job’s status to CANCELLED in O(1), and let the dispatcher throw the stale entry away when it eventually surfaces at the head. A worker that finishes a job that was cancelled mid-run sees the status and does not requeue it.',
          'The trade-off is that cancelled jobs linger in memory until their original time arrives. That is fine for typical workloads; if the interviewer asks about cancelling millions of far-future jobs, the answer is an indexed heap (or a hashed timing wheel) that supports true removal.',
        ],
      },
      {
        heading: 'What we deliberately did not do',
        paragraphs: [
          'We did not build cron syntax, persistence, per-job timeouts, a dead-letter queue or a distributed lock. Each is a legitimate extension, and the design has a named seam for each: a Schedule abstraction that computes the next run, a repository behind the registry, a timeout wrapper around task execution, a list of exhausted jobs, and a lease column on a shared queue. Showing the seam without building it is the right level for a medium-depth round.',
        ],
      },
    ],
    classResponsibilities: [
      { name: 'Scheduler', responsibility: 'Validates input, registers jobs, runs the dispatcher loop, applies post-run state transitions under the lock.', keyMembers: ['scheduleOnce', 'scheduleInterval', 'cancel', 'start', 'stop'] },
      { name: 'Job', responsibility: 'Carries schedule, priority, retry counters and status. Mutated only by the Scheduler.', keyMembers: ['nextRun', 'attempts', 'status'] },
      { name: 'JobQueue', responsibility: 'Orders pending jobs by (nextRun, −priority, sequence).', keyMembers: ['push', 'peek', 'pop'] },
      { name: 'WorkerPool', responsibility: 'Executes jobs concurrently with a fixed upper bound on parallelism.', keyMembers: ['submit'] },
      { name: 'ExponentialBackoff', responsibility: 'Pure function from attempt number to delay, with a cap.', keyMembers: ['delayFor'] },
      { name: 'SystemClock', responsibility: 'Production time source; replaced by a fake in tests.', keyMembers: ['now'] },
    ],
    patterns: [
      {
        name: 'Strategy',
        why: 'Retry timing varies independently of scheduling mechanics: exponential, linear, jittered, or no retry at all.',
        howApplied: 'RetryPolicy.delayFor(attempt). ExponentialBackoff is one implementation; Scheduler depends only on the interface.',
      },
      {
        name: 'Producer-Consumer',
        why: 'Timing and execution have different failure modes and speeds; coupling them lets one slow task delay everything.',
        howApplied: 'The dispatcher produces due jobs; a bounded worker pool consumes them. If every worker is busy, due jobs wait in the pool’s ready queue.',
      },
      {
        name: 'Façade',
        why: 'Callers should see five simple operations, not a heap, a lock, a condition variable and a thread pool.',
        howApplied: 'Scheduler exposes schedule/cancel/list/start/stop and hides the dispatch machinery.',
      },
      {
        name: 'Dependency Injection (Clock)',
        why: 'Time-dependent logic is notoriously hard to test with real sleeps.',
        howApplied: 'A Clock abstraction is passed to the Scheduler so tests can control “now”.',
      },
    ],
    decisions: [
      {
        decision: 'Min-heap keyed by (nextRun, −priority, sequence).',
        rationale: 'The head is always the next job to fire; the sequence number makes ordering deterministic for equal keys.',
        alternativeRejected: 'A sorted list (O(n) insert) or one timer per job (thread/timer explosion, no global ordering).',
        tradeoff: 'Arbitrary removal is O(n), so cancellation uses lazy deletion instead.',
      },
      {
        decision: 'Lazy deletion for cancel.',
        rationale: 'Flip status to CANCELLED in O(1) and let the dispatcher discard it when it reaches the head. Simple and race-free under the lock.',
        alternativeRejected: 'Indexed heap with true removal - more code and more invariants for little benefit at interview scale.',
        tradeoff: 'Cancelled entries linger in memory until they surface; irrelevant unless cancelling millions of far-future jobs.',
      },
      {
        decision: 'One dispatcher thread plus a bounded worker pool.',
        rationale: 'A single sleeper bounds thread count and keeps all ordering logic in one place. Workers isolate slow or failing tasks.',
        alternativeRejected: 'Running tasks on the dispatcher thread (one slow task stalls everything) or a thread per job.',
        tradeoff: 'Dispatch latency depends on lock contention; acceptable for in-process scheduling and well under the one-second target.',
      },
      {
        decision: 'Retries re-enter the same heap with a backoff delay.',
        rationale: 'A retry is just another nextRun, so there is no special-case path. Exponential backoff protects whatever the task depends on.',
        tradeoff: 'Without jitter many failing jobs retry in lockstep (thundering herd); add a jittered policy if asked.',
      },
      {
        decision: 'Fixed-rate recurrence clamped so it never schedules in the past.',
        rationale: 'Avoids long-term drift in normal operation and avoids a burst of catch-up runs after a stall.',
        alternativeRejected: 'Fixed-delay (drifts) or replaying every missed tick (bursty).',
        tradeoff: 'Missed ticks are skipped; offer a configurable misfire policy if the business needs replay.',
      },
      {
        decision: 'Never run user code while holding the lock.',
        rationale: 'A slow or blocking task would freeze scheduling, cancellation and listing.',
        tradeoff: 'Post-run state changes need a second lock acquisition, so a job can be cancelled between task finish and requeue - handled by re-checking status.',
      },
    ],
    solid: {
      paragraphs: [
        'Single Responsibility: the queue orders, the dispatcher times, the workers execute, the policy computes delay. Changing how retries wait never touches the heap code.',
        'Open/Closed: a new backoff (linear, jittered, none) or a new time source is a new class implementing an existing interface; Scheduler is not edited.',
        'Liskov Substitution: every RetryPolicy must return a non-negative delay for attempt ≥ 1, and every Clock must be monotonic enough that “now” does not go backwards; otherwise callers break.',
        'Interface Segregation: RetryPolicy and Clock are one-method interfaces. Task is simply a callable - the scheduler never learns what jobs do.',
        'Dependency Inversion: Scheduler depends on RetryPolicy and Clock abstractions rather than concrete classes, which is what makes deterministic tests possible.',
      ],
    },
    extensibility: [
      'Cron expressions: introduce a Schedule abstraction with nextAfter(timestamp). OneTime returns none, FixedRate adds an interval, CronSchedule finds the next matching minute. The heap and dispatcher are unchanged - only how nextRun is computed changes.',
      'Persistence: store (id, schedule, nextRun, attempts, status) and reload into the heap on boot, with an explicit misfire policy (run now, skip, or replay). Execution becomes at-least-once, so tasks should be idempotent.',
      'Distributed scheduling: replace the in-memory heap with a shared store holding next_run_at plus a lease; instances claim due jobs atomically. The dispatcher/worker split stays the same.',
      'Observability: emit events (queue lag, success/failure counts) from the post-run step, and keep a dead-letter list of jobs that exhausted retries.',
    ],
  },
  implementationIntro: [
    'Each implementation contains the same moving parts - Job, a time-ordered queue, a retry policy, an injectable clock, a dispatcher and a bounded set of workers - expressed in the idioms of its language (thread pools and condition variables in Python/Java/C++/C#, a timer-driven event loop in TypeScript, channels in Go). Each ends with a demo that schedules a prioritized job, a flaky job that needs retries, and a recurring job that is later cancelled.',
    'Read Python first for the cleanest picture of the algorithm, then skim another language to see that the structure carries over unchanged.',
  ],
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    narrative: [
      'Start the scheduler with two workers and a 100 ms base backoff. The caller schedules a one-time “hello” job (priority 5, due in 100 ms), a flaky job that throws twice before succeeding (up to 3 retries, due immediately), and a recurring “tick” job every 200 ms. All three go into the heap in one lock acquisition each, and each insert wakes the dispatcher.',
      'The dispatcher peeks the head - the flaky job at t≈0 - pops it and submits it. The worker runs it outside the lock; it throws. The worker re-acquires the lock, increments attempts to 1, computes delayFor(1) = 100 ms and re-inserts the job. The same happens at t≈100 ms (delay 200 ms). The third attempt at t≈300 ms succeeds, the attempts counter resets and the job moves to the completed list as COMPLETED. Meanwhile “hello” fires at t=100 ms and “tick” fires every 200 ms, each recurring run computing nextRun = max(nextRun + 200 ms, now). After about a second the caller cancels “tick”: its status flips to CANCELLED, and the next time the stale entry surfaces the dispatcher discards it.',
    ],
    steps: [
      'scheduleOnce / scheduleInterval creates a Job with nextRun = now + delay, registers it by id, pushes it on the heap and wakes the dispatcher.',
      'The dispatcher peeks the head. A cancelled head is discarded; a head that is not yet due makes it wait until then (or until woken by an earlier job or a cancel).',
      'A due job is popped, marked RUNNING and handed to the worker pool.',
      'A worker runs the task outside the lock, capturing any exception, then re-acquires the lock to apply the outcome (unless the job was cancelled).',
      'Success: attempts resets to 0; a one-time job becomes COMPLETED, a recurring job gets nextRun = max(nextRun + interval, now) and re-enters the heap.',
      'Failure: attempts++; if attempts ≤ maxRetries the job gets nextRun = now + backoff(attempts) and re-enters the heap, otherwise it becomes FAILED.',
      'cancel(id) flips status to CANCELLED (lazy removal). listPending / listCompleted read snapshots under the lock.',
    ],
    examples: [
      {
        title: 'Flaky job with 3 retries',
        input: 'scheduleOnce(flaky, delay=0, maxRetries=3) with base backoff 100 ms; flaky fails twice then succeeds',
        output: 'Runs at t≈0, t≈100 ms, t≈300 ms → status COMPLETED',
        explanation: 'Failure #1 waits 100·2⁰ = 100 ms, failure #2 waits 100·2¹ = 200 ms (cumulative 300 ms). The third attempt succeeds, so the job goes to the completed list without ever reaching FAILED.',
      },
      {
        title: 'Priority tie-break',
        input: 'Two jobs both due at t=1000: A (priority 1), B (priority 5)',
        output: 'B is popped before A',
        explanation: 'The heap compares nextRun first; on equal times the negated priority makes the higher priority sort earlier. The sequence number breaks any remaining tie so ordering is deterministic.',
      },
      {
        title: 'Cancel a recurring job',
        input: 'scheduleInterval(tick, 200 ms); cancel(id) after about 1 s',
        output: 'cancel returns true; no further ticks; job no longer listed as pending',
        explanation: 'Status flips to CANCELLED. If the job is mid-run, the worker sees CANCELLED after the task and does not requeue; otherwise the dispatcher drops the stale heap entry when it surfaces.',
      },
      {
        title: 'Retries exhausted',
        input: 'scheduleOnce(alwaysFails, maxRetries=2)',
        output: 'Runs 3 times in total (1 attempt + 2 retries), then FAILED',
        explanation: 'attempts goes 1, 2, 3. The check attempts ≤ maxRetries passes for 1 and 2 and fails for 3, so the third failure moves the job to the completed list with status FAILED and lastError recorded.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you support real cron expressions like “0 9 * * MON”?',
      answer: 'Introduce a Schedule abstraction with a single method nextAfter(timestamp). OneTime returns none after its first run, FixedRate adds an interval, and CronSchedule parses the five fields and finds the next matching minute. The heap, dispatcher and workers do not change; only the line that computes nextRun does. Parsing and DST/time-zone rules live entirely inside CronSchedule, which is easy to unit test.',
    },
    {
      question: 'Why a heap rather than a sorted list or one timer per job?',
      answer: 'A sorted list makes every insert O(n). One timer per job means thousands of sleeping threads or timers, no global order and nowhere to apply priority. A binary heap gives O(log n) insert, O(1) peek, and a single dispatcher can sleep until exactly the head’s due time. If you need even cheaper inserts at huge scale, a hashed timing wheel is the next step.',
    },
    {
      question: 'How do you stop a slow job from blocking the others?',
      answer: 'The dispatcher never runs tasks; it only moves due jobs to the worker pool. With W workers, up to W tasks run in parallel. If every worker is busy, due jobs wait in a ready backlog (a plain FIFO in the thread-pool versions; the TypeScript version keeps it as a priority heap). Priority across the backlog is a small upgrade: swap the FIFO for a priority queue. You would bound that backlog and expose queue lag as a metric, and optionally add a per-task timeout so a hung task cannot occupy a worker forever.',
    },
    {
      question: 'What happens if the process restarts?',
      answer: 'Today everything is lost because state is in memory. To survive restarts, persist jobs (id, schedule, nextRun, attempts, status) and reload them into the heap on boot. You also need a misfire policy for jobs whose nextRun passed while the process was down - run immediately, skip, or replay every missed tick. Execution becomes at-least-once, so tasks should be idempotent.',
    },
    {
      question: 'How would you run several scheduler instances without double-executing jobs?',
      answer: 'Move the queue to shared storage - a table with next_run_at and a lease, or a Redis sorted set. Each instance claims due jobs atomically (for example SELECT … FOR UPDATE SKIP LOCKED, or ZPOPMIN with a lease), executes them, and renews or releases the lease. If an instance dies, its lease expires and another instance reclaims the job. The dispatcher/worker split stays exactly as it is.',
    },
    {
      question: 'How would you add jitter and a maximum delay to backoff?',
      answer: 'The cap is already inside ExponentialBackoff: delay = min(max, base × factor^(attempt−1)). For jitter, write a JitteredBackoff decorator that wraps another RetryPolicy and multiplies its result by a random factor in, say, [0.5, 1.0]. Because it implements the same interface, Scheduler is untouched. Jitter prevents many failing jobs from retrying in lockstep.',
    },
    {
      question: 'How do you test a time-based system deterministically?',
      answer: 'Inject a fake Clock and avoid real sleeps: advance the fake time and call the dispatcher step directly, asserting run order, retry delays, interval drift and cancellation. For the thread-based paths, use latches or barriers rather than sleep. Backoff is a pure function, so test its sequence (100, 200, 400, … capped) in isolation.',
    },
    {
      question: 'What if a recurring job’s run takes longer than its interval?',
      answer: 'Because recurrence is fixed-rate clamped to now, the next run is scheduled immediately after the slow one finishes rather than being queued repeatedly. The skipped ticks are not replayed. If the business needs different behaviour - allow overlap, or replay - expose it as a misfire policy on the job instead of changing the core loop.',
    },
  ],
  extras: {
    edgeCases: {
      paragraphs: [
        'Most scheduler bugs live at the boundaries between “waiting”, “running” and “cancelled”. Walk through these cases before the interviewer does.',
      ],
      bullets: [
        'Cancelling a job that is currently running: no new runs, the in-flight call finishes, and the worker must not requeue it.',
        'Cancelling an unknown id or an already finished job returns false.',
        'A new job with an earlier nextRun than the head must wake the dispatcher, or it will oversleep.',
        'Interval shorter than the task duration: fixed-rate clamps the next run to now instead of piling up.',
        'maxRetries = 0 means a single attempt and then FAILED.',
        'A task that throws or panics must not kill a worker thread; record the error and continue.',
        'Scheduler stopped while jobs are still pending: stop must wake the dispatcher and not hang.',
      ],
    },
    commonMistakes: {
      paragraphs: [
        'The recurring mistakes are concurrency mistakes, not algorithmic ones.',
      ],
      bullets: [
        'Running the task while holding the scheduler lock, which blocks scheduling, cancel and listing.',
        'Busy-waiting or polling every few milliseconds instead of waiting until the head is due.',
        'Forgetting to notify the dispatcher when a sooner job is inserted or a job is cancelled.',
        'Mutating a job’s nextRun while it is still inside the heap, which silently corrupts ordering.',
        'Not resetting the retry counter after a success, so a recurring job slowly runs out of retries.',
        'Using a heap without a sequence number so equal keys compare arbitrary objects or reorder unpredictably.',
      ],
    },
    complexity: [
      'schedule: O(log n). Dispatching the next job: O(log n). cancel: O(1) (lazy). listPending: O(n log n) because of sorting.',
      'Space: O(n) for live jobs plus the completed history (bound it in production).',
    ],
    testing: {
      paragraphs: [
        'Test the pure parts first, then the concurrent parts with controlled time.',
      ],
      numbered: [
        'Backoff sequence 100, 200, 400 … capped at max.',
        'Heap order: equal nextRun ordered by priority, then insertion order.',
        'Fake clock: assert exact nextRun after success, failure and recurrence (including the “never in the past” clamp).',
        'Cancel before run, during run, and for recurring jobs.',
        'A task failing with maxRetries=2 runs exactly 3 times then FAILED.',
        'Concurrency stress: N jobs on W workers never exceed W in flight.',
      ],
    },
    extensions: [
      'Cron expression parser and misfire policies.',
      'Job persistence and recovery.',
      'Per-job timeout and cooperative cancellation tokens.',
      'Metrics (queue lag, success/failure counts) and a dead-letter list.',
      'Distributed scheduling with leases.',
    ],
    takeaways: [
      'A time-ordered min-heap answers “what runs next?” in O(1).',
      'Separate dispatching (time) from executing (workers); never run user code under the lock.',
      'Retries and recurrence are both “re-insert with a new nextRun or finish”.',
      'Prefer lazy deletion for cancel; use a sequence number to make heap order deterministic.',
      'Inject Clock and RetryPolicy so the whole system is testable without sleeping.',
    ],
  },
}
