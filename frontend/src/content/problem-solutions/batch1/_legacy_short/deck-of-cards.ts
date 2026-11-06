import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('bg', 'BlackjackGame', 40, 40, [
    attr('-', 'state', 'GameState'),
    attr('-', 'deck', 'Deck'),
    attr('-', 'players', 'List<Player>'),
    attr('-', 'dealer', 'Dealer'),
  ], [
    method('+', 'startRound', '', 'void'),
    method('+', 'hit', 'playerId', 'void'),
    method('+', 'stand', 'playerId', 'void'),
    method('+', 'payout', '', 'void'),
  ]),
  enm('gs', 'GameState', 40, 200, ['PLACING_BETS', 'DEALING', 'PLAYER_TURNS', 'DEALER_TURN', 'PAYOUT']),
  cls('dk', 'Deck', 320, 40, [
    attr('-', 'cards', 'List<Card>'),
  ], [
    method('+', 'shuffle', '', 'void'),
    method('+', 'draw', '', 'Card'),
  ]),
  cls('cd', 'Card', 520, 40, [
    attr('-', 'suit', 'Suit'),
    attr('-', 'rank', 'Rank'),
  ], []),
  enm('su', 'Suit', 680, 40, ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES']),
  enm('rk', 'Rank', 680, 140, ['ACE', 'TWO', '…', 'KING']),
  cls('hd', 'Hand', 320, 200, [
    attr('-', 'cards', 'List<Card>'),
  ], [
    method('+', 'value', 'strategy: HandValueStrategy', 'int'),
  ]),
  iface('hvs', 'HandValueStrategy', 520, 200, [
    method('+', 'value', 'hand: Hand', 'int'),
  ]),
  cls('bjv', 'BlackjackValueStrategy', 720, 200, [], [
    method('+', 'value', 'hand', 'int'),
  ]),
  cls('pl', 'Player', 320, 340, [
    attr('-', 'id', 'string'),
    attr('-', 'hand', 'Hand'),
  ], []),
  cls('dl', 'Dealer', 520, 340, [
    attr('-', 'hand', 'Hand'),
  ], [
    method('+', 'playTurn', 'deck', 'void'),
  ]),
]

const edges = [
  edge('e1', 'bg', 'gs', 'dependency', 'bottom', 'top'),
  edge('e2', 'bg', 'dk', 'composition', 'right', 'left'),
  edge('e3', 'dk', 'cd', 'composition', 'right', 'left'),
  edge('e4', 'cd', 'su', 'dependency', 'right', 'left'),
  edge('e5', 'cd', 'rk', 'dependency', 'right', 'left'),
  edge('e6', 'pl', 'hd', 'composition', 'right', 'left'),
  edge('e7', 'dl', 'pl', 'inheritance', 'top', 'bottom'),
  edge('e8', 'hd', 'hvs', 'dependency', 'bottom', 'top'),
  edge('e9', 'bjv', 'hvs', 'realization', 'left', 'right'),
  edge('e10', 'bg', 'pl', 'aggregation', 'bottom@40', 'top'),
  edge('e11', 'bg', 'dl', 'aggregation', 'bottom@60', 'top'),
]

const py = `from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum, auto
from random import Random
from typing import List, Optional


class Suit(Enum):
    HEARTS = auto()
    DIAMONDS = auto()
    CLUBS = auto()
    SPADES = auto()


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
    JACK = 10
    QUEEN = 10
    KING = 10


@dataclass(frozen=True)
class Card:
    suit: Suit
    rank: Rank


class Deck:
    def __init__(self, rng: Optional[Random] = None):
        self.rng = rng or Random()
        self.cards: List[Card] = [Card(s, r) for s in Suit for r in Rank if r.name not in ("JACK","QUEEN","KING") or r in (Rank.JACK, Rank.QUEEN, Rank.KING)]
        # standard 52: use ranks ACE..KING once each suit
        self.cards = []
        face = [Rank.JACK, Rank.QUEEN, Rank.KING]
        values = [Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN] + face
        for s in Suit:
            for r in values:
                self.cards.append(Card(s, r))

    def shuffle(self) -> None:
        self.rng.shuffle(self.cards)

    def draw(self) -> Card:
        if not self.cards:
            raise RuntimeError("empty deck")
        return self.cards.pop()


@dataclass
class Hand:
    cards: List[Card] = field(default_factory=list)

    def add(self, card: Card) -> None:
        self.cards.append(card)


class HandValueStrategy:
    def value(self, hand: Hand) -> int:
        raise NotImplementedError


class BlackjackValueStrategy(HandValueStrategy):
    def value(self, hand: Hand) -> int:
        total = 0
        aces = 0
        for c in hand.cards:
            if c.rank == Rank.ACE:
                aces += 1
                total += 11
            else:
                total += c.rank.value
        while total > 21 and aces:
            total -= 10
            aces -= 1
        return total


class Player:
    def __init__(self, pid: str):
        self.id = pid
        self.hand = Hand()


class Dealer(Player):
    def __init__(self):
        super().__init__("dealer")

    def play_turn(self, deck: Deck, strategy: HandValueStrategy) -> None:
        while strategy.value(self.hand) < 17:
            self.hand.add(deck.draw())


class GameState(Enum):
    PLACING_BETS = auto()
    DEALING = auto()
    PLAYER_TURNS = auto()
    DEALER_TURN = auto()
    PAYOUT = auto()


class BlackjackGame:
    def __init__(self, players: List[Player], deck: Optional[Deck] = None):
        self.players = players
        self.dealer = Dealer()
        self.deck = deck or Deck()
        self.state = GameState.PLACING_BETS
        self.strategy = BlackjackValueStrategy()

    def start_round(self) -> None:
        self.deck.shuffle()
        self.state = GameState.DEALING
        for _ in range(2):
            for p in self.players:
                p.hand = Hand()
            self.dealer.hand = Hand()
            for p in self.players:
                p.hand.add(self.deck.draw())
            self.dealer.hand.add(self.deck.draw())
        self.state = GameState.PLAYER_TURNS

    def hit(self, player_id: str) -> None:
        if self.state != GameState.PLAYER_TURNS:
            raise RuntimeError("wrong state")
        p = next(x for x in self.players if x.id == player_id)
        p.hand.add(self.deck.draw())
        if self.strategy.value(p.hand) > 21:
            p.busted = True  # type: ignore

    def stand(self, player_id: str) -> None:
        pass

    def dealer_turn(self) -> None:
        self.state = GameState.DEALER_TURN
        self.dealer.play_turn(self.deck, self.strategy)
        self.state = GameState.PAYOUT

    def payout(self) -> dict:
        d_val = self.strategy.value(self.dealer.hand)
        results = {}
        for p in self.players:
            v = self.strategy.value(p.hand)
            if v > 21:
                results[p.id] = "lose"
            elif d_val > 21 or v > d_val:
                results[p.id] = "win"
            elif v == d_val:
                results[p.id] = "push"
            else:
                results[p.id] = "lose"
        self.state = GameState.PLACING_BETS
        return results
`

const java = `enum Suit { HEARTS, DIAMONDS, CLUBS, SPADES }
enum Rank { ACE(1), TWO(2), THREE(3), FOUR(4), FIVE(5), SIX(6), SEVEN(7), EIGHT(8), NINE(9), TEN(10), JACK(10), QUEEN(10), KING(10);
  final int value; Rank(int v){ value=v; }
}

class Card { final Suit suit; final Rank rank; Card(Suit s, Rank r){ suit=s; rank=r; } }

class Deck {
  java.util.List<Card> cards = new java.util.ArrayList<>();
  Deck(){ for (Suit s: Suit.values()) for (Rank r: Rank.values()) cards.add(new Card(s,r)); }
  void shuffle(java.util.Random rng){ java.util.Collections.shuffle(cards, rng); }
  Card draw(){ return cards.remove(cards.size()-1); }
}

class Hand { java.util.List<Card> cards = new java.util.ArrayList<>(); }

interface HandValueStrategy { int value(Hand h); }

class BlackjackValueStrategy implements HandValueStrategy {
  public int value(Hand h) {
    int total=0, aces=0;
    for (Card c: h.cards) {
      if (c.rank==Rank.ACE){ aces++; total+=11; } else total+=c.rank.value;
    }
    while (total>21 && aces>0){ total-=10; aces--; }
    return total;
  }
}

class Player { String id; Hand hand = new Hand(); Player(String id){ this.id=id; } }
class Dealer extends Player {
  Dealer(){ super("dealer"); }
  void playTurn(Deck d, HandValueStrategy s){ while (s.value(hand)<17) hand.cards.add(d.draw()); }
}

enum GameState { PLACING_BETS, DEALING, PLAYER_TURNS, DEALER_TURN, PAYOUT }

class BlackjackGame {
  GameState state = GameState.PLACING_BETS;
  Deck deck = new Deck();
  java.util.List<Player> players;
  Dealer dealer = new Dealer();
  HandValueStrategy strategy = new BlackjackValueStrategy();
  BlackjackGame(java.util.List<Player> ps){ players=ps; }
}
`

const ts = `enum Suit { Hearts, Diamonds, Clubs, Spades }
enum Rank { Ace = 1, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack = 10, Queen = 10, King = 10 }

class Card { constructor(public suit: Suit, public rank: Rank) {} }

class Deck {
  cards: Card[] = []
  constructor() {
    for (const s of [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades])
      for (const r of [Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King])
        this.cards.push(new Card(s, r))
  }
  shuffle() { this.cards.sort(() => Math.random() - 0.5) }
  draw() { return this.cards.pop()! }
}

class Hand { cards: Card[] = [] }

interface HandValueStrategy { value(hand: Hand): number }

class BlackjackValueStrategy implements HandValueStrategy {
  value(hand: Hand) {
    let total = 0, aces = 0
    for (const c of hand.cards) {
      if (c.rank === Rank.Ace) { aces++; total += 11 } else total += c.rank as number
    }
    while (total > 21 && aces) { total -= 10; aces-- }
    return total
  }
}

class Player { hand = new Hand(); constructor(public readonly id: string) {} }
class Dealer extends Player { constructor() { super('dealer') } playTurn(deck: Deck, s: HandValueStrategy) { while (s.value(this.hand) < 17) this.hand.cards.push(deck.draw()) } }

enum GameState { PlacingBets, Dealing, PlayerTurns, DealerTurn, Payout }

class BlackjackGame {
  state = GameState.PlacingBets
  deck = new Deck()
  dealer = new Dealer()
  strategy = new BlackjackValueStrategy()
  constructor(public players: Player[]) {}
}

export { BlackjackGame, Deck, BlackjackValueStrategy }
`

const cpp = `#include <algorithm>
#include <random>
#include <vector>

enum class Suit { Hearts, Diamonds, Clubs, Spades };
enum class Rank { Ace=1, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack=10, Queen=10, King=10 };

struct Card { Suit suit; Rank rank; };

class Deck {
  std::vector<Card> cards;
public:
  Deck() {
    for (int s=0;s<4;s++)
      for (int r=1;r<=13;r++)
        cards.push_back({static_cast<Suit>(s), static_cast<Rank>(r==11?10:r==12?10:r==13?10:r)});
  }
  void shuffle() { std::shuffle(cards.begin(), cards.end(), std::mt19937{std::random_device{}()}); }
  Card draw() { Card c = cards.back(); cards.pop_back(); return c; }
};

struct Hand { std::vector<Card> cards; };

struct BlackjackValue {
  static int value(const Hand& h) {
    int total=0, aces=0;
    for (auto c: h.cards) {
      if (c.rank==Rank::Ace){ aces++; total+=11; }
      else total += static_cast<int>(c.rank);
    }
    while (total>21 && aces){ total-=10; aces--; }
    return total;
  }
};
`

const goCode = `package blackjack

import (
	"math/rand"
	"time"
)

type Suit int
type Rank int

const (
	Ace Rank = 1 + iota
	Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack, Queen, King
)

type Card struct{ Suit Suit; Rank Rank }

type Deck struct{ cards []Card }

func NewDeck() *Deck {
	var cards []Card
	for s := 0; s < 4; s++ {
		for r := Ace; r <= King; r++ {
			cards = append(cards, Card{Suit(s), r})
		}
	}
	return &Deck{cards: cards}
}

func (d *Deck) Shuffle() {
	rand.New(rand.NewSource(time.Now().UnixNano())).Shuffle(len(d.cards), func(i, j int) {
		d.cards[i], d.cards[j] = d.cards[j], d.cards[i]
	})
}

func (d *Deck) Draw() Card {
	c := d.cards[len(d.cards)-1]
	d.cards = d.cards[:len(d.cards)-1]
	return c
}

type Hand struct{ Cards []Card }

type HandValueStrategy interface{ Value(h Hand) int }

type BlackjackValueStrategy struct{}

func (BlackjackValueStrategy) Value(h Hand) int {
	total, aces := 0, 0
	for _, c := range h.Cards {
		if c.Rank == Ace {
			aces++
			total += 11
		} else if c.Rank >= Ten {
			total += 10
		} else {
			total += int(c.Rank)
		}
	}
	for total > 21 && aces > 0 {
		total -= 10
		aces--
	}
	return total
}

type Player struct {
	ID   string
	Hand Hand
}

type Dealer struct{ Player }

func (d *Dealer) PlayTurn(deck *Deck, strat HandValueStrategy) {
	for strat.Value(d.Hand) < 17 {
		d.Hand.Cards = append(d.Hand.Cards, deck.Draw())
	}
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

enum Suit { Hearts, Diamonds, Clubs, Spades }
enum Rank { Ace=1, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Jack=10, Queen=10, King=10 }

record Card(Suit Suit, Rank Rank);

class Deck {
  readonly List<Card> _cards = new();
  public Deck() {
    foreach (Suit s in Enum.GetValues<Suit>())
      foreach (Rank r in Enum.GetValues<Rank>())
        _cards.Add(new Card(s,r));
  }
  public void Shuffle() => _cards.OrderBy(_ => Random.Shared.Next()).ToList();
  public Card Draw() { var c = _cards[^1]; _cards.RemoveAt(_cards.Count-1); return c; }
}

class Hand { public List<Card> Cards { get; } = new(); }

interface IHandValueStrategy { int Value(Hand hand); }

class BlackjackValueStrategy : IHandValueStrategy {
  public int Value(Hand hand) {
    int total=0, aces=0;
    foreach (var c in hand.Cards) {
      if (c.Rank==Rank.Ace){ aces++; total+=11; }
      else total += (int)c.Rank;
    }
    while (total>21 && aces>0){ total-=10; aces--; }
    return total;
  }
}

class Player { public string Id; public Hand Hand { get; } = new(); public Player(string id)=>Id=id; }
class Dealer : Player {
  public Dealer() : base("dealer") {}
  public void PlayTurn(Deck deck, IHandValueStrategy s) { while (s.Value(Hand)<17) Hand.Cards.Add(deck.Draw()); }
}

enum GameState { PlacingBets, Dealing, PlayerTurns, DealerTurn, Payout }

class BlackjackGame {
  public GameState State { get; private set; } = GameState.PlacingBets;
  public Deck Deck { get; } = new();
  public List<Player> Players { get; }
  public Dealer Dealer { get; } = new();
  public IHandValueStrategy Strategy { get; } = new BlackjackValueStrategy();
  public BlackjackGame(List<Player> players) => Players = players;
}
`

export const deckOfCardsSolution: ProblemSolution = {
  slug: 'deck-of-cards',
  title: 'Deck of Cards / Blackjack',
  overview: {
    introduction:
      'A reusable Deck (52 cards, Fisher-Yates shuffle) feeds a BlackjackGame state machine. Hand values use BlackjackValueStrategy (aces 11→1 while busting). Dealer extends Player and hits until 17+.',
    constraints: ['Up to 8 players', 'Dealer hits on soft 17 simplified to hard 17+ in demo'],
    assumptions: ['Single deck; reshuffle each round in demo', 'Bets abstracted in PLACING_BETS'],
    clarificationQuestions: ['Soft 17 rule for dealer?', 'Split/double down scope?', 'Shoe with cut card?'],
  },
  interviewApproach: {
    howToThink: 'Generic card library first, then game state machine and strategy for hand valuation.',
    breakdown: ['Card/Suit/Rank', 'Deck shuffle/draw', 'HandValueStrategy', 'BlackjackGame states'],
    entities: [
      { name: 'Deck', responsibility: '52 cards + shuffle + draw.' },
      { name: 'BlackjackValueStrategy', responsibility: 'Ace-aware total ≤21 preference.' },
      { name: 'BlackjackGame', responsibility: 'Round flow and payout.' },
    ],
    relationships: ['Dealer generalizes Player.', 'Hand uses strategy for value.'],
    patternsAndOop: ['Strategy for hand value', 'State machine for phases'],
    stepByStep: ['Build deck', 'Deal two each', 'Player hit/stand', 'Dealer turn', 'Payout compare'],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary: 'Deck is game-agnostic. Blackjack rules live in strategy + game states, not in Card itself.',
    classResponsibilities: [
      { name: 'BlackjackValueStrategy', responsibility: 'Best ace interpretation.' },
      { name: 'Dealer', responsibility: 'House draw rules.' },
    ],
    interfacesAndAbstractions: ['HandValueStrategy for Poker/other games.'],
    relationships: ['Game composes Deck and players.'],
    solid: ['SRP: Card has no blackjack logic', 'OCP: new games reuse Deck'],
    patterns: [
      { name: 'Strategy', why: 'Ace scoring varies by game.' },
      { name: 'State', why: 'Illegal hit during PAYOUT prevented.' },
    ],
    decisions: [{ decision: 'Fisher-Yates shuffle', rationale: 'Uniform permutations per NFR.' }],
    extensibility: 'Split hands as list of Hand; BetStrategy; shoe penetration tracking.',
  },
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    steps: ['shuffle', 'deal 2', 'player turns', 'dealer to 17+', 'payout compare to dealer'],
    examples: [{ title: 'Ace soft hand', input: 'Ace + 6 + 5', output: 'value 12 not 22', explanation: 'Strategy reduces ace 11→1.' }],
  },
  followUps: [
    { question: 'Fisher-Yates vs naive shuffle?', answer: 'Fisher-Yates O(n) uniform; naive sort-by-random biased.' },
    { question: 'Multiple decks?', answer: 'Deck holds N×52; count cards for hi-lo optional.' },
    { question: 'Split aces?', answer: 'Two Hand objects on Player; state tracks active hand index.' },
    { question: 'Strategy for Poker?', answer: 'PokerHandEvaluator implements HandValueStrategy differently.' },
    { question: 'Thread-safe deck?', answer: 'Synchronize draw or use deck per table instance.' },
    { question: 'Test ace logic?', answer: 'Table: A+A+9, A+K, A+A+A+8 edge totals.' },
  ],
  extras: {
    edgeCases: ['Empty deck draw', 'All players bust before dealer', 'Push on equal totals'],
    commonMistakes: ['Aces always 11', 'Dealer plays before players finish'],
    complexity: 'Value O(n) cards; shuffle O(n).',
    testing: ['Strategy totals', 'State illegal actions', 'Shuffle distribution smoke'],
    extensions: ['Side bets', 'Insurance', 'Online async rooms'],
    takeaways: ['Reusable deck', 'Strategy for rules', 'State machine for flow'],
  },
}
