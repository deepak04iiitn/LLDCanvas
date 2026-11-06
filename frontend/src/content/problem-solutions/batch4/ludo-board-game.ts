import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'LudoBoardGameService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_boards', 'Map<string, Board>'),
    attr('-', '_players', 'Map<string, Player>'),
    attr('-', '_tokens', 'Map<string, Token>'),
    attr('-', '_cells', 'Map<string, Cell>'),
    attr('-', '_dices', 'Map<string, Dice>'),
  ], [
    method('+', 'createBoard', 'name: string', 'Board'),
    method('+', 'createPlayer', 'name: string', 'Player'),
    method('+', 'createToken', 'name: string', 'Token'),
    method('+', 'createCell', 'name: string', 'Cell'),
    method('+', 'createDice', 'name: string', 'Dice'),
    method('+', 'getBoard', 'id: string', 'Board'),
    method('+', 'getPlayer', 'id: string', 'Player'),
    method('+', 'getToken', 'id: string', 'Token'),
    method('+', 'getCell', 'id: string', 'Cell'),
    method('+', 'getDice', 'id: string', 'Dice'),
    method('+', 'closeBoard', 'id: string', 'Board'),
  ], 'facade'),
  cls('n1', 'Board', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Player', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Token', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Cell', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Dice', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("ludo-board-game")


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


class Token:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Token.id is required")
        if not name or not name.strip():
            raise ValueError("Token.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Token.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Token {self.id} has invalid status={self.status}")
        log.info("[Token.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Token {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Token.close] id=%s -> CLOSED", self.id)


class Cell:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Cell.id is required")
        if not name or not name.strip():
            raise ValueError("Cell.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Cell.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Cell {self.id} has invalid status={self.status}")
        log.info("[Cell.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Cell {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Cell.close] id=%s -> CLOSED", self.id)


class Dice:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Dice.id is required")
        if not name or not name.strip():
            raise ValueError("Dice.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Dice.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Dice {self.id} has invalid status={self.status}")
        log.info("[Dice.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Dice {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Dice.close] id=%s -> CLOSED", self.id)


class LudoBoardGameService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._boards: Dict[str, Board] = {}
        self._players: Dict[str, Player] = {}
        self._tokens: Dict[str, Token] = {}
        self._cells: Dict[str, Cell] = {}
        self._dices: Dict[str, Dice] = {}
        log.info("[LudoBoardGameService.__init__] system ready; managing: Board, Player, Token, Cell, Dice")

    def create_board(self, name: str) -> Board:
        """UML: LudoBoardGameService.create_board(name) -> Board"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Board name is required")
        with self._lock:
            item_id = f"BOA-{self._seq:04d}"
            self._seq += 1
            obj = Board(item_id, cleaned)
            obj.validate()
            self._boards[item_id] = obj
            log.info("[LudoBoardGameService.create_board] stored %s in _boards (count=%s)", item_id, len(self._boards))
            return obj

    def get_board(self, item_id: str) -> Board:
        with self._lock:
            obj = self._boards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Board id: {item_id}")
            log.info("[LudoBoardGameService.get_board] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_player(self, name: str) -> Player:
        """UML: LudoBoardGameService.create_player(name) -> Player"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Player name is required")
        with self._lock:
            item_id = f"PLA-{self._seq:04d}"
            self._seq += 1
            obj = Player(item_id, cleaned)
            obj.validate()
            self._players[item_id] = obj
            log.info("[LudoBoardGameService.create_player] stored %s in _players (count=%s)", item_id, len(self._players))
            return obj

    def get_player(self, item_id: str) -> Player:
        with self._lock:
            obj = self._players.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Player id: {item_id}")
            log.info("[LudoBoardGameService.get_player] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_token(self, name: str) -> Token:
        """UML: LudoBoardGameService.create_token(name) -> Token"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Token name is required")
        with self._lock:
            item_id = f"TOK-{self._seq:04d}"
            self._seq += 1
            obj = Token(item_id, cleaned)
            obj.validate()
            self._tokens[item_id] = obj
            log.info("[LudoBoardGameService.create_token] stored %s in _tokens (count=%s)", item_id, len(self._tokens))
            return obj

    def get_token(self, item_id: str) -> Token:
        with self._lock:
            obj = self._tokens.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Token id: {item_id}")
            log.info("[LudoBoardGameService.get_token] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_cell(self, name: str) -> Cell:
        """UML: LudoBoardGameService.create_cell(name) -> Cell"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Cell name is required")
        with self._lock:
            item_id = f"CEL-{self._seq:04d}"
            self._seq += 1
            obj = Cell(item_id, cleaned)
            obj.validate()
            self._cells[item_id] = obj
            log.info("[LudoBoardGameService.create_cell] stored %s in _cells (count=%s)", item_id, len(self._cells))
            return obj

    def get_cell(self, item_id: str) -> Cell:
        with self._lock:
            obj = self._cells.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Cell id: {item_id}")
            log.info("[LudoBoardGameService.get_cell] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_dice(self, name: str) -> Dice:
        """UML: LudoBoardGameService.create_dice(name) -> Dice"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Dice name is required")
        with self._lock:
            item_id = f"DIC-{self._seq:04d}"
            self._seq += 1
            obj = Dice(item_id, cleaned)
            obj.validate()
            self._dices[item_id] = obj
            log.info("[LudoBoardGameService.create_dice] stored %s in _dices (count=%s)", item_id, len(self._dices))
            return obj

    def get_dice(self, item_id: str) -> Dice:
        with self._lock:
            obj = self._dices.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Dice id: {item_id}")
            log.info("[LudoBoardGameService.get_dice] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_board(self, item_id: str) -> Board:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._boards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Board id: {item_id}")
            log.info("[LudoBoardGameService.close_board] closing %s via Board.close()", item_id)
            obj.close()
            return obj

    def list_active_boards(self) -> List[Board]:
        with self._lock:
            active = [o for o in self._boards.values() if o.status == "ACTIVE"]
            log.info("[LudoBoardGameService.list_active_boards] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct LudoBoardGameService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = LudoBoardGameService()

    log.info("========== STEP 2: Create primary Board objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_board("alpha-board")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_board("beta-board")

    log.info("========== STEP 3: Create Player (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_player("sample-player")

    log.info("========== STEP 4: Create Token (UML class) ==========")
    system.create_token("sample-token")

    log.info("========== STEP 5: Create Cell (UML class) ==========")
    system.create_cell("sample-cell")

    log.info("========== STEP 6: Create Dice (UML class) ==========")
    system.create_dice("sample-dice")

    log.info("========== STEP 7: Inspect active Board list ==========")
    system.list_active_boards()

    log.info("========== STEP 8: Close first Board ==========")
    system.close_board(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_board(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Board.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_board("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_board: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_boards()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

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


class Token {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Token(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Token.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Token.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Token.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Token " + id + " invalid status");
    }
    System.out.println("[Token.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Token " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Token.close] id=" + id + " -> CLOSED");
  }
}


class Cell {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Cell(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Cell.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Cell.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Cell.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Cell " + id + " invalid status");
    }
    System.out.println("[Cell.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Cell " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Cell.close] id=" + id + " -> CLOSED");
  }
}


class Dice {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Dice(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Dice.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Dice.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Dice.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Dice " + id + " invalid status");
    }
    System.out.println("[Dice.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Dice " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Dice.close] id=" + id + " -> CLOSED");
  }
}

public class LudoBoardGameService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Board> boards = new LinkedHashMap<>();
  private final Map<String, Player> players = new LinkedHashMap<>();
  private final Map<String, Token> tokens = new LinkedHashMap<>();
  private final Map<String, Cell> cells = new LinkedHashMap<>();
  private final Map<String, Dice> dices = new LinkedHashMap<>();

  public LudoBoardGameService() {
    System.out.println("[LudoBoardGameService.__init__] system ready");
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
      System.out.println("[LudoBoardGameService.createBoard] stored " + id + " count=" + boards.size());
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
      System.out.println("[LudoBoardGameService.getBoard] found id=" + obj.getId());
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
      System.out.println("[LudoBoardGameService.createPlayer] stored " + id + " count=" + players.size());
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
      System.out.println("[LudoBoardGameService.getPlayer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Token createToken(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Token name required");
    }
    lock.lock();
    try {
      String id = String.format("TOK-%04d", seq++);
      Token obj = new Token(id, name.trim());
      obj.validate();
      tokens.put(id, obj);
      System.out.println("[LudoBoardGameService.createToken] stored " + id + " count=" + tokens.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Token getToken(String id) {
    lock.lock();
    try {
      Token obj = tokens.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Token id: " + id);
      }
      System.out.println("[LudoBoardGameService.getToken] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Cell createCell(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Cell name required");
    }
    lock.lock();
    try {
      String id = String.format("CEL-%04d", seq++);
      Cell obj = new Cell(id, name.trim());
      obj.validate();
      cells.put(id, obj);
      System.out.println("[LudoBoardGameService.createCell] stored " + id + " count=" + cells.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Cell getCell(String id) {
    lock.lock();
    try {
      Cell obj = cells.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Cell id: " + id);
      }
      System.out.println("[LudoBoardGameService.getCell] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Dice createDice(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Dice name required");
    }
    lock.lock();
    try {
      String id = String.format("DIC-%04d", seq++);
      Dice obj = new Dice(id, name.trim());
      obj.validate();
      dices.put(id, obj);
      System.out.println("[LudoBoardGameService.createDice] stored " + id + " count=" + dices.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Dice getDice(String id) {
    lock.lock();
    try {
      Dice obj = dices.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Dice id: " + id);
      }
      System.out.println("[LudoBoardGameService.getDice] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Board closeBoard(String id) {
    lock.lock();
    try {
      Board obj = boards.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Board id: " + id);
      }
      System.out.println("[LudoBoardGameService.closeBoard] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Board> listActiveBoards() {
    lock.lock();
    try {
      List<Board> out = new ArrayList<>();
      for (Board o : boards.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[LudoBoardGameService.listActiveBoards] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct LudoBoardGameService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    LudoBoardGameService system = new LudoBoardGameService();
    System.out.println("========== STEP 2: Create Board objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Board first = system.createBoard("alpha-board");
    system.createBoard("beta-board");
    System.out.println("========== STEP 3: Create Player ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createPlayer("sample-player");
    System.out.println("========== STEP 4: Create Token ==========");
    system.createToken("sample-token");
    System.out.println("========== STEP 5: Create Cell ==========");
    system.createCell("sample-cell");
    System.out.println("========== STEP 6: Create Dice ==========");
    system.createDice("sample-dice");
    System.out.println("========== Inspect active list ==========");
    system.listActiveBoards();
    System.out.println("========== Close first Board ==========");
    system.closeBoard(first.getId());
    try {
      system.closeBoard(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getBoard("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
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


class Token {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Token.id required')
    }

    if (!name?.trim()) {
      throw new Error('Token.name required')
    }
    console.log(\`[Token.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Token \${this.id} invalid status\`)
    }
    console.log(\`[Token.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Token \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Token.close] id=\${this.id} -> CLOSED\`)
  }
}


class Cell {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Cell.id required')
    }

    if (!name?.trim()) {
      throw new Error('Cell.name required')
    }
    console.log(\`[Cell.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Cell \${this.id} invalid status\`)
    }
    console.log(\`[Cell.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Cell \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Cell.close] id=\${this.id} -> CLOSED\`)
  }
}


class Dice {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Dice.id required')
    }

    if (!name?.trim()) {
      throw new Error('Dice.name required')
    }
    console.log(\`[Dice.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Dice \${this.id} invalid status\`)
    }
    console.log(\`[Dice.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Dice \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Dice.close] id=\${this.id} -> CLOSED\`)
  }
}

class LudoBoardGameService {
  private seq = 1
  private boards = new Map<string, Board>()
  private players = new Map<string, Player>()
  private tokens = new Map<string, Token>()
  private cells = new Map<string, Cell>()
  private dices = new Map<string, Dice>()
  constructor() {
    console.log('[LudoBoardGameService.__init__] system ready')
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
    console.log(\`[LudoBoardGameService.createBoard] stored \${id} count=\${this.boards.size}\`)
    return obj
  }

  getBoard(id: string): Board {
    const obj = this.boards.get(id)
    if (!obj) {
      throw new Error(\`unknown Board id: \${id}\`)
    }
    console.log(\`[LudoBoardGameService.getBoard] found id=\${obj.id}\`)
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
    console.log(\`[LudoBoardGameService.createPlayer] stored \${id} count=\${this.players.size}\`)
    return obj
  }

  getPlayer(id: string): Player {
    const obj = this.players.get(id)
    if (!obj) {
      throw new Error(\`unknown Player id: \${id}\`)
    }
    console.log(\`[LudoBoardGameService.getPlayer] found id=\${obj.id}\`)
    return obj
  }

  createToken(name: string): Token {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Token name required')
    }
    const id = \`TOK-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Token(id, cleaned)
    obj.validate()
    this.tokens.set(id, obj)
    console.log(\`[LudoBoardGameService.createToken] stored \${id} count=\${this.tokens.size}\`)
    return obj
  }

  getToken(id: string): Token {
    const obj = this.tokens.get(id)
    if (!obj) {
      throw new Error(\`unknown Token id: \${id}\`)
    }
    console.log(\`[LudoBoardGameService.getToken] found id=\${obj.id}\`)
    return obj
  }

  createCell(name: string): Cell {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Cell name required')
    }
    const id = \`CEL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Cell(id, cleaned)
    obj.validate()
    this.cells.set(id, obj)
    console.log(\`[LudoBoardGameService.createCell] stored \${id} count=\${this.cells.size}\`)
    return obj
  }

  getCell(id: string): Cell {
    const obj = this.cells.get(id)
    if (!obj) {
      throw new Error(\`unknown Cell id: \${id}\`)
    }
    console.log(\`[LudoBoardGameService.getCell] found id=\${obj.id}\`)
    return obj
  }

  createDice(name: string): Dice {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Dice name required')
    }
    const id = \`DIC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Dice(id, cleaned)
    obj.validate()
    this.dices.set(id, obj)
    console.log(\`[LudoBoardGameService.createDice] stored \${id} count=\${this.dices.size}\`)
    return obj
  }

  getDice(id: string): Dice {
    const obj = this.dices.get(id)
    if (!obj) {
      throw new Error(\`unknown Dice id: \${id}\`)
    }
    console.log(\`[LudoBoardGameService.getDice] found id=\${obj.id}\`)
    return obj
  }

  closeBoard(id: string): Board {
    const obj = this.getBoard(id)
    console.log(\`[LudoBoardGameService.closeBoard] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveBoards(): Board[] {
    const active = [...this.boards.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[LudoBoardGameService.listActiveBoards] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct LudoBoardGameService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new LudoBoardGameService()
  console.log('========== STEP 2: Create Board objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createBoard('alpha-board')
  system.createBoard('beta-board')
  console.log('========== STEP 3: Create Player ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createPlayer('sample-player')
  console.log('========== STEP 4: Create Token ==========')
  system.createToken('sample-token')
  console.log('========== STEP 5: Create Cell ==========')
  system.createCell('sample-cell')
  console.log('========== STEP 6: Create Dice ==========')
  system.createDice('sample-dice')
  system.listActiveBoards()
  console.log('========== Close first Board ==========')
  system.closeBoard(first.id)
  try {
    system.closeBoard(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getBoard('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

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


class Token {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Token(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Token requires id and name");
    }
    cout << "[Token.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Token invalid status");
    }
    cout << "[Token.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Token cannot close");
    }
    status_ = "CLOSED";
    cout << "[Token.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Cell {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Cell(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Cell requires id and name");
    }
    cout << "[Cell.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Cell invalid status");
    }
    cout << "[Cell.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Cell cannot close");
    }
    status_ = "CLOSED";
    cout << "[Cell.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Dice {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Dice(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Dice requires id and name");
    }
    cout << "[Dice.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Dice invalid status");
    }
    cout << "[Dice.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Dice cannot close");
    }
    status_ = "CLOSED";
    cout << "[Dice.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class LudoBoardGameService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Board> boards_;
  unordered_map<string, Player> players_;
  unordered_map<string, Token> tokens_;
  unordered_map<string, Cell> cells_;
  unordered_map<string, Dice> dices_;
public:
  LudoBoardGameService() {
    cout << "[LudoBoardGameService.__init__] system ready" << endl;
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
    cout << "[LudoBoardGameService.createBoard] stored " << obj.id() << endl;
    return obj;
  }

  Board getBoard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = boards_.find(id);
    if (it == boards_.end()) {
      throw out_of_range("unknown Board id");
    }
    cout << "[LudoBoardGameService.getBoard] found " << id << endl;
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
    cout << "[LudoBoardGameService.createPlayer] stored " << obj.id() << endl;
    return obj;
  }

  Player getPlayer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = players_.find(id);
    if (it == players_.end()) {
      throw out_of_range("unknown Player id");
    }
    cout << "[LudoBoardGameService.getPlayer] found " << id << endl;
    return it->second;
  }

  Token createToken(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Token name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TOK-%04d", seq_++);
    Token obj{buf, name};
    obj.validate();
    tokens_.emplace(obj.id(), obj);
    cout << "[LudoBoardGameService.createToken] stored " << obj.id() << endl;
    return obj;
  }

  Token getToken(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = tokens_.find(id);
    if (it == tokens_.end()) {
      throw out_of_range("unknown Token id");
    }
    cout << "[LudoBoardGameService.getToken] found " << id << endl;
    return it->second;
  }

  Cell createCell(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Cell name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CEL-%04d", seq_++);
    Cell obj{buf, name};
    obj.validate();
    cells_.emplace(obj.id(), obj);
    cout << "[LudoBoardGameService.createCell] stored " << obj.id() << endl;
    return obj;
  }

  Cell getCell(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cells_.find(id);
    if (it == cells_.end()) {
      throw out_of_range("unknown Cell id");
    }
    cout << "[LudoBoardGameService.getCell] found " << id << endl;
    return it->second;
  }

  Dice createDice(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Dice name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DIC-%04d", seq_++);
    Dice obj{buf, name};
    obj.validate();
    dices_.emplace(obj.id(), obj);
    cout << "[LudoBoardGameService.createDice] stored " << obj.id() << endl;
    return obj;
  }

  Dice getDice(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = dices_.find(id);
    if (it == dices_.end()) {
      throw out_of_range("unknown Dice id");
    }
    cout << "[LudoBoardGameService.getDice] found " << id << endl;
    return it->second;
  }

  Board closeBoard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = boards_.find(id);
    if (it == boards_.end()) {
      throw out_of_range("unknown Board");
    }
    cout << "[LudoBoardGameService.closeBoard] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct LudoBoardGameService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  LudoBoardGameService system;
  cout << "========== STEP 2: Create Board ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createBoard("alpha-board");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createBoard("beta-board");
  system.createPlayer("sample-player");
  system.createToken("sample-token");
  system.createCell("sample-cell");
  system.createDice("sample-dice");
  system.closeBoard(first.id());
  try {
    system.closeBoard(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getBoard("MISSING-ID");
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


type Token struct {
  ID     string
  Name   string
  Status string
}

func NewToken(id, name string) (*Token, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Token requires id and name")
  }
  obj := &Token{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Token.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Token) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Token invalid status")
  }
  fmt.Printf("[Token.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Token) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Token %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Token.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Cell struct {
  ID     string
  Name   string
  Status string
}

func NewCell(id, name string) (*Cell, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Cell requires id and name")
  }
  obj := &Cell{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Cell.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Cell) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Cell invalid status")
  }
  fmt.Printf("[Cell.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Cell) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Cell %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Cell.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Dice struct {
  ID     string
  Name   string
  Status string
}

func NewDice(id, name string) (*Dice, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Dice requires id and name")
  }
  obj := &Dice{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Dice.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Dice) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Dice invalid status")
  }
  fmt.Printf("[Dice.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Dice) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Dice %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Dice.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type LudoBoardGameService struct {
  mu  sync.Mutex
  seq int
  boards map[string]*Board
  players map[string]*Player
  tokens map[string]*Token
  cells map[string]*Cell
  dices map[string]*Dice
}

func NewLudoBoardGameService() *LudoBoardGameService {
  fmt.Println("[LudoBoardGameService.__init__] system ready")
  return &LudoBoardGameService{
    seq: 1,
    boards: map[string]*Board{},
    players: map[string]*Player{},
    tokens: map[string]*Token{},
    cells: map[string]*Cell{},
    dices: map[string]*Dice{},
  }
}

func (s *LudoBoardGameService) CreateBoard(name string) (*Board, error) {
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
  fmt.Printf("[LudoBoardGameService.CreateBoard] stored %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) GetBoard(id string) (*Board, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.boards[id]
  if !ok {
    return nil, fmt.Errorf("unknown Board id: %s", id)
  }
  fmt.Printf("[LudoBoardGameService.GetBoard] found %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) CreatePlayer(name string) (*Player, error) {
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
  fmt.Printf("[LudoBoardGameService.CreatePlayer] stored %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) GetPlayer(id string) (*Player, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.players[id]
  if !ok {
    return nil, fmt.Errorf("unknown Player id: %s", id)
  }
  fmt.Printf("[LudoBoardGameService.GetPlayer] found %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) CreateToken(name string) (*Token, error) {
  if name == "" {
    return nil, fmt.Errorf("Token name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TOK-%04d", s.seq)
  s.seq++
  obj, err := NewToken(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.tokens[id] = obj
  fmt.Printf("[LudoBoardGameService.CreateToken] stored %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) GetToken(id string) (*Token, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.tokens[id]
  if !ok {
    return nil, fmt.Errorf("unknown Token id: %s", id)
  }
  fmt.Printf("[LudoBoardGameService.GetToken] found %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) CreateCell(name string) (*Cell, error) {
  if name == "" {
    return nil, fmt.Errorf("Cell name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CEL-%04d", s.seq)
  s.seq++
  obj, err := NewCell(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.cells[id] = obj
  fmt.Printf("[LudoBoardGameService.CreateCell] stored %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) GetCell(id string) (*Cell, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.cells[id]
  if !ok {
    return nil, fmt.Errorf("unknown Cell id: %s", id)
  }
  fmt.Printf("[LudoBoardGameService.GetCell] found %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) CreateDice(name string) (*Dice, error) {
  if name == "" {
    return nil, fmt.Errorf("Dice name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DIC-%04d", s.seq)
  s.seq++
  obj, err := NewDice(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.dices[id] = obj
  fmt.Printf("[LudoBoardGameService.CreateDice] stored %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) GetDice(id string) (*Dice, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.dices[id]
  if !ok {
    return nil, fmt.Errorf("unknown Dice id: %s", id)
  }
  fmt.Printf("[LudoBoardGameService.GetDice] found %s\\n", id)
  return obj, nil
}

func (s *LudoBoardGameService) CloseBoard(id string) (*Board, error) {
  obj, err := s.GetBoard(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[LudoBoardGameService.CloseBoard] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct LudoBoardGameService ==========")
  system := NewLudoBoardGameService()
  fmt.Println("========== STEP 2: Create Board ==========")
  first, _ := system.CreateBoard("alpha-board")
  system.CreateBoard("beta-board")
  system.CreatePlayer("sample-player")
  system.CreateToken("sample-token")
  system.CreateCell("sample-cell")
  system.CreateDice("sample-dice")
  system.CloseBoard(first.ID)
  if _, err := system.CloseBoard(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetBoard("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

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


sealed class Token {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Token(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Token requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Token.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Token invalid status");
    }
    Console.WriteLine("[Token.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Token " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Token.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Cell {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Cell(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Cell requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Cell.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Cell invalid status");
    }
    Console.WriteLine("[Cell.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Cell " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Cell.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Dice {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Dice(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Dice requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Dice.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Dice invalid status");
    }
    Console.WriteLine("[Dice.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Dice " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Dice.close] id=" + Id + " -> CLOSED");
  }
}

sealed class LudoBoardGameService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Board> _boards = new();
  private readonly Dictionary<string, Player> _players = new();
  private readonly Dictionary<string, Token> _tokens = new();
  private readonly Dictionary<string, Cell> _cells = new();
  private readonly Dictionary<string, Dice> _dices = new();
  public LudoBoardGameService() {
    Console.WriteLine("[LudoBoardGameService.__init__] system ready");
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
      Console.WriteLine("[LudoBoardGameService.CreateBoard] stored " + id);
      return obj;
    }
  }

  public Board GetBoard(string id) {
    lock (_gate) {
      if (!_boards.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Board id: " + id);
      }
      Console.WriteLine("[LudoBoardGameService.GetBoard] found " + id);
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
      Console.WriteLine("[LudoBoardGameService.CreatePlayer] stored " + id);
      return obj;
    }
  }

  public Player GetPlayer(string id) {
    lock (_gate) {
      if (!_players.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Player id: " + id);
      }
      Console.WriteLine("[LudoBoardGameService.GetPlayer] found " + id);
      return obj;
    }
  }

  public Token CreateToken(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Token name required");
    }
    lock (_gate) {
      var id = string.Format("TOK-{0:D4}", _seq++);
      var obj = new Token(id, name.Trim());
      obj.Validate();
      _tokens[id] = obj;
      Console.WriteLine("[LudoBoardGameService.CreateToken] stored " + id);
      return obj;
    }
  }

  public Token GetToken(string id) {
    lock (_gate) {
      if (!_tokens.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Token id: " + id);
      }
      Console.WriteLine("[LudoBoardGameService.GetToken] found " + id);
      return obj;
    }
  }

  public Cell CreateCell(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Cell name required");
    }
    lock (_gate) {
      var id = string.Format("CEL-{0:D4}", _seq++);
      var obj = new Cell(id, name.Trim());
      obj.Validate();
      _cells[id] = obj;
      Console.WriteLine("[LudoBoardGameService.CreateCell] stored " + id);
      return obj;
    }
  }

  public Cell GetCell(string id) {
    lock (_gate) {
      if (!_cells.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Cell id: " + id);
      }
      Console.WriteLine("[LudoBoardGameService.GetCell] found " + id);
      return obj;
    }
  }

  public Dice CreateDice(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Dice name required");
    }
    lock (_gate) {
      var id = string.Format("DIC-{0:D4}", _seq++);
      var obj = new Dice(id, name.Trim());
      obj.Validate();
      _dices[id] = obj;
      Console.WriteLine("[LudoBoardGameService.CreateDice] stored " + id);
      return obj;
    }
  }

  public Dice GetDice(string id) {
    lock (_gate) {
      if (!_dices.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Dice id: " + id);
      }
      Console.WriteLine("[LudoBoardGameService.GetDice] found " + id);
      return obj;
    }
  }

  public Board CloseBoard(string id) {
    var obj = GetBoard(id);
    Console.WriteLine("[LudoBoardGameService.CloseBoard] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct LudoBoardGameService ==========");
    var system = new LudoBoardGameService();
    Console.WriteLine("========== STEP 2: Create Board ==========");
    var first = system.CreateBoard("alpha-board");
    system.CreateBoard("beta-board");
    system.CreatePlayer("sample-player");
    system.CreateToken("sample-token");
    system.CreateCell("sample-cell");
    system.CreateDice("sample-dice");
    system.CloseBoard(first.Id);
    try {
      system.CloseBoard(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetBoard("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const ludoBoardGameSolution: ProblemSolution = {
  slug: 'ludo-board-game',
  title: 'Ludo Board Game - Complete LLD Guide',
  overview: {
    introduction: [
      'Design the classic Ludo board game supporting 2-4 players, dice rolls, and token movement with capture rules. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Support 2 to 4 players, each with 4 tokens',
      'Roll a dice and move a token by that many steps',
      'Capture an opponent\'s token landing on the same non-safe cell',
      'Require a 6 to move a token out of the home base',
      'Move a token into the home column after a full lap',
      'Determine the winner when all 4 of a player\'s tokens reach home',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Support 2 to 4 players, each with 4 tokens?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Roll a dice and move a token by that many steps?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Capture an opponent\'s token landing on the same non-safe cell?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Require a 6 to move a token out of the home base?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Move a token into the home column after a full lap?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. LudoBoardGameService is the facade stereotype. Board, Player, Token, Cell, Dice are concrete domain classes with id/name/status and validate/close.',
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
          'Construct LudoBoardGameService.',
          'createBoard twice and create the related UML classes.',
          'closeBoard once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'LudoBoardGameService', responsibility: 'UML facade - orchestrates Ludo Board Game.', keyMembers: ['create*', 'get*', 'closeBoard'] },
    { name: 'Board', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Token', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Cell', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Dice', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from LudoBoardGameService to Board, Player, Token, Cell, Dice. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on LudoBoardGameService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'LudoBoardGameService', responsibility: 'UML facade - orchestrates Ludo Board Game.', keyMembers: ['create*', 'get*', 'closeBoard'] },
    { name: 'Board', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Token', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Cell', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Dice', responsibility: 'UML class - domain object for Ludo Board Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'LudoBoardGameService exposes create/get/close and owns composed collections.' },
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
      'main constructs LudoBoardGameService, creates UML domain objects, closes the primary Board, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct LudoBoardGameService.',
      'createBoard for alpha and beta.',
      'create remaining UML classes.',
      'closeBoard(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createBoard("alpha..."); closeBoard(id)',
        output: '[Board.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeBoard(alreadyClosed) or getBoard("MISSING-ID")',
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
