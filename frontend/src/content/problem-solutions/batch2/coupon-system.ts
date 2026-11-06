import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'CouponSystemService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_coupons', 'Map<string, Coupon>'),
    attr('-', '_discount_types', 'Map<string, DiscountType>'),
    attr('-', '_usage_limits', 'Map<string, UsageLimit>'),
    attr('-', '_coupon_redemptions', 'Map<string, CouponRedemption>'),
    attr('-', '_carts', 'Map<string, Cart>'),
  ], [
    method('+', 'createCoupon', 'name: string', 'Coupon'),
    method('+', 'createDiscountType', 'name: string', 'DiscountType'),
    method('+', 'createUsageLimit', 'name: string', 'UsageLimit'),
    method('+', 'createCouponRedemption', 'name: string', 'CouponRedemption'),
    method('+', 'createCart', 'name: string', 'Cart'),
    method('+', 'getCoupon', 'id: string', 'Coupon'),
    method('+', 'getDiscountType', 'id: string', 'DiscountType'),
    method('+', 'getUsageLimit', 'id: string', 'UsageLimit'),
    method('+', 'getCouponRedemption', 'id: string', 'CouponRedemption'),
    method('+', 'getCart', 'id: string', 'Cart'),
    method('+', 'closeCoupon', 'id: string', 'Coupon'),
  ], 'facade'),
  cls('n1', 'Coupon', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'DiscountType', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'UsageLimit', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'CouponRedemption', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Cart', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("coupon-system")


class Coupon:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Coupon.id is required")
        if not name or not name.strip():
            raise ValueError("Coupon.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Coupon.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Coupon {self.id} has invalid status={self.status}")
        log.info("[Coupon.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Coupon {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Coupon.close] id=%s -> CLOSED", self.id)


class DiscountType:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("DiscountType.id is required")
        if not name or not name.strip():
            raise ValueError("DiscountType.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[DiscountType.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"DiscountType {self.id} has invalid status={self.status}")
        log.info("[DiscountType.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"DiscountType {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[DiscountType.close] id=%s -> CLOSED", self.id)


class UsageLimit:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("UsageLimit.id is required")
        if not name or not name.strip():
            raise ValueError("UsageLimit.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[UsageLimit.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"UsageLimit {self.id} has invalid status={self.status}")
        log.info("[UsageLimit.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"UsageLimit {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[UsageLimit.close] id=%s -> CLOSED", self.id)


class CouponRedemption:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("CouponRedemption.id is required")
        if not name or not name.strip():
            raise ValueError("CouponRedemption.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[CouponRedemption.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"CouponRedemption {self.id} has invalid status={self.status}")
        log.info("[CouponRedemption.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"CouponRedemption {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[CouponRedemption.close] id=%s -> CLOSED", self.id)


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


class CouponSystemService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._coupons: Dict[str, Coupon] = {}
        self._discount_types: Dict[str, DiscountType] = {}
        self._usage_limits: Dict[str, UsageLimit] = {}
        self._coupon_redemptions: Dict[str, CouponRedemption] = {}
        self._carts: Dict[str, Cart] = {}
        log.info("[CouponSystemService.__init__] system ready; managing: Coupon, DiscountType, UsageLimit, CouponRedemption, Cart")

    def create_coupon(self, name: str) -> Coupon:
        """UML: CouponSystemService.create_coupon(name) -> Coupon"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Coupon name is required")
        with self._lock:
            item_id = f"COU-{self._seq:04d}"
            self._seq += 1
            obj = Coupon(item_id, cleaned)
            obj.validate()
            self._coupons[item_id] = obj
            log.info("[CouponSystemService.create_coupon] stored %s in _coupons (count=%s)", item_id, len(self._coupons))
            return obj

    def get_coupon(self, item_id: str) -> Coupon:
        with self._lock:
            obj = self._coupons.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Coupon id: {item_id}")
            log.info("[CouponSystemService.get_coupon] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_discount_type(self, name: str) -> DiscountType:
        """UML: CouponSystemService.create_discount_type(name) -> DiscountType"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("DiscountType name is required")
        with self._lock:
            item_id = f"DIS-{self._seq:04d}"
            self._seq += 1
            obj = DiscountType(item_id, cleaned)
            obj.validate()
            self._discount_types[item_id] = obj
            log.info("[CouponSystemService.create_discount_type] stored %s in _discount_types (count=%s)", item_id, len(self._discount_types))
            return obj

    def get_discount_type(self, item_id: str) -> DiscountType:
        with self._lock:
            obj = self._discount_types.get(item_id)
            if obj is None:
                raise KeyError(f"unknown DiscountType id: {item_id}")
            log.info("[CouponSystemService.get_discount_type] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_usage_limit(self, name: str) -> UsageLimit:
        """UML: CouponSystemService.create_usage_limit(name) -> UsageLimit"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("UsageLimit name is required")
        with self._lock:
            item_id = f"USA-{self._seq:04d}"
            self._seq += 1
            obj = UsageLimit(item_id, cleaned)
            obj.validate()
            self._usage_limits[item_id] = obj
            log.info("[CouponSystemService.create_usage_limit] stored %s in _usage_limits (count=%s)", item_id, len(self._usage_limits))
            return obj

    def get_usage_limit(self, item_id: str) -> UsageLimit:
        with self._lock:
            obj = self._usage_limits.get(item_id)
            if obj is None:
                raise KeyError(f"unknown UsageLimit id: {item_id}")
            log.info("[CouponSystemService.get_usage_limit] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_coupon_redemption(self, name: str) -> CouponRedemption:
        """UML: CouponSystemService.create_coupon_redemption(name) -> CouponRedemption"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("CouponRedemption name is required")
        with self._lock:
            item_id = f"COU-{self._seq:04d}"
            self._seq += 1
            obj = CouponRedemption(item_id, cleaned)
            obj.validate()
            self._coupon_redemptions[item_id] = obj
            log.info("[CouponSystemService.create_coupon_redemption] stored %s in _coupon_redemptions (count=%s)", item_id, len(self._coupon_redemptions))
            return obj

    def get_coupon_redemption(self, item_id: str) -> CouponRedemption:
        with self._lock:
            obj = self._coupon_redemptions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown CouponRedemption id: {item_id}")
            log.info("[CouponSystemService.get_coupon_redemption] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_cart(self, name: str) -> Cart:
        """UML: CouponSystemService.create_cart(name) -> Cart"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Cart name is required")
        with self._lock:
            item_id = f"CAR-{self._seq:04d}"
            self._seq += 1
            obj = Cart(item_id, cleaned)
            obj.validate()
            self._carts[item_id] = obj
            log.info("[CouponSystemService.create_cart] stored %s in _carts (count=%s)", item_id, len(self._carts))
            return obj

    def get_cart(self, item_id: str) -> Cart:
        with self._lock:
            obj = self._carts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Cart id: {item_id}")
            log.info("[CouponSystemService.get_cart] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_coupon(self, item_id: str) -> Coupon:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._coupons.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Coupon id: {item_id}")
            log.info("[CouponSystemService.close_coupon] closing %s via Coupon.close()", item_id)
            obj.close()
            return obj

    def list_active_coupons(self) -> List[Coupon]:
        with self._lock:
            active = [o for o in self._coupons.values() if o.status == "ACTIVE"]
            log.info("[CouponSystemService.list_active_coupons] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct CouponSystemService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = CouponSystemService()

    log.info("========== STEP 2: Create primary Coupon objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_coupon("alpha-coupon")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_coupon("beta-coupon")

    log.info("========== STEP 3: Create DiscountType (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_discount_type("sample-discount_type")

    log.info("========== STEP 4: Create UsageLimit (UML class) ==========")
    system.create_usage_limit("sample-usage_limit")

    log.info("========== STEP 5: Create CouponRedemption (UML class) ==========")
    system.create_coupon_redemption("sample-coupon_redemption")

    log.info("========== STEP 6: Create Cart (UML class) ==========")
    system.create_cart("sample-cart")

    log.info("========== STEP 7: Inspect active Coupon list ==========")
    system.list_active_coupons()

    log.info("========== STEP 8: Close first Coupon ==========")
    system.close_coupon(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_coupon(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Coupon.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_coupon("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_coupon: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_coupons()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Coupon {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Coupon(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Coupon.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Coupon.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Coupon.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Coupon " + id + " invalid status");
    }
    System.out.println("[Coupon.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Coupon " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Coupon.close] id=" + id + " -> CLOSED");
  }
}


class DiscountType {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  DiscountType(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("DiscountType.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DiscountType.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[DiscountType.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("DiscountType " + id + " invalid status");
    }
    System.out.println("[DiscountType.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("DiscountType " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[DiscountType.close] id=" + id + " -> CLOSED");
  }
}


class UsageLimit {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  UsageLimit(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("UsageLimit.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("UsageLimit.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[UsageLimit.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("UsageLimit " + id + " invalid status");
    }
    System.out.println("[UsageLimit.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("UsageLimit " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[UsageLimit.close] id=" + id + " -> CLOSED");
  }
}


class CouponRedemption {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  CouponRedemption(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("CouponRedemption.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CouponRedemption.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[CouponRedemption.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("CouponRedemption " + id + " invalid status");
    }
    System.out.println("[CouponRedemption.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("CouponRedemption " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[CouponRedemption.close] id=" + id + " -> CLOSED");
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

public class CouponSystemService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Coupon> coupons = new LinkedHashMap<>();
  private final Map<String, DiscountType> discount_types = new LinkedHashMap<>();
  private final Map<String, UsageLimit> usage_limits = new LinkedHashMap<>();
  private final Map<String, CouponRedemption> coupon_redemptions = new LinkedHashMap<>();
  private final Map<String, Cart> carts = new LinkedHashMap<>();

  public CouponSystemService() {
    System.out.println("[CouponSystemService.__init__] system ready");
  }

  public Coupon createCoupon(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Coupon name required");
    }
    lock.lock();
    try {
      String id = String.format("COU-%04d", seq++);
      Coupon obj = new Coupon(id, name.trim());
      obj.validate();
      coupons.put(id, obj);
      System.out.println("[CouponSystemService.createCoupon] stored " + id + " count=" + coupons.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Coupon getCoupon(String id) {
    lock.lock();
    try {
      Coupon obj = coupons.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Coupon id: " + id);
      }
      System.out.println("[CouponSystemService.getCoupon] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public DiscountType createDiscountType(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DiscountType name required");
    }
    lock.lock();
    try {
      String id = String.format("DIS-%04d", seq++);
      DiscountType obj = new DiscountType(id, name.trim());
      obj.validate();
      discount_types.put(id, obj);
      System.out.println("[CouponSystemService.createDiscountType] stored " + id + " count=" + discount_types.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public DiscountType getDiscountType(String id) {
    lock.lock();
    try {
      DiscountType obj = discount_types.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown DiscountType id: " + id);
      }
      System.out.println("[CouponSystemService.getDiscountType] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public UsageLimit createUsageLimit(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("UsageLimit name required");
    }
    lock.lock();
    try {
      String id = String.format("USA-%04d", seq++);
      UsageLimit obj = new UsageLimit(id, name.trim());
      obj.validate();
      usage_limits.put(id, obj);
      System.out.println("[CouponSystemService.createUsageLimit] stored " + id + " count=" + usage_limits.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public UsageLimit getUsageLimit(String id) {
    lock.lock();
    try {
      UsageLimit obj = usage_limits.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown UsageLimit id: " + id);
      }
      System.out.println("[CouponSystemService.getUsageLimit] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public CouponRedemption createCouponRedemption(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CouponRedemption name required");
    }
    lock.lock();
    try {
      String id = String.format("COU-%04d", seq++);
      CouponRedemption obj = new CouponRedemption(id, name.trim());
      obj.validate();
      coupon_redemptions.put(id, obj);
      System.out.println("[CouponSystemService.createCouponRedemption] stored " + id + " count=" + coupon_redemptions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public CouponRedemption getCouponRedemption(String id) {
    lock.lock();
    try {
      CouponRedemption obj = coupon_redemptions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown CouponRedemption id: " + id);
      }
      System.out.println("[CouponSystemService.getCouponRedemption] found id=" + obj.getId());
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
      System.out.println("[CouponSystemService.createCart] stored " + id + " count=" + carts.size());
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
      System.out.println("[CouponSystemService.getCart] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Coupon closeCoupon(String id) {
    lock.lock();
    try {
      Coupon obj = coupons.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Coupon id: " + id);
      }
      System.out.println("[CouponSystemService.closeCoupon] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Coupon> listActiveCoupons() {
    lock.lock();
    try {
      List<Coupon> out = new ArrayList<>();
      for (Coupon o : coupons.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[CouponSystemService.listActiveCoupons] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct CouponSystemService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    CouponSystemService system = new CouponSystemService();
    System.out.println("========== STEP 2: Create Coupon objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Coupon first = system.createCoupon("alpha-coupon");
    system.createCoupon("beta-coupon");
    System.out.println("========== STEP 3: Create DiscountType ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createDiscountType("sample-discount_type");
    System.out.println("========== STEP 4: Create UsageLimit ==========");
    system.createUsageLimit("sample-usage_limit");
    System.out.println("========== STEP 5: Create CouponRedemption ==========");
    system.createCouponRedemption("sample-coupon_redemption");
    System.out.println("========== STEP 6: Create Cart ==========");
    system.createCart("sample-cart");
    System.out.println("========== Inspect active list ==========");
    system.listActiveCoupons();
    System.out.println("========== Close first Coupon ==========");
    system.closeCoupon(first.getId());
    try {
      system.closeCoupon(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getCoupon("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Coupon {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Coupon.id required')
    }

    if (!name?.trim()) {
      throw new Error('Coupon.name required')
    }
    console.log(\`[Coupon.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Coupon \${this.id} invalid status\`)
    }
    console.log(\`[Coupon.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Coupon \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Coupon.close] id=\${this.id} -> CLOSED\`)
  }
}


class DiscountType {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('DiscountType.id required')
    }

    if (!name?.trim()) {
      throw new Error('DiscountType.name required')
    }
    console.log(\`[DiscountType.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`DiscountType \${this.id} invalid status\`)
    }
    console.log(\`[DiscountType.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`DiscountType \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[DiscountType.close] id=\${this.id} -> CLOSED\`)
  }
}


class UsageLimit {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('UsageLimit.id required')
    }

    if (!name?.trim()) {
      throw new Error('UsageLimit.name required')
    }
    console.log(\`[UsageLimit.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`UsageLimit \${this.id} invalid status\`)
    }
    console.log(\`[UsageLimit.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`UsageLimit \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[UsageLimit.close] id=\${this.id} -> CLOSED\`)
  }
}


class CouponRedemption {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('CouponRedemption.id required')
    }

    if (!name?.trim()) {
      throw new Error('CouponRedemption.name required')
    }
    console.log(\`[CouponRedemption.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`CouponRedemption \${this.id} invalid status\`)
    }
    console.log(\`[CouponRedemption.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`CouponRedemption \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[CouponRedemption.close] id=\${this.id} -> CLOSED\`)
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

class CouponSystemService {
  private seq = 1
  private coupons = new Map<string, Coupon>()
  private discount_types = new Map<string, DiscountType>()
  private usage_limits = new Map<string, UsageLimit>()
  private coupon_redemptions = new Map<string, CouponRedemption>()
  private carts = new Map<string, Cart>()
  constructor() {
    console.log('[CouponSystemService.__init__] system ready')
  }

  createCoupon(name: string): Coupon {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Coupon name required')
    }
    const id = \`COU-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Coupon(id, cleaned)
    obj.validate()
    this.coupons.set(id, obj)
    console.log(\`[CouponSystemService.createCoupon] stored \${id} count=\${this.coupons.size}\`)
    return obj
  }

  getCoupon(id: string): Coupon {
    const obj = this.coupons.get(id)
    if (!obj) {
      throw new Error(\`unknown Coupon id: \${id}\`)
    }
    console.log(\`[CouponSystemService.getCoupon] found id=\${obj.id}\`)
    return obj
  }

  createDiscountType(name: string): DiscountType {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('DiscountType name required')
    }
    const id = \`DIS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new DiscountType(id, cleaned)
    obj.validate()
    this.discount_types.set(id, obj)
    console.log(\`[CouponSystemService.createDiscountType] stored \${id} count=\${this.discount_types.size}\`)
    return obj
  }

  getDiscountType(id: string): DiscountType {
    const obj = this.discount_types.get(id)
    if (!obj) {
      throw new Error(\`unknown DiscountType id: \${id}\`)
    }
    console.log(\`[CouponSystemService.getDiscountType] found id=\${obj.id}\`)
    return obj
  }

  createUsageLimit(name: string): UsageLimit {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('UsageLimit name required')
    }
    const id = \`USA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new UsageLimit(id, cleaned)
    obj.validate()
    this.usage_limits.set(id, obj)
    console.log(\`[CouponSystemService.createUsageLimit] stored \${id} count=\${this.usage_limits.size}\`)
    return obj
  }

  getUsageLimit(id: string): UsageLimit {
    const obj = this.usage_limits.get(id)
    if (!obj) {
      throw new Error(\`unknown UsageLimit id: \${id}\`)
    }
    console.log(\`[CouponSystemService.getUsageLimit] found id=\${obj.id}\`)
    return obj
  }

  createCouponRedemption(name: string): CouponRedemption {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('CouponRedemption name required')
    }
    const id = \`COU-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new CouponRedemption(id, cleaned)
    obj.validate()
    this.coupon_redemptions.set(id, obj)
    console.log(\`[CouponSystemService.createCouponRedemption] stored \${id} count=\${this.coupon_redemptions.size}\`)
    return obj
  }

  getCouponRedemption(id: string): CouponRedemption {
    const obj = this.coupon_redemptions.get(id)
    if (!obj) {
      throw new Error(\`unknown CouponRedemption id: \${id}\`)
    }
    console.log(\`[CouponSystemService.getCouponRedemption] found id=\${obj.id}\`)
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
    console.log(\`[CouponSystemService.createCart] stored \${id} count=\${this.carts.size}\`)
    return obj
  }

  getCart(id: string): Cart {
    const obj = this.carts.get(id)
    if (!obj) {
      throw new Error(\`unknown Cart id: \${id}\`)
    }
    console.log(\`[CouponSystemService.getCart] found id=\${obj.id}\`)
    return obj
  }

  closeCoupon(id: string): Coupon {
    const obj = this.getCoupon(id)
    console.log(\`[CouponSystemService.closeCoupon] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveCoupons(): Coupon[] {
    const active = [...this.coupons.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[CouponSystemService.listActiveCoupons] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct CouponSystemService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new CouponSystemService()
  console.log('========== STEP 2: Create Coupon objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createCoupon('alpha-coupon')
  system.createCoupon('beta-coupon')
  console.log('========== STEP 3: Create DiscountType ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createDiscountType('sample-discount_type')
  console.log('========== STEP 4: Create UsageLimit ==========')
  system.createUsageLimit('sample-usage_limit')
  console.log('========== STEP 5: Create CouponRedemption ==========')
  system.createCouponRedemption('sample-coupon_redemption')
  console.log('========== STEP 6: Create Cart ==========')
  system.createCart('sample-cart')
  system.listActiveCoupons()
  console.log('========== Close first Coupon ==========')
  system.closeCoupon(first.id)
  try {
    system.closeCoupon(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getCoupon('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Coupon {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Coupon(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Coupon requires id and name");
    }
    cout << "[Coupon.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Coupon invalid status");
    }
    cout << "[Coupon.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Coupon cannot close");
    }
    status_ = "CLOSED";
    cout << "[Coupon.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class DiscountType {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  DiscountType(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("DiscountType requires id and name");
    }
    cout << "[DiscountType.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("DiscountType invalid status");
    }
    cout << "[DiscountType.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("DiscountType cannot close");
    }
    status_ = "CLOSED";
    cout << "[DiscountType.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class UsageLimit {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  UsageLimit(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("UsageLimit requires id and name");
    }
    cout << "[UsageLimit.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("UsageLimit invalid status");
    }
    cout << "[UsageLimit.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("UsageLimit cannot close");
    }
    status_ = "CLOSED";
    cout << "[UsageLimit.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class CouponRedemption {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  CouponRedemption(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("CouponRedemption requires id and name");
    }
    cout << "[CouponRedemption.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("CouponRedemption invalid status");
    }
    cout << "[CouponRedemption.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("CouponRedemption cannot close");
    }
    status_ = "CLOSED";
    cout << "[CouponRedemption.close] id=" << id_ << " -> CLOSED" << endl;
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

class CouponSystemService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Coupon> coupons_;
  unordered_map<string, DiscountType> discount_types_;
  unordered_map<string, UsageLimit> usage_limits_;
  unordered_map<string, CouponRedemption> coupon_redemptions_;
  unordered_map<string, Cart> carts_;
public:
  CouponSystemService() {
    cout << "[CouponSystemService.__init__] system ready" << endl;
  }

  Coupon createCoupon(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Coupon name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "COU-%04d", seq_++);
    Coupon obj{buf, name};
    obj.validate();
    coupons_.emplace(obj.id(), obj);
    cout << "[CouponSystemService.createCoupon] stored " << obj.id() << endl;
    return obj;
  }

  Coupon getCoupon(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = coupons_.find(id);
    if (it == coupons_.end()) {
      throw out_of_range("unknown Coupon id");
    }
    cout << "[CouponSystemService.getCoupon] found " << id << endl;
    return it->second;
  }

  DiscountType createDiscountType(const string& name) {
    if (name.empty()) {
      throw invalid_argument("DiscountType name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DIS-%04d", seq_++);
    DiscountType obj{buf, name};
    obj.validate();
    discount_types_.emplace(obj.id(), obj);
    cout << "[CouponSystemService.createDiscountType] stored " << obj.id() << endl;
    return obj;
  }

  DiscountType getDiscountType(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = discount_types_.find(id);
    if (it == discount_types_.end()) {
      throw out_of_range("unknown DiscountType id");
    }
    cout << "[CouponSystemService.getDiscountType] found " << id << endl;
    return it->second;
  }

  UsageLimit createUsageLimit(const string& name) {
    if (name.empty()) {
      throw invalid_argument("UsageLimit name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "USA-%04d", seq_++);
    UsageLimit obj{buf, name};
    obj.validate();
    usage_limits_.emplace(obj.id(), obj);
    cout << "[CouponSystemService.createUsageLimit] stored " << obj.id() << endl;
    return obj;
  }

  UsageLimit getUsageLimit(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = usage_limits_.find(id);
    if (it == usage_limits_.end()) {
      throw out_of_range("unknown UsageLimit id");
    }
    cout << "[CouponSystemService.getUsageLimit] found " << id << endl;
    return it->second;
  }

  CouponRedemption createCouponRedemption(const string& name) {
    if (name.empty()) {
      throw invalid_argument("CouponRedemption name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "COU-%04d", seq_++);
    CouponRedemption obj{buf, name};
    obj.validate();
    coupon_redemptions_.emplace(obj.id(), obj);
    cout << "[CouponSystemService.createCouponRedemption] stored " << obj.id() << endl;
    return obj;
  }

  CouponRedemption getCouponRedemption(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = coupon_redemptions_.find(id);
    if (it == coupon_redemptions_.end()) {
      throw out_of_range("unknown CouponRedemption id");
    }
    cout << "[CouponSystemService.getCouponRedemption] found " << id << endl;
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
    cout << "[CouponSystemService.createCart] stored " << obj.id() << endl;
    return obj;
  }

  Cart getCart(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = carts_.find(id);
    if (it == carts_.end()) {
      throw out_of_range("unknown Cart id");
    }
    cout << "[CouponSystemService.getCart] found " << id << endl;
    return it->second;
  }

  Coupon closeCoupon(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = coupons_.find(id);
    if (it == coupons_.end()) {
      throw out_of_range("unknown Coupon");
    }
    cout << "[CouponSystemService.closeCoupon] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct CouponSystemService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  CouponSystemService system;
  cout << "========== STEP 2: Create Coupon ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createCoupon("alpha-coupon");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createCoupon("beta-coupon");
  system.createDiscountType("sample-discount_type");
  system.createUsageLimit("sample-usage_limit");
  system.createCouponRedemption("sample-coupon_redemption");
  system.createCart("sample-cart");
  system.closeCoupon(first.id());
  try {
    system.closeCoupon(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getCoupon("MISSING-ID");
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

type Coupon struct {
  ID     string
  Name   string
  Status string
}

func NewCoupon(id, name string) (*Coupon, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Coupon requires id and name")
  }
  obj := &Coupon{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Coupon.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Coupon) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Coupon invalid status")
  }
  fmt.Printf("[Coupon.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Coupon) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Coupon %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Coupon.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type DiscountType struct {
  ID     string
  Name   string
  Status string
}

func NewDiscountType(id, name string) (*DiscountType, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("DiscountType requires id and name")
  }
  obj := &DiscountType{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[DiscountType.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *DiscountType) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("DiscountType invalid status")
  }
  fmt.Printf("[DiscountType.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *DiscountType) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("DiscountType %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[DiscountType.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type UsageLimit struct {
  ID     string
  Name   string
  Status string
}

func NewUsageLimit(id, name string) (*UsageLimit, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("UsageLimit requires id and name")
  }
  obj := &UsageLimit{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[UsageLimit.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *UsageLimit) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("UsageLimit invalid status")
  }
  fmt.Printf("[UsageLimit.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *UsageLimit) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("UsageLimit %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[UsageLimit.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type CouponRedemption struct {
  ID     string
  Name   string
  Status string
}

func NewCouponRedemption(id, name string) (*CouponRedemption, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("CouponRedemption requires id and name")
  }
  obj := &CouponRedemption{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[CouponRedemption.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *CouponRedemption) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("CouponRedemption invalid status")
  }
  fmt.Printf("[CouponRedemption.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *CouponRedemption) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("CouponRedemption %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[CouponRedemption.close] id=%s -> CLOSED\\n", o.ID)
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

type CouponSystemService struct {
  mu  sync.Mutex
  seq int
  coupons map[string]*Coupon
  discount_types map[string]*DiscountType
  usage_limits map[string]*UsageLimit
  coupon_redemptions map[string]*CouponRedemption
  carts map[string]*Cart
}

func NewCouponSystemService() *CouponSystemService {
  fmt.Println("[CouponSystemService.__init__] system ready")
  return &CouponSystemService{
    seq: 1,
    coupons: map[string]*Coupon{},
    discount_types: map[string]*DiscountType{},
    usage_limits: map[string]*UsageLimit{},
    coupon_redemptions: map[string]*CouponRedemption{},
    carts: map[string]*Cart{},
  }
}

func (s *CouponSystemService) CreateCoupon(name string) (*Coupon, error) {
  if name == "" {
    return nil, fmt.Errorf("Coupon name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("COU-%04d", s.seq)
  s.seq++
  obj, err := NewCoupon(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.coupons[id] = obj
  fmt.Printf("[CouponSystemService.CreateCoupon] stored %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) GetCoupon(id string) (*Coupon, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.coupons[id]
  if !ok {
    return nil, fmt.Errorf("unknown Coupon id: %s", id)
  }
  fmt.Printf("[CouponSystemService.GetCoupon] found %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) CreateDiscountType(name string) (*DiscountType, error) {
  if name == "" {
    return nil, fmt.Errorf("DiscountType name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DIS-%04d", s.seq)
  s.seq++
  obj, err := NewDiscountType(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.discount_types[id] = obj
  fmt.Printf("[CouponSystemService.CreateDiscountType] stored %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) GetDiscountType(id string) (*DiscountType, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.discount_types[id]
  if !ok {
    return nil, fmt.Errorf("unknown DiscountType id: %s", id)
  }
  fmt.Printf("[CouponSystemService.GetDiscountType] found %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) CreateUsageLimit(name string) (*UsageLimit, error) {
  if name == "" {
    return nil, fmt.Errorf("UsageLimit name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("USA-%04d", s.seq)
  s.seq++
  obj, err := NewUsageLimit(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.usage_limits[id] = obj
  fmt.Printf("[CouponSystemService.CreateUsageLimit] stored %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) GetUsageLimit(id string) (*UsageLimit, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.usage_limits[id]
  if !ok {
    return nil, fmt.Errorf("unknown UsageLimit id: %s", id)
  }
  fmt.Printf("[CouponSystemService.GetUsageLimit] found %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) CreateCouponRedemption(name string) (*CouponRedemption, error) {
  if name == "" {
    return nil, fmt.Errorf("CouponRedemption name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("COU-%04d", s.seq)
  s.seq++
  obj, err := NewCouponRedemption(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.coupon_redemptions[id] = obj
  fmt.Printf("[CouponSystemService.CreateCouponRedemption] stored %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) GetCouponRedemption(id string) (*CouponRedemption, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.coupon_redemptions[id]
  if !ok {
    return nil, fmt.Errorf("unknown CouponRedemption id: %s", id)
  }
  fmt.Printf("[CouponSystemService.GetCouponRedemption] found %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) CreateCart(name string) (*Cart, error) {
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
  fmt.Printf("[CouponSystemService.CreateCart] stored %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) GetCart(id string) (*Cart, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.carts[id]
  if !ok {
    return nil, fmt.Errorf("unknown Cart id: %s", id)
  }
  fmt.Printf("[CouponSystemService.GetCart] found %s\\n", id)
  return obj, nil
}

func (s *CouponSystemService) CloseCoupon(id string) (*Coupon, error) {
  obj, err := s.GetCoupon(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[CouponSystemService.CloseCoupon] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct CouponSystemService ==========")
  system := NewCouponSystemService()
  fmt.Println("========== STEP 2: Create Coupon ==========")
  first, _ := system.CreateCoupon("alpha-coupon")
  system.CreateCoupon("beta-coupon")
  system.CreateDiscountType("sample-discount_type")
  system.CreateUsageLimit("sample-usage_limit")
  system.CreateCouponRedemption("sample-coupon_redemption")
  system.CreateCart("sample-cart")
  system.CloseCoupon(first.ID)
  if _, err := system.CloseCoupon(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetCoupon("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Coupon {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Coupon(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Coupon requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Coupon.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Coupon invalid status");
    }
    Console.WriteLine("[Coupon.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Coupon " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Coupon.close] id=" + Id + " -> CLOSED");
  }
}


sealed class DiscountType {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public DiscountType(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DiscountType requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[DiscountType.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("DiscountType invalid status");
    }
    Console.WriteLine("[DiscountType.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("DiscountType " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[DiscountType.close] id=" + Id + " -> CLOSED");
  }
}


sealed class UsageLimit {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public UsageLimit(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("UsageLimit requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[UsageLimit.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("UsageLimit invalid status");
    }
    Console.WriteLine("[UsageLimit.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("UsageLimit " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[UsageLimit.close] id=" + Id + " -> CLOSED");
  }
}


sealed class CouponRedemption {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public CouponRedemption(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CouponRedemption requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[CouponRedemption.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("CouponRedemption invalid status");
    }
    Console.WriteLine("[CouponRedemption.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("CouponRedemption " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[CouponRedemption.close] id=" + Id + " -> CLOSED");
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

sealed class CouponSystemService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Coupon> _coupons = new();
  private readonly Dictionary<string, DiscountType> _discount_types = new();
  private readonly Dictionary<string, UsageLimit> _usage_limits = new();
  private readonly Dictionary<string, CouponRedemption> _coupon_redemptions = new();
  private readonly Dictionary<string, Cart> _carts = new();
  public CouponSystemService() {
    Console.WriteLine("[CouponSystemService.__init__] system ready");
  }

  public Coupon CreateCoupon(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Coupon name required");
    }
    lock (_gate) {
      var id = string.Format("COU-{0:D4}", _seq++);
      var obj = new Coupon(id, name.Trim());
      obj.Validate();
      _coupons[id] = obj;
      Console.WriteLine("[CouponSystemService.CreateCoupon] stored " + id);
      return obj;
    }
  }

  public Coupon GetCoupon(string id) {
    lock (_gate) {
      if (!_coupons.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Coupon id: " + id);
      }
      Console.WriteLine("[CouponSystemService.GetCoupon] found " + id);
      return obj;
    }
  }

  public DiscountType CreateDiscountType(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DiscountType name required");
    }
    lock (_gate) {
      var id = string.Format("DIS-{0:D4}", _seq++);
      var obj = new DiscountType(id, name.Trim());
      obj.Validate();
      _discount_types[id] = obj;
      Console.WriteLine("[CouponSystemService.CreateDiscountType] stored " + id);
      return obj;
    }
  }

  public DiscountType GetDiscountType(string id) {
    lock (_gate) {
      if (!_discount_types.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown DiscountType id: " + id);
      }
      Console.WriteLine("[CouponSystemService.GetDiscountType] found " + id);
      return obj;
    }
  }

  public UsageLimit CreateUsageLimit(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("UsageLimit name required");
    }
    lock (_gate) {
      var id = string.Format("USA-{0:D4}", _seq++);
      var obj = new UsageLimit(id, name.Trim());
      obj.Validate();
      _usage_limits[id] = obj;
      Console.WriteLine("[CouponSystemService.CreateUsageLimit] stored " + id);
      return obj;
    }
  }

  public UsageLimit GetUsageLimit(string id) {
    lock (_gate) {
      if (!_usage_limits.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown UsageLimit id: " + id);
      }
      Console.WriteLine("[CouponSystemService.GetUsageLimit] found " + id);
      return obj;
    }
  }

  public CouponRedemption CreateCouponRedemption(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CouponRedemption name required");
    }
    lock (_gate) {
      var id = string.Format("COU-{0:D4}", _seq++);
      var obj = new CouponRedemption(id, name.Trim());
      obj.Validate();
      _coupon_redemptions[id] = obj;
      Console.WriteLine("[CouponSystemService.CreateCouponRedemption] stored " + id);
      return obj;
    }
  }

  public CouponRedemption GetCouponRedemption(string id) {
    lock (_gate) {
      if (!_coupon_redemptions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown CouponRedemption id: " + id);
      }
      Console.WriteLine("[CouponSystemService.GetCouponRedemption] found " + id);
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
      Console.WriteLine("[CouponSystemService.CreateCart] stored " + id);
      return obj;
    }
  }

  public Cart GetCart(string id) {
    lock (_gate) {
      if (!_carts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Cart id: " + id);
      }
      Console.WriteLine("[CouponSystemService.GetCart] found " + id);
      return obj;
    }
  }

  public Coupon CloseCoupon(string id) {
    var obj = GetCoupon(id);
    Console.WriteLine("[CouponSystemService.CloseCoupon] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct CouponSystemService ==========");
    var system = new CouponSystemService();
    Console.WriteLine("========== STEP 2: Create Coupon ==========");
    var first = system.CreateCoupon("alpha-coupon");
    system.CreateCoupon("beta-coupon");
    system.CreateDiscountType("sample-discount_type");
    system.CreateUsageLimit("sample-usage_limit");
    system.CreateCouponRedemption("sample-coupon_redemption");
    system.CreateCart("sample-cart");
    system.CloseCoupon(first.Id);
    try {
      system.CloseCoupon(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetCoupon("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const couponSystemSolution: ProblemSolution = {
  slug: 'coupon-system',
  title: 'Coupon & Discount System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a flexible coupon and discount management system for an e-commerce platform supporting various promotion types. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Create coupon codes with type: percentage off, flat amount off, free shipping, buy-X-get-Y',
      'Set validity period, minimum order value, and usage limits (total and per-user)',
      'Apply single or multiple coupons to a cart',
      'Auto-apply the best available coupon based on cart contents',
      'Coupon stacking rules: which types can be combined',
      'Admin dashboard to create, disable, and view coupon analytics',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Create coupon codes with type: percentage off, flat amount off, free shipping, buy-X-get-Y?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Set validity period, minimum order value, and usage limits (total and per-user)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Apply single or multiple coupons to a cart?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Auto-apply the best available coupon based on cart contents?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Coupon stacking rules: which types can be combined?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. CouponSystemService is the facade stereotype. Coupon, DiscountType, UsageLimit, CouponRedemption, Cart are concrete domain classes with id/name/status and validate/close.',
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
          'Construct CouponSystemService.',
          'createCoupon twice and create the related UML classes.',
          'closeCoupon once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'CouponSystemService', responsibility: 'UML facade - orchestrates Coupon & Discount System.', keyMembers: ['create*', 'get*', 'closeCoupon'] },
    { name: 'Coupon', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'DiscountType', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'UsageLimit', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'CouponRedemption', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Cart', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from CouponSystemService to Coupon, DiscountType, UsageLimit, CouponRedemption, Cart. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on CouponSystemService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'CouponSystemService', responsibility: 'UML facade - orchestrates Coupon & Discount System.', keyMembers: ['create*', 'get*', 'closeCoupon'] },
    { name: 'Coupon', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'DiscountType', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'UsageLimit', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'CouponRedemption', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Cart', responsibility: 'UML class - domain object for Coupon & Discount System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'CouponSystemService exposes create/get/close and owns composed collections.' },
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
      'main constructs CouponSystemService, creates UML domain objects, closes the primary Coupon, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct CouponSystemService.',
      'createCoupon for alpha and beta.',
      'create remaining UML classes.',
      'closeCoupon(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createCoupon("alpha..."); closeCoupon(id)',
        output: '[Coupon.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeCoupon(alreadyClosed) or getCoupon("MISSING-ID")',
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
