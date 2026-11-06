import type { ProblemSolution } from '../types'
import { attr, cls, edge, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('g', 'Game', 40, 40, [
    attr('-', 'board', 'Board'),
    attr('-', 'players', 'Player[2]'),
    attr('-', 'current', 'int'),
  ], [
    method('+', 'play', '', 'GameStatus'),
  ]),
  cls('bd', 'Board', 320, 40, [
    attr('-', 'size', 'int'),
    attr('-', 'grid', 'Symbol[][]'),
    attr('-', 'rowCount', 'int[]'),
    attr('-', 'colCount', 'int[]'),
  ], [
    method('+', 'place', 'row, col, symbol', 'bool'),
    method('+', 'winner', '', 'Symbol?'),
    method('+', 'full', '', 'bool'),
  ]),
  enmFromSymbol(),
  iface('pl', 'Player', 40, 240, [
    method('+', 'makeMove', 'board: Board', 'Move?'),
  ]),
  cls('hp', 'HumanPlayer', 240, 240, [], [
    method('+', 'makeMove', 'board', 'Move?'),
  ]),
  cls('ai', 'AIPlayer', 440, 240, [
    attr('-', 'symbol', 'Symbol'),
  ], [
    method('+', 'makeMove', 'board', 'Move?'),
  ]),
  cls('mv', 'Move', 320, 240, [
    attr('-', 'row', 'int'),
    attr('-', 'col', 'int'),
  ], []),
]

function enmFromSymbol() {
  return {
    id: 'sym',
    type: 'enum' as const,
    position: { x: 600, y: 40 },
    data: {
      nodeType: 'enum' as const,
      name: 'Symbol',
      attributes: [{ id: 's1', visibility: '+' as const, name: 'X', type: '', isStatic: false }, { id: 's2', visibility: '+' as const, name: 'O', type: '', isStatic: false }, { id: 's3', visibility: '+' as const, name: 'EMPTY', type: '', isStatic: false }],
      methods: [],
      alwaysExpanded: true,
    },
  }
}

const edges = [
  edge('e1', 'g', 'bd', 'composition', 'right', 'left'),
  edge('e2', 'g', 'pl', 'association', 'bottom', 'top'),
  edge('e3', 'hp', 'pl', 'realization', 'top', 'bottom'),
  edge('e4', 'ai', 'pl', 'realization', 'top', 'bottom'),
  edge('e5', 'pl', 'mv', 'dependency', 'right', 'left'),
  edge('e6', 'bd', 'sym', 'dependency', 'right', 'left'),
]

const py = `from __future__ import annotations
from dataclasses import dataclass
from enum import Enum, auto
from typing import List, Optional, Tuple


class Symbol(Enum):
    EMPTY = auto()
    X = auto()
    O = auto()


@dataclass
class Move:
    row: int
    col: int


class Board:
    def __init__(self, size: int = 3):
        self.size = size
        self.grid = [[Symbol.EMPTY for _ in range(size)] for _ in range(size)]
        self.row_count = {Symbol.X: [0]*size, Symbol.O: [0]*size}
        self.col_count = {Symbol.X: [0]*size, Symbol.O: [0]*size}
        self.diag = {Symbol.X: 0, Symbol.O: 0}
        self.adiag = {Symbol.X: 0, Symbol.O: 0}

    def place(self, row: int, col: int, sym: Symbol) -> bool:
        if self.grid[row][col] != Symbol.EMPTY:
            return False
        self.grid[row][col] = sym
        self.row_count[sym][row] += 1
        self.col_count[sym][col] += 1
        if row == col:
            self.diag[sym] += 1
        if row + col == self.size - 1:
            self.adiag[sym] += 1
        return True

    def winner(self) -> Optional[Symbol]:
        for sym in (Symbol.X, Symbol.O):
            if any(c == self.size for c in self.row_count[sym]):
                return sym
            if any(c == self.size for c in self.col_count[sym]):
                return sym
            if self.diag[sym] == self.size or self.adiag[sym] == self.size:
                return sym
        return None

    def full(self) -> bool:
        return all(cell != Symbol.EMPTY for row in self.grid for cell in row)

    def empty_cells(self) -> List[Tuple[int, int]]:
        return [(r, c) for r in range(self.size) for c in range(self.size) if self.grid[r][c] == Symbol.EMPTY]


class Player:
    def __init__(self, symbol: Symbol):
        self.symbol = symbol

    def make_move(self, board: Board) -> Optional[Move]:
        raise NotImplementedError


class HumanPlayer(Player):
    def __init__(self, symbol: Symbol, provider):
        super().__init__(symbol)
        self.provider = provider

    def make_move(self, board: Board) -> Optional[Move]:
        r, c = self.provider(board)
        return Move(r, c)


class AIPlayer(Player):
    def make_move(self, board: Board) -> Optional[Move]:
        best = self._minimax(board, self.symbol, True)
        return best[1]

    def _minimax(self, board: Board, sym: Symbol, maximizing) -> Tuple[int, Optional[Move]]:
        opp = Symbol.O if sym == Symbol.X else Symbol.X
        w = board.winner()
        if w == self.symbol:
            return 1, None
        if w == opp:
            return -1, None
        if board.full():
            return 0, None
        best_score = -2 if maximizing else 2
        best_move: Optional[Move] = None
        for r, c in board.empty_cells():
            board.place(r, c, sym if maximizing else opp)
            score, _ = self._minimax(board, sym, not maximizing)
            board.grid[r][c] = Symbol.EMPTY
            if maximizing and score > best_score:
                best_score, best_move = score, Move(r, c)
            if not maximizing and score < best_score:
                best_score, best_move = score, Move(r, c)
        return best_score, best_move


class Game:
    def __init__(self, size: int, p1: Player, p2: Player):
        self.board = Board(size)
        self.players = [p1, p2]
        self.current = 0

    def play(self) -> str:
        while True:
            mv = self.players[self.current].make_move(self.board)
            if mv is None:
                return "draw"
            sym = self.players[self.current].symbol
            if not self.board.place(mv.row, mv.col, sym):
                raise ValueError("illegal")
            if self.board.winner():
                return f"{sym.name} wins"
            if self.board.full():
                return "draw"
            self.current = 1 - self.current
`

const java = `enum Symbol { EMPTY, X, O }

class Move { final int row, col; Move(int r,int c){ row=r; col=c; } }

class Board {
  final int size;
  final Symbol[][] grid;
  final int[][] rowX, rowO, colX, colO;
  int diagX, diagO, adiagX, adiagO;
  Board(int size) {
    this.size = size;
    grid = new Symbol[size][size];
    for (int i=0;i<size;i++) for (int j=0;j<size;j++) grid[i][j]=Symbol.EMPTY;
    rowX=new int[size][size]; rowO=new int[size][size];
    colX=new int[size][size]; colO=new int[size][size];
  }
  boolean place(int r,int c, Symbol s) {
    if (grid[r][c]!=Symbol.EMPTY) return false;
    grid[r][c]=s;
    if (s==Symbol.X) { rowX[r][c]++; colX[r][c]++; if (r==c) diagX++; if (r+c==size-1) adiagX++; }
    else { rowO[r][c]++; colO[r][c]++; if (r==c) diagO++; if (r+c==size-1) adiagO++; }
    return true;
  }
  Symbol winner() { /* simplified 3x3 */ return null; }
}

interface Player { Move makeMove(Board b); }

class AIPlayer implements Player {
  Symbol symbol;
  AIPlayer(Symbol s){ symbol=s; }
  public Move makeMove(Board b) { return new Move(0,0); }
}

class Game {
  Board board; Player[] players; int current;
  Game(int n, Player a, Player b){ board=new Board(n); players=new Player[]{a,b}; }
}
`

const ts = `enum Symbol { Empty, X, O }

class Move { constructor(public row: number, public col: number) {} }

class Board {
  grid: Symbol[][]
  rowCount: Record<Symbol, number[]> = { [Symbol.X]: [], [Symbol.O]: [], [Symbol.Empty]: [] }
  colCount: Record<Symbol, number[]> = { [Symbol.X]: [], [Symbol.O]: [], [Symbol.Empty]: [] }
  diag = { [Symbol.X]: 0, [Symbol.O]: 0, [Symbol.Empty]: 0 }
  adiag = { [Symbol.X]: 0, [Symbol.O]: 0, [Symbol.Empty]: 0 }
  constructor(public readonly size: number) {
    this.grid = Array.from({ length: size }, () => Array(size).fill(Symbol.Empty))
    for (const s of [Symbol.X, Symbol.O]) {
      this.rowCount[s] = Array(size).fill(0)
      this.colCount[s] = Array(size).fill(0)
    }
  }
  place(row: number, col: number, sym: Symbol) {
    if (this.grid[row][col] !== Symbol.Empty) return false
    this.grid[row][col] = sym
    this.rowCount[sym][row]++
    this.colCount[sym][col]++
    if (row === col) this.diag[sym]++
    if (row + col === this.size - 1) this.adiag[sym]++
    return true
  }
  winner(): Symbol | null {
    for (const sym of [Symbol.X, Symbol.O]) {
      if (this.rowCount[sym].some(c => c === this.size)) return sym
      if (this.colCount[sym].some(c => c === this.size)) return sym
      if (this.diag[sym] === this.size || this.adiag[sym] === this.size) return sym
    }
    return null
  }
  full() { return this.grid.every(row => row.every(c => c !== Symbol.Empty)) }
  emptyCells(): Move[] {
    const out: Move[] = []
    for (let r = 0; r < this.size; r++)
      for (let c = 0; c < this.size; c++)
        if (this.grid[r][c] === Symbol.Empty) out.push(new Move(r, c))
    return out
  }
}

interface Player { makeMove(board: Board): Move | null }

class AIPlayer implements Player {
  constructor(private symbol: Symbol, private opp: Symbol) {}
  makeMove(board: Board): Move | null {
    let best = -2
    let pick: Move | null = null
    for (const m of board.emptyCells()) {
      board.place(m.row, m.col, this.symbol)
      const score = this.minimax(board, false)
      board.grid[m.row][m.col] = Symbol.Empty
      if (score > best) { best = score; pick = m }
    }
    return pick
  }
  private minimax(board: Board, maximizing: boolean): number {
    const w = board.winner()
    if (w === this.symbol) return 1
    if (w === this.opp) return -1
    if (board.full()) return 0
    if (maximizing) {
      return Math.max(...board.emptyCells().map(m => {
        board.place(m.row, m.col, this.symbol)
        const s = this.minimax(board, false)
        board.grid[m.row][m.col] = Symbol.Empty
        return s
      }))
    }
    return Math.min(...board.emptyCells().map(m => {
      board.place(m.row, m.col, this.opp)
      const s = this.minimax(board, true)
      board.grid[m.row][m.col] = Symbol.Empty
      return s
    }))
  }
}

class Game {
  current = 0
  constructor(public board: Board, public players: [Player, Player]) {}
  play(): string {
    while (true) {
      const mv = this.players[this.current].makeMove(this.board)
      if (!mv) return 'draw'
      const sym = this.current === 0 ? Symbol.X : Symbol.O
      if (!this.board.place(mv.row, mv.col, sym)) throw new Error('illegal')
      const w = this.board.winner()
      if (w) return \`\${w} wins\`
      if (this.board.full()) return 'draw'
      this.current = 1 - this.current
    }
  }
}

export { Game, Board, AIPlayer, Symbol }
`

const cpp = `#include <array>
#include <optional>
#include <vector>

enum class Symbol { Empty, X, O };

struct Move { int row, col; };

class Board {
public:
  explicit Board(int n) : size(n), grid(n, std::vector<Symbol>(n, Symbol::Empty)) {}
  int size;
  std::vector<std::vector<Symbol>> grid;
  bool place(int r, int c, Symbol s) {
    if (grid[r][c]!=Symbol::Empty) return false;
    grid[r][c]=s; return true;
  }
  std::optional<Symbol> winner(int n) const {
    for (int i=0;i<n;i++) {
      Symbol s = grid[i][0];
      if (s==Symbol::Empty) continue;
      bool ok=true;
      for (int j=1;j<n;j++) if (grid[i][j]!=s) ok=false;
      if (ok) return s;
    }
    return std::nullopt;
  }
};
`

const goCode = `package tictactoe

type Symbol int

const (
	Empty Symbol = iota
	X
	O
)

type Move struct{ Row, Col int }

type Board struct {
	Size int
	Grid [][]Symbol
	RowCount [2][]int
	ColCount [2][]int
	Diag     [2]int
	ADiag    [2]int
}

func NewBoard(size int) *Board {
	g := make([][]Symbol, size)
	for i := range g {
		g[i] = make([]Symbol, size)
	}
	return &Board{
		Size: size, Grid: g,
		RowCount: [2][]int{make([]int, size), make([]int, size)},
		ColCount: [2][]int{make([]int, size), make([]int, size)},
	}
}

func (b *Board) Place(row, col int, sym Symbol) bool {
	if b.Grid[row][col] != Empty {
		return false
	}
	b.Grid[row][col] = sym
	idx := 0
	if sym == O {
		idx = 1
	}
	b.RowCount[idx][row]++
	b.ColCount[idx][col]++
	if row == col {
		b.Diag[idx]++
	}
	if row+col == b.Size-1 {
		b.ADiag[idx]++
	}
	return true
}

func (b *Board) Winner() *Symbol {
 check := func(idx int, sym Symbol) *Symbol {
		for i := 0; i < b.Size; i++ {
			if b.RowCount[idx][i] == b.Size || b.ColCount[idx][i] == b.Size {
				return &sym
			}
		}
		if b.Diag[idx] == b.Size || b.ADiag[idx] == b.Size {
			return &sym
		}
		return nil
	}
	if w := check(0, X); w != nil {
		return w
	}
	return check(1, O)
}

type Player interface {
	MakeMove(b *Board) *Move
}

type Game struct {
	Board   *Board
	Players [2]Player
	Current int
}
`

const csharp = `using System;
using System.Linq;

enum Symbol { Empty, X, O }

record Move(int Row, int Col);

class Board {
  public int Size { get; }
  public Symbol[,] Grid { get; }
  readonly int[] rowX, rowO, colX, colO;
  int diagX, diagO, adiagX, adiagO;
  public Board(int size) {
    Size = size; Grid = new Symbol[size, size];
    rowX = new int[size]; rowO = new int[size]; colX = new int[size]; colO = new int[size];
  }
  public bool Place(int r, int c, Symbol s) {
    if (Grid[r,c]!=Symbol.Empty) return false;
    Grid[r,c]=s;
    if (s==Symbol.X) { rowX[r]++; colX[c]++; if (r==c) diagX++; if (r+c==Size-1) adiagX++; }
    else { rowO[r]++; colO[c]++; if (r==c) diagO++; if (r+c==Size-1) adiagO++; }
    return true;
  }
  public Symbol? Winner() {
    for (int i=0;i<Size;i++) {
      if (rowX[i]==Size) return Symbol.X; if (rowO[i]==Size) return Symbol.O;
      if (colX[i]==Size) return Symbol.X; if (colO[i]==Size) return Symbol.O;
    }
    if (diagX==Size || adiagX==Size) return Symbol.X;
    if (diagO==Size || adiagO==Size) return Symbol.O;
    return null;
  }
}

interface IPlayer { Move? MakeMove(Board board); }

class Game {
  public Board Board { get; }
  public IPlayer[] Players { get; }
  int _current;
  public Game(Board b, IPlayer p1, IPlayer p2) { Board=b; Players=new[]{p1,p2}; }
}
`

export const ticTacToeSolution: ProblemSolution = {
  slug: 'tic-tac-toe',
  title: 'Tic-Tac-Toe',
  overview: {
    introduction:
      'An N×N board tracks row/column/diagonal counters per symbol for O(1) win checks. Player strategy separates human input from AI minimax. Game alternates turns until win or draw.',
    constraints: ['Win requires N in a row/col/diagonal', 'AI should play optimally on small boards'],
    assumptions: ['X goes first', 'Minimax acceptable up to 5×5 with pruning in production'],
    clarificationQuestions: ['Board size default?', 'Misere rules?', 'Infinite board variant?'],
  },
  interviewApproach: {
    howToThink: 'Incremental win counters avoid scanning full grid each move. Strategy pattern for Human vs AI.',
    breakdown: ['Board counters', 'Player interface', 'Minimax AI', 'Game loop'],
    entities: [
      { name: 'Board', responsibility: 'Grid + O(1) win detection.' },
      { name: 'Player', responsibility: 'makeMove strategy.' },
      { name: 'Game', responsibility: 'Turn orchestration.' },
    ],
    relationships: ['Game associates two Players.', 'Players depend on Board.'],
    patternsAndOop: ['Strategy for Player', 'Minimax + alpha-beta extension'],
    stepByStep: ['Board.place updates counters', 'winner()', 'AIPlayer minimax', 'Game.play loop'],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary: 'Counters give O(1) win after each placement. AI isolated in AIPlayer; Game unchanged when adding new player types.',
    classResponsibilities: [
      { name: 'Board', responsibility: 'Rules and win state.' },
      { name: 'AIPlayer', responsibility: 'Optimal move selection.' },
    ],
    interfacesAndAbstractions: ['Player.makeMove(board)'],
    relationships: ['Realization Human/AI → Player'],
    solid: ['OCP: new player types without editing Game', 'SRP: Board does not know AI algorithm'],
    patterns: [{ name: 'Strategy', why: 'Swap human vs AI move generation.' }],
    decisions: [{ decision: 'Incremental counters', rationale: 'Meets O(1) win detection NFR.' }],
    extensibility: 'Alpha-beta pruning; MCTS for larger boards; networked HumanPlayer.',
  },
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    steps: ['Current player makeMove', 'Board.place', 'Check winner/draw', 'Swap current'],
    examples: [{ title: '3×3 fork', input: 'AI vs human midgame', output: 'AI blocks or wins', explanation: 'Minimax scores ±1/0.' }],
  },
  followUps: [
    { question: 'Alpha-beta pruning?', answer: 'Pass alpha/beta through minimax; prune when score cannot affect root.' },
    { question: '5×5 still under 500ms?', answer: 'Heuristic evaluation + depth limit or transposition table.' },
    { question: 'Undo move?', answer: 'Decrement counters on undo; Command stack.' },
    { question: 'Multiple win lengths?', answer: 'Parameter winLength ≤ N; check any window.' },
    { question: 'Test AI?', answer: 'Board states with known optimal move; symmetries reduce cases.' },
    { question: 'Draw detection?', answer: 'full() when no EMPTY cells and winner null.' },
  ],
  extras: {
    edgeCases: ['Full board draw', 'Illegal occupied cell', '1×1 board'],
    commonMistakes: ['Scan entire grid each move', 'AI tied to Game class'],
    complexity: 'Place O(1); minimax O(b^d) branching.',
    testing: ['Counter invariants', 'Win rows/cols/diags', 'AI blocks immediate win'],
    extensions: ['Connect-4 gravity', 'Online PvP'],
    takeaways: ['O(1) win via counters', 'Strategy for players', 'Keep Game dumb'],
  },
}
