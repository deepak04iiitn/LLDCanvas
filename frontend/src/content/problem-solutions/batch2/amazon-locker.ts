import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'AmazonLockerService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_locker_locations', 'Map<string, LockerLocation>'),
    attr('-', '_lockers', 'Map<string, Locker>'),
    attr('-', '_locker_sizes', 'Map<string, LockerSize>'),
    attr('-', '_packages', 'Map<string, Package>'),
    attr('-', '_access_codes', 'Map<string, AccessCode>'),
  ], [
    method('+', 'createLockerLocation', 'name: string', 'LockerLocation'),
    method('+', 'createLocker', 'name: string', 'Locker'),
    method('+', 'createLockerSize', 'name: string', 'LockerSize'),
    method('+', 'createPackage', 'name: string', 'Package'),
    method('+', 'createAccessCode', 'name: string', 'AccessCode'),
    method('+', 'getLockerLocation', 'id: string', 'LockerLocation'),
    method('+', 'getLocker', 'id: string', 'Locker'),
    method('+', 'getLockerSize', 'id: string', 'LockerSize'),
    method('+', 'getPackage', 'id: string', 'Package'),
    method('+', 'getAccessCode', 'id: string', 'AccessCode'),
    method('+', 'closeLockerLocation', 'id: string', 'LockerLocation'),
  ], 'facade'),
  cls('n1', 'LockerLocation', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Locker', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'LockerSize', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Package', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'AccessCode', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("amazon-locker")


class LockerLocation:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("LockerLocation.id is required")
        if not name or not name.strip():
            raise ValueError("LockerLocation.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[LockerLocation.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"LockerLocation {self.id} has invalid status={self.status}")
        log.info("[LockerLocation.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"LockerLocation {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[LockerLocation.close] id=%s -> CLOSED", self.id)


class Locker:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Locker.id is required")
        if not name or not name.strip():
            raise ValueError("Locker.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Locker.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Locker {self.id} has invalid status={self.status}")
        log.info("[Locker.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Locker {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Locker.close] id=%s -> CLOSED", self.id)


class LockerSize:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("LockerSize.id is required")
        if not name or not name.strip():
            raise ValueError("LockerSize.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[LockerSize.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"LockerSize {self.id} has invalid status={self.status}")
        log.info("[LockerSize.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"LockerSize {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[LockerSize.close] id=%s -> CLOSED", self.id)


class Package:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Package.id is required")
        if not name or not name.strip():
            raise ValueError("Package.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Package.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Package {self.id} has invalid status={self.status}")
        log.info("[Package.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Package {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Package.close] id=%s -> CLOSED", self.id)


class AccessCode:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("AccessCode.id is required")
        if not name or not name.strip():
            raise ValueError("AccessCode.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[AccessCode.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"AccessCode {self.id} has invalid status={self.status}")
        log.info("[AccessCode.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"AccessCode {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[AccessCode.close] id=%s -> CLOSED", self.id)


class AmazonLockerService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._locker_locations: Dict[str, LockerLocation] = {}
        self._lockers: Dict[str, Locker] = {}
        self._locker_sizes: Dict[str, LockerSize] = {}
        self._packages: Dict[str, Package] = {}
        self._access_codes: Dict[str, AccessCode] = {}
        log.info("[AmazonLockerService.__init__] system ready; managing: LockerLocation, Locker, LockerSize, Package, AccessCode")

    def create_locker_location(self, name: str) -> LockerLocation:
        """UML: AmazonLockerService.create_locker_location(name) -> LockerLocation"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("LockerLocation name is required")
        with self._lock:
            item_id = f"LOC-{self._seq:04d}"
            self._seq += 1
            obj = LockerLocation(item_id, cleaned)
            obj.validate()
            self._locker_locations[item_id] = obj
            log.info("[AmazonLockerService.create_locker_location] stored %s in _locker_locations (count=%s)", item_id, len(self._locker_locations))
            return obj

    def get_locker_location(self, item_id: str) -> LockerLocation:
        with self._lock:
            obj = self._locker_locations.get(item_id)
            if obj is None:
                raise KeyError(f"unknown LockerLocation id: {item_id}")
            log.info("[AmazonLockerService.get_locker_location] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_locker(self, name: str) -> Locker:
        """UML: AmazonLockerService.create_locker(name) -> Locker"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Locker name is required")
        with self._lock:
            item_id = f"LOC-{self._seq:04d}"
            self._seq += 1
            obj = Locker(item_id, cleaned)
            obj.validate()
            self._lockers[item_id] = obj
            log.info("[AmazonLockerService.create_locker] stored %s in _lockers (count=%s)", item_id, len(self._lockers))
            return obj

    def get_locker(self, item_id: str) -> Locker:
        with self._lock:
            obj = self._lockers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Locker id: {item_id}")
            log.info("[AmazonLockerService.get_locker] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_locker_size(self, name: str) -> LockerSize:
        """UML: AmazonLockerService.create_locker_size(name) -> LockerSize"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("LockerSize name is required")
        with self._lock:
            item_id = f"LOC-{self._seq:04d}"
            self._seq += 1
            obj = LockerSize(item_id, cleaned)
            obj.validate()
            self._locker_sizes[item_id] = obj
            log.info("[AmazonLockerService.create_locker_size] stored %s in _locker_sizes (count=%s)", item_id, len(self._locker_sizes))
            return obj

    def get_locker_size(self, item_id: str) -> LockerSize:
        with self._lock:
            obj = self._locker_sizes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown LockerSize id: {item_id}")
            log.info("[AmazonLockerService.get_locker_size] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_package(self, name: str) -> Package:
        """UML: AmazonLockerService.create_package(name) -> Package"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Package name is required")
        with self._lock:
            item_id = f"PAC-{self._seq:04d}"
            self._seq += 1
            obj = Package(item_id, cleaned)
            obj.validate()
            self._packages[item_id] = obj
            log.info("[AmazonLockerService.create_package] stored %s in _packages (count=%s)", item_id, len(self._packages))
            return obj

    def get_package(self, item_id: str) -> Package:
        with self._lock:
            obj = self._packages.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Package id: {item_id}")
            log.info("[AmazonLockerService.get_package] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_access_code(self, name: str) -> AccessCode:
        """UML: AmazonLockerService.create_access_code(name) -> AccessCode"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("AccessCode name is required")
        with self._lock:
            item_id = f"ACC-{self._seq:04d}"
            self._seq += 1
            obj = AccessCode(item_id, cleaned)
            obj.validate()
            self._access_codes[item_id] = obj
            log.info("[AmazonLockerService.create_access_code] stored %s in _access_codes (count=%s)", item_id, len(self._access_codes))
            return obj

    def get_access_code(self, item_id: str) -> AccessCode:
        with self._lock:
            obj = self._access_codes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown AccessCode id: {item_id}")
            log.info("[AmazonLockerService.get_access_code] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_locker_location(self, item_id: str) -> LockerLocation:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._locker_locations.get(item_id)
            if obj is None:
                raise KeyError(f"unknown LockerLocation id: {item_id}")
            log.info("[AmazonLockerService.close_locker_location] closing %s via LockerLocation.close()", item_id)
            obj.close()
            return obj

    def list_active_locker_locations(self) -> List[LockerLocation]:
        with self._lock:
            active = [o for o in self._locker_locations.values() if o.status == "ACTIVE"]
            log.info("[AmazonLockerService.list_active_locker_locations] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct AmazonLockerService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = AmazonLockerService()

    log.info("========== STEP 2: Create primary LockerLocation objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_locker_location("alpha-locker_location")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_locker_location("beta-locker_location")

    log.info("========== STEP 3: Create Locker (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_locker("sample-locker")

    log.info("========== STEP 4: Create LockerSize (UML class) ==========")
    system.create_locker_size("sample-locker_size")

    log.info("========== STEP 5: Create Package (UML class) ==========")
    system.create_package("sample-package")

    log.info("========== STEP 6: Create AccessCode (UML class) ==========")
    system.create_access_code("sample-access_code")

    log.info("========== STEP 7: Inspect active LockerLocation list ==========")
    system.list_active_locker_locations()

    log.info("========== STEP 8: Close first LockerLocation ==========")
    system.close_locker_location(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_locker_location(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from LockerLocation.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_locker_location("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_locker_location: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_locker_locations()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class LockerLocation {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  LockerLocation(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("LockerLocation.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LockerLocation.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[LockerLocation.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("LockerLocation " + id + " invalid status");
    }
    System.out.println("[LockerLocation.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("LockerLocation " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[LockerLocation.close] id=" + id + " -> CLOSED");
  }
}


class Locker {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Locker(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Locker.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Locker.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Locker.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Locker " + id + " invalid status");
    }
    System.out.println("[Locker.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Locker " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Locker.close] id=" + id + " -> CLOSED");
  }
}


class LockerSize {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  LockerSize(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("LockerSize.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LockerSize.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[LockerSize.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("LockerSize " + id + " invalid status");
    }
    System.out.println("[LockerSize.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("LockerSize " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[LockerSize.close] id=" + id + " -> CLOSED");
  }
}


class Package {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Package(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Package.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Package.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Package.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Package " + id + " invalid status");
    }
    System.out.println("[Package.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Package " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Package.close] id=" + id + " -> CLOSED");
  }
}


class AccessCode {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  AccessCode(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("AccessCode.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("AccessCode.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[AccessCode.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("AccessCode " + id + " invalid status");
    }
    System.out.println("[AccessCode.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("AccessCode " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[AccessCode.close] id=" + id + " -> CLOSED");
  }
}

public class AmazonLockerService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, LockerLocation> locker_locations = new LinkedHashMap<>();
  private final Map<String, Locker> lockers = new LinkedHashMap<>();
  private final Map<String, LockerSize> locker_sizes = new LinkedHashMap<>();
  private final Map<String, Package> packages = new LinkedHashMap<>();
  private final Map<String, AccessCode> access_codes = new LinkedHashMap<>();

  public AmazonLockerService() {
    System.out.println("[AmazonLockerService.__init__] system ready");
  }

  public LockerLocation createLockerLocation(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LockerLocation name required");
    }
    lock.lock();
    try {
      String id = String.format("LOC-%04d", seq++);
      LockerLocation obj = new LockerLocation(id, name.trim());
      obj.validate();
      locker_locations.put(id, obj);
      System.out.println("[AmazonLockerService.createLockerLocation] stored " + id + " count=" + locker_locations.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public LockerLocation getLockerLocation(String id) {
    lock.lock();
    try {
      LockerLocation obj = locker_locations.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown LockerLocation id: " + id);
      }
      System.out.println("[AmazonLockerService.getLockerLocation] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Locker createLocker(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Locker name required");
    }
    lock.lock();
    try {
      String id = String.format("LOC-%04d", seq++);
      Locker obj = new Locker(id, name.trim());
      obj.validate();
      lockers.put(id, obj);
      System.out.println("[AmazonLockerService.createLocker] stored " + id + " count=" + lockers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Locker getLocker(String id) {
    lock.lock();
    try {
      Locker obj = lockers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Locker id: " + id);
      }
      System.out.println("[AmazonLockerService.getLocker] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public LockerSize createLockerSize(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LockerSize name required");
    }
    lock.lock();
    try {
      String id = String.format("LOC-%04d", seq++);
      LockerSize obj = new LockerSize(id, name.trim());
      obj.validate();
      locker_sizes.put(id, obj);
      System.out.println("[AmazonLockerService.createLockerSize] stored " + id + " count=" + locker_sizes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public LockerSize getLockerSize(String id) {
    lock.lock();
    try {
      LockerSize obj = locker_sizes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown LockerSize id: " + id);
      }
      System.out.println("[AmazonLockerService.getLockerSize] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Package createPackage(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Package name required");
    }
    lock.lock();
    try {
      String id = String.format("PAC-%04d", seq++);
      Package obj = new Package(id, name.trim());
      obj.validate();
      packages.put(id, obj);
      System.out.println("[AmazonLockerService.createPackage] stored " + id + " count=" + packages.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Package getPackage(String id) {
    lock.lock();
    try {
      Package obj = packages.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Package id: " + id);
      }
      System.out.println("[AmazonLockerService.getPackage] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public AccessCode createAccessCode(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("AccessCode name required");
    }
    lock.lock();
    try {
      String id = String.format("ACC-%04d", seq++);
      AccessCode obj = new AccessCode(id, name.trim());
      obj.validate();
      access_codes.put(id, obj);
      System.out.println("[AmazonLockerService.createAccessCode] stored " + id + " count=" + access_codes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public AccessCode getAccessCode(String id) {
    lock.lock();
    try {
      AccessCode obj = access_codes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown AccessCode id: " + id);
      }
      System.out.println("[AmazonLockerService.getAccessCode] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public LockerLocation closeLockerLocation(String id) {
    lock.lock();
    try {
      LockerLocation obj = locker_locations.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown LockerLocation id: " + id);
      }
      System.out.println("[AmazonLockerService.closeLockerLocation] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<LockerLocation> listActiveLockerLocations() {
    lock.lock();
    try {
      List<LockerLocation> out = new ArrayList<>();
      for (LockerLocation o : locker_locations.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[AmazonLockerService.listActiveLockerLocations] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct AmazonLockerService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    AmazonLockerService system = new AmazonLockerService();
    System.out.println("========== STEP 2: Create LockerLocation objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    LockerLocation first = system.createLockerLocation("alpha-locker_location");
    system.createLockerLocation("beta-locker_location");
    System.out.println("========== STEP 3: Create Locker ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createLocker("sample-locker");
    System.out.println("========== STEP 4: Create LockerSize ==========");
    system.createLockerSize("sample-locker_size");
    System.out.println("========== STEP 5: Create Package ==========");
    system.createPackage("sample-package");
    System.out.println("========== STEP 6: Create AccessCode ==========");
    system.createAccessCode("sample-access_code");
    System.out.println("========== Inspect active list ==========");
    system.listActiveLockerLocations();
    System.out.println("========== Close first LockerLocation ==========");
    system.closeLockerLocation(first.getId());
    try {
      system.closeLockerLocation(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getLockerLocation("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class LockerLocation {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('LockerLocation.id required')
    }

    if (!name?.trim()) {
      throw new Error('LockerLocation.name required')
    }
    console.log(\`[LockerLocation.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`LockerLocation \${this.id} invalid status\`)
    }
    console.log(\`[LockerLocation.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`LockerLocation \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[LockerLocation.close] id=\${this.id} -> CLOSED\`)
  }
}


class Locker {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Locker.id required')
    }

    if (!name?.trim()) {
      throw new Error('Locker.name required')
    }
    console.log(\`[Locker.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Locker \${this.id} invalid status\`)
    }
    console.log(\`[Locker.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Locker \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Locker.close] id=\${this.id} -> CLOSED\`)
  }
}


class LockerSize {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('LockerSize.id required')
    }

    if (!name?.trim()) {
      throw new Error('LockerSize.name required')
    }
    console.log(\`[LockerSize.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`LockerSize \${this.id} invalid status\`)
    }
    console.log(\`[LockerSize.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`LockerSize \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[LockerSize.close] id=\${this.id} -> CLOSED\`)
  }
}


class Package {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Package.id required')
    }

    if (!name?.trim()) {
      throw new Error('Package.name required')
    }
    console.log(\`[Package.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Package \${this.id} invalid status\`)
    }
    console.log(\`[Package.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Package \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Package.close] id=\${this.id} -> CLOSED\`)
  }
}


class AccessCode {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('AccessCode.id required')
    }

    if (!name?.trim()) {
      throw new Error('AccessCode.name required')
    }
    console.log(\`[AccessCode.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`AccessCode \${this.id} invalid status\`)
    }
    console.log(\`[AccessCode.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`AccessCode \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[AccessCode.close] id=\${this.id} -> CLOSED\`)
  }
}

class AmazonLockerService {
  private seq = 1
  private locker_locations = new Map<string, LockerLocation>()
  private lockers = new Map<string, Locker>()
  private locker_sizes = new Map<string, LockerSize>()
  private packages = new Map<string, Package>()
  private access_codes = new Map<string, AccessCode>()
  constructor() {
    console.log('[AmazonLockerService.__init__] system ready')
  }

  createLockerLocation(name: string): LockerLocation {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('LockerLocation name required')
    }
    const id = \`LOC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new LockerLocation(id, cleaned)
    obj.validate()
    this.locker_locations.set(id, obj)
    console.log(\`[AmazonLockerService.createLockerLocation] stored \${id} count=\${this.locker_locations.size}\`)
    return obj
  }

  getLockerLocation(id: string): LockerLocation {
    const obj = this.locker_locations.get(id)
    if (!obj) {
      throw new Error(\`unknown LockerLocation id: \${id}\`)
    }
    console.log(\`[AmazonLockerService.getLockerLocation] found id=\${obj.id}\`)
    return obj
  }

  createLocker(name: string): Locker {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Locker name required')
    }
    const id = \`LOC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Locker(id, cleaned)
    obj.validate()
    this.lockers.set(id, obj)
    console.log(\`[AmazonLockerService.createLocker] stored \${id} count=\${this.lockers.size}\`)
    return obj
  }

  getLocker(id: string): Locker {
    const obj = this.lockers.get(id)
    if (!obj) {
      throw new Error(\`unknown Locker id: \${id}\`)
    }
    console.log(\`[AmazonLockerService.getLocker] found id=\${obj.id}\`)
    return obj
  }

  createLockerSize(name: string): LockerSize {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('LockerSize name required')
    }
    const id = \`LOC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new LockerSize(id, cleaned)
    obj.validate()
    this.locker_sizes.set(id, obj)
    console.log(\`[AmazonLockerService.createLockerSize] stored \${id} count=\${this.locker_sizes.size}\`)
    return obj
  }

  getLockerSize(id: string): LockerSize {
    const obj = this.locker_sizes.get(id)
    if (!obj) {
      throw new Error(\`unknown LockerSize id: \${id}\`)
    }
    console.log(\`[AmazonLockerService.getLockerSize] found id=\${obj.id}\`)
    return obj
  }

  createPackage(name: string): Package {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Package name required')
    }
    const id = \`PAC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Package(id, cleaned)
    obj.validate()
    this.packages.set(id, obj)
    console.log(\`[AmazonLockerService.createPackage] stored \${id} count=\${this.packages.size}\`)
    return obj
  }

  getPackage(id: string): Package {
    const obj = this.packages.get(id)
    if (!obj) {
      throw new Error(\`unknown Package id: \${id}\`)
    }
    console.log(\`[AmazonLockerService.getPackage] found id=\${obj.id}\`)
    return obj
  }

  createAccessCode(name: string): AccessCode {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('AccessCode name required')
    }
    const id = \`ACC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new AccessCode(id, cleaned)
    obj.validate()
    this.access_codes.set(id, obj)
    console.log(\`[AmazonLockerService.createAccessCode] stored \${id} count=\${this.access_codes.size}\`)
    return obj
  }

  getAccessCode(id: string): AccessCode {
    const obj = this.access_codes.get(id)
    if (!obj) {
      throw new Error(\`unknown AccessCode id: \${id}\`)
    }
    console.log(\`[AmazonLockerService.getAccessCode] found id=\${obj.id}\`)
    return obj
  }

  closeLockerLocation(id: string): LockerLocation {
    const obj = this.getLockerLocation(id)
    console.log(\`[AmazonLockerService.closeLockerLocation] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveLockerLocations(): LockerLocation[] {
    const active = [...this.locker_locations.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[AmazonLockerService.listActiveLockerLocations] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct AmazonLockerService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new AmazonLockerService()
  console.log('========== STEP 2: Create LockerLocation objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createLockerLocation('alpha-locker_location')
  system.createLockerLocation('beta-locker_location')
  console.log('========== STEP 3: Create Locker ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createLocker('sample-locker')
  console.log('========== STEP 4: Create LockerSize ==========')
  system.createLockerSize('sample-locker_size')
  console.log('========== STEP 5: Create Package ==========')
  system.createPackage('sample-package')
  console.log('========== STEP 6: Create AccessCode ==========')
  system.createAccessCode('sample-access_code')
  system.listActiveLockerLocations()
  console.log('========== Close first LockerLocation ==========')
  system.closeLockerLocation(first.id)
  try {
    system.closeLockerLocation(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getLockerLocation('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class LockerLocation {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  LockerLocation(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("LockerLocation requires id and name");
    }
    cout << "[LockerLocation.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("LockerLocation invalid status");
    }
    cout << "[LockerLocation.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("LockerLocation cannot close");
    }
    status_ = "CLOSED";
    cout << "[LockerLocation.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Locker {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Locker(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Locker requires id and name");
    }
    cout << "[Locker.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Locker invalid status");
    }
    cout << "[Locker.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Locker cannot close");
    }
    status_ = "CLOSED";
    cout << "[Locker.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class LockerSize {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  LockerSize(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("LockerSize requires id and name");
    }
    cout << "[LockerSize.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("LockerSize invalid status");
    }
    cout << "[LockerSize.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("LockerSize cannot close");
    }
    status_ = "CLOSED";
    cout << "[LockerSize.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Package {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Package(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Package requires id and name");
    }
    cout << "[Package.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Package invalid status");
    }
    cout << "[Package.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Package cannot close");
    }
    status_ = "CLOSED";
    cout << "[Package.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class AccessCode {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  AccessCode(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("AccessCode requires id and name");
    }
    cout << "[AccessCode.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("AccessCode invalid status");
    }
    cout << "[AccessCode.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("AccessCode cannot close");
    }
    status_ = "CLOSED";
    cout << "[AccessCode.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class AmazonLockerService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, LockerLocation> locker_locations_;
  unordered_map<string, Locker> lockers_;
  unordered_map<string, LockerSize> locker_sizes_;
  unordered_map<string, Package> packages_;
  unordered_map<string, AccessCode> access_codes_;
public:
  AmazonLockerService() {
    cout << "[AmazonLockerService.__init__] system ready" << endl;
  }

  LockerLocation createLockerLocation(const string& name) {
    if (name.empty()) {
      throw invalid_argument("LockerLocation name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LOC-%04d", seq_++);
    LockerLocation obj{buf, name};
    obj.validate();
    locker_locations_.emplace(obj.id(), obj);
    cout << "[AmazonLockerService.createLockerLocation] stored " << obj.id() << endl;
    return obj;
  }

  LockerLocation getLockerLocation(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = locker_locations_.find(id);
    if (it == locker_locations_.end()) {
      throw out_of_range("unknown LockerLocation id");
    }
    cout << "[AmazonLockerService.getLockerLocation] found " << id << endl;
    return it->second;
  }

  Locker createLocker(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Locker name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LOC-%04d", seq_++);
    Locker obj{buf, name};
    obj.validate();
    lockers_.emplace(obj.id(), obj);
    cout << "[AmazonLockerService.createLocker] stored " << obj.id() << endl;
    return obj;
  }

  Locker getLocker(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = lockers_.find(id);
    if (it == lockers_.end()) {
      throw out_of_range("unknown Locker id");
    }
    cout << "[AmazonLockerService.getLocker] found " << id << endl;
    return it->second;
  }

  LockerSize createLockerSize(const string& name) {
    if (name.empty()) {
      throw invalid_argument("LockerSize name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LOC-%04d", seq_++);
    LockerSize obj{buf, name};
    obj.validate();
    locker_sizes_.emplace(obj.id(), obj);
    cout << "[AmazonLockerService.createLockerSize] stored " << obj.id() << endl;
    return obj;
  }

  LockerSize getLockerSize(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = locker_sizes_.find(id);
    if (it == locker_sizes_.end()) {
      throw out_of_range("unknown LockerSize id");
    }
    cout << "[AmazonLockerService.getLockerSize] found " << id << endl;
    return it->second;
  }

  Package createPackage(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Package name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PAC-%04d", seq_++);
    Package obj{buf, name};
    obj.validate();
    packages_.emplace(obj.id(), obj);
    cout << "[AmazonLockerService.createPackage] stored " << obj.id() << endl;
    return obj;
  }

  Package getPackage(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = packages_.find(id);
    if (it == packages_.end()) {
      throw out_of_range("unknown Package id");
    }
    cout << "[AmazonLockerService.getPackage] found " << id << endl;
    return it->second;
  }

  AccessCode createAccessCode(const string& name) {
    if (name.empty()) {
      throw invalid_argument("AccessCode name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ACC-%04d", seq_++);
    AccessCode obj{buf, name};
    obj.validate();
    access_codes_.emplace(obj.id(), obj);
    cout << "[AmazonLockerService.createAccessCode] stored " << obj.id() << endl;
    return obj;
  }

  AccessCode getAccessCode(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = access_codes_.find(id);
    if (it == access_codes_.end()) {
      throw out_of_range("unknown AccessCode id");
    }
    cout << "[AmazonLockerService.getAccessCode] found " << id << endl;
    return it->second;
  }

  LockerLocation closeLockerLocation(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = locker_locations_.find(id);
    if (it == locker_locations_.end()) {
      throw out_of_range("unknown LockerLocation");
    }
    cout << "[AmazonLockerService.closeLockerLocation] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct AmazonLockerService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  AmazonLockerService system;
  cout << "========== STEP 2: Create LockerLocation ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createLockerLocation("alpha-locker_location");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createLockerLocation("beta-locker_location");
  system.createLocker("sample-locker");
  system.createLockerSize("sample-locker_size");
  system.createPackage("sample-package");
  system.createAccessCode("sample-access_code");
  system.closeLockerLocation(first.id());
  try {
    system.closeLockerLocation(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getLockerLocation("MISSING-ID");
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

type LockerLocation struct {
  ID     string
  Name   string
  Status string
}

func NewLockerLocation(id, name string) (*LockerLocation, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("LockerLocation requires id and name")
  }
  obj := &LockerLocation{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[LockerLocation.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *LockerLocation) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("LockerLocation invalid status")
  }
  fmt.Printf("[LockerLocation.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *LockerLocation) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("LockerLocation %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[LockerLocation.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Locker struct {
  ID     string
  Name   string
  Status string
}

func NewLocker(id, name string) (*Locker, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Locker requires id and name")
  }
  obj := &Locker{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Locker.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Locker) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Locker invalid status")
  }
  fmt.Printf("[Locker.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Locker) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Locker %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Locker.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type LockerSize struct {
  ID     string
  Name   string
  Status string
}

func NewLockerSize(id, name string) (*LockerSize, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("LockerSize requires id and name")
  }
  obj := &LockerSize{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[LockerSize.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *LockerSize) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("LockerSize invalid status")
  }
  fmt.Printf("[LockerSize.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *LockerSize) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("LockerSize %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[LockerSize.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Package struct {
  ID     string
  Name   string
  Status string
}

func NewPackage(id, name string) (*Package, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Package requires id and name")
  }
  obj := &Package{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Package.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Package) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Package invalid status")
  }
  fmt.Printf("[Package.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Package) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Package %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Package.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type AccessCode struct {
  ID     string
  Name   string
  Status string
}

func NewAccessCode(id, name string) (*AccessCode, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("AccessCode requires id and name")
  }
  obj := &AccessCode{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[AccessCode.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *AccessCode) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("AccessCode invalid status")
  }
  fmt.Printf("[AccessCode.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *AccessCode) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("AccessCode %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[AccessCode.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type AmazonLockerService struct {
  mu  sync.Mutex
  seq int
  locker_locations map[string]*LockerLocation
  lockers map[string]*Locker
  locker_sizes map[string]*LockerSize
  packages map[string]*Package
  access_codes map[string]*AccessCode
}

func NewAmazonLockerService() *AmazonLockerService {
  fmt.Println("[AmazonLockerService.__init__] system ready")
  return &AmazonLockerService{
    seq: 1,
    locker_locations: map[string]*LockerLocation{},
    lockers: map[string]*Locker{},
    locker_sizes: map[string]*LockerSize{},
    packages: map[string]*Package{},
    access_codes: map[string]*AccessCode{},
  }
}

func (s *AmazonLockerService) CreateLockerLocation(name string) (*LockerLocation, error) {
  if name == "" {
    return nil, fmt.Errorf("LockerLocation name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LOC-%04d", s.seq)
  s.seq++
  obj, err := NewLockerLocation(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.locker_locations[id] = obj
  fmt.Printf("[AmazonLockerService.CreateLockerLocation] stored %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) GetLockerLocation(id string) (*LockerLocation, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.locker_locations[id]
  if !ok {
    return nil, fmt.Errorf("unknown LockerLocation id: %s", id)
  }
  fmt.Printf("[AmazonLockerService.GetLockerLocation] found %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) CreateLocker(name string) (*Locker, error) {
  if name == "" {
    return nil, fmt.Errorf("Locker name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LOC-%04d", s.seq)
  s.seq++
  obj, err := NewLocker(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.lockers[id] = obj
  fmt.Printf("[AmazonLockerService.CreateLocker] stored %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) GetLocker(id string) (*Locker, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.lockers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Locker id: %s", id)
  }
  fmt.Printf("[AmazonLockerService.GetLocker] found %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) CreateLockerSize(name string) (*LockerSize, error) {
  if name == "" {
    return nil, fmt.Errorf("LockerSize name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LOC-%04d", s.seq)
  s.seq++
  obj, err := NewLockerSize(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.locker_sizes[id] = obj
  fmt.Printf("[AmazonLockerService.CreateLockerSize] stored %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) GetLockerSize(id string) (*LockerSize, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.locker_sizes[id]
  if !ok {
    return nil, fmt.Errorf("unknown LockerSize id: %s", id)
  }
  fmt.Printf("[AmazonLockerService.GetLockerSize] found %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) CreatePackage(name string) (*Package, error) {
  if name == "" {
    return nil, fmt.Errorf("Package name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PAC-%04d", s.seq)
  s.seq++
  obj, err := NewPackage(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.packages[id] = obj
  fmt.Printf("[AmazonLockerService.CreatePackage] stored %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) GetPackage(id string) (*Package, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.packages[id]
  if !ok {
    return nil, fmt.Errorf("unknown Package id: %s", id)
  }
  fmt.Printf("[AmazonLockerService.GetPackage] found %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) CreateAccessCode(name string) (*AccessCode, error) {
  if name == "" {
    return nil, fmt.Errorf("AccessCode name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ACC-%04d", s.seq)
  s.seq++
  obj, err := NewAccessCode(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.access_codes[id] = obj
  fmt.Printf("[AmazonLockerService.CreateAccessCode] stored %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) GetAccessCode(id string) (*AccessCode, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.access_codes[id]
  if !ok {
    return nil, fmt.Errorf("unknown AccessCode id: %s", id)
  }
  fmt.Printf("[AmazonLockerService.GetAccessCode] found %s\\n", id)
  return obj, nil
}

func (s *AmazonLockerService) CloseLockerLocation(id string) (*LockerLocation, error) {
  obj, err := s.GetLockerLocation(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[AmazonLockerService.CloseLockerLocation] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct AmazonLockerService ==========")
  system := NewAmazonLockerService()
  fmt.Println("========== STEP 2: Create LockerLocation ==========")
  first, _ := system.CreateLockerLocation("alpha-locker_location")
  system.CreateLockerLocation("beta-locker_location")
  system.CreateLocker("sample-locker")
  system.CreateLockerSize("sample-locker_size")
  system.CreatePackage("sample-package")
  system.CreateAccessCode("sample-access_code")
  system.CloseLockerLocation(first.ID)
  if _, err := system.CloseLockerLocation(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetLockerLocation("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class LockerLocation {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public LockerLocation(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LockerLocation requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[LockerLocation.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("LockerLocation invalid status");
    }
    Console.WriteLine("[LockerLocation.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("LockerLocation " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[LockerLocation.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Locker {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Locker(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Locker requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Locker.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Locker invalid status");
    }
    Console.WriteLine("[Locker.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Locker " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Locker.close] id=" + Id + " -> CLOSED");
  }
}


sealed class LockerSize {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public LockerSize(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LockerSize requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[LockerSize.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("LockerSize invalid status");
    }
    Console.WriteLine("[LockerSize.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("LockerSize " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[LockerSize.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Package {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Package(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Package requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Package.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Package invalid status");
    }
    Console.WriteLine("[Package.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Package " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Package.close] id=" + Id + " -> CLOSED");
  }
}


sealed class AccessCode {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public AccessCode(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("AccessCode requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[AccessCode.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("AccessCode invalid status");
    }
    Console.WriteLine("[AccessCode.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("AccessCode " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[AccessCode.close] id=" + Id + " -> CLOSED");
  }
}

sealed class AmazonLockerService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, LockerLocation> _locker_locations = new();
  private readonly Dictionary<string, Locker> _lockers = new();
  private readonly Dictionary<string, LockerSize> _locker_sizes = new();
  private readonly Dictionary<string, Package> _packages = new();
  private readonly Dictionary<string, AccessCode> _access_codes = new();
  public AmazonLockerService() {
    Console.WriteLine("[AmazonLockerService.__init__] system ready");
  }

  public LockerLocation CreateLockerLocation(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LockerLocation name required");
    }
    lock (_gate) {
      var id = string.Format("LOC-{0:D4}", _seq++);
      var obj = new LockerLocation(id, name.Trim());
      obj.Validate();
      _locker_locations[id] = obj;
      Console.WriteLine("[AmazonLockerService.CreateLockerLocation] stored " + id);
      return obj;
    }
  }

  public LockerLocation GetLockerLocation(string id) {
    lock (_gate) {
      if (!_locker_locations.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown LockerLocation id: " + id);
      }
      Console.WriteLine("[AmazonLockerService.GetLockerLocation] found " + id);
      return obj;
    }
  }

  public Locker CreateLocker(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Locker name required");
    }
    lock (_gate) {
      var id = string.Format("LOC-{0:D4}", _seq++);
      var obj = new Locker(id, name.Trim());
      obj.Validate();
      _lockers[id] = obj;
      Console.WriteLine("[AmazonLockerService.CreateLocker] stored " + id);
      return obj;
    }
  }

  public Locker GetLocker(string id) {
    lock (_gate) {
      if (!_lockers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Locker id: " + id);
      }
      Console.WriteLine("[AmazonLockerService.GetLocker] found " + id);
      return obj;
    }
  }

  public LockerSize CreateLockerSize(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LockerSize name required");
    }
    lock (_gate) {
      var id = string.Format("LOC-{0:D4}", _seq++);
      var obj = new LockerSize(id, name.Trim());
      obj.Validate();
      _locker_sizes[id] = obj;
      Console.WriteLine("[AmazonLockerService.CreateLockerSize] stored " + id);
      return obj;
    }
  }

  public LockerSize GetLockerSize(string id) {
    lock (_gate) {
      if (!_locker_sizes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown LockerSize id: " + id);
      }
      Console.WriteLine("[AmazonLockerService.GetLockerSize] found " + id);
      return obj;
    }
  }

  public Package CreatePackage(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Package name required");
    }
    lock (_gate) {
      var id = string.Format("PAC-{0:D4}", _seq++);
      var obj = new Package(id, name.Trim());
      obj.Validate();
      _packages[id] = obj;
      Console.WriteLine("[AmazonLockerService.CreatePackage] stored " + id);
      return obj;
    }
  }

  public Package GetPackage(string id) {
    lock (_gate) {
      if (!_packages.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Package id: " + id);
      }
      Console.WriteLine("[AmazonLockerService.GetPackage] found " + id);
      return obj;
    }
  }

  public AccessCode CreateAccessCode(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("AccessCode name required");
    }
    lock (_gate) {
      var id = string.Format("ACC-{0:D4}", _seq++);
      var obj = new AccessCode(id, name.Trim());
      obj.Validate();
      _access_codes[id] = obj;
      Console.WriteLine("[AmazonLockerService.CreateAccessCode] stored " + id);
      return obj;
    }
  }

  public AccessCode GetAccessCode(string id) {
    lock (_gate) {
      if (!_access_codes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown AccessCode id: " + id);
      }
      Console.WriteLine("[AmazonLockerService.GetAccessCode] found " + id);
      return obj;
    }
  }

  public LockerLocation CloseLockerLocation(string id) {
    var obj = GetLockerLocation(id);
    Console.WriteLine("[AmazonLockerService.CloseLockerLocation] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct AmazonLockerService ==========");
    var system = new AmazonLockerService();
    Console.WriteLine("========== STEP 2: Create LockerLocation ==========");
    var first = system.CreateLockerLocation("alpha-locker_location");
    system.CreateLockerLocation("beta-locker_location");
    system.CreateLocker("sample-locker");
    system.CreateLockerSize("sample-locker_size");
    system.CreatePackage("sample-package");
    system.CreateAccessCode("sample-access_code");
    system.CloseLockerLocation(first.Id);
    try {
      system.CloseLockerLocation(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetLockerLocation("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const amazonLockerSolution: ProblemSolution = {
  slug: 'amazon-locker',
  title: 'Amazon Locker System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design Amazon\\ The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Assign an available locker of appropriate size for a package',
      'Notify the customer with a one-time access code when package is stored',
      'Customer enters code to unlock and retrieve package',
      'Handle packages not picked up within the return window (3 days)',
      'Multiple locker locations — find the nearest to delivery address',
      'Locker sizes: small, medium, large, extra-large',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Assign an available locker of appropriate size for a package?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Notify the customer with a one-time access code when package is stored?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Customer enters code to unlock and retrieve package?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Handle packages not picked up within the return window (3 days)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Multiple locker locations — find the nearest to delivery address?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. AmazonLockerService is the facade stereotype. LockerLocation, Locker, LockerSize, Package, AccessCode are concrete domain classes with id/name/status and validate/close.',
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
          'Construct AmazonLockerService.',
          'createLockerLocation twice and create the related UML classes.',
          'closeLockerLocation once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'AmazonLockerService', responsibility: 'UML facade - orchestrates Amazon Locker System.', keyMembers: ['create*', 'get*', 'closeLockerLocation'] },
    { name: 'LockerLocation', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Locker', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LockerSize', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Package', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'AccessCode', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from AmazonLockerService to LockerLocation, Locker, LockerSize, Package, AccessCode. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on AmazonLockerService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'AmazonLockerService', responsibility: 'UML facade - orchestrates Amazon Locker System.', keyMembers: ['create*', 'get*', 'closeLockerLocation'] },
    { name: 'LockerLocation', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Locker', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LockerSize', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Package', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'AccessCode', responsibility: 'UML class - domain object for Amazon Locker System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'AmazonLockerService exposes create/get/close and owns composed collections.' },
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
      'main constructs AmazonLockerService, creates UML domain objects, closes the primary LockerLocation, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct AmazonLockerService.',
      'createLockerLocation for alpha and beta.',
      'create remaining UML classes.',
      'closeLockerLocation(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createLockerLocation("alpha..."); closeLockerLocation(id)',
        output: '[LockerLocation.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeLockerLocation(alreadyClosed) or getLockerLocation("MISSING-ID")',
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
