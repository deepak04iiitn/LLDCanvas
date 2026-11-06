import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'TicTacToeService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_games', 'Map<string, Game>'),
    attr('-', '_boards', 'Map<string, Board>'),
    attr('-', '_players', 'Map<string, Player>'),
    attr('-', '_moves', 'Map<string, Move>'),
    attr('-', '_symbols', 'Map<string, Symbol>'),
  ], [
    method('+', 'createGame', 'name: string', 'Game'),
    method('+', 'createBoard', 'name: string', 'Board'),
    method('+', 'createPlayer', 'name: string', 'Player'),
    method('+', 'createMove', 'name: string', 'Move'),
    method('+', 'createSymbol', 'name: string', 'Symbol'),
    method('+', 'getGame', 'id: string', 'Game'),
    method('+', 'getBoard', 'id: string', 'Board'),
    method('+', 'getPlayer', 'id: string', 'Player'),
    method('+', 'getMove', 'id: string', 'Move'),
    method('+', 'getSymbol', 'id: string', 'Symbol'),
    method('+', 'closeGame', 'id: string', 'Game'),
  ], 'facade'),
  cls('n1', 'Game', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Board', GRID.x(2), GRID.y(0), [
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
  cls('n4', 'Move', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Symbol', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("tic-tac-toe")


class Game:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Game.id is required")
        if not name or not name.strip():
            raise ValueError("Game.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Game.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Game {self.id} has invalid status={self.status}")
        log.info("[Game.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Game {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Game.close] id=%s -> CLOSED", self.id)


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


class Symbol:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Symbol.id is required")
        if not name or not name.strip():
            raise ValueError("Symbol.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Symbol.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Symbol {self.id} has invalid status={self.status}")
        log.info("[Symbol.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Symbol {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Symbol.close] id=%s -> CLOSED", self.id)


class TicTacToeService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._games: Dict[str, Game] = {}
        self._boards: Dict[str, Board] = {}
        self._players: Dict[str, Player] = {}
        self._moves: Dict[str, Move] = {}
        self._symbols: Dict[str, Symbol] = {}
        log.info("[TicTacToeService.__init__] system ready; managing: Game, Board, Player, Move, Symbol")

    def create_game(self, name: str) -> Game:
        """UML: TicTacToeService.create_game(name) -> Game"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Game name is required")
        with self._lock:
            item_id = f"GAM-{self._seq:04d}"
            self._seq += 1
            obj = Game(item_id, cleaned)
            obj.validate()
            self._games[item_id] = obj
            log.info("[TicTacToeService.create_game] stored %s in _games (count=%s)", item_id, len(self._games))
            return obj

    def get_game(self, item_id: str) -> Game:
        with self._lock:
            obj = self._games.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Game id: {item_id}")
            log.info("[TicTacToeService.get_game] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_board(self, name: str) -> Board:
        """UML: TicTacToeService.create_board(name) -> Board"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Board name is required")
        with self._lock:
            item_id = f"BOA-{self._seq:04d}"
            self._seq += 1
            obj = Board(item_id, cleaned)
            obj.validate()
            self._boards[item_id] = obj
            log.info("[TicTacToeService.create_board] stored %s in _boards (count=%s)", item_id, len(self._boards))
            return obj

    def get_board(self, item_id: str) -> Board:
        with self._lock:
            obj = self._boards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Board id: {item_id}")
            log.info("[TicTacToeService.get_board] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_player(self, name: str) -> Player:
        """UML: TicTacToeService.create_player(name) -> Player"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Player name is required")
        with self._lock:
            item_id = f"PLA-{self._seq:04d}"
            self._seq += 1
            obj = Player(item_id, cleaned)
            obj.validate()
            self._players[item_id] = obj
            log.info("[TicTacToeService.create_player] stored %s in _players (count=%s)", item_id, len(self._players))
            return obj

    def get_player(self, item_id: str) -> Player:
        with self._lock:
            obj = self._players.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Player id: {item_id}")
            log.info("[TicTacToeService.get_player] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_move(self, name: str) -> Move:
        """UML: TicTacToeService.create_move(name) -> Move"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Move name is required")
        with self._lock:
            item_id = f"MOV-{self._seq:04d}"
            self._seq += 1
            obj = Move(item_id, cleaned)
            obj.validate()
            self._moves[item_id] = obj
            log.info("[TicTacToeService.create_move] stored %s in _moves (count=%s)", item_id, len(self._moves))
            return obj

    def get_move(self, item_id: str) -> Move:
        with self._lock:
            obj = self._moves.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Move id: {item_id}")
            log.info("[TicTacToeService.get_move] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_symbol(self, name: str) -> Symbol:
        """UML: TicTacToeService.create_symbol(name) -> Symbol"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Symbol name is required")
        with self._lock:
            item_id = f"SYM-{self._seq:04d}"
            self._seq += 1
            obj = Symbol(item_id, cleaned)
            obj.validate()
            self._symbols[item_id] = obj
            log.info("[TicTacToeService.create_symbol] stored %s in _symbols (count=%s)", item_id, len(self._symbols))
            return obj

    def get_symbol(self, item_id: str) -> Symbol:
        with self._lock:
            obj = self._symbols.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Symbol id: {item_id}")
            log.info("[TicTacToeService.get_symbol] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_game(self, item_id: str) -> Game:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._games.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Game id: {item_id}")
            log.info("[TicTacToeService.close_game] closing %s via Game.close()", item_id)
            obj.close()
            return obj

    def list_active_games(self) -> List[Game]:
        with self._lock:
            active = [o for o in self._games.values() if o.status == "ACTIVE"]
            log.info("[TicTacToeService.list_active_games] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct TicTacToeService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = TicTacToeService()

    log.info("========== STEP 2: Create primary Game objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_game("alpha-game")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_game("beta-game")

    log.info("========== STEP 3: Create Board (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_board("sample-board")

    log.info("========== STEP 4: Create Player (UML class) ==========")
    system.create_player("sample-player")

    log.info("========== STEP 5: Create Move (UML class) ==========")
    system.create_move("sample-move")

    log.info("========== STEP 6: Create Symbol (UML class) ==========")
    system.create_symbol("sample-symbol")

    log.info("========== STEP 7: Inspect active Game list ==========")
    system.list_active_games()

    log.info("========== STEP 8: Close first Game ==========")
    system.close_game(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_game(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Game.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_game("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_game: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_games()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Game {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Game(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Game.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Game.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Game.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Game " + id + " invalid status");
    }
    System.out.println("[Game.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Game " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Game.close] id=" + id + " -> CLOSED");
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


class Symbol {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Symbol(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Symbol.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Symbol.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Symbol.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Symbol " + id + " invalid status");
    }
    System.out.println("[Symbol.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Symbol " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Symbol.close] id=" + id + " -> CLOSED");
  }
}

public class TicTacToeService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Game> games = new LinkedHashMap<>();
  private final Map<String, Board> boards = new LinkedHashMap<>();
  private final Map<String, Player> players = new LinkedHashMap<>();
  private final Map<String, Move> moves = new LinkedHashMap<>();
  private final Map<String, Symbol> symbols = new LinkedHashMap<>();

  public TicTacToeService() {
    System.out.println("[TicTacToeService.__init__] system ready");
  }

  public Game createGame(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Game name required");
    }
    lock.lock();
    try {
      String id = String.format("GAM-%04d", seq++);
      Game obj = new Game(id, name.trim());
      obj.validate();
      games.put(id, obj);
      System.out.println("[TicTacToeService.createGame] stored " + id + " count=" + games.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Game getGame(String id) {
    lock.lock();
    try {
      Game obj = games.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Game id: " + id);
      }
      System.out.println("[TicTacToeService.getGame] found id=" + obj.getId());
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
      System.out.println("[TicTacToeService.createBoard] stored " + id + " count=" + boards.size());
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
      System.out.println("[TicTacToeService.getBoard] found id=" + obj.getId());
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
      System.out.println("[TicTacToeService.createPlayer] stored " + id + " count=" + players.size());
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
      System.out.println("[TicTacToeService.getPlayer] found id=" + obj.getId());
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
      System.out.println("[TicTacToeService.createMove] stored " + id + " count=" + moves.size());
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
      System.out.println("[TicTacToeService.getMove] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Symbol createSymbol(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Symbol name required");
    }
    lock.lock();
    try {
      String id = String.format("SYM-%04d", seq++);
      Symbol obj = new Symbol(id, name.trim());
      obj.validate();
      symbols.put(id, obj);
      System.out.println("[TicTacToeService.createSymbol] stored " + id + " count=" + symbols.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Symbol getSymbol(String id) {
    lock.lock();
    try {
      Symbol obj = symbols.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Symbol id: " + id);
      }
      System.out.println("[TicTacToeService.getSymbol] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Game closeGame(String id) {
    lock.lock();
    try {
      Game obj = games.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Game id: " + id);
      }
      System.out.println("[TicTacToeService.closeGame] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Game> listActiveGames() {
    lock.lock();
    try {
      List<Game> out = new ArrayList<>();
      for (Game o : games.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[TicTacToeService.listActiveGames] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct TicTacToeService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    TicTacToeService system = new TicTacToeService();
    System.out.println("========== STEP 2: Create Game objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Game first = system.createGame("alpha-game");
    system.createGame("beta-game");
    System.out.println("========== STEP 3: Create Board ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createBoard("sample-board");
    System.out.println("========== STEP 4: Create Player ==========");
    system.createPlayer("sample-player");
    System.out.println("========== STEP 5: Create Move ==========");
    system.createMove("sample-move");
    System.out.println("========== STEP 6: Create Symbol ==========");
    system.createSymbol("sample-symbol");
    System.out.println("========== Inspect active list ==========");
    system.listActiveGames();
    System.out.println("========== Close first Game ==========");
    system.closeGame(first.getId());
    try {
      system.closeGame(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getGame("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Game {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Game.id required')
    }

    if (!name?.trim()) {
      throw new Error('Game.name required')
    }
    console.log(\`[Game.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Game \${this.id} invalid status\`)
    }
    console.log(\`[Game.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Game \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Game.close] id=\${this.id} -> CLOSED\`)
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


class Symbol {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Symbol.id required')
    }

    if (!name?.trim()) {
      throw new Error('Symbol.name required')
    }
    console.log(\`[Symbol.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Symbol \${this.id} invalid status\`)
    }
    console.log(\`[Symbol.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Symbol \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Symbol.close] id=\${this.id} -> CLOSED\`)
  }
}

class TicTacToeService {
  private seq = 1
  private games = new Map<string, Game>()
  private boards = new Map<string, Board>()
  private players = new Map<string, Player>()
  private moves = new Map<string, Move>()
  private symbols = new Map<string, Symbol>()
  constructor() {
    console.log('[TicTacToeService.__init__] system ready')
  }

  createGame(name: string): Game {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Game name required')
    }
    const id = \`GAM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Game(id, cleaned)
    obj.validate()
    this.games.set(id, obj)
    console.log(\`[TicTacToeService.createGame] stored \${id} count=\${this.games.size}\`)
    return obj
  }

  getGame(id: string): Game {
    const obj = this.games.get(id)
    if (!obj) {
      throw new Error(\`unknown Game id: \${id}\`)
    }
    console.log(\`[TicTacToeService.getGame] found id=\${obj.id}\`)
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
    console.log(\`[TicTacToeService.createBoard] stored \${id} count=\${this.boards.size}\`)
    return obj
  }

  getBoard(id: string): Board {
    const obj = this.boards.get(id)
    if (!obj) {
      throw new Error(\`unknown Board id: \${id}\`)
    }
    console.log(\`[TicTacToeService.getBoard] found id=\${obj.id}\`)
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
    console.log(\`[TicTacToeService.createPlayer] stored \${id} count=\${this.players.size}\`)
    return obj
  }

  getPlayer(id: string): Player {
    const obj = this.players.get(id)
    if (!obj) {
      throw new Error(\`unknown Player id: \${id}\`)
    }
    console.log(\`[TicTacToeService.getPlayer] found id=\${obj.id}\`)
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
    console.log(\`[TicTacToeService.createMove] stored \${id} count=\${this.moves.size}\`)
    return obj
  }

  getMove(id: string): Move {
    const obj = this.moves.get(id)
    if (!obj) {
      throw new Error(\`unknown Move id: \${id}\`)
    }
    console.log(\`[TicTacToeService.getMove] found id=\${obj.id}\`)
    return obj
  }

  createSymbol(name: string): Symbol {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Symbol name required')
    }
    const id = \`SYM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Symbol(id, cleaned)
    obj.validate()
    this.symbols.set(id, obj)
    console.log(\`[TicTacToeService.createSymbol] stored \${id} count=\${this.symbols.size}\`)
    return obj
  }

  getSymbol(id: string): Symbol {
    const obj = this.symbols.get(id)
    if (!obj) {
      throw new Error(\`unknown Symbol id: \${id}\`)
    }
    console.log(\`[TicTacToeService.getSymbol] found id=\${obj.id}\`)
    return obj
  }

  closeGame(id: string): Game {
    const obj = this.getGame(id)
    console.log(\`[TicTacToeService.closeGame] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveGames(): Game[] {
    const active = [...this.games.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[TicTacToeService.listActiveGames] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct TicTacToeService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new TicTacToeService()
  console.log('========== STEP 2: Create Game objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createGame('alpha-game')
  system.createGame('beta-game')
  console.log('========== STEP 3: Create Board ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createBoard('sample-board')
  console.log('========== STEP 4: Create Player ==========')
  system.createPlayer('sample-player')
  console.log('========== STEP 5: Create Move ==========')
  system.createMove('sample-move')
  console.log('========== STEP 6: Create Symbol ==========')
  system.createSymbol('sample-symbol')
  system.listActiveGames()
  console.log('========== Close first Game ==========')
  system.closeGame(first.id)
  try {
    system.closeGame(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getGame('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Game {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Game(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Game requires id and name");
    }
    cout << "[Game.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Game invalid status");
    }
    cout << "[Game.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Game cannot close");
    }
    status_ = "CLOSED";
    cout << "[Game.close] id=" << id_ << " -> CLOSED" << endl;
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


class Symbol {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Symbol(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Symbol requires id and name");
    }
    cout << "[Symbol.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Symbol invalid status");
    }
    cout << "[Symbol.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Symbol cannot close");
    }
    status_ = "CLOSED";
    cout << "[Symbol.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class TicTacToeService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Game> games_;
  unordered_map<string, Board> boards_;
  unordered_map<string, Player> players_;
  unordered_map<string, Move> moves_;
  unordered_map<string, Symbol> symbols_;
public:
  TicTacToeService() {
    cout << "[TicTacToeService.__init__] system ready" << endl;
  }

  Game createGame(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Game name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "GAM-%04d", seq_++);
    Game obj{buf, name};
    obj.validate();
    games_.emplace(obj.id(), obj);
    cout << "[TicTacToeService.createGame] stored " << obj.id() << endl;
    return obj;
  }

  Game getGame(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = games_.find(id);
    if (it == games_.end()) {
      throw out_of_range("unknown Game id");
    }
    cout << "[TicTacToeService.getGame] found " << id << endl;
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
    cout << "[TicTacToeService.createBoard] stored " << obj.id() << endl;
    return obj;
  }

  Board getBoard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = boards_.find(id);
    if (it == boards_.end()) {
      throw out_of_range("unknown Board id");
    }
    cout << "[TicTacToeService.getBoard] found " << id << endl;
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
    cout << "[TicTacToeService.createPlayer] stored " << obj.id() << endl;
    return obj;
  }

  Player getPlayer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = players_.find(id);
    if (it == players_.end()) {
      throw out_of_range("unknown Player id");
    }
    cout << "[TicTacToeService.getPlayer] found " << id << endl;
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
    cout << "[TicTacToeService.createMove] stored " << obj.id() << endl;
    return obj;
  }

  Move getMove(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = moves_.find(id);
    if (it == moves_.end()) {
      throw out_of_range("unknown Move id");
    }
    cout << "[TicTacToeService.getMove] found " << id << endl;
    return it->second;
  }

  Symbol createSymbol(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Symbol name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SYM-%04d", seq_++);
    Symbol obj{buf, name};
    obj.validate();
    symbols_.emplace(obj.id(), obj);
    cout << "[TicTacToeService.createSymbol] stored " << obj.id() << endl;
    return obj;
  }

  Symbol getSymbol(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = symbols_.find(id);
    if (it == symbols_.end()) {
      throw out_of_range("unknown Symbol id");
    }
    cout << "[TicTacToeService.getSymbol] found " << id << endl;
    return it->second;
  }

  Game closeGame(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = games_.find(id);
    if (it == games_.end()) {
      throw out_of_range("unknown Game");
    }
    cout << "[TicTacToeService.closeGame] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct TicTacToeService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  TicTacToeService system;
  cout << "========== STEP 2: Create Game ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createGame("alpha-game");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createGame("beta-game");
  system.createBoard("sample-board");
  system.createPlayer("sample-player");
  system.createMove("sample-move");
  system.createSymbol("sample-symbol");
  system.closeGame(first.id());
  try {
    system.closeGame(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getGame("MISSING-ID");
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

type Game struct {
  ID     string
  Name   string
  Status string
}

func NewGame(id, name string) (*Game, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Game requires id and name")
  }
  obj := &Game{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Game.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Game) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Game invalid status")
  }
  fmt.Printf("[Game.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Game) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Game %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Game.close] id=%s -> CLOSED\\n", o.ID)
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


type Symbol struct {
  ID     string
  Name   string
  Status string
}

func NewSymbol(id, name string) (*Symbol, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Symbol requires id and name")
  }
  obj := &Symbol{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Symbol.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Symbol) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Symbol invalid status")
  }
  fmt.Printf("[Symbol.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Symbol) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Symbol %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Symbol.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type TicTacToeService struct {
  mu  sync.Mutex
  seq int
  games map[string]*Game
  boards map[string]*Board
  players map[string]*Player
  moves map[string]*Move
  symbols map[string]*Symbol
}

func NewTicTacToeService() *TicTacToeService {
  fmt.Println("[TicTacToeService.__init__] system ready")
  return &TicTacToeService{
    seq: 1,
    games: map[string]*Game{},
    boards: map[string]*Board{},
    players: map[string]*Player{},
    moves: map[string]*Move{},
    symbols: map[string]*Symbol{},
  }
}

func (s *TicTacToeService) CreateGame(name string) (*Game, error) {
  if name == "" {
    return nil, fmt.Errorf("Game name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("GAM-%04d", s.seq)
  s.seq++
  obj, err := NewGame(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.games[id] = obj
  fmt.Printf("[TicTacToeService.CreateGame] stored %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) GetGame(id string) (*Game, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.games[id]
  if !ok {
    return nil, fmt.Errorf("unknown Game id: %s", id)
  }
  fmt.Printf("[TicTacToeService.GetGame] found %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) CreateBoard(name string) (*Board, error) {
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
  fmt.Printf("[TicTacToeService.CreateBoard] stored %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) GetBoard(id string) (*Board, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.boards[id]
  if !ok {
    return nil, fmt.Errorf("unknown Board id: %s", id)
  }
  fmt.Printf("[TicTacToeService.GetBoard] found %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) CreatePlayer(name string) (*Player, error) {
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
  fmt.Printf("[TicTacToeService.CreatePlayer] stored %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) GetPlayer(id string) (*Player, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.players[id]
  if !ok {
    return nil, fmt.Errorf("unknown Player id: %s", id)
  }
  fmt.Printf("[TicTacToeService.GetPlayer] found %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) CreateMove(name string) (*Move, error) {
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
  fmt.Printf("[TicTacToeService.CreateMove] stored %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) GetMove(id string) (*Move, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.moves[id]
  if !ok {
    return nil, fmt.Errorf("unknown Move id: %s", id)
  }
  fmt.Printf("[TicTacToeService.GetMove] found %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) CreateSymbol(name string) (*Symbol, error) {
  if name == "" {
    return nil, fmt.Errorf("Symbol name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SYM-%04d", s.seq)
  s.seq++
  obj, err := NewSymbol(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.symbols[id] = obj
  fmt.Printf("[TicTacToeService.CreateSymbol] stored %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) GetSymbol(id string) (*Symbol, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.symbols[id]
  if !ok {
    return nil, fmt.Errorf("unknown Symbol id: %s", id)
  }
  fmt.Printf("[TicTacToeService.GetSymbol] found %s\\n", id)
  return obj, nil
}

func (s *TicTacToeService) CloseGame(id string) (*Game, error) {
  obj, err := s.GetGame(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[TicTacToeService.CloseGame] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct TicTacToeService ==========")
  system := NewTicTacToeService()
  fmt.Println("========== STEP 2: Create Game ==========")
  first, _ := system.CreateGame("alpha-game")
  system.CreateGame("beta-game")
  system.CreateBoard("sample-board")
  system.CreatePlayer("sample-player")
  system.CreateMove("sample-move")
  system.CreateSymbol("sample-symbol")
  system.CloseGame(first.ID)
  if _, err := system.CloseGame(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetGame("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Game {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Game(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Game requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Game.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Game invalid status");
    }
    Console.WriteLine("[Game.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Game " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Game.close] id=" + Id + " -> CLOSED");
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


sealed class Symbol {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Symbol(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Symbol requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Symbol.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Symbol invalid status");
    }
    Console.WriteLine("[Symbol.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Symbol " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Symbol.close] id=" + Id + " -> CLOSED");
  }
}

sealed class TicTacToeService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Game> _games = new();
  private readonly Dictionary<string, Board> _boards = new();
  private readonly Dictionary<string, Player> _players = new();
  private readonly Dictionary<string, Move> _moves = new();
  private readonly Dictionary<string, Symbol> _symbols = new();
  public TicTacToeService() {
    Console.WriteLine("[TicTacToeService.__init__] system ready");
  }

  public Game CreateGame(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Game name required");
    }
    lock (_gate) {
      var id = string.Format("GAM-{0:D4}", _seq++);
      var obj = new Game(id, name.Trim());
      obj.Validate();
      _games[id] = obj;
      Console.WriteLine("[TicTacToeService.CreateGame] stored " + id);
      return obj;
    }
  }

  public Game GetGame(string id) {
    lock (_gate) {
      if (!_games.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Game id: " + id);
      }
      Console.WriteLine("[TicTacToeService.GetGame] found " + id);
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
      Console.WriteLine("[TicTacToeService.CreateBoard] stored " + id);
      return obj;
    }
  }

  public Board GetBoard(string id) {
    lock (_gate) {
      if (!_boards.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Board id: " + id);
      }
      Console.WriteLine("[TicTacToeService.GetBoard] found " + id);
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
      Console.WriteLine("[TicTacToeService.CreatePlayer] stored " + id);
      return obj;
    }
  }

  public Player GetPlayer(string id) {
    lock (_gate) {
      if (!_players.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Player id: " + id);
      }
      Console.WriteLine("[TicTacToeService.GetPlayer] found " + id);
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
      Console.WriteLine("[TicTacToeService.CreateMove] stored " + id);
      return obj;
    }
  }

  public Move GetMove(string id) {
    lock (_gate) {
      if (!_moves.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Move id: " + id);
      }
      Console.WriteLine("[TicTacToeService.GetMove] found " + id);
      return obj;
    }
  }

  public Symbol CreateSymbol(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Symbol name required");
    }
    lock (_gate) {
      var id = string.Format("SYM-{0:D4}", _seq++);
      var obj = new Symbol(id, name.Trim());
      obj.Validate();
      _symbols[id] = obj;
      Console.WriteLine("[TicTacToeService.CreateSymbol] stored " + id);
      return obj;
    }
  }

  public Symbol GetSymbol(string id) {
    lock (_gate) {
      if (!_symbols.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Symbol id: " + id);
      }
      Console.WriteLine("[TicTacToeService.GetSymbol] found " + id);
      return obj;
    }
  }

  public Game CloseGame(string id) {
    var obj = GetGame(id);
    Console.WriteLine("[TicTacToeService.CloseGame] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct TicTacToeService ==========");
    var system = new TicTacToeService();
    Console.WriteLine("========== STEP 2: Create Game ==========");
    var first = system.CreateGame("alpha-game");
    system.CreateGame("beta-game");
    system.CreateBoard("sample-board");
    system.CreatePlayer("sample-player");
    system.CreateMove("sample-move");
    system.CreateSymbol("sample-symbol");
    system.CloseGame(first.Id);
    try {
      system.CloseGame(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetGame("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const ticTacToeSolution: ProblemSolution = {
  slug: 'tic-tac-toe',
  title: 'Tic-Tac-Toe - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a Tic-Tac-Toe game supporting human vs human, human vs AI, and board of configurable size. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Support N×N board (not just 3×3)',
      'Two players take turns placing their symbol',
      'Detect win by row, column, or diagonal',
      'Detect draw when board is full with no winner',
      'Support both Human vs Human and Human vs AI modes',
      'AI should play optimally using Minimax algorithm',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Support N×N board (not just 3×3)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Two players take turns placing their symbol?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Detect win by row, column, or diagonal?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Detect draw when board is full with no winner?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support both Human vs Human and Human vs AI modes?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. TicTacToeService is the facade stereotype. Game, Board, Player, Move, Symbol are concrete domain classes with id/name/status and validate/close.',
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
          'Construct TicTacToeService.',
          'createGame twice and create the related UML classes.',
          'closeGame once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'TicTacToeService', responsibility: 'UML facade - orchestrates Tic-Tac-Toe.', keyMembers: ['create*', 'get*', 'closeGame'] },
    { name: 'Game', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Board', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Move', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Symbol', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from TicTacToeService to Game, Board, Player, Move, Symbol. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on TicTacToeService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'TicTacToeService', responsibility: 'UML facade - orchestrates Tic-Tac-Toe.', keyMembers: ['create*', 'get*', 'closeGame'] },
    { name: 'Game', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Board', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Move', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Symbol', responsibility: 'UML class - domain object for Tic-Tac-Toe.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'TicTacToeService exposes create/get/close and owns composed collections.' },
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
      'main constructs TicTacToeService, creates UML domain objects, closes the primary Game, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct TicTacToeService.',
      'createGame for alpha and beta.',
      'create remaining UML classes.',
      'closeGame(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createGame("alpha..."); closeGame(id)',
        output: '[Game.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeGame(alreadyClosed) or getGame("MISSING-ID")',
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
