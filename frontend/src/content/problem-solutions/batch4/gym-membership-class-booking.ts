import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'GymMembershipClassBookingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_members', 'Map<string, Member>'),
    attr('-', '_membership_plans', 'Map<string, MembershipPlan>'),
    attr('-', '_gym_classs', 'Map<string, GymClass>'),
    attr('-', '_instructors', 'Map<string, instructor>'),
    attr('-', '_schedules', 'Map<string, schedule>'),
  ], [
    method('+', 'createMember', 'name: string', 'Member'),
    method('+', 'createMembershipPlan', 'name: string', 'MembershipPlan'),
    method('+', 'createGymClass', 'name: string', 'GymClass'),
    method('+', 'createinstructor', 'name: string', 'instructor'),
    method('+', 'createschedule', 'name: string', 'schedule'),
    method('+', 'getMember', 'id: string', 'Member'),
    method('+', 'getMembershipPlan', 'id: string', 'MembershipPlan'),
    method('+', 'getGymClass', 'id: string', 'GymClass'),
    method('+', 'getinstructor', 'id: string', 'instructor'),
    method('+', 'getschedule', 'id: string', 'schedule'),
    method('+', 'closeMember', 'id: string', 'Member'),
  ], 'facade'),
  cls('n1', 'Member', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'MembershipPlan', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'GymClass', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'instructor', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'schedule', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("gym-membership-class-booking")


class Member:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Member.id is required")
        if not name or not name.strip():
            raise ValueError("Member.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Member.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Member {self.id} has invalid status={self.status}")
        log.info("[Member.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Member {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Member.close] id=%s -> CLOSED", self.id)


class MembershipPlan:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("MembershipPlan.id is required")
        if not name or not name.strip():
            raise ValueError("MembershipPlan.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[MembershipPlan.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"MembershipPlan {self.id} has invalid status={self.status}")
        log.info("[MembershipPlan.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"MembershipPlan {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[MembershipPlan.close] id=%s -> CLOSED", self.id)


class GymClass:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("GymClass.id is required")
        if not name or not name.strip():
            raise ValueError("GymClass.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[GymClass.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"GymClass {self.id} has invalid status={self.status}")
        log.info("[GymClass.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"GymClass {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[GymClass.close] id=%s -> CLOSED", self.id)


class instructor:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("instructor.id is required")
        if not name or not name.strip():
            raise ValueError("instructor.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[instructor.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"instructor {self.id} has invalid status={self.status}")
        log.info("[instructor.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"instructor {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[instructor.close] id=%s -> CLOSED", self.id)


class schedule:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("schedule.id is required")
        if not name or not name.strip():
            raise ValueError("schedule.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[schedule.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"schedule {self.id} has invalid status={self.status}")
        log.info("[schedule.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"schedule {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[schedule.close] id=%s -> CLOSED", self.id)


class GymMembershipClassBookingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._members: Dict[str, Member] = {}
        self._membership_plans: Dict[str, MembershipPlan] = {}
        self._gym_classs: Dict[str, GymClass] = {}
        self._instructors: Dict[str, instructor] = {}
        self._schedules: Dict[str, schedule] = {}
        log.info("[GymMembershipClassBookingService.__init__] system ready; managing: Member, MembershipPlan, GymClass, instructor, schedule")

    def create_member(self, name: str) -> Member:
        """UML: GymMembershipClassBookingService.create_member(name) -> Member"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Member name is required")
        with self._lock:
            item_id = f"MEM-{self._seq:04d}"
            self._seq += 1
            obj = Member(item_id, cleaned)
            obj.validate()
            self._members[item_id] = obj
            log.info("[GymMembershipClassBookingService.create_member] stored %s in _members (count=%s)", item_id, len(self._members))
            return obj

    def get_member(self, item_id: str) -> Member:
        with self._lock:
            obj = self._members.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Member id: {item_id}")
            log.info("[GymMembershipClassBookingService.get_member] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_membership_plan(self, name: str) -> MembershipPlan:
        """UML: GymMembershipClassBookingService.create_membership_plan(name) -> MembershipPlan"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("MembershipPlan name is required")
        with self._lock:
            item_id = f"MEM-{self._seq:04d}"
            self._seq += 1
            obj = MembershipPlan(item_id, cleaned)
            obj.validate()
            self._membership_plans[item_id] = obj
            log.info("[GymMembershipClassBookingService.create_membership_plan] stored %s in _membership_plans (count=%s)", item_id, len(self._membership_plans))
            return obj

    def get_membership_plan(self, item_id: str) -> MembershipPlan:
        with self._lock:
            obj = self._membership_plans.get(item_id)
            if obj is None:
                raise KeyError(f"unknown MembershipPlan id: {item_id}")
            log.info("[GymMembershipClassBookingService.get_membership_plan] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_gym_class(self, name: str) -> GymClass:
        """UML: GymMembershipClassBookingService.create_gym_class(name) -> GymClass"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("GymClass name is required")
        with self._lock:
            item_id = f"GYM-{self._seq:04d}"
            self._seq += 1
            obj = GymClass(item_id, cleaned)
            obj.validate()
            self._gym_classs[item_id] = obj
            log.info("[GymMembershipClassBookingService.create_gym_class] stored %s in _gym_classs (count=%s)", item_id, len(self._gym_classs))
            return obj

    def get_gym_class(self, item_id: str) -> GymClass:
        with self._lock:
            obj = self._gym_classs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown GymClass id: {item_id}")
            log.info("[GymMembershipClassBookingService.get_gym_class] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_instructor(self, name: str) -> instructor:
        """UML: GymMembershipClassBookingService.create_instructor(name) -> instructor"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("instructor name is required")
        with self._lock:
            item_id = f"INS-{self._seq:04d}"
            self._seq += 1
            obj = instructor(item_id, cleaned)
            obj.validate()
            self._instructors[item_id] = obj
            log.info("[GymMembershipClassBookingService.create_instructor] stored %s in _instructors (count=%s)", item_id, len(self._instructors))
            return obj

    def get_instructor(self, item_id: str) -> instructor:
        with self._lock:
            obj = self._instructors.get(item_id)
            if obj is None:
                raise KeyError(f"unknown instructor id: {item_id}")
            log.info("[GymMembershipClassBookingService.get_instructor] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_schedule(self, name: str) -> schedule:
        """UML: GymMembershipClassBookingService.create_schedule(name) -> schedule"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("schedule name is required")
        with self._lock:
            item_id = f"SCH-{self._seq:04d}"
            self._seq += 1
            obj = schedule(item_id, cleaned)
            obj.validate()
            self._schedules[item_id] = obj
            log.info("[GymMembershipClassBookingService.create_schedule] stored %s in _schedules (count=%s)", item_id, len(self._schedules))
            return obj

    def get_schedule(self, item_id: str) -> schedule:
        with self._lock:
            obj = self._schedules.get(item_id)
            if obj is None:
                raise KeyError(f"unknown schedule id: {item_id}")
            log.info("[GymMembershipClassBookingService.get_schedule] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_member(self, item_id: str) -> Member:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._members.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Member id: {item_id}")
            log.info("[GymMembershipClassBookingService.close_member] closing %s via Member.close()", item_id)
            obj.close()
            return obj

    def list_active_members(self) -> List[Member]:
        with self._lock:
            active = [o for o in self._members.values() if o.status == "ACTIVE"]
            log.info("[GymMembershipClassBookingService.list_active_members] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct GymMembershipClassBookingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = GymMembershipClassBookingService()

    log.info("========== STEP 2: Create primary Member objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_member("alpha-member")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_member("beta-member")

    log.info("========== STEP 3: Create MembershipPlan (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_membership_plan("sample-membership_plan")

    log.info("========== STEP 4: Create GymClass (UML class) ==========")
    system.create_gym_class("sample-gym_class")

    log.info("========== STEP 5: Create instructor (UML class) ==========")
    system.create_instructor("sample-instructor")

    log.info("========== STEP 6: Create schedule (UML class) ==========")
    system.create_schedule("sample-schedule")

    log.info("========== STEP 7: Inspect active Member list ==========")
    system.list_active_members()

    log.info("========== STEP 8: Close first Member ==========")
    system.close_member(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_member(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Member.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_member("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_member: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_members()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Member {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Member(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Member.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Member.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Member.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Member " + id + " invalid status");
    }
    System.out.println("[Member.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Member " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Member.close] id=" + id + " -> CLOSED");
  }
}


class MembershipPlan {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  MembershipPlan(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("MembershipPlan.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MembershipPlan.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[MembershipPlan.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("MembershipPlan " + id + " invalid status");
    }
    System.out.println("[MembershipPlan.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("MembershipPlan " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[MembershipPlan.close] id=" + id + " -> CLOSED");
  }
}


class GymClass {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  GymClass(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("GymClass.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("GymClass.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[GymClass.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("GymClass " + id + " invalid status");
    }
    System.out.println("[GymClass.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("GymClass " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[GymClass.close] id=" + id + " -> CLOSED");
  }
}


class instructor {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  instructor(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("instructor.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("instructor.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[instructor.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("instructor " + id + " invalid status");
    }
    System.out.println("[instructor.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("instructor " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[instructor.close] id=" + id + " -> CLOSED");
  }
}


class schedule {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  schedule(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("schedule.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("schedule.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[schedule.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("schedule " + id + " invalid status");
    }
    System.out.println("[schedule.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("schedule " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[schedule.close] id=" + id + " -> CLOSED");
  }
}

public class GymMembershipClassBookingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Member> members = new LinkedHashMap<>();
  private final Map<String, MembershipPlan> membership_plans = new LinkedHashMap<>();
  private final Map<String, GymClass> gym_classs = new LinkedHashMap<>();
  private final Map<String, instructor> instructors = new LinkedHashMap<>();
  private final Map<String, schedule> schedules = new LinkedHashMap<>();

  public GymMembershipClassBookingService() {
    System.out.println("[GymMembershipClassBookingService.__init__] system ready");
  }

  public Member createMember(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Member name required");
    }
    lock.lock();
    try {
      String id = String.format("MEM-%04d", seq++);
      Member obj = new Member(id, name.trim());
      obj.validate();
      members.put(id, obj);
      System.out.println("[GymMembershipClassBookingService.createMember] stored " + id + " count=" + members.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Member getMember(String id) {
    lock.lock();
    try {
      Member obj = members.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Member id: " + id);
      }
      System.out.println("[GymMembershipClassBookingService.getMember] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public MembershipPlan createMembershipPlan(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MembershipPlan name required");
    }
    lock.lock();
    try {
      String id = String.format("MEM-%04d", seq++);
      MembershipPlan obj = new MembershipPlan(id, name.trim());
      obj.validate();
      membership_plans.put(id, obj);
      System.out.println("[GymMembershipClassBookingService.createMembershipPlan] stored " + id + " count=" + membership_plans.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public MembershipPlan getMembershipPlan(String id) {
    lock.lock();
    try {
      MembershipPlan obj = membership_plans.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown MembershipPlan id: " + id);
      }
      System.out.println("[GymMembershipClassBookingService.getMembershipPlan] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public GymClass createGymClass(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("GymClass name required");
    }
    lock.lock();
    try {
      String id = String.format("GYM-%04d", seq++);
      GymClass obj = new GymClass(id, name.trim());
      obj.validate();
      gym_classs.put(id, obj);
      System.out.println("[GymMembershipClassBookingService.createGymClass] stored " + id + " count=" + gym_classs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public GymClass getGymClass(String id) {
    lock.lock();
    try {
      GymClass obj = gym_classs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown GymClass id: " + id);
      }
      System.out.println("[GymMembershipClassBookingService.getGymClass] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public instructor createinstructor(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("instructor name required");
    }
    lock.lock();
    try {
      String id = String.format("INS-%04d", seq++);
      instructor obj = new instructor(id, name.trim());
      obj.validate();
      instructors.put(id, obj);
      System.out.println("[GymMembershipClassBookingService.createinstructor] stored " + id + " count=" + instructors.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public instructor getinstructor(String id) {
    lock.lock();
    try {
      instructor obj = instructors.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown instructor id: " + id);
      }
      System.out.println("[GymMembershipClassBookingService.getinstructor] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public schedule createschedule(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("schedule name required");
    }
    lock.lock();
    try {
      String id = String.format("SCH-%04d", seq++);
      schedule obj = new schedule(id, name.trim());
      obj.validate();
      schedules.put(id, obj);
      System.out.println("[GymMembershipClassBookingService.createschedule] stored " + id + " count=" + schedules.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public schedule getschedule(String id) {
    lock.lock();
    try {
      schedule obj = schedules.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown schedule id: " + id);
      }
      System.out.println("[GymMembershipClassBookingService.getschedule] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Member closeMember(String id) {
    lock.lock();
    try {
      Member obj = members.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Member id: " + id);
      }
      System.out.println("[GymMembershipClassBookingService.closeMember] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Member> listActiveMembers() {
    lock.lock();
    try {
      List<Member> out = new ArrayList<>();
      for (Member o : members.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[GymMembershipClassBookingService.listActiveMembers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct GymMembershipClassBookingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    GymMembershipClassBookingService system = new GymMembershipClassBookingService();
    System.out.println("========== STEP 2: Create Member objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Member first = system.createMember("alpha-member");
    system.createMember("beta-member");
    System.out.println("========== STEP 3: Create MembershipPlan ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createMembershipPlan("sample-membership_plan");
    System.out.println("========== STEP 4: Create GymClass ==========");
    system.createGymClass("sample-gym_class");
    System.out.println("========== STEP 5: Create instructor ==========");
    system.createinstructor("sample-instructor");
    System.out.println("========== STEP 6: Create schedule ==========");
    system.createschedule("sample-schedule");
    System.out.println("========== Inspect active list ==========");
    system.listActiveMembers();
    System.out.println("========== Close first Member ==========");
    system.closeMember(first.getId());
    try {
      system.closeMember(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getMember("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Member {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Member.id required')
    }

    if (!name?.trim()) {
      throw new Error('Member.name required')
    }
    console.log(\`[Member.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Member \${this.id} invalid status\`)
    }
    console.log(\`[Member.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Member \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Member.close] id=\${this.id} -> CLOSED\`)
  }
}


class MembershipPlan {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('MembershipPlan.id required')
    }

    if (!name?.trim()) {
      throw new Error('MembershipPlan.name required')
    }
    console.log(\`[MembershipPlan.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`MembershipPlan \${this.id} invalid status\`)
    }
    console.log(\`[MembershipPlan.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`MembershipPlan \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[MembershipPlan.close] id=\${this.id} -> CLOSED\`)
  }
}


class GymClass {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('GymClass.id required')
    }

    if (!name?.trim()) {
      throw new Error('GymClass.name required')
    }
    console.log(\`[GymClass.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`GymClass \${this.id} invalid status\`)
    }
    console.log(\`[GymClass.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`GymClass \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[GymClass.close] id=\${this.id} -> CLOSED\`)
  }
}


class instructor {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('instructor.id required')
    }

    if (!name?.trim()) {
      throw new Error('instructor.name required')
    }
    console.log(\`[instructor.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`instructor \${this.id} invalid status\`)
    }
    console.log(\`[instructor.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`instructor \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[instructor.close] id=\${this.id} -> CLOSED\`)
  }
}


class schedule {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('schedule.id required')
    }

    if (!name?.trim()) {
      throw new Error('schedule.name required')
    }
    console.log(\`[schedule.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`schedule \${this.id} invalid status\`)
    }
    console.log(\`[schedule.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`schedule \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[schedule.close] id=\${this.id} -> CLOSED\`)
  }
}

class GymMembershipClassBookingService {
  private seq = 1
  private members = new Map<string, Member>()
  private membership_plans = new Map<string, MembershipPlan>()
  private gym_classs = new Map<string, GymClass>()
  private instructors = new Map<string, instructor>()
  private schedules = new Map<string, schedule>()
  constructor() {
    console.log('[GymMembershipClassBookingService.__init__] system ready')
  }

  createMember(name: string): Member {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Member name required')
    }
    const id = \`MEM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Member(id, cleaned)
    obj.validate()
    this.members.set(id, obj)
    console.log(\`[GymMembershipClassBookingService.createMember] stored \${id} count=\${this.members.size}\`)
    return obj
  }

  getMember(id: string): Member {
    const obj = this.members.get(id)
    if (!obj) {
      throw new Error(\`unknown Member id: \${id}\`)
    }
    console.log(\`[GymMembershipClassBookingService.getMember] found id=\${obj.id}\`)
    return obj
  }

  createMembershipPlan(name: string): MembershipPlan {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('MembershipPlan name required')
    }
    const id = \`MEM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new MembershipPlan(id, cleaned)
    obj.validate()
    this.membership_plans.set(id, obj)
    console.log(\`[GymMembershipClassBookingService.createMembershipPlan] stored \${id} count=\${this.membership_plans.size}\`)
    return obj
  }

  getMembershipPlan(id: string): MembershipPlan {
    const obj = this.membership_plans.get(id)
    if (!obj) {
      throw new Error(\`unknown MembershipPlan id: \${id}\`)
    }
    console.log(\`[GymMembershipClassBookingService.getMembershipPlan] found id=\${obj.id}\`)
    return obj
  }

  createGymClass(name: string): GymClass {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('GymClass name required')
    }
    const id = \`GYM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new GymClass(id, cleaned)
    obj.validate()
    this.gym_classs.set(id, obj)
    console.log(\`[GymMembershipClassBookingService.createGymClass] stored \${id} count=\${this.gym_classs.size}\`)
    return obj
  }

  getGymClass(id: string): GymClass {
    const obj = this.gym_classs.get(id)
    if (!obj) {
      throw new Error(\`unknown GymClass id: \${id}\`)
    }
    console.log(\`[GymMembershipClassBookingService.getGymClass] found id=\${obj.id}\`)
    return obj
  }

  createinstructor(name: string): instructor {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('instructor name required')
    }
    const id = \`INS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new instructor(id, cleaned)
    obj.validate()
    this.instructors.set(id, obj)
    console.log(\`[GymMembershipClassBookingService.createinstructor] stored \${id} count=\${this.instructors.size}\`)
    return obj
  }

  getinstructor(id: string): instructor {
    const obj = this.instructors.get(id)
    if (!obj) {
      throw new Error(\`unknown instructor id: \${id}\`)
    }
    console.log(\`[GymMembershipClassBookingService.getinstructor] found id=\${obj.id}\`)
    return obj
  }

  createschedule(name: string): schedule {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('schedule name required')
    }
    const id = \`SCH-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new schedule(id, cleaned)
    obj.validate()
    this.schedules.set(id, obj)
    console.log(\`[GymMembershipClassBookingService.createschedule] stored \${id} count=\${this.schedules.size}\`)
    return obj
  }

  getschedule(id: string): schedule {
    const obj = this.schedules.get(id)
    if (!obj) {
      throw new Error(\`unknown schedule id: \${id}\`)
    }
    console.log(\`[GymMembershipClassBookingService.getschedule] found id=\${obj.id}\`)
    return obj
  }

  closeMember(id: string): Member {
    const obj = this.getMember(id)
    console.log(\`[GymMembershipClassBookingService.closeMember] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveMembers(): Member[] {
    const active = [...this.members.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[GymMembershipClassBookingService.listActiveMembers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct GymMembershipClassBookingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new GymMembershipClassBookingService()
  console.log('========== STEP 2: Create Member objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createMember('alpha-member')
  system.createMember('beta-member')
  console.log('========== STEP 3: Create MembershipPlan ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createMembershipPlan('sample-membership_plan')
  console.log('========== STEP 4: Create GymClass ==========')
  system.createGymClass('sample-gym_class')
  console.log('========== STEP 5: Create instructor ==========')
  system.createinstructor('sample-instructor')
  console.log('========== STEP 6: Create schedule ==========')
  system.createschedule('sample-schedule')
  system.listActiveMembers()
  console.log('========== Close first Member ==========')
  system.closeMember(first.id)
  try {
    system.closeMember(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getMember('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Member {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Member(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Member requires id and name");
    }
    cout << "[Member.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Member invalid status");
    }
    cout << "[Member.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Member cannot close");
    }
    status_ = "CLOSED";
    cout << "[Member.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class MembershipPlan {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  MembershipPlan(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("MembershipPlan requires id and name");
    }
    cout << "[MembershipPlan.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("MembershipPlan invalid status");
    }
    cout << "[MembershipPlan.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("MembershipPlan cannot close");
    }
    status_ = "CLOSED";
    cout << "[MembershipPlan.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class GymClass {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  GymClass(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("GymClass requires id and name");
    }
    cout << "[GymClass.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("GymClass invalid status");
    }
    cout << "[GymClass.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("GymClass cannot close");
    }
    status_ = "CLOSED";
    cout << "[GymClass.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class instructor {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  instructor(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("instructor requires id and name");
    }
    cout << "[instructor.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("instructor invalid status");
    }
    cout << "[instructor.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("instructor cannot close");
    }
    status_ = "CLOSED";
    cout << "[instructor.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class schedule {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  schedule(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("schedule requires id and name");
    }
    cout << "[schedule.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("schedule invalid status");
    }
    cout << "[schedule.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("schedule cannot close");
    }
    status_ = "CLOSED";
    cout << "[schedule.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class GymMembershipClassBookingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Member> members_;
  unordered_map<string, MembershipPlan> membership_plans_;
  unordered_map<string, GymClass> gym_classs_;
  unordered_map<string, instructor> instructors_;
  unordered_map<string, schedule> schedules_;
public:
  GymMembershipClassBookingService() {
    cout << "[GymMembershipClassBookingService.__init__] system ready" << endl;
  }

  Member createMember(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Member name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MEM-%04d", seq_++);
    Member obj{buf, name};
    obj.validate();
    members_.emplace(obj.id(), obj);
    cout << "[GymMembershipClassBookingService.createMember] stored " << obj.id() << endl;
    return obj;
  }

  Member getMember(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = members_.find(id);
    if (it == members_.end()) {
      throw out_of_range("unknown Member id");
    }
    cout << "[GymMembershipClassBookingService.getMember] found " << id << endl;
    return it->second;
  }

  MembershipPlan createMembershipPlan(const string& name) {
    if (name.empty()) {
      throw invalid_argument("MembershipPlan name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MEM-%04d", seq_++);
    MembershipPlan obj{buf, name};
    obj.validate();
    membership_plans_.emplace(obj.id(), obj);
    cout << "[GymMembershipClassBookingService.createMembershipPlan] stored " << obj.id() << endl;
    return obj;
  }

  MembershipPlan getMembershipPlan(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = membership_plans_.find(id);
    if (it == membership_plans_.end()) {
      throw out_of_range("unknown MembershipPlan id");
    }
    cout << "[GymMembershipClassBookingService.getMembershipPlan] found " << id << endl;
    return it->second;
  }

  GymClass createGymClass(const string& name) {
    if (name.empty()) {
      throw invalid_argument("GymClass name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "GYM-%04d", seq_++);
    GymClass obj{buf, name};
    obj.validate();
    gym_classs_.emplace(obj.id(), obj);
    cout << "[GymMembershipClassBookingService.createGymClass] stored " << obj.id() << endl;
    return obj;
  }

  GymClass getGymClass(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = gym_classs_.find(id);
    if (it == gym_classs_.end()) {
      throw out_of_range("unknown GymClass id");
    }
    cout << "[GymMembershipClassBookingService.getGymClass] found " << id << endl;
    return it->second;
  }

  instructor createinstructor(const string& name) {
    if (name.empty()) {
      throw invalid_argument("instructor name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "INS-%04d", seq_++);
    instructor obj{buf, name};
    obj.validate();
    instructors_.emplace(obj.id(), obj);
    cout << "[GymMembershipClassBookingService.createinstructor] stored " << obj.id() << endl;
    return obj;
  }

  instructor getinstructor(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = instructors_.find(id);
    if (it == instructors_.end()) {
      throw out_of_range("unknown instructor id");
    }
    cout << "[GymMembershipClassBookingService.getinstructor] found " << id << endl;
    return it->second;
  }

  schedule createschedule(const string& name) {
    if (name.empty()) {
      throw invalid_argument("schedule name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SCH-%04d", seq_++);
    schedule obj{buf, name};
    obj.validate();
    schedules_.emplace(obj.id(), obj);
    cout << "[GymMembershipClassBookingService.createschedule] stored " << obj.id() << endl;
    return obj;
  }

  schedule getschedule(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = schedules_.find(id);
    if (it == schedules_.end()) {
      throw out_of_range("unknown schedule id");
    }
    cout << "[GymMembershipClassBookingService.getschedule] found " << id << endl;
    return it->second;
  }

  Member closeMember(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = members_.find(id);
    if (it == members_.end()) {
      throw out_of_range("unknown Member");
    }
    cout << "[GymMembershipClassBookingService.closeMember] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct GymMembershipClassBookingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  GymMembershipClassBookingService system;
  cout << "========== STEP 2: Create Member ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createMember("alpha-member");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createMember("beta-member");
  system.createMembershipPlan("sample-membership_plan");
  system.createGymClass("sample-gym_class");
  system.createinstructor("sample-instructor");
  system.createschedule("sample-schedule");
  system.closeMember(first.id());
  try {
    system.closeMember(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getMember("MISSING-ID");
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

type Member struct {
  ID     string
  Name   string
  Status string
}

func NewMember(id, name string) (*Member, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Member requires id and name")
  }
  obj := &Member{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Member.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Member) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Member invalid status")
  }
  fmt.Printf("[Member.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Member) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Member %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Member.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type MembershipPlan struct {
  ID     string
  Name   string
  Status string
}

func NewMembershipPlan(id, name string) (*MembershipPlan, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("MembershipPlan requires id and name")
  }
  obj := &MembershipPlan{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[MembershipPlan.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *MembershipPlan) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("MembershipPlan invalid status")
  }
  fmt.Printf("[MembershipPlan.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *MembershipPlan) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("MembershipPlan %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[MembershipPlan.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type GymClass struct {
  ID     string
  Name   string
  Status string
}

func NewGymClass(id, name string) (*GymClass, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("GymClass requires id and name")
  }
  obj := &GymClass{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[GymClass.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *GymClass) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("GymClass invalid status")
  }
  fmt.Printf("[GymClass.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *GymClass) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("GymClass %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[GymClass.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type instructor struct {
  ID     string
  Name   string
  Status string
}

func Newinstructor(id, name string) (*instructor, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("instructor requires id and name")
  }
  obj := &instructor{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[instructor.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *instructor) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("instructor invalid status")
  }
  fmt.Printf("[instructor.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *instructor) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("instructor %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[instructor.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type schedule struct {
  ID     string
  Name   string
  Status string
}

func Newschedule(id, name string) (*schedule, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("schedule requires id and name")
  }
  obj := &schedule{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[schedule.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *schedule) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("schedule invalid status")
  }
  fmt.Printf("[schedule.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *schedule) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("schedule %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[schedule.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type GymMembershipClassBookingService struct {
  mu  sync.Mutex
  seq int
  members map[string]*Member
  membership_plans map[string]*MembershipPlan
  gym_classs map[string]*GymClass
  instructors map[string]*instructor
  schedules map[string]*schedule
}

func NewGymMembershipClassBookingService() *GymMembershipClassBookingService {
  fmt.Println("[GymMembershipClassBookingService.__init__] system ready")
  return &GymMembershipClassBookingService{
    seq: 1,
    members: map[string]*Member{},
    membership_plans: map[string]*MembershipPlan{},
    gym_classs: map[string]*GymClass{},
    instructors: map[string]*instructor{},
    schedules: map[string]*schedule{},
  }
}

func (s *GymMembershipClassBookingService) CreateMember(name string) (*Member, error) {
  if name == "" {
    return nil, fmt.Errorf("Member name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MEM-%04d", s.seq)
  s.seq++
  obj, err := NewMember(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.members[id] = obj
  fmt.Printf("[GymMembershipClassBookingService.CreateMember] stored %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) GetMember(id string) (*Member, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.members[id]
  if !ok {
    return nil, fmt.Errorf("unknown Member id: %s", id)
  }
  fmt.Printf("[GymMembershipClassBookingService.GetMember] found %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) CreateMembershipPlan(name string) (*MembershipPlan, error) {
  if name == "" {
    return nil, fmt.Errorf("MembershipPlan name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MEM-%04d", s.seq)
  s.seq++
  obj, err := NewMembershipPlan(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.membership_plans[id] = obj
  fmt.Printf("[GymMembershipClassBookingService.CreateMembershipPlan] stored %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) GetMembershipPlan(id string) (*MembershipPlan, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.membership_plans[id]
  if !ok {
    return nil, fmt.Errorf("unknown MembershipPlan id: %s", id)
  }
  fmt.Printf("[GymMembershipClassBookingService.GetMembershipPlan] found %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) CreateGymClass(name string) (*GymClass, error) {
  if name == "" {
    return nil, fmt.Errorf("GymClass name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("GYM-%04d", s.seq)
  s.seq++
  obj, err := NewGymClass(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.gym_classs[id] = obj
  fmt.Printf("[GymMembershipClassBookingService.CreateGymClass] stored %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) GetGymClass(id string) (*GymClass, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.gym_classs[id]
  if !ok {
    return nil, fmt.Errorf("unknown GymClass id: %s", id)
  }
  fmt.Printf("[GymMembershipClassBookingService.GetGymClass] found %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) Createinstructor(name string) (*instructor, error) {
  if name == "" {
    return nil, fmt.Errorf("instructor name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("INS-%04d", s.seq)
  s.seq++
  obj, err := Newinstructor(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.instructors[id] = obj
  fmt.Printf("[GymMembershipClassBookingService.Createinstructor] stored %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) Getinstructor(id string) (*instructor, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.instructors[id]
  if !ok {
    return nil, fmt.Errorf("unknown instructor id: %s", id)
  }
  fmt.Printf("[GymMembershipClassBookingService.Getinstructor] found %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) Createschedule(name string) (*schedule, error) {
  if name == "" {
    return nil, fmt.Errorf("schedule name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SCH-%04d", s.seq)
  s.seq++
  obj, err := Newschedule(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.schedules[id] = obj
  fmt.Printf("[GymMembershipClassBookingService.Createschedule] stored %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) Getschedule(id string) (*schedule, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.schedules[id]
  if !ok {
    return nil, fmt.Errorf("unknown schedule id: %s", id)
  }
  fmt.Printf("[GymMembershipClassBookingService.Getschedule] found %s\\n", id)
  return obj, nil
}

func (s *GymMembershipClassBookingService) CloseMember(id string) (*Member, error) {
  obj, err := s.GetMember(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[GymMembershipClassBookingService.CloseMember] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct GymMembershipClassBookingService ==========")
  system := NewGymMembershipClassBookingService()
  fmt.Println("========== STEP 2: Create Member ==========")
  first, _ := system.CreateMember("alpha-member")
  system.CreateMember("beta-member")
  system.CreateMembershipPlan("sample-membership_plan")
  system.CreateGymClass("sample-gym_class")
  system.Createinstructor("sample-instructor")
  system.Createschedule("sample-schedule")
  system.CloseMember(first.ID)
  if _, err := system.CloseMember(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetMember("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Member {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Member(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Member requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Member.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Member invalid status");
    }
    Console.WriteLine("[Member.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Member " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Member.close] id=" + Id + " -> CLOSED");
  }
}


sealed class MembershipPlan {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public MembershipPlan(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MembershipPlan requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[MembershipPlan.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("MembershipPlan invalid status");
    }
    Console.WriteLine("[MembershipPlan.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("MembershipPlan " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[MembershipPlan.close] id=" + Id + " -> CLOSED");
  }
}


sealed class GymClass {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public GymClass(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("GymClass requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[GymClass.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("GymClass invalid status");
    }
    Console.WriteLine("[GymClass.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("GymClass " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[GymClass.close] id=" + Id + " -> CLOSED");
  }
}


sealed class instructor {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public instructor(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("instructor requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[instructor.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("instructor invalid status");
    }
    Console.WriteLine("[instructor.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("instructor " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[instructor.close] id=" + Id + " -> CLOSED");
  }
}


sealed class schedule {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public schedule(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("schedule requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[schedule.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("schedule invalid status");
    }
    Console.WriteLine("[schedule.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("schedule " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[schedule.close] id=" + Id + " -> CLOSED");
  }
}

sealed class GymMembershipClassBookingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Member> _members = new();
  private readonly Dictionary<string, MembershipPlan> _membership_plans = new();
  private readonly Dictionary<string, GymClass> _gym_classs = new();
  private readonly Dictionary<string, instructor> _instructors = new();
  private readonly Dictionary<string, schedule> _schedules = new();
  public GymMembershipClassBookingService() {
    Console.WriteLine("[GymMembershipClassBookingService.__init__] system ready");
  }

  public Member CreateMember(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Member name required");
    }
    lock (_gate) {
      var id = string.Format("MEM-{0:D4}", _seq++);
      var obj = new Member(id, name.Trim());
      obj.Validate();
      _members[id] = obj;
      Console.WriteLine("[GymMembershipClassBookingService.CreateMember] stored " + id);
      return obj;
    }
  }

  public Member GetMember(string id) {
    lock (_gate) {
      if (!_members.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Member id: " + id);
      }
      Console.WriteLine("[GymMembershipClassBookingService.GetMember] found " + id);
      return obj;
    }
  }

  public MembershipPlan CreateMembershipPlan(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MembershipPlan name required");
    }
    lock (_gate) {
      var id = string.Format("MEM-{0:D4}", _seq++);
      var obj = new MembershipPlan(id, name.Trim());
      obj.Validate();
      _membership_plans[id] = obj;
      Console.WriteLine("[GymMembershipClassBookingService.CreateMembershipPlan] stored " + id);
      return obj;
    }
  }

  public MembershipPlan GetMembershipPlan(string id) {
    lock (_gate) {
      if (!_membership_plans.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown MembershipPlan id: " + id);
      }
      Console.WriteLine("[GymMembershipClassBookingService.GetMembershipPlan] found " + id);
      return obj;
    }
  }

  public GymClass CreateGymClass(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("GymClass name required");
    }
    lock (_gate) {
      var id = string.Format("GYM-{0:D4}", _seq++);
      var obj = new GymClass(id, name.Trim());
      obj.Validate();
      _gym_classs[id] = obj;
      Console.WriteLine("[GymMembershipClassBookingService.CreateGymClass] stored " + id);
      return obj;
    }
  }

  public GymClass GetGymClass(string id) {
    lock (_gate) {
      if (!_gym_classs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown GymClass id: " + id);
      }
      Console.WriteLine("[GymMembershipClassBookingService.GetGymClass] found " + id);
      return obj;
    }
  }

  public instructor Createinstructor(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("instructor name required");
    }
    lock (_gate) {
      var id = string.Format("INS-{0:D4}", _seq++);
      var obj = new instructor(id, name.Trim());
      obj.Validate();
      _instructors[id] = obj;
      Console.WriteLine("[GymMembershipClassBookingService.Createinstructor] stored " + id);
      return obj;
    }
  }

  public instructor Getinstructor(string id) {
    lock (_gate) {
      if (!_instructors.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown instructor id: " + id);
      }
      Console.WriteLine("[GymMembershipClassBookingService.Getinstructor] found " + id);
      return obj;
    }
  }

  public schedule Createschedule(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("schedule name required");
    }
    lock (_gate) {
      var id = string.Format("SCH-{0:D4}", _seq++);
      var obj = new schedule(id, name.Trim());
      obj.Validate();
      _schedules[id] = obj;
      Console.WriteLine("[GymMembershipClassBookingService.Createschedule] stored " + id);
      return obj;
    }
  }

  public schedule Getschedule(string id) {
    lock (_gate) {
      if (!_schedules.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown schedule id: " + id);
      }
      Console.WriteLine("[GymMembershipClassBookingService.Getschedule] found " + id);
      return obj;
    }
  }

  public Member CloseMember(string id) {
    var obj = GetMember(id);
    Console.WriteLine("[GymMembershipClassBookingService.CloseMember] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct GymMembershipClassBookingService ==========");
    var system = new GymMembershipClassBookingService();
    Console.WriteLine("========== STEP 2: Create Member ==========");
    var first = system.CreateMember("alpha-member");
    system.CreateMember("beta-member");
    system.CreateMembershipPlan("sample-membership_plan");
    system.CreateGymClass("sample-gym_class");
    system.Createinstructor("sample-instructor");
    system.Createschedule("sample-schedule");
    system.CloseMember(first.Id);
    try {
      system.CloseMember(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetMember("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const gymMembershipClassBookingSolution: ProblemSolution = {
  slug: 'gym-membership-class-booking',
  title: 'Gym Membership & Class Booking System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a gym management system handling memberships, class schedules, and capacity-limited class bookings. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Manage membership plans (monthly, annual, day-pass)',
      'Schedule recurring fitness classes with instructor and capacity',
      'Book a spot in a class, respecting capacity limits',
      'Waitlist members when a class is full',
      'Check in a member via membership ID/QR code',
      'Track class attendance history per member',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Manage membership plans (monthly, annual, day-pass)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Schedule recurring fitness classes with instructor and capacity?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Book a spot in a class, respecting capacity limits?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Waitlist members when a class is full?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Check in a member via membership ID/QR code?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. GymMembershipClassBookingService is the facade stereotype. Member, MembershipPlan, GymClass, instructor, schedule are concrete domain classes with id/name/status and validate/close.',
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
          'Construct GymMembershipClassBookingService.',
          'createMember twice and create the related UML classes.',
          'closeMember once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'GymMembershipClassBookingService', responsibility: 'UML facade - orchestrates Gym Membership & Class Booking System.', keyMembers: ['create*', 'get*', 'closeMember'] },
    { name: 'Member', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'MembershipPlan', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'GymClass', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'instructor', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'schedule', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from GymMembershipClassBookingService to Member, MembershipPlan, GymClass, instructor, schedule. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on GymMembershipClassBookingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'GymMembershipClassBookingService', responsibility: 'UML facade - orchestrates Gym Membership & Class Booking System.', keyMembers: ['create*', 'get*', 'closeMember'] },
    { name: 'Member', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'MembershipPlan', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'GymClass', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'instructor', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'schedule', responsibility: 'UML class - domain object for Gym Membership & Class Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'GymMembershipClassBookingService exposes create/get/close and owns composed collections.' },
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
      'main constructs GymMembershipClassBookingService, creates UML domain objects, closes the primary Member, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct GymMembershipClassBookingService.',
      'createMember for alpha and beta.',
      'create remaining UML classes.',
      'closeMember(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createMember("alpha..."); closeMember(id)',
        output: '[Member.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeMember(alreadyClosed) or getMember("MISSING-ID")',
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
