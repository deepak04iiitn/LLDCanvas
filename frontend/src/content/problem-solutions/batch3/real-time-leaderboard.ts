import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'RealTimeLeaderboardService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_players', 'Map<string, Player>'),
    attr('-', '_scores', 'Map<string, Score>'),
    attr('-', '_leaderboards', 'Map<string, Leaderboard>'),
    attr('-', '_ranks', 'Map<string, Rank>'),
  ], [
    method('+', 'createPlayer', 'name: string', 'Player'),
    method('+', 'createScore', 'name: string', 'Score'),
    method('+', 'createLeaderboard', 'name: string', 'Leaderboard'),
    method('+', 'createRank', 'name: string', 'Rank'),
    method('+', 'getPlayer', 'id: string', 'Player'),
    method('+', 'getScore', 'id: string', 'Score'),
    method('+', 'getLeaderboard', 'id: string', 'Leaderboard'),
    method('+', 'getRank', 'id: string', 'Rank'),
    method('+', 'closePlayer', 'id: string', 'Player'),
  ], 'facade'),
  cls('n1', 'Player', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Score', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Leaderboard', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Rank', GRID.x(1), GRID.y(1), [
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
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("real-time-leaderboard")


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


class Score:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Score.id is required")
        if not name or not name.strip():
            raise ValueError("Score.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Score.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Score {self.id} has invalid status={self.status}")
        log.info("[Score.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Score {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Score.close] id=%s -> CLOSED", self.id)


class Leaderboard:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Leaderboard.id is required")
        if not name or not name.strip():
            raise ValueError("Leaderboard.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Leaderboard.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Leaderboard {self.id} has invalid status={self.status}")
        log.info("[Leaderboard.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Leaderboard {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Leaderboard.close] id=%s -> CLOSED", self.id)


class Rank:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Rank.id is required")
        if not name or not name.strip():
            raise ValueError("Rank.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Rank.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Rank {self.id} has invalid status={self.status}")
        log.info("[Rank.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Rank {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Rank.close] id=%s -> CLOSED", self.id)


class RealTimeLeaderboardService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._players: Dict[str, Player] = {}
        self._scores: Dict[str, Score] = {}
        self._leaderboards: Dict[str, Leaderboard] = {}
        self._ranks: Dict[str, Rank] = {}
        log.info("[RealTimeLeaderboardService.__init__] system ready; managing: Player, Score, Leaderboard, Rank")

    def create_player(self, name: str) -> Player:
        """UML: RealTimeLeaderboardService.create_player(name) -> Player"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Player name is required")
        with self._lock:
            item_id = f"PLA-{self._seq:04d}"
            self._seq += 1
            obj = Player(item_id, cleaned)
            obj.validate()
            self._players[item_id] = obj
            log.info("[RealTimeLeaderboardService.create_player] stored %s in _players (count=%s)", item_id, len(self._players))
            return obj

    def get_player(self, item_id: str) -> Player:
        with self._lock:
            obj = self._players.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Player id: {item_id}")
            log.info("[RealTimeLeaderboardService.get_player] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_score(self, name: str) -> Score:
        """UML: RealTimeLeaderboardService.create_score(name) -> Score"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Score name is required")
        with self._lock:
            item_id = f"SCO-{self._seq:04d}"
            self._seq += 1
            obj = Score(item_id, cleaned)
            obj.validate()
            self._scores[item_id] = obj
            log.info("[RealTimeLeaderboardService.create_score] stored %s in _scores (count=%s)", item_id, len(self._scores))
            return obj

    def get_score(self, item_id: str) -> Score:
        with self._lock:
            obj = self._scores.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Score id: {item_id}")
            log.info("[RealTimeLeaderboardService.get_score] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_leaderboard(self, name: str) -> Leaderboard:
        """UML: RealTimeLeaderboardService.create_leaderboard(name) -> Leaderboard"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Leaderboard name is required")
        with self._lock:
            item_id = f"LEA-{self._seq:04d}"
            self._seq += 1
            obj = Leaderboard(item_id, cleaned)
            obj.validate()
            self._leaderboards[item_id] = obj
            log.info("[RealTimeLeaderboardService.create_leaderboard] stored %s in _leaderboards (count=%s)", item_id, len(self._leaderboards))
            return obj

    def get_leaderboard(self, item_id: str) -> Leaderboard:
        with self._lock:
            obj = self._leaderboards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Leaderboard id: {item_id}")
            log.info("[RealTimeLeaderboardService.get_leaderboard] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_rank(self, name: str) -> Rank:
        """UML: RealTimeLeaderboardService.create_rank(name) -> Rank"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Rank name is required")
        with self._lock:
            item_id = f"RAN-{self._seq:04d}"
            self._seq += 1
            obj = Rank(item_id, cleaned)
            obj.validate()
            self._ranks[item_id] = obj
            log.info("[RealTimeLeaderboardService.create_rank] stored %s in _ranks (count=%s)", item_id, len(self._ranks))
            return obj

    def get_rank(self, item_id: str) -> Rank:
        with self._lock:
            obj = self._ranks.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Rank id: {item_id}")
            log.info("[RealTimeLeaderboardService.get_rank] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_player(self, item_id: str) -> Player:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._players.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Player id: {item_id}")
            log.info("[RealTimeLeaderboardService.close_player] closing %s via Player.close()", item_id)
            obj.close()
            return obj

    def list_active_players(self) -> List[Player]:
        with self._lock:
            active = [o for o in self._players.values() if o.status == "ACTIVE"]
            log.info("[RealTimeLeaderboardService.list_active_players] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct RealTimeLeaderboardService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = RealTimeLeaderboardService()

    log.info("========== STEP 2: Create primary Player objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_player("alpha-player")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_player("beta-player")

    log.info("========== STEP 3: Create Score (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_score("sample-score")

    log.info("========== STEP 4: Create Leaderboard (UML class) ==========")
    system.create_leaderboard("sample-leaderboard")

    log.info("========== STEP 5: Create Rank (UML class) ==========")
    system.create_rank("sample-rank")

    log.info("========== STEP 6: Inspect active Player list ==========")
    system.list_active_players()

    log.info("========== STEP 7: Close first Player ==========")
    system.close_player(first.id)

    log.info("========== STEP 8: Expected failure - close again ==========")
    try:
        system.close_player(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Player.close: %s", err)

    log.info("========== STEP 9: Expected failure - missing id ==========")
    try:
        system.get_player("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_player: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_players()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

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


class Score {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Score(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Score.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Score.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Score.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Score " + id + " invalid status");
    }
    System.out.println("[Score.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Score " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Score.close] id=" + id + " -> CLOSED");
  }
}


class Leaderboard {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Leaderboard(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Leaderboard.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Leaderboard.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Leaderboard.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Leaderboard " + id + " invalid status");
    }
    System.out.println("[Leaderboard.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Leaderboard " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Leaderboard.close] id=" + id + " -> CLOSED");
  }
}


class Rank {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Rank(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Rank.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Rank.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Rank.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Rank " + id + " invalid status");
    }
    System.out.println("[Rank.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Rank " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Rank.close] id=" + id + " -> CLOSED");
  }
}

public class RealTimeLeaderboardService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Player> players = new LinkedHashMap<>();
  private final Map<String, Score> scores = new LinkedHashMap<>();
  private final Map<String, Leaderboard> leaderboards = new LinkedHashMap<>();
  private final Map<String, Rank> ranks = new LinkedHashMap<>();

  public RealTimeLeaderboardService() {
    System.out.println("[RealTimeLeaderboardService.__init__] system ready");
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
      System.out.println("[RealTimeLeaderboardService.createPlayer] stored " + id + " count=" + players.size());
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
      System.out.println("[RealTimeLeaderboardService.getPlayer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Score createScore(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Score name required");
    }
    lock.lock();
    try {
      String id = String.format("SCO-%04d", seq++);
      Score obj = new Score(id, name.trim());
      obj.validate();
      scores.put(id, obj);
      System.out.println("[RealTimeLeaderboardService.createScore] stored " + id + " count=" + scores.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Score getScore(String id) {
    lock.lock();
    try {
      Score obj = scores.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Score id: " + id);
      }
      System.out.println("[RealTimeLeaderboardService.getScore] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Leaderboard createLeaderboard(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Leaderboard name required");
    }
    lock.lock();
    try {
      String id = String.format("LEA-%04d", seq++);
      Leaderboard obj = new Leaderboard(id, name.trim());
      obj.validate();
      leaderboards.put(id, obj);
      System.out.println("[RealTimeLeaderboardService.createLeaderboard] stored " + id + " count=" + leaderboards.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Leaderboard getLeaderboard(String id) {
    lock.lock();
    try {
      Leaderboard obj = leaderboards.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Leaderboard id: " + id);
      }
      System.out.println("[RealTimeLeaderboardService.getLeaderboard] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Rank createRank(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Rank name required");
    }
    lock.lock();
    try {
      String id = String.format("RAN-%04d", seq++);
      Rank obj = new Rank(id, name.trim());
      obj.validate();
      ranks.put(id, obj);
      System.out.println("[RealTimeLeaderboardService.createRank] stored " + id + " count=" + ranks.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Rank getRank(String id) {
    lock.lock();
    try {
      Rank obj = ranks.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Rank id: " + id);
      }
      System.out.println("[RealTimeLeaderboardService.getRank] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Player closePlayer(String id) {
    lock.lock();
    try {
      Player obj = players.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Player id: " + id);
      }
      System.out.println("[RealTimeLeaderboardService.closePlayer] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Player> listActivePlayers() {
    lock.lock();
    try {
      List<Player> out = new ArrayList<>();
      for (Player o : players.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[RealTimeLeaderboardService.listActivePlayers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct RealTimeLeaderboardService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    RealTimeLeaderboardService system = new RealTimeLeaderboardService();
    System.out.println("========== STEP 2: Create Player objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Player first = system.createPlayer("alpha-player");
    system.createPlayer("beta-player");
    System.out.println("========== STEP 3: Create Score ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createScore("sample-score");
    System.out.println("========== STEP 4: Create Leaderboard ==========");
    system.createLeaderboard("sample-leaderboard");
    System.out.println("========== STEP 5: Create Rank ==========");
    system.createRank("sample-rank");
    System.out.println("========== Inspect active list ==========");
    system.listActivePlayers();
    System.out.println("========== Close first Player ==========");
    system.closePlayer(first.getId());
    try {
      system.closePlayer(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getPlayer("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
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


class Score {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Score.id required')
    }

    if (!name?.trim()) {
      throw new Error('Score.name required')
    }
    console.log(\`[Score.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Score \${this.id} invalid status\`)
    }
    console.log(\`[Score.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Score \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Score.close] id=\${this.id} -> CLOSED\`)
  }
}


class Leaderboard {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Leaderboard.id required')
    }

    if (!name?.trim()) {
      throw new Error('Leaderboard.name required')
    }
    console.log(\`[Leaderboard.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Leaderboard \${this.id} invalid status\`)
    }
    console.log(\`[Leaderboard.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Leaderboard \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Leaderboard.close] id=\${this.id} -> CLOSED\`)
  }
}


class Rank {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Rank.id required')
    }

    if (!name?.trim()) {
      throw new Error('Rank.name required')
    }
    console.log(\`[Rank.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Rank \${this.id} invalid status\`)
    }
    console.log(\`[Rank.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Rank \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Rank.close] id=\${this.id} -> CLOSED\`)
  }
}

class RealTimeLeaderboardService {
  private seq = 1
  private players = new Map<string, Player>()
  private scores = new Map<string, Score>()
  private leaderboards = new Map<string, Leaderboard>()
  private ranks = new Map<string, Rank>()
  constructor() {
    console.log('[RealTimeLeaderboardService.__init__] system ready')
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
    console.log(\`[RealTimeLeaderboardService.createPlayer] stored \${id} count=\${this.players.size}\`)
    return obj
  }

  getPlayer(id: string): Player {
    const obj = this.players.get(id)
    if (!obj) {
      throw new Error(\`unknown Player id: \${id}\`)
    }
    console.log(\`[RealTimeLeaderboardService.getPlayer] found id=\${obj.id}\`)
    return obj
  }

  createScore(name: string): Score {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Score name required')
    }
    const id = \`SCO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Score(id, cleaned)
    obj.validate()
    this.scores.set(id, obj)
    console.log(\`[RealTimeLeaderboardService.createScore] stored \${id} count=\${this.scores.size}\`)
    return obj
  }

  getScore(id: string): Score {
    const obj = this.scores.get(id)
    if (!obj) {
      throw new Error(\`unknown Score id: \${id}\`)
    }
    console.log(\`[RealTimeLeaderboardService.getScore] found id=\${obj.id}\`)
    return obj
  }

  createLeaderboard(name: string): Leaderboard {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Leaderboard name required')
    }
    const id = \`LEA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Leaderboard(id, cleaned)
    obj.validate()
    this.leaderboards.set(id, obj)
    console.log(\`[RealTimeLeaderboardService.createLeaderboard] stored \${id} count=\${this.leaderboards.size}\`)
    return obj
  }

  getLeaderboard(id: string): Leaderboard {
    const obj = this.leaderboards.get(id)
    if (!obj) {
      throw new Error(\`unknown Leaderboard id: \${id}\`)
    }
    console.log(\`[RealTimeLeaderboardService.getLeaderboard] found id=\${obj.id}\`)
    return obj
  }

  createRank(name: string): Rank {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Rank name required')
    }
    const id = \`RAN-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Rank(id, cleaned)
    obj.validate()
    this.ranks.set(id, obj)
    console.log(\`[RealTimeLeaderboardService.createRank] stored \${id} count=\${this.ranks.size}\`)
    return obj
  }

  getRank(id: string): Rank {
    const obj = this.ranks.get(id)
    if (!obj) {
      throw new Error(\`unknown Rank id: \${id}\`)
    }
    console.log(\`[RealTimeLeaderboardService.getRank] found id=\${obj.id}\`)
    return obj
  }

  closePlayer(id: string): Player {
    const obj = this.getPlayer(id)
    console.log(\`[RealTimeLeaderboardService.closePlayer] closing \${id}\`)
    obj.close()
    return obj
  }

  listActivePlayers(): Player[] {
    const active = [...this.players.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[RealTimeLeaderboardService.listActivePlayers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct RealTimeLeaderboardService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new RealTimeLeaderboardService()
  console.log('========== STEP 2: Create Player objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createPlayer('alpha-player')
  system.createPlayer('beta-player')
  console.log('========== STEP 3: Create Score ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createScore('sample-score')
  console.log('========== STEP 4: Create Leaderboard ==========')
  system.createLeaderboard('sample-leaderboard')
  console.log('========== STEP 5: Create Rank ==========')
  system.createRank('sample-rank')
  system.listActivePlayers()
  console.log('========== Close first Player ==========')
  system.closePlayer(first.id)
  try {
    system.closePlayer(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getPlayer('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

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


class Score {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Score(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Score requires id and name");
    }
    cout << "[Score.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Score invalid status");
    }
    cout << "[Score.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Score cannot close");
    }
    status_ = "CLOSED";
    cout << "[Score.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Leaderboard {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Leaderboard(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Leaderboard requires id and name");
    }
    cout << "[Leaderboard.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Leaderboard invalid status");
    }
    cout << "[Leaderboard.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Leaderboard cannot close");
    }
    status_ = "CLOSED";
    cout << "[Leaderboard.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Rank {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Rank(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Rank requires id and name");
    }
    cout << "[Rank.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Rank invalid status");
    }
    cout << "[Rank.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Rank cannot close");
    }
    status_ = "CLOSED";
    cout << "[Rank.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class RealTimeLeaderboardService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Player> players_;
  unordered_map<string, Score> scores_;
  unordered_map<string, Leaderboard> leaderboards_;
  unordered_map<string, Rank> ranks_;
public:
  RealTimeLeaderboardService() {
    cout << "[RealTimeLeaderboardService.__init__] system ready" << endl;
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
    cout << "[RealTimeLeaderboardService.createPlayer] stored " << obj.id() << endl;
    return obj;
  }

  Player getPlayer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = players_.find(id);
    if (it == players_.end()) {
      throw out_of_range("unknown Player id");
    }
    cout << "[RealTimeLeaderboardService.getPlayer] found " << id << endl;
    return it->second;
  }

  Score createScore(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Score name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SCO-%04d", seq_++);
    Score obj{buf, name};
    obj.validate();
    scores_.emplace(obj.id(), obj);
    cout << "[RealTimeLeaderboardService.createScore] stored " << obj.id() << endl;
    return obj;
  }

  Score getScore(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = scores_.find(id);
    if (it == scores_.end()) {
      throw out_of_range("unknown Score id");
    }
    cout << "[RealTimeLeaderboardService.getScore] found " << id << endl;
    return it->second;
  }

  Leaderboard createLeaderboard(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Leaderboard name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LEA-%04d", seq_++);
    Leaderboard obj{buf, name};
    obj.validate();
    leaderboards_.emplace(obj.id(), obj);
    cout << "[RealTimeLeaderboardService.createLeaderboard] stored " << obj.id() << endl;
    return obj;
  }

  Leaderboard getLeaderboard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = leaderboards_.find(id);
    if (it == leaderboards_.end()) {
      throw out_of_range("unknown Leaderboard id");
    }
    cout << "[RealTimeLeaderboardService.getLeaderboard] found " << id << endl;
    return it->second;
  }

  Rank createRank(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Rank name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "RAN-%04d", seq_++);
    Rank obj{buf, name};
    obj.validate();
    ranks_.emplace(obj.id(), obj);
    cout << "[RealTimeLeaderboardService.createRank] stored " << obj.id() << endl;
    return obj;
  }

  Rank getRank(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = ranks_.find(id);
    if (it == ranks_.end()) {
      throw out_of_range("unknown Rank id");
    }
    cout << "[RealTimeLeaderboardService.getRank] found " << id << endl;
    return it->second;
  }

  Player closePlayer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = players_.find(id);
    if (it == players_.end()) {
      throw out_of_range("unknown Player");
    }
    cout << "[RealTimeLeaderboardService.closePlayer] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct RealTimeLeaderboardService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  RealTimeLeaderboardService system;
  cout << "========== STEP 2: Create Player ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createPlayer("alpha-player");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createPlayer("beta-player");
  system.createScore("sample-score");
  system.createLeaderboard("sample-leaderboard");
  system.createRank("sample-rank");
  system.closePlayer(first.id());
  try {
    system.closePlayer(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getPlayer("MISSING-ID");
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


type Score struct {
  ID     string
  Name   string
  Status string
}

func NewScore(id, name string) (*Score, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Score requires id and name")
  }
  obj := &Score{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Score.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Score) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Score invalid status")
  }
  fmt.Printf("[Score.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Score) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Score %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Score.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Leaderboard struct {
  ID     string
  Name   string
  Status string
}

func NewLeaderboard(id, name string) (*Leaderboard, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Leaderboard requires id and name")
  }
  obj := &Leaderboard{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Leaderboard.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Leaderboard) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Leaderboard invalid status")
  }
  fmt.Printf("[Leaderboard.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Leaderboard) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Leaderboard %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Leaderboard.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Rank struct {
  ID     string
  Name   string
  Status string
}

func NewRank(id, name string) (*Rank, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Rank requires id and name")
  }
  obj := &Rank{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Rank.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Rank) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Rank invalid status")
  }
  fmt.Printf("[Rank.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Rank) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Rank %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Rank.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type RealTimeLeaderboardService struct {
  mu  sync.Mutex
  seq int
  players map[string]*Player
  scores map[string]*Score
  leaderboards map[string]*Leaderboard
  ranks map[string]*Rank
}

func NewRealTimeLeaderboardService() *RealTimeLeaderboardService {
  fmt.Println("[RealTimeLeaderboardService.__init__] system ready")
  return &RealTimeLeaderboardService{
    seq: 1,
    players: map[string]*Player{},
    scores: map[string]*Score{},
    leaderboards: map[string]*Leaderboard{},
    ranks: map[string]*Rank{},
  }
}

func (s *RealTimeLeaderboardService) CreatePlayer(name string) (*Player, error) {
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
  fmt.Printf("[RealTimeLeaderboardService.CreatePlayer] stored %s\\n", id)
  return obj, nil
}

func (s *RealTimeLeaderboardService) GetPlayer(id string) (*Player, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.players[id]
  if !ok {
    return nil, fmt.Errorf("unknown Player id: %s", id)
  }
  fmt.Printf("[RealTimeLeaderboardService.GetPlayer] found %s\\n", id)
  return obj, nil
}

func (s *RealTimeLeaderboardService) CreateScore(name string) (*Score, error) {
  if name == "" {
    return nil, fmt.Errorf("Score name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SCO-%04d", s.seq)
  s.seq++
  obj, err := NewScore(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.scores[id] = obj
  fmt.Printf("[RealTimeLeaderboardService.CreateScore] stored %s\\n", id)
  return obj, nil
}

func (s *RealTimeLeaderboardService) GetScore(id string) (*Score, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.scores[id]
  if !ok {
    return nil, fmt.Errorf("unknown Score id: %s", id)
  }
  fmt.Printf("[RealTimeLeaderboardService.GetScore] found %s\\n", id)
  return obj, nil
}

func (s *RealTimeLeaderboardService) CreateLeaderboard(name string) (*Leaderboard, error) {
  if name == "" {
    return nil, fmt.Errorf("Leaderboard name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LEA-%04d", s.seq)
  s.seq++
  obj, err := NewLeaderboard(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.leaderboards[id] = obj
  fmt.Printf("[RealTimeLeaderboardService.CreateLeaderboard] stored %s\\n", id)
  return obj, nil
}

func (s *RealTimeLeaderboardService) GetLeaderboard(id string) (*Leaderboard, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.leaderboards[id]
  if !ok {
    return nil, fmt.Errorf("unknown Leaderboard id: %s", id)
  }
  fmt.Printf("[RealTimeLeaderboardService.GetLeaderboard] found %s\\n", id)
  return obj, nil
}

func (s *RealTimeLeaderboardService) CreateRank(name string) (*Rank, error) {
  if name == "" {
    return nil, fmt.Errorf("Rank name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("RAN-%04d", s.seq)
  s.seq++
  obj, err := NewRank(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.ranks[id] = obj
  fmt.Printf("[RealTimeLeaderboardService.CreateRank] stored %s\\n", id)
  return obj, nil
}

func (s *RealTimeLeaderboardService) GetRank(id string) (*Rank, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.ranks[id]
  if !ok {
    return nil, fmt.Errorf("unknown Rank id: %s", id)
  }
  fmt.Printf("[RealTimeLeaderboardService.GetRank] found %s\\n", id)
  return obj, nil
}

func (s *RealTimeLeaderboardService) ClosePlayer(id string) (*Player, error) {
  obj, err := s.GetPlayer(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[RealTimeLeaderboardService.ClosePlayer] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct RealTimeLeaderboardService ==========")
  system := NewRealTimeLeaderboardService()
  fmt.Println("========== STEP 2: Create Player ==========")
  first, _ := system.CreatePlayer("alpha-player")
  system.CreatePlayer("beta-player")
  system.CreateScore("sample-score")
  system.CreateLeaderboard("sample-leaderboard")
  system.CreateRank("sample-rank")
  system.ClosePlayer(first.ID)
  if _, err := system.ClosePlayer(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetPlayer("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

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


sealed class Score {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Score(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Score requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Score.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Score invalid status");
    }
    Console.WriteLine("[Score.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Score " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Score.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Leaderboard {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Leaderboard(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Leaderboard requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Leaderboard.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Leaderboard invalid status");
    }
    Console.WriteLine("[Leaderboard.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Leaderboard " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Leaderboard.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Rank {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Rank(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Rank requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Rank.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Rank invalid status");
    }
    Console.WriteLine("[Rank.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Rank " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Rank.close] id=" + Id + " -> CLOSED");
  }
}

sealed class RealTimeLeaderboardService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Player> _players = new();
  private readonly Dictionary<string, Score> _scores = new();
  private readonly Dictionary<string, Leaderboard> _leaderboards = new();
  private readonly Dictionary<string, Rank> _ranks = new();
  public RealTimeLeaderboardService() {
    Console.WriteLine("[RealTimeLeaderboardService.__init__] system ready");
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
      Console.WriteLine("[RealTimeLeaderboardService.CreatePlayer] stored " + id);
      return obj;
    }
  }

  public Player GetPlayer(string id) {
    lock (_gate) {
      if (!_players.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Player id: " + id);
      }
      Console.WriteLine("[RealTimeLeaderboardService.GetPlayer] found " + id);
      return obj;
    }
  }

  public Score CreateScore(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Score name required");
    }
    lock (_gate) {
      var id = string.Format("SCO-{0:D4}", _seq++);
      var obj = new Score(id, name.Trim());
      obj.Validate();
      _scores[id] = obj;
      Console.WriteLine("[RealTimeLeaderboardService.CreateScore] stored " + id);
      return obj;
    }
  }

  public Score GetScore(string id) {
    lock (_gate) {
      if (!_scores.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Score id: " + id);
      }
      Console.WriteLine("[RealTimeLeaderboardService.GetScore] found " + id);
      return obj;
    }
  }

  public Leaderboard CreateLeaderboard(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Leaderboard name required");
    }
    lock (_gate) {
      var id = string.Format("LEA-{0:D4}", _seq++);
      var obj = new Leaderboard(id, name.Trim());
      obj.Validate();
      _leaderboards[id] = obj;
      Console.WriteLine("[RealTimeLeaderboardService.CreateLeaderboard] stored " + id);
      return obj;
    }
  }

  public Leaderboard GetLeaderboard(string id) {
    lock (_gate) {
      if (!_leaderboards.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Leaderboard id: " + id);
      }
      Console.WriteLine("[RealTimeLeaderboardService.GetLeaderboard] found " + id);
      return obj;
    }
  }

  public Rank CreateRank(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Rank name required");
    }
    lock (_gate) {
      var id = string.Format("RAN-{0:D4}", _seq++);
      var obj = new Rank(id, name.Trim());
      obj.Validate();
      _ranks[id] = obj;
      Console.WriteLine("[RealTimeLeaderboardService.CreateRank] stored " + id);
      return obj;
    }
  }

  public Rank GetRank(string id) {
    lock (_gate) {
      if (!_ranks.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Rank id: " + id);
      }
      Console.WriteLine("[RealTimeLeaderboardService.GetRank] found " + id);
      return obj;
    }
  }

  public Player ClosePlayer(string id) {
    var obj = GetPlayer(id);
    Console.WriteLine("[RealTimeLeaderboardService.ClosePlayer] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct RealTimeLeaderboardService ==========");
    var system = new RealTimeLeaderboardService();
    Console.WriteLine("========== STEP 2: Create Player ==========");
    var first = system.CreatePlayer("alpha-player");
    system.CreatePlayer("beta-player");
    system.CreateScore("sample-score");
    system.CreateLeaderboard("sample-leaderboard");
    system.CreateRank("sample-rank");
    system.ClosePlayer(first.Id);
    try {
      system.ClosePlayer(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetPlayer("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const realTimeLeaderboardSolution: ProblemSolution = {
  slug: 'real-time-leaderboard',
  title: 'Real-Time Gaming Leaderboard - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a globally consistent real-time leaderboard for a game supporting millions of players with rank queries and score updates. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Update a player\'s score in real time',
      'Query global rank for any player in < 50ms',
      'Top-100 leaderboard updated in near real-time',
      'Paginated leaderboard: any page of 20 players by rank',
      'Time-windowed leaderboards: daily, weekly, all-time',
      'Friend leaderboard: rank among only the player\'s friends',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Update a player\'s score in real time?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Query global rank for any player in < 50ms?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Top-100 leaderboard updated in near real-time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Paginated leaderboard: any page of 20 players by rank?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Time-windowed leaderboards: daily, weekly, all-time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. RealTimeLeaderboardService is the facade stereotype. Player, Score, Leaderboard, Rank are concrete domain classes with id/name/status and validate/close.',
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
          'Construct RealTimeLeaderboardService.',
          'createPlayer twice and create the related UML classes.',
          'closePlayer once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'RealTimeLeaderboardService', responsibility: 'UML facade - orchestrates Real-Time Gaming Leaderboard.', keyMembers: ['create*', 'get*', 'closePlayer'] },
    { name: 'Player', responsibility: 'UML class - domain object for Real-Time Gaming Leaderboard.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Score', responsibility: 'UML class - domain object for Real-Time Gaming Leaderboard.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Leaderboard', responsibility: 'UML class - domain object for Real-Time Gaming Leaderboard.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Rank', responsibility: 'UML class - domain object for Real-Time Gaming Leaderboard.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from RealTimeLeaderboardService to Player, Score, Leaderboard, Rank. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on RealTimeLeaderboardService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'RealTimeLeaderboardService', responsibility: 'UML facade - orchestrates Real-Time Gaming Leaderboard.', keyMembers: ['create*', 'get*', 'closePlayer'] },
    { name: 'Player', responsibility: 'UML class - domain object for Real-Time Gaming Leaderboard.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Score', responsibility: 'UML class - domain object for Real-Time Gaming Leaderboard.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Leaderboard', responsibility: 'UML class - domain object for Real-Time Gaming Leaderboard.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Rank', responsibility: 'UML class - domain object for Real-Time Gaming Leaderboard.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'RealTimeLeaderboardService exposes create/get/close and owns composed collections.' },
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
      'main constructs RealTimeLeaderboardService, creates UML domain objects, closes the primary Player, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct RealTimeLeaderboardService.',
      'createPlayer for alpha and beta.',
      'create remaining UML classes.',
      'closePlayer(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createPlayer("alpha..."); closePlayer(id)',
        output: '[Player.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closePlayer(alreadyClosed) or getPlayer("MISSING-ID")',
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
