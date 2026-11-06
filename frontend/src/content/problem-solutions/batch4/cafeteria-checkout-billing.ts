import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'CafeteriaCheckoutBillingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_items', 'Map<string, Item>'),
    attr('-', '_carts', 'Map<string, Cart>'),
    attr('-', '_cart_lines', 'Map<string, CartLine>'),
    attr('-', '_discounts', 'Map<string, Discount>'),
    attr('-', '_bills', 'Map<string, Bill>'),
  ], [
    method('+', 'createItem', 'name: string', 'Item'),
    method('+', 'createCart', 'name: string', 'Cart'),
    method('+', 'createCartLine', 'name: string', 'CartLine'),
    method('+', 'createDiscount', 'name: string', 'Discount'),
    method('+', 'createBill', 'name: string', 'Bill'),
    method('+', 'getItem', 'id: string', 'Item'),
    method('+', 'getCart', 'id: string', 'Cart'),
    method('+', 'getCartLine', 'id: string', 'CartLine'),
    method('+', 'getDiscount', 'id: string', 'Discount'),
    method('+', 'getBill', 'id: string', 'Bill'),
    method('+', 'closeItem', 'id: string', 'Item'),
  ], 'facade'),
  cls('n1', 'Item', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Cart', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'CartLine', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Discount', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Bill', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("cafeteria-checkout-billing")


class Item:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Item.id is required")
        if not name or not name.strip():
            raise ValueError("Item.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Item.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Item {self.id} has invalid status={self.status}")
        log.info("[Item.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Item {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Item.close] id=%s -> CLOSED", self.id)


class Cart:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Cart.id is required")
        if not name or not name.strip():
            raise ValueError("Cart.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Cart.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Cart {self.id} has invalid status={self.status}")
        log.info("[Cart.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Cart {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Cart.close] id=%s -> CLOSED", self.id)


class CartLine:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("CartLine.id is required")
        if not name or not name.strip():
            raise ValueError("CartLine.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[CartLine.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"CartLine {self.id} has invalid status={self.status}")
        log.info("[CartLine.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"CartLine {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[CartLine.close] id=%s -> CLOSED", self.id)


class Discount:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Discount.id is required")
        if not name or not name.strip():
            raise ValueError("Discount.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Discount.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Discount {self.id} has invalid status={self.status}")
        log.info("[Discount.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Discount {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Discount.close] id=%s -> CLOSED", self.id)


class Bill:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Bill.id is required")
        if not name or not name.strip():
            raise ValueError("Bill.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Bill.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Bill {self.id} has invalid status={self.status}")
        log.info("[Bill.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Bill {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Bill.close] id=%s -> CLOSED", self.id)


class CafeteriaCheckoutBillingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._items: Dict[str, Item] = {}
        self._carts: Dict[str, Cart] = {}
        self._cart_lines: Dict[str, CartLine] = {}
        self._discounts: Dict[str, Discount] = {}
        self._bills: Dict[str, Bill] = {}
        log.info("[CafeteriaCheckoutBillingService.__init__] system ready; managing: Item, Cart, CartLine, Discount, Bill")

    def create_item(self, name: str) -> Item:
        """UML: CafeteriaCheckoutBillingService.create_item(name) -> Item"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Item name is required")
        with self._lock:
            item_id = f"ITE-{self._seq:04d}"
            self._seq += 1
            obj = Item(item_id, cleaned)
            obj.validate()
            self._items[item_id] = obj
            log.info("[CafeteriaCheckoutBillingService.create_item] stored %s in _items (count=%s)", item_id, len(self._items))
            return obj

    def get_item(self, item_id: str) -> Item:
        with self._lock:
            obj = self._items.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Item id: {item_id}")
            log.info("[CafeteriaCheckoutBillingService.get_item] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_cart(self, name: str) -> Cart:
        """UML: CafeteriaCheckoutBillingService.create_cart(name) -> Cart"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Cart name is required")
        with self._lock:
            item_id = f"CAR-{self._seq:04d}"
            self._seq += 1
            obj = Cart(item_id, cleaned)
            obj.validate()
            self._carts[item_id] = obj
            log.info("[CafeteriaCheckoutBillingService.create_cart] stored %s in _carts (count=%s)", item_id, len(self._carts))
            return obj

    def get_cart(self, item_id: str) -> Cart:
        with self._lock:
            obj = self._carts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Cart id: {item_id}")
            log.info("[CafeteriaCheckoutBillingService.get_cart] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_cart_line(self, name: str) -> CartLine:
        """UML: CafeteriaCheckoutBillingService.create_cart_line(name) -> CartLine"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("CartLine name is required")
        with self._lock:
            item_id = f"CAR-{self._seq:04d}"
            self._seq += 1
            obj = CartLine(item_id, cleaned)
            obj.validate()
            self._cart_lines[item_id] = obj
            log.info("[CafeteriaCheckoutBillingService.create_cart_line] stored %s in _cart_lines (count=%s)", item_id, len(self._cart_lines))
            return obj

    def get_cart_line(self, item_id: str) -> CartLine:
        with self._lock:
            obj = self._cart_lines.get(item_id)
            if obj is None:
                raise KeyError(f"unknown CartLine id: {item_id}")
            log.info("[CafeteriaCheckoutBillingService.get_cart_line] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_discount(self, name: str) -> Discount:
        """UML: CafeteriaCheckoutBillingService.create_discount(name) -> Discount"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Discount name is required")
        with self._lock:
            item_id = f"DIS-{self._seq:04d}"
            self._seq += 1
            obj = Discount(item_id, cleaned)
            obj.validate()
            self._discounts[item_id] = obj
            log.info("[CafeteriaCheckoutBillingService.create_discount] stored %s in _discounts (count=%s)", item_id, len(self._discounts))
            return obj

    def get_discount(self, item_id: str) -> Discount:
        with self._lock:
            obj = self._discounts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Discount id: {item_id}")
            log.info("[CafeteriaCheckoutBillingService.get_discount] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_bill(self, name: str) -> Bill:
        """UML: CafeteriaCheckoutBillingService.create_bill(name) -> Bill"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Bill name is required")
        with self._lock:
            item_id = f"BIL-{self._seq:04d}"
            self._seq += 1
            obj = Bill(item_id, cleaned)
            obj.validate()
            self._bills[item_id] = obj
            log.info("[CafeteriaCheckoutBillingService.create_bill] stored %s in _bills (count=%s)", item_id, len(self._bills))
            return obj

    def get_bill(self, item_id: str) -> Bill:
        with self._lock:
            obj = self._bills.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Bill id: {item_id}")
            log.info("[CafeteriaCheckoutBillingService.get_bill] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_item(self, item_id: str) -> Item:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._items.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Item id: {item_id}")
            log.info("[CafeteriaCheckoutBillingService.close_item] closing %s via Item.close()", item_id)
            obj.close()
            return obj

    def list_active_items(self) -> List[Item]:
        with self._lock:
            active = [o for o in self._items.values() if o.status == "ACTIVE"]
            log.info("[CafeteriaCheckoutBillingService.list_active_items] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct CafeteriaCheckoutBillingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = CafeteriaCheckoutBillingService()

    log.info("========== STEP 2: Create primary Item objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_item("alpha-item")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_item("beta-item")

    log.info("========== STEP 3: Create Cart (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_cart("sample-cart")

    log.info("========== STEP 4: Create CartLine (UML class) ==========")
    system.create_cart_line("sample-cart_line")

    log.info("========== STEP 5: Create Discount (UML class) ==========")
    system.create_discount("sample-discount")

    log.info("========== STEP 6: Create Bill (UML class) ==========")
    system.create_bill("sample-bill")

    log.info("========== STEP 7: Inspect active Item list ==========")
    system.list_active_items()

    log.info("========== STEP 8: Close first Item ==========")
    system.close_item(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_item(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Item.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_item("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_item: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_items()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Item {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Item(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Item.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Item.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Item.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Item " + id + " invalid status");
    }
    System.out.println("[Item.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Item " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Item.close] id=" + id + " -> CLOSED");
  }
}


class Cart {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Cart(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Cart.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Cart.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Cart.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Cart " + id + " invalid status");
    }
    System.out.println("[Cart.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Cart " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Cart.close] id=" + id + " -> CLOSED");
  }
}


class CartLine {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  CartLine(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("CartLine.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CartLine.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[CartLine.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("CartLine " + id + " invalid status");
    }
    System.out.println("[CartLine.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("CartLine " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[CartLine.close] id=" + id + " -> CLOSED");
  }
}


class Discount {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Discount(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Discount.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Discount.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Discount.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Discount " + id + " invalid status");
    }
    System.out.println("[Discount.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Discount " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Discount.close] id=" + id + " -> CLOSED");
  }
}


class Bill {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Bill(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Bill.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Bill.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Bill.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Bill " + id + " invalid status");
    }
    System.out.println("[Bill.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Bill " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Bill.close] id=" + id + " -> CLOSED");
  }
}

public class CafeteriaCheckoutBillingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Item> items = new LinkedHashMap<>();
  private final Map<String, Cart> carts = new LinkedHashMap<>();
  private final Map<String, CartLine> cart_lines = new LinkedHashMap<>();
  private final Map<String, Discount> discounts = new LinkedHashMap<>();
  private final Map<String, Bill> bills = new LinkedHashMap<>();

  public CafeteriaCheckoutBillingService() {
    System.out.println("[CafeteriaCheckoutBillingService.__init__] system ready");
  }

  public Item createItem(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Item name required");
    }
    lock.lock();
    try {
      String id = String.format("ITE-%04d", seq++);
      Item obj = new Item(id, name.trim());
      obj.validate();
      items.put(id, obj);
      System.out.println("[CafeteriaCheckoutBillingService.createItem] stored " + id + " count=" + items.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Item getItem(String id) {
    lock.lock();
    try {
      Item obj = items.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Item id: " + id);
      }
      System.out.println("[CafeteriaCheckoutBillingService.getItem] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Cart createCart(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Cart name required");
    }
    lock.lock();
    try {
      String id = String.format("CAR-%04d", seq++);
      Cart obj = new Cart(id, name.trim());
      obj.validate();
      carts.put(id, obj);
      System.out.println("[CafeteriaCheckoutBillingService.createCart] stored " + id + " count=" + carts.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Cart getCart(String id) {
    lock.lock();
    try {
      Cart obj = carts.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Cart id: " + id);
      }
      System.out.println("[CafeteriaCheckoutBillingService.getCart] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public CartLine createCartLine(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CartLine name required");
    }
    lock.lock();
    try {
      String id = String.format("CAR-%04d", seq++);
      CartLine obj = new CartLine(id, name.trim());
      obj.validate();
      cart_lines.put(id, obj);
      System.out.println("[CafeteriaCheckoutBillingService.createCartLine] stored " + id + " count=" + cart_lines.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public CartLine getCartLine(String id) {
    lock.lock();
    try {
      CartLine obj = cart_lines.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown CartLine id: " + id);
      }
      System.out.println("[CafeteriaCheckoutBillingService.getCartLine] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Discount createDiscount(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Discount name required");
    }
    lock.lock();
    try {
      String id = String.format("DIS-%04d", seq++);
      Discount obj = new Discount(id, name.trim());
      obj.validate();
      discounts.put(id, obj);
      System.out.println("[CafeteriaCheckoutBillingService.createDiscount] stored " + id + " count=" + discounts.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Discount getDiscount(String id) {
    lock.lock();
    try {
      Discount obj = discounts.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Discount id: " + id);
      }
      System.out.println("[CafeteriaCheckoutBillingService.getDiscount] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Bill createBill(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Bill name required");
    }
    lock.lock();
    try {
      String id = String.format("BIL-%04d", seq++);
      Bill obj = new Bill(id, name.trim());
      obj.validate();
      bills.put(id, obj);
      System.out.println("[CafeteriaCheckoutBillingService.createBill] stored " + id + " count=" + bills.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Bill getBill(String id) {
    lock.lock();
    try {
      Bill obj = bills.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Bill id: " + id);
      }
      System.out.println("[CafeteriaCheckoutBillingService.getBill] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Item closeItem(String id) {
    lock.lock();
    try {
      Item obj = items.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Item id: " + id);
      }
      System.out.println("[CafeteriaCheckoutBillingService.closeItem] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Item> listActiveItems() {
    lock.lock();
    try {
      List<Item> out = new ArrayList<>();
      for (Item o : items.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[CafeteriaCheckoutBillingService.listActiveItems] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct CafeteriaCheckoutBillingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    CafeteriaCheckoutBillingService system = new CafeteriaCheckoutBillingService();
    System.out.println("========== STEP 2: Create Item objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Item first = system.createItem("alpha-item");
    system.createItem("beta-item");
    System.out.println("========== STEP 3: Create Cart ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createCart("sample-cart");
    System.out.println("========== STEP 4: Create CartLine ==========");
    system.createCartLine("sample-cart_line");
    System.out.println("========== STEP 5: Create Discount ==========");
    system.createDiscount("sample-discount");
    System.out.println("========== STEP 6: Create Bill ==========");
    system.createBill("sample-bill");
    System.out.println("========== Inspect active list ==========");
    system.listActiveItems();
    System.out.println("========== Close first Item ==========");
    system.closeItem(first.getId());
    try {
      system.closeItem(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getItem("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Item {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Item.id required')
    }

    if (!name?.trim()) {
      throw new Error('Item.name required')
    }
    console.log(\`[Item.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Item \${this.id} invalid status\`)
    }
    console.log(\`[Item.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Item \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Item.close] id=\${this.id} -> CLOSED\`)
  }
}


class Cart {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Cart.id required')
    }

    if (!name?.trim()) {
      throw new Error('Cart.name required')
    }
    console.log(\`[Cart.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Cart \${this.id} invalid status\`)
    }
    console.log(\`[Cart.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Cart \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Cart.close] id=\${this.id} -> CLOSED\`)
  }
}


class CartLine {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('CartLine.id required')
    }

    if (!name?.trim()) {
      throw new Error('CartLine.name required')
    }
    console.log(\`[CartLine.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`CartLine \${this.id} invalid status\`)
    }
    console.log(\`[CartLine.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`CartLine \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[CartLine.close] id=\${this.id} -> CLOSED\`)
  }
}


class Discount {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Discount.id required')
    }

    if (!name?.trim()) {
      throw new Error('Discount.name required')
    }
    console.log(\`[Discount.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Discount \${this.id} invalid status\`)
    }
    console.log(\`[Discount.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Discount \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Discount.close] id=\${this.id} -> CLOSED\`)
  }
}


class Bill {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Bill.id required')
    }

    if (!name?.trim()) {
      throw new Error('Bill.name required')
    }
    console.log(\`[Bill.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Bill \${this.id} invalid status\`)
    }
    console.log(\`[Bill.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Bill \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Bill.close] id=\${this.id} -> CLOSED\`)
  }
}

class CafeteriaCheckoutBillingService {
  private seq = 1
  private items = new Map<string, Item>()
  private carts = new Map<string, Cart>()
  private cart_lines = new Map<string, CartLine>()
  private discounts = new Map<string, Discount>()
  private bills = new Map<string, Bill>()
  constructor() {
    console.log('[CafeteriaCheckoutBillingService.__init__] system ready')
  }

  createItem(name: string): Item {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Item name required')
    }
    const id = \`ITE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Item(id, cleaned)
    obj.validate()
    this.items.set(id, obj)
    console.log(\`[CafeteriaCheckoutBillingService.createItem] stored \${id} count=\${this.items.size}\`)
    return obj
  }

  getItem(id: string): Item {
    const obj = this.items.get(id)
    if (!obj) {
      throw new Error(\`unknown Item id: \${id}\`)
    }
    console.log(\`[CafeteriaCheckoutBillingService.getItem] found id=\${obj.id}\`)
    return obj
  }

  createCart(name: string): Cart {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Cart name required')
    }
    const id = \`CAR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Cart(id, cleaned)
    obj.validate()
    this.carts.set(id, obj)
    console.log(\`[CafeteriaCheckoutBillingService.createCart] stored \${id} count=\${this.carts.size}\`)
    return obj
  }

  getCart(id: string): Cart {
    const obj = this.carts.get(id)
    if (!obj) {
      throw new Error(\`unknown Cart id: \${id}\`)
    }
    console.log(\`[CafeteriaCheckoutBillingService.getCart] found id=\${obj.id}\`)
    return obj
  }

  createCartLine(name: string): CartLine {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('CartLine name required')
    }
    const id = \`CAR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new CartLine(id, cleaned)
    obj.validate()
    this.cart_lines.set(id, obj)
    console.log(\`[CafeteriaCheckoutBillingService.createCartLine] stored \${id} count=\${this.cart_lines.size}\`)
    return obj
  }

  getCartLine(id: string): CartLine {
    const obj = this.cart_lines.get(id)
    if (!obj) {
      throw new Error(\`unknown CartLine id: \${id}\`)
    }
    console.log(\`[CafeteriaCheckoutBillingService.getCartLine] found id=\${obj.id}\`)
    return obj
  }

  createDiscount(name: string): Discount {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Discount name required')
    }
    const id = \`DIS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Discount(id, cleaned)
    obj.validate()
    this.discounts.set(id, obj)
    console.log(\`[CafeteriaCheckoutBillingService.createDiscount] stored \${id} count=\${this.discounts.size}\`)
    return obj
  }

  getDiscount(id: string): Discount {
    const obj = this.discounts.get(id)
    if (!obj) {
      throw new Error(\`unknown Discount id: \${id}\`)
    }
    console.log(\`[CafeteriaCheckoutBillingService.getDiscount] found id=\${obj.id}\`)
    return obj
  }

  createBill(name: string): Bill {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Bill name required')
    }
    const id = \`BIL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Bill(id, cleaned)
    obj.validate()
    this.bills.set(id, obj)
    console.log(\`[CafeteriaCheckoutBillingService.createBill] stored \${id} count=\${this.bills.size}\`)
    return obj
  }

  getBill(id: string): Bill {
    const obj = this.bills.get(id)
    if (!obj) {
      throw new Error(\`unknown Bill id: \${id}\`)
    }
    console.log(\`[CafeteriaCheckoutBillingService.getBill] found id=\${obj.id}\`)
    return obj
  }

  closeItem(id: string): Item {
    const obj = this.getItem(id)
    console.log(\`[CafeteriaCheckoutBillingService.closeItem] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveItems(): Item[] {
    const active = [...this.items.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[CafeteriaCheckoutBillingService.listActiveItems] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct CafeteriaCheckoutBillingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new CafeteriaCheckoutBillingService()
  console.log('========== STEP 2: Create Item objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createItem('alpha-item')
  system.createItem('beta-item')
  console.log('========== STEP 3: Create Cart ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createCart('sample-cart')
  console.log('========== STEP 4: Create CartLine ==========')
  system.createCartLine('sample-cart_line')
  console.log('========== STEP 5: Create Discount ==========')
  system.createDiscount('sample-discount')
  console.log('========== STEP 6: Create Bill ==========')
  system.createBill('sample-bill')
  system.listActiveItems()
  console.log('========== Close first Item ==========')
  system.closeItem(first.id)
  try {
    system.closeItem(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getItem('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Item {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Item(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Item requires id and name");
    }
    cout << "[Item.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Item invalid status");
    }
    cout << "[Item.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Item cannot close");
    }
    status_ = "CLOSED";
    cout << "[Item.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Cart {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Cart(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Cart requires id and name");
    }
    cout << "[Cart.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Cart invalid status");
    }
    cout << "[Cart.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Cart cannot close");
    }
    status_ = "CLOSED";
    cout << "[Cart.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class CartLine {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  CartLine(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("CartLine requires id and name");
    }
    cout << "[CartLine.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("CartLine invalid status");
    }
    cout << "[CartLine.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("CartLine cannot close");
    }
    status_ = "CLOSED";
    cout << "[CartLine.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Discount {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Discount(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Discount requires id and name");
    }
    cout << "[Discount.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Discount invalid status");
    }
    cout << "[Discount.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Discount cannot close");
    }
    status_ = "CLOSED";
    cout << "[Discount.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Bill {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Bill(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Bill requires id and name");
    }
    cout << "[Bill.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Bill invalid status");
    }
    cout << "[Bill.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Bill cannot close");
    }
    status_ = "CLOSED";
    cout << "[Bill.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class CafeteriaCheckoutBillingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Item> items_;
  unordered_map<string, Cart> carts_;
  unordered_map<string, CartLine> cart_lines_;
  unordered_map<string, Discount> discounts_;
  unordered_map<string, Bill> bills_;
public:
  CafeteriaCheckoutBillingService() {
    cout << "[CafeteriaCheckoutBillingService.__init__] system ready" << endl;
  }

  Item createItem(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Item name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ITE-%04d", seq_++);
    Item obj{buf, name};
    obj.validate();
    items_.emplace(obj.id(), obj);
    cout << "[CafeteriaCheckoutBillingService.createItem] stored " << obj.id() << endl;
    return obj;
  }

  Item getItem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = items_.find(id);
    if (it == items_.end()) {
      throw out_of_range("unknown Item id");
    }
    cout << "[CafeteriaCheckoutBillingService.getItem] found " << id << endl;
    return it->second;
  }

  Cart createCart(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Cart name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CAR-%04d", seq_++);
    Cart obj{buf, name};
    obj.validate();
    carts_.emplace(obj.id(), obj);
    cout << "[CafeteriaCheckoutBillingService.createCart] stored " << obj.id() << endl;
    return obj;
  }

  Cart getCart(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = carts_.find(id);
    if (it == carts_.end()) {
      throw out_of_range("unknown Cart id");
    }
    cout << "[CafeteriaCheckoutBillingService.getCart] found " << id << endl;
    return it->second;
  }

  CartLine createCartLine(const string& name) {
    if (name.empty()) {
      throw invalid_argument("CartLine name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CAR-%04d", seq_++);
    CartLine obj{buf, name};
    obj.validate();
    cart_lines_.emplace(obj.id(), obj);
    cout << "[CafeteriaCheckoutBillingService.createCartLine] stored " << obj.id() << endl;
    return obj;
  }

  CartLine getCartLine(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cart_lines_.find(id);
    if (it == cart_lines_.end()) {
      throw out_of_range("unknown CartLine id");
    }
    cout << "[CafeteriaCheckoutBillingService.getCartLine] found " << id << endl;
    return it->second;
  }

  Discount createDiscount(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Discount name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DIS-%04d", seq_++);
    Discount obj{buf, name};
    obj.validate();
    discounts_.emplace(obj.id(), obj);
    cout << "[CafeteriaCheckoutBillingService.createDiscount] stored " << obj.id() << endl;
    return obj;
  }

  Discount getDiscount(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = discounts_.find(id);
    if (it == discounts_.end()) {
      throw out_of_range("unknown Discount id");
    }
    cout << "[CafeteriaCheckoutBillingService.getDiscount] found " << id << endl;
    return it->second;
  }

  Bill createBill(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Bill name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BIL-%04d", seq_++);
    Bill obj{buf, name};
    obj.validate();
    bills_.emplace(obj.id(), obj);
    cout << "[CafeteriaCheckoutBillingService.createBill] stored " << obj.id() << endl;
    return obj;
  }

  Bill getBill(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = bills_.find(id);
    if (it == bills_.end()) {
      throw out_of_range("unknown Bill id");
    }
    cout << "[CafeteriaCheckoutBillingService.getBill] found " << id << endl;
    return it->second;
  }

  Item closeItem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = items_.find(id);
    if (it == items_.end()) {
      throw out_of_range("unknown Item");
    }
    cout << "[CafeteriaCheckoutBillingService.closeItem] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct CafeteriaCheckoutBillingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  CafeteriaCheckoutBillingService system;
  cout << "========== STEP 2: Create Item ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createItem("alpha-item");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createItem("beta-item");
  system.createCart("sample-cart");
  system.createCartLine("sample-cart_line");
  system.createDiscount("sample-discount");
  system.createBill("sample-bill");
  system.closeItem(first.id());
  try {
    system.closeItem(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getItem("MISSING-ID");
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

type Item struct {
  ID     string
  Name   string
  Status string
}

func NewItem(id, name string) (*Item, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Item requires id and name")
  }
  obj := &Item{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Item.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Item) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Item invalid status")
  }
  fmt.Printf("[Item.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Item) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Item %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Item.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Cart struct {
  ID     string
  Name   string
  Status string
}

func NewCart(id, name string) (*Cart, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Cart requires id and name")
  }
  obj := &Cart{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Cart.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Cart) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Cart invalid status")
  }
  fmt.Printf("[Cart.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Cart) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Cart %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Cart.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type CartLine struct {
  ID     string
  Name   string
  Status string
}

func NewCartLine(id, name string) (*CartLine, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("CartLine requires id and name")
  }
  obj := &CartLine{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[CartLine.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *CartLine) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("CartLine invalid status")
  }
  fmt.Printf("[CartLine.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *CartLine) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("CartLine %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[CartLine.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Discount struct {
  ID     string
  Name   string
  Status string
}

func NewDiscount(id, name string) (*Discount, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Discount requires id and name")
  }
  obj := &Discount{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Discount.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Discount) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Discount invalid status")
  }
  fmt.Printf("[Discount.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Discount) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Discount %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Discount.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Bill struct {
  ID     string
  Name   string
  Status string
}

func NewBill(id, name string) (*Bill, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Bill requires id and name")
  }
  obj := &Bill{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Bill.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Bill) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Bill invalid status")
  }
  fmt.Printf("[Bill.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Bill) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Bill %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Bill.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type CafeteriaCheckoutBillingService struct {
  mu  sync.Mutex
  seq int
  items map[string]*Item
  carts map[string]*Cart
  cart_lines map[string]*CartLine
  discounts map[string]*Discount
  bills map[string]*Bill
}

func NewCafeteriaCheckoutBillingService() *CafeteriaCheckoutBillingService {
  fmt.Println("[CafeteriaCheckoutBillingService.__init__] system ready")
  return &CafeteriaCheckoutBillingService{
    seq: 1,
    items: map[string]*Item{},
    carts: map[string]*Cart{},
    cart_lines: map[string]*CartLine{},
    discounts: map[string]*Discount{},
    bills: map[string]*Bill{},
  }
}

func (s *CafeteriaCheckoutBillingService) CreateItem(name string) (*Item, error) {
  if name == "" {
    return nil, fmt.Errorf("Item name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ITE-%04d", s.seq)
  s.seq++
  obj, err := NewItem(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.items[id] = obj
  fmt.Printf("[CafeteriaCheckoutBillingService.CreateItem] stored %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) GetItem(id string) (*Item, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.items[id]
  if !ok {
    return nil, fmt.Errorf("unknown Item id: %s", id)
  }
  fmt.Printf("[CafeteriaCheckoutBillingService.GetItem] found %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) CreateCart(name string) (*Cart, error) {
  if name == "" {
    return nil, fmt.Errorf("Cart name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CAR-%04d", s.seq)
  s.seq++
  obj, err := NewCart(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.carts[id] = obj
  fmt.Printf("[CafeteriaCheckoutBillingService.CreateCart] stored %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) GetCart(id string) (*Cart, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.carts[id]
  if !ok {
    return nil, fmt.Errorf("unknown Cart id: %s", id)
  }
  fmt.Printf("[CafeteriaCheckoutBillingService.GetCart] found %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) CreateCartLine(name string) (*CartLine, error) {
  if name == "" {
    return nil, fmt.Errorf("CartLine name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CAR-%04d", s.seq)
  s.seq++
  obj, err := NewCartLine(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.cart_lines[id] = obj
  fmt.Printf("[CafeteriaCheckoutBillingService.CreateCartLine] stored %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) GetCartLine(id string) (*CartLine, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.cart_lines[id]
  if !ok {
    return nil, fmt.Errorf("unknown CartLine id: %s", id)
  }
  fmt.Printf("[CafeteriaCheckoutBillingService.GetCartLine] found %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) CreateDiscount(name string) (*Discount, error) {
  if name == "" {
    return nil, fmt.Errorf("Discount name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DIS-%04d", s.seq)
  s.seq++
  obj, err := NewDiscount(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.discounts[id] = obj
  fmt.Printf("[CafeteriaCheckoutBillingService.CreateDiscount] stored %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) GetDiscount(id string) (*Discount, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.discounts[id]
  if !ok {
    return nil, fmt.Errorf("unknown Discount id: %s", id)
  }
  fmt.Printf("[CafeteriaCheckoutBillingService.GetDiscount] found %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) CreateBill(name string) (*Bill, error) {
  if name == "" {
    return nil, fmt.Errorf("Bill name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BIL-%04d", s.seq)
  s.seq++
  obj, err := NewBill(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.bills[id] = obj
  fmt.Printf("[CafeteriaCheckoutBillingService.CreateBill] stored %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) GetBill(id string) (*Bill, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.bills[id]
  if !ok {
    return nil, fmt.Errorf("unknown Bill id: %s", id)
  }
  fmt.Printf("[CafeteriaCheckoutBillingService.GetBill] found %s\\n", id)
  return obj, nil
}

func (s *CafeteriaCheckoutBillingService) CloseItem(id string) (*Item, error) {
  obj, err := s.GetItem(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[CafeteriaCheckoutBillingService.CloseItem] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct CafeteriaCheckoutBillingService ==========")
  system := NewCafeteriaCheckoutBillingService()
  fmt.Println("========== STEP 2: Create Item ==========")
  first, _ := system.CreateItem("alpha-item")
  system.CreateItem("beta-item")
  system.CreateCart("sample-cart")
  system.CreateCartLine("sample-cart_line")
  system.CreateDiscount("sample-discount")
  system.CreateBill("sample-bill")
  system.CloseItem(first.ID)
  if _, err := system.CloseItem(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetItem("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Item {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Item(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Item requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Item.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Item invalid status");
    }
    Console.WriteLine("[Item.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Item " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Item.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Cart {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Cart(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Cart requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Cart.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Cart invalid status");
    }
    Console.WriteLine("[Cart.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Cart " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Cart.close] id=" + Id + " -> CLOSED");
  }
}


sealed class CartLine {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public CartLine(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CartLine requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[CartLine.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("CartLine invalid status");
    }
    Console.WriteLine("[CartLine.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("CartLine " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[CartLine.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Discount {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Discount(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Discount requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Discount.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Discount invalid status");
    }
    Console.WriteLine("[Discount.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Discount " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Discount.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Bill {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Bill(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Bill requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Bill.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Bill invalid status");
    }
    Console.WriteLine("[Bill.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Bill " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Bill.close] id=" + Id + " -> CLOSED");
  }
}

sealed class CafeteriaCheckoutBillingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Item> _items = new();
  private readonly Dictionary<string, Cart> _carts = new();
  private readonly Dictionary<string, CartLine> _cart_lines = new();
  private readonly Dictionary<string, Discount> _discounts = new();
  private readonly Dictionary<string, Bill> _bills = new();
  public CafeteriaCheckoutBillingService() {
    Console.WriteLine("[CafeteriaCheckoutBillingService.__init__] system ready");
  }

  public Item CreateItem(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Item name required");
    }
    lock (_gate) {
      var id = string.Format("ITE-{0:D4}", _seq++);
      var obj = new Item(id, name.Trim());
      obj.Validate();
      _items[id] = obj;
      Console.WriteLine("[CafeteriaCheckoutBillingService.CreateItem] stored " + id);
      return obj;
    }
  }

  public Item GetItem(string id) {
    lock (_gate) {
      if (!_items.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Item id: " + id);
      }
      Console.WriteLine("[CafeteriaCheckoutBillingService.GetItem] found " + id);
      return obj;
    }
  }

  public Cart CreateCart(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Cart name required");
    }
    lock (_gate) {
      var id = string.Format("CAR-{0:D4}", _seq++);
      var obj = new Cart(id, name.Trim());
      obj.Validate();
      _carts[id] = obj;
      Console.WriteLine("[CafeteriaCheckoutBillingService.CreateCart] stored " + id);
      return obj;
    }
  }

  public Cart GetCart(string id) {
    lock (_gate) {
      if (!_carts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Cart id: " + id);
      }
      Console.WriteLine("[CafeteriaCheckoutBillingService.GetCart] found " + id);
      return obj;
    }
  }

  public CartLine CreateCartLine(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CartLine name required");
    }
    lock (_gate) {
      var id = string.Format("CAR-{0:D4}", _seq++);
      var obj = new CartLine(id, name.Trim());
      obj.Validate();
      _cart_lines[id] = obj;
      Console.WriteLine("[CafeteriaCheckoutBillingService.CreateCartLine] stored " + id);
      return obj;
    }
  }

  public CartLine GetCartLine(string id) {
    lock (_gate) {
      if (!_cart_lines.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown CartLine id: " + id);
      }
      Console.WriteLine("[CafeteriaCheckoutBillingService.GetCartLine] found " + id);
      return obj;
    }
  }

  public Discount CreateDiscount(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Discount name required");
    }
    lock (_gate) {
      var id = string.Format("DIS-{0:D4}", _seq++);
      var obj = new Discount(id, name.Trim());
      obj.Validate();
      _discounts[id] = obj;
      Console.WriteLine("[CafeteriaCheckoutBillingService.CreateDiscount] stored " + id);
      return obj;
    }
  }

  public Discount GetDiscount(string id) {
    lock (_gate) {
      if (!_discounts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Discount id: " + id);
      }
      Console.WriteLine("[CafeteriaCheckoutBillingService.GetDiscount] found " + id);
      return obj;
    }
  }

  public Bill CreateBill(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Bill name required");
    }
    lock (_gate) {
      var id = string.Format("BIL-{0:D4}", _seq++);
      var obj = new Bill(id, name.Trim());
      obj.Validate();
      _bills[id] = obj;
      Console.WriteLine("[CafeteriaCheckoutBillingService.CreateBill] stored " + id);
      return obj;
    }
  }

  public Bill GetBill(string id) {
    lock (_gate) {
      if (!_bills.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Bill id: " + id);
      }
      Console.WriteLine("[CafeteriaCheckoutBillingService.GetBill] found " + id);
      return obj;
    }
  }

  public Item CloseItem(string id) {
    var obj = GetItem(id);
    Console.WriteLine("[CafeteriaCheckoutBillingService.CloseItem] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct CafeteriaCheckoutBillingService ==========");
    var system = new CafeteriaCheckoutBillingService();
    Console.WriteLine("========== STEP 2: Create Item ==========");
    var first = system.CreateItem("alpha-item");
    system.CreateItem("beta-item");
    system.CreateCart("sample-cart");
    system.CreateCartLine("sample-cart_line");
    system.CreateDiscount("sample-discount");
    system.CreateBill("sample-bill");
    system.CloseItem(first.Id);
    try {
      system.CloseItem(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetItem("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const cafeteriaCheckoutBillingSolution: ProblemSolution = {
  slug: 'cafeteria-checkout-billing',
  title: 'Cafeteria Self-Checkout Billing System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a self-checkout billing system for a cafeteria that scans items, applies discounts, and generates a bill. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Scan/add items to a cart with quantity',
      'Look up item price from a catalog',
      'Apply discounts (percentage-off, buy-one-get-one, flat coupon)',
      'Calculate tax based on item category',
      'Generate an itemized bill/receipt',
      'Support multiple payment methods (cash, card, wallet)',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Scan/add items to a cart with quantity?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Look up item price from a catalog?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Apply discounts (percentage-off, buy-one-get-one, flat coupon)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Calculate tax based on item category?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Generate an itemized bill/receipt?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. CafeteriaCheckoutBillingService is the facade stereotype. Item, Cart, CartLine, Discount, Bill are concrete domain classes with id/name/status and validate/close.',
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
          'Construct CafeteriaCheckoutBillingService.',
          'createItem twice and create the related UML classes.',
          'closeItem once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'CafeteriaCheckoutBillingService', responsibility: 'UML facade - orchestrates Cafeteria Self-Checkout Billing System.', keyMembers: ['create*', 'get*', 'closeItem'] },
    { name: 'Item', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Cart', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'CartLine', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Discount', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Bill', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from CafeteriaCheckoutBillingService to Item, Cart, CartLine, Discount, Bill. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on CafeteriaCheckoutBillingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'CafeteriaCheckoutBillingService', responsibility: 'UML facade - orchestrates Cafeteria Self-Checkout Billing System.', keyMembers: ['create*', 'get*', 'closeItem'] },
    { name: 'Item', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Cart', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'CartLine', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Discount', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Bill', responsibility: 'UML class - domain object for Cafeteria Self-Checkout Billing System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'CafeteriaCheckoutBillingService exposes create/get/close and owns composed collections.' },
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
      'main constructs CafeteriaCheckoutBillingService, creates UML domain objects, closes the primary Item, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct CafeteriaCheckoutBillingService.',
      'createItem for alpha and beta.',
      'create remaining UML classes.',
      'closeItem(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createItem("alpha..."); closeItem(id)',
        output: '[Item.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeItem(alreadyClosed) or getItem("MISSING-ID")',
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
