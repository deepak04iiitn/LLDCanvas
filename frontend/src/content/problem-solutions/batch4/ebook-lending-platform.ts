import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'EbookLendingPlatformService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_titles', 'Map<string, Title>'),
    attr('-', '_license_copies', 'Map<string, LicenseCopy>'),
    attr('-', '_loans', 'Map<string, Loan>'),
    attr('-', '_expiry_times', 'Map<string, expiryTime>'),
    attr('-', '_waitlists', 'Map<string, Waitlist>'),
  ], [
    method('+', 'createTitle', 'name: string', 'Title'),
    method('+', 'createLicenseCopy', 'name: string', 'LicenseCopy'),
    method('+', 'createLoan', 'name: string', 'Loan'),
    method('+', 'createexpiryTime', 'name: string', 'expiryTime'),
    method('+', 'createWaitlist', 'name: string', 'Waitlist'),
    method('+', 'getTitle', 'id: string', 'Title'),
    method('+', 'getLicenseCopy', 'id: string', 'LicenseCopy'),
    method('+', 'getLoan', 'id: string', 'Loan'),
    method('+', 'getexpiryTime', 'id: string', 'expiryTime'),
    method('+', 'getWaitlist', 'id: string', 'Waitlist'),
    method('+', 'closeTitle', 'id: string', 'Title'),
  ], 'facade'),
  cls('n1', 'Title', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'LicenseCopy', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Loan', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'expiryTime', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Waitlist', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("ebook-lending-platform")


class Title:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Title.id is required")
        if not name or not name.strip():
            raise ValueError("Title.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Title.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Title {self.id} has invalid status={self.status}")
        log.info("[Title.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Title {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Title.close] id=%s -> CLOSED", self.id)


class LicenseCopy:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("LicenseCopy.id is required")
        if not name or not name.strip():
            raise ValueError("LicenseCopy.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[LicenseCopy.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"LicenseCopy {self.id} has invalid status={self.status}")
        log.info("[LicenseCopy.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"LicenseCopy {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[LicenseCopy.close] id=%s -> CLOSED", self.id)


class Loan:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Loan.id is required")
        if not name or not name.strip():
            raise ValueError("Loan.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Loan.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Loan {self.id} has invalid status={self.status}")
        log.info("[Loan.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Loan {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Loan.close] id=%s -> CLOSED", self.id)


class expiryTime:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("expiryTime.id is required")
        if not name or not name.strip():
            raise ValueError("expiryTime.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[expiryTime.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"expiryTime {self.id} has invalid status={self.status}")
        log.info("[expiryTime.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"expiryTime {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[expiryTime.close] id=%s -> CLOSED", self.id)


class Waitlist:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Waitlist.id is required")
        if not name or not name.strip():
            raise ValueError("Waitlist.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Waitlist.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Waitlist {self.id} has invalid status={self.status}")
        log.info("[Waitlist.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Waitlist {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Waitlist.close] id=%s -> CLOSED", self.id)


class EbookLendingPlatformService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._titles: Dict[str, Title] = {}
        self._license_copies: Dict[str, LicenseCopy] = {}
        self._loans: Dict[str, Loan] = {}
        self._expiry_times: Dict[str, expiryTime] = {}
        self._waitlists: Dict[str, Waitlist] = {}
        log.info("[EbookLendingPlatformService.__init__] system ready; managing: Title, LicenseCopy, Loan, expiryTime, Waitlist")

    def create_title(self, name: str) -> Title:
        """UML: EbookLendingPlatformService.create_title(name) -> Title"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Title name is required")
        with self._lock:
            item_id = f"TIT-{self._seq:04d}"
            self._seq += 1
            obj = Title(item_id, cleaned)
            obj.validate()
            self._titles[item_id] = obj
            log.info("[EbookLendingPlatformService.create_title] stored %s in _titles (count=%s)", item_id, len(self._titles))
            return obj

    def get_title(self, item_id: str) -> Title:
        with self._lock:
            obj = self._titles.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Title id: {item_id}")
            log.info("[EbookLendingPlatformService.get_title] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_license_copy(self, name: str) -> LicenseCopy:
        """UML: EbookLendingPlatformService.create_license_copy(name) -> LicenseCopy"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("LicenseCopy name is required")
        with self._lock:
            item_id = f"LIC-{self._seq:04d}"
            self._seq += 1
            obj = LicenseCopy(item_id, cleaned)
            obj.validate()
            self._license_copies[item_id] = obj
            log.info("[EbookLendingPlatformService.create_license_copy] stored %s in _license_copies (count=%s)", item_id, len(self._license_copies))
            return obj

    def get_license_copy(self, item_id: str) -> LicenseCopy:
        with self._lock:
            obj = self._license_copies.get(item_id)
            if obj is None:
                raise KeyError(f"unknown LicenseCopy id: {item_id}")
            log.info("[EbookLendingPlatformService.get_license_copy] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_loan(self, name: str) -> Loan:
        """UML: EbookLendingPlatformService.create_loan(name) -> Loan"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Loan name is required")
        with self._lock:
            item_id = f"LOA-{self._seq:04d}"
            self._seq += 1
            obj = Loan(item_id, cleaned)
            obj.validate()
            self._loans[item_id] = obj
            log.info("[EbookLendingPlatformService.create_loan] stored %s in _loans (count=%s)", item_id, len(self._loans))
            return obj

    def get_loan(self, item_id: str) -> Loan:
        with self._lock:
            obj = self._loans.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Loan id: {item_id}")
            log.info("[EbookLendingPlatformService.get_loan] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_expiry_time(self, name: str) -> expiryTime:
        """UML: EbookLendingPlatformService.create_expiry_time(name) -> expiryTime"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("expiryTime name is required")
        with self._lock:
            item_id = f"EXP-{self._seq:04d}"
            self._seq += 1
            obj = expiryTime(item_id, cleaned)
            obj.validate()
            self._expiry_times[item_id] = obj
            log.info("[EbookLendingPlatformService.create_expiry_time] stored %s in _expiry_times (count=%s)", item_id, len(self._expiry_times))
            return obj

    def get_expiry_time(self, item_id: str) -> expiryTime:
        with self._lock:
            obj = self._expiry_times.get(item_id)
            if obj is None:
                raise KeyError(f"unknown expiryTime id: {item_id}")
            log.info("[EbookLendingPlatformService.get_expiry_time] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_waitlist(self, name: str) -> Waitlist:
        """UML: EbookLendingPlatformService.create_waitlist(name) -> Waitlist"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Waitlist name is required")
        with self._lock:
            item_id = f"WAI-{self._seq:04d}"
            self._seq += 1
            obj = Waitlist(item_id, cleaned)
            obj.validate()
            self._waitlists[item_id] = obj
            log.info("[EbookLendingPlatformService.create_waitlist] stored %s in _waitlists (count=%s)", item_id, len(self._waitlists))
            return obj

    def get_waitlist(self, item_id: str) -> Waitlist:
        with self._lock:
            obj = self._waitlists.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Waitlist id: {item_id}")
            log.info("[EbookLendingPlatformService.get_waitlist] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_title(self, item_id: str) -> Title:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._titles.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Title id: {item_id}")
            log.info("[EbookLendingPlatformService.close_title] closing %s via Title.close()", item_id)
            obj.close()
            return obj

    def list_active_titles(self) -> List[Title]:
        with self._lock:
            active = [o for o in self._titles.values() if o.status == "ACTIVE"]
            log.info("[EbookLendingPlatformService.list_active_titles] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct EbookLendingPlatformService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = EbookLendingPlatformService()

    log.info("========== STEP 2: Create primary Title objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_title("alpha-title")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_title("beta-title")

    log.info("========== STEP 3: Create LicenseCopy (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_license_copy("sample-license_copy")

    log.info("========== STEP 4: Create Loan (UML class) ==========")
    system.create_loan("sample-loan")

    log.info("========== STEP 5: Create expiryTime (UML class) ==========")
    system.create_expiry_time("sample-expiry_time")

    log.info("========== STEP 6: Create Waitlist (UML class) ==========")
    system.create_waitlist("sample-waitlist")

    log.info("========== STEP 7: Inspect active Title list ==========")
    system.list_active_titles()

    log.info("========== STEP 8: Close first Title ==========")
    system.close_title(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_title(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Title.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_title("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_title: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_titles()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Title {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Title(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Title.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Title.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Title.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Title " + id + " invalid status");
    }
    System.out.println("[Title.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Title " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Title.close] id=" + id + " -> CLOSED");
  }
}


class LicenseCopy {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  LicenseCopy(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("LicenseCopy.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LicenseCopy.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[LicenseCopy.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("LicenseCopy " + id + " invalid status");
    }
    System.out.println("[LicenseCopy.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("LicenseCopy " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[LicenseCopy.close] id=" + id + " -> CLOSED");
  }
}


class Loan {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Loan(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Loan.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Loan.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Loan.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Loan " + id + " invalid status");
    }
    System.out.println("[Loan.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Loan " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Loan.close] id=" + id + " -> CLOSED");
  }
}


class expiryTime {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  expiryTime(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("expiryTime.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("expiryTime.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[expiryTime.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("expiryTime " + id + " invalid status");
    }
    System.out.println("[expiryTime.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("expiryTime " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[expiryTime.close] id=" + id + " -> CLOSED");
  }
}


class Waitlist {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Waitlist(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Waitlist.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Waitlist.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Waitlist.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Waitlist " + id + " invalid status");
    }
    System.out.println("[Waitlist.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Waitlist " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Waitlist.close] id=" + id + " -> CLOSED");
  }
}

public class EbookLendingPlatformService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Title> titles = new LinkedHashMap<>();
  private final Map<String, LicenseCopy> license_copies = new LinkedHashMap<>();
  private final Map<String, Loan> loans = new LinkedHashMap<>();
  private final Map<String, expiryTime> expiry_times = new LinkedHashMap<>();
  private final Map<String, Waitlist> waitlists = new LinkedHashMap<>();

  public EbookLendingPlatformService() {
    System.out.println("[EbookLendingPlatformService.__init__] system ready");
  }

  public Title createTitle(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Title name required");
    }
    lock.lock();
    try {
      String id = String.format("TIT-%04d", seq++);
      Title obj = new Title(id, name.trim());
      obj.validate();
      titles.put(id, obj);
      System.out.println("[EbookLendingPlatformService.createTitle] stored " + id + " count=" + titles.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Title getTitle(String id) {
    lock.lock();
    try {
      Title obj = titles.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Title id: " + id);
      }
      System.out.println("[EbookLendingPlatformService.getTitle] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public LicenseCopy createLicenseCopy(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LicenseCopy name required");
    }
    lock.lock();
    try {
      String id = String.format("LIC-%04d", seq++);
      LicenseCopy obj = new LicenseCopy(id, name.trim());
      obj.validate();
      license_copies.put(id, obj);
      System.out.println("[EbookLendingPlatformService.createLicenseCopy] stored " + id + " count=" + license_copies.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public LicenseCopy getLicenseCopy(String id) {
    lock.lock();
    try {
      LicenseCopy obj = license_copies.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown LicenseCopy id: " + id);
      }
      System.out.println("[EbookLendingPlatformService.getLicenseCopy] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Loan createLoan(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Loan name required");
    }
    lock.lock();
    try {
      String id = String.format("LOA-%04d", seq++);
      Loan obj = new Loan(id, name.trim());
      obj.validate();
      loans.put(id, obj);
      System.out.println("[EbookLendingPlatformService.createLoan] stored " + id + " count=" + loans.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Loan getLoan(String id) {
    lock.lock();
    try {
      Loan obj = loans.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Loan id: " + id);
      }
      System.out.println("[EbookLendingPlatformService.getLoan] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public expiryTime createexpiryTime(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("expiryTime name required");
    }
    lock.lock();
    try {
      String id = String.format("EXP-%04d", seq++);
      expiryTime obj = new expiryTime(id, name.trim());
      obj.validate();
      expiry_times.put(id, obj);
      System.out.println("[EbookLendingPlatformService.createexpiryTime] stored " + id + " count=" + expiry_times.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public expiryTime getexpiryTime(String id) {
    lock.lock();
    try {
      expiryTime obj = expiry_times.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown expiryTime id: " + id);
      }
      System.out.println("[EbookLendingPlatformService.getexpiryTime] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Waitlist createWaitlist(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Waitlist name required");
    }
    lock.lock();
    try {
      String id = String.format("WAI-%04d", seq++);
      Waitlist obj = new Waitlist(id, name.trim());
      obj.validate();
      waitlists.put(id, obj);
      System.out.println("[EbookLendingPlatformService.createWaitlist] stored " + id + " count=" + waitlists.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Waitlist getWaitlist(String id) {
    lock.lock();
    try {
      Waitlist obj = waitlists.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Waitlist id: " + id);
      }
      System.out.println("[EbookLendingPlatformService.getWaitlist] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Title closeTitle(String id) {
    lock.lock();
    try {
      Title obj = titles.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Title id: " + id);
      }
      System.out.println("[EbookLendingPlatformService.closeTitle] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Title> listActiveTitles() {
    lock.lock();
    try {
      List<Title> out = new ArrayList<>();
      for (Title o : titles.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[EbookLendingPlatformService.listActiveTitles] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct EbookLendingPlatformService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    EbookLendingPlatformService system = new EbookLendingPlatformService();
    System.out.println("========== STEP 2: Create Title objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Title first = system.createTitle("alpha-title");
    system.createTitle("beta-title");
    System.out.println("========== STEP 3: Create LicenseCopy ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createLicenseCopy("sample-license_copy");
    System.out.println("========== STEP 4: Create Loan ==========");
    system.createLoan("sample-loan");
    System.out.println("========== STEP 5: Create expiryTime ==========");
    system.createexpiryTime("sample-expiry_time");
    System.out.println("========== STEP 6: Create Waitlist ==========");
    system.createWaitlist("sample-waitlist");
    System.out.println("========== Inspect active list ==========");
    system.listActiveTitles();
    System.out.println("========== Close first Title ==========");
    system.closeTitle(first.getId());
    try {
      system.closeTitle(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getTitle("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Title {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Title.id required')
    }

    if (!name?.trim()) {
      throw new Error('Title.name required')
    }
    console.log(\`[Title.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Title \${this.id} invalid status\`)
    }
    console.log(\`[Title.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Title \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Title.close] id=\${this.id} -> CLOSED\`)
  }
}


class LicenseCopy {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('LicenseCopy.id required')
    }

    if (!name?.trim()) {
      throw new Error('LicenseCopy.name required')
    }
    console.log(\`[LicenseCopy.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`LicenseCopy \${this.id} invalid status\`)
    }
    console.log(\`[LicenseCopy.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`LicenseCopy \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[LicenseCopy.close] id=\${this.id} -> CLOSED\`)
  }
}


class Loan {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Loan.id required')
    }

    if (!name?.trim()) {
      throw new Error('Loan.name required')
    }
    console.log(\`[Loan.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Loan \${this.id} invalid status\`)
    }
    console.log(\`[Loan.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Loan \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Loan.close] id=\${this.id} -> CLOSED\`)
  }
}


class expiryTime {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('expiryTime.id required')
    }

    if (!name?.trim()) {
      throw new Error('expiryTime.name required')
    }
    console.log(\`[expiryTime.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`expiryTime \${this.id} invalid status\`)
    }
    console.log(\`[expiryTime.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`expiryTime \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[expiryTime.close] id=\${this.id} -> CLOSED\`)
  }
}


class Waitlist {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Waitlist.id required')
    }

    if (!name?.trim()) {
      throw new Error('Waitlist.name required')
    }
    console.log(\`[Waitlist.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Waitlist \${this.id} invalid status\`)
    }
    console.log(\`[Waitlist.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Waitlist \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Waitlist.close] id=\${this.id} -> CLOSED\`)
  }
}

class EbookLendingPlatformService {
  private seq = 1
  private titles = new Map<string, Title>()
  private license_copies = new Map<string, LicenseCopy>()
  private loans = new Map<string, Loan>()
  private expiry_times = new Map<string, expiryTime>()
  private waitlists = new Map<string, Waitlist>()
  constructor() {
    console.log('[EbookLendingPlatformService.__init__] system ready')
  }

  createTitle(name: string): Title {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Title name required')
    }
    const id = \`TIT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Title(id, cleaned)
    obj.validate()
    this.titles.set(id, obj)
    console.log(\`[EbookLendingPlatformService.createTitle] stored \${id} count=\${this.titles.size}\`)
    return obj
  }

  getTitle(id: string): Title {
    const obj = this.titles.get(id)
    if (!obj) {
      throw new Error(\`unknown Title id: \${id}\`)
    }
    console.log(\`[EbookLendingPlatformService.getTitle] found id=\${obj.id}\`)
    return obj
  }

  createLicenseCopy(name: string): LicenseCopy {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('LicenseCopy name required')
    }
    const id = \`LIC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new LicenseCopy(id, cleaned)
    obj.validate()
    this.license_copies.set(id, obj)
    console.log(\`[EbookLendingPlatformService.createLicenseCopy] stored \${id} count=\${this.license_copies.size}\`)
    return obj
  }

  getLicenseCopy(id: string): LicenseCopy {
    const obj = this.license_copies.get(id)
    if (!obj) {
      throw new Error(\`unknown LicenseCopy id: \${id}\`)
    }
    console.log(\`[EbookLendingPlatformService.getLicenseCopy] found id=\${obj.id}\`)
    return obj
  }

  createLoan(name: string): Loan {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Loan name required')
    }
    const id = \`LOA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Loan(id, cleaned)
    obj.validate()
    this.loans.set(id, obj)
    console.log(\`[EbookLendingPlatformService.createLoan] stored \${id} count=\${this.loans.size}\`)
    return obj
  }

  getLoan(id: string): Loan {
    const obj = this.loans.get(id)
    if (!obj) {
      throw new Error(\`unknown Loan id: \${id}\`)
    }
    console.log(\`[EbookLendingPlatformService.getLoan] found id=\${obj.id}\`)
    return obj
  }

  createexpiryTime(name: string): expiryTime {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('expiryTime name required')
    }
    const id = \`EXP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new expiryTime(id, cleaned)
    obj.validate()
    this.expiry_times.set(id, obj)
    console.log(\`[EbookLendingPlatformService.createexpiryTime] stored \${id} count=\${this.expiry_times.size}\`)
    return obj
  }

  getexpiryTime(id: string): expiryTime {
    const obj = this.expiry_times.get(id)
    if (!obj) {
      throw new Error(\`unknown expiryTime id: \${id}\`)
    }
    console.log(\`[EbookLendingPlatformService.getexpiryTime] found id=\${obj.id}\`)
    return obj
  }

  createWaitlist(name: string): Waitlist {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Waitlist name required')
    }
    const id = \`WAI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Waitlist(id, cleaned)
    obj.validate()
    this.waitlists.set(id, obj)
    console.log(\`[EbookLendingPlatformService.createWaitlist] stored \${id} count=\${this.waitlists.size}\`)
    return obj
  }

  getWaitlist(id: string): Waitlist {
    const obj = this.waitlists.get(id)
    if (!obj) {
      throw new Error(\`unknown Waitlist id: \${id}\`)
    }
    console.log(\`[EbookLendingPlatformService.getWaitlist] found id=\${obj.id}\`)
    return obj
  }

  closeTitle(id: string): Title {
    const obj = this.getTitle(id)
    console.log(\`[EbookLendingPlatformService.closeTitle] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveTitles(): Title[] {
    const active = [...this.titles.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[EbookLendingPlatformService.listActiveTitles] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct EbookLendingPlatformService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new EbookLendingPlatformService()
  console.log('========== STEP 2: Create Title objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createTitle('alpha-title')
  system.createTitle('beta-title')
  console.log('========== STEP 3: Create LicenseCopy ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createLicenseCopy('sample-license_copy')
  console.log('========== STEP 4: Create Loan ==========')
  system.createLoan('sample-loan')
  console.log('========== STEP 5: Create expiryTime ==========')
  system.createexpiryTime('sample-expiry_time')
  console.log('========== STEP 6: Create Waitlist ==========')
  system.createWaitlist('sample-waitlist')
  system.listActiveTitles()
  console.log('========== Close first Title ==========')
  system.closeTitle(first.id)
  try {
    system.closeTitle(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getTitle('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Title {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Title(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Title requires id and name");
    }
    cout << "[Title.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Title invalid status");
    }
    cout << "[Title.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Title cannot close");
    }
    status_ = "CLOSED";
    cout << "[Title.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class LicenseCopy {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  LicenseCopy(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("LicenseCopy requires id and name");
    }
    cout << "[LicenseCopy.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("LicenseCopy invalid status");
    }
    cout << "[LicenseCopy.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("LicenseCopy cannot close");
    }
    status_ = "CLOSED";
    cout << "[LicenseCopy.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Loan {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Loan(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Loan requires id and name");
    }
    cout << "[Loan.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Loan invalid status");
    }
    cout << "[Loan.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Loan cannot close");
    }
    status_ = "CLOSED";
    cout << "[Loan.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class expiryTime {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  expiryTime(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("expiryTime requires id and name");
    }
    cout << "[expiryTime.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("expiryTime invalid status");
    }
    cout << "[expiryTime.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("expiryTime cannot close");
    }
    status_ = "CLOSED";
    cout << "[expiryTime.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Waitlist {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Waitlist(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Waitlist requires id and name");
    }
    cout << "[Waitlist.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Waitlist invalid status");
    }
    cout << "[Waitlist.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Waitlist cannot close");
    }
    status_ = "CLOSED";
    cout << "[Waitlist.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class EbookLendingPlatformService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Title> titles_;
  unordered_map<string, LicenseCopy> license_copies_;
  unordered_map<string, Loan> loans_;
  unordered_map<string, expiryTime> expiry_times_;
  unordered_map<string, Waitlist> waitlists_;
public:
  EbookLendingPlatformService() {
    cout << "[EbookLendingPlatformService.__init__] system ready" << endl;
  }

  Title createTitle(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Title name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TIT-%04d", seq_++);
    Title obj{buf, name};
    obj.validate();
    titles_.emplace(obj.id(), obj);
    cout << "[EbookLendingPlatformService.createTitle] stored " << obj.id() << endl;
    return obj;
  }

  Title getTitle(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = titles_.find(id);
    if (it == titles_.end()) {
      throw out_of_range("unknown Title id");
    }
    cout << "[EbookLendingPlatformService.getTitle] found " << id << endl;
    return it->second;
  }

  LicenseCopy createLicenseCopy(const string& name) {
    if (name.empty()) {
      throw invalid_argument("LicenseCopy name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LIC-%04d", seq_++);
    LicenseCopy obj{buf, name};
    obj.validate();
    license_copies_.emplace(obj.id(), obj);
    cout << "[EbookLendingPlatformService.createLicenseCopy] stored " << obj.id() << endl;
    return obj;
  }

  LicenseCopy getLicenseCopy(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = license_copies_.find(id);
    if (it == license_copies_.end()) {
      throw out_of_range("unknown LicenseCopy id");
    }
    cout << "[EbookLendingPlatformService.getLicenseCopy] found " << id << endl;
    return it->second;
  }

  Loan createLoan(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Loan name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LOA-%04d", seq_++);
    Loan obj{buf, name};
    obj.validate();
    loans_.emplace(obj.id(), obj);
    cout << "[EbookLendingPlatformService.createLoan] stored " << obj.id() << endl;
    return obj;
  }

  Loan getLoan(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = loans_.find(id);
    if (it == loans_.end()) {
      throw out_of_range("unknown Loan id");
    }
    cout << "[EbookLendingPlatformService.getLoan] found " << id << endl;
    return it->second;
  }

  expiryTime createexpiryTime(const string& name) {
    if (name.empty()) {
      throw invalid_argument("expiryTime name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "EXP-%04d", seq_++);
    expiryTime obj{buf, name};
    obj.validate();
    expiry_times_.emplace(obj.id(), obj);
    cout << "[EbookLendingPlatformService.createexpiryTime] stored " << obj.id() << endl;
    return obj;
  }

  expiryTime getexpiryTime(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = expiry_times_.find(id);
    if (it == expiry_times_.end()) {
      throw out_of_range("unknown expiryTime id");
    }
    cout << "[EbookLendingPlatformService.getexpiryTime] found " << id << endl;
    return it->second;
  }

  Waitlist createWaitlist(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Waitlist name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "WAI-%04d", seq_++);
    Waitlist obj{buf, name};
    obj.validate();
    waitlists_.emplace(obj.id(), obj);
    cout << "[EbookLendingPlatformService.createWaitlist] stored " << obj.id() << endl;
    return obj;
  }

  Waitlist getWaitlist(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = waitlists_.find(id);
    if (it == waitlists_.end()) {
      throw out_of_range("unknown Waitlist id");
    }
    cout << "[EbookLendingPlatformService.getWaitlist] found " << id << endl;
    return it->second;
  }

  Title closeTitle(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = titles_.find(id);
    if (it == titles_.end()) {
      throw out_of_range("unknown Title");
    }
    cout << "[EbookLendingPlatformService.closeTitle] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct EbookLendingPlatformService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  EbookLendingPlatformService system;
  cout << "========== STEP 2: Create Title ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createTitle("alpha-title");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createTitle("beta-title");
  system.createLicenseCopy("sample-license_copy");
  system.createLoan("sample-loan");
  system.createexpiryTime("sample-expiry_time");
  system.createWaitlist("sample-waitlist");
  system.closeTitle(first.id());
  try {
    system.closeTitle(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getTitle("MISSING-ID");
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

type Title struct {
  ID     string
  Name   string
  Status string
}

func NewTitle(id, name string) (*Title, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Title requires id and name")
  }
  obj := &Title{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Title.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Title) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Title invalid status")
  }
  fmt.Printf("[Title.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Title) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Title %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Title.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type LicenseCopy struct {
  ID     string
  Name   string
  Status string
}

func NewLicenseCopy(id, name string) (*LicenseCopy, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("LicenseCopy requires id and name")
  }
  obj := &LicenseCopy{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[LicenseCopy.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *LicenseCopy) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("LicenseCopy invalid status")
  }
  fmt.Printf("[LicenseCopy.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *LicenseCopy) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("LicenseCopy %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[LicenseCopy.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Loan struct {
  ID     string
  Name   string
  Status string
}

func NewLoan(id, name string) (*Loan, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Loan requires id and name")
  }
  obj := &Loan{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Loan.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Loan) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Loan invalid status")
  }
  fmt.Printf("[Loan.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Loan) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Loan %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Loan.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type expiryTime struct {
  ID     string
  Name   string
  Status string
}

func NewexpiryTime(id, name string) (*expiryTime, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("expiryTime requires id and name")
  }
  obj := &expiryTime{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[expiryTime.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *expiryTime) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("expiryTime invalid status")
  }
  fmt.Printf("[expiryTime.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *expiryTime) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("expiryTime %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[expiryTime.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Waitlist struct {
  ID     string
  Name   string
  Status string
}

func NewWaitlist(id, name string) (*Waitlist, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Waitlist requires id and name")
  }
  obj := &Waitlist{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Waitlist.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Waitlist) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Waitlist invalid status")
  }
  fmt.Printf("[Waitlist.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Waitlist) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Waitlist %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Waitlist.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type EbookLendingPlatformService struct {
  mu  sync.Mutex
  seq int
  titles map[string]*Title
  license_copies map[string]*LicenseCopy
  loans map[string]*Loan
  expiry_times map[string]*expiryTime
  waitlists map[string]*Waitlist
}

func NewEbookLendingPlatformService() *EbookLendingPlatformService {
  fmt.Println("[EbookLendingPlatformService.__init__] system ready")
  return &EbookLendingPlatformService{
    seq: 1,
    titles: map[string]*Title{},
    license_copies: map[string]*LicenseCopy{},
    loans: map[string]*Loan{},
    expiry_times: map[string]*expiryTime{},
    waitlists: map[string]*Waitlist{},
  }
}

func (s *EbookLendingPlatformService) CreateTitle(name string) (*Title, error) {
  if name == "" {
    return nil, fmt.Errorf("Title name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TIT-%04d", s.seq)
  s.seq++
  obj, err := NewTitle(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.titles[id] = obj
  fmt.Printf("[EbookLendingPlatformService.CreateTitle] stored %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) GetTitle(id string) (*Title, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.titles[id]
  if !ok {
    return nil, fmt.Errorf("unknown Title id: %s", id)
  }
  fmt.Printf("[EbookLendingPlatformService.GetTitle] found %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) CreateLicenseCopy(name string) (*LicenseCopy, error) {
  if name == "" {
    return nil, fmt.Errorf("LicenseCopy name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LIC-%04d", s.seq)
  s.seq++
  obj, err := NewLicenseCopy(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.license_copies[id] = obj
  fmt.Printf("[EbookLendingPlatformService.CreateLicenseCopy] stored %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) GetLicenseCopy(id string) (*LicenseCopy, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.license_copies[id]
  if !ok {
    return nil, fmt.Errorf("unknown LicenseCopy id: %s", id)
  }
  fmt.Printf("[EbookLendingPlatformService.GetLicenseCopy] found %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) CreateLoan(name string) (*Loan, error) {
  if name == "" {
    return nil, fmt.Errorf("Loan name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LOA-%04d", s.seq)
  s.seq++
  obj, err := NewLoan(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.loans[id] = obj
  fmt.Printf("[EbookLendingPlatformService.CreateLoan] stored %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) GetLoan(id string) (*Loan, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.loans[id]
  if !ok {
    return nil, fmt.Errorf("unknown Loan id: %s", id)
  }
  fmt.Printf("[EbookLendingPlatformService.GetLoan] found %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) CreateexpiryTime(name string) (*expiryTime, error) {
  if name == "" {
    return nil, fmt.Errorf("expiryTime name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("EXP-%04d", s.seq)
  s.seq++
  obj, err := NewexpiryTime(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.expiry_times[id] = obj
  fmt.Printf("[EbookLendingPlatformService.CreateexpiryTime] stored %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) GetexpiryTime(id string) (*expiryTime, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.expiry_times[id]
  if !ok {
    return nil, fmt.Errorf("unknown expiryTime id: %s", id)
  }
  fmt.Printf("[EbookLendingPlatformService.GetexpiryTime] found %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) CreateWaitlist(name string) (*Waitlist, error) {
  if name == "" {
    return nil, fmt.Errorf("Waitlist name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("WAI-%04d", s.seq)
  s.seq++
  obj, err := NewWaitlist(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.waitlists[id] = obj
  fmt.Printf("[EbookLendingPlatformService.CreateWaitlist] stored %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) GetWaitlist(id string) (*Waitlist, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.waitlists[id]
  if !ok {
    return nil, fmt.Errorf("unknown Waitlist id: %s", id)
  }
  fmt.Printf("[EbookLendingPlatformService.GetWaitlist] found %s\\n", id)
  return obj, nil
}

func (s *EbookLendingPlatformService) CloseTitle(id string) (*Title, error) {
  obj, err := s.GetTitle(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[EbookLendingPlatformService.CloseTitle] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct EbookLendingPlatformService ==========")
  system := NewEbookLendingPlatformService()
  fmt.Println("========== STEP 2: Create Title ==========")
  first, _ := system.CreateTitle("alpha-title")
  system.CreateTitle("beta-title")
  system.CreateLicenseCopy("sample-license_copy")
  system.CreateLoan("sample-loan")
  system.CreateexpiryTime("sample-expiry_time")
  system.CreateWaitlist("sample-waitlist")
  system.CloseTitle(first.ID)
  if _, err := system.CloseTitle(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetTitle("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Title {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Title(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Title requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Title.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Title invalid status");
    }
    Console.WriteLine("[Title.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Title " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Title.close] id=" + Id + " -> CLOSED");
  }
}


sealed class LicenseCopy {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public LicenseCopy(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LicenseCopy requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[LicenseCopy.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("LicenseCopy invalid status");
    }
    Console.WriteLine("[LicenseCopy.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("LicenseCopy " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[LicenseCopy.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Loan {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Loan(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Loan requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Loan.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Loan invalid status");
    }
    Console.WriteLine("[Loan.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Loan " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Loan.close] id=" + Id + " -> CLOSED");
  }
}


sealed class expiryTime {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public expiryTime(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("expiryTime requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[expiryTime.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("expiryTime invalid status");
    }
    Console.WriteLine("[expiryTime.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("expiryTime " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[expiryTime.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Waitlist {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Waitlist(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Waitlist requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Waitlist.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Waitlist invalid status");
    }
    Console.WriteLine("[Waitlist.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Waitlist " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Waitlist.close] id=" + Id + " -> CLOSED");
  }
}

sealed class EbookLendingPlatformService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Title> _titles = new();
  private readonly Dictionary<string, LicenseCopy> _license_copies = new();
  private readonly Dictionary<string, Loan> _loans = new();
  private readonly Dictionary<string, expiryTime> _expiry_times = new();
  private readonly Dictionary<string, Waitlist> _waitlists = new();
  public EbookLendingPlatformService() {
    Console.WriteLine("[EbookLendingPlatformService.__init__] system ready");
  }

  public Title CreateTitle(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Title name required");
    }
    lock (_gate) {
      var id = string.Format("TIT-{0:D4}", _seq++);
      var obj = new Title(id, name.Trim());
      obj.Validate();
      _titles[id] = obj;
      Console.WriteLine("[EbookLendingPlatformService.CreateTitle] stored " + id);
      return obj;
    }
  }

  public Title GetTitle(string id) {
    lock (_gate) {
      if (!_titles.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Title id: " + id);
      }
      Console.WriteLine("[EbookLendingPlatformService.GetTitle] found " + id);
      return obj;
    }
  }

  public LicenseCopy CreateLicenseCopy(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LicenseCopy name required");
    }
    lock (_gate) {
      var id = string.Format("LIC-{0:D4}", _seq++);
      var obj = new LicenseCopy(id, name.Trim());
      obj.Validate();
      _license_copies[id] = obj;
      Console.WriteLine("[EbookLendingPlatformService.CreateLicenseCopy] stored " + id);
      return obj;
    }
  }

  public LicenseCopy GetLicenseCopy(string id) {
    lock (_gate) {
      if (!_license_copies.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown LicenseCopy id: " + id);
      }
      Console.WriteLine("[EbookLendingPlatformService.GetLicenseCopy] found " + id);
      return obj;
    }
  }

  public Loan CreateLoan(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Loan name required");
    }
    lock (_gate) {
      var id = string.Format("LOA-{0:D4}", _seq++);
      var obj = new Loan(id, name.Trim());
      obj.Validate();
      _loans[id] = obj;
      Console.WriteLine("[EbookLendingPlatformService.CreateLoan] stored " + id);
      return obj;
    }
  }

  public Loan GetLoan(string id) {
    lock (_gate) {
      if (!_loans.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Loan id: " + id);
      }
      Console.WriteLine("[EbookLendingPlatformService.GetLoan] found " + id);
      return obj;
    }
  }

  public expiryTime CreateexpiryTime(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("expiryTime name required");
    }
    lock (_gate) {
      var id = string.Format("EXP-{0:D4}", _seq++);
      var obj = new expiryTime(id, name.Trim());
      obj.Validate();
      _expiry_times[id] = obj;
      Console.WriteLine("[EbookLendingPlatformService.CreateexpiryTime] stored " + id);
      return obj;
    }
  }

  public expiryTime GetexpiryTime(string id) {
    lock (_gate) {
      if (!_expiry_times.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown expiryTime id: " + id);
      }
      Console.WriteLine("[EbookLendingPlatformService.GetexpiryTime] found " + id);
      return obj;
    }
  }

  public Waitlist CreateWaitlist(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Waitlist name required");
    }
    lock (_gate) {
      var id = string.Format("WAI-{0:D4}", _seq++);
      var obj = new Waitlist(id, name.Trim());
      obj.Validate();
      _waitlists[id] = obj;
      Console.WriteLine("[EbookLendingPlatformService.CreateWaitlist] stored " + id);
      return obj;
    }
  }

  public Waitlist GetWaitlist(string id) {
    lock (_gate) {
      if (!_waitlists.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Waitlist id: " + id);
      }
      Console.WriteLine("[EbookLendingPlatformService.GetWaitlist] found " + id);
      return obj;
    }
  }

  public Title CloseTitle(string id) {
    var obj = GetTitle(id);
    Console.WriteLine("[EbookLendingPlatformService.CloseTitle] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct EbookLendingPlatformService ==========");
    var system = new EbookLendingPlatformService();
    Console.WriteLine("========== STEP 2: Create Title ==========");
    var first = system.CreateTitle("alpha-title");
    system.CreateTitle("beta-title");
    system.CreateLicenseCopy("sample-license_copy");
    system.CreateLoan("sample-loan");
    system.CreateexpiryTime("sample-expiry_time");
    system.CreateWaitlist("sample-waitlist");
    system.CloseTitle(first.Id);
    try {
      system.CloseTitle(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetTitle("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const ebookLendingPlatformSolution: ProblemSolution = {
  slug: 'ebook-lending-platform',
  title: 'E-Book Lending Platform - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a digital library lending platform (like a Kindle library) supporting borrowing, returning, and licensing limits. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Borrow an available e-book copy for a fixed loan period',
      'Auto-return a book when the loan period expires',
      'Waitlist a user for a book with all copies checked out',
      'Support a limited number of concurrent digital "copies" per title',
      'Sync reading progress across devices',
      'Allow early return of a borrowed book',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Borrow an available e-book copy for a fixed loan period?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Auto-return a book when the loan period expires?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Waitlist a user for a book with all copies checked out?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support a limited number of concurrent digital "copies" per title?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Sync reading progress across devices?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. EbookLendingPlatformService is the facade stereotype. Title, LicenseCopy, Loan, expiryTime, Waitlist are concrete domain classes with id/name/status and validate/close.',
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
          'Construct EbookLendingPlatformService.',
          'createTitle twice and create the related UML classes.',
          'closeTitle once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'EbookLendingPlatformService', responsibility: 'UML facade - orchestrates E-Book Lending Platform.', keyMembers: ['create*', 'get*', 'closeTitle'] },
    { name: 'Title', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LicenseCopy', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Loan', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'expiryTime', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Waitlist', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from EbookLendingPlatformService to Title, LicenseCopy, Loan, expiryTime, Waitlist. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on EbookLendingPlatformService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'EbookLendingPlatformService', responsibility: 'UML facade - orchestrates E-Book Lending Platform.', keyMembers: ['create*', 'get*', 'closeTitle'] },
    { name: 'Title', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LicenseCopy', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Loan', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'expiryTime', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Waitlist', responsibility: 'UML class - domain object for E-Book Lending Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'EbookLendingPlatformService exposes create/get/close and owns composed collections.' },
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
      'main constructs EbookLendingPlatformService, creates UML domain objects, closes the primary Title, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct EbookLendingPlatformService.',
      'createTitle for alpha and beta.',
      'create remaining UML classes.',
      'closeTitle(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createTitle("alpha..."); closeTitle(id)',
        output: '[Title.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeTitle(alreadyClosed) or getTitle("MISSING-ID")',
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
