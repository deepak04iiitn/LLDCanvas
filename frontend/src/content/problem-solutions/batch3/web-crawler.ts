import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'WebCrawlerService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_urlfrontiers', 'Map<string, URLFrontier>'),
    attr('-', '_fetchers', 'Map<string, Fetcher>'),
    attr('-', '_parsers', 'Map<string, Parser>'),
    attr('-', '_duplicate_detectors', 'Map<string, DuplicateDetector>'),
    attr('-', '_storages', 'Map<string, Storage>'),
  ], [
    method('+', 'createURLFrontier', 'name: string', 'URLFrontier'),
    method('+', 'createFetcher', 'name: string', 'Fetcher'),
    method('+', 'createParser', 'name: string', 'Parser'),
    method('+', 'createDuplicateDetector', 'name: string', 'DuplicateDetector'),
    method('+', 'createStorage', 'name: string', 'Storage'),
    method('+', 'getURLFrontier', 'id: string', 'URLFrontier'),
    method('+', 'getFetcher', 'id: string', 'Fetcher'),
    method('+', 'getParser', 'id: string', 'Parser'),
    method('+', 'getDuplicateDetector', 'id: string', 'DuplicateDetector'),
    method('+', 'getStorage', 'id: string', 'Storage'),
    method('+', 'closeURLFrontier', 'id: string', 'URLFrontier'),
  ], 'facade'),
  cls('n1', 'URLFrontier', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Fetcher', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Parser', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'DuplicateDetector', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Storage', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("web-crawler")


class URLFrontier:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("URLFrontier.id is required")
        if not name or not name.strip():
            raise ValueError("URLFrontier.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[URLFrontier.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"URLFrontier {self.id} has invalid status={self.status}")
        log.info("[URLFrontier.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"URLFrontier {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[URLFrontier.close] id=%s -> CLOSED", self.id)


class Fetcher:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Fetcher.id is required")
        if not name or not name.strip():
            raise ValueError("Fetcher.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Fetcher.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Fetcher {self.id} has invalid status={self.status}")
        log.info("[Fetcher.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Fetcher {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Fetcher.close] id=%s -> CLOSED", self.id)


class Parser:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Parser.id is required")
        if not name or not name.strip():
            raise ValueError("Parser.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Parser.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Parser {self.id} has invalid status={self.status}")
        log.info("[Parser.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Parser {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Parser.close] id=%s -> CLOSED", self.id)


class DuplicateDetector:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("DuplicateDetector.id is required")
        if not name or not name.strip():
            raise ValueError("DuplicateDetector.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[DuplicateDetector.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"DuplicateDetector {self.id} has invalid status={self.status}")
        log.info("[DuplicateDetector.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"DuplicateDetector {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[DuplicateDetector.close] id=%s -> CLOSED", self.id)


class Storage:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Storage.id is required")
        if not name or not name.strip():
            raise ValueError("Storage.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Storage.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Storage {self.id} has invalid status={self.status}")
        log.info("[Storage.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Storage {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Storage.close] id=%s -> CLOSED", self.id)


class WebCrawlerService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._urlfrontiers: Dict[str, URLFrontier] = {}
        self._fetchers: Dict[str, Fetcher] = {}
        self._parsers: Dict[str, Parser] = {}
        self._duplicate_detectors: Dict[str, DuplicateDetector] = {}
        self._storages: Dict[str, Storage] = {}
        log.info("[WebCrawlerService.__init__] system ready; managing: URLFrontier, Fetcher, Parser, DuplicateDetector, Storage")

    def create_urlfrontier(self, name: str) -> URLFrontier:
        """UML: WebCrawlerService.create_urlfrontier(name) -> URLFrontier"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("URLFrontier name is required")
        with self._lock:
            item_id = f"URL-{self._seq:04d}"
            self._seq += 1
            obj = URLFrontier(item_id, cleaned)
            obj.validate()
            self._urlfrontiers[item_id] = obj
            log.info("[WebCrawlerService.create_urlfrontier] stored %s in _urlfrontiers (count=%s)", item_id, len(self._urlfrontiers))
            return obj

    def get_urlfrontier(self, item_id: str) -> URLFrontier:
        with self._lock:
            obj = self._urlfrontiers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown URLFrontier id: {item_id}")
            log.info("[WebCrawlerService.get_urlfrontier] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_fetcher(self, name: str) -> Fetcher:
        """UML: WebCrawlerService.create_fetcher(name) -> Fetcher"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Fetcher name is required")
        with self._lock:
            item_id = f"FET-{self._seq:04d}"
            self._seq += 1
            obj = Fetcher(item_id, cleaned)
            obj.validate()
            self._fetchers[item_id] = obj
            log.info("[WebCrawlerService.create_fetcher] stored %s in _fetchers (count=%s)", item_id, len(self._fetchers))
            return obj

    def get_fetcher(self, item_id: str) -> Fetcher:
        with self._lock:
            obj = self._fetchers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Fetcher id: {item_id}")
            log.info("[WebCrawlerService.get_fetcher] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_parser(self, name: str) -> Parser:
        """UML: WebCrawlerService.create_parser(name) -> Parser"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Parser name is required")
        with self._lock:
            item_id = f"PAR-{self._seq:04d}"
            self._seq += 1
            obj = Parser(item_id, cleaned)
            obj.validate()
            self._parsers[item_id] = obj
            log.info("[WebCrawlerService.create_parser] stored %s in _parsers (count=%s)", item_id, len(self._parsers))
            return obj

    def get_parser(self, item_id: str) -> Parser:
        with self._lock:
            obj = self._parsers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Parser id: {item_id}")
            log.info("[WebCrawlerService.get_parser] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_duplicate_detector(self, name: str) -> DuplicateDetector:
        """UML: WebCrawlerService.create_duplicate_detector(name) -> DuplicateDetector"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("DuplicateDetector name is required")
        with self._lock:
            item_id = f"DUP-{self._seq:04d}"
            self._seq += 1
            obj = DuplicateDetector(item_id, cleaned)
            obj.validate()
            self._duplicate_detectors[item_id] = obj
            log.info("[WebCrawlerService.create_duplicate_detector] stored %s in _duplicate_detectors (count=%s)", item_id, len(self._duplicate_detectors))
            return obj

    def get_duplicate_detector(self, item_id: str) -> DuplicateDetector:
        with self._lock:
            obj = self._duplicate_detectors.get(item_id)
            if obj is None:
                raise KeyError(f"unknown DuplicateDetector id: {item_id}")
            log.info("[WebCrawlerService.get_duplicate_detector] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_storage(self, name: str) -> Storage:
        """UML: WebCrawlerService.create_storage(name) -> Storage"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Storage name is required")
        with self._lock:
            item_id = f"STO-{self._seq:04d}"
            self._seq += 1
            obj = Storage(item_id, cleaned)
            obj.validate()
            self._storages[item_id] = obj
            log.info("[WebCrawlerService.create_storage] stored %s in _storages (count=%s)", item_id, len(self._storages))
            return obj

    def get_storage(self, item_id: str) -> Storage:
        with self._lock:
            obj = self._storages.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Storage id: {item_id}")
            log.info("[WebCrawlerService.get_storage] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_urlfrontier(self, item_id: str) -> URLFrontier:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._urlfrontiers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown URLFrontier id: {item_id}")
            log.info("[WebCrawlerService.close_urlfrontier] closing %s via URLFrontier.close()", item_id)
            obj.close()
            return obj

    def list_active_urlfrontiers(self) -> List[URLFrontier]:
        with self._lock:
            active = [o for o in self._urlfrontiers.values() if o.status == "ACTIVE"]
            log.info("[WebCrawlerService.list_active_urlfrontiers] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct WebCrawlerService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = WebCrawlerService()

    log.info("========== STEP 2: Create primary URLFrontier objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_urlfrontier("alpha-urlfrontier")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_urlfrontier("beta-urlfrontier")

    log.info("========== STEP 3: Create Fetcher (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_fetcher("sample-fetcher")

    log.info("========== STEP 4: Create Parser (UML class) ==========")
    system.create_parser("sample-parser")

    log.info("========== STEP 5: Create DuplicateDetector (UML class) ==========")
    system.create_duplicate_detector("sample-duplicate_detector")

    log.info("========== STEP 6: Create Storage (UML class) ==========")
    system.create_storage("sample-storage")

    log.info("========== STEP 7: Inspect active URLFrontier list ==========")
    system.list_active_urlfrontiers()

    log.info("========== STEP 8: Close first URLFrontier ==========")
    system.close_urlfrontier(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_urlfrontier(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from URLFrontier.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_urlfrontier("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_urlfrontier: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_urlfrontiers()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class URLFrontier {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  URLFrontier(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("URLFrontier.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("URLFrontier.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[URLFrontier.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("URLFrontier " + id + " invalid status");
    }
    System.out.println("[URLFrontier.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("URLFrontier " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[URLFrontier.close] id=" + id + " -> CLOSED");
  }
}


class Fetcher {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Fetcher(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Fetcher.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Fetcher.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Fetcher.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Fetcher " + id + " invalid status");
    }
    System.out.println("[Fetcher.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Fetcher " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Fetcher.close] id=" + id + " -> CLOSED");
  }
}


class Parser {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Parser(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Parser.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Parser.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Parser.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Parser " + id + " invalid status");
    }
    System.out.println("[Parser.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Parser " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Parser.close] id=" + id + " -> CLOSED");
  }
}


class DuplicateDetector {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  DuplicateDetector(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("DuplicateDetector.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DuplicateDetector.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[DuplicateDetector.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("DuplicateDetector " + id + " invalid status");
    }
    System.out.println("[DuplicateDetector.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("DuplicateDetector " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[DuplicateDetector.close] id=" + id + " -> CLOSED");
  }
}


class Storage {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Storage(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Storage.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Storage.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Storage.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Storage " + id + " invalid status");
    }
    System.out.println("[Storage.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Storage " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Storage.close] id=" + id + " -> CLOSED");
  }
}

public class WebCrawlerService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, URLFrontier> urlfrontiers = new LinkedHashMap<>();
  private final Map<String, Fetcher> fetchers = new LinkedHashMap<>();
  private final Map<String, Parser> parsers = new LinkedHashMap<>();
  private final Map<String, DuplicateDetector> duplicate_detectors = new LinkedHashMap<>();
  private final Map<String, Storage> storages = new LinkedHashMap<>();

  public WebCrawlerService() {
    System.out.println("[WebCrawlerService.__init__] system ready");
  }

  public URLFrontier createURLFrontier(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("URLFrontier name required");
    }
    lock.lock();
    try {
      String id = String.format("URL-%04d", seq++);
      URLFrontier obj = new URLFrontier(id, name.trim());
      obj.validate();
      urlfrontiers.put(id, obj);
      System.out.println("[WebCrawlerService.createURLFrontier] stored " + id + " count=" + urlfrontiers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public URLFrontier getURLFrontier(String id) {
    lock.lock();
    try {
      URLFrontier obj = urlfrontiers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown URLFrontier id: " + id);
      }
      System.out.println("[WebCrawlerService.getURLFrontier] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Fetcher createFetcher(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Fetcher name required");
    }
    lock.lock();
    try {
      String id = String.format("FET-%04d", seq++);
      Fetcher obj = new Fetcher(id, name.trim());
      obj.validate();
      fetchers.put(id, obj);
      System.out.println("[WebCrawlerService.createFetcher] stored " + id + " count=" + fetchers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Fetcher getFetcher(String id) {
    lock.lock();
    try {
      Fetcher obj = fetchers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Fetcher id: " + id);
      }
      System.out.println("[WebCrawlerService.getFetcher] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Parser createParser(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Parser name required");
    }
    lock.lock();
    try {
      String id = String.format("PAR-%04d", seq++);
      Parser obj = new Parser(id, name.trim());
      obj.validate();
      parsers.put(id, obj);
      System.out.println("[WebCrawlerService.createParser] stored " + id + " count=" + parsers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Parser getParser(String id) {
    lock.lock();
    try {
      Parser obj = parsers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Parser id: " + id);
      }
      System.out.println("[WebCrawlerService.getParser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public DuplicateDetector createDuplicateDetector(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DuplicateDetector name required");
    }
    lock.lock();
    try {
      String id = String.format("DUP-%04d", seq++);
      DuplicateDetector obj = new DuplicateDetector(id, name.trim());
      obj.validate();
      duplicate_detectors.put(id, obj);
      System.out.println("[WebCrawlerService.createDuplicateDetector] stored " + id + " count=" + duplicate_detectors.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public DuplicateDetector getDuplicateDetector(String id) {
    lock.lock();
    try {
      DuplicateDetector obj = duplicate_detectors.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown DuplicateDetector id: " + id);
      }
      System.out.println("[WebCrawlerService.getDuplicateDetector] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Storage createStorage(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Storage name required");
    }
    lock.lock();
    try {
      String id = String.format("STO-%04d", seq++);
      Storage obj = new Storage(id, name.trim());
      obj.validate();
      storages.put(id, obj);
      System.out.println("[WebCrawlerService.createStorage] stored " + id + " count=" + storages.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Storage getStorage(String id) {
    lock.lock();
    try {
      Storage obj = storages.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Storage id: " + id);
      }
      System.out.println("[WebCrawlerService.getStorage] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public URLFrontier closeURLFrontier(String id) {
    lock.lock();
    try {
      URLFrontier obj = urlfrontiers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown URLFrontier id: " + id);
      }
      System.out.println("[WebCrawlerService.closeURLFrontier] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<URLFrontier> listActiveURLFrontiers() {
    lock.lock();
    try {
      List<URLFrontier> out = new ArrayList<>();
      for (URLFrontier o : urlfrontiers.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[WebCrawlerService.listActiveURLFrontiers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct WebCrawlerService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    WebCrawlerService system = new WebCrawlerService();
    System.out.println("========== STEP 2: Create URLFrontier objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    URLFrontier first = system.createURLFrontier("alpha-urlfrontier");
    system.createURLFrontier("beta-urlfrontier");
    System.out.println("========== STEP 3: Create Fetcher ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createFetcher("sample-fetcher");
    System.out.println("========== STEP 4: Create Parser ==========");
    system.createParser("sample-parser");
    System.out.println("========== STEP 5: Create DuplicateDetector ==========");
    system.createDuplicateDetector("sample-duplicate_detector");
    System.out.println("========== STEP 6: Create Storage ==========");
    system.createStorage("sample-storage");
    System.out.println("========== Inspect active list ==========");
    system.listActiveURLFrontiers();
    System.out.println("========== Close first URLFrontier ==========");
    system.closeURLFrontier(first.getId());
    try {
      system.closeURLFrontier(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getURLFrontier("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class URLFrontier {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('URLFrontier.id required')
    }

    if (!name?.trim()) {
      throw new Error('URLFrontier.name required')
    }
    console.log(\`[URLFrontier.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`URLFrontier \${this.id} invalid status\`)
    }
    console.log(\`[URLFrontier.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`URLFrontier \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[URLFrontier.close] id=\${this.id} -> CLOSED\`)
  }
}


class Fetcher {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Fetcher.id required')
    }

    if (!name?.trim()) {
      throw new Error('Fetcher.name required')
    }
    console.log(\`[Fetcher.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Fetcher \${this.id} invalid status\`)
    }
    console.log(\`[Fetcher.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Fetcher \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Fetcher.close] id=\${this.id} -> CLOSED\`)
  }
}


class Parser {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Parser.id required')
    }

    if (!name?.trim()) {
      throw new Error('Parser.name required')
    }
    console.log(\`[Parser.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Parser \${this.id} invalid status\`)
    }
    console.log(\`[Parser.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Parser \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Parser.close] id=\${this.id} -> CLOSED\`)
  }
}


class DuplicateDetector {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('DuplicateDetector.id required')
    }

    if (!name?.trim()) {
      throw new Error('DuplicateDetector.name required')
    }
    console.log(\`[DuplicateDetector.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`DuplicateDetector \${this.id} invalid status\`)
    }
    console.log(\`[DuplicateDetector.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`DuplicateDetector \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[DuplicateDetector.close] id=\${this.id} -> CLOSED\`)
  }
}


class Storage {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Storage.id required')
    }

    if (!name?.trim()) {
      throw new Error('Storage.name required')
    }
    console.log(\`[Storage.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Storage \${this.id} invalid status\`)
    }
    console.log(\`[Storage.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Storage \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Storage.close] id=\${this.id} -> CLOSED\`)
  }
}

class WebCrawlerService {
  private seq = 1
  private urlfrontiers = new Map<string, URLFrontier>()
  private fetchers = new Map<string, Fetcher>()
  private parsers = new Map<string, Parser>()
  private duplicate_detectors = new Map<string, DuplicateDetector>()
  private storages = new Map<string, Storage>()
  constructor() {
    console.log('[WebCrawlerService.__init__] system ready')
  }

  createURLFrontier(name: string): URLFrontier {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('URLFrontier name required')
    }
    const id = \`URL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new URLFrontier(id, cleaned)
    obj.validate()
    this.urlfrontiers.set(id, obj)
    console.log(\`[WebCrawlerService.createURLFrontier] stored \${id} count=\${this.urlfrontiers.size}\`)
    return obj
  }

  getURLFrontier(id: string): URLFrontier {
    const obj = this.urlfrontiers.get(id)
    if (!obj) {
      throw new Error(\`unknown URLFrontier id: \${id}\`)
    }
    console.log(\`[WebCrawlerService.getURLFrontier] found id=\${obj.id}\`)
    return obj
  }

  createFetcher(name: string): Fetcher {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Fetcher name required')
    }
    const id = \`FET-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Fetcher(id, cleaned)
    obj.validate()
    this.fetchers.set(id, obj)
    console.log(\`[WebCrawlerService.createFetcher] stored \${id} count=\${this.fetchers.size}\`)
    return obj
  }

  getFetcher(id: string): Fetcher {
    const obj = this.fetchers.get(id)
    if (!obj) {
      throw new Error(\`unknown Fetcher id: \${id}\`)
    }
    console.log(\`[WebCrawlerService.getFetcher] found id=\${obj.id}\`)
    return obj
  }

  createParser(name: string): Parser {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Parser name required')
    }
    const id = \`PAR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Parser(id, cleaned)
    obj.validate()
    this.parsers.set(id, obj)
    console.log(\`[WebCrawlerService.createParser] stored \${id} count=\${this.parsers.size}\`)
    return obj
  }

  getParser(id: string): Parser {
    const obj = this.parsers.get(id)
    if (!obj) {
      throw new Error(\`unknown Parser id: \${id}\`)
    }
    console.log(\`[WebCrawlerService.getParser] found id=\${obj.id}\`)
    return obj
  }

  createDuplicateDetector(name: string): DuplicateDetector {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('DuplicateDetector name required')
    }
    const id = \`DUP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new DuplicateDetector(id, cleaned)
    obj.validate()
    this.duplicate_detectors.set(id, obj)
    console.log(\`[WebCrawlerService.createDuplicateDetector] stored \${id} count=\${this.duplicate_detectors.size}\`)
    return obj
  }

  getDuplicateDetector(id: string): DuplicateDetector {
    const obj = this.duplicate_detectors.get(id)
    if (!obj) {
      throw new Error(\`unknown DuplicateDetector id: \${id}\`)
    }
    console.log(\`[WebCrawlerService.getDuplicateDetector] found id=\${obj.id}\`)
    return obj
  }

  createStorage(name: string): Storage {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Storage name required')
    }
    const id = \`STO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Storage(id, cleaned)
    obj.validate()
    this.storages.set(id, obj)
    console.log(\`[WebCrawlerService.createStorage] stored \${id} count=\${this.storages.size}\`)
    return obj
  }

  getStorage(id: string): Storage {
    const obj = this.storages.get(id)
    if (!obj) {
      throw new Error(\`unknown Storage id: \${id}\`)
    }
    console.log(\`[WebCrawlerService.getStorage] found id=\${obj.id}\`)
    return obj
  }

  closeURLFrontier(id: string): URLFrontier {
    const obj = this.getURLFrontier(id)
    console.log(\`[WebCrawlerService.closeURLFrontier] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveURLFrontiers(): URLFrontier[] {
    const active = [...this.urlfrontiers.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[WebCrawlerService.listActiveURLFrontiers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct WebCrawlerService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new WebCrawlerService()
  console.log('========== STEP 2: Create URLFrontier objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createURLFrontier('alpha-urlfrontier')
  system.createURLFrontier('beta-urlfrontier')
  console.log('========== STEP 3: Create Fetcher ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createFetcher('sample-fetcher')
  console.log('========== STEP 4: Create Parser ==========')
  system.createParser('sample-parser')
  console.log('========== STEP 5: Create DuplicateDetector ==========')
  system.createDuplicateDetector('sample-duplicate_detector')
  console.log('========== STEP 6: Create Storage ==========')
  system.createStorage('sample-storage')
  system.listActiveURLFrontiers()
  console.log('========== Close first URLFrontier ==========')
  system.closeURLFrontier(first.id)
  try {
    system.closeURLFrontier(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getURLFrontier('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class URLFrontier {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  URLFrontier(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("URLFrontier requires id and name");
    }
    cout << "[URLFrontier.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("URLFrontier invalid status");
    }
    cout << "[URLFrontier.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("URLFrontier cannot close");
    }
    status_ = "CLOSED";
    cout << "[URLFrontier.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Fetcher {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Fetcher(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Fetcher requires id and name");
    }
    cout << "[Fetcher.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Fetcher invalid status");
    }
    cout << "[Fetcher.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Fetcher cannot close");
    }
    status_ = "CLOSED";
    cout << "[Fetcher.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Parser {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Parser(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Parser requires id and name");
    }
    cout << "[Parser.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Parser invalid status");
    }
    cout << "[Parser.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Parser cannot close");
    }
    status_ = "CLOSED";
    cout << "[Parser.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class DuplicateDetector {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  DuplicateDetector(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("DuplicateDetector requires id and name");
    }
    cout << "[DuplicateDetector.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("DuplicateDetector invalid status");
    }
    cout << "[DuplicateDetector.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("DuplicateDetector cannot close");
    }
    status_ = "CLOSED";
    cout << "[DuplicateDetector.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Storage {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Storage(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Storage requires id and name");
    }
    cout << "[Storage.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Storage invalid status");
    }
    cout << "[Storage.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Storage cannot close");
    }
    status_ = "CLOSED";
    cout << "[Storage.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class WebCrawlerService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, URLFrontier> urlfrontiers_;
  unordered_map<string, Fetcher> fetchers_;
  unordered_map<string, Parser> parsers_;
  unordered_map<string, DuplicateDetector> duplicate_detectors_;
  unordered_map<string, Storage> storages_;
public:
  WebCrawlerService() {
    cout << "[WebCrawlerService.__init__] system ready" << endl;
  }

  URLFrontier createURLFrontier(const string& name) {
    if (name.empty()) {
      throw invalid_argument("URLFrontier name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "URL-%04d", seq_++);
    URLFrontier obj{buf, name};
    obj.validate();
    urlfrontiers_.emplace(obj.id(), obj);
    cout << "[WebCrawlerService.createURLFrontier] stored " << obj.id() << endl;
    return obj;
  }

  URLFrontier getURLFrontier(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = urlfrontiers_.find(id);
    if (it == urlfrontiers_.end()) {
      throw out_of_range("unknown URLFrontier id");
    }
    cout << "[WebCrawlerService.getURLFrontier] found " << id << endl;
    return it->second;
  }

  Fetcher createFetcher(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Fetcher name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FET-%04d", seq_++);
    Fetcher obj{buf, name};
    obj.validate();
    fetchers_.emplace(obj.id(), obj);
    cout << "[WebCrawlerService.createFetcher] stored " << obj.id() << endl;
    return obj;
  }

  Fetcher getFetcher(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = fetchers_.find(id);
    if (it == fetchers_.end()) {
      throw out_of_range("unknown Fetcher id");
    }
    cout << "[WebCrawlerService.getFetcher] found " << id << endl;
    return it->second;
  }

  Parser createParser(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Parser name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PAR-%04d", seq_++);
    Parser obj{buf, name};
    obj.validate();
    parsers_.emplace(obj.id(), obj);
    cout << "[WebCrawlerService.createParser] stored " << obj.id() << endl;
    return obj;
  }

  Parser getParser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = parsers_.find(id);
    if (it == parsers_.end()) {
      throw out_of_range("unknown Parser id");
    }
    cout << "[WebCrawlerService.getParser] found " << id << endl;
    return it->second;
  }

  DuplicateDetector createDuplicateDetector(const string& name) {
    if (name.empty()) {
      throw invalid_argument("DuplicateDetector name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DUP-%04d", seq_++);
    DuplicateDetector obj{buf, name};
    obj.validate();
    duplicate_detectors_.emplace(obj.id(), obj);
    cout << "[WebCrawlerService.createDuplicateDetector] stored " << obj.id() << endl;
    return obj;
  }

  DuplicateDetector getDuplicateDetector(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = duplicate_detectors_.find(id);
    if (it == duplicate_detectors_.end()) {
      throw out_of_range("unknown DuplicateDetector id");
    }
    cout << "[WebCrawlerService.getDuplicateDetector] found " << id << endl;
    return it->second;
  }

  Storage createStorage(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Storage name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "STO-%04d", seq_++);
    Storage obj{buf, name};
    obj.validate();
    storages_.emplace(obj.id(), obj);
    cout << "[WebCrawlerService.createStorage] stored " << obj.id() << endl;
    return obj;
  }

  Storage getStorage(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = storages_.find(id);
    if (it == storages_.end()) {
      throw out_of_range("unknown Storage id");
    }
    cout << "[WebCrawlerService.getStorage] found " << id << endl;
    return it->second;
  }

  URLFrontier closeURLFrontier(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = urlfrontiers_.find(id);
    if (it == urlfrontiers_.end()) {
      throw out_of_range("unknown URLFrontier");
    }
    cout << "[WebCrawlerService.closeURLFrontier] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct WebCrawlerService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  WebCrawlerService system;
  cout << "========== STEP 2: Create URLFrontier ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createURLFrontier("alpha-urlfrontier");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createURLFrontier("beta-urlfrontier");
  system.createFetcher("sample-fetcher");
  system.createParser("sample-parser");
  system.createDuplicateDetector("sample-duplicate_detector");
  system.createStorage("sample-storage");
  system.closeURLFrontier(first.id());
  try {
    system.closeURLFrontier(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getURLFrontier("MISSING-ID");
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

type URLFrontier struct {
  ID     string
  Name   string
  Status string
}

func NewURLFrontier(id, name string) (*URLFrontier, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("URLFrontier requires id and name")
  }
  obj := &URLFrontier{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[URLFrontier.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *URLFrontier) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("URLFrontier invalid status")
  }
  fmt.Printf("[URLFrontier.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *URLFrontier) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("URLFrontier %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[URLFrontier.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Fetcher struct {
  ID     string
  Name   string
  Status string
}

func NewFetcher(id, name string) (*Fetcher, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Fetcher requires id and name")
  }
  obj := &Fetcher{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Fetcher.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Fetcher) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Fetcher invalid status")
  }
  fmt.Printf("[Fetcher.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Fetcher) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Fetcher %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Fetcher.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Parser struct {
  ID     string
  Name   string
  Status string
}

func NewParser(id, name string) (*Parser, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Parser requires id and name")
  }
  obj := &Parser{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Parser.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Parser) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Parser invalid status")
  }
  fmt.Printf("[Parser.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Parser) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Parser %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Parser.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type DuplicateDetector struct {
  ID     string
  Name   string
  Status string
}

func NewDuplicateDetector(id, name string) (*DuplicateDetector, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("DuplicateDetector requires id and name")
  }
  obj := &DuplicateDetector{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[DuplicateDetector.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *DuplicateDetector) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("DuplicateDetector invalid status")
  }
  fmt.Printf("[DuplicateDetector.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *DuplicateDetector) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("DuplicateDetector %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[DuplicateDetector.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Storage struct {
  ID     string
  Name   string
  Status string
}

func NewStorage(id, name string) (*Storage, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Storage requires id and name")
  }
  obj := &Storage{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Storage.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Storage) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Storage invalid status")
  }
  fmt.Printf("[Storage.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Storage) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Storage %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Storage.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type WebCrawlerService struct {
  mu  sync.Mutex
  seq int
  urlfrontiers map[string]*URLFrontier
  fetchers map[string]*Fetcher
  parsers map[string]*Parser
  duplicate_detectors map[string]*DuplicateDetector
  storages map[string]*Storage
}

func NewWebCrawlerService() *WebCrawlerService {
  fmt.Println("[WebCrawlerService.__init__] system ready")
  return &WebCrawlerService{
    seq: 1,
    urlfrontiers: map[string]*URLFrontier{},
    fetchers: map[string]*Fetcher{},
    parsers: map[string]*Parser{},
    duplicate_detectors: map[string]*DuplicateDetector{},
    storages: map[string]*Storage{},
  }
}

func (s *WebCrawlerService) CreateURLFrontier(name string) (*URLFrontier, error) {
  if name == "" {
    return nil, fmt.Errorf("URLFrontier name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("URL-%04d", s.seq)
  s.seq++
  obj, err := NewURLFrontier(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.urlfrontiers[id] = obj
  fmt.Printf("[WebCrawlerService.CreateURLFrontier] stored %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) GetURLFrontier(id string) (*URLFrontier, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.urlfrontiers[id]
  if !ok {
    return nil, fmt.Errorf("unknown URLFrontier id: %s", id)
  }
  fmt.Printf("[WebCrawlerService.GetURLFrontier] found %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) CreateFetcher(name string) (*Fetcher, error) {
  if name == "" {
    return nil, fmt.Errorf("Fetcher name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FET-%04d", s.seq)
  s.seq++
  obj, err := NewFetcher(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.fetchers[id] = obj
  fmt.Printf("[WebCrawlerService.CreateFetcher] stored %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) GetFetcher(id string) (*Fetcher, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.fetchers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Fetcher id: %s", id)
  }
  fmt.Printf("[WebCrawlerService.GetFetcher] found %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) CreateParser(name string) (*Parser, error) {
  if name == "" {
    return nil, fmt.Errorf("Parser name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PAR-%04d", s.seq)
  s.seq++
  obj, err := NewParser(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.parsers[id] = obj
  fmt.Printf("[WebCrawlerService.CreateParser] stored %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) GetParser(id string) (*Parser, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.parsers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Parser id: %s", id)
  }
  fmt.Printf("[WebCrawlerService.GetParser] found %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) CreateDuplicateDetector(name string) (*DuplicateDetector, error) {
  if name == "" {
    return nil, fmt.Errorf("DuplicateDetector name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DUP-%04d", s.seq)
  s.seq++
  obj, err := NewDuplicateDetector(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.duplicate_detectors[id] = obj
  fmt.Printf("[WebCrawlerService.CreateDuplicateDetector] stored %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) GetDuplicateDetector(id string) (*DuplicateDetector, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.duplicate_detectors[id]
  if !ok {
    return nil, fmt.Errorf("unknown DuplicateDetector id: %s", id)
  }
  fmt.Printf("[WebCrawlerService.GetDuplicateDetector] found %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) CreateStorage(name string) (*Storage, error) {
  if name == "" {
    return nil, fmt.Errorf("Storage name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("STO-%04d", s.seq)
  s.seq++
  obj, err := NewStorage(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.storages[id] = obj
  fmt.Printf("[WebCrawlerService.CreateStorage] stored %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) GetStorage(id string) (*Storage, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.storages[id]
  if !ok {
    return nil, fmt.Errorf("unknown Storage id: %s", id)
  }
  fmt.Printf("[WebCrawlerService.GetStorage] found %s\\n", id)
  return obj, nil
}

func (s *WebCrawlerService) CloseURLFrontier(id string) (*URLFrontier, error) {
  obj, err := s.GetURLFrontier(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[WebCrawlerService.CloseURLFrontier] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct WebCrawlerService ==========")
  system := NewWebCrawlerService()
  fmt.Println("========== STEP 2: Create URLFrontier ==========")
  first, _ := system.CreateURLFrontier("alpha-urlfrontier")
  system.CreateURLFrontier("beta-urlfrontier")
  system.CreateFetcher("sample-fetcher")
  system.CreateParser("sample-parser")
  system.CreateDuplicateDetector("sample-duplicate_detector")
  system.CreateStorage("sample-storage")
  system.CloseURLFrontier(first.ID)
  if _, err := system.CloseURLFrontier(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetURLFrontier("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class URLFrontier {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public URLFrontier(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("URLFrontier requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[URLFrontier.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("URLFrontier invalid status");
    }
    Console.WriteLine("[URLFrontier.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("URLFrontier " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[URLFrontier.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Fetcher {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Fetcher(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Fetcher requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Fetcher.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Fetcher invalid status");
    }
    Console.WriteLine("[Fetcher.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Fetcher " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Fetcher.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Parser {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Parser(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Parser requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Parser.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Parser invalid status");
    }
    Console.WriteLine("[Parser.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Parser " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Parser.close] id=" + Id + " -> CLOSED");
  }
}


sealed class DuplicateDetector {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public DuplicateDetector(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DuplicateDetector requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[DuplicateDetector.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("DuplicateDetector invalid status");
    }
    Console.WriteLine("[DuplicateDetector.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("DuplicateDetector " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[DuplicateDetector.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Storage {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Storage(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Storage requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Storage.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Storage invalid status");
    }
    Console.WriteLine("[Storage.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Storage " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Storage.close] id=" + Id + " -> CLOSED");
  }
}

sealed class WebCrawlerService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, URLFrontier> _urlfrontiers = new();
  private readonly Dictionary<string, Fetcher> _fetchers = new();
  private readonly Dictionary<string, Parser> _parsers = new();
  private readonly Dictionary<string, DuplicateDetector> _duplicate_detectors = new();
  private readonly Dictionary<string, Storage> _storages = new();
  public WebCrawlerService() {
    Console.WriteLine("[WebCrawlerService.__init__] system ready");
  }

  public URLFrontier CreateURLFrontier(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("URLFrontier name required");
    }
    lock (_gate) {
      var id = string.Format("URL-{0:D4}", _seq++);
      var obj = new URLFrontier(id, name.Trim());
      obj.Validate();
      _urlfrontiers[id] = obj;
      Console.WriteLine("[WebCrawlerService.CreateURLFrontier] stored " + id);
      return obj;
    }
  }

  public URLFrontier GetURLFrontier(string id) {
    lock (_gate) {
      if (!_urlfrontiers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown URLFrontier id: " + id);
      }
      Console.WriteLine("[WebCrawlerService.GetURLFrontier] found " + id);
      return obj;
    }
  }

  public Fetcher CreateFetcher(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Fetcher name required");
    }
    lock (_gate) {
      var id = string.Format("FET-{0:D4}", _seq++);
      var obj = new Fetcher(id, name.Trim());
      obj.Validate();
      _fetchers[id] = obj;
      Console.WriteLine("[WebCrawlerService.CreateFetcher] stored " + id);
      return obj;
    }
  }

  public Fetcher GetFetcher(string id) {
    lock (_gate) {
      if (!_fetchers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Fetcher id: " + id);
      }
      Console.WriteLine("[WebCrawlerService.GetFetcher] found " + id);
      return obj;
    }
  }

  public Parser CreateParser(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Parser name required");
    }
    lock (_gate) {
      var id = string.Format("PAR-{0:D4}", _seq++);
      var obj = new Parser(id, name.Trim());
      obj.Validate();
      _parsers[id] = obj;
      Console.WriteLine("[WebCrawlerService.CreateParser] stored " + id);
      return obj;
    }
  }

  public Parser GetParser(string id) {
    lock (_gate) {
      if (!_parsers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Parser id: " + id);
      }
      Console.WriteLine("[WebCrawlerService.GetParser] found " + id);
      return obj;
    }
  }

  public DuplicateDetector CreateDuplicateDetector(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DuplicateDetector name required");
    }
    lock (_gate) {
      var id = string.Format("DUP-{0:D4}", _seq++);
      var obj = new DuplicateDetector(id, name.Trim());
      obj.Validate();
      _duplicate_detectors[id] = obj;
      Console.WriteLine("[WebCrawlerService.CreateDuplicateDetector] stored " + id);
      return obj;
    }
  }

  public DuplicateDetector GetDuplicateDetector(string id) {
    lock (_gate) {
      if (!_duplicate_detectors.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown DuplicateDetector id: " + id);
      }
      Console.WriteLine("[WebCrawlerService.GetDuplicateDetector] found " + id);
      return obj;
    }
  }

  public Storage CreateStorage(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Storage name required");
    }
    lock (_gate) {
      var id = string.Format("STO-{0:D4}", _seq++);
      var obj = new Storage(id, name.Trim());
      obj.Validate();
      _storages[id] = obj;
      Console.WriteLine("[WebCrawlerService.CreateStorage] stored " + id);
      return obj;
    }
  }

  public Storage GetStorage(string id) {
    lock (_gate) {
      if (!_storages.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Storage id: " + id);
      }
      Console.WriteLine("[WebCrawlerService.GetStorage] found " + id);
      return obj;
    }
  }

  public URLFrontier CloseURLFrontier(string id) {
    var obj = GetURLFrontier(id);
    Console.WriteLine("[WebCrawlerService.CloseURLFrontier] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct WebCrawlerService ==========");
    var system = new WebCrawlerService();
    Console.WriteLine("========== STEP 2: Create URLFrontier ==========");
    var first = system.CreateURLFrontier("alpha-urlfrontier");
    system.CreateURLFrontier("beta-urlfrontier");
    system.CreateFetcher("sample-fetcher");
    system.CreateParser("sample-parser");
    system.CreateDuplicateDetector("sample-duplicate_detector");
    system.CreateStorage("sample-storage");
    system.CloseURLFrontier(first.Id);
    try {
      system.CloseURLFrontier(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetURLFrontier("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const webCrawlerSolution: ProblemSolution = {
  slug: 'web-crawler',
  title: 'Web Crawler - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a scalable web crawler that discovers, fetches, and indexes web pages across billions of URLs. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Start from seed URLs and discover new URLs via link extraction',
      'Respect robots.txt and crawl-delay directives',
      'De-duplicate URLs — never crawl the same page twice',
      'Prioritize URLs by freshness, PageRank, and domain importance',
      'Store fetched page content for indexing',
      'Handle redirects, broken links, and timeouts gracefully',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Start from seed URLs and discover new URLs via link extraction?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Respect robots.txt and crawl-delay directives?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'De-duplicate URLs — never crawl the same page twice?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Prioritize URLs by freshness, PageRank, and domain importance?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Store fetched page content for indexing?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. WebCrawlerService is the facade stereotype. URLFrontier, Fetcher, Parser, DuplicateDetector, Storage are concrete domain classes with id/name/status and validate/close.',
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
          'Construct WebCrawlerService.',
          'createURLFrontier twice and create the related UML classes.',
          'closeURLFrontier once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'WebCrawlerService', responsibility: 'UML facade - orchestrates Web Crawler.', keyMembers: ['create*', 'get*', 'closeURLFrontier'] },
    { name: 'URLFrontier', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Fetcher', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Parser', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'DuplicateDetector', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Storage', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from WebCrawlerService to URLFrontier, Fetcher, Parser, DuplicateDetector, Storage. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on WebCrawlerService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'WebCrawlerService', responsibility: 'UML facade - orchestrates Web Crawler.', keyMembers: ['create*', 'get*', 'closeURLFrontier'] },
    { name: 'URLFrontier', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Fetcher', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Parser', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'DuplicateDetector', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Storage', responsibility: 'UML class - domain object for Web Crawler.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'WebCrawlerService exposes create/get/close and owns composed collections.' },
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
      'main constructs WebCrawlerService, creates UML domain objects, closes the primary URLFrontier, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct WebCrawlerService.',
      'createURLFrontier for alpha and beta.',
      'create remaining UML classes.',
      'closeURLFrontier(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createURLFrontier("alpha..."); closeURLFrontier(id)',
        output: '[URLFrontier.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeURLFrontier(alreadyClosed) or getURLFrontier("MISSING-ID")',
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
