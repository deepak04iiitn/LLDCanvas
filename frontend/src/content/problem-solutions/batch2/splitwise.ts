import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'SplitwiseService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_groups', 'Map<string, Group>'),
    attr('-', '_expenses', 'Map<string, Expense>'),
    attr('-', '_expense_splits', 'Map<string, ExpenseSplit>'),
    attr('-', '_settlements', 'Map<string, Settlement>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createGroup', 'name: string', 'Group'),
    method('+', 'createExpense', 'name: string', 'Expense'),
    method('+', 'createExpenseSplit', 'name: string', 'ExpenseSplit'),
    method('+', 'createSettlement', 'name: string', 'Settlement'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getGroup', 'id: string', 'Group'),
    method('+', 'getExpense', 'id: string', 'Expense'),
    method('+', 'getExpenseSplit', 'id: string', 'ExpenseSplit'),
    method('+', 'getSettlement', 'id: string', 'Settlement'),
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
  cls('n2', 'Group', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Expense', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'ExpenseSplit', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Settlement', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("splitwise")


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


class Group:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Group.id is required")
        if not name or not name.strip():
            raise ValueError("Group.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Group.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Group {self.id} has invalid status={self.status}")
        log.info("[Group.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Group {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Group.close] id=%s -> CLOSED", self.id)


class Expense:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Expense.id is required")
        if not name or not name.strip():
            raise ValueError("Expense.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Expense.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Expense {self.id} has invalid status={self.status}")
        log.info("[Expense.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Expense {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Expense.close] id=%s -> CLOSED", self.id)


class ExpenseSplit:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ExpenseSplit.id is required")
        if not name or not name.strip():
            raise ValueError("ExpenseSplit.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ExpenseSplit.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ExpenseSplit {self.id} has invalid status={self.status}")
        log.info("[ExpenseSplit.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ExpenseSplit {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ExpenseSplit.close] id=%s -> CLOSED", self.id)


class Settlement:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Settlement.id is required")
        if not name or not name.strip():
            raise ValueError("Settlement.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Settlement.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Settlement {self.id} has invalid status={self.status}")
        log.info("[Settlement.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Settlement {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Settlement.close] id=%s -> CLOSED", self.id)


class SplitwiseService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._groups: Dict[str, Group] = {}
        self._expenses: Dict[str, Expense] = {}
        self._expense_splits: Dict[str, ExpenseSplit] = {}
        self._settlements: Dict[str, Settlement] = {}
        log.info("[SplitwiseService.__init__] system ready; managing: User, Group, Expense, ExpenseSplit, Settlement")

    def create_user(self, name: str) -> User:
        """UML: SplitwiseService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[SplitwiseService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[SplitwiseService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_group(self, name: str) -> Group:
        """UML: SplitwiseService.create_group(name) -> Group"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Group name is required")
        with self._lock:
            item_id = f"GRO-{self._seq:04d}"
            self._seq += 1
            obj = Group(item_id, cleaned)
            obj.validate()
            self._groups[item_id] = obj
            log.info("[SplitwiseService.create_group] stored %s in _groups (count=%s)", item_id, len(self._groups))
            return obj

    def get_group(self, item_id: str) -> Group:
        with self._lock:
            obj = self._groups.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Group id: {item_id}")
            log.info("[SplitwiseService.get_group] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_expense(self, name: str) -> Expense:
        """UML: SplitwiseService.create_expense(name) -> Expense"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Expense name is required")
        with self._lock:
            item_id = f"EXP-{self._seq:04d}"
            self._seq += 1
            obj = Expense(item_id, cleaned)
            obj.validate()
            self._expenses[item_id] = obj
            log.info("[SplitwiseService.create_expense] stored %s in _expenses (count=%s)", item_id, len(self._expenses))
            return obj

    def get_expense(self, item_id: str) -> Expense:
        with self._lock:
            obj = self._expenses.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Expense id: {item_id}")
            log.info("[SplitwiseService.get_expense] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_expense_split(self, name: str) -> ExpenseSplit:
        """UML: SplitwiseService.create_expense_split(name) -> ExpenseSplit"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ExpenseSplit name is required")
        with self._lock:
            item_id = f"EXP-{self._seq:04d}"
            self._seq += 1
            obj = ExpenseSplit(item_id, cleaned)
            obj.validate()
            self._expense_splits[item_id] = obj
            log.info("[SplitwiseService.create_expense_split] stored %s in _expense_splits (count=%s)", item_id, len(self._expense_splits))
            return obj

    def get_expense_split(self, item_id: str) -> ExpenseSplit:
        with self._lock:
            obj = self._expense_splits.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ExpenseSplit id: {item_id}")
            log.info("[SplitwiseService.get_expense_split] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_settlement(self, name: str) -> Settlement:
        """UML: SplitwiseService.create_settlement(name) -> Settlement"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Settlement name is required")
        with self._lock:
            item_id = f"SET-{self._seq:04d}"
            self._seq += 1
            obj = Settlement(item_id, cleaned)
            obj.validate()
            self._settlements[item_id] = obj
            log.info("[SplitwiseService.create_settlement] stored %s in _settlements (count=%s)", item_id, len(self._settlements))
            return obj

    def get_settlement(self, item_id: str) -> Settlement:
        with self._lock:
            obj = self._settlements.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Settlement id: {item_id}")
            log.info("[SplitwiseService.get_settlement] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[SplitwiseService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[SplitwiseService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct SplitwiseService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = SplitwiseService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Group (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_group("sample-group")

    log.info("========== STEP 4: Create Expense (UML class) ==========")
    system.create_expense("sample-expense")

    log.info("========== STEP 5: Create ExpenseSplit (UML class) ==========")
    system.create_expense_split("sample-expense_split")

    log.info("========== STEP 6: Create Settlement (UML class) ==========")
    system.create_settlement("sample-settlement")

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


class Group {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Group(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Group.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Group.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Group.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Group " + id + " invalid status");
    }
    System.out.println("[Group.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Group " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Group.close] id=" + id + " -> CLOSED");
  }
}


class Expense {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Expense(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Expense.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Expense.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Expense.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Expense " + id + " invalid status");
    }
    System.out.println("[Expense.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Expense " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Expense.close] id=" + id + " -> CLOSED");
  }
}


class ExpenseSplit {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ExpenseSplit(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ExpenseSplit.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ExpenseSplit.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ExpenseSplit.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ExpenseSplit " + id + " invalid status");
    }
    System.out.println("[ExpenseSplit.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ExpenseSplit " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ExpenseSplit.close] id=" + id + " -> CLOSED");
  }
}


class Settlement {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Settlement(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Settlement.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Settlement.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Settlement.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Settlement " + id + " invalid status");
    }
    System.out.println("[Settlement.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Settlement " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Settlement.close] id=" + id + " -> CLOSED");
  }
}

public class SplitwiseService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Group> groups = new LinkedHashMap<>();
  private final Map<String, Expense> expenses = new LinkedHashMap<>();
  private final Map<String, ExpenseSplit> expense_splits = new LinkedHashMap<>();
  private final Map<String, Settlement> settlements = new LinkedHashMap<>();

  public SplitwiseService() {
    System.out.println("[SplitwiseService.__init__] system ready");
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
      System.out.println("[SplitwiseService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[SplitwiseService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Group createGroup(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Group name required");
    }
    lock.lock();
    try {
      String id = String.format("GRO-%04d", seq++);
      Group obj = new Group(id, name.trim());
      obj.validate();
      groups.put(id, obj);
      System.out.println("[SplitwiseService.createGroup] stored " + id + " count=" + groups.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Group getGroup(String id) {
    lock.lock();
    try {
      Group obj = groups.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Group id: " + id);
      }
      System.out.println("[SplitwiseService.getGroup] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Expense createExpense(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Expense name required");
    }
    lock.lock();
    try {
      String id = String.format("EXP-%04d", seq++);
      Expense obj = new Expense(id, name.trim());
      obj.validate();
      expenses.put(id, obj);
      System.out.println("[SplitwiseService.createExpense] stored " + id + " count=" + expenses.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Expense getExpense(String id) {
    lock.lock();
    try {
      Expense obj = expenses.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Expense id: " + id);
      }
      System.out.println("[SplitwiseService.getExpense] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ExpenseSplit createExpenseSplit(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ExpenseSplit name required");
    }
    lock.lock();
    try {
      String id = String.format("EXP-%04d", seq++);
      ExpenseSplit obj = new ExpenseSplit(id, name.trim());
      obj.validate();
      expense_splits.put(id, obj);
      System.out.println("[SplitwiseService.createExpenseSplit] stored " + id + " count=" + expense_splits.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ExpenseSplit getExpenseSplit(String id) {
    lock.lock();
    try {
      ExpenseSplit obj = expense_splits.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ExpenseSplit id: " + id);
      }
      System.out.println("[SplitwiseService.getExpenseSplit] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Settlement createSettlement(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Settlement name required");
    }
    lock.lock();
    try {
      String id = String.format("SET-%04d", seq++);
      Settlement obj = new Settlement(id, name.trim());
      obj.validate();
      settlements.put(id, obj);
      System.out.println("[SplitwiseService.createSettlement] stored " + id + " count=" + settlements.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Settlement getSettlement(String id) {
    lock.lock();
    try {
      Settlement obj = settlements.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Settlement id: " + id);
      }
      System.out.println("[SplitwiseService.getSettlement] found id=" + obj.getId());
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
      System.out.println("[SplitwiseService.closeUser] closing " + id);
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
      System.out.println("[SplitwiseService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct SplitwiseService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    SplitwiseService system = new SplitwiseService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Group ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createGroup("sample-group");
    System.out.println("========== STEP 4: Create Expense ==========");
    system.createExpense("sample-expense");
    System.out.println("========== STEP 5: Create ExpenseSplit ==========");
    system.createExpenseSplit("sample-expense_split");
    System.out.println("========== STEP 6: Create Settlement ==========");
    system.createSettlement("sample-settlement");
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


class Group {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Group.id required')
    }

    if (!name?.trim()) {
      throw new Error('Group.name required')
    }
    console.log(\`[Group.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Group \${this.id} invalid status\`)
    }
    console.log(\`[Group.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Group \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Group.close] id=\${this.id} -> CLOSED\`)
  }
}


class Expense {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Expense.id required')
    }

    if (!name?.trim()) {
      throw new Error('Expense.name required')
    }
    console.log(\`[Expense.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Expense \${this.id} invalid status\`)
    }
    console.log(\`[Expense.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Expense \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Expense.close] id=\${this.id} -> CLOSED\`)
  }
}


class ExpenseSplit {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ExpenseSplit.id required')
    }

    if (!name?.trim()) {
      throw new Error('ExpenseSplit.name required')
    }
    console.log(\`[ExpenseSplit.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ExpenseSplit \${this.id} invalid status\`)
    }
    console.log(\`[ExpenseSplit.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ExpenseSplit \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ExpenseSplit.close] id=\${this.id} -> CLOSED\`)
  }
}


class Settlement {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Settlement.id required')
    }

    if (!name?.trim()) {
      throw new Error('Settlement.name required')
    }
    console.log(\`[Settlement.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Settlement \${this.id} invalid status\`)
    }
    console.log(\`[Settlement.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Settlement \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Settlement.close] id=\${this.id} -> CLOSED\`)
  }
}

class SplitwiseService {
  private seq = 1
  private users = new Map<string, User>()
  private groups = new Map<string, Group>()
  private expenses = new Map<string, Expense>()
  private expense_splits = new Map<string, ExpenseSplit>()
  private settlements = new Map<string, Settlement>()
  constructor() {
    console.log('[SplitwiseService.__init__] system ready')
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
    console.log(\`[SplitwiseService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[SplitwiseService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createGroup(name: string): Group {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Group name required')
    }
    const id = \`GRO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Group(id, cleaned)
    obj.validate()
    this.groups.set(id, obj)
    console.log(\`[SplitwiseService.createGroup] stored \${id} count=\${this.groups.size}\`)
    return obj
  }

  getGroup(id: string): Group {
    const obj = this.groups.get(id)
    if (!obj) {
      throw new Error(\`unknown Group id: \${id}\`)
    }
    console.log(\`[SplitwiseService.getGroup] found id=\${obj.id}\`)
    return obj
  }

  createExpense(name: string): Expense {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Expense name required')
    }
    const id = \`EXP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Expense(id, cleaned)
    obj.validate()
    this.expenses.set(id, obj)
    console.log(\`[SplitwiseService.createExpense] stored \${id} count=\${this.expenses.size}\`)
    return obj
  }

  getExpense(id: string): Expense {
    const obj = this.expenses.get(id)
    if (!obj) {
      throw new Error(\`unknown Expense id: \${id}\`)
    }
    console.log(\`[SplitwiseService.getExpense] found id=\${obj.id}\`)
    return obj
  }

  createExpenseSplit(name: string): ExpenseSplit {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ExpenseSplit name required')
    }
    const id = \`EXP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ExpenseSplit(id, cleaned)
    obj.validate()
    this.expense_splits.set(id, obj)
    console.log(\`[SplitwiseService.createExpenseSplit] stored \${id} count=\${this.expense_splits.size}\`)
    return obj
  }

  getExpenseSplit(id: string): ExpenseSplit {
    const obj = this.expense_splits.get(id)
    if (!obj) {
      throw new Error(\`unknown ExpenseSplit id: \${id}\`)
    }
    console.log(\`[SplitwiseService.getExpenseSplit] found id=\${obj.id}\`)
    return obj
  }

  createSettlement(name: string): Settlement {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Settlement name required')
    }
    const id = \`SET-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Settlement(id, cleaned)
    obj.validate()
    this.settlements.set(id, obj)
    console.log(\`[SplitwiseService.createSettlement] stored \${id} count=\${this.settlements.size}\`)
    return obj
  }

  getSettlement(id: string): Settlement {
    const obj = this.settlements.get(id)
    if (!obj) {
      throw new Error(\`unknown Settlement id: \${id}\`)
    }
    console.log(\`[SplitwiseService.getSettlement] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[SplitwiseService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[SplitwiseService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct SplitwiseService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new SplitwiseService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Group ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createGroup('sample-group')
  console.log('========== STEP 4: Create Expense ==========')
  system.createExpense('sample-expense')
  console.log('========== STEP 5: Create ExpenseSplit ==========')
  system.createExpenseSplit('sample-expense_split')
  console.log('========== STEP 6: Create Settlement ==========')
  system.createSettlement('sample-settlement')
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


class Group {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Group(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Group requires id and name");
    }
    cout << "[Group.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Group invalid status");
    }
    cout << "[Group.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Group cannot close");
    }
    status_ = "CLOSED";
    cout << "[Group.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Expense {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Expense(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Expense requires id and name");
    }
    cout << "[Expense.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Expense invalid status");
    }
    cout << "[Expense.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Expense cannot close");
    }
    status_ = "CLOSED";
    cout << "[Expense.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class ExpenseSplit {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ExpenseSplit(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ExpenseSplit requires id and name");
    }
    cout << "[ExpenseSplit.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ExpenseSplit invalid status");
    }
    cout << "[ExpenseSplit.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ExpenseSplit cannot close");
    }
    status_ = "CLOSED";
    cout << "[ExpenseSplit.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Settlement {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Settlement(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Settlement requires id and name");
    }
    cout << "[Settlement.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Settlement invalid status");
    }
    cout << "[Settlement.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Settlement cannot close");
    }
    status_ = "CLOSED";
    cout << "[Settlement.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class SplitwiseService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Group> groups_;
  unordered_map<string, Expense> expenses_;
  unordered_map<string, ExpenseSplit> expense_splits_;
  unordered_map<string, Settlement> settlements_;
public:
  SplitwiseService() {
    cout << "[SplitwiseService.__init__] system ready" << endl;
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
    cout << "[SplitwiseService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[SplitwiseService.getUser] found " << id << endl;
    return it->second;
  }

  Group createGroup(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Group name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "GRO-%04d", seq_++);
    Group obj{buf, name};
    obj.validate();
    groups_.emplace(obj.id(), obj);
    cout << "[SplitwiseService.createGroup] stored " << obj.id() << endl;
    return obj;
  }

  Group getGroup(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = groups_.find(id);
    if (it == groups_.end()) {
      throw out_of_range("unknown Group id");
    }
    cout << "[SplitwiseService.getGroup] found " << id << endl;
    return it->second;
  }

  Expense createExpense(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Expense name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "EXP-%04d", seq_++);
    Expense obj{buf, name};
    obj.validate();
    expenses_.emplace(obj.id(), obj);
    cout << "[SplitwiseService.createExpense] stored " << obj.id() << endl;
    return obj;
  }

  Expense getExpense(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = expenses_.find(id);
    if (it == expenses_.end()) {
      throw out_of_range("unknown Expense id");
    }
    cout << "[SplitwiseService.getExpense] found " << id << endl;
    return it->second;
  }

  ExpenseSplit createExpenseSplit(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ExpenseSplit name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "EXP-%04d", seq_++);
    ExpenseSplit obj{buf, name};
    obj.validate();
    expense_splits_.emplace(obj.id(), obj);
    cout << "[SplitwiseService.createExpenseSplit] stored " << obj.id() << endl;
    return obj;
  }

  ExpenseSplit getExpenseSplit(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = expense_splits_.find(id);
    if (it == expense_splits_.end()) {
      throw out_of_range("unknown ExpenseSplit id");
    }
    cout << "[SplitwiseService.getExpenseSplit] found " << id << endl;
    return it->second;
  }

  Settlement createSettlement(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Settlement name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SET-%04d", seq_++);
    Settlement obj{buf, name};
    obj.validate();
    settlements_.emplace(obj.id(), obj);
    cout << "[SplitwiseService.createSettlement] stored " << obj.id() << endl;
    return obj;
  }

  Settlement getSettlement(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = settlements_.find(id);
    if (it == settlements_.end()) {
      throw out_of_range("unknown Settlement id");
    }
    cout << "[SplitwiseService.getSettlement] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[SplitwiseService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct SplitwiseService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  SplitwiseService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createGroup("sample-group");
  system.createExpense("sample-expense");
  system.createExpenseSplit("sample-expense_split");
  system.createSettlement("sample-settlement");
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


type Group struct {
  ID     string
  Name   string
  Status string
}

func NewGroup(id, name string) (*Group, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Group requires id and name")
  }
  obj := &Group{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Group.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Group) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Group invalid status")
  }
  fmt.Printf("[Group.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Group) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Group %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Group.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Expense struct {
  ID     string
  Name   string
  Status string
}

func NewExpense(id, name string) (*Expense, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Expense requires id and name")
  }
  obj := &Expense{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Expense.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Expense) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Expense invalid status")
  }
  fmt.Printf("[Expense.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Expense) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Expense %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Expense.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type ExpenseSplit struct {
  ID     string
  Name   string
  Status string
}

func NewExpenseSplit(id, name string) (*ExpenseSplit, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ExpenseSplit requires id and name")
  }
  obj := &ExpenseSplit{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ExpenseSplit.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ExpenseSplit) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ExpenseSplit invalid status")
  }
  fmt.Printf("[ExpenseSplit.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ExpenseSplit) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ExpenseSplit %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ExpenseSplit.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Settlement struct {
  ID     string
  Name   string
  Status string
}

func NewSettlement(id, name string) (*Settlement, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Settlement requires id and name")
  }
  obj := &Settlement{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Settlement.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Settlement) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Settlement invalid status")
  }
  fmt.Printf("[Settlement.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Settlement) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Settlement %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Settlement.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type SplitwiseService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  groups map[string]*Group
  expenses map[string]*Expense
  expense_splits map[string]*ExpenseSplit
  settlements map[string]*Settlement
}

func NewSplitwiseService() *SplitwiseService {
  fmt.Println("[SplitwiseService.__init__] system ready")
  return &SplitwiseService{
    seq: 1,
    users: map[string]*User{},
    groups: map[string]*Group{},
    expenses: map[string]*Expense{},
    expense_splits: map[string]*ExpenseSplit{},
    settlements: map[string]*Settlement{},
  }
}

func (s *SplitwiseService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[SplitwiseService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[SplitwiseService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) CreateGroup(name string) (*Group, error) {
  if name == "" {
    return nil, fmt.Errorf("Group name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("GRO-%04d", s.seq)
  s.seq++
  obj, err := NewGroup(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.groups[id] = obj
  fmt.Printf("[SplitwiseService.CreateGroup] stored %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) GetGroup(id string) (*Group, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.groups[id]
  if !ok {
    return nil, fmt.Errorf("unknown Group id: %s", id)
  }
  fmt.Printf("[SplitwiseService.GetGroup] found %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) CreateExpense(name string) (*Expense, error) {
  if name == "" {
    return nil, fmt.Errorf("Expense name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("EXP-%04d", s.seq)
  s.seq++
  obj, err := NewExpense(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.expenses[id] = obj
  fmt.Printf("[SplitwiseService.CreateExpense] stored %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) GetExpense(id string) (*Expense, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.expenses[id]
  if !ok {
    return nil, fmt.Errorf("unknown Expense id: %s", id)
  }
  fmt.Printf("[SplitwiseService.GetExpense] found %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) CreateExpenseSplit(name string) (*ExpenseSplit, error) {
  if name == "" {
    return nil, fmt.Errorf("ExpenseSplit name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("EXP-%04d", s.seq)
  s.seq++
  obj, err := NewExpenseSplit(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.expense_splits[id] = obj
  fmt.Printf("[SplitwiseService.CreateExpenseSplit] stored %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) GetExpenseSplit(id string) (*ExpenseSplit, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.expense_splits[id]
  if !ok {
    return nil, fmt.Errorf("unknown ExpenseSplit id: %s", id)
  }
  fmt.Printf("[SplitwiseService.GetExpenseSplit] found %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) CreateSettlement(name string) (*Settlement, error) {
  if name == "" {
    return nil, fmt.Errorf("Settlement name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SET-%04d", s.seq)
  s.seq++
  obj, err := NewSettlement(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.settlements[id] = obj
  fmt.Printf("[SplitwiseService.CreateSettlement] stored %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) GetSettlement(id string) (*Settlement, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.settlements[id]
  if !ok {
    return nil, fmt.Errorf("unknown Settlement id: %s", id)
  }
  fmt.Printf("[SplitwiseService.GetSettlement] found %s\\n", id)
  return obj, nil
}

func (s *SplitwiseService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[SplitwiseService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct SplitwiseService ==========")
  system := NewSplitwiseService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateGroup("sample-group")
  system.CreateExpense("sample-expense")
  system.CreateExpenseSplit("sample-expense_split")
  system.CreateSettlement("sample-settlement")
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


sealed class Group {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Group(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Group requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Group.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Group invalid status");
    }
    Console.WriteLine("[Group.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Group " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Group.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Expense {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Expense(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Expense requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Expense.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Expense invalid status");
    }
    Console.WriteLine("[Expense.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Expense " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Expense.close] id=" + Id + " -> CLOSED");
  }
}


sealed class ExpenseSplit {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ExpenseSplit(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ExpenseSplit requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ExpenseSplit.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ExpenseSplit invalid status");
    }
    Console.WriteLine("[ExpenseSplit.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ExpenseSplit " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ExpenseSplit.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Settlement {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Settlement(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Settlement requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Settlement.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Settlement invalid status");
    }
    Console.WriteLine("[Settlement.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Settlement " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Settlement.close] id=" + Id + " -> CLOSED");
  }
}

sealed class SplitwiseService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Group> _groups = new();
  private readonly Dictionary<string, Expense> _expenses = new();
  private readonly Dictionary<string, ExpenseSplit> _expense_splits = new();
  private readonly Dictionary<string, Settlement> _settlements = new();
  public SplitwiseService() {
    Console.WriteLine("[SplitwiseService.__init__] system ready");
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
      Console.WriteLine("[SplitwiseService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[SplitwiseService.GetUser] found " + id);
      return obj;
    }
  }

  public Group CreateGroup(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Group name required");
    }
    lock (_gate) {
      var id = string.Format("GRO-{0:D4}", _seq++);
      var obj = new Group(id, name.Trim());
      obj.Validate();
      _groups[id] = obj;
      Console.WriteLine("[SplitwiseService.CreateGroup] stored " + id);
      return obj;
    }
  }

  public Group GetGroup(string id) {
    lock (_gate) {
      if (!_groups.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Group id: " + id);
      }
      Console.WriteLine("[SplitwiseService.GetGroup] found " + id);
      return obj;
    }
  }

  public Expense CreateExpense(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Expense name required");
    }
    lock (_gate) {
      var id = string.Format("EXP-{0:D4}", _seq++);
      var obj = new Expense(id, name.Trim());
      obj.Validate();
      _expenses[id] = obj;
      Console.WriteLine("[SplitwiseService.CreateExpense] stored " + id);
      return obj;
    }
  }

  public Expense GetExpense(string id) {
    lock (_gate) {
      if (!_expenses.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Expense id: " + id);
      }
      Console.WriteLine("[SplitwiseService.GetExpense] found " + id);
      return obj;
    }
  }

  public ExpenseSplit CreateExpenseSplit(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ExpenseSplit name required");
    }
    lock (_gate) {
      var id = string.Format("EXP-{0:D4}", _seq++);
      var obj = new ExpenseSplit(id, name.Trim());
      obj.Validate();
      _expense_splits[id] = obj;
      Console.WriteLine("[SplitwiseService.CreateExpenseSplit] stored " + id);
      return obj;
    }
  }

  public ExpenseSplit GetExpenseSplit(string id) {
    lock (_gate) {
      if (!_expense_splits.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ExpenseSplit id: " + id);
      }
      Console.WriteLine("[SplitwiseService.GetExpenseSplit] found " + id);
      return obj;
    }
  }

  public Settlement CreateSettlement(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Settlement name required");
    }
    lock (_gate) {
      var id = string.Format("SET-{0:D4}", _seq++);
      var obj = new Settlement(id, name.Trim());
      obj.Validate();
      _settlements[id] = obj;
      Console.WriteLine("[SplitwiseService.CreateSettlement] stored " + id);
      return obj;
    }
  }

  public Settlement GetSettlement(string id) {
    lock (_gate) {
      if (!_settlements.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Settlement id: " + id);
      }
      Console.WriteLine("[SplitwiseService.GetSettlement] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[SplitwiseService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct SplitwiseService ==========");
    var system = new SplitwiseService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateGroup("sample-group");
    system.CreateExpense("sample-expense");
    system.CreateExpenseSplit("sample-expense_split");
    system.CreateSettlement("sample-settlement");
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

export const splitwiseSolution: ProblemSolution = {
  slug: 'splitwise',
  title: 'Splitwise / Expense Splitter - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an expense splitting app where groups of users can track shared expenses, split costs, and settle debts. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Users create groups (trips, households, friends)',
      'Add expenses and split them equally, unequally, by percentage, or by shares',
      'Show each member\'s net balance (how much they owe or are owed)',
      'Simplify debts: minimize the number of transactions needed to settle',
      'Record settlements when someone pays back',
      'Multi-currency support with exchange rates',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Users create groups (trips, households, friends)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Add expenses and split them equally, unequally, by percentage, or by shares?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Show each member\'s net balance (how much they owe or are owed)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Simplify debts: minimize the number of transactions needed to settle?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Record settlements when someone pays back?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. SplitwiseService is the facade stereotype. User, Group, Expense, ExpenseSplit, Settlement are concrete domain classes with id/name/status and validate/close.',
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
          'Construct SplitwiseService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'SplitwiseService', responsibility: 'UML facade - orchestrates Splitwise / Expense Splitter.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Group', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Expense', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ExpenseSplit', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Settlement', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from SplitwiseService to User, Group, Expense, ExpenseSplit, Settlement. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on SplitwiseService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'SplitwiseService', responsibility: 'UML facade - orchestrates Splitwise / Expense Splitter.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Group', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Expense', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ExpenseSplit', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Settlement', responsibility: 'UML class - domain object for Splitwise / Expense Splitter.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'SplitwiseService exposes create/get/close and owns composed collections.' },
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
      'main constructs SplitwiseService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct SplitwiseService.',
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
