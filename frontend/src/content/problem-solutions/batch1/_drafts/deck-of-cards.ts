import type { ProblemSolution } from '../types'
import { abstractCls, attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  // Row 1 - orchestration, deck, card
  cls('gm', 'BlackjackGame', 40, 40, [
    attr('-', 'deck', 'Deck'),
    attr('-', 'players', 'List<Player>'),
    attr('-', 'dealer', 'Dealer'),
    attr('-', 'state', 'GameState'),
    attr('-', 'current', 'int'),
  ], [
    method('+', 'addPlayer', 'name, decider?', 'Player'),
    method('+', 'start', '', 'void'),
    method('+', 'hit', 'player: Player', 'Card'),
    method('+', 'stand', 'player: Player', 'void'),
    method('+', 'outcomes', '', 'Map<Player, Outcome>'),
    method('+', 'winners', '', 'List<Player>'),
  ]),
  cls('dk', 'Deck', 420, 40, [
    attr('-', 'cards', 'List<Card>'),
    attr('-', 'rng', 'Random'),
  ], [
    method('+', 'reset', '', 'void'),
    method('+', 'shuffle', '', 'void'),
    method('+', 'deal', '', 'Card'),
    method('+', 'remaining', '', 'int'),
  ]),
  cls('cd', 'Card', 800, 40, [
    attr('+', 'rank', 'Rank'),
    attr('+', 'suit', 'Suit'),
  ], [], 'immutable'),
  enm('su', 'Suit', 1180, 40, ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES']),
  enm('rk', 'Rank', 1180, 220, ['ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING']),

  // Row 2 - participants, hand, strategy
  enm('gs', 'GameState', 40, 460, ['LOBBY', 'DEALING', 'PLAYER_TURNS', 'DEALER_TURN', 'FINISHED']),
  abstractCls('pt', 'Participant', 420, 460, [
    attr('#', 'name', 'string'),
    attr('#', 'hand', 'Hand'),
    attr('+', 'stood', 'bool'),
  ], [
    method('+', 'decide', '', 'Action', { isAbstract: true }),
  ]),
  cls('hd', 'Hand', 800, 460, [
    attr('-', 'cards', 'List<Card>'),
    attr('-', 'strategy', 'HandValueStrategy'),
  ], [
    method('+', 'add', 'card: Card', 'void'),
    method('+', 'value', '', 'int'),
    method('+', 'isBust', '', 'bool'),
    method('+', 'isBlackjack', '', 'bool'),
  ]),
  iface('hv', 'HandValueStrategy', 1180, 640, [
    method('+', 'value', 'cards: List<Card>', 'int'),
  ]),
  cls('bv', 'BlackjackValueStrategy', 1180, 800, [], [
    method('+', 'value', 'cards: List<Card>', 'int'),
  ]),

  // Row 3 - concrete participants and result enums
  cls('pl', 'Player', 40, 760, [
    attr('-', 'decider', 'Hand → Action'),
  ], [
    method('+', 'decide', '', 'Action'),
  ]),
  cls('dl', 'Dealer', 420, 760, [], [
    method('+', 'decide', '', 'Action'),
  ]),
  enm('oc', 'Outcome', 800, 760, ['WIN', 'LOSE', 'PUSH']),
  enm('ac', 'Action', 800, 920, ['HIT', 'STAND']),
]

const edges = [
  edge('e1', 'gm', 'dk', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e2', 'dk', 'cd', 'aggregation', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '52' }),
  edge('e3', 'cd', 'su', 'association', 'right', 'left'),
  edge('e4', 'cd', 'rk', 'association', 'right@85', 'left'),
  edge('e5', 'hd', 'cd', 'aggregation', 'top', 'bottom', { targetMultiplicity: '0..*' }),
  edge('e6', 'pt', 'hd', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e7', 'gm', 'pt', 'aggregation', 'bottom@70', 'top', { targetMultiplicity: '1..*' }),
  edge('e8', 'pl', 'pt', 'inheritance', 'top', 'bottom@10'),
  edge('e9', 'dl', 'pt', 'inheritance', 'top', 'bottom@60'),
  edge('e10', 'hd', 'hv', 'aggregation', 'right', 'left', { label: 'values with' }),
  edge('e11', 'bv', 'hv', 'realization', 'top', 'bottom'),
  edge('e12', 'gm', 'gs', 'association', 'bottom@15', 'top', { label: 'state' }),
]

const py = `from __future__ import annotations
import random
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Callable, Dict, List, Optional


class Suit(Enum):
    CLUBS = "C"
    DIAMONDS = "D"
    HEARTS = "H"
    SPADES = "S"


class Rank(Enum):
    ACE = 1
    TWO = 2
    THREE = 3
    FOUR = 4
    FIVE = 5
    SIX = 6
    SEVEN = 7
    EIGHT = 8
    NINE = 9
    TEN = 10
    JACK = 11
    QUEEN = 12
    KING = 13


@dataclass(frozen=True)
class Card:
    rank: Rank
    suit: Suit

    def __str__(self) -> str:
        return f"{self.rank.name.title()} of {self.suit.name.title()}"


class EmptyDeckError(RuntimeError):
    pass


class Deck:
    """52 unique cards. Fisher-Yates shuffle gives every permutation equal probability."""

    def __init__(self, rng: Optional[random.Random] = None):
        self._rng = rng or random.Random()
        self._cards: List[Card] = []
        self.reset()

    def reset(self) -> None:
        self._cards = [Card(r, s) for s in Suit for r in Rank]

    def shuffle(self) -> None:
        cards = self._cards
        for i in range(len(cards) - 1, 0, -1):
            j = self._rng.randint(0, i)  # inclusive
            cards[i], cards[j] = cards[j], cards[i]

    def deal(self) -> Card:
        if not self._cards:
            raise EmptyDeckError("deck is empty")
        return self._cards.pop()

    def remaining(self) -> int:
        return len(self._cards)


class HandValueStrategy(ABC):
    @abstractmethod
    def value(self, cards: List[Card]) -> int: ...


class BlackjackValueStrategy(HandValueStrategy):
    """Face cards = 10; Ace counts 11 unless that would bust, then 1."""

    def value(self, cards: List[Card]) -> int:
        total = sum(min(c.rank.value, 10) for c in cards)  # every ace counted as 1
        aces = sum(1 for c in cards if c.rank is Rank.ACE)
        if aces and total + 10 <= 21:
            total += 10  # promote exactly one ace to 11
        return total


class Hand:
    def __init__(self, strategy: HandValueStrategy):
        self._cards: List[Card] = []
        self._strategy = strategy

    @property
    def cards(self) -> List[Card]:
        return list(self._cards)

    def add(self, card: Card) -> None:
        self._cards.append(card)

    def clear(self) -> None:
        self._cards.clear()

    @property
    def value(self) -> int:
        return self._strategy.value(self._cards)

    @property
    def is_bust(self) -> bool:
        return self.value > 21

    @property
    def is_blackjack(self) -> bool:
        return len(self._cards) == 2 and self.value == 21


class Action(Enum):
    HIT = "hit"
    STAND = "stand"


class Outcome(Enum):
    WIN = "win"
    LOSE = "lose"
    PUSH = "push"


class GameState(Enum):
    LOBBY = 0
    DEALING = 1
    PLAYER_TURNS = 2
    DEALER_TURN = 3
    FINISHED = 4


_ALLOWED = {
    GameState.LOBBY: {GameState.DEALING},
    GameState.DEALING: {GameState.PLAYER_TURNS},
    GameState.PLAYER_TURNS: {GameState.DEALER_TURN},
    GameState.DEALER_TURN: {GameState.FINISHED},
    GameState.FINISHED: {GameState.LOBBY},
}


class Participant(ABC):
    def __init__(self, name: str, strategy: HandValueStrategy):
        self.name = name
        self.hand = Hand(strategy)
        self.stood = False

    @abstractmethod
    def decide(self) -> Action: ...


class Player(Participant):
    def __init__(self, name: str, strategy: HandValueStrategy,
                 decider: Optional[Callable[[Hand], Action]] = None):
        super().__init__(name, strategy)
        self._decider = decider or (lambda h: Action.HIT if h.value < 17 else Action.STAND)

    def decide(self) -> Action:
        return self._decider(self.hand)


class Dealer(Participant):
    """House rule: hit below 17, stand on 17 or more."""

    def __init__(self, strategy: HandValueStrategy):
        super().__init__("Dealer", strategy)

    def decide(self) -> Action:
        return Action.HIT if self.hand.value < 17 else Action.STAND


class BlackjackGame:
    def __init__(self, deck: Optional[Deck] = None, strategy: Optional[HandValueStrategy] = None):
        self._strategy = strategy or BlackjackValueStrategy()
        self.deck = deck or Deck()
        self.dealer = Dealer(self._strategy)
        self.players: List[Player] = []
        self.state = GameState.LOBBY
        self._current = 0

    # ---- state machine -------------------------------------------------
    def _transition(self, to: GameState) -> None:
        if to not in _ALLOWED[self.state]:
            raise RuntimeError(f"illegal transition {self.state.name} -> {to.name}")
        self.state = to

    def _require(self, state: GameState) -> None:
        if self.state is not state:
            raise RuntimeError(f"action not allowed in state {self.state.name}")

    # ---- lobby ---------------------------------------------------------
    def add_player(self, name: str, decider: Optional[Callable[[Hand], Action]] = None) -> Player:
        self._require(GameState.LOBBY)
        player = Player(name, self._strategy, decider)
        self.players.append(player)
        return player

    def start(self) -> None:
        self._require(GameState.LOBBY)
        if not self.players:
            raise RuntimeError("need at least one player")
        self._transition(GameState.DEALING)
        self.deck.reset()
        self.deck.shuffle()
        for _ in range(2):  # two rounds, one card each, dealer last
            for p in self.players:
                p.hand.add(self.deck.deal())
            self.dealer.hand.add(self.deck.deal())
        for p in self.players:
            p.stood = p.hand.is_blackjack  # naturals stand automatically
        self._transition(GameState.PLAYER_TURNS)
        self._current = -1
        self._advance()

    # ---- player turns --------------------------------------------------
    @property
    def current_player(self) -> Optional[Player]:
        if self.state is GameState.PLAYER_TURNS and 0 <= self._current < len(self.players):
            return self.players[self._current]
        return None

    def _check_turn(self, player: Player) -> None:
        self._require(GameState.PLAYER_TURNS)
        if player is not self.current_player:
            raise RuntimeError("not this player's turn")

    def hit(self, player: Player) -> Card:
        self._check_turn(player)
        card = self.deck.deal()
        player.hand.add(card)
        if player.hand.is_bust or player.hand.value == 21:
            player.stood = True
            self._advance()
        return card

    def stand(self, player: Player) -> None:
        self._check_turn(player)
        player.stood = True
        self._advance()

    def _advance(self) -> None:
        self._current += 1
        while self._current < len(self.players) and self.players[self._current].stood:
            self._current += 1
        if self._current >= len(self.players):
            self._play_dealer()

    def _play_dealer(self) -> None:
        self._transition(GameState.DEALER_TURN)
        if any(not p.hand.is_bust for p in self.players):  # nobody left to beat -> no draw needed
            while self.dealer.decide() is Action.HIT:
                self.dealer.hand.add(self.deck.deal())
        self._transition(GameState.FINISHED)

    def auto_play(self) -> None:
        """Convenience: let every Player's decider drive the round to completion."""
        while (p := self.current_player) is not None:
            if p.decide() is Action.HIT:
                self.hit(p)
            else:
                self.stand(p)

    # ---- results -------------------------------------------------------
    def outcomes(self) -> Dict[str, Outcome]:
        self._require(GameState.FINISHED)
        return {p.name: self._judge(p) for p in self.players}

    def winners(self) -> List[Player]:
        self._require(GameState.FINISHED)
        return [p for p in self.players if self._judge(p) is Outcome.WIN]

    def _judge(self, p: Player) -> Outcome:
        d = self.dealer.hand
        if p.hand.is_bust:
            return Outcome.LOSE
        if d.is_bust:
            return Outcome.WIN
        if p.hand.is_blackjack != d.is_blackjack:
            return Outcome.WIN if p.hand.is_blackjack else Outcome.LOSE
        if p.hand.value == d.value:
            return Outcome.PUSH
        return Outcome.WIN if p.hand.value > d.value else Outcome.LOSE

    def new_round(self) -> None:
        self._transition(GameState.LOBBY)
        for part in [*self.players, self.dealer]:
            part.hand.clear()
            part.stood = False


def demo() -> None:
    game = BlackjackGame(Deck(random.Random(7)))
    game.add_player("Alice")
    game.add_player("Bob", lambda h: Action.STAND if h.value >= 15 else Action.HIT)
    game.start()
    game.auto_play()
    print({n: o.name for n, o in game.outcomes().items()}, "dealer:", game.dealer.hand.value)


if __name__ == "__main__":
    demo()
`

const java = `import java.util.*;
import java.util.function.Function;

enum Suit { CLUBS, DIAMONDS, HEARTS, SPADES }

enum Rank {
  ACE(1), TWO(2), THREE(3), FOUR(4), FIVE(5), SIX(6), SEVEN(7), EIGHT(8),
  NINE(9), TEN(10), JACK(11), QUEEN(12), KING(13);
  final int number;
  Rank(int number) { this.number = number; }
}

record Card(Rank rank, Suit suit) {
  public String toString() { return rank + " of " + suit; }
}

class EmptyDeckException extends RuntimeException {
  EmptyDeckException() { super("deck is empty"); }
}

/** 52 unique cards; Fisher-Yates shuffle gives each permutation equal probability. */
class Deck {
  private final List<Card> cards = new ArrayList<>();
  private final Random rng;

  Deck() { this(new Random()); }
  Deck(Random rng) { this.rng = rng; reset(); }

  void reset() {
    cards.clear();
    for (Suit s : Suit.values()) for (Rank r : Rank.values()) cards.add(new Card(r, s));
  }

  void shuffle() {
    for (int i = cards.size() - 1; i > 0; i--) {
      int j = rng.nextInt(i + 1);              // 0..i inclusive
      Collections.swap(cards, i, j);
    }
  }

  Card deal() {
    if (cards.isEmpty()) throw new EmptyDeckException();
    return cards.remove(cards.size() - 1);
  }

  int remaining() { return cards.size(); }
}

interface HandValueStrategy { int value(List<Card> cards); }

class BlackjackValueStrategy implements HandValueStrategy {
  public int value(List<Card> cards) {
    int total = 0, aces = 0;
    for (Card c : cards) {
      total += Math.min(c.rank().number, 10);       // aces counted as 1 here
      if (c.rank() == Rank.ACE) aces++;
    }
    if (aces > 0 && total + 10 <= 21) total += 10;  // promote one ace to 11
    return total;
  }
}

class Hand {
  private final List<Card> cards = new ArrayList<>();
  private final HandValueStrategy strategy;
  Hand(HandValueStrategy strategy) { this.strategy = strategy; }

  void add(Card c) { cards.add(c); }
  void clear() { cards.clear(); }
  List<Card> cards() { return List.copyOf(cards); }
  int value() { return strategy.value(cards); }
  boolean isBust() { return value() > 21; }
  boolean isBlackjack() { return cards.size() == 2 && value() == 21; }
}

enum Action { HIT, STAND }
enum Outcome { WIN, LOSE, PUSH }
enum GameState {
  LOBBY, DEALING, PLAYER_TURNS, DEALER_TURN, FINISHED;
  boolean canGoTo(GameState next) {
    return switch (this) {
      case LOBBY -> next == DEALING;
      case DEALING -> next == PLAYER_TURNS;
      case PLAYER_TURNS -> next == DEALER_TURN;
      case DEALER_TURN -> next == FINISHED;
      case FINISHED -> next == LOBBY;
    };
  }
}

abstract class Participant {
  final String name;
  final Hand hand;
  boolean stood;
  Participant(String name, HandValueStrategy strategy) { this.name = name; this.hand = new Hand(strategy); }
  abstract Action decide();
}

class Player extends Participant {
  private final Function<Hand, Action> decider;
  Player(String name, HandValueStrategy s, Function<Hand, Action> decider) {
    super(name, s);
    this.decider = decider != null ? decider : h -> h.value() < 17 ? Action.HIT : Action.STAND;
  }
  Action decide() { return decider.apply(hand); }
}

/** House rule: hit below 17, stand on 17 or more. */
class Dealer extends Participant {
  Dealer(HandValueStrategy s) { super("Dealer", s); }
  Action decide() { return hand.value() < 17 ? Action.HIT : Action.STAND; }
}

class BlackjackGame {
  private final HandValueStrategy strategy;
  private final Deck deck;
  private final Dealer dealer;
  private final List<Player> players = new ArrayList<>();
  private GameState state = GameState.LOBBY;
  private int current;

  BlackjackGame() { this(new Deck(), new BlackjackValueStrategy()); }
  BlackjackGame(Deck deck, HandValueStrategy strategy) {
    this.deck = deck; this.strategy = strategy; this.dealer = new Dealer(strategy);
  }

  GameState state() { return state; }
  Dealer dealer() { return dealer; }

  private void transition(GameState next) {
    if (!state.canGoTo(next)) throw new IllegalStateException(state + " -> " + next);
    state = next;
  }
  private void require(GameState s) {
    if (state != s) throw new IllegalStateException("not allowed in " + state);
  }

  Player addPlayer(String name, Function<Hand, Action> decider) {
    require(GameState.LOBBY);
    Player p = new Player(name, strategy, decider);
    players.add(p);
    return p;
  }

  void start() {
    require(GameState.LOBBY);
    if (players.isEmpty()) throw new IllegalStateException("need at least one player");
    transition(GameState.DEALING);
    deck.reset(); deck.shuffle();
    for (int round = 0; round < 2; round++) {
      for (Player p : players) p.hand.add(deck.deal());
      dealer.hand.add(deck.deal());
    }
    for (Player p : players) p.stood = p.hand.isBlackjack();
    transition(GameState.PLAYER_TURNS);
    current = -1;
    advance();
  }

  Player currentPlayer() {
    return state == GameState.PLAYER_TURNS && current >= 0 && current < players.size() ? players.get(current) : null;
  }

  private void checkTurn(Player p) {
    require(GameState.PLAYER_TURNS);
    if (p != currentPlayer()) throw new IllegalStateException("not this player's turn");
  }

  Card hit(Player p) {
    checkTurn(p);
    Card c = deck.deal();
    p.hand.add(c);
    if (p.hand.isBust() || p.hand.value() == 21) { p.stood = true; advance(); }
    return c;
  }

  void stand(Player p) {
    checkTurn(p);
    p.stood = true;
    advance();
  }

  private void advance() {
    current++;
    while (current < players.size() && players.get(current).stood) current++;
    if (current >= players.size()) playDealer();
  }

  private void playDealer() {
    transition(GameState.DEALER_TURN);
    boolean anyAlive = players.stream().anyMatch(p -> !p.hand.isBust());
    if (anyAlive) while (dealer.decide() == Action.HIT) dealer.hand.add(deck.deal());
    transition(GameState.FINISHED);
  }

  void autoPlay() {
    Player p;
    while ((p = currentPlayer()) != null) {
      if (p.decide() == Action.HIT) hit(p); else stand(p);
    }
  }

  Map<String, Outcome> outcomes() {
    require(GameState.FINISHED);
    Map<String, Outcome> out = new LinkedHashMap<>();
    for (Player p : players) out.put(p.name, judge(p));
    return out;
  }

  List<Player> winners() {
    require(GameState.FINISHED);
    return players.stream().filter(p -> judge(p) == Outcome.WIN).toList();
  }

  private Outcome judge(Player p) {
    Hand d = dealer.hand;
    if (p.hand.isBust()) return Outcome.LOSE;
    if (d.isBust()) return Outcome.WIN;
    if (p.hand.isBlackjack() != d.isBlackjack()) return p.hand.isBlackjack() ? Outcome.WIN : Outcome.LOSE;
    if (p.hand.value() == d.value()) return Outcome.PUSH;
    return p.hand.value() > d.value() ? Outcome.WIN : Outcome.LOSE;
  }

  void newRound() {
    transition(GameState.LOBBY);
    for (Player p : players) { p.hand.clear(); p.stood = false; }
    dealer.hand.clear(); dealer.stood = false;
  }
}

public class Main {
  public static void main(String[] args) {
    BlackjackGame game = new BlackjackGame(new Deck(new Random(7)), new BlackjackValueStrategy());
    game.addPlayer("Alice", null);
    game.addPlayer("Bob", h -> h.value() >= 15 ? Action.STAND : Action.HIT);
    game.start();
    game.autoPlay();
    System.out.println(game.outcomes() + " dealer=" + game.dealer().hand.value());
  }
}
`

const ts = `export enum Suit { Clubs = 'C', Diamonds = 'D', Hearts = 'H', Spades = 'S' }
export enum Rank {
  Ace = 1, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King,
}

export interface Card { readonly rank: Rank; readonly suit: Suit }
export const cardToString = (c: Card) => Rank[c.rank] + ' of ' + c.suit

export class EmptyDeckError extends Error {
  constructor() { super('deck is empty') }
}

/** 52 unique cards; Fisher-Yates shuffle gives each permutation equal probability. */
export class Deck {
  private cards: Card[] = []

  /** rng() must return a float in [0, 1) - inject a seeded one for deterministic tests. */
  constructor(private rng: () => number = Math.random) { this.reset() }

  reset(): void {
    this.cards = []
    for (const suit of Object.values(Suit))
      for (let r = Rank.Ace; r <= Rank.King; r++) this.cards.push({ rank: r, suit })
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1)) // 0..i inclusive
      ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
    }
  }

  deal(): Card {
    const c = this.cards.pop()
    if (!c) throw new EmptyDeckError()
    return c
  }

  get remaining(): number { return this.cards.length }
}

export interface HandValueStrategy { value(cards: readonly Card[]): number }

export class BlackjackValueStrategy implements HandValueStrategy {
  value(cards: readonly Card[]): number {
    let total = cards.reduce((s, c) => s + Math.min(c.rank, 10), 0) // aces counted as 1
    const hasAce = cards.some(c => c.rank === Rank.Ace)
    if (hasAce && total + 10 <= 21) total += 10                      // promote one ace to 11
    return total
  }
}

export class Hand {
  private _cards: Card[] = []
  constructor(private strategy: HandValueStrategy) {}
  add(c: Card) { this._cards.push(c) }
  clear() { this._cards = [] }
  get cards(): readonly Card[] { return this._cards }
  get value(): number { return this.strategy.value(this._cards) }
  get isBust(): boolean { return this.value > 21 }
  get isBlackjack(): boolean { return this._cards.length === 2 && this.value === 21 }
}

export type Action = 'HIT' | 'STAND'
export type Outcome = 'WIN' | 'LOSE' | 'PUSH'
export type GameState = 'LOBBY' | 'DEALING' | 'PLAYER_TURNS' | 'DEALER_TURN' | 'FINISHED'

const ALLOWED: Record<GameState, GameState[]> = {
  LOBBY: ['DEALING'],
  DEALING: ['PLAYER_TURNS'],
  PLAYER_TURNS: ['DEALER_TURN'],
  DEALER_TURN: ['FINISHED'],
  FINISHED: ['LOBBY'],
}

export abstract class Participant {
  readonly hand: Hand
  stood = false
  constructor(readonly name: string, strategy: HandValueStrategy) { this.hand = new Hand(strategy) }
  abstract decide(): Action
}

export class Player extends Participant {
  constructor(name: string, strategy: HandValueStrategy,
              private decider: (h: Hand) => Action = h => (h.value < 17 ? 'HIT' : 'STAND')) {
    super(name, strategy)
  }
  decide(): Action { return this.decider(this.hand) }
}

/** House rule: hit below 17, stand on 17 or more. */
export class Dealer extends Participant {
  constructor(strategy: HandValueStrategy) { super('Dealer', strategy) }
  decide(): Action { return this.hand.value < 17 ? 'HIT' : 'STAND' }
}

export class BlackjackGame {
  readonly dealer: Dealer
  readonly players: Player[] = []
  state: GameState = 'LOBBY'
  private current = 0

  constructor(
    private deck: Deck = new Deck(),
    private strategy: HandValueStrategy = new BlackjackValueStrategy(),
  ) { this.dealer = new Dealer(strategy) }

  private transition(next: GameState) {
    if (!ALLOWED[this.state].includes(next)) throw new Error('illegal transition ' + this.state + ' -> ' + next)
    this.state = next
  }
  private require(s: GameState) {
    if (this.state !== s) throw new Error('not allowed in state ' + this.state)
  }

  addPlayer(name: string, decider?: (h: Hand) => Action): Player {
    this.require('LOBBY')
    const p = new Player(name, this.strategy, decider)
    this.players.push(p)
    return p
  }

  start(): void {
    this.require('LOBBY')
    if (this.players.length === 0) throw new Error('need at least one player')
    this.transition('DEALING')
    this.deck.reset()
    this.deck.shuffle()
    for (let round = 0; round < 2; round++) {
      for (const p of this.players) p.hand.add(this.deck.deal())
      this.dealer.hand.add(this.deck.deal())
    }
    for (const p of this.players) p.stood = p.hand.isBlackjack // naturals stand automatically
    this.transition('PLAYER_TURNS')
    this.current = -1
    this.advance()
  }

  get currentPlayer(): Player | null {
    return this.state === 'PLAYER_TURNS' ? this.players[this.current] ?? null : null
  }

  private checkTurn(p: Player) {
    this.require('PLAYER_TURNS')
    if (p !== this.currentPlayer) throw new Error("not this player's turn")
  }

  hit(p: Player): Card {
    this.checkTurn(p)
    const c = this.deck.deal()
    p.hand.add(c)
    if (p.hand.isBust || p.hand.value === 21) { p.stood = true; this.advance() }
    return c
  }

  stand(p: Player): void {
    this.checkTurn(p)
    p.stood = true
    this.advance()
  }

  private advance(): void {
    this.current++
    while (this.current < this.players.length && this.players[this.current].stood) this.current++
    if (this.current >= this.players.length) this.playDealer()
  }

  private playDealer(): void {
    this.transition('DEALER_TURN')
    if (this.players.some(p => !p.hand.isBust)) {
      while (this.dealer.decide() === 'HIT') this.dealer.hand.add(this.deck.deal())
    }
    this.transition('FINISHED')
  }

  autoPlay(): void {
    for (let p = this.currentPlayer; p; p = this.currentPlayer) {
      if (p.decide() === 'HIT') this.hit(p); else this.stand(p)
    }
  }

  outcomes(): Record<string, Outcome> {
    this.require('FINISHED')
    return Object.fromEntries(this.players.map(p => [p.name, this.judge(p)]))
  }

  winners(): Player[] {
    this.require('FINISHED')
    return this.players.filter(p => this.judge(p) === 'WIN')
  }

  private judge(p: Player): Outcome {
    const d = this.dealer.hand
    if (p.hand.isBust) return 'LOSE'
    if (d.isBust) return 'WIN'
    if (p.hand.isBlackjack !== d.isBlackjack) return p.hand.isBlackjack ? 'WIN' : 'LOSE'
    if (p.hand.value === d.value) return 'PUSH'
    return p.hand.value > d.value ? 'WIN' : 'LOSE'
  }

  newRound(): void {
    this.transition('LOBBY')
    for (const part of [...this.players, this.dealer]) { part.hand.clear(); part.stood = false }
  }
}
`

const cpp = `#include <algorithm>
#include <functional>
#include <iostream>
#include <map>
#include <memory>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

enum class Suit { Clubs, Diamonds, Hearts, Spades };
enum class Rank { Ace = 1, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King };
enum class Action { Hit, Stand };
enum class Outcome { Win, Lose, Push };
enum class GameState { Lobby, Dealing, PlayerTurns, DealerTurn, Finished };

struct Card {
  Rank rank;
  Suit suit;
};

class Deck {
  std::vector<Card> cards_;
  std::mt19937 rng_;
public:
  explicit Deck(unsigned seed = std::random_device{}()) : rng_(seed) { reset(); }

  void reset() {
    cards_.clear();
    for (int s = 0; s < 4; ++s)
      for (int r = 1; r <= 13; ++r) cards_.push_back({static_cast<Rank>(r), static_cast<Suit>(s)});
  }
  // Fisher-Yates: every permutation equally likely.
  void shuffle() {
    for (int i = static_cast<int>(cards_.size()) - 1; i > 0; --i) {
      std::uniform_int_distribution<int> dist(0, i);      // inclusive
      std::swap(cards_[i], cards_[dist(rng_)]);
    }
  }
  Card deal() {
    if (cards_.empty()) throw std::runtime_error("deck is empty");
    Card c = cards_.back();
    cards_.pop_back();
    return c;
  }
  size_t remaining() const { return cards_.size(); }
};

class HandValueStrategy {
public:
  virtual ~HandValueStrategy() = default;
  virtual int value(const std::vector<Card>& cards) const = 0;
};

class BlackjackValueStrategy : public HandValueStrategy {
public:
  int value(const std::vector<Card>& cards) const override {
    int total = 0;
    bool ace = false;
    for (const auto& c : cards) {
      total += std::min(static_cast<int>(c.rank), 10);    // aces counted as 1
      ace |= c.rank == Rank::Ace;
    }
    if (ace && total + 10 <= 21) total += 10;              // promote one ace to 11
    return total;
  }
};

class Hand {
  std::vector<Card> cards_;
  std::shared_ptr<const HandValueStrategy> strategy_;
public:
  explicit Hand(std::shared_ptr<const HandValueStrategy> s) : strategy_(std::move(s)) {}
  void add(Card c) { cards_.push_back(c); }
  void clear() { cards_.clear(); }
  const std::vector<Card>& cards() const { return cards_; }
  int value() const { return strategy_->value(cards_); }
  bool isBust() const { return value() > 21; }
  bool isBlackjack() const { return cards_.size() == 2 && value() == 21; }
};

class Participant {
public:
  Participant(std::string name, std::shared_ptr<const HandValueStrategy> s)
    : name(std::move(name)), hand(std::move(s)) {}
  virtual ~Participant() = default;
  virtual Action decide() = 0;
  std::string name;
  Hand hand;
  bool stood = false;
};

class Player : public Participant {
  std::function<Action(const Hand&)> decider_;
public:
  Player(std::string n, std::shared_ptr<const HandValueStrategy> s, std::function<Action(const Hand&)> d = nullptr)
    : Participant(std::move(n), std::move(s)),
      decider_(d ? std::move(d) : [](const Hand& h) { return h.value() < 17 ? Action::Hit : Action::Stand; }) {}
  Action decide() override { return decider_(hand); }
};

// House rule: hit below 17, stand on 17 or more.
class Dealer : public Participant {
public:
  explicit Dealer(std::shared_ptr<const HandValueStrategy> s) : Participant("Dealer", std::move(s)) {}
  Action decide() override { return hand.value() < 17 ? Action::Hit : Action::Stand; }
};

class BlackjackGame {
  std::shared_ptr<const HandValueStrategy> strategy_;
  Deck deck_;
  Dealer dealer_;
  std::vector<std::unique_ptr<Player>> players_;
  GameState state_ = GameState::Lobby;
  int current_ = 0;

  static bool allowed(GameState from, GameState to) {
    switch (from) {
      case GameState::Lobby: return to == GameState::Dealing;
      case GameState::Dealing: return to == GameState::PlayerTurns;
      case GameState::PlayerTurns: return to == GameState::DealerTurn;
      case GameState::DealerTurn: return to == GameState::Finished;
      case GameState::Finished: return to == GameState::Lobby;
    }
    return false;
  }
  void transition(GameState to) {
    if (!allowed(state_, to)) throw std::logic_error("illegal state transition");
    state_ = to;
  }
  void require(GameState s) const { if (state_ != s) throw std::logic_error("action not allowed in this state"); }

  void advance() {
    ++current_;
    while (current_ < static_cast<int>(players_.size()) && players_[current_]->stood) ++current_;
    if (current_ >= static_cast<int>(players_.size())) playDealer();
  }
  void playDealer() {
    transition(GameState::DealerTurn);
    bool anyAlive = std::any_of(players_.begin(), players_.end(), [](auto& p) { return !p->hand.isBust(); });
    if (anyAlive) while (dealer_.decide() == Action::Hit) dealer_.hand.add(deck_.deal());
    transition(GameState::Finished);
  }
  Outcome judge(const Player& p) const {
    const Hand& d = dealer_.hand;
    if (p.hand.isBust()) return Outcome::Lose;
    if (d.isBust()) return Outcome::Win;
    if (p.hand.isBlackjack() != d.isBlackjack()) return p.hand.isBlackjack() ? Outcome::Win : Outcome::Lose;
    if (p.hand.value() == d.value()) return Outcome::Push;
    return p.hand.value() > d.value() ? Outcome::Win : Outcome::Lose;
  }
public:
  explicit BlackjackGame(Deck deck = Deck(),
                         std::shared_ptr<const HandValueStrategy> s = std::make_shared<BlackjackValueStrategy>())
    : strategy_(s), deck_(std::move(deck)), dealer_(s) {}

  GameState state() const { return state_; }
  const Dealer& dealer() const { return dealer_; }

  Player& addPlayer(const std::string& name, std::function<Action(const Hand&)> decider = nullptr) {
    require(GameState::Lobby);
    players_.push_back(std::make_unique<Player>(name, strategy_, std::move(decider)));
    return *players_.back();
  }

  void start() {
    require(GameState::Lobby);
    if (players_.empty()) throw std::logic_error("need at least one player");
    transition(GameState::Dealing);
    deck_.reset();
    deck_.shuffle();
    for (int round = 0; round < 2; ++round) {
      for (auto& p : players_) p->hand.add(deck_.deal());
      dealer_.hand.add(deck_.deal());
    }
    for (auto& p : players_) p->stood = p->hand.isBlackjack();
    transition(GameState::PlayerTurns);
    current_ = -1;
    advance();
  }

  Player* currentPlayer() {
    if (state_ != GameState::PlayerTurns || current_ < 0 || current_ >= static_cast<int>(players_.size())) return nullptr;
    return players_[current_].get();
  }

  Card hit(Player& p) {
    require(GameState::PlayerTurns);
    if (&p != currentPlayer()) throw std::logic_error("not this player's turn");
    Card c = deck_.deal();
    p.hand.add(c);
    if (p.hand.isBust() || p.hand.value() == 21) { p.stood = true; advance(); }
    return c;
  }

  void stand(Player& p) {
    require(GameState::PlayerTurns);
    if (&p != currentPlayer()) throw std::logic_error("not this player's turn");
    p.stood = true;
    advance();
  }

  void autoPlay() {
    while (Player* p = currentPlayer()) {
      if (p->decide() == Action::Hit) hit(*p); else stand(*p);
    }
  }

  std::map<std::string, Outcome> outcomes() const {
    require(GameState::Finished);
    std::map<std::string, Outcome> out;
    for (auto& p : players_) out[p->name] = judge(*p);
    return out;
  }

  std::vector<std::string> winners() const {
    require(GameState::Finished);
    std::vector<std::string> out;
    for (auto& p : players_) if (judge(*p) == Outcome::Win) out.push_back(p->name);
    return out;
  }

  void newRound() {
    transition(GameState::Lobby);
    for (auto& p : players_) { p->hand.clear(); p->stood = false; }
    dealer_.hand.clear();
    dealer_.stood = false;
  }
};

int main() {
  BlackjackGame game{Deck(7)};
  game.addPlayer("Alice");
  game.addPlayer("Bob", [](const Hand& h) { return h.value() >= 15 ? Action::Stand : Action::Hit; });
  game.start();
  game.autoPlay();
  for (auto& [name, o] : game.outcomes())
    std::cout << name << ": " << (o == Outcome::Win ? "WIN" : o == Outcome::Lose ? "LOSE" : "PUSH") << "\\n";
  std::cout << "dealer=" << game.dealer().hand.value() << "\\n";
}
`

const goCode = `package main

import (
  "errors"
  "fmt"
  "math/rand"
)

type Suit int

const (
  Clubs Suit = iota
  Diamonds
  Hearts
  Spades
)

type Rank int

const (
  Ace Rank = iota + 1
  Two
  Three
  Four
  Five
  Six
  Seven
  Eight
  Nine
  Ten
  Jack
  Queen
  King
)

type Card struct {
  Rank Rank
  Suit Suit
}

var ErrEmptyDeck = errors.New("deck is empty")

// Deck holds 52 unique cards; Shuffle is Fisher-Yates.
type Deck struct {
  cards []Card
  rng   *rand.Rand
}

func NewDeck(rng *rand.Rand) *Deck {
  d := &Deck{rng: rng}
  d.Reset()
  return d
}

func (d *Deck) Reset() {
  d.cards = d.cards[:0]
  for s := Clubs; s <= Spades; s++ {
    for r := Ace; r <= King; r++ {
      d.cards = append(d.cards, Card{r, s})
    }
  }
}

func (d *Deck) Shuffle() {
  for i := len(d.cards) - 1; i > 0; i-- {
    j := d.rng.Intn(i + 1) // 0..i inclusive
    d.cards[i], d.cards[j] = d.cards[j], d.cards[i]
  }
}

func (d *Deck) Deal() (Card, error) {
  if len(d.cards) == 0 {
    return Card{}, ErrEmptyDeck
  }
  c := d.cards[len(d.cards)-1]
  d.cards = d.cards[:len(d.cards)-1]
  return c, nil
}

func (d *Deck) Remaining() int { return len(d.cards) }

type HandValueStrategy interface {
  Value(cards []Card) int
}

type BlackjackValue struct{}

func (BlackjackValue) Value(cards []Card) int {
  total, ace := 0, false
  for _, c := range cards {
    v := int(c.Rank)
    if v > 10 {
      v = 10
    }
    total += v // aces counted as 1
    if c.Rank == Ace {
      ace = true
    }
  }
  if ace && total+10 <= 21 {
    total += 10 // promote one ace to 11
  }
  return total
}

type Hand struct {
  cards    []Card
  strategy HandValueStrategy
}

func NewHand(s HandValueStrategy) *Hand { return &Hand{strategy: s} }
func (h *Hand) Add(c Card)               { h.cards = append(h.cards, c) }
func (h *Hand) Clear()                   { h.cards = nil }
func (h *Hand) Value() int               { return h.strategy.Value(h.cards) }
func (h *Hand) IsBust() bool             { return h.Value() > 21 }
func (h *Hand) IsBlackjack() bool        { return len(h.cards) == 2 && h.Value() == 21 }

type Action int

const (
  Hit Action = iota
  Stand
)

type Outcome int

const (
  Win Outcome = iota
  Lose
  Push
)

func (o Outcome) String() string { return [...]string{"WIN", "LOSE", "PUSH"}[o] }

type GameState int

const (
  Lobby GameState = iota
  Dealing
  PlayerTurns
  DealerTurn
  Finished
)

var allowed = map[GameState]GameState{
  Lobby: Dealing, Dealing: PlayerTurns, PlayerTurns: DealerTurn, DealerTurn: Finished, Finished: Lobby,
}

// Participant is the shared behaviour of Player and Dealer.
type Participant interface {
  Name() string
  Hand() *Hand
  Stood() bool
  SetStood(bool)
  Decide() Action
}

type participant struct {
  name  string
  hand  *Hand
  stood bool
}

func (p *participant) Name() string    { return p.name }
func (p *participant) Hand() *Hand     { return p.hand }
func (p *participant) Stood() bool     { return p.stood }
func (p *participant) SetStood(v bool) { p.stood = v }

type Player struct {
  participant
  decider func(*Hand) Action
}

func (p *Player) Decide() Action { return p.decider(p.hand) }

// Dealer follows the house rule: hit below 17, stand on 17+.
type Dealer struct{ participant }

func (d *Dealer) Decide() Action {
  if d.hand.Value() < 17 {
    return Hit
  }
  return Stand
}

type BlackjackGame struct {
  strategy HandValueStrategy
  deck     *Deck
  dealer   *Dealer
  players  []*Player
  state    GameState
  current  int
}

func NewGame(deck *Deck, s HandValueStrategy) *BlackjackGame {
  return &BlackjackGame{
    strategy: s, deck: deck,
    dealer: &Dealer{participant{name: "Dealer", hand: NewHand(s)}},
  }
}

func (g *BlackjackGame) transition(to GameState) error {
  if allowed[g.state] != to {
    return fmt.Errorf("illegal transition %d -> %d", g.state, to)
  }
  g.state = to
  return nil
}

func (g *BlackjackGame) require(s GameState) error {
  if g.state != s {
    return fmt.Errorf("action not allowed in state %d", g.state)
  }
  return nil
}

func (g *BlackjackGame) AddPlayer(name string, decider func(*Hand) Action) (*Player, error) {
  if err := g.require(Lobby); err != nil {
    return nil, err
  }
  if decider == nil {
    decider = func(h *Hand) Action {
      if h.Value() < 17 {
        return Hit
      }
      return Stand
    }
  }
  p := &Player{participant{name: name, hand: NewHand(g.strategy)}, decider}
  g.players = append(g.players, p)
  return p, nil
}

func (g *BlackjackGame) Start() error {
  if err := g.require(Lobby); err != nil {
    return err
  }
  if len(g.players) == 0 {
    return errors.New("need at least one player")
  }
  _ = g.transition(Dealing)
  g.deck.Reset()
  g.deck.Shuffle()
  for round := 0; round < 2; round++ {
    for _, p := range g.players {
      c, _ := g.deck.Deal()
      p.hand.Add(c)
    }
    c, _ := g.deck.Deal()
    g.dealer.hand.Add(c)
  }
  for _, p := range g.players {
    p.stood = p.hand.IsBlackjack()
  }
  _ = g.transition(PlayerTurns)
  g.current = -1
  return g.advance()
}

func (g *BlackjackGame) CurrentPlayer() *Player {
  if g.state != PlayerTurns || g.current < 0 || g.current >= len(g.players) {
    return nil
  }
  return g.players[g.current]
}

func (g *BlackjackGame) checkTurn(p *Player) error {
  if err := g.require(PlayerTurns); err != nil {
    return err
  }
  if p != g.CurrentPlayer() {
    return errors.New("not this player's turn")
  }
  return nil
}

func (g *BlackjackGame) Hit(p *Player) (Card, error) {
  if err := g.checkTurn(p); err != nil {
    return Card{}, err
  }
  c, err := g.deck.Deal()
  if err != nil {
    return Card{}, err
  }
  p.hand.Add(c)
  if p.hand.IsBust() || p.hand.Value() == 21 {
    p.stood = true
    return c, g.advance()
  }
  return c, nil
}

func (g *BlackjackGame) Stand(p *Player) error {
  if err := g.checkTurn(p); err != nil {
    return err
  }
  p.stood = true
  return g.advance()
}

func (g *BlackjackGame) advance() error {
  g.current++
  for g.current < len(g.players) && g.players[g.current].stood {
    g.current++
  }
  if g.current >= len(g.players) {
    return g.playDealer()
  }
  return nil
}

func (g *BlackjackGame) playDealer() error {
  _ = g.transition(DealerTurn)
  anyAlive := false
  for _, p := range g.players {
    if !p.hand.IsBust() {
      anyAlive = true
    }
  }
  for anyAlive && g.dealer.Decide() == Hit {
    c, err := g.deck.Deal()
    if err != nil {
      return err
    }
    g.dealer.hand.Add(c)
  }
  return g.transition(Finished)
}

func (g *BlackjackGame) AutoPlay() error {
  for p := g.CurrentPlayer(); p != nil; p = g.CurrentPlayer() {
    var err error
    if p.Decide() == Hit {
      _, err = g.Hit(p)
    } else {
      err = g.Stand(p)
    }
    if err != nil {
      return err
    }
  }
  return nil
}

func (g *BlackjackGame) judge(p *Player) Outcome {
  d := g.dealer.hand
  switch {
  case p.hand.IsBust():
    return Lose
  case d.IsBust():
    return Win
  case p.hand.IsBlackjack() != d.IsBlackjack():
    if p.hand.IsBlackjack() {
      return Win
    }
    return Lose
  case p.hand.Value() == d.Value():
    return Push
  case p.hand.Value() > d.Value():
    return Win
  }
  return Lose
}

func (g *BlackjackGame) Outcomes() (map[string]Outcome, error) {
  if err := g.require(Finished); err != nil {
    return nil, err
  }
  out := map[string]Outcome{}
  for _, p := range g.players {
    out[p.name] = g.judge(p)
  }
  return out, nil
}

func (g *BlackjackGame) Winners() ([]*Player, error) {
  if err := g.require(Finished); err != nil {
    return nil, err
  }
  var out []*Player
  for _, p := range g.players {
    if g.judge(p) == Win {
      out = append(out, p)
    }
  }
  return out, nil
}

func (g *BlackjackGame) NewRound() error {
  if err := g.transition(Lobby); err != nil {
    return err
  }
  for _, p := range g.players {
    p.hand.Clear()
    p.stood = false
  }
  g.dealer.hand.Clear()
  g.dealer.stood = false
  return nil
}

func main() {
  g := NewGame(NewDeck(rand.New(rand.NewSource(7))), BlackjackValue{})
  g.AddPlayer("Alice", nil)
  g.AddPlayer("Bob", func(h *Hand) Action {
    if h.Value() >= 15 {
      return Stand
    }
    return Hit
  })
  _ = g.Start()
  _ = g.AutoPlay()
  out, _ := g.Outcomes()
  fmt.Println(out, "dealer =", g.dealer.hand.Value())
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

public enum Suit { Clubs, Diamonds, Hearts, Spades }
public enum Rank { Ace = 1, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King }
public enum Action { Hit, Stand }
public enum Outcome { Win, Lose, Push }
public enum GameState { Lobby, Dealing, PlayerTurns, DealerTurn, Finished }

public readonly record struct Card(Rank Rank, Suit Suit) {
  public override string ToString() => $"{Rank} of {Suit}";
}

public sealed class EmptyDeckException : Exception {
  public EmptyDeckException() : base("deck is empty") {}
}

/// <summary>52 unique cards; Fisher-Yates shuffle gives each permutation equal probability.</summary>
public sealed class Deck {
  readonly List<Card> _cards = new();
  readonly Random _rng;

  public Deck(Random? rng = null) { _rng = rng ?? new Random(); Reset(); }

  public void Reset() {
    _cards.Clear();
    foreach (Suit s in Enum.GetValues<Suit>())
      foreach (Rank r in Enum.GetValues<Rank>()) _cards.Add(new Card(r, s));
  }

  public void Shuffle() {
    for (int i = _cards.Count - 1; i > 0; i--) {
      int j = _rng.Next(i + 1);                  // 0..i inclusive
      (_cards[i], _cards[j]) = (_cards[j], _cards[i]);
    }
  }

  public Card Deal() {
    if (_cards.Count == 0) throw new EmptyDeckException();
    var c = _cards[^1];
    _cards.RemoveAt(_cards.Count - 1);
    return c;
  }

  public int Remaining => _cards.Count;
}

public interface IHandValueStrategy { int Value(IReadOnlyList<Card> cards); }

public sealed class BlackjackValueStrategy : IHandValueStrategy {
  public int Value(IReadOnlyList<Card> cards) {
    int total = cards.Sum(c => Math.Min((int)c.Rank, 10));    // aces counted as 1
    bool ace = cards.Any(c => c.Rank == Rank.Ace);
    return ace && total + 10 <= 21 ? total + 10 : total;       // promote one ace to 11
  }
}

public sealed class Hand {
  readonly List<Card> _cards = new();
  readonly IHandValueStrategy _strategy;
  public Hand(IHandValueStrategy strategy) { _strategy = strategy; }

  public IReadOnlyList<Card> Cards => _cards;
  public void Add(Card c) => _cards.Add(c);
  public void Clear() => _cards.Clear();
  public int Value => _strategy.Value(_cards);
  public bool IsBust => Value > 21;
  public bool IsBlackjack => _cards.Count == 2 && Value == 21;
}

public abstract class Participant {
  public string Name { get; }
  public Hand Hand { get; }
  public bool Stood { get; set; }
  protected Participant(string name, IHandValueStrategy s) { Name = name; Hand = new Hand(s); }
  public abstract Action Decide();
}

public sealed class Player : Participant {
  readonly Func<Hand, Action> _decider;
  public Player(string name, IHandValueStrategy s, Func<Hand, Action>? decider = null) : base(name, s) =>
    _decider = decider ?? (h => h.Value < 17 ? Action.Hit : Action.Stand);
  public override Action Decide() => _decider(Hand);
}

/// <summary>House rule: hit below 17, stand on 17 or more.</summary>
public sealed class Dealer : Participant {
  public Dealer(IHandValueStrategy s) : base("Dealer", s) {}
  public override Action Decide() => Hand.Value < 17 ? Action.Hit : Action.Stand;
}

public sealed class BlackjackGame {
  static readonly Dictionary<GameState, GameState> Next = new() {
    [GameState.Lobby] = GameState.Dealing,
    [GameState.Dealing] = GameState.PlayerTurns,
    [GameState.PlayerTurns] = GameState.DealerTurn,
    [GameState.DealerTurn] = GameState.Finished,
    [GameState.Finished] = GameState.Lobby,
  };

  readonly IHandValueStrategy _strategy;
  readonly Deck _deck;
  readonly List<Player> _players = new();
  int _current;

  public Dealer Dealer { get; }
  public GameState State { get; private set; } = GameState.Lobby;

  public BlackjackGame(Deck? deck = null, IHandValueStrategy? strategy = null) {
    _strategy = strategy ?? new BlackjackValueStrategy();
    _deck = deck ?? new Deck();
    Dealer = new Dealer(_strategy);
  }

  void Transition(GameState to) {
    if (Next[State] != to) throw new InvalidOperationException($"{State} -> {to}");
    State = to;
  }
  void Require(GameState s) {
    if (State != s) throw new InvalidOperationException($"not allowed in {State}");
  }

  public Player AddPlayer(string name, Func<Hand, Action>? decider = null) {
    Require(GameState.Lobby);
    var p = new Player(name, _strategy, decider);
    _players.Add(p);
    return p;
  }

  public void Start() {
    Require(GameState.Lobby);
    if (_players.Count == 0) throw new InvalidOperationException("need at least one player");
    Transition(GameState.Dealing);
    _deck.Reset(); _deck.Shuffle();
    for (int round = 0; round < 2; round++) {
      foreach (var p in _players) p.Hand.Add(_deck.Deal());
      Dealer.Hand.Add(_deck.Deal());
    }
    foreach (var p in _players) p.Stood = p.Hand.IsBlackjack;
    Transition(GameState.PlayerTurns);
    _current = -1;
    Advance();
  }

  public Player? CurrentPlayer =>
    State == GameState.PlayerTurns && _current >= 0 && _current < _players.Count ? _players[_current] : null;

  void CheckTurn(Player p) {
    Require(GameState.PlayerTurns);
    if (!ReferenceEquals(p, CurrentPlayer)) throw new InvalidOperationException("not this player's turn");
  }

  public Card Hit(Player p) {
    CheckTurn(p);
    var c = _deck.Deal();
    p.Hand.Add(c);
    if (p.Hand.IsBust || p.Hand.Value == 21) { p.Stood = true; Advance(); }
    return c;
  }

  public void Stand(Player p) {
    CheckTurn(p);
    p.Stood = true;
    Advance();
  }

  void Advance() {
    _current++;
    while (_current < _players.Count && _players[_current].Stood) _current++;
    if (_current >= _players.Count) PlayDealer();
  }

  void PlayDealer() {
    Transition(GameState.DealerTurn);
    if (_players.Any(p => !p.Hand.IsBust))
      while (Dealer.Decide() == Action.Hit) Dealer.Hand.Add(_deck.Deal());
    Transition(GameState.Finished);
  }

  public void AutoPlay() {
    for (var p = CurrentPlayer; p is not null; p = CurrentPlayer) {
      if (p.Decide() == Action.Hit) Hit(p); else Stand(p);
    }
  }

  public Dictionary<string, Outcome> Outcomes() {
    Require(GameState.Finished);
    return _players.ToDictionary(p => p.Name, Judge);
  }

  public List<Player> Winners() {
    Require(GameState.Finished);
    return _players.Where(p => Judge(p) == Outcome.Win).ToList();
  }

  Outcome Judge(Player p) {
    var d = Dealer.Hand;
    if (p.Hand.IsBust) return Outcome.Lose;
    if (d.IsBust) return Outcome.Win;
    if (p.Hand.IsBlackjack != d.IsBlackjack) return p.Hand.IsBlackjack ? Outcome.Win : Outcome.Lose;
    if (p.Hand.Value == d.Value) return Outcome.Push;
    return p.Hand.Value > d.Value ? Outcome.Win : Outcome.Lose;
  }

  public void NewRound() {
    Transition(GameState.Lobby);
    foreach (var p in _players) { p.Hand.Clear(); p.Stood = false; }
    Dealer.Hand.Clear(); Dealer.Stood = false;
  }
}

public static class Program {
  public static void Main() {
    var game = new BlackjackGame(new Deck(new Random(7)));
    game.AddPlayer("Alice");
    game.AddPlayer("Bob", h => h.Value >= 15 ? Action.Stand : Action.Hit);
    game.Start();
    game.AutoPlay();
    foreach (var (name, o) in game.Outcomes()) Console.WriteLine($"{name}: {o}");
    Console.WriteLine($"dealer={game.Dealer.Hand.Value}");
  }
}
`

export const deckOfCardsSolution: ProblemSolution = {
  slug: 'deck-of-cards',
  title: 'Deck of Cards - Solution',
  overview: {
    introduction:
      'Design a reusable deck of cards and build a Blackjack game on top of it. The deck should be a general-purpose component (52 cards, uniform shuffle, deal). Blackjack is the first consumer: hands are valued with Ace-as-1-or-11, players hit or stand, the dealer follows a fixed rule, and the game proceeds through well-defined states until a winner is determined.',
    constraints: [
      'A standard deck has exactly 52 unique cards (4 suits × 13 ranks); dealing from an empty deck is an error.',
      'Shuffling must be unbiased - Fisher-Yates.',
      'Ace counts as 1 or 11, whichever is best without busting; J/Q/K are 10.',
      'Players may hit or stand; going over 21 is a bust. The dealer must hit below 17 and stand on 17 or more.',
      'Multiple players compete against the dealer; winners are decided after the dealer finishes.',
    ],
    assumptions: [
      'One deck per round, reshuffled at the start of every round (multi-deck shoes are an extension).',
      'No betting, doubling, splitting, or insurance in v1 - outcomes are Win / Lose / Push.',
      'The dealer stands on all 17s, including soft 17.',
      'Player decisions come from an injected function (CLI, UI, or bot), keeping the engine UI-free.',
    ],
    clarificationQuestions: [
      'Single deck or multi-deck shoe? When do we reshuffle?',
      'Does the dealer stand or hit on soft 17?',
      'Are blackjack payouts (3:2), splitting, doubling, and insurance in scope?',
      'Are players competing only against the dealer, or against each other too?',
      'Should the Deck be reusable for other games (Poker, War)?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Separate the generic from the specific. Card, Deck, and Hand are reusable domain objects. Blackjack-specific rules - how a hand is valued, when the dealer hits, whose turn it is - sit on top. Then model the game flow as an explicit state machine so that illegal calls (hit during the dealer turn) are impossible rather than “handled with ifs”.',
    breakdown: [
      'Model Card (Rank × Suit) as an immutable value type and Deck as a 52-card collection.',
      'Implement Fisher-Yates shuffle and deal() with an empty-deck guard.',
      'Extract hand valuation behind a HandValueStrategy so Blackjack’s Ace rule does not leak into Hand or Deck.',
      'Create a Participant hierarchy: Player (external decisions) and Dealer (fixed rule ≥17).',
      'Drive the round through GameState: LOBBY → DEALING → PLAYER_TURNS → DEALER_TURN → FINISHED.',
      'Settle outcomes by comparing each player’s hand with the dealer’s.',
    ],
    entities: [
      { name: 'Card / Rank / Suit', responsibility: 'Immutable identity of a card; no behaviour beyond equality and display.' },
      { name: 'Deck', responsibility: 'Owns the 52 cards, shuffles uniformly, deals one card at a time.' },
      { name: 'Hand', responsibility: 'Holds cards and answers value / bust / blackjack via a strategy.' },
      { name: 'HandValueStrategy', responsibility: 'Game-specific scoring; BlackjackValueStrategy implements Ace 1/11.' },
      { name: 'Participant', responsibility: 'Abstract actor with a name, a hand, and a decide() method.' },
      { name: 'Player / Dealer', responsibility: 'Player delegates decisions; Dealer applies the “hit below 17” rule.' },
      { name: 'BlackjackGame', responsibility: 'State machine: dealing, turn order, dealer play, outcomes, winners.' },
    ],
    relationships: [
      'Deck aggregates 52 Cards; Hand aggregates the Cards it was dealt.',
      'Hand aggregates a HandValueStrategy (injected), realised by BlackjackValueStrategy.',
      'Player and Dealer inherit from Participant; Participant composes a Hand.',
      'BlackjackGame composes a Deck and aggregates Participants; it exposes a GameState.',
    ],
    patternsAndOop: [
      'Strategy: HandValueStrategy swaps scoring rules (Blackjack vs Baccarat) without touching Hand.',
      'State: GameState + guarded transitions enforce legal flow.',
      'Polymorphism: Participant.decide() lets the game treat humans, bots, and the dealer uniformly.',
      'Encapsulation: only Deck mutates its card list; callers cannot peek or reorder.',
    ],
    stepByStep: [
      'Clarify scope (single deck, soft 17, no betting).',
      'Write Card + Deck; implement Fisher-Yates and explain why naive sort-by-random is biased.',
      'Write HandValueStrategy and the Ace logic: count aces as 1, add 10 once if it fits.',
      'Add Participants and the game state machine.',
      'Implement hit/stand with turn enforcement and automatic stand on bust/21.',
      'Finish with dealer play and the outcome comparison table.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Deck and Card are generic and game-agnostic. All Blackjack knowledge lives in a strategy (hand value), the Dealer rule, and the BlackjackGame state machine. This separation lets the same Deck power other card games and keeps scoring rules testable in isolation.',
    classResponsibilities: [
      { name: 'Deck', responsibility: 'Create 52 cards, shuffle (Fisher-Yates), deal from the top, report remaining.' },
      { name: 'Hand', responsibility: 'Accumulate dealt cards; derive value, bust, and blackjack using a strategy.' },
      { name: 'BlackjackValueStrategy', responsibility: 'Sum with face=10 and promote one ace to 11 if it does not bust.' },
      { name: 'Participant', responsibility: 'Common identity + hand + stood flag; abstract decide().' },
      { name: 'Player', responsibility: 'Delegates decide() to an injected callback so any UI or bot can plug in.' },
      { name: 'Dealer', responsibility: 'Implements the fixed house policy: hit while value < 17.' },
      { name: 'BlackjackGame', responsibility: 'Owns state transitions, turn order, dealing, dealer turn, and result computation.' },
    ],
    interfacesAndAbstractions: [
      'HandValueStrategy: isolates game-specific scoring.',
      'Participant: unifies Player and Dealer under decide().',
    ],
    relationships: [
      'Composition BlackjackGame→Deck: the game controls its deck’s lifetime and shuffling.',
      'Aggregation Deck→Card and Hand→Card: cards are values that move between collections.',
      'Aggregation Hand→HandValueStrategy: strategies are stateless and shared.',
      'Inheritance Participant→Player/Dealer: different decision sources, same contract.',
    ],
    solid: [
      'SRP: Deck deals, Hand stores, Strategy scores, Game orchestrates.',
      'OCP: new scoring rules or participant types are added without modifying Deck/Hand.',
      'LSP: Dealer and Player are interchangeable wherever a Participant is expected.',
      'ISP: HandValueStrategy has a single method.',
      'DIP: Hand depends on the HandValueStrategy abstraction, not on Blackjack rules.',
    ],
    patterns: [
      { name: 'Strategy', why: 'Hand valuation varies per card game; keep it out of Hand.' },
      { name: 'State machine', why: 'Explicit transitions prevent illegal calls like hit() during the dealer turn.' },
      { name: 'Template-like game loop', why: 'The round skeleton is fixed; Participant.decide() supplies the variable step.' },
    ],
    decisions: [
      {
        decision: 'Fisher-Yates in-place shuffle.',
        rationale: 'O(n), unbiased: iterate from the end and swap with a random index in [0, i].',
        tradeoff: 'Quality depends on the RNG; inject a seeded RNG for tests and a CSPRNG for real money.',
      },
      {
        decision: 'Ace value computed from the whole hand, not stored on the card.',
        rationale: 'The ace’s value depends on the other cards; recomputation is O(hand) and trivially correct.',
        tradeoff: 'Recalculates on every query; hands are tiny so it does not matter.',
      },
      {
        decision: 'Explicit GameState with guarded transitions.',
        rationale: 'Illegal actions fail fast with a clear error and flow is easy to reason about and test.',
        tradeoff: 'Slightly more code than ad-hoc flags; worth it for multi-player turn order.',
      },
      {
        decision: 'Players are driven by an injected decision function.',
        rationale: 'Keeps the engine independent of I/O and enables bots in tests.',
        tradeoff: 'Interactive UIs call hit/stand directly rather than via autoPlay().',
      },
    ],
    extensibility:
      'Reuse Deck for Poker or War with different HandValueStrategy/ranking. Add betting by giving Player a bankroll and a payout calculator. Support multi-deck shoes by letting Deck accept a deck count and a reshuffle threshold. Add double/split as new Action values handled by the game state machine.',
  },
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    steps: [
      'Create a BlackjackGame, register players in LOBBY, then call start().',
      'start(): transition to DEALING, reset + shuffle the deck, deal two cards each (players first, dealer last), auto-stand natural blackjacks.',
      'In PLAYER_TURNS only the current player may hit or stand; hit adds a card and auto-stands on bust or 21; stand ends the turn.',
      'When no active players remain, transition to DEALER_TURN; the dealer draws while value < 17 (skipped if everyone busted).',
      'Transition to FINISHED and compute each player’s Outcome against the dealer; winners() filters WIN.',
    ],
    examples: [
      {
        title: 'Ace is promoted to 11 then demoted',
        input: 'Hand: Ace, 6 → hit → 9',
        output: 'value 17 → 16',
        explanation:
          'Ace+6 = 7 with ace as 1; since 7+10 ≤ 21 it is promoted to 17 (soft). Adding a 9 gives 16 with ace as 1 because 16+10 > 21.',
      },
      {
        title: 'Dealer busts',
        input: 'Player stands on 18; dealer holds 16 and draws a King',
        output: 'Dealer 26 → player WIN',
        explanation: 'The dealer must hit below 17; 16 + 10 = 26 busts, so every non-bust player wins.',
      },
      {
        title: 'Push on equal totals',
        input: 'Player 19, dealer 19, neither has a natural',
        output: 'Outcome.PUSH',
        explanation: 'Equal values (and equal blackjack status) tie - the player neither wins nor loses.',
      },
    ],
  },
  followUps: [
    {
      question: 'Why is Fisher-Yates better than sorting by random keys?',
      answer:
        'Fisher-Yates is O(n) and produces each of the n! permutations with equal probability. Sorting with a random comparator is O(n log n) and, with inconsistent comparators, is biased and implementation-dependent.',
    },
    {
      question: 'How do you compute the best value of a hand containing several aces?',
      answer:
        'Count every ace as 1, then add 10 once if the total is ≤ 11. At most one ace can be 11 in a non-bust hand, so a single promotion is enough.',
    },
    {
      question: 'How would you add splitting and doubling down?',
      answer:
        'Add Action.SPLIT and Action.DOUBLE. Player owns a list of Hands; the game iterates hands per player. Doubling adds one card and forces stand; splitting creates a second hand from a pair. The state machine stays the same.',
    },
    {
      question: 'How do you support a multi-deck shoe?',
      answer:
        'Let Deck take a deck count (n×52 cards) and a penetration threshold; the game reshuffles when remaining() falls below it. Card identity then needs a deck-of-origin only if the game cares.',
    },
    {
      question: 'How do you test shuffle randomness and game logic deterministically?',
      answer:
        'Inject the RNG (seeded) into Deck; for logic tests supply a pre-ordered Deck subclass. Statistical tests (chi-square on positions) validate uniformity.',
    },
    {
      question: 'Where does Poker fit in this design?',
      answer:
        'Reuse Deck and Card. Add a PokerHandEvaluator (strategy) that ranks 5-card hands and a PokerGame state machine (BETTING, DEALING, SHOWDOWN). Only the strategy and flow change.',
    },
  ],
  extras: {
    edgeCases: [
      'Deck runs out mid-round (many players, multi-hit) - throw or reshuffle per requirements.',
      'Natural blackjack for the player and for the dealer on the same round.',
      'All players bust - dealer does not need to draw.',
      'Hand with multiple aces (A, A, 9 = 21; A, A, A = 13).',
      'Calling hit/stand out of turn or after the round ended.',
      'Players added after start().',
    ],
    commonMistakes: [
      'Storing a fixed Ace value on the Card.',
      'Using Math.random() sorting or a one-pass swap with index in [0, n) (biased).',
      'Putting Blackjack scoring inside Hand or Deck.',
      'Representing game flow with scattered booleans instead of a state machine.',
      'Letting the dealer draw when every player has already busted.',
    ],
    complexity:
      'shuffle O(n), deal O(1), hand valuation O(h) with h = cards in hand. A full round is O(P × cards drawn). Memory is O(52).',
    testing: [
      'Deck contains 52 unique cards; deal() reduces remaining; deal on empty throws.',
      'Seeded shuffle is reproducible; statistical test of position distribution.',
      'Hand value matrix: soft/hard totals, multiple aces, naturals.',
      'State machine: illegal transitions throw; turn enforcement for hit/stand.',
      'Outcome table: win/lose/push/bust/blackjack vs 21 combinations.',
    ],
    extensions: [
      'Betting, bankrolls, payouts, split, double, insurance.',
      'Multi-deck shoe with cut card and reshuffle penetration.',
      'Other games reusing Deck: Poker, Hearts, War.',
      'Observer for UI updates and game history/analytics.',
    ],
    takeaways: [
      'Keep Deck/Card generic; push game rules into strategies and the game.',
      'Fisher-Yates is the correct shuffle.',
      'Ace logic belongs in a strategy computed over the whole hand.',
      'Model the round as a state machine and guard every action.',
    ],
  },
}
