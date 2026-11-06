import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'MultiplayerGameMatchmakingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_matchmaking_tickets', 'Map<string, MatchmakingTicket>'),
    attr('-', '_skills', 'Map<string, skill>'),
    attr('-', '_queues', 'Map<string, queue>'),
    attr('-', '_regions', 'Map<string, region>'),
    attr('-', '_games', 'Map<string, game>'),
  ], [
    method('+', 'createMatchmakingTicket', 'name: string', 'MatchmakingTicket'),
    method('+', 'createskill', 'name: string', 'skill'),
    method('+', 'createqueue', 'name: string', 'queue'),
    method('+', 'createregion', 'name: string', 'region'),
    method('+', 'creategame', 'name: string', 'game'),
    method('+', 'getMatchmakingTicket', 'id: string', 'MatchmakingTicket'),
    method('+', 'getskill', 'id: string', 'skill'),
    method('+', 'getqueue', 'id: string', 'queue'),
    method('+', 'getregion', 'id: string', 'region'),
    method('+', 'getgame', 'id: string', 'game'),
    method('+', 'closeMatchmakingTicket', 'id: string', 'MatchmakingTicket'),
  ], 'facade'),
  cls('n1', 'MatchmakingTicket', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'skill', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'queue', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'region', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'game', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("multiplayer-game-matchmaking")


class MatchmakingTicket:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("MatchmakingTicket.id is required")
        if not name or not name.strip():
            raise ValueError("MatchmakingTicket.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[MatchmakingTicket.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"MatchmakingTicket {self.id} has invalid status={self.status}")
        log.info("[MatchmakingTicket.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"MatchmakingTicket {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[MatchmakingTicket.close] id=%s -> CLOSED", self.id)


class skill:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("skill.id is required")
        if not name or not name.strip():
            raise ValueError("skill.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[skill.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"skill {self.id} has invalid status={self.status}")
        log.info("[skill.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"skill {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[skill.close] id=%s -> CLOSED", self.id)


class queue:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("queue.id is required")
        if not name or not name.strip():
            raise ValueError("queue.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[queue.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"queue {self.id} has invalid status={self.status}")
        log.info("[queue.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"queue {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[queue.close] id=%s -> CLOSED", self.id)


class region:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("region.id is required")
        if not name or not name.strip():
            raise ValueError("region.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[region.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"region {self.id} has invalid status={self.status}")
        log.info("[region.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"region {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[region.close] id=%s -> CLOSED", self.id)


class game:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("game.id is required")
        if not name or not name.strip():
            raise ValueError("game.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[game.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"game {self.id} has invalid status={self.status}")
        log.info("[game.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"game {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[game.close] id=%s -> CLOSED", self.id)


class MultiplayerGameMatchmakingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._matchmaking_tickets: Dict[str, MatchmakingTicket] = {}
        self._skills: Dict[str, skill] = {}
        self._queues: Dict[str, queue] = {}
        self._regions: Dict[str, region] = {}
        self._games: Dict[str, game] = {}
        log.info("[MultiplayerGameMatchmakingService.__init__] system ready; managing: MatchmakingTicket, skill, queue, region, game")

    def create_matchmaking_ticket(self, name: str) -> MatchmakingTicket:
        """UML: MultiplayerGameMatchmakingService.create_matchmaking_ticket(name) -> MatchmakingTicket"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("MatchmakingTicket name is required")
        with self._lock:
            item_id = f"MAT-{self._seq:04d}"
            self._seq += 1
            obj = MatchmakingTicket(item_id, cleaned)
            obj.validate()
            self._matchmaking_tickets[item_id] = obj
            log.info("[MultiplayerGameMatchmakingService.create_matchmaking_ticket] stored %s in _matchmaking_tickets (count=%s)", item_id, len(self._matchmaking_tickets))
            return obj

    def get_matchmaking_ticket(self, item_id: str) -> MatchmakingTicket:
        with self._lock:
            obj = self._matchmaking_tickets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown MatchmakingTicket id: {item_id}")
            log.info("[MultiplayerGameMatchmakingService.get_matchmaking_ticket] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_skill(self, name: str) -> skill:
        """UML: MultiplayerGameMatchmakingService.create_skill(name) -> skill"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("skill name is required")
        with self._lock:
            item_id = f"SKI-{self._seq:04d}"
            self._seq += 1
            obj = skill(item_id, cleaned)
            obj.validate()
            self._skills[item_id] = obj
            log.info("[MultiplayerGameMatchmakingService.create_skill] stored %s in _skills (count=%s)", item_id, len(self._skills))
            return obj

    def get_skill(self, item_id: str) -> skill:
        with self._lock:
            obj = self._skills.get(item_id)
            if obj is None:
                raise KeyError(f"unknown skill id: {item_id}")
            log.info("[MultiplayerGameMatchmakingService.get_skill] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_queue(self, name: str) -> queue:
        """UML: MultiplayerGameMatchmakingService.create_queue(name) -> queue"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("queue name is required")
        with self._lock:
            item_id = f"QUE-{self._seq:04d}"
            self._seq += 1
            obj = queue(item_id, cleaned)
            obj.validate()
            self._queues[item_id] = obj
            log.info("[MultiplayerGameMatchmakingService.create_queue] stored %s in _queues (count=%s)", item_id, len(self._queues))
            return obj

    def get_queue(self, item_id: str) -> queue:
        with self._lock:
            obj = self._queues.get(item_id)
            if obj is None:
                raise KeyError(f"unknown queue id: {item_id}")
            log.info("[MultiplayerGameMatchmakingService.get_queue] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_region(self, name: str) -> region:
        """UML: MultiplayerGameMatchmakingService.create_region(name) -> region"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("region name is required")
        with self._lock:
            item_id = f"REG-{self._seq:04d}"
            self._seq += 1
            obj = region(item_id, cleaned)
            obj.validate()
            self._regions[item_id] = obj
            log.info("[MultiplayerGameMatchmakingService.create_region] stored %s in _regions (count=%s)", item_id, len(self._regions))
            return obj

    def get_region(self, item_id: str) -> region:
        with self._lock:
            obj = self._regions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown region id: {item_id}")
            log.info("[MultiplayerGameMatchmakingService.get_region] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_game(self, name: str) -> game:
        """UML: MultiplayerGameMatchmakingService.create_game(name) -> game"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("game name is required")
        with self._lock:
            item_id = f"GAM-{self._seq:04d}"
            self._seq += 1
            obj = game(item_id, cleaned)
            obj.validate()
            self._games[item_id] = obj
            log.info("[MultiplayerGameMatchmakingService.create_game] stored %s in _games (count=%s)", item_id, len(self._games))
            return obj

    def get_game(self, item_id: str) -> game:
        with self._lock:
            obj = self._games.get(item_id)
            if obj is None:
                raise KeyError(f"unknown game id: {item_id}")
            log.info("[MultiplayerGameMatchmakingService.get_game] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_matchmaking_ticket(self, item_id: str) -> MatchmakingTicket:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._matchmaking_tickets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown MatchmakingTicket id: {item_id}")
            log.info("[MultiplayerGameMatchmakingService.close_matchmaking_ticket] closing %s via MatchmakingTicket.close()", item_id)
            obj.close()
            return obj

    def list_active_matchmaking_tickets(self) -> List[MatchmakingTicket]:
        with self._lock:
            active = [o for o in self._matchmaking_tickets.values() if o.status == "ACTIVE"]
            log.info("[MultiplayerGameMatchmakingService.list_active_matchmaking_tickets] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct MultiplayerGameMatchmakingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = MultiplayerGameMatchmakingService()

    log.info("========== STEP 2: Create primary MatchmakingTicket objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_matchmaking_ticket("alpha-matchmaking_ticket")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_matchmaking_ticket("beta-matchmaking_ticket")

    log.info("========== STEP 3: Create skill (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_skill("sample-skill")

    log.info("========== STEP 4: Create queue (UML class) ==========")
    system.create_queue("sample-queue")

    log.info("========== STEP 5: Create region (UML class) ==========")
    system.create_region("sample-region")

    log.info("========== STEP 6: Create game (UML class) ==========")
    system.create_game("sample-game")

    log.info("========== STEP 7: Inspect active MatchmakingTicket list ==========")
    system.list_active_matchmaking_tickets()

    log.info("========== STEP 8: Close first MatchmakingTicket ==========")
    system.close_matchmaking_ticket(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_matchmaking_ticket(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from MatchmakingTicket.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_matchmaking_ticket("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_matchmaking_ticket: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_matchmaking_tickets()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class MatchmakingTicket {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  MatchmakingTicket(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("MatchmakingTicket.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MatchmakingTicket.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[MatchmakingTicket.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("MatchmakingTicket " + id + " invalid status");
    }
    System.out.println("[MatchmakingTicket.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("MatchmakingTicket " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[MatchmakingTicket.close] id=" + id + " -> CLOSED");
  }
}


class skill {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  skill(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("skill.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("skill.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[skill.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("skill " + id + " invalid status");
    }
    System.out.println("[skill.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("skill " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[skill.close] id=" + id + " -> CLOSED");
  }
}


class queue {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  queue(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("queue.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("queue.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[queue.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("queue " + id + " invalid status");
    }
    System.out.println("[queue.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("queue " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[queue.close] id=" + id + " -> CLOSED");
  }
}


class region {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  region(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("region.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("region.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[region.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("region " + id + " invalid status");
    }
    System.out.println("[region.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("region " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[region.close] id=" + id + " -> CLOSED");
  }
}


class game {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  game(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("game.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("game.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[game.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("game " + id + " invalid status");
    }
    System.out.println("[game.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("game " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[game.close] id=" + id + " -> CLOSED");
  }
}

public class MultiplayerGameMatchmakingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, MatchmakingTicket> matchmaking_tickets = new LinkedHashMap<>();
  private final Map<String, skill> skills = new LinkedHashMap<>();
  private final Map<String, queue> queues = new LinkedHashMap<>();
  private final Map<String, region> regions = new LinkedHashMap<>();
  private final Map<String, game> games = new LinkedHashMap<>();

  public MultiplayerGameMatchmakingService() {
    System.out.println("[MultiplayerGameMatchmakingService.__init__] system ready");
  }

  public MatchmakingTicket createMatchmakingTicket(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MatchmakingTicket name required");
    }
    lock.lock();
    try {
      String id = String.format("MAT-%04d", seq++);
      MatchmakingTicket obj = new MatchmakingTicket(id, name.trim());
      obj.validate();
      matchmaking_tickets.put(id, obj);
      System.out.println("[MultiplayerGameMatchmakingService.createMatchmakingTicket] stored " + id + " count=" + matchmaking_tickets.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public MatchmakingTicket getMatchmakingTicket(String id) {
    lock.lock();
    try {
      MatchmakingTicket obj = matchmaking_tickets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown MatchmakingTicket id: " + id);
      }
      System.out.println("[MultiplayerGameMatchmakingService.getMatchmakingTicket] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public skill createskill(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("skill name required");
    }
    lock.lock();
    try {
      String id = String.format("SKI-%04d", seq++);
      skill obj = new skill(id, name.trim());
      obj.validate();
      skills.put(id, obj);
      System.out.println("[MultiplayerGameMatchmakingService.createskill] stored " + id + " count=" + skills.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public skill getskill(String id) {
    lock.lock();
    try {
      skill obj = skills.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown skill id: " + id);
      }
      System.out.println("[MultiplayerGameMatchmakingService.getskill] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public queue createqueue(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("queue name required");
    }
    lock.lock();
    try {
      String id = String.format("QUE-%04d", seq++);
      queue obj = new queue(id, name.trim());
      obj.validate();
      queues.put(id, obj);
      System.out.println("[MultiplayerGameMatchmakingService.createqueue] stored " + id + " count=" + queues.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public queue getqueue(String id) {
    lock.lock();
    try {
      queue obj = queues.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown queue id: " + id);
      }
      System.out.println("[MultiplayerGameMatchmakingService.getqueue] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public region createregion(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("region name required");
    }
    lock.lock();
    try {
      String id = String.format("REG-%04d", seq++);
      region obj = new region(id, name.trim());
      obj.validate();
      regions.put(id, obj);
      System.out.println("[MultiplayerGameMatchmakingService.createregion] stored " + id + " count=" + regions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public region getregion(String id) {
    lock.lock();
    try {
      region obj = regions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown region id: " + id);
      }
      System.out.println("[MultiplayerGameMatchmakingService.getregion] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public game creategame(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("game name required");
    }
    lock.lock();
    try {
      String id = String.format("GAM-%04d", seq++);
      game obj = new game(id, name.trim());
      obj.validate();
      games.put(id, obj);
      System.out.println("[MultiplayerGameMatchmakingService.creategame] stored " + id + " count=" + games.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public game getgame(String id) {
    lock.lock();
    try {
      game obj = games.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown game id: " + id);
      }
      System.out.println("[MultiplayerGameMatchmakingService.getgame] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public MatchmakingTicket closeMatchmakingTicket(String id) {
    lock.lock();
    try {
      MatchmakingTicket obj = matchmaking_tickets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown MatchmakingTicket id: " + id);
      }
      System.out.println("[MultiplayerGameMatchmakingService.closeMatchmakingTicket] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<MatchmakingTicket> listActiveMatchmakingTickets() {
    lock.lock();
    try {
      List<MatchmakingTicket> out = new ArrayList<>();
      for (MatchmakingTicket o : matchmaking_tickets.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[MultiplayerGameMatchmakingService.listActiveMatchmakingTickets] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct MultiplayerGameMatchmakingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    MultiplayerGameMatchmakingService system = new MultiplayerGameMatchmakingService();
    System.out.println("========== STEP 2: Create MatchmakingTicket objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    MatchmakingTicket first = system.createMatchmakingTicket("alpha-matchmaking_ticket");
    system.createMatchmakingTicket("beta-matchmaking_ticket");
    System.out.println("========== STEP 3: Create skill ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createskill("sample-skill");
    System.out.println("========== STEP 4: Create queue ==========");
    system.createqueue("sample-queue");
    System.out.println("========== STEP 5: Create region ==========");
    system.createregion("sample-region");
    System.out.println("========== STEP 6: Create game ==========");
    system.creategame("sample-game");
    System.out.println("========== Inspect active list ==========");
    system.listActiveMatchmakingTickets();
    System.out.println("========== Close first MatchmakingTicket ==========");
    system.closeMatchmakingTicket(first.getId());
    try {
      system.closeMatchmakingTicket(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getMatchmakingTicket("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class MatchmakingTicket {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('MatchmakingTicket.id required')
    }

    if (!name?.trim()) {
      throw new Error('MatchmakingTicket.name required')
    }
    console.log(\`[MatchmakingTicket.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`MatchmakingTicket \${this.id} invalid status\`)
    }
    console.log(\`[MatchmakingTicket.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`MatchmakingTicket \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[MatchmakingTicket.close] id=\${this.id} -> CLOSED\`)
  }
}


class skill {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('skill.id required')
    }

    if (!name?.trim()) {
      throw new Error('skill.name required')
    }
    console.log(\`[skill.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`skill \${this.id} invalid status\`)
    }
    console.log(\`[skill.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`skill \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[skill.close] id=\${this.id} -> CLOSED\`)
  }
}


class queue {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('queue.id required')
    }

    if (!name?.trim()) {
      throw new Error('queue.name required')
    }
    console.log(\`[queue.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`queue \${this.id} invalid status\`)
    }
    console.log(\`[queue.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`queue \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[queue.close] id=\${this.id} -> CLOSED\`)
  }
}


class region {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('region.id required')
    }

    if (!name?.trim()) {
      throw new Error('region.name required')
    }
    console.log(\`[region.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`region \${this.id} invalid status\`)
    }
    console.log(\`[region.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`region \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[region.close] id=\${this.id} -> CLOSED\`)
  }
}


class game {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('game.id required')
    }

    if (!name?.trim()) {
      throw new Error('game.name required')
    }
    console.log(\`[game.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`game \${this.id} invalid status\`)
    }
    console.log(\`[game.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`game \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[game.close] id=\${this.id} -> CLOSED\`)
  }
}

class MultiplayerGameMatchmakingService {
  private seq = 1
  private matchmaking_tickets = new Map<string, MatchmakingTicket>()
  private skills = new Map<string, skill>()
  private queues = new Map<string, queue>()
  private regions = new Map<string, region>()
  private games = new Map<string, game>()
  constructor() {
    console.log('[MultiplayerGameMatchmakingService.__init__] system ready')
  }

  createMatchmakingTicket(name: string): MatchmakingTicket {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('MatchmakingTicket name required')
    }
    const id = \`MAT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new MatchmakingTicket(id, cleaned)
    obj.validate()
    this.matchmaking_tickets.set(id, obj)
    console.log(\`[MultiplayerGameMatchmakingService.createMatchmakingTicket] stored \${id} count=\${this.matchmaking_tickets.size}\`)
    return obj
  }

  getMatchmakingTicket(id: string): MatchmakingTicket {
    const obj = this.matchmaking_tickets.get(id)
    if (!obj) {
      throw new Error(\`unknown MatchmakingTicket id: \${id}\`)
    }
    console.log(\`[MultiplayerGameMatchmakingService.getMatchmakingTicket] found id=\${obj.id}\`)
    return obj
  }

  createskill(name: string): skill {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('skill name required')
    }
    const id = \`SKI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new skill(id, cleaned)
    obj.validate()
    this.skills.set(id, obj)
    console.log(\`[MultiplayerGameMatchmakingService.createskill] stored \${id} count=\${this.skills.size}\`)
    return obj
  }

  getskill(id: string): skill {
    const obj = this.skills.get(id)
    if (!obj) {
      throw new Error(\`unknown skill id: \${id}\`)
    }
    console.log(\`[MultiplayerGameMatchmakingService.getskill] found id=\${obj.id}\`)
    return obj
  }

  createqueue(name: string): queue {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('queue name required')
    }
    const id = \`QUE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new queue(id, cleaned)
    obj.validate()
    this.queues.set(id, obj)
    console.log(\`[MultiplayerGameMatchmakingService.createqueue] stored \${id} count=\${this.queues.size}\`)
    return obj
  }

  getqueue(id: string): queue {
    const obj = this.queues.get(id)
    if (!obj) {
      throw new Error(\`unknown queue id: \${id}\`)
    }
    console.log(\`[MultiplayerGameMatchmakingService.getqueue] found id=\${obj.id}\`)
    return obj
  }

  createregion(name: string): region {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('region name required')
    }
    const id = \`REG-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new region(id, cleaned)
    obj.validate()
    this.regions.set(id, obj)
    console.log(\`[MultiplayerGameMatchmakingService.createregion] stored \${id} count=\${this.regions.size}\`)
    return obj
  }

  getregion(id: string): region {
    const obj = this.regions.get(id)
    if (!obj) {
      throw new Error(\`unknown region id: \${id}\`)
    }
    console.log(\`[MultiplayerGameMatchmakingService.getregion] found id=\${obj.id}\`)
    return obj
  }

  creategame(name: string): game {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('game name required')
    }
    const id = \`GAM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new game(id, cleaned)
    obj.validate()
    this.games.set(id, obj)
    console.log(\`[MultiplayerGameMatchmakingService.creategame] stored \${id} count=\${this.games.size}\`)
    return obj
  }

  getgame(id: string): game {
    const obj = this.games.get(id)
    if (!obj) {
      throw new Error(\`unknown game id: \${id}\`)
    }
    console.log(\`[MultiplayerGameMatchmakingService.getgame] found id=\${obj.id}\`)
    return obj
  }

  closeMatchmakingTicket(id: string): MatchmakingTicket {
    const obj = this.getMatchmakingTicket(id)
    console.log(\`[MultiplayerGameMatchmakingService.closeMatchmakingTicket] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveMatchmakingTickets(): MatchmakingTicket[] {
    const active = [...this.matchmaking_tickets.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[MultiplayerGameMatchmakingService.listActiveMatchmakingTickets] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct MultiplayerGameMatchmakingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new MultiplayerGameMatchmakingService()
  console.log('========== STEP 2: Create MatchmakingTicket objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createMatchmakingTicket('alpha-matchmaking_ticket')
  system.createMatchmakingTicket('beta-matchmaking_ticket')
  console.log('========== STEP 3: Create skill ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createskill('sample-skill')
  console.log('========== STEP 4: Create queue ==========')
  system.createqueue('sample-queue')
  console.log('========== STEP 5: Create region ==========')
  system.createregion('sample-region')
  console.log('========== STEP 6: Create game ==========')
  system.creategame('sample-game')
  system.listActiveMatchmakingTickets()
  console.log('========== Close first MatchmakingTicket ==========')
  system.closeMatchmakingTicket(first.id)
  try {
    system.closeMatchmakingTicket(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getMatchmakingTicket('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class MatchmakingTicket {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  MatchmakingTicket(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("MatchmakingTicket requires id and name");
    }
    cout << "[MatchmakingTicket.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("MatchmakingTicket invalid status");
    }
    cout << "[MatchmakingTicket.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("MatchmakingTicket cannot close");
    }
    status_ = "CLOSED";
    cout << "[MatchmakingTicket.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class skill {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  skill(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("skill requires id and name");
    }
    cout << "[skill.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("skill invalid status");
    }
    cout << "[skill.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("skill cannot close");
    }
    status_ = "CLOSED";
    cout << "[skill.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class queue {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  queue(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("queue requires id and name");
    }
    cout << "[queue.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("queue invalid status");
    }
    cout << "[queue.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("queue cannot close");
    }
    status_ = "CLOSED";
    cout << "[queue.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class region {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  region(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("region requires id and name");
    }
    cout << "[region.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("region invalid status");
    }
    cout << "[region.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("region cannot close");
    }
    status_ = "CLOSED";
    cout << "[region.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class game {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  game(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("game requires id and name");
    }
    cout << "[game.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("game invalid status");
    }
    cout << "[game.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("game cannot close");
    }
    status_ = "CLOSED";
    cout << "[game.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class MultiplayerGameMatchmakingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, MatchmakingTicket> matchmaking_tickets_;
  unordered_map<string, skill> skills_;
  unordered_map<string, queue> queues_;
  unordered_map<string, region> regions_;
  unordered_map<string, game> games_;
public:
  MultiplayerGameMatchmakingService() {
    cout << "[MultiplayerGameMatchmakingService.__init__] system ready" << endl;
  }

  MatchmakingTicket createMatchmakingTicket(const string& name) {
    if (name.empty()) {
      throw invalid_argument("MatchmakingTicket name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MAT-%04d", seq_++);
    MatchmakingTicket obj{buf, name};
    obj.validate();
    matchmaking_tickets_.emplace(obj.id(), obj);
    cout << "[MultiplayerGameMatchmakingService.createMatchmakingTicket] stored " << obj.id() << endl;
    return obj;
  }

  MatchmakingTicket getMatchmakingTicket(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = matchmaking_tickets_.find(id);
    if (it == matchmaking_tickets_.end()) {
      throw out_of_range("unknown MatchmakingTicket id");
    }
    cout << "[MultiplayerGameMatchmakingService.getMatchmakingTicket] found " << id << endl;
    return it->second;
  }

  skill createskill(const string& name) {
    if (name.empty()) {
      throw invalid_argument("skill name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SKI-%04d", seq_++);
    skill obj{buf, name};
    obj.validate();
    skills_.emplace(obj.id(), obj);
    cout << "[MultiplayerGameMatchmakingService.createskill] stored " << obj.id() << endl;
    return obj;
  }

  skill getskill(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = skills_.find(id);
    if (it == skills_.end()) {
      throw out_of_range("unknown skill id");
    }
    cout << "[MultiplayerGameMatchmakingService.getskill] found " << id << endl;
    return it->second;
  }

  queue createqueue(const string& name) {
    if (name.empty()) {
      throw invalid_argument("queue name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "QUE-%04d", seq_++);
    queue obj{buf, name};
    obj.validate();
    queues_.emplace(obj.id(), obj);
    cout << "[MultiplayerGameMatchmakingService.createqueue] stored " << obj.id() << endl;
    return obj;
  }

  queue getqueue(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = queues_.find(id);
    if (it == queues_.end()) {
      throw out_of_range("unknown queue id");
    }
    cout << "[MultiplayerGameMatchmakingService.getqueue] found " << id << endl;
    return it->second;
  }

  region createregion(const string& name) {
    if (name.empty()) {
      throw invalid_argument("region name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "REG-%04d", seq_++);
    region obj{buf, name};
    obj.validate();
    regions_.emplace(obj.id(), obj);
    cout << "[MultiplayerGameMatchmakingService.createregion] stored " << obj.id() << endl;
    return obj;
  }

  region getregion(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = regions_.find(id);
    if (it == regions_.end()) {
      throw out_of_range("unknown region id");
    }
    cout << "[MultiplayerGameMatchmakingService.getregion] found " << id << endl;
    return it->second;
  }

  game creategame(const string& name) {
    if (name.empty()) {
      throw invalid_argument("game name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "GAM-%04d", seq_++);
    game obj{buf, name};
    obj.validate();
    games_.emplace(obj.id(), obj);
    cout << "[MultiplayerGameMatchmakingService.creategame] stored " << obj.id() << endl;
    return obj;
  }

  game getgame(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = games_.find(id);
    if (it == games_.end()) {
      throw out_of_range("unknown game id");
    }
    cout << "[MultiplayerGameMatchmakingService.getgame] found " << id << endl;
    return it->second;
  }

  MatchmakingTicket closeMatchmakingTicket(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = matchmaking_tickets_.find(id);
    if (it == matchmaking_tickets_.end()) {
      throw out_of_range("unknown MatchmakingTicket");
    }
    cout << "[MultiplayerGameMatchmakingService.closeMatchmakingTicket] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct MultiplayerGameMatchmakingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  MultiplayerGameMatchmakingService system;
  cout << "========== STEP 2: Create MatchmakingTicket ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createMatchmakingTicket("alpha-matchmaking_ticket");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createMatchmakingTicket("beta-matchmaking_ticket");
  system.createskill("sample-skill");
  system.createqueue("sample-queue");
  system.createregion("sample-region");
  system.creategame("sample-game");
  system.closeMatchmakingTicket(first.id());
  try {
    system.closeMatchmakingTicket(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getMatchmakingTicket("MISSING-ID");
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

type MatchmakingTicket struct {
  ID     string
  Name   string
  Status string
}

func NewMatchmakingTicket(id, name string) (*MatchmakingTicket, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("MatchmakingTicket requires id and name")
  }
  obj := &MatchmakingTicket{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[MatchmakingTicket.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *MatchmakingTicket) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("MatchmakingTicket invalid status")
  }
  fmt.Printf("[MatchmakingTicket.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *MatchmakingTicket) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("MatchmakingTicket %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[MatchmakingTicket.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type skill struct {
  ID     string
  Name   string
  Status string
}

func Newskill(id, name string) (*skill, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("skill requires id and name")
  }
  obj := &skill{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[skill.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *skill) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("skill invalid status")
  }
  fmt.Printf("[skill.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *skill) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("skill %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[skill.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type queue struct {
  ID     string
  Name   string
  Status string
}

func Newqueue(id, name string) (*queue, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("queue requires id and name")
  }
  obj := &queue{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[queue.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *queue) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("queue invalid status")
  }
  fmt.Printf("[queue.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *queue) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("queue %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[queue.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type region struct {
  ID     string
  Name   string
  Status string
}

func Newregion(id, name string) (*region, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("region requires id and name")
  }
  obj := &region{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[region.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *region) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("region invalid status")
  }
  fmt.Printf("[region.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *region) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("region %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[region.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type game struct {
  ID     string
  Name   string
  Status string
}

func Newgame(id, name string) (*game, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("game requires id and name")
  }
  obj := &game{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[game.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *game) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("game invalid status")
  }
  fmt.Printf("[game.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *game) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("game %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[game.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type MultiplayerGameMatchmakingService struct {
  mu  sync.Mutex
  seq int
  matchmaking_tickets map[string]*MatchmakingTicket
  skills map[string]*skill
  queues map[string]*queue
  regions map[string]*region
  games map[string]*game
}

func NewMultiplayerGameMatchmakingService() *MultiplayerGameMatchmakingService {
  fmt.Println("[MultiplayerGameMatchmakingService.__init__] system ready")
  return &MultiplayerGameMatchmakingService{
    seq: 1,
    matchmaking_tickets: map[string]*MatchmakingTicket{},
    skills: map[string]*skill{},
    queues: map[string]*queue{},
    regions: map[string]*region{},
    games: map[string]*game{},
  }
}

func (s *MultiplayerGameMatchmakingService) CreateMatchmakingTicket(name string) (*MatchmakingTicket, error) {
  if name == "" {
    return nil, fmt.Errorf("MatchmakingTicket name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MAT-%04d", s.seq)
  s.seq++
  obj, err := NewMatchmakingTicket(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.matchmaking_tickets[id] = obj
  fmt.Printf("[MultiplayerGameMatchmakingService.CreateMatchmakingTicket] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) GetMatchmakingTicket(id string) (*MatchmakingTicket, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.matchmaking_tickets[id]
  if !ok {
    return nil, fmt.Errorf("unknown MatchmakingTicket id: %s", id)
  }
  fmt.Printf("[MultiplayerGameMatchmakingService.GetMatchmakingTicket] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) Createskill(name string) (*skill, error) {
  if name == "" {
    return nil, fmt.Errorf("skill name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SKI-%04d", s.seq)
  s.seq++
  obj, err := Newskill(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.skills[id] = obj
  fmt.Printf("[MultiplayerGameMatchmakingService.Createskill] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) Getskill(id string) (*skill, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.skills[id]
  if !ok {
    return nil, fmt.Errorf("unknown skill id: %s", id)
  }
  fmt.Printf("[MultiplayerGameMatchmakingService.Getskill] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) Createqueue(name string) (*queue, error) {
  if name == "" {
    return nil, fmt.Errorf("queue name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("QUE-%04d", s.seq)
  s.seq++
  obj, err := Newqueue(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.queues[id] = obj
  fmt.Printf("[MultiplayerGameMatchmakingService.Createqueue] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) Getqueue(id string) (*queue, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.queues[id]
  if !ok {
    return nil, fmt.Errorf("unknown queue id: %s", id)
  }
  fmt.Printf("[MultiplayerGameMatchmakingService.Getqueue] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) Createregion(name string) (*region, error) {
  if name == "" {
    return nil, fmt.Errorf("region name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("REG-%04d", s.seq)
  s.seq++
  obj, err := Newregion(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.regions[id] = obj
  fmt.Printf("[MultiplayerGameMatchmakingService.Createregion] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) Getregion(id string) (*region, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.regions[id]
  if !ok {
    return nil, fmt.Errorf("unknown region id: %s", id)
  }
  fmt.Printf("[MultiplayerGameMatchmakingService.Getregion] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) Creategame(name string) (*game, error) {
  if name == "" {
    return nil, fmt.Errorf("game name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("GAM-%04d", s.seq)
  s.seq++
  obj, err := Newgame(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.games[id] = obj
  fmt.Printf("[MultiplayerGameMatchmakingService.Creategame] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) Getgame(id string) (*game, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.games[id]
  if !ok {
    return nil, fmt.Errorf("unknown game id: %s", id)
  }
  fmt.Printf("[MultiplayerGameMatchmakingService.Getgame] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerGameMatchmakingService) CloseMatchmakingTicket(id string) (*MatchmakingTicket, error) {
  obj, err := s.GetMatchmakingTicket(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[MultiplayerGameMatchmakingService.CloseMatchmakingTicket] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct MultiplayerGameMatchmakingService ==========")
  system := NewMultiplayerGameMatchmakingService()
  fmt.Println("========== STEP 2: Create MatchmakingTicket ==========")
  first, _ := system.CreateMatchmakingTicket("alpha-matchmaking_ticket")
  system.CreateMatchmakingTicket("beta-matchmaking_ticket")
  system.Createskill("sample-skill")
  system.Createqueue("sample-queue")
  system.Createregion("sample-region")
  system.Creategame("sample-game")
  system.CloseMatchmakingTicket(first.ID)
  if _, err := system.CloseMatchmakingTicket(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetMatchmakingTicket("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class MatchmakingTicket {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public MatchmakingTicket(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MatchmakingTicket requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[MatchmakingTicket.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("MatchmakingTicket invalid status");
    }
    Console.WriteLine("[MatchmakingTicket.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("MatchmakingTicket " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[MatchmakingTicket.close] id=" + Id + " -> CLOSED");
  }
}


sealed class skill {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public skill(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("skill requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[skill.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("skill invalid status");
    }
    Console.WriteLine("[skill.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("skill " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[skill.close] id=" + Id + " -> CLOSED");
  }
}


sealed class queue {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public queue(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("queue requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[queue.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("queue invalid status");
    }
    Console.WriteLine("[queue.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("queue " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[queue.close] id=" + Id + " -> CLOSED");
  }
}


sealed class region {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public region(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("region requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[region.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("region invalid status");
    }
    Console.WriteLine("[region.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("region " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[region.close] id=" + Id + " -> CLOSED");
  }
}


sealed class game {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public game(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("game requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[game.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("game invalid status");
    }
    Console.WriteLine("[game.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("game " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[game.close] id=" + Id + " -> CLOSED");
  }
}

sealed class MultiplayerGameMatchmakingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, MatchmakingTicket> _matchmaking_tickets = new();
  private readonly Dictionary<string, skill> _skills = new();
  private readonly Dictionary<string, queue> _queues = new();
  private readonly Dictionary<string, region> _regions = new();
  private readonly Dictionary<string, game> _games = new();
  public MultiplayerGameMatchmakingService() {
    Console.WriteLine("[MultiplayerGameMatchmakingService.__init__] system ready");
  }

  public MatchmakingTicket CreateMatchmakingTicket(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MatchmakingTicket name required");
    }
    lock (_gate) {
      var id = string.Format("MAT-{0:D4}", _seq++);
      var obj = new MatchmakingTicket(id, name.Trim());
      obj.Validate();
      _matchmaking_tickets[id] = obj;
      Console.WriteLine("[MultiplayerGameMatchmakingService.CreateMatchmakingTicket] stored " + id);
      return obj;
    }
  }

  public MatchmakingTicket GetMatchmakingTicket(string id) {
    lock (_gate) {
      if (!_matchmaking_tickets.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown MatchmakingTicket id: " + id);
      }
      Console.WriteLine("[MultiplayerGameMatchmakingService.GetMatchmakingTicket] found " + id);
      return obj;
    }
  }

  public skill Createskill(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("skill name required");
    }
    lock (_gate) {
      var id = string.Format("SKI-{0:D4}", _seq++);
      var obj = new skill(id, name.Trim());
      obj.Validate();
      _skills[id] = obj;
      Console.WriteLine("[MultiplayerGameMatchmakingService.Createskill] stored " + id);
      return obj;
    }
  }

  public skill Getskill(string id) {
    lock (_gate) {
      if (!_skills.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown skill id: " + id);
      }
      Console.WriteLine("[MultiplayerGameMatchmakingService.Getskill] found " + id);
      return obj;
    }
  }

  public queue Createqueue(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("queue name required");
    }
    lock (_gate) {
      var id = string.Format("QUE-{0:D4}", _seq++);
      var obj = new queue(id, name.Trim());
      obj.Validate();
      _queues[id] = obj;
      Console.WriteLine("[MultiplayerGameMatchmakingService.Createqueue] stored " + id);
      return obj;
    }
  }

  public queue Getqueue(string id) {
    lock (_gate) {
      if (!_queues.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown queue id: " + id);
      }
      Console.WriteLine("[MultiplayerGameMatchmakingService.Getqueue] found " + id);
      return obj;
    }
  }

  public region Createregion(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("region name required");
    }
    lock (_gate) {
      var id = string.Format("REG-{0:D4}", _seq++);
      var obj = new region(id, name.Trim());
      obj.Validate();
      _regions[id] = obj;
      Console.WriteLine("[MultiplayerGameMatchmakingService.Createregion] stored " + id);
      return obj;
    }
  }

  public region Getregion(string id) {
    lock (_gate) {
      if (!_regions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown region id: " + id);
      }
      Console.WriteLine("[MultiplayerGameMatchmakingService.Getregion] found " + id);
      return obj;
    }
  }

  public game Creategame(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("game name required");
    }
    lock (_gate) {
      var id = string.Format("GAM-{0:D4}", _seq++);
      var obj = new game(id, name.Trim());
      obj.Validate();
      _games[id] = obj;
      Console.WriteLine("[MultiplayerGameMatchmakingService.Creategame] stored " + id);
      return obj;
    }
  }

  public game Getgame(string id) {
    lock (_gate) {
      if (!_games.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown game id: " + id);
      }
      Console.WriteLine("[MultiplayerGameMatchmakingService.Getgame] found " + id);
      return obj;
    }
  }

  public MatchmakingTicket CloseMatchmakingTicket(string id) {
    var obj = GetMatchmakingTicket(id);
    Console.WriteLine("[MultiplayerGameMatchmakingService.CloseMatchmakingTicket] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct MultiplayerGameMatchmakingService ==========");
    var system = new MultiplayerGameMatchmakingService();
    Console.WriteLine("========== STEP 2: Create MatchmakingTicket ==========");
    var first = system.CreateMatchmakingTicket("alpha-matchmaking_ticket");
    system.CreateMatchmakingTicket("beta-matchmaking_ticket");
    system.Createskill("sample-skill");
    system.Createqueue("sample-queue");
    system.Createregion("sample-region");
    system.Creategame("sample-game");
    system.CloseMatchmakingTicket(first.Id);
    try {
      system.CloseMatchmakingTicket(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetMatchmakingTicket("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const multiplayerGameMatchmakingSolution: ProblemSolution = {
  slug: 'multiplayer-game-matchmaking',
  title: 'Multiplayer Game Matchmaking System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a matchmaking service that pairs players of similar skill into balanced game sessions at scale, with low wait times. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Queue a player for a match, optionally as part of a pre-formed party',
      'Match players into balanced teams based on skill rating (e.g. Elo/MMR)',
      'Support different game modes with different team sizes',
      'Widen matchmaking criteria gradually if a match isn\'t found quickly',
      'Assign a matched group to an available game server',
      'Update player skill ratings after a match concludes',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Queue a player for a match, optionally as part of a pre-formed party?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Match players into balanced teams based on skill rating (e.g. Elo/MMR)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support different game modes with different team sizes?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Widen matchmaking criteria gradually if a match isn\'t found quickly?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Assign a matched group to an available game server?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. MultiplayerGameMatchmakingService is the facade stereotype. MatchmakingTicket, skill, queue, region, game are concrete domain classes with id/name/status and validate/close.',
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
          'Construct MultiplayerGameMatchmakingService.',
          'createMatchmakingTicket twice and create the related UML classes.',
          'closeMatchmakingTicket once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'MultiplayerGameMatchmakingService', responsibility: 'UML facade - orchestrates Multiplayer Game Matchmaking System.', keyMembers: ['create*', 'get*', 'closeMatchmakingTicket'] },
    { name: 'MatchmakingTicket', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'skill', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'queue', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'region', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'game', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from MultiplayerGameMatchmakingService to MatchmakingTicket, skill, queue, region, game. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on MultiplayerGameMatchmakingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'MultiplayerGameMatchmakingService', responsibility: 'UML facade - orchestrates Multiplayer Game Matchmaking System.', keyMembers: ['create*', 'get*', 'closeMatchmakingTicket'] },
    { name: 'MatchmakingTicket', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'skill', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'queue', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'region', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'game', responsibility: 'UML class - domain object for Multiplayer Game Matchmaking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'MultiplayerGameMatchmakingService exposes create/get/close and owns composed collections.' },
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
      'main constructs MultiplayerGameMatchmakingService, creates UML domain objects, closes the primary MatchmakingTicket, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct MultiplayerGameMatchmakingService.',
      'createMatchmakingTicket for alpha and beta.',
      'create remaining UML classes.',
      'closeMatchmakingTicket(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createMatchmakingTicket("alpha..."); closeMatchmakingTicket(id)',
        output: '[MatchmakingTicket.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeMatchmakingTicket(alreadyClosed) or getMatchmakingTicket("MISSING-ID")',
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
