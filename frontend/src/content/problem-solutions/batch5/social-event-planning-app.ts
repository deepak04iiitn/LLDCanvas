import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'SocialEventPlanningAppService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_groups', 'Map<string, Group>'),
    attr('-', '_events', 'Map<string, Event>'),
    attr('-', '_capacities', 'Map<string, capacity>'),
    attr('-', '_start_times', 'Map<string, startTime>'),
    attr('-', '_rsvps', 'Map<string, RSVP>'),
  ], [
    method('+', 'createGroup', 'name: string', 'Group'),
    method('+', 'createEvent', 'name: string', 'Event'),
    method('+', 'createcapacity', 'name: string', 'capacity'),
    method('+', 'createstartTime', 'name: string', 'startTime'),
    method('+', 'createRSVP', 'name: string', 'RSVP'),
    method('+', 'getGroup', 'id: string', 'Group'),
    method('+', 'getEvent', 'id: string', 'Event'),
    method('+', 'getcapacity', 'id: string', 'capacity'),
    method('+', 'getstartTime', 'id: string', 'startTime'),
    method('+', 'getRSVP', 'id: string', 'RSVP'),
    method('+', 'closeGroup', 'id: string', 'Group'),
  ], 'facade'),
  cls('n1', 'Group', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Event', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'capacity', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'startTime', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'RSVP', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("social-event-planning-app")


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


class Event:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Event.id is required")
        if not name or not name.strip():
            raise ValueError("Event.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Event.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Event {self.id} has invalid status={self.status}")
        log.info("[Event.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Event {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Event.close] id=%s -> CLOSED", self.id)


class capacity:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("capacity.id is required")
        if not name or not name.strip():
            raise ValueError("capacity.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[capacity.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"capacity {self.id} has invalid status={self.status}")
        log.info("[capacity.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"capacity {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[capacity.close] id=%s -> CLOSED", self.id)


class startTime:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("startTime.id is required")
        if not name or not name.strip():
            raise ValueError("startTime.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[startTime.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"startTime {self.id} has invalid status={self.status}")
        log.info("[startTime.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"startTime {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[startTime.close] id=%s -> CLOSED", self.id)


class RSVP:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("RSVP.id is required")
        if not name or not name.strip():
            raise ValueError("RSVP.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[RSVP.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"RSVP {self.id} has invalid status={self.status}")
        log.info("[RSVP.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"RSVP {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[RSVP.close] id=%s -> CLOSED", self.id)


class SocialEventPlanningAppService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._groups: Dict[str, Group] = {}
        self._events: Dict[str, Event] = {}
        self._capacities: Dict[str, capacity] = {}
        self._start_times: Dict[str, startTime] = {}
        self._rsvps: Dict[str, RSVP] = {}
        log.info("[SocialEventPlanningAppService.__init__] system ready; managing: Group, Event, capacity, startTime, RSVP")

    def create_group(self, name: str) -> Group:
        """UML: SocialEventPlanningAppService.create_group(name) -> Group"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Group name is required")
        with self._lock:
            item_id = f"GRO-{self._seq:04d}"
            self._seq += 1
            obj = Group(item_id, cleaned)
            obj.validate()
            self._groups[item_id] = obj
            log.info("[SocialEventPlanningAppService.create_group] stored %s in _groups (count=%s)", item_id, len(self._groups))
            return obj

    def get_group(self, item_id: str) -> Group:
        with self._lock:
            obj = self._groups.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Group id: {item_id}")
            log.info("[SocialEventPlanningAppService.get_group] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_event(self, name: str) -> Event:
        """UML: SocialEventPlanningAppService.create_event(name) -> Event"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Event name is required")
        with self._lock:
            item_id = f"EVE-{self._seq:04d}"
            self._seq += 1
            obj = Event(item_id, cleaned)
            obj.validate()
            self._events[item_id] = obj
            log.info("[SocialEventPlanningAppService.create_event] stored %s in _events (count=%s)", item_id, len(self._events))
            return obj

    def get_event(self, item_id: str) -> Event:
        with self._lock:
            obj = self._events.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Event id: {item_id}")
            log.info("[SocialEventPlanningAppService.get_event] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_capacity(self, name: str) -> capacity:
        """UML: SocialEventPlanningAppService.create_capacity(name) -> capacity"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("capacity name is required")
        with self._lock:
            item_id = f"CAP-{self._seq:04d}"
            self._seq += 1
            obj = capacity(item_id, cleaned)
            obj.validate()
            self._capacities[item_id] = obj
            log.info("[SocialEventPlanningAppService.create_capacity] stored %s in _capacities (count=%s)", item_id, len(self._capacities))
            return obj

    def get_capacity(self, item_id: str) -> capacity:
        with self._lock:
            obj = self._capacities.get(item_id)
            if obj is None:
                raise KeyError(f"unknown capacity id: {item_id}")
            log.info("[SocialEventPlanningAppService.get_capacity] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_start_time(self, name: str) -> startTime:
        """UML: SocialEventPlanningAppService.create_start_time(name) -> startTime"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("startTime name is required")
        with self._lock:
            item_id = f"STA-{self._seq:04d}"
            self._seq += 1
            obj = startTime(item_id, cleaned)
            obj.validate()
            self._start_times[item_id] = obj
            log.info("[SocialEventPlanningAppService.create_start_time] stored %s in _start_times (count=%s)", item_id, len(self._start_times))
            return obj

    def get_start_time(self, item_id: str) -> startTime:
        with self._lock:
            obj = self._start_times.get(item_id)
            if obj is None:
                raise KeyError(f"unknown startTime id: {item_id}")
            log.info("[SocialEventPlanningAppService.get_start_time] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_rsvp(self, name: str) -> RSVP:
        """UML: SocialEventPlanningAppService.create_rsvp(name) -> RSVP"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("RSVP name is required")
        with self._lock:
            item_id = f"RSV-{self._seq:04d}"
            self._seq += 1
            obj = RSVP(item_id, cleaned)
            obj.validate()
            self._rsvps[item_id] = obj
            log.info("[SocialEventPlanningAppService.create_rsvp] stored %s in _rsvps (count=%s)", item_id, len(self._rsvps))
            return obj

    def get_rsvp(self, item_id: str) -> RSVP:
        with self._lock:
            obj = self._rsvps.get(item_id)
            if obj is None:
                raise KeyError(f"unknown RSVP id: {item_id}")
            log.info("[SocialEventPlanningAppService.get_rsvp] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_group(self, item_id: str) -> Group:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._groups.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Group id: {item_id}")
            log.info("[SocialEventPlanningAppService.close_group] closing %s via Group.close()", item_id)
            obj.close()
            return obj

    def list_active_groups(self) -> List[Group]:
        with self._lock:
            active = [o for o in self._groups.values() if o.status == "ACTIVE"]
            log.info("[SocialEventPlanningAppService.list_active_groups] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct SocialEventPlanningAppService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = SocialEventPlanningAppService()

    log.info("========== STEP 2: Create primary Group objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_group("alpha-group")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_group("beta-group")

    log.info("========== STEP 3: Create Event (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_event("sample-event")

    log.info("========== STEP 4: Create capacity (UML class) ==========")
    system.create_capacity("sample-capacity")

    log.info("========== STEP 5: Create startTime (UML class) ==========")
    system.create_start_time("sample-start_time")

    log.info("========== STEP 6: Create RSVP (UML class) ==========")
    system.create_rsvp("sample-rsvp")

    log.info("========== STEP 7: Inspect active Group list ==========")
    system.list_active_groups()

    log.info("========== STEP 8: Close first Group ==========")
    system.close_group(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_group(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Group.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_group("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_group: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_groups()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

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


class Event {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Event(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Event.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Event.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Event.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Event " + id + " invalid status");
    }
    System.out.println("[Event.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Event " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Event.close] id=" + id + " -> CLOSED");
  }
}


class capacity {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  capacity(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("capacity.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("capacity.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[capacity.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("capacity " + id + " invalid status");
    }
    System.out.println("[capacity.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("capacity " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[capacity.close] id=" + id + " -> CLOSED");
  }
}


class startTime {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  startTime(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("startTime.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("startTime.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[startTime.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("startTime " + id + " invalid status");
    }
    System.out.println("[startTime.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("startTime " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[startTime.close] id=" + id + " -> CLOSED");
  }
}


class RSVP {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  RSVP(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("RSVP.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("RSVP.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[RSVP.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("RSVP " + id + " invalid status");
    }
    System.out.println("[RSVP.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("RSVP " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[RSVP.close] id=" + id + " -> CLOSED");
  }
}

public class SocialEventPlanningAppService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Group> groups = new LinkedHashMap<>();
  private final Map<String, Event> events = new LinkedHashMap<>();
  private final Map<String, capacity> capacities = new LinkedHashMap<>();
  private final Map<String, startTime> start_times = new LinkedHashMap<>();
  private final Map<String, RSVP> rsvps = new LinkedHashMap<>();

  public SocialEventPlanningAppService() {
    System.out.println("[SocialEventPlanningAppService.__init__] system ready");
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
      System.out.println("[SocialEventPlanningAppService.createGroup] stored " + id + " count=" + groups.size());
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
      System.out.println("[SocialEventPlanningAppService.getGroup] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Event createEvent(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Event name required");
    }
    lock.lock();
    try {
      String id = String.format("EVE-%04d", seq++);
      Event obj = new Event(id, name.trim());
      obj.validate();
      events.put(id, obj);
      System.out.println("[SocialEventPlanningAppService.createEvent] stored " + id + " count=" + events.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Event getEvent(String id) {
    lock.lock();
    try {
      Event obj = events.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Event id: " + id);
      }
      System.out.println("[SocialEventPlanningAppService.getEvent] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public capacity createcapacity(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("capacity name required");
    }
    lock.lock();
    try {
      String id = String.format("CAP-%04d", seq++);
      capacity obj = new capacity(id, name.trim());
      obj.validate();
      capacities.put(id, obj);
      System.out.println("[SocialEventPlanningAppService.createcapacity] stored " + id + " count=" + capacities.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public capacity getcapacity(String id) {
    lock.lock();
    try {
      capacity obj = capacities.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown capacity id: " + id);
      }
      System.out.println("[SocialEventPlanningAppService.getcapacity] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public startTime createstartTime(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("startTime name required");
    }
    lock.lock();
    try {
      String id = String.format("STA-%04d", seq++);
      startTime obj = new startTime(id, name.trim());
      obj.validate();
      start_times.put(id, obj);
      System.out.println("[SocialEventPlanningAppService.createstartTime] stored " + id + " count=" + start_times.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public startTime getstartTime(String id) {
    lock.lock();
    try {
      startTime obj = start_times.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown startTime id: " + id);
      }
      System.out.println("[SocialEventPlanningAppService.getstartTime] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public RSVP createRSVP(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("RSVP name required");
    }
    lock.lock();
    try {
      String id = String.format("RSV-%04d", seq++);
      RSVP obj = new RSVP(id, name.trim());
      obj.validate();
      rsvps.put(id, obj);
      System.out.println("[SocialEventPlanningAppService.createRSVP] stored " + id + " count=" + rsvps.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public RSVP getRSVP(String id) {
    lock.lock();
    try {
      RSVP obj = rsvps.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown RSVP id: " + id);
      }
      System.out.println("[SocialEventPlanningAppService.getRSVP] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Group closeGroup(String id) {
    lock.lock();
    try {
      Group obj = groups.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Group id: " + id);
      }
      System.out.println("[SocialEventPlanningAppService.closeGroup] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Group> listActiveGroups() {
    lock.lock();
    try {
      List<Group> out = new ArrayList<>();
      for (Group o : groups.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[SocialEventPlanningAppService.listActiveGroups] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct SocialEventPlanningAppService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    SocialEventPlanningAppService system = new SocialEventPlanningAppService();
    System.out.println("========== STEP 2: Create Group objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Group first = system.createGroup("alpha-group");
    system.createGroup("beta-group");
    System.out.println("========== STEP 3: Create Event ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createEvent("sample-event");
    System.out.println("========== STEP 4: Create capacity ==========");
    system.createcapacity("sample-capacity");
    System.out.println("========== STEP 5: Create startTime ==========");
    system.createstartTime("sample-start_time");
    System.out.println("========== STEP 6: Create RSVP ==========");
    system.createRSVP("sample-rsvp");
    System.out.println("========== Inspect active list ==========");
    system.listActiveGroups();
    System.out.println("========== Close first Group ==========");
    system.closeGroup(first.getId());
    try {
      system.closeGroup(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getGroup("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
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


class Event {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Event.id required')
    }

    if (!name?.trim()) {
      throw new Error('Event.name required')
    }
    console.log(\`[Event.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Event \${this.id} invalid status\`)
    }
    console.log(\`[Event.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Event \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Event.close] id=\${this.id} -> CLOSED\`)
  }
}


class capacity {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('capacity.id required')
    }

    if (!name?.trim()) {
      throw new Error('capacity.name required')
    }
    console.log(\`[capacity.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`capacity \${this.id} invalid status\`)
    }
    console.log(\`[capacity.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`capacity \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[capacity.close] id=\${this.id} -> CLOSED\`)
  }
}


class startTime {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('startTime.id required')
    }

    if (!name?.trim()) {
      throw new Error('startTime.name required')
    }
    console.log(\`[startTime.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`startTime \${this.id} invalid status\`)
    }
    console.log(\`[startTime.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`startTime \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[startTime.close] id=\${this.id} -> CLOSED\`)
  }
}


class RSVP {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('RSVP.id required')
    }

    if (!name?.trim()) {
      throw new Error('RSVP.name required')
    }
    console.log(\`[RSVP.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`RSVP \${this.id} invalid status\`)
    }
    console.log(\`[RSVP.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`RSVP \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[RSVP.close] id=\${this.id} -> CLOSED\`)
  }
}

class SocialEventPlanningAppService {
  private seq = 1
  private groups = new Map<string, Group>()
  private events = new Map<string, Event>()
  private capacities = new Map<string, capacity>()
  private start_times = new Map<string, startTime>()
  private rsvps = new Map<string, RSVP>()
  constructor() {
    console.log('[SocialEventPlanningAppService.__init__] system ready')
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
    console.log(\`[SocialEventPlanningAppService.createGroup] stored \${id} count=\${this.groups.size}\`)
    return obj
  }

  getGroup(id: string): Group {
    const obj = this.groups.get(id)
    if (!obj) {
      throw new Error(\`unknown Group id: \${id}\`)
    }
    console.log(\`[SocialEventPlanningAppService.getGroup] found id=\${obj.id}\`)
    return obj
  }

  createEvent(name: string): Event {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Event name required')
    }
    const id = \`EVE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Event(id, cleaned)
    obj.validate()
    this.events.set(id, obj)
    console.log(\`[SocialEventPlanningAppService.createEvent] stored \${id} count=\${this.events.size}\`)
    return obj
  }

  getEvent(id: string): Event {
    const obj = this.events.get(id)
    if (!obj) {
      throw new Error(\`unknown Event id: \${id}\`)
    }
    console.log(\`[SocialEventPlanningAppService.getEvent] found id=\${obj.id}\`)
    return obj
  }

  createcapacity(name: string): capacity {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('capacity name required')
    }
    const id = \`CAP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new capacity(id, cleaned)
    obj.validate()
    this.capacities.set(id, obj)
    console.log(\`[SocialEventPlanningAppService.createcapacity] stored \${id} count=\${this.capacities.size}\`)
    return obj
  }

  getcapacity(id: string): capacity {
    const obj = this.capacities.get(id)
    if (!obj) {
      throw new Error(\`unknown capacity id: \${id}\`)
    }
    console.log(\`[SocialEventPlanningAppService.getcapacity] found id=\${obj.id}\`)
    return obj
  }

  createstartTime(name: string): startTime {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('startTime name required')
    }
    const id = \`STA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new startTime(id, cleaned)
    obj.validate()
    this.start_times.set(id, obj)
    console.log(\`[SocialEventPlanningAppService.createstartTime] stored \${id} count=\${this.start_times.size}\`)
    return obj
  }

  getstartTime(id: string): startTime {
    const obj = this.start_times.get(id)
    if (!obj) {
      throw new Error(\`unknown startTime id: \${id}\`)
    }
    console.log(\`[SocialEventPlanningAppService.getstartTime] found id=\${obj.id}\`)
    return obj
  }

  createRSVP(name: string): RSVP {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('RSVP name required')
    }
    const id = \`RSV-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new RSVP(id, cleaned)
    obj.validate()
    this.rsvps.set(id, obj)
    console.log(\`[SocialEventPlanningAppService.createRSVP] stored \${id} count=\${this.rsvps.size}\`)
    return obj
  }

  getRSVP(id: string): RSVP {
    const obj = this.rsvps.get(id)
    if (!obj) {
      throw new Error(\`unknown RSVP id: \${id}\`)
    }
    console.log(\`[SocialEventPlanningAppService.getRSVP] found id=\${obj.id}\`)
    return obj
  }

  closeGroup(id: string): Group {
    const obj = this.getGroup(id)
    console.log(\`[SocialEventPlanningAppService.closeGroup] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveGroups(): Group[] {
    const active = [...this.groups.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[SocialEventPlanningAppService.listActiveGroups] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct SocialEventPlanningAppService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new SocialEventPlanningAppService()
  console.log('========== STEP 2: Create Group objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createGroup('alpha-group')
  system.createGroup('beta-group')
  console.log('========== STEP 3: Create Event ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createEvent('sample-event')
  console.log('========== STEP 4: Create capacity ==========')
  system.createcapacity('sample-capacity')
  console.log('========== STEP 5: Create startTime ==========')
  system.createstartTime('sample-start_time')
  console.log('========== STEP 6: Create RSVP ==========')
  system.createRSVP('sample-rsvp')
  system.listActiveGroups()
  console.log('========== Close first Group ==========')
  system.closeGroup(first.id)
  try {
    system.closeGroup(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getGroup('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

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


class Event {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Event(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Event requires id and name");
    }
    cout << "[Event.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Event invalid status");
    }
    cout << "[Event.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Event cannot close");
    }
    status_ = "CLOSED";
    cout << "[Event.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class capacity {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  capacity(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("capacity requires id and name");
    }
    cout << "[capacity.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("capacity invalid status");
    }
    cout << "[capacity.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("capacity cannot close");
    }
    status_ = "CLOSED";
    cout << "[capacity.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class startTime {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  startTime(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("startTime requires id and name");
    }
    cout << "[startTime.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("startTime invalid status");
    }
    cout << "[startTime.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("startTime cannot close");
    }
    status_ = "CLOSED";
    cout << "[startTime.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class RSVP {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  RSVP(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("RSVP requires id and name");
    }
    cout << "[RSVP.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("RSVP invalid status");
    }
    cout << "[RSVP.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("RSVP cannot close");
    }
    status_ = "CLOSED";
    cout << "[RSVP.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class SocialEventPlanningAppService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Group> groups_;
  unordered_map<string, Event> events_;
  unordered_map<string, capacity> capacities_;
  unordered_map<string, startTime> start_times_;
  unordered_map<string, RSVP> rsvps_;
public:
  SocialEventPlanningAppService() {
    cout << "[SocialEventPlanningAppService.__init__] system ready" << endl;
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
    cout << "[SocialEventPlanningAppService.createGroup] stored " << obj.id() << endl;
    return obj;
  }

  Group getGroup(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = groups_.find(id);
    if (it == groups_.end()) {
      throw out_of_range("unknown Group id");
    }
    cout << "[SocialEventPlanningAppService.getGroup] found " << id << endl;
    return it->second;
  }

  Event createEvent(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Event name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "EVE-%04d", seq_++);
    Event obj{buf, name};
    obj.validate();
    events_.emplace(obj.id(), obj);
    cout << "[SocialEventPlanningAppService.createEvent] stored " << obj.id() << endl;
    return obj;
  }

  Event getEvent(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = events_.find(id);
    if (it == events_.end()) {
      throw out_of_range("unknown Event id");
    }
    cout << "[SocialEventPlanningAppService.getEvent] found " << id << endl;
    return it->second;
  }

  capacity createcapacity(const string& name) {
    if (name.empty()) {
      throw invalid_argument("capacity name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CAP-%04d", seq_++);
    capacity obj{buf, name};
    obj.validate();
    capacities_.emplace(obj.id(), obj);
    cout << "[SocialEventPlanningAppService.createcapacity] stored " << obj.id() << endl;
    return obj;
  }

  capacity getcapacity(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = capacities_.find(id);
    if (it == capacities_.end()) {
      throw out_of_range("unknown capacity id");
    }
    cout << "[SocialEventPlanningAppService.getcapacity] found " << id << endl;
    return it->second;
  }

  startTime createstartTime(const string& name) {
    if (name.empty()) {
      throw invalid_argument("startTime name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "STA-%04d", seq_++);
    startTime obj{buf, name};
    obj.validate();
    start_times_.emplace(obj.id(), obj);
    cout << "[SocialEventPlanningAppService.createstartTime] stored " << obj.id() << endl;
    return obj;
  }

  startTime getstartTime(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = start_times_.find(id);
    if (it == start_times_.end()) {
      throw out_of_range("unknown startTime id");
    }
    cout << "[SocialEventPlanningAppService.getstartTime] found " << id << endl;
    return it->second;
  }

  RSVP createRSVP(const string& name) {
    if (name.empty()) {
      throw invalid_argument("RSVP name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "RSV-%04d", seq_++);
    RSVP obj{buf, name};
    obj.validate();
    rsvps_.emplace(obj.id(), obj);
    cout << "[SocialEventPlanningAppService.createRSVP] stored " << obj.id() << endl;
    return obj;
  }

  RSVP getRSVP(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = rsvps_.find(id);
    if (it == rsvps_.end()) {
      throw out_of_range("unknown RSVP id");
    }
    cout << "[SocialEventPlanningAppService.getRSVP] found " << id << endl;
    return it->second;
  }

  Group closeGroup(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = groups_.find(id);
    if (it == groups_.end()) {
      throw out_of_range("unknown Group");
    }
    cout << "[SocialEventPlanningAppService.closeGroup] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct SocialEventPlanningAppService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  SocialEventPlanningAppService system;
  cout << "========== STEP 2: Create Group ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createGroup("alpha-group");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createGroup("beta-group");
  system.createEvent("sample-event");
  system.createcapacity("sample-capacity");
  system.createstartTime("sample-start_time");
  system.createRSVP("sample-rsvp");
  system.closeGroup(first.id());
  try {
    system.closeGroup(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getGroup("MISSING-ID");
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


type Event struct {
  ID     string
  Name   string
  Status string
}

func NewEvent(id, name string) (*Event, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Event requires id and name")
  }
  obj := &Event{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Event.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Event) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Event invalid status")
  }
  fmt.Printf("[Event.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Event) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Event %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Event.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type capacity struct {
  ID     string
  Name   string
  Status string
}

func Newcapacity(id, name string) (*capacity, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("capacity requires id and name")
  }
  obj := &capacity{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[capacity.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *capacity) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("capacity invalid status")
  }
  fmt.Printf("[capacity.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *capacity) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("capacity %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[capacity.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type startTime struct {
  ID     string
  Name   string
  Status string
}

func NewstartTime(id, name string) (*startTime, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("startTime requires id and name")
  }
  obj := &startTime{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[startTime.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *startTime) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("startTime invalid status")
  }
  fmt.Printf("[startTime.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *startTime) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("startTime %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[startTime.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type RSVP struct {
  ID     string
  Name   string
  Status string
}

func NewRSVP(id, name string) (*RSVP, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("RSVP requires id and name")
  }
  obj := &RSVP{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[RSVP.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *RSVP) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("RSVP invalid status")
  }
  fmt.Printf("[RSVP.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *RSVP) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("RSVP %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[RSVP.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type SocialEventPlanningAppService struct {
  mu  sync.Mutex
  seq int
  groups map[string]*Group
  events map[string]*Event
  capacities map[string]*capacity
  start_times map[string]*startTime
  rsvps map[string]*RSVP
}

func NewSocialEventPlanningAppService() *SocialEventPlanningAppService {
  fmt.Println("[SocialEventPlanningAppService.__init__] system ready")
  return &SocialEventPlanningAppService{
    seq: 1,
    groups: map[string]*Group{},
    events: map[string]*Event{},
    capacities: map[string]*capacity{},
    start_times: map[string]*startTime{},
    rsvps: map[string]*RSVP{},
  }
}

func (s *SocialEventPlanningAppService) CreateGroup(name string) (*Group, error) {
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
  fmt.Printf("[SocialEventPlanningAppService.CreateGroup] stored %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) GetGroup(id string) (*Group, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.groups[id]
  if !ok {
    return nil, fmt.Errorf("unknown Group id: %s", id)
  }
  fmt.Printf("[SocialEventPlanningAppService.GetGroup] found %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) CreateEvent(name string) (*Event, error) {
  if name == "" {
    return nil, fmt.Errorf("Event name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("EVE-%04d", s.seq)
  s.seq++
  obj, err := NewEvent(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.events[id] = obj
  fmt.Printf("[SocialEventPlanningAppService.CreateEvent] stored %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) GetEvent(id string) (*Event, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.events[id]
  if !ok {
    return nil, fmt.Errorf("unknown Event id: %s", id)
  }
  fmt.Printf("[SocialEventPlanningAppService.GetEvent] found %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) Createcapacity(name string) (*capacity, error) {
  if name == "" {
    return nil, fmt.Errorf("capacity name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CAP-%04d", s.seq)
  s.seq++
  obj, err := Newcapacity(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.capacities[id] = obj
  fmt.Printf("[SocialEventPlanningAppService.Createcapacity] stored %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) Getcapacity(id string) (*capacity, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.capacities[id]
  if !ok {
    return nil, fmt.Errorf("unknown capacity id: %s", id)
  }
  fmt.Printf("[SocialEventPlanningAppService.Getcapacity] found %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) CreatestartTime(name string) (*startTime, error) {
  if name == "" {
    return nil, fmt.Errorf("startTime name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("STA-%04d", s.seq)
  s.seq++
  obj, err := NewstartTime(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.start_times[id] = obj
  fmt.Printf("[SocialEventPlanningAppService.CreatestartTime] stored %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) GetstartTime(id string) (*startTime, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.start_times[id]
  if !ok {
    return nil, fmt.Errorf("unknown startTime id: %s", id)
  }
  fmt.Printf("[SocialEventPlanningAppService.GetstartTime] found %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) CreateRSVP(name string) (*RSVP, error) {
  if name == "" {
    return nil, fmt.Errorf("RSVP name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("RSV-%04d", s.seq)
  s.seq++
  obj, err := NewRSVP(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.rsvps[id] = obj
  fmt.Printf("[SocialEventPlanningAppService.CreateRSVP] stored %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) GetRSVP(id string) (*RSVP, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.rsvps[id]
  if !ok {
    return nil, fmt.Errorf("unknown RSVP id: %s", id)
  }
  fmt.Printf("[SocialEventPlanningAppService.GetRSVP] found %s\\n", id)
  return obj, nil
}

func (s *SocialEventPlanningAppService) CloseGroup(id string) (*Group, error) {
  obj, err := s.GetGroup(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[SocialEventPlanningAppService.CloseGroup] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct SocialEventPlanningAppService ==========")
  system := NewSocialEventPlanningAppService()
  fmt.Println("========== STEP 2: Create Group ==========")
  first, _ := system.CreateGroup("alpha-group")
  system.CreateGroup("beta-group")
  system.CreateEvent("sample-event")
  system.Createcapacity("sample-capacity")
  system.CreatestartTime("sample-start_time")
  system.CreateRSVP("sample-rsvp")
  system.CloseGroup(first.ID)
  if _, err := system.CloseGroup(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetGroup("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

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


sealed class Event {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Event(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Event requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Event.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Event invalid status");
    }
    Console.WriteLine("[Event.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Event " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Event.close] id=" + Id + " -> CLOSED");
  }
}


sealed class capacity {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public capacity(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("capacity requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[capacity.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("capacity invalid status");
    }
    Console.WriteLine("[capacity.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("capacity " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[capacity.close] id=" + Id + " -> CLOSED");
  }
}


sealed class startTime {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public startTime(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("startTime requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[startTime.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("startTime invalid status");
    }
    Console.WriteLine("[startTime.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("startTime " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[startTime.close] id=" + Id + " -> CLOSED");
  }
}


sealed class RSVP {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public RSVP(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("RSVP requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[RSVP.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("RSVP invalid status");
    }
    Console.WriteLine("[RSVP.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("RSVP " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[RSVP.close] id=" + Id + " -> CLOSED");
  }
}

sealed class SocialEventPlanningAppService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Group> _groups = new();
  private readonly Dictionary<string, Event> _events = new();
  private readonly Dictionary<string, capacity> _capacities = new();
  private readonly Dictionary<string, startTime> _start_times = new();
  private readonly Dictionary<string, RSVP> _rsvps = new();
  public SocialEventPlanningAppService() {
    Console.WriteLine("[SocialEventPlanningAppService.__init__] system ready");
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
      Console.WriteLine("[SocialEventPlanningAppService.CreateGroup] stored " + id);
      return obj;
    }
  }

  public Group GetGroup(string id) {
    lock (_gate) {
      if (!_groups.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Group id: " + id);
      }
      Console.WriteLine("[SocialEventPlanningAppService.GetGroup] found " + id);
      return obj;
    }
  }

  public Event CreateEvent(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Event name required");
    }
    lock (_gate) {
      var id = string.Format("EVE-{0:D4}", _seq++);
      var obj = new Event(id, name.Trim());
      obj.Validate();
      _events[id] = obj;
      Console.WriteLine("[SocialEventPlanningAppService.CreateEvent] stored " + id);
      return obj;
    }
  }

  public Event GetEvent(string id) {
    lock (_gate) {
      if (!_events.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Event id: " + id);
      }
      Console.WriteLine("[SocialEventPlanningAppService.GetEvent] found " + id);
      return obj;
    }
  }

  public capacity Createcapacity(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("capacity name required");
    }
    lock (_gate) {
      var id = string.Format("CAP-{0:D4}", _seq++);
      var obj = new capacity(id, name.Trim());
      obj.Validate();
      _capacities[id] = obj;
      Console.WriteLine("[SocialEventPlanningAppService.Createcapacity] stored " + id);
      return obj;
    }
  }

  public capacity Getcapacity(string id) {
    lock (_gate) {
      if (!_capacities.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown capacity id: " + id);
      }
      Console.WriteLine("[SocialEventPlanningAppService.Getcapacity] found " + id);
      return obj;
    }
  }

  public startTime CreatestartTime(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("startTime name required");
    }
    lock (_gate) {
      var id = string.Format("STA-{0:D4}", _seq++);
      var obj = new startTime(id, name.Trim());
      obj.Validate();
      _start_times[id] = obj;
      Console.WriteLine("[SocialEventPlanningAppService.CreatestartTime] stored " + id);
      return obj;
    }
  }

  public startTime GetstartTime(string id) {
    lock (_gate) {
      if (!_start_times.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown startTime id: " + id);
      }
      Console.WriteLine("[SocialEventPlanningAppService.GetstartTime] found " + id);
      return obj;
    }
  }

  public RSVP CreateRSVP(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("RSVP name required");
    }
    lock (_gate) {
      var id = string.Format("RSV-{0:D4}", _seq++);
      var obj = new RSVP(id, name.Trim());
      obj.Validate();
      _rsvps[id] = obj;
      Console.WriteLine("[SocialEventPlanningAppService.CreateRSVP] stored " + id);
      return obj;
    }
  }

  public RSVP GetRSVP(string id) {
    lock (_gate) {
      if (!_rsvps.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown RSVP id: " + id);
      }
      Console.WriteLine("[SocialEventPlanningAppService.GetRSVP] found " + id);
      return obj;
    }
  }

  public Group CloseGroup(string id) {
    var obj = GetGroup(id);
    Console.WriteLine("[SocialEventPlanningAppService.CloseGroup] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct SocialEventPlanningAppService ==========");
    var system = new SocialEventPlanningAppService();
    Console.WriteLine("========== STEP 2: Create Group ==========");
    var first = system.CreateGroup("alpha-group");
    system.CreateGroup("beta-group");
    system.CreateEvent("sample-event");
    system.Createcapacity("sample-capacity");
    system.CreatestartTime("sample-start_time");
    system.CreateRSVP("sample-rsvp");
    system.CloseGroup(first.Id);
    try {
      system.CloseGroup(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetGroup("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const socialEventPlanningAppSolution: ProblemSolution = {
  slug: 'social-event-planning-app',
  title: 'Social Event Planning App (Meetup-like) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an app for creating and discovering local social events, with RSVPs, groups, and recommendations. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Create a group around a shared interest',
      'Create an event under a group with date, location, and capacity',
      'RSVP to an event (going, maybe, not going)',
      'Discover nearby events based on user location and interests',
      'Waitlist attendees once an event reaches capacity',
      'Send event reminders to RSVP\'d attendees',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Create a group around a shared interest?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Create an event under a group with date, location, and capacity?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'RSVP to an event (going, maybe, not going)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Discover nearby events based on user location and interests?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Waitlist attendees once an event reaches capacity?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. SocialEventPlanningAppService is the facade stereotype. Group, Event, capacity, startTime, RSVP are concrete domain classes with id/name/status and validate/close.',
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
          'Construct SocialEventPlanningAppService.',
          'createGroup twice and create the related UML classes.',
          'closeGroup once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'SocialEventPlanningAppService', responsibility: 'UML facade - orchestrates Social Event Planning App (Meetup-like).', keyMembers: ['create*', 'get*', 'closeGroup'] },
    { name: 'Group', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Event', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'capacity', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'startTime', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'RSVP', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from SocialEventPlanningAppService to Group, Event, capacity, startTime, RSVP. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on SocialEventPlanningAppService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'SocialEventPlanningAppService', responsibility: 'UML facade - orchestrates Social Event Planning App (Meetup-like).', keyMembers: ['create*', 'get*', 'closeGroup'] },
    { name: 'Group', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Event', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'capacity', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'startTime', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'RSVP', responsibility: 'UML class - domain object for Social Event Planning App (Meetup-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'SocialEventPlanningAppService exposes create/get/close and owns composed collections.' },
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
      'main constructs SocialEventPlanningAppService, creates UML domain objects, closes the primary Group, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct SocialEventPlanningAppService.',
      'createGroup for alpha and beta.',
      'create remaining UML classes.',
      'closeGroup(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createGroup("alpha..."); closeGroup(id)',
        output: '[Group.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeGroup(alreadyClosed) or getGroup("MISSING-ID")',
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
