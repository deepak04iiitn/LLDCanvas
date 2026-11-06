import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'WarehouseOrderFulfillmentService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_skus', 'Map<string, SKU>'),
    attr('-', '_bins', 'Map<string, Bin>'),
    attr('-', '_inventory_records', 'Map<string, InventoryRecord>'),
    attr('-', '_bins', 'Map<string, bin>'),
    attr('-', '_quantities', 'Map<string, quantity>'),
  ], [
    method('+', 'createSKU', 'name: string', 'SKU'),
    method('+', 'createBin', 'name: string', 'Bin'),
    method('+', 'createInventoryRecord', 'name: string', 'InventoryRecord'),
    method('+', 'createbin', 'name: string', 'bin'),
    method('+', 'createquantity', 'name: string', 'quantity'),
    method('+', 'getSKU', 'id: string', 'SKU'),
    method('+', 'getBin', 'id: string', 'Bin'),
    method('+', 'getInventoryRecord', 'id: string', 'InventoryRecord'),
    method('+', 'getbin', 'id: string', 'bin'),
    method('+', 'getquantity', 'id: string', 'quantity'),
    method('+', 'closeSKU', 'id: string', 'SKU'),
  ], 'facade'),
  cls('n1', 'SKU', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Bin', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'InventoryRecord', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'bin', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'quantity', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("warehouse-order-fulfillment")


class SKU:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("SKU.id is required")
        if not name or not name.strip():
            raise ValueError("SKU.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[SKU.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"SKU {self.id} has invalid status={self.status}")
        log.info("[SKU.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"SKU {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[SKU.close] id=%s -> CLOSED", self.id)


class Bin:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Bin.id is required")
        if not name or not name.strip():
            raise ValueError("Bin.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Bin.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Bin {self.id} has invalid status={self.status}")
        log.info("[Bin.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Bin {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Bin.close] id=%s -> CLOSED", self.id)


class InventoryRecord:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("InventoryRecord.id is required")
        if not name or not name.strip():
            raise ValueError("InventoryRecord.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[InventoryRecord.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"InventoryRecord {self.id} has invalid status={self.status}")
        log.info("[InventoryRecord.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"InventoryRecord {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[InventoryRecord.close] id=%s -> CLOSED", self.id)


class bin:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("bin.id is required")
        if not name or not name.strip():
            raise ValueError("bin.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[bin.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"bin {self.id} has invalid status={self.status}")
        log.info("[bin.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"bin {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[bin.close] id=%s -> CLOSED", self.id)


class quantity:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("quantity.id is required")
        if not name or not name.strip():
            raise ValueError("quantity.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[quantity.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"quantity {self.id} has invalid status={self.status}")
        log.info("[quantity.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"quantity {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[quantity.close] id=%s -> CLOSED", self.id)


class WarehouseOrderFulfillmentService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._skus: Dict[str, SKU] = {}
        self._bins: Dict[str, Bin] = {}
        self._inventory_records: Dict[str, InventoryRecord] = {}
        self._bins: Dict[str, bin] = {}
        self._quantities: Dict[str, quantity] = {}
        log.info("[WarehouseOrderFulfillmentService.__init__] system ready; managing: SKU, Bin, InventoryRecord, bin, quantity")

    def create_sku(self, name: str) -> SKU:
        """UML: WarehouseOrderFulfillmentService.create_sku(name) -> SKU"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("SKU name is required")
        with self._lock:
            item_id = f"SKU-{self._seq:04d}"
            self._seq += 1
            obj = SKU(item_id, cleaned)
            obj.validate()
            self._skus[item_id] = obj
            log.info("[WarehouseOrderFulfillmentService.create_sku] stored %s in _skus (count=%s)", item_id, len(self._skus))
            return obj

    def get_sku(self, item_id: str) -> SKU:
        with self._lock:
            obj = self._skus.get(item_id)
            if obj is None:
                raise KeyError(f"unknown SKU id: {item_id}")
            log.info("[WarehouseOrderFulfillmentService.get_sku] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_bin(self, name: str) -> Bin:
        """UML: WarehouseOrderFulfillmentService.create_bin(name) -> Bin"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Bin name is required")
        with self._lock:
            item_id = f"BIN-{self._seq:04d}"
            self._seq += 1
            obj = Bin(item_id, cleaned)
            obj.validate()
            self._bins[item_id] = obj
            log.info("[WarehouseOrderFulfillmentService.create_bin] stored %s in _bins (count=%s)", item_id, len(self._bins))
            return obj

    def get_bin(self, item_id: str) -> Bin:
        with self._lock:
            obj = self._bins.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Bin id: {item_id}")
            log.info("[WarehouseOrderFulfillmentService.get_bin] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_inventory_record(self, name: str) -> InventoryRecord:
        """UML: WarehouseOrderFulfillmentService.create_inventory_record(name) -> InventoryRecord"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("InventoryRecord name is required")
        with self._lock:
            item_id = f"INV-{self._seq:04d}"
            self._seq += 1
            obj = InventoryRecord(item_id, cleaned)
            obj.validate()
            self._inventory_records[item_id] = obj
            log.info("[WarehouseOrderFulfillmentService.create_inventory_record] stored %s in _inventory_records (count=%s)", item_id, len(self._inventory_records))
            return obj

    def get_inventory_record(self, item_id: str) -> InventoryRecord:
        with self._lock:
            obj = self._inventory_records.get(item_id)
            if obj is None:
                raise KeyError(f"unknown InventoryRecord id: {item_id}")
            log.info("[WarehouseOrderFulfillmentService.get_inventory_record] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_bin(self, name: str) -> bin:
        """UML: WarehouseOrderFulfillmentService.create_bin(name) -> bin"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("bin name is required")
        with self._lock:
            item_id = f"BIN-{self._seq:04d}"
            self._seq += 1
            obj = bin(item_id, cleaned)
            obj.validate()
            self._bins[item_id] = obj
            log.info("[WarehouseOrderFulfillmentService.create_bin] stored %s in _bins (count=%s)", item_id, len(self._bins))
            return obj

    def get_bin(self, item_id: str) -> bin:
        with self._lock:
            obj = self._bins.get(item_id)
            if obj is None:
                raise KeyError(f"unknown bin id: {item_id}")
            log.info("[WarehouseOrderFulfillmentService.get_bin] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_quantity(self, name: str) -> quantity:
        """UML: WarehouseOrderFulfillmentService.create_quantity(name) -> quantity"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("quantity name is required")
        with self._lock:
            item_id = f"QUA-{self._seq:04d}"
            self._seq += 1
            obj = quantity(item_id, cleaned)
            obj.validate()
            self._quantities[item_id] = obj
            log.info("[WarehouseOrderFulfillmentService.create_quantity] stored %s in _quantities (count=%s)", item_id, len(self._quantities))
            return obj

    def get_quantity(self, item_id: str) -> quantity:
        with self._lock:
            obj = self._quantities.get(item_id)
            if obj is None:
                raise KeyError(f"unknown quantity id: {item_id}")
            log.info("[WarehouseOrderFulfillmentService.get_quantity] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_sku(self, item_id: str) -> SKU:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._skus.get(item_id)
            if obj is None:
                raise KeyError(f"unknown SKU id: {item_id}")
            log.info("[WarehouseOrderFulfillmentService.close_sku] closing %s via SKU.close()", item_id)
            obj.close()
            return obj

    def list_active_skus(self) -> List[SKU]:
        with self._lock:
            active = [o for o in self._skus.values() if o.status == "ACTIVE"]
            log.info("[WarehouseOrderFulfillmentService.list_active_skus] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct WarehouseOrderFulfillmentService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = WarehouseOrderFulfillmentService()

    log.info("========== STEP 2: Create primary SKU objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_sku("alpha-sku")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_sku("beta-sku")

    log.info("========== STEP 3: Create Bin (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_bin("sample-bin")

    log.info("========== STEP 4: Create InventoryRecord (UML class) ==========")
    system.create_inventory_record("sample-inventory_record")

    log.info("========== STEP 5: Create bin (UML class) ==========")
    system.create_bin("sample-bin")

    log.info("========== STEP 6: Create quantity (UML class) ==========")
    system.create_quantity("sample-quantity")

    log.info("========== STEP 7: Inspect active SKU list ==========")
    system.list_active_skus()

    log.info("========== STEP 8: Close first SKU ==========")
    system.close_sku(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_sku(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from SKU.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_sku("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_sku: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_skus()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class SKU {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  SKU(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("SKU.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("SKU.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[SKU.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("SKU " + id + " invalid status");
    }
    System.out.println("[SKU.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("SKU " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[SKU.close] id=" + id + " -> CLOSED");
  }
}


class Bin {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Bin(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Bin.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Bin.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Bin.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Bin " + id + " invalid status");
    }
    System.out.println("[Bin.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Bin " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Bin.close] id=" + id + " -> CLOSED");
  }
}


class InventoryRecord {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  InventoryRecord(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("InventoryRecord.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("InventoryRecord.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[InventoryRecord.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("InventoryRecord " + id + " invalid status");
    }
    System.out.println("[InventoryRecord.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("InventoryRecord " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[InventoryRecord.close] id=" + id + " -> CLOSED");
  }
}


class bin {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  bin(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("bin.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("bin.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[bin.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("bin " + id + " invalid status");
    }
    System.out.println("[bin.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("bin " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[bin.close] id=" + id + " -> CLOSED");
  }
}


class quantity {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  quantity(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("quantity.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("quantity.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[quantity.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("quantity " + id + " invalid status");
    }
    System.out.println("[quantity.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("quantity " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[quantity.close] id=" + id + " -> CLOSED");
  }
}

public class WarehouseOrderFulfillmentService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, SKU> skus = new LinkedHashMap<>();
  private final Map<String, Bin> bins = new LinkedHashMap<>();
  private final Map<String, InventoryRecord> inventory_records = new LinkedHashMap<>();
  private final Map<String, bin> bins = new LinkedHashMap<>();
  private final Map<String, quantity> quantities = new LinkedHashMap<>();

  public WarehouseOrderFulfillmentService() {
    System.out.println("[WarehouseOrderFulfillmentService.__init__] system ready");
  }

  public SKU createSKU(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("SKU name required");
    }
    lock.lock();
    try {
      String id = String.format("SKU-%04d", seq++);
      SKU obj = new SKU(id, name.trim());
      obj.validate();
      skus.put(id, obj);
      System.out.println("[WarehouseOrderFulfillmentService.createSKU] stored " + id + " count=" + skus.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public SKU getSKU(String id) {
    lock.lock();
    try {
      SKU obj = skus.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown SKU id: " + id);
      }
      System.out.println("[WarehouseOrderFulfillmentService.getSKU] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Bin createBin(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Bin name required");
    }
    lock.lock();
    try {
      String id = String.format("BIN-%04d", seq++);
      Bin obj = new Bin(id, name.trim());
      obj.validate();
      bins.put(id, obj);
      System.out.println("[WarehouseOrderFulfillmentService.createBin] stored " + id + " count=" + bins.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Bin getBin(String id) {
    lock.lock();
    try {
      Bin obj = bins.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Bin id: " + id);
      }
      System.out.println("[WarehouseOrderFulfillmentService.getBin] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public InventoryRecord createInventoryRecord(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("InventoryRecord name required");
    }
    lock.lock();
    try {
      String id = String.format("INV-%04d", seq++);
      InventoryRecord obj = new InventoryRecord(id, name.trim());
      obj.validate();
      inventory_records.put(id, obj);
      System.out.println("[WarehouseOrderFulfillmentService.createInventoryRecord] stored " + id + " count=" + inventory_records.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public InventoryRecord getInventoryRecord(String id) {
    lock.lock();
    try {
      InventoryRecord obj = inventory_records.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown InventoryRecord id: " + id);
      }
      System.out.println("[WarehouseOrderFulfillmentService.getInventoryRecord] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public bin createbin(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("bin name required");
    }
    lock.lock();
    try {
      String id = String.format("BIN-%04d", seq++);
      bin obj = new bin(id, name.trim());
      obj.validate();
      bins.put(id, obj);
      System.out.println("[WarehouseOrderFulfillmentService.createbin] stored " + id + " count=" + bins.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public bin getbin(String id) {
    lock.lock();
    try {
      bin obj = bins.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown bin id: " + id);
      }
      System.out.println("[WarehouseOrderFulfillmentService.getbin] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public quantity createquantity(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("quantity name required");
    }
    lock.lock();
    try {
      String id = String.format("QUA-%04d", seq++);
      quantity obj = new quantity(id, name.trim());
      obj.validate();
      quantities.put(id, obj);
      System.out.println("[WarehouseOrderFulfillmentService.createquantity] stored " + id + " count=" + quantities.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public quantity getquantity(String id) {
    lock.lock();
    try {
      quantity obj = quantities.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown quantity id: " + id);
      }
      System.out.println("[WarehouseOrderFulfillmentService.getquantity] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public SKU closeSKU(String id) {
    lock.lock();
    try {
      SKU obj = skus.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown SKU id: " + id);
      }
      System.out.println("[WarehouseOrderFulfillmentService.closeSKU] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<SKU> listActiveSKUs() {
    lock.lock();
    try {
      List<SKU> out = new ArrayList<>();
      for (SKU o : skus.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[WarehouseOrderFulfillmentService.listActiveSKUs] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct WarehouseOrderFulfillmentService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    WarehouseOrderFulfillmentService system = new WarehouseOrderFulfillmentService();
    System.out.println("========== STEP 2: Create SKU objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    SKU first = system.createSKU("alpha-sku");
    system.createSKU("beta-sku");
    System.out.println("========== STEP 3: Create Bin ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createBin("sample-bin");
    System.out.println("========== STEP 4: Create InventoryRecord ==========");
    system.createInventoryRecord("sample-inventory_record");
    System.out.println("========== STEP 5: Create bin ==========");
    system.createbin("sample-bin");
    System.out.println("========== STEP 6: Create quantity ==========");
    system.createquantity("sample-quantity");
    System.out.println("========== Inspect active list ==========");
    system.listActiveSKUs();
    System.out.println("========== Close first SKU ==========");
    system.closeSKU(first.getId());
    try {
      system.closeSKU(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getSKU("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class SKU {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('SKU.id required')
    }

    if (!name?.trim()) {
      throw new Error('SKU.name required')
    }
    console.log(\`[SKU.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`SKU \${this.id} invalid status\`)
    }
    console.log(\`[SKU.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`SKU \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[SKU.close] id=\${this.id} -> CLOSED\`)
  }
}


class Bin {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Bin.id required')
    }

    if (!name?.trim()) {
      throw new Error('Bin.name required')
    }
    console.log(\`[Bin.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Bin \${this.id} invalid status\`)
    }
    console.log(\`[Bin.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Bin \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Bin.close] id=\${this.id} -> CLOSED\`)
  }
}


class InventoryRecord {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('InventoryRecord.id required')
    }

    if (!name?.trim()) {
      throw new Error('InventoryRecord.name required')
    }
    console.log(\`[InventoryRecord.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`InventoryRecord \${this.id} invalid status\`)
    }
    console.log(\`[InventoryRecord.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`InventoryRecord \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[InventoryRecord.close] id=\${this.id} -> CLOSED\`)
  }
}


class bin {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('bin.id required')
    }

    if (!name?.trim()) {
      throw new Error('bin.name required')
    }
    console.log(\`[bin.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`bin \${this.id} invalid status\`)
    }
    console.log(\`[bin.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`bin \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[bin.close] id=\${this.id} -> CLOSED\`)
  }
}


class quantity {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('quantity.id required')
    }

    if (!name?.trim()) {
      throw new Error('quantity.name required')
    }
    console.log(\`[quantity.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`quantity \${this.id} invalid status\`)
    }
    console.log(\`[quantity.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`quantity \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[quantity.close] id=\${this.id} -> CLOSED\`)
  }
}

class WarehouseOrderFulfillmentService {
  private seq = 1
  private skus = new Map<string, SKU>()
  private bins = new Map<string, Bin>()
  private inventory_records = new Map<string, InventoryRecord>()
  private bins = new Map<string, bin>()
  private quantities = new Map<string, quantity>()
  constructor() {
    console.log('[WarehouseOrderFulfillmentService.__init__] system ready')
  }

  createSKU(name: string): SKU {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('SKU name required')
    }
    const id = \`SKU-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new SKU(id, cleaned)
    obj.validate()
    this.skus.set(id, obj)
    console.log(\`[WarehouseOrderFulfillmentService.createSKU] stored \${id} count=\${this.skus.size}\`)
    return obj
  }

  getSKU(id: string): SKU {
    const obj = this.skus.get(id)
    if (!obj) {
      throw new Error(\`unknown SKU id: \${id}\`)
    }
    console.log(\`[WarehouseOrderFulfillmentService.getSKU] found id=\${obj.id}\`)
    return obj
  }

  createBin(name: string): Bin {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Bin name required')
    }
    const id = \`BIN-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Bin(id, cleaned)
    obj.validate()
    this.bins.set(id, obj)
    console.log(\`[WarehouseOrderFulfillmentService.createBin] stored \${id} count=\${this.bins.size}\`)
    return obj
  }

  getBin(id: string): Bin {
    const obj = this.bins.get(id)
    if (!obj) {
      throw new Error(\`unknown Bin id: \${id}\`)
    }
    console.log(\`[WarehouseOrderFulfillmentService.getBin] found id=\${obj.id}\`)
    return obj
  }

  createInventoryRecord(name: string): InventoryRecord {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('InventoryRecord name required')
    }
    const id = \`INV-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new InventoryRecord(id, cleaned)
    obj.validate()
    this.inventory_records.set(id, obj)
    console.log(\`[WarehouseOrderFulfillmentService.createInventoryRecord] stored \${id} count=\${this.inventory_records.size}\`)
    return obj
  }

  getInventoryRecord(id: string): InventoryRecord {
    const obj = this.inventory_records.get(id)
    if (!obj) {
      throw new Error(\`unknown InventoryRecord id: \${id}\`)
    }
    console.log(\`[WarehouseOrderFulfillmentService.getInventoryRecord] found id=\${obj.id}\`)
    return obj
  }

  createbin(name: string): bin {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('bin name required')
    }
    const id = \`BIN-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new bin(id, cleaned)
    obj.validate()
    this.bins.set(id, obj)
    console.log(\`[WarehouseOrderFulfillmentService.createbin] stored \${id} count=\${this.bins.size}\`)
    return obj
  }

  getbin(id: string): bin {
    const obj = this.bins.get(id)
    if (!obj) {
      throw new Error(\`unknown bin id: \${id}\`)
    }
    console.log(\`[WarehouseOrderFulfillmentService.getbin] found id=\${obj.id}\`)
    return obj
  }

  createquantity(name: string): quantity {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('quantity name required')
    }
    const id = \`QUA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new quantity(id, cleaned)
    obj.validate()
    this.quantities.set(id, obj)
    console.log(\`[WarehouseOrderFulfillmentService.createquantity] stored \${id} count=\${this.quantities.size}\`)
    return obj
  }

  getquantity(id: string): quantity {
    const obj = this.quantities.get(id)
    if (!obj) {
      throw new Error(\`unknown quantity id: \${id}\`)
    }
    console.log(\`[WarehouseOrderFulfillmentService.getquantity] found id=\${obj.id}\`)
    return obj
  }

  closeSKU(id: string): SKU {
    const obj = this.getSKU(id)
    console.log(\`[WarehouseOrderFulfillmentService.closeSKU] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveSKUs(): SKU[] {
    const active = [...this.skus.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[WarehouseOrderFulfillmentService.listActiveSKUs] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct WarehouseOrderFulfillmentService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new WarehouseOrderFulfillmentService()
  console.log('========== STEP 2: Create SKU objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createSKU('alpha-sku')
  system.createSKU('beta-sku')
  console.log('========== STEP 3: Create Bin ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createBin('sample-bin')
  console.log('========== STEP 4: Create InventoryRecord ==========')
  system.createInventoryRecord('sample-inventory_record')
  console.log('========== STEP 5: Create bin ==========')
  system.createbin('sample-bin')
  console.log('========== STEP 6: Create quantity ==========')
  system.createquantity('sample-quantity')
  system.listActiveSKUs()
  console.log('========== Close first SKU ==========')
  system.closeSKU(first.id)
  try {
    system.closeSKU(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getSKU('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class SKU {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  SKU(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("SKU requires id and name");
    }
    cout << "[SKU.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("SKU invalid status");
    }
    cout << "[SKU.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("SKU cannot close");
    }
    status_ = "CLOSED";
    cout << "[SKU.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Bin {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Bin(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Bin requires id and name");
    }
    cout << "[Bin.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Bin invalid status");
    }
    cout << "[Bin.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Bin cannot close");
    }
    status_ = "CLOSED";
    cout << "[Bin.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class InventoryRecord {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  InventoryRecord(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("InventoryRecord requires id and name");
    }
    cout << "[InventoryRecord.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("InventoryRecord invalid status");
    }
    cout << "[InventoryRecord.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("InventoryRecord cannot close");
    }
    status_ = "CLOSED";
    cout << "[InventoryRecord.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class bin {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  bin(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("bin requires id and name");
    }
    cout << "[bin.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("bin invalid status");
    }
    cout << "[bin.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("bin cannot close");
    }
    status_ = "CLOSED";
    cout << "[bin.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class quantity {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  quantity(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("quantity requires id and name");
    }
    cout << "[quantity.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("quantity invalid status");
    }
    cout << "[quantity.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("quantity cannot close");
    }
    status_ = "CLOSED";
    cout << "[quantity.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class WarehouseOrderFulfillmentService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, SKU> skus_;
  unordered_map<string, Bin> bins_;
  unordered_map<string, InventoryRecord> inventory_records_;
  unordered_map<string, bin> bins_;
  unordered_map<string, quantity> quantities_;
public:
  WarehouseOrderFulfillmentService() {
    cout << "[WarehouseOrderFulfillmentService.__init__] system ready" << endl;
  }

  SKU createSKU(const string& name) {
    if (name.empty()) {
      throw invalid_argument("SKU name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SKU-%04d", seq_++);
    SKU obj{buf, name};
    obj.validate();
    skus_.emplace(obj.id(), obj);
    cout << "[WarehouseOrderFulfillmentService.createSKU] stored " << obj.id() << endl;
    return obj;
  }

  SKU getSKU(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = skus_.find(id);
    if (it == skus_.end()) {
      throw out_of_range("unknown SKU id");
    }
    cout << "[WarehouseOrderFulfillmentService.getSKU] found " << id << endl;
    return it->second;
  }

  Bin createBin(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Bin name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BIN-%04d", seq_++);
    Bin obj{buf, name};
    obj.validate();
    bins_.emplace(obj.id(), obj);
    cout << "[WarehouseOrderFulfillmentService.createBin] stored " << obj.id() << endl;
    return obj;
  }

  Bin getBin(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = bins_.find(id);
    if (it == bins_.end()) {
      throw out_of_range("unknown Bin id");
    }
    cout << "[WarehouseOrderFulfillmentService.getBin] found " << id << endl;
    return it->second;
  }

  InventoryRecord createInventoryRecord(const string& name) {
    if (name.empty()) {
      throw invalid_argument("InventoryRecord name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "INV-%04d", seq_++);
    InventoryRecord obj{buf, name};
    obj.validate();
    inventory_records_.emplace(obj.id(), obj);
    cout << "[WarehouseOrderFulfillmentService.createInventoryRecord] stored " << obj.id() << endl;
    return obj;
  }

  InventoryRecord getInventoryRecord(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = inventory_records_.find(id);
    if (it == inventory_records_.end()) {
      throw out_of_range("unknown InventoryRecord id");
    }
    cout << "[WarehouseOrderFulfillmentService.getInventoryRecord] found " << id << endl;
    return it->second;
  }

  bin createbin(const string& name) {
    if (name.empty()) {
      throw invalid_argument("bin name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BIN-%04d", seq_++);
    bin obj{buf, name};
    obj.validate();
    bins_.emplace(obj.id(), obj);
    cout << "[WarehouseOrderFulfillmentService.createbin] stored " << obj.id() << endl;
    return obj;
  }

  bin getbin(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = bins_.find(id);
    if (it == bins_.end()) {
      throw out_of_range("unknown bin id");
    }
    cout << "[WarehouseOrderFulfillmentService.getbin] found " << id << endl;
    return it->second;
  }

  quantity createquantity(const string& name) {
    if (name.empty()) {
      throw invalid_argument("quantity name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "QUA-%04d", seq_++);
    quantity obj{buf, name};
    obj.validate();
    quantities_.emplace(obj.id(), obj);
    cout << "[WarehouseOrderFulfillmentService.createquantity] stored " << obj.id() << endl;
    return obj;
  }

  quantity getquantity(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = quantities_.find(id);
    if (it == quantities_.end()) {
      throw out_of_range("unknown quantity id");
    }
    cout << "[WarehouseOrderFulfillmentService.getquantity] found " << id << endl;
    return it->second;
  }

  SKU closeSKU(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = skus_.find(id);
    if (it == skus_.end()) {
      throw out_of_range("unknown SKU");
    }
    cout << "[WarehouseOrderFulfillmentService.closeSKU] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct WarehouseOrderFulfillmentService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  WarehouseOrderFulfillmentService system;
  cout << "========== STEP 2: Create SKU ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createSKU("alpha-sku");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createSKU("beta-sku");
  system.createBin("sample-bin");
  system.createInventoryRecord("sample-inventory_record");
  system.createbin("sample-bin");
  system.createquantity("sample-quantity");
  system.closeSKU(first.id());
  try {
    system.closeSKU(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getSKU("MISSING-ID");
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

type SKU struct {
  ID     string
  Name   string
  Status string
}

func NewSKU(id, name string) (*SKU, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("SKU requires id and name")
  }
  obj := &SKU{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[SKU.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *SKU) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("SKU invalid status")
  }
  fmt.Printf("[SKU.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *SKU) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("SKU %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[SKU.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Bin struct {
  ID     string
  Name   string
  Status string
}

func NewBin(id, name string) (*Bin, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Bin requires id and name")
  }
  obj := &Bin{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Bin.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Bin) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Bin invalid status")
  }
  fmt.Printf("[Bin.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Bin) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Bin %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Bin.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type InventoryRecord struct {
  ID     string
  Name   string
  Status string
}

func NewInventoryRecord(id, name string) (*InventoryRecord, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("InventoryRecord requires id and name")
  }
  obj := &InventoryRecord{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[InventoryRecord.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *InventoryRecord) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("InventoryRecord invalid status")
  }
  fmt.Printf("[InventoryRecord.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *InventoryRecord) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("InventoryRecord %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[InventoryRecord.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type bin struct {
  ID     string
  Name   string
  Status string
}

func Newbin(id, name string) (*bin, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("bin requires id and name")
  }
  obj := &bin{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[bin.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *bin) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("bin invalid status")
  }
  fmt.Printf("[bin.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *bin) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("bin %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[bin.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type quantity struct {
  ID     string
  Name   string
  Status string
}

func Newquantity(id, name string) (*quantity, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("quantity requires id and name")
  }
  obj := &quantity{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[quantity.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *quantity) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("quantity invalid status")
  }
  fmt.Printf("[quantity.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *quantity) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("quantity %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[quantity.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type WarehouseOrderFulfillmentService struct {
  mu  sync.Mutex
  seq int
  skus map[string]*SKU
  bins map[string]*Bin
  inventory_records map[string]*InventoryRecord
  bins map[string]*bin
  quantities map[string]*quantity
}

func NewWarehouseOrderFulfillmentService() *WarehouseOrderFulfillmentService {
  fmt.Println("[WarehouseOrderFulfillmentService.__init__] system ready")
  return &WarehouseOrderFulfillmentService{
    seq: 1,
    skus: map[string]*SKU{},
    bins: map[string]*Bin{},
    inventory_records: map[string]*InventoryRecord{},
    bins: map[string]*bin{},
    quantities: map[string]*quantity{},
  }
}

func (s *WarehouseOrderFulfillmentService) CreateSKU(name string) (*SKU, error) {
  if name == "" {
    return nil, fmt.Errorf("SKU name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SKU-%04d", s.seq)
  s.seq++
  obj, err := NewSKU(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.skus[id] = obj
  fmt.Printf("[WarehouseOrderFulfillmentService.CreateSKU] stored %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) GetSKU(id string) (*SKU, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.skus[id]
  if !ok {
    return nil, fmt.Errorf("unknown SKU id: %s", id)
  }
  fmt.Printf("[WarehouseOrderFulfillmentService.GetSKU] found %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) CreateBin(name string) (*Bin, error) {
  if name == "" {
    return nil, fmt.Errorf("Bin name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BIN-%04d", s.seq)
  s.seq++
  obj, err := NewBin(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.bins[id] = obj
  fmt.Printf("[WarehouseOrderFulfillmentService.CreateBin] stored %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) GetBin(id string) (*Bin, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.bins[id]
  if !ok {
    return nil, fmt.Errorf("unknown Bin id: %s", id)
  }
  fmt.Printf("[WarehouseOrderFulfillmentService.GetBin] found %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) CreateInventoryRecord(name string) (*InventoryRecord, error) {
  if name == "" {
    return nil, fmt.Errorf("InventoryRecord name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("INV-%04d", s.seq)
  s.seq++
  obj, err := NewInventoryRecord(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.inventory_records[id] = obj
  fmt.Printf("[WarehouseOrderFulfillmentService.CreateInventoryRecord] stored %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) GetInventoryRecord(id string) (*InventoryRecord, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.inventory_records[id]
  if !ok {
    return nil, fmt.Errorf("unknown InventoryRecord id: %s", id)
  }
  fmt.Printf("[WarehouseOrderFulfillmentService.GetInventoryRecord] found %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) Createbin(name string) (*bin, error) {
  if name == "" {
    return nil, fmt.Errorf("bin name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BIN-%04d", s.seq)
  s.seq++
  obj, err := Newbin(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.bins[id] = obj
  fmt.Printf("[WarehouseOrderFulfillmentService.Createbin] stored %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) Getbin(id string) (*bin, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.bins[id]
  if !ok {
    return nil, fmt.Errorf("unknown bin id: %s", id)
  }
  fmt.Printf("[WarehouseOrderFulfillmentService.Getbin] found %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) Createquantity(name string) (*quantity, error) {
  if name == "" {
    return nil, fmt.Errorf("quantity name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("QUA-%04d", s.seq)
  s.seq++
  obj, err := Newquantity(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.quantities[id] = obj
  fmt.Printf("[WarehouseOrderFulfillmentService.Createquantity] stored %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) Getquantity(id string) (*quantity, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.quantities[id]
  if !ok {
    return nil, fmt.Errorf("unknown quantity id: %s", id)
  }
  fmt.Printf("[WarehouseOrderFulfillmentService.Getquantity] found %s\\n", id)
  return obj, nil
}

func (s *WarehouseOrderFulfillmentService) CloseSKU(id string) (*SKU, error) {
  obj, err := s.GetSKU(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[WarehouseOrderFulfillmentService.CloseSKU] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct WarehouseOrderFulfillmentService ==========")
  system := NewWarehouseOrderFulfillmentService()
  fmt.Println("========== STEP 2: Create SKU ==========")
  first, _ := system.CreateSKU("alpha-sku")
  system.CreateSKU("beta-sku")
  system.CreateBin("sample-bin")
  system.CreateInventoryRecord("sample-inventory_record")
  system.Createbin("sample-bin")
  system.Createquantity("sample-quantity")
  system.CloseSKU(first.ID)
  if _, err := system.CloseSKU(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetSKU("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class SKU {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public SKU(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("SKU requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[SKU.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("SKU invalid status");
    }
    Console.WriteLine("[SKU.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("SKU " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[SKU.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Bin {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Bin(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Bin requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Bin.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Bin invalid status");
    }
    Console.WriteLine("[Bin.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Bin " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Bin.close] id=" + Id + " -> CLOSED");
  }
}


sealed class InventoryRecord {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public InventoryRecord(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("InventoryRecord requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[InventoryRecord.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("InventoryRecord invalid status");
    }
    Console.WriteLine("[InventoryRecord.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("InventoryRecord " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[InventoryRecord.close] id=" + Id + " -> CLOSED");
  }
}


sealed class bin {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public bin(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("bin requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[bin.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("bin invalid status");
    }
    Console.WriteLine("[bin.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("bin " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[bin.close] id=" + Id + " -> CLOSED");
  }
}


sealed class quantity {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public quantity(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("quantity requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[quantity.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("quantity invalid status");
    }
    Console.WriteLine("[quantity.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("quantity " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[quantity.close] id=" + Id + " -> CLOSED");
  }
}

sealed class WarehouseOrderFulfillmentService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, SKU> _skus = new();
  private readonly Dictionary<string, Bin> _bins = new();
  private readonly Dictionary<string, InventoryRecord> _inventory_records = new();
  private readonly Dictionary<string, bin> _bins = new();
  private readonly Dictionary<string, quantity> _quantities = new();
  public WarehouseOrderFulfillmentService() {
    Console.WriteLine("[WarehouseOrderFulfillmentService.__init__] system ready");
  }

  public SKU CreateSKU(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("SKU name required");
    }
    lock (_gate) {
      var id = string.Format("SKU-{0:D4}", _seq++);
      var obj = new SKU(id, name.Trim());
      obj.Validate();
      _skus[id] = obj;
      Console.WriteLine("[WarehouseOrderFulfillmentService.CreateSKU] stored " + id);
      return obj;
    }
  }

  public SKU GetSKU(string id) {
    lock (_gate) {
      if (!_skus.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown SKU id: " + id);
      }
      Console.WriteLine("[WarehouseOrderFulfillmentService.GetSKU] found " + id);
      return obj;
    }
  }

  public Bin CreateBin(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Bin name required");
    }
    lock (_gate) {
      var id = string.Format("BIN-{0:D4}", _seq++);
      var obj = new Bin(id, name.Trim());
      obj.Validate();
      _bins[id] = obj;
      Console.WriteLine("[WarehouseOrderFulfillmentService.CreateBin] stored " + id);
      return obj;
    }
  }

  public Bin GetBin(string id) {
    lock (_gate) {
      if (!_bins.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Bin id: " + id);
      }
      Console.WriteLine("[WarehouseOrderFulfillmentService.GetBin] found " + id);
      return obj;
    }
  }

  public InventoryRecord CreateInventoryRecord(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("InventoryRecord name required");
    }
    lock (_gate) {
      var id = string.Format("INV-{0:D4}", _seq++);
      var obj = new InventoryRecord(id, name.Trim());
      obj.Validate();
      _inventory_records[id] = obj;
      Console.WriteLine("[WarehouseOrderFulfillmentService.CreateInventoryRecord] stored " + id);
      return obj;
    }
  }

  public InventoryRecord GetInventoryRecord(string id) {
    lock (_gate) {
      if (!_inventory_records.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown InventoryRecord id: " + id);
      }
      Console.WriteLine("[WarehouseOrderFulfillmentService.GetInventoryRecord] found " + id);
      return obj;
    }
  }

  public bin Createbin(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("bin name required");
    }
    lock (_gate) {
      var id = string.Format("BIN-{0:D4}", _seq++);
      var obj = new bin(id, name.Trim());
      obj.Validate();
      _bins[id] = obj;
      Console.WriteLine("[WarehouseOrderFulfillmentService.Createbin] stored " + id);
      return obj;
    }
  }

  public bin Getbin(string id) {
    lock (_gate) {
      if (!_bins.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown bin id: " + id);
      }
      Console.WriteLine("[WarehouseOrderFulfillmentService.Getbin] found " + id);
      return obj;
    }
  }

  public quantity Createquantity(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("quantity name required");
    }
    lock (_gate) {
      var id = string.Format("QUA-{0:D4}", _seq++);
      var obj = new quantity(id, name.Trim());
      obj.Validate();
      _quantities[id] = obj;
      Console.WriteLine("[WarehouseOrderFulfillmentService.Createquantity] stored " + id);
      return obj;
    }
  }

  public quantity Getquantity(string id) {
    lock (_gate) {
      if (!_quantities.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown quantity id: " + id);
      }
      Console.WriteLine("[WarehouseOrderFulfillmentService.Getquantity] found " + id);
      return obj;
    }
  }

  public SKU CloseSKU(string id) {
    var obj = GetSKU(id);
    Console.WriteLine("[WarehouseOrderFulfillmentService.CloseSKU] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct WarehouseOrderFulfillmentService ==========");
    var system = new WarehouseOrderFulfillmentService();
    Console.WriteLine("========== STEP 2: Create SKU ==========");
    var first = system.CreateSKU("alpha-sku");
    system.CreateSKU("beta-sku");
    system.CreateBin("sample-bin");
    system.CreateInventoryRecord("sample-inventory_record");
    system.Createbin("sample-bin");
    system.Createquantity("sample-quantity");
    system.CloseSKU(first.Id);
    try {
      system.CloseSKU(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetSKU("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const warehouseOrderFulfillmentSolution: ProblemSolution = {
  slug: 'warehouse-order-fulfillment',
  title: 'Warehouse Order Fulfillment System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a warehouse management system that picks, packs, and ships customer orders from inventory across multiple bins. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Track inventory quantity per SKU across multiple warehouse bins',
      'Allocate inventory to an order at checkout time',
      'Generate an optimized pick list/path for warehouse staff',
      'Pack items into shipment boxes based on size/weight',
      'Update order status: allocated, picking, packed, shipped',
      'Handle partial fulfillment when stock is insufficient',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Track inventory quantity per SKU across multiple warehouse bins?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Allocate inventory to an order at checkout time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Generate an optimized pick list/path for warehouse staff?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Pack items into shipment boxes based on size/weight?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Update order status: allocated, picking, packed, shipped?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. WarehouseOrderFulfillmentService is the facade stereotype. SKU, Bin, InventoryRecord, bin, quantity are concrete domain classes with id/name/status and validate/close.',
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
          'Construct WarehouseOrderFulfillmentService.',
          'createSKU twice and create the related UML classes.',
          'closeSKU once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'WarehouseOrderFulfillmentService', responsibility: 'UML facade - orchestrates Warehouse Order Fulfillment System.', keyMembers: ['create*', 'get*', 'closeSKU'] },
    { name: 'SKU', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Bin', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'InventoryRecord', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'bin', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'quantity', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from WarehouseOrderFulfillmentService to SKU, Bin, InventoryRecord, bin, quantity. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on WarehouseOrderFulfillmentService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'WarehouseOrderFulfillmentService', responsibility: 'UML facade - orchestrates Warehouse Order Fulfillment System.', keyMembers: ['create*', 'get*', 'closeSKU'] },
    { name: 'SKU', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Bin', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'InventoryRecord', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'bin', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'quantity', responsibility: 'UML class - domain object for Warehouse Order Fulfillment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'WarehouseOrderFulfillmentService exposes create/get/close and owns composed collections.' },
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
      'main constructs WarehouseOrderFulfillmentService, creates UML domain objects, closes the primary SKU, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct WarehouseOrderFulfillmentService.',
      'createSKU for alpha and beta.',
      'create remaining UML classes.',
      'closeSKU(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createSKU("alpha..."); closeSKU(id)',
        output: '[SKU.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeSKU(alreadyClosed) or getSKU("MISSING-ID")',
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
