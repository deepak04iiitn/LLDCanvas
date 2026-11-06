import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'InventoryManagementService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_products', 'Map<string, Product>'),
    attr('-', '_skus', 'Map<string, SKU>'),
    attr('-', '_warehouses', 'Map<string, Warehouse>'),
    attr('-', '_inventory_items', 'Map<string, InventoryItem>'),
    attr('-', '_stock_reservations', 'Map<string, StockReservation>'),
  ], [
    method('+', 'createProduct', 'name: string', 'Product'),
    method('+', 'createSKU', 'name: string', 'SKU'),
    method('+', 'createWarehouse', 'name: string', 'Warehouse'),
    method('+', 'createInventoryItem', 'name: string', 'InventoryItem'),
    method('+', 'createStockReservation', 'name: string', 'StockReservation'),
    method('+', 'getProduct', 'id: string', 'Product'),
    method('+', 'getSKU', 'id: string', 'SKU'),
    method('+', 'getWarehouse', 'id: string', 'Warehouse'),
    method('+', 'getInventoryItem', 'id: string', 'InventoryItem'),
    method('+', 'getStockReservation', 'id: string', 'StockReservation'),
    method('+', 'closeProduct', 'id: string', 'Product'),
  ], 'facade'),
  cls('n1', 'Product', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'SKU', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Warehouse', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'InventoryItem', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'StockReservation', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("inventory-management")


class Product:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Product.id is required")
        if not name or not name.strip():
            raise ValueError("Product.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Product.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Product {self.id} has invalid status={self.status}")
        log.info("[Product.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Product {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Product.close] id=%s -> CLOSED", self.id)


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


class Warehouse:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Warehouse.id is required")
        if not name or not name.strip():
            raise ValueError("Warehouse.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Warehouse.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Warehouse {self.id} has invalid status={self.status}")
        log.info("[Warehouse.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Warehouse {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Warehouse.close] id=%s -> CLOSED", self.id)


class InventoryItem:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("InventoryItem.id is required")
        if not name or not name.strip():
            raise ValueError("InventoryItem.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[InventoryItem.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"InventoryItem {self.id} has invalid status={self.status}")
        log.info("[InventoryItem.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"InventoryItem {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[InventoryItem.close] id=%s -> CLOSED", self.id)


class StockReservation:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("StockReservation.id is required")
        if not name or not name.strip():
            raise ValueError("StockReservation.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[StockReservation.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"StockReservation {self.id} has invalid status={self.status}")
        log.info("[StockReservation.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"StockReservation {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[StockReservation.close] id=%s -> CLOSED", self.id)


class InventoryManagementService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._products: Dict[str, Product] = {}
        self._skus: Dict[str, SKU] = {}
        self._warehouses: Dict[str, Warehouse] = {}
        self._inventory_items: Dict[str, InventoryItem] = {}
        self._stock_reservations: Dict[str, StockReservation] = {}
        log.info("[InventoryManagementService.__init__] system ready; managing: Product, SKU, Warehouse, InventoryItem, StockReservation")

    def create_product(self, name: str) -> Product:
        """UML: InventoryManagementService.create_product(name) -> Product"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Product name is required")
        with self._lock:
            item_id = f"PRO-{self._seq:04d}"
            self._seq += 1
            obj = Product(item_id, cleaned)
            obj.validate()
            self._products[item_id] = obj
            log.info("[InventoryManagementService.create_product] stored %s in _products (count=%s)", item_id, len(self._products))
            return obj

    def get_product(self, item_id: str) -> Product:
        with self._lock:
            obj = self._products.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Product id: {item_id}")
            log.info("[InventoryManagementService.get_product] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_sku(self, name: str) -> SKU:
        """UML: InventoryManagementService.create_sku(name) -> SKU"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("SKU name is required")
        with self._lock:
            item_id = f"SKU-{self._seq:04d}"
            self._seq += 1
            obj = SKU(item_id, cleaned)
            obj.validate()
            self._skus[item_id] = obj
            log.info("[InventoryManagementService.create_sku] stored %s in _skus (count=%s)", item_id, len(self._skus))
            return obj

    def get_sku(self, item_id: str) -> SKU:
        with self._lock:
            obj = self._skus.get(item_id)
            if obj is None:
                raise KeyError(f"unknown SKU id: {item_id}")
            log.info("[InventoryManagementService.get_sku] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_warehouse(self, name: str) -> Warehouse:
        """UML: InventoryManagementService.create_warehouse(name) -> Warehouse"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Warehouse name is required")
        with self._lock:
            item_id = f"WAR-{self._seq:04d}"
            self._seq += 1
            obj = Warehouse(item_id, cleaned)
            obj.validate()
            self._warehouses[item_id] = obj
            log.info("[InventoryManagementService.create_warehouse] stored %s in _warehouses (count=%s)", item_id, len(self._warehouses))
            return obj

    def get_warehouse(self, item_id: str) -> Warehouse:
        with self._lock:
            obj = self._warehouses.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Warehouse id: {item_id}")
            log.info("[InventoryManagementService.get_warehouse] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_inventory_item(self, name: str) -> InventoryItem:
        """UML: InventoryManagementService.create_inventory_item(name) -> InventoryItem"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("InventoryItem name is required")
        with self._lock:
            item_id = f"INV-{self._seq:04d}"
            self._seq += 1
            obj = InventoryItem(item_id, cleaned)
            obj.validate()
            self._inventory_items[item_id] = obj
            log.info("[InventoryManagementService.create_inventory_item] stored %s in _inventory_items (count=%s)", item_id, len(self._inventory_items))
            return obj

    def get_inventory_item(self, item_id: str) -> InventoryItem:
        with self._lock:
            obj = self._inventory_items.get(item_id)
            if obj is None:
                raise KeyError(f"unknown InventoryItem id: {item_id}")
            log.info("[InventoryManagementService.get_inventory_item] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_stock_reservation(self, name: str) -> StockReservation:
        """UML: InventoryManagementService.create_stock_reservation(name) -> StockReservation"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("StockReservation name is required")
        with self._lock:
            item_id = f"STO-{self._seq:04d}"
            self._seq += 1
            obj = StockReservation(item_id, cleaned)
            obj.validate()
            self._stock_reservations[item_id] = obj
            log.info("[InventoryManagementService.create_stock_reservation] stored %s in _stock_reservations (count=%s)", item_id, len(self._stock_reservations))
            return obj

    def get_stock_reservation(self, item_id: str) -> StockReservation:
        with self._lock:
            obj = self._stock_reservations.get(item_id)
            if obj is None:
                raise KeyError(f"unknown StockReservation id: {item_id}")
            log.info("[InventoryManagementService.get_stock_reservation] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_product(self, item_id: str) -> Product:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._products.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Product id: {item_id}")
            log.info("[InventoryManagementService.close_product] closing %s via Product.close()", item_id)
            obj.close()
            return obj

    def list_active_products(self) -> List[Product]:
        with self._lock:
            active = [o for o in self._products.values() if o.status == "ACTIVE"]
            log.info("[InventoryManagementService.list_active_products] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct InventoryManagementService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = InventoryManagementService()

    log.info("========== STEP 2: Create primary Product objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_product("alpha-product")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_product("beta-product")

    log.info("========== STEP 3: Create SKU (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_sku("sample-sku")

    log.info("========== STEP 4: Create Warehouse (UML class) ==========")
    system.create_warehouse("sample-warehouse")

    log.info("========== STEP 5: Create InventoryItem (UML class) ==========")
    system.create_inventory_item("sample-inventory_item")

    log.info("========== STEP 6: Create StockReservation (UML class) ==========")
    system.create_stock_reservation("sample-stock_reservation")

    log.info("========== STEP 7: Inspect active Product list ==========")
    system.list_active_products()

    log.info("========== STEP 8: Close first Product ==========")
    system.close_product(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_product(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Product.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_product("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_product: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_products()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Product {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Product(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Product.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Product.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Product.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Product " + id + " invalid status");
    }
    System.out.println("[Product.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Product " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Product.close] id=" + id + " -> CLOSED");
  }
}


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


class Warehouse {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Warehouse(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Warehouse.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Warehouse.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Warehouse.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Warehouse " + id + " invalid status");
    }
    System.out.println("[Warehouse.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Warehouse " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Warehouse.close] id=" + id + " -> CLOSED");
  }
}


class InventoryItem {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  InventoryItem(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("InventoryItem.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("InventoryItem.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[InventoryItem.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("InventoryItem " + id + " invalid status");
    }
    System.out.println("[InventoryItem.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("InventoryItem " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[InventoryItem.close] id=" + id + " -> CLOSED");
  }
}


class StockReservation {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  StockReservation(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("StockReservation.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("StockReservation.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[StockReservation.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("StockReservation " + id + " invalid status");
    }
    System.out.println("[StockReservation.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("StockReservation " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[StockReservation.close] id=" + id + " -> CLOSED");
  }
}

public class InventoryManagementService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Product> products = new LinkedHashMap<>();
  private final Map<String, SKU> skus = new LinkedHashMap<>();
  private final Map<String, Warehouse> warehouses = new LinkedHashMap<>();
  private final Map<String, InventoryItem> inventory_items = new LinkedHashMap<>();
  private final Map<String, StockReservation> stock_reservations = new LinkedHashMap<>();

  public InventoryManagementService() {
    System.out.println("[InventoryManagementService.__init__] system ready");
  }

  public Product createProduct(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Product name required");
    }
    lock.lock();
    try {
      String id = String.format("PRO-%04d", seq++);
      Product obj = new Product(id, name.trim());
      obj.validate();
      products.put(id, obj);
      System.out.println("[InventoryManagementService.createProduct] stored " + id + " count=" + products.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Product getProduct(String id) {
    lock.lock();
    try {
      Product obj = products.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Product id: " + id);
      }
      System.out.println("[InventoryManagementService.getProduct] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
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
      System.out.println("[InventoryManagementService.createSKU] stored " + id + " count=" + skus.size());
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
      System.out.println("[InventoryManagementService.getSKU] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Warehouse createWarehouse(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Warehouse name required");
    }
    lock.lock();
    try {
      String id = String.format("WAR-%04d", seq++);
      Warehouse obj = new Warehouse(id, name.trim());
      obj.validate();
      warehouses.put(id, obj);
      System.out.println("[InventoryManagementService.createWarehouse] stored " + id + " count=" + warehouses.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Warehouse getWarehouse(String id) {
    lock.lock();
    try {
      Warehouse obj = warehouses.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Warehouse id: " + id);
      }
      System.out.println("[InventoryManagementService.getWarehouse] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public InventoryItem createInventoryItem(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("InventoryItem name required");
    }
    lock.lock();
    try {
      String id = String.format("INV-%04d", seq++);
      InventoryItem obj = new InventoryItem(id, name.trim());
      obj.validate();
      inventory_items.put(id, obj);
      System.out.println("[InventoryManagementService.createInventoryItem] stored " + id + " count=" + inventory_items.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public InventoryItem getInventoryItem(String id) {
    lock.lock();
    try {
      InventoryItem obj = inventory_items.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown InventoryItem id: " + id);
      }
      System.out.println("[InventoryManagementService.getInventoryItem] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public StockReservation createStockReservation(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("StockReservation name required");
    }
    lock.lock();
    try {
      String id = String.format("STO-%04d", seq++);
      StockReservation obj = new StockReservation(id, name.trim());
      obj.validate();
      stock_reservations.put(id, obj);
      System.out.println("[InventoryManagementService.createStockReservation] stored " + id + " count=" + stock_reservations.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public StockReservation getStockReservation(String id) {
    lock.lock();
    try {
      StockReservation obj = stock_reservations.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown StockReservation id: " + id);
      }
      System.out.println("[InventoryManagementService.getStockReservation] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Product closeProduct(String id) {
    lock.lock();
    try {
      Product obj = products.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Product id: " + id);
      }
      System.out.println("[InventoryManagementService.closeProduct] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Product> listActiveProducts() {
    lock.lock();
    try {
      List<Product> out = new ArrayList<>();
      for (Product o : products.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[InventoryManagementService.listActiveProducts] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct InventoryManagementService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    InventoryManagementService system = new InventoryManagementService();
    System.out.println("========== STEP 2: Create Product objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Product first = system.createProduct("alpha-product");
    system.createProduct("beta-product");
    System.out.println("========== STEP 3: Create SKU ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createSKU("sample-sku");
    System.out.println("========== STEP 4: Create Warehouse ==========");
    system.createWarehouse("sample-warehouse");
    System.out.println("========== STEP 5: Create InventoryItem ==========");
    system.createInventoryItem("sample-inventory_item");
    System.out.println("========== STEP 6: Create StockReservation ==========");
    system.createStockReservation("sample-stock_reservation");
    System.out.println("========== Inspect active list ==========");
    system.listActiveProducts();
    System.out.println("========== Close first Product ==========");
    system.closeProduct(first.getId());
    try {
      system.closeProduct(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getProduct("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Product {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Product.id required')
    }

    if (!name?.trim()) {
      throw new Error('Product.name required')
    }
    console.log(\`[Product.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Product \${this.id} invalid status\`)
    }
    console.log(\`[Product.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Product \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Product.close] id=\${this.id} -> CLOSED\`)
  }
}


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


class Warehouse {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Warehouse.id required')
    }

    if (!name?.trim()) {
      throw new Error('Warehouse.name required')
    }
    console.log(\`[Warehouse.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Warehouse \${this.id} invalid status\`)
    }
    console.log(\`[Warehouse.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Warehouse \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Warehouse.close] id=\${this.id} -> CLOSED\`)
  }
}


class InventoryItem {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('InventoryItem.id required')
    }

    if (!name?.trim()) {
      throw new Error('InventoryItem.name required')
    }
    console.log(\`[InventoryItem.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`InventoryItem \${this.id} invalid status\`)
    }
    console.log(\`[InventoryItem.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`InventoryItem \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[InventoryItem.close] id=\${this.id} -> CLOSED\`)
  }
}


class StockReservation {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('StockReservation.id required')
    }

    if (!name?.trim()) {
      throw new Error('StockReservation.name required')
    }
    console.log(\`[StockReservation.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`StockReservation \${this.id} invalid status\`)
    }
    console.log(\`[StockReservation.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`StockReservation \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[StockReservation.close] id=\${this.id} -> CLOSED\`)
  }
}

class InventoryManagementService {
  private seq = 1
  private products = new Map<string, Product>()
  private skus = new Map<string, SKU>()
  private warehouses = new Map<string, Warehouse>()
  private inventory_items = new Map<string, InventoryItem>()
  private stock_reservations = new Map<string, StockReservation>()
  constructor() {
    console.log('[InventoryManagementService.__init__] system ready')
  }

  createProduct(name: string): Product {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Product name required')
    }
    const id = \`PRO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Product(id, cleaned)
    obj.validate()
    this.products.set(id, obj)
    console.log(\`[InventoryManagementService.createProduct] stored \${id} count=\${this.products.size}\`)
    return obj
  }

  getProduct(id: string): Product {
    const obj = this.products.get(id)
    if (!obj) {
      throw new Error(\`unknown Product id: \${id}\`)
    }
    console.log(\`[InventoryManagementService.getProduct] found id=\${obj.id}\`)
    return obj
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
    console.log(\`[InventoryManagementService.createSKU] stored \${id} count=\${this.skus.size}\`)
    return obj
  }

  getSKU(id: string): SKU {
    const obj = this.skus.get(id)
    if (!obj) {
      throw new Error(\`unknown SKU id: \${id}\`)
    }
    console.log(\`[InventoryManagementService.getSKU] found id=\${obj.id}\`)
    return obj
  }

  createWarehouse(name: string): Warehouse {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Warehouse name required')
    }
    const id = \`WAR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Warehouse(id, cleaned)
    obj.validate()
    this.warehouses.set(id, obj)
    console.log(\`[InventoryManagementService.createWarehouse] stored \${id} count=\${this.warehouses.size}\`)
    return obj
  }

  getWarehouse(id: string): Warehouse {
    const obj = this.warehouses.get(id)
    if (!obj) {
      throw new Error(\`unknown Warehouse id: \${id}\`)
    }
    console.log(\`[InventoryManagementService.getWarehouse] found id=\${obj.id}\`)
    return obj
  }

  createInventoryItem(name: string): InventoryItem {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('InventoryItem name required')
    }
    const id = \`INV-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new InventoryItem(id, cleaned)
    obj.validate()
    this.inventory_items.set(id, obj)
    console.log(\`[InventoryManagementService.createInventoryItem] stored \${id} count=\${this.inventory_items.size}\`)
    return obj
  }

  getInventoryItem(id: string): InventoryItem {
    const obj = this.inventory_items.get(id)
    if (!obj) {
      throw new Error(\`unknown InventoryItem id: \${id}\`)
    }
    console.log(\`[InventoryManagementService.getInventoryItem] found id=\${obj.id}\`)
    return obj
  }

  createStockReservation(name: string): StockReservation {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('StockReservation name required')
    }
    const id = \`STO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new StockReservation(id, cleaned)
    obj.validate()
    this.stock_reservations.set(id, obj)
    console.log(\`[InventoryManagementService.createStockReservation] stored \${id} count=\${this.stock_reservations.size}\`)
    return obj
  }

  getStockReservation(id: string): StockReservation {
    const obj = this.stock_reservations.get(id)
    if (!obj) {
      throw new Error(\`unknown StockReservation id: \${id}\`)
    }
    console.log(\`[InventoryManagementService.getStockReservation] found id=\${obj.id}\`)
    return obj
  }

  closeProduct(id: string): Product {
    const obj = this.getProduct(id)
    console.log(\`[InventoryManagementService.closeProduct] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveProducts(): Product[] {
    const active = [...this.products.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[InventoryManagementService.listActiveProducts] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct InventoryManagementService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new InventoryManagementService()
  console.log('========== STEP 2: Create Product objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createProduct('alpha-product')
  system.createProduct('beta-product')
  console.log('========== STEP 3: Create SKU ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createSKU('sample-sku')
  console.log('========== STEP 4: Create Warehouse ==========')
  system.createWarehouse('sample-warehouse')
  console.log('========== STEP 5: Create InventoryItem ==========')
  system.createInventoryItem('sample-inventory_item')
  console.log('========== STEP 6: Create StockReservation ==========')
  system.createStockReservation('sample-stock_reservation')
  system.listActiveProducts()
  console.log('========== Close first Product ==========')
  system.closeProduct(first.id)
  try {
    system.closeProduct(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getProduct('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Product {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Product(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Product requires id and name");
    }
    cout << "[Product.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Product invalid status");
    }
    cout << "[Product.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Product cannot close");
    }
    status_ = "CLOSED";
    cout << "[Product.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


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


class Warehouse {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Warehouse(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Warehouse requires id and name");
    }
    cout << "[Warehouse.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Warehouse invalid status");
    }
    cout << "[Warehouse.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Warehouse cannot close");
    }
    status_ = "CLOSED";
    cout << "[Warehouse.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class InventoryItem {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  InventoryItem(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("InventoryItem requires id and name");
    }
    cout << "[InventoryItem.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("InventoryItem invalid status");
    }
    cout << "[InventoryItem.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("InventoryItem cannot close");
    }
    status_ = "CLOSED";
    cout << "[InventoryItem.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class StockReservation {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  StockReservation(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("StockReservation requires id and name");
    }
    cout << "[StockReservation.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("StockReservation invalid status");
    }
    cout << "[StockReservation.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("StockReservation cannot close");
    }
    status_ = "CLOSED";
    cout << "[StockReservation.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class InventoryManagementService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Product> products_;
  unordered_map<string, SKU> skus_;
  unordered_map<string, Warehouse> warehouses_;
  unordered_map<string, InventoryItem> inventory_items_;
  unordered_map<string, StockReservation> stock_reservations_;
public:
  InventoryManagementService() {
    cout << "[InventoryManagementService.__init__] system ready" << endl;
  }

  Product createProduct(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Product name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PRO-%04d", seq_++);
    Product obj{buf, name};
    obj.validate();
    products_.emplace(obj.id(), obj);
    cout << "[InventoryManagementService.createProduct] stored " << obj.id() << endl;
    return obj;
  }

  Product getProduct(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = products_.find(id);
    if (it == products_.end()) {
      throw out_of_range("unknown Product id");
    }
    cout << "[InventoryManagementService.getProduct] found " << id << endl;
    return it->second;
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
    cout << "[InventoryManagementService.createSKU] stored " << obj.id() << endl;
    return obj;
  }

  SKU getSKU(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = skus_.find(id);
    if (it == skus_.end()) {
      throw out_of_range("unknown SKU id");
    }
    cout << "[InventoryManagementService.getSKU] found " << id << endl;
    return it->second;
  }

  Warehouse createWarehouse(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Warehouse name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "WAR-%04d", seq_++);
    Warehouse obj{buf, name};
    obj.validate();
    warehouses_.emplace(obj.id(), obj);
    cout << "[InventoryManagementService.createWarehouse] stored " << obj.id() << endl;
    return obj;
  }

  Warehouse getWarehouse(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = warehouses_.find(id);
    if (it == warehouses_.end()) {
      throw out_of_range("unknown Warehouse id");
    }
    cout << "[InventoryManagementService.getWarehouse] found " << id << endl;
    return it->second;
  }

  InventoryItem createInventoryItem(const string& name) {
    if (name.empty()) {
      throw invalid_argument("InventoryItem name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "INV-%04d", seq_++);
    InventoryItem obj{buf, name};
    obj.validate();
    inventory_items_.emplace(obj.id(), obj);
    cout << "[InventoryManagementService.createInventoryItem] stored " << obj.id() << endl;
    return obj;
  }

  InventoryItem getInventoryItem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = inventory_items_.find(id);
    if (it == inventory_items_.end()) {
      throw out_of_range("unknown InventoryItem id");
    }
    cout << "[InventoryManagementService.getInventoryItem] found " << id << endl;
    return it->second;
  }

  StockReservation createStockReservation(const string& name) {
    if (name.empty()) {
      throw invalid_argument("StockReservation name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "STO-%04d", seq_++);
    StockReservation obj{buf, name};
    obj.validate();
    stock_reservations_.emplace(obj.id(), obj);
    cout << "[InventoryManagementService.createStockReservation] stored " << obj.id() << endl;
    return obj;
  }

  StockReservation getStockReservation(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = stock_reservations_.find(id);
    if (it == stock_reservations_.end()) {
      throw out_of_range("unknown StockReservation id");
    }
    cout << "[InventoryManagementService.getStockReservation] found " << id << endl;
    return it->second;
  }

  Product closeProduct(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = products_.find(id);
    if (it == products_.end()) {
      throw out_of_range("unknown Product");
    }
    cout << "[InventoryManagementService.closeProduct] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct InventoryManagementService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  InventoryManagementService system;
  cout << "========== STEP 2: Create Product ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createProduct("alpha-product");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createProduct("beta-product");
  system.createSKU("sample-sku");
  system.createWarehouse("sample-warehouse");
  system.createInventoryItem("sample-inventory_item");
  system.createStockReservation("sample-stock_reservation");
  system.closeProduct(first.id());
  try {
    system.closeProduct(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getProduct("MISSING-ID");
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

type Product struct {
  ID     string
  Name   string
  Status string
}

func NewProduct(id, name string) (*Product, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Product requires id and name")
  }
  obj := &Product{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Product.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Product) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Product invalid status")
  }
  fmt.Printf("[Product.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Product) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Product %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Product.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


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


type Warehouse struct {
  ID     string
  Name   string
  Status string
}

func NewWarehouse(id, name string) (*Warehouse, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Warehouse requires id and name")
  }
  obj := &Warehouse{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Warehouse.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Warehouse) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Warehouse invalid status")
  }
  fmt.Printf("[Warehouse.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Warehouse) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Warehouse %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Warehouse.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type InventoryItem struct {
  ID     string
  Name   string
  Status string
}

func NewInventoryItem(id, name string) (*InventoryItem, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("InventoryItem requires id and name")
  }
  obj := &InventoryItem{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[InventoryItem.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *InventoryItem) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("InventoryItem invalid status")
  }
  fmt.Printf("[InventoryItem.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *InventoryItem) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("InventoryItem %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[InventoryItem.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type StockReservation struct {
  ID     string
  Name   string
  Status string
}

func NewStockReservation(id, name string) (*StockReservation, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("StockReservation requires id and name")
  }
  obj := &StockReservation{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[StockReservation.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *StockReservation) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("StockReservation invalid status")
  }
  fmt.Printf("[StockReservation.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *StockReservation) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("StockReservation %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[StockReservation.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type InventoryManagementService struct {
  mu  sync.Mutex
  seq int
  products map[string]*Product
  skus map[string]*SKU
  warehouses map[string]*Warehouse
  inventory_items map[string]*InventoryItem
  stock_reservations map[string]*StockReservation
}

func NewInventoryManagementService() *InventoryManagementService {
  fmt.Println("[InventoryManagementService.__init__] system ready")
  return &InventoryManagementService{
    seq: 1,
    products: map[string]*Product{},
    skus: map[string]*SKU{},
    warehouses: map[string]*Warehouse{},
    inventory_items: map[string]*InventoryItem{},
    stock_reservations: map[string]*StockReservation{},
  }
}

func (s *InventoryManagementService) CreateProduct(name string) (*Product, error) {
  if name == "" {
    return nil, fmt.Errorf("Product name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PRO-%04d", s.seq)
  s.seq++
  obj, err := NewProduct(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.products[id] = obj
  fmt.Printf("[InventoryManagementService.CreateProduct] stored %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) GetProduct(id string) (*Product, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.products[id]
  if !ok {
    return nil, fmt.Errorf("unknown Product id: %s", id)
  }
  fmt.Printf("[InventoryManagementService.GetProduct] found %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) CreateSKU(name string) (*SKU, error) {
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
  fmt.Printf("[InventoryManagementService.CreateSKU] stored %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) GetSKU(id string) (*SKU, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.skus[id]
  if !ok {
    return nil, fmt.Errorf("unknown SKU id: %s", id)
  }
  fmt.Printf("[InventoryManagementService.GetSKU] found %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) CreateWarehouse(name string) (*Warehouse, error) {
  if name == "" {
    return nil, fmt.Errorf("Warehouse name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("WAR-%04d", s.seq)
  s.seq++
  obj, err := NewWarehouse(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.warehouses[id] = obj
  fmt.Printf("[InventoryManagementService.CreateWarehouse] stored %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) GetWarehouse(id string) (*Warehouse, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.warehouses[id]
  if !ok {
    return nil, fmt.Errorf("unknown Warehouse id: %s", id)
  }
  fmt.Printf("[InventoryManagementService.GetWarehouse] found %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) CreateInventoryItem(name string) (*InventoryItem, error) {
  if name == "" {
    return nil, fmt.Errorf("InventoryItem name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("INV-%04d", s.seq)
  s.seq++
  obj, err := NewInventoryItem(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.inventory_items[id] = obj
  fmt.Printf("[InventoryManagementService.CreateInventoryItem] stored %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) GetInventoryItem(id string) (*InventoryItem, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.inventory_items[id]
  if !ok {
    return nil, fmt.Errorf("unknown InventoryItem id: %s", id)
  }
  fmt.Printf("[InventoryManagementService.GetInventoryItem] found %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) CreateStockReservation(name string) (*StockReservation, error) {
  if name == "" {
    return nil, fmt.Errorf("StockReservation name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("STO-%04d", s.seq)
  s.seq++
  obj, err := NewStockReservation(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.stock_reservations[id] = obj
  fmt.Printf("[InventoryManagementService.CreateStockReservation] stored %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) GetStockReservation(id string) (*StockReservation, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.stock_reservations[id]
  if !ok {
    return nil, fmt.Errorf("unknown StockReservation id: %s", id)
  }
  fmt.Printf("[InventoryManagementService.GetStockReservation] found %s\\n", id)
  return obj, nil
}

func (s *InventoryManagementService) CloseProduct(id string) (*Product, error) {
  obj, err := s.GetProduct(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[InventoryManagementService.CloseProduct] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct InventoryManagementService ==========")
  system := NewInventoryManagementService()
  fmt.Println("========== STEP 2: Create Product ==========")
  first, _ := system.CreateProduct("alpha-product")
  system.CreateProduct("beta-product")
  system.CreateSKU("sample-sku")
  system.CreateWarehouse("sample-warehouse")
  system.CreateInventoryItem("sample-inventory_item")
  system.CreateStockReservation("sample-stock_reservation")
  system.CloseProduct(first.ID)
  if _, err := system.CloseProduct(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetProduct("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Product {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Product(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Product requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Product.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Product invalid status");
    }
    Console.WriteLine("[Product.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Product " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Product.close] id=" + Id + " -> CLOSED");
  }
}


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


sealed class Warehouse {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Warehouse(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Warehouse requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Warehouse.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Warehouse invalid status");
    }
    Console.WriteLine("[Warehouse.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Warehouse " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Warehouse.close] id=" + Id + " -> CLOSED");
  }
}


sealed class InventoryItem {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public InventoryItem(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("InventoryItem requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[InventoryItem.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("InventoryItem invalid status");
    }
    Console.WriteLine("[InventoryItem.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("InventoryItem " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[InventoryItem.close] id=" + Id + " -> CLOSED");
  }
}


sealed class StockReservation {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public StockReservation(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("StockReservation requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[StockReservation.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("StockReservation invalid status");
    }
    Console.WriteLine("[StockReservation.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("StockReservation " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[StockReservation.close] id=" + Id + " -> CLOSED");
  }
}

sealed class InventoryManagementService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Product> _products = new();
  private readonly Dictionary<string, SKU> _skus = new();
  private readonly Dictionary<string, Warehouse> _warehouses = new();
  private readonly Dictionary<string, InventoryItem> _inventory_items = new();
  private readonly Dictionary<string, StockReservation> _stock_reservations = new();
  public InventoryManagementService() {
    Console.WriteLine("[InventoryManagementService.__init__] system ready");
  }

  public Product CreateProduct(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Product name required");
    }
    lock (_gate) {
      var id = string.Format("PRO-{0:D4}", _seq++);
      var obj = new Product(id, name.Trim());
      obj.Validate();
      _products[id] = obj;
      Console.WriteLine("[InventoryManagementService.CreateProduct] stored " + id);
      return obj;
    }
  }

  public Product GetProduct(string id) {
    lock (_gate) {
      if (!_products.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Product id: " + id);
      }
      Console.WriteLine("[InventoryManagementService.GetProduct] found " + id);
      return obj;
    }
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
      Console.WriteLine("[InventoryManagementService.CreateSKU] stored " + id);
      return obj;
    }
  }

  public SKU GetSKU(string id) {
    lock (_gate) {
      if (!_skus.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown SKU id: " + id);
      }
      Console.WriteLine("[InventoryManagementService.GetSKU] found " + id);
      return obj;
    }
  }

  public Warehouse CreateWarehouse(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Warehouse name required");
    }
    lock (_gate) {
      var id = string.Format("WAR-{0:D4}", _seq++);
      var obj = new Warehouse(id, name.Trim());
      obj.Validate();
      _warehouses[id] = obj;
      Console.WriteLine("[InventoryManagementService.CreateWarehouse] stored " + id);
      return obj;
    }
  }

  public Warehouse GetWarehouse(string id) {
    lock (_gate) {
      if (!_warehouses.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Warehouse id: " + id);
      }
      Console.WriteLine("[InventoryManagementService.GetWarehouse] found " + id);
      return obj;
    }
  }

  public InventoryItem CreateInventoryItem(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("InventoryItem name required");
    }
    lock (_gate) {
      var id = string.Format("INV-{0:D4}", _seq++);
      var obj = new InventoryItem(id, name.Trim());
      obj.Validate();
      _inventory_items[id] = obj;
      Console.WriteLine("[InventoryManagementService.CreateInventoryItem] stored " + id);
      return obj;
    }
  }

  public InventoryItem GetInventoryItem(string id) {
    lock (_gate) {
      if (!_inventory_items.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown InventoryItem id: " + id);
      }
      Console.WriteLine("[InventoryManagementService.GetInventoryItem] found " + id);
      return obj;
    }
  }

  public StockReservation CreateStockReservation(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("StockReservation name required");
    }
    lock (_gate) {
      var id = string.Format("STO-{0:D4}", _seq++);
      var obj = new StockReservation(id, name.Trim());
      obj.Validate();
      _stock_reservations[id] = obj;
      Console.WriteLine("[InventoryManagementService.CreateStockReservation] stored " + id);
      return obj;
    }
  }

  public StockReservation GetStockReservation(string id) {
    lock (_gate) {
      if (!_stock_reservations.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown StockReservation id: " + id);
      }
      Console.WriteLine("[InventoryManagementService.GetStockReservation] found " + id);
      return obj;
    }
  }

  public Product CloseProduct(string id) {
    var obj = GetProduct(id);
    Console.WriteLine("[InventoryManagementService.CloseProduct] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct InventoryManagementService ==========");
    var system = new InventoryManagementService();
    Console.WriteLine("========== STEP 2: Create Product ==========");
    var first = system.CreateProduct("alpha-product");
    system.CreateProduct("beta-product");
    system.CreateSKU("sample-sku");
    system.CreateWarehouse("sample-warehouse");
    system.CreateInventoryItem("sample-inventory_item");
    system.CreateStockReservation("sample-stock_reservation");
    system.CloseProduct(first.Id);
    try {
      system.CloseProduct(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetProduct("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const inventoryManagementSolution: ProblemSolution = {
  slug: 'inventory-management',
  title: 'Inventory Management System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a warehouse inventory system that tracks products, stock levels, restocking, and multi-warehouse fulfillment. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Track product stock levels across multiple warehouses',
      'Reserve inventory when an order is placed, release on cancel',
      'Restock items: receive purchase orders from suppliers',
      'Low-stock alerts when quantity drops below threshold',
      'Transfer stock between warehouses',
      'FIFO or LIFO inventory costing for accounting',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Track product stock levels across multiple warehouses?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Reserve inventory when an order is placed, release on cancel?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Restock items: receive purchase orders from suppliers?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Low-stock alerts when quantity drops below threshold?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Transfer stock between warehouses?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. InventoryManagementService is the facade stereotype. Product, SKU, Warehouse, InventoryItem, StockReservation are concrete domain classes with id/name/status and validate/close.',
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
          'Construct InventoryManagementService.',
          'createProduct twice and create the related UML classes.',
          'closeProduct once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'InventoryManagementService', responsibility: 'UML facade - orchestrates Inventory Management System.', keyMembers: ['create*', 'get*', 'closeProduct'] },
    { name: 'Product', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'SKU', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Warehouse', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'InventoryItem', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'StockReservation', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from InventoryManagementService to Product, SKU, Warehouse, InventoryItem, StockReservation. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on InventoryManagementService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'InventoryManagementService', responsibility: 'UML facade - orchestrates Inventory Management System.', keyMembers: ['create*', 'get*', 'closeProduct'] },
    { name: 'Product', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'SKU', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Warehouse', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'InventoryItem', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'StockReservation', responsibility: 'UML class - domain object for Inventory Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'InventoryManagementService exposes create/get/close and owns composed collections.' },
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
      'main constructs InventoryManagementService, creates UML domain objects, closes the primary Product, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct InventoryManagementService.',
      'createProduct for alpha and beta.',
      'create remaining UML classes.',
      'closeProduct(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createProduct("alpha..."); closeProduct(id)',
        output: '[Product.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeProduct(alreadyClosed) or getProduct("MISSING-ID")',
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
