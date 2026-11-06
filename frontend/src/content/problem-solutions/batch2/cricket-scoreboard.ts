import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'CricketScoreboardService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_matchs', 'Map<string, Match>'),
    attr('-', '_teams', 'Map<string, Team>'),
    attr('-', '_players', 'Map<string, Player>'),
    attr('-', '_innings', 'Map<string, Inning>'),
    attr('-', '_overs', 'Map<string, Over>'),
  ], [
    method('+', 'createMatch', 'name: string', 'Match'),
    method('+', 'createTeam', 'name: string', 'Team'),
    method('+', 'createPlayer', 'name: string', 'Player'),
    method('+', 'createInning', 'name: string', 'Inning'),
    method('+', 'createOver', 'name: string', 'Over'),
    method('+', 'getMatch', 'id: string', 'Match'),
    method('+', 'getTeam', 'id: string', 'Team'),
    method('+', 'getPlayer', 'id: string', 'Player'),
    method('+', 'getInning', 'id: string', 'Inning'),
    method('+', 'getOver', 'id: string', 'Over'),
    method('+', 'closeMatch', 'id: string', 'Match'),
  ], 'facade'),
  cls('n1', 'Match', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Team', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Player', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Inning', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Over', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("cricket-scoreboard")


class Match:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Match.id is required")
        if not name or not name.strip():
            raise ValueError("Match.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Match.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Match {self.id} has invalid status={self.status}")
        log.info("[Match.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Match {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Match.close] id=%s -> CLOSED", self.id)


class Team:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Team.id is required")
        if not name or not name.strip():
            raise ValueError("Team.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Team.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Team {self.id} has invalid status={self.status}")
        log.info("[Team.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Team {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Team.close] id=%s -> CLOSED", self.id)


class Player:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Player.id is required")
        if not name or not name.strip():
            raise ValueError("Player.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Player.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Player {self.id} has invalid status={self.status}")
        log.info("[Player.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Player {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Player.close] id=%s -> CLOSED", self.id)


class Inning:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Inning.id is required")
        if not name or not name.strip():
            raise ValueError("Inning.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Inning.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Inning {self.id} has invalid status={self.status}")
        log.info("[Inning.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Inning {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Inning.close] id=%s -> CLOSED", self.id)


class Over:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Over.id is required")
        if not name or not name.strip():
            raise ValueError("Over.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Over.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Over {self.id} has invalid status={self.status}")
        log.info("[Over.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Over {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Over.close] id=%s -> CLOSED", self.id)


class CricketScoreboardService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._matchs: Dict[str, Match] = {}
        self._teams: Dict[str, Team] = {}
        self._players: Dict[str, Player] = {}
        self._innings: Dict[str, Inning] = {}
        self._overs: Dict[str, Over] = {}
        log.info("[CricketScoreboardService.__init__] system ready; managing: Match, Team, Player, Inning, Over")

    def create_match(self, name: str) -> Match:
        """UML: CricketScoreboardService.create_match(name) -> Match"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Match name is required")
        with self._lock:
            item_id = f"MAT-{self._seq:04d}"
            self._seq += 1
            obj = Match(item_id, cleaned)
            obj.validate()
            self._matchs[item_id] = obj
            log.info("[CricketScoreboardService.create_match] stored %s in _matchs (count=%s)", item_id, len(self._matchs))
            return obj

    def get_match(self, item_id: str) -> Match:
        with self._lock:
            obj = self._matchs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Match id: {item_id}")
            log.info("[CricketScoreboardService.get_match] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_team(self, name: str) -> Team:
        """UML: CricketScoreboardService.create_team(name) -> Team"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Team name is required")
        with self._lock:
            item_id = f"TEA-{self._seq:04d}"
            self._seq += 1
            obj = Team(item_id, cleaned)
            obj.validate()
            self._teams[item_id] = obj
            log.info("[CricketScoreboardService.create_team] stored %s in _teams (count=%s)", item_id, len(self._teams))
            return obj

    def get_team(self, item_id: str) -> Team:
        with self._lock:
            obj = self._teams.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Team id: {item_id}")
            log.info("[CricketScoreboardService.get_team] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_player(self, name: str) -> Player:
        """UML: CricketScoreboardService.create_player(name) -> Player"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Player name is required")
        with self._lock:
            item_id = f"PLA-{self._seq:04d}"
            self._seq += 1
            obj = Player(item_id, cleaned)
            obj.validate()
            self._players[item_id] = obj
            log.info("[CricketScoreboardService.create_player] stored %s in _players (count=%s)", item_id, len(self._players))
            return obj

    def get_player(self, item_id: str) -> Player:
        with self._lock:
            obj = self._players.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Player id: {item_id}")
            log.info("[CricketScoreboardService.get_player] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_inning(self, name: str) -> Inning:
        """UML: CricketScoreboardService.create_inning(name) -> Inning"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Inning name is required")
        with self._lock:
            item_id = f"INN-{self._seq:04d}"
            self._seq += 1
            obj = Inning(item_id, cleaned)
            obj.validate()
            self._innings[item_id] = obj
            log.info("[CricketScoreboardService.create_inning] stored %s in _innings (count=%s)", item_id, len(self._innings))
            return obj

    def get_inning(self, item_id: str) -> Inning:
        with self._lock:
            obj = self._innings.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Inning id: {item_id}")
            log.info("[CricketScoreboardService.get_inning] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_over(self, name: str) -> Over:
        """UML: CricketScoreboardService.create_over(name) -> Over"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Over name is required")
        with self._lock:
            item_id = f"OVE-{self._seq:04d}"
            self._seq += 1
            obj = Over(item_id, cleaned)
            obj.validate()
            self._overs[item_id] = obj
            log.info("[CricketScoreboardService.create_over] stored %s in _overs (count=%s)", item_id, len(self._overs))
            return obj

    def get_over(self, item_id: str) -> Over:
        with self._lock:
            obj = self._overs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Over id: {item_id}")
            log.info("[CricketScoreboardService.get_over] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_match(self, item_id: str) -> Match:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._matchs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Match id: {item_id}")
            log.info("[CricketScoreboardService.close_match] closing %s via Match.close()", item_id)
            obj.close()
            return obj

    def list_active_matchs(self) -> List[Match]:
        with self._lock:
            active = [o for o in self._matchs.values() if o.status == "ACTIVE"]
            log.info("[CricketScoreboardService.list_active_matchs] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct CricketScoreboardService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = CricketScoreboardService()

    log.info("========== STEP 2: Create primary Match objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_match("alpha-match")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_match("beta-match")

    log.info("========== STEP 3: Create Team (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_team("sample-team")

    log.info("========== STEP 4: Create Player (UML class) ==========")
    system.create_player("sample-player")

    log.info("========== STEP 5: Create Inning (UML class) ==========")
    system.create_inning("sample-inning")

    log.info("========== STEP 6: Create Over (UML class) ==========")
    system.create_over("sample-over")

    log.info("========== STEP 7: Inspect active Match list ==========")
    system.list_active_matchs()

    log.info("========== STEP 8: Close first Match ==========")
    system.close_match(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_match(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Match.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_match("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_match: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_matchs()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Match {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Match(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Match.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Match.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Match.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Match " + id + " invalid status");
    }
    System.out.println("[Match.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Match " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Match.close] id=" + id + " -> CLOSED");
  }
}


class Team {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Team(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Team.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Team.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Team.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Team " + id + " invalid status");
    }
    System.out.println("[Team.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Team " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Team.close] id=" + id + " -> CLOSED");
  }
}


class Player {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Player(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Player.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Player.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Player.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Player " + id + " invalid status");
    }
    System.out.println("[Player.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Player " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Player.close] id=" + id + " -> CLOSED");
  }
}


class Inning {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Inning(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Inning.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Inning.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Inning.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Inning " + id + " invalid status");
    }
    System.out.println("[Inning.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Inning " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Inning.close] id=" + id + " -> CLOSED");
  }
}


class Over {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Over(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Over.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Over.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Over.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Over " + id + " invalid status");
    }
    System.out.println("[Over.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Over " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Over.close] id=" + id + " -> CLOSED");
  }
}

public class CricketScoreboardService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Match> matchs = new LinkedHashMap<>();
  private final Map<String, Team> teams = new LinkedHashMap<>();
  private final Map<String, Player> players = new LinkedHashMap<>();
  private final Map<String, Inning> innings = new LinkedHashMap<>();
  private final Map<String, Over> overs = new LinkedHashMap<>();

  public CricketScoreboardService() {
    System.out.println("[CricketScoreboardService.__init__] system ready");
  }

  public Match createMatch(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Match name required");
    }
    lock.lock();
    try {
      String id = String.format("MAT-%04d", seq++);
      Match obj = new Match(id, name.trim());
      obj.validate();
      matchs.put(id, obj);
      System.out.println("[CricketScoreboardService.createMatch] stored " + id + " count=" + matchs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Match getMatch(String id) {
    lock.lock();
    try {
      Match obj = matchs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Match id: " + id);
      }
      System.out.println("[CricketScoreboardService.getMatch] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Team createTeam(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Team name required");
    }
    lock.lock();
    try {
      String id = String.format("TEA-%04d", seq++);
      Team obj = new Team(id, name.trim());
      obj.validate();
      teams.put(id, obj);
      System.out.println("[CricketScoreboardService.createTeam] stored " + id + " count=" + teams.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Team getTeam(String id) {
    lock.lock();
    try {
      Team obj = teams.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Team id: " + id);
      }
      System.out.println("[CricketScoreboardService.getTeam] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Player createPlayer(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Player name required");
    }
    lock.lock();
    try {
      String id = String.format("PLA-%04d", seq++);
      Player obj = new Player(id, name.trim());
      obj.validate();
      players.put(id, obj);
      System.out.println("[CricketScoreboardService.createPlayer] stored " + id + " count=" + players.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Player getPlayer(String id) {
    lock.lock();
    try {
      Player obj = players.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Player id: " + id);
      }
      System.out.println("[CricketScoreboardService.getPlayer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Inning createInning(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Inning name required");
    }
    lock.lock();
    try {
      String id = String.format("INN-%04d", seq++);
      Inning obj = new Inning(id, name.trim());
      obj.validate();
      innings.put(id, obj);
      System.out.println("[CricketScoreboardService.createInning] stored " + id + " count=" + innings.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Inning getInning(String id) {
    lock.lock();
    try {
      Inning obj = innings.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Inning id: " + id);
      }
      System.out.println("[CricketScoreboardService.getInning] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Over createOver(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Over name required");
    }
    lock.lock();
    try {
      String id = String.format("OVE-%04d", seq++);
      Over obj = new Over(id, name.trim());
      obj.validate();
      overs.put(id, obj);
      System.out.println("[CricketScoreboardService.createOver] stored " + id + " count=" + overs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Over getOver(String id) {
    lock.lock();
    try {
      Over obj = overs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Over id: " + id);
      }
      System.out.println("[CricketScoreboardService.getOver] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Match closeMatch(String id) {
    lock.lock();
    try {
      Match obj = matchs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Match id: " + id);
      }
      System.out.println("[CricketScoreboardService.closeMatch] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Match> listActiveMatchs() {
    lock.lock();
    try {
      List<Match> out = new ArrayList<>();
      for (Match o : matchs.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[CricketScoreboardService.listActiveMatchs] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct CricketScoreboardService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    CricketScoreboardService system = new CricketScoreboardService();
    System.out.println("========== STEP 2: Create Match objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Match first = system.createMatch("alpha-match");
    system.createMatch("beta-match");
    System.out.println("========== STEP 3: Create Team ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createTeam("sample-team");
    System.out.println("========== STEP 4: Create Player ==========");
    system.createPlayer("sample-player");
    System.out.println("========== STEP 5: Create Inning ==========");
    system.createInning("sample-inning");
    System.out.println("========== STEP 6: Create Over ==========");
    system.createOver("sample-over");
    System.out.println("========== Inspect active list ==========");
    system.listActiveMatchs();
    System.out.println("========== Close first Match ==========");
    system.closeMatch(first.getId());
    try {
      system.closeMatch(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getMatch("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Match {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Match.id required')
    }

    if (!name?.trim()) {
      throw new Error('Match.name required')
    }
    console.log(\`[Match.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Match \${this.id} invalid status\`)
    }
    console.log(\`[Match.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Match \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Match.close] id=\${this.id} -> CLOSED\`)
  }
}


class Team {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Team.id required')
    }

    if (!name?.trim()) {
      throw new Error('Team.name required')
    }
    console.log(\`[Team.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Team \${this.id} invalid status\`)
    }
    console.log(\`[Team.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Team \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Team.close] id=\${this.id} -> CLOSED\`)
  }
}


class Player {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Player.id required')
    }

    if (!name?.trim()) {
      throw new Error('Player.name required')
    }
    console.log(\`[Player.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Player \${this.id} invalid status\`)
    }
    console.log(\`[Player.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Player \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Player.close] id=\${this.id} -> CLOSED\`)
  }
}


class Inning {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Inning.id required')
    }

    if (!name?.trim()) {
      throw new Error('Inning.name required')
    }
    console.log(\`[Inning.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Inning \${this.id} invalid status\`)
    }
    console.log(\`[Inning.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Inning \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Inning.close] id=\${this.id} -> CLOSED\`)
  }
}


class Over {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Over.id required')
    }

    if (!name?.trim()) {
      throw new Error('Over.name required')
    }
    console.log(\`[Over.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Over \${this.id} invalid status\`)
    }
    console.log(\`[Over.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Over \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Over.close] id=\${this.id} -> CLOSED\`)
  }
}

class CricketScoreboardService {
  private seq = 1
  private matchs = new Map<string, Match>()
  private teams = new Map<string, Team>()
  private players = new Map<string, Player>()
  private innings = new Map<string, Inning>()
  private overs = new Map<string, Over>()
  constructor() {
    console.log('[CricketScoreboardService.__init__] system ready')
  }

  createMatch(name: string): Match {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Match name required')
    }
    const id = \`MAT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Match(id, cleaned)
    obj.validate()
    this.matchs.set(id, obj)
    console.log(\`[CricketScoreboardService.createMatch] stored \${id} count=\${this.matchs.size}\`)
    return obj
  }

  getMatch(id: string): Match {
    const obj = this.matchs.get(id)
    if (!obj) {
      throw new Error(\`unknown Match id: \${id}\`)
    }
    console.log(\`[CricketScoreboardService.getMatch] found id=\${obj.id}\`)
    return obj
  }

  createTeam(name: string): Team {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Team name required')
    }
    const id = \`TEA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Team(id, cleaned)
    obj.validate()
    this.teams.set(id, obj)
    console.log(\`[CricketScoreboardService.createTeam] stored \${id} count=\${this.teams.size}\`)
    return obj
  }

  getTeam(id: string): Team {
    const obj = this.teams.get(id)
    if (!obj) {
      throw new Error(\`unknown Team id: \${id}\`)
    }
    console.log(\`[CricketScoreboardService.getTeam] found id=\${obj.id}\`)
    return obj
  }

  createPlayer(name: string): Player {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Player name required')
    }
    const id = \`PLA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Player(id, cleaned)
    obj.validate()
    this.players.set(id, obj)
    console.log(\`[CricketScoreboardService.createPlayer] stored \${id} count=\${this.players.size}\`)
    return obj
  }

  getPlayer(id: string): Player {
    const obj = this.players.get(id)
    if (!obj) {
      throw new Error(\`unknown Player id: \${id}\`)
    }
    console.log(\`[CricketScoreboardService.getPlayer] found id=\${obj.id}\`)
    return obj
  }

  createInning(name: string): Inning {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Inning name required')
    }
    const id = \`INN-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Inning(id, cleaned)
    obj.validate()
    this.innings.set(id, obj)
    console.log(\`[CricketScoreboardService.createInning] stored \${id} count=\${this.innings.size}\`)
    return obj
  }

  getInning(id: string): Inning {
    const obj = this.innings.get(id)
    if (!obj) {
      throw new Error(\`unknown Inning id: \${id}\`)
    }
    console.log(\`[CricketScoreboardService.getInning] found id=\${obj.id}\`)
    return obj
  }

  createOver(name: string): Over {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Over name required')
    }
    const id = \`OVE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Over(id, cleaned)
    obj.validate()
    this.overs.set(id, obj)
    console.log(\`[CricketScoreboardService.createOver] stored \${id} count=\${this.overs.size}\`)
    return obj
  }

  getOver(id: string): Over {
    const obj = this.overs.get(id)
    if (!obj) {
      throw new Error(\`unknown Over id: \${id}\`)
    }
    console.log(\`[CricketScoreboardService.getOver] found id=\${obj.id}\`)
    return obj
  }

  closeMatch(id: string): Match {
    const obj = this.getMatch(id)
    console.log(\`[CricketScoreboardService.closeMatch] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveMatchs(): Match[] {
    const active = [...this.matchs.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[CricketScoreboardService.listActiveMatchs] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct CricketScoreboardService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new CricketScoreboardService()
  console.log('========== STEP 2: Create Match objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createMatch('alpha-match')
  system.createMatch('beta-match')
  console.log('========== STEP 3: Create Team ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createTeam('sample-team')
  console.log('========== STEP 4: Create Player ==========')
  system.createPlayer('sample-player')
  console.log('========== STEP 5: Create Inning ==========')
  system.createInning('sample-inning')
  console.log('========== STEP 6: Create Over ==========')
  system.createOver('sample-over')
  system.listActiveMatchs()
  console.log('========== Close first Match ==========')
  system.closeMatch(first.id)
  try {
    system.closeMatch(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getMatch('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Match {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Match(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Match requires id and name");
    }
    cout << "[Match.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Match invalid status");
    }
    cout << "[Match.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Match cannot close");
    }
    status_ = "CLOSED";
    cout << "[Match.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Team {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Team(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Team requires id and name");
    }
    cout << "[Team.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Team invalid status");
    }
    cout << "[Team.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Team cannot close");
    }
    status_ = "CLOSED";
    cout << "[Team.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Player {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Player(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Player requires id and name");
    }
    cout << "[Player.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Player invalid status");
    }
    cout << "[Player.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Player cannot close");
    }
    status_ = "CLOSED";
    cout << "[Player.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Inning {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Inning(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Inning requires id and name");
    }
    cout << "[Inning.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Inning invalid status");
    }
    cout << "[Inning.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Inning cannot close");
    }
    status_ = "CLOSED";
    cout << "[Inning.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Over {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Over(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Over requires id and name");
    }
    cout << "[Over.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Over invalid status");
    }
    cout << "[Over.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Over cannot close");
    }
    status_ = "CLOSED";
    cout << "[Over.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class CricketScoreboardService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Match> matchs_;
  unordered_map<string, Team> teams_;
  unordered_map<string, Player> players_;
  unordered_map<string, Inning> innings_;
  unordered_map<string, Over> overs_;
public:
  CricketScoreboardService() {
    cout << "[CricketScoreboardService.__init__] system ready" << endl;
  }

  Match createMatch(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Match name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MAT-%04d", seq_++);
    Match obj{buf, name};
    obj.validate();
    matchs_.emplace(obj.id(), obj);
    cout << "[CricketScoreboardService.createMatch] stored " << obj.id() << endl;
    return obj;
  }

  Match getMatch(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = matchs_.find(id);
    if (it == matchs_.end()) {
      throw out_of_range("unknown Match id");
    }
    cout << "[CricketScoreboardService.getMatch] found " << id << endl;
    return it->second;
  }

  Team createTeam(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Team name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TEA-%04d", seq_++);
    Team obj{buf, name};
    obj.validate();
    teams_.emplace(obj.id(), obj);
    cout << "[CricketScoreboardService.createTeam] stored " << obj.id() << endl;
    return obj;
  }

  Team getTeam(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = teams_.find(id);
    if (it == teams_.end()) {
      throw out_of_range("unknown Team id");
    }
    cout << "[CricketScoreboardService.getTeam] found " << id << endl;
    return it->second;
  }

  Player createPlayer(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Player name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PLA-%04d", seq_++);
    Player obj{buf, name};
    obj.validate();
    players_.emplace(obj.id(), obj);
    cout << "[CricketScoreboardService.createPlayer] stored " << obj.id() << endl;
    return obj;
  }

  Player getPlayer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = players_.find(id);
    if (it == players_.end()) {
      throw out_of_range("unknown Player id");
    }
    cout << "[CricketScoreboardService.getPlayer] found " << id << endl;
    return it->second;
  }

  Inning createInning(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Inning name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "INN-%04d", seq_++);
    Inning obj{buf, name};
    obj.validate();
    innings_.emplace(obj.id(), obj);
    cout << "[CricketScoreboardService.createInning] stored " << obj.id() << endl;
    return obj;
  }

  Inning getInning(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = innings_.find(id);
    if (it == innings_.end()) {
      throw out_of_range("unknown Inning id");
    }
    cout << "[CricketScoreboardService.getInning] found " << id << endl;
    return it->second;
  }

  Over createOver(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Over name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "OVE-%04d", seq_++);
    Over obj{buf, name};
    obj.validate();
    overs_.emplace(obj.id(), obj);
    cout << "[CricketScoreboardService.createOver] stored " << obj.id() << endl;
    return obj;
  }

  Over getOver(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = overs_.find(id);
    if (it == overs_.end()) {
      throw out_of_range("unknown Over id");
    }
    cout << "[CricketScoreboardService.getOver] found " << id << endl;
    return it->second;
  }

  Match closeMatch(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = matchs_.find(id);
    if (it == matchs_.end()) {
      throw out_of_range("unknown Match");
    }
    cout << "[CricketScoreboardService.closeMatch] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct CricketScoreboardService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  CricketScoreboardService system;
  cout << "========== STEP 2: Create Match ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createMatch("alpha-match");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createMatch("beta-match");
  system.createTeam("sample-team");
  system.createPlayer("sample-player");
  system.createInning("sample-inning");
  system.createOver("sample-over");
  system.closeMatch(first.id());
  try {
    system.closeMatch(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getMatch("MISSING-ID");
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

type Match struct {
  ID     string
  Name   string
  Status string
}

func NewMatch(id, name string) (*Match, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Match requires id and name")
  }
  obj := &Match{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Match.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Match) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Match invalid status")
  }
  fmt.Printf("[Match.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Match) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Match %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Match.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Team struct {
  ID     string
  Name   string
  Status string
}

func NewTeam(id, name string) (*Team, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Team requires id and name")
  }
  obj := &Team{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Team.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Team) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Team invalid status")
  }
  fmt.Printf("[Team.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Team) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Team %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Team.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Player struct {
  ID     string
  Name   string
  Status string
}

func NewPlayer(id, name string) (*Player, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Player requires id and name")
  }
  obj := &Player{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Player.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Player) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Player invalid status")
  }
  fmt.Printf("[Player.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Player) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Player %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Player.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Inning struct {
  ID     string
  Name   string
  Status string
}

func NewInning(id, name string) (*Inning, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Inning requires id and name")
  }
  obj := &Inning{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Inning.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Inning) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Inning invalid status")
  }
  fmt.Printf("[Inning.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Inning) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Inning %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Inning.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Over struct {
  ID     string
  Name   string
  Status string
}

func NewOver(id, name string) (*Over, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Over requires id and name")
  }
  obj := &Over{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Over.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Over) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Over invalid status")
  }
  fmt.Printf("[Over.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Over) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Over %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Over.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type CricketScoreboardService struct {
  mu  sync.Mutex
  seq int
  matchs map[string]*Match
  teams map[string]*Team
  players map[string]*Player
  innings map[string]*Inning
  overs map[string]*Over
}

func NewCricketScoreboardService() *CricketScoreboardService {
  fmt.Println("[CricketScoreboardService.__init__] system ready")
  return &CricketScoreboardService{
    seq: 1,
    matchs: map[string]*Match{},
    teams: map[string]*Team{},
    players: map[string]*Player{},
    innings: map[string]*Inning{},
    overs: map[string]*Over{},
  }
}

func (s *CricketScoreboardService) CreateMatch(name string) (*Match, error) {
  if name == "" {
    return nil, fmt.Errorf("Match name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MAT-%04d", s.seq)
  s.seq++
  obj, err := NewMatch(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.matchs[id] = obj
  fmt.Printf("[CricketScoreboardService.CreateMatch] stored %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) GetMatch(id string) (*Match, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.matchs[id]
  if !ok {
    return nil, fmt.Errorf("unknown Match id: %s", id)
  }
  fmt.Printf("[CricketScoreboardService.GetMatch] found %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) CreateTeam(name string) (*Team, error) {
  if name == "" {
    return nil, fmt.Errorf("Team name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TEA-%04d", s.seq)
  s.seq++
  obj, err := NewTeam(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.teams[id] = obj
  fmt.Printf("[CricketScoreboardService.CreateTeam] stored %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) GetTeam(id string) (*Team, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.teams[id]
  if !ok {
    return nil, fmt.Errorf("unknown Team id: %s", id)
  }
  fmt.Printf("[CricketScoreboardService.GetTeam] found %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) CreatePlayer(name string) (*Player, error) {
  if name == "" {
    return nil, fmt.Errorf("Player name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PLA-%04d", s.seq)
  s.seq++
  obj, err := NewPlayer(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.players[id] = obj
  fmt.Printf("[CricketScoreboardService.CreatePlayer] stored %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) GetPlayer(id string) (*Player, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.players[id]
  if !ok {
    return nil, fmt.Errorf("unknown Player id: %s", id)
  }
  fmt.Printf("[CricketScoreboardService.GetPlayer] found %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) CreateInning(name string) (*Inning, error) {
  if name == "" {
    return nil, fmt.Errorf("Inning name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("INN-%04d", s.seq)
  s.seq++
  obj, err := NewInning(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.innings[id] = obj
  fmt.Printf("[CricketScoreboardService.CreateInning] stored %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) GetInning(id string) (*Inning, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.innings[id]
  if !ok {
    return nil, fmt.Errorf("unknown Inning id: %s", id)
  }
  fmt.Printf("[CricketScoreboardService.GetInning] found %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) CreateOver(name string) (*Over, error) {
  if name == "" {
    return nil, fmt.Errorf("Over name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("OVE-%04d", s.seq)
  s.seq++
  obj, err := NewOver(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.overs[id] = obj
  fmt.Printf("[CricketScoreboardService.CreateOver] stored %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) GetOver(id string) (*Over, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.overs[id]
  if !ok {
    return nil, fmt.Errorf("unknown Over id: %s", id)
  }
  fmt.Printf("[CricketScoreboardService.GetOver] found %s\\n", id)
  return obj, nil
}

func (s *CricketScoreboardService) CloseMatch(id string) (*Match, error) {
  obj, err := s.GetMatch(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[CricketScoreboardService.CloseMatch] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct CricketScoreboardService ==========")
  system := NewCricketScoreboardService()
  fmt.Println("========== STEP 2: Create Match ==========")
  first, _ := system.CreateMatch("alpha-match")
  system.CreateMatch("beta-match")
  system.CreateTeam("sample-team")
  system.CreatePlayer("sample-player")
  system.CreateInning("sample-inning")
  system.CreateOver("sample-over")
  system.CloseMatch(first.ID)
  if _, err := system.CloseMatch(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetMatch("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Match {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Match(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Match requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Match.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Match invalid status");
    }
    Console.WriteLine("[Match.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Match " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Match.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Team {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Team(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Team requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Team.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Team invalid status");
    }
    Console.WriteLine("[Team.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Team " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Team.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Player {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Player(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Player requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Player.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Player invalid status");
    }
    Console.WriteLine("[Player.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Player " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Player.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Inning {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Inning(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Inning requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Inning.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Inning invalid status");
    }
    Console.WriteLine("[Inning.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Inning " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Inning.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Over {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Over(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Over requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Over.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Over invalid status");
    }
    Console.WriteLine("[Over.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Over " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Over.close] id=" + Id + " -> CLOSED");
  }
}

sealed class CricketScoreboardService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Match> _matchs = new();
  private readonly Dictionary<string, Team> _teams = new();
  private readonly Dictionary<string, Player> _players = new();
  private readonly Dictionary<string, Inning> _innings = new();
  private readonly Dictionary<string, Over> _overs = new();
  public CricketScoreboardService() {
    Console.WriteLine("[CricketScoreboardService.__init__] system ready");
  }

  public Match CreateMatch(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Match name required");
    }
    lock (_gate) {
      var id = string.Format("MAT-{0:D4}", _seq++);
      var obj = new Match(id, name.Trim());
      obj.Validate();
      _matchs[id] = obj;
      Console.WriteLine("[CricketScoreboardService.CreateMatch] stored " + id);
      return obj;
    }
  }

  public Match GetMatch(string id) {
    lock (_gate) {
      if (!_matchs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Match id: " + id);
      }
      Console.WriteLine("[CricketScoreboardService.GetMatch] found " + id);
      return obj;
    }
  }

  public Team CreateTeam(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Team name required");
    }
    lock (_gate) {
      var id = string.Format("TEA-{0:D4}", _seq++);
      var obj = new Team(id, name.Trim());
      obj.Validate();
      _teams[id] = obj;
      Console.WriteLine("[CricketScoreboardService.CreateTeam] stored " + id);
      return obj;
    }
  }

  public Team GetTeam(string id) {
    lock (_gate) {
      if (!_teams.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Team id: " + id);
      }
      Console.WriteLine("[CricketScoreboardService.GetTeam] found " + id);
      return obj;
    }
  }

  public Player CreatePlayer(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Player name required");
    }
    lock (_gate) {
      var id = string.Format("PLA-{0:D4}", _seq++);
      var obj = new Player(id, name.Trim());
      obj.Validate();
      _players[id] = obj;
      Console.WriteLine("[CricketScoreboardService.CreatePlayer] stored " + id);
      return obj;
    }
  }

  public Player GetPlayer(string id) {
    lock (_gate) {
      if (!_players.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Player id: " + id);
      }
      Console.WriteLine("[CricketScoreboardService.GetPlayer] found " + id);
      return obj;
    }
  }

  public Inning CreateInning(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Inning name required");
    }
    lock (_gate) {
      var id = string.Format("INN-{0:D4}", _seq++);
      var obj = new Inning(id, name.Trim());
      obj.Validate();
      _innings[id] = obj;
      Console.WriteLine("[CricketScoreboardService.CreateInning] stored " + id);
      return obj;
    }
  }

  public Inning GetInning(string id) {
    lock (_gate) {
      if (!_innings.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Inning id: " + id);
      }
      Console.WriteLine("[CricketScoreboardService.GetInning] found " + id);
      return obj;
    }
  }

  public Over CreateOver(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Over name required");
    }
    lock (_gate) {
      var id = string.Format("OVE-{0:D4}", _seq++);
      var obj = new Over(id, name.Trim());
      obj.Validate();
      _overs[id] = obj;
      Console.WriteLine("[CricketScoreboardService.CreateOver] stored " + id);
      return obj;
    }
  }

  public Over GetOver(string id) {
    lock (_gate) {
      if (!_overs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Over id: " + id);
      }
      Console.WriteLine("[CricketScoreboardService.GetOver] found " + id);
      return obj;
    }
  }

  public Match CloseMatch(string id) {
    var obj = GetMatch(id);
    Console.WriteLine("[CricketScoreboardService.CloseMatch] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct CricketScoreboardService ==========");
    var system = new CricketScoreboardService();
    Console.WriteLine("========== STEP 2: Create Match ==========");
    var first = system.CreateMatch("alpha-match");
    system.CreateMatch("beta-match");
    system.CreateTeam("sample-team");
    system.CreatePlayer("sample-player");
    system.CreateInning("sample-inning");
    system.CreateOver("sample-over");
    system.CloseMatch(first.Id);
    try {
      system.CloseMatch(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetMatch("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const cricketScoreboardSolution: ProblemSolution = {
  slug: 'cricket-scoreboard',
  title: 'Cricket Scoreboard / Live Scoring - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a live cricket scoring system supporting match setup, ball-by-ball scoring, innings management, and score broadcasting. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Set up a match: teams, players, venue, format (Test, ODI, T20)',
      'Ball-by-ball scoring: runs, wickets, extras (wide, no-ball, bye)',
      'Track batting and bowling statistics per player',
      'Manage innings transitions and follow-on rules',
      'Calculate run rate, required rate, and projected score',
      'Live score broadcast to subscribed clients',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Set up a match: teams, players, venue, format (Test, ODI, T20)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Ball-by-ball scoring: runs, wickets, extras (wide, no-ball, bye)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Track batting and bowling statistics per player?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Manage innings transitions and follow-on rules?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Calculate run rate, required rate, and projected score?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. CricketScoreboardService is the facade stereotype. Match, Team, Player, Inning, Over are concrete domain classes with id/name/status and validate/close.',
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
          'Construct CricketScoreboardService.',
          'createMatch twice and create the related UML classes.',
          'closeMatch once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'CricketScoreboardService', responsibility: 'UML facade - orchestrates Cricket Scoreboard / Live Scoring.', keyMembers: ['create*', 'get*', 'closeMatch'] },
    { name: 'Match', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Team', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Inning', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Over', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from CricketScoreboardService to Match, Team, Player, Inning, Over. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on CricketScoreboardService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'CricketScoreboardService', responsibility: 'UML facade - orchestrates Cricket Scoreboard / Live Scoring.', keyMembers: ['create*', 'get*', 'closeMatch'] },
    { name: 'Match', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Team', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Inning', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Over', responsibility: 'UML class - domain object for Cricket Scoreboard / Live Scoring.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'CricketScoreboardService exposes create/get/close and owns composed collections.' },
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
      'main constructs CricketScoreboardService, creates UML domain objects, closes the primary Match, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct CricketScoreboardService.',
      'createMatch for alpha and beta.',
      'create remaining UML classes.',
      'closeMatch(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createMatch("alpha..."); closeMatch(id)',
        output: '[Match.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeMatch(alreadyClosed) or getMatch("MISSING-ID")',
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
