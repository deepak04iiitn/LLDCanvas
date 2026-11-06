import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'ShoppingCartService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_products', 'Map<string, Product>'),
    attr('-', '_inventories', 'Map<string, Inventory>'),
    attr('-', '_carts', 'Map<string, Cart>'),
    attr('-', '_cart_items', 'Map<string, CartItem>'),
    attr('-', '_orders', 'Map<string, Order>'),
  ], [
    method('+', 'createProduct', 'name: string', 'Product'),
    method('+', 'createInventory', 'name: string', 'Inventory'),
    method('+', 'createCart', 'name: string', 'Cart'),
    method('+', 'createCartItem', 'name: string', 'CartItem'),
    method('+', 'createOrder', 'name: string', 'Order'),
    method('+', 'getProduct', 'id: string', 'Product'),
    method('+', 'getInventory', 'id: string', 'Inventory'),
    method('+', 'getCart', 'id: string', 'Cart'),
    method('+', 'getCartItem', 'id: string', 'CartItem'),
    method('+', 'getOrder', 'id: string', 'Order'),
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
  cls('n2', 'Inventory', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Cart', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'CartItem', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Order', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("shopping-cart")


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


class Inventory:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Inventory.id is required")
        if not name or not name.strip():
            raise ValueError("Inventory.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Inventory.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Inventory {self.id} has invalid status={self.status}")
        log.info("[Inventory.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Inventory {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Inventory.close] id=%s -> CLOSED", self.id)


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


class CartItem:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("CartItem.id is required")
        if not name or not name.strip():
            raise ValueError("CartItem.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[CartItem.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"CartItem {self.id} has invalid status={self.status}")
        log.info("[CartItem.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"CartItem {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[CartItem.close] id=%s -> CLOSED", self.id)


class Order:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Order.id is required")
        if not name or not name.strip():
            raise ValueError("Order.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Order.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Order {self.id} has invalid status={self.status}")
        log.info("[Order.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Order {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Order.close] id=%s -> CLOSED", self.id)


class ShoppingCartService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._products: Dict[str, Product] = {}
        self._inventories: Dict[str, Inventory] = {}
        self._carts: Dict[str, Cart] = {}
        self._cart_items: Dict[str, CartItem] = {}
        self._orders: Dict[str, Order] = {}
        log.info("[ShoppingCartService.__init__] system ready; managing: Product, Inventory, Cart, CartItem, Order")

    def create_product(self, name: str) -> Product:
        """UML: ShoppingCartService.create_product(name) -> Product"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Product name is required")
        with self._lock:
            item_id = f"PRO-{self._seq:04d}"
            self._seq += 1
            obj = Product(item_id, cleaned)
            obj.validate()
            self._products[item_id] = obj
            log.info("[ShoppingCartService.create_product] stored %s in _products (count=%s)", item_id, len(self._products))
            return obj

    def get_product(self, item_id: str) -> Product:
        with self._lock:
            obj = self._products.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Product id: {item_id}")
            log.info("[ShoppingCartService.get_product] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_inventory(self, name: str) -> Inventory:
        """UML: ShoppingCartService.create_inventory(name) -> Inventory"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Inventory name is required")
        with self._lock:
            item_id = f"INV-{self._seq:04d}"
            self._seq += 1
            obj = Inventory(item_id, cleaned)
            obj.validate()
            self._inventories[item_id] = obj
            log.info("[ShoppingCartService.create_inventory] stored %s in _inventories (count=%s)", item_id, len(self._inventories))
            return obj

    def get_inventory(self, item_id: str) -> Inventory:
        with self._lock:
            obj = self._inventories.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Inventory id: {item_id}")
            log.info("[ShoppingCartService.get_inventory] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_cart(self, name: str) -> Cart:
        """UML: ShoppingCartService.create_cart(name) -> Cart"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Cart name is required")
        with self._lock:
            item_id = f"CAR-{self._seq:04d}"
            self._seq += 1
            obj = Cart(item_id, cleaned)
            obj.validate()
            self._carts[item_id] = obj
            log.info("[ShoppingCartService.create_cart] stored %s in _carts (count=%s)", item_id, len(self._carts))
            return obj

    def get_cart(self, item_id: str) -> Cart:
        with self._lock:
            obj = self._carts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Cart id: {item_id}")
            log.info("[ShoppingCartService.get_cart] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_cart_item(self, name: str) -> CartItem:
        """UML: ShoppingCartService.create_cart_item(name) -> CartItem"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("CartItem name is required")
        with self._lock:
            item_id = f"CAR-{self._seq:04d}"
            self._seq += 1
            obj = CartItem(item_id, cleaned)
            obj.validate()
            self._cart_items[item_id] = obj
            log.info("[ShoppingCartService.create_cart_item] stored %s in _cart_items (count=%s)", item_id, len(self._cart_items))
            return obj

    def get_cart_item(self, item_id: str) -> CartItem:
        with self._lock:
            obj = self._cart_items.get(item_id)
            if obj is None:
                raise KeyError(f"unknown CartItem id: {item_id}")
            log.info("[ShoppingCartService.get_cart_item] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_order(self, name: str) -> Order:
        """UML: ShoppingCartService.create_order(name) -> Order"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Order name is required")
        with self._lock:
            item_id = f"ORD-{self._seq:04d}"
            self._seq += 1
            obj = Order(item_id, cleaned)
            obj.validate()
            self._orders[item_id] = obj
            log.info("[ShoppingCartService.create_order] stored %s in _orders (count=%s)", item_id, len(self._orders))
            return obj

    def get_order(self, item_id: str) -> Order:
        with self._lock:
            obj = self._orders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Order id: {item_id}")
            log.info("[ShoppingCartService.get_order] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_product(self, item_id: str) -> Product:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._products.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Product id: {item_id}")
            log.info("[ShoppingCartService.close_product] closing %s via Product.close()", item_id)
            obj.close()
            return obj

    def list_active_products(self) -> List[Product]:
        with self._lock:
            active = [o for o in self._products.values() if o.status == "ACTIVE"]
            log.info("[ShoppingCartService.list_active_products] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct ShoppingCartService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = ShoppingCartService()

    log.info("========== STEP 2: Create primary Product objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_product("alpha-product")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_product("beta-product")

    log.info("========== STEP 3: Create Inventory (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_inventory("sample-inventory")

    log.info("========== STEP 4: Create Cart (UML class) ==========")
    system.create_cart("sample-cart")

    log.info("========== STEP 5: Create CartItem (UML class) ==========")
    system.create_cart_item("sample-cart_item")

    log.info("========== STEP 6: Create Order (UML class) ==========")
    system.create_order("sample-order")

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


class Inventory {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Inventory(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Inventory.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Inventory.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Inventory.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Inventory " + id + " invalid status");
    }
    System.out.println("[Inventory.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Inventory " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Inventory.close] id=" + id + " -> CLOSED");
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


class CartItem {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  CartItem(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("CartItem.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CartItem.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[CartItem.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("CartItem " + id + " invalid status");
    }
    System.out.println("[CartItem.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("CartItem " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[CartItem.close] id=" + id + " -> CLOSED");
  }
}


class Order {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Order(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Order.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Order.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Order.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Order " + id + " invalid status");
    }
    System.out.println("[Order.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Order " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Order.close] id=" + id + " -> CLOSED");
  }
}

public class ShoppingCartService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Product> products = new LinkedHashMap<>();
  private final Map<String, Inventory> inventories = new LinkedHashMap<>();
  private final Map<String, Cart> carts = new LinkedHashMap<>();
  private final Map<String, CartItem> cart_items = new LinkedHashMap<>();
  private final Map<String, Order> orders = new LinkedHashMap<>();

  public ShoppingCartService() {
    System.out.println("[ShoppingCartService.__init__] system ready");
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
      System.out.println("[ShoppingCartService.createProduct] stored " + id + " count=" + products.size());
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
      System.out.println("[ShoppingCartService.getProduct] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Inventory createInventory(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Inventory name required");
    }
    lock.lock();
    try {
      String id = String.format("INV-%04d", seq++);
      Inventory obj = new Inventory(id, name.trim());
      obj.validate();
      inventories.put(id, obj);
      System.out.println("[ShoppingCartService.createInventory] stored " + id + " count=" + inventories.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Inventory getInventory(String id) {
    lock.lock();
    try {
      Inventory obj = inventories.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Inventory id: " + id);
      }
      System.out.println("[ShoppingCartService.getInventory] found id=" + obj.getId());
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
      System.out.println("[ShoppingCartService.createCart] stored " + id + " count=" + carts.size());
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
      System.out.println("[ShoppingCartService.getCart] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public CartItem createCartItem(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CartItem name required");
    }
    lock.lock();
    try {
      String id = String.format("CAR-%04d", seq++);
      CartItem obj = new CartItem(id, name.trim());
      obj.validate();
      cart_items.put(id, obj);
      System.out.println("[ShoppingCartService.createCartItem] stored " + id + " count=" + cart_items.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public CartItem getCartItem(String id) {
    lock.lock();
    try {
      CartItem obj = cart_items.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown CartItem id: " + id);
      }
      System.out.println("[ShoppingCartService.getCartItem] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Order createOrder(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Order name required");
    }
    lock.lock();
    try {
      String id = String.format("ORD-%04d", seq++);
      Order obj = new Order(id, name.trim());
      obj.validate();
      orders.put(id, obj);
      System.out.println("[ShoppingCartService.createOrder] stored " + id + " count=" + orders.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Order getOrder(String id) {
    lock.lock();
    try {
      Order obj = orders.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Order id: " + id);
      }
      System.out.println("[ShoppingCartService.getOrder] found id=" + obj.getId());
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
      System.out.println("[ShoppingCartService.closeProduct] closing " + id);
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
      System.out.println("[ShoppingCartService.listActiveProducts] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct ShoppingCartService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    ShoppingCartService system = new ShoppingCartService();
    System.out.println("========== STEP 2: Create Product objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Product first = system.createProduct("alpha-product");
    system.createProduct("beta-product");
    System.out.println("========== STEP 3: Create Inventory ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createInventory("sample-inventory");
    System.out.println("========== STEP 4: Create Cart ==========");
    system.createCart("sample-cart");
    System.out.println("========== STEP 5: Create CartItem ==========");
    system.createCartItem("sample-cart_item");
    System.out.println("========== STEP 6: Create Order ==========");
    system.createOrder("sample-order");
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


class Inventory {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Inventory.id required')
    }

    if (!name?.trim()) {
      throw new Error('Inventory.name required')
    }
    console.log(\`[Inventory.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Inventory \${this.id} invalid status\`)
    }
    console.log(\`[Inventory.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Inventory \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Inventory.close] id=\${this.id} -> CLOSED\`)
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


class CartItem {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('CartItem.id required')
    }

    if (!name?.trim()) {
      throw new Error('CartItem.name required')
    }
    console.log(\`[CartItem.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`CartItem \${this.id} invalid status\`)
    }
    console.log(\`[CartItem.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`CartItem \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[CartItem.close] id=\${this.id} -> CLOSED\`)
  }
}


class Order {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Order.id required')
    }

    if (!name?.trim()) {
      throw new Error('Order.name required')
    }
    console.log(\`[Order.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Order \${this.id} invalid status\`)
    }
    console.log(\`[Order.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Order \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Order.close] id=\${this.id} -> CLOSED\`)
  }
}

class ShoppingCartService {
  private seq = 1
  private products = new Map<string, Product>()
  private inventories = new Map<string, Inventory>()
  private carts = new Map<string, Cart>()
  private cart_items = new Map<string, CartItem>()
  private orders = new Map<string, Order>()
  constructor() {
    console.log('[ShoppingCartService.__init__] system ready')
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
    console.log(\`[ShoppingCartService.createProduct] stored \${id} count=\${this.products.size}\`)
    return obj
  }

  getProduct(id: string): Product {
    const obj = this.products.get(id)
    if (!obj) {
      throw new Error(\`unknown Product id: \${id}\`)
    }
    console.log(\`[ShoppingCartService.getProduct] found id=\${obj.id}\`)
    return obj
  }

  createInventory(name: string): Inventory {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Inventory name required')
    }
    const id = \`INV-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Inventory(id, cleaned)
    obj.validate()
    this.inventories.set(id, obj)
    console.log(\`[ShoppingCartService.createInventory] stored \${id} count=\${this.inventories.size}\`)
    return obj
  }

  getInventory(id: string): Inventory {
    const obj = this.inventories.get(id)
    if (!obj) {
      throw new Error(\`unknown Inventory id: \${id}\`)
    }
    console.log(\`[ShoppingCartService.getInventory] found id=\${obj.id}\`)
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
    console.log(\`[ShoppingCartService.createCart] stored \${id} count=\${this.carts.size}\`)
    return obj
  }

  getCart(id: string): Cart {
    const obj = this.carts.get(id)
    if (!obj) {
      throw new Error(\`unknown Cart id: \${id}\`)
    }
    console.log(\`[ShoppingCartService.getCart] found id=\${obj.id}\`)
    return obj
  }

  createCartItem(name: string): CartItem {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('CartItem name required')
    }
    const id = \`CAR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new CartItem(id, cleaned)
    obj.validate()
    this.cart_items.set(id, obj)
    console.log(\`[ShoppingCartService.createCartItem] stored \${id} count=\${this.cart_items.size}\`)
    return obj
  }

  getCartItem(id: string): CartItem {
    const obj = this.cart_items.get(id)
    if (!obj) {
      throw new Error(\`unknown CartItem id: \${id}\`)
    }
    console.log(\`[ShoppingCartService.getCartItem] found id=\${obj.id}\`)
    return obj
  }

  createOrder(name: string): Order {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Order name required')
    }
    const id = \`ORD-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Order(id, cleaned)
    obj.validate()
    this.orders.set(id, obj)
    console.log(\`[ShoppingCartService.createOrder] stored \${id} count=\${this.orders.size}\`)
    return obj
  }

  getOrder(id: string): Order {
    const obj = this.orders.get(id)
    if (!obj) {
      throw new Error(\`unknown Order id: \${id}\`)
    }
    console.log(\`[ShoppingCartService.getOrder] found id=\${obj.id}\`)
    return obj
  }

  closeProduct(id: string): Product {
    const obj = this.getProduct(id)
    console.log(\`[ShoppingCartService.closeProduct] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveProducts(): Product[] {
    const active = [...this.products.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[ShoppingCartService.listActiveProducts] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct ShoppingCartService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new ShoppingCartService()
  console.log('========== STEP 2: Create Product objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createProduct('alpha-product')
  system.createProduct('beta-product')
  console.log('========== STEP 3: Create Inventory ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createInventory('sample-inventory')
  console.log('========== STEP 4: Create Cart ==========')
  system.createCart('sample-cart')
  console.log('========== STEP 5: Create CartItem ==========')
  system.createCartItem('sample-cart_item')
  console.log('========== STEP 6: Create Order ==========')
  system.createOrder('sample-order')
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


class Inventory {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Inventory(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Inventory requires id and name");
    }
    cout << "[Inventory.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Inventory invalid status");
    }
    cout << "[Inventory.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Inventory cannot close");
    }
    status_ = "CLOSED";
    cout << "[Inventory.close] id=" << id_ << " -> CLOSED" << endl;
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


class CartItem {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  CartItem(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("CartItem requires id and name");
    }
    cout << "[CartItem.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("CartItem invalid status");
    }
    cout << "[CartItem.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("CartItem cannot close");
    }
    status_ = "CLOSED";
    cout << "[CartItem.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Order {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Order(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Order requires id and name");
    }
    cout << "[Order.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Order invalid status");
    }
    cout << "[Order.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Order cannot close");
    }
    status_ = "CLOSED";
    cout << "[Order.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class ShoppingCartService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Product> products_;
  unordered_map<string, Inventory> inventories_;
  unordered_map<string, Cart> carts_;
  unordered_map<string, CartItem> cart_items_;
  unordered_map<string, Order> orders_;
public:
  ShoppingCartService() {
    cout << "[ShoppingCartService.__init__] system ready" << endl;
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
    cout << "[ShoppingCartService.createProduct] stored " << obj.id() << endl;
    return obj;
  }

  Product getProduct(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = products_.find(id);
    if (it == products_.end()) {
      throw out_of_range("unknown Product id");
    }
    cout << "[ShoppingCartService.getProduct] found " << id << endl;
    return it->second;
  }

  Inventory createInventory(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Inventory name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "INV-%04d", seq_++);
    Inventory obj{buf, name};
    obj.validate();
    inventories_.emplace(obj.id(), obj);
    cout << "[ShoppingCartService.createInventory] stored " << obj.id() << endl;
    return obj;
  }

  Inventory getInventory(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = inventories_.find(id);
    if (it == inventories_.end()) {
      throw out_of_range("unknown Inventory id");
    }
    cout << "[ShoppingCartService.getInventory] found " << id << endl;
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
    cout << "[ShoppingCartService.createCart] stored " << obj.id() << endl;
    return obj;
  }

  Cart getCart(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = carts_.find(id);
    if (it == carts_.end()) {
      throw out_of_range("unknown Cart id");
    }
    cout << "[ShoppingCartService.getCart] found " << id << endl;
    return it->second;
  }

  CartItem createCartItem(const string& name) {
    if (name.empty()) {
      throw invalid_argument("CartItem name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CAR-%04d", seq_++);
    CartItem obj{buf, name};
    obj.validate();
    cart_items_.emplace(obj.id(), obj);
    cout << "[ShoppingCartService.createCartItem] stored " << obj.id() << endl;
    return obj;
  }

  CartItem getCartItem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cart_items_.find(id);
    if (it == cart_items_.end()) {
      throw out_of_range("unknown CartItem id");
    }
    cout << "[ShoppingCartService.getCartItem] found " << id << endl;
    return it->second;
  }

  Order createOrder(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Order name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ORD-%04d", seq_++);
    Order obj{buf, name};
    obj.validate();
    orders_.emplace(obj.id(), obj);
    cout << "[ShoppingCartService.createOrder] stored " << obj.id() << endl;
    return obj;
  }

  Order getOrder(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = orders_.find(id);
    if (it == orders_.end()) {
      throw out_of_range("unknown Order id");
    }
    cout << "[ShoppingCartService.getOrder] found " << id << endl;
    return it->second;
  }

  Product closeProduct(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = products_.find(id);
    if (it == products_.end()) {
      throw out_of_range("unknown Product");
    }
    cout << "[ShoppingCartService.closeProduct] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct ShoppingCartService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  ShoppingCartService system;
  cout << "========== STEP 2: Create Product ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createProduct("alpha-product");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createProduct("beta-product");
  system.createInventory("sample-inventory");
  system.createCart("sample-cart");
  system.createCartItem("sample-cart_item");
  system.createOrder("sample-order");
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


type Inventory struct {
  ID     string
  Name   string
  Status string
}

func NewInventory(id, name string) (*Inventory, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Inventory requires id and name")
  }
  obj := &Inventory{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Inventory.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Inventory) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Inventory invalid status")
  }
  fmt.Printf("[Inventory.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Inventory) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Inventory %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Inventory.close] id=%s -> CLOSED\\n", o.ID)
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


type CartItem struct {
  ID     string
  Name   string
  Status string
}

func NewCartItem(id, name string) (*CartItem, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("CartItem requires id and name")
  }
  obj := &CartItem{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[CartItem.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *CartItem) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("CartItem invalid status")
  }
  fmt.Printf("[CartItem.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *CartItem) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("CartItem %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[CartItem.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Order struct {
  ID     string
  Name   string
  Status string
}

func NewOrder(id, name string) (*Order, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Order requires id and name")
  }
  obj := &Order{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Order.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Order) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Order invalid status")
  }
  fmt.Printf("[Order.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Order) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Order %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Order.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type ShoppingCartService struct {
  mu  sync.Mutex
  seq int
  products map[string]*Product
  inventories map[string]*Inventory
  carts map[string]*Cart
  cart_items map[string]*CartItem
  orders map[string]*Order
}

func NewShoppingCartService() *ShoppingCartService {
  fmt.Println("[ShoppingCartService.__init__] system ready")
  return &ShoppingCartService{
    seq: 1,
    products: map[string]*Product{},
    inventories: map[string]*Inventory{},
    carts: map[string]*Cart{},
    cart_items: map[string]*CartItem{},
    orders: map[string]*Order{},
  }
}

func (s *ShoppingCartService) CreateProduct(name string) (*Product, error) {
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
  fmt.Printf("[ShoppingCartService.CreateProduct] stored %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) GetProduct(id string) (*Product, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.products[id]
  if !ok {
    return nil, fmt.Errorf("unknown Product id: %s", id)
  }
  fmt.Printf("[ShoppingCartService.GetProduct] found %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) CreateInventory(name string) (*Inventory, error) {
  if name == "" {
    return nil, fmt.Errorf("Inventory name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("INV-%04d", s.seq)
  s.seq++
  obj, err := NewInventory(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.inventories[id] = obj
  fmt.Printf("[ShoppingCartService.CreateInventory] stored %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) GetInventory(id string) (*Inventory, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.inventories[id]
  if !ok {
    return nil, fmt.Errorf("unknown Inventory id: %s", id)
  }
  fmt.Printf("[ShoppingCartService.GetInventory] found %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) CreateCart(name string) (*Cart, error) {
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
  fmt.Printf("[ShoppingCartService.CreateCart] stored %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) GetCart(id string) (*Cart, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.carts[id]
  if !ok {
    return nil, fmt.Errorf("unknown Cart id: %s", id)
  }
  fmt.Printf("[ShoppingCartService.GetCart] found %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) CreateCartItem(name string) (*CartItem, error) {
  if name == "" {
    return nil, fmt.Errorf("CartItem name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CAR-%04d", s.seq)
  s.seq++
  obj, err := NewCartItem(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.cart_items[id] = obj
  fmt.Printf("[ShoppingCartService.CreateCartItem] stored %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) GetCartItem(id string) (*CartItem, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.cart_items[id]
  if !ok {
    return nil, fmt.Errorf("unknown CartItem id: %s", id)
  }
  fmt.Printf("[ShoppingCartService.GetCartItem] found %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) CreateOrder(name string) (*Order, error) {
  if name == "" {
    return nil, fmt.Errorf("Order name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ORD-%04d", s.seq)
  s.seq++
  obj, err := NewOrder(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.orders[id] = obj
  fmt.Printf("[ShoppingCartService.CreateOrder] stored %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) GetOrder(id string) (*Order, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.orders[id]
  if !ok {
    return nil, fmt.Errorf("unknown Order id: %s", id)
  }
  fmt.Printf("[ShoppingCartService.GetOrder] found %s\\n", id)
  return obj, nil
}

func (s *ShoppingCartService) CloseProduct(id string) (*Product, error) {
  obj, err := s.GetProduct(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[ShoppingCartService.CloseProduct] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct ShoppingCartService ==========")
  system := NewShoppingCartService()
  fmt.Println("========== STEP 2: Create Product ==========")
  first, _ := system.CreateProduct("alpha-product")
  system.CreateProduct("beta-product")
  system.CreateInventory("sample-inventory")
  system.CreateCart("sample-cart")
  system.CreateCartItem("sample-cart_item")
  system.CreateOrder("sample-order")
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


sealed class Inventory {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Inventory(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Inventory requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Inventory.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Inventory invalid status");
    }
    Console.WriteLine("[Inventory.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Inventory " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Inventory.close] id=" + Id + " -> CLOSED");
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


sealed class CartItem {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public CartItem(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CartItem requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[CartItem.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("CartItem invalid status");
    }
    Console.WriteLine("[CartItem.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("CartItem " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[CartItem.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Order {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Order(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Order requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Order.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Order invalid status");
    }
    Console.WriteLine("[Order.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Order " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Order.close] id=" + Id + " -> CLOSED");
  }
}

sealed class ShoppingCartService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Product> _products = new();
  private readonly Dictionary<string, Inventory> _inventories = new();
  private readonly Dictionary<string, Cart> _carts = new();
  private readonly Dictionary<string, CartItem> _cart_items = new();
  private readonly Dictionary<string, Order> _orders = new();
  public ShoppingCartService() {
    Console.WriteLine("[ShoppingCartService.__init__] system ready");
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
      Console.WriteLine("[ShoppingCartService.CreateProduct] stored " + id);
      return obj;
    }
  }

  public Product GetProduct(string id) {
    lock (_gate) {
      if (!_products.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Product id: " + id);
      }
      Console.WriteLine("[ShoppingCartService.GetProduct] found " + id);
      return obj;
    }
  }

  public Inventory CreateInventory(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Inventory name required");
    }
    lock (_gate) {
      var id = string.Format("INV-{0:D4}", _seq++);
      var obj = new Inventory(id, name.Trim());
      obj.Validate();
      _inventories[id] = obj;
      Console.WriteLine("[ShoppingCartService.CreateInventory] stored " + id);
      return obj;
    }
  }

  public Inventory GetInventory(string id) {
    lock (_gate) {
      if (!_inventories.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Inventory id: " + id);
      }
      Console.WriteLine("[ShoppingCartService.GetInventory] found " + id);
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
      Console.WriteLine("[ShoppingCartService.CreateCart] stored " + id);
      return obj;
    }
  }

  public Cart GetCart(string id) {
    lock (_gate) {
      if (!_carts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Cart id: " + id);
      }
      Console.WriteLine("[ShoppingCartService.GetCart] found " + id);
      return obj;
    }
  }

  public CartItem CreateCartItem(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CartItem name required");
    }
    lock (_gate) {
      var id = string.Format("CAR-{0:D4}", _seq++);
      var obj = new CartItem(id, name.Trim());
      obj.Validate();
      _cart_items[id] = obj;
      Console.WriteLine("[ShoppingCartService.CreateCartItem] stored " + id);
      return obj;
    }
  }

  public CartItem GetCartItem(string id) {
    lock (_gate) {
      if (!_cart_items.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown CartItem id: " + id);
      }
      Console.WriteLine("[ShoppingCartService.GetCartItem] found " + id);
      return obj;
    }
  }

  public Order CreateOrder(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Order name required");
    }
    lock (_gate) {
      var id = string.Format("ORD-{0:D4}", _seq++);
      var obj = new Order(id, name.Trim());
      obj.Validate();
      _orders[id] = obj;
      Console.WriteLine("[ShoppingCartService.CreateOrder] stored " + id);
      return obj;
    }
  }

  public Order GetOrder(string id) {
    lock (_gate) {
      if (!_orders.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Order id: " + id);
      }
      Console.WriteLine("[ShoppingCartService.GetOrder] found " + id);
      return obj;
    }
  }

  public Product CloseProduct(string id) {
    var obj = GetProduct(id);
    Console.WriteLine("[ShoppingCartService.CloseProduct] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct ShoppingCartService ==========");
    var system = new ShoppingCartService();
    Console.WriteLine("========== STEP 2: Create Product ==========");
    var first = system.CreateProduct("alpha-product");
    system.CreateProduct("beta-product");
    system.CreateInventory("sample-inventory");
    system.CreateCart("sample-cart");
    system.CreateCartItem("sample-cart_item");
    system.CreateOrder("sample-order");
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

export const shoppingCartSolution: ProblemSolution = {
  slug: 'shopping-cart',
  title: 'Online Shopping Cart - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an e-commerce shopping cart system supporting product catalogue, cart management, promotions, checkout, and order tracking. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Browse and search the product catalog with filters',
      'Add, update, or remove items from the cart',
      'Apply promo codes and automatic discounts',
      'Checkout with address selection and payment',
      'Inventory management — prevent overselling',
      'Order history with status tracking',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Browse and search the product catalog with filters?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Add, update, or remove items from the cart?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Apply promo codes and automatic discounts?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Checkout with address selection and payment?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Inventory management — prevent overselling?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. ShoppingCartService is the facade stereotype. Product, Inventory, Cart, CartItem, Order are concrete domain classes with id/name/status and validate/close.',
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
          'Construct ShoppingCartService.',
          'createProduct twice and create the related UML classes.',
          'closeProduct once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'ShoppingCartService', responsibility: 'UML facade - orchestrates Online Shopping Cart.', keyMembers: ['create*', 'get*', 'closeProduct'] },
    { name: 'Product', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Inventory', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Cart', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'CartItem', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Order', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from ShoppingCartService to Product, Inventory, Cart, CartItem, Order. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on ShoppingCartService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'ShoppingCartService', responsibility: 'UML facade - orchestrates Online Shopping Cart.', keyMembers: ['create*', 'get*', 'closeProduct'] },
    { name: 'Product', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Inventory', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Cart', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'CartItem', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Order', responsibility: 'UML class - domain object for Online Shopping Cart.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'ShoppingCartService exposes create/get/close and owns composed collections.' },
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
      'main constructs ShoppingCartService, creates UML domain objects, closes the primary Product, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct ShoppingCartService.',
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
