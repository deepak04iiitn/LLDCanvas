import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'OnlineStockBrokerageService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_orders', 'Map<string, Order>'),
    attr('-', '_order_types', 'Map<string, OrderType>'),
    attr('-', '_sides', 'Map<string, Side>'),
    attr('-', '_order_books', 'Map<string, OrderBook>'),
    attr('-', '_trades', 'Map<string, Trade>'),
  ], [
    method('+', 'createOrder', 'name: string', 'Order'),
    method('+', 'createOrderType', 'name: string', 'OrderType'),
    method('+', 'createSide', 'name: string', 'Side'),
    method('+', 'createOrderBook', 'name: string', 'OrderBook'),
    method('+', 'createTrade', 'name: string', 'Trade'),
    method('+', 'getOrder', 'id: string', 'Order'),
    method('+', 'getOrderType', 'id: string', 'OrderType'),
    method('+', 'getSide', 'id: string', 'Side'),
    method('+', 'getOrderBook', 'id: string', 'OrderBook'),
    method('+', 'getTrade', 'id: string', 'Trade'),
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
  cls('n2', 'OrderType', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Side', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'OrderBook', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Trade', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("online-stock-brokerage")


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


class OrderType:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("OrderType.id is required")
        if not name or not name.strip():
            raise ValueError("OrderType.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[OrderType.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"OrderType {self.id} has invalid status={self.status}")
        log.info("[OrderType.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"OrderType {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[OrderType.close] id=%s -> CLOSED", self.id)


class Side:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Side.id is required")
        if not name or not name.strip():
            raise ValueError("Side.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Side.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Side {self.id} has invalid status={self.status}")
        log.info("[Side.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Side {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Side.close] id=%s -> CLOSED", self.id)


class OrderBook:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("OrderBook.id is required")
        if not name or not name.strip():
            raise ValueError("OrderBook.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[OrderBook.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"OrderBook {self.id} has invalid status={self.status}")
        log.info("[OrderBook.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"OrderBook {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[OrderBook.close] id=%s -> CLOSED", self.id)


class Trade:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Trade.id is required")
        if not name or not name.strip():
            raise ValueError("Trade.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Trade.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Trade {self.id} has invalid status={self.status}")
        log.info("[Trade.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Trade {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Trade.close] id=%s -> CLOSED", self.id)


class OnlineStockBrokerageService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._orders: Dict[str, Order] = {}
        self._order_types: Dict[str, OrderType] = {}
        self._sides: Dict[str, Side] = {}
        self._order_books: Dict[str, OrderBook] = {}
        self._trades: Dict[str, Trade] = {}
        log.info("[OnlineStockBrokerageService.__init__] system ready; managing: Order, OrderType, Side, OrderBook, Trade")

    def create_order(self, name: str) -> Order:
        """UML: OnlineStockBrokerageService.create_order(name) -> Order"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Order name is required")
        with self._lock:
            item_id = f"ORD-{self._seq:04d}"
            self._seq += 1
            obj = Order(item_id, cleaned)
            obj.validate()
            self._orders[item_id] = obj
            log.info("[OnlineStockBrokerageService.create_order] stored %s in _orders (count=%s)", item_id, len(self._orders))
            return obj

    def get_order(self, item_id: str) -> Order:
        with self._lock:
            obj = self._orders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Order id: {item_id}")
            log.info("[OnlineStockBrokerageService.get_order] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_order_type(self, name: str) -> OrderType:
        """UML: OnlineStockBrokerageService.create_order_type(name) -> OrderType"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("OrderType name is required")
        with self._lock:
            item_id = f"ORD-{self._seq:04d}"
            self._seq += 1
            obj = OrderType(item_id, cleaned)
            obj.validate()
            self._order_types[item_id] = obj
            log.info("[OnlineStockBrokerageService.create_order_type] stored %s in _order_types (count=%s)", item_id, len(self._order_types))
            return obj

    def get_order_type(self, item_id: str) -> OrderType:
        with self._lock:
            obj = self._order_types.get(item_id)
            if obj is None:
                raise KeyError(f"unknown OrderType id: {item_id}")
            log.info("[OnlineStockBrokerageService.get_order_type] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_side(self, name: str) -> Side:
        """UML: OnlineStockBrokerageService.create_side(name) -> Side"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Side name is required")
        with self._lock:
            item_id = f"SID-{self._seq:04d}"
            self._seq += 1
            obj = Side(item_id, cleaned)
            obj.validate()
            self._sides[item_id] = obj
            log.info("[OnlineStockBrokerageService.create_side] stored %s in _sides (count=%s)", item_id, len(self._sides))
            return obj

    def get_side(self, item_id: str) -> Side:
        with self._lock:
            obj = self._sides.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Side id: {item_id}")
            log.info("[OnlineStockBrokerageService.get_side] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_order_book(self, name: str) -> OrderBook:
        """UML: OnlineStockBrokerageService.create_order_book(name) -> OrderBook"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("OrderBook name is required")
        with self._lock:
            item_id = f"ORD-{self._seq:04d}"
            self._seq += 1
            obj = OrderBook(item_id, cleaned)
            obj.validate()
            self._order_books[item_id] = obj
            log.info("[OnlineStockBrokerageService.create_order_book] stored %s in _order_books (count=%s)", item_id, len(self._order_books))
            return obj

    def get_order_book(self, item_id: str) -> OrderBook:
        with self._lock:
            obj = self._order_books.get(item_id)
            if obj is None:
                raise KeyError(f"unknown OrderBook id: {item_id}")
            log.info("[OnlineStockBrokerageService.get_order_book] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_trade(self, name: str) -> Trade:
        """UML: OnlineStockBrokerageService.create_trade(name) -> Trade"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Trade name is required")
        with self._lock:
            item_id = f"TRA-{self._seq:04d}"
            self._seq += 1
            obj = Trade(item_id, cleaned)
            obj.validate()
            self._trades[item_id] = obj
            log.info("[OnlineStockBrokerageService.create_trade] stored %s in _trades (count=%s)", item_id, len(self._trades))
            return obj

    def get_trade(self, item_id: str) -> Trade:
        with self._lock:
            obj = self._trades.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Trade id: {item_id}")
            log.info("[OnlineStockBrokerageService.get_trade] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_order(self, item_id: str) -> Order:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._orders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Order id: {item_id}")
            log.info("[OnlineStockBrokerageService.close_order] closing %s via Order.close()", item_id)
            obj.close()
            return obj

    def list_active_orders(self) -> List[Order]:
        with self._lock:
            active = [o for o in self._orders.values() if o.status == "ACTIVE"]
            log.info("[OnlineStockBrokerageService.list_active_orders] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct OnlineStockBrokerageService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = OnlineStockBrokerageService()

    log.info("========== STEP 2: Create primary Order objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_order("alpha-order")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_order("beta-order")

    log.info("========== STEP 3: Create OrderType (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_order_type("sample-order_type")

    log.info("========== STEP 4: Create Side (UML class) ==========")
    system.create_side("sample-side")

    log.info("========== STEP 5: Create OrderBook (UML class) ==========")
    system.create_order_book("sample-order_book")

    log.info("========== STEP 6: Create Trade (UML class) ==========")
    system.create_trade("sample-trade")

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


class OrderType {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  OrderType(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("OrderType.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("OrderType.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[OrderType.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("OrderType " + id + " invalid status");
    }
    System.out.println("[OrderType.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("OrderType " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[OrderType.close] id=" + id + " -> CLOSED");
  }
}


class Side {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Side(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Side.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Side.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Side.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Side " + id + " invalid status");
    }
    System.out.println("[Side.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Side " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Side.close] id=" + id + " -> CLOSED");
  }
}


class OrderBook {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  OrderBook(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("OrderBook.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("OrderBook.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[OrderBook.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("OrderBook " + id + " invalid status");
    }
    System.out.println("[OrderBook.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("OrderBook " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[OrderBook.close] id=" + id + " -> CLOSED");
  }
}


class Trade {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Trade(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Trade.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Trade.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Trade.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Trade " + id + " invalid status");
    }
    System.out.println("[Trade.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Trade " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Trade.close] id=" + id + " -> CLOSED");
  }
}

public class OnlineStockBrokerageService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Order> orders = new LinkedHashMap<>();
  private final Map<String, OrderType> order_types = new LinkedHashMap<>();
  private final Map<String, Side> sides = new LinkedHashMap<>();
  private final Map<String, OrderBook> order_books = new LinkedHashMap<>();
  private final Map<String, Trade> trades = new LinkedHashMap<>();

  public OnlineStockBrokerageService() {
    System.out.println("[OnlineStockBrokerageService.__init__] system ready");
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
      System.out.println("[OnlineStockBrokerageService.createOrder] stored " + id + " count=" + orders.size());
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
      System.out.println("[OnlineStockBrokerageService.getOrder] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public OrderType createOrderType(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("OrderType name required");
    }
    lock.lock();
    try {
      String id = String.format("ORD-%04d", seq++);
      OrderType obj = new OrderType(id, name.trim());
      obj.validate();
      order_types.put(id, obj);
      System.out.println("[OnlineStockBrokerageService.createOrderType] stored " + id + " count=" + order_types.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public OrderType getOrderType(String id) {
    lock.lock();
    try {
      OrderType obj = order_types.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown OrderType id: " + id);
      }
      System.out.println("[OnlineStockBrokerageService.getOrderType] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Side createSide(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Side name required");
    }
    lock.lock();
    try {
      String id = String.format("SID-%04d", seq++);
      Side obj = new Side(id, name.trim());
      obj.validate();
      sides.put(id, obj);
      System.out.println("[OnlineStockBrokerageService.createSide] stored " + id + " count=" + sides.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Side getSide(String id) {
    lock.lock();
    try {
      Side obj = sides.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Side id: " + id);
      }
      System.out.println("[OnlineStockBrokerageService.getSide] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public OrderBook createOrderBook(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("OrderBook name required");
    }
    lock.lock();
    try {
      String id = String.format("ORD-%04d", seq++);
      OrderBook obj = new OrderBook(id, name.trim());
      obj.validate();
      order_books.put(id, obj);
      System.out.println("[OnlineStockBrokerageService.createOrderBook] stored " + id + " count=" + order_books.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public OrderBook getOrderBook(String id) {
    lock.lock();
    try {
      OrderBook obj = order_books.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown OrderBook id: " + id);
      }
      System.out.println("[OnlineStockBrokerageService.getOrderBook] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Trade createTrade(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Trade name required");
    }
    lock.lock();
    try {
      String id = String.format("TRA-%04d", seq++);
      Trade obj = new Trade(id, name.trim());
      obj.validate();
      trades.put(id, obj);
      System.out.println("[OnlineStockBrokerageService.createTrade] stored " + id + " count=" + trades.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Trade getTrade(String id) {
    lock.lock();
    try {
      Trade obj = trades.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Trade id: " + id);
      }
      System.out.println("[OnlineStockBrokerageService.getTrade] found id=" + obj.getId());
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
      System.out.println("[OnlineStockBrokerageService.closeOrder] closing " + id);
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
      System.out.println("[OnlineStockBrokerageService.listActiveOrders] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct OnlineStockBrokerageService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    OnlineStockBrokerageService system = new OnlineStockBrokerageService();
    System.out.println("========== STEP 2: Create Order objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Order first = system.createOrder("alpha-order");
    system.createOrder("beta-order");
    System.out.println("========== STEP 3: Create OrderType ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createOrderType("sample-order_type");
    System.out.println("========== STEP 4: Create Side ==========");
    system.createSide("sample-side");
    System.out.println("========== STEP 5: Create OrderBook ==========");
    system.createOrderBook("sample-order_book");
    System.out.println("========== STEP 6: Create Trade ==========");
    system.createTrade("sample-trade");
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


class OrderType {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('OrderType.id required')
    }

    if (!name?.trim()) {
      throw new Error('OrderType.name required')
    }
    console.log(\`[OrderType.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`OrderType \${this.id} invalid status\`)
    }
    console.log(\`[OrderType.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`OrderType \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[OrderType.close] id=\${this.id} -> CLOSED\`)
  }
}


class Side {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Side.id required')
    }

    if (!name?.trim()) {
      throw new Error('Side.name required')
    }
    console.log(\`[Side.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Side \${this.id} invalid status\`)
    }
    console.log(\`[Side.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Side \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Side.close] id=\${this.id} -> CLOSED\`)
  }
}


class OrderBook {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('OrderBook.id required')
    }

    if (!name?.trim()) {
      throw new Error('OrderBook.name required')
    }
    console.log(\`[OrderBook.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`OrderBook \${this.id} invalid status\`)
    }
    console.log(\`[OrderBook.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`OrderBook \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[OrderBook.close] id=\${this.id} -> CLOSED\`)
  }
}


class Trade {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Trade.id required')
    }

    if (!name?.trim()) {
      throw new Error('Trade.name required')
    }
    console.log(\`[Trade.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Trade \${this.id} invalid status\`)
    }
    console.log(\`[Trade.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Trade \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Trade.close] id=\${this.id} -> CLOSED\`)
  }
}

class OnlineStockBrokerageService {
  private seq = 1
  private orders = new Map<string, Order>()
  private order_types = new Map<string, OrderType>()
  private sides = new Map<string, Side>()
  private order_books = new Map<string, OrderBook>()
  private trades = new Map<string, Trade>()
  constructor() {
    console.log('[OnlineStockBrokerageService.__init__] system ready')
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
    console.log(\`[OnlineStockBrokerageService.createOrder] stored \${id} count=\${this.orders.size}\`)
    return obj
  }

  getOrder(id: string): Order {
    const obj = this.orders.get(id)
    if (!obj) {
      throw new Error(\`unknown Order id: \${id}\`)
    }
    console.log(\`[OnlineStockBrokerageService.getOrder] found id=\${obj.id}\`)
    return obj
  }

  createOrderType(name: string): OrderType {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('OrderType name required')
    }
    const id = \`ORD-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new OrderType(id, cleaned)
    obj.validate()
    this.order_types.set(id, obj)
    console.log(\`[OnlineStockBrokerageService.createOrderType] stored \${id} count=\${this.order_types.size}\`)
    return obj
  }

  getOrderType(id: string): OrderType {
    const obj = this.order_types.get(id)
    if (!obj) {
      throw new Error(\`unknown OrderType id: \${id}\`)
    }
    console.log(\`[OnlineStockBrokerageService.getOrderType] found id=\${obj.id}\`)
    return obj
  }

  createSide(name: string): Side {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Side name required')
    }
    const id = \`SID-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Side(id, cleaned)
    obj.validate()
    this.sides.set(id, obj)
    console.log(\`[OnlineStockBrokerageService.createSide] stored \${id} count=\${this.sides.size}\`)
    return obj
  }

  getSide(id: string): Side {
    const obj = this.sides.get(id)
    if (!obj) {
      throw new Error(\`unknown Side id: \${id}\`)
    }
    console.log(\`[OnlineStockBrokerageService.getSide] found id=\${obj.id}\`)
    return obj
  }

  createOrderBook(name: string): OrderBook {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('OrderBook name required')
    }
    const id = \`ORD-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new OrderBook(id, cleaned)
    obj.validate()
    this.order_books.set(id, obj)
    console.log(\`[OnlineStockBrokerageService.createOrderBook] stored \${id} count=\${this.order_books.size}\`)
    return obj
  }

  getOrderBook(id: string): OrderBook {
    const obj = this.order_books.get(id)
    if (!obj) {
      throw new Error(\`unknown OrderBook id: \${id}\`)
    }
    console.log(\`[OnlineStockBrokerageService.getOrderBook] found id=\${obj.id}\`)
    return obj
  }

  createTrade(name: string): Trade {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Trade name required')
    }
    const id = \`TRA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Trade(id, cleaned)
    obj.validate()
    this.trades.set(id, obj)
    console.log(\`[OnlineStockBrokerageService.createTrade] stored \${id} count=\${this.trades.size}\`)
    return obj
  }

  getTrade(id: string): Trade {
    const obj = this.trades.get(id)
    if (!obj) {
      throw new Error(\`unknown Trade id: \${id}\`)
    }
    console.log(\`[OnlineStockBrokerageService.getTrade] found id=\${obj.id}\`)
    return obj
  }

  closeOrder(id: string): Order {
    const obj = this.getOrder(id)
    console.log(\`[OnlineStockBrokerageService.closeOrder] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveOrders(): Order[] {
    const active = [...this.orders.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[OnlineStockBrokerageService.listActiveOrders] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct OnlineStockBrokerageService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new OnlineStockBrokerageService()
  console.log('========== STEP 2: Create Order objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createOrder('alpha-order')
  system.createOrder('beta-order')
  console.log('========== STEP 3: Create OrderType ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createOrderType('sample-order_type')
  console.log('========== STEP 4: Create Side ==========')
  system.createSide('sample-side')
  console.log('========== STEP 5: Create OrderBook ==========')
  system.createOrderBook('sample-order_book')
  console.log('========== STEP 6: Create Trade ==========')
  system.createTrade('sample-trade')
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


class OrderType {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  OrderType(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("OrderType requires id and name");
    }
    cout << "[OrderType.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("OrderType invalid status");
    }
    cout << "[OrderType.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("OrderType cannot close");
    }
    status_ = "CLOSED";
    cout << "[OrderType.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Side {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Side(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Side requires id and name");
    }
    cout << "[Side.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Side invalid status");
    }
    cout << "[Side.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Side cannot close");
    }
    status_ = "CLOSED";
    cout << "[Side.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class OrderBook {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  OrderBook(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("OrderBook requires id and name");
    }
    cout << "[OrderBook.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("OrderBook invalid status");
    }
    cout << "[OrderBook.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("OrderBook cannot close");
    }
    status_ = "CLOSED";
    cout << "[OrderBook.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Trade {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Trade(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Trade requires id and name");
    }
    cout << "[Trade.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Trade invalid status");
    }
    cout << "[Trade.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Trade cannot close");
    }
    status_ = "CLOSED";
    cout << "[Trade.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class OnlineStockBrokerageService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Order> orders_;
  unordered_map<string, OrderType> order_types_;
  unordered_map<string, Side> sides_;
  unordered_map<string, OrderBook> order_books_;
  unordered_map<string, Trade> trades_;
public:
  OnlineStockBrokerageService() {
    cout << "[OnlineStockBrokerageService.__init__] system ready" << endl;
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
    cout << "[OnlineStockBrokerageService.createOrder] stored " << obj.id() << endl;
    return obj;
  }

  Order getOrder(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = orders_.find(id);
    if (it == orders_.end()) {
      throw out_of_range("unknown Order id");
    }
    cout << "[OnlineStockBrokerageService.getOrder] found " << id << endl;
    return it->second;
  }

  OrderType createOrderType(const string& name) {
    if (name.empty()) {
      throw invalid_argument("OrderType name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ORD-%04d", seq_++);
    OrderType obj{buf, name};
    obj.validate();
    order_types_.emplace(obj.id(), obj);
    cout << "[OnlineStockBrokerageService.createOrderType] stored " << obj.id() << endl;
    return obj;
  }

  OrderType getOrderType(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = order_types_.find(id);
    if (it == order_types_.end()) {
      throw out_of_range("unknown OrderType id");
    }
    cout << "[OnlineStockBrokerageService.getOrderType] found " << id << endl;
    return it->second;
  }

  Side createSide(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Side name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SID-%04d", seq_++);
    Side obj{buf, name};
    obj.validate();
    sides_.emplace(obj.id(), obj);
    cout << "[OnlineStockBrokerageService.createSide] stored " << obj.id() << endl;
    return obj;
  }

  Side getSide(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = sides_.find(id);
    if (it == sides_.end()) {
      throw out_of_range("unknown Side id");
    }
    cout << "[OnlineStockBrokerageService.getSide] found " << id << endl;
    return it->second;
  }

  OrderBook createOrderBook(const string& name) {
    if (name.empty()) {
      throw invalid_argument("OrderBook name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ORD-%04d", seq_++);
    OrderBook obj{buf, name};
    obj.validate();
    order_books_.emplace(obj.id(), obj);
    cout << "[OnlineStockBrokerageService.createOrderBook] stored " << obj.id() << endl;
    return obj;
  }

  OrderBook getOrderBook(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = order_books_.find(id);
    if (it == order_books_.end()) {
      throw out_of_range("unknown OrderBook id");
    }
    cout << "[OnlineStockBrokerageService.getOrderBook] found " << id << endl;
    return it->second;
  }

  Trade createTrade(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Trade name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TRA-%04d", seq_++);
    Trade obj{buf, name};
    obj.validate();
    trades_.emplace(obj.id(), obj);
    cout << "[OnlineStockBrokerageService.createTrade] stored " << obj.id() << endl;
    return obj;
  }

  Trade getTrade(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = trades_.find(id);
    if (it == trades_.end()) {
      throw out_of_range("unknown Trade id");
    }
    cout << "[OnlineStockBrokerageService.getTrade] found " << id << endl;
    return it->second;
  }

  Order closeOrder(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = orders_.find(id);
    if (it == orders_.end()) {
      throw out_of_range("unknown Order");
    }
    cout << "[OnlineStockBrokerageService.closeOrder] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct OnlineStockBrokerageService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  OnlineStockBrokerageService system;
  cout << "========== STEP 2: Create Order ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createOrder("alpha-order");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createOrder("beta-order");
  system.createOrderType("sample-order_type");
  system.createSide("sample-side");
  system.createOrderBook("sample-order_book");
  system.createTrade("sample-trade");
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


type OrderType struct {
  ID     string
  Name   string
  Status string
}

func NewOrderType(id, name string) (*OrderType, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("OrderType requires id and name")
  }
  obj := &OrderType{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[OrderType.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *OrderType) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("OrderType invalid status")
  }
  fmt.Printf("[OrderType.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *OrderType) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("OrderType %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[OrderType.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Side struct {
  ID     string
  Name   string
  Status string
}

func NewSide(id, name string) (*Side, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Side requires id and name")
  }
  obj := &Side{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Side.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Side) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Side invalid status")
  }
  fmt.Printf("[Side.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Side) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Side %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Side.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type OrderBook struct {
  ID     string
  Name   string
  Status string
}

func NewOrderBook(id, name string) (*OrderBook, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("OrderBook requires id and name")
  }
  obj := &OrderBook{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[OrderBook.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *OrderBook) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("OrderBook invalid status")
  }
  fmt.Printf("[OrderBook.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *OrderBook) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("OrderBook %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[OrderBook.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Trade struct {
  ID     string
  Name   string
  Status string
}

func NewTrade(id, name string) (*Trade, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Trade requires id and name")
  }
  obj := &Trade{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Trade.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Trade) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Trade invalid status")
  }
  fmt.Printf("[Trade.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Trade) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Trade %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Trade.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type OnlineStockBrokerageService struct {
  mu  sync.Mutex
  seq int
  orders map[string]*Order
  order_types map[string]*OrderType
  sides map[string]*Side
  order_books map[string]*OrderBook
  trades map[string]*Trade
}

func NewOnlineStockBrokerageService() *OnlineStockBrokerageService {
  fmt.Println("[OnlineStockBrokerageService.__init__] system ready")
  return &OnlineStockBrokerageService{
    seq: 1,
    orders: map[string]*Order{},
    order_types: map[string]*OrderType{},
    sides: map[string]*Side{},
    order_books: map[string]*OrderBook{},
    trades: map[string]*Trade{},
  }
}

func (s *OnlineStockBrokerageService) CreateOrder(name string) (*Order, error) {
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
  fmt.Printf("[OnlineStockBrokerageService.CreateOrder] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) GetOrder(id string) (*Order, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.orders[id]
  if !ok {
    return nil, fmt.Errorf("unknown Order id: %s", id)
  }
  fmt.Printf("[OnlineStockBrokerageService.GetOrder] found %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) CreateOrderType(name string) (*OrderType, error) {
  if name == "" {
    return nil, fmt.Errorf("OrderType name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ORD-%04d", s.seq)
  s.seq++
  obj, err := NewOrderType(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.order_types[id] = obj
  fmt.Printf("[OnlineStockBrokerageService.CreateOrderType] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) GetOrderType(id string) (*OrderType, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.order_types[id]
  if !ok {
    return nil, fmt.Errorf("unknown OrderType id: %s", id)
  }
  fmt.Printf("[OnlineStockBrokerageService.GetOrderType] found %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) CreateSide(name string) (*Side, error) {
  if name == "" {
    return nil, fmt.Errorf("Side name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SID-%04d", s.seq)
  s.seq++
  obj, err := NewSide(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.sides[id] = obj
  fmt.Printf("[OnlineStockBrokerageService.CreateSide] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) GetSide(id string) (*Side, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.sides[id]
  if !ok {
    return nil, fmt.Errorf("unknown Side id: %s", id)
  }
  fmt.Printf("[OnlineStockBrokerageService.GetSide] found %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) CreateOrderBook(name string) (*OrderBook, error) {
  if name == "" {
    return nil, fmt.Errorf("OrderBook name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ORD-%04d", s.seq)
  s.seq++
  obj, err := NewOrderBook(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.order_books[id] = obj
  fmt.Printf("[OnlineStockBrokerageService.CreateOrderBook] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) GetOrderBook(id string) (*OrderBook, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.order_books[id]
  if !ok {
    return nil, fmt.Errorf("unknown OrderBook id: %s", id)
  }
  fmt.Printf("[OnlineStockBrokerageService.GetOrderBook] found %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) CreateTrade(name string) (*Trade, error) {
  if name == "" {
    return nil, fmt.Errorf("Trade name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TRA-%04d", s.seq)
  s.seq++
  obj, err := NewTrade(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.trades[id] = obj
  fmt.Printf("[OnlineStockBrokerageService.CreateTrade] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) GetTrade(id string) (*Trade, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.trades[id]
  if !ok {
    return nil, fmt.Errorf("unknown Trade id: %s", id)
  }
  fmt.Printf("[OnlineStockBrokerageService.GetTrade] found %s\\n", id)
  return obj, nil
}

func (s *OnlineStockBrokerageService) CloseOrder(id string) (*Order, error) {
  obj, err := s.GetOrder(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[OnlineStockBrokerageService.CloseOrder] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct OnlineStockBrokerageService ==========")
  system := NewOnlineStockBrokerageService()
  fmt.Println("========== STEP 2: Create Order ==========")
  first, _ := system.CreateOrder("alpha-order")
  system.CreateOrder("beta-order")
  system.CreateOrderType("sample-order_type")
  system.CreateSide("sample-side")
  system.CreateOrderBook("sample-order_book")
  system.CreateTrade("sample-trade")
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


sealed class OrderType {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public OrderType(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("OrderType requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[OrderType.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("OrderType invalid status");
    }
    Console.WriteLine("[OrderType.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("OrderType " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[OrderType.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Side {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Side(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Side requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Side.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Side invalid status");
    }
    Console.WriteLine("[Side.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Side " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Side.close] id=" + Id + " -> CLOSED");
  }
}


sealed class OrderBook {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public OrderBook(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("OrderBook requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[OrderBook.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("OrderBook invalid status");
    }
    Console.WriteLine("[OrderBook.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("OrderBook " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[OrderBook.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Trade {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Trade(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Trade requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Trade.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Trade invalid status");
    }
    Console.WriteLine("[Trade.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Trade " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Trade.close] id=" + Id + " -> CLOSED");
  }
}

sealed class OnlineStockBrokerageService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Order> _orders = new();
  private readonly Dictionary<string, OrderType> _order_types = new();
  private readonly Dictionary<string, Side> _sides = new();
  private readonly Dictionary<string, OrderBook> _order_books = new();
  private readonly Dictionary<string, Trade> _trades = new();
  public OnlineStockBrokerageService() {
    Console.WriteLine("[OnlineStockBrokerageService.__init__] system ready");
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
      Console.WriteLine("[OnlineStockBrokerageService.CreateOrder] stored " + id);
      return obj;
    }
  }

  public Order GetOrder(string id) {
    lock (_gate) {
      if (!_orders.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Order id: " + id);
      }
      Console.WriteLine("[OnlineStockBrokerageService.GetOrder] found " + id);
      return obj;
    }
  }

  public OrderType CreateOrderType(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("OrderType name required");
    }
    lock (_gate) {
      var id = string.Format("ORD-{0:D4}", _seq++);
      var obj = new OrderType(id, name.Trim());
      obj.Validate();
      _order_types[id] = obj;
      Console.WriteLine("[OnlineStockBrokerageService.CreateOrderType] stored " + id);
      return obj;
    }
  }

  public OrderType GetOrderType(string id) {
    lock (_gate) {
      if (!_order_types.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown OrderType id: " + id);
      }
      Console.WriteLine("[OnlineStockBrokerageService.GetOrderType] found " + id);
      return obj;
    }
  }

  public Side CreateSide(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Side name required");
    }
    lock (_gate) {
      var id = string.Format("SID-{0:D4}", _seq++);
      var obj = new Side(id, name.Trim());
      obj.Validate();
      _sides[id] = obj;
      Console.WriteLine("[OnlineStockBrokerageService.CreateSide] stored " + id);
      return obj;
    }
  }

  public Side GetSide(string id) {
    lock (_gate) {
      if (!_sides.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Side id: " + id);
      }
      Console.WriteLine("[OnlineStockBrokerageService.GetSide] found " + id);
      return obj;
    }
  }

  public OrderBook CreateOrderBook(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("OrderBook name required");
    }
    lock (_gate) {
      var id = string.Format("ORD-{0:D4}", _seq++);
      var obj = new OrderBook(id, name.Trim());
      obj.Validate();
      _order_books[id] = obj;
      Console.WriteLine("[OnlineStockBrokerageService.CreateOrderBook] stored " + id);
      return obj;
    }
  }

  public OrderBook GetOrderBook(string id) {
    lock (_gate) {
      if (!_order_books.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown OrderBook id: " + id);
      }
      Console.WriteLine("[OnlineStockBrokerageService.GetOrderBook] found " + id);
      return obj;
    }
  }

  public Trade CreateTrade(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Trade name required");
    }
    lock (_gate) {
      var id = string.Format("TRA-{0:D4}", _seq++);
      var obj = new Trade(id, name.Trim());
      obj.Validate();
      _trades[id] = obj;
      Console.WriteLine("[OnlineStockBrokerageService.CreateTrade] stored " + id);
      return obj;
    }
  }

  public Trade GetTrade(string id) {
    lock (_gate) {
      if (!_trades.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Trade id: " + id);
      }
      Console.WriteLine("[OnlineStockBrokerageService.GetTrade] found " + id);
      return obj;
    }
  }

  public Order CloseOrder(string id) {
    var obj = GetOrder(id);
    Console.WriteLine("[OnlineStockBrokerageService.CloseOrder] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct OnlineStockBrokerageService ==========");
    var system = new OnlineStockBrokerageService();
    Console.WriteLine("========== STEP 2: Create Order ==========");
    var first = system.CreateOrder("alpha-order");
    system.CreateOrder("beta-order");
    system.CreateOrderType("sample-order_type");
    system.CreateSide("sample-side");
    system.CreateOrderBook("sample-order_book");
    system.CreateTrade("sample-trade");
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

export const onlineStockBrokerageSolution: ProblemSolution = {
  slug: 'online-stock-brokerage',
  title: 'Online Stock Brokerage - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an online stock trading system where users place buy/sell orders that are matched through an order book. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Users place market orders and limit orders to buy or sell stocks',
      'Order book matches buy and sell orders by price-time priority',
      'Real-time price updates as orders are matched',
      'Cancel an unmatched pending order',
      'Portfolio view: current holdings and P&L',
      'Order history and trade confirmations',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Users place market orders and limit orders to buy or sell stocks?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Order book matches buy and sell orders by price-time priority?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Real-time price updates as orders are matched?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Cancel an unmatched pending order?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Portfolio view: current holdings and P&L?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. OnlineStockBrokerageService is the facade stereotype. Order, OrderType, Side, OrderBook, Trade are concrete domain classes with id/name/status and validate/close.',
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
          'Construct OnlineStockBrokerageService.',
          'createOrder twice and create the related UML classes.',
          'closeOrder once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'OnlineStockBrokerageService', responsibility: 'UML facade - orchestrates Online Stock Brokerage.', keyMembers: ['create*', 'get*', 'closeOrder'] },
    { name: 'Order', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OrderType', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Side', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OrderBook', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Trade', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from OnlineStockBrokerageService to Order, OrderType, Side, OrderBook, Trade. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on OnlineStockBrokerageService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'OnlineStockBrokerageService', responsibility: 'UML facade - orchestrates Online Stock Brokerage.', keyMembers: ['create*', 'get*', 'closeOrder'] },
    { name: 'Order', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OrderType', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Side', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'OrderBook', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Trade', responsibility: 'UML class - domain object for Online Stock Brokerage.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'OnlineStockBrokerageService exposes create/get/close and owns composed collections.' },
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
      'main constructs OnlineStockBrokerageService, creates UML domain objects, closes the primary Order, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct OnlineStockBrokerageService.',
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
