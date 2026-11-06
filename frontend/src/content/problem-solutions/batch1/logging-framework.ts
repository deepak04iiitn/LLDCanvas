import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'LoggingFrameworkService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_loggers', 'Map<string, Logger>'),
    attr('-', '_log_levels', 'Map<string, LogLevel>'),
    attr('-', '_log_records', 'Map<string, LogRecord>'),
    attr('-', '_appenders', 'Map<string, Appender>'),
    attr('-', '_formatters', 'Map<string, Formatter>'),
  ], [
    method('+', 'createLogger', 'name: string', 'Logger'),
    method('+', 'createLogLevel', 'name: string', 'LogLevel'),
    method('+', 'createLogRecord', 'name: string', 'LogRecord'),
    method('+', 'createAppender', 'name: string', 'Appender'),
    method('+', 'createFormatter', 'name: string', 'Formatter'),
    method('+', 'getLogger', 'id: string', 'Logger'),
    method('+', 'getLogLevel', 'id: string', 'LogLevel'),
    method('+', 'getLogRecord', 'id: string', 'LogRecord'),
    method('+', 'getAppender', 'id: string', 'Appender'),
    method('+', 'getFormatter', 'id: string', 'Formatter'),
    method('+', 'closeLogger', 'id: string', 'Logger'),
  ], 'facade'),
  cls('n1', 'Logger', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'LogLevel', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'LogRecord', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Appender', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Formatter', GRID.x(2), GRID.y(1), [
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
  edge('e5', 'n0', 'n5', 'composition', 'right', 'left'),
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("logging-framework")


class Logger:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Logger.id is required")
        if not name or not name.strip():
            raise ValueError("Logger.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Logger.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Logger {self.id} has invalid status={self.status}")
        log.info("[Logger.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Logger {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Logger.close] id=%s -> CLOSED", self.id)


class LogLevel:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("LogLevel.id is required")
        if not name or not name.strip():
            raise ValueError("LogLevel.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[LogLevel.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"LogLevel {self.id} has invalid status={self.status}")
        log.info("[LogLevel.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"LogLevel {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[LogLevel.close] id=%s -> CLOSED", self.id)


class LogRecord:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("LogRecord.id is required")
        if not name or not name.strip():
            raise ValueError("LogRecord.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[LogRecord.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"LogRecord {self.id} has invalid status={self.status}")
        log.info("[LogRecord.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"LogRecord {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[LogRecord.close] id=%s -> CLOSED", self.id)


class Appender:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Appender.id is required")
        if not name or not name.strip():
            raise ValueError("Appender.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Appender.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Appender {self.id} has invalid status={self.status}")
        log.info("[Appender.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Appender {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Appender.close] id=%s -> CLOSED", self.id)


class Formatter:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Formatter.id is required")
        if not name or not name.strip():
            raise ValueError("Formatter.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Formatter.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Formatter {self.id} has invalid status={self.status}")
        log.info("[Formatter.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Formatter {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Formatter.close] id=%s -> CLOSED", self.id)


class LoggingFrameworkService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._loggers: Dict[str, Logger] = {}
        self._log_levels: Dict[str, LogLevel] = {}
        self._log_records: Dict[str, LogRecord] = {}
        self._appenders: Dict[str, Appender] = {}
        self._formatters: Dict[str, Formatter] = {}
        log.info("[LoggingFrameworkService.__init__] system ready; managing: Logger, LogLevel, LogRecord, Appender, Formatter")

    def create_logger(self, name: str) -> Logger:
        """UML: LoggingFrameworkService.create_logger(name) -> Logger"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Logger name is required")
        with self._lock:
            item_id = f"LOG-{self._seq:04d}"
            self._seq += 1
            obj = Logger(item_id, cleaned)
            obj.validate()
            self._loggers[item_id] = obj
            log.info("[LoggingFrameworkService.create_logger] stored %s in _loggers (count=%s)", item_id, len(self._loggers))
            return obj

    def get_logger(self, item_id: str) -> Logger:
        with self._lock:
            obj = self._loggers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Logger id: {item_id}")
            log.info("[LoggingFrameworkService.get_logger] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_log_level(self, name: str) -> LogLevel:
        """UML: LoggingFrameworkService.create_log_level(name) -> LogLevel"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("LogLevel name is required")
        with self._lock:
            item_id = f"LOG-{self._seq:04d}"
            self._seq += 1
            obj = LogLevel(item_id, cleaned)
            obj.validate()
            self._log_levels[item_id] = obj
            log.info("[LoggingFrameworkService.create_log_level] stored %s in _log_levels (count=%s)", item_id, len(self._log_levels))
            return obj

    def get_log_level(self, item_id: str) -> LogLevel:
        with self._lock:
            obj = self._log_levels.get(item_id)
            if obj is None:
                raise KeyError(f"unknown LogLevel id: {item_id}")
            log.info("[LoggingFrameworkService.get_log_level] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_log_record(self, name: str) -> LogRecord:
        """UML: LoggingFrameworkService.create_log_record(name) -> LogRecord"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("LogRecord name is required")
        with self._lock:
            item_id = f"LOG-{self._seq:04d}"
            self._seq += 1
            obj = LogRecord(item_id, cleaned)
            obj.validate()
            self._log_records[item_id] = obj
            log.info("[LoggingFrameworkService.create_log_record] stored %s in _log_records (count=%s)", item_id, len(self._log_records))
            return obj

    def get_log_record(self, item_id: str) -> LogRecord:
        with self._lock:
            obj = self._log_records.get(item_id)
            if obj is None:
                raise KeyError(f"unknown LogRecord id: {item_id}")
            log.info("[LoggingFrameworkService.get_log_record] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_appender(self, name: str) -> Appender:
        """UML: LoggingFrameworkService.create_appender(name) -> Appender"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Appender name is required")
        with self._lock:
            item_id = f"APP-{self._seq:04d}"
            self._seq += 1
            obj = Appender(item_id, cleaned)
            obj.validate()
            self._appenders[item_id] = obj
            log.info("[LoggingFrameworkService.create_appender] stored %s in _appenders (count=%s)", item_id, len(self._appenders))
            return obj

    def get_appender(self, item_id: str) -> Appender:
        with self._lock:
            obj = self._appenders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Appender id: {item_id}")
            log.info("[LoggingFrameworkService.get_appender] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_formatter(self, name: str) -> Formatter:
        """UML: LoggingFrameworkService.create_formatter(name) -> Formatter"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Formatter name is required")
        with self._lock:
            item_id = f"FOR-{self._seq:04d}"
            self._seq += 1
            obj = Formatter(item_id, cleaned)
            obj.validate()
            self._formatters[item_id] = obj
            log.info("[LoggingFrameworkService.create_formatter] stored %s in _formatters (count=%s)", item_id, len(self._formatters))
            return obj

    def get_formatter(self, item_id: str) -> Formatter:
        with self._lock:
            obj = self._formatters.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Formatter id: {item_id}")
            log.info("[LoggingFrameworkService.get_formatter] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_logger(self, item_id: str) -> Logger:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._loggers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Logger id: {item_id}")
            log.info("[LoggingFrameworkService.close_logger] closing %s via Logger.close()", item_id)
            obj.close()
            return obj

    def list_active_loggers(self) -> List[Logger]:
        with self._lock:
            active = [o for o in self._loggers.values() if o.status == "ACTIVE"]
            log.info("[LoggingFrameworkService.list_active_loggers] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct LoggingFrameworkService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = LoggingFrameworkService()

    log.info("========== STEP 2: Create primary Logger objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_logger("alpha-logger")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_logger("beta-logger")

    log.info("========== STEP 3: Create LogLevel (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_log_level("sample-log_level")

    log.info("========== STEP 4: Create LogRecord (UML class) ==========")
    system.create_log_record("sample-log_record")

    log.info("========== STEP 5: Create Appender (UML class) ==========")
    system.create_appender("sample-appender")

    log.info("========== STEP 6: Create Formatter (UML class) ==========")
    system.create_formatter("sample-formatter")

    log.info("========== STEP 7: Inspect active Logger list ==========")
    system.list_active_loggers()

    log.info("========== STEP 8: Close first Logger ==========")
    system.close_logger(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_logger(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Logger.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_logger("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_logger: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_loggers()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Logger {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Logger(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Logger.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Logger.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Logger.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Logger " + id + " invalid status");
    }
    System.out.println("[Logger.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Logger " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Logger.close] id=" + id + " -> CLOSED");
  }
}


class LogLevel {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  LogLevel(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("LogLevel.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LogLevel.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[LogLevel.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("LogLevel " + id + " invalid status");
    }
    System.out.println("[LogLevel.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("LogLevel " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[LogLevel.close] id=" + id + " -> CLOSED");
  }
}


class LogRecord {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  LogRecord(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("LogRecord.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LogRecord.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[LogRecord.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("LogRecord " + id + " invalid status");
    }
    System.out.println("[LogRecord.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("LogRecord " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[LogRecord.close] id=" + id + " -> CLOSED");
  }
}


class Appender {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Appender(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Appender.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Appender.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Appender.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Appender " + id + " invalid status");
    }
    System.out.println("[Appender.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Appender " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Appender.close] id=" + id + " -> CLOSED");
  }
}


class Formatter {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Formatter(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Formatter.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Formatter.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Formatter.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Formatter " + id + " invalid status");
    }
    System.out.println("[Formatter.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Formatter " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Formatter.close] id=" + id + " -> CLOSED");
  }
}

public class LoggingFrameworkService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Logger> loggers = new LinkedHashMap<>();
  private final Map<String, LogLevel> log_levels = new LinkedHashMap<>();
  private final Map<String, LogRecord> log_records = new LinkedHashMap<>();
  private final Map<String, Appender> appenders = new LinkedHashMap<>();
  private final Map<String, Formatter> formatters = new LinkedHashMap<>();

  public LoggingFrameworkService() {
    System.out.println("[LoggingFrameworkService.__init__] system ready");
  }

  public Logger createLogger(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Logger name required");
    }
    lock.lock();
    try {
      String id = String.format("LOG-%04d", seq++);
      Logger obj = new Logger(id, name.trim());
      obj.validate();
      loggers.put(id, obj);
      System.out.println("[LoggingFrameworkService.createLogger] stored " + id + " count=" + loggers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Logger getLogger(String id) {
    lock.lock();
    try {
      Logger obj = loggers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Logger id: " + id);
      }
      System.out.println("[LoggingFrameworkService.getLogger] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public LogLevel createLogLevel(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LogLevel name required");
    }
    lock.lock();
    try {
      String id = String.format("LOG-%04d", seq++);
      LogLevel obj = new LogLevel(id, name.trim());
      obj.validate();
      log_levels.put(id, obj);
      System.out.println("[LoggingFrameworkService.createLogLevel] stored " + id + " count=" + log_levels.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public LogLevel getLogLevel(String id) {
    lock.lock();
    try {
      LogLevel obj = log_levels.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown LogLevel id: " + id);
      }
      System.out.println("[LoggingFrameworkService.getLogLevel] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public LogRecord createLogRecord(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LogRecord name required");
    }
    lock.lock();
    try {
      String id = String.format("LOG-%04d", seq++);
      LogRecord obj = new LogRecord(id, name.trim());
      obj.validate();
      log_records.put(id, obj);
      System.out.println("[LoggingFrameworkService.createLogRecord] stored " + id + " count=" + log_records.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public LogRecord getLogRecord(String id) {
    lock.lock();
    try {
      LogRecord obj = log_records.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown LogRecord id: " + id);
      }
      System.out.println("[LoggingFrameworkService.getLogRecord] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Appender createAppender(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Appender name required");
    }
    lock.lock();
    try {
      String id = String.format("APP-%04d", seq++);
      Appender obj = new Appender(id, name.trim());
      obj.validate();
      appenders.put(id, obj);
      System.out.println("[LoggingFrameworkService.createAppender] stored " + id + " count=" + appenders.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Appender getAppender(String id) {
    lock.lock();
    try {
      Appender obj = appenders.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Appender id: " + id);
      }
      System.out.println("[LoggingFrameworkService.getAppender] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Formatter createFormatter(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Formatter name required");
    }
    lock.lock();
    try {
      String id = String.format("FOR-%04d", seq++);
      Formatter obj = new Formatter(id, name.trim());
      obj.validate();
      formatters.put(id, obj);
      System.out.println("[LoggingFrameworkService.createFormatter] stored " + id + " count=" + formatters.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Formatter getFormatter(String id) {
    lock.lock();
    try {
      Formatter obj = formatters.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Formatter id: " + id);
      }
      System.out.println("[LoggingFrameworkService.getFormatter] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Logger closeLogger(String id) {
    lock.lock();
    try {
      Logger obj = loggers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Logger id: " + id);
      }
      System.out.println("[LoggingFrameworkService.closeLogger] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Logger> listActiveLoggers() {
    lock.lock();
    try {
      List<Logger> out = new ArrayList<>();
      for (Logger o : loggers.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[LoggingFrameworkService.listActiveLoggers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct LoggingFrameworkService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    LoggingFrameworkService system = new LoggingFrameworkService();
    System.out.println("========== STEP 2: Create Logger objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Logger first = system.createLogger("alpha-logger");
    system.createLogger("beta-logger");
    System.out.println("========== STEP 3: Create LogLevel ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createLogLevel("sample-log_level");
    System.out.println("========== STEP 4: Create LogRecord ==========");
    system.createLogRecord("sample-log_record");
    System.out.println("========== STEP 5: Create Appender ==========");
    system.createAppender("sample-appender");
    System.out.println("========== STEP 6: Create Formatter ==========");
    system.createFormatter("sample-formatter");
    System.out.println("========== Inspect active list ==========");
    system.listActiveLoggers();
    System.out.println("========== Close first Logger ==========");
    system.closeLogger(first.getId());
    try {
      system.closeLogger(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getLogger("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Logger {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Logger.id required')
    }

    if (!name?.trim()) {
      throw new Error('Logger.name required')
    }
    console.log(\`[Logger.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Logger \${this.id} invalid status\`)
    }
    console.log(\`[Logger.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Logger \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Logger.close] id=\${this.id} -> CLOSED\`)
  }
}


class LogLevel {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('LogLevel.id required')
    }

    if (!name?.trim()) {
      throw new Error('LogLevel.name required')
    }
    console.log(\`[LogLevel.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`LogLevel \${this.id} invalid status\`)
    }
    console.log(\`[LogLevel.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`LogLevel \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[LogLevel.close] id=\${this.id} -> CLOSED\`)
  }
}


class LogRecord {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('LogRecord.id required')
    }

    if (!name?.trim()) {
      throw new Error('LogRecord.name required')
    }
    console.log(\`[LogRecord.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`LogRecord \${this.id} invalid status\`)
    }
    console.log(\`[LogRecord.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`LogRecord \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[LogRecord.close] id=\${this.id} -> CLOSED\`)
  }
}


class Appender {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Appender.id required')
    }

    if (!name?.trim()) {
      throw new Error('Appender.name required')
    }
    console.log(\`[Appender.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Appender \${this.id} invalid status\`)
    }
    console.log(\`[Appender.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Appender \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Appender.close] id=\${this.id} -> CLOSED\`)
  }
}


class Formatter {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Formatter.id required')
    }

    if (!name?.trim()) {
      throw new Error('Formatter.name required')
    }
    console.log(\`[Formatter.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Formatter \${this.id} invalid status\`)
    }
    console.log(\`[Formatter.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Formatter \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Formatter.close] id=\${this.id} -> CLOSED\`)
  }
}

class LoggingFrameworkService {
  private seq = 1
  private loggers = new Map<string, Logger>()
  private log_levels = new Map<string, LogLevel>()
  private log_records = new Map<string, LogRecord>()
  private appenders = new Map<string, Appender>()
  private formatters = new Map<string, Formatter>()
  constructor() {
    console.log('[LoggingFrameworkService.__init__] system ready')
  }

  createLogger(name: string): Logger {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Logger name required')
    }
    const id = \`LOG-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Logger(id, cleaned)
    obj.validate()
    this.loggers.set(id, obj)
    console.log(\`[LoggingFrameworkService.createLogger] stored \${id} count=\${this.loggers.size}\`)
    return obj
  }

  getLogger(id: string): Logger {
    const obj = this.loggers.get(id)
    if (!obj) {
      throw new Error(\`unknown Logger id: \${id}\`)
    }
    console.log(\`[LoggingFrameworkService.getLogger] found id=\${obj.id}\`)
    return obj
  }

  createLogLevel(name: string): LogLevel {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('LogLevel name required')
    }
    const id = \`LOG-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new LogLevel(id, cleaned)
    obj.validate()
    this.log_levels.set(id, obj)
    console.log(\`[LoggingFrameworkService.createLogLevel] stored \${id} count=\${this.log_levels.size}\`)
    return obj
  }

  getLogLevel(id: string): LogLevel {
    const obj = this.log_levels.get(id)
    if (!obj) {
      throw new Error(\`unknown LogLevel id: \${id}\`)
    }
    console.log(\`[LoggingFrameworkService.getLogLevel] found id=\${obj.id}\`)
    return obj
  }

  createLogRecord(name: string): LogRecord {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('LogRecord name required')
    }
    const id = \`LOG-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new LogRecord(id, cleaned)
    obj.validate()
    this.log_records.set(id, obj)
    console.log(\`[LoggingFrameworkService.createLogRecord] stored \${id} count=\${this.log_records.size}\`)
    return obj
  }

  getLogRecord(id: string): LogRecord {
    const obj = this.log_records.get(id)
    if (!obj) {
      throw new Error(\`unknown LogRecord id: \${id}\`)
    }
    console.log(\`[LoggingFrameworkService.getLogRecord] found id=\${obj.id}\`)
    return obj
  }

  createAppender(name: string): Appender {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Appender name required')
    }
    const id = \`APP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Appender(id, cleaned)
    obj.validate()
    this.appenders.set(id, obj)
    console.log(\`[LoggingFrameworkService.createAppender] stored \${id} count=\${this.appenders.size}\`)
    return obj
  }

  getAppender(id: string): Appender {
    const obj = this.appenders.get(id)
    if (!obj) {
      throw new Error(\`unknown Appender id: \${id}\`)
    }
    console.log(\`[LoggingFrameworkService.getAppender] found id=\${obj.id}\`)
    return obj
  }

  createFormatter(name: string): Formatter {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Formatter name required')
    }
    const id = \`FOR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Formatter(id, cleaned)
    obj.validate()
    this.formatters.set(id, obj)
    console.log(\`[LoggingFrameworkService.createFormatter] stored \${id} count=\${this.formatters.size}\`)
    return obj
  }

  getFormatter(id: string): Formatter {
    const obj = this.formatters.get(id)
    if (!obj) {
      throw new Error(\`unknown Formatter id: \${id}\`)
    }
    console.log(\`[LoggingFrameworkService.getFormatter] found id=\${obj.id}\`)
    return obj
  }

  closeLogger(id: string): Logger {
    const obj = this.getLogger(id)
    console.log(\`[LoggingFrameworkService.closeLogger] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveLoggers(): Logger[] {
    const active = [...this.loggers.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[LoggingFrameworkService.listActiveLoggers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct LoggingFrameworkService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new LoggingFrameworkService()
  console.log('========== STEP 2: Create Logger objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createLogger('alpha-logger')
  system.createLogger('beta-logger')
  console.log('========== STEP 3: Create LogLevel ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createLogLevel('sample-log_level')
  console.log('========== STEP 4: Create LogRecord ==========')
  system.createLogRecord('sample-log_record')
  console.log('========== STEP 5: Create Appender ==========')
  system.createAppender('sample-appender')
  console.log('========== STEP 6: Create Formatter ==========')
  system.createFormatter('sample-formatter')
  system.listActiveLoggers()
  console.log('========== Close first Logger ==========')
  system.closeLogger(first.id)
  try {
    system.closeLogger(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getLogger('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Logger {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Logger(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Logger requires id and name");
    }
    cout << "[Logger.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Logger invalid status");
    }
    cout << "[Logger.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Logger cannot close");
    }
    status_ = "CLOSED";
    cout << "[Logger.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class LogLevel {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  LogLevel(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("LogLevel requires id and name");
    }
    cout << "[LogLevel.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("LogLevel invalid status");
    }
    cout << "[LogLevel.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("LogLevel cannot close");
    }
    status_ = "CLOSED";
    cout << "[LogLevel.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class LogRecord {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  LogRecord(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("LogRecord requires id and name");
    }
    cout << "[LogRecord.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("LogRecord invalid status");
    }
    cout << "[LogRecord.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("LogRecord cannot close");
    }
    status_ = "CLOSED";
    cout << "[LogRecord.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Appender {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Appender(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Appender requires id and name");
    }
    cout << "[Appender.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Appender invalid status");
    }
    cout << "[Appender.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Appender cannot close");
    }
    status_ = "CLOSED";
    cout << "[Appender.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Formatter {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Formatter(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Formatter requires id and name");
    }
    cout << "[Formatter.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Formatter invalid status");
    }
    cout << "[Formatter.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Formatter cannot close");
    }
    status_ = "CLOSED";
    cout << "[Formatter.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class LoggingFrameworkService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Logger> loggers_;
  unordered_map<string, LogLevel> log_levels_;
  unordered_map<string, LogRecord> log_records_;
  unordered_map<string, Appender> appenders_;
  unordered_map<string, Formatter> formatters_;
public:
  LoggingFrameworkService() {
    cout << "[LoggingFrameworkService.__init__] system ready" << endl;
  }

  Logger createLogger(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Logger name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LOG-%04d", seq_++);
    Logger obj{buf, name};
    obj.validate();
    loggers_.emplace(obj.id(), obj);
    cout << "[LoggingFrameworkService.createLogger] stored " << obj.id() << endl;
    return obj;
  }

  Logger getLogger(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = loggers_.find(id);
    if (it == loggers_.end()) {
      throw out_of_range("unknown Logger id");
    }
    cout << "[LoggingFrameworkService.getLogger] found " << id << endl;
    return it->second;
  }

  LogLevel createLogLevel(const string& name) {
    if (name.empty()) {
      throw invalid_argument("LogLevel name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LOG-%04d", seq_++);
    LogLevel obj{buf, name};
    obj.validate();
    log_levels_.emplace(obj.id(), obj);
    cout << "[LoggingFrameworkService.createLogLevel] stored " << obj.id() << endl;
    return obj;
  }

  LogLevel getLogLevel(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = log_levels_.find(id);
    if (it == log_levels_.end()) {
      throw out_of_range("unknown LogLevel id");
    }
    cout << "[LoggingFrameworkService.getLogLevel] found " << id << endl;
    return it->second;
  }

  LogRecord createLogRecord(const string& name) {
    if (name.empty()) {
      throw invalid_argument("LogRecord name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LOG-%04d", seq_++);
    LogRecord obj{buf, name};
    obj.validate();
    log_records_.emplace(obj.id(), obj);
    cout << "[LoggingFrameworkService.createLogRecord] stored " << obj.id() << endl;
    return obj;
  }

  LogRecord getLogRecord(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = log_records_.find(id);
    if (it == log_records_.end()) {
      throw out_of_range("unknown LogRecord id");
    }
    cout << "[LoggingFrameworkService.getLogRecord] found " << id << endl;
    return it->second;
  }

  Appender createAppender(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Appender name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "APP-%04d", seq_++);
    Appender obj{buf, name};
    obj.validate();
    appenders_.emplace(obj.id(), obj);
    cout << "[LoggingFrameworkService.createAppender] stored " << obj.id() << endl;
    return obj;
  }

  Appender getAppender(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = appenders_.find(id);
    if (it == appenders_.end()) {
      throw out_of_range("unknown Appender id");
    }
    cout << "[LoggingFrameworkService.getAppender] found " << id << endl;
    return it->second;
  }

  Formatter createFormatter(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Formatter name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FOR-%04d", seq_++);
    Formatter obj{buf, name};
    obj.validate();
    formatters_.emplace(obj.id(), obj);
    cout << "[LoggingFrameworkService.createFormatter] stored " << obj.id() << endl;
    return obj;
  }

  Formatter getFormatter(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = formatters_.find(id);
    if (it == formatters_.end()) {
      throw out_of_range("unknown Formatter id");
    }
    cout << "[LoggingFrameworkService.getFormatter] found " << id << endl;
    return it->second;
  }

  Logger closeLogger(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = loggers_.find(id);
    if (it == loggers_.end()) {
      throw out_of_range("unknown Logger");
    }
    cout << "[LoggingFrameworkService.closeLogger] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct LoggingFrameworkService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  LoggingFrameworkService system;
  cout << "========== STEP 2: Create Logger ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createLogger("alpha-logger");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createLogger("beta-logger");
  system.createLogLevel("sample-log_level");
  system.createLogRecord("sample-log_record");
  system.createAppender("sample-appender");
  system.createFormatter("sample-formatter");
  system.closeLogger(first.id());
  try {
    system.closeLogger(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getLogger("MISSING-ID");
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

type Logger struct {
  ID     string
  Name   string
  Status string
}

func NewLogger(id, name string) (*Logger, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Logger requires id and name")
  }
  obj := &Logger{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Logger.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Logger) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Logger invalid status")
  }
  fmt.Printf("[Logger.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Logger) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Logger %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Logger.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type LogLevel struct {
  ID     string
  Name   string
  Status string
}

func NewLogLevel(id, name string) (*LogLevel, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("LogLevel requires id and name")
  }
  obj := &LogLevel{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[LogLevel.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *LogLevel) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("LogLevel invalid status")
  }
  fmt.Printf("[LogLevel.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *LogLevel) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("LogLevel %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[LogLevel.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type LogRecord struct {
  ID     string
  Name   string
  Status string
}

func NewLogRecord(id, name string) (*LogRecord, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("LogRecord requires id and name")
  }
  obj := &LogRecord{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[LogRecord.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *LogRecord) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("LogRecord invalid status")
  }
  fmt.Printf("[LogRecord.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *LogRecord) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("LogRecord %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[LogRecord.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Appender struct {
  ID     string
  Name   string
  Status string
}

func NewAppender(id, name string) (*Appender, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Appender requires id and name")
  }
  obj := &Appender{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Appender.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Appender) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Appender invalid status")
  }
  fmt.Printf("[Appender.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Appender) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Appender %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Appender.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Formatter struct {
  ID     string
  Name   string
  Status string
}

func NewFormatter(id, name string) (*Formatter, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Formatter requires id and name")
  }
  obj := &Formatter{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Formatter.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Formatter) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Formatter invalid status")
  }
  fmt.Printf("[Formatter.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Formatter) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Formatter %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Formatter.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type LoggingFrameworkService struct {
  mu  sync.Mutex
  seq int
  loggers map[string]*Logger
  log_levels map[string]*LogLevel
  log_records map[string]*LogRecord
  appenders map[string]*Appender
  formatters map[string]*Formatter
}

func NewLoggingFrameworkService() *LoggingFrameworkService {
  fmt.Println("[LoggingFrameworkService.__init__] system ready")
  return &LoggingFrameworkService{
    seq: 1,
    loggers: map[string]*Logger{},
    log_levels: map[string]*LogLevel{},
    log_records: map[string]*LogRecord{},
    appenders: map[string]*Appender{},
    formatters: map[string]*Formatter{},
  }
}

func (s *LoggingFrameworkService) CreateLogger(name string) (*Logger, error) {
  if name == "" {
    return nil, fmt.Errorf("Logger name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LOG-%04d", s.seq)
  s.seq++
  obj, err := NewLogger(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.loggers[id] = obj
  fmt.Printf("[LoggingFrameworkService.CreateLogger] stored %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) GetLogger(id string) (*Logger, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.loggers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Logger id: %s", id)
  }
  fmt.Printf("[LoggingFrameworkService.GetLogger] found %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) CreateLogLevel(name string) (*LogLevel, error) {
  if name == "" {
    return nil, fmt.Errorf("LogLevel name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LOG-%04d", s.seq)
  s.seq++
  obj, err := NewLogLevel(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.log_levels[id] = obj
  fmt.Printf("[LoggingFrameworkService.CreateLogLevel] stored %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) GetLogLevel(id string) (*LogLevel, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.log_levels[id]
  if !ok {
    return nil, fmt.Errorf("unknown LogLevel id: %s", id)
  }
  fmt.Printf("[LoggingFrameworkService.GetLogLevel] found %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) CreateLogRecord(name string) (*LogRecord, error) {
  if name == "" {
    return nil, fmt.Errorf("LogRecord name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LOG-%04d", s.seq)
  s.seq++
  obj, err := NewLogRecord(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.log_records[id] = obj
  fmt.Printf("[LoggingFrameworkService.CreateLogRecord] stored %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) GetLogRecord(id string) (*LogRecord, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.log_records[id]
  if !ok {
    return nil, fmt.Errorf("unknown LogRecord id: %s", id)
  }
  fmt.Printf("[LoggingFrameworkService.GetLogRecord] found %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) CreateAppender(name string) (*Appender, error) {
  if name == "" {
    return nil, fmt.Errorf("Appender name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("APP-%04d", s.seq)
  s.seq++
  obj, err := NewAppender(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.appenders[id] = obj
  fmt.Printf("[LoggingFrameworkService.CreateAppender] stored %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) GetAppender(id string) (*Appender, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.appenders[id]
  if !ok {
    return nil, fmt.Errorf("unknown Appender id: %s", id)
  }
  fmt.Printf("[LoggingFrameworkService.GetAppender] found %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) CreateFormatter(name string) (*Formatter, error) {
  if name == "" {
    return nil, fmt.Errorf("Formatter name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FOR-%04d", s.seq)
  s.seq++
  obj, err := NewFormatter(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.formatters[id] = obj
  fmt.Printf("[LoggingFrameworkService.CreateFormatter] stored %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) GetFormatter(id string) (*Formatter, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.formatters[id]
  if !ok {
    return nil, fmt.Errorf("unknown Formatter id: %s", id)
  }
  fmt.Printf("[LoggingFrameworkService.GetFormatter] found %s\\n", id)
  return obj, nil
}

func (s *LoggingFrameworkService) CloseLogger(id string) (*Logger, error) {
  obj, err := s.GetLogger(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[LoggingFrameworkService.CloseLogger] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct LoggingFrameworkService ==========")
  system := NewLoggingFrameworkService()
  fmt.Println("========== STEP 2: Create Logger ==========")
  first, _ := system.CreateLogger("alpha-logger")
  system.CreateLogger("beta-logger")
  system.CreateLogLevel("sample-log_level")
  system.CreateLogRecord("sample-log_record")
  system.CreateAppender("sample-appender")
  system.CreateFormatter("sample-formatter")
  system.CloseLogger(first.ID)
  if _, err := system.CloseLogger(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetLogger("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Logger {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Logger(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Logger requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Logger.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Logger invalid status");
    }
    Console.WriteLine("[Logger.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Logger " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Logger.close] id=" + Id + " -> CLOSED");
  }
}


sealed class LogLevel {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public LogLevel(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LogLevel requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[LogLevel.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("LogLevel invalid status");
    }
    Console.WriteLine("[LogLevel.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("LogLevel " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[LogLevel.close] id=" + Id + " -> CLOSED");
  }
}


sealed class LogRecord {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public LogRecord(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LogRecord requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[LogRecord.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("LogRecord invalid status");
    }
    Console.WriteLine("[LogRecord.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("LogRecord " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[LogRecord.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Appender {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Appender(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Appender requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Appender.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Appender invalid status");
    }
    Console.WriteLine("[Appender.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Appender " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Appender.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Formatter {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Formatter(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Formatter requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Formatter.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Formatter invalid status");
    }
    Console.WriteLine("[Formatter.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Formatter " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Formatter.close] id=" + Id + " -> CLOSED");
  }
}

sealed class LoggingFrameworkService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Logger> _loggers = new();
  private readonly Dictionary<string, LogLevel> _log_levels = new();
  private readonly Dictionary<string, LogRecord> _log_records = new();
  private readonly Dictionary<string, Appender> _appenders = new();
  private readonly Dictionary<string, Formatter> _formatters = new();
  public LoggingFrameworkService() {
    Console.WriteLine("[LoggingFrameworkService.__init__] system ready");
  }

  public Logger CreateLogger(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Logger name required");
    }
    lock (_gate) {
      var id = string.Format("LOG-{0:D4}", _seq++);
      var obj = new Logger(id, name.Trim());
      obj.Validate();
      _loggers[id] = obj;
      Console.WriteLine("[LoggingFrameworkService.CreateLogger] stored " + id);
      return obj;
    }
  }

  public Logger GetLogger(string id) {
    lock (_gate) {
      if (!_loggers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Logger id: " + id);
      }
      Console.WriteLine("[LoggingFrameworkService.GetLogger] found " + id);
      return obj;
    }
  }

  public LogLevel CreateLogLevel(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LogLevel name required");
    }
    lock (_gate) {
      var id = string.Format("LOG-{0:D4}", _seq++);
      var obj = new LogLevel(id, name.Trim());
      obj.Validate();
      _log_levels[id] = obj;
      Console.WriteLine("[LoggingFrameworkService.CreateLogLevel] stored " + id);
      return obj;
    }
  }

  public LogLevel GetLogLevel(string id) {
    lock (_gate) {
      if (!_log_levels.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown LogLevel id: " + id);
      }
      Console.WriteLine("[LoggingFrameworkService.GetLogLevel] found " + id);
      return obj;
    }
  }

  public LogRecord CreateLogRecord(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LogRecord name required");
    }
    lock (_gate) {
      var id = string.Format("LOG-{0:D4}", _seq++);
      var obj = new LogRecord(id, name.Trim());
      obj.Validate();
      _log_records[id] = obj;
      Console.WriteLine("[LoggingFrameworkService.CreateLogRecord] stored " + id);
      return obj;
    }
  }

  public LogRecord GetLogRecord(string id) {
    lock (_gate) {
      if (!_log_records.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown LogRecord id: " + id);
      }
      Console.WriteLine("[LoggingFrameworkService.GetLogRecord] found " + id);
      return obj;
    }
  }

  public Appender CreateAppender(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Appender name required");
    }
    lock (_gate) {
      var id = string.Format("APP-{0:D4}", _seq++);
      var obj = new Appender(id, name.Trim());
      obj.Validate();
      _appenders[id] = obj;
      Console.WriteLine("[LoggingFrameworkService.CreateAppender] stored " + id);
      return obj;
    }
  }

  public Appender GetAppender(string id) {
    lock (_gate) {
      if (!_appenders.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Appender id: " + id);
      }
      Console.WriteLine("[LoggingFrameworkService.GetAppender] found " + id);
      return obj;
    }
  }

  public Formatter CreateFormatter(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Formatter name required");
    }
    lock (_gate) {
      var id = string.Format("FOR-{0:D4}", _seq++);
      var obj = new Formatter(id, name.Trim());
      obj.Validate();
      _formatters[id] = obj;
      Console.WriteLine("[LoggingFrameworkService.CreateFormatter] stored " + id);
      return obj;
    }
  }

  public Formatter GetFormatter(string id) {
    lock (_gate) {
      if (!_formatters.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Formatter id: " + id);
      }
      Console.WriteLine("[LoggingFrameworkService.GetFormatter] found " + id);
      return obj;
    }
  }

  public Logger CloseLogger(string id) {
    var obj = GetLogger(id);
    Console.WriteLine("[LoggingFrameworkService.CloseLogger] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct LoggingFrameworkService ==========");
    var system = new LoggingFrameworkService();
    Console.WriteLine("========== STEP 2: Create Logger ==========");
    var first = system.CreateLogger("alpha-logger");
    system.CreateLogger("beta-logger");
    system.CreateLogLevel("sample-log_level");
    system.CreateLogRecord("sample-log_record");
    system.CreateAppender("sample-appender");
    system.CreateFormatter("sample-formatter");
    system.CloseLogger(first.Id);
    try {
      system.CloseLogger(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetLogger("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const loggingFrameworkSolution: ProblemSolution = {
  slug: 'logging-framework',
  title: 'Logging Framework - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a logging framework like Log4j or SLF4J — supporting multiple log levels, configurable sinks, and formatted output. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Log at levels: DEBUG, INFO, WARN, ERROR, FATAL',
      'Filter messages below the configured minimum level',
      'Support multiple sinks: console, file, remote server',
      'Format log messages: timestamp, level, logger name, message',
      'Named loggers per module/class for fine-grained control',
      'Async logging to avoid blocking the main thread',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Log at levels: DEBUG, INFO, WARN, ERROR, FATAL?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Filter messages below the configured minimum level?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support multiple sinks: console, file, remote server?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Format log messages: timestamp, level, logger name, message?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Named loggers per module/class for fine-grained control?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. LoggingFrameworkService is the facade stereotype. Logger, LogLevel, LogRecord, Appender, Formatter are concrete domain classes with id/name/status and validate/close.',
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
          'Construct LoggingFrameworkService.',
          'createLogger twice and create the related UML classes.',
          'closeLogger once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'LoggingFrameworkService', responsibility: 'UML facade - orchestrates Logging Framework.', keyMembers: ['create*', 'get*', 'closeLogger'] },
    { name: 'Logger', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LogLevel', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LogRecord', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Appender', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Formatter', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from LoggingFrameworkService to Logger, LogLevel, LogRecord, Appender, Formatter. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on LoggingFrameworkService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'LoggingFrameworkService', responsibility: 'UML facade - orchestrates Logging Framework.', keyMembers: ['create*', 'get*', 'closeLogger'] },
    { name: 'Logger', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LogLevel', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LogRecord', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Appender', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Formatter', responsibility: 'UML class - domain object for Logging Framework.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'LoggingFrameworkService exposes create/get/close and owns composed collections.' },
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
      'main constructs LoggingFrameworkService, creates UML domain objects, closes the primary Logger, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct LoggingFrameworkService.',
      'createLogger for alpha and beta.',
      'create remaining UML classes.',
      'closeLogger(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createLogger("alpha..."); closeLogger(id)',
        output: '[Logger.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeLogger(alreadyClosed) or getLogger("MISSING-ID")',
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
