import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'FitnessTrackerAppService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_workouts', 'Map<string, Workout>'),
    attr('-', '_daily_activities', 'Map<string, DailyActivity>'),
    attr('-', '_active_minutess', 'Map<string, activeMinutes>'),
    attr('-', '_dates', 'Map<string, date>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createWorkout', 'name: string', 'Workout'),
    method('+', 'createDailyActivity', 'name: string', 'DailyActivity'),
    method('+', 'createactiveMinutes', 'name: string', 'activeMinutes'),
    method('+', 'createdate', 'name: string', 'date'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getWorkout', 'id: string', 'Workout'),
    method('+', 'getDailyActivity', 'id: string', 'DailyActivity'),
    method('+', 'getactiveMinutes', 'id: string', 'activeMinutes'),
    method('+', 'getdate', 'id: string', 'date'),
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
  cls('n2', 'Workout', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'DailyActivity', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'activeMinutes', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'date', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("fitness-tracker-app")


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


class Workout:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Workout.id is required")
        if not name or not name.strip():
            raise ValueError("Workout.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Workout.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Workout {self.id} has invalid status={self.status}")
        log.info("[Workout.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Workout {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Workout.close] id=%s -> CLOSED", self.id)


class DailyActivity:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("DailyActivity.id is required")
        if not name or not name.strip():
            raise ValueError("DailyActivity.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[DailyActivity.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"DailyActivity {self.id} has invalid status={self.status}")
        log.info("[DailyActivity.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"DailyActivity {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[DailyActivity.close] id=%s -> CLOSED", self.id)


class activeMinutes:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("activeMinutes.id is required")
        if not name or not name.strip():
            raise ValueError("activeMinutes.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[activeMinutes.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"activeMinutes {self.id} has invalid status={self.status}")
        log.info("[activeMinutes.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"activeMinutes {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[activeMinutes.close] id=%s -> CLOSED", self.id)


class date:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("date.id is required")
        if not name or not name.strip():
            raise ValueError("date.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[date.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"date {self.id} has invalid status={self.status}")
        log.info("[date.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"date {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[date.close] id=%s -> CLOSED", self.id)


class FitnessTrackerAppService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._workouts: Dict[str, Workout] = {}
        self._daily_activities: Dict[str, DailyActivity] = {}
        self._active_minutess: Dict[str, activeMinutes] = {}
        self._dates: Dict[str, date] = {}
        log.info("[FitnessTrackerAppService.__init__] system ready; managing: User, Workout, DailyActivity, activeMinutes, date")

    def create_user(self, name: str) -> User:
        """UML: FitnessTrackerAppService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[FitnessTrackerAppService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[FitnessTrackerAppService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_workout(self, name: str) -> Workout:
        """UML: FitnessTrackerAppService.create_workout(name) -> Workout"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Workout name is required")
        with self._lock:
            item_id = f"WOR-{self._seq:04d}"
            self._seq += 1
            obj = Workout(item_id, cleaned)
            obj.validate()
            self._workouts[item_id] = obj
            log.info("[FitnessTrackerAppService.create_workout] stored %s in _workouts (count=%s)", item_id, len(self._workouts))
            return obj

    def get_workout(self, item_id: str) -> Workout:
        with self._lock:
            obj = self._workouts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Workout id: {item_id}")
            log.info("[FitnessTrackerAppService.get_workout] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_daily_activity(self, name: str) -> DailyActivity:
        """UML: FitnessTrackerAppService.create_daily_activity(name) -> DailyActivity"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("DailyActivity name is required")
        with self._lock:
            item_id = f"DAI-{self._seq:04d}"
            self._seq += 1
            obj = DailyActivity(item_id, cleaned)
            obj.validate()
            self._daily_activities[item_id] = obj
            log.info("[FitnessTrackerAppService.create_daily_activity] stored %s in _daily_activities (count=%s)", item_id, len(self._daily_activities))
            return obj

    def get_daily_activity(self, item_id: str) -> DailyActivity:
        with self._lock:
            obj = self._daily_activities.get(item_id)
            if obj is None:
                raise KeyError(f"unknown DailyActivity id: {item_id}")
            log.info("[FitnessTrackerAppService.get_daily_activity] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_active_minutes(self, name: str) -> activeMinutes:
        """UML: FitnessTrackerAppService.create_active_minutes(name) -> activeMinutes"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("activeMinutes name is required")
        with self._lock:
            item_id = f"ACT-{self._seq:04d}"
            self._seq += 1
            obj = activeMinutes(item_id, cleaned)
            obj.validate()
            self._active_minutess[item_id] = obj
            log.info("[FitnessTrackerAppService.create_active_minutes] stored %s in _active_minutess (count=%s)", item_id, len(self._active_minutess))
            return obj

    def get_active_minutes(self, item_id: str) -> activeMinutes:
        with self._lock:
            obj = self._active_minutess.get(item_id)
            if obj is None:
                raise KeyError(f"unknown activeMinutes id: {item_id}")
            log.info("[FitnessTrackerAppService.get_active_minutes] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_date(self, name: str) -> date:
        """UML: FitnessTrackerAppService.create_date(name) -> date"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("date name is required")
        with self._lock:
            item_id = f"DAT-{self._seq:04d}"
            self._seq += 1
            obj = date(item_id, cleaned)
            obj.validate()
            self._dates[item_id] = obj
            log.info("[FitnessTrackerAppService.create_date] stored %s in _dates (count=%s)", item_id, len(self._dates))
            return obj

    def get_date(self, item_id: str) -> date:
        with self._lock:
            obj = self._dates.get(item_id)
            if obj is None:
                raise KeyError(f"unknown date id: {item_id}")
            log.info("[FitnessTrackerAppService.get_date] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[FitnessTrackerAppService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[FitnessTrackerAppService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct FitnessTrackerAppService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = FitnessTrackerAppService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Workout (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_workout("sample-workout")

    log.info("========== STEP 4: Create DailyActivity (UML class) ==========")
    system.create_daily_activity("sample-daily_activity")

    log.info("========== STEP 5: Create activeMinutes (UML class) ==========")
    system.create_active_minutes("sample-active_minutes")

    log.info("========== STEP 6: Create date (UML class) ==========")
    system.create_date("sample-date")

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


class Workout {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Workout(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Workout.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Workout.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Workout.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Workout " + id + " invalid status");
    }
    System.out.println("[Workout.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Workout " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Workout.close] id=" + id + " -> CLOSED");
  }
}


class DailyActivity {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  DailyActivity(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("DailyActivity.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DailyActivity.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[DailyActivity.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("DailyActivity " + id + " invalid status");
    }
    System.out.println("[DailyActivity.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("DailyActivity " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[DailyActivity.close] id=" + id + " -> CLOSED");
  }
}


class activeMinutes {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  activeMinutes(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("activeMinutes.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("activeMinutes.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[activeMinutes.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("activeMinutes " + id + " invalid status");
    }
    System.out.println("[activeMinutes.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("activeMinutes " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[activeMinutes.close] id=" + id + " -> CLOSED");
  }
}


class date {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  date(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("date.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("date.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[date.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("date " + id + " invalid status");
    }
    System.out.println("[date.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("date " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[date.close] id=" + id + " -> CLOSED");
  }
}

public class FitnessTrackerAppService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Workout> workouts = new LinkedHashMap<>();
  private final Map<String, DailyActivity> daily_activities = new LinkedHashMap<>();
  private final Map<String, activeMinutes> active_minutess = new LinkedHashMap<>();
  private final Map<String, date> dates = new LinkedHashMap<>();

  public FitnessTrackerAppService() {
    System.out.println("[FitnessTrackerAppService.__init__] system ready");
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
      System.out.println("[FitnessTrackerAppService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[FitnessTrackerAppService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Workout createWorkout(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Workout name required");
    }
    lock.lock();
    try {
      String id = String.format("WOR-%04d", seq++);
      Workout obj = new Workout(id, name.trim());
      obj.validate();
      workouts.put(id, obj);
      System.out.println("[FitnessTrackerAppService.createWorkout] stored " + id + " count=" + workouts.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Workout getWorkout(String id) {
    lock.lock();
    try {
      Workout obj = workouts.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Workout id: " + id);
      }
      System.out.println("[FitnessTrackerAppService.getWorkout] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public DailyActivity createDailyActivity(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DailyActivity name required");
    }
    lock.lock();
    try {
      String id = String.format("DAI-%04d", seq++);
      DailyActivity obj = new DailyActivity(id, name.trim());
      obj.validate();
      daily_activities.put(id, obj);
      System.out.println("[FitnessTrackerAppService.createDailyActivity] stored " + id + " count=" + daily_activities.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public DailyActivity getDailyActivity(String id) {
    lock.lock();
    try {
      DailyActivity obj = daily_activities.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown DailyActivity id: " + id);
      }
      System.out.println("[FitnessTrackerAppService.getDailyActivity] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public activeMinutes createactiveMinutes(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("activeMinutes name required");
    }
    lock.lock();
    try {
      String id = String.format("ACT-%04d", seq++);
      activeMinutes obj = new activeMinutes(id, name.trim());
      obj.validate();
      active_minutess.put(id, obj);
      System.out.println("[FitnessTrackerAppService.createactiveMinutes] stored " + id + " count=" + active_minutess.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public activeMinutes getactiveMinutes(String id) {
    lock.lock();
    try {
      activeMinutes obj = active_minutess.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown activeMinutes id: " + id);
      }
      System.out.println("[FitnessTrackerAppService.getactiveMinutes] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public date createdate(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("date name required");
    }
    lock.lock();
    try {
      String id = String.format("DAT-%04d", seq++);
      date obj = new date(id, name.trim());
      obj.validate();
      dates.put(id, obj);
      System.out.println("[FitnessTrackerAppService.createdate] stored " + id + " count=" + dates.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public date getdate(String id) {
    lock.lock();
    try {
      date obj = dates.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown date id: " + id);
      }
      System.out.println("[FitnessTrackerAppService.getdate] found id=" + obj.getId());
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
      System.out.println("[FitnessTrackerAppService.closeUser] closing " + id);
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
      System.out.println("[FitnessTrackerAppService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct FitnessTrackerAppService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    FitnessTrackerAppService system = new FitnessTrackerAppService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Workout ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createWorkout("sample-workout");
    System.out.println("========== STEP 4: Create DailyActivity ==========");
    system.createDailyActivity("sample-daily_activity");
    System.out.println("========== STEP 5: Create activeMinutes ==========");
    system.createactiveMinutes("sample-active_minutes");
    System.out.println("========== STEP 6: Create date ==========");
    system.createdate("sample-date");
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


class Workout {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Workout.id required')
    }

    if (!name?.trim()) {
      throw new Error('Workout.name required')
    }
    console.log(\`[Workout.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Workout \${this.id} invalid status\`)
    }
    console.log(\`[Workout.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Workout \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Workout.close] id=\${this.id} -> CLOSED\`)
  }
}


class DailyActivity {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('DailyActivity.id required')
    }

    if (!name?.trim()) {
      throw new Error('DailyActivity.name required')
    }
    console.log(\`[DailyActivity.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`DailyActivity \${this.id} invalid status\`)
    }
    console.log(\`[DailyActivity.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`DailyActivity \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[DailyActivity.close] id=\${this.id} -> CLOSED\`)
  }
}


class activeMinutes {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('activeMinutes.id required')
    }

    if (!name?.trim()) {
      throw new Error('activeMinutes.name required')
    }
    console.log(\`[activeMinutes.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`activeMinutes \${this.id} invalid status\`)
    }
    console.log(\`[activeMinutes.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`activeMinutes \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[activeMinutes.close] id=\${this.id} -> CLOSED\`)
  }
}


class date {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('date.id required')
    }

    if (!name?.trim()) {
      throw new Error('date.name required')
    }
    console.log(\`[date.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`date \${this.id} invalid status\`)
    }
    console.log(\`[date.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`date \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[date.close] id=\${this.id} -> CLOSED\`)
  }
}

class FitnessTrackerAppService {
  private seq = 1
  private users = new Map<string, User>()
  private workouts = new Map<string, Workout>()
  private daily_activities = new Map<string, DailyActivity>()
  private active_minutess = new Map<string, activeMinutes>()
  private dates = new Map<string, date>()
  constructor() {
    console.log('[FitnessTrackerAppService.__init__] system ready')
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
    console.log(\`[FitnessTrackerAppService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[FitnessTrackerAppService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createWorkout(name: string): Workout {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Workout name required')
    }
    const id = \`WOR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Workout(id, cleaned)
    obj.validate()
    this.workouts.set(id, obj)
    console.log(\`[FitnessTrackerAppService.createWorkout] stored \${id} count=\${this.workouts.size}\`)
    return obj
  }

  getWorkout(id: string): Workout {
    const obj = this.workouts.get(id)
    if (!obj) {
      throw new Error(\`unknown Workout id: \${id}\`)
    }
    console.log(\`[FitnessTrackerAppService.getWorkout] found id=\${obj.id}\`)
    return obj
  }

  createDailyActivity(name: string): DailyActivity {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('DailyActivity name required')
    }
    const id = \`DAI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new DailyActivity(id, cleaned)
    obj.validate()
    this.daily_activities.set(id, obj)
    console.log(\`[FitnessTrackerAppService.createDailyActivity] stored \${id} count=\${this.daily_activities.size}\`)
    return obj
  }

  getDailyActivity(id: string): DailyActivity {
    const obj = this.daily_activities.get(id)
    if (!obj) {
      throw new Error(\`unknown DailyActivity id: \${id}\`)
    }
    console.log(\`[FitnessTrackerAppService.getDailyActivity] found id=\${obj.id}\`)
    return obj
  }

  createactiveMinutes(name: string): activeMinutes {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('activeMinutes name required')
    }
    const id = \`ACT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new activeMinutes(id, cleaned)
    obj.validate()
    this.active_minutess.set(id, obj)
    console.log(\`[FitnessTrackerAppService.createactiveMinutes] stored \${id} count=\${this.active_minutess.size}\`)
    return obj
  }

  getactiveMinutes(id: string): activeMinutes {
    const obj = this.active_minutess.get(id)
    if (!obj) {
      throw new Error(\`unknown activeMinutes id: \${id}\`)
    }
    console.log(\`[FitnessTrackerAppService.getactiveMinutes] found id=\${obj.id}\`)
    return obj
  }

  createdate(name: string): date {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('date name required')
    }
    const id = \`DAT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new date(id, cleaned)
    obj.validate()
    this.dates.set(id, obj)
    console.log(\`[FitnessTrackerAppService.createdate] stored \${id} count=\${this.dates.size}\`)
    return obj
  }

  getdate(id: string): date {
    const obj = this.dates.get(id)
    if (!obj) {
      throw new Error(\`unknown date id: \${id}\`)
    }
    console.log(\`[FitnessTrackerAppService.getdate] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[FitnessTrackerAppService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[FitnessTrackerAppService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct FitnessTrackerAppService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new FitnessTrackerAppService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Workout ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createWorkout('sample-workout')
  console.log('========== STEP 4: Create DailyActivity ==========')
  system.createDailyActivity('sample-daily_activity')
  console.log('========== STEP 5: Create activeMinutes ==========')
  system.createactiveMinutes('sample-active_minutes')
  console.log('========== STEP 6: Create date ==========')
  system.createdate('sample-date')
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


class Workout {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Workout(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Workout requires id and name");
    }
    cout << "[Workout.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Workout invalid status");
    }
    cout << "[Workout.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Workout cannot close");
    }
    status_ = "CLOSED";
    cout << "[Workout.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class DailyActivity {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  DailyActivity(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("DailyActivity requires id and name");
    }
    cout << "[DailyActivity.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("DailyActivity invalid status");
    }
    cout << "[DailyActivity.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("DailyActivity cannot close");
    }
    status_ = "CLOSED";
    cout << "[DailyActivity.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class activeMinutes {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  activeMinutes(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("activeMinutes requires id and name");
    }
    cout << "[activeMinutes.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("activeMinutes invalid status");
    }
    cout << "[activeMinutes.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("activeMinutes cannot close");
    }
    status_ = "CLOSED";
    cout << "[activeMinutes.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class date {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  date(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("date requires id and name");
    }
    cout << "[date.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("date invalid status");
    }
    cout << "[date.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("date cannot close");
    }
    status_ = "CLOSED";
    cout << "[date.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class FitnessTrackerAppService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Workout> workouts_;
  unordered_map<string, DailyActivity> daily_activities_;
  unordered_map<string, activeMinutes> active_minutess_;
  unordered_map<string, date> dates_;
public:
  FitnessTrackerAppService() {
    cout << "[FitnessTrackerAppService.__init__] system ready" << endl;
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
    cout << "[FitnessTrackerAppService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[FitnessTrackerAppService.getUser] found " << id << endl;
    return it->second;
  }

  Workout createWorkout(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Workout name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "WOR-%04d", seq_++);
    Workout obj{buf, name};
    obj.validate();
    workouts_.emplace(obj.id(), obj);
    cout << "[FitnessTrackerAppService.createWorkout] stored " << obj.id() << endl;
    return obj;
  }

  Workout getWorkout(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = workouts_.find(id);
    if (it == workouts_.end()) {
      throw out_of_range("unknown Workout id");
    }
    cout << "[FitnessTrackerAppService.getWorkout] found " << id << endl;
    return it->second;
  }

  DailyActivity createDailyActivity(const string& name) {
    if (name.empty()) {
      throw invalid_argument("DailyActivity name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DAI-%04d", seq_++);
    DailyActivity obj{buf, name};
    obj.validate();
    daily_activities_.emplace(obj.id(), obj);
    cout << "[FitnessTrackerAppService.createDailyActivity] stored " << obj.id() << endl;
    return obj;
  }

  DailyActivity getDailyActivity(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = daily_activities_.find(id);
    if (it == daily_activities_.end()) {
      throw out_of_range("unknown DailyActivity id");
    }
    cout << "[FitnessTrackerAppService.getDailyActivity] found " << id << endl;
    return it->second;
  }

  activeMinutes createactiveMinutes(const string& name) {
    if (name.empty()) {
      throw invalid_argument("activeMinutes name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ACT-%04d", seq_++);
    activeMinutes obj{buf, name};
    obj.validate();
    active_minutess_.emplace(obj.id(), obj);
    cout << "[FitnessTrackerAppService.createactiveMinutes] stored " << obj.id() << endl;
    return obj;
  }

  activeMinutes getactiveMinutes(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = active_minutess_.find(id);
    if (it == active_minutess_.end()) {
      throw out_of_range("unknown activeMinutes id");
    }
    cout << "[FitnessTrackerAppService.getactiveMinutes] found " << id << endl;
    return it->second;
  }

  date createdate(const string& name) {
    if (name.empty()) {
      throw invalid_argument("date name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DAT-%04d", seq_++);
    date obj{buf, name};
    obj.validate();
    dates_.emplace(obj.id(), obj);
    cout << "[FitnessTrackerAppService.createdate] stored " << obj.id() << endl;
    return obj;
  }

  date getdate(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = dates_.find(id);
    if (it == dates_.end()) {
      throw out_of_range("unknown date id");
    }
    cout << "[FitnessTrackerAppService.getdate] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[FitnessTrackerAppService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct FitnessTrackerAppService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  FitnessTrackerAppService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createWorkout("sample-workout");
  system.createDailyActivity("sample-daily_activity");
  system.createactiveMinutes("sample-active_minutes");
  system.createdate("sample-date");
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


type Workout struct {
  ID     string
  Name   string
  Status string
}

func NewWorkout(id, name string) (*Workout, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Workout requires id and name")
  }
  obj := &Workout{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Workout.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Workout) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Workout invalid status")
  }
  fmt.Printf("[Workout.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Workout) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Workout %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Workout.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type DailyActivity struct {
  ID     string
  Name   string
  Status string
}

func NewDailyActivity(id, name string) (*DailyActivity, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("DailyActivity requires id and name")
  }
  obj := &DailyActivity{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[DailyActivity.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *DailyActivity) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("DailyActivity invalid status")
  }
  fmt.Printf("[DailyActivity.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *DailyActivity) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("DailyActivity %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[DailyActivity.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type activeMinutes struct {
  ID     string
  Name   string
  Status string
}

func NewactiveMinutes(id, name string) (*activeMinutes, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("activeMinutes requires id and name")
  }
  obj := &activeMinutes{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[activeMinutes.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *activeMinutes) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("activeMinutes invalid status")
  }
  fmt.Printf("[activeMinutes.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *activeMinutes) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("activeMinutes %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[activeMinutes.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type date struct {
  ID     string
  Name   string
  Status string
}

func Newdate(id, name string) (*date, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("date requires id and name")
  }
  obj := &date{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[date.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *date) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("date invalid status")
  }
  fmt.Printf("[date.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *date) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("date %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[date.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type FitnessTrackerAppService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  workouts map[string]*Workout
  daily_activities map[string]*DailyActivity
  active_minutess map[string]*activeMinutes
  dates map[string]*date
}

func NewFitnessTrackerAppService() *FitnessTrackerAppService {
  fmt.Println("[FitnessTrackerAppService.__init__] system ready")
  return &FitnessTrackerAppService{
    seq: 1,
    users: map[string]*User{},
    workouts: map[string]*Workout{},
    daily_activities: map[string]*DailyActivity{},
    active_minutess: map[string]*activeMinutes{},
    dates: map[string]*date{},
  }
}

func (s *FitnessTrackerAppService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[FitnessTrackerAppService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[FitnessTrackerAppService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) CreateWorkout(name string) (*Workout, error) {
  if name == "" {
    return nil, fmt.Errorf("Workout name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("WOR-%04d", s.seq)
  s.seq++
  obj, err := NewWorkout(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.workouts[id] = obj
  fmt.Printf("[FitnessTrackerAppService.CreateWorkout] stored %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) GetWorkout(id string) (*Workout, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.workouts[id]
  if !ok {
    return nil, fmt.Errorf("unknown Workout id: %s", id)
  }
  fmt.Printf("[FitnessTrackerAppService.GetWorkout] found %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) CreateDailyActivity(name string) (*DailyActivity, error) {
  if name == "" {
    return nil, fmt.Errorf("DailyActivity name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DAI-%04d", s.seq)
  s.seq++
  obj, err := NewDailyActivity(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.daily_activities[id] = obj
  fmt.Printf("[FitnessTrackerAppService.CreateDailyActivity] stored %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) GetDailyActivity(id string) (*DailyActivity, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.daily_activities[id]
  if !ok {
    return nil, fmt.Errorf("unknown DailyActivity id: %s", id)
  }
  fmt.Printf("[FitnessTrackerAppService.GetDailyActivity] found %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) CreateactiveMinutes(name string) (*activeMinutes, error) {
  if name == "" {
    return nil, fmt.Errorf("activeMinutes name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ACT-%04d", s.seq)
  s.seq++
  obj, err := NewactiveMinutes(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.active_minutess[id] = obj
  fmt.Printf("[FitnessTrackerAppService.CreateactiveMinutes] stored %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) GetactiveMinutes(id string) (*activeMinutes, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.active_minutess[id]
  if !ok {
    return nil, fmt.Errorf("unknown activeMinutes id: %s", id)
  }
  fmt.Printf("[FitnessTrackerAppService.GetactiveMinutes] found %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) Createdate(name string) (*date, error) {
  if name == "" {
    return nil, fmt.Errorf("date name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DAT-%04d", s.seq)
  s.seq++
  obj, err := Newdate(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.dates[id] = obj
  fmt.Printf("[FitnessTrackerAppService.Createdate] stored %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) Getdate(id string) (*date, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.dates[id]
  if !ok {
    return nil, fmt.Errorf("unknown date id: %s", id)
  }
  fmt.Printf("[FitnessTrackerAppService.Getdate] found %s\\n", id)
  return obj, nil
}

func (s *FitnessTrackerAppService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[FitnessTrackerAppService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct FitnessTrackerAppService ==========")
  system := NewFitnessTrackerAppService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateWorkout("sample-workout")
  system.CreateDailyActivity("sample-daily_activity")
  system.CreateactiveMinutes("sample-active_minutes")
  system.Createdate("sample-date")
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


sealed class Workout {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Workout(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Workout requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Workout.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Workout invalid status");
    }
    Console.WriteLine("[Workout.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Workout " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Workout.close] id=" + Id + " -> CLOSED");
  }
}


sealed class DailyActivity {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public DailyActivity(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DailyActivity requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[DailyActivity.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("DailyActivity invalid status");
    }
    Console.WriteLine("[DailyActivity.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("DailyActivity " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[DailyActivity.close] id=" + Id + " -> CLOSED");
  }
}


sealed class activeMinutes {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public activeMinutes(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("activeMinutes requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[activeMinutes.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("activeMinutes invalid status");
    }
    Console.WriteLine("[activeMinutes.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("activeMinutes " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[activeMinutes.close] id=" + Id + " -> CLOSED");
  }
}


sealed class date {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public date(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("date requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[date.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("date invalid status");
    }
    Console.WriteLine("[date.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("date " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[date.close] id=" + Id + " -> CLOSED");
  }
}

sealed class FitnessTrackerAppService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Workout> _workouts = new();
  private readonly Dictionary<string, DailyActivity> _daily_activities = new();
  private readonly Dictionary<string, activeMinutes> _active_minutess = new();
  private readonly Dictionary<string, date> _dates = new();
  public FitnessTrackerAppService() {
    Console.WriteLine("[FitnessTrackerAppService.__init__] system ready");
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
      Console.WriteLine("[FitnessTrackerAppService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[FitnessTrackerAppService.GetUser] found " + id);
      return obj;
    }
  }

  public Workout CreateWorkout(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Workout name required");
    }
    lock (_gate) {
      var id = string.Format("WOR-{0:D4}", _seq++);
      var obj = new Workout(id, name.Trim());
      obj.Validate();
      _workouts[id] = obj;
      Console.WriteLine("[FitnessTrackerAppService.CreateWorkout] stored " + id);
      return obj;
    }
  }

  public Workout GetWorkout(string id) {
    lock (_gate) {
      if (!_workouts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Workout id: " + id);
      }
      Console.WriteLine("[FitnessTrackerAppService.GetWorkout] found " + id);
      return obj;
    }
  }

  public DailyActivity CreateDailyActivity(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DailyActivity name required");
    }
    lock (_gate) {
      var id = string.Format("DAI-{0:D4}", _seq++);
      var obj = new DailyActivity(id, name.Trim());
      obj.Validate();
      _daily_activities[id] = obj;
      Console.WriteLine("[FitnessTrackerAppService.CreateDailyActivity] stored " + id);
      return obj;
    }
  }

  public DailyActivity GetDailyActivity(string id) {
    lock (_gate) {
      if (!_daily_activities.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown DailyActivity id: " + id);
      }
      Console.WriteLine("[FitnessTrackerAppService.GetDailyActivity] found " + id);
      return obj;
    }
  }

  public activeMinutes CreateactiveMinutes(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("activeMinutes name required");
    }
    lock (_gate) {
      var id = string.Format("ACT-{0:D4}", _seq++);
      var obj = new activeMinutes(id, name.Trim());
      obj.Validate();
      _active_minutess[id] = obj;
      Console.WriteLine("[FitnessTrackerAppService.CreateactiveMinutes] stored " + id);
      return obj;
    }
  }

  public activeMinutes GetactiveMinutes(string id) {
    lock (_gate) {
      if (!_active_minutess.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown activeMinutes id: " + id);
      }
      Console.WriteLine("[FitnessTrackerAppService.GetactiveMinutes] found " + id);
      return obj;
    }
  }

  public date Createdate(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("date name required");
    }
    lock (_gate) {
      var id = string.Format("DAT-{0:D4}", _seq++);
      var obj = new date(id, name.Trim());
      obj.Validate();
      _dates[id] = obj;
      Console.WriteLine("[FitnessTrackerAppService.Createdate] stored " + id);
      return obj;
    }
  }

  public date Getdate(string id) {
    lock (_gate) {
      if (!_dates.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown date id: " + id);
      }
      Console.WriteLine("[FitnessTrackerAppService.Getdate] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[FitnessTrackerAppService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct FitnessTrackerAppService ==========");
    var system = new FitnessTrackerAppService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateWorkout("sample-workout");
    system.CreateDailyActivity("sample-daily_activity");
    system.CreateactiveMinutes("sample-active_minutes");
    system.Createdate("sample-date");
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

export const fitnessTrackerAppSolution: ProblemSolution = {
  slug: 'fitness-tracker-app',
  title: 'Fitness Tracker App - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a fitness tracking app that logs workouts, steps, and goals, and computes progress analytics. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Log workouts (type, duration, calories, distance)',
      'Track daily step count and active minutes',
      'Set fitness goals (weekly steps, weight target) and track progress',
      'Show historical trends (weekly/monthly charts)',
      'Award achievement badges for milestones',
      'Sync data from wearable devices',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Log workouts (type, duration, calories, distance)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Track daily step count and active minutes?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Set fitness goals (weekly steps, weight target) and track progress?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Show historical trends (weekly/monthly charts)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Award achievement badges for milestones?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. FitnessTrackerAppService is the facade stereotype. User, Workout, DailyActivity, activeMinutes, date are concrete domain classes with id/name/status and validate/close.',
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
          'Construct FitnessTrackerAppService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'FitnessTrackerAppService', responsibility: 'UML facade - orchestrates Fitness Tracker App.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Workout', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'DailyActivity', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'activeMinutes', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'date', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from FitnessTrackerAppService to User, Workout, DailyActivity, activeMinutes, date. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on FitnessTrackerAppService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'FitnessTrackerAppService', responsibility: 'UML facade - orchestrates Fitness Tracker App.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Workout', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'DailyActivity', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'activeMinutes', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'date', responsibility: 'UML class - domain object for Fitness Tracker App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'FitnessTrackerAppService exposes create/get/close and owns composed collections.' },
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
      'main constructs FitnessTrackerAppService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct FitnessTrackerAppService.',
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
