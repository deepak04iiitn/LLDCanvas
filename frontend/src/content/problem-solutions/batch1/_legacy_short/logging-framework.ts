import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  enm('ll', 'LogLevel', 40, 40, ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']),
  cls('le', 'LogEvent', 240, 40, [
    attr('-', 'level', 'LogLevel'),
    attr('-', 'message', 'string'),
    attr('-', 'timestamp', 'DateTime'),
    attr('-', 'context', 'Map<string, string>'),
  ], [
    method('+', 'LogEvent', 'level, message, context', '', { isConstructor: true }),
  ]),
  iface('la', 'LogAppender', 480, 40, [
    method('+', 'append', 'event: LogEvent', 'void'),
    method('+', 'flush', '', 'void'),
  ]),
  cls('ca', 'ConsoleAppender', 720, 20, [
    attr('-', 'format', 'string'),
  ], [
    method('+', 'append', 'event', 'void'),
    method('+', 'flush', '', 'void'),
  ]),
  cls('fa', 'FileAppender', 720, 160, [
    attr('-', 'path', 'string'),
    attr('-', 'buffer', 'List<string>'),
  ], [
    method('+', 'append', 'event', 'void'),
    method('+', 'flush', '', 'void'),
  ]),
  cls('aa', 'AsyncAppender', 480, 200, [
    attr('-', 'delegate', 'LogAppender'),
    attr('-', 'queue', 'BlockingQueue<LogEvent>'),
    attr('-', 'worker', 'Thread'),
  ], [
    method('+', 'append', 'event', 'void'),
    method('+', 'flush', '', 'void'),
    method('-', 'drainLoop', '', 'void'),
  ]),
  cls('lg', 'Logger', 40, 220, [
    attr('-', 'name', 'string'),
    attr('-', 'minLevel', 'LogLevel'),
    attr('-', 'appenders', 'List<LogAppender>'),
  ], [
    method('+', 'log', 'level, message, context', 'void'),
    method('+', 'info', 'message', 'void'),
    method('+', 'error', 'message', 'void'),
    method('+', 'addAppender', 'appender: LogAppender', 'void'),
  ]),
  cls('lf', 'LoggerFactory', 280, 280, [
    attr('-', 'loggers', 'Map<string, Logger>'),
    attr('-', 'rootLevel', 'LogLevel'),
  ], [
    method('+', 'getLogger', 'name: string', 'Logger'),
    method('+', 'setRootLevel', 'level: LogLevel', 'void'),
  ], 'singleton'),
]

const edges = [
  edge('e1', 'lg', 'la', 'aggregation', 'right', 'left', { label: '0..*' }),
  edge('e2', 'ca', 'la', 'realization', 'left', 'right'),
  edge('e3', 'fa', 'la', 'realization', 'left', 'right'),
  edge('e4', 'aa', 'la', 'realization', 'left', 'top'),
  edge('e5', 'aa', 'la', 'dependency', 'bottom', 'top', { label: 'delegate' }),
  edge('e6', 'lg', 'le', 'dependency', 'top', 'bottom', { label: 'creates' }),
  edge('e7', 'lg', 'll', 'dependency', 'top@30', 'bottom'),
  edge('e8', 'lf', 'lg', 'composition', 'left', 'right', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
]

const py = `from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import IntEnum
from queue import Queue, Empty
from threading import Lock, Thread
from typing import Dict, List, Optional


class LogLevel(IntEnum):
    TRACE = 10
    DEBUG = 20
    INFO = 30
    WARN = 40
    ERROR = 50


@dataclass
class LogEvent:
    level: LogLevel
    message: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    context: Dict[str, str] = field(default_factory=dict)


class LogAppender(ABC):
    @abstractmethod
    def append(self, event: LogEvent) -> None: ...

    def flush(self) -> None:
        pass


class ConsoleAppender(LogAppender):
    def append(self, event: LogEvent) -> None:
        ctx = " ".join(f"{k}={v}" for k, v in event.context.items())
        print(f"[{event.timestamp.isoformat()}] {event.level.name} {event.message} {ctx}".strip())

    def flush(self) -> None:
        pass


class FileAppender(LogAppender):
    def __init__(self, path: str):
        self.path = path
        self._buffer: List[str] = []
        self._lock = Lock()

    def append(self, event: LogEvent) -> None:
        line = f"{event.timestamp.isoformat()}|{event.level.name}|{event.message}\\n"
        with self._lock:
            self._buffer.append(line)

    def flush(self) -> None:
        with self._lock:
            if not self._buffer:
                return
            with open(self.path, "a", encoding="utf-8") as f:
                f.writelines(self._buffer)
            self._buffer.clear()


class AsyncAppender(LogAppender):
    def __init__(self, delegate: LogAppender, max_queue: int = 10_000):
        self._delegate = delegate
        self._queue: Queue[LogEvent] = Queue(maxsize=max_queue)
        self._stop = False
        self._worker = Thread(target=self._drain_loop, daemon=True)
        self._worker.start()

    def append(self, event: LogEvent) -> None:
        try:
            self._queue.put_nowait(event)
        except Exception:
            self._delegate.append(event)

    def flush(self) -> None:
        while not self._queue.empty():
            try:
                self._delegate.append(self._queue.get_nowait())
            except Empty:
                break
        self._delegate.flush()

    def _drain_loop(self) -> None:
        while not self._stop:
            try:
                ev = self._queue.get(timeout=0.1)
                self._delegate.append(ev)
            except Empty:
                continue

    def shutdown(self) -> None:
        self._stop = True
        self.flush()
        self._worker.join(timeout=2)


class Logger:
    def __init__(self, name: str, min_level: LogLevel = LogLevel.INFO):
        self.name = name
        self.min_level = min_level
        self._appenders: List[LogAppender] = []

    def add_appender(self, appender: LogAppender) -> None:
        self._appenders.append(appender)

    def log(self, level: LogLevel, message: str, **context: str) -> None:
        if level < self.min_level:
            return
        event = LogEvent(level=level, message=message, context=dict(context))
        for a in self._appenders:
            a.append(event)

    def info(self, message: str, **ctx: str) -> None:
        self.log(LogLevel.INFO, message, **ctx)

    def error(self, message: str, **ctx: str) -> None:
        self.log(LogLevel.ERROR, message, **ctx)


class LoggerFactory:
    _instance: Optional["LoggerFactory"] = None
    _lock = Lock()

    def __init__(self):
        self.root_level = LogLevel.INFO
        self._loggers: Dict[str, Logger] = {}

    @classmethod
    def instance(cls) -> "LoggerFactory":
        with cls._lock:
            if cls._instance is None:
                cls._instance = LoggerFactory()
            return cls._instance

    def get_logger(self, name: str) -> Logger:
        if name not in self._loggers:
            self._loggers[name] = Logger(name, self.root_level)
        return self._loggers[name]

    def set_root_level(self, level: LogLevel) -> None:
        self.root_level = level
        for lg in self._loggers.values():
            lg.min_level = level


def demo() -> None:
    factory = LoggerFactory.instance()
    factory.set_root_level(LogLevel.DEBUG)
    log = factory.get_logger("app")
    log.add_appender(AsyncAppender(ConsoleAppender()))
    log.info("server started", port="8080")
    log.error("disk full", path="/var/log")


if __name__ == "__main__":
    demo()
`

const java = `import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

enum LogLevel { TRACE(10), DEBUG(20), INFO(30), WARN(40), ERROR(50);
  final int priority; LogLevel(int p) { priority = p; }
  boolean enabled(LogLevel min) { return priority >= min.priority; }
}

record LogEvent(LogLevel level, String message, Instant timestamp, Map<String, String> context) {
  LogEvent(LogLevel level, String message) {
    this(level, message, Instant.now(), Map.of());
  }
}

interface LogAppender { void append(LogEvent event); default void flush() {} }

class ConsoleAppender implements LogAppender {
  public void append(LogEvent e) {
    System.out.printf("[%s] %s %s%n", e.timestamp(), e.level(), e.message());
  }
}

class FileAppender implements LogAppender {
  private final String path;
  private final List<String> buffer = new ArrayList<>();
  public FileAppender(String path) { this.path = path; }
  public synchronized void append(LogEvent e) {
    buffer.add(e.timestamp() + "|" + e.level() + "|" + e.message() + "\\n");
  }
  public synchronized void flush() { buffer.clear(); }
}

class AsyncAppender implements LogAppender {
  private final LogAppender delegate;
  private final BlockingQueue<LogEvent> queue = new LinkedBlockingQueue<>(10_000);
  private final AtomicBoolean stop = new AtomicBoolean(false);
  AsyncAppender(LogAppender delegate) {
    this.delegate = delegate;
    Thread t = new Thread(this::drainLoop, "async-log");
    t.setDaemon(true); t.start();
  }
  public void append(LogEvent e) {
    if (!queue.offer(e)) delegate.append(e);
  }
  public void flush() {
    LogEvent ev; while ((ev = queue.poll()) != null) delegate.append(ev);
    delegate.flush();
  }
  private void drainLoop() {
    while (!stop.get()) {
      try { delegate.append(queue.poll(100, TimeUnit.MILLISECONDS)); }
      catch (InterruptedException ignored) {}
    }
  }
}

class Logger {
  private final String name;
  private LogLevel minLevel;
  private final List<LogAppender> appenders = new ArrayList<>();
  Logger(String name, LogLevel minLevel) { this.name = name; this.minLevel = minLevel; }
  void addAppender(LogAppender a) { appenders.add(a); }
  void log(LogLevel level, String message) {
    if (!level.enabled(minLevel)) return;
    LogEvent ev = new LogEvent(level, message);
    for (LogAppender a : appenders) a.append(ev);
  }
  void info(String msg) { log(LogLevel.INFO, msg); }
  void error(String msg) { log(LogLevel.ERROR, msg); }
}

final class LoggerFactory {
  private static final LoggerFactory INSTANCE = new LoggerFactory();
  private LogLevel rootLevel = LogLevel.INFO;
  private final Map<String, Logger> loggers = new ConcurrentHashMap<>();
  static LoggerFactory getInstance() { return INSTANCE; }
  Logger getLogger(String name) {
    return loggers.computeIfAbsent(name, n -> new Logger(n, rootLevel));
  }
  void setRootLevel(LogLevel level) {
    rootLevel = level;
    loggers.values().forEach(l -> l.minLevel = level);
  }
}
`

const ts = `enum LogLevel { TRACE = 10, DEBUG = 20, INFO = 30, WARN = 40, ERROR = 50 }

interface LogEvent {
  level: LogLevel
  message: string
  timestamp: Date
  context: Record<string, string>
}

interface LogAppender {
  append(event: LogEvent): void
  flush?(): void
}

class ConsoleAppender implements LogAppender {
  append(e: LogEvent) {
    console.log(\`[\${e.timestamp.toISOString()}] \${LogLevel[e.level]} \${e.message}\`)
  }
}

class FileAppender implements LogAppender {
  private buffer: string[] = []
  constructor(private path: string) {}
  append(e: LogEvent) {
    this.buffer.push(\`\${e.timestamp.toISOString()}|\${LogLevel[e.level]}|\${e.message}\\n\`)
  }
  flush() { this.buffer = [] }
}

class AsyncAppender implements LogAppender {
  private queue: LogEvent[] = []
  constructor(private delegate: LogAppender) {
    setInterval(() => this.drain(), 50)
  }
  append(e: LogEvent) { this.queue.push(e) }
  flush() { this.drain(); this.delegate.flush?.() }
  private drain() {
    while (this.queue.length) this.delegate.append(this.queue.shift()!)
  }
}

class Logger {
  private appenders: LogAppender[] = []
  constructor(public name: string, public minLevel = LogLevel.INFO) {}
  addAppender(a: LogAppender) { this.appenders.push(a) }
  log(level: LogLevel, message: string, context: Record<string, string> = {}) {
    if (level < this.minLevel) return
    const event: LogEvent = { level, message, timestamp: new Date(), context }
    for (const a of this.appenders) a.append(event)
  }
  info(msg: string) { this.log(LogLevel.INFO, msg) }
  error(msg: string) { this.log(LogLevel.ERROR, msg) }
}

class LoggerFactory {
  private static inst = new LoggerFactory()
  static getInstance() { return LoggerFactory.inst }
  rootLevel = LogLevel.INFO
  private loggers = new Map<string, Logger>()
  getLogger(name: string) {
    if (!this.loggers.has(name)) this.loggers.set(name, new Logger(name, this.rootLevel))
    return this.loggers.get(name)!
  }
  setRootLevel(level: LogLevel) {
    this.rootLevel = level
    this.loggers.forEach(l => { l.minLevel = level })
  }
}

export { Logger, LoggerFactory, ConsoleAppender, AsyncAppender, LogLevel }
`

const cpp = `#include <chrono>
#include <iostream>
#include <memory>
#include <mutex>
#include <queue>
#include <string>
#include <thread>
#include <vector>

enum class LogLevel { Trace, Debug, Info, Warn, Error };

struct LogEvent {
  LogLevel level;
  std::string message;
  std::chrono::system_clock::time_point ts;
};

class LogAppender {
public:
  virtual ~LogAppender() = default;
  virtual void append(const LogEvent& e) = 0;
  virtual void flush() {}
};

class ConsoleAppender : public LogAppender {
public:
  void append(const LogEvent& e) override {
    std::cout << "[log] " << static_cast<int>(e.level) << " " << e.message << "\\n";
  }
};

class AsyncAppender : public LogAppender {
  std::shared_ptr<LogAppender> delegate_;
  std::queue<LogEvent> q_;
  std::mutex mu_;
  std::thread worker_;
  bool stop_ = false;
public:
  explicit AsyncAppender(std::shared_ptr<LogAppender> d) : delegate_(std::move(d)) {
    worker_ = std::thread([this] {
      while (!stop_) {
        std::optional<LogEvent> ev;
        { std::lock_guard lock(mu_);
          if (!q_.empty()) { ev = q_.front(); q_.pop(); } }
        if (ev) delegate_->append(*ev);
        else std::this_thread::sleep_for(std::chrono::milliseconds(10));
      }
    });
  }
  ~AsyncAppender() { stop_ = true; if (worker_.joinable()) worker_.join(); }
  void append(const LogEvent& e) override {
    std::lock_guard lock(mu_);
    q_.push(e);
  }
  void flush() override { delegate_->flush(); }
};

class Logger {
  LogLevel min_;
  std::vector<std::shared_ptr<LogAppender>> appenders_;
public:
  explicit Logger(LogLevel min = LogLevel::Info) : min_(min) {}
  void addAppender(std::shared_ptr<LogAppender> a) { appenders_.push_back(std::move(a)); }
  void log(LogLevel lvl, std::string msg) {
    if (static_cast<int>(lvl) < static_cast<int>(min_)) return;
    LogEvent e{lvl, std::move(msg), std::chrono::system_clock::now()};
    for (auto& a : appenders_) a->append(e);
  }
};
`

const goCode = `package logging

import (
  "fmt"
  "sync"
  "time"
)

type LogLevel int

const (
  Trace LogLevel = iota
  Debug
  Info
  Warn
  Error
)

type LogEvent struct {
  Level     LogLevel
  Message   string
  Timestamp time.Time
  Context   map[string]string
}

type LogAppender interface {
  Append(LogEvent)
  Flush()
}

type ConsoleAppender struct{}

func (ConsoleAppender) Append(e LogEvent) {
  fmt.Printf("[%s] %d %s\\n", e.Timestamp.Format(time.RFC3339), e.Level, e.Message)
}
func (ConsoleAppender) Flush() {}

type AsyncAppender struct {
  delegate LogAppender
  ch       chan LogEvent
}

func NewAsyncAppender(d LogAppender, cap int) *AsyncAppender {
  a := &AsyncAppender{delegate: d, ch: make(chan LogEvent, cap)}
  go func() {
    for e := range a.ch {
      a.delegate.Append(e)
    }
  }()
  return a
}

func (a *AsyncAppender) Append(e LogEvent) {
  select {
  case a.ch <- e:
  default:
    a.delegate.Append(e)
  }
}
func (a *AsyncAppender) Flush() { a.delegate.Flush() }

type Logger struct {
  name      string
  minLevel  LogLevel
  appenders []LogAppender
  mu        sync.Mutex
}

func (l *Logger) AddAppender(a LogAppender) {
  l.mu.Lock()
  l.appenders = append(l.appenders, a)
  l.mu.Unlock()
}

func (l *Logger) Log(level LogLevel, msg string) {
  if level < l.minLevel {
    return
  }
  ev := LogEvent{Level: level, Message: msg, Timestamp: time.Now(), Context: map[string]string{}}
  l.mu.Lock()
  defer l.mu.Unlock()
  for _, a := range l.appenders {
    a.Append(ev)
  }
}

type LoggerFactory struct {
  rootLevel LogLevel
  loggers   map[string]*Logger
  mu        sync.Mutex
}

var factory = &LoggerFactory{rootLevel: Info, loggers: map[string]*Logger{}}

func GetLogger(name string) *Logger {
  factory.mu.Lock()
  defer factory.mu.Unlock()
  if lg, ok := factory.loggers[name]; ok {
    return lg
  }
  lg := &Logger{name: name, minLevel: factory.rootLevel}
  factory.loggers[name] = lg
  return lg
}
`

const csharp = `using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

public enum LogLevel { Trace = 10, Debug = 20, Info = 30, Warn = 40, Error = 50 }

public sealed record LogEvent(LogLevel Level, string Message, DateTime Timestamp, IReadOnlyDictionary<string, string> Context)
{
  public LogEvent(LogLevel level, string message) : this(level, message, DateTime.UtcNow, new Dictionary<string, string>()) {}
}

public interface ILogAppender
{
  void Append(LogEvent e);
  void Flush();
}

public sealed class ConsoleAppender : ILogAppender
{
  public void Append(LogEvent e) => Console.WriteLine($"[{e.Timestamp:O}] {e.Level} {e.Message}");
  public void Flush() {}
}

public sealed class AsyncAppender : ILogAppender
{
  readonly ILogAppender _delegate;
  readonly BlockingCollection<LogEvent> _queue = new(10_000);
  public AsyncAppender(ILogAppender del)
  {
    _delegate = del;
    Task.Run(() => { foreach (var ev in _queue.GetConsumingEnumerable()) _delegate.Append(ev); });
  }
  public void Append(LogEvent e)
  {
    if (!_queue.TryAdd(e)) _delegate.Append(e);
  }
  public void Flush() { while (_queue.TryTake(out var ev)) _delegate.Append(ev); _delegate.Flush(); }
}

public sealed class Logger
{
  public string Name { get; }
  public LogLevel MinLevel { get; set; }
  readonly List<ILogAppender> _appenders = new();
  public Logger(string name, LogLevel min) { Name = name; MinLevel = min; }
  public void AddAppender(ILogAppender a) => _appenders.Add(a);
  public void Log(LogLevel level, string message)
  {
    if ((int)level < (int)MinLevel) return;
    var ev = new LogEvent(level, message);
    foreach (var a in _appenders) a.Append(ev);
  }
  public void Info(string msg) => Log(LogLevel.Info, msg);
  public void Error(string msg) => Log(LogLevel.Error, msg);
}

public sealed class LoggerFactory
{
  static readonly LoggerFactory Instance = new();
  public static LoggerFactory GetInstance() => Instance;
  public LogLevel RootLevel { get; set; } = LogLevel.Info;
  readonly Dictionary<string, Logger> _loggers = new();
  public Logger GetLogger(string name)
  {
    if (!_loggers.TryGetValue(name, out var lg))
    {
      lg = new Logger(name, RootLevel);
      _loggers[name] = lg;
    }
    return lg;
  }
}
`

export const loggingFrameworkSolution: ProblemSolution = {
  slug: 'logging-framework',
  title: 'Logging Framework - Solution',
  overview: {
    introduction:
      'Design a pluggable logging library with levels, multiple appenders (console, file), and optional async delivery so callers never block on I/O. Interviewers want clean separation between the logging API, formatting, and sinks.',
    constraints: [
      'Support at least TRACE through ERROR with level filtering per logger.',
      'Multiple appenders per logger; each event fan-outs to all appenders.',
      'Async path must not lose logs silently when the queue is full (fallback or block - state your choice).',
    ],
    assumptions: [
      'Single-process library (not a distributed log aggregator).',
      'Thread-safe appenders when used from concurrent request handlers.',
      'Formatting is simple text lines unless the interviewer asks for JSON.',
    ],
    clarificationQuestions: [
      'Should async mode drop, block, or spill to sync when the queue is full?',
      'Do we need MDC/thread-local context propagation?',
      'Is log rotation in scope or a separate FileAppender concern?',
      'Per-logger levels vs one global root level?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Treat logging as a pipeline: filter by level → build LogEvent → fan-out to appenders. Keep Logger dumb about where logs go; appenders own I/O.',
    breakdown: [
      'Define LogLevel ordering and LogEvent DTO.',
      'Introduce LogAppender interface (Strategy for sinks).',
      'Logger holds name, min level, list of appenders.',
      'Wrap slow appenders with AsyncAppender (decorator + worker thread).',
      'Optional LoggerFactory singleton for named loggers.',
    ],
    entities: [
      { name: 'LogLevel', responsibility: 'Ordered severity for filtering.' },
      { name: 'LogEvent', responsibility: 'Immutable record passed to appenders.' },
      { name: 'LogAppender', responsibility: 'Writes events to a destination.' },
      { name: 'AsyncAppender', responsibility: 'Buffers events on a background worker.' },
      { name: 'Logger', responsibility: 'Level check + fan-out to appenders.' },
      { name: 'LoggerFactory', responsibility: 'Registry of named loggers and root level.' },
    ],
    relationships: [
      'Logger aggregates many LogAppender instances.',
      'AsyncAppender decorates another LogAppender.',
      'ConsoleAppender and FileAppender realize LogAppender.',
      'LoggerFactory composes Logger instances by name.',
    ],
    patternsAndOop: [
      'Strategy: pluggable appenders.',
      'Decorator: AsyncAppender wraps a delegate appender.',
      'Singleton (optional): LoggerFactory for global config.',
      'Observer-like fan-out without tight coupling to sinks.',
    ],
    stepByStep: [
      'Clarify levels and async loss policy.',
      'Sketch Logger → Appender interface → concrete sinks.',
      'Implement level filter and event struct.',
      'Add async queue + worker; discuss flush on shutdown.',
      'Show how to add a JSON appender without changing Logger.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'The pipeline keeps the public API stable while appenders evolve. Level filtering happens once in Logger; appenders stay single-purpose and composable via AsyncAppender.',
    classResponsibilities: [
      { name: 'Logger', responsibility: 'Filters and broadcasts LogEvent to appenders.' },
      { name: 'LogAppender', responsibility: 'Sink contract (append/flush).' },
      { name: 'AsyncAppender', responsibility: 'Offloads I/O to a worker thread.' },
      { name: 'LoggerFactory', responsibility: 'Central place for root level and logger cache.' },
    ],
    interfacesAndAbstractions: [
      'LogAppender is the extension point - new sinks do not touch Logger.',
      'LogEvent carries context map for structured logging later.',
    ],
    relationships: [
      'Aggregation Logger→Appender: appenders can be shared or swapped at runtime.',
      'AsyncAppender depends on a delegate appender for actual writes.',
    ],
    solid: [
      'SRP: Logger does not format files; FileAppender does not filter levels.',
      'OCP: new appenders implement the interface.',
      'DIP: Logger depends on LogAppender abstraction.',
    ],
    patterns: [
      { name: 'Strategy', why: 'Swap console/file/remote sinks.' },
      { name: 'Decorator', why: 'Add async behavior without changing FileAppender.' },
    ],
    decisions: [
      {
        decision: 'Drop-to-sync when async queue is full.',
        rationale: 'Prefer losing latency spikes over unbounded memory.',
        tradeoff: 'Burst traffic may block callers on the fallback path.',
      },
      {
        decision: 'IntEnum / numeric level ordering.',
        rationale: 'Simple min-level comparison in hot path.',
      },
    ],
    extensibility:
      'Add JSONFormatter, RollingFileAppender, or RemoteAppender implementing LogAppender. Introduce Filter chain between Logger and appenders for package-based filtering.',
  },
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    steps: [
      'Configure LoggerFactory root level and obtain a named Logger.',
      'Register ConsoleAppender directly or wrapped in AsyncAppender.',
      'Caller invokes info/error; Logger checks level and builds LogEvent.',
      'Each appender receives the event; async worker drains queue to delegate.',
      'On shutdown, flush drains remaining queue to disk/console.',
    ],
    examples: [
      {
        title: 'INFO passes, DEBUG filtered',
        input: 'Logger minLevel=INFO; log(DEBUG, "trace")',
        output: 'No output',
        explanation: 'Level comparison short-circuits before appenders run.',
      },
      {
        title: 'Async fan-out',
        input: 'log(INFO) with Console + File async appenders',
        output: 'Two lines eventually written',
        explanation: 'Logger loops appenders; each AsyncAppender enqueues independently.',
      },
    ],
  },
  followUps: [
    {
      question: 'How do you avoid losing logs on process crash?',
      answer:
        'Sync critical appenders, periodic flush, or memory-mapped files. Async always trades latency for durability - document fsync policy.',
    },
    {
      question: 'Structured logging vs plain text?',
      answer:
        'Keep LogEvent with context map; let a Formatter on each appender render JSON. Logger stays agnostic.',
    },
    {
      question: 'How is this different from SLF4J/Logback?',
      answer:
        'Same ideas: facade logger, level, appenders, async wrapper. Mention binding and MDC as production extras.',
    },
  ],
  extras: {
    edgeCases: ['Queue full under burst', 'Flush while worker is blocked', 'Recursive logging from appender'],
    commonMistakes: ['God Logger that writes files directly', 'No level ordering', 'Unbounded async queue'],
    complexity: 'O(A) per log line for A appenders; async enqueue O(1).',
    testing: ['Mock appender captures events', 'Level filter table tests', 'Async stress without deadlock'],
    extensions: ['Correlation IDs', 'Sampling', 'Remote OTLP appender'],
    takeaways: ['Pipeline: filter → event → sinks', 'Appenders are strategies', 'Async is a decorator'],
  },
}
