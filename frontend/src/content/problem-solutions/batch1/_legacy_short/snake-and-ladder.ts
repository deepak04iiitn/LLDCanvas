import type { ProblemSolution } from '../types'
import { attr, abstractCls, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('gc', 'GameController', 40, 40, [
    attr('-', 'game', 'Game'),
  ], [
    method('+', 'playTurn', '', 'TurnResult'),
    method('+', 'winner', '', 'Player?'),
  ]),
  cls('gm', 'Game', 320, 40, [
    attr('-', 'board', 'Board'),
    attr('-', 'players', 'List<Player>'),
    attr('-', 'current', 'int'),
    attr('-', 'dice', 'Dice'),
  ], [
    method('+', 'moveCurrent', 'steps', 'void'),
  ]),
  cls('bd', 'Board', 600, 40, [
    attr('-', 'size', 'int'),
    attr('-', 'jumps', 'Map<int, Jump>'),
  ], [
    method('+', 'resolve', 'position', 'int'),
  ]),
  abstractCls('jmp', 'Jump', 320, 200, [
    attr('#', 'start', 'int'),
    attr('#', 'end', 'int'),
  ], [
    method('+', 'destination', '', 'int'),
  ]),
  cls('sn', 'Snake', 520, 200, [], [
    method('+', 'destination', '', 'int'),
  ]),
  cls('ld', 'Ladder', 720, 200, [], [
    method('+', 'destination', '', 'int'),
  ]),
  cls('pl', 'Player', 40, 280, [
    attr('-', 'id', 'string'),
    attr('-', 'position', 'int'),
  ], []),
  cls('dc', 'Dice', 320, 320, [
    attr('-', 'sides', 'int'),
  ], [
    method('+', 'roll', '', 'int'),
  ]),
  cls('bb', 'BoardBuilder', 600, 280, [], [
    method('+', 'withJump', 'jump: Jump', 'BoardBuilder'),
    method('+', 'build', '', 'Board'),
  ]),
]

const edges = [
  edge('e1', 'gc', 'gm', 'aggregation', 'right', 'left'),
  edge('e2', 'gm', 'bd', 'composition', 'right', 'left'),
  edge('e3', 'gm', 'pl', 'aggregation', 'right@70', 'left'),
  edge('e4', 'gm', 'dc', 'aggregation', 'bottom', 'top'),
  edge('e5', 'sn', 'jmp', 'inheritance', 'top', 'bottom'),
  edge('e6', 'ld', 'jmp', 'inheritance', 'top', 'bottom'),
  edge('e7', 'bd', 'jmp', 'association', 'bottom', 'top'),
  edge('e8', 'bb', 'bd', 'dependency', 'left', 'right', { label: 'creates' }),
]

const py = `from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from random import randint
from typing import Dict, List, Optional


class Jump(ABC):
    def __init__(self, start: int, end: int):
        if start == end:
            raise ValueError("start must differ from end")
        self.start = start
        self.end = end

    @abstractmethod
    def destination(self) -> int:
        return self.end


class Snake(Jump):
    def __init__(self, start: int, end: int):
        if start <= end:
            raise ValueError("snake goes down")
        super().__init__(start, end)


class Ladder(Jump):
    def __init__(self, start: int, end: int):
        if start >= end:
            raise ValueError("ladder goes up")
        super().__init__(start, end)


@dataclass
class Board:
    size: int
    jumps: Dict[int, Jump] = field(default_factory=dict)

    def resolve(self, position: int) -> int:
        jump = self.jumps.get(position)
        return jump.destination() if jump else position


class BoardBuilder:
    def __init__(self, size: int):
        self.size = size
        self.jumps: Dict[int, Jump] = {}

    def with_jump(self, jump: Jump) -> "BoardBuilder":
        if jump.start in self.jumps:
            raise ValueError("overlapping jump")
        if jump.start < 1 or jump.end < 1 or jump.start > self.size or jump.end > self.size:
            raise ValueError("out of bounds")
        self.jumps[jump.start] = jump
        return self

    def build(self) -> Board:
        return Board(self.size, dict(self.jumps))


@dataclass
class Player:
    id: str
    position: int = 0


class Dice:
    def __init__(self, sides: int = 6):
        self.sides = sides

    def roll(self) -> int:
        return randint(1, self.sides)


@dataclass
class Game:
    board: Board
    players: List[Player]
    dice: Dice = field(default_factory=Dice)
    current: int = 0

    def move_current(self, steps: int) -> None:
        p = self.players[self.current]
        p.position = min(self.board.size, p.position + steps)
        p.position = self.board.resolve(p.position)

    def next_turn(self) -> None:
        self.current = (self.current + 1) % len(self.players)

    def winner(self) -> Optional[Player]:
        for pl in self.players:
            if pl.position >= self.board.size:
                return pl
        return None


class GameController:
    def __init__(self, game: Game):
        self.game = game

    def play_turn(self) -> dict:
        if self.game.winner():
            raise RuntimeError("game over")
        steps = self.game.dice.roll()
        player = self.game.players[self.game.current]
        before = player.position
        self.game.move_current(steps)
        after = player.position
        win = self.game.winner()
        if not win:
            self.game.next_turn()
        return {"player": player.id, "roll": steps, "from": before, "to": after, "winner": win.id if win else None}
`

const java = `abstract class Jump {
  final int start, end;
  Jump(int s, int e) { start=s; end=e; }
  abstract int destination();
}
class Snake extends Jump {
  Snake(int s, int e) { super(s,e); if (s<=e) throw new IllegalArgumentException(); }
  int destination() { return end; }
}
class Ladder extends Jump {
  Ladder(int s, int e) { super(s,e); if (s>=e) throw new IllegalArgumentException(); }
  int destination() { return end; }
}

class Board {
  final int size;
  final java.util.Map<Integer, Jump> jumps = new java.util.HashMap<>();
  Board(int size) { this.size = size; }
  int resolve(int pos) { Jump j = jumps.get(pos); return j==null? pos : j.destination(); }
}

class BoardBuilder {
  final int size;
  final java.util.Map<Integer, Jump> jumps = new java.util.HashMap<>();
  BoardBuilder(int size) { this.size = size; }
  BoardBuilder withJump(Jump j) {
    if (jumps.containsKey(j.start)) throw new IllegalStateException("overlap");
    jumps.put(j.start, j); return this;
  }
  Board build() { Board b = new Board(size); b.jumps.putAll(jumps); return b; }
}

class Player { final String id; int position; Player(String id){ this.id=id; } }

class Dice {
  int roll() { return 1 + new java.util.Random().nextInt(6); }
}

class Game {
  final Board board;
  final java.util.List<Player> players;
  int current;
  final Dice dice = new Dice();
  Game(Board b, java.util.List<Player> ps) { board=b; players=ps; }
  void moveCurrent(int steps) {
    Player p = players.get(current);
    p.position = Math.min(board.size, p.position + steps);
    p.position = board.resolve(p.position);
  }
  Player winner() {
    for (Player p : players) if (p.position >= board.size) return p;
    return null;
  }
}
`

const ts = `abstract class Jump {
  constructor(protected start: number, protected end: number) {}
  destination() { return this.end }
}
class Snake extends Jump {
  constructor(start: number, end: number) {
    super(start, end)
    if (start <= end) throw new Error('snake down')
  }
}
class Ladder extends Jump {
  constructor(start: number, end: number) {
    super(start, end)
    if (start >= end) throw new Error('ladder up')
  }
}

class Board {
  jumps = new Map<number, Jump>()
  constructor(public readonly size: number) {}
  resolve(pos: number) { return this.jumps.get(pos)?.destination() ?? pos }
}

class BoardBuilder {
  jumps = new Map<number, Jump>()
  constructor(public readonly size: number) {}
  withJump(j: Jump) {
    if (this.jumps.has(j['start'])) throw new Error('overlap')
    this.jumps.set((j as any).start, j)
    return this
  }
  build() {
    const b = new Board(this.size)
    b.jumps = new Map(this.jumps)
    return b
  }
}

class Player { position = 0; constructor(public readonly id: string) {} }

class Dice { roll() { return 1 + Math.floor(Math.random() * 6) } }

class Game {
  current = 0
  dice = new Dice()
  constructor(public board: Board, public players: Player[]) {}
  moveCurrent(steps: number) {
    const p = this.players[this.current]
    p.position = Math.min(this.board.size, p.position + steps)
    p.position = this.board.resolve(p.position)
  }
  winner() { return this.players.find(p => p.position >= this.board.size) ?? null }
}

export { Game, BoardBuilder, Snake, Ladder, Player }
`

const cpp = `#include <map>
#include <memory>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

struct Jump {
  int start, end;
  virtual ~Jump() = default;
  virtual int destination() const { return end; }
};
struct Snake : Jump { Snake(int s,int e){ start=s; end=e; if (s<=e) throw std::runtime_error("snake"); } };
struct Ladder : Jump { Ladder(int s,int e){ start=s; end=e; if (s>=e) throw std::runtime_error("ladder"); } };

struct Board {
  int size;
  std::map<int, std::shared_ptr<Jump>> jumps;
  int resolve(int pos) const {
    auto it = jumps.find(pos);
    return it==jumps.end()? pos : it->second->destination();
  }
};

struct Player { std::string id; int position{0}; };

struct Dice {
  int roll() { static std::mt19937 rng{std::random_device{}()}; return std::uniform_int_distribution<>(1,6)(rng); }
};

struct Game {
  Board board;
  std::vector<Player> players;
  int current{0};
  Dice dice;
  void moveCurrent(int steps) {
    auto& p = players[current];
    p.position = std::min(board.size, p.position + steps);
    p.position = board.resolve(p.position);
  }
};
`

const goCode = `package snake

import (
	"errors"
	"math/rand"
)

type Jump interface {
	Start() int
	Destination() int
}

type Snake struct{ start, end int }
func (s Snake) Start() int       { return s.start }
func (s Snake) Destination() int  { return s.end }

type Ladder struct{ start, end int }
func (l Ladder) Start() int      { return l.start }
func (l Ladder) Destination() int { return l.end }

type Board struct {
	Size  int
	Jumps map[int]Jump
}

func (b Board) Resolve(pos int) int {
	if j, ok := b.Jumps[pos]; ok {
		return j.Destination()
	}
	return pos
}

type BoardBuilder struct {
	size  int
	jumps map[int]Jump
}

func NewBoardBuilder(size int) *BoardBuilder {
	return &BoardBuilder{size: size, jumps: map[int]Jump{}}
}

func (bb *BoardBuilder) WithJump(j Jump) (*BoardBuilder, error) {
	if _, ok := bb.jumps[j.Start()]; ok {
		return nil, errors.New("overlap")
	}
	bb.jumps[j.Start()] = j
	return bb, nil
}

func (bb *BoardBuilder) Build() Board {
	return Board{Size: bb.size, Jumps: bb.jumps}
}

type Player struct {
	ID       string
	Position int
}

type Dice struct{}

func (Dice) Roll() int { return rand.Intn(6) + 1 }

type Game struct {
	Board   Board
	Players []*Player
	Current int
	Dice    Dice
}

func (g *Game) MoveCurrent(steps int) {
	p := g.Players[g.Current]
	if p.Position+steps > g.Board.Size {
		p.Position = g.Board.Size
	} else {
		p.Position += steps
	}
	p.Position = g.Board.Resolve(p.Position)
}
`

const csharp = `using System;
using System.Collections.Generic;

abstract class Jump {
  public int Start { get; }
  public int End { get; }
  protected Jump(int start, int end) { Start = start; End = end; }
  public virtual int Destination() => End;
}
class Snake : Jump { public Snake(int s, int e) : base(s,e) { if (s<=e) throw new ArgumentException(); } }
class Ladder : Jump { public Ladder(int s, int e) : base(s,e) { if (s>=e) throw new ArgumentException(); } }

class Board {
  public int Size { get; }
  public Dictionary<int, Jump> Jumps { get; } = new();
  public Board(int size) => Size = size;
  public int Resolve(int pos) => Jumps.TryGetValue(pos, out var j) ? j.Destination() : pos;
}

class BoardBuilder {
  readonly int _size;
  readonly Dictionary<int, Jump> _jumps = new();
  public BoardBuilder(int size) => _size = size;
  public BoardBuilder WithJump(Jump j) {
    if (_jumps.ContainsKey(j.Start)) throw new InvalidOperationException();
    _jumps[j.Start] = j; return this;
  }
  public Board Build() { var b = new Board(_size); foreach (var kv in _jumps) b.Jumps[kv.Key]=kv.Value; return b; }
}

class Player { public string Id; public int Position; public Player(string id)=>Id=id; }

class Dice { public int Roll() => Random.Shared.Next(1,7); }

class Game {
  public Board Board { get; }
  public List<Player> Players { get; }
  public int Current { get; private set; }
  public Dice Dice { get; } = new();
  public Game(Board board, List<Player> players) { Board = board; Players = players; }
  public void MoveCurrent(int steps) {
    var p = Players[Current];
    p.Position = Math.Min(Board.Size, p.Position + steps);
    p.Position = Board.Resolve(p.Position);
  }
}
`

export const snakeAndLadderSolution: ProblemSolution = {
  slug: 'snake-and-ladder',
  title: 'Snake and Ladder Game',
  overview: {
    introduction:
      'Players take turns rolling dice and advancing on a Board. Snakes and ladders are Jump subclasses mapped by start cell. BoardBuilder validates non-overlapping jumps. GameController drives turns and win detection.',
    constraints: ['2-4 players', 'First to reach final cell wins', 'No overlapping jump starts'],
    assumptions: ['Exact landing on size wins (no bounce-back overshoot rule unless asked).', 'Single six-sided die by default; two dice optional.'],
    clarificationQuestions: ['Must you land exactly on the last cell?', 'Snake/ladder on same cell allowed?', 'Turn order fixed or random start?'],
  },
  interviewApproach: {
    howToThink: 'Uniform Jump abstraction for snakes and ladders; board resolves position after each move.',
    breakdown: ['Jump hierarchy', 'Board + Builder validation', 'Game turn loop', 'GameController façade'],
    entities: [
      { name: 'Board', responsibility: 'Size and jump lookup.' },
      { name: 'Jump / Snake / Ladder', responsibility: 'Destination mapping.' },
      { name: 'Game', responsibility: 'Turn index, dice, players.' },
    ],
    relationships: ['Snake/Ladder generalize Jump.', 'Board maps start → Jump.'],
    patternsAndOop: ['Builder for Board', 'Template for turn flow'],
    stepByStep: ['Define Jump', 'Builder validates overlaps', 'move + resolve', 'winner check'],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary: 'Jump polymorphism keeps board.resolve uniform. Builder catches invalid configs before play.',
    classResponsibilities: [
      { name: 'BoardBuilder', responsibility: 'Validate and assemble jumps.' },
      { name: 'GameController', responsibility: 'Public API for playTurn.' },
    ],
    interfacesAndAbstractions: ['Jump with destination()'],
    relationships: ['Game composes Board and Players.'],
    solid: ['OCP: new jump types extend Jump', 'SRP: Board does not roll dice'],
    patterns: [{ name: 'Builder', why: 'Safe board construction with validation.' }],
    decisions: [{ decision: 'Map jumps by start cell only', rationale: 'O(1) lookup after move.' }],
    extensibility: 'Serialize Game state JSON; inject Dice interface for test doubles.',
  },
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    steps: ['Roll dice', 'Advance current player', 'Board.resolve', 'Check winner else next player'],
    examples: [{ title: 'Ladder boost', input: 'land on 4 with ladder 4→14', output: 'position 14', explanation: 'resolve replaces raw position.' }],
  },
  followUps: [
    { question: 'Serialize game state?', answer: 'JSON of player positions, current index, board jumps; version field for schema.' },
    { question: 'Two dice?', answer: 'Dice.rollTwice() or composite Roller; same resolve pipeline.' },
    { question: 'Validate board generation?', answer: 'Builder rejects overlap; optional BFS reachability check.' },
    { question: 'True random?', answer: 'Use crypto RNG or seeded RNG for reproducible tests.' },
    { question: 'Undo move?', answer: 'Command pattern storing snapshots per turn.' },
    { question: 'Online multiplayer?', answer: 'GameController as server; stateless clients send playTurn.' },
  ],
  extras: {
    edgeCases: ['Jump chain (rare)', 'Overlap at build', 'Win on exact size'],
    commonMistakes: ['Separate snake/ladder logic in Game', 'Allow overlapping starts'],
    complexity: 'resolve O(1); turn O(1).',
    testing: ['Builder overlap', 'Snake down validation', 'Win detection'],
    extensions: ['Power-ups', 'Custom boards', 'AI player'],
    takeaways: ['Jump abstraction', 'Builder validates', 'Controller separates UI'],
  },
}
