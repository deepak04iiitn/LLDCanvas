import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'DigitalWalletService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_wallets', 'Map<string, Wallet>'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_transactions', 'Map<string, Transaction>'),
    attr('-', '_amounts', 'Map<string, amount>'),
    attr('-', '_timestamps', 'Map<string, timestamp>'),
  ], [
    method('+', 'createWallet', 'name: string', 'Wallet'),
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createTransaction', 'name: string', 'Transaction'),
    method('+', 'createamount', 'name: string', 'amount'),
    method('+', 'createtimestamp', 'name: string', 'timestamp'),
    method('+', 'getWallet', 'id: string', 'Wallet'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getTransaction', 'id: string', 'Transaction'),
    method('+', 'getamount', 'id: string', 'amount'),
    method('+', 'gettimestamp', 'id: string', 'timestamp'),
    method('+', 'closeWallet', 'id: string', 'Wallet'),
  ], 'facade'),
  cls('n1', 'Wallet', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'User', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Transaction', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'amount', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'timestamp', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("digital-wallet")


class Wallet:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Wallet.id is required")
        if not name or not name.strip():
            raise ValueError("Wallet.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Wallet.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Wallet {self.id} has invalid status={self.status}")
        log.info("[Wallet.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Wallet {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Wallet.close] id=%s -> CLOSED", self.id)


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


class Transaction:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Transaction.id is required")
        if not name or not name.strip():
            raise ValueError("Transaction.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Transaction.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Transaction {self.id} has invalid status={self.status}")
        log.info("[Transaction.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Transaction {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Transaction.close] id=%s -> CLOSED", self.id)


class amount:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("amount.id is required")
        if not name or not name.strip():
            raise ValueError("amount.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[amount.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"amount {self.id} has invalid status={self.status}")
        log.info("[amount.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"amount {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[amount.close] id=%s -> CLOSED", self.id)


class timestamp:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("timestamp.id is required")
        if not name or not name.strip():
            raise ValueError("timestamp.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[timestamp.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"timestamp {self.id} has invalid status={self.status}")
        log.info("[timestamp.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"timestamp {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[timestamp.close] id=%s -> CLOSED", self.id)


class DigitalWalletService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._wallets: Dict[str, Wallet] = {}
        self._users: Dict[str, User] = {}
        self._transactions: Dict[str, Transaction] = {}
        self._amounts: Dict[str, amount] = {}
        self._timestamps: Dict[str, timestamp] = {}
        log.info("[DigitalWalletService.__init__] system ready; managing: Wallet, User, Transaction, amount, timestamp")

    def create_wallet(self, name: str) -> Wallet:
        """UML: DigitalWalletService.create_wallet(name) -> Wallet"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Wallet name is required")
        with self._lock:
            item_id = f"WAL-{self._seq:04d}"
            self._seq += 1
            obj = Wallet(item_id, cleaned)
            obj.validate()
            self._wallets[item_id] = obj
            log.info("[DigitalWalletService.create_wallet] stored %s in _wallets (count=%s)", item_id, len(self._wallets))
            return obj

    def get_wallet(self, item_id: str) -> Wallet:
        with self._lock:
            obj = self._wallets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Wallet id: {item_id}")
            log.info("[DigitalWalletService.get_wallet] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_user(self, name: str) -> User:
        """UML: DigitalWalletService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[DigitalWalletService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[DigitalWalletService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_transaction(self, name: str) -> Transaction:
        """UML: DigitalWalletService.create_transaction(name) -> Transaction"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Transaction name is required")
        with self._lock:
            item_id = f"TRA-{self._seq:04d}"
            self._seq += 1
            obj = Transaction(item_id, cleaned)
            obj.validate()
            self._transactions[item_id] = obj
            log.info("[DigitalWalletService.create_transaction] stored %s in _transactions (count=%s)", item_id, len(self._transactions))
            return obj

    def get_transaction(self, item_id: str) -> Transaction:
        with self._lock:
            obj = self._transactions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Transaction id: {item_id}")
            log.info("[DigitalWalletService.get_transaction] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_amount(self, name: str) -> amount:
        """UML: DigitalWalletService.create_amount(name) -> amount"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("amount name is required")
        with self._lock:
            item_id = f"AMO-{self._seq:04d}"
            self._seq += 1
            obj = amount(item_id, cleaned)
            obj.validate()
            self._amounts[item_id] = obj
            log.info("[DigitalWalletService.create_amount] stored %s in _amounts (count=%s)", item_id, len(self._amounts))
            return obj

    def get_amount(self, item_id: str) -> amount:
        with self._lock:
            obj = self._amounts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown amount id: {item_id}")
            log.info("[DigitalWalletService.get_amount] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_timestamp(self, name: str) -> timestamp:
        """UML: DigitalWalletService.create_timestamp(name) -> timestamp"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("timestamp name is required")
        with self._lock:
            item_id = f"TIM-{self._seq:04d}"
            self._seq += 1
            obj = timestamp(item_id, cleaned)
            obj.validate()
            self._timestamps[item_id] = obj
            log.info("[DigitalWalletService.create_timestamp] stored %s in _timestamps (count=%s)", item_id, len(self._timestamps))
            return obj

    def get_timestamp(self, item_id: str) -> timestamp:
        with self._lock:
            obj = self._timestamps.get(item_id)
            if obj is None:
                raise KeyError(f"unknown timestamp id: {item_id}")
            log.info("[DigitalWalletService.get_timestamp] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_wallet(self, item_id: str) -> Wallet:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._wallets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Wallet id: {item_id}")
            log.info("[DigitalWalletService.close_wallet] closing %s via Wallet.close()", item_id)
            obj.close()
            return obj

    def list_active_wallets(self) -> List[Wallet]:
        with self._lock:
            active = [o for o in self._wallets.values() if o.status == "ACTIVE"]
            log.info("[DigitalWalletService.list_active_wallets] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct DigitalWalletService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = DigitalWalletService()

    log.info("========== STEP 2: Create primary Wallet objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_wallet("alpha-wallet")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_wallet("beta-wallet")

    log.info("========== STEP 3: Create User (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_user("sample-user")

    log.info("========== STEP 4: Create Transaction (UML class) ==========")
    system.create_transaction("sample-transaction")

    log.info("========== STEP 5: Create amount (UML class) ==========")
    system.create_amount("sample-amount")

    log.info("========== STEP 6: Create timestamp (UML class) ==========")
    system.create_timestamp("sample-timestamp")

    log.info("========== STEP 7: Inspect active Wallet list ==========")
    system.list_active_wallets()

    log.info("========== STEP 8: Close first Wallet ==========")
    system.close_wallet(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_wallet(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Wallet.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_wallet("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_wallet: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_wallets()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Wallet {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Wallet(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Wallet.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Wallet.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Wallet.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Wallet " + id + " invalid status");
    }
    System.out.println("[Wallet.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Wallet " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Wallet.close] id=" + id + " -> CLOSED");
  }
}


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


class Transaction {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Transaction(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Transaction.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Transaction.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Transaction.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Transaction " + id + " invalid status");
    }
    System.out.println("[Transaction.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Transaction " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Transaction.close] id=" + id + " -> CLOSED");
  }
}


class amount {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  amount(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("amount.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("amount.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[amount.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("amount " + id + " invalid status");
    }
    System.out.println("[amount.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("amount " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[amount.close] id=" + id + " -> CLOSED");
  }
}


class timestamp {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  timestamp(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("timestamp.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("timestamp.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[timestamp.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("timestamp " + id + " invalid status");
    }
    System.out.println("[timestamp.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("timestamp " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[timestamp.close] id=" + id + " -> CLOSED");
  }
}

public class DigitalWalletService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Wallet> wallets = new LinkedHashMap<>();
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Transaction> transactions = new LinkedHashMap<>();
  private final Map<String, amount> amounts = new LinkedHashMap<>();
  private final Map<String, timestamp> timestamps = new LinkedHashMap<>();

  public DigitalWalletService() {
    System.out.println("[DigitalWalletService.__init__] system ready");
  }

  public Wallet createWallet(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Wallet name required");
    }
    lock.lock();
    try {
      String id = String.format("WAL-%04d", seq++);
      Wallet obj = new Wallet(id, name.trim());
      obj.validate();
      wallets.put(id, obj);
      System.out.println("[DigitalWalletService.createWallet] stored " + id + " count=" + wallets.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Wallet getWallet(String id) {
    lock.lock();
    try {
      Wallet obj = wallets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Wallet id: " + id);
      }
      System.out.println("[DigitalWalletService.getWallet] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
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
      System.out.println("[DigitalWalletService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[DigitalWalletService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Transaction createTransaction(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Transaction name required");
    }
    lock.lock();
    try {
      String id = String.format("TRA-%04d", seq++);
      Transaction obj = new Transaction(id, name.trim());
      obj.validate();
      transactions.put(id, obj);
      System.out.println("[DigitalWalletService.createTransaction] stored " + id + " count=" + transactions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Transaction getTransaction(String id) {
    lock.lock();
    try {
      Transaction obj = transactions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Transaction id: " + id);
      }
      System.out.println("[DigitalWalletService.getTransaction] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public amount createamount(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("amount name required");
    }
    lock.lock();
    try {
      String id = String.format("AMO-%04d", seq++);
      amount obj = new amount(id, name.trim());
      obj.validate();
      amounts.put(id, obj);
      System.out.println("[DigitalWalletService.createamount] stored " + id + " count=" + amounts.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public amount getamount(String id) {
    lock.lock();
    try {
      amount obj = amounts.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown amount id: " + id);
      }
      System.out.println("[DigitalWalletService.getamount] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public timestamp createtimestamp(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("timestamp name required");
    }
    lock.lock();
    try {
      String id = String.format("TIM-%04d", seq++);
      timestamp obj = new timestamp(id, name.trim());
      obj.validate();
      timestamps.put(id, obj);
      System.out.println("[DigitalWalletService.createtimestamp] stored " + id + " count=" + timestamps.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public timestamp gettimestamp(String id) {
    lock.lock();
    try {
      timestamp obj = timestamps.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown timestamp id: " + id);
      }
      System.out.println("[DigitalWalletService.gettimestamp] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Wallet closeWallet(String id) {
    lock.lock();
    try {
      Wallet obj = wallets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Wallet id: " + id);
      }
      System.out.println("[DigitalWalletService.closeWallet] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Wallet> listActiveWallets() {
    lock.lock();
    try {
      List<Wallet> out = new ArrayList<>();
      for (Wallet o : wallets.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[DigitalWalletService.listActiveWallets] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct DigitalWalletService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    DigitalWalletService system = new DigitalWalletService();
    System.out.println("========== STEP 2: Create Wallet objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Wallet first = system.createWallet("alpha-wallet");
    system.createWallet("beta-wallet");
    System.out.println("========== STEP 3: Create User ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createUser("sample-user");
    System.out.println("========== STEP 4: Create Transaction ==========");
    system.createTransaction("sample-transaction");
    System.out.println("========== STEP 5: Create amount ==========");
    system.createamount("sample-amount");
    System.out.println("========== STEP 6: Create timestamp ==========");
    system.createtimestamp("sample-timestamp");
    System.out.println("========== Inspect active list ==========");
    system.listActiveWallets();
    System.out.println("========== Close first Wallet ==========");
    system.closeWallet(first.getId());
    try {
      system.closeWallet(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getWallet("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Wallet {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Wallet.id required')
    }

    if (!name?.trim()) {
      throw new Error('Wallet.name required')
    }
    console.log(\`[Wallet.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Wallet \${this.id} invalid status\`)
    }
    console.log(\`[Wallet.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Wallet \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Wallet.close] id=\${this.id} -> CLOSED\`)
  }
}


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


class Transaction {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Transaction.id required')
    }

    if (!name?.trim()) {
      throw new Error('Transaction.name required')
    }
    console.log(\`[Transaction.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Transaction \${this.id} invalid status\`)
    }
    console.log(\`[Transaction.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Transaction \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Transaction.close] id=\${this.id} -> CLOSED\`)
  }
}


class amount {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('amount.id required')
    }

    if (!name?.trim()) {
      throw new Error('amount.name required')
    }
    console.log(\`[amount.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`amount \${this.id} invalid status\`)
    }
    console.log(\`[amount.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`amount \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[amount.close] id=\${this.id} -> CLOSED\`)
  }
}


class timestamp {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('timestamp.id required')
    }

    if (!name?.trim()) {
      throw new Error('timestamp.name required')
    }
    console.log(\`[timestamp.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`timestamp \${this.id} invalid status\`)
    }
    console.log(\`[timestamp.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`timestamp \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[timestamp.close] id=\${this.id} -> CLOSED\`)
  }
}

class DigitalWalletService {
  private seq = 1
  private wallets = new Map<string, Wallet>()
  private users = new Map<string, User>()
  private transactions = new Map<string, Transaction>()
  private amounts = new Map<string, amount>()
  private timestamps = new Map<string, timestamp>()
  constructor() {
    console.log('[DigitalWalletService.__init__] system ready')
  }

  createWallet(name: string): Wallet {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Wallet name required')
    }
    const id = \`WAL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Wallet(id, cleaned)
    obj.validate()
    this.wallets.set(id, obj)
    console.log(\`[DigitalWalletService.createWallet] stored \${id} count=\${this.wallets.size}\`)
    return obj
  }

  getWallet(id: string): Wallet {
    const obj = this.wallets.get(id)
    if (!obj) {
      throw new Error(\`unknown Wallet id: \${id}\`)
    }
    console.log(\`[DigitalWalletService.getWallet] found id=\${obj.id}\`)
    return obj
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
    console.log(\`[DigitalWalletService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[DigitalWalletService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createTransaction(name: string): Transaction {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Transaction name required')
    }
    const id = \`TRA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Transaction(id, cleaned)
    obj.validate()
    this.transactions.set(id, obj)
    console.log(\`[DigitalWalletService.createTransaction] stored \${id} count=\${this.transactions.size}\`)
    return obj
  }

  getTransaction(id: string): Transaction {
    const obj = this.transactions.get(id)
    if (!obj) {
      throw new Error(\`unknown Transaction id: \${id}\`)
    }
    console.log(\`[DigitalWalletService.getTransaction] found id=\${obj.id}\`)
    return obj
  }

  createamount(name: string): amount {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('amount name required')
    }
    const id = \`AMO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new amount(id, cleaned)
    obj.validate()
    this.amounts.set(id, obj)
    console.log(\`[DigitalWalletService.createamount] stored \${id} count=\${this.amounts.size}\`)
    return obj
  }

  getamount(id: string): amount {
    const obj = this.amounts.get(id)
    if (!obj) {
      throw new Error(\`unknown amount id: \${id}\`)
    }
    console.log(\`[DigitalWalletService.getamount] found id=\${obj.id}\`)
    return obj
  }

  createtimestamp(name: string): timestamp {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('timestamp name required')
    }
    const id = \`TIM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new timestamp(id, cleaned)
    obj.validate()
    this.timestamps.set(id, obj)
    console.log(\`[DigitalWalletService.createtimestamp] stored \${id} count=\${this.timestamps.size}\`)
    return obj
  }

  gettimestamp(id: string): timestamp {
    const obj = this.timestamps.get(id)
    if (!obj) {
      throw new Error(\`unknown timestamp id: \${id}\`)
    }
    console.log(\`[DigitalWalletService.gettimestamp] found id=\${obj.id}\`)
    return obj
  }

  closeWallet(id: string): Wallet {
    const obj = this.getWallet(id)
    console.log(\`[DigitalWalletService.closeWallet] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveWallets(): Wallet[] {
    const active = [...this.wallets.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[DigitalWalletService.listActiveWallets] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct DigitalWalletService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new DigitalWalletService()
  console.log('========== STEP 2: Create Wallet objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createWallet('alpha-wallet')
  system.createWallet('beta-wallet')
  console.log('========== STEP 3: Create User ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createUser('sample-user')
  console.log('========== STEP 4: Create Transaction ==========')
  system.createTransaction('sample-transaction')
  console.log('========== STEP 5: Create amount ==========')
  system.createamount('sample-amount')
  console.log('========== STEP 6: Create timestamp ==========')
  system.createtimestamp('sample-timestamp')
  system.listActiveWallets()
  console.log('========== Close first Wallet ==========')
  system.closeWallet(first.id)
  try {
    system.closeWallet(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getWallet('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Wallet {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Wallet(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Wallet requires id and name");
    }
    cout << "[Wallet.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Wallet invalid status");
    }
    cout << "[Wallet.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Wallet cannot close");
    }
    status_ = "CLOSED";
    cout << "[Wallet.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


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


class Transaction {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Transaction(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Transaction requires id and name");
    }
    cout << "[Transaction.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Transaction invalid status");
    }
    cout << "[Transaction.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Transaction cannot close");
    }
    status_ = "CLOSED";
    cout << "[Transaction.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class amount {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  amount(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("amount requires id and name");
    }
    cout << "[amount.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("amount invalid status");
    }
    cout << "[amount.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("amount cannot close");
    }
    status_ = "CLOSED";
    cout << "[amount.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class timestamp {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  timestamp(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("timestamp requires id and name");
    }
    cout << "[timestamp.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("timestamp invalid status");
    }
    cout << "[timestamp.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("timestamp cannot close");
    }
    status_ = "CLOSED";
    cout << "[timestamp.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class DigitalWalletService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Wallet> wallets_;
  unordered_map<string, User> users_;
  unordered_map<string, Transaction> transactions_;
  unordered_map<string, amount> amounts_;
  unordered_map<string, timestamp> timestamps_;
public:
  DigitalWalletService() {
    cout << "[DigitalWalletService.__init__] system ready" << endl;
  }

  Wallet createWallet(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Wallet name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "WAL-%04d", seq_++);
    Wallet obj{buf, name};
    obj.validate();
    wallets_.emplace(obj.id(), obj);
    cout << "[DigitalWalletService.createWallet] stored " << obj.id() << endl;
    return obj;
  }

  Wallet getWallet(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = wallets_.find(id);
    if (it == wallets_.end()) {
      throw out_of_range("unknown Wallet id");
    }
    cout << "[DigitalWalletService.getWallet] found " << id << endl;
    return it->second;
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
    cout << "[DigitalWalletService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[DigitalWalletService.getUser] found " << id << endl;
    return it->second;
  }

  Transaction createTransaction(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Transaction name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TRA-%04d", seq_++);
    Transaction obj{buf, name};
    obj.validate();
    transactions_.emplace(obj.id(), obj);
    cout << "[DigitalWalletService.createTransaction] stored " << obj.id() << endl;
    return obj;
  }

  Transaction getTransaction(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = transactions_.find(id);
    if (it == transactions_.end()) {
      throw out_of_range("unknown Transaction id");
    }
    cout << "[DigitalWalletService.getTransaction] found " << id << endl;
    return it->second;
  }

  amount createamount(const string& name) {
    if (name.empty()) {
      throw invalid_argument("amount name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "AMO-%04d", seq_++);
    amount obj{buf, name};
    obj.validate();
    amounts_.emplace(obj.id(), obj);
    cout << "[DigitalWalletService.createamount] stored " << obj.id() << endl;
    return obj;
  }

  amount getamount(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = amounts_.find(id);
    if (it == amounts_.end()) {
      throw out_of_range("unknown amount id");
    }
    cout << "[DigitalWalletService.getamount] found " << id << endl;
    return it->second;
  }

  timestamp createtimestamp(const string& name) {
    if (name.empty()) {
      throw invalid_argument("timestamp name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TIM-%04d", seq_++);
    timestamp obj{buf, name};
    obj.validate();
    timestamps_.emplace(obj.id(), obj);
    cout << "[DigitalWalletService.createtimestamp] stored " << obj.id() << endl;
    return obj;
  }

  timestamp gettimestamp(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = timestamps_.find(id);
    if (it == timestamps_.end()) {
      throw out_of_range("unknown timestamp id");
    }
    cout << "[DigitalWalletService.gettimestamp] found " << id << endl;
    return it->second;
  }

  Wallet closeWallet(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = wallets_.find(id);
    if (it == wallets_.end()) {
      throw out_of_range("unknown Wallet");
    }
    cout << "[DigitalWalletService.closeWallet] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct DigitalWalletService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  DigitalWalletService system;
  cout << "========== STEP 2: Create Wallet ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createWallet("alpha-wallet");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createWallet("beta-wallet");
  system.createUser("sample-user");
  system.createTransaction("sample-transaction");
  system.createamount("sample-amount");
  system.createtimestamp("sample-timestamp");
  system.closeWallet(first.id());
  try {
    system.closeWallet(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getWallet("MISSING-ID");
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

type Wallet struct {
  ID     string
  Name   string
  Status string
}

func NewWallet(id, name string) (*Wallet, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Wallet requires id and name")
  }
  obj := &Wallet{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Wallet.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Wallet) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Wallet invalid status")
  }
  fmt.Printf("[Wallet.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Wallet) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Wallet %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Wallet.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


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


type Transaction struct {
  ID     string
  Name   string
  Status string
}

func NewTransaction(id, name string) (*Transaction, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Transaction requires id and name")
  }
  obj := &Transaction{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Transaction.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Transaction) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Transaction invalid status")
  }
  fmt.Printf("[Transaction.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Transaction) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Transaction %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Transaction.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type amount struct {
  ID     string
  Name   string
  Status string
}

func Newamount(id, name string) (*amount, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("amount requires id and name")
  }
  obj := &amount{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[amount.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *amount) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("amount invalid status")
  }
  fmt.Printf("[amount.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *amount) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("amount %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[amount.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type timestamp struct {
  ID     string
  Name   string
  Status string
}

func Newtimestamp(id, name string) (*timestamp, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("timestamp requires id and name")
  }
  obj := &timestamp{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[timestamp.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *timestamp) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("timestamp invalid status")
  }
  fmt.Printf("[timestamp.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *timestamp) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("timestamp %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[timestamp.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type DigitalWalletService struct {
  mu  sync.Mutex
  seq int
  wallets map[string]*Wallet
  users map[string]*User
  transactions map[string]*Transaction
  amounts map[string]*amount
  timestamps map[string]*timestamp
}

func NewDigitalWalletService() *DigitalWalletService {
  fmt.Println("[DigitalWalletService.__init__] system ready")
  return &DigitalWalletService{
    seq: 1,
    wallets: map[string]*Wallet{},
    users: map[string]*User{},
    transactions: map[string]*Transaction{},
    amounts: map[string]*amount{},
    timestamps: map[string]*timestamp{},
  }
}

func (s *DigitalWalletService) CreateWallet(name string) (*Wallet, error) {
  if name == "" {
    return nil, fmt.Errorf("Wallet name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("WAL-%04d", s.seq)
  s.seq++
  obj, err := NewWallet(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.wallets[id] = obj
  fmt.Printf("[DigitalWalletService.CreateWallet] stored %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) GetWallet(id string) (*Wallet, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.wallets[id]
  if !ok {
    return nil, fmt.Errorf("unknown Wallet id: %s", id)
  }
  fmt.Printf("[DigitalWalletService.GetWallet] found %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[DigitalWalletService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[DigitalWalletService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) CreateTransaction(name string) (*Transaction, error) {
  if name == "" {
    return nil, fmt.Errorf("Transaction name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TRA-%04d", s.seq)
  s.seq++
  obj, err := NewTransaction(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.transactions[id] = obj
  fmt.Printf("[DigitalWalletService.CreateTransaction] stored %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) GetTransaction(id string) (*Transaction, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.transactions[id]
  if !ok {
    return nil, fmt.Errorf("unknown Transaction id: %s", id)
  }
  fmt.Printf("[DigitalWalletService.GetTransaction] found %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) Createamount(name string) (*amount, error) {
  if name == "" {
    return nil, fmt.Errorf("amount name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("AMO-%04d", s.seq)
  s.seq++
  obj, err := Newamount(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.amounts[id] = obj
  fmt.Printf("[DigitalWalletService.Createamount] stored %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) Getamount(id string) (*amount, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.amounts[id]
  if !ok {
    return nil, fmt.Errorf("unknown amount id: %s", id)
  }
  fmt.Printf("[DigitalWalletService.Getamount] found %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) Createtimestamp(name string) (*timestamp, error) {
  if name == "" {
    return nil, fmt.Errorf("timestamp name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TIM-%04d", s.seq)
  s.seq++
  obj, err := Newtimestamp(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.timestamps[id] = obj
  fmt.Printf("[DigitalWalletService.Createtimestamp] stored %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) Gettimestamp(id string) (*timestamp, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.timestamps[id]
  if !ok {
    return nil, fmt.Errorf("unknown timestamp id: %s", id)
  }
  fmt.Printf("[DigitalWalletService.Gettimestamp] found %s\\n", id)
  return obj, nil
}

func (s *DigitalWalletService) CloseWallet(id string) (*Wallet, error) {
  obj, err := s.GetWallet(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[DigitalWalletService.CloseWallet] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct DigitalWalletService ==========")
  system := NewDigitalWalletService()
  fmt.Println("========== STEP 2: Create Wallet ==========")
  first, _ := system.CreateWallet("alpha-wallet")
  system.CreateWallet("beta-wallet")
  system.CreateUser("sample-user")
  system.CreateTransaction("sample-transaction")
  system.Createamount("sample-amount")
  system.Createtimestamp("sample-timestamp")
  system.CloseWallet(first.ID)
  if _, err := system.CloseWallet(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetWallet("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Wallet {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Wallet(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Wallet requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Wallet.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Wallet invalid status");
    }
    Console.WriteLine("[Wallet.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Wallet " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Wallet.close] id=" + Id + " -> CLOSED");
  }
}


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


sealed class Transaction {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Transaction(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Transaction requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Transaction.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Transaction invalid status");
    }
    Console.WriteLine("[Transaction.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Transaction " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Transaction.close] id=" + Id + " -> CLOSED");
  }
}


sealed class amount {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public amount(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("amount requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[amount.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("amount invalid status");
    }
    Console.WriteLine("[amount.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("amount " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[amount.close] id=" + Id + " -> CLOSED");
  }
}


sealed class timestamp {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public timestamp(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("timestamp requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[timestamp.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("timestamp invalid status");
    }
    Console.WriteLine("[timestamp.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("timestamp " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[timestamp.close] id=" + Id + " -> CLOSED");
  }
}

sealed class DigitalWalletService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Wallet> _wallets = new();
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Transaction> _transactions = new();
  private readonly Dictionary<string, amount> _amounts = new();
  private readonly Dictionary<string, timestamp> _timestamps = new();
  public DigitalWalletService() {
    Console.WriteLine("[DigitalWalletService.__init__] system ready");
  }

  public Wallet CreateWallet(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Wallet name required");
    }
    lock (_gate) {
      var id = string.Format("WAL-{0:D4}", _seq++);
      var obj = new Wallet(id, name.Trim());
      obj.Validate();
      _wallets[id] = obj;
      Console.WriteLine("[DigitalWalletService.CreateWallet] stored " + id);
      return obj;
    }
  }

  public Wallet GetWallet(string id) {
    lock (_gate) {
      if (!_wallets.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Wallet id: " + id);
      }
      Console.WriteLine("[DigitalWalletService.GetWallet] found " + id);
      return obj;
    }
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
      Console.WriteLine("[DigitalWalletService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[DigitalWalletService.GetUser] found " + id);
      return obj;
    }
  }

  public Transaction CreateTransaction(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Transaction name required");
    }
    lock (_gate) {
      var id = string.Format("TRA-{0:D4}", _seq++);
      var obj = new Transaction(id, name.Trim());
      obj.Validate();
      _transactions[id] = obj;
      Console.WriteLine("[DigitalWalletService.CreateTransaction] stored " + id);
      return obj;
    }
  }

  public Transaction GetTransaction(string id) {
    lock (_gate) {
      if (!_transactions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Transaction id: " + id);
      }
      Console.WriteLine("[DigitalWalletService.GetTransaction] found " + id);
      return obj;
    }
  }

  public amount Createamount(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("amount name required");
    }
    lock (_gate) {
      var id = string.Format("AMO-{0:D4}", _seq++);
      var obj = new amount(id, name.Trim());
      obj.Validate();
      _amounts[id] = obj;
      Console.WriteLine("[DigitalWalletService.Createamount] stored " + id);
      return obj;
    }
  }

  public amount Getamount(string id) {
    lock (_gate) {
      if (!_amounts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown amount id: " + id);
      }
      Console.WriteLine("[DigitalWalletService.Getamount] found " + id);
      return obj;
    }
  }

  public timestamp Createtimestamp(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("timestamp name required");
    }
    lock (_gate) {
      var id = string.Format("TIM-{0:D4}", _seq++);
      var obj = new timestamp(id, name.Trim());
      obj.Validate();
      _timestamps[id] = obj;
      Console.WriteLine("[DigitalWalletService.Createtimestamp] stored " + id);
      return obj;
    }
  }

  public timestamp Gettimestamp(string id) {
    lock (_gate) {
      if (!_timestamps.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown timestamp id: " + id);
      }
      Console.WriteLine("[DigitalWalletService.Gettimestamp] found " + id);
      return obj;
    }
  }

  public Wallet CloseWallet(string id) {
    var obj = GetWallet(id);
    Console.WriteLine("[DigitalWalletService.CloseWallet] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct DigitalWalletService ==========");
    var system = new DigitalWalletService();
    Console.WriteLine("========== STEP 2: Create Wallet ==========");
    var first = system.CreateWallet("alpha-wallet");
    system.CreateWallet("beta-wallet");
    system.CreateUser("sample-user");
    system.CreateTransaction("sample-transaction");
    system.Createamount("sample-amount");
    system.Createtimestamp("sample-timestamp");
    system.CloseWallet(first.Id);
    try {
      system.CloseWallet(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetWallet("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const digitalWalletSolution: ProblemSolution = {
  slug: 'digital-wallet',
  title: 'Digital Wallet (Single Currency) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a digital wallet system supporting deposits, withdrawals, and balance tracking with a full transaction history. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Create a wallet for a user with zero starting balance',
      'Deposit funds into a wallet',
      'Withdraw funds if sufficient balance exists',
      'View current balance',
      'View a chronological transaction history',
      'Prevent overdraft (balance cannot go negative)',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Create a wallet for a user with zero starting balance?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Deposit funds into a wallet?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Withdraw funds if sufficient balance exists?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'View current balance?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'View a chronological transaction history?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. DigitalWalletService is the facade stereotype. Wallet, User, Transaction, amount, timestamp are concrete domain classes with id/name/status and validate/close.',
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
          'Construct DigitalWalletService.',
          'createWallet twice and create the related UML classes.',
          'closeWallet once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'DigitalWalletService', responsibility: 'UML facade - orchestrates Digital Wallet (Single Currency).', keyMembers: ['create*', 'get*', 'closeWallet'] },
    { name: 'Wallet', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'User', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Transaction', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'amount', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'timestamp', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from DigitalWalletService to Wallet, User, Transaction, amount, timestamp. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on DigitalWalletService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'DigitalWalletService', responsibility: 'UML facade - orchestrates Digital Wallet (Single Currency).', keyMembers: ['create*', 'get*', 'closeWallet'] },
    { name: 'Wallet', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'User', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Transaction', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'amount', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'timestamp', responsibility: 'UML class - domain object for Digital Wallet (Single Currency).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'DigitalWalletService exposes create/get/close and owns composed collections.' },
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
      'main constructs DigitalWalletService, creates UML domain objects, closes the primary Wallet, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct DigitalWalletService.',
      'createWallet for alpha and beta.',
      'create remaining UML classes.',
      'closeWallet(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createWallet("alpha..."); closeWallet(id)',
        output: '[Wallet.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeWallet(alreadyClosed) or getWallet("MISSING-ID")',
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
