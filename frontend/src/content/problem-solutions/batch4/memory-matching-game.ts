import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'MemoryMatchingGameService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_boards', 'Map<string, Board>'),
    attr('-', '_cards', 'Map<string, Card>'),
    attr('-', '_face_ups', 'Map<string, faceUp>'),
    attr('-', '_matcheds', 'Map<string, matched>'),
    attr('-', '_players', 'Map<string, Player>'),
  ], [
    method('+', 'createBoard', 'name: string', 'Board'),
    method('+', 'createCard', 'name: string', 'Card'),
    method('+', 'createfaceUp', 'name: string', 'faceUp'),
    method('+', 'creatematched', 'name: string', 'matched'),
    method('+', 'createPlayer', 'name: string', 'Player'),
    method('+', 'getBoard', 'id: string', 'Board'),
    method('+', 'getCard', 'id: string', 'Card'),
    method('+', 'getfaceUp', 'id: string', 'faceUp'),
    method('+', 'getmatched', 'id: string', 'matched'),
    method('+', 'getPlayer', 'id: string', 'Player'),
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
  cls('n2', 'Card', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'faceUp', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'matched', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Player', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("memory-matching-game")


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


class Card:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Card.id is required")
        if not name or not name.strip():
            raise ValueError("Card.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Card.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Card {self.id} has invalid status={self.status}")
        log.info("[Card.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Card {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Card.close] id=%s -> CLOSED", self.id)


class faceUp:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("faceUp.id is required")
        if not name or not name.strip():
            raise ValueError("faceUp.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[faceUp.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"faceUp {self.id} has invalid status={self.status}")
        log.info("[faceUp.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"faceUp {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[faceUp.close] id=%s -> CLOSED", self.id)


class matched:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("matched.id is required")
        if not name or not name.strip():
            raise ValueError("matched.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[matched.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"matched {self.id} has invalid status={self.status}")
        log.info("[matched.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"matched {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[matched.close] id=%s -> CLOSED", self.id)


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


class MemoryMatchingGameService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._boards: Dict[str, Board] = {}
        self._cards: Dict[str, Card] = {}
        self._face_ups: Dict[str, faceUp] = {}
        self._matcheds: Dict[str, matched] = {}
        self._players: Dict[str, Player] = {}
        log.info("[MemoryMatchingGameService.__init__] system ready; managing: Board, Card, faceUp, matched, Player")

    def create_board(self, name: str) -> Board:
        """UML: MemoryMatchingGameService.create_board(name) -> Board"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Board name is required")
        with self._lock:
            item_id = f"BOA-{self._seq:04d}"
            self._seq += 1
            obj = Board(item_id, cleaned)
            obj.validate()
            self._boards[item_id] = obj
            log.info("[MemoryMatchingGameService.create_board] stored %s in _boards (count=%s)", item_id, len(self._boards))
            return obj

    def get_board(self, item_id: str) -> Board:
        with self._lock:
            obj = self._boards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Board id: {item_id}")
            log.info("[MemoryMatchingGameService.get_board] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_card(self, name: str) -> Card:
        """UML: MemoryMatchingGameService.create_card(name) -> Card"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Card name is required")
        with self._lock:
            item_id = f"CAR-{self._seq:04d}"
            self._seq += 1
            obj = Card(item_id, cleaned)
            obj.validate()
            self._cards[item_id] = obj
            log.info("[MemoryMatchingGameService.create_card] stored %s in _cards (count=%s)", item_id, len(self._cards))
            return obj

    def get_card(self, item_id: str) -> Card:
        with self._lock:
            obj = self._cards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Card id: {item_id}")
            log.info("[MemoryMatchingGameService.get_card] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_face_up(self, name: str) -> faceUp:
        """UML: MemoryMatchingGameService.create_face_up(name) -> faceUp"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("faceUp name is required")
        with self._lock:
            item_id = f"FAC-{self._seq:04d}"
            self._seq += 1
            obj = faceUp(item_id, cleaned)
            obj.validate()
            self._face_ups[item_id] = obj
            log.info("[MemoryMatchingGameService.create_face_up] stored %s in _face_ups (count=%s)", item_id, len(self._face_ups))
            return obj

    def get_face_up(self, item_id: str) -> faceUp:
        with self._lock:
            obj = self._face_ups.get(item_id)
            if obj is None:
                raise KeyError(f"unknown faceUp id: {item_id}")
            log.info("[MemoryMatchingGameService.get_face_up] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_matched(self, name: str) -> matched:
        """UML: MemoryMatchingGameService.create_matched(name) -> matched"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("matched name is required")
        with self._lock:
            item_id = f"MAT-{self._seq:04d}"
            self._seq += 1
            obj = matched(item_id, cleaned)
            obj.validate()
            self._matcheds[item_id] = obj
            log.info("[MemoryMatchingGameService.create_matched] stored %s in _matcheds (count=%s)", item_id, len(self._matcheds))
            return obj

    def get_matched(self, item_id: str) -> matched:
        with self._lock:
            obj = self._matcheds.get(item_id)
            if obj is None:
                raise KeyError(f"unknown matched id: {item_id}")
            log.info("[MemoryMatchingGameService.get_matched] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_player(self, name: str) -> Player:
        """UML: MemoryMatchingGameService.create_player(name) -> Player"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Player name is required")
        with self._lock:
            item_id = f"PLA-{self._seq:04d}"
            self._seq += 1
            obj = Player(item_id, cleaned)
            obj.validate()
            self._players[item_id] = obj
            log.info("[MemoryMatchingGameService.create_player] stored %s in _players (count=%s)", item_id, len(self._players))
            return obj

    def get_player(self, item_id: str) -> Player:
        with self._lock:
            obj = self._players.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Player id: {item_id}")
            log.info("[MemoryMatchingGameService.get_player] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_board(self, item_id: str) -> Board:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._boards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Board id: {item_id}")
            log.info("[MemoryMatchingGameService.close_board] closing %s via Board.close()", item_id)
            obj.close()
            return obj

    def list_active_boards(self) -> List[Board]:
        with self._lock:
            active = [o for o in self._boards.values() if o.status == "ACTIVE"]
            log.info("[MemoryMatchingGameService.list_active_boards] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct MemoryMatchingGameService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = MemoryMatchingGameService()

    log.info("========== STEP 2: Create primary Board objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_board("alpha-board")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_board("beta-board")

    log.info("========== STEP 3: Create Card (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_card("sample-card")

    log.info("========== STEP 4: Create faceUp (UML class) ==========")
    system.create_face_up("sample-face_up")

    log.info("========== STEP 5: Create matched (UML class) ==========")
    system.create_matched("sample-matched")

    log.info("========== STEP 6: Create Player (UML class) ==========")
    system.create_player("sample-player")

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


class Card {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Card(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Card.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Card.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Card.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Card " + id + " invalid status");
    }
    System.out.println("[Card.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Card " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Card.close] id=" + id + " -> CLOSED");
  }
}


class faceUp {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  faceUp(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("faceUp.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("faceUp.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[faceUp.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("faceUp " + id + " invalid status");
    }
    System.out.println("[faceUp.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("faceUp " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[faceUp.close] id=" + id + " -> CLOSED");
  }
}


class matched {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  matched(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("matched.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("matched.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[matched.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("matched " + id + " invalid status");
    }
    System.out.println("[matched.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("matched " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[matched.close] id=" + id + " -> CLOSED");
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

public class MemoryMatchingGameService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Board> boards = new LinkedHashMap<>();
  private final Map<String, Card> cards = new LinkedHashMap<>();
  private final Map<String, faceUp> face_ups = new LinkedHashMap<>();
  private final Map<String, matched> matcheds = new LinkedHashMap<>();
  private final Map<String, Player> players = new LinkedHashMap<>();

  public MemoryMatchingGameService() {
    System.out.println("[MemoryMatchingGameService.__init__] system ready");
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
      System.out.println("[MemoryMatchingGameService.createBoard] stored " + id + " count=" + boards.size());
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
      System.out.println("[MemoryMatchingGameService.getBoard] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Card createCard(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Card name required");
    }
    lock.lock();
    try {
      String id = String.format("CAR-%04d", seq++);
      Card obj = new Card(id, name.trim());
      obj.validate();
      cards.put(id, obj);
      System.out.println("[MemoryMatchingGameService.createCard] stored " + id + " count=" + cards.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Card getCard(String id) {
    lock.lock();
    try {
      Card obj = cards.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Card id: " + id);
      }
      System.out.println("[MemoryMatchingGameService.getCard] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public faceUp createfaceUp(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("faceUp name required");
    }
    lock.lock();
    try {
      String id = String.format("FAC-%04d", seq++);
      faceUp obj = new faceUp(id, name.trim());
      obj.validate();
      face_ups.put(id, obj);
      System.out.println("[MemoryMatchingGameService.createfaceUp] stored " + id + " count=" + face_ups.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public faceUp getfaceUp(String id) {
    lock.lock();
    try {
      faceUp obj = face_ups.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown faceUp id: " + id);
      }
      System.out.println("[MemoryMatchingGameService.getfaceUp] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public matched creatematched(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("matched name required");
    }
    lock.lock();
    try {
      String id = String.format("MAT-%04d", seq++);
      matched obj = new matched(id, name.trim());
      obj.validate();
      matcheds.put(id, obj);
      System.out.println("[MemoryMatchingGameService.creatematched] stored " + id + " count=" + matcheds.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public matched getmatched(String id) {
    lock.lock();
    try {
      matched obj = matcheds.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown matched id: " + id);
      }
      System.out.println("[MemoryMatchingGameService.getmatched] found id=" + obj.getId());
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
      System.out.println("[MemoryMatchingGameService.createPlayer] stored " + id + " count=" + players.size());
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
      System.out.println("[MemoryMatchingGameService.getPlayer] found id=" + obj.getId());
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
      System.out.println("[MemoryMatchingGameService.closeBoard] closing " + id);
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
      System.out.println("[MemoryMatchingGameService.listActiveBoards] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct MemoryMatchingGameService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    MemoryMatchingGameService system = new MemoryMatchingGameService();
    System.out.println("========== STEP 2: Create Board objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Board first = system.createBoard("alpha-board");
    system.createBoard("beta-board");
    System.out.println("========== STEP 3: Create Card ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createCard("sample-card");
    System.out.println("========== STEP 4: Create faceUp ==========");
    system.createfaceUp("sample-face_up");
    System.out.println("========== STEP 5: Create matched ==========");
    system.creatematched("sample-matched");
    System.out.println("========== STEP 6: Create Player ==========");
    system.createPlayer("sample-player");
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


class Card {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Card.id required')
    }

    if (!name?.trim()) {
      throw new Error('Card.name required')
    }
    console.log(\`[Card.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Card \${this.id} invalid status\`)
    }
    console.log(\`[Card.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Card \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Card.close] id=\${this.id} -> CLOSED\`)
  }
}


class faceUp {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('faceUp.id required')
    }

    if (!name?.trim()) {
      throw new Error('faceUp.name required')
    }
    console.log(\`[faceUp.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`faceUp \${this.id} invalid status\`)
    }
    console.log(\`[faceUp.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`faceUp \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[faceUp.close] id=\${this.id} -> CLOSED\`)
  }
}


class matched {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('matched.id required')
    }

    if (!name?.trim()) {
      throw new Error('matched.name required')
    }
    console.log(\`[matched.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`matched \${this.id} invalid status\`)
    }
    console.log(\`[matched.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`matched \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[matched.close] id=\${this.id} -> CLOSED\`)
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

class MemoryMatchingGameService {
  private seq = 1
  private boards = new Map<string, Board>()
  private cards = new Map<string, Card>()
  private face_ups = new Map<string, faceUp>()
  private matcheds = new Map<string, matched>()
  private players = new Map<string, Player>()
  constructor() {
    console.log('[MemoryMatchingGameService.__init__] system ready')
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
    console.log(\`[MemoryMatchingGameService.createBoard] stored \${id} count=\${this.boards.size}\`)
    return obj
  }

  getBoard(id: string): Board {
    const obj = this.boards.get(id)
    if (!obj) {
      throw new Error(\`unknown Board id: \${id}\`)
    }
    console.log(\`[MemoryMatchingGameService.getBoard] found id=\${obj.id}\`)
    return obj
  }

  createCard(name: string): Card {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Card name required')
    }
    const id = \`CAR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Card(id, cleaned)
    obj.validate()
    this.cards.set(id, obj)
    console.log(\`[MemoryMatchingGameService.createCard] stored \${id} count=\${this.cards.size}\`)
    return obj
  }

  getCard(id: string): Card {
    const obj = this.cards.get(id)
    if (!obj) {
      throw new Error(\`unknown Card id: \${id}\`)
    }
    console.log(\`[MemoryMatchingGameService.getCard] found id=\${obj.id}\`)
    return obj
  }

  createfaceUp(name: string): faceUp {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('faceUp name required')
    }
    const id = \`FAC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new faceUp(id, cleaned)
    obj.validate()
    this.face_ups.set(id, obj)
    console.log(\`[MemoryMatchingGameService.createfaceUp] stored \${id} count=\${this.face_ups.size}\`)
    return obj
  }

  getfaceUp(id: string): faceUp {
    const obj = this.face_ups.get(id)
    if (!obj) {
      throw new Error(\`unknown faceUp id: \${id}\`)
    }
    console.log(\`[MemoryMatchingGameService.getfaceUp] found id=\${obj.id}\`)
    return obj
  }

  creatematched(name: string): matched {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('matched name required')
    }
    const id = \`MAT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new matched(id, cleaned)
    obj.validate()
    this.matcheds.set(id, obj)
    console.log(\`[MemoryMatchingGameService.creatematched] stored \${id} count=\${this.matcheds.size}\`)
    return obj
  }

  getmatched(id: string): matched {
    const obj = this.matcheds.get(id)
    if (!obj) {
      throw new Error(\`unknown matched id: \${id}\`)
    }
    console.log(\`[MemoryMatchingGameService.getmatched] found id=\${obj.id}\`)
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
    console.log(\`[MemoryMatchingGameService.createPlayer] stored \${id} count=\${this.players.size}\`)
    return obj
  }

  getPlayer(id: string): Player {
    const obj = this.players.get(id)
    if (!obj) {
      throw new Error(\`unknown Player id: \${id}\`)
    }
    console.log(\`[MemoryMatchingGameService.getPlayer] found id=\${obj.id}\`)
    return obj
  }

  closeBoard(id: string): Board {
    const obj = this.getBoard(id)
    console.log(\`[MemoryMatchingGameService.closeBoard] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveBoards(): Board[] {
    const active = [...this.boards.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[MemoryMatchingGameService.listActiveBoards] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct MemoryMatchingGameService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new MemoryMatchingGameService()
  console.log('========== STEP 2: Create Board objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createBoard('alpha-board')
  system.createBoard('beta-board')
  console.log('========== STEP 3: Create Card ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createCard('sample-card')
  console.log('========== STEP 4: Create faceUp ==========')
  system.createfaceUp('sample-face_up')
  console.log('========== STEP 5: Create matched ==========')
  system.creatematched('sample-matched')
  console.log('========== STEP 6: Create Player ==========')
  system.createPlayer('sample-player')
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


class Card {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Card(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Card requires id and name");
    }
    cout << "[Card.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Card invalid status");
    }
    cout << "[Card.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Card cannot close");
    }
    status_ = "CLOSED";
    cout << "[Card.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class faceUp {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  faceUp(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("faceUp requires id and name");
    }
    cout << "[faceUp.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("faceUp invalid status");
    }
    cout << "[faceUp.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("faceUp cannot close");
    }
    status_ = "CLOSED";
    cout << "[faceUp.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class matched {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  matched(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("matched requires id and name");
    }
    cout << "[matched.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("matched invalid status");
    }
    cout << "[matched.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("matched cannot close");
    }
    status_ = "CLOSED";
    cout << "[matched.close] id=" << id_ << " -> CLOSED" << endl;
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

class MemoryMatchingGameService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Board> boards_;
  unordered_map<string, Card> cards_;
  unordered_map<string, faceUp> face_ups_;
  unordered_map<string, matched> matcheds_;
  unordered_map<string, Player> players_;
public:
  MemoryMatchingGameService() {
    cout << "[MemoryMatchingGameService.__init__] system ready" << endl;
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
    cout << "[MemoryMatchingGameService.createBoard] stored " << obj.id() << endl;
    return obj;
  }

  Board getBoard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = boards_.find(id);
    if (it == boards_.end()) {
      throw out_of_range("unknown Board id");
    }
    cout << "[MemoryMatchingGameService.getBoard] found " << id << endl;
    return it->second;
  }

  Card createCard(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Card name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CAR-%04d", seq_++);
    Card obj{buf, name};
    obj.validate();
    cards_.emplace(obj.id(), obj);
    cout << "[MemoryMatchingGameService.createCard] stored " << obj.id() << endl;
    return obj;
  }

  Card getCard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cards_.find(id);
    if (it == cards_.end()) {
      throw out_of_range("unknown Card id");
    }
    cout << "[MemoryMatchingGameService.getCard] found " << id << endl;
    return it->second;
  }

  faceUp createfaceUp(const string& name) {
    if (name.empty()) {
      throw invalid_argument("faceUp name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FAC-%04d", seq_++);
    faceUp obj{buf, name};
    obj.validate();
    face_ups_.emplace(obj.id(), obj);
    cout << "[MemoryMatchingGameService.createfaceUp] stored " << obj.id() << endl;
    return obj;
  }

  faceUp getfaceUp(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = face_ups_.find(id);
    if (it == face_ups_.end()) {
      throw out_of_range("unknown faceUp id");
    }
    cout << "[MemoryMatchingGameService.getfaceUp] found " << id << endl;
    return it->second;
  }

  matched creatematched(const string& name) {
    if (name.empty()) {
      throw invalid_argument("matched name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MAT-%04d", seq_++);
    matched obj{buf, name};
    obj.validate();
    matcheds_.emplace(obj.id(), obj);
    cout << "[MemoryMatchingGameService.creatematched] stored " << obj.id() << endl;
    return obj;
  }

  matched getmatched(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = matcheds_.find(id);
    if (it == matcheds_.end()) {
      throw out_of_range("unknown matched id");
    }
    cout << "[MemoryMatchingGameService.getmatched] found " << id << endl;
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
    cout << "[MemoryMatchingGameService.createPlayer] stored " << obj.id() << endl;
    return obj;
  }

  Player getPlayer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = players_.find(id);
    if (it == players_.end()) {
      throw out_of_range("unknown Player id");
    }
    cout << "[MemoryMatchingGameService.getPlayer] found " << id << endl;
    return it->second;
  }

  Board closeBoard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = boards_.find(id);
    if (it == boards_.end()) {
      throw out_of_range("unknown Board");
    }
    cout << "[MemoryMatchingGameService.closeBoard] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct MemoryMatchingGameService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  MemoryMatchingGameService system;
  cout << "========== STEP 2: Create Board ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createBoard("alpha-board");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createBoard("beta-board");
  system.createCard("sample-card");
  system.createfaceUp("sample-face_up");
  system.creatematched("sample-matched");
  system.createPlayer("sample-player");
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


type Card struct {
  ID     string
  Name   string
  Status string
}

func NewCard(id, name string) (*Card, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Card requires id and name")
  }
  obj := &Card{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Card.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Card) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Card invalid status")
  }
  fmt.Printf("[Card.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Card) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Card %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Card.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type faceUp struct {
  ID     string
  Name   string
  Status string
}

func NewfaceUp(id, name string) (*faceUp, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("faceUp requires id and name")
  }
  obj := &faceUp{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[faceUp.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *faceUp) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("faceUp invalid status")
  }
  fmt.Printf("[faceUp.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *faceUp) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("faceUp %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[faceUp.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type matched struct {
  ID     string
  Name   string
  Status string
}

func Newmatched(id, name string) (*matched, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("matched requires id and name")
  }
  obj := &matched{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[matched.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *matched) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("matched invalid status")
  }
  fmt.Printf("[matched.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *matched) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("matched %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[matched.close] id=%s -> CLOSED\\n", o.ID)
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

type MemoryMatchingGameService struct {
  mu  sync.Mutex
  seq int
  boards map[string]*Board
  cards map[string]*Card
  face_ups map[string]*faceUp
  matcheds map[string]*matched
  players map[string]*Player
}

func NewMemoryMatchingGameService() *MemoryMatchingGameService {
  fmt.Println("[MemoryMatchingGameService.__init__] system ready")
  return &MemoryMatchingGameService{
    seq: 1,
    boards: map[string]*Board{},
    cards: map[string]*Card{},
    face_ups: map[string]*faceUp{},
    matcheds: map[string]*matched{},
    players: map[string]*Player{},
  }
}

func (s *MemoryMatchingGameService) CreateBoard(name string) (*Board, error) {
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
  fmt.Printf("[MemoryMatchingGameService.CreateBoard] stored %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) GetBoard(id string) (*Board, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.boards[id]
  if !ok {
    return nil, fmt.Errorf("unknown Board id: %s", id)
  }
  fmt.Printf("[MemoryMatchingGameService.GetBoard] found %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) CreateCard(name string) (*Card, error) {
  if name == "" {
    return nil, fmt.Errorf("Card name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CAR-%04d", s.seq)
  s.seq++
  obj, err := NewCard(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.cards[id] = obj
  fmt.Printf("[MemoryMatchingGameService.CreateCard] stored %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) GetCard(id string) (*Card, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.cards[id]
  if !ok {
    return nil, fmt.Errorf("unknown Card id: %s", id)
  }
  fmt.Printf("[MemoryMatchingGameService.GetCard] found %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) CreatefaceUp(name string) (*faceUp, error) {
  if name == "" {
    return nil, fmt.Errorf("faceUp name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FAC-%04d", s.seq)
  s.seq++
  obj, err := NewfaceUp(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.face_ups[id] = obj
  fmt.Printf("[MemoryMatchingGameService.CreatefaceUp] stored %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) GetfaceUp(id string) (*faceUp, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.face_ups[id]
  if !ok {
    return nil, fmt.Errorf("unknown faceUp id: %s", id)
  }
  fmt.Printf("[MemoryMatchingGameService.GetfaceUp] found %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) Creatematched(name string) (*matched, error) {
  if name == "" {
    return nil, fmt.Errorf("matched name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MAT-%04d", s.seq)
  s.seq++
  obj, err := Newmatched(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.matcheds[id] = obj
  fmt.Printf("[MemoryMatchingGameService.Creatematched] stored %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) Getmatched(id string) (*matched, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.matcheds[id]
  if !ok {
    return nil, fmt.Errorf("unknown matched id: %s", id)
  }
  fmt.Printf("[MemoryMatchingGameService.Getmatched] found %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) CreatePlayer(name string) (*Player, error) {
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
  fmt.Printf("[MemoryMatchingGameService.CreatePlayer] stored %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) GetPlayer(id string) (*Player, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.players[id]
  if !ok {
    return nil, fmt.Errorf("unknown Player id: %s", id)
  }
  fmt.Printf("[MemoryMatchingGameService.GetPlayer] found %s\\n", id)
  return obj, nil
}

func (s *MemoryMatchingGameService) CloseBoard(id string) (*Board, error) {
  obj, err := s.GetBoard(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[MemoryMatchingGameService.CloseBoard] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct MemoryMatchingGameService ==========")
  system := NewMemoryMatchingGameService()
  fmt.Println("========== STEP 2: Create Board ==========")
  first, _ := system.CreateBoard("alpha-board")
  system.CreateBoard("beta-board")
  system.CreateCard("sample-card")
  system.CreatefaceUp("sample-face_up")
  system.Creatematched("sample-matched")
  system.CreatePlayer("sample-player")
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


sealed class Card {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Card(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Card requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Card.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Card invalid status");
    }
    Console.WriteLine("[Card.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Card " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Card.close] id=" + Id + " -> CLOSED");
  }
}


sealed class faceUp {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public faceUp(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("faceUp requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[faceUp.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("faceUp invalid status");
    }
    Console.WriteLine("[faceUp.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("faceUp " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[faceUp.close] id=" + Id + " -> CLOSED");
  }
}


sealed class matched {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public matched(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("matched requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[matched.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("matched invalid status");
    }
    Console.WriteLine("[matched.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("matched " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[matched.close] id=" + Id + " -> CLOSED");
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

sealed class MemoryMatchingGameService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Board> _boards = new();
  private readonly Dictionary<string, Card> _cards = new();
  private readonly Dictionary<string, faceUp> _face_ups = new();
  private readonly Dictionary<string, matched> _matcheds = new();
  private readonly Dictionary<string, Player> _players = new();
  public MemoryMatchingGameService() {
    Console.WriteLine("[MemoryMatchingGameService.__init__] system ready");
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
      Console.WriteLine("[MemoryMatchingGameService.CreateBoard] stored " + id);
      return obj;
    }
  }

  public Board GetBoard(string id) {
    lock (_gate) {
      if (!_boards.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Board id: " + id);
      }
      Console.WriteLine("[MemoryMatchingGameService.GetBoard] found " + id);
      return obj;
    }
  }

  public Card CreateCard(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Card name required");
    }
    lock (_gate) {
      var id = string.Format("CAR-{0:D4}", _seq++);
      var obj = new Card(id, name.Trim());
      obj.Validate();
      _cards[id] = obj;
      Console.WriteLine("[MemoryMatchingGameService.CreateCard] stored " + id);
      return obj;
    }
  }

  public Card GetCard(string id) {
    lock (_gate) {
      if (!_cards.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Card id: " + id);
      }
      Console.WriteLine("[MemoryMatchingGameService.GetCard] found " + id);
      return obj;
    }
  }

  public faceUp CreatefaceUp(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("faceUp name required");
    }
    lock (_gate) {
      var id = string.Format("FAC-{0:D4}", _seq++);
      var obj = new faceUp(id, name.Trim());
      obj.Validate();
      _face_ups[id] = obj;
      Console.WriteLine("[MemoryMatchingGameService.CreatefaceUp] stored " + id);
      return obj;
    }
  }

  public faceUp GetfaceUp(string id) {
    lock (_gate) {
      if (!_face_ups.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown faceUp id: " + id);
      }
      Console.WriteLine("[MemoryMatchingGameService.GetfaceUp] found " + id);
      return obj;
    }
  }

  public matched Creatematched(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("matched name required");
    }
    lock (_gate) {
      var id = string.Format("MAT-{0:D4}", _seq++);
      var obj = new matched(id, name.Trim());
      obj.Validate();
      _matcheds[id] = obj;
      Console.WriteLine("[MemoryMatchingGameService.Creatematched] stored " + id);
      return obj;
    }
  }

  public matched Getmatched(string id) {
    lock (_gate) {
      if (!_matcheds.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown matched id: " + id);
      }
      Console.WriteLine("[MemoryMatchingGameService.Getmatched] found " + id);
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
      Console.WriteLine("[MemoryMatchingGameService.CreatePlayer] stored " + id);
      return obj;
    }
  }

  public Player GetPlayer(string id) {
    lock (_gate) {
      if (!_players.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Player id: " + id);
      }
      Console.WriteLine("[MemoryMatchingGameService.GetPlayer] found " + id);
      return obj;
    }
  }

  public Board CloseBoard(string id) {
    var obj = GetBoard(id);
    Console.WriteLine("[MemoryMatchingGameService.CloseBoard] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct MemoryMatchingGameService ==========");
    var system = new MemoryMatchingGameService();
    Console.WriteLine("========== STEP 2: Create Board ==========");
    var first = system.CreateBoard("alpha-board");
    system.CreateBoard("beta-board");
    system.CreateCard("sample-card");
    system.CreatefaceUp("sample-face_up");
    system.Creatematched("sample-matched");
    system.CreatePlayer("sample-player");
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

export const memoryMatchingGameSolution: ProblemSolution = {
  slug: 'memory-matching-game',
  title: 'Memory Matching Card Game - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a memory card-matching game where players flip pairs of cards trying to find matches. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Generate a shuffled board of N pairs of cards (face down)',
      'Flip a card to reveal its face',
      'Check if two flipped cards match; if not, flip them back after a delay',
      'Remove matched pairs from play (or mark them solved)',
      'Track moves taken and elapsed time',
      'Support multiplayer turn-based mode where a match grants another turn',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Generate a shuffled board of N pairs of cards (face down)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Flip a card to reveal its face?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Check if two flipped cards match; if not, flip them back after a delay?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Remove matched pairs from play (or mark them solved)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Track moves taken and elapsed time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. MemoryMatchingGameService is the facade stereotype. Board, Card, faceUp, matched, Player are concrete domain classes with id/name/status and validate/close.',
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
          'Construct MemoryMatchingGameService.',
          'createBoard twice and create the related UML classes.',
          'closeBoard once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'MemoryMatchingGameService', responsibility: 'UML facade - orchestrates Memory Matching Card Game.', keyMembers: ['create*', 'get*', 'closeBoard'] },
    { name: 'Board', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Card', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'faceUp', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'matched', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from MemoryMatchingGameService to Board, Card, faceUp, matched, Player. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on MemoryMatchingGameService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'MemoryMatchingGameService', responsibility: 'UML facade - orchestrates Memory Matching Card Game.', keyMembers: ['create*', 'get*', 'closeBoard'] },
    { name: 'Board', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Card', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'faceUp', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'matched', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Memory Matching Card Game.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'MemoryMatchingGameService exposes create/get/close and owns composed collections.' },
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
      'main constructs MemoryMatchingGameService, creates UML domain objects, closes the primary Board, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct MemoryMatchingGameService.',
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
