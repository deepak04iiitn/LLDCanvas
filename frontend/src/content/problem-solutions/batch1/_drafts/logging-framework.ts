import type { ProblemSolution } from '../types'
import { abstractCls, attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  // Row 1 - registry, logger, record, level
  cls('lm', 'LogManager', 40, 40, [
    attr('-', 'instance', 'LogManager', true),
    attr('-', 'loggers', 'Map<string, Logger>'),
    attr('+', 'root', 'Logger'),
  ], [
    method('+', 'getInstance', '', 'LogManager', { isStatic: true }),
    method('+', 'getLogger', 'name: string', 'Logger'),
    method('+', 'shutdown', '', 'void'),
  ], 'singleton'),
  cls('lg', 'Logger', 420, 40, [
    attr('-', 'name', 'string'),
    attr('-', 'level', 'LogLevel?'),
    attr('-', 'parent', 'Logger?'),
    attr('-', 'additive', 'bool'),
    attr('-', 'appenders', 'List<Appender>'),
  ], [
    method('+', 'debug', 'msg: string', 'void'),
    method('+', 'info', 'msg: string', 'void'),
    method('+', 'warn', 'msg: string', 'void'),
    method('+', 'error', 'msg: string, err?', 'void'),
    method('+', 'fatal', 'msg: string, err?', 'void'),
    method('+', 'isEnabled', 'level: LogLevel', 'bool'),
    method('+', 'addAppender', 'a: Appender', 'void'),
  ]),
  cls('lr', 'LogRecord', 800, 40, [
    attr('+', 'timestamp', 'Instant'),
    attr('+', 'level', 'LogLevel'),
    attr('+', 'loggerName', 'string'),
    attr('+', 'message', 'string'),
    attr('+', 'thread', 'string'),
    attr('+', 'error', 'Throwable?'),
  ], [], 'immutable'),
  enm('ll', 'LogLevel', 1180, 40, ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']),

  // Row 2 - appender contract + decorator + filter/formatter contracts
  cls('aa', 'AsyncAppender', 40, 480, [
    attr('-', 'delegate', 'Appender'),
    attr('-', 'queue', 'BlockingQueue<LogRecord>'),
    attr('-', 'worker', 'Thread'),
    attr('+', 'dropped', 'int'),
  ], [
    method('+', 'append', 'r: LogRecord', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  iface('ap', 'Appender', 420, 480, [
    method('+', 'append', 'r: LogRecord', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  iface('fm', 'Formatter', 800, 480, [
    method('+', 'format', 'r: LogRecord', 'string'),
  ]),

  // Row 3 - base appender, concrete formatters, filters
  abstractCls('ab', 'AbstractAppender', 420, 700, [
    attr('#', 'formatter', 'Formatter'),
    attr('#', 'filters', 'List<LogFilter>'),
  ], [
    method('+', 'append', 'r: LogRecord', 'void'),
    method('#', 'write', 'line: string', 'void', { isAbstract: true }),
    method('+', 'close', '', 'void'),
  ]),
  cls('pf', 'PatternFormatter', 800, 700, [
    attr('-', 'pattern', 'string'),
  ], [
    method('+', 'format', 'r: LogRecord', 'string'),
  ]),
  cls('jf', 'JsonFormatter', 1180, 700, [], [
    method('+', 'format', 'r: LogRecord', 'string'),
  ]),
  iface('lf', 'LogFilter', 40, 720, [
    method('+', 'accept', 'r: LogRecord', 'bool'),
  ]),
  cls('lvf', 'LevelFilter', 40, 860, [
    attr('-', 'min', 'LogLevel'),
  ], [
    method('+', 'accept', 'r: LogRecord', 'bool'),
  ]),

  // Row 4 - concrete sinks
  cls('ca', 'ConsoleAppender', 420, 1040, [
    attr('-', 'stream', 'OutputStream'),
  ], [
    method('#', 'write', 'line: string', 'void'),
  ]),
  cls('fa', 'FileAppender', 800, 1040, [
    attr('-', 'path', 'Path'),
    attr('-', 'maxBytes', 'long'),
    attr('-', 'backups', 'int'),
    attr('-', 'size', 'long'),
  ], [
    method('#', 'write', 'line: string', 'void'),
    method('-', 'rotate', '', 'void'),
  ]),
  cls('ra', 'RemoteAppender', 1180, 1040, [
    attr('-', 'transport', 'Transport'),
    attr('+', 'failures', 'int'),
  ], [
    method('#', 'write', 'line: string', 'void'),
  ]),
]

const edges = [
  edge('e1', 'lm', 'lg', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e2', 'lg', 'ap', 'aggregation', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'dispatches to' }),
  edge('e3', 'lg', 'lr', 'dependency', 'right', 'left', { label: 'creates' }),
  edge('e4', 'lr', 'll', 'association', 'right', 'left'),
  edge('e5', 'aa', 'ap', 'realization', 'right', 'left', { label: 'decorates' }),
  edge('e6', 'ab', 'ap', 'realization', 'top', 'bottom'),
  edge('e7', 'ab', 'fm', 'aggregation', 'right@20', 'left', { label: 'formats with' }),
  edge('e8', 'pf', 'fm', 'realization', 'top@30', 'bottom@30'),
  edge('e9', 'jf', 'fm', 'realization', 'top', 'bottom@85'),
  edge('e10', 'ab', 'lf', 'aggregation', 'left', 'right', { label: 'filters' }),
  edge('e11', 'lvf', 'lf', 'realization', 'top', 'bottom'),
  edge('e12', 'ca', 'ab', 'inheritance', 'top@50', 'bottom@10'),
  edge('e13', 'fa', 'ab', 'inheritance', 'top@25', 'bottom@70'),
  edge('e14', 'ra', 'ab', 'inheritance', 'top@25', 'bottom@95'),
]

const py = `from __future__ import annotations
import json
import os
import queue
import sys
import threading
import traceback
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import IntEnum
from typing import Callable, Dict, List, Optional, TextIO


class LogLevel(IntEnum):
    DEBUG = 10
    INFO = 20
    WARN = 30
    ERROR = 40
    FATAL = 50


@dataclass(frozen=True)
class LogRecord:
    timestamp: float
    level: LogLevel
    logger_name: str
    message: str
    thread: str
    error: Optional[str] = None


# ---- Formatters -----------------------------------------------------------
class Formatter(ABC):
    @abstractmethod
    def format(self, r: LogRecord) -> str: ...


def _iso(ts: float) -> str:
    return datetime.fromtimestamp(ts, timezone.utc).isoformat(timespec="milliseconds")


class PatternFormatter(Formatter):
    def format(self, r: LogRecord) -> str:
        line = f"{_iso(r.timestamp)} [{r.level.name:<5}] [{r.thread}] {r.logger_name} - {r.message}"
        return line + ("\\n" + r.error if r.error else "")


class JsonFormatter(Formatter):
    def format(self, r: LogRecord) -> str:
        return json.dumps({"ts": _iso(r.timestamp), "level": r.level.name, "logger": r.logger_name,
                           "thread": r.thread, "msg": r.message, "error": r.error})


# ---- Filters --------------------------------------------------------------
class LogFilter(ABC):
    @abstractmethod
    def accept(self, r: LogRecord) -> bool: ...


class LevelFilter(LogFilter):
    def __init__(self, minimum: LogLevel):
        self._min = minimum

    def accept(self, r: LogRecord) -> bool:
        return r.level >= self._min


# ---- Appenders ------------------------------------------------------------
class Appender(ABC):
    @abstractmethod
    def append(self, r: LogRecord) -> None: ...

    @abstractmethod
    def close(self) -> None: ...


class AbstractAppender(Appender):
    """Template Method: filter -> format -> (locked) write. Subclasses implement _write only."""

    def __init__(self, formatter: Optional[Formatter] = None, filters: Optional[List[LogFilter]] = None):
        self._formatter = formatter or PatternFormatter()
        self._filters = list(filters or [])
        self._lock = threading.Lock()

    def append(self, r: LogRecord) -> None:
        if not all(f.accept(r) for f in self._filters):
            return
        line = self._formatter.format(r)
        with self._lock:
            self._write(line)

    @abstractmethod
    def _write(self, line: str) -> None: ...

    def close(self) -> None:
        pass


class ConsoleAppender(AbstractAppender):
    def __init__(self, stream: TextIO = sys.stdout, **kw):
        super().__init__(**kw)
        self._stream = stream

    def _write(self, line: str) -> None:
        self._stream.write(line + "\\n")
        self._stream.flush()


class FileAppender(AbstractAppender):
    """Size-based rotation: app.log -> app.log.1 -> app.log.2 ... (oldest dropped)."""

    def __init__(self, path: str, max_bytes: int = 10 * 1024 * 1024, backups: int = 5, **kw):
        super().__init__(**kw)
        self._path, self._max, self._backups = path, max_bytes, backups
        self._open()

    def _open(self) -> None:
        self._fh = open(self._path, "a", encoding="utf-8")
        self._size = os.path.getsize(self._path)

    def _write(self, line: str) -> None:
        n = len((line + "\\n").encode("utf-8"))
        if self._size > 0 and self._size + n > self._max:
            self._rotate()
        self._fh.write(line + "\\n")
        self._fh.flush()
        self._size += n

    def _rotate(self) -> None:
        self._fh.close()
        if self._backups > 0:
            for i in range(self._backups - 1, 0, -1):
                src = f"{self._path}.{i}"
                if os.path.exists(src):
                    os.replace(src, f"{self._path}.{i + 1}")
            os.replace(self._path, f"{self._path}.1")
        else:
            os.remove(self._path)
        self._open()

    def close(self) -> None:
        with self._lock:
            self._fh.close()


class RemoteAppender(AbstractAppender):
    """Ships lines through an injected transport (HTTP, syslog, Kafka...). Failures never reach the app."""

    def __init__(self, transport: Callable[[str], None], **kw):
        super().__init__(**kw)
        self._transport = transport
        self.failures = 0

    def _write(self, line: str) -> None:
        try:
            self._transport(line)
        except Exception:
            self.failures += 1


class AsyncAppender(Appender):
    """Decorator: callers enqueue and return; a worker thread drains into the delegate."""

    _STOP = object()

    def __init__(self, delegate: Appender, capacity: int = 10_000):
        self._delegate = delegate
        self._q: "queue.Queue[object]" = queue.Queue(maxsize=capacity)
        self.dropped = 0
        self._closed = False
        self._worker = threading.Thread(target=self._run, name="log-async", daemon=True)
        self._worker.start()

    def append(self, r: LogRecord) -> None:
        if self._closed:
            return
        try:
            self._q.put_nowait(r)  # never block the application thread
        except queue.Full:
            self.dropped += 1

    def _run(self) -> None:
        while True:
            item = self._q.get()
            if item is self._STOP:
                return
            try:
                self._delegate.append(item)  # type: ignore[arg-type]
            except Exception:
                traceback.print_exc()

    def close(self) -> None:
        if self._closed:
            return
        self._closed = True
        self._q.put(self._STOP)  # FIFO: everything queued before close() is flushed first
        self._worker.join()
        self._delegate.close()


# ---- Logger + manager -------------------------------------------------------
class Logger:
    def __init__(self, name: str, parent: Optional["Logger"] = None):
        self.name, self.parent = name, parent
        self.additive = True
        self._level: Optional[LogLevel] = None
        self._appenders: List[Appender] = []
        self._lock = threading.Lock()

    def set_level(self, level: Optional[LogLevel]) -> None:
        self._level = level

    def add_appender(self, a: Appender) -> None:
        with self._lock:
            self._appenders.append(a)

    @property
    def effective_level(self) -> LogLevel:
        lg: Optional[Logger] = self
        while lg is not None:
            if lg._level is not None:
                return lg._level
            lg = lg.parent
        return LogLevel.INFO

    def is_enabled(self, level: LogLevel) -> bool:
        return level >= self.effective_level

    def log(self, level: LogLevel, message: str, error: Optional[BaseException] = None) -> None:
        if not self.is_enabled(level):
            return  # cheap early exit: no record allocated
        err = "".join(traceback.format_exception(error)).rstrip() if error else None
        rec = LogRecord(datetime.now(timezone.utc).timestamp(), level, self.name, message,
                        threading.current_thread().name, err)
        lg: Optional[Logger] = self
        while lg is not None:
            with lg._lock:
                appenders = list(lg._appenders)
            for a in appenders:
                try:
                    a.append(rec)
                except Exception:
                    traceback.print_exc()  # a broken sink must not break the app
            if not lg.additive:
                break
            lg = lg.parent

    def debug(self, m: str) -> None: self.log(LogLevel.DEBUG, m)
    def info(self, m: str) -> None: self.log(LogLevel.INFO, m)
    def warn(self, m: str) -> None: self.log(LogLevel.WARN, m)
    def error(self, m: str, e: Optional[BaseException] = None) -> None: self.log(LogLevel.ERROR, m, e)
    def fatal(self, m: str, e: Optional[BaseException] = None) -> None: self.log(LogLevel.FATAL, m, e)


class LogManager:
    _instance: Optional["LogManager"] = None
    _guard = threading.Lock()

    def __init__(self):
        self._lock = threading.RLock()
        self.root = Logger("root")
        self.root.set_level(LogLevel.INFO)
        self._loggers: Dict[str, Logger] = {"root": self.root}

    @classmethod
    def instance(cls) -> "LogManager":
        with cls._guard:
            if cls._instance is None:
                cls._instance = LogManager()
            return cls._instance

    def get_logger(self, name: str) -> Logger:
        with self._lock:
            lg = self._loggers.get(name)
            if lg is None:
                parent = self.root if "." not in name else self.get_logger(name.rsplit(".", 1)[0])
                lg = self._loggers[name] = Logger(name, parent)
            return lg

    def shutdown(self) -> None:
        with self._lock:
            seen = {}
            for lg in self._loggers.values():
                for a in lg._appenders:
                    seen[id(a)] = a
        for a in seen.values():
            a.close()


def demo() -> None:
    mgr = LogManager.instance()
    mgr.root.add_appender(ConsoleAppender(filters=[LevelFilter(LogLevel.INFO)]))
    mgr.root.add_appender(AsyncAppender(FileAppender("app.log", 1_000_000, 3, formatter=JsonFormatter())))
    mgr.get_logger("com.shop").set_level(LogLevel.DEBUG)       # children inherit DEBUG
    orders = mgr.get_logger("com.shop.orders")
    orders.debug("cart loaded")                                 # file only (console filter = INFO)
    orders.info("order placed")                                 # console + file
    mgr.get_logger("com.other").debug("dropped")                # root level INFO -> disabled
    mgr.shutdown()


if __name__ == "__main__":
    demo()
`

const java = `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

enum LogLevel {
  DEBUG, INFO, WARN, ERROR, FATAL;
  boolean atLeast(LogLevel other) { return compareTo(other) >= 0; }
}

record LogRecord(Instant timestamp, LogLevel level, String loggerName, String message,
                 String thread, Throwable error) {}

interface LogFormatter { String format(LogRecord r); }
interface LogFilter { boolean accept(LogRecord r); }

class PatternFormatter implements LogFormatter {
  public String format(LogRecord r) {
    String line = String.format("%s [%-5s] [%s] %s - %s",
        r.timestamp(), r.level(), r.thread(), r.loggerName(), r.message());
    if (r.error() == null) return line;
    StringWriter sw = new StringWriter();
    r.error().printStackTrace(new PrintWriter(sw));
    return line + "\\n" + sw.toString().stripTrailing();
  }
}

class JsonFormatter implements LogFormatter {
  public String format(LogRecord r) {
    return "{\\"ts\\":\\"" + r.timestamp() + "\\",\\"level\\":\\"" + r.level() + "\\",\\"logger\\":\\""
        + esc(r.loggerName()) + "\\",\\"thread\\":\\"" + esc(r.thread()) + "\\",\\"msg\\":\\""
        + esc(r.message()) + "\\"" + (r.error() != null ? ",\\"error\\":\\"" + esc(r.error().toString()) + "\\"" : "") + "}";
  }
  private static String esc(String s) {
    return s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n");
  }
}

class LevelFilter implements LogFilter {
  private final LogLevel min;
  LevelFilter(LogLevel min) { this.min = min; }
  public boolean accept(LogRecord r) { return r.level().atLeast(min); }
}

interface Appender {
  void append(LogRecord r);
  void close();
}

/** Template Method: filter -> format -> (locked) write. */
abstract class AbstractAppender implements Appender {
  protected final LogFormatter formatter;
  protected final List<LogFilter> filters;
  private final Object lock = new Object();

  protected AbstractAppender(LogFormatter formatter, List<LogFilter> filters) {
    this.formatter = formatter != null ? formatter : new PatternFormatter();
    this.filters = filters != null ? List.copyOf(filters) : List.of();
  }

  public void append(LogRecord r) {
    for (LogFilter f : filters) if (!f.accept(r)) return;
    String line = formatter.format(r);
    synchronized (lock) {
      try { write(line); } catch (IOException e) { System.err.println("appender failure: " + e); }
    }
  }

  protected abstract void write(String line) throws IOException;
  public void close() {}
}

class ConsoleAppender extends AbstractAppender {
  private final PrintStream out;
  ConsoleAppender(PrintStream out, LogFormatter f, List<LogFilter> filters) { super(f, filters); this.out = out; }
  protected void write(String line) { out.println(line); out.flush(); }
}

/** Size-based rotation: app.log -> app.log.1 -> app.log.2 ... (oldest dropped). */
class FileAppender extends AbstractAppender {
  private final Path path;
  private final long maxBytes;
  private final int backups;
  private BufferedWriter out;
  private long size;

  FileAppender(Path path, long maxBytes, int backups, LogFormatter f, List<LogFilter> filters) throws IOException {
    super(f, filters);
    this.path = path; this.maxBytes = maxBytes; this.backups = backups;
    open();
  }

  private void open() throws IOException {
    out = Files.newBufferedWriter(path, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    size = Files.size(path);
  }

  protected void write(String line) throws IOException {
    long n = line.getBytes(StandardCharsets.UTF_8).length + 1;
    if (size > 0 && size + n > maxBytes) rotate();
    out.write(line); out.write('\\n'); out.flush();
    size += n;
  }

  private void rotate() throws IOException {
    out.close();
    if (backups > 0) {
      for (int i = backups - 1; i >= 1; i--) {
        Path src = Paths.get(path + "." + i);
        if (Files.exists(src)) Files.move(src, Paths.get(path + "." + (i + 1)), StandardCopyOption.REPLACE_EXISTING);
      }
      Files.move(path, Paths.get(path + ".1"), StandardCopyOption.REPLACE_EXISTING);
    } else Files.delete(path);
    open();
  }

  public void close() {
    try { synchronized (this) { out.close(); } } catch (IOException ignored) {}
  }
}

/** Ships lines through an injected transport; failures never reach the application. */
class RemoteAppender extends AbstractAppender {
  interface Transport { void send(String line) throws Exception; }
  private final Transport transport;
  final AtomicLong failures = new AtomicLong();
  RemoteAppender(Transport t, LogFormatter f, List<LogFilter> filters) { super(f, filters); this.transport = t; }
  protected void write(String line) {
    try { transport.send(line); } catch (Exception e) { failures.incrementAndGet(); }
  }
}

/** Decorator: callers enqueue and return; a worker thread drains into the delegate. */
class AsyncAppender implements Appender {
  private static final LogRecord STOP = new LogRecord(Instant.EPOCH, LogLevel.DEBUG, "", "", "", null);
  private final Appender delegate;
  private final BlockingQueue<LogRecord> queue;
  private final Thread worker;
  private volatile boolean closed;
  final AtomicLong dropped = new AtomicLong();

  AsyncAppender(Appender delegate, int capacity) {
    this.delegate = delegate;
    this.queue = new ArrayBlockingQueue<>(capacity);
    this.worker = new Thread(this::run, "log-async");
    this.worker.setDaemon(true);
    this.worker.start();
  }

  public void append(LogRecord r) {
    if (closed) return;
    if (!queue.offer(r)) dropped.incrementAndGet();      // never block the application thread
  }

  private void run() {
    try {
      for (LogRecord r = queue.take(); r != STOP; r = queue.take()) {
        try { delegate.append(r); } catch (RuntimeException e) { e.printStackTrace(); }
      }
    } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
  }

  public void close() {
    if (closed) return;
    closed = true;
    try {
      queue.put(STOP);                                   // FIFO: everything queued earlier is flushed first
      worker.join();
    } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    delegate.close();
  }
}

class Logger {
  private final String name;
  private final Logger parent;
  private volatile LogLevel level;                       // null = inherit
  private volatile boolean additive = true;
  private final List<Appender> appenders = new CopyOnWriteArrayList<>();

  Logger(String name, Logger parent) { this.name = name; this.parent = parent; }

  void setLevel(LogLevel level) { this.level = level; }
  void setAdditive(boolean a) { this.additive = a; }
  void addAppender(Appender a) { appenders.add(a); }
  List<Appender> appenders() { return appenders; }

  LogLevel effectiveLevel() {
    for (Logger l = this; l != null; l = l.parent) if (l.level != null) return l.level;
    return LogLevel.INFO;
  }

  boolean isEnabled(LogLevel lv) { return lv.atLeast(effectiveLevel()); }

  void log(LogLevel lv, String msg, Throwable err) {
    if (!isEnabled(lv)) return;                          // cheap early exit
    LogRecord rec = new LogRecord(Instant.now(), lv, name, msg, Thread.currentThread().getName(), err);
    for (Logger l = this; l != null; l = l.parent) {
      for (Appender a : l.appenders) {
        try { a.append(rec); } catch (RuntimeException e) { e.printStackTrace(); }
      }
      if (!l.additive) break;
    }
  }

  void debug(String m) { log(LogLevel.DEBUG, m, null); }
  void info(String m) { log(LogLevel.INFO, m, null); }
  void warn(String m) { log(LogLevel.WARN, m, null); }
  void error(String m, Throwable t) { log(LogLevel.ERROR, m, t); }
  void fatal(String m, Throwable t) { log(LogLevel.FATAL, m, t); }
}

final class LogManager {
  private static final LogManager INSTANCE = new LogManager();
  static LogManager getInstance() { return INSTANCE; }

  private final Map<String, Logger> loggers = new HashMap<>();
  final Logger root = new Logger("root", null);

  private LogManager() { root.setLevel(LogLevel.INFO); loggers.put("root", root); }

  synchronized Logger getLogger(String name) {
    Logger lg = loggers.get(name);
    if (lg == null) {
      int dot = name.lastIndexOf('.');
      Logger parent = dot < 0 ? root : getLogger(name.substring(0, dot));
      lg = new Logger(name, parent);
      loggers.put(name, lg);
    }
    return lg;
  }

  synchronized void shutdown() {
    Set<Appender> seen = Collections.newSetFromMap(new IdentityHashMap<>());
    for (Logger l : loggers.values()) seen.addAll(l.appenders());
    seen.forEach(Appender::close);
  }
}

public class Main {
  public static void main(String[] args) throws Exception {
    LogManager mgr = LogManager.getInstance();
    mgr.root.addAppender(new ConsoleAppender(System.out, null, List.of(new LevelFilter(LogLevel.INFO))));
    mgr.root.addAppender(new AsyncAppender(
        new FileAppender(Paths.get("app.log"), 1_000_000, 3, new JsonFormatter(), null), 10_000));
    mgr.getLogger("com.shop").setLevel(LogLevel.DEBUG);       // children inherit DEBUG
    Logger orders = mgr.getLogger("com.shop.orders");
    orders.debug("cart loaded");                              // file only
    orders.info("order placed");                              // console + file
    mgr.getLogger("com.other").debug("dropped");              // root = INFO
    mgr.shutdown();
  }
}
`

const ts = `import { appendFileSync, existsSync, renameSync, rmSync, statSync } from 'node:fs'

export enum LogLevel { DEBUG = 10, INFO = 20, WARN = 30, ERROR = 40, FATAL = 50 }

export interface LogRecord {
  readonly timestamp: Date
  readonly level: LogLevel
  readonly loggerName: string
  readonly message: string
  readonly error?: Error
}

export interface Formatter { format(r: LogRecord): string }
export interface LogFilter { accept(r: LogRecord): boolean }

export class PatternFormatter implements Formatter {
  format(r: LogRecord): string {
    const line = r.timestamp.toISOString() + ' [' + LogLevel[r.level].padEnd(5) + '] ' + r.loggerName + ' - ' + r.message
    return r.error ? line + '\\n' + (r.error.stack ?? r.error.message) : line
  }
}

export class JsonFormatter implements Formatter {
  format(r: LogRecord): string {
    return JSON.stringify({
      ts: r.timestamp.toISOString(), level: LogLevel[r.level], logger: r.loggerName,
      msg: r.message, error: r.error?.message,
    })
  }
}

export class LevelFilter implements LogFilter {
  constructor(private min: LogLevel) {}
  accept(r: LogRecord): boolean { return r.level >= this.min }
}

export interface Appender {
  append(r: LogRecord): void
  close(): void
}

/** Template Method: filter -> format -> write. Subclasses implement write() only. */
export abstract class AbstractAppender implements Appender {
  constructor(
    protected formatter: Formatter = new PatternFormatter(),
    protected filters: LogFilter[] = [],
  ) {}

  append(r: LogRecord): void {
    if (!this.filters.every(f => f.accept(r))) return
    this.write(this.formatter.format(r))
  }

  protected abstract write(line: string): void
  close(): void {}
}

export class ConsoleAppender extends AbstractAppender {
  protected write(line: string): void { console.log(line) }
}

/** Size-based rotation: app.log -> app.log.1 -> app.log.2 ... (oldest dropped). */
export class FileAppender extends AbstractAppender {
  private size: number

  constructor(
    private path: string,
    private maxBytes = 10 * 1024 * 1024,
    private backups = 5,
    formatter?: Formatter,
    filters?: LogFilter[],
  ) {
    super(formatter, filters)
    this.size = existsSync(path) ? statSync(path).size : 0
  }

  protected write(line: string): void {
    const data = line + '\\n'
    const n = Buffer.byteLength(data)
    if (this.size > 0 && this.size + n > this.maxBytes) this.rotate()
    appendFileSync(this.path, data)
    this.size += n
  }

  private rotate(): void {
    if (this.backups > 0) {
      for (let i = this.backups - 1; i >= 1; i--) {
        const src = this.path + '.' + i
        if (existsSync(src)) renameSync(src, this.path + '.' + (i + 1))
      }
      renameSync(this.path, this.path + '.1')
    } else rmSync(this.path)
    this.size = 0
  }
}

/** Ships lines through an injected transport; failures never reach the application. */
export class RemoteAppender extends AbstractAppender {
  failures = 0
  constructor(private transport: (line: string) => void, formatter?: Formatter, filters?: LogFilter[]) {
    super(formatter, filters)
  }
  protected write(line: string): void {
    try { this.transport(line) } catch { this.failures++ }
  }
}

/** Decorator: callers enqueue and return; a drain task writes into the delegate. */
export class AsyncAppender implements Appender {
  private queue: LogRecord[] = []
  private scheduled = false
  private closed = false
  dropped = 0

  constructor(private delegate: Appender, private capacity = 10_000) {}

  append(r: LogRecord): void {
    if (this.closed) return
    if (this.queue.length >= this.capacity) { this.dropped++; return } // never block the caller
    this.queue.push(r)
    if (!this.scheduled) {
      this.scheduled = true
      setImmediate(() => this.drain())
    }
  }

  private drain(): void {
    this.scheduled = false
    for (let r = this.queue.shift(); r; r = this.queue.shift()) {
      try { this.delegate.append(r) } catch (e) { console.error('appender failure', e) }
    }
  }

  close(): void {
    if (this.closed) return
    this.closed = true
    this.drain() // flush everything queued so far
    this.delegate.close()
  }
}

export class Logger {
  private level: LogLevel | null = null // null = inherit
  additive = true
  readonly appenders: Appender[] = []

  constructor(readonly name: string, private parent: Logger | null = null) {}

  setLevel(level: LogLevel | null): void { this.level = level }
  addAppender(a: Appender): void { this.appenders.push(a) }

  get effectiveLevel(): LogLevel {
    for (let l: Logger | null = this; l; l = l.parent) if (l.level !== null) return l.level
    return LogLevel.INFO
  }

  isEnabled(level: LogLevel): boolean { return level >= this.effectiveLevel }

  log(level: LogLevel, message: string, error?: Error): void {
    if (!this.isEnabled(level)) return // cheap early exit
    const rec: LogRecord = { timestamp: new Date(), level, loggerName: this.name, message, error }
    for (let l: Logger | null = this; l; l = l.parent) {
      for (const a of l.appenders) {
        try { a.append(rec) } catch (e) { console.error('appender failure', e) }
      }
      if (!l.additive) break
    }
  }

  debug(m: string) { this.log(LogLevel.DEBUG, m) }
  info(m: string) { this.log(LogLevel.INFO, m) }
  warn(m: string) { this.log(LogLevel.WARN, m) }
  error(m: string, e?: Error) { this.log(LogLevel.ERROR, m, e) }
  fatal(m: string, e?: Error) { this.log(LogLevel.FATAL, m, e) }
}

export class LogManager {
  private static instance: LogManager | null = null
  static getInstance(): LogManager { return (LogManager.instance ??= new LogManager()) }

  readonly root = new Logger('root')
  private loggers = new Map<string, Logger>()

  private constructor() {
    this.root.setLevel(LogLevel.INFO)
    this.loggers.set('root', this.root)
  }

  getLogger(name: string): Logger {
    let lg = this.loggers.get(name)
    if (!lg) {
      const dot = name.lastIndexOf('.')
      const parent = dot < 0 ? this.root : this.getLogger(name.slice(0, dot))
      lg = new Logger(name, parent)
      this.loggers.set(name, lg)
    }
    return lg
  }

  shutdown(): void {
    const seen = new Set<Appender>()
    for (const l of this.loggers.values()) l.appenders.forEach(a => seen.add(a))
    seen.forEach(a => a.close())
  }
}
`

const cpp = `#include <atomic>
#include <chrono>
#include <condition_variable>
#include <ctime>
#include <deque>
#include <filesystem>
#include <fstream>
#include <functional>
#include <iostream>
#include <map>
#include <memory>
#include <mutex>
#include <optional>
#include <set>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

namespace fs = std::filesystem;

enum class LogLevel { Debug = 10, Info = 20, Warn = 30, Error = 40, Fatal = 50 };

inline const char* levelName(LogLevel l) {
  switch (l) {
    case LogLevel::Debug: return "DEBUG";
    case LogLevel::Info: return "INFO";
    case LogLevel::Warn: return "WARN";
    case LogLevel::Error: return "ERROR";
    default: return "FATAL";
  }
}

struct LogRecord {
  std::chrono::system_clock::time_point timestamp;
  LogLevel level;
  std::string loggerName, message;
  std::thread::id thread;
};

class Formatter {
public:
  virtual ~Formatter() = default;
  virtual std::string format(const LogRecord& r) const = 0;
};

inline std::string isoTime(const std::chrono::system_clock::time_point& tp) {
  std::time_t t = std::chrono::system_clock::to_time_t(tp);
  char buf[32];
  std::strftime(buf, sizeof buf, "%Y-%m-%dT%H:%M:%SZ", std::gmtime(&t));  // callers hold the appender lock
  return buf;
}

class PatternFormatter : public Formatter {
public:
  std::string format(const LogRecord& r) const override {
    std::ostringstream os;
    os << isoTime(r.timestamp) << " [" << levelName(r.level) << "] [" << r.thread << "] "
       << r.loggerName << " - " << r.message;
    return os.str();
  }
};

class JsonFormatter : public Formatter {
  static std::string esc(const std::string& s) {
    std::string o;
    for (char c : s) {
      if (c == '"' || c == '\\\\') { o += '\\\\'; o += c; }
      else if (c == '\\n') o += "\\\\n";
      else o += c;
    }
    return o;
  }
public:
  std::string format(const LogRecord& r) const override {
    return "{\\"ts\\":\\"" + isoTime(r.timestamp) + "\\",\\"level\\":\\"" + levelName(r.level) +
           "\\",\\"logger\\":\\"" + esc(r.loggerName) + "\\",\\"msg\\":\\"" + esc(r.message) + "\\"}";
  }
};

using LogFilter = std::function<bool(const LogRecord&)>;
inline LogFilter levelFilter(LogLevel min) {
  return [min](const LogRecord& r) { return static_cast<int>(r.level) >= static_cast<int>(min); };
}

class Appender {
public:
  virtual ~Appender() = default;
  virtual void append(const LogRecord& r) = 0;
  virtual void close() {}
};

// Template Method: filter -> (locked) format + write.
class AbstractAppender : public Appender {
public:
  AbstractAppender(std::shared_ptr<Formatter> f = nullptr, std::vector<LogFilter> filters = {})
    : formatter_(f ? std::move(f) : std::make_shared<PatternFormatter>()), filters_(std::move(filters)) {}

  void append(const LogRecord& r) override {
    for (auto& f : filters_) if (!f(r)) return;
    std::lock_guard<std::mutex> lock(mu_);
    write(formatter_->format(r));
  }
protected:
  virtual void write(const std::string& line) = 0;
  std::mutex mu_;
private:
  std::shared_ptr<Formatter> formatter_;
  std::vector<LogFilter> filters_;
};

class ConsoleAppender : public AbstractAppender {
  std::ostream& out_;
public:
  explicit ConsoleAppender(std::ostream& out = std::cout, std::shared_ptr<Formatter> f = nullptr,
                           std::vector<LogFilter> filters = {})
    : AbstractAppender(std::move(f), std::move(filters)), out_(out) {}
protected:
  void write(const std::string& line) override { out_ << line << std::endl; }
};

// Size-based rotation: app.log -> app.log.1 -> app.log.2 ... (oldest dropped).
class FileAppender : public AbstractAppender {
  fs::path path_;
  std::uintmax_t maxBytes_, size_ = 0;
  int backups_;
  std::ofstream out_;

  void open() {
    out_.open(path_, std::ios::app);
    size_ = fs::exists(path_) ? fs::file_size(path_) : 0;
  }
  void rotate() {
    out_.close();
    if (backups_ > 0) {
      for (int i = backups_ - 1; i >= 1; --i) {
        fs::path src = path_.string() + "." + std::to_string(i);
        if (fs::exists(src)) fs::rename(src, path_.string() + "." + std::to_string(i + 1));
      }
      fs::rename(path_, path_.string() + ".1");
    } else fs::remove(path_);
    open();
  }
public:
  FileAppender(fs::path path, std::uintmax_t maxBytes = 10u * 1024 * 1024, int backups = 5,
               std::shared_ptr<Formatter> f = nullptr, std::vector<LogFilter> filters = {})
    : AbstractAppender(std::move(f), std::move(filters)), path_(std::move(path)),
      maxBytes_(maxBytes), backups_(backups) { open(); }
  void close() override { std::lock_guard<std::mutex> lock(mu_); out_.close(); }
protected:
  void write(const std::string& line) override {
    std::uintmax_t n = line.size() + 1;
    if (size_ > 0 && size_ + n > maxBytes_) rotate();
    out_ << line << '\\n';
    out_.flush();
    size_ += n;
  }
};

// Ships lines through an injected transport; failures never reach the application.
class RemoteAppender : public AbstractAppender {
  std::function<void(const std::string&)> transport_;
public:
  std::atomic<long> failures{0};
  explicit RemoteAppender(std::function<void(const std::string&)> t, std::shared_ptr<Formatter> f = nullptr,
                          std::vector<LogFilter> filters = {})
    : AbstractAppender(std::move(f), std::move(filters)), transport_(std::move(t)) {}
protected:
  void write(const std::string& line) override {
    try { transport_(line); } catch (...) { ++failures; }
  }
};

// Decorator: callers enqueue and return; a worker thread drains into the delegate.
class AsyncAppender : public Appender {
  std::shared_ptr<Appender> delegate_;
  std::deque<LogRecord> q_;
  size_t capacity_;
  std::mutex mu_;
  std::condition_variable cv_;
  bool stop_ = false;
  std::thread worker_;

  void run() {
    for (;;) {
      std::unique_lock<std::mutex> lk(mu_);
      cv_.wait(lk, [&] { return stop_ || !q_.empty(); });
      if (q_.empty() && stop_) return;           // drained everything queued before close()
      LogRecord r = std::move(q_.front());
      q_.pop_front();
      lk.unlock();
      try { delegate_->append(r); } catch (...) {}
    }
  }
public:
  std::atomic<long> dropped{0};
  explicit AsyncAppender(std::shared_ptr<Appender> delegate, size_t capacity = 10000)
    : delegate_(std::move(delegate)), capacity_(capacity), worker_([this] { run(); }) {}
  ~AsyncAppender() override { close(); }

  void append(const LogRecord& r) override {
    {
      std::lock_guard<std::mutex> lk(mu_);
      if (stop_) return;
      if (q_.size() >= capacity_) { ++dropped; return; }   // never block the application thread
      q_.push_back(r);
    }
    cv_.notify_one();
  }

  void close() override {
    {
      std::lock_guard<std::mutex> lk(mu_);
      if (stop_) return;
      stop_ = true;
    }
    cv_.notify_all();
    worker_.join();
    delegate_->close();
  }
};

class Logger {
  std::string name_;
  std::shared_ptr<Logger> parent_;
  std::optional<LogLevel> level_;      // nullopt = inherit
  bool additive_ = true;
  std::vector<std::shared_ptr<Appender>> appenders_;
  mutable std::mutex mu_;
public:
  Logger(std::string name, std::shared_ptr<Logger> parent) : name_(std::move(name)), parent_(std::move(parent)) {}

  void setLevel(std::optional<LogLevel> l) { std::lock_guard<std::mutex> g(mu_); level_ = l; }
  void setAdditive(bool a) { additive_ = a; }
  void addAppender(std::shared_ptr<Appender> a) { std::lock_guard<std::mutex> g(mu_); appenders_.push_back(std::move(a)); }
  std::vector<std::shared_ptr<Appender>> appenders() const { std::lock_guard<std::mutex> g(mu_); return appenders_; }

  LogLevel effectiveLevel() const {
    for (const Logger* l = this; l; l = l->parent_.get()) {
      std::lock_guard<std::mutex> g(l->mu_);
      if (l->level_) return *l->level_;
    }
    return LogLevel::Info;
  }
  bool isEnabled(LogLevel lv) const { return static_cast<int>(lv) >= static_cast<int>(effectiveLevel()); }

  void log(LogLevel lv, const std::string& msg) {
    if (!isEnabled(lv)) return;           // cheap early exit
    LogRecord rec{std::chrono::system_clock::now(), lv, name_, msg, std::this_thread::get_id()};
    for (const Logger* l = this; l; l = l->parent_.get()) {
      for (auto& a : l->appenders()) {
        try { a->append(rec); } catch (...) {}
      }
      if (!l->additive_) break;
    }
  }
  void debug(const std::string& m) { log(LogLevel::Debug, m); }
  void info(const std::string& m) { log(LogLevel::Info, m); }
  void warn(const std::string& m) { log(LogLevel::Warn, m); }
  void error(const std::string& m) { log(LogLevel::Error, m); }
  void fatal(const std::string& m) { log(LogLevel::Fatal, m); }
};

class LogManager {
  std::map<std::string, std::shared_ptr<Logger>> loggers_;
  std::mutex mu_;
  LogManager() : root(std::make_shared<Logger>("root", nullptr)) {
    root->setLevel(LogLevel::Info);
    loggers_["root"] = root;
  }
  std::shared_ptr<Logger> getLocked(const std::string& name) {
    auto it = loggers_.find(name);
    if (it != loggers_.end()) return it->second;
    auto dot = name.rfind('.');
    auto parent = dot == std::string::npos ? root : getLocked(name.substr(0, dot));
    return loggers_[name] = std::make_shared<Logger>(name, parent);
  }
public:
  std::shared_ptr<Logger> root;
  static LogManager& instance() { static LogManager m; return m; }   // thread-safe since C++11

  std::shared_ptr<Logger> getLogger(const std::string& name) {
    std::lock_guard<std::mutex> g(mu_);
    return getLocked(name);
  }

  void shutdown() {
    std::set<std::shared_ptr<Appender>> seen;
    {
      std::lock_guard<std::mutex> g(mu_);
      for (auto& [_, l] : loggers_) for (auto& a : l->appenders()) seen.insert(a);
    }
    for (auto& a : seen) a->close();
  }
};

int main() {
  auto& mgr = LogManager::instance();
  mgr.root->addAppender(std::make_shared<ConsoleAppender>(std::cout, nullptr, std::vector<LogFilter>{levelFilter(LogLevel::Info)}));
  mgr.root->addAppender(std::make_shared<AsyncAppender>(
      std::make_shared<FileAppender>("app.log", 1000000, 3, std::make_shared<JsonFormatter>())));
  mgr.getLogger("com.shop")->setLevel(LogLevel::Debug);       // children inherit DEBUG
  auto orders = mgr.getLogger("com.shop.orders");
  orders->debug("cart loaded");                               // file only
  orders->info("order placed");                               // console + file
  mgr.getLogger("com.other")->debug("dropped");               // root = INFO
  mgr.shutdown();
}
`

const goCode = `package main

import (
  "encoding/json"
  "fmt"
  "io"
  "os"
  "strings"
  "sync"
  "sync/atomic"
  "time"
)

type Level int

const (
  Debug Level = 10
  Info  Level = 20
  Warn  Level = 30
  Error Level = 40
  Fatal Level = 50
)

func (l Level) String() string {
  switch l {
  case Debug:
    return "DEBUG"
  case Info:
    return "INFO"
  case Warn:
    return "WARN"
  case Error:
    return "ERROR"
  }
  return "FATAL"
}

type Record struct {
  Time    time.Time
  Level   Level
  Logger  string
  Message string
  Err     error
}

type Formatter interface{ Format(r Record) string }
type Filter interface{ Accept(r Record) bool }

type PatternFormatter struct{}

func (PatternFormatter) Format(r Record) string {
  line := fmt.Sprintf("%s [%-5s] %s - %s", r.Time.UTC().Format(time.RFC3339Nano), r.Level, r.Logger, r.Message)
  if r.Err != nil {
    line += "\\n" + r.Err.Error()
  }
  return line
}

type JSONFormatter struct{}

func (JSONFormatter) Format(r Record) string {
  m := map[string]string{"ts": r.Time.UTC().Format(time.RFC3339Nano), "level": r.Level.String(),
    "logger": r.Logger, "msg": r.Message}
  if r.Err != nil {
    m["error"] = r.Err.Error()
  }
  b, _ := json.Marshal(m)
  return string(b)
}

type LevelFilter struct{ Min Level }

func (f LevelFilter) Accept(r Record) bool { return r.Level >= f.Min }

type Appender interface {
  Append(r Record)
  Close() error
}

// base implements the Template Method: filter -> format -> (locked) write.
type base struct {
  mu        sync.Mutex
  formatter Formatter
  filters   []Filter
  write     func(line string) error
}

func (b *base) Append(r Record) {
  for _, f := range b.filters {
    if !f.Accept(r) {
      return
    }
  }
  line := b.formatter.Format(r)
  b.mu.Lock()
  defer b.mu.Unlock()
  if err := b.write(line); err != nil {
    fmt.Fprintln(os.Stderr, "appender failure:", err)
  }
}

func newBase(f Formatter, filters []Filter) *base {
  if f == nil {
    f = PatternFormatter{}
  }
  return &base{formatter: f, filters: filters}
}

// ConsoleAppender writes to any io.Writer (stdout by default).
type ConsoleAppender struct{ *base }

func NewConsoleAppender(w io.Writer, f Formatter, filters ...Filter) *ConsoleAppender {
  a := &ConsoleAppender{newBase(f, filters)}
  a.write = func(line string) error { _, err := fmt.Fprintln(w, line); return err }
  return a
}
func (a *ConsoleAppender) Close() error { return nil }

// FileAppender rotates by size: app.log -> app.log.1 -> app.log.2 ... (oldest dropped).
type FileAppender struct {
  *base
  path     string
  maxBytes int64
  backups  int
  file     *os.File
  size     int64
}

func NewFileAppender(path string, maxBytes int64, backups int, f Formatter, filters ...Filter) (*FileAppender, error) {
  a := &FileAppender{base: newBase(f, filters), path: path, maxBytes: maxBytes, backups: backups}
  if err := a.open(); err != nil {
    return nil, err
  }
  a.write = a.writeLine
  return a, nil
}

func (a *FileAppender) open() error {
  f, err := os.OpenFile(a.path, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
  if err != nil {
    return err
  }
  st, err := f.Stat()
  if err != nil {
    return err
  }
  a.file, a.size = f, st.Size()
  return nil
}

func (a *FileAppender) writeLine(line string) error {
  n := int64(len(line) + 1)
  if a.size > 0 && a.size+n > a.maxBytes {
    if err := a.rotate(); err != nil {
      return err
    }
  }
  if _, err := a.file.WriteString(line + "\\n"); err != nil {
    return err
  }
  a.size += n
  return nil
}

func (a *FileAppender) rotate() error {
  a.file.Close()
  if a.backups > 0 {
    for i := a.backups - 1; i >= 1; i-- {
      src := fmt.Sprintf("%s.%d", a.path, i)
      if _, err := os.Stat(src); err == nil {
        os.Rename(src, fmt.Sprintf("%s.%d", a.path, i+1))
      }
    }
    os.Rename(a.path, a.path+".1")
  } else {
    os.Remove(a.path)
  }
  return a.open()
}

func (a *FileAppender) Close() error {
  a.mu.Lock()
  defer a.mu.Unlock()
  return a.file.Close()
}

// RemoteAppender ships lines via an injected transport; failures never reach the app.
type RemoteAppender struct {
  *base
  Failures atomic.Int64
}

func NewRemoteAppender(send func(string) error, f Formatter, filters ...Filter) *RemoteAppender {
  a := &RemoteAppender{base: newBase(f, filters)}
  a.write = func(line string) error {
    if err := send(line); err != nil {
      a.Failures.Add(1)
    }
    return nil
  }
  return a
}
func (a *RemoteAppender) Close() error { return nil }

// AsyncAppender is a decorator: Append enqueues; a goroutine drains into the delegate.
type AsyncAppender struct {
  delegate Appender
  ch       chan Record
  done     chan struct{}
  mu       sync.RWMutex
  closed   bool
  Dropped  atomic.Int64
}

func NewAsyncAppender(delegate Appender, capacity int) *AsyncAppender {
  a := &AsyncAppender{delegate: delegate, ch: make(chan Record, capacity), done: make(chan struct{})}
  go func() {
    defer close(a.done)
    for r := range a.ch {
      a.delegate.Append(r)
    }
  }()
  return a
}

func (a *AsyncAppender) Append(r Record) {
  a.mu.RLock()
  defer a.mu.RUnlock()
  if a.closed {
    return
  }
  select {
  case a.ch <- r:
  default:
    a.Dropped.Add(1) // never block the caller
  }
}

func (a *AsyncAppender) Close() error {
  a.mu.Lock()
  if a.closed {
    a.mu.Unlock()
    return nil
  }
  a.closed = true
  close(a.ch)
  a.mu.Unlock()
  <-a.done // everything queued before Close has been written
  return a.delegate.Close()
}

type Logger struct {
  name      string
  parent    *Logger
  mu        sync.RWMutex
  level     *Level // nil = inherit
  additive  bool
  appenders []Appender
}

func (l *Logger) SetLevel(lv *Level) { l.mu.Lock(); l.level = lv; l.mu.Unlock() }
func (l *Logger) SetAdditive(v bool) { l.mu.Lock(); l.additive = v; l.mu.Unlock() }
func (l *Logger) AddAppender(a Appender) {
  l.mu.Lock()
  l.appenders = append(l.appenders, a)
  l.mu.Unlock()
}

func (l *Logger) EffectiveLevel() Level {
  for c := l; c != nil; c = c.parent {
    c.mu.RLock()
    lv := c.level
    c.mu.RUnlock()
    if lv != nil {
      return *lv
    }
  }
  return Info
}

func (l *Logger) IsEnabled(lv Level) bool { return lv >= l.EffectiveLevel() }

func (l *Logger) Log(lv Level, msg string, err error) {
  if !l.IsEnabled(lv) {
    return // cheap early exit
  }
  rec := Record{Time: time.Now(), Level: lv, Logger: l.name, Message: msg, Err: err}
  for c := l; c != nil; c = c.parent {
    c.mu.RLock()
    apps := append([]Appender(nil), c.appenders...)
    additive := c.additive
    c.mu.RUnlock()
    for _, a := range apps {
      a.Append(rec)
    }
    if !additive {
      break
    }
  }
}

func (l *Logger) Debug(m string)            { l.Log(Debug, m, nil) }
func (l *Logger) Info(m string)             { l.Log(Info, m, nil) }
func (l *Logger) Warn(m string)             { l.Log(Warn, m, nil) }
func (l *Logger) Error(m string, e error)   { l.Log(Error, m, e) }
func (l *Logger) Fatal(m string, e error)   { l.Log(Fatal, m, e) }

type LogManager struct {
  mu      sync.Mutex
  loggers map[string]*Logger
  Root    *Logger
}

var (
  managerOnce sync.Once
  manager     *LogManager
)

func Manager() *LogManager {
  managerOnce.Do(func() {
    lv := Info
    root := &Logger{name: "root", additive: true, level: &lv}
    manager = &LogManager{loggers: map[string]*Logger{"root": root}, Root: root}
  })
  return manager
}

func (m *LogManager) GetLogger(name string) *Logger {
  m.mu.Lock()
  defer m.mu.Unlock()
  return m.getLocked(name)
}

func (m *LogManager) getLocked(name string) *Logger {
  if l, ok := m.loggers[name]; ok {
    return l
  }
  parent := m.Root
  if i := strings.LastIndex(name, "."); i >= 0 {
    parent = m.getLocked(name[:i])
  }
  l := &Logger{name: name, parent: parent, additive: true}
  m.loggers[name] = l
  return l
}

func (m *LogManager) Shutdown() {
  m.mu.Lock()
  seen := map[Appender]bool{}
  for _, l := range m.loggers {
    l.mu.RLock()
    for _, a := range l.appenders {
      seen[a] = true
    }
    l.mu.RUnlock()
  }
  m.mu.Unlock()
  for a := range seen {
    a.Close()
  }
}

func main() {
  mgr := Manager()
  mgr.Root.AddAppender(NewConsoleAppender(os.Stdout, nil, LevelFilter{Info}))
  file, _ := NewFileAppender("app.log", 1_000_000, 3, JSONFormatter{})
  mgr.Root.AddAppender(NewAsyncAppender(file, 10_000))
  dbg := Debug
  mgr.GetLogger("com.shop").SetLevel(&dbg) // children inherit DEBUG
  orders := mgr.GetLogger("com.shop.orders")
  orders.Debug("cart loaded")             // file only
  orders.Info("order placed")             // console + file
  mgr.GetLogger("com.other").Debug("dropped") // root = INFO
  mgr.Shutdown()
}
`

const csharp = `using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;

public enum LogLevel { Debug = 10, Info = 20, Warn = 30, Error = 40, Fatal = 50 }

public sealed record LogRecord(DateTime Timestamp, LogLevel Level, string LoggerName,
                               string Message, string Thread, Exception? Error);

public interface IFormatter { string Format(LogRecord r); }
public interface ILogFilter { bool Accept(LogRecord r); }

public sealed class PatternFormatter : IFormatter {
  public string Format(LogRecord r) {
    var line = $"{r.Timestamp:O} [{r.Level.ToString().ToUpper(),-5}] [{r.Thread}] {r.LoggerName} - {r.Message}";
    return r.Error is null ? line : line + "\\n" + r.Error;
  }
}

public sealed class JsonFormatter : IFormatter {
  public string Format(LogRecord r) => JsonSerializer.Serialize(new {
    ts = r.Timestamp.ToString("O"), level = r.Level.ToString().ToUpper(), logger = r.LoggerName,
    thread = r.Thread, msg = r.Message, error = r.Error?.Message,
  });
}

public sealed class LevelFilter : ILogFilter {
  readonly LogLevel _min;
  public LevelFilter(LogLevel min) { _min = min; }
  public bool Accept(LogRecord r) => r.Level >= _min;
}

public interface IAppender : IDisposable {
  void Append(LogRecord r);
}

/// <summary>Template Method: filter -> format -> (locked) Write.</summary>
public abstract class AbstractAppender : IAppender {
  readonly IFormatter _formatter;
  readonly IReadOnlyList<ILogFilter> _filters;
  protected readonly object Gate = new();

  protected AbstractAppender(IFormatter? formatter = null, IEnumerable<ILogFilter>? filters = null) {
    _formatter = formatter ?? new PatternFormatter();
    _filters = (filters ?? Enumerable.Empty<ILogFilter>()).ToList();
  }

  public void Append(LogRecord r) {
    if (_filters.Any(f => !f.Accept(r))) return;
    var line = _formatter.Format(r);
    lock (Gate) {
      try { Write(line); } catch (IOException e) { Console.Error.WriteLine("appender failure: " + e.Message); }
    }
  }

  protected abstract void Write(string line);
  public virtual void Dispose() {}
}

public sealed class ConsoleAppender : AbstractAppender {
  readonly TextWriter _out;
  public ConsoleAppender(TextWriter? output = null, IFormatter? f = null, IEnumerable<ILogFilter>? filters = null)
    : base(f, filters) => _out = output ?? Console.Out;
  protected override void Write(string line) { _out.WriteLine(line); _out.Flush(); }
}

/// <summary>Size-based rotation: app.log -> app.log.1 -> app.log.2 ... (oldest dropped).</summary>
public sealed class FileAppender : AbstractAppender {
  readonly string _path;
  readonly long _maxBytes;
  readonly int _backups;
  StreamWriter _out = null!;
  long _size;

  public FileAppender(string path, long maxBytes = 10 * 1024 * 1024, int backups = 5,
                      IFormatter? f = null, IEnumerable<ILogFilter>? filters = null) : base(f, filters) {
    _path = path; _maxBytes = maxBytes; _backups = backups;
    Open();
  }

  void Open() {
    _out = new StreamWriter(new FileStream(_path, FileMode.Append, FileAccess.Write, FileShare.Read), new UTF8Encoding(false));
    _size = new FileInfo(_path).Length;
  }

  protected override void Write(string line) {
    long n = Encoding.UTF8.GetByteCount(line) + 1;
    if (_size > 0 && _size + n > _maxBytes) Rotate();
    _out.Write(line); _out.Write('\\n'); _out.Flush();
    _size += n;
  }

  void Rotate() {
    _out.Dispose();
    if (_backups > 0) {
      for (int i = _backups - 1; i >= 1; i--) {
        var src = $"{_path}.{i}";
        if (File.Exists(src)) File.Move(src, $"{_path}.{i + 1}", overwrite: true);
      }
      File.Move(_path, _path + ".1", overwrite: true);
    } else File.Delete(_path);
    Open();
  }

  public override void Dispose() { lock (Gate) _out.Dispose(); }
}

/// <summary>Ships lines through an injected transport; failures never reach the application.</summary>
public sealed class RemoteAppender : AbstractAppender {
  readonly Action<string> _transport;
  long _failures;
  public long Failures => Interlocked.Read(ref _failures);
  public RemoteAppender(Action<string> transport, IFormatter? f = null, IEnumerable<ILogFilter>? filters = null)
    : base(f, filters) => _transport = transport;
  protected override void Write(string line) {
    try { _transport(line); } catch { Interlocked.Increment(ref _failures); }
  }
}

/// <summary>Decorator: callers enqueue and return; a worker thread drains into the delegate.</summary>
public sealed class AsyncAppender : IAppender {
  readonly IAppender _delegate;
  readonly BlockingCollection<LogRecord> _queue;
  readonly Thread _worker;
  long _dropped;
  volatile bool _closed;
  public long Dropped => Interlocked.Read(ref _dropped);

  public AsyncAppender(IAppender @delegate, int capacity = 10_000) {
    _delegate = @delegate;
    _queue = new BlockingCollection<LogRecord>(capacity);
    _worker = new Thread(Run) { IsBackground = true, Name = "log-async" };
    _worker.Start();
  }

  public void Append(LogRecord r) {
    if (_closed) return;
    try { if (!_queue.TryAdd(r)) Interlocked.Increment(ref _dropped); }   // never block the caller
    catch (InvalidOperationException) { /* completed while appending */ }
  }

  void Run() {
    foreach (var r in _queue.GetConsumingEnumerable()) {
      try { _delegate.Append(r); } catch (Exception e) { Console.Error.WriteLine(e); }
    }
  }

  public void Dispose() {
    if (_closed) return;
    _closed = true;
    _queue.CompleteAdding();   // consumer drains everything already queued, then exits
    _worker.Join();
    _delegate.Dispose();
  }
}

public sealed class Logger {
  readonly Logger? _parent;
  readonly List<IAppender> _appenders = new();
  readonly object _gate = new();
  volatile int _level = -1;     // -1 = inherit

  public string Name { get; }
  public bool Additive { get; set; } = true;
  public Logger(string name, Logger? parent) { Name = name; _parent = parent; }

  public void SetLevel(LogLevel? level) => _level = level is null ? -1 : (int)level.Value;
  public void AddAppender(IAppender a) { lock (_gate) _appenders.Add(a); }
  public IReadOnlyList<IAppender> Appenders { get { lock (_gate) return _appenders.ToList(); } }

  public LogLevel EffectiveLevel {
    get {
      for (var l = this; l is not null; l = l._parent) if (l._level >= 0) return (LogLevel)l._level;
      return LogLevel.Info;
    }
  }

  public bool IsEnabled(LogLevel level) => level >= EffectiveLevel;

  public void Log(LogLevel level, string message, Exception? error = null) {
    if (!IsEnabled(level)) return;       // cheap early exit
    var rec = new LogRecord(DateTime.UtcNow, level, Name, message, Thread.CurrentThread.Name ?? Environment.CurrentManagedThreadId.ToString(), error);
    for (var l = this; l is not null; l = l._parent) {
      foreach (var a in l.Appenders) {
        try { a.Append(rec); } catch (Exception e) { Console.Error.WriteLine(e); }
      }
      if (!l.Additive) break;
    }
  }

  public void Debug(string m) => Log(LogLevel.Debug, m);
  public void Info(string m) => Log(LogLevel.Info, m);
  public void Warn(string m) => Log(LogLevel.Warn, m);
  public void Error(string m, Exception? e = null) => Log(LogLevel.Error, m, e);
  public void Fatal(string m, Exception? e = null) => Log(LogLevel.Fatal, m, e);
}

public sealed class LogManager {
  static readonly Lazy<LogManager> _instance = new(() => new LogManager());   // thread-safe singleton
  public static LogManager Instance => _instance.Value;

  readonly Dictionary<string, Logger> _loggers = new();
  readonly object _gate = new();
  public Logger Root { get; }

  LogManager() {
    Root = new Logger("root", null);
    Root.SetLevel(LogLevel.Info);
    _loggers["root"] = Root;
  }

  public Logger GetLogger(string name) { lock (_gate) return GetLocked(name); }

  Logger GetLocked(string name) {
    if (_loggers.TryGetValue(name, out var existing)) return existing;
    int dot = name.LastIndexOf('.');
    var parent = dot < 0 ? Root : GetLocked(name[..dot]);
    return _loggers[name] = new Logger(name, parent);
  }

  public void Shutdown() {
    List<IAppender> all;
    lock (_gate) all = _loggers.Values.SelectMany(l => l.Appenders).Distinct().ToList();
    foreach (var a in all) a.Dispose();
  }
}

public static class Program {
  public static void Main() {
    var mgr = LogManager.Instance;
    mgr.Root.AddAppender(new ConsoleAppender(filters: new[] { new LevelFilter(LogLevel.Info) }));
    mgr.Root.AddAppender(new AsyncAppender(new FileAppender("app.log", 1_000_000, 3, new JsonFormatter())));
    mgr.GetLogger("com.shop").SetLevel(LogLevel.Debug);      // children inherit DEBUG
    var orders = mgr.GetLogger("com.shop.orders");
    orders.Debug("cart loaded");                             // file only
    orders.Info("order placed");                             // console + file
    mgr.GetLogger("com.other").Debug("dropped");             // root = INFO
    mgr.Shutdown();
  }
}
`

export const loggingFrameworkSolution: ProblemSolution = {
  slug: 'logging-framework',
  title: 'Logging Framework - Solution',
  overview: {
    introduction:
      'Design a logging library in the spirit of log4j / slf4j / Python logging. Applications obtain named loggers, emit messages at a severity level, and the framework filters, formats, and routes them to one or more destinations (console, rotating file, remote service) - optionally asynchronously so the application thread never waits on slow I/O.',
    constraints: [
      'Severity levels DEBUG < INFO < WARN < ERROR < FATAL; a logger emits only messages at or above its effective level.',
      'Multiple output destinations (appenders) can be attached; each has its own formatter and filters.',
      'Named loggers form a hierarchy (com.shop.orders → com.shop → root) with level and appender inheritance.',
      'File output supports size-based rotation with a bounded number of backups.',
      'Async logging must not block the caller and must flush on shutdown.',
      'A failing appender must never crash the application or prevent other appenders from receiving the record.',
    ],
    assumptions: [
      'One process, in-memory configuration through code (config-file parsing is an extension).',
      'LogManager is a process-wide singleton; loggers are created lazily and cached by name.',
      'Async queue is bounded; on overflow we drop and count rather than block (policy is swappable).',
      'Remote delivery is abstracted by an injected transport (HTTP, syslog, Kafka) - no retry/batching in v1.',
    ],
    clarificationQuestions: [
      'Should loggers be hierarchical with inheritance, or a flat registry?',
      'When the async queue is full - block, drop newest, or drop oldest? Any level-based priority?',
      'Rotation: by size, by time, or both? How many backups and compression?',
      'Do we need structured (JSON) logging, MDC/contextual fields, or just text?',
      'What guarantees on shutdown - are queued records flushed?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Follow one log call end-to-end: the app calls logger.info → check level → build a record → send to each appender → appender filters → formatter produces text → sink writes. Each arrow is a seam with an interface: Logger, Appender, Filter, Formatter. Then layer cross-cutting concerns as decorators (async) and policies (rotation) instead of baking them into the core.',
    breakdown: [
      'Define LogLevel (ordered) and an immutable LogRecord capturing time, level, logger, message, thread, error.',
      'Define Formatter and LogFilter interfaces; implement PatternFormatter, JsonFormatter, LevelFilter.',
      'Define Appender and an AbstractAppender using Template Method: filter → format → locked write.',
      'Implement Console, File (with rotation), and Remote appenders.',
      'Implement AsyncAppender as a Decorator with a bounded queue and a worker thread.',
      'Implement Logger (effective level, parent chain, additive) and LogManager (singleton registry).',
    ],
    entities: [
      { name: 'LogManager', responsibility: 'Singleton registry: creates/caches named loggers, owns root, shuts down appenders.' },
      { name: 'Logger', responsibility: 'API surface (debug…fatal); level check, record creation, dispatch up the hierarchy.' },
      { name: 'LogRecord', responsibility: 'Immutable event: timestamp, level, logger name, message, thread, error.' },
      { name: 'Appender / AbstractAppender', responsibility: 'Destination contract and shared filter→format→write flow.' },
      { name: 'Console/File/RemoteAppender', responsibility: 'Concrete sinks; File adds size-based rotation.' },
      { name: 'AsyncAppender', responsibility: 'Decorator: queue + worker so callers never block on I/O.' },
      { name: 'Formatter / LogFilter', responsibility: 'Strategies for rendering and accepting records.' },
    ],
    relationships: [
      'LogManager composes many Loggers; each Logger has an optional parent.',
      'Logger aggregates Appenders and creates LogRecords.',
      'AbstractAppender aggregates a Formatter and a list of LogFilters; concrete appenders extend it.',
      'AsyncAppender implements Appender and wraps another Appender (Decorator).',
    ],
    patternsAndOop: [
      'Singleton: LogManager as the global registry (thread-safe lazy initialisation).',
      'Strategy: Formatter and LogFilter implementations are pluggable.',
      'Template Method: AbstractAppender.append defines the invariant steps; subclasses implement write().',
      'Decorator: AsyncAppender adds asynchrony to any appender without changing it.',
      'Chain of responsibility-style dispatch: records propagate from logger to parent while additive.',
    ],
    stepByStep: [
      'Clarify hierarchy, async policy, and rotation requirements.',
      'Draw Logger → Appender → (Filter, Formatter) and LogManager on the whiteboard.',
      'Write Logger.log with the early level check and parent-chain dispatch.',
      'Implement AbstractAppender and one concrete appender; then FileAppender rotation.',
      'Add AsyncAppender and explain flush-on-close using a sentinel.',
      'Cover concurrency, failure isolation, and extensions (config, MDC, batching).',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'The framework is a pipeline of small abstractions: Logger decides whether to log, appenders decide where, filters decide which, formatters decide how, and an async decorator decides when. Because each concern sits behind an interface, you can add sinks, formats, or delivery modes without touching the core.',
    classResponsibilities: [
      { name: 'Logger', responsibility: 'Level resolution via parent chain, record creation, additive dispatch, failure isolation.' },
      { name: 'LogManager', responsibility: 'Thread-safe get-or-create of named loggers with parent wiring; coordinated shutdown.' },
      { name: 'AbstractAppender', responsibility: 'Applies filters, formats, and serialises writes with a lock.' },
      { name: 'FileAppender', responsibility: 'Tracks file size, rotates app.log → .1 → .2 … when the size limit would be exceeded.' },
      { name: 'RemoteAppender', responsibility: 'Delegates to a transport and counts failures instead of throwing.' },
      { name: 'AsyncAppender', responsibility: 'Bounded queue + worker thread; drops on overflow; drains on close().' },
      { name: 'PatternFormatter / JsonFormatter', responsibility: 'Render a LogRecord to human-readable or structured text.' },
    ],
    interfacesAndAbstractions: [
      'Appender: the sink contract (append/close) - enables decorators and test doubles.',
      'Formatter and LogFilter: single-method strategies that keep appenders generic.',
    ],
    relationships: [
      'Composition LogManager→Logger: the manager controls logger lifecycles.',
      'Aggregation Logger→Appender: appenders can be shared by many loggers.',
      'Realization AsyncAppender→Appender and decoration of another Appender.',
      'Inheritance AbstractAppender→Console/File/Remote reuses the common pipeline.',
    ],
    solid: [
      'SRP: formatting, filtering, delivery, and rotation live in separate classes.',
      'OCP: new sinks/formatters/filters are added without modifying Logger or other appenders.',
      'LSP: any Appender (including AsyncAppender) can be attached wherever an Appender is expected.',
      'ISP: Formatter and LogFilter each expose one method.',
      'DIP: Logger depends on Appender, not on ConsoleAppender or FileAppender.',
    ],
    patterns: [
      { name: 'Singleton', why: 'One shared registry so every module gets the same named logger.' },
      { name: 'Template Method', why: 'Guarantees filter→format→write order for all appenders.' },
      { name: 'Decorator', why: 'Async delivery wraps any appender transparently.' },
      { name: 'Strategy', why: 'Pluggable Formatter and LogFilter policies.' },
    ],
    decisions: [
      {
        decision: 'Level check happens first in Logger.log, before building a record.',
        rationale: 'Disabled DEBUG calls cost almost nothing - important in hot paths.',
        tradeoff: 'Message strings are still built by the caller; offer lazy/supplier overloads for heavy messages.',
      },
      {
        decision: 'Async queue is bounded and drops on overflow.',
        rationale: 'A slow disk or network must not exhaust memory or stall the application.',
        tradeoff: 'Records can be lost under extreme load; count drops and consider priority (never drop ERROR+).',
      },
      {
        decision: 'close() enqueues a sentinel and joins the worker.',
        rationale: 'FIFO ordering guarantees everything queued before shutdown is written.',
        tradeoff: 'Shutdown time depends on backlog; add a timeout for stuck sinks.',
      },
      {
        decision: 'Appender exceptions are caught at the dispatch boundary.',
        rationale: 'Logging must never take the application down or starve other sinks.',
        tradeoff: 'Failures can be silent; surface counters and a last-resort stderr line.',
      },
      {
        decision: 'Size-based rotation using rename chain app.log.N → app.log.N+1.',
        rationale: 'Simple, atomic on most filesystems, and bounded disk usage by backups × maxBytes.',
        tradeoff: 'O(backups) renames per rotation; time-based and compressed rotation are extensions.',
      },
    ],
    extensibility:
      'Add a time-based RotationPolicy, a SyslogAppender, MDC/context in LogRecord, batching + retry in RemoteAppender, config-file loading in LogManager, per-appender level thresholds, and a Supplier-based lazy message API - each as a new class or small interface with no change to Logger.',
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
      'LogManager.getLogger("com.shop.orders") creates the logger (and its parents com.shop and root) once and caches it.',
      'logger.info("order placed") resolves the effective level by walking parents; if INFO is disabled it returns immediately.',
      'Otherwise it creates one immutable LogRecord (timestamp, thread, message, error).',
      'The record is dispatched to the logger’s appenders and then to each parent’s appenders while additive is true; exceptions from one appender are isolated.',
      'Each appender runs its filters, formats the record, then writes (console, file with rotation, remote transport) under a lock.',
      'AsyncAppender instead enqueues; its worker thread calls the delegate. LogManager.shutdown() closes appenders, flushing the queue first.',
    ],
    examples: [
      {
        title: 'Level inheritance',
        input: 'com.shop.setLevel(DEBUG); com.shop.orders.debug("cart loaded")',
        output: 'Record is created and written by appenders',
        explanation:
          'com.shop.orders has no level, so it inherits DEBUG from com.shop. A sibling like com.other falls back to root (INFO) and drops the same call.',
      },
      {
        title: 'Per-appender filtering',
        input: 'Console has LevelFilter(INFO); File has none; orders.debug("x")',
        output: 'Written to file only',
        explanation: 'The record passes the logger check, then the console appender’s filter rejects DEBUG while the file appender accepts it.',
      },
      {
        title: 'File rotation',
        input: 'max_bytes=1000, backups=2; writes grow app.log past 1000 bytes',
        output: 'app.log.1 holds the old content, app.log is fresh',
        explanation: 'Before the write that would exceed the limit, FileAppender renames app.log.1 → .2 (dropping the oldest), app.log → .1, and reopens a new app.log.',
      },
    ],
  },
  followUps: [
    {
      question: 'Why use Template Method for appenders?',
      answer:
        'Filtering, formatting, and locking are identical for every sink. Putting them in AbstractAppender.append means subclasses only implement write(), and no appender can forget a filter or the lock.',
    },
    {
      question: 'How does async logging avoid blocking and what are the risks?',
      answer:
        'Callers only do a non-blocking enqueue; a worker performs the slow I/O. Risks: dropped records on overflow, lost records on crash, and ordering across threads. Mitigate with bounded queues, drop counters, flush on shutdown, and never dropping ERROR/FATAL.',
    },
    {
      question: 'How do you guarantee flush on shutdown?',
      answer:
        'close() sets a closed flag, enqueues a stop sentinel (or closes the channel), and joins the worker. Because the queue is FIFO, every record accepted earlier is written before the worker exits; then the delegate is closed.',
    },
    {
      question: 'How would you implement time-based rotation?',
      answer:
        'Extract a RotationPolicy (shouldRotate(size, now)). SizeRotation and DailyRotation implement it; FileAppender asks the policy before each write and handles the rename chain or timestamped filename.',
    },
    {
      question: 'How do you make logger lookups fast and thread-safe?',
      answer:
        'Cache loggers in a map guarded by a lock (or ConcurrentHashMap with compute for flat names). Cache the effective level per logger and invalidate children when a parent level changes if profiling shows hierarchy walks are hot.',
    },
    {
      question: 'How would you add structured fields (MDC) or correlation IDs?',
      answer:
        'Add a context map to LogRecord populated from a thread-local/async-local MDC at record creation. JsonFormatter emits those fields; PatternFormatter can reference them with %X{key}.',
    },
  ],
  extras: {
    edgeCases: [
      'Appender throws (disk full, network down) - other appenders must still run.',
      'Logging during shutdown or after close().',
      'Queue full while many threads log simultaneously.',
      'Single log line larger than the rotation limit.',
      'Cyclic or non-additive logger configuration.',
      'Two threads requesting the same new logger name at once.',
    ],
    commonMistakes: [
      'Formatting/building strings before checking the level.',
      'Doing file I/O on the caller thread when “async” was required.',
      'Unbounded async queue → OOM during an outage.',
      'Sharing a non-thread-safe writer between threads without a lock.',
      'Making LogManager a mutable global without thread-safe initialisation.',
    ],
    complexity:
      'Level resolution is O(depth of the dotted name). Dispatch is O(depth + appenders). Appending to an AsyncAppender is O(1); file rotation is O(backups) renames occasionally. Memory is bounded by the async queue capacity.',
    testing: [
      'Level matrix: logger/root/child combinations and inheritance.',
      'Appender fakes capturing lines; verify filter + formatter order.',
      'FileAppender rotation with a temp directory and tiny max size; verify backup count.',
      'AsyncAppender: all records delivered after close; drop counter increments when the queue is full.',
      'Concurrency test: many threads logging; no interleaved lines and no exceptions.',
      'Failure injection: transport throws; other appenders still receive records.',
    ],
    extensions: [
      'Config file (YAML/JSON) and runtime level changes.',
      'MDC/context propagation, structured logging, sampling.',
      'Batching/retry/backoff for RemoteAppender; time-based and compressed rotation.',
      'Lazy message suppliers and compile-time level elision.',
    ],
    takeaways: [
      'One log call = level check → record → dispatch → filter → format → write.',
      'Interfaces at each seam make the framework extensible.',
      'Decorator keeps async orthogonal to sinks.',
      'Never let logging failures or slow sinks hurt the application.',
    ],
  },
}
