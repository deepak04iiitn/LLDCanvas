import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'RestaurantPosKitchenDisplayService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_orders', 'Map<string, Order>'),
    attr('-', '_order_items', 'Map<string, OrderItem>'),
    attr('-', '_stations', 'Map<string, Station>'),
    attr('-', '_kitchen_displaies', 'Map<string, KitchenDisplay>'),
    attr('-', '_bills', 'Map<string, Bill>'),
  ], [
    method('+', 'createOrder', 'name: string', 'Order'),
    method('+', 'createOrderItem', 'name: string', 'OrderItem'),
    method('+', 'createStation', 'name: string', 'Station'),
    method('+', 'createKitchenDisplay', 'name: string', 'KitchenDisplay'),
    method('+', 'createBill', 'name: string', 'Bill'),
    method('+', 'getOrder', 'id: string', 'Order'),
    method('+', 'getOrderItem', 'id: string', 'OrderItem'),
    method('+', 'getStation', 'id: string', 'Station'),
    method('+', 'getKitchenDisplay', 'id: string', 'KitchenDisplay'),
    method('+', 'getBill', 'id: string', 'Bill'),
    method('+', 'closeOrder', 'id: string', 'Order'),
  ], 'facade'),
  cls('n1', 'Order', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'OrderItem', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Station', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'KitchenDisplay', GRID.x(1), GRID.y(1), [
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
log = logging.getLogger("restaurant-pos-kitchen-display")


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


class Station:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Station.id is required")
        if not name or not name.strip():
            raise ValueError("Station.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Station.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Station {self.id} has invalid status={self.status}")
        log.info("[Station.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Station {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Station.close] id=%s -> CLOSED", self.id)


class KitchenDisplay:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("KitchenDisplay.id is required")
        if not name or not name.strip():
            raise ValueError("KitchenDisplay.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[KitchenDisplay.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"KitchenDisplay {self.id} has invalid status={self.status}")
        log.info("[KitchenDisplay.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"KitchenDisplay {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[KitchenDisplay.close] id=%s -> CLOSED", self.id)


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


class RestaurantPosKitchenDisplayService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._orders: Dict[str, Order] = {}
        self._order_items: Dict[str, OrderItem] = {}
        self._stations: Dict[str, Station] = {}
        self._kitchen_displaies: Dict[str, KitchenDisplay] = {}
        self._bills: Dict[str, Bill] = {}
        log.info("[RestaurantPosKitchenDisplayService.__init__] system ready; managing: Order, OrderItem, Station, KitchenDisplay, Bill")

    def create_order(self, name: str) -> Order:
        """UML: RestaurantPosKitchenDisplayService.create_order(name) -> Order"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Order name is required")
        with self._lock:
            item_id = f"ORD-{self._seq:04d}"
            self._seq += 1
            obj = Order(item_id, cleaned)
            obj.validate()
            self._orders[item_id] = obj
            log.info("[RestaurantPosKitchenDisplayService.create_order] stored %s in _orders (count=%s)", item_id, len(self._orders))
            return obj

    def get_order(self, item_id: str) -> Order:
        with self._lock:
            obj = self._orders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Order id: {item_id}")
            log.info("[RestaurantPosKitchenDisplayService.get_order] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_order_item(self, name: str) -> OrderItem:
        """UML: RestaurantPosKitchenDisplayService.create_order_item(name) -> OrderItem"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("OrderItem name is required")
        with self._lock:
            item_id = f"ORD-{self._seq:04d}"
            self._seq += 1
            obj = OrderItem(item_id, cleaned)
            obj.validate()
            self._order_items[item_id] = obj
            log.info("[RestaurantPosKitchenDisplayService.create_order_item] stored %s in _order_items (count=%s)", item_id, len(self._order_items))
            return obj

    def get_order_item(self, item_id: str) -> OrderItem:
        with self._lock:
            obj = self._order_items.get(item_id)
            if obj is None:
                raise KeyError(f"unknown OrderItem id: {item_id}")
            log.info("[RestaurantPosKitchenDisplayService.get_order_item] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_station(self, name: str) -> Station:
        """UML: RestaurantPosKitchenDisplayService.create_station(name) -> Station"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Station name is required")
        with self._lock:
            item_id = f"STA-{self._seq:04d}"
            self._seq += 1
            obj = Station(item_id, cleaned)
            obj.validate()
            self._stations[item_id] = obj
            log.info("[RestaurantPosKitchenDisplayService.create_station] stored %s in _stations (count=%s)", item_id, len(self._stations))
            return obj

    def get_station(self, item_id: str) -> Station:
        with self._lock:
            obj = self._stations.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Station id: {item_id}")
            log.info("[RestaurantPosKitchenDisplayService.get_station] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_kitchen_display(self, name: str) -> KitchenDisplay:
        """UML: RestaurantPosKitchenDisplayService.create_kitchen_display(name) -> KitchenDisplay"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("KitchenDisplay name is required")
        with self._lock:
            item_id = f"KIT-{self._seq:04d}"
            self._seq += 1
            obj = KitchenDisplay(item_id, cleaned)
            obj.validate()
            self._kitchen_displaies[item_id] = obj
            log.info("[RestaurantPosKitchenDisplayService.create_kitchen_display] stored %s in _kitchen_displaies (count=%s)", item_id, len(self._kitchen_displaies))
            return obj

    def get_kitchen_display(self, item_id: str) -> KitchenDisplay:
        with self._lock:
            obj = self._kitchen_displaies.get(item_id)
            if obj is None:
                raise KeyError(f"unknown KitchenDisplay id: {item_id}")
            log.info("[RestaurantPosKitchenDisplayService.get_kitchen_display] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_bill(self, name: str) -> Bill:
        """UML: RestaurantPosKitchenDisplayService.create_bill(name) -> Bill"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Bill name is required")
        with self._lock:
            item_id = f"BIL-{self._seq:04d}"
            self._seq += 1
            obj = Bill(item_id, cleaned)
            obj.validate()
            self._bills[item_id] = obj
            log.info("[RestaurantPosKitchenDisplayService.create_bill] stored %s in _bills (count=%s)", item_id, len(self._bills))
            return obj

    def get_bill(self, item_id: str) -> Bill:
        with self._lock:
            obj = self._bills.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Bill id: {item_id}")
            log.info("[RestaurantPosKitchenDisplayService.get_bill] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_order(self, item_id: str) -> Order:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._orders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Order id: {item_id}")
            log.info("[RestaurantPosKitchenDisplayService.close_order] closing %s via Order.close()", item_id)
            obj.close()
            return obj

    def list_active_orders(self) -> List[Order]:
        with self._lock:
            active = [o for o in self._orders.values() if o.status == "ACTIVE"]
            log.info("[RestaurantPosKitchenDisplayService.list_active_orders] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct RestaurantPosKitchenDisplayService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = RestaurantPosKitchenDisplayService()

    log.info("========== STEP 2: Create primary Order objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_order("alpha-order")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_order("beta-order")

    log.info("========== STEP 3: Create OrderItem (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_order_item("sample-order_item")

    log.info("========== STEP 4: Create Station (UML class) ==========")
    system.create_station("sample-station")

    log.info("========== STEP 5: Create KitchenDisplay (UML class) ==========")
    system.create_kitchen_display("sample-kitchen_display")

    log.info("========== STEP 6: Create Bill (UML class) ==========")
    system.create_bill("sample-bill")

    log.info("========== STEP 7: Inspect active Order list ==========")
    system.list_active_orders()

    log.info("========== STEP 8: Close first Order ==========")
    system.close_order(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_order(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Order.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_order("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_order: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_orders()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

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


class Station {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Station(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Station.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Station.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Station.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Station " + id + " invalid status");
    }
    System.out.println("[Station.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Station " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Station.close] id=" + id + " -> CLOSED");
  }
}


class KitchenDisplay {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  KitchenDisplay(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("KitchenDisplay.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("KitchenDisplay.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[KitchenDisplay.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("KitchenDisplay " + id + " invalid status");
    }
    System.out.println("[KitchenDisplay.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("KitchenDisplay " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[KitchenDisplay.close] id=" + id + " -> CLOSED");
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

public class RestaurantPosKitchenDisplayService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Order> orders = new LinkedHashMap<>();
  private final Map<String, OrderItem> order_items = new LinkedHashMap<>();
  private final Map<String, Station> stations = new LinkedHashMap<>();
  private final Map<String, KitchenDisplay> kitchen_displaies = new LinkedHashMap<>();
  private final Map<String, Bill> bills = new LinkedHashMap<>();

  public RestaurantPosKitchenDisplayService() {
    System.out.println("[RestaurantPosKitchenDisplayService.__init__] system ready");
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
      System.out.println("[RestaurantPosKitchenDisplayService.createOrder] stored " + id + " count=" + orders.size());
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
      System.out.println("[RestaurantPosKitchenDisplayService.getOrder] found id=" + obj.getId());
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
      System.out.println("[RestaurantPosKitchenDisplayService.createOrderItem] stored " + id + " count=" + order_items.size());
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
      System.out.println("[RestaurantPosKitchenDisplayService.getOrderItem] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Station createStation(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Station name required");
    }
    lock.lock();
    try {
      String id = String.format("STA-%04d", seq++);
      Station obj = new Station(id, name.trim());
      obj.validate();
      stations.put(id, obj);
      System.out.println("[RestaurantPosKitchenDisplayService.createStation] stored " + id + " count=" + stations.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Station getStation(String id) {
    lock.lock();
    try {
      Station obj = stations.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Station id: " + id);
      }
      System.out.println("[RestaurantPosKitchenDisplayService.getStation] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public KitchenDisplay createKitchenDisplay(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("KitchenDisplay name required");
    }
    lock.lock();
    try {
      String id = String.format("KIT-%04d", seq++);
      KitchenDisplay obj = new KitchenDisplay(id, name.trim());
      obj.validate();
      kitchen_displaies.put(id, obj);
      System.out.println("[RestaurantPosKitchenDisplayService.createKitchenDisplay] stored " + id + " count=" + kitchen_displaies.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public KitchenDisplay getKitchenDisplay(String id) {
    lock.lock();
    try {
      KitchenDisplay obj = kitchen_displaies.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown KitchenDisplay id: " + id);
      }
      System.out.println("[RestaurantPosKitchenDisplayService.getKitchenDisplay] found id=" + obj.getId());
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
      System.out.println("[RestaurantPosKitchenDisplayService.createBill] stored " + id + " count=" + bills.size());
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
      System.out.println("[RestaurantPosKitchenDisplayService.getBill] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Order closeOrder(String id) {
    lock.lock();
    try {
      Order obj = orders.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Order id: " + id);
      }
      System.out.println("[RestaurantPosKitchenDisplayService.closeOrder] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Order> listActiveOrders() {
    lock.lock();
    try {
      List<Order> out = new ArrayList<>();
      for (Order o : orders.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[RestaurantPosKitchenDisplayService.listActiveOrders] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct RestaurantPosKitchenDisplayService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    RestaurantPosKitchenDisplayService system = new RestaurantPosKitchenDisplayService();
    System.out.println("========== STEP 2: Create Order objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Order first = system.createOrder("alpha-order");
    system.createOrder("beta-order");
    System.out.println("========== STEP 3: Create OrderItem ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createOrderItem("sample-order_item");
    System.out.println("========== STEP 4: Create Station ==========");
    system.createStation("sample-station");
    System.out.println("========== STEP 5: Create KitchenDisplay ==========");
    system.createKitchenDisplay("sample-kitchen_display");
    System.out.println("========== STEP 6: Create Bill ==========");
    system.createBill("sample-bill");
    System.out.println("========== Inspect active list ==========");
    system.listActiveOrders();
    System.out.println("========== Close first Order ==========");
    system.closeOrder(first.getId());
    try {
      system.closeOrder(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getOrder("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
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


class Station {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Station.id required')
    }

    if (!name?.trim()) {
      throw new Error('Station.name required')
    }
    console.log(\`[Station.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Station \${this.id} invalid status\`)
    }
    console.log(\`[Station.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Station \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Station.close] id=\${this.id} -> CLOSED\`)
  }
}


class KitchenDisplay {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('KitchenDisplay.id required')
    }

    if (!name?.trim()) {
      throw new Error('KitchenDisplay.name required')
    }
    console.log(\`[KitchenDisplay.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`KitchenDisplay \${this.id} invalid status\`)
    }
    console.log(\`[KitchenDisplay.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`KitchenDisplay \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[KitchenDisplay.close] id=\${this.id} -> CLOSED\`)
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

class RestaurantPosKitchenDisplayService {
  private seq = 1
  private orders = new Map<string, Order>()
  private order_items = new Map<string, OrderItem>()
  private stations = new Map<string, Station>()
  private kitchen_displaies = new Map<string, KitchenDisplay>()
  private bills = new Map<string, Bill>()
  constructor() {
    console.log('[RestaurantPosKitchenDisplayService.__init__] system ready')
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
    console.log(\`[RestaurantPosKitchenDisplayService.createOrder] stored \${id} count=\${this.orders.size}\`)
    return obj
  }

  getOrder(id: string): Order {
    const obj = this.orders.get(id)
    if (!obj) {
      throw new Error(\`unknown Order id: \${id}\`)
    }
    console.log(\`[RestaurantPosKitchenDisplayService.getOrder] found id=\${obj.id}\`)
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
    console.log(\`[RestaurantPosKitchenDisplayService.createOrderItem] stored \${id} count=\${this.order_items.size}\`)
    return obj
  }

  getOrderItem(id: string): OrderItem {
    const obj = this.order_items.get(id)
    if (!obj) {
      throw new Error(\`unknown OrderItem id: \${id}\`)
    }
    console.log(\`[RestaurantPosKitchenDisplayService.getOrderItem] found id=\${obj.id}\`)
    return obj
  }

  createStation(name: string): Station {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Station name required')
    }
    const id = \`STA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Station(id, cleaned)
    obj.validate()
    this.stations.set(id, obj)
    console.log(\`[RestaurantPosKitchenDisplayService.createStation] stored \${id} count=\${this.stations.size}\`)
    return obj
  }

  getStation(id: string): Station {
    const obj = this.stations.get(id)
    if (!obj) {
      throw new Error(\`unknown Station id: \${id}\`)
    }
    console.log(\`[RestaurantPosKitchenDisplayService.getStation] found id=\${obj.id}\`)
    return obj
  }

  createKitchenDisplay(name: string): KitchenDisplay {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('KitchenDisplay name required')
    }
    const id = \`KIT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new KitchenDisplay(id, cleaned)
    obj.validate()
    this.kitchen_displaies.set(id, obj)
    console.log(\`[RestaurantPosKitchenDisplayService.createKitchenDisplay] stored \${id} count=\${this.kitchen_displaies.size}\`)
    return obj
  }

  getKitchenDisplay(id: string): KitchenDisplay {
    const obj = this.kitchen_displaies.get(id)
    if (!obj) {
      throw new Error(\`unknown KitchenDisplay id: \${id}\`)
    }
    console.log(\`[RestaurantPosKitchenDisplayService.getKitchenDisplay] found id=\${obj.id}\`)
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
    console.log(\`[RestaurantPosKitchenDisplayService.createBill] stored \${id} count=\${this.bills.size}\`)
    return obj
  }

  getBill(id: string): Bill {
    const obj = this.bills.get(id)
    if (!obj) {
      throw new Error(\`unknown Bill id: \${id}\`)
    }
    console.log(\`[RestaurantPosKitchenDisplayService.getBill] found id=\${obj.id}\`)
    return obj
  }

  closeOrder(id: string): Order {
    const obj = this.getOrder(id)
    console.log(\`[RestaurantPosKitchenDisplayService.closeOrder] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveOrders(): Order[] {
    const active = [...this.orders.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[RestaurantPosKitchenDisplayService.listActiveOrders] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct RestaurantPosKitchenDisplayService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new RestaurantPosKitchenDisplayService()
  console.log('========== STEP 2: Create Order objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createOrder('alpha-order')
  system.createOrder('beta-order')
  console.log('========== STEP 3: Create OrderItem ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createOrderItem('sample-order_item')
  console.log('========== STEP 4: Create Station ==========')
  system.createStation('sample-station')
  console.log('========== STEP 5: Create KitchenDisplay ==========')
  system.createKitchenDisplay('sample-kitchen_display')
  console.log('========== STEP 6: Create Bill ==========')
  system.createBill('sample-bill')
  system.listActiveOrders()
  console.log('========== Close first Order ==========')
  system.closeOrder(first.id)
  try {
    system.closeOrder(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getOrder('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

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


class Station {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Station(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Station requires id and name");
    }
    cout << "[Station.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Station invalid status");
    }
    cout << "[Station.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Station cannot close");
    }
    status_ = "CLOSED";
    cout << "[Station.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class KitchenDisplay {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  KitchenDisplay(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("KitchenDisplay requires id and name");
    }
    cout << "[KitchenDisplay.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("KitchenDisplay invalid status");
    }
    cout << "[KitchenDisplay.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("KitchenDisplay cannot close");
    }
    status_ = "CLOSED";
    cout << "[KitchenDisplay.close] id=" << id_ << " -> CLOSED" << endl;
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

class RestaurantPosKitchenDisplayService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Order> orders_;
  unordered_map<string, OrderItem> order_items_;
  unordered_map<string, Station> stations_;
  unordered_map<string, KitchenDisplay> kitchen_displaies_;
  unordered_map<string, Bill> bills_;
public:
  RestaurantPosKitchenDisplayService() {
    cout << "[RestaurantPosKitchenDisplayService.__init__] system ready" << endl;
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
    cout << "[RestaurantPosKitchenDisplayService.createOrder] stored " << obj.id() << endl;
    return obj;
  }

  Order getOrder(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = orders_.find(id);
    if (it == orders_.end()) {
      throw out_of_range("unknown Order id");
    }
    cout << "[RestaurantPosKitchenDisplayService.getOrder] found " << id << endl;
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
    cout << "[RestaurantPosKitchenDisplayService.createOrderItem] stored " << obj.id() << endl;
    return obj;
  }

  OrderItem getOrderItem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = order_items_.find(id);
    if (it == order_items_.end()) {
      throw out_of_range("unknown OrderItem id");
    }
    cout << "[RestaurantPosKitchenDisplayService.getOrderItem] found " << id << endl;
    return it->second;
  }

  Station createStation(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Station name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "STA-%04d", seq_++);
    Station obj{buf, name};
    obj.validate();
    stations_.emplace(obj.id(), obj);
    cout << "[RestaurantPosKitchenDisplayService.createStation] stored " << obj.id() << endl;
    return obj;
  }

  Station getStation(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = stations_.find(id);
    if (it == stations_.end()) {
      throw out_of_range("unknown Station id");
    }
    cout << "[RestaurantPosKitchenDisplayService.getStation] found " << id << endl;
    return it->second;
  }

  KitchenDisplay createKitchenDisplay(const string& name) {
    if (name.empty()) {
      throw invalid_argument("KitchenDisplay name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "KIT-%04d", seq_++);
    KitchenDisplay obj{buf, name};
    obj.validate();
    kitchen_displaies_.emplace(obj.id(), obj);
    cout << "[RestaurantPosKitchenDisplayService.createKitchenDisplay] stored " << obj.id() << endl;
    return obj;
  }

  KitchenDisplay getKitchenDisplay(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = kitchen_displaies_.find(id);
    if (it == kitchen_displaies_.end()) {
      throw out_of_range("unknown KitchenDisplay id");
    }
    cout << "[RestaurantPosKitchenDisplayService.getKitchenDisplay] found " << id << endl;
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
    cout << "[RestaurantPosKitchenDisplayService.createBill] stored " << obj.id() << endl;
    return obj;
  }

  Bill getBill(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = bills_.find(id);
    if (it == bills_.end()) {
      throw out_of_range("unknown Bill id");
    }
    cout << "[RestaurantPosKitchenDisplayService.getBill] found " << id << endl;
    return it->second;
  }

  Order closeOrder(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = orders_.find(id);
    if (it == orders_.end()) {
      throw out_of_range("unknown Order");
    }
    cout << "[RestaurantPosKitchenDisplayService.closeOrder] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct RestaurantPosKitchenDisplayService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  RestaurantPosKitchenDisplayService system;
  cout << "========== STEP 2: Create Order ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createOrder("alpha-order");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createOrder("beta-order");
  system.createOrderItem("sample-order_item");
  system.createStation("sample-station");
  system.createKitchenDisplay("sample-kitchen_display");
  system.createBill("sample-bill");
  system.closeOrder(first.id());
  try {
    system.closeOrder(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getOrder("MISSING-ID");
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


type Station struct {
  ID     string
  Name   string
  Status string
}

func NewStation(id, name string) (*Station, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Station requires id and name")
  }
  obj := &Station{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Station.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Station) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Station invalid status")
  }
  fmt.Printf("[Station.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Station) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Station %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Station.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type KitchenDisplay struct {
  ID     string
  Name   string
  Status string
}

func NewKitchenDisplay(id, name string) (*KitchenDisplay, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("KitchenDisplay requires id and name")
  }
  obj := &KitchenDisplay{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[KitchenDisplay.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *KitchenDisplay) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("KitchenDisplay invalid status")
  }
  fmt.Printf("[KitchenDisplay.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *KitchenDisplay) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("KitchenDisplay %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[KitchenDisplay.close] id=%s -> CLOSED\\n", o.ID)
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

type RestaurantPosKitchenDisplayService struct {
  mu  sync.Mutex
  seq int
  orders map[string]*Order
  order_items map[string]*OrderItem
  stations map[string]*Station
  kitchen_displaies map[string]*KitchenDisplay
  bills map[string]*Bill
}

func NewRestaurantPosKitchenDisplayService() *RestaurantPosKitchenDisplayService {
  fmt.Println("[RestaurantPosKitchenDisplayService.__init__] system ready")
  return &RestaurantPosKitchenDisplayService{
    seq: 1,
    orders: map[string]*Order{},
    order_items: map[string]*OrderItem{},
    stations: map[string]*Station{},
    kitchen_displaies: map[string]*KitchenDisplay{},
    bills: map[string]*Bill{},
  }
}

func (s *RestaurantPosKitchenDisplayService) CreateOrder(name string) (*Order, error) {
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
  fmt.Printf("[RestaurantPosKitchenDisplayService.CreateOrder] stored %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) GetOrder(id string) (*Order, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.orders[id]
  if !ok {
    return nil, fmt.Errorf("unknown Order id: %s", id)
  }
  fmt.Printf("[RestaurantPosKitchenDisplayService.GetOrder] found %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) CreateOrderItem(name string) (*OrderItem, error) {
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
  fmt.Printf("[RestaurantPosKitchenDisplayService.CreateOrderItem] stored %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) GetOrderItem(id string) (*OrderItem, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.order_items[id]
  if !ok {
    return nil, fmt.Errorf("unknown OrderItem id: %s", id)
  }
  fmt.Printf("[RestaurantPosKitchenDisplayService.GetOrderItem] found %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) CreateStation(name string) (*Station, error) {
  if name == "" {
    return nil, fmt.Errorf("Station name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("STA-%04d", s.seq)
  s.seq++
  obj, err := NewStation(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.stations[id] = obj
  fmt.Printf("[RestaurantPosKitchenDisplayService.CreateStation] stored %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) GetStation(id string) (*Station, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.stations[id]
  if !ok {
    return nil, fmt.Errorf("unknown Station id: %s", id)
  }
  fmt.Printf("[RestaurantPosKitchenDisplayService.GetStation] found %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) CreateKitchenDisplay(name string) (*KitchenDisplay, error) {
  if name == "" {
    return nil, fmt.Errorf("KitchenDisplay name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("KIT-%04d", s.seq)
  s.seq++
  obj, err := NewKitchenDisplay(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.kitchen_displaies[id] = obj
  fmt.Printf("[RestaurantPosKitchenDisplayService.CreateKitchenDisplay] stored %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) GetKitchenDisplay(id string) (*KitchenDisplay, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.kitchen_displaies[id]
  if !ok {
    return nil, fmt.Errorf("unknown KitchenDisplay id: %s", id)
  }
  fmt.Printf("[RestaurantPosKitchenDisplayService.GetKitchenDisplay] found %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) CreateBill(name string) (*Bill, error) {
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
  fmt.Printf("[RestaurantPosKitchenDisplayService.CreateBill] stored %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) GetBill(id string) (*Bill, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.bills[id]
  if !ok {
    return nil, fmt.Errorf("unknown Bill id: %s", id)
  }
  fmt.Printf("[RestaurantPosKitchenDisplayService.GetBill] found %s\\n", id)
  return obj, nil
}

func (s *RestaurantPosKitchenDisplayService) CloseOrder(id string) (*Order, error) {
  obj, err := s.GetOrder(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[RestaurantPosKitchenDisplayService.CloseOrder] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct RestaurantPosKitchenDisplayService ==========")
  system := NewRestaurantPosKitchenDisplayService()
  fmt.Println("========== STEP 2: Create Order ==========")
  first, _ := system.CreateOrder("alpha-order")
  system.CreateOrder("beta-order")
  system.CreateOrderItem("sample-order_item")
  system.CreateStation("sample-station")
  system.CreateKitchenDisplay("sample-kitchen_display")
  system.CreateBill("sample-bill")
  system.CloseOrder(first.ID)
  if _, err := system.CloseOrder(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetOrder("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

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


sealed class Station {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Station(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Station requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Station.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Station invalid status");
    }
    Console.WriteLine("[Station.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Station " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Station.close] id=" + Id + " -> CLOSED");
  }
}


sealed class KitchenDisplay {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public KitchenDisplay(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("KitchenDisplay requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[KitchenDisplay.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("KitchenDisplay invalid status");
    }
    Console.WriteLine("[KitchenDisplay.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("KitchenDisplay " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[KitchenDisplay.close] id=" + Id + " -> CLOSED");
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

sealed class RestaurantPosKitchenDisplayService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Order> _orders = new();
  private readonly Dictionary<string, OrderItem> _order_items = new();
  private readonly Dictionary<string, Station> _stations = new();
  private readonly Dictionary<string, KitchenDisplay> _kitchen_displaies = new();
  private readonly Dictionary<string, Bill> _bills = new();
  public RestaurantPosKitchenDisplayService() {
    Console.WriteLine("[RestaurantPosKitchenDisplayService.__init__] system ready");
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
      Console.WriteLine("[RestaurantPosKitchenDisplayService.CreateOrder] stored " + id);
      return obj;
    }
  }

  public Order GetOrder(string id) {
    lock (_gate) {
      if (!_orders.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Order id: " + id);
      }
      Console.WriteLine("[RestaurantPosKitchenDisplayService.GetOrder] found " + id);
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
      Console.WriteLine("[RestaurantPosKitchenDisplayService.CreateOrderItem] stored " + id);
      return obj;
    }
  }

  public OrderItem GetOrderItem(string id) {
    lock (_gate) {
      if (!_order_items.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown OrderItem id: " + id);
      }
      Console.WriteLine("[RestaurantPosKitchenDisplayService.GetOrderItem] found " + id);
      return obj;
    }
  }

  public Station CreateStation(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Station name required");
    }
    lock (_gate) {
      var id = string.Format("STA-{0:D4}", _seq++);
      var obj = new Station(id, name.Trim());
      obj.Validate();
      _stations[id] = obj;
      Console.WriteLine("[RestaurantPosKitchenDisplayService.CreateStation] stored " + id);
      return obj;
    }
  }

  public Station GetStation(string id) {
    lock (_gate) {
      if (!_stations.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Station id: " + id);
      }
      Console.WriteLine("[RestaurantPosKitchenDisplayService.GetStation] found " + id);
      return obj;
    }
  }

  public KitchenDisplay CreateKitchenDisplay(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("KitchenDisplay name required");
    }
    lock (_gate) {
      var id = string.Format("KIT-{0:D4}", _seq++);
      var obj = new KitchenDisplay(id, name.Trim());
      obj.Validate();
      _kitchen_displaies[id] = obj;
      Console.WriteLine("[RestaurantPosKitchenDisplayService.CreateKitchenDisplay] stored " + id);
      return obj;
    }
  }

  public KitchenDisplay GetKitchenDisplay(string id) {
    lock (_gate) {
      if (!_kitchen_displaies.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown KitchenDisplay id: " + id);
      }
      Console.WriteLine("[RestaurantPosKitchenDisplayService.GetKitchenDisplay] found " + id);
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
      Console.WriteLine("[RestaurantPosKitchenDisplayService.CreateBill] stored " + id);
      return obj;
    }
  }

  public Bill GetBill(string id) {
    lock (_gate) {
      if (!_bills.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Bill id: " + id);
      }
      Console.WriteLine("[RestaurantPosKitchenDisplayService.GetBill] found " + id);
      return obj;
    }
  }

  public Order CloseOrder(string id) {
    var obj = GetOrder(id);
    Console.WriteLine("[RestaurantPosKitchenDisplayService.CloseOrder] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct RestaurantPosKitchenDisplayService ==========");
    var system = new RestaurantPosKitchenDisplayService();
    Console.WriteLine("========== STEP 2: Create Order ==========");
    var first = system.CreateOrder("alpha-order");
    system.CreateOrder("beta-order");
    system.CreateOrderItem("sample-order_item");
    system.CreateStation("sample-station");
    system.CreateKitchenDisplay("sample-kitchen_display");
    system.CreateBill("sample-bill");
    system.CloseOrder(first.Id);
    try {
      system.CloseOrder(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetOrder("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const restaurantPosKitchenDisplaySolution: ProblemSolution = {
  slug: 'restaurant-pos-kitchen-display',
  title: 'Restaurant POS & Kitchen Display System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a point-of-sale system for restaurants that routes orders to the kitchen display and tracks preparation status. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Take an order with multiple items from a table or online',
      'Route order items to the correct kitchen station (grill, salad, dessert)',
      'Update item status: queued, preparing, ready, served',
      'Split a bill across multiple payers',
      'Apply modifiers to items (no onions, extra cheese)',
      'Show real-time order status on a kitchen display screen',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Take an order with multiple items from a table or online?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Route order items to the correct kitchen station (grill, salad, dessert)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Update item status: queued, preparing, ready, served?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Split a bill across multiple payers?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Apply modifiers to items (no onions, extra cheese)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. RestaurantPosKitchenDisplayService is the facade stereotype. Order, OrderItem, Station, KitchenDisplay, Bill are concrete domain classes with id/name/status and validate/close.',
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
          'Construct RestaurantPosKitchenDisplayService.',
          'createOrder twice and create the related UML classes.',
          'closeOrder once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'RestaurantPosKitchenDisplayService', responsibility: 'UML facade - orchestrates Restaurant POS & Kitchen Display System.', keyMembers: ['create*', 'get*', 'closeOrder'] },
    { name: 'Order', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OrderItem', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Station', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'KitchenDisplay', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Bill', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from RestaurantPosKitchenDisplayService to Order, OrderItem, Station, KitchenDisplay, Bill. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on RestaurantPosKitchenDisplayService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'RestaurantPosKitchenDisplayService', responsibility: 'UML facade - orchestrates Restaurant POS & Kitchen Display System.', keyMembers: ['create*', 'get*', 'closeOrder'] },
    { name: 'Order', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OrderItem', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Station', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'KitchenDisplay', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Bill', responsibility: 'UML class - domain object for Restaurant POS & Kitchen Display System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'RestaurantPosKitchenDisplayService exposes create/get/close and owns composed collections.' },
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
      'main constructs RestaurantPosKitchenDisplayService, creates UML domain objects, closes the primary Order, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct RestaurantPosKitchenDisplayService.',
      'createOrder for alpha and beta.',
      'create remaining UML classes.',
      'closeOrder(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createOrder("alpha..."); closeOrder(id)',
        output: '[Order.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeOrder(alreadyClosed) or getOrder("MISSING-ID")',
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
