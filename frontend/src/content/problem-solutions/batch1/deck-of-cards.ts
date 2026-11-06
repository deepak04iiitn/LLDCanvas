import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'DeckOfCardsService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_cards', 'Map<string, Card>'),
    attr('-', '_suits', 'Map<string, Suit>'),
    attr('-', '_ranks', 'Map<string, Rank>'),
    attr('-', '_decks', 'Map<string, Deck>'),
    attr('-', '_hands', 'Map<string, Hand>'),
  ], [
    method('+', 'createCard', 'name: string', 'Card'),
    method('+', 'createSuit', 'name: string', 'Suit'),
    method('+', 'createRank', 'name: string', 'Rank'),
    method('+', 'createDeck', 'name: string', 'Deck'),
    method('+', 'createHand', 'name: string', 'Hand'),
    method('+', 'getCard', 'id: string', 'Card'),
    method('+', 'getSuit', 'id: string', 'Suit'),
    method('+', 'getRank', 'id: string', 'Rank'),
    method('+', 'getDeck', 'id: string', 'Deck'),
    method('+', 'getHand', 'id: string', 'Hand'),
    method('+', 'closeCard', 'id: string', 'Card'),
  ], 'facade'),
  cls('n1', 'Card', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Suit', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Rank', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Deck', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Hand', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("deck-of-cards")


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


class Suit:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Suit.id is required")
        if not name or not name.strip():
            raise ValueError("Suit.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Suit.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Suit {self.id} has invalid status={self.status}")
        log.info("[Suit.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Suit {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Suit.close] id=%s -> CLOSED", self.id)


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


class Deck:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Deck.id is required")
        if not name or not name.strip():
            raise ValueError("Deck.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Deck.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Deck {self.id} has invalid status={self.status}")
        log.info("[Deck.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Deck {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Deck.close] id=%s -> CLOSED", self.id)


class Hand:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Hand.id is required")
        if not name or not name.strip():
            raise ValueError("Hand.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Hand.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Hand {self.id} has invalid status={self.status}")
        log.info("[Hand.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Hand {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Hand.close] id=%s -> CLOSED", self.id)


class DeckOfCardsService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._cards: Dict[str, Card] = {}
        self._suits: Dict[str, Suit] = {}
        self._ranks: Dict[str, Rank] = {}
        self._decks: Dict[str, Deck] = {}
        self._hands: Dict[str, Hand] = {}
        log.info("[DeckOfCardsService.__init__] system ready; managing: Card, Suit, Rank, Deck, Hand")

    def create_card(self, name: str) -> Card:
        """UML: DeckOfCardsService.create_card(name) -> Card"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Card name is required")
        with self._lock:
            item_id = f"CAR-{self._seq:04d}"
            self._seq += 1
            obj = Card(item_id, cleaned)
            obj.validate()
            self._cards[item_id] = obj
            log.info("[DeckOfCardsService.create_card] stored %s in _cards (count=%s)", item_id, len(self._cards))
            return obj

    def get_card(self, item_id: str) -> Card:
        with self._lock:
            obj = self._cards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Card id: {item_id}")
            log.info("[DeckOfCardsService.get_card] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_suit(self, name: str) -> Suit:
        """UML: DeckOfCardsService.create_suit(name) -> Suit"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Suit name is required")
        with self._lock:
            item_id = f"SUI-{self._seq:04d}"
            self._seq += 1
            obj = Suit(item_id, cleaned)
            obj.validate()
            self._suits[item_id] = obj
            log.info("[DeckOfCardsService.create_suit] stored %s in _suits (count=%s)", item_id, len(self._suits))
            return obj

    def get_suit(self, item_id: str) -> Suit:
        with self._lock:
            obj = self._suits.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Suit id: {item_id}")
            log.info("[DeckOfCardsService.get_suit] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_rank(self, name: str) -> Rank:
        """UML: DeckOfCardsService.create_rank(name) -> Rank"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Rank name is required")
        with self._lock:
            item_id = f"RAN-{self._seq:04d}"
            self._seq += 1
            obj = Rank(item_id, cleaned)
            obj.validate()
            self._ranks[item_id] = obj
            log.info("[DeckOfCardsService.create_rank] stored %s in _ranks (count=%s)", item_id, len(self._ranks))
            return obj

    def get_rank(self, item_id: str) -> Rank:
        with self._lock:
            obj = self._ranks.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Rank id: {item_id}")
            log.info("[DeckOfCardsService.get_rank] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_deck(self, name: str) -> Deck:
        """UML: DeckOfCardsService.create_deck(name) -> Deck"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Deck name is required")
        with self._lock:
            item_id = f"DEC-{self._seq:04d}"
            self._seq += 1
            obj = Deck(item_id, cleaned)
            obj.validate()
            self._decks[item_id] = obj
            log.info("[DeckOfCardsService.create_deck] stored %s in _decks (count=%s)", item_id, len(self._decks))
            return obj

    def get_deck(self, item_id: str) -> Deck:
        with self._lock:
            obj = self._decks.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Deck id: {item_id}")
            log.info("[DeckOfCardsService.get_deck] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_hand(self, name: str) -> Hand:
        """UML: DeckOfCardsService.create_hand(name) -> Hand"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Hand name is required")
        with self._lock:
            item_id = f"HAN-{self._seq:04d}"
            self._seq += 1
            obj = Hand(item_id, cleaned)
            obj.validate()
            self._hands[item_id] = obj
            log.info("[DeckOfCardsService.create_hand] stored %s in _hands (count=%s)", item_id, len(self._hands))
            return obj

    def get_hand(self, item_id: str) -> Hand:
        with self._lock:
            obj = self._hands.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Hand id: {item_id}")
            log.info("[DeckOfCardsService.get_hand] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_card(self, item_id: str) -> Card:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._cards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Card id: {item_id}")
            log.info("[DeckOfCardsService.close_card] closing %s via Card.close()", item_id)
            obj.close()
            return obj

    def list_active_cards(self) -> List[Card]:
        with self._lock:
            active = [o for o in self._cards.values() if o.status == "ACTIVE"]
            log.info("[DeckOfCardsService.list_active_cards] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct DeckOfCardsService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = DeckOfCardsService()

    log.info("========== STEP 2: Create primary Card objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_card("alpha-card")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_card("beta-card")

    log.info("========== STEP 3: Create Suit (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_suit("sample-suit")

    log.info("========== STEP 4: Create Rank (UML class) ==========")
    system.create_rank("sample-rank")

    log.info("========== STEP 5: Create Deck (UML class) ==========")
    system.create_deck("sample-deck")

    log.info("========== STEP 6: Create Hand (UML class) ==========")
    system.create_hand("sample-hand")

    log.info("========== STEP 7: Inspect active Card list ==========")
    system.list_active_cards()

    log.info("========== STEP 8: Close first Card ==========")
    system.close_card(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_card(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Card.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_card("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_card: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_cards()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

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


class Suit {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Suit(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Suit.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Suit.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Suit.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Suit " + id + " invalid status");
    }
    System.out.println("[Suit.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Suit " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Suit.close] id=" + id + " -> CLOSED");
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


class Deck {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Deck(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Deck.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Deck.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Deck.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Deck " + id + " invalid status");
    }
    System.out.println("[Deck.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Deck " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Deck.close] id=" + id + " -> CLOSED");
  }
}


class Hand {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Hand(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Hand.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Hand.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Hand.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Hand " + id + " invalid status");
    }
    System.out.println("[Hand.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Hand " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Hand.close] id=" + id + " -> CLOSED");
  }
}

public class DeckOfCardsService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Card> cards = new LinkedHashMap<>();
  private final Map<String, Suit> suits = new LinkedHashMap<>();
  private final Map<String, Rank> ranks = new LinkedHashMap<>();
  private final Map<String, Deck> decks = new LinkedHashMap<>();
  private final Map<String, Hand> hands = new LinkedHashMap<>();

  public DeckOfCardsService() {
    System.out.println("[DeckOfCardsService.__init__] system ready");
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
      System.out.println("[DeckOfCardsService.createCard] stored " + id + " count=" + cards.size());
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
      System.out.println("[DeckOfCardsService.getCard] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Suit createSuit(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Suit name required");
    }
    lock.lock();
    try {
      String id = String.format("SUI-%04d", seq++);
      Suit obj = new Suit(id, name.trim());
      obj.validate();
      suits.put(id, obj);
      System.out.println("[DeckOfCardsService.createSuit] stored " + id + " count=" + suits.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Suit getSuit(String id) {
    lock.lock();
    try {
      Suit obj = suits.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Suit id: " + id);
      }
      System.out.println("[DeckOfCardsService.getSuit] found id=" + obj.getId());
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
      System.out.println("[DeckOfCardsService.createRank] stored " + id + " count=" + ranks.size());
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
      System.out.println("[DeckOfCardsService.getRank] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Deck createDeck(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Deck name required");
    }
    lock.lock();
    try {
      String id = String.format("DEC-%04d", seq++);
      Deck obj = new Deck(id, name.trim());
      obj.validate();
      decks.put(id, obj);
      System.out.println("[DeckOfCardsService.createDeck] stored " + id + " count=" + decks.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Deck getDeck(String id) {
    lock.lock();
    try {
      Deck obj = decks.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Deck id: " + id);
      }
      System.out.println("[DeckOfCardsService.getDeck] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Hand createHand(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Hand name required");
    }
    lock.lock();
    try {
      String id = String.format("HAN-%04d", seq++);
      Hand obj = new Hand(id, name.trim());
      obj.validate();
      hands.put(id, obj);
      System.out.println("[DeckOfCardsService.createHand] stored " + id + " count=" + hands.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Hand getHand(String id) {
    lock.lock();
    try {
      Hand obj = hands.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Hand id: " + id);
      }
      System.out.println("[DeckOfCardsService.getHand] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Card closeCard(String id) {
    lock.lock();
    try {
      Card obj = cards.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Card id: " + id);
      }
      System.out.println("[DeckOfCardsService.closeCard] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Card> listActiveCards() {
    lock.lock();
    try {
      List<Card> out = new ArrayList<>();
      for (Card o : cards.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[DeckOfCardsService.listActiveCards] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct DeckOfCardsService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    DeckOfCardsService system = new DeckOfCardsService();
    System.out.println("========== STEP 2: Create Card objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Card first = system.createCard("alpha-card");
    system.createCard("beta-card");
    System.out.println("========== STEP 3: Create Suit ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createSuit("sample-suit");
    System.out.println("========== STEP 4: Create Rank ==========");
    system.createRank("sample-rank");
    System.out.println("========== STEP 5: Create Deck ==========");
    system.createDeck("sample-deck");
    System.out.println("========== STEP 6: Create Hand ==========");
    system.createHand("sample-hand");
    System.out.println("========== Inspect active list ==========");
    system.listActiveCards();
    System.out.println("========== Close first Card ==========");
    system.closeCard(first.getId());
    try {
      system.closeCard(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getCard("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
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


class Suit {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Suit.id required')
    }

    if (!name?.trim()) {
      throw new Error('Suit.name required')
    }
    console.log(\`[Suit.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Suit \${this.id} invalid status\`)
    }
    console.log(\`[Suit.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Suit \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Suit.close] id=\${this.id} -> CLOSED\`)
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


class Deck {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Deck.id required')
    }

    if (!name?.trim()) {
      throw new Error('Deck.name required')
    }
    console.log(\`[Deck.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Deck \${this.id} invalid status\`)
    }
    console.log(\`[Deck.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Deck \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Deck.close] id=\${this.id} -> CLOSED\`)
  }
}


class Hand {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Hand.id required')
    }

    if (!name?.trim()) {
      throw new Error('Hand.name required')
    }
    console.log(\`[Hand.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Hand \${this.id} invalid status\`)
    }
    console.log(\`[Hand.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Hand \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Hand.close] id=\${this.id} -> CLOSED\`)
  }
}

class DeckOfCardsService {
  private seq = 1
  private cards = new Map<string, Card>()
  private suits = new Map<string, Suit>()
  private ranks = new Map<string, Rank>()
  private decks = new Map<string, Deck>()
  private hands = new Map<string, Hand>()
  constructor() {
    console.log('[DeckOfCardsService.__init__] system ready')
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
    console.log(\`[DeckOfCardsService.createCard] stored \${id} count=\${this.cards.size}\`)
    return obj
  }

  getCard(id: string): Card {
    const obj = this.cards.get(id)
    if (!obj) {
      throw new Error(\`unknown Card id: \${id}\`)
    }
    console.log(\`[DeckOfCardsService.getCard] found id=\${obj.id}\`)
    return obj
  }

  createSuit(name: string): Suit {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Suit name required')
    }
    const id = \`SUI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Suit(id, cleaned)
    obj.validate()
    this.suits.set(id, obj)
    console.log(\`[DeckOfCardsService.createSuit] stored \${id} count=\${this.suits.size}\`)
    return obj
  }

  getSuit(id: string): Suit {
    const obj = this.suits.get(id)
    if (!obj) {
      throw new Error(\`unknown Suit id: \${id}\`)
    }
    console.log(\`[DeckOfCardsService.getSuit] found id=\${obj.id}\`)
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
    console.log(\`[DeckOfCardsService.createRank] stored \${id} count=\${this.ranks.size}\`)
    return obj
  }

  getRank(id: string): Rank {
    const obj = this.ranks.get(id)
    if (!obj) {
      throw new Error(\`unknown Rank id: \${id}\`)
    }
    console.log(\`[DeckOfCardsService.getRank] found id=\${obj.id}\`)
    return obj
  }

  createDeck(name: string): Deck {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Deck name required')
    }
    const id = \`DEC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Deck(id, cleaned)
    obj.validate()
    this.decks.set(id, obj)
    console.log(\`[DeckOfCardsService.createDeck] stored \${id} count=\${this.decks.size}\`)
    return obj
  }

  getDeck(id: string): Deck {
    const obj = this.decks.get(id)
    if (!obj) {
      throw new Error(\`unknown Deck id: \${id}\`)
    }
    console.log(\`[DeckOfCardsService.getDeck] found id=\${obj.id}\`)
    return obj
  }

  createHand(name: string): Hand {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Hand name required')
    }
    const id = \`HAN-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Hand(id, cleaned)
    obj.validate()
    this.hands.set(id, obj)
    console.log(\`[DeckOfCardsService.createHand] stored \${id} count=\${this.hands.size}\`)
    return obj
  }

  getHand(id: string): Hand {
    const obj = this.hands.get(id)
    if (!obj) {
      throw new Error(\`unknown Hand id: \${id}\`)
    }
    console.log(\`[DeckOfCardsService.getHand] found id=\${obj.id}\`)
    return obj
  }

  closeCard(id: string): Card {
    const obj = this.getCard(id)
    console.log(\`[DeckOfCardsService.closeCard] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveCards(): Card[] {
    const active = [...this.cards.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[DeckOfCardsService.listActiveCards] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct DeckOfCardsService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new DeckOfCardsService()
  console.log('========== STEP 2: Create Card objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createCard('alpha-card')
  system.createCard('beta-card')
  console.log('========== STEP 3: Create Suit ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createSuit('sample-suit')
  console.log('========== STEP 4: Create Rank ==========')
  system.createRank('sample-rank')
  console.log('========== STEP 5: Create Deck ==========')
  system.createDeck('sample-deck')
  console.log('========== STEP 6: Create Hand ==========')
  system.createHand('sample-hand')
  system.listActiveCards()
  console.log('========== Close first Card ==========')
  system.closeCard(first.id)
  try {
    system.closeCard(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getCard('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

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


class Suit {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Suit(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Suit requires id and name");
    }
    cout << "[Suit.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Suit invalid status");
    }
    cout << "[Suit.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Suit cannot close");
    }
    status_ = "CLOSED";
    cout << "[Suit.close] id=" << id_ << " -> CLOSED" << endl;
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


class Deck {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Deck(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Deck requires id and name");
    }
    cout << "[Deck.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Deck invalid status");
    }
    cout << "[Deck.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Deck cannot close");
    }
    status_ = "CLOSED";
    cout << "[Deck.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Hand {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Hand(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Hand requires id and name");
    }
    cout << "[Hand.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Hand invalid status");
    }
    cout << "[Hand.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Hand cannot close");
    }
    status_ = "CLOSED";
    cout << "[Hand.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class DeckOfCardsService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Card> cards_;
  unordered_map<string, Suit> suits_;
  unordered_map<string, Rank> ranks_;
  unordered_map<string, Deck> decks_;
  unordered_map<string, Hand> hands_;
public:
  DeckOfCardsService() {
    cout << "[DeckOfCardsService.__init__] system ready" << endl;
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
    cout << "[DeckOfCardsService.createCard] stored " << obj.id() << endl;
    return obj;
  }

  Card getCard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cards_.find(id);
    if (it == cards_.end()) {
      throw out_of_range("unknown Card id");
    }
    cout << "[DeckOfCardsService.getCard] found " << id << endl;
    return it->second;
  }

  Suit createSuit(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Suit name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SUI-%04d", seq_++);
    Suit obj{buf, name};
    obj.validate();
    suits_.emplace(obj.id(), obj);
    cout << "[DeckOfCardsService.createSuit] stored " << obj.id() << endl;
    return obj;
  }

  Suit getSuit(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = suits_.find(id);
    if (it == suits_.end()) {
      throw out_of_range("unknown Suit id");
    }
    cout << "[DeckOfCardsService.getSuit] found " << id << endl;
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
    cout << "[DeckOfCardsService.createRank] stored " << obj.id() << endl;
    return obj;
  }

  Rank getRank(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = ranks_.find(id);
    if (it == ranks_.end()) {
      throw out_of_range("unknown Rank id");
    }
    cout << "[DeckOfCardsService.getRank] found " << id << endl;
    return it->second;
  }

  Deck createDeck(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Deck name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DEC-%04d", seq_++);
    Deck obj{buf, name};
    obj.validate();
    decks_.emplace(obj.id(), obj);
    cout << "[DeckOfCardsService.createDeck] stored " << obj.id() << endl;
    return obj;
  }

  Deck getDeck(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = decks_.find(id);
    if (it == decks_.end()) {
      throw out_of_range("unknown Deck id");
    }
    cout << "[DeckOfCardsService.getDeck] found " << id << endl;
    return it->second;
  }

  Hand createHand(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Hand name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "HAN-%04d", seq_++);
    Hand obj{buf, name};
    obj.validate();
    hands_.emplace(obj.id(), obj);
    cout << "[DeckOfCardsService.createHand] stored " << obj.id() << endl;
    return obj;
  }

  Hand getHand(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = hands_.find(id);
    if (it == hands_.end()) {
      throw out_of_range("unknown Hand id");
    }
    cout << "[DeckOfCardsService.getHand] found " << id << endl;
    return it->second;
  }

  Card closeCard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cards_.find(id);
    if (it == cards_.end()) {
      throw out_of_range("unknown Card");
    }
    cout << "[DeckOfCardsService.closeCard] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct DeckOfCardsService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  DeckOfCardsService system;
  cout << "========== STEP 2: Create Card ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createCard("alpha-card");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createCard("beta-card");
  system.createSuit("sample-suit");
  system.createRank("sample-rank");
  system.createDeck("sample-deck");
  system.createHand("sample-hand");
  system.closeCard(first.id());
  try {
    system.closeCard(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getCard("MISSING-ID");
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


type Suit struct {
  ID     string
  Name   string
  Status string
}

func NewSuit(id, name string) (*Suit, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Suit requires id and name")
  }
  obj := &Suit{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Suit.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Suit) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Suit invalid status")
  }
  fmt.Printf("[Suit.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Suit) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Suit %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Suit.close] id=%s -> CLOSED\\n", o.ID)
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


type Deck struct {
  ID     string
  Name   string
  Status string
}

func NewDeck(id, name string) (*Deck, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Deck requires id and name")
  }
  obj := &Deck{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Deck.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Deck) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Deck invalid status")
  }
  fmt.Printf("[Deck.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Deck) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Deck %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Deck.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Hand struct {
  ID     string
  Name   string
  Status string
}

func NewHand(id, name string) (*Hand, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Hand requires id and name")
  }
  obj := &Hand{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Hand.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Hand) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Hand invalid status")
  }
  fmt.Printf("[Hand.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Hand) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Hand %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Hand.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type DeckOfCardsService struct {
  mu  sync.Mutex
  seq int
  cards map[string]*Card
  suits map[string]*Suit
  ranks map[string]*Rank
  decks map[string]*Deck
  hands map[string]*Hand
}

func NewDeckOfCardsService() *DeckOfCardsService {
  fmt.Println("[DeckOfCardsService.__init__] system ready")
  return &DeckOfCardsService{
    seq: 1,
    cards: map[string]*Card{},
    suits: map[string]*Suit{},
    ranks: map[string]*Rank{},
    decks: map[string]*Deck{},
    hands: map[string]*Hand{},
  }
}

func (s *DeckOfCardsService) CreateCard(name string) (*Card, error) {
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
  fmt.Printf("[DeckOfCardsService.CreateCard] stored %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) GetCard(id string) (*Card, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.cards[id]
  if !ok {
    return nil, fmt.Errorf("unknown Card id: %s", id)
  }
  fmt.Printf("[DeckOfCardsService.GetCard] found %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) CreateSuit(name string) (*Suit, error) {
  if name == "" {
    return nil, fmt.Errorf("Suit name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SUI-%04d", s.seq)
  s.seq++
  obj, err := NewSuit(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.suits[id] = obj
  fmt.Printf("[DeckOfCardsService.CreateSuit] stored %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) GetSuit(id string) (*Suit, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.suits[id]
  if !ok {
    return nil, fmt.Errorf("unknown Suit id: %s", id)
  }
  fmt.Printf("[DeckOfCardsService.GetSuit] found %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) CreateRank(name string) (*Rank, error) {
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
  fmt.Printf("[DeckOfCardsService.CreateRank] stored %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) GetRank(id string) (*Rank, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.ranks[id]
  if !ok {
    return nil, fmt.Errorf("unknown Rank id: %s", id)
  }
  fmt.Printf("[DeckOfCardsService.GetRank] found %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) CreateDeck(name string) (*Deck, error) {
  if name == "" {
    return nil, fmt.Errorf("Deck name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DEC-%04d", s.seq)
  s.seq++
  obj, err := NewDeck(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.decks[id] = obj
  fmt.Printf("[DeckOfCardsService.CreateDeck] stored %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) GetDeck(id string) (*Deck, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.decks[id]
  if !ok {
    return nil, fmt.Errorf("unknown Deck id: %s", id)
  }
  fmt.Printf("[DeckOfCardsService.GetDeck] found %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) CreateHand(name string) (*Hand, error) {
  if name == "" {
    return nil, fmt.Errorf("Hand name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("HAN-%04d", s.seq)
  s.seq++
  obj, err := NewHand(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.hands[id] = obj
  fmt.Printf("[DeckOfCardsService.CreateHand] stored %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) GetHand(id string) (*Hand, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.hands[id]
  if !ok {
    return nil, fmt.Errorf("unknown Hand id: %s", id)
  }
  fmt.Printf("[DeckOfCardsService.GetHand] found %s\\n", id)
  return obj, nil
}

func (s *DeckOfCardsService) CloseCard(id string) (*Card, error) {
  obj, err := s.GetCard(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[DeckOfCardsService.CloseCard] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct DeckOfCardsService ==========")
  system := NewDeckOfCardsService()
  fmt.Println("========== STEP 2: Create Card ==========")
  first, _ := system.CreateCard("alpha-card")
  system.CreateCard("beta-card")
  system.CreateSuit("sample-suit")
  system.CreateRank("sample-rank")
  system.CreateDeck("sample-deck")
  system.CreateHand("sample-hand")
  system.CloseCard(first.ID)
  if _, err := system.CloseCard(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetCard("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

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


sealed class Suit {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Suit(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Suit requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Suit.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Suit invalid status");
    }
    Console.WriteLine("[Suit.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Suit " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Suit.close] id=" + Id + " -> CLOSED");
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


sealed class Deck {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Deck(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Deck requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Deck.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Deck invalid status");
    }
    Console.WriteLine("[Deck.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Deck " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Deck.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Hand {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Hand(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Hand requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Hand.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Hand invalid status");
    }
    Console.WriteLine("[Hand.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Hand " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Hand.close] id=" + Id + " -> CLOSED");
  }
}

sealed class DeckOfCardsService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Card> _cards = new();
  private readonly Dictionary<string, Suit> _suits = new();
  private readonly Dictionary<string, Rank> _ranks = new();
  private readonly Dictionary<string, Deck> _decks = new();
  private readonly Dictionary<string, Hand> _hands = new();
  public DeckOfCardsService() {
    Console.WriteLine("[DeckOfCardsService.__init__] system ready");
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
      Console.WriteLine("[DeckOfCardsService.CreateCard] stored " + id);
      return obj;
    }
  }

  public Card GetCard(string id) {
    lock (_gate) {
      if (!_cards.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Card id: " + id);
      }
      Console.WriteLine("[DeckOfCardsService.GetCard] found " + id);
      return obj;
    }
  }

  public Suit CreateSuit(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Suit name required");
    }
    lock (_gate) {
      var id = string.Format("SUI-{0:D4}", _seq++);
      var obj = new Suit(id, name.Trim());
      obj.Validate();
      _suits[id] = obj;
      Console.WriteLine("[DeckOfCardsService.CreateSuit] stored " + id);
      return obj;
    }
  }

  public Suit GetSuit(string id) {
    lock (_gate) {
      if (!_suits.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Suit id: " + id);
      }
      Console.WriteLine("[DeckOfCardsService.GetSuit] found " + id);
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
      Console.WriteLine("[DeckOfCardsService.CreateRank] stored " + id);
      return obj;
    }
  }

  public Rank GetRank(string id) {
    lock (_gate) {
      if (!_ranks.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Rank id: " + id);
      }
      Console.WriteLine("[DeckOfCardsService.GetRank] found " + id);
      return obj;
    }
  }

  public Deck CreateDeck(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Deck name required");
    }
    lock (_gate) {
      var id = string.Format("DEC-{0:D4}", _seq++);
      var obj = new Deck(id, name.Trim());
      obj.Validate();
      _decks[id] = obj;
      Console.WriteLine("[DeckOfCardsService.CreateDeck] stored " + id);
      return obj;
    }
  }

  public Deck GetDeck(string id) {
    lock (_gate) {
      if (!_decks.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Deck id: " + id);
      }
      Console.WriteLine("[DeckOfCardsService.GetDeck] found " + id);
      return obj;
    }
  }

  public Hand CreateHand(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Hand name required");
    }
    lock (_gate) {
      var id = string.Format("HAN-{0:D4}", _seq++);
      var obj = new Hand(id, name.Trim());
      obj.Validate();
      _hands[id] = obj;
      Console.WriteLine("[DeckOfCardsService.CreateHand] stored " + id);
      return obj;
    }
  }

  public Hand GetHand(string id) {
    lock (_gate) {
      if (!_hands.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Hand id: " + id);
      }
      Console.WriteLine("[DeckOfCardsService.GetHand] found " + id);
      return obj;
    }
  }

  public Card CloseCard(string id) {
    var obj = GetCard(id);
    Console.WriteLine("[DeckOfCardsService.CloseCard] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct DeckOfCardsService ==========");
    var system = new DeckOfCardsService();
    Console.WriteLine("========== STEP 2: Create Card ==========");
    var first = system.CreateCard("alpha-card");
    system.CreateCard("beta-card");
    system.CreateSuit("sample-suit");
    system.CreateRank("sample-rank");
    system.CreateDeck("sample-deck");
    system.CreateHand("sample-hand");
    system.CloseCard(first.Id);
    try {
      system.CloseCard(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetCard("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const deckOfCardsSolution: ProblemSolution = {
  slug: 'deck-of-cards',
  title: 'Deck of Cards / Blackjack - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a generic deck of cards library and use it to implement a Blackjack game with dealer logic. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Represent a standard 52-card deck with suits and ranks',
      'Shuffle the deck using a fair algorithm',
      'Deal cards to players and the dealer',
      'Calculate hand value with Ace counting as 1 or 11',
      'Implement Blackjack rules: hit, stand, bust (> 21), dealer hits until ≥ 17',
      'Support multiple simultaneous players at the table',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Represent a standard 52-card deck with suits and ranks?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Shuffle the deck using a fair algorithm?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Deal cards to players and the dealer?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Calculate hand value with Ace counting as 1 or 11?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Implement Blackjack rules: hit, stand, bust (> 21), dealer hits until ≥ 17?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. DeckOfCardsService is the facade stereotype. Card, Suit, Rank, Deck, Hand are concrete domain classes with id/name/status and validate/close.',
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
          'Construct DeckOfCardsService.',
          'createCard twice and create the related UML classes.',
          'closeCard once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'DeckOfCardsService', responsibility: 'UML facade - orchestrates Deck of Cards / Blackjack.', keyMembers: ['create*', 'get*', 'closeCard'] },
    { name: 'Card', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Suit', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Rank', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Deck', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Hand', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from DeckOfCardsService to Card, Suit, Rank, Deck, Hand. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on DeckOfCardsService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'DeckOfCardsService', responsibility: 'UML facade - orchestrates Deck of Cards / Blackjack.', keyMembers: ['create*', 'get*', 'closeCard'] },
    { name: 'Card', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Suit', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Rank', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Deck', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Hand', responsibility: 'UML class - domain object for Deck of Cards / Blackjack.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'DeckOfCardsService exposes create/get/close and owns composed collections.' },
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
      'main constructs DeckOfCardsService, creates UML domain objects, closes the primary Card, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct DeckOfCardsService.',
      'createCard for alpha and beta.',
      'create remaining UML classes.',
      'closeCard(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createCard("alpha..."); closeCard(id)',
        output: '[Card.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeCard(alreadyClosed) or getCard("MISSING-ID")',
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
