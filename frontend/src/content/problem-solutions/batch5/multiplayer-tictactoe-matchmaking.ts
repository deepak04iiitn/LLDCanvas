import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'MultiplayerTictactoeMatchmakingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_matchmaking_queues', 'Map<string, MatchmakingQueue>'),
    attr('-', '_game_sessions', 'Map<string, GameSession>'),
    attr('-', '_boards', 'Map<string, Board>'),
    attr('-', '_players', 'Map<string, Player>'),
    attr('-', '_moves', 'Map<string, Move>'),
  ], [
    method('+', 'createMatchmakingQueue', 'name: string', 'MatchmakingQueue'),
    method('+', 'createGameSession', 'name: string', 'GameSession'),
    method('+', 'createBoard', 'name: string', 'Board'),
    method('+', 'createPlayer', 'name: string', 'Player'),
    method('+', 'createMove', 'name: string', 'Move'),
    method('+', 'getMatchmakingQueue', 'id: string', 'MatchmakingQueue'),
    method('+', 'getGameSession', 'id: string', 'GameSession'),
    method('+', 'getBoard', 'id: string', 'Board'),
    method('+', 'getPlayer', 'id: string', 'Player'),
    method('+', 'getMove', 'id: string', 'Move'),
    method('+', 'closeMatchmakingQueue', 'id: string', 'MatchmakingQueue'),
  ], 'facade'),
  cls('n1', 'MatchmakingQueue', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'GameSession', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Board', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Player', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Move', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("multiplayer-tictactoe-matchmaking")


class MatchmakingQueue:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("MatchmakingQueue.id is required")
        if not name or not name.strip():
            raise ValueError("MatchmakingQueue.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[MatchmakingQueue.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"MatchmakingQueue {self.id} has invalid status={self.status}")
        log.info("[MatchmakingQueue.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"MatchmakingQueue {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[MatchmakingQueue.close] id=%s -> CLOSED", self.id)


class GameSession:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("GameSession.id is required")
        if not name or not name.strip():
            raise ValueError("GameSession.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[GameSession.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"GameSession {self.id} has invalid status={self.status}")
        log.info("[GameSession.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"GameSession {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[GameSession.close] id=%s -> CLOSED", self.id)


class Board:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Board.id is required")
        if not name or not name.strip():
            raise ValueError("Board.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Board.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Board {self.id} has invalid status={self.status}")
        log.info("[Board.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Board {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Board.close] id=%s -> CLOSED", self.id)


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


class Move:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Move.id is required")
        if not name or not name.strip():
            raise ValueError("Move.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Move.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Move {self.id} has invalid status={self.status}")
        log.info("[Move.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Move {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Move.close] id=%s -> CLOSED", self.id)


class MultiplayerTictactoeMatchmakingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._matchmaking_queues: Dict[str, MatchmakingQueue] = {}
        self._game_sessions: Dict[str, GameSession] = {}
        self._boards: Dict[str, Board] = {}
        self._players: Dict[str, Player] = {}
        self._moves: Dict[str, Move] = {}
        log.info("[MultiplayerTictactoeMatchmakingService.__init__] system ready; managing: MatchmakingQueue, GameSession, Board, Player, Move")

    def create_matchmaking_queue(self, name: str) -> MatchmakingQueue:
        """UML: MultiplayerTictactoeMatchmakingService.create_matchmaking_queue(name) -> MatchmakingQueue"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("MatchmakingQueue name is required")
        with self._lock:
            item_id = f"MAT-{self._seq:04d}"
            self._seq += 1
            obj = MatchmakingQueue(item_id, cleaned)
            obj.validate()
            self._matchmaking_queues[item_id] = obj
            log.info("[MultiplayerTictactoeMatchmakingService.create_matchmaking_queue] stored %s in _matchmaking_queues (count=%s)", item_id, len(self._matchmaking_queues))
            return obj

    def get_matchmaking_queue(self, item_id: str) -> MatchmakingQueue:
        with self._lock:
            obj = self._matchmaking_queues.get(item_id)
            if obj is None:
                raise KeyError(f"unknown MatchmakingQueue id: {item_id}")
            log.info("[MultiplayerTictactoeMatchmakingService.get_matchmaking_queue] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_game_session(self, name: str) -> GameSession:
        """UML: MultiplayerTictactoeMatchmakingService.create_game_session(name) -> GameSession"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("GameSession name is required")
        with self._lock:
            item_id = f"GAM-{self._seq:04d}"
            self._seq += 1
            obj = GameSession(item_id, cleaned)
            obj.validate()
            self._game_sessions[item_id] = obj
            log.info("[MultiplayerTictactoeMatchmakingService.create_game_session] stored %s in _game_sessions (count=%s)", item_id, len(self._game_sessions))
            return obj

    def get_game_session(self, item_id: str) -> GameSession:
        with self._lock:
            obj = self._game_sessions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown GameSession id: {item_id}")
            log.info("[MultiplayerTictactoeMatchmakingService.get_game_session] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_board(self, name: str) -> Board:
        """UML: MultiplayerTictactoeMatchmakingService.create_board(name) -> Board"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Board name is required")
        with self._lock:
            item_id = f"BOA-{self._seq:04d}"
            self._seq += 1
            obj = Board(item_id, cleaned)
            obj.validate()
            self._boards[item_id] = obj
            log.info("[MultiplayerTictactoeMatchmakingService.create_board] stored %s in _boards (count=%s)", item_id, len(self._boards))
            return obj

    def get_board(self, item_id: str) -> Board:
        with self._lock:
            obj = self._boards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Board id: {item_id}")
            log.info("[MultiplayerTictactoeMatchmakingService.get_board] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_player(self, name: str) -> Player:
        """UML: MultiplayerTictactoeMatchmakingService.create_player(name) -> Player"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Player name is required")
        with self._lock:
            item_id = f"PLA-{self._seq:04d}"
            self._seq += 1
            obj = Player(item_id, cleaned)
            obj.validate()
            self._players[item_id] = obj
            log.info("[MultiplayerTictactoeMatchmakingService.create_player] stored %s in _players (count=%s)", item_id, len(self._players))
            return obj

    def get_player(self, item_id: str) -> Player:
        with self._lock:
            obj = self._players.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Player id: {item_id}")
            log.info("[MultiplayerTictactoeMatchmakingService.get_player] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_move(self, name: str) -> Move:
        """UML: MultiplayerTictactoeMatchmakingService.create_move(name) -> Move"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Move name is required")
        with self._lock:
            item_id = f"MOV-{self._seq:04d}"
            self._seq += 1
            obj = Move(item_id, cleaned)
            obj.validate()
            self._moves[item_id] = obj
            log.info("[MultiplayerTictactoeMatchmakingService.create_move] stored %s in _moves (count=%s)", item_id, len(self._moves))
            return obj

    def get_move(self, item_id: str) -> Move:
        with self._lock:
            obj = self._moves.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Move id: {item_id}")
            log.info("[MultiplayerTictactoeMatchmakingService.get_move] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_matchmaking_queue(self, item_id: str) -> MatchmakingQueue:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._matchmaking_queues.get(item_id)
            if obj is None:
                raise KeyError(f"unknown MatchmakingQueue id: {item_id}")
            log.info("[MultiplayerTictactoeMatchmakingService.close_matchmaking_queue] closing %s via MatchmakingQueue.close()", item_id)
            obj.close()
            return obj

    def list_active_matchmaking_queues(self) -> List[MatchmakingQueue]:
        with self._lock:
            active = [o for o in self._matchmaking_queues.values() if o.status == "ACTIVE"]
            log.info("[MultiplayerTictactoeMatchmakingService.list_active_matchmaking_queues] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct MultiplayerTictactoeMatchmakingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = MultiplayerTictactoeMatchmakingService()

    log.info("========== STEP 2: Create primary MatchmakingQueue objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_matchmaking_queue("alpha-matchmaking_queue")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_matchmaking_queue("beta-matchmaking_queue")

    log.info("========== STEP 3: Create GameSession (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_game_session("sample-game_session")

    log.info("========== STEP 4: Create Board (UML class) ==========")
    system.create_board("sample-board")

    log.info("========== STEP 5: Create Player (UML class) ==========")
    system.create_player("sample-player")

    log.info("========== STEP 6: Create Move (UML class) ==========")
    system.create_move("sample-move")

    log.info("========== STEP 7: Inspect active MatchmakingQueue list ==========")
    system.list_active_matchmaking_queues()

    log.info("========== STEP 8: Close first MatchmakingQueue ==========")
    system.close_matchmaking_queue(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_matchmaking_queue(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from MatchmakingQueue.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_matchmaking_queue("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_matchmaking_queue: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_matchmaking_queues()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class MatchmakingQueue {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  MatchmakingQueue(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("MatchmakingQueue.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MatchmakingQueue.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[MatchmakingQueue.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("MatchmakingQueue " + id + " invalid status");
    }
    System.out.println("[MatchmakingQueue.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("MatchmakingQueue " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[MatchmakingQueue.close] id=" + id + " -> CLOSED");
  }
}


class GameSession {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  GameSession(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("GameSession.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("GameSession.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[GameSession.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("GameSession " + id + " invalid status");
    }
    System.out.println("[GameSession.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("GameSession " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[GameSession.close] id=" + id + " -> CLOSED");
  }
}


class Board {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Board(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Board.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Board.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Board.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Board " + id + " invalid status");
    }
    System.out.println("[Board.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Board " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Board.close] id=" + id + " -> CLOSED");
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


class Move {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Move(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Move.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Move.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Move.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Move " + id + " invalid status");
    }
    System.out.println("[Move.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Move " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Move.close] id=" + id + " -> CLOSED");
  }
}

public class MultiplayerTictactoeMatchmakingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, MatchmakingQueue> matchmaking_queues = new LinkedHashMap<>();
  private final Map<String, GameSession> game_sessions = new LinkedHashMap<>();
  private final Map<String, Board> boards = new LinkedHashMap<>();
  private final Map<String, Player> players = new LinkedHashMap<>();
  private final Map<String, Move> moves = new LinkedHashMap<>();

  public MultiplayerTictactoeMatchmakingService() {
    System.out.println("[MultiplayerTictactoeMatchmakingService.__init__] system ready");
  }

  public MatchmakingQueue createMatchmakingQueue(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MatchmakingQueue name required");
    }
    lock.lock();
    try {
      String id = String.format("MAT-%04d", seq++);
      MatchmakingQueue obj = new MatchmakingQueue(id, name.trim());
      obj.validate();
      matchmaking_queues.put(id, obj);
      System.out.println("[MultiplayerTictactoeMatchmakingService.createMatchmakingQueue] stored " + id + " count=" + matchmaking_queues.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public MatchmakingQueue getMatchmakingQueue(String id) {
    lock.lock();
    try {
      MatchmakingQueue obj = matchmaking_queues.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown MatchmakingQueue id: " + id);
      }
      System.out.println("[MultiplayerTictactoeMatchmakingService.getMatchmakingQueue] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public GameSession createGameSession(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("GameSession name required");
    }
    lock.lock();
    try {
      String id = String.format("GAM-%04d", seq++);
      GameSession obj = new GameSession(id, name.trim());
      obj.validate();
      game_sessions.put(id, obj);
      System.out.println("[MultiplayerTictactoeMatchmakingService.createGameSession] stored " + id + " count=" + game_sessions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public GameSession getGameSession(String id) {
    lock.lock();
    try {
      GameSession obj = game_sessions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown GameSession id: " + id);
      }
      System.out.println("[MultiplayerTictactoeMatchmakingService.getGameSession] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Board createBoard(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Board name required");
    }
    lock.lock();
    try {
      String id = String.format("BOA-%04d", seq++);
      Board obj = new Board(id, name.trim());
      obj.validate();
      boards.put(id, obj);
      System.out.println("[MultiplayerTictactoeMatchmakingService.createBoard] stored " + id + " count=" + boards.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Board getBoard(String id) {
    lock.lock();
    try {
      Board obj = boards.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Board id: " + id);
      }
      System.out.println("[MultiplayerTictactoeMatchmakingService.getBoard] found id=" + obj.getId());
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
      System.out.println("[MultiplayerTictactoeMatchmakingService.createPlayer] stored " + id + " count=" + players.size());
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
      System.out.println("[MultiplayerTictactoeMatchmakingService.getPlayer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Move createMove(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Move name required");
    }
    lock.lock();
    try {
      String id = String.format("MOV-%04d", seq++);
      Move obj = new Move(id, name.trim());
      obj.validate();
      moves.put(id, obj);
      System.out.println("[MultiplayerTictactoeMatchmakingService.createMove] stored " + id + " count=" + moves.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Move getMove(String id) {
    lock.lock();
    try {
      Move obj = moves.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Move id: " + id);
      }
      System.out.println("[MultiplayerTictactoeMatchmakingService.getMove] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public MatchmakingQueue closeMatchmakingQueue(String id) {
    lock.lock();
    try {
      MatchmakingQueue obj = matchmaking_queues.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown MatchmakingQueue id: " + id);
      }
      System.out.println("[MultiplayerTictactoeMatchmakingService.closeMatchmakingQueue] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<MatchmakingQueue> listActiveMatchmakingQueues() {
    lock.lock();
    try {
      List<MatchmakingQueue> out = new ArrayList<>();
      for (MatchmakingQueue o : matchmaking_queues.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[MultiplayerTictactoeMatchmakingService.listActiveMatchmakingQueues] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct MultiplayerTictactoeMatchmakingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    MultiplayerTictactoeMatchmakingService system = new MultiplayerTictactoeMatchmakingService();
    System.out.println("========== STEP 2: Create MatchmakingQueue objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    MatchmakingQueue first = system.createMatchmakingQueue("alpha-matchmaking_queue");
    system.createMatchmakingQueue("beta-matchmaking_queue");
    System.out.println("========== STEP 3: Create GameSession ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createGameSession("sample-game_session");
    System.out.println("========== STEP 4: Create Board ==========");
    system.createBoard("sample-board");
    System.out.println("========== STEP 5: Create Player ==========");
    system.createPlayer("sample-player");
    System.out.println("========== STEP 6: Create Move ==========");
    system.createMove("sample-move");
    System.out.println("========== Inspect active list ==========");
    system.listActiveMatchmakingQueues();
    System.out.println("========== Close first MatchmakingQueue ==========");
    system.closeMatchmakingQueue(first.getId());
    try {
      system.closeMatchmakingQueue(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getMatchmakingQueue("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class MatchmakingQueue {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('MatchmakingQueue.id required')
    }

    if (!name?.trim()) {
      throw new Error('MatchmakingQueue.name required')
    }
    console.log(\`[MatchmakingQueue.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`MatchmakingQueue \${this.id} invalid status\`)
    }
    console.log(\`[MatchmakingQueue.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`MatchmakingQueue \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[MatchmakingQueue.close] id=\${this.id} -> CLOSED\`)
  }
}


class GameSession {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('GameSession.id required')
    }

    if (!name?.trim()) {
      throw new Error('GameSession.name required')
    }
    console.log(\`[GameSession.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`GameSession \${this.id} invalid status\`)
    }
    console.log(\`[GameSession.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`GameSession \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[GameSession.close] id=\${this.id} -> CLOSED\`)
  }
}


class Board {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Board.id required')
    }

    if (!name?.trim()) {
      throw new Error('Board.name required')
    }
    console.log(\`[Board.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Board \${this.id} invalid status\`)
    }
    console.log(\`[Board.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Board \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Board.close] id=\${this.id} -> CLOSED\`)
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


class Move {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Move.id required')
    }

    if (!name?.trim()) {
      throw new Error('Move.name required')
    }
    console.log(\`[Move.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Move \${this.id} invalid status\`)
    }
    console.log(\`[Move.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Move \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Move.close] id=\${this.id} -> CLOSED\`)
  }
}

class MultiplayerTictactoeMatchmakingService {
  private seq = 1
  private matchmaking_queues = new Map<string, MatchmakingQueue>()
  private game_sessions = new Map<string, GameSession>()
  private boards = new Map<string, Board>()
  private players = new Map<string, Player>()
  private moves = new Map<string, Move>()
  constructor() {
    console.log('[MultiplayerTictactoeMatchmakingService.__init__] system ready')
  }

  createMatchmakingQueue(name: string): MatchmakingQueue {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('MatchmakingQueue name required')
    }
    const id = \`MAT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new MatchmakingQueue(id, cleaned)
    obj.validate()
    this.matchmaking_queues.set(id, obj)
    console.log(\`[MultiplayerTictactoeMatchmakingService.createMatchmakingQueue] stored \${id} count=\${this.matchmaking_queues.size}\`)
    return obj
  }

  getMatchmakingQueue(id: string): MatchmakingQueue {
    const obj = this.matchmaking_queues.get(id)
    if (!obj) {
      throw new Error(\`unknown MatchmakingQueue id: \${id}\`)
    }
    console.log(\`[MultiplayerTictactoeMatchmakingService.getMatchmakingQueue] found id=\${obj.id}\`)
    return obj
  }

  createGameSession(name: string): GameSession {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('GameSession name required')
    }
    const id = \`GAM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new GameSession(id, cleaned)
    obj.validate()
    this.game_sessions.set(id, obj)
    console.log(\`[MultiplayerTictactoeMatchmakingService.createGameSession] stored \${id} count=\${this.game_sessions.size}\`)
    return obj
  }

  getGameSession(id: string): GameSession {
    const obj = this.game_sessions.get(id)
    if (!obj) {
      throw new Error(\`unknown GameSession id: \${id}\`)
    }
    console.log(\`[MultiplayerTictactoeMatchmakingService.getGameSession] found id=\${obj.id}\`)
    return obj
  }

  createBoard(name: string): Board {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Board name required')
    }
    const id = \`BOA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Board(id, cleaned)
    obj.validate()
    this.boards.set(id, obj)
    console.log(\`[MultiplayerTictactoeMatchmakingService.createBoard] stored \${id} count=\${this.boards.size}\`)
    return obj
  }

  getBoard(id: string): Board {
    const obj = this.boards.get(id)
    if (!obj) {
      throw new Error(\`unknown Board id: \${id}\`)
    }
    console.log(\`[MultiplayerTictactoeMatchmakingService.getBoard] found id=\${obj.id}\`)
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
    console.log(\`[MultiplayerTictactoeMatchmakingService.createPlayer] stored \${id} count=\${this.players.size}\`)
    return obj
  }

  getPlayer(id: string): Player {
    const obj = this.players.get(id)
    if (!obj) {
      throw new Error(\`unknown Player id: \${id}\`)
    }
    console.log(\`[MultiplayerTictactoeMatchmakingService.getPlayer] found id=\${obj.id}\`)
    return obj
  }

  createMove(name: string): Move {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Move name required')
    }
    const id = \`MOV-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Move(id, cleaned)
    obj.validate()
    this.moves.set(id, obj)
    console.log(\`[MultiplayerTictactoeMatchmakingService.createMove] stored \${id} count=\${this.moves.size}\`)
    return obj
  }

  getMove(id: string): Move {
    const obj = this.moves.get(id)
    if (!obj) {
      throw new Error(\`unknown Move id: \${id}\`)
    }
    console.log(\`[MultiplayerTictactoeMatchmakingService.getMove] found id=\${obj.id}\`)
    return obj
  }

  closeMatchmakingQueue(id: string): MatchmakingQueue {
    const obj = this.getMatchmakingQueue(id)
    console.log(\`[MultiplayerTictactoeMatchmakingService.closeMatchmakingQueue] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveMatchmakingQueues(): MatchmakingQueue[] {
    const active = [...this.matchmaking_queues.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[MultiplayerTictactoeMatchmakingService.listActiveMatchmakingQueues] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct MultiplayerTictactoeMatchmakingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new MultiplayerTictactoeMatchmakingService()
  console.log('========== STEP 2: Create MatchmakingQueue objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createMatchmakingQueue('alpha-matchmaking_queue')
  system.createMatchmakingQueue('beta-matchmaking_queue')
  console.log('========== STEP 3: Create GameSession ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createGameSession('sample-game_session')
  console.log('========== STEP 4: Create Board ==========')
  system.createBoard('sample-board')
  console.log('========== STEP 5: Create Player ==========')
  system.createPlayer('sample-player')
  console.log('========== STEP 6: Create Move ==========')
  system.createMove('sample-move')
  system.listActiveMatchmakingQueues()
  console.log('========== Close first MatchmakingQueue ==========')
  system.closeMatchmakingQueue(first.id)
  try {
    system.closeMatchmakingQueue(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getMatchmakingQueue('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class MatchmakingQueue {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  MatchmakingQueue(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("MatchmakingQueue requires id and name");
    }
    cout << "[MatchmakingQueue.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("MatchmakingQueue invalid status");
    }
    cout << "[MatchmakingQueue.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("MatchmakingQueue cannot close");
    }
    status_ = "CLOSED";
    cout << "[MatchmakingQueue.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class GameSession {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  GameSession(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("GameSession requires id and name");
    }
    cout << "[GameSession.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("GameSession invalid status");
    }
    cout << "[GameSession.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("GameSession cannot close");
    }
    status_ = "CLOSED";
    cout << "[GameSession.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Board {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Board(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Board requires id and name");
    }
    cout << "[Board.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Board invalid status");
    }
    cout << "[Board.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Board cannot close");
    }
    status_ = "CLOSED";
    cout << "[Board.close] id=" << id_ << " -> CLOSED" << endl;
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


class Move {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Move(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Move requires id and name");
    }
    cout << "[Move.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Move invalid status");
    }
    cout << "[Move.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Move cannot close");
    }
    status_ = "CLOSED";
    cout << "[Move.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class MultiplayerTictactoeMatchmakingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, MatchmakingQueue> matchmaking_queues_;
  unordered_map<string, GameSession> game_sessions_;
  unordered_map<string, Board> boards_;
  unordered_map<string, Player> players_;
  unordered_map<string, Move> moves_;
public:
  MultiplayerTictactoeMatchmakingService() {
    cout << "[MultiplayerTictactoeMatchmakingService.__init__] system ready" << endl;
  }

  MatchmakingQueue createMatchmakingQueue(const string& name) {
    if (name.empty()) {
      throw invalid_argument("MatchmakingQueue name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MAT-%04d", seq_++);
    MatchmakingQueue obj{buf, name};
    obj.validate();
    matchmaking_queues_.emplace(obj.id(), obj);
    cout << "[MultiplayerTictactoeMatchmakingService.createMatchmakingQueue] stored " << obj.id() << endl;
    return obj;
  }

  MatchmakingQueue getMatchmakingQueue(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = matchmaking_queues_.find(id);
    if (it == matchmaking_queues_.end()) {
      throw out_of_range("unknown MatchmakingQueue id");
    }
    cout << "[MultiplayerTictactoeMatchmakingService.getMatchmakingQueue] found " << id << endl;
    return it->second;
  }

  GameSession createGameSession(const string& name) {
    if (name.empty()) {
      throw invalid_argument("GameSession name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "GAM-%04d", seq_++);
    GameSession obj{buf, name};
    obj.validate();
    game_sessions_.emplace(obj.id(), obj);
    cout << "[MultiplayerTictactoeMatchmakingService.createGameSession] stored " << obj.id() << endl;
    return obj;
  }

  GameSession getGameSession(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = game_sessions_.find(id);
    if (it == game_sessions_.end()) {
      throw out_of_range("unknown GameSession id");
    }
    cout << "[MultiplayerTictactoeMatchmakingService.getGameSession] found " << id << endl;
    return it->second;
  }

  Board createBoard(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Board name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BOA-%04d", seq_++);
    Board obj{buf, name};
    obj.validate();
    boards_.emplace(obj.id(), obj);
    cout << "[MultiplayerTictactoeMatchmakingService.createBoard] stored " << obj.id() << endl;
    return obj;
  }

  Board getBoard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = boards_.find(id);
    if (it == boards_.end()) {
      throw out_of_range("unknown Board id");
    }
    cout << "[MultiplayerTictactoeMatchmakingService.getBoard] found " << id << endl;
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
    cout << "[MultiplayerTictactoeMatchmakingService.createPlayer] stored " << obj.id() << endl;
    return obj;
  }

  Player getPlayer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = players_.find(id);
    if (it == players_.end()) {
      throw out_of_range("unknown Player id");
    }
    cout << "[MultiplayerTictactoeMatchmakingService.getPlayer] found " << id << endl;
    return it->second;
  }

  Move createMove(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Move name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MOV-%04d", seq_++);
    Move obj{buf, name};
    obj.validate();
    moves_.emplace(obj.id(), obj);
    cout << "[MultiplayerTictactoeMatchmakingService.createMove] stored " << obj.id() << endl;
    return obj;
  }

  Move getMove(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = moves_.find(id);
    if (it == moves_.end()) {
      throw out_of_range("unknown Move id");
    }
    cout << "[MultiplayerTictactoeMatchmakingService.getMove] found " << id << endl;
    return it->second;
  }

  MatchmakingQueue closeMatchmakingQueue(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = matchmaking_queues_.find(id);
    if (it == matchmaking_queues_.end()) {
      throw out_of_range("unknown MatchmakingQueue");
    }
    cout << "[MultiplayerTictactoeMatchmakingService.closeMatchmakingQueue] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct MultiplayerTictactoeMatchmakingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  MultiplayerTictactoeMatchmakingService system;
  cout << "========== STEP 2: Create MatchmakingQueue ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createMatchmakingQueue("alpha-matchmaking_queue");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createMatchmakingQueue("beta-matchmaking_queue");
  system.createGameSession("sample-game_session");
  system.createBoard("sample-board");
  system.createPlayer("sample-player");
  system.createMove("sample-move");
  system.closeMatchmakingQueue(first.id());
  try {
    system.closeMatchmakingQueue(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getMatchmakingQueue("MISSING-ID");
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

type MatchmakingQueue struct {
  ID     string
  Name   string
  Status string
}

func NewMatchmakingQueue(id, name string) (*MatchmakingQueue, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("MatchmakingQueue requires id and name")
  }
  obj := &MatchmakingQueue{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[MatchmakingQueue.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *MatchmakingQueue) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("MatchmakingQueue invalid status")
  }
  fmt.Printf("[MatchmakingQueue.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *MatchmakingQueue) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("MatchmakingQueue %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[MatchmakingQueue.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type GameSession struct {
  ID     string
  Name   string
  Status string
}

func NewGameSession(id, name string) (*GameSession, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("GameSession requires id and name")
  }
  obj := &GameSession{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[GameSession.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *GameSession) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("GameSession invalid status")
  }
  fmt.Printf("[GameSession.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *GameSession) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("GameSession %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[GameSession.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Board struct {
  ID     string
  Name   string
  Status string
}

func NewBoard(id, name string) (*Board, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Board requires id and name")
  }
  obj := &Board{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Board.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Board) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Board invalid status")
  }
  fmt.Printf("[Board.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Board) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Board %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Board.close] id=%s -> CLOSED\\n", o.ID)
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


type Move struct {
  ID     string
  Name   string
  Status string
}

func NewMove(id, name string) (*Move, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Move requires id and name")
  }
  obj := &Move{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Move.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Move) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Move invalid status")
  }
  fmt.Printf("[Move.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Move) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Move %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Move.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type MultiplayerTictactoeMatchmakingService struct {
  mu  sync.Mutex
  seq int
  matchmaking_queues map[string]*MatchmakingQueue
  game_sessions map[string]*GameSession
  boards map[string]*Board
  players map[string]*Player
  moves map[string]*Move
}

func NewMultiplayerTictactoeMatchmakingService() *MultiplayerTictactoeMatchmakingService {
  fmt.Println("[MultiplayerTictactoeMatchmakingService.__init__] system ready")
  return &MultiplayerTictactoeMatchmakingService{
    seq: 1,
    matchmaking_queues: map[string]*MatchmakingQueue{},
    game_sessions: map[string]*GameSession{},
    boards: map[string]*Board{},
    players: map[string]*Player{},
    moves: map[string]*Move{},
  }
}

func (s *MultiplayerTictactoeMatchmakingService) CreateMatchmakingQueue(name string) (*MatchmakingQueue, error) {
  if name == "" {
    return nil, fmt.Errorf("MatchmakingQueue name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MAT-%04d", s.seq)
  s.seq++
  obj, err := NewMatchmakingQueue(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.matchmaking_queues[id] = obj
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.CreateMatchmakingQueue] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) GetMatchmakingQueue(id string) (*MatchmakingQueue, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.matchmaking_queues[id]
  if !ok {
    return nil, fmt.Errorf("unknown MatchmakingQueue id: %s", id)
  }
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.GetMatchmakingQueue] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) CreateGameSession(name string) (*GameSession, error) {
  if name == "" {
    return nil, fmt.Errorf("GameSession name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("GAM-%04d", s.seq)
  s.seq++
  obj, err := NewGameSession(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.game_sessions[id] = obj
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.CreateGameSession] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) GetGameSession(id string) (*GameSession, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.game_sessions[id]
  if !ok {
    return nil, fmt.Errorf("unknown GameSession id: %s", id)
  }
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.GetGameSession] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) CreateBoard(name string) (*Board, error) {
  if name == "" {
    return nil, fmt.Errorf("Board name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BOA-%04d", s.seq)
  s.seq++
  obj, err := NewBoard(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.boards[id] = obj
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.CreateBoard] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) GetBoard(id string) (*Board, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.boards[id]
  if !ok {
    return nil, fmt.Errorf("unknown Board id: %s", id)
  }
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.GetBoard] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) CreatePlayer(name string) (*Player, error) {
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
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.CreatePlayer] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) GetPlayer(id string) (*Player, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.players[id]
  if !ok {
    return nil, fmt.Errorf("unknown Player id: %s", id)
  }
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.GetPlayer] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) CreateMove(name string) (*Move, error) {
  if name == "" {
    return nil, fmt.Errorf("Move name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MOV-%04d", s.seq)
  s.seq++
  obj, err := NewMove(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.moves[id] = obj
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.CreateMove] stored %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) GetMove(id string) (*Move, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.moves[id]
  if !ok {
    return nil, fmt.Errorf("unknown Move id: %s", id)
  }
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.GetMove] found %s\\n", id)
  return obj, nil
}

func (s *MultiplayerTictactoeMatchmakingService) CloseMatchmakingQueue(id string) (*MatchmakingQueue, error) {
  obj, err := s.GetMatchmakingQueue(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[MultiplayerTictactoeMatchmakingService.CloseMatchmakingQueue] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct MultiplayerTictactoeMatchmakingService ==========")
  system := NewMultiplayerTictactoeMatchmakingService()
  fmt.Println("========== STEP 2: Create MatchmakingQueue ==========")
  first, _ := system.CreateMatchmakingQueue("alpha-matchmaking_queue")
  system.CreateMatchmakingQueue("beta-matchmaking_queue")
  system.CreateGameSession("sample-game_session")
  system.CreateBoard("sample-board")
  system.CreatePlayer("sample-player")
  system.CreateMove("sample-move")
  system.CloseMatchmakingQueue(first.ID)
  if _, err := system.CloseMatchmakingQueue(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetMatchmakingQueue("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class MatchmakingQueue {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public MatchmakingQueue(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MatchmakingQueue requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[MatchmakingQueue.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("MatchmakingQueue invalid status");
    }
    Console.WriteLine("[MatchmakingQueue.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("MatchmakingQueue " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[MatchmakingQueue.close] id=" + Id + " -> CLOSED");
  }
}


sealed class GameSession {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public GameSession(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("GameSession requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[GameSession.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("GameSession invalid status");
    }
    Console.WriteLine("[GameSession.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("GameSession " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[GameSession.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Board {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Board(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Board requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Board.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Board invalid status");
    }
    Console.WriteLine("[Board.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Board " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Board.close] id=" + Id + " -> CLOSED");
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


sealed class Move {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Move(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Move requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Move.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Move invalid status");
    }
    Console.WriteLine("[Move.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Move " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Move.close] id=" + Id + " -> CLOSED");
  }
}

sealed class MultiplayerTictactoeMatchmakingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, MatchmakingQueue> _matchmaking_queues = new();
  private readonly Dictionary<string, GameSession> _game_sessions = new();
  private readonly Dictionary<string, Board> _boards = new();
  private readonly Dictionary<string, Player> _players = new();
  private readonly Dictionary<string, Move> _moves = new();
  public MultiplayerTictactoeMatchmakingService() {
    Console.WriteLine("[MultiplayerTictactoeMatchmakingService.__init__] system ready");
  }

  public MatchmakingQueue CreateMatchmakingQueue(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MatchmakingQueue name required");
    }
    lock (_gate) {
      var id = string.Format("MAT-{0:D4}", _seq++);
      var obj = new MatchmakingQueue(id, name.Trim());
      obj.Validate();
      _matchmaking_queues[id] = obj;
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.CreateMatchmakingQueue] stored " + id);
      return obj;
    }
  }

  public MatchmakingQueue GetMatchmakingQueue(string id) {
    lock (_gate) {
      if (!_matchmaking_queues.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown MatchmakingQueue id: " + id);
      }
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.GetMatchmakingQueue] found " + id);
      return obj;
    }
  }

  public GameSession CreateGameSession(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("GameSession name required");
    }
    lock (_gate) {
      var id = string.Format("GAM-{0:D4}", _seq++);
      var obj = new GameSession(id, name.Trim());
      obj.Validate();
      _game_sessions[id] = obj;
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.CreateGameSession] stored " + id);
      return obj;
    }
  }

  public GameSession GetGameSession(string id) {
    lock (_gate) {
      if (!_game_sessions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown GameSession id: " + id);
      }
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.GetGameSession] found " + id);
      return obj;
    }
  }

  public Board CreateBoard(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Board name required");
    }
    lock (_gate) {
      var id = string.Format("BOA-{0:D4}", _seq++);
      var obj = new Board(id, name.Trim());
      obj.Validate();
      _boards[id] = obj;
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.CreateBoard] stored " + id);
      return obj;
    }
  }

  public Board GetBoard(string id) {
    lock (_gate) {
      if (!_boards.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Board id: " + id);
      }
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.GetBoard] found " + id);
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
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.CreatePlayer] stored " + id);
      return obj;
    }
  }

  public Player GetPlayer(string id) {
    lock (_gate) {
      if (!_players.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Player id: " + id);
      }
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.GetPlayer] found " + id);
      return obj;
    }
  }

  public Move CreateMove(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Move name required");
    }
    lock (_gate) {
      var id = string.Format("MOV-{0:D4}", _seq++);
      var obj = new Move(id, name.Trim());
      obj.Validate();
      _moves[id] = obj;
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.CreateMove] stored " + id);
      return obj;
    }
  }

  public Move GetMove(string id) {
    lock (_gate) {
      if (!_moves.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Move id: " + id);
      }
      Console.WriteLine("[MultiplayerTictactoeMatchmakingService.GetMove] found " + id);
      return obj;
    }
  }

  public MatchmakingQueue CloseMatchmakingQueue(string id) {
    var obj = GetMatchmakingQueue(id);
    Console.WriteLine("[MultiplayerTictactoeMatchmakingService.CloseMatchmakingQueue] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct MultiplayerTictactoeMatchmakingService ==========");
    var system = new MultiplayerTictactoeMatchmakingService();
    Console.WriteLine("========== STEP 2: Create MatchmakingQueue ==========");
    var first = system.CreateMatchmakingQueue("alpha-matchmaking_queue");
    system.CreateMatchmakingQueue("beta-matchmaking_queue");
    system.CreateGameSession("sample-game_session");
    system.CreateBoard("sample-board");
    system.CreatePlayer("sample-player");
    system.CreateMove("sample-move");
    system.CloseMatchmakingQueue(first.Id);
    try {
      system.CloseMatchmakingQueue(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetMatchmakingQueue("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const multiplayerTictactoeMatchmakingSolution: ProblemSolution = {
  slug: 'multiplayer-tictactoe-matchmaking',
  title: 'Multiplayer Tic-Tac-Toe with Matchmaking - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a real-time multiplayer Tic-Tac-Toe game with matchmaking, live moves, and rematches. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Match two waiting players into a new game session',
      'Broadcast each move to both players in real time',
      'Validate moves server-side (correct turn, empty cell)',
      'Detect win, loss, and draw conditions',
      'Support a rematch request between the same two players',
      'Handle a player disconnecting mid-game',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Match two waiting players into a new game session?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Broadcast each move to both players in real time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Validate moves server-side (correct turn, empty cell)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Detect win, loss, and draw conditions?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support a rematch request between the same two players?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. MultiplayerTictactoeMatchmakingService is the facade stereotype. MatchmakingQueue, GameSession, Board, Player, Move are concrete domain classes with id/name/status and validate/close.',
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
          'Construct MultiplayerTictactoeMatchmakingService.',
          'createMatchmakingQueue twice and create the related UML classes.',
          'closeMatchmakingQueue once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'MultiplayerTictactoeMatchmakingService', responsibility: 'UML facade - orchestrates Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['create*', 'get*', 'closeMatchmakingQueue'] },
    { name: 'MatchmakingQueue', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'GameSession', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Board', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Move', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from MultiplayerTictactoeMatchmakingService to MatchmakingQueue, GameSession, Board, Player, Move. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on MultiplayerTictactoeMatchmakingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'MultiplayerTictactoeMatchmakingService', responsibility: 'UML facade - orchestrates Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['create*', 'get*', 'closeMatchmakingQueue'] },
    { name: 'MatchmakingQueue', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'GameSession', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Board', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Move', responsibility: 'UML class - domain object for Multiplayer Tic-Tac-Toe with Matchmaking.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'MultiplayerTictactoeMatchmakingService exposes create/get/close and owns composed collections.' },
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
      'main constructs MultiplayerTictactoeMatchmakingService, creates UML domain objects, closes the primary MatchmakingQueue, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct MultiplayerTictactoeMatchmakingService.',
      'createMatchmakingQueue for alpha and beta.',
      'create remaining UML classes.',
      'closeMatchmakingQueue(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createMatchmakingQueue("alpha..."); closeMatchmakingQueue(id)',
        output: '[MatchmakingQueue.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeMatchmakingQueue(alreadyClosed) or getMatchmakingQueue("MISSING-ID")',
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
