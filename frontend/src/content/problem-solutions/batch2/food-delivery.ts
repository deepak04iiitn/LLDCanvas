import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'FoodDeliveryService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_restaurants', 'Map<string, Restaurant>'),
    attr('-', '_menu_items', 'Map<string, MenuItem>'),
    attr('-', '_orders', 'Map<string, Order>'),
    attr('-', '_order_items', 'Map<string, OrderItem>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createRestaurant', 'name: string', 'Restaurant'),
    method('+', 'createMenuItem', 'name: string', 'MenuItem'),
    method('+', 'createOrder', 'name: string', 'Order'),
    method('+', 'createOrderItem', 'name: string', 'OrderItem'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getRestaurant', 'id: string', 'Restaurant'),
    method('+', 'getMenuItem', 'id: string', 'MenuItem'),
    method('+', 'getOrder', 'id: string', 'Order'),
    method('+', 'getOrderItem', 'id: string', 'OrderItem'),
    method('+', 'closeUser', 'id: string', 'User'),
  ], 'facade'),
  cls('n1', 'User', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Restaurant', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'MenuItem', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Order', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'OrderItem', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("food-delivery")


class User:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("User.id is required")
        if not name or not name.strip():
            raise ValueError("User.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[User.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"User {self.id} has invalid status={self.status}")
        log.info("[User.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"User {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[User.close] id=%s -> CLOSED", self.id)


class Restaurant:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Restaurant.id is required")
        if not name or not name.strip():
            raise ValueError("Restaurant.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Restaurant.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Restaurant {self.id} has invalid status={self.status}")
        log.info("[Restaurant.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Restaurant {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Restaurant.close] id=%s -> CLOSED", self.id)


class MenuItem:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("MenuItem.id is required")
        if not name or not name.strip():
            raise ValueError("MenuItem.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[MenuItem.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"MenuItem {self.id} has invalid status={self.status}")
        log.info("[MenuItem.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"MenuItem {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[MenuItem.close] id=%s -> CLOSED", self.id)


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


class OrderItem:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("OrderItem.id is required")
        if not name or not name.strip():
            raise ValueError("OrderItem.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[OrderItem.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"OrderItem {self.id} has invalid status={self.status}")
        log.info("[OrderItem.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"OrderItem {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[OrderItem.close] id=%s -> CLOSED", self.id)


class FoodDeliveryService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._restaurants: Dict[str, Restaurant] = {}
        self._menu_items: Dict[str, MenuItem] = {}
        self._orders: Dict[str, Order] = {}
        self._order_items: Dict[str, OrderItem] = {}
        log.info("[FoodDeliveryService.__init__] system ready; managing: User, Restaurant, MenuItem, Order, OrderItem")

    def create_user(self, name: str) -> User:
        """UML: FoodDeliveryService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[FoodDeliveryService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[FoodDeliveryService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_restaurant(self, name: str) -> Restaurant:
        """UML: FoodDeliveryService.create_restaurant(name) -> Restaurant"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Restaurant name is required")
        with self._lock:
            item_id = f"RES-{self._seq:04d}"
            self._seq += 1
            obj = Restaurant(item_id, cleaned)
            obj.validate()
            self._restaurants[item_id] = obj
            log.info("[FoodDeliveryService.create_restaurant] stored %s in _restaurants (count=%s)", item_id, len(self._restaurants))
            return obj

    def get_restaurant(self, item_id: str) -> Restaurant:
        with self._lock:
            obj = self._restaurants.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Restaurant id: {item_id}")
            log.info("[FoodDeliveryService.get_restaurant] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_menu_item(self, name: str) -> MenuItem:
        """UML: FoodDeliveryService.create_menu_item(name) -> MenuItem"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("MenuItem name is required")
        with self._lock:
            item_id = f"MEN-{self._seq:04d}"
            self._seq += 1
            obj = MenuItem(item_id, cleaned)
            obj.validate()
            self._menu_items[item_id] = obj
            log.info("[FoodDeliveryService.create_menu_item] stored %s in _menu_items (count=%s)", item_id, len(self._menu_items))
            return obj

    def get_menu_item(self, item_id: str) -> MenuItem:
        with self._lock:
            obj = self._menu_items.get(item_id)
            if obj is None:
                raise KeyError(f"unknown MenuItem id: {item_id}")
            log.info("[FoodDeliveryService.get_menu_item] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_order(self, name: str) -> Order:
        """UML: FoodDeliveryService.create_order(name) -> Order"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Order name is required")
        with self._lock:
            item_id = f"ORD-{self._seq:04d}"
            self._seq += 1
            obj = Order(item_id, cleaned)
            obj.validate()
            self._orders[item_id] = obj
            log.info("[FoodDeliveryService.create_order] stored %s in _orders (count=%s)", item_id, len(self._orders))
            return obj

    def get_order(self, item_id: str) -> Order:
        with self._lock:
            obj = self._orders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Order id: {item_id}")
            log.info("[FoodDeliveryService.get_order] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_order_item(self, name: str) -> OrderItem:
        """UML: FoodDeliveryService.create_order_item(name) -> OrderItem"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("OrderItem name is required")
        with self._lock:
            item_id = f"ORD-{self._seq:04d}"
            self._seq += 1
            obj = OrderItem(item_id, cleaned)
            obj.validate()
            self._order_items[item_id] = obj
            log.info("[FoodDeliveryService.create_order_item] stored %s in _order_items (count=%s)", item_id, len(self._order_items))
            return obj

    def get_order_item(self, item_id: str) -> OrderItem:
        with self._lock:
            obj = self._order_items.get(item_id)
            if obj is None:
                raise KeyError(f"unknown OrderItem id: {item_id}")
            log.info("[FoodDeliveryService.get_order_item] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[FoodDeliveryService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[FoodDeliveryService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct FoodDeliveryService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = FoodDeliveryService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Restaurant (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_restaurant("sample-restaurant")

    log.info("========== STEP 4: Create MenuItem (UML class) ==========")
    system.create_menu_item("sample-menu_item")

    log.info("========== STEP 5: Create Order (UML class) ==========")
    system.create_order("sample-order")

    log.info("========== STEP 6: Create OrderItem (UML class) ==========")
    system.create_order_item("sample-order_item")

    log.info("========== STEP 7: Inspect active User list ==========")
    system.list_active_users()

    log.info("========== STEP 8: Close first User ==========")
    system.close_user(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_user(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from User.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_user("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_user: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_users()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class User {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  User(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("User.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("User.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[User.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("User " + id + " invalid status");
    }
    System.out.println("[User.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("User " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[User.close] id=" + id + " -> CLOSED");
  }
}


class Restaurant {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Restaurant(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Restaurant.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Restaurant.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Restaurant.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Restaurant " + id + " invalid status");
    }
    System.out.println("[Restaurant.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Restaurant " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Restaurant.close] id=" + id + " -> CLOSED");
  }
}


class MenuItem {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  MenuItem(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("MenuItem.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MenuItem.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[MenuItem.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("MenuItem " + id + " invalid status");
    }
    System.out.println("[MenuItem.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("MenuItem " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[MenuItem.close] id=" + id + " -> CLOSED");
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


class OrderItem {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  OrderItem(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("OrderItem.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("OrderItem.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[OrderItem.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("OrderItem " + id + " invalid status");
    }
    System.out.println("[OrderItem.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("OrderItem " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[OrderItem.close] id=" + id + " -> CLOSED");
  }
}

public class FoodDeliveryService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Restaurant> restaurants = new LinkedHashMap<>();
  private final Map<String, MenuItem> menu_items = new LinkedHashMap<>();
  private final Map<String, Order> orders = new LinkedHashMap<>();
  private final Map<String, OrderItem> order_items = new LinkedHashMap<>();

  public FoodDeliveryService() {
    System.out.println("[FoodDeliveryService.__init__] system ready");
  }

  public User createUser(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("User name required");
    }
    lock.lock();
    try {
      String id = String.format("USE-%04d", seq++);
      User obj = new User(id, name.trim());
      obj.validate();
      users.put(id, obj);
      System.out.println("[FoodDeliveryService.createUser] stored " + id + " count=" + users.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public User getUser(String id) {
    lock.lock();
    try {
      User obj = users.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown User id: " + id);
      }
      System.out.println("[FoodDeliveryService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Restaurant createRestaurant(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Restaurant name required");
    }
    lock.lock();
    try {
      String id = String.format("RES-%04d", seq++);
      Restaurant obj = new Restaurant(id, name.trim());
      obj.validate();
      restaurants.put(id, obj);
      System.out.println("[FoodDeliveryService.createRestaurant] stored " + id + " count=" + restaurants.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Restaurant getRestaurant(String id) {
    lock.lock();
    try {
      Restaurant obj = restaurants.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Restaurant id: " + id);
      }
      System.out.println("[FoodDeliveryService.getRestaurant] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public MenuItem createMenuItem(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MenuItem name required");
    }
    lock.lock();
    try {
      String id = String.format("MEN-%04d", seq++);
      MenuItem obj = new MenuItem(id, name.trim());
      obj.validate();
      menu_items.put(id, obj);
      System.out.println("[FoodDeliveryService.createMenuItem] stored " + id + " count=" + menu_items.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public MenuItem getMenuItem(String id) {
    lock.lock();
    try {
      MenuItem obj = menu_items.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown MenuItem id: " + id);
      }
      System.out.println("[FoodDeliveryService.getMenuItem] found id=" + obj.getId());
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
      System.out.println("[FoodDeliveryService.createOrder] stored " + id + " count=" + orders.size());
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
      System.out.println("[FoodDeliveryService.getOrder] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public OrderItem createOrderItem(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("OrderItem name required");
    }
    lock.lock();
    try {
      String id = String.format("ORD-%04d", seq++);
      OrderItem obj = new OrderItem(id, name.trim());
      obj.validate();
      order_items.put(id, obj);
      System.out.println("[FoodDeliveryService.createOrderItem] stored " + id + " count=" + order_items.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public OrderItem getOrderItem(String id) {
    lock.lock();
    try {
      OrderItem obj = order_items.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown OrderItem id: " + id);
      }
      System.out.println("[FoodDeliveryService.getOrderItem] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public User closeUser(String id) {
    lock.lock();
    try {
      User obj = users.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown User id: " + id);
      }
      System.out.println("[FoodDeliveryService.closeUser] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<User> listActiveUsers() {
    lock.lock();
    try {
      List<User> out = new ArrayList<>();
      for (User o : users.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[FoodDeliveryService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct FoodDeliveryService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    FoodDeliveryService system = new FoodDeliveryService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Restaurant ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createRestaurant("sample-restaurant");
    System.out.println("========== STEP 4: Create MenuItem ==========");
    system.createMenuItem("sample-menu_item");
    System.out.println("========== STEP 5: Create Order ==========");
    system.createOrder("sample-order");
    System.out.println("========== STEP 6: Create OrderItem ==========");
    system.createOrderItem("sample-order_item");
    System.out.println("========== Inspect active list ==========");
    system.listActiveUsers();
    System.out.println("========== Close first User ==========");
    system.closeUser(first.getId());
    try {
      system.closeUser(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getUser("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class User {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('User.id required')
    }

    if (!name?.trim()) {
      throw new Error('User.name required')
    }
    console.log(\`[User.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`User \${this.id} invalid status\`)
    }
    console.log(\`[User.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`User \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[User.close] id=\${this.id} -> CLOSED\`)
  }
}


class Restaurant {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Restaurant.id required')
    }

    if (!name?.trim()) {
      throw new Error('Restaurant.name required')
    }
    console.log(\`[Restaurant.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Restaurant \${this.id} invalid status\`)
    }
    console.log(\`[Restaurant.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Restaurant \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Restaurant.close] id=\${this.id} -> CLOSED\`)
  }
}


class MenuItem {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('MenuItem.id required')
    }

    if (!name?.trim()) {
      throw new Error('MenuItem.name required')
    }
    console.log(\`[MenuItem.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`MenuItem \${this.id} invalid status\`)
    }
    console.log(\`[MenuItem.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`MenuItem \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[MenuItem.close] id=\${this.id} -> CLOSED\`)
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


class OrderItem {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('OrderItem.id required')
    }

    if (!name?.trim()) {
      throw new Error('OrderItem.name required')
    }
    console.log(\`[OrderItem.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`OrderItem \${this.id} invalid status\`)
    }
    console.log(\`[OrderItem.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`OrderItem \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[OrderItem.close] id=\${this.id} -> CLOSED\`)
  }
}

class FoodDeliveryService {
  private seq = 1
  private users = new Map<string, User>()
  private restaurants = new Map<string, Restaurant>()
  private menu_items = new Map<string, MenuItem>()
  private orders = new Map<string, Order>()
  private order_items = new Map<string, OrderItem>()
  constructor() {
    console.log('[FoodDeliveryService.__init__] system ready')
  }

  createUser(name: string): User {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('User name required')
    }
    const id = \`USE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new User(id, cleaned)
    obj.validate()
    this.users.set(id, obj)
    console.log(\`[FoodDeliveryService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[FoodDeliveryService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createRestaurant(name: string): Restaurant {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Restaurant name required')
    }
    const id = \`RES-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Restaurant(id, cleaned)
    obj.validate()
    this.restaurants.set(id, obj)
    console.log(\`[FoodDeliveryService.createRestaurant] stored \${id} count=\${this.restaurants.size}\`)
    return obj
  }

  getRestaurant(id: string): Restaurant {
    const obj = this.restaurants.get(id)
    if (!obj) {
      throw new Error(\`unknown Restaurant id: \${id}\`)
    }
    console.log(\`[FoodDeliveryService.getRestaurant] found id=\${obj.id}\`)
    return obj
  }

  createMenuItem(name: string): MenuItem {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('MenuItem name required')
    }
    const id = \`MEN-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new MenuItem(id, cleaned)
    obj.validate()
    this.menu_items.set(id, obj)
    console.log(\`[FoodDeliveryService.createMenuItem] stored \${id} count=\${this.menu_items.size}\`)
    return obj
  }

  getMenuItem(id: string): MenuItem {
    const obj = this.menu_items.get(id)
    if (!obj) {
      throw new Error(\`unknown MenuItem id: \${id}\`)
    }
    console.log(\`[FoodDeliveryService.getMenuItem] found id=\${obj.id}\`)
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
    console.log(\`[FoodDeliveryService.createOrder] stored \${id} count=\${this.orders.size}\`)
    return obj
  }

  getOrder(id: string): Order {
    const obj = this.orders.get(id)
    if (!obj) {
      throw new Error(\`unknown Order id: \${id}\`)
    }
    console.log(\`[FoodDeliveryService.getOrder] found id=\${obj.id}\`)
    return obj
  }

  createOrderItem(name: string): OrderItem {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('OrderItem name required')
    }
    const id = \`ORD-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new OrderItem(id, cleaned)
    obj.validate()
    this.order_items.set(id, obj)
    console.log(\`[FoodDeliveryService.createOrderItem] stored \${id} count=\${this.order_items.size}\`)
    return obj
  }

  getOrderItem(id: string): OrderItem {
    const obj = this.order_items.get(id)
    if (!obj) {
      throw new Error(\`unknown OrderItem id: \${id}\`)
    }
    console.log(\`[FoodDeliveryService.getOrderItem] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[FoodDeliveryService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[FoodDeliveryService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct FoodDeliveryService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new FoodDeliveryService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Restaurant ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createRestaurant('sample-restaurant')
  console.log('========== STEP 4: Create MenuItem ==========')
  system.createMenuItem('sample-menu_item')
  console.log('========== STEP 5: Create Order ==========')
  system.createOrder('sample-order')
  console.log('========== STEP 6: Create OrderItem ==========')
  system.createOrderItem('sample-order_item')
  system.listActiveUsers()
  console.log('========== Close first User ==========')
  system.closeUser(first.id)
  try {
    system.closeUser(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getUser('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class User {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  User(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("User requires id and name");
    }
    cout << "[User.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("User invalid status");
    }
    cout << "[User.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("User cannot close");
    }
    status_ = "CLOSED";
    cout << "[User.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Restaurant {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Restaurant(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Restaurant requires id and name");
    }
    cout << "[Restaurant.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Restaurant invalid status");
    }
    cout << "[Restaurant.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Restaurant cannot close");
    }
    status_ = "CLOSED";
    cout << "[Restaurant.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class MenuItem {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  MenuItem(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("MenuItem requires id and name");
    }
    cout << "[MenuItem.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("MenuItem invalid status");
    }
    cout << "[MenuItem.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("MenuItem cannot close");
    }
    status_ = "CLOSED";
    cout << "[MenuItem.close] id=" << id_ << " -> CLOSED" << endl;
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


class OrderItem {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  OrderItem(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("OrderItem requires id and name");
    }
    cout << "[OrderItem.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("OrderItem invalid status");
    }
    cout << "[OrderItem.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("OrderItem cannot close");
    }
    status_ = "CLOSED";
    cout << "[OrderItem.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class FoodDeliveryService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Restaurant> restaurants_;
  unordered_map<string, MenuItem> menu_items_;
  unordered_map<string, Order> orders_;
  unordered_map<string, OrderItem> order_items_;
public:
  FoodDeliveryService() {
    cout << "[FoodDeliveryService.__init__] system ready" << endl;
  }

  User createUser(const string& name) {
    if (name.empty()) {
      throw invalid_argument("User name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "USE-%04d", seq_++);
    User obj{buf, name};
    obj.validate();
    users_.emplace(obj.id(), obj);
    cout << "[FoodDeliveryService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[FoodDeliveryService.getUser] found " << id << endl;
    return it->second;
  }

  Restaurant createRestaurant(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Restaurant name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "RES-%04d", seq_++);
    Restaurant obj{buf, name};
    obj.validate();
    restaurants_.emplace(obj.id(), obj);
    cout << "[FoodDeliveryService.createRestaurant] stored " << obj.id() << endl;
    return obj;
  }

  Restaurant getRestaurant(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = restaurants_.find(id);
    if (it == restaurants_.end()) {
      throw out_of_range("unknown Restaurant id");
    }
    cout << "[FoodDeliveryService.getRestaurant] found " << id << endl;
    return it->second;
  }

  MenuItem createMenuItem(const string& name) {
    if (name.empty()) {
      throw invalid_argument("MenuItem name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MEN-%04d", seq_++);
    MenuItem obj{buf, name};
    obj.validate();
    menu_items_.emplace(obj.id(), obj);
    cout << "[FoodDeliveryService.createMenuItem] stored " << obj.id() << endl;
    return obj;
  }

  MenuItem getMenuItem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = menu_items_.find(id);
    if (it == menu_items_.end()) {
      throw out_of_range("unknown MenuItem id");
    }
    cout << "[FoodDeliveryService.getMenuItem] found " << id << endl;
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
    cout << "[FoodDeliveryService.createOrder] stored " << obj.id() << endl;
    return obj;
  }

  Order getOrder(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = orders_.find(id);
    if (it == orders_.end()) {
      throw out_of_range("unknown Order id");
    }
    cout << "[FoodDeliveryService.getOrder] found " << id << endl;
    return it->second;
  }

  OrderItem createOrderItem(const string& name) {
    if (name.empty()) {
      throw invalid_argument("OrderItem name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ORD-%04d", seq_++);
    OrderItem obj{buf, name};
    obj.validate();
    order_items_.emplace(obj.id(), obj);
    cout << "[FoodDeliveryService.createOrderItem] stored " << obj.id() << endl;
    return obj;
  }

  OrderItem getOrderItem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = order_items_.find(id);
    if (it == order_items_.end()) {
      throw out_of_range("unknown OrderItem id");
    }
    cout << "[FoodDeliveryService.getOrderItem] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[FoodDeliveryService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct FoodDeliveryService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  FoodDeliveryService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createRestaurant("sample-restaurant");
  system.createMenuItem("sample-menu_item");
  system.createOrder("sample-order");
  system.createOrderItem("sample-order_item");
  system.closeUser(first.id());
  try {
    system.closeUser(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getUser("MISSING-ID");
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

type User struct {
  ID     string
  Name   string
  Status string
}

func NewUser(id, name string) (*User, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("User requires id and name")
  }
  obj := &User{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[User.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *User) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("User invalid status")
  }
  fmt.Printf("[User.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *User) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("User %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[User.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Restaurant struct {
  ID     string
  Name   string
  Status string
}

func NewRestaurant(id, name string) (*Restaurant, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Restaurant requires id and name")
  }
  obj := &Restaurant{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Restaurant.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Restaurant) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Restaurant invalid status")
  }
  fmt.Printf("[Restaurant.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Restaurant) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Restaurant %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Restaurant.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type MenuItem struct {
  ID     string
  Name   string
  Status string
}

func NewMenuItem(id, name string) (*MenuItem, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("MenuItem requires id and name")
  }
  obj := &MenuItem{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[MenuItem.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *MenuItem) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("MenuItem invalid status")
  }
  fmt.Printf("[MenuItem.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *MenuItem) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("MenuItem %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[MenuItem.close] id=%s -> CLOSED\\n", o.ID)
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


type OrderItem struct {
  ID     string
  Name   string
  Status string
}

func NewOrderItem(id, name string) (*OrderItem, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("OrderItem requires id and name")
  }
  obj := &OrderItem{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[OrderItem.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *OrderItem) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("OrderItem invalid status")
  }
  fmt.Printf("[OrderItem.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *OrderItem) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("OrderItem %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[OrderItem.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type FoodDeliveryService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  restaurants map[string]*Restaurant
  menu_items map[string]*MenuItem
  orders map[string]*Order
  order_items map[string]*OrderItem
}

func NewFoodDeliveryService() *FoodDeliveryService {
  fmt.Println("[FoodDeliveryService.__init__] system ready")
  return &FoodDeliveryService{
    seq: 1,
    users: map[string]*User{},
    restaurants: map[string]*Restaurant{},
    menu_items: map[string]*MenuItem{},
    orders: map[string]*Order{},
    order_items: map[string]*OrderItem{},
  }
}

func (s *FoodDeliveryService) CreateUser(name string) (*User, error) {
  if name == "" {
    return nil, fmt.Errorf("User name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("USE-%04d", s.seq)
  s.seq++
  obj, err := NewUser(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.users[id] = obj
  fmt.Printf("[FoodDeliveryService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[FoodDeliveryService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) CreateRestaurant(name string) (*Restaurant, error) {
  if name == "" {
    return nil, fmt.Errorf("Restaurant name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("RES-%04d", s.seq)
  s.seq++
  obj, err := NewRestaurant(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.restaurants[id] = obj
  fmt.Printf("[FoodDeliveryService.CreateRestaurant] stored %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) GetRestaurant(id string) (*Restaurant, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.restaurants[id]
  if !ok {
    return nil, fmt.Errorf("unknown Restaurant id: %s", id)
  }
  fmt.Printf("[FoodDeliveryService.GetRestaurant] found %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) CreateMenuItem(name string) (*MenuItem, error) {
  if name == "" {
    return nil, fmt.Errorf("MenuItem name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MEN-%04d", s.seq)
  s.seq++
  obj, err := NewMenuItem(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.menu_items[id] = obj
  fmt.Printf("[FoodDeliveryService.CreateMenuItem] stored %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) GetMenuItem(id string) (*MenuItem, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.menu_items[id]
  if !ok {
    return nil, fmt.Errorf("unknown MenuItem id: %s", id)
  }
  fmt.Printf("[FoodDeliveryService.GetMenuItem] found %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) CreateOrder(name string) (*Order, error) {
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
  fmt.Printf("[FoodDeliveryService.CreateOrder] stored %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) GetOrder(id string) (*Order, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.orders[id]
  if !ok {
    return nil, fmt.Errorf("unknown Order id: %s", id)
  }
  fmt.Printf("[FoodDeliveryService.GetOrder] found %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) CreateOrderItem(name string) (*OrderItem, error) {
  if name == "" {
    return nil, fmt.Errorf("OrderItem name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ORD-%04d", s.seq)
  s.seq++
  obj, err := NewOrderItem(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.order_items[id] = obj
  fmt.Printf("[FoodDeliveryService.CreateOrderItem] stored %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) GetOrderItem(id string) (*OrderItem, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.order_items[id]
  if !ok {
    return nil, fmt.Errorf("unknown OrderItem id: %s", id)
  }
  fmt.Printf("[FoodDeliveryService.GetOrderItem] found %s\\n", id)
  return obj, nil
}

func (s *FoodDeliveryService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[FoodDeliveryService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct FoodDeliveryService ==========")
  system := NewFoodDeliveryService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateRestaurant("sample-restaurant")
  system.CreateMenuItem("sample-menu_item")
  system.CreateOrder("sample-order")
  system.CreateOrderItem("sample-order_item")
  system.CloseUser(first.ID)
  if _, err := system.CloseUser(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetUser("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class User {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public User(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("User requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[User.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("User invalid status");
    }
    Console.WriteLine("[User.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("User " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[User.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Restaurant {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Restaurant(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Restaurant requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Restaurant.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Restaurant invalid status");
    }
    Console.WriteLine("[Restaurant.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Restaurant " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Restaurant.close] id=" + Id + " -> CLOSED");
  }
}


sealed class MenuItem {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public MenuItem(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MenuItem requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[MenuItem.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("MenuItem invalid status");
    }
    Console.WriteLine("[MenuItem.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("MenuItem " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[MenuItem.close] id=" + Id + " -> CLOSED");
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


sealed class OrderItem {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public OrderItem(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("OrderItem requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[OrderItem.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("OrderItem invalid status");
    }
    Console.WriteLine("[OrderItem.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("OrderItem " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[OrderItem.close] id=" + Id + " -> CLOSED");
  }
}

sealed class FoodDeliveryService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Restaurant> _restaurants = new();
  private readonly Dictionary<string, MenuItem> _menu_items = new();
  private readonly Dictionary<string, Order> _orders = new();
  private readonly Dictionary<string, OrderItem> _order_items = new();
  public FoodDeliveryService() {
    Console.WriteLine("[FoodDeliveryService.__init__] system ready");
  }

  public User CreateUser(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("User name required");
    }
    lock (_gate) {
      var id = string.Format("USE-{0:D4}", _seq++);
      var obj = new User(id, name.Trim());
      obj.Validate();
      _users[id] = obj;
      Console.WriteLine("[FoodDeliveryService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[FoodDeliveryService.GetUser] found " + id);
      return obj;
    }
  }

  public Restaurant CreateRestaurant(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Restaurant name required");
    }
    lock (_gate) {
      var id = string.Format("RES-{0:D4}", _seq++);
      var obj = new Restaurant(id, name.Trim());
      obj.Validate();
      _restaurants[id] = obj;
      Console.WriteLine("[FoodDeliveryService.CreateRestaurant] stored " + id);
      return obj;
    }
  }

  public Restaurant GetRestaurant(string id) {
    lock (_gate) {
      if (!_restaurants.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Restaurant id: " + id);
      }
      Console.WriteLine("[FoodDeliveryService.GetRestaurant] found " + id);
      return obj;
    }
  }

  public MenuItem CreateMenuItem(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MenuItem name required");
    }
    lock (_gate) {
      var id = string.Format("MEN-{0:D4}", _seq++);
      var obj = new MenuItem(id, name.Trim());
      obj.Validate();
      _menu_items[id] = obj;
      Console.WriteLine("[FoodDeliveryService.CreateMenuItem] stored " + id);
      return obj;
    }
  }

  public MenuItem GetMenuItem(string id) {
    lock (_gate) {
      if (!_menu_items.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown MenuItem id: " + id);
      }
      Console.WriteLine("[FoodDeliveryService.GetMenuItem] found " + id);
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
      Console.WriteLine("[FoodDeliveryService.CreateOrder] stored " + id);
      return obj;
    }
  }

  public Order GetOrder(string id) {
    lock (_gate) {
      if (!_orders.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Order id: " + id);
      }
      Console.WriteLine("[FoodDeliveryService.GetOrder] found " + id);
      return obj;
    }
  }

  public OrderItem CreateOrderItem(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("OrderItem name required");
    }
    lock (_gate) {
      var id = string.Format("ORD-{0:D4}", _seq++);
      var obj = new OrderItem(id, name.Trim());
      obj.Validate();
      _order_items[id] = obj;
      Console.WriteLine("[FoodDeliveryService.CreateOrderItem] stored " + id);
      return obj;
    }
  }

  public OrderItem GetOrderItem(string id) {
    lock (_gate) {
      if (!_order_items.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown OrderItem id: " + id);
      }
      Console.WriteLine("[FoodDeliveryService.GetOrderItem] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[FoodDeliveryService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct FoodDeliveryService ==========");
    var system = new FoodDeliveryService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateRestaurant("sample-restaurant");
    system.CreateMenuItem("sample-menu_item");
    system.CreateOrder("sample-order");
    system.CreateOrderItem("sample-order_item");
    system.CloseUser(first.Id);
    try {
      system.CloseUser(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetUser("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const foodDeliverySolution: ProblemSolution = {
  slug: 'food-delivery',
  title: 'Food Delivery App - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a food delivery platform like Zomato or Swiggy — users order food from restaurants and get real-time delivery tracking. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Users browse restaurants filtered by cuisine, rating, and delivery time',
      'Add items to cart and place orders',
      'Real-time order status: placed → accepted → preparing → picked up → delivered',
      'Delivery agent assigned automatically based on proximity',
      'Live tracking of delivery agent on a map',
      'Rating and review system for restaurants and agents',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Users browse restaurants filtered by cuisine, rating, and delivery time?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Add items to cart and place orders?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Real-time order status: placed → accepted → preparing → picked up → delivered?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Delivery agent assigned automatically based on proximity?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Live tracking of delivery agent on a map?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. FoodDeliveryService is the facade stereotype. User, Restaurant, MenuItem, Order, OrderItem are concrete domain classes with id/name/status and validate/close.',
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
          'Construct FoodDeliveryService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'FoodDeliveryService', responsibility: 'UML facade - orchestrates Food Delivery App.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Restaurant', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'MenuItem', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Order', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OrderItem', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from FoodDeliveryService to User, Restaurant, MenuItem, Order, OrderItem. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on FoodDeliveryService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'FoodDeliveryService', responsibility: 'UML facade - orchestrates Food Delivery App.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Restaurant', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'MenuItem', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Order', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OrderItem', responsibility: 'UML class - domain object for Food Delivery App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'FoodDeliveryService exposes create/get/close and owns composed collections.' },
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
      'main constructs FoodDeliveryService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct FoodDeliveryService.',
      'createUser for alpha and beta.',
      'create remaining UML classes.',
      'closeUser(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createUser("alpha..."); closeUser(id)',
        output: '[User.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeUser(alreadyClosed) or getUser("MISSING-ID")',
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
