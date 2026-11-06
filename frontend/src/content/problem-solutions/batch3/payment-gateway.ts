import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'PaymentGatewayService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_payments', 'Map<string, Payment>'),
    attr('-', '_payment_methods', 'Map<string, PaymentMethod>'),
    attr('-', '_tokens', 'Map<string, Token>'),
    attr('-', '_merchants', 'Map<string, Merchant>'),
    attr('-', '_refunds', 'Map<string, Refund>'),
  ], [
    method('+', 'createPayment', 'name: string', 'Payment'),
    method('+', 'createPaymentMethod', 'name: string', 'PaymentMethod'),
    method('+', 'createToken', 'name: string', 'Token'),
    method('+', 'createMerchant', 'name: string', 'Merchant'),
    method('+', 'createRefund', 'name: string', 'Refund'),
    method('+', 'getPayment', 'id: string', 'Payment'),
    method('+', 'getPaymentMethod', 'id: string', 'PaymentMethod'),
    method('+', 'getToken', 'id: string', 'Token'),
    method('+', 'getMerchant', 'id: string', 'Merchant'),
    method('+', 'getRefund', 'id: string', 'Refund'),
    method('+', 'closePayment', 'id: string', 'Payment'),
  ], 'facade'),
  cls('n1', 'Payment', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'PaymentMethod', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Token', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Merchant', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Refund', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("payment-gateway")


class Payment:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Payment.id is required")
        if not name or not name.strip():
            raise ValueError("Payment.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Payment.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Payment {self.id} has invalid status={self.status}")
        log.info("[Payment.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Payment {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Payment.close] id=%s -> CLOSED", self.id)


class PaymentMethod:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("PaymentMethod.id is required")
        if not name or not name.strip():
            raise ValueError("PaymentMethod.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[PaymentMethod.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"PaymentMethod {self.id} has invalid status={self.status}")
        log.info("[PaymentMethod.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"PaymentMethod {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[PaymentMethod.close] id=%s -> CLOSED", self.id)


class Token:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Token.id is required")
        if not name or not name.strip():
            raise ValueError("Token.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Token.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Token {self.id} has invalid status={self.status}")
        log.info("[Token.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Token {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Token.close] id=%s -> CLOSED", self.id)


class Merchant:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Merchant.id is required")
        if not name or not name.strip():
            raise ValueError("Merchant.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Merchant.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Merchant {self.id} has invalid status={self.status}")
        log.info("[Merchant.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Merchant {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Merchant.close] id=%s -> CLOSED", self.id)


class Refund:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Refund.id is required")
        if not name or not name.strip():
            raise ValueError("Refund.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Refund.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Refund {self.id} has invalid status={self.status}")
        log.info("[Refund.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Refund {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Refund.close] id=%s -> CLOSED", self.id)


class PaymentGatewayService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._payments: Dict[str, Payment] = {}
        self._payment_methods: Dict[str, PaymentMethod] = {}
        self._tokens: Dict[str, Token] = {}
        self._merchants: Dict[str, Merchant] = {}
        self._refunds: Dict[str, Refund] = {}
        log.info("[PaymentGatewayService.__init__] system ready; managing: Payment, PaymentMethod, Token, Merchant, Refund")

    def create_payment(self, name: str) -> Payment:
        """UML: PaymentGatewayService.create_payment(name) -> Payment"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Payment name is required")
        with self._lock:
            item_id = f"PAY-{self._seq:04d}"
            self._seq += 1
            obj = Payment(item_id, cleaned)
            obj.validate()
            self._payments[item_id] = obj
            log.info("[PaymentGatewayService.create_payment] stored %s in _payments (count=%s)", item_id, len(self._payments))
            return obj

    def get_payment(self, item_id: str) -> Payment:
        with self._lock:
            obj = self._payments.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Payment id: {item_id}")
            log.info("[PaymentGatewayService.get_payment] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_payment_method(self, name: str) -> PaymentMethod:
        """UML: PaymentGatewayService.create_payment_method(name) -> PaymentMethod"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("PaymentMethod name is required")
        with self._lock:
            item_id = f"PAY-{self._seq:04d}"
            self._seq += 1
            obj = PaymentMethod(item_id, cleaned)
            obj.validate()
            self._payment_methods[item_id] = obj
            log.info("[PaymentGatewayService.create_payment_method] stored %s in _payment_methods (count=%s)", item_id, len(self._payment_methods))
            return obj

    def get_payment_method(self, item_id: str) -> PaymentMethod:
        with self._lock:
            obj = self._payment_methods.get(item_id)
            if obj is None:
                raise KeyError(f"unknown PaymentMethod id: {item_id}")
            log.info("[PaymentGatewayService.get_payment_method] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_token(self, name: str) -> Token:
        """UML: PaymentGatewayService.create_token(name) -> Token"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Token name is required")
        with self._lock:
            item_id = f"TOK-{self._seq:04d}"
            self._seq += 1
            obj = Token(item_id, cleaned)
            obj.validate()
            self._tokens[item_id] = obj
            log.info("[PaymentGatewayService.create_token] stored %s in _tokens (count=%s)", item_id, len(self._tokens))
            return obj

    def get_token(self, item_id: str) -> Token:
        with self._lock:
            obj = self._tokens.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Token id: {item_id}")
            log.info("[PaymentGatewayService.get_token] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_merchant(self, name: str) -> Merchant:
        """UML: PaymentGatewayService.create_merchant(name) -> Merchant"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Merchant name is required")
        with self._lock:
            item_id = f"MER-{self._seq:04d}"
            self._seq += 1
            obj = Merchant(item_id, cleaned)
            obj.validate()
            self._merchants[item_id] = obj
            log.info("[PaymentGatewayService.create_merchant] stored %s in _merchants (count=%s)", item_id, len(self._merchants))
            return obj

    def get_merchant(self, item_id: str) -> Merchant:
        with self._lock:
            obj = self._merchants.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Merchant id: {item_id}")
            log.info("[PaymentGatewayService.get_merchant] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_refund(self, name: str) -> Refund:
        """UML: PaymentGatewayService.create_refund(name) -> Refund"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Refund name is required")
        with self._lock:
            item_id = f"REF-{self._seq:04d}"
            self._seq += 1
            obj = Refund(item_id, cleaned)
            obj.validate()
            self._refunds[item_id] = obj
            log.info("[PaymentGatewayService.create_refund] stored %s in _refunds (count=%s)", item_id, len(self._refunds))
            return obj

    def get_refund(self, item_id: str) -> Refund:
        with self._lock:
            obj = self._refunds.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Refund id: {item_id}")
            log.info("[PaymentGatewayService.get_refund] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_payment(self, item_id: str) -> Payment:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._payments.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Payment id: {item_id}")
            log.info("[PaymentGatewayService.close_payment] closing %s via Payment.close()", item_id)
            obj.close()
            return obj

    def list_active_payments(self) -> List[Payment]:
        with self._lock:
            active = [o for o in self._payments.values() if o.status == "ACTIVE"]
            log.info("[PaymentGatewayService.list_active_payments] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct PaymentGatewayService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = PaymentGatewayService()

    log.info("========== STEP 2: Create primary Payment objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_payment("alpha-payment")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_payment("beta-payment")

    log.info("========== STEP 3: Create PaymentMethod (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_payment_method("sample-payment_method")

    log.info("========== STEP 4: Create Token (UML class) ==========")
    system.create_token("sample-token")

    log.info("========== STEP 5: Create Merchant (UML class) ==========")
    system.create_merchant("sample-merchant")

    log.info("========== STEP 6: Create Refund (UML class) ==========")
    system.create_refund("sample-refund")

    log.info("========== STEP 7: Inspect active Payment list ==========")
    system.list_active_payments()

    log.info("========== STEP 8: Close first Payment ==========")
    system.close_payment(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_payment(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Payment.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_payment("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_payment: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_payments()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Payment {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Payment(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Payment.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Payment.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Payment.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Payment " + id + " invalid status");
    }
    System.out.println("[Payment.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Payment " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Payment.close] id=" + id + " -> CLOSED");
  }
}


class PaymentMethod {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  PaymentMethod(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("PaymentMethod.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("PaymentMethod.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[PaymentMethod.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("PaymentMethod " + id + " invalid status");
    }
    System.out.println("[PaymentMethod.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("PaymentMethod " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[PaymentMethod.close] id=" + id + " -> CLOSED");
  }
}


class Token {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Token(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Token.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Token.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Token.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Token " + id + " invalid status");
    }
    System.out.println("[Token.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Token " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Token.close] id=" + id + " -> CLOSED");
  }
}


class Merchant {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Merchant(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Merchant.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Merchant.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Merchant.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Merchant " + id + " invalid status");
    }
    System.out.println("[Merchant.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Merchant " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Merchant.close] id=" + id + " -> CLOSED");
  }
}


class Refund {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Refund(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Refund.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Refund.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Refund.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Refund " + id + " invalid status");
    }
    System.out.println("[Refund.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Refund " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Refund.close] id=" + id + " -> CLOSED");
  }
}

public class PaymentGatewayService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Payment> payments = new LinkedHashMap<>();
  private final Map<String, PaymentMethod> payment_methods = new LinkedHashMap<>();
  private final Map<String, Token> tokens = new LinkedHashMap<>();
  private final Map<String, Merchant> merchants = new LinkedHashMap<>();
  private final Map<String, Refund> refunds = new LinkedHashMap<>();

  public PaymentGatewayService() {
    System.out.println("[PaymentGatewayService.__init__] system ready");
  }

  public Payment createPayment(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Payment name required");
    }
    lock.lock();
    try {
      String id = String.format("PAY-%04d", seq++);
      Payment obj = new Payment(id, name.trim());
      obj.validate();
      payments.put(id, obj);
      System.out.println("[PaymentGatewayService.createPayment] stored " + id + " count=" + payments.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Payment getPayment(String id) {
    lock.lock();
    try {
      Payment obj = payments.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Payment id: " + id);
      }
      System.out.println("[PaymentGatewayService.getPayment] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public PaymentMethod createPaymentMethod(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("PaymentMethod name required");
    }
    lock.lock();
    try {
      String id = String.format("PAY-%04d", seq++);
      PaymentMethod obj = new PaymentMethod(id, name.trim());
      obj.validate();
      payment_methods.put(id, obj);
      System.out.println("[PaymentGatewayService.createPaymentMethod] stored " + id + " count=" + payment_methods.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public PaymentMethod getPaymentMethod(String id) {
    lock.lock();
    try {
      PaymentMethod obj = payment_methods.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown PaymentMethod id: " + id);
      }
      System.out.println("[PaymentGatewayService.getPaymentMethod] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Token createToken(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Token name required");
    }
    lock.lock();
    try {
      String id = String.format("TOK-%04d", seq++);
      Token obj = new Token(id, name.trim());
      obj.validate();
      tokens.put(id, obj);
      System.out.println("[PaymentGatewayService.createToken] stored " + id + " count=" + tokens.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Token getToken(String id) {
    lock.lock();
    try {
      Token obj = tokens.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Token id: " + id);
      }
      System.out.println("[PaymentGatewayService.getToken] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Merchant createMerchant(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Merchant name required");
    }
    lock.lock();
    try {
      String id = String.format("MER-%04d", seq++);
      Merchant obj = new Merchant(id, name.trim());
      obj.validate();
      merchants.put(id, obj);
      System.out.println("[PaymentGatewayService.createMerchant] stored " + id + " count=" + merchants.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Merchant getMerchant(String id) {
    lock.lock();
    try {
      Merchant obj = merchants.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Merchant id: " + id);
      }
      System.out.println("[PaymentGatewayService.getMerchant] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Refund createRefund(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Refund name required");
    }
    lock.lock();
    try {
      String id = String.format("REF-%04d", seq++);
      Refund obj = new Refund(id, name.trim());
      obj.validate();
      refunds.put(id, obj);
      System.out.println("[PaymentGatewayService.createRefund] stored " + id + " count=" + refunds.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Refund getRefund(String id) {
    lock.lock();
    try {
      Refund obj = refunds.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Refund id: " + id);
      }
      System.out.println("[PaymentGatewayService.getRefund] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Payment closePayment(String id) {
    lock.lock();
    try {
      Payment obj = payments.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Payment id: " + id);
      }
      System.out.println("[PaymentGatewayService.closePayment] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Payment> listActivePayments() {
    lock.lock();
    try {
      List<Payment> out = new ArrayList<>();
      for (Payment o : payments.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[PaymentGatewayService.listActivePayments] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct PaymentGatewayService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    PaymentGatewayService system = new PaymentGatewayService();
    System.out.println("========== STEP 2: Create Payment objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Payment first = system.createPayment("alpha-payment");
    system.createPayment("beta-payment");
    System.out.println("========== STEP 3: Create PaymentMethod ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createPaymentMethod("sample-payment_method");
    System.out.println("========== STEP 4: Create Token ==========");
    system.createToken("sample-token");
    System.out.println("========== STEP 5: Create Merchant ==========");
    system.createMerchant("sample-merchant");
    System.out.println("========== STEP 6: Create Refund ==========");
    system.createRefund("sample-refund");
    System.out.println("========== Inspect active list ==========");
    system.listActivePayments();
    System.out.println("========== Close first Payment ==========");
    system.closePayment(first.getId());
    try {
      system.closePayment(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getPayment("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Payment {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Payment.id required')
    }

    if (!name?.trim()) {
      throw new Error('Payment.name required')
    }
    console.log(\`[Payment.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Payment \${this.id} invalid status\`)
    }
    console.log(\`[Payment.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Payment \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Payment.close] id=\${this.id} -> CLOSED\`)
  }
}


class PaymentMethod {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('PaymentMethod.id required')
    }

    if (!name?.trim()) {
      throw new Error('PaymentMethod.name required')
    }
    console.log(\`[PaymentMethod.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`PaymentMethod \${this.id} invalid status\`)
    }
    console.log(\`[PaymentMethod.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`PaymentMethod \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[PaymentMethod.close] id=\${this.id} -> CLOSED\`)
  }
}


class Token {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Token.id required')
    }

    if (!name?.trim()) {
      throw new Error('Token.name required')
    }
    console.log(\`[Token.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Token \${this.id} invalid status\`)
    }
    console.log(\`[Token.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Token \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Token.close] id=\${this.id} -> CLOSED\`)
  }
}


class Merchant {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Merchant.id required')
    }

    if (!name?.trim()) {
      throw new Error('Merchant.name required')
    }
    console.log(\`[Merchant.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Merchant \${this.id} invalid status\`)
    }
    console.log(\`[Merchant.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Merchant \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Merchant.close] id=\${this.id} -> CLOSED\`)
  }
}


class Refund {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Refund.id required')
    }

    if (!name?.trim()) {
      throw new Error('Refund.name required')
    }
    console.log(\`[Refund.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Refund \${this.id} invalid status\`)
    }
    console.log(\`[Refund.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Refund \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Refund.close] id=\${this.id} -> CLOSED\`)
  }
}

class PaymentGatewayService {
  private seq = 1
  private payments = new Map<string, Payment>()
  private payment_methods = new Map<string, PaymentMethod>()
  private tokens = new Map<string, Token>()
  private merchants = new Map<string, Merchant>()
  private refunds = new Map<string, Refund>()
  constructor() {
    console.log('[PaymentGatewayService.__init__] system ready')
  }

  createPayment(name: string): Payment {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Payment name required')
    }
    const id = \`PAY-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Payment(id, cleaned)
    obj.validate()
    this.payments.set(id, obj)
    console.log(\`[PaymentGatewayService.createPayment] stored \${id} count=\${this.payments.size}\`)
    return obj
  }

  getPayment(id: string): Payment {
    const obj = this.payments.get(id)
    if (!obj) {
      throw new Error(\`unknown Payment id: \${id}\`)
    }
    console.log(\`[PaymentGatewayService.getPayment] found id=\${obj.id}\`)
    return obj
  }

  createPaymentMethod(name: string): PaymentMethod {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('PaymentMethod name required')
    }
    const id = \`PAY-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new PaymentMethod(id, cleaned)
    obj.validate()
    this.payment_methods.set(id, obj)
    console.log(\`[PaymentGatewayService.createPaymentMethod] stored \${id} count=\${this.payment_methods.size}\`)
    return obj
  }

  getPaymentMethod(id: string): PaymentMethod {
    const obj = this.payment_methods.get(id)
    if (!obj) {
      throw new Error(\`unknown PaymentMethod id: \${id}\`)
    }
    console.log(\`[PaymentGatewayService.getPaymentMethod] found id=\${obj.id}\`)
    return obj
  }

  createToken(name: string): Token {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Token name required')
    }
    const id = \`TOK-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Token(id, cleaned)
    obj.validate()
    this.tokens.set(id, obj)
    console.log(\`[PaymentGatewayService.createToken] stored \${id} count=\${this.tokens.size}\`)
    return obj
  }

  getToken(id: string): Token {
    const obj = this.tokens.get(id)
    if (!obj) {
      throw new Error(\`unknown Token id: \${id}\`)
    }
    console.log(\`[PaymentGatewayService.getToken] found id=\${obj.id}\`)
    return obj
  }

  createMerchant(name: string): Merchant {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Merchant name required')
    }
    const id = \`MER-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Merchant(id, cleaned)
    obj.validate()
    this.merchants.set(id, obj)
    console.log(\`[PaymentGatewayService.createMerchant] stored \${id} count=\${this.merchants.size}\`)
    return obj
  }

  getMerchant(id: string): Merchant {
    const obj = this.merchants.get(id)
    if (!obj) {
      throw new Error(\`unknown Merchant id: \${id}\`)
    }
    console.log(\`[PaymentGatewayService.getMerchant] found id=\${obj.id}\`)
    return obj
  }

  createRefund(name: string): Refund {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Refund name required')
    }
    const id = \`REF-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Refund(id, cleaned)
    obj.validate()
    this.refunds.set(id, obj)
    console.log(\`[PaymentGatewayService.createRefund] stored \${id} count=\${this.refunds.size}\`)
    return obj
  }

  getRefund(id: string): Refund {
    const obj = this.refunds.get(id)
    if (!obj) {
      throw new Error(\`unknown Refund id: \${id}\`)
    }
    console.log(\`[PaymentGatewayService.getRefund] found id=\${obj.id}\`)
    return obj
  }

  closePayment(id: string): Payment {
    const obj = this.getPayment(id)
    console.log(\`[PaymentGatewayService.closePayment] closing \${id}\`)
    obj.close()
    return obj
  }

  listActivePayments(): Payment[] {
    const active = [...this.payments.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[PaymentGatewayService.listActivePayments] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct PaymentGatewayService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new PaymentGatewayService()
  console.log('========== STEP 2: Create Payment objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createPayment('alpha-payment')
  system.createPayment('beta-payment')
  console.log('========== STEP 3: Create PaymentMethod ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createPaymentMethod('sample-payment_method')
  console.log('========== STEP 4: Create Token ==========')
  system.createToken('sample-token')
  console.log('========== STEP 5: Create Merchant ==========')
  system.createMerchant('sample-merchant')
  console.log('========== STEP 6: Create Refund ==========')
  system.createRefund('sample-refund')
  system.listActivePayments()
  console.log('========== Close first Payment ==========')
  system.closePayment(first.id)
  try {
    system.closePayment(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getPayment('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Payment {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Payment(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Payment requires id and name");
    }
    cout << "[Payment.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Payment invalid status");
    }
    cout << "[Payment.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Payment cannot close");
    }
    status_ = "CLOSED";
    cout << "[Payment.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class PaymentMethod {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  PaymentMethod(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("PaymentMethod requires id and name");
    }
    cout << "[PaymentMethod.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("PaymentMethod invalid status");
    }
    cout << "[PaymentMethod.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("PaymentMethod cannot close");
    }
    status_ = "CLOSED";
    cout << "[PaymentMethod.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Token {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Token(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Token requires id and name");
    }
    cout << "[Token.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Token invalid status");
    }
    cout << "[Token.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Token cannot close");
    }
    status_ = "CLOSED";
    cout << "[Token.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Merchant {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Merchant(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Merchant requires id and name");
    }
    cout << "[Merchant.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Merchant invalid status");
    }
    cout << "[Merchant.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Merchant cannot close");
    }
    status_ = "CLOSED";
    cout << "[Merchant.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Refund {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Refund(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Refund requires id and name");
    }
    cout << "[Refund.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Refund invalid status");
    }
    cout << "[Refund.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Refund cannot close");
    }
    status_ = "CLOSED";
    cout << "[Refund.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class PaymentGatewayService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Payment> payments_;
  unordered_map<string, PaymentMethod> payment_methods_;
  unordered_map<string, Token> tokens_;
  unordered_map<string, Merchant> merchants_;
  unordered_map<string, Refund> refunds_;
public:
  PaymentGatewayService() {
    cout << "[PaymentGatewayService.__init__] system ready" << endl;
  }

  Payment createPayment(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Payment name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PAY-%04d", seq_++);
    Payment obj{buf, name};
    obj.validate();
    payments_.emplace(obj.id(), obj);
    cout << "[PaymentGatewayService.createPayment] stored " << obj.id() << endl;
    return obj;
  }

  Payment getPayment(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = payments_.find(id);
    if (it == payments_.end()) {
      throw out_of_range("unknown Payment id");
    }
    cout << "[PaymentGatewayService.getPayment] found " << id << endl;
    return it->second;
  }

  PaymentMethod createPaymentMethod(const string& name) {
    if (name.empty()) {
      throw invalid_argument("PaymentMethod name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PAY-%04d", seq_++);
    PaymentMethod obj{buf, name};
    obj.validate();
    payment_methods_.emplace(obj.id(), obj);
    cout << "[PaymentGatewayService.createPaymentMethod] stored " << obj.id() << endl;
    return obj;
  }

  PaymentMethod getPaymentMethod(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = payment_methods_.find(id);
    if (it == payment_methods_.end()) {
      throw out_of_range("unknown PaymentMethod id");
    }
    cout << "[PaymentGatewayService.getPaymentMethod] found " << id << endl;
    return it->second;
  }

  Token createToken(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Token name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TOK-%04d", seq_++);
    Token obj{buf, name};
    obj.validate();
    tokens_.emplace(obj.id(), obj);
    cout << "[PaymentGatewayService.createToken] stored " << obj.id() << endl;
    return obj;
  }

  Token getToken(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = tokens_.find(id);
    if (it == tokens_.end()) {
      throw out_of_range("unknown Token id");
    }
    cout << "[PaymentGatewayService.getToken] found " << id << endl;
    return it->second;
  }

  Merchant createMerchant(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Merchant name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MER-%04d", seq_++);
    Merchant obj{buf, name};
    obj.validate();
    merchants_.emplace(obj.id(), obj);
    cout << "[PaymentGatewayService.createMerchant] stored " << obj.id() << endl;
    return obj;
  }

  Merchant getMerchant(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = merchants_.find(id);
    if (it == merchants_.end()) {
      throw out_of_range("unknown Merchant id");
    }
    cout << "[PaymentGatewayService.getMerchant] found " << id << endl;
    return it->second;
  }

  Refund createRefund(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Refund name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "REF-%04d", seq_++);
    Refund obj{buf, name};
    obj.validate();
    refunds_.emplace(obj.id(), obj);
    cout << "[PaymentGatewayService.createRefund] stored " << obj.id() << endl;
    return obj;
  }

  Refund getRefund(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = refunds_.find(id);
    if (it == refunds_.end()) {
      throw out_of_range("unknown Refund id");
    }
    cout << "[PaymentGatewayService.getRefund] found " << id << endl;
    return it->second;
  }

  Payment closePayment(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = payments_.find(id);
    if (it == payments_.end()) {
      throw out_of_range("unknown Payment");
    }
    cout << "[PaymentGatewayService.closePayment] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct PaymentGatewayService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  PaymentGatewayService system;
  cout << "========== STEP 2: Create Payment ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createPayment("alpha-payment");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createPayment("beta-payment");
  system.createPaymentMethod("sample-payment_method");
  system.createToken("sample-token");
  system.createMerchant("sample-merchant");
  system.createRefund("sample-refund");
  system.closePayment(first.id());
  try {
    system.closePayment(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getPayment("MISSING-ID");
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

type Payment struct {
  ID     string
  Name   string
  Status string
}

func NewPayment(id, name string) (*Payment, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Payment requires id and name")
  }
  obj := &Payment{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Payment.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Payment) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Payment invalid status")
  }
  fmt.Printf("[Payment.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Payment) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Payment %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Payment.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type PaymentMethod struct {
  ID     string
  Name   string
  Status string
}

func NewPaymentMethod(id, name string) (*PaymentMethod, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("PaymentMethod requires id and name")
  }
  obj := &PaymentMethod{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[PaymentMethod.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *PaymentMethod) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("PaymentMethod invalid status")
  }
  fmt.Printf("[PaymentMethod.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *PaymentMethod) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("PaymentMethod %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[PaymentMethod.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Token struct {
  ID     string
  Name   string
  Status string
}

func NewToken(id, name string) (*Token, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Token requires id and name")
  }
  obj := &Token{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Token.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Token) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Token invalid status")
  }
  fmt.Printf("[Token.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Token) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Token %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Token.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Merchant struct {
  ID     string
  Name   string
  Status string
}

func NewMerchant(id, name string) (*Merchant, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Merchant requires id and name")
  }
  obj := &Merchant{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Merchant.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Merchant) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Merchant invalid status")
  }
  fmt.Printf("[Merchant.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Merchant) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Merchant %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Merchant.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Refund struct {
  ID     string
  Name   string
  Status string
}

func NewRefund(id, name string) (*Refund, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Refund requires id and name")
  }
  obj := &Refund{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Refund.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Refund) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Refund invalid status")
  }
  fmt.Printf("[Refund.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Refund) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Refund %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Refund.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type PaymentGatewayService struct {
  mu  sync.Mutex
  seq int
  payments map[string]*Payment
  payment_methods map[string]*PaymentMethod
  tokens map[string]*Token
  merchants map[string]*Merchant
  refunds map[string]*Refund
}

func NewPaymentGatewayService() *PaymentGatewayService {
  fmt.Println("[PaymentGatewayService.__init__] system ready")
  return &PaymentGatewayService{
    seq: 1,
    payments: map[string]*Payment{},
    payment_methods: map[string]*PaymentMethod{},
    tokens: map[string]*Token{},
    merchants: map[string]*Merchant{},
    refunds: map[string]*Refund{},
  }
}

func (s *PaymentGatewayService) CreatePayment(name string) (*Payment, error) {
  if name == "" {
    return nil, fmt.Errorf("Payment name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PAY-%04d", s.seq)
  s.seq++
  obj, err := NewPayment(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.payments[id] = obj
  fmt.Printf("[PaymentGatewayService.CreatePayment] stored %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) GetPayment(id string) (*Payment, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.payments[id]
  if !ok {
    return nil, fmt.Errorf("unknown Payment id: %s", id)
  }
  fmt.Printf("[PaymentGatewayService.GetPayment] found %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) CreatePaymentMethod(name string) (*PaymentMethod, error) {
  if name == "" {
    return nil, fmt.Errorf("PaymentMethod name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PAY-%04d", s.seq)
  s.seq++
  obj, err := NewPaymentMethod(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.payment_methods[id] = obj
  fmt.Printf("[PaymentGatewayService.CreatePaymentMethod] stored %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) GetPaymentMethod(id string) (*PaymentMethod, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.payment_methods[id]
  if !ok {
    return nil, fmt.Errorf("unknown PaymentMethod id: %s", id)
  }
  fmt.Printf("[PaymentGatewayService.GetPaymentMethod] found %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) CreateToken(name string) (*Token, error) {
  if name == "" {
    return nil, fmt.Errorf("Token name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TOK-%04d", s.seq)
  s.seq++
  obj, err := NewToken(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.tokens[id] = obj
  fmt.Printf("[PaymentGatewayService.CreateToken] stored %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) GetToken(id string) (*Token, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.tokens[id]
  if !ok {
    return nil, fmt.Errorf("unknown Token id: %s", id)
  }
  fmt.Printf("[PaymentGatewayService.GetToken] found %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) CreateMerchant(name string) (*Merchant, error) {
  if name == "" {
    return nil, fmt.Errorf("Merchant name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MER-%04d", s.seq)
  s.seq++
  obj, err := NewMerchant(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.merchants[id] = obj
  fmt.Printf("[PaymentGatewayService.CreateMerchant] stored %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) GetMerchant(id string) (*Merchant, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.merchants[id]
  if !ok {
    return nil, fmt.Errorf("unknown Merchant id: %s", id)
  }
  fmt.Printf("[PaymentGatewayService.GetMerchant] found %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) CreateRefund(name string) (*Refund, error) {
  if name == "" {
    return nil, fmt.Errorf("Refund name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("REF-%04d", s.seq)
  s.seq++
  obj, err := NewRefund(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.refunds[id] = obj
  fmt.Printf("[PaymentGatewayService.CreateRefund] stored %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) GetRefund(id string) (*Refund, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.refunds[id]
  if !ok {
    return nil, fmt.Errorf("unknown Refund id: %s", id)
  }
  fmt.Printf("[PaymentGatewayService.GetRefund] found %s\\n", id)
  return obj, nil
}

func (s *PaymentGatewayService) ClosePayment(id string) (*Payment, error) {
  obj, err := s.GetPayment(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[PaymentGatewayService.ClosePayment] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct PaymentGatewayService ==========")
  system := NewPaymentGatewayService()
  fmt.Println("========== STEP 2: Create Payment ==========")
  first, _ := system.CreatePayment("alpha-payment")
  system.CreatePayment("beta-payment")
  system.CreatePaymentMethod("sample-payment_method")
  system.CreateToken("sample-token")
  system.CreateMerchant("sample-merchant")
  system.CreateRefund("sample-refund")
  system.ClosePayment(first.ID)
  if _, err := system.ClosePayment(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetPayment("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Payment {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Payment(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Payment requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Payment.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Payment invalid status");
    }
    Console.WriteLine("[Payment.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Payment " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Payment.close] id=" + Id + " -> CLOSED");
  }
}


sealed class PaymentMethod {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public PaymentMethod(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("PaymentMethod requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[PaymentMethod.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("PaymentMethod invalid status");
    }
    Console.WriteLine("[PaymentMethod.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("PaymentMethod " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[PaymentMethod.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Token {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Token(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Token requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Token.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Token invalid status");
    }
    Console.WriteLine("[Token.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Token " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Token.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Merchant {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Merchant(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Merchant requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Merchant.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Merchant invalid status");
    }
    Console.WriteLine("[Merchant.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Merchant " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Merchant.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Refund {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Refund(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Refund requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Refund.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Refund invalid status");
    }
    Console.WriteLine("[Refund.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Refund " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Refund.close] id=" + Id + " -> CLOSED");
  }
}

sealed class PaymentGatewayService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Payment> _payments = new();
  private readonly Dictionary<string, PaymentMethod> _payment_methods = new();
  private readonly Dictionary<string, Token> _tokens = new();
  private readonly Dictionary<string, Merchant> _merchants = new();
  private readonly Dictionary<string, Refund> _refunds = new();
  public PaymentGatewayService() {
    Console.WriteLine("[PaymentGatewayService.__init__] system ready");
  }

  public Payment CreatePayment(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Payment name required");
    }
    lock (_gate) {
      var id = string.Format("PAY-{0:D4}", _seq++);
      var obj = new Payment(id, name.Trim());
      obj.Validate();
      _payments[id] = obj;
      Console.WriteLine("[PaymentGatewayService.CreatePayment] stored " + id);
      return obj;
    }
  }

  public Payment GetPayment(string id) {
    lock (_gate) {
      if (!_payments.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Payment id: " + id);
      }
      Console.WriteLine("[PaymentGatewayService.GetPayment] found " + id);
      return obj;
    }
  }

  public PaymentMethod CreatePaymentMethod(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("PaymentMethod name required");
    }
    lock (_gate) {
      var id = string.Format("PAY-{0:D4}", _seq++);
      var obj = new PaymentMethod(id, name.Trim());
      obj.Validate();
      _payment_methods[id] = obj;
      Console.WriteLine("[PaymentGatewayService.CreatePaymentMethod] stored " + id);
      return obj;
    }
  }

  public PaymentMethod GetPaymentMethod(string id) {
    lock (_gate) {
      if (!_payment_methods.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown PaymentMethod id: " + id);
      }
      Console.WriteLine("[PaymentGatewayService.GetPaymentMethod] found " + id);
      return obj;
    }
  }

  public Token CreateToken(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Token name required");
    }
    lock (_gate) {
      var id = string.Format("TOK-{0:D4}", _seq++);
      var obj = new Token(id, name.Trim());
      obj.Validate();
      _tokens[id] = obj;
      Console.WriteLine("[PaymentGatewayService.CreateToken] stored " + id);
      return obj;
    }
  }

  public Token GetToken(string id) {
    lock (_gate) {
      if (!_tokens.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Token id: " + id);
      }
      Console.WriteLine("[PaymentGatewayService.GetToken] found " + id);
      return obj;
    }
  }

  public Merchant CreateMerchant(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Merchant name required");
    }
    lock (_gate) {
      var id = string.Format("MER-{0:D4}", _seq++);
      var obj = new Merchant(id, name.Trim());
      obj.Validate();
      _merchants[id] = obj;
      Console.WriteLine("[PaymentGatewayService.CreateMerchant] stored " + id);
      return obj;
    }
  }

  public Merchant GetMerchant(string id) {
    lock (_gate) {
      if (!_merchants.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Merchant id: " + id);
      }
      Console.WriteLine("[PaymentGatewayService.GetMerchant] found " + id);
      return obj;
    }
  }

  public Refund CreateRefund(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Refund name required");
    }
    lock (_gate) {
      var id = string.Format("REF-{0:D4}", _seq++);
      var obj = new Refund(id, name.Trim());
      obj.Validate();
      _refunds[id] = obj;
      Console.WriteLine("[PaymentGatewayService.CreateRefund] stored " + id);
      return obj;
    }
  }

  public Refund GetRefund(string id) {
    lock (_gate) {
      if (!_refunds.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Refund id: " + id);
      }
      Console.WriteLine("[PaymentGatewayService.GetRefund] found " + id);
      return obj;
    }
  }

  public Payment ClosePayment(string id) {
    var obj = GetPayment(id);
    Console.WriteLine("[PaymentGatewayService.ClosePayment] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct PaymentGatewayService ==========");
    var system = new PaymentGatewayService();
    Console.WriteLine("========== STEP 2: Create Payment ==========");
    var first = system.CreatePayment("alpha-payment");
    system.CreatePayment("beta-payment");
    system.CreatePaymentMethod("sample-payment_method");
    system.CreateToken("sample-token");
    system.CreateMerchant("sample-merchant");
    system.CreateRefund("sample-refund");
    system.ClosePayment(first.Id);
    try {
      system.ClosePayment(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetPayment("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const paymentGatewaySolution: ProblemSolution = {
  slug: 'payment-gateway',
  title: 'Payment Gateway (Stripe-like) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a payment gateway supporting card processing, refunds, fraud detection, and PCI-compliant tokenization at scale. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Accept card payments (credit, debit, prepaid)',
      'Tokenize card data — merchants never see raw card numbers (PCI DSS)',
      'Authorize, capture, and refund payments',
      'Support 3D Secure (OTP) for strong customer authentication',
      'Webhook notifications for payment events',
      'Retry failed payments with intelligent retry logic',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Accept card payments (credit, debit, prepaid)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Tokenize card data — merchants never see raw card numbers (PCI DSS)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Authorize, capture, and refund payments?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support 3D Secure (OTP) for strong customer authentication?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Webhook notifications for payment events?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. PaymentGatewayService is the facade stereotype. Payment, PaymentMethod, Token, Merchant, Refund are concrete domain classes with id/name/status and validate/close.',
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
          'Construct PaymentGatewayService.',
          'createPayment twice and create the related UML classes.',
          'closePayment once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'PaymentGatewayService', responsibility: 'UML facade - orchestrates Payment Gateway (Stripe-like).', keyMembers: ['create*', 'get*', 'closePayment'] },
    { name: 'Payment', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'PaymentMethod', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Token', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Merchant', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Refund', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from PaymentGatewayService to Payment, PaymentMethod, Token, Merchant, Refund. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on PaymentGatewayService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'PaymentGatewayService', responsibility: 'UML facade - orchestrates Payment Gateway (Stripe-like).', keyMembers: ['create*', 'get*', 'closePayment'] },
    { name: 'Payment', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'PaymentMethod', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Token', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Merchant', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Refund', responsibility: 'UML class - domain object for Payment Gateway (Stripe-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'PaymentGatewayService exposes create/get/close and owns composed collections.' },
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
      'main constructs PaymentGatewayService, creates UML domain objects, closes the primary Payment, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct PaymentGatewayService.',
      'createPayment for alpha and beta.',
      'create remaining UML classes.',
      'closePayment(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createPayment("alpha..."); closePayment(id)',
        output: '[Payment.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closePayment(alreadyClosed) or getPayment("MISSING-ID")',
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
