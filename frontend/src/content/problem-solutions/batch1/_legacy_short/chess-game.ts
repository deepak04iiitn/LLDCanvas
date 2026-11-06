import type { ProblemSolution } from '../types'
import { abstractCls, attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  // Row 1 - orchestration and board
  cls('gm', 'Game', 40, 40, [
    attr('-', 'board', 'Board'),
    attr('-', 'turn', 'Color'),
    attr('-', 'status', 'GameStatus'),
    attr('-', 'whitePlayer', 'Player'),
    attr('-', 'blackPlayer', 'Player'),
  ], [
    method('+', 'makeMove', 'from, to, promotion?', 'Move'),
    method('+', 'legalMoves', 'from: Position', 'List<Move>'),
    method('+', 'inCheck', 'color: Color', 'bool'),
    method('+', 'history', '', 'List<Move>'),
    method('-', 'updateStatus', '', 'void'),
  ]),
  cls('bd', 'Board', 420, 40, [
    attr('-', 'grid', 'Piece?[8][8]'),
    attr('-', 'history', 'Stack<Move>'),
  ], [
    method('+', 'get', 'pos: Position', 'Piece?'),
    method('+', 'apply', 'move: Move', 'void'),
    method('+', 'undo', 'move: Move', 'void'),
    method('+', 'isAttacked', 'pos: Position, by: Color', 'bool'),
    method('+', 'findKing', 'color: Color', 'Position'),
    method('+', 'lastMove', '', 'Move?'),
  ]),
  cls('mv', 'Move', 800, 40, [
    attr('+', 'from', 'Position'),
    attr('+', 'to', 'Position'),
    attr('+', 'piece', 'Piece'),
    attr('+', 'kind', 'MoveKind'),
    attr('+', 'captured', 'Piece?'),
    attr('+', 'promotion', 'PieceType?'),
  ], []),
  cls('pp', 'Player', 40, 400, [
    attr('-', 'name', 'string'),
    attr('-', 'color', 'Color'),
  ], []),

  // Row 2 - Piece hierarchy root
  abstractCls('pc', 'Piece', 420, 400, [
    attr('#', 'color', 'Color'),
    attr('#', 'type', 'PieceType'),
    attr('+', 'hasMoved', 'bool'),
  ], [
    method('+', 'getValidMoves', 'board: Board, pos: Position', 'List<Move>', { isAbstract: true }),
    method('+', 'attacks', 'board: Board, pos: Position', 'List<Position>'),
  ]),

  // Row 3 - concrete pieces
  cls('kg', 'King', 40, 820, [], [
    method('+', 'getValidMoves', 'board, pos', 'List<Move>'),
    method('+', 'attacks', 'board, pos', 'List<Position>'),
  ]),
  cls('qn', 'Queen', 360, 820, [], [
    method('+', 'getValidMoves', 'board, pos', 'List<Move>'),
  ]),
  cls('rk', 'Rook', 680, 820, [], [
    method('+', 'getValidMoves', 'board, pos', 'List<Move>'),
  ]),
  cls('bs', 'Bishop', 1000, 820, [], [
    method('+', 'getValidMoves', 'board, pos', 'List<Move>'),
  ]),
  cls('kn', 'Knight', 1320, 820, [], [
    method('+', 'getValidMoves', 'board, pos', 'List<Move>'),
  ]),
  cls('pw', 'Pawn', 1640, 820, [], [
    method('+', 'getValidMoves', 'board, pos', 'List<Move>'),
    method('+', 'attacks', 'board, pos', 'List<Position>'),
  ]),

  // Value types / enums
  cls('ps', 'Position', 1180, 40, [
    attr('+', 'row', 'int'),
    attr('+', 'col', 'int'),
  ], [
    method('+', 'offset', 'dr: int, dc: int', 'Position'),
    method('+', 'inBounds', '', 'bool'),
  ], 'record'),
  enm('mk', 'MoveKind', 800, 400, ['NORMAL', 'DOUBLE_PUSH', 'EN_PASSANT', 'CASTLE_KING', 'CASTLE_QUEEN', 'PROMOTION']),
  enm('cl', 'Color', 800, 640, ['WHITE', 'BLACK']),
  enm('gs', 'GameStatus', 1180, 400, ['ACTIVE', 'CHECK', 'CHECKMATE', 'STALEMATE']),
]

const edges = [
  edge('e1', 'gm', 'bd', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e2', 'bd', 'mv', 'dependency', 'right', 'left', { label: 'records' }),
  edge('e3', 'gm', 'pp', 'aggregation', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '2' }),
  edge('e4', 'bd', 'pc', 'aggregation', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..32' }),
  edge('e5', 'kg', 'pc', 'inheritance', 'top', 'bottom@10'),
  edge('e6', 'qn', 'pc', 'inheritance', 'top', 'bottom@30'),
  edge('e7', 'rk', 'pc', 'inheritance', 'top', 'bottom@55'),
  edge('e8', 'bs', 'pc', 'inheritance', 'top', 'bottom@75'),
  edge('e9', 'kn', 'pc', 'inheritance', 'top', 'bottom@90'),
  edge('e10', 'pw', 'pc', 'inheritance', 'top', 'bottom@95'),
  edge('e12', 'mv', 'mk', 'dependency', 'bottom', 'top'),
  edge('e13', 'mv', 'ps', 'dependency', 'right', 'left', { label: 'from / to' }),
]

const py = `from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import List, Optional


class Color(Enum):
    WHITE = 1
    BLACK = -1

    @property
    def opposite(self) -> "Color":
        return Color.BLACK if self is Color.WHITE else Color.WHITE

    @property
    def forward(self) -> int:  # White pawns advance toward higher rows
        return self.value


class PieceType(Enum):
    KING = "K"
    QUEEN = "Q"
    ROOK = "R"
    BISHOP = "B"
    KNIGHT = "N"
    PAWN = "P"


class MoveKind(Enum):
    NORMAL = 0
    DOUBLE_PUSH = 1
    EN_PASSANT = 2
    CASTLE_KING = 3
    CASTLE_QUEEN = 4
    PROMOTION = 5


class GameStatus(Enum):
    ACTIVE = 0
    CHECK = 1
    CHECKMATE = 2
    STALEMATE = 3


@dataclass(frozen=True)
class Position:
    row: int
    col: int

    def in_bounds(self) -> bool:
        return 0 <= self.row < 8 and 0 <= self.col < 8

    def offset(self, dr: int, dc: int) -> "Position":
        return Position(self.row + dr, self.col + dc)

    @staticmethod
    def parse(s: str) -> "Position":  # "e2" -> row 1, col 4
        return Position(int(s[1]) - 1, ord(s[0]) - ord("a"))

    def __str__(self) -> str:
        return chr(ord("a") + self.col) + str(self.row + 1)


@dataclass
class Move:
    frm: Position
    to: Position
    piece: "Piece"
    kind: MoveKind = MoveKind.NORMAL
    captured: Optional["Piece"] = None
    captured_pos: Optional[Position] = None
    promotion: Optional[PieceType] = None
    piece_had_moved: bool = False  # filled by Board.apply so undo can restore it


class Piece(ABC):
    """Each subclass owns its own movement rules (polymorphism)."""

    def __init__(self, color: Color, ptype: PieceType):
        self.color, self.type, self.has_moved = color, ptype, False

    @abstractmethod
    def get_valid_moves(self, board: "Board", pos: Position) -> List[Move]:
        """Pseudo-legal moves: obey piece geometry but ignore leaving own king in check."""

    def attacks(self, board: "Board", pos: Position) -> List[Position]:
        return [m.to for m in self.get_valid_moves(board, pos)]

    @property
    def symbol(self) -> str:
        s = self.type.value
        return s if self.color is Color.WHITE else s.lower()

    # --- shared helpers -------------------------------------------------
    def _slide(self, board: "Board", pos: Position, dirs) -> List[Move]:
        out: List[Move] = []
        for dr, dc in dirs:
            p = pos.offset(dr, dc)
            while p.in_bounds():
                target = board.get(p)
                if target is None:
                    out.append(Move(pos, p, self))
                else:
                    if target.color is not self.color:
                        out.append(Move(pos, p, self, captured=target, captured_pos=p))
                    break
                p = p.offset(dr, dc)
        return out

    def _step(self, board: "Board", pos: Position, deltas) -> List[Move]:
        out: List[Move] = []
        for dr, dc in deltas:
            p = pos.offset(dr, dc)
            if not p.in_bounds():
                continue
            target = board.get(p)
            if target is None:
                out.append(Move(pos, p, self))
            elif target.color is not self.color:
                out.append(Move(pos, p, self, captured=target, captured_pos=p))
        return out


_ROOK_DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]
_BISHOP_DIRS = [(1, 1), (1, -1), (-1, 1), (-1, -1)]
_KING_DELTAS = _ROOK_DIRS + _BISHOP_DIRS
_KNIGHT_DELTAS = [(2, 1), (2, -1), (-2, 1), (-2, -1), (1, 2), (1, -2), (-1, 2), (-1, -2)]


class Rook(Piece):
    def __init__(self, color: Color):
        super().__init__(color, PieceType.ROOK)

    def get_valid_moves(self, board, pos):
        return self._slide(board, pos, _ROOK_DIRS)


class Bishop(Piece):
    def __init__(self, color: Color):
        super().__init__(color, PieceType.BISHOP)

    def get_valid_moves(self, board, pos):
        return self._slide(board, pos, _BISHOP_DIRS)


class Queen(Piece):
    def __init__(self, color: Color):
        super().__init__(color, PieceType.QUEEN)

    def get_valid_moves(self, board, pos):
        return self._slide(board, pos, _ROOK_DIRS + _BISHOP_DIRS)


class Knight(Piece):
    def __init__(self, color: Color):
        super().__init__(color, PieceType.KNIGHT)

    def get_valid_moves(self, board, pos):
        return self._step(board, pos, _KNIGHT_DELTAS)


class King(Piece):
    def __init__(self, color: Color):
        super().__init__(color, PieceType.KING)

    def attacks(self, board, pos):  # no castling here -> avoids infinite recursion
        return [m.to for m in self._step(board, pos, _KING_DELTAS)]

    def get_valid_moves(self, board, pos):
        moves = self._step(board, pos, _KING_DELTAS)
        enemy = self.color.opposite
        if not self.has_moved and not board.is_attacked(pos, enemy):
            # (kind, rook column, squares that must be empty, squares king crosses, king target col)
            for kind, rook_col, empty, cross, target in (
                (MoveKind.CASTLE_KING, 7, (5, 6), (5, 6), 6),
                (MoveKind.CASTLE_QUEEN, 0, (1, 2, 3), (3, 2), 2),
            ):
                rook = board.get(Position(pos.row, rook_col))
                if (
                    isinstance(rook, Rook) and rook.color is self.color and not rook.has_moved
                    and all(board.get(Position(pos.row, c)) is None for c in empty)
                    and not any(board.is_attacked(Position(pos.row, c), enemy) for c in cross)
                ):
                    moves.append(Move(pos, Position(pos.row, target), self, kind))
        return moves


class Pawn(Piece):
    def __init__(self, color: Color):
        super().__init__(color, PieceType.PAWN)

    def attacks(self, board, pos):
        d = self.color.forward
        return [p for p in (pos.offset(d, -1), pos.offset(d, 1)) if p.in_bounds()]

    def get_valid_moves(self, board, pos):
        d = self.color.forward
        start = 1 if self.color is Color.WHITE else 6
        last = 7 if self.color is Color.WHITE else 0
        out: List[Move] = []
        one = pos.offset(d, 0)
        if one.in_bounds() and board.get(one) is None:
            out += self._maybe_promote(Move(pos, one, self), last)
            two = pos.offset(2 * d, 0)
            if pos.row == start and board.get(two) is None:
                out.append(Move(pos, two, self, MoveKind.DOUBLE_PUSH))
        for dc in (-1, 1):
            t = pos.offset(d, dc)
            if not t.in_bounds():
                continue
            target = board.get(t)
            if target is not None and target.color is not self.color:
                out += self._maybe_promote(Move(pos, t, self, captured=target, captured_pos=t), last)
            elif target is None:
                lm = board.last_move()
                if (lm and lm.kind is MoveKind.DOUBLE_PUSH and lm.piece.color is not self.color
                        and lm.to == Position(pos.row, pos.col + dc)):
                    out.append(Move(pos, t, self, MoveKind.EN_PASSANT, captured=lm.piece, captured_pos=lm.to))
        return out

    @staticmethod
    def _maybe_promote(m: Move, last_row: int) -> List[Move]:
        if m.to.row != last_row:
            return [m]
        return [
            Move(m.frm, m.to, m.piece, MoveKind.PROMOTION, m.captured, m.captured_pos, t)
            for t in (PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT)
        ]


def make_piece(t: PieceType, c: Color) -> Piece:
    return {
        PieceType.KING: King, PieceType.QUEEN: Queen, PieceType.ROOK: Rook,
        PieceType.BISHOP: Bishop, PieceType.KNIGHT: Knight, PieceType.PAWN: Pawn,
    }[t](c)


class Board:
    def __init__(self):
        self._grid: List[List[Optional[Piece]]] = [[None] * 8 for _ in range(8)]
        self.history: List[Move] = []

    @staticmethod
    def standard() -> "Board":
        b = Board()
        back = [PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
                PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK]
        for c, t in enumerate(back):
            b._grid[0][c] = make_piece(t, Color.WHITE)
            b._grid[7][c] = make_piece(t, Color.BLACK)
            b._grid[1][c] = Pawn(Color.WHITE)
            b._grid[6][c] = Pawn(Color.BLACK)
        return b

    def get(self, p: Position) -> Optional[Piece]:
        return self._grid[p.row][p.col]

    def _set(self, p: Position, piece: Optional[Piece]) -> None:
        self._grid[p.row][p.col] = piece

    def last_move(self) -> Optional[Move]:
        return self.history[-1] if self.history else None

    def squares_of(self, color: Color):
        for r in range(8):
            for c in range(8):
                p = self._grid[r][c]
                if p is not None and p.color is color:
                    yield Position(r, c), p

    def find_king(self, color: Color) -> Position:
        for pos, p in self.squares_of(color):
            if p.type is PieceType.KING:
                return pos
        raise RuntimeError("king missing")

    def is_attacked(self, pos: Position, by: Color) -> bool:
        return any(pos in p.attacks(self, sq) for sq, p in self.squares_of(by))

    def apply(self, m: Move) -> None:
        m.piece_had_moved = m.piece.has_moved
        self._set(m.frm, None)
        if m.captured_pos is not None:
            self._set(m.captured_pos, None)
        placed = make_piece(m.promotion, m.piece.color) if m.promotion else m.piece
        placed.has_moved = True
        self._set(m.to, placed)
        if m.kind in (MoveKind.CASTLE_KING, MoveKind.CASTLE_QUEEN):
            rf, rt = (7, 5) if m.kind is MoveKind.CASTLE_KING else (0, 3)
            rook = self.get(Position(m.frm.row, rf))
            self._set(Position(m.frm.row, rf), None)
            self._set(Position(m.frm.row, rt), rook)
            rook.has_moved = True
        self.history.append(m)

    def undo(self, m: Move) -> None:
        self.history.pop()
        self._set(m.to, None)
        self._set(m.frm, m.piece)
        m.piece.has_moved = m.piece_had_moved
        if m.captured is not None:
            self._set(m.captured_pos, m.captured)
        if m.kind in (MoveKind.CASTLE_KING, MoveKind.CASTLE_QUEEN):
            rf, rt = (7, 5) if m.kind is MoveKind.CASTLE_KING else (0, 3)
            rook = self.get(Position(m.frm.row, rt))
            self._set(Position(m.frm.row, rt), None)
            self._set(Position(m.frm.row, rf), rook)
            rook.has_moved = False

    def render(self) -> str:
        rows = []
        for r in range(7, -1, -1):
            rows.append(str(r + 1) + " " + " ".join(p.symbol if (p := self._grid[r][c]) else "." for c in range(8)))
        rows.append("  a b c d e f g h")
        return "\\n".join(rows)


@dataclass
class Player:
    name: str
    color: Color


class Game:
    def __init__(self, white: str = "White", black: str = "Black"):
        self.board = Board.standard()
        self.players = {Color.WHITE: Player(white, Color.WHITE), Color.BLACK: Player(black, Color.BLACK)}
        self.turn = Color.WHITE
        self.status = GameStatus.ACTIVE

    @property
    def history(self) -> List[Move]:
        return self.board.history

    def in_check(self, color: Color) -> bool:
        return self.board.is_attacked(self.board.find_king(color), color.opposite)

    def legal_moves(self, pos: Position) -> List[Move]:
        piece = self.board.get(pos)
        if piece is None:
            return []
        legal = []
        for m in piece.get_valid_moves(self.board, pos):
            self.board.apply(m)  # simulate
            safe = not self.in_check(piece.color)
            self.board.undo(m)
            if safe:
                legal.append(m)
        return legal

    def _has_any_move(self, color: Color) -> bool:
        return any(self.legal_moves(pos) for pos, _ in list(self.board.squares_of(color)))

    def make_move(self, frm: Position, to: Position, promotion: PieceType = PieceType.QUEEN) -> Move:
        if self.status in (GameStatus.CHECKMATE, GameStatus.STALEMATE):
            raise RuntimeError("game is over")
        piece = self.board.get(frm)
        if piece is None or piece.color is not self.turn:
            raise ValueError("no piece of the side to move on " + str(frm))
        for m in self.legal_moves(frm):
            if m.to == to and (m.promotion is None or m.promotion is promotion):
                self.board.apply(m)
                self.turn = self.turn.opposite
                self._update_status()
                return m
        raise ValueError(f"illegal move {frm}->{to}")

    def _update_status(self) -> None:
        check = self.in_check(self.turn)
        has_move = self._has_any_move(self.turn)
        if not has_move:
            self.status = GameStatus.CHECKMATE if check else GameStatus.STALEMATE
        else:
            self.status = GameStatus.CHECK if check else GameStatus.ACTIVE


def demo() -> None:
    g = Game()
    for a, b in [("f2", "f3"), ("e7", "e5"), ("g2", "g4"), ("d8", "h4")]:  # Fool's mate
        g.make_move(Position.parse(a), Position.parse(b))
    print(g.board.render())
    print(g.status)  # GameStatus.CHECKMATE


if __name__ == "__main__":
    demo()
`

const java = `import java.util.*;

enum Color {
  WHITE, BLACK;
  Color opposite() { return this == WHITE ? BLACK : WHITE; }
  int forward() { return this == WHITE ? 1 : -1; }
}
enum PieceType { KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN }
enum MoveKind { NORMAL, DOUBLE_PUSH, EN_PASSANT, CASTLE_KING, CASTLE_QUEEN, PROMOTION }
enum GameStatus { ACTIVE, CHECK, CHECKMATE, STALEMATE }

record Position(int row, int col) {
  boolean inBounds() { return row >= 0 && row < 8 && col >= 0 && col < 8; }
  Position offset(int dr, int dc) { return new Position(row + dr, col + dc); }
  static Position parse(String s) { return new Position(s.charAt(1) - '1', s.charAt(0) - 'a'); }
  public String toString() { return "" + (char) ('a' + col) + (row + 1); }
}

class Move {
  final Position from, to;
  final Piece piece;
  final MoveKind kind;
  Piece captured;
  Position capturedPos;
  PieceType promotion;
  boolean pieceHadMoved;

  Move(Position from, Position to, Piece piece, MoveKind kind) {
    this.from = from; this.to = to; this.piece = piece; this.kind = kind;
  }
  Move(Position from, Position to, Piece piece) { this(from, to, piece, MoveKind.NORMAL); }

  Move capturing(Piece p, Position at) { captured = p; capturedPos = at; return this; }
}

abstract class Piece {
  protected static final int[][] ROOK = {{1,0},{-1,0},{0,1},{0,-1}};
  protected static final int[][] BISHOP = {{1,1},{1,-1},{-1,1},{-1,-1}};
  protected static final int[][] KNIGHT = {{2,1},{2,-1},{-2,1},{-2,-1},{1,2},{1,-2},{-1,2},{-1,-2}};

  final Color color;
  final PieceType type;
  boolean hasMoved;

  protected Piece(Color color, PieceType type) { this.color = color; this.type = type; }

  /** Pseudo-legal moves: piece geometry only; Game filters out moves that expose the king. */
  abstract List<Move> getValidMoves(Board board, Position pos);

  List<Position> attacks(Board board, Position pos) {
    List<Position> out = new ArrayList<>();
    for (Move m : getValidMoves(board, pos)) out.add(m.to);
    return out;
  }

  char symbol() {
    char c = switch (type) {
      case KING -> 'K'; case QUEEN -> 'Q'; case ROOK -> 'R';
      case BISHOP -> 'B'; case KNIGHT -> 'N'; case PAWN -> 'P';
    };
    return color == Color.WHITE ? c : Character.toLowerCase(c);
  }

  protected List<Move> slide(Board board, Position pos, int[][]... groups) {
    List<Move> out = new ArrayList<>();
    for (int[][] dirs : groups) {
      for (int[] d : dirs) {
        Position p = pos.offset(d[0], d[1]);
        while (p.inBounds()) {
          Piece t = board.get(p);
          if (t == null) out.add(new Move(pos, p, this));
          else {
            if (t.color != color) out.add(new Move(pos, p, this).capturing(t, p));
            break;
          }
          p = p.offset(d[0], d[1]);
        }
      }
    }
    return out;
  }

  protected List<Move> step(Board board, Position pos, int[][]... groups) {
    List<Move> out = new ArrayList<>();
    for (int[][] deltas : groups) {
      for (int[] d : deltas) {
        Position p = pos.offset(d[0], d[1]);
        if (!p.inBounds()) continue;
        Piece t = board.get(p);
        if (t == null) out.add(new Move(pos, p, this));
        else if (t.color != color) out.add(new Move(pos, p, this).capturing(t, p));
      }
    }
    return out;
  }

  static Piece create(PieceType t, Color c) {
    return switch (t) {
      case KING -> new King(c); case QUEEN -> new Queen(c); case ROOK -> new Rook(c);
      case BISHOP -> new Bishop(c); case KNIGHT -> new Knight(c); case PAWN -> new Pawn(c);
    };
  }
}

class Rook extends Piece {
  Rook(Color c) { super(c, PieceType.ROOK); }
  List<Move> getValidMoves(Board b, Position p) { return slide(b, p, ROOK); }
}
class Bishop extends Piece {
  Bishop(Color c) { super(c, PieceType.BISHOP); }
  List<Move> getValidMoves(Board b, Position p) { return slide(b, p, BISHOP); }
}
class Queen extends Piece {
  Queen(Color c) { super(c, PieceType.QUEEN); }
  List<Move> getValidMoves(Board b, Position p) { return slide(b, p, ROOK, BISHOP); }
}
class Knight extends Piece {
  Knight(Color c) { super(c, PieceType.KNIGHT); }
  List<Move> getValidMoves(Board b, Position p) { return step(b, p, KNIGHT); }
}

class King extends Piece {
  King(Color c) { super(c, PieceType.KING); }

  @Override List<Position> attacks(Board b, Position p) {  // no castling: avoids recursion
    List<Position> out = new ArrayList<>();
    for (Move m : step(b, p, ROOK, BISHOP)) out.add(m.to);
    return out;
  }

  List<Move> getValidMoves(Board b, Position pos) {
    List<Move> moves = step(b, pos, ROOK, BISHOP);
    Color enemy = color.opposite();
    if (!hasMoved && !b.isAttacked(pos, enemy)) {
      tryCastle(b, pos, enemy, moves, MoveKind.CASTLE_KING, 7, new int[]{5, 6}, new int[]{5, 6}, 6);
      tryCastle(b, pos, enemy, moves, MoveKind.CASTLE_QUEEN, 0, new int[]{1, 2, 3}, new int[]{3, 2}, 2);
    }
    return moves;
  }

  private void tryCastle(Board b, Position pos, Color enemy, List<Move> moves, MoveKind kind,
                         int rookCol, int[] empty, int[] cross, int targetCol) {
    Piece rook = b.get(new Position(pos.row(), rookCol));
    if (!(rook instanceof Rook) || rook.color != color || rook.hasMoved) return;
    for (int c : empty) if (b.get(new Position(pos.row(), c)) != null) return;
    for (int c : cross) if (b.isAttacked(new Position(pos.row(), c), enemy)) return;
    moves.add(new Move(pos, new Position(pos.row(), targetCol), this, kind));
  }
}

class Pawn extends Piece {
  Pawn(Color c) { super(c, PieceType.PAWN); }

  @Override List<Position> attacks(Board b, Position p) {
    List<Position> out = new ArrayList<>();
    for (int dc : new int[]{-1, 1}) {
      Position t = p.offset(color.forward(), dc);
      if (t.inBounds()) out.add(t);
    }
    return out;
  }

  List<Move> getValidMoves(Board b, Position pos) {
    int d = color.forward();
    int start = color == Color.WHITE ? 1 : 6, last = color == Color.WHITE ? 7 : 0;
    List<Move> out = new ArrayList<>();
    Position one = pos.offset(d, 0);
    if (one.inBounds() && b.get(one) == null) {
      promoteOrAdd(out, new Move(pos, one, this), last);
      Position two = pos.offset(2 * d, 0);
      if (pos.row() == start && b.get(two) == null) out.add(new Move(pos, two, this, MoveKind.DOUBLE_PUSH));
    }
    for (int dc : new int[]{-1, 1}) {
      Position t = pos.offset(d, dc);
      if (!t.inBounds()) continue;
      Piece target = b.get(t);
      if (target != null && target.color != color) {
        promoteOrAdd(out, new Move(pos, t, this).capturing(target, t), last);
      } else if (target == null) {
        Move lm = b.lastMove();
        if (lm != null && lm.kind == MoveKind.DOUBLE_PUSH && lm.piece.color != color
            && lm.to.equals(new Position(pos.row(), pos.col() + dc))) {
          out.add(new Move(pos, t, this, MoveKind.EN_PASSANT).capturing(lm.piece, lm.to));
        }
      }
    }
    return out;
  }

  private void promoteOrAdd(List<Move> out, Move m, int lastRow) {
    if (m.to.row() != lastRow) { out.add(m); return; }
    for (PieceType t : new PieceType[]{PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT}) {
      Move pm = new Move(m.from, m.to, m.piece, MoveKind.PROMOTION);
      pm.captured = m.captured; pm.capturedPos = m.capturedPos; pm.promotion = t;
      out.add(pm);
    }
  }
}

class Board {
  private final Piece[][] grid = new Piece[8][8];
  private final Deque<Move> history = new ArrayDeque<>();

  static Board standard() {
    Board b = new Board();
    PieceType[] back = {PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
        PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK};
    for (int c = 0; c < 8; c++) {
      b.grid[0][c] = Piece.create(back[c], Color.WHITE);
      b.grid[7][c] = Piece.create(back[c], Color.BLACK);
      b.grid[1][c] = new Pawn(Color.WHITE);
      b.grid[6][c] = new Pawn(Color.BLACK);
    }
    return b;
  }

  Piece get(Position p) { return grid[p.row()][p.col()]; }
  private void set(Position p, Piece piece) { grid[p.row()][p.col()] = piece; }
  Move lastMove() { return history.peek(); }
  List<Move> history() { List<Move> l = new ArrayList<>(history); Collections.reverse(l); return l; }

  Map<Position, Piece> piecesOf(Color color) {
    Map<Position, Piece> out = new LinkedHashMap<>();
    for (int r = 0; r < 8; r++)
      for (int c = 0; c < 8; c++)
        if (grid[r][c] != null && grid[r][c].color == color) out.put(new Position(r, c), grid[r][c]);
    return out;
  }

  Position findKing(Color color) {
    for (var e : piecesOf(color).entrySet()) if (e.getValue().type == PieceType.KING) return e.getKey();
    throw new IllegalStateException("king missing");
  }

  boolean isAttacked(Position pos, Color by) {
    for (var e : piecesOf(by).entrySet())
      if (e.getValue().attacks(this, e.getKey()).contains(pos)) return true;
    return false;
  }

  void apply(Move m) {
    m.pieceHadMoved = m.piece.hasMoved;
    set(m.from, null);
    if (m.capturedPos != null) set(m.capturedPos, null);
    Piece placed = m.promotion != null ? Piece.create(m.promotion, m.piece.color) : m.piece;
    placed.hasMoved = true;
    set(m.to, placed);
    if (m.kind == MoveKind.CASTLE_KING || m.kind == MoveKind.CASTLE_QUEEN) {
      int rf = m.kind == MoveKind.CASTLE_KING ? 7 : 0, rt = m.kind == MoveKind.CASTLE_KING ? 5 : 3;
      Piece rook = get(new Position(m.from.row(), rf));
      set(new Position(m.from.row(), rf), null);
      set(new Position(m.from.row(), rt), rook);
      rook.hasMoved = true;
    }
    history.push(m);
  }

  void undo(Move m) {
    history.pop();
    set(m.to, null);
    set(m.from, m.piece);
    m.piece.hasMoved = m.pieceHadMoved;
    if (m.captured != null) set(m.capturedPos, m.captured);
    if (m.kind == MoveKind.CASTLE_KING || m.kind == MoveKind.CASTLE_QUEEN) {
      int rf = m.kind == MoveKind.CASTLE_KING ? 7 : 0, rt = m.kind == MoveKind.CASTLE_KING ? 5 : 3;
      Piece rook = get(new Position(m.from.row(), rt));
      set(new Position(m.from.row(), rt), null);
      set(new Position(m.from.row(), rf), rook);
      rook.hasMoved = false;
    }
  }

  String render() {
    StringBuilder sb = new StringBuilder();
    for (int r = 7; r >= 0; r--) {
      sb.append(r + 1).append(' ');
      for (int c = 0; c < 8; c++) sb.append(grid[r][c] == null ? '.' : grid[r][c].symbol()).append(' ');
      sb.append('\\n');
    }
    return sb.append("  a b c d e f g h\\n").toString();
  }
}

record Player(String name, Color color) {}

class Game {
  private final Board board = Board.standard();
  private final Map<Color, Player> players = new EnumMap<>(Color.class);
  private Color turn = Color.WHITE;
  private GameStatus status = GameStatus.ACTIVE;

  Game(String white, String black) {
    players.put(Color.WHITE, new Player(white, Color.WHITE));
    players.put(Color.BLACK, new Player(black, Color.BLACK));
  }

  Board board() { return board; }
  GameStatus status() { return status; }
  Color turn() { return turn; }
  List<Move> history() { return board.history(); }

  boolean inCheck(Color color) { return board.isAttacked(board.findKing(color), color.opposite()); }

  List<Move> legalMoves(Position pos) {
    Piece piece = board.get(pos);
    if (piece == null) return List.of();
    List<Move> legal = new ArrayList<>();
    for (Move m : piece.getValidMoves(board, pos)) {
      board.apply(m);                          // simulate
      boolean safe = !inCheck(piece.color);
      board.undo(m);
      if (safe) legal.add(m);
    }
    return legal;
  }

  private boolean hasAnyMove(Color color) {
    for (Position p : new ArrayList<>(board.piecesOf(color).keySet()))
      if (!legalMoves(p).isEmpty()) return true;
    return false;
  }

  Move makeMove(Position from, Position to, PieceType promotion) {
    if (status == GameStatus.CHECKMATE || status == GameStatus.STALEMATE)
      throw new IllegalStateException("game is over");
    Piece piece = board.get(from);
    if (piece == null || piece.color != turn) throw new IllegalArgumentException("no piece of the side to move on " + from);
    for (Move m : legalMoves(from)) {
      if (m.to.equals(to) && (m.promotion == null || m.promotion == promotion)) {
        board.apply(m);
        turn = turn.opposite();
        updateStatus();
        return m;
      }
    }
    throw new IllegalArgumentException("illegal move " + from + "->" + to);
  }

  Move makeMove(Position from, Position to) { return makeMove(from, to, PieceType.QUEEN); }

  private void updateStatus() {
    boolean check = inCheck(turn);
    if (!hasAnyMove(turn)) status = check ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    else status = check ? GameStatus.CHECK : GameStatus.ACTIVE;
  }
}

public class Main {
  public static void main(String[] args) {
    Game g = new Game("Alice", "Bob");
    String[][] foolsMate = {{"f2", "f3"}, {"e7", "e5"}, {"g2", "g4"}, {"d8", "h4"}};
    for (String[] mv : foolsMate) g.makeMove(Position.parse(mv[0]), Position.parse(mv[1]));
    System.out.print(g.board().render());
    System.out.println(g.status());  // CHECKMATE
  }
}
`

const ts = `export type Color = 'WHITE' | 'BLACK'
export type PieceType = 'KING' | 'QUEEN' | 'ROOK' | 'BISHOP' | 'KNIGHT' | 'PAWN'
export type MoveKind = 'NORMAL' | 'DOUBLE_PUSH' | 'EN_PASSANT' | 'CASTLE_KING' | 'CASTLE_QUEEN' | 'PROMOTION'
export type GameStatus = 'ACTIVE' | 'CHECK' | 'CHECKMATE' | 'STALEMATE'

export interface Position { readonly row: number; readonly col: number }
const pos = (row: number, col: number): Position => ({ row, col })
const same = (a: Position, b: Position) => a.row === b.row && a.col === b.col
const inBounds = (p: Position) => p.row >= 0 && p.row < 8 && p.col >= 0 && p.col < 8
const offset = (p: Position, dr: number, dc: number) => pos(p.row + dr, p.col + dc)
const opposite = (c: Color): Color => (c === 'WHITE' ? 'BLACK' : 'WHITE')
const forward = (c: Color) => (c === 'WHITE' ? 1 : -1)
export const parse = (s: string): Position => pos(Number(s[1]) - 1, s.charCodeAt(0) - 97)
export const show = (p: Position) => String.fromCharCode(97 + p.col) + (p.row + 1)

export interface Move {
  from: Position
  to: Position
  piece: Piece
  kind: MoveKind
  captured?: Piece
  capturedPos?: Position
  promotion?: PieceType
  pieceHadMoved?: boolean
}

type Dir = readonly [number, number]
const ROOK: Dir[] = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const BISHOP: Dir[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
const KNIGHT: Dir[] = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]

export abstract class Piece {
  hasMoved = false
  constructor(public readonly color: Color, public readonly type: PieceType) {}

  /** Pseudo-legal moves: piece geometry only; Game filters out moves that expose the king. */
  abstract getValidMoves(board: Board, from: Position): Move[]

  attacks(board: Board, from: Position): Position[] {
    return this.getValidMoves(board, from).map(m => m.to)
  }

  get symbol(): string {
    const s = { KING: 'K', QUEEN: 'Q', ROOK: 'R', BISHOP: 'B', KNIGHT: 'N', PAWN: 'P' }[this.type]
    return this.color === 'WHITE' ? s : s.toLowerCase()
  }

  protected slide(board: Board, from: Position, dirs: Dir[]): Move[] {
    const out: Move[] = []
    for (const [dr, dc] of dirs) {
      let p = offset(from, dr, dc)
      while (inBounds(p)) {
        const t = board.get(p)
        if (!t) out.push({ from, to: p, piece: this, kind: 'NORMAL' })
        else {
          if (t.color !== this.color) out.push({ from, to: p, piece: this, kind: 'NORMAL', captured: t, capturedPos: p })
          break
        }
        p = offset(p, dr, dc)
      }
    }
    return out
  }

  protected step(board: Board, from: Position, deltas: Dir[]): Move[] {
    const out: Move[] = []
    for (const [dr, dc] of deltas) {
      const p = offset(from, dr, dc)
      if (!inBounds(p)) continue
      const t = board.get(p)
      if (!t) out.push({ from, to: p, piece: this, kind: 'NORMAL' })
      else if (t.color !== this.color) out.push({ from, to: p, piece: this, kind: 'NORMAL', captured: t, capturedPos: p })
    }
    return out
  }
}

export class Rook extends Piece {
  constructor(c: Color) { super(c, 'ROOK') }
  getValidMoves(b: Board, p: Position) { return this.slide(b, p, ROOK) }
}
export class Bishop extends Piece {
  constructor(c: Color) { super(c, 'BISHOP') }
  getValidMoves(b: Board, p: Position) { return this.slide(b, p, BISHOP) }
}
export class Queen extends Piece {
  constructor(c: Color) { super(c, 'QUEEN') }
  getValidMoves(b: Board, p: Position) { return this.slide(b, p, [...ROOK, ...BISHOP]) }
}
export class Knight extends Piece {
  constructor(c: Color) { super(c, 'KNIGHT') }
  getValidMoves(b: Board, p: Position) { return this.step(b, p, KNIGHT) }
}

export class King extends Piece {
  constructor(c: Color) { super(c, 'KING') }

  override attacks(b: Board, p: Position): Position[] {   // no castling: avoids recursion
    return this.step(b, p, [...ROOK, ...BISHOP]).map(m => m.to)
  }

  getValidMoves(b: Board, from: Position): Move[] {
    const moves = this.step(b, from, [...ROOK, ...BISHOP])
    const enemy = opposite(this.color)
    if (!this.hasMoved && !b.isAttacked(from, enemy)) {
      const options: [MoveKind, number, number[], number[], number][] = [
        ['CASTLE_KING', 7, [5, 6], [5, 6], 6],
        ['CASTLE_QUEEN', 0, [1, 2, 3], [3, 2], 2],
      ]
      for (const [kind, rookCol, empty, cross, target] of options) {
        const rook = b.get(pos(from.row, rookCol))
        if (
          rook instanceof Rook && rook.color === this.color && !rook.hasMoved &&
          empty.every(c => !b.get(pos(from.row, c))) &&
          !cross.some(c => b.isAttacked(pos(from.row, c), enemy))
        ) moves.push({ from, to: pos(from.row, target), piece: this, kind })
      }
    }
    return moves
  }
}

export class Pawn extends Piece {
  constructor(c: Color) { super(c, 'PAWN') }

  override attacks(_b: Board, p: Position): Position[] {
    return [-1, 1].map(dc => offset(p, forward(this.color), dc)).filter(inBounds)
  }

  getValidMoves(b: Board, from: Position): Move[] {
    const d = forward(this.color)
    const start = this.color === 'WHITE' ? 1 : 6
    const last = this.color === 'WHITE' ? 7 : 0
    const out: Move[] = []
    const one = offset(from, d, 0)
    if (inBounds(one) && !b.get(one)) {
      out.push(...this.promoteOrKeep({ from, to: one, piece: this, kind: 'NORMAL' }, last))
      const two = offset(from, 2 * d, 0)
      if (from.row === start && !b.get(two)) out.push({ from, to: two, piece: this, kind: 'DOUBLE_PUSH' })
    }
    for (const dc of [-1, 1]) {
      const t = offset(from, d, dc)
      if (!inBounds(t)) continue
      const target = b.get(t)
      if (target && target.color !== this.color) {
        out.push(...this.promoteOrKeep({ from, to: t, piece: this, kind: 'NORMAL', captured: target, capturedPos: t }, last))
      } else if (!target) {
        const lm = b.lastMove()
        if (lm && lm.kind === 'DOUBLE_PUSH' && lm.piece.color !== this.color && same(lm.to, pos(from.row, from.col + dc))) {
          out.push({ from, to: t, piece: this, kind: 'EN_PASSANT', captured: lm.piece, capturedPos: lm.to })
        }
      }
    }
    return out
  }

  private promoteOrKeep(m: Move, lastRow: number): Move[] {
    if (m.to.row !== lastRow) return [m]
    return (['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'] as PieceType[]).map(t => ({ ...m, kind: 'PROMOTION' as MoveKind, promotion: t }))
  }
}

export function makePiece(t: PieceType, c: Color): Piece {
  switch (t) {
    case 'KING': return new King(c)
    case 'QUEEN': return new Queen(c)
    case 'ROOK': return new Rook(c)
    case 'BISHOP': return new Bishop(c)
    case 'KNIGHT': return new Knight(c)
    default: return new Pawn(c)
  }
}

export class Board {
  private grid: (Piece | null)[][] = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null))
  readonly history: Move[] = []

  static standard(): Board {
    const b = new Board()
    const back: PieceType[] = ['ROOK', 'KNIGHT', 'BISHOP', 'QUEEN', 'KING', 'BISHOP', 'KNIGHT', 'ROOK']
    back.forEach((t, c) => {
      b.grid[0][c] = makePiece(t, 'WHITE')
      b.grid[7][c] = makePiece(t, 'BLACK')
      b.grid[1][c] = new Pawn('WHITE')
      b.grid[6][c] = new Pawn('BLACK')
    })
    return b
  }

  get(p: Position): Piece | null { return this.grid[p.row][p.col] }
  private set(p: Position, piece: Piece | null) { this.grid[p.row][p.col] = piece }
  lastMove(): Move | undefined { return this.history[this.history.length - 1] }

  piecesOf(color: Color): [Position, Piece][] {
    const out: [Position, Piece][] = []
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = this.grid[r][c]
        if (p && p.color === color) out.push([pos(r, c), p])
      }
    return out
  }

  findKing(color: Color): Position {
    const k = this.piecesOf(color).find(([, p]) => p.type === 'KING')
    if (!k) throw new Error('king missing')
    return k[0]
  }

  isAttacked(target: Position, by: Color): boolean {
    return this.piecesOf(by).some(([sq, p]) => p.attacks(this, sq).some(a => same(a, target)))
  }

  apply(m: Move): void {
    m.pieceHadMoved = m.piece.hasMoved
    this.set(m.from, null)
    if (m.capturedPos) this.set(m.capturedPos, null)
    const placed = m.promotion ? makePiece(m.promotion, m.piece.color) : m.piece
    placed.hasMoved = true
    this.set(m.to, placed)
    if (m.kind === 'CASTLE_KING' || m.kind === 'CASTLE_QUEEN') {
      const [rf, rt] = m.kind === 'CASTLE_KING' ? [7, 5] : [0, 3]
      const rook = this.get(pos(m.from.row, rf))!
      this.set(pos(m.from.row, rf), null)
      this.set(pos(m.from.row, rt), rook)
      rook.hasMoved = true
    }
    this.history.push(m)
  }

  undo(m: Move): void {
    this.history.pop()
    this.set(m.to, null)
    this.set(m.from, m.piece)
    m.piece.hasMoved = m.pieceHadMoved ?? false
    if (m.captured && m.capturedPos) this.set(m.capturedPos, m.captured)
    if (m.kind === 'CASTLE_KING' || m.kind === 'CASTLE_QUEEN') {
      const [rf, rt] = m.kind === 'CASTLE_KING' ? [7, 5] : [0, 3]
      const rook = this.get(pos(m.from.row, rt))!
      this.set(pos(m.from.row, rt), null)
      this.set(pos(m.from.row, rf), rook)
      rook.hasMoved = false
    }
  }

  render(): string {
    const rows: string[] = []
    for (let r = 7; r >= 0; r--) rows.push((r + 1) + ' ' + this.grid[r].map(p => (p ? p.symbol : '.')).join(' '))
    rows.push('  a b c d e f g h')
    return rows.join('\\n')
  }
}

export interface Player { name: string; color: Color }

export class Game {
  readonly board = Board.standard()
  readonly players: Record<Color, Player>
  turn: Color = 'WHITE'
  status: GameStatus = 'ACTIVE'

  constructor(white = 'White', black = 'Black') {
    this.players = { WHITE: { name: white, color: 'WHITE' }, BLACK: { name: black, color: 'BLACK' } }
  }

  get history(): Move[] { return this.board.history }

  inCheck(color: Color): boolean {
    return this.board.isAttacked(this.board.findKing(color), opposite(color))
  }

  legalMoves(from: Position): Move[] {
    const piece = this.board.get(from)
    if (!piece) return []
    return piece.getValidMoves(this.board, from).filter(m => {
      this.board.apply(m)                         // simulate
      const safe = !this.inCheck(piece.color)
      this.board.undo(m)
      return safe
    })
  }

  private hasAnyMove(color: Color): boolean {
    return this.board.piecesOf(color).some(([p]) => this.legalMoves(p).length > 0)
  }

  makeMove(from: Position, to: Position, promotion: PieceType = 'QUEEN'): Move {
    if (this.status === 'CHECKMATE' || this.status === 'STALEMATE') throw new Error('game is over')
    const piece = this.board.get(from)
    if (!piece || piece.color !== this.turn) throw new Error('no piece of the side to move on ' + show(from))
    const move = this.legalMoves(from).find(m => same(m.to, to) && (!m.promotion || m.promotion === promotion))
    if (!move) throw new Error('illegal move ' + show(from) + '->' + show(to))
    this.board.apply(move)
    this.turn = opposite(this.turn)
    this.updateStatus()
    return move
  }

  private updateStatus(): void {
    const check = this.inCheck(this.turn)
    if (!this.hasAnyMove(this.turn)) this.status = check ? 'CHECKMATE' : 'STALEMATE'
    else this.status = check ? 'CHECK' : 'ACTIVE'
  }
}

// Fool's mate demo
// const g = new Game()
// for (const [a, b] of [['f2','f3'],['e7','e5'],['g2','g4'],['d8','h4']]) g.makeMove(parse(a), parse(b))
// console.log(g.status) // CHECKMATE
`

const cpp = `#include <algorithm>
#include <array>
#include <iostream>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

enum class Color { White, Black };
enum class PieceType { King, Queen, Rook, Bishop, Knight, Pawn };
enum class MoveKind { Normal, DoublePush, EnPassant, CastleKing, CastleQueen, Promotion };
enum class GameStatus { Active, Check, Checkmate, Stalemate };

inline Color opposite(Color c) { return c == Color::White ? Color::Black : Color::White; }
inline int forwardDir(Color c) { return c == Color::White ? 1 : -1; }

struct Position {
  int row = 0, col = 0;
  bool inBounds() const { return row >= 0 && row < 8 && col >= 0 && col < 8; }
  Position offset(int dr, int dc) const { return {row + dr, col + dc}; }
  bool operator==(const Position& o) const { return row == o.row && col == o.col; }
  std::string str() const { return std::string(1, char('a' + col)) + std::to_string(row + 1); }
  static Position parse(const std::string& s) { return {s[1] - '1', s[0] - 'a'}; }
};

class Piece;
using PiecePtr = std::shared_ptr<Piece>;
inline PiecePtr makePiece(PieceType t, Color c);

struct Move {
  Position from, to;
  PiecePtr piece;
  MoveKind kind = MoveKind::Normal;
  PiecePtr captured;
  Position capturedPos{-1, -1};
  std::optional<PieceType> promotion;
  bool pieceHadMoved = false;
};

class Board;
using Dir = std::pair<int, int>;

class Piece : public std::enable_shared_from_this<Piece> {
public:
  Piece(Color c, PieceType t) : color(c), type(t) {}
  virtual ~Piece() = default;
  // Pseudo-legal moves: geometry only. Game filters moves that leave the king in check.
  virtual std::vector<Move> getValidMoves(const Board& b, Position p) = 0;
  virtual std::vector<Position> attacks(const Board& b, Position p) {
    std::vector<Position> out;
    for (auto& m : getValidMoves(b, p)) out.push_back(m.to);
    return out;
  }
  char symbol() const {
    static const char s[] = {'K', 'Q', 'R', 'B', 'N', 'P'};
    char c = s[static_cast<int>(type)];
    return color == Color::White ? c : char(c + 32);
  }
  Color color;
  PieceType type;
  bool hasMoved = false;
protected:
  std::vector<Move> slide(const Board& b, Position from, const std::vector<Dir>& dirs);
  std::vector<Move> step(const Board& b, Position from, const std::vector<Dir>& deltas);
};

class Board {
  std::array<std::array<PiecePtr, 8>, 8> grid_{};
  std::vector<Move> history_;
  void set(Position p, PiecePtr pc) { grid_[p.row][p.col] = std::move(pc); }
public:
  static Board standard();
  PiecePtr get(Position p) const { return grid_[p.row][p.col]; }
  const Move* lastMove() const { return history_.empty() ? nullptr : &history_.back(); }
  const std::vector<Move>& history() const { return history_; }

  std::vector<std::pair<Position, PiecePtr>> piecesOf(Color color) const {
    std::vector<std::pair<Position, PiecePtr>> out;
    for (int r = 0; r < 8; ++r)
      for (int c = 0; c < 8; ++c)
        if (grid_[r][c] && grid_[r][c]->color == color) out.push_back({{r, c}, grid_[r][c]});
    return out;
  }
  Position findKing(Color color) const {
    for (auto& [pos, pc] : piecesOf(color)) if (pc->type == PieceType::King) return pos;
    throw std::runtime_error("king missing");
  }
  bool isAttacked(Position target, Color by) const {
    for (auto& [sq, pc] : piecesOf(by))
      for (auto& a : pc->attacks(*this, sq)) if (a == target) return true;
    return false;
  }
  void apply(Move& m) {
    m.pieceHadMoved = m.piece->hasMoved;
    set(m.from, nullptr);
    if (m.captured) set(m.capturedPos, nullptr);
    PiecePtr placed = m.promotion ? makePiece(*m.promotion, m.piece->color) : m.piece;
    placed->hasMoved = true;
    set(m.to, placed);
    if (m.kind == MoveKind::CastleKing || m.kind == MoveKind::CastleQueen) {
      int rf = m.kind == MoveKind::CastleKing ? 7 : 0, rt = m.kind == MoveKind::CastleKing ? 5 : 3;
      PiecePtr rook = get({m.from.row, rf});
      set({m.from.row, rf}, nullptr);
      set({m.from.row, rt}, rook);
      rook->hasMoved = true;
    }
    history_.push_back(m);
  }
  void undo(Move& m) {
    history_.pop_back();
    set(m.to, nullptr);
    set(m.from, m.piece);
    m.piece->hasMoved = m.pieceHadMoved;
    if (m.captured) set(m.capturedPos, m.captured);
    if (m.kind == MoveKind::CastleKing || m.kind == MoveKind::CastleQueen) {
      int rf = m.kind == MoveKind::CastleKing ? 7 : 0, rt = m.kind == MoveKind::CastleKing ? 5 : 3;
      PiecePtr rook = get({m.from.row, rt});
      set({m.from.row, rt}, nullptr);
      set({m.from.row, rf}, rook);
      rook->hasMoved = false;
    }
  }
  std::string render() const {
    std::string s;
    for (int r = 7; r >= 0; --r) {
      s += std::to_string(r + 1) + " ";
      for (int c = 0; c < 8; ++c) { s += grid_[r][c] ? grid_[r][c]->symbol() : '.'; s += ' '; }
      s += '\\n';
    }
    return s + "  a b c d e f g h\\n";
  }
  void put(Position p, PiecePtr pc) { set(p, std::move(pc)); }
};

inline std::vector<Move> Piece::slide(const Board& b, Position from, const std::vector<Dir>& dirs) {
  std::vector<Move> out;
  for (auto [dr, dc] : dirs) {
    Position p = from.offset(dr, dc);
    while (p.inBounds()) {
      PiecePtr t = b.get(p);
      if (!t) out.push_back({from, p, shared_from_this()});
      else {
        if (t->color != color) { Move m{from, p, shared_from_this()}; m.captured = t; m.capturedPos = p; out.push_back(m); }
        break;
      }
      p = p.offset(dr, dc);
    }
  }
  return out;
}

inline std::vector<Move> Piece::step(const Board& b, Position from, const std::vector<Dir>& deltas) {
  std::vector<Move> out;
  for (auto [dr, dc] : deltas) {
    Position p = from.offset(dr, dc);
    if (!p.inBounds()) continue;
    PiecePtr t = b.get(p);
    if (!t) out.push_back({from, p, shared_from_this()});
    else if (t->color != color) { Move m{from, p, shared_from_this()}; m.captured = t; m.capturedPos = p; out.push_back(m); }
  }
  return out;
}

static const std::vector<Dir> ROOK_D{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
static const std::vector<Dir> BISHOP_D{{1, 1}, {1, -1}, {-1, 1}, {-1, -1}};
static const std::vector<Dir> QUEEN_D = [] { auto v = ROOK_D; v.insert(v.end(), BISHOP_D.begin(), BISHOP_D.end()); return v; }();
static const std::vector<Dir> KNIGHT_D{{2, 1}, {2, -1}, {-2, 1}, {-2, -1}, {1, 2}, {1, -2}, {-1, 2}, {-1, -2}};

struct Rook : Piece {
  explicit Rook(Color c) : Piece(c, PieceType::Rook) {}
  std::vector<Move> getValidMoves(const Board& b, Position p) override { return slide(b, p, ROOK_D); }
};
struct Bishop : Piece {
  explicit Bishop(Color c) : Piece(c, PieceType::Bishop) {}
  std::vector<Move> getValidMoves(const Board& b, Position p) override { return slide(b, p, BISHOP_D); }
};
struct Queen : Piece {
  explicit Queen(Color c) : Piece(c, PieceType::Queen) {}
  std::vector<Move> getValidMoves(const Board& b, Position p) override { return slide(b, p, QUEEN_D); }
};
struct Knight : Piece {
  explicit Knight(Color c) : Piece(c, PieceType::Knight) {}
  std::vector<Move> getValidMoves(const Board& b, Position p) override { return step(b, p, KNIGHT_D); }
};

struct King : Piece {
  explicit King(Color c) : Piece(c, PieceType::King) {}
  std::vector<Position> attacks(const Board& b, Position p) override {  // no castling: avoids recursion
    std::vector<Position> out;
    for (auto& m : step(b, p, QUEEN_D)) out.push_back(m.to);
    return out;
  }
  std::vector<Move> getValidMoves(const Board& b, Position pos) override {
    auto moves = step(b, pos, QUEEN_D);
    Color enemy = opposite(color);
    if (!hasMoved && !b.isAttacked(pos, enemy)) {
      tryCastle(b, pos, enemy, moves, MoveKind::CastleKing, 7, {5, 6}, {5, 6}, 6);
      tryCastle(b, pos, enemy, moves, MoveKind::CastleQueen, 0, {1, 2, 3}, {3, 2}, 2);
    }
    return moves;
  }
private:
  void tryCastle(const Board& b, Position pos, Color enemy, std::vector<Move>& moves, MoveKind kind,
                 int rookCol, std::vector<int> empty, std::vector<int> cross, int targetCol) {
    PiecePtr rook = b.get({pos.row, rookCol});
    if (!rook || rook->type != PieceType::Rook || rook->color != color || rook->hasMoved) return;
    for (int c : empty) if (b.get({pos.row, c})) return;
    for (int c : cross) if (b.isAttacked({pos.row, c}, enemy)) return;
    Move m{pos, {pos.row, targetCol}, shared_from_this()};
    m.kind = kind;
    moves.push_back(m);
  }
};

struct Pawn : Piece {
  explicit Pawn(Color c) : Piece(c, PieceType::Pawn) {}
  std::vector<Position> attacks(const Board&, Position p) override {
    std::vector<Position> out;
    for (int dc : {-1, 1}) { Position t = p.offset(forwardDir(color), dc); if (t.inBounds()) out.push_back(t); }
    return out;
  }
  std::vector<Move> getValidMoves(const Board& b, Position pos) override {
    int d = forwardDir(color);
    int start = color == Color::White ? 1 : 6, last = color == Color::White ? 7 : 0;
    std::vector<Move> out;
    Position one = pos.offset(d, 0);
    if (one.inBounds() && !b.get(one)) {
      promoteOrAdd(out, Move{pos, one, shared_from_this()}, last);
      Position two = pos.offset(2 * d, 0);
      if (pos.row == start && !b.get(two)) { Move m{pos, two, shared_from_this()}; m.kind = MoveKind::DoublePush; out.push_back(m); }
    }
    for (int dc : {-1, 1}) {
      Position t = pos.offset(d, dc);
      if (!t.inBounds()) continue;
      PiecePtr target = b.get(t);
      if (target && target->color != color) {
        Move m{pos, t, shared_from_this()}; m.captured = target; m.capturedPos = t;
        promoteOrAdd(out, m, last);
      } else if (!target) {
        const Move* lm = b.lastMove();
        if (lm && lm->kind == MoveKind::DoublePush && lm->piece->color != color &&
            lm->to == Position{pos.row, pos.col + dc}) {
          Move m{pos, t, shared_from_this()};
          m.kind = MoveKind::EnPassant; m.captured = lm->piece; m.capturedPos = lm->to;
          out.push_back(m);
        }
      }
    }
    return out;
  }
private:
  static void promoteOrAdd(std::vector<Move>& out, Move m, int lastRow) {
    if (m.to.row != lastRow) { out.push_back(m); return; }
    for (PieceType t : {PieceType::Queen, PieceType::Rook, PieceType::Bishop, PieceType::Knight}) {
      Move pm = m; pm.kind = MoveKind::Promotion; pm.promotion = t; out.push_back(pm);
    }
  }
};

inline PiecePtr makePiece(PieceType t, Color c) {
  switch (t) {
    case PieceType::King: return std::make_shared<King>(c);
    case PieceType::Queen: return std::make_shared<Queen>(c);
    case PieceType::Rook: return std::make_shared<Rook>(c);
    case PieceType::Bishop: return std::make_shared<Bishop>(c);
    case PieceType::Knight: return std::make_shared<Knight>(c);
    default: return std::make_shared<Pawn>(c);
  }
}

inline Board Board::standard() {
  Board b;
  const PieceType back[8] = {PieceType::Rook, PieceType::Knight, PieceType::Bishop, PieceType::Queen,
                             PieceType::King, PieceType::Bishop, PieceType::Knight, PieceType::Rook};
  for (int c = 0; c < 8; ++c) {
    b.put({0, c}, makePiece(back[c], Color::White));
    b.put({7, c}, makePiece(back[c], Color::Black));
    b.put({1, c}, std::make_shared<Pawn>(Color::White));
    b.put({6, c}, std::make_shared<Pawn>(Color::Black));
  }
  return b;
}

struct Player { std::string name; Color color; };

class Game {
  Board board_ = Board::standard();
  Player players_[2]{{"White", Color::White}, {"Black", Color::Black}};
  Color turn_ = Color::White;
  GameStatus status_ = GameStatus::Active;

  bool hasAnyMove(Color c) {
    for (auto& [pos, pc] : board_.piecesOf(c)) if (!legalMoves(pos).empty()) return true;
    return false;
  }
  void updateStatus() {
    bool check = inCheck(turn_);
    if (!hasAnyMove(turn_)) status_ = check ? GameStatus::Checkmate : GameStatus::Stalemate;
    else status_ = check ? GameStatus::Check : GameStatus::Active;
  }
public:
  const Board& board() const { return board_; }
  GameStatus status() const { return status_; }
  Color turn() const { return turn_; }

  bool inCheck(Color c) const { return board_.isAttacked(board_.findKing(c), opposite(c)); }

  std::vector<Move> legalMoves(Position pos) {
    PiecePtr piece = board_.get(pos);
    std::vector<Move> legal;
    if (!piece) return legal;
    for (Move m : piece->getValidMoves(board_, pos)) {
      board_.apply(m);                         // simulate
      bool safe = !inCheck(piece->color);
      board_.undo(m);
      if (safe) legal.push_back(m);
    }
    return legal;
  }

  Move makeMove(Position from, Position to, PieceType promotion = PieceType::Queen) {
    if (status_ == GameStatus::Checkmate || status_ == GameStatus::Stalemate)
      throw std::logic_error("game is over");
    PiecePtr piece = board_.get(from);
    if (!piece || piece->color != turn_) throw std::invalid_argument("no piece of the side to move");
    for (Move m : legalMoves(from)) {
      if (m.to == to && (!m.promotion || *m.promotion == promotion)) {
        board_.apply(m);
        turn_ = opposite(turn_);
        updateStatus();
        return m;
      }
    }
    throw std::invalid_argument("illegal move " + from.str() + "->" + to.str());
  }
};

int main() {
  Game g;
  for (auto [a, b] : std::vector<std::pair<std::string, std::string>>{
           {"f2", "f3"}, {"e7", "e5"}, {"g2", "g4"}, {"d8", "h4"}})  // Fool's mate
    g.makeMove(Position::parse(a), Position::parse(b));
  std::cout << g.board().render();
  std::cout << (g.status() == GameStatus::Checkmate ? "CHECKMATE" : "other") << std::endl;
}
`

const goCode = `package main

import (
  "errors"
  "fmt"
  "strings"
)

type Color int

const (
  White Color = iota
  Black
)

func (c Color) Opposite() Color { return 1 - c }
func (c Color) Forward() int {
  if c == White {
    return 1
  }
  return -1
}

type PieceType int

const (
  KingT PieceType = iota
  QueenT
  RookT
  BishopT
  KnightT
  PawnT
)

type MoveKind int

const (
  Normal MoveKind = iota
  DoublePush
  EnPassant
  CastleKing
  CastleQueen
  Promotion
)

type GameStatus int

const (
  Active GameStatus = iota
  Check
  Checkmate
  Stalemate
)

type Position struct{ Row, Col int }

func (p Position) InBounds() bool          { return p.Row >= 0 && p.Row < 8 && p.Col >= 0 && p.Col < 8 }
func (p Position) Offset(dr, dc int) Position { return Position{p.Row + dr, p.Col + dc} }
func (p Position) String() string          { return fmt.Sprintf("%c%d", 'a'+p.Col, p.Row+1) }
func Parse(s string) Position               { return Position{int(s[1] - '1'), int(s[0] - 'a')} }

type Piece interface {
  Color() Color
  Type() PieceType
  HasMoved() bool
  SetMoved(bool)
  Symbol() byte
  // Moves returns pseudo-legal moves (geometry only); Game filters king exposure.
  Moves(b *Board, from Position) []Move
  Attacks(b *Board, from Position) []Position
}

type Move struct {
  From, To    Position
  Piece       Piece
  Kind        MoveKind
  Captured    Piece
  CapturedPos Position
  Promo       *PieceType
  HadMoved    bool
}

type base struct {
  color Color
  kind  PieceType
  moved bool
}

func (b *base) Color() Color     { return b.color }
func (b *base) Type() PieceType  { return b.kind }
func (b *base) HasMoved() bool   { return b.moved }
func (b *base) SetMoved(v bool)  { b.moved = v }
func (b *base) Symbol() byte {
  c := "KQRBNP"[b.kind]
  if b.color == Black {
    c += 32
  }
  return c
}

type dir [2]int

var (
  rookDirs   = []dir{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
  bishopDirs = []dir{{1, 1}, {1, -1}, {-1, 1}, {-1, -1}}
  queenDirs  = append(append([]dir{}, rookDirs...), bishopDirs...)
  knightDirs = []dir{{2, 1}, {2, -1}, {-2, 1}, {-2, -1}, {1, 2}, {1, -2}, {-1, 2}, {-1, -2}}
)

func slide(b *Board, pc Piece, from Position, dirs []dir) []Move {
  var out []Move
  for _, d := range dirs {
    p := from.Offset(d[0], d[1])
    for p.InBounds() {
      t := b.Get(p)
      if t == nil {
        out = append(out, Move{From: from, To: p, Piece: pc})
      } else {
        if t.Color() != pc.Color() {
          out = append(out, Move{From: from, To: p, Piece: pc, Captured: t, CapturedPos: p})
        }
        break
      }
      p = p.Offset(d[0], d[1])
    }
  }
  return out
}

func step(b *Board, pc Piece, from Position, deltas []dir) []Move {
  var out []Move
  for _, d := range deltas {
    p := from.Offset(d[0], d[1])
    if !p.InBounds() {
      continue
    }
    t := b.Get(p)
    if t == nil {
      out = append(out, Move{From: from, To: p, Piece: pc})
    } else if t.Color() != pc.Color() {
      out = append(out, Move{From: from, To: p, Piece: pc, Captured: t, CapturedPos: p})
    }
  }
  return out
}

func targets(ms []Move) []Position {
  out := make([]Position, 0, len(ms))
  for _, m := range ms {
    out = append(out, m.To)
  }
  return out
}

type Rook struct{ base }
type Bishop struct{ base }
type Queen struct{ base }
type Knight struct{ base }
type King struct{ base }
type Pawn struct{ base }

func (r *Rook) Moves(b *Board, f Position) []Move       { return slide(b, r, f, rookDirs) }
func (r *Rook) Attacks(b *Board, f Position) []Position { return targets(r.Moves(b, f)) }
func (x *Bishop) Moves(b *Board, f Position) []Move       { return slide(b, x, f, bishopDirs) }
func (x *Bishop) Attacks(b *Board, f Position) []Position { return targets(x.Moves(b, f)) }
func (q *Queen) Moves(b *Board, f Position) []Move       { return slide(b, q, f, queenDirs) }
func (q *Queen) Attacks(b *Board, f Position) []Position { return targets(q.Moves(b, f)) }
func (n *Knight) Moves(b *Board, f Position) []Move       { return step(b, n, f, knightDirs) }
func (n *Knight) Attacks(b *Board, f Position) []Position { return targets(n.Moves(b, f)) }

// King attacks exclude castling to avoid infinite recursion.
func (k *King) Attacks(b *Board, f Position) []Position { return targets(step(b, k, f, queenDirs)) }

func (k *King) Moves(b *Board, from Position) []Move {
  moves := step(b, k, from, queenDirs)
  enemy := k.color.Opposite()
  if k.moved || b.IsAttacked(from, enemy) {
    return moves
  }
  type opt struct {
    kind       MoveKind
    rookCol    int
    empty, via []int
    target     int
  }
  for _, o := range []opt{
    {CastleKing, 7, []int{5, 6}, []int{5, 6}, 6},
    {CastleQueen, 0, []int{1, 2, 3}, []int{3, 2}, 2},
  } {
    rook := b.Get(Position{from.Row, o.rookCol})
    if rook == nil || rook.Type() != RookT || rook.Color() != k.color || rook.HasMoved() {
      continue
    }
    ok := true
    for _, c := range o.empty {
      if b.Get(Position{from.Row, c}) != nil {
        ok = false
      }
    }
    for _, c := range o.via {
      if b.IsAttacked(Position{from.Row, c}, enemy) {
        ok = false
      }
    }
    if ok {
      moves = append(moves, Move{From: from, To: Position{from.Row, o.target}, Piece: k, Kind: o.kind})
    }
  }
  return moves
}

func (p *Pawn) Attacks(b *Board, f Position) []Position {
  var out []Position
  for _, dc := range []int{-1, 1} {
    if t := f.Offset(p.color.Forward(), dc); t.InBounds() {
      out = append(out, t)
    }
  }
  return out
}

func (p *Pawn) Moves(b *Board, from Position) []Move {
  d := p.color.Forward()
  start, last := 1, 7
  if p.color == Black {
    start, last = 6, 0
  }
  var out []Move
  one := from.Offset(d, 0)
  if one.InBounds() && b.Get(one) == nil {
    out = append(out, p.promote(Move{From: from, To: one, Piece: p}, last)...)
    two := from.Offset(2*d, 0)
    if from.Row == start && b.Get(two) == nil {
      out = append(out, Move{From: from, To: two, Piece: p, Kind: DoublePush})
    }
  }
  for _, dc := range []int{-1, 1} {
    t := from.Offset(d, dc)
    if !t.InBounds() {
      continue
    }
    target := b.Get(t)
    if target != nil && target.Color() != p.color {
      out = append(out, p.promote(Move{From: from, To: t, Piece: p, Captured: target, CapturedPos: t}, last)...)
    } else if target == nil {
      if lm := b.LastMove(); lm != nil && lm.Kind == DoublePush && lm.Piece.Color() != p.color &&
        lm.To == (Position{from.Row, from.Col + dc}) {
        out = append(out, Move{From: from, To: t, Piece: p, Kind: EnPassant, Captured: lm.Piece, CapturedPos: lm.To})
      }
    }
  }
  return out
}

func (p *Pawn) promote(m Move, lastRow int) []Move {
  if m.To.Row != lastRow {
    return []Move{m}
  }
  var out []Move
  for _, t := range []PieceType{QueenT, RookT, BishopT, KnightT} {
    t := t
    pm := m
    pm.Kind, pm.Promo = Promotion, &t
    out = append(out, pm)
  }
  return out
}

func NewPiece(t PieceType, c Color) Piece {
  b := base{color: c, kind: t}
  switch t {
  case KingT:
    return &King{b}
  case QueenT:
    return &Queen{b}
  case RookT:
    return &Rook{b}
  case BishopT:
    return &Bishop{b}
  case KnightT:
    return &Knight{b}
  default:
    return &Pawn{b}
  }
}

type Board struct {
  grid    [8][8]Piece
  history []Move
}

func StandardBoard() *Board {
  b := &Board{}
  back := []PieceType{RookT, KnightT, BishopT, QueenT, KingT, BishopT, KnightT, RookT}
  for c, t := range back {
    b.grid[0][c] = NewPiece(t, White)
    b.grid[7][c] = NewPiece(t, Black)
    b.grid[1][c] = NewPiece(PawnT, White)
    b.grid[6][c] = NewPiece(PawnT, Black)
  }
  return b
}

func (b *Board) Get(p Position) Piece    { return b.grid[p.Row][p.Col] }
func (b *Board) set(p Position, pc Piece) { b.grid[p.Row][p.Col] = pc }
func (b *Board) LastMove() *Move {
  if len(b.history) == 0 {
    return nil
  }
  return &b.history[len(b.history)-1]
}

type placed struct {
  pos Position
  pc  Piece
}

func (b *Board) PiecesOf(c Color) []placed {
  var out []placed
  for r := 0; r < 8; r++ {
    for col := 0; col < 8; col++ {
      if p := b.grid[r][col]; p != nil && p.Color() == c {
        out = append(out, placed{Position{r, col}, p})
      }
    }
  }
  return out
}

func (b *Board) FindKing(c Color) Position {
  for _, e := range b.PiecesOf(c) {
    if e.pc.Type() == KingT {
      return e.pos
    }
  }
  panic("king missing")
}

func (b *Board) IsAttacked(target Position, by Color) bool {
  for _, e := range b.PiecesOf(by) {
    for _, a := range e.pc.Attacks(b, e.pos) {
      if a == target {
        return true
      }
    }
  }
  return false
}

func (b *Board) Apply(m *Move) {
  m.HadMoved = m.Piece.HasMoved()
  b.set(m.From, nil)
  if m.Captured != nil {
    b.set(m.CapturedPos, nil)
  }
  pc := m.Piece
  if m.Promo != nil {
    pc = NewPiece(*m.Promo, m.Piece.Color())
  }
  pc.SetMoved(true)
  b.set(m.To, pc)
  if m.Kind == CastleKing || m.Kind == CastleQueen {
    rf, rt := 0, 3
    if m.Kind == CastleKing {
      rf, rt = 7, 5
    }
    rook := b.Get(Position{m.From.Row, rf})
    b.set(Position{m.From.Row, rf}, nil)
    b.set(Position{m.From.Row, rt}, rook)
    rook.SetMoved(true)
  }
  b.history = append(b.history, *m)
}

func (b *Board) Undo(m *Move) {
  b.history = b.history[:len(b.history)-1]
  b.set(m.To, nil)
  b.set(m.From, m.Piece)
  m.Piece.SetMoved(m.HadMoved)
  if m.Captured != nil {
    b.set(m.CapturedPos, m.Captured)
  }
  if m.Kind == CastleKing || m.Kind == CastleQueen {
    rf, rt := 0, 3
    if m.Kind == CastleKing {
      rf, rt = 7, 5
    }
    rook := b.Get(Position{m.From.Row, rt})
    b.set(Position{m.From.Row, rt}, nil)
    b.set(Position{m.From.Row, rf}, rook)
    rook.SetMoved(false)
  }
}

func (b *Board) Render() string {
  var sb strings.Builder
  for r := 7; r >= 0; r-- {
    fmt.Fprintf(&sb, "%d ", r+1)
    for c := 0; c < 8; c++ {
      if p := b.grid[r][c]; p != nil {
        sb.WriteByte(p.Symbol())
      } else {
        sb.WriteByte('.')
      }
      sb.WriteByte(' ')
    }
    sb.WriteString("\\n")
  }
  sb.WriteString("  a b c d e f g h\\n")
  return sb.String()
}

type Player struct {
  Name  string
  Color Color
}

type Game struct {
  Board   *Board
  Players [2]Player
  Turn    Color
  Status  GameStatus
}

func NewGame(white, black string) *Game {
  return &Game{Board: StandardBoard(), Players: [2]Player{{white, White}, {black, Black}}, Turn: White}
}

func (g *Game) InCheck(c Color) bool {
  return g.Board.IsAttacked(g.Board.FindKing(c), c.Opposite())
}

func (g *Game) LegalMoves(from Position) []Move {
  pc := g.Board.Get(from)
  if pc == nil {
    return nil
  }
  var legal []Move
  for _, m := range pc.Moves(g.Board, from) {
    m := m
    g.Board.Apply(&m) // simulate
    safe := !g.InCheck(pc.Color())
    g.Board.Undo(&m)
    if safe {
      legal = append(legal, m)
    }
  }
  return legal
}

func (g *Game) hasAnyMove(c Color) bool {
  for _, e := range g.Board.PiecesOf(c) {
    if len(g.LegalMoves(e.pos)) > 0 {
      return true
    }
  }
  return false
}

func (g *Game) MakeMove(from, to Position, promo PieceType) (Move, error) {
  if g.Status == Checkmate || g.Status == Stalemate {
    return Move{}, errors.New("game is over")
  }
  pc := g.Board.Get(from)
  if pc == nil || pc.Color() != g.Turn {
    return Move{}, errors.New("no piece of the side to move")
  }
  for _, m := range g.LegalMoves(from) {
    m := m
    if m.To == to && (m.Promo == nil || *m.Promo == promo) {
      g.Board.Apply(&m)
      g.Turn = g.Turn.Opposite()
      g.updateStatus()
      return m, nil
    }
  }
  return Move{}, fmt.Errorf("illegal move %v->%v", from, to)
}

func (g *Game) updateStatus() {
  check := g.InCheck(g.Turn)
  switch {
  case !g.hasAnyMove(g.Turn) && check:
    g.Status = Checkmate
  case !g.hasAnyMove(g.Turn):
    g.Status = Stalemate
  case check:
    g.Status = Check
  default:
    g.Status = Active
  }
}

func main() {
  g := NewGame("Alice", "Bob")
  for _, mv := range [][2]string{{"f2", "f3"}, {"e7", "e5"}, {"g2", "g4"}, {"d8", "h4"}} { // Fool's mate
    if _, err := g.MakeMove(Parse(mv[0]), Parse(mv[1]), QueenT); err != nil {
      panic(err)
    }
  }
  fmt.Print(g.Board.Render())
  fmt.Println(g.Status == Checkmate)
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

public enum Color { White, Black }
public enum PieceType { King, Queen, Rook, Bishop, Knight, Pawn }
public enum MoveKind { Normal, DoublePush, EnPassant, CastleKing, CastleQueen, Promotion }
public enum GameStatus { Active, Check, Checkmate, Stalemate }

public static class ColorExt {
  public static Color Opposite(this Color c) => c == Color.White ? Color.Black : Color.White;
  public static int Forward(this Color c) => c == Color.White ? 1 : -1;
}

public readonly record struct Position(int Row, int Col) {
  public bool InBounds => Row >= 0 && Row < 8 && Col >= 0 && Col < 8;
  public Position Offset(int dr, int dc) => new(Row + dr, Col + dc);
  public static Position Parse(string s) => new(s[1] - '1', s[0] - 'a');
  public override string ToString() => $"{(char)('a' + Col)}{Row + 1}";
}

public sealed class Move {
  public Position From { get; }
  public Position To { get; }
  public Piece Piece { get; }
  public MoveKind Kind { get; }
  public Piece? Captured { get; set; }
  public Position? CapturedPos { get; set; }
  public PieceType? Promotion { get; set; }
  public bool PieceHadMoved { get; set; }

  public Move(Position src, Position dst, Piece piece, MoveKind kind = MoveKind.Normal) {
    From = src; To = dst; Piece = piece; Kind = kind;
  }
  public Move Capturing(Piece p, Position at) { Captured = p; CapturedPos = at; return this; }
}

public abstract class Piece {
  protected static readonly (int, int)[] RookD = { (1, 0), (-1, 0), (0, 1), (0, -1) };
  protected static readonly (int, int)[] BishopD = { (1, 1), (1, -1), (-1, 1), (-1, -1) };
  protected static readonly (int, int)[] KnightD =
    { (2, 1), (2, -1), (-2, 1), (-2, -1), (1, 2), (1, -2), (-1, 2), (-1, -2) };

  public Color Color { get; }
  public PieceType Type { get; }
  public bool HasMoved { get; set; }
  protected Piece(Color color, PieceType type) { Color = color; Type = type; }

  /// <summary>Pseudo-legal moves; Game filters moves that leave the king in check.</summary>
  public abstract List<Move> GetValidMoves(Board board, Position pos);

  public virtual List<Position> Attacks(Board board, Position pos) =>
    GetValidMoves(board, pos).Select(m => m.To).ToList();

  public char Symbol {
    get {
      char c = "KQRBNP"[(int)Type];
      return Color == Color.White ? c : char.ToLower(c);
    }
  }

  protected List<Move> Slide(Board b, Position src, params (int, int)[][] groups) {
    var result = new List<Move>();
    foreach (var (dr, dc) in groups.SelectMany(g => g)) {
      var p = src.Offset(dr, dc);
      while (p.InBounds) {
        var t = b.Get(p);
        if (t is null) result.Add(new Move(src, p, this));
        else {
          if (t.Color != Color) result.Add(new Move(src, p, this).Capturing(t, p));
          break;
        }
        p = p.Offset(dr, dc);
      }
    }
    return result;
  }

  protected List<Move> Step(Board b, Position src, params (int, int)[][] groups) {
    var result = new List<Move>();
    foreach (var (dr, dc) in groups.SelectMany(g => g)) {
      var p = src.Offset(dr, dc);
      if (!p.InBounds) continue;
      var t = b.Get(p);
      if (t is null) result.Add(new Move(src, p, this));
      else if (t.Color != Color) result.Add(new Move(src, p, this).Capturing(t, p));
    }
    return result;
  }

  public static Piece Create(PieceType t, Color c) => t switch {
    PieceType.King => new King(c), PieceType.Queen => new Queen(c), PieceType.Rook => new Rook(c),
    PieceType.Bishop => new Bishop(c), PieceType.Knight => new Knight(c), _ => new Pawn(c),
  };
}

public sealed class Rook : Piece {
  public Rook(Color c) : base(c, PieceType.Rook) {}
  public override List<Move> GetValidMoves(Board b, Position p) => Slide(b, p, RookD);
}
public sealed class Bishop : Piece {
  public Bishop(Color c) : base(c, PieceType.Bishop) {}
  public override List<Move> GetValidMoves(Board b, Position p) => Slide(b, p, BishopD);
}
public sealed class Queen : Piece {
  public Queen(Color c) : base(c, PieceType.Queen) {}
  public override List<Move> GetValidMoves(Board b, Position p) => Slide(b, p, RookD, BishopD);
}
public sealed class Knight : Piece {
  public Knight(Color c) : base(c, PieceType.Knight) {}
  public override List<Move> GetValidMoves(Board b, Position p) => Step(b, p, KnightD);
}

public sealed class King : Piece {
  public King(Color c) : base(c, PieceType.King) {}

  public override List<Position> Attacks(Board b, Position p) =>   // no castling: avoids recursion
    Step(b, p, RookD, BishopD).Select(m => m.To).ToList();

  public override List<Move> GetValidMoves(Board b, Position pos) {
    var moves = Step(b, pos, RookD, BishopD);
    var enemy = Color.Opposite();
    if (!HasMoved && !b.IsAttacked(pos, enemy)) {
      TryCastle(b, pos, enemy, moves, MoveKind.CastleKing, 7, new[] { 5, 6 }, new[] { 5, 6 }, 6);
      TryCastle(b, pos, enemy, moves, MoveKind.CastleQueen, 0, new[] { 1, 2, 3 }, new[] { 3, 2 }, 2);
    }
    return moves;
  }

  void TryCastle(Board b, Position pos, Color enemy, List<Move> moves, MoveKind kind,
                 int rookCol, int[] empty, int[] cross, int targetCol) {
    if (b.Get(new Position(pos.Row, rookCol)) is not Rook rook || rook.Color != Color || rook.HasMoved) return;
    if (empty.Any(c => b.Get(new Position(pos.Row, c)) is not null)) return;
    if (cross.Any(c => b.IsAttacked(new Position(pos.Row, c), enemy))) return;
    moves.Add(new Move(pos, new Position(pos.Row, targetCol), this, kind));
  }
}

public sealed class Pawn : Piece {
  public Pawn(Color c) : base(c, PieceType.Pawn) {}

  public override List<Position> Attacks(Board b, Position p) =>
    new[] { -1, 1 }.Select(dc => p.Offset(Color.Forward(), dc)).Where(t => t.InBounds).ToList();

  public override List<Move> GetValidMoves(Board b, Position pos) {
    int d = Color.Forward();
    int start = Color == Color.White ? 1 : 6, last = Color == Color.White ? 7 : 0;
    var outMoves = new List<Move>();
    var one = pos.Offset(d, 0);
    if (one.InBounds && b.Get(one) is null) {
      PromoteOrAdd(outMoves, new Move(pos, one, this), last);
      var two = pos.Offset(2 * d, 0);
      if (pos.Row == start && b.Get(two) is null) outMoves.Add(new Move(pos, two, this, MoveKind.DoublePush));
    }
    foreach (int dc in new[] { -1, 1 }) {
      var t = pos.Offset(d, dc);
      if (!t.InBounds) continue;
      var target = b.Get(t);
      if (target is not null && target.Color != Color) {
        PromoteOrAdd(outMoves, new Move(pos, t, this).Capturing(target, t), last);
      } else if (target is null) {
        var lm = b.LastMove;
        if (lm is not null && lm.Kind == MoveKind.DoublePush && lm.Piece.Color != Color
            && lm.To == new Position(pos.Row, pos.Col + dc)) {
          outMoves.Add(new Move(pos, t, this, MoveKind.EnPassant).Capturing(lm.Piece, lm.To));
        }
      }
    }
    return outMoves;
  }

  static void PromoteOrAdd(List<Move> list, Move m, int lastRow) {
    if (m.To.Row != lastRow) { list.Add(m); return; }
    foreach (var t in new[] { PieceType.Queen, PieceType.Rook, PieceType.Bishop, PieceType.Knight }) {
      var pm = new Move(m.From, m.To, m.Piece, MoveKind.Promotion) {
        Captured = m.Captured, CapturedPos = m.CapturedPos, Promotion = t,
      };
      list.Add(pm);
    }
  }
}

public sealed class Board {
  readonly Piece?[,] _grid = new Piece?[8, 8];
  readonly List<Move> _history = new();

  public static Board Standard() {
    var b = new Board();
    var back = new[] { PieceType.Rook, PieceType.Knight, PieceType.Bishop, PieceType.Queen,
                       PieceType.King, PieceType.Bishop, PieceType.Knight, PieceType.Rook };
    for (int c = 0; c < 8; c++) {
      b._grid[0, c] = Piece.Create(back[c], Color.White);
      b._grid[7, c] = Piece.Create(back[c], Color.Black);
      b._grid[1, c] = new Pawn(Color.White);
      b._grid[6, c] = new Pawn(Color.Black);
    }
    return b;
  }

  public Piece? Get(Position p) => _grid[p.Row, p.Col];
  void Set(Position p, Piece? piece) => _grid[p.Row, p.Col] = piece;
  public Move? LastMove => _history.Count == 0 ? null : _history[^1];
  public IReadOnlyList<Move> History => _history;

  public List<(Position Pos, Piece Piece)> PiecesOf(Color color) {
    var list = new List<(Position, Piece)>();
    for (int r = 0; r < 8; r++)
      for (int c = 0; c < 8; c++)
        if (_grid[r, c] is { } p && p.Color == color) list.Add((new Position(r, c), p));
    return list;
  }

  public Position FindKing(Color color) =>
    PiecesOf(color).First(e => e.Piece.Type == PieceType.King).Pos;

  public bool IsAttacked(Position target, Color by) =>
    PiecesOf(by).Any(e => e.Piece.Attacks(this, e.Pos).Contains(target));

  public void Apply(Move m) {
    m.PieceHadMoved = m.Piece.HasMoved;
    Set(m.From, null);
    if (m.CapturedPos is { } cp) Set(cp, null);
    var placed = m.Promotion is { } pt ? Piece.Create(pt, m.Piece.Color) : m.Piece;
    placed.HasMoved = true;
    Set(m.To, placed);
    if (m.Kind is MoveKind.CastleKing or MoveKind.CastleQueen) {
      int rf = m.Kind == MoveKind.CastleKing ? 7 : 0, rt = m.Kind == MoveKind.CastleKing ? 5 : 3;
      var rook = Get(new Position(m.From.Row, rf))!;
      Set(new Position(m.From.Row, rf), null);
      Set(new Position(m.From.Row, rt), rook);
      rook.HasMoved = true;
    }
    _history.Add(m);
  }

  public void Undo(Move m) {
    _history.RemoveAt(_history.Count - 1);
    Set(m.To, null);
    Set(m.From, m.Piece);
    m.Piece.HasMoved = m.PieceHadMoved;
    if (m.Captured is not null && m.CapturedPos is { } cp) Set(cp, m.Captured);
    if (m.Kind is MoveKind.CastleKing or MoveKind.CastleQueen) {
      int rf = m.Kind == MoveKind.CastleKing ? 7 : 0, rt = m.Kind == MoveKind.CastleKing ? 5 : 3;
      var rook = Get(new Position(m.From.Row, rt))!;
      Set(new Position(m.From.Row, rt), null);
      Set(new Position(m.From.Row, rf), rook);
      rook.HasMoved = false;
    }
  }

  public string Render() {
    var sb = new StringBuilder();
    for (int r = 7; r >= 0; r--) {
      sb.Append(r + 1).Append(' ');
      for (int c = 0; c < 8; c++) sb.Append(_grid[r, c]?.Symbol ?? '.').Append(' ');
      sb.AppendLine();
    }
    return sb.AppendLine("  a b c d e f g h").ToString();
  }
}

public sealed record Player(string Name, Color Color);

public sealed class Game {
  public Board Board { get; } = Board.Standard();
  public Dictionary<Color, Player> Players { get; }
  public Color Turn { get; private set; } = Color.White;
  public GameStatus Status { get; private set; } = GameStatus.Active;

  public Game(string white = "White", string black = "Black") =>
    Players = new() { [Color.White] = new(white, Color.White), [Color.Black] = new(black, Color.Black) };

  public IReadOnlyList<Move> History => Board.History;

  public bool InCheck(Color c) => Board.IsAttacked(Board.FindKing(c), c.Opposite());

  public List<Move> LegalMoves(Position pos) {
    var piece = Board.Get(pos);
    var legal = new List<Move>();
    if (piece is null) return legal;
    foreach (var m in piece.GetValidMoves(Board, pos)) {
      Board.Apply(m);                       // simulate
      bool safe = !InCheck(piece.Color);
      Board.Undo(m);
      if (safe) legal.Add(m);
    }
    return legal;
  }

  bool HasAnyMove(Color c) => Board.PiecesOf(c).ToList().Any(e => LegalMoves(e.Pos).Count > 0);

  public Move MakeMove(Position src, Position dst, PieceType promotion = PieceType.Queen) {
    if (Status is GameStatus.Checkmate or GameStatus.Stalemate) throw new InvalidOperationException("game is over");
    var piece = Board.Get(src);
    if (piece is null || piece.Color != Turn) throw new ArgumentException("no piece of the side to move on " + src);
    var move = LegalMoves(src).FirstOrDefault(m => m.To == dst && (m.Promotion is null || m.Promotion == promotion))
        ?? throw new ArgumentException($"illegal move {src}->{dst}");
    Board.Apply(move);
    Turn = Turn.Opposite();
    UpdateStatus();
    return move;
  }

  void UpdateStatus() {
    bool check = InCheck(Turn);
    if (!HasAnyMove(Turn)) Status = check ? GameStatus.Checkmate : GameStatus.Stalemate;
    else Status = check ? GameStatus.Check : GameStatus.Active;
  }
}

public static class Program {
  public static void Main() {
    var g = new Game("Alice", "Bob");
    foreach (var (a, b) in new[] { ("f2", "f3"), ("e7", "e5"), ("g2", "g4"), ("d8", "h4") })  // Fool's mate
      g.MakeMove(Position.Parse(a), Position.Parse(b));
    Console.Write(g.Board.Render());
    Console.WriteLine(g.Status);  // Checkmate
  }
}
`

export const chessGameSolution: ProblemSolution = {
  slug: 'chess-game',
  title: 'Chess Game - Solution',
  overview: {
    introduction:
      'Design a two-player chess engine that knows every piece’s movement, rejects moves that leave your own king in check, detects checkmate and stalemate, and supports the special rules: castling, en passant, and pawn promotion. The interview tests polymorphism (each piece owns its geometry), clean separation of “piece rules” from “game rules”, and reversible move application.',
    constraints: [
      'Standard 8×8 board with six piece types: King, Queen, Rook, Bishop, Knight, Pawn.',
      'Two players alternate turns, White first; a move is legal only if it does not leave the mover’s king attacked.',
      'Game ends in checkmate (in check, no legal move) or stalemate (not in check, no legal move).',
      'Castling (both sides), en passant, and pawn promotion must be supported.',
      'A full move history is retained for display and for en passant detection.',
    ],
    assumptions: [
      'Draw rules beyond stalemate (50-move, threefold repetition, insufficient material, draw offers) are extensions, not v1.',
      'Promotion defaults to Queen unless the caller specifies otherwise.',
      'No clocks, networking, or UI - the engine is a pure domain model and rendering is a debugging helper.',
      'Row 0 is White’s back rank; White pawns move toward higher row indices.',
    ],
    clarificationQuestions: [
      'Do we need draw conditions (50-move, repetition, insufficient material) or only checkmate/stalemate?',
      'Should the engine generate all legal moves (for hints/AI) or only validate a requested move?',
      'Is move notation (SAN/PGN) required, or are coordinates enough?',
      'Do we need undo, replay, or save/load of a game?',
      'Are timers/clocks or an AI opponent in scope?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Split rules into two layers. Layer 1 is piece geometry - how a bishop slides, a knight jumps, a pawn captures diagonally. That belongs in Piece subclasses (polymorphism). Layer 2 is global legality - “you cannot leave your king in check”, checkmate and stalemate. That needs the whole board and belongs in Game. Doing both in one giant switch is the classic failure mode.',
    breakdown: [
      'Model entities: Board, Piece hierarchy, Position, Move, Player, Game.',
      'Give each Piece subclass getValidMoves() for pseudo-legal moves (geometry + captures only).',
      'Add Board.apply/undo so Game can simulate a move, test king safety, and roll back.',
      'Implement Board.isAttacked(square, color) using each enemy piece’s attacks().',
      'Layer special moves into the pieces that own them: castling in King, en passant + promotion in Pawn.',
      'After each move compute status: check? any legal move? → ACTIVE / CHECK / CHECKMATE / STALEMATE.',
    ],
    entities: [
      { name: 'Game', responsibility: 'Turn order, legal-move filtering, move execution, status (check/mate/stalemate).' },
      { name: 'Board', responsibility: '8×8 grid, apply/undo of moves, attack queries, move history.' },
      { name: 'Piece (abstract)', responsibility: 'Declares getValidMoves/attacks; stores color, type, hasMoved.' },
      { name: 'King / Queen / Rook / Bishop / Knight / Pawn', responsibility: 'Each encodes its own movement rules and special moves.' },
      { name: 'Move', responsibility: 'From/to, piece, kind (castle, en passant, promotion), captured piece - enough to undo.' },
      { name: 'Position / Color / MoveKind / GameStatus', responsibility: 'Value types that remove magic numbers and strings.' },
      { name: 'Player', responsibility: 'Name + color; keeps identity separate from engine rules.' },
    ],
    relationships: [
      'Game composes a Board and aggregates two Players.',
      'Board holds up to 32 Pieces; Piece subclasses inherit from the abstract Piece.',
      'Pieces depend on Board and Position to compute moves; they never mutate the Board.',
      'Move references Piece (and captured Piece) and is stored in Board history.',
    ],
    patternsAndOop: [
      'Polymorphism: Game and Board call piece.getValidMoves() without knowing the piece type.',
      'Template-style helpers: slide() and step() in Piece let Rook/Bishop/Queen/Knight be one-liners.',
      'Command-like Move: apply + undo makes simulation, history, and future undo/redo trivial.',
      'Factory: makePiece(type, color) supports promotion and board setup without switch sprawl in Board.',
    ],
    stepByStep: [
      'Clarify scope: draws, notation, undo, AI.',
      'Draw the Piece hierarchy and Board/Game on the whiteboard.',
      'Implement sliding and stepping move generation; show Rook and Knight.',
      'Explain pseudo-legal vs legal: simulate, check king safety, undo.',
      'Add castling, en passant, promotion and explain why Board needs history.',
      'Finish with status detection and complexity of isAttacked.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Pieces know how they move; the Board knows how to apply and undo moves and who attacks which square; the Game ties them together with turn order and legality. This keeps each class small and makes special rules local to the piece that owns them.',
    classResponsibilities: [
      { name: 'Game', responsibility: 'Filters pseudo-legal moves via simulate→isInCheck→undo, switches turns, updates status.' },
      { name: 'Board', responsibility: 'Grid storage, apply/undo (including castling rook and en passant capture), attack detection.' },
      { name: 'Piece', responsibility: 'Abstract contract: getValidMoves (pseudo-legal) and attacks (squares threatened).' },
      { name: 'King', responsibility: 'One-step moves + castling checks; attacks() excludes castling to avoid recursion.' },
      { name: 'Pawn', responsibility: 'Forward/double push, diagonal captures, en passant via Board.lastMove, promotion expansion.' },
      { name: 'Rook / Bishop / Queen / Knight', responsibility: 'Declarative direction tables on shared slide/step helpers.' },
      { name: 'Move', responsibility: 'Immutable intent plus captured piece info required to undo.' },
    ],
    interfacesAndAbstractions: [
      'Piece is the central abstraction - adding a fairy piece (Archbishop) means one new subclass.',
      'Piece.attacks() is separate from getValidMoves() so King castling checks and Pawn captures do not recurse infinitely.',
    ],
    relationships: [
      'Composition Game→Board: board lifetime equals game lifetime.',
      'Aggregation Board→Piece: pieces move around and are captured, but are conceptually owned by the board.',
      'Inheritance Piece→six subclasses models “is-a piece with its own movement”.',
      'Dependency Piece→Board: pieces query the board, never modify it.',
    ],
    solid: [
      'SRP: movement lives in pieces; legality in Game; mutation in Board.',
      'OCP: new piece types extend Piece; Game/Board are unchanged.',
      'LSP: any Piece subtype can be used wherever Piece is expected - contracts are the same.',
      'ISP: Piece exposes just two methods the engine needs.',
      'DIP: Game depends on Piece abstraction, not on concrete piece classes.',
    ],
    patterns: [
      { name: 'Polymorphism / Strategy-by-subclass', why: 'Each piece type supplies its movement strategy.' },
      { name: 'Command (Move)', why: 'Apply/undo as symmetric operations enables simulation and history.' },
      { name: 'Factory', why: 'Central creation for setup and promotion keeps construction logic in one place.' },
    ],
    decisions: [
      {
        decision: 'Pieces return pseudo-legal moves; Game filters king safety.',
        rationale: 'Piece logic stays local and simple; “don’t leave your king in check” is a global rule needing the entire board.',
        tradeoff: 'Every candidate move is simulated; fine for LLD, but engines use pins/bitboards for speed.',
      },
      {
        decision: 'Simulate with Board.apply/undo on the real board.',
        rationale: 'No expensive board cloning; Move stores everything needed to restore state.',
        tradeoff: 'Not thread-safe while simulating; clone per thread if you parallelise AI search.',
      },
      {
        decision: 'Separate attacks() from getValidMoves().',
        rationale: 'Pawns attack diagonally even when empty; Kings must not recurse into castling when asked “is this square attacked?”.',
        tradeoff: 'Two methods to keep in sync for pieces that override.',
      },
      {
        decision: 'Board stores move history; Pawn reads lastMove for en passant.',
        rationale: 'En passant is legal only immediately after the opposing double push - history gives that for free.',
        tradeoff: 'Pawn depends on Board history shape.',
      },
    ],
    extensibility:
      'Add draw rules by tracking position hashes and a halfmove clock in Game; add SAN notation as a Move formatter; add an AI by generating Game.legalMoves for each piece and plugging in a search strategy; add undo/redo by popping Board history and calling Board.undo.',
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
      'Game starts with Board.standard(), White to move, status ACTIVE.',
      'makeMove(from, to) verifies the piece belongs to the side to move.',
      'legalMoves(from) calls piece.getValidMoves(), then for each move: apply → inCheck(own king)? → undo, keeping only safe moves.',
      'The matching legal Move is applied (including captured pawn for en passant, rook hop for castling, new piece for promotion) and pushed to history.',
      'Turn flips; Game computes inCheck and whether the opponent has any legal move → CHECK, CHECKMATE, STALEMATE, or ACTIVE.',
    ],
    examples: [
      {
        title: 'Fool’s mate',
        input: 'f2-f3, e7-e5, g2-g4, d8-h4',
        output: 'GameStatus = CHECKMATE (Black wins)',
        explanation:
          'After Qh4 the white king on e1 is attacked along the diagonal h4-e1; f2 is vacated, g3 is empty, and no white move captures the queen, blocks, or moves the king - zero legal moves while in check.',
      },
      {
        title: 'Castling is rejected through check',
        input: 'White king e1, rook h1 unmoved, f1/g1 empty, black rook attacks f1',
        output: 'CASTLE_KING not generated',
        explanation:
          'King.getValidMoves checks that the king’s transit squares (f1, g1) are not attacked, so the castle move is simply absent from the list.',
      },
      {
        title: 'En passant capture',
        input: 'White pawn e5; Black plays d7-d5',
        output: 'e5xd6 available this turn only',
        explanation:
          'Board.lastMove is a DOUBLE_PUSH landing beside the white pawn. Pawn emits an EN_PASSANT move that removes the pawn on d5 (captured_pos), not on d6.',
      },
    ],
  },
  followUps: [
    {
      question: 'Why not put move validation inside the Piece classes completely?',
      answer:
        'Check legality depends on the entire board (pins, discovered attacks). A piece only knows its own geometry. Keep Piece pseudo-legal and let Game apply the global rule via simulate/undo.',
    },
    {
      question: 'How do you detect checkmate vs stalemate efficiently?',
      answer:
        'After a move, ask: is the side to move in check? Does any piece have at least one legal move (short-circuit on first)? No moves + check = checkmate; no moves + no check = stalemate.',
    },
    {
      question: 'How do you implement threefold repetition and the 50-move rule?',
      answer:
        'Keep a position hash (board + side to move + castling/en-passant rights) counter in Game, and a halfmove clock reset on pawn moves/captures. Draw when a hash hits 3 or the clock hits 100 plies.',
    },
    {
      question: 'How would you add an AI opponent?',
      answer:
        'Expose Game.allLegalMoves(color) and add a MoveStrategy like the Tic-Tac-Toe design: minimax/alpha-beta with a material+mobility evaluation, using Board.apply/undo for search.',
    },
    {
      question: 'How do you make isAttacked faster?',
      answer:
        'Instead of asking every enemy piece, cast rays outward from the target square (sliders), check knight offsets, pawn diagonals, and adjacent king squares - O(1) per square with bitboards.',
    },
    {
      question: 'Why does the King have a separate attacks() override?',
      answer:
        'getValidMoves for the King calls isAttacked for castling; isAttacked calls enemy.attacks(). If attacks() delegated to getValidMoves for a King it would recurse forever. The override returns only adjacent squares.',
    },
  ],
  extras: {
    edgeCases: [
      'Castling is illegal when the king is in check, passes through an attacked square, or either piece has moved.',
      'En passant is legal only on the very next move and must also pass the king-safety filter (discovered check on the rank).',
      'Promotion with capture must still remove the captured piece.',
      'A pinned piece may have pseudo-legal moves but zero legal ones.',
      'Stalemate is a draw, not a win - do not report it as checkmate.',
      'Undo must restore hasMoved or castling rights silently disappear.',
    ],
    commonMistakes: [
      'Letting pieces mutate the board while generating moves.',
      'Forgetting to remove the en-passant-captured pawn from its own square (not the destination).',
      'King.getValidMoves calling isAttacked that calls King.getValidMoves → infinite recursion.',
      'Treating pawns as attacking forward squares in isAttacked.',
      'Cloning the whole board for every simulated move instead of apply/undo.',
    ],
    complexity:
      'Pseudo-legal generation per piece is O(1)-O(27). Legal filter costs O(M × A) where M is candidate moves and A is cost of isAttacked (O(P × move-gen) naive, ~O(1) with ray-casting). Checkmate detection exits at the first legal move.',
    testing: [
      'Piece-level tests on empty boards: counts of moves for each piece from the centre and corners.',
      'Fool’s mate and Scholar’s mate sequences reach CHECKMATE.',
      'Known stalemate position yields STALEMATE.',
      'Castling matrix: moved king/rook, blocked squares, attacked transit squares.',
      'Apply→undo leaves the board and hasMoved flags identical (property test).',
      'En passant only available immediately after a double push.',
    ],
    extensions: [
      'Draw rules, clocks, SAN/PGN import/export.',
      'AI opponent and hint system built on legal move generation.',
      'Undo/redo and game replay from history.',
      'Chess variants (Chess960, three-check) via Board setup and rule overrides.',
    ],
    takeaways: [
      'Separate piece geometry from global legality.',
      'Reversible moves unlock simulation, history, and AI.',
      'attacks() ≠ getValidMoves() - pawns and kings need distinct treatment.',
      'Special moves live with the piece that owns them.',
    ],
  },
}
