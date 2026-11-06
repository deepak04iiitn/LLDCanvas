import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'LoyaltyPointsRewardsProgramService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_members', 'Map<string, Member>'),
    attr('-', '_points_ledgers', 'Map<string, PointsLedger>'),
    attr('-', '_earning_rules', 'Map<string, EarningRule>'),
    attr('-', '_tiers', 'Map<string, Tier>'),
    attr('-', '_rewards', 'Map<string, Reward>'),
  ], [
    method('+', 'createMember', 'name: string', 'Member'),
    method('+', 'createPointsLedger', 'name: string', 'PointsLedger'),
    method('+', 'createEarningRule', 'name: string', 'EarningRule'),
    method('+', 'createTier', 'name: string', 'Tier'),
    method('+', 'createReward', 'name: string', 'Reward'),
    method('+', 'getMember', 'id: string', 'Member'),
    method('+', 'getPointsLedger', 'id: string', 'PointsLedger'),
    method('+', 'getEarningRule', 'id: string', 'EarningRule'),
    method('+', 'getTier', 'id: string', 'Tier'),
    method('+', 'getReward', 'id: string', 'Reward'),
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
  cls('n2', 'PointsLedger', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'EarningRule', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Tier', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Reward', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("loyalty-points-rewards-program")


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


class PointsLedger:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("PointsLedger.id is required")
        if not name or not name.strip():
            raise ValueError("PointsLedger.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[PointsLedger.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"PointsLedger {self.id} has invalid status={self.status}")
        log.info("[PointsLedger.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"PointsLedger {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[PointsLedger.close] id=%s -> CLOSED", self.id)


class EarningRule:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("EarningRule.id is required")
        if not name or not name.strip():
            raise ValueError("EarningRule.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[EarningRule.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"EarningRule {self.id} has invalid status={self.status}")
        log.info("[EarningRule.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"EarningRule {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[EarningRule.close] id=%s -> CLOSED", self.id)


class Tier:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Tier.id is required")
        if not name or not name.strip():
            raise ValueError("Tier.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Tier.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Tier {self.id} has invalid status={self.status}")
        log.info("[Tier.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Tier {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Tier.close] id=%s -> CLOSED", self.id)


class Reward:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Reward.id is required")
        if not name or not name.strip():
            raise ValueError("Reward.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Reward.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Reward {self.id} has invalid status={self.status}")
        log.info("[Reward.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Reward {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Reward.close] id=%s -> CLOSED", self.id)


class LoyaltyPointsRewardsProgramService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._members: Dict[str, Member] = {}
        self._points_ledgers: Dict[str, PointsLedger] = {}
        self._earning_rules: Dict[str, EarningRule] = {}
        self._tiers: Dict[str, Tier] = {}
        self._rewards: Dict[str, Reward] = {}
        log.info("[LoyaltyPointsRewardsProgramService.__init__] system ready; managing: Member, PointsLedger, EarningRule, Tier, Reward")

    def create_member(self, name: str) -> Member:
        """UML: LoyaltyPointsRewardsProgramService.create_member(name) -> Member"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Member name is required")
        with self._lock:
            item_id = f"MEM-{self._seq:04d}"
            self._seq += 1
            obj = Member(item_id, cleaned)
            obj.validate()
            self._members[item_id] = obj
            log.info("[LoyaltyPointsRewardsProgramService.create_member] stored %s in _members (count=%s)", item_id, len(self._members))
            return obj

    def get_member(self, item_id: str) -> Member:
        with self._lock:
            obj = self._members.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Member id: {item_id}")
            log.info("[LoyaltyPointsRewardsProgramService.get_member] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_points_ledger(self, name: str) -> PointsLedger:
        """UML: LoyaltyPointsRewardsProgramService.create_points_ledger(name) -> PointsLedger"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("PointsLedger name is required")
        with self._lock:
            item_id = f"POI-{self._seq:04d}"
            self._seq += 1
            obj = PointsLedger(item_id, cleaned)
            obj.validate()
            self._points_ledgers[item_id] = obj
            log.info("[LoyaltyPointsRewardsProgramService.create_points_ledger] stored %s in _points_ledgers (count=%s)", item_id, len(self._points_ledgers))
            return obj

    def get_points_ledger(self, item_id: str) -> PointsLedger:
        with self._lock:
            obj = self._points_ledgers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown PointsLedger id: {item_id}")
            log.info("[LoyaltyPointsRewardsProgramService.get_points_ledger] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_earning_rule(self, name: str) -> EarningRule:
        """UML: LoyaltyPointsRewardsProgramService.create_earning_rule(name) -> EarningRule"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("EarningRule name is required")
        with self._lock:
            item_id = f"EAR-{self._seq:04d}"
            self._seq += 1
            obj = EarningRule(item_id, cleaned)
            obj.validate()
            self._earning_rules[item_id] = obj
            log.info("[LoyaltyPointsRewardsProgramService.create_earning_rule] stored %s in _earning_rules (count=%s)", item_id, len(self._earning_rules))
            return obj

    def get_earning_rule(self, item_id: str) -> EarningRule:
        with self._lock:
            obj = self._earning_rules.get(item_id)
            if obj is None:
                raise KeyError(f"unknown EarningRule id: {item_id}")
            log.info("[LoyaltyPointsRewardsProgramService.get_earning_rule] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_tier(self, name: str) -> Tier:
        """UML: LoyaltyPointsRewardsProgramService.create_tier(name) -> Tier"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Tier name is required")
        with self._lock:
            item_id = f"TIE-{self._seq:04d}"
            self._seq += 1
            obj = Tier(item_id, cleaned)
            obj.validate()
            self._tiers[item_id] = obj
            log.info("[LoyaltyPointsRewardsProgramService.create_tier] stored %s in _tiers (count=%s)", item_id, len(self._tiers))
            return obj

    def get_tier(self, item_id: str) -> Tier:
        with self._lock:
            obj = self._tiers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Tier id: {item_id}")
            log.info("[LoyaltyPointsRewardsProgramService.get_tier] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_reward(self, name: str) -> Reward:
        """UML: LoyaltyPointsRewardsProgramService.create_reward(name) -> Reward"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Reward name is required")
        with self._lock:
            item_id = f"REW-{self._seq:04d}"
            self._seq += 1
            obj = Reward(item_id, cleaned)
            obj.validate()
            self._rewards[item_id] = obj
            log.info("[LoyaltyPointsRewardsProgramService.create_reward] stored %s in _rewards (count=%s)", item_id, len(self._rewards))
            return obj

    def get_reward(self, item_id: str) -> Reward:
        with self._lock:
            obj = self._rewards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Reward id: {item_id}")
            log.info("[LoyaltyPointsRewardsProgramService.get_reward] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_member(self, item_id: str) -> Member:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._members.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Member id: {item_id}")
            log.info("[LoyaltyPointsRewardsProgramService.close_member] closing %s via Member.close()", item_id)
            obj.close()
            return obj

    def list_active_members(self) -> List[Member]:
        with self._lock:
            active = [o for o in self._members.values() if o.status == "ACTIVE"]
            log.info("[LoyaltyPointsRewardsProgramService.list_active_members] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct LoyaltyPointsRewardsProgramService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = LoyaltyPointsRewardsProgramService()

    log.info("========== STEP 2: Create primary Member objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_member("alpha-member")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_member("beta-member")

    log.info("========== STEP 3: Create PointsLedger (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_points_ledger("sample-points_ledger")

    log.info("========== STEP 4: Create EarningRule (UML class) ==========")
    system.create_earning_rule("sample-earning_rule")

    log.info("========== STEP 5: Create Tier (UML class) ==========")
    system.create_tier("sample-tier")

    log.info("========== STEP 6: Create Reward (UML class) ==========")
    system.create_reward("sample-reward")

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


class PointsLedger {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  PointsLedger(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("PointsLedger.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("PointsLedger.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[PointsLedger.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("PointsLedger " + id + " invalid status");
    }
    System.out.println("[PointsLedger.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("PointsLedger " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[PointsLedger.close] id=" + id + " -> CLOSED");
  }
}


class EarningRule {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  EarningRule(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("EarningRule.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("EarningRule.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[EarningRule.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("EarningRule " + id + " invalid status");
    }
    System.out.println("[EarningRule.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("EarningRule " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[EarningRule.close] id=" + id + " -> CLOSED");
  }
}


class Tier {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Tier(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Tier.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Tier.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Tier.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Tier " + id + " invalid status");
    }
    System.out.println("[Tier.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Tier " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Tier.close] id=" + id + " -> CLOSED");
  }
}


class Reward {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Reward(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Reward.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Reward.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Reward.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Reward " + id + " invalid status");
    }
    System.out.println("[Reward.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Reward " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Reward.close] id=" + id + " -> CLOSED");
  }
}

public class LoyaltyPointsRewardsProgramService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Member> members = new LinkedHashMap<>();
  private final Map<String, PointsLedger> points_ledgers = new LinkedHashMap<>();
  private final Map<String, EarningRule> earning_rules = new LinkedHashMap<>();
  private final Map<String, Tier> tiers = new LinkedHashMap<>();
  private final Map<String, Reward> rewards = new LinkedHashMap<>();

  public LoyaltyPointsRewardsProgramService() {
    System.out.println("[LoyaltyPointsRewardsProgramService.__init__] system ready");
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
      System.out.println("[LoyaltyPointsRewardsProgramService.createMember] stored " + id + " count=" + members.size());
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
      System.out.println("[LoyaltyPointsRewardsProgramService.getMember] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public PointsLedger createPointsLedger(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("PointsLedger name required");
    }
    lock.lock();
    try {
      String id = String.format("POI-%04d", seq++);
      PointsLedger obj = new PointsLedger(id, name.trim());
      obj.validate();
      points_ledgers.put(id, obj);
      System.out.println("[LoyaltyPointsRewardsProgramService.createPointsLedger] stored " + id + " count=" + points_ledgers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public PointsLedger getPointsLedger(String id) {
    lock.lock();
    try {
      PointsLedger obj = points_ledgers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown PointsLedger id: " + id);
      }
      System.out.println("[LoyaltyPointsRewardsProgramService.getPointsLedger] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public EarningRule createEarningRule(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("EarningRule name required");
    }
    lock.lock();
    try {
      String id = String.format("EAR-%04d", seq++);
      EarningRule obj = new EarningRule(id, name.trim());
      obj.validate();
      earning_rules.put(id, obj);
      System.out.println("[LoyaltyPointsRewardsProgramService.createEarningRule] stored " + id + " count=" + earning_rules.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public EarningRule getEarningRule(String id) {
    lock.lock();
    try {
      EarningRule obj = earning_rules.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown EarningRule id: " + id);
      }
      System.out.println("[LoyaltyPointsRewardsProgramService.getEarningRule] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Tier createTier(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Tier name required");
    }
    lock.lock();
    try {
      String id = String.format("TIE-%04d", seq++);
      Tier obj = new Tier(id, name.trim());
      obj.validate();
      tiers.put(id, obj);
      System.out.println("[LoyaltyPointsRewardsProgramService.createTier] stored " + id + " count=" + tiers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Tier getTier(String id) {
    lock.lock();
    try {
      Tier obj = tiers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Tier id: " + id);
      }
      System.out.println("[LoyaltyPointsRewardsProgramService.getTier] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Reward createReward(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Reward name required");
    }
    lock.lock();
    try {
      String id = String.format("REW-%04d", seq++);
      Reward obj = new Reward(id, name.trim());
      obj.validate();
      rewards.put(id, obj);
      System.out.println("[LoyaltyPointsRewardsProgramService.createReward] stored " + id + " count=" + rewards.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Reward getReward(String id) {
    lock.lock();
    try {
      Reward obj = rewards.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Reward id: " + id);
      }
      System.out.println("[LoyaltyPointsRewardsProgramService.getReward] found id=" + obj.getId());
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
      System.out.println("[LoyaltyPointsRewardsProgramService.closeMember] closing " + id);
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
      System.out.println("[LoyaltyPointsRewardsProgramService.listActiveMembers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct LoyaltyPointsRewardsProgramService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    LoyaltyPointsRewardsProgramService system = new LoyaltyPointsRewardsProgramService();
    System.out.println("========== STEP 2: Create Member objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Member first = system.createMember("alpha-member");
    system.createMember("beta-member");
    System.out.println("========== STEP 3: Create PointsLedger ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createPointsLedger("sample-points_ledger");
    System.out.println("========== STEP 4: Create EarningRule ==========");
    system.createEarningRule("sample-earning_rule");
    System.out.println("========== STEP 5: Create Tier ==========");
    system.createTier("sample-tier");
    System.out.println("========== STEP 6: Create Reward ==========");
    system.createReward("sample-reward");
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


class PointsLedger {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('PointsLedger.id required')
    }

    if (!name?.trim()) {
      throw new Error('PointsLedger.name required')
    }
    console.log(\`[PointsLedger.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`PointsLedger \${this.id} invalid status\`)
    }
    console.log(\`[PointsLedger.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`PointsLedger \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[PointsLedger.close] id=\${this.id} -> CLOSED\`)
  }
}


class EarningRule {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('EarningRule.id required')
    }

    if (!name?.trim()) {
      throw new Error('EarningRule.name required')
    }
    console.log(\`[EarningRule.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`EarningRule \${this.id} invalid status\`)
    }
    console.log(\`[EarningRule.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`EarningRule \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[EarningRule.close] id=\${this.id} -> CLOSED\`)
  }
}


class Tier {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Tier.id required')
    }

    if (!name?.trim()) {
      throw new Error('Tier.name required')
    }
    console.log(\`[Tier.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Tier \${this.id} invalid status\`)
    }
    console.log(\`[Tier.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Tier \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Tier.close] id=\${this.id} -> CLOSED\`)
  }
}


class Reward {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Reward.id required')
    }

    if (!name?.trim()) {
      throw new Error('Reward.name required')
    }
    console.log(\`[Reward.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Reward \${this.id} invalid status\`)
    }
    console.log(\`[Reward.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Reward \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Reward.close] id=\${this.id} -> CLOSED\`)
  }
}

class LoyaltyPointsRewardsProgramService {
  private seq = 1
  private members = new Map<string, Member>()
  private points_ledgers = new Map<string, PointsLedger>()
  private earning_rules = new Map<string, EarningRule>()
  private tiers = new Map<string, Tier>()
  private rewards = new Map<string, Reward>()
  constructor() {
    console.log('[LoyaltyPointsRewardsProgramService.__init__] system ready')
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
    console.log(\`[LoyaltyPointsRewardsProgramService.createMember] stored \${id} count=\${this.members.size}\`)
    return obj
  }

  getMember(id: string): Member {
    const obj = this.members.get(id)
    if (!obj) {
      throw new Error(\`unknown Member id: \${id}\`)
    }
    console.log(\`[LoyaltyPointsRewardsProgramService.getMember] found id=\${obj.id}\`)
    return obj
  }

  createPointsLedger(name: string): PointsLedger {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('PointsLedger name required')
    }
    const id = \`POI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new PointsLedger(id, cleaned)
    obj.validate()
    this.points_ledgers.set(id, obj)
    console.log(\`[LoyaltyPointsRewardsProgramService.createPointsLedger] stored \${id} count=\${this.points_ledgers.size}\`)
    return obj
  }

  getPointsLedger(id: string): PointsLedger {
    const obj = this.points_ledgers.get(id)
    if (!obj) {
      throw new Error(\`unknown PointsLedger id: \${id}\`)
    }
    console.log(\`[LoyaltyPointsRewardsProgramService.getPointsLedger] found id=\${obj.id}\`)
    return obj
  }

  createEarningRule(name: string): EarningRule {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('EarningRule name required')
    }
    const id = \`EAR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new EarningRule(id, cleaned)
    obj.validate()
    this.earning_rules.set(id, obj)
    console.log(\`[LoyaltyPointsRewardsProgramService.createEarningRule] stored \${id} count=\${this.earning_rules.size}\`)
    return obj
  }

  getEarningRule(id: string): EarningRule {
    const obj = this.earning_rules.get(id)
    if (!obj) {
      throw new Error(\`unknown EarningRule id: \${id}\`)
    }
    console.log(\`[LoyaltyPointsRewardsProgramService.getEarningRule] found id=\${obj.id}\`)
    return obj
  }

  createTier(name: string): Tier {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Tier name required')
    }
    const id = \`TIE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Tier(id, cleaned)
    obj.validate()
    this.tiers.set(id, obj)
    console.log(\`[LoyaltyPointsRewardsProgramService.createTier] stored \${id} count=\${this.tiers.size}\`)
    return obj
  }

  getTier(id: string): Tier {
    const obj = this.tiers.get(id)
    if (!obj) {
      throw new Error(\`unknown Tier id: \${id}\`)
    }
    console.log(\`[LoyaltyPointsRewardsProgramService.getTier] found id=\${obj.id}\`)
    return obj
  }

  createReward(name: string): Reward {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Reward name required')
    }
    const id = \`REW-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Reward(id, cleaned)
    obj.validate()
    this.rewards.set(id, obj)
    console.log(\`[LoyaltyPointsRewardsProgramService.createReward] stored \${id} count=\${this.rewards.size}\`)
    return obj
  }

  getReward(id: string): Reward {
    const obj = this.rewards.get(id)
    if (!obj) {
      throw new Error(\`unknown Reward id: \${id}\`)
    }
    console.log(\`[LoyaltyPointsRewardsProgramService.getReward] found id=\${obj.id}\`)
    return obj
  }

  closeMember(id: string): Member {
    const obj = this.getMember(id)
    console.log(\`[LoyaltyPointsRewardsProgramService.closeMember] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveMembers(): Member[] {
    const active = [...this.members.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[LoyaltyPointsRewardsProgramService.listActiveMembers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct LoyaltyPointsRewardsProgramService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new LoyaltyPointsRewardsProgramService()
  console.log('========== STEP 2: Create Member objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createMember('alpha-member')
  system.createMember('beta-member')
  console.log('========== STEP 3: Create PointsLedger ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createPointsLedger('sample-points_ledger')
  console.log('========== STEP 4: Create EarningRule ==========')
  system.createEarningRule('sample-earning_rule')
  console.log('========== STEP 5: Create Tier ==========')
  system.createTier('sample-tier')
  console.log('========== STEP 6: Create Reward ==========')
  system.createReward('sample-reward')
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


class PointsLedger {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  PointsLedger(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("PointsLedger requires id and name");
    }
    cout << "[PointsLedger.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("PointsLedger invalid status");
    }
    cout << "[PointsLedger.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("PointsLedger cannot close");
    }
    status_ = "CLOSED";
    cout << "[PointsLedger.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class EarningRule {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  EarningRule(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("EarningRule requires id and name");
    }
    cout << "[EarningRule.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("EarningRule invalid status");
    }
    cout << "[EarningRule.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("EarningRule cannot close");
    }
    status_ = "CLOSED";
    cout << "[EarningRule.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Tier {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Tier(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Tier requires id and name");
    }
    cout << "[Tier.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Tier invalid status");
    }
    cout << "[Tier.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Tier cannot close");
    }
    status_ = "CLOSED";
    cout << "[Tier.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Reward {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Reward(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Reward requires id and name");
    }
    cout << "[Reward.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Reward invalid status");
    }
    cout << "[Reward.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Reward cannot close");
    }
    status_ = "CLOSED";
    cout << "[Reward.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class LoyaltyPointsRewardsProgramService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Member> members_;
  unordered_map<string, PointsLedger> points_ledgers_;
  unordered_map<string, EarningRule> earning_rules_;
  unordered_map<string, Tier> tiers_;
  unordered_map<string, Reward> rewards_;
public:
  LoyaltyPointsRewardsProgramService() {
    cout << "[LoyaltyPointsRewardsProgramService.__init__] system ready" << endl;
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
    cout << "[LoyaltyPointsRewardsProgramService.createMember] stored " << obj.id() << endl;
    return obj;
  }

  Member getMember(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = members_.find(id);
    if (it == members_.end()) {
      throw out_of_range("unknown Member id");
    }
    cout << "[LoyaltyPointsRewardsProgramService.getMember] found " << id << endl;
    return it->second;
  }

  PointsLedger createPointsLedger(const string& name) {
    if (name.empty()) {
      throw invalid_argument("PointsLedger name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "POI-%04d", seq_++);
    PointsLedger obj{buf, name};
    obj.validate();
    points_ledgers_.emplace(obj.id(), obj);
    cout << "[LoyaltyPointsRewardsProgramService.createPointsLedger] stored " << obj.id() << endl;
    return obj;
  }

  PointsLedger getPointsLedger(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = points_ledgers_.find(id);
    if (it == points_ledgers_.end()) {
      throw out_of_range("unknown PointsLedger id");
    }
    cout << "[LoyaltyPointsRewardsProgramService.getPointsLedger] found " << id << endl;
    return it->second;
  }

  EarningRule createEarningRule(const string& name) {
    if (name.empty()) {
      throw invalid_argument("EarningRule name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "EAR-%04d", seq_++);
    EarningRule obj{buf, name};
    obj.validate();
    earning_rules_.emplace(obj.id(), obj);
    cout << "[LoyaltyPointsRewardsProgramService.createEarningRule] stored " << obj.id() << endl;
    return obj;
  }

  EarningRule getEarningRule(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = earning_rules_.find(id);
    if (it == earning_rules_.end()) {
      throw out_of_range("unknown EarningRule id");
    }
    cout << "[LoyaltyPointsRewardsProgramService.getEarningRule] found " << id << endl;
    return it->second;
  }

  Tier createTier(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Tier name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TIE-%04d", seq_++);
    Tier obj{buf, name};
    obj.validate();
    tiers_.emplace(obj.id(), obj);
    cout << "[LoyaltyPointsRewardsProgramService.createTier] stored " << obj.id() << endl;
    return obj;
  }

  Tier getTier(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = tiers_.find(id);
    if (it == tiers_.end()) {
      throw out_of_range("unknown Tier id");
    }
    cout << "[LoyaltyPointsRewardsProgramService.getTier] found " << id << endl;
    return it->second;
  }

  Reward createReward(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Reward name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "REW-%04d", seq_++);
    Reward obj{buf, name};
    obj.validate();
    rewards_.emplace(obj.id(), obj);
    cout << "[LoyaltyPointsRewardsProgramService.createReward] stored " << obj.id() << endl;
    return obj;
  }

  Reward getReward(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = rewards_.find(id);
    if (it == rewards_.end()) {
      throw out_of_range("unknown Reward id");
    }
    cout << "[LoyaltyPointsRewardsProgramService.getReward] found " << id << endl;
    return it->second;
  }

  Member closeMember(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = members_.find(id);
    if (it == members_.end()) {
      throw out_of_range("unknown Member");
    }
    cout << "[LoyaltyPointsRewardsProgramService.closeMember] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct LoyaltyPointsRewardsProgramService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  LoyaltyPointsRewardsProgramService system;
  cout << "========== STEP 2: Create Member ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createMember("alpha-member");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createMember("beta-member");
  system.createPointsLedger("sample-points_ledger");
  system.createEarningRule("sample-earning_rule");
  system.createTier("sample-tier");
  system.createReward("sample-reward");
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


type PointsLedger struct {
  ID     string
  Name   string
  Status string
}

func NewPointsLedger(id, name string) (*PointsLedger, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("PointsLedger requires id and name")
  }
  obj := &PointsLedger{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[PointsLedger.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *PointsLedger) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("PointsLedger invalid status")
  }
  fmt.Printf("[PointsLedger.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *PointsLedger) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("PointsLedger %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[PointsLedger.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type EarningRule struct {
  ID     string
  Name   string
  Status string
}

func NewEarningRule(id, name string) (*EarningRule, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("EarningRule requires id and name")
  }
  obj := &EarningRule{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[EarningRule.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *EarningRule) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("EarningRule invalid status")
  }
  fmt.Printf("[EarningRule.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *EarningRule) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("EarningRule %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[EarningRule.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Tier struct {
  ID     string
  Name   string
  Status string
}

func NewTier(id, name string) (*Tier, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Tier requires id and name")
  }
  obj := &Tier{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Tier.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Tier) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Tier invalid status")
  }
  fmt.Printf("[Tier.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Tier) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Tier %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Tier.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Reward struct {
  ID     string
  Name   string
  Status string
}

func NewReward(id, name string) (*Reward, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Reward requires id and name")
  }
  obj := &Reward{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Reward.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Reward) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Reward invalid status")
  }
  fmt.Printf("[Reward.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Reward) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Reward %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Reward.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type LoyaltyPointsRewardsProgramService struct {
  mu  sync.Mutex
  seq int
  members map[string]*Member
  points_ledgers map[string]*PointsLedger
  earning_rules map[string]*EarningRule
  tiers map[string]*Tier
  rewards map[string]*Reward
}

func NewLoyaltyPointsRewardsProgramService() *LoyaltyPointsRewardsProgramService {
  fmt.Println("[LoyaltyPointsRewardsProgramService.__init__] system ready")
  return &LoyaltyPointsRewardsProgramService{
    seq: 1,
    members: map[string]*Member{},
    points_ledgers: map[string]*PointsLedger{},
    earning_rules: map[string]*EarningRule{},
    tiers: map[string]*Tier{},
    rewards: map[string]*Reward{},
  }
}

func (s *LoyaltyPointsRewardsProgramService) CreateMember(name string) (*Member, error) {
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
  fmt.Printf("[LoyaltyPointsRewardsProgramService.CreateMember] stored %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) GetMember(id string) (*Member, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.members[id]
  if !ok {
    return nil, fmt.Errorf("unknown Member id: %s", id)
  }
  fmt.Printf("[LoyaltyPointsRewardsProgramService.GetMember] found %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) CreatePointsLedger(name string) (*PointsLedger, error) {
  if name == "" {
    return nil, fmt.Errorf("PointsLedger name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("POI-%04d", s.seq)
  s.seq++
  obj, err := NewPointsLedger(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.points_ledgers[id] = obj
  fmt.Printf("[LoyaltyPointsRewardsProgramService.CreatePointsLedger] stored %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) GetPointsLedger(id string) (*PointsLedger, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.points_ledgers[id]
  if !ok {
    return nil, fmt.Errorf("unknown PointsLedger id: %s", id)
  }
  fmt.Printf("[LoyaltyPointsRewardsProgramService.GetPointsLedger] found %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) CreateEarningRule(name string) (*EarningRule, error) {
  if name == "" {
    return nil, fmt.Errorf("EarningRule name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("EAR-%04d", s.seq)
  s.seq++
  obj, err := NewEarningRule(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.earning_rules[id] = obj
  fmt.Printf("[LoyaltyPointsRewardsProgramService.CreateEarningRule] stored %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) GetEarningRule(id string) (*EarningRule, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.earning_rules[id]
  if !ok {
    return nil, fmt.Errorf("unknown EarningRule id: %s", id)
  }
  fmt.Printf("[LoyaltyPointsRewardsProgramService.GetEarningRule] found %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) CreateTier(name string) (*Tier, error) {
  if name == "" {
    return nil, fmt.Errorf("Tier name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TIE-%04d", s.seq)
  s.seq++
  obj, err := NewTier(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.tiers[id] = obj
  fmt.Printf("[LoyaltyPointsRewardsProgramService.CreateTier] stored %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) GetTier(id string) (*Tier, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.tiers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Tier id: %s", id)
  }
  fmt.Printf("[LoyaltyPointsRewardsProgramService.GetTier] found %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) CreateReward(name string) (*Reward, error) {
  if name == "" {
    return nil, fmt.Errorf("Reward name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("REW-%04d", s.seq)
  s.seq++
  obj, err := NewReward(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.rewards[id] = obj
  fmt.Printf("[LoyaltyPointsRewardsProgramService.CreateReward] stored %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) GetReward(id string) (*Reward, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.rewards[id]
  if !ok {
    return nil, fmt.Errorf("unknown Reward id: %s", id)
  }
  fmt.Printf("[LoyaltyPointsRewardsProgramService.GetReward] found %s\\n", id)
  return obj, nil
}

func (s *LoyaltyPointsRewardsProgramService) CloseMember(id string) (*Member, error) {
  obj, err := s.GetMember(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[LoyaltyPointsRewardsProgramService.CloseMember] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct LoyaltyPointsRewardsProgramService ==========")
  system := NewLoyaltyPointsRewardsProgramService()
  fmt.Println("========== STEP 2: Create Member ==========")
  first, _ := system.CreateMember("alpha-member")
  system.CreateMember("beta-member")
  system.CreatePointsLedger("sample-points_ledger")
  system.CreateEarningRule("sample-earning_rule")
  system.CreateTier("sample-tier")
  system.CreateReward("sample-reward")
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


sealed class PointsLedger {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public PointsLedger(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("PointsLedger requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[PointsLedger.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("PointsLedger invalid status");
    }
    Console.WriteLine("[PointsLedger.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("PointsLedger " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[PointsLedger.close] id=" + Id + " -> CLOSED");
  }
}


sealed class EarningRule {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public EarningRule(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("EarningRule requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[EarningRule.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("EarningRule invalid status");
    }
    Console.WriteLine("[EarningRule.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("EarningRule " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[EarningRule.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Tier {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Tier(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Tier requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Tier.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Tier invalid status");
    }
    Console.WriteLine("[Tier.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Tier " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Tier.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Reward {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Reward(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Reward requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Reward.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Reward invalid status");
    }
    Console.WriteLine("[Reward.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Reward " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Reward.close] id=" + Id + " -> CLOSED");
  }
}

sealed class LoyaltyPointsRewardsProgramService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Member> _members = new();
  private readonly Dictionary<string, PointsLedger> _points_ledgers = new();
  private readonly Dictionary<string, EarningRule> _earning_rules = new();
  private readonly Dictionary<string, Tier> _tiers = new();
  private readonly Dictionary<string, Reward> _rewards = new();
  public LoyaltyPointsRewardsProgramService() {
    Console.WriteLine("[LoyaltyPointsRewardsProgramService.__init__] system ready");
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
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.CreateMember] stored " + id);
      return obj;
    }
  }

  public Member GetMember(string id) {
    lock (_gate) {
      if (!_members.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Member id: " + id);
      }
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.GetMember] found " + id);
      return obj;
    }
  }

  public PointsLedger CreatePointsLedger(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("PointsLedger name required");
    }
    lock (_gate) {
      var id = string.Format("POI-{0:D4}", _seq++);
      var obj = new PointsLedger(id, name.Trim());
      obj.Validate();
      _points_ledgers[id] = obj;
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.CreatePointsLedger] stored " + id);
      return obj;
    }
  }

  public PointsLedger GetPointsLedger(string id) {
    lock (_gate) {
      if (!_points_ledgers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown PointsLedger id: " + id);
      }
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.GetPointsLedger] found " + id);
      return obj;
    }
  }

  public EarningRule CreateEarningRule(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("EarningRule name required");
    }
    lock (_gate) {
      var id = string.Format("EAR-{0:D4}", _seq++);
      var obj = new EarningRule(id, name.Trim());
      obj.Validate();
      _earning_rules[id] = obj;
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.CreateEarningRule] stored " + id);
      return obj;
    }
  }

  public EarningRule GetEarningRule(string id) {
    lock (_gate) {
      if (!_earning_rules.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown EarningRule id: " + id);
      }
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.GetEarningRule] found " + id);
      return obj;
    }
  }

  public Tier CreateTier(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Tier name required");
    }
    lock (_gate) {
      var id = string.Format("TIE-{0:D4}", _seq++);
      var obj = new Tier(id, name.Trim());
      obj.Validate();
      _tiers[id] = obj;
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.CreateTier] stored " + id);
      return obj;
    }
  }

  public Tier GetTier(string id) {
    lock (_gate) {
      if (!_tiers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Tier id: " + id);
      }
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.GetTier] found " + id);
      return obj;
    }
  }

  public Reward CreateReward(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Reward name required");
    }
    lock (_gate) {
      var id = string.Format("REW-{0:D4}", _seq++);
      var obj = new Reward(id, name.Trim());
      obj.Validate();
      _rewards[id] = obj;
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.CreateReward] stored " + id);
      return obj;
    }
  }

  public Reward GetReward(string id) {
    lock (_gate) {
      if (!_rewards.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Reward id: " + id);
      }
      Console.WriteLine("[LoyaltyPointsRewardsProgramService.GetReward] found " + id);
      return obj;
    }
  }

  public Member CloseMember(string id) {
    var obj = GetMember(id);
    Console.WriteLine("[LoyaltyPointsRewardsProgramService.CloseMember] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct LoyaltyPointsRewardsProgramService ==========");
    var system = new LoyaltyPointsRewardsProgramService();
    Console.WriteLine("========== STEP 2: Create Member ==========");
    var first = system.CreateMember("alpha-member");
    system.CreateMember("beta-member");
    system.CreatePointsLedger("sample-points_ledger");
    system.CreateEarningRule("sample-earning_rule");
    system.CreateTier("sample-tier");
    system.CreateReward("sample-reward");
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

export const loyaltyPointsRewardsProgramSolution: ProblemSolution = {
  slug: 'loyalty-points-rewards-program',
  title: 'Loyalty Points & Rewards Program - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a loyalty program that earns points on purchases, tracks tiers, and lets users redeem rewards. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Earn points on qualifying purchases based on configurable rules',
      'Track a member\'s point balance and lifetime spend',
      'Assign membership tiers (Silver/Gold/Platinum) based on activity',
      'Redeem points for rewards (discounts, free items)',
      'Expire points after a period of inactivity',
      'Show point-earning history and upcoming tier progress',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Earn points on qualifying purchases based on configurable rules?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Track a member\'s point balance and lifetime spend?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Assign membership tiers (Silver/Gold/Platinum) based on activity?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Redeem points for rewards (discounts, free items)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Expire points after a period of inactivity?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. LoyaltyPointsRewardsProgramService is the facade stereotype. Member, PointsLedger, EarningRule, Tier, Reward are concrete domain classes with id/name/status and validate/close.',
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
          'Construct LoyaltyPointsRewardsProgramService.',
          'createMember twice and create the related UML classes.',
          'closeMember once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'LoyaltyPointsRewardsProgramService', responsibility: 'UML facade - orchestrates Loyalty Points & Rewards Program.', keyMembers: ['create*', 'get*', 'closeMember'] },
    { name: 'Member', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'PointsLedger', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'EarningRule', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Tier', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Reward', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from LoyaltyPointsRewardsProgramService to Member, PointsLedger, EarningRule, Tier, Reward. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on LoyaltyPointsRewardsProgramService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'LoyaltyPointsRewardsProgramService', responsibility: 'UML facade - orchestrates Loyalty Points & Rewards Program.', keyMembers: ['create*', 'get*', 'closeMember'] },
    { name: 'Member', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'PointsLedger', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'EarningRule', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Tier', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Reward', responsibility: 'UML class - domain object for Loyalty Points & Rewards Program.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'LoyaltyPointsRewardsProgramService exposes create/get/close and owns composed collections.' },
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
      'main constructs LoyaltyPointsRewardsProgramService, creates UML domain objects, closes the primary Member, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct LoyaltyPointsRewardsProgramService.',
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
