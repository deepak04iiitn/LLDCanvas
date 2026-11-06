import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, enm, method, resetUmlIds } from '../uml'

/* ────────────────────────────────────────────────────────────────────────────
 * UML - a medium chess model, deliberately NOT a full engine.
 *   Piece carries its PieceType and applies type-based movement rules in one
 *   canMoveTo method, so six piece kinds do not need six near-empty subclasses.
 *   Board owns geometry (grid, path checks); ChessGame owns turns and check.
 *
 * Grid layout (col,row):
 *   row 0:  .          .          Color      .
 *   row 1:  ChessGame  Board      Piece      PieceType
 *   row 2:  Move       Position   .          .
 * ──────────────────────────────────────────────────────────────────────────── */

resetUmlIds()

const nodes = [
  enm('co', 'Color', GRID.x(2), GRID.y(0), ['WHITE', 'BLACK']),

  cls('cg', 'ChessGame', GRID.x(0), GRID.y(1), [
    attr('-', 'board', 'Board'),
    attr('-', 'turn', 'Color'),
    attr('-', 'history', 'List<Move>'),
    attr('-', 'started', 'bool'),
  ], [
    method('+', 'start', '', 'void'),
    method('+', 'move', 'from: String, to: String', 'Move'),
    method('+', 'isCheck', 'color: Color', 'bool'),
    method('+', 'printBoard', '', 'void'),
  ], 'facade'),
  cls('bd', 'Board', GRID.x(1), GRID.y(1), [
    attr('-', 'grid', 'Piece?[8][8]'),
  ], [
    method('+', 'place', 'piece: Piece', 'void'),
    method('+', 'get', 'pos: Position', 'Piece?'),
    method('+', 'isEmpty', 'pos: Position', 'bool'),
    method('+', 'remove', 'pos: Position', 'Piece?'),
    method('+', 'movePiece', 'from: Position, to: Position', 'void'),
    method('+', 'isPathClear', 'from: Position, to: Position', 'bool'),
    method('+', 'findKing', 'color: Color', 'Piece?'),
    method('+', 'piecesOf', 'color: Color', 'List<Piece>'),
    method('+', 'render', '', 'String'),
  ]),
  cls('pc', 'Piece', GRID.x(2), GRID.y(1), [
    attr('-', 'color', 'Color'),
    attr('-', 'type', 'PieceType'),
    attr('-', 'position', 'Position'),
  ], [
    method('+', 'canMoveTo', 'board: Board, to: Position', 'bool'),
    method('+', 'symbol', '', 'String'),
    method('+', 'label', '', 'String'),
  ]),
  enm('pt', 'PieceType', GRID.x(3), GRID.y(1), ['KING', 'QUEEN', 'ROOK', 'BISHOP', 'KNIGHT', 'PAWN']),

  cls('mv', 'Move', GRID.x(0), GRID.y(2), [
    attr('-', 'from', 'Position'),
    attr('-', 'to', 'Position'),
    attr('-', 'piece', 'Piece'),
    attr('-', 'captured', 'Piece?'),
  ], [
    method('+', 'describe', '', 'String'),
  ]),
  cls('ps', 'Position', GRID.x(1), GRID.y(2), [
    attr('-', 'row', 'int'),
    attr('-', 'col', 'int'),
  ], [
    method('+', 'parse', 'text: String', 'Position', { isStatic: true }),
    method('+', 'isOnBoard', '', 'bool'),
    method('+', 'toString', '', 'String'),
  ]),
]

const edges = [
  edge('e1', 'cg', 'bd', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1', label: 'board' }),
  edge('e2', 'bd', 'pc', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..32', label: 'pieces' }),
  edge('e3', 'pc', 'co', 'association', 'top', 'bottom', { label: 'color' }),
  edge('e4', 'pc', 'pt', 'association', 'right', 'left', { label: 'type' }),
  edge('e5', 'pc', 'ps', 'association', 'bottom', 'right', { label: 'stands on' }),
  edge('e6', 'cg', 'mv', 'composition', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'history' }),
  edge('e7', 'mv', 'ps', 'association', 'right', 'left', { label: 'from, to' }),
  edge('e8', 'bd', 'ps', 'dependency', 'bottom', 'top', { label: 'addresses by' }),
  edge('e9', 'mv', 'pc', 'association', 'bottom', 'bottom', { targetMultiplicity: '1..2', label: 'piece, captured' }),
  edge('e10', 'cg', 'co', 'association', 'top', 'left', { label: 'turn' }),
]

/* ────────────────────────────── PYTHON ────────────────────────────── */

const py = `from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import List, Optional


def log(message: str = "") -> None:
    print(message)


class Color(Enum):
    WHITE = "WHITE"
    BLACK = "BLACK"

    def opposite(self) -> "Color":
        return Color.BLACK if self is Color.WHITE else Color.WHITE


class PieceType(Enum):
    KING = "KING"
    QUEEN = "QUEEN"
    ROOK = "ROOK"
    BISHOP = "BISHOP"
    KNIGHT = "KNIGHT"
    PAWN = "PAWN"


@dataclass(frozen=True)

class Position:
    """row 0 is rank 1 (white side), col 0 is file a."""

    row: int
    col: int

    @staticmethod
    def parse(text: str) -> "Position":
        if len(text) != 2 or text[0] not in "abcdefgh" or text[1] not in "12345678":
            raise ValueError(f"Bad square '{text}', expected a1..h8")
        return Position(int(text[1]) - 1, ord(text[0]) - ord("a"))

    def is_on_board(self) -> bool:
        return 0 <= self.row < 8 and 0 <= self.col < 8

    def __str__(self) -> str:
        return f"{chr(ord('a') + self.col)}{self.row + 1}"


class Piece:
    SYMBOLS = {
        PieceType.KING: "K",
        PieceType.QUEEN: "Q",
        PieceType.ROOK: "R",
        PieceType.BISHOP: "B",
        PieceType.KNIGHT: "N",
        PieceType.PAWN: "P",
    }

    def __init__(self, color: Color, piece_type: PieceType, position: Position) -> None:
        self.color = color
        self.type = piece_type
        self.position = position

    def symbol(self) -> str:
        letter = Piece.SYMBOLS[self.type]
        return letter if self.color is Color.WHITE else letter.lower()

    def label(self) -> str:
        return f"{self.color.name} {self.type.name}"

    def can_move_to(self, board: "Board", to: Position) -> bool:
        """Basic movement only: no castling, en passant or promotion."""
        if to == self.position or not to.is_on_board():
            return False
        target = board.get(to)
        if target is not None and target.color is self.color:
            return False
        dr = to.row - self.position.row
        dc = to.col - self.position.col
        straight = dr == 0 or dc == 0
        diagonal = abs(dr) == abs(dc)

        if self.type is PieceType.KNIGHT:
            return (abs(dr), abs(dc)) in ((1, 2), (2, 1))
        if self.type is PieceType.KING:
            return max(abs(dr), abs(dc)) == 1
        if self.type is PieceType.ROOK:
            return straight and board.is_path_clear(self.position, to)
        if self.type is PieceType.BISHOP:
            return diagonal and board.is_path_clear(self.position, to)
        if self.type is PieceType.QUEEN:
            return (straight or diagonal) and board.is_path_clear(self.position, to)
        return self._pawn_can_move(board, to, target, dr, dc)

    def _pawn_can_move(self, board: "Board", to: Position, target: Optional["Piece"], dr: int, dc: int) -> bool:
        direction = 1 if self.color is Color.WHITE else -1
        start_row = 1 if self.color is Color.WHITE else 6
        if dc == 0:
            if dr == direction:
                return target is None
            if dr == 2 * direction and self.position.row == start_row:
                return target is None and board.is_path_clear(self.position, to)
            return False
        # diagonal step is only legal as a capture (own color already rejected above)
        return abs(dc) == 1 and dr == direction and target is not None


class Board:
    SIZE = 8

    def __init__(self) -> None:
        self._grid: List[List[Optional[Piece]]] = [[None] * Board.SIZE for _ in range(Board.SIZE)]

    def place(self, piece: Piece) -> None:
        self._grid[piece.position.row][piece.position.col] = piece

    def get(self, pos: Position) -> Optional[Piece]:
        return self._grid[pos.row][pos.col] if pos.is_on_board() else None

    def is_empty(self, pos: Position) -> bool:
        return self.get(pos) is None

    def remove(self, pos: Position) -> Optional[Piece]:
        piece = self.get(pos)
        self._grid[pos.row][pos.col] = None
        return piece

    def move_piece(self, start: Position, end: Position) -> None:
        piece = self.remove(start)
        if piece is None:
            raise ValueError(f"No piece on {start}")
        piece.position = end
        self._grid[end.row][end.col] = piece

    def is_path_clear(self, start: Position, end: Position) -> bool:
        """True when every square strictly between start and end is empty."""
        dr, dc = end.row - start.row, end.col - start.col
        if not (dr == 0 or dc == 0 or abs(dr) == abs(dc)):
            return False
        step_r = (dr > 0) - (dr < 0)
        step_c = (dc > 0) - (dc < 0)
        r, c = start.row + step_r, start.col + step_c
        while (r, c) != (end.row, end.col):
            if self._grid[r][c] is not None:
                return False
            r += step_r
            c += step_c
        return True

    def find_king(self, color: Color) -> Optional[Piece]:
        for piece in self.pieces_of(color):
            if piece.type is PieceType.KING:
                return piece
        return None

    def pieces_of(self, color: Color) -> List[Piece]:
        return [p for row in self._grid for p in row if p is not None and p.color is color]

    def render(self) -> str:
        lines = []
        for row in range(Board.SIZE - 1, -1, -1):
            cells = " ".join(p.symbol() if (p := self._grid[row][col]) else "." for col in range(Board.SIZE))
            lines.append(f"    {row + 1} {cells}")
        lines.append("      a b c d e f g h")
        return "\\n".join(lines)


@dataclass(frozen=True)

class Move:
    from_pos: Position
    to_pos: Position
    piece: Piece
    captured: Optional[Piece] = None

    def describe(self) -> str:
        text = f"{self.piece.label()} {self.from_pos} -> {self.to_pos}"
        if self.captured is not None:
            text += f" x {self.captured.label()}"
        return text


class ChessGame:
    """Facade: callers only use start, move, turn, is_check and print_board."""

    BACK_RANK = [
        PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
        PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK,
    ]

    def __init__(self) -> None:
        self._board = Board()
        self._turn = Color.WHITE
        self._history: List[Move] = []
        self._started = False

    @property
    def board(self) -> Board:
        return self._board

    @property
    def turn(self) -> Color:
        return self._turn

    @property
    def history(self) -> List[Move]:
        return list(self._history)

    def start(self) -> None:
        self._board = Board()
        for col, piece_type in enumerate(ChessGame.BACK_RANK):
            self._board.place(Piece(Color.WHITE, piece_type, Position(0, col)))
            self._board.place(Piece(Color.BLACK, piece_type, Position(7, col)))
        for col in range(Board.SIZE):
            self._board.place(Piece(Color.WHITE, PieceType.PAWN, Position(1, col)))
            self._board.place(Piece(Color.BLACK, PieceType.PAWN, Position(6, col)))
        self._turn = Color.WHITE
        self._history = []
        self._started = True

    def move(self, from_text: str, to_text: str) -> Move:
        if not self._started:
            raise RuntimeError("Call start() before move()")
        start = Position.parse(from_text)
        end = Position.parse(to_text)
        piece = self._board.get(start)
        if piece is None:
            raise ValueError(f"No piece on {start}")
        if piece.color is not self._turn:
            raise ValueError(f"It is {self._turn.name}'s turn, but {start} holds a {piece.label()}")
        if not piece.can_move_to(self._board, end):
            raise ValueError(f"Illegal move: {piece.type.name} cannot go from {start} to {end}")

        # Try the move, then undo it if it leaves our own king attacked.
        captured = self._board.remove(end)
        self._board.move_piece(start, end)
        if self.is_check(self._turn):
            self._board.move_piece(end, start)
            if captured is not None:
                self._board.place(captured)
            raise ValueError(f"Illegal move: {piece.type.name} {start} -> {end} leaves {self._turn.name} king in check")

        move = Move(start, end, piece, captured)
        self._history.append(move)
        self._turn = self._turn.opposite()
        return move

    def is_check(self, color: Color) -> bool:
        king = self._board.find_king(color)
        if king is None:
            return False
        return any(p.can_move_to(self._board, king.position) for p in self._board.pieces_of(color.opposite()))

    def print_board(self) -> None:
        log(self._board.render())


def main() -> None:
    step = 0
    game = ChessGame()

    def banner(title: str) -> None:
        nonlocal step
        step += 1
        log("")
        log(f"=== STEP {step}: {title} ===")

    def counts() -> str:
        return f"WHITE={len(game.board.pieces_of(Color.WHITE))} BLACK={len(game.board.pieces_of(Color.BLACK))}"

    def play(from_sq: str, to_sq: str, illegal_on_purpose: bool = False) -> None:
        mover = game.turn
        suffix = " (illegal attempt)" if illegal_on_purpose else ""
        banner(f"{mover.name} {from_sq} -> {to_sq}{suffix}")
        piece = game.board.get(Position.parse(from_sq))
        log(f"  mover: {mover.name}, piece on {from_sq}: {piece.label() if piece else 'none'}")
        try:
            move = game.move(from_sq, to_sq)
        except ValueError as err:
            log(f"  REJECTED: {err}")
            log(f"  board unchanged, next turn: {game.turn.name}")
            return
        log(f"  from: {move.from_pos}  to: {move.to_pos}")
        log(f"  captured: {move.captured.label() if move.captured else 'none'}")
        opponent = game.turn
        log(f"  check: {opponent.name + ' is in check' if game.is_check(opponent) else 'none'}")
        log(f"  pieces left: {counts()}")
        log(f"  next turn: {game.turn.name}")
        game.print_board()

    banner("Create a game and set up the standard position")
    game.start()
    log(f"  pieces: {counts()}")
    log(f"  next turn: {game.turn.name}")
    game.print_board()

    play("e2", "e4")
    play("e7", "e5")
    play("g1", "f3")
    play("b8", "c6")
    play("a1", "a3", illegal_on_purpose=True)   # rook blocked by its own pawn
    play("g8", "f6", illegal_on_purpose=True)   # black piece on white's turn
    play("f3", "e5")                            # knight captures pawn
    play("c6", "e5")                            # knight recaptures
    play("d1", "h5")
    play("d7", "d6")
    play("h5", "f7")                            # queen captures pawn with check
    play("a7", "a6", illegal_on_purpose=True)   # ignores the check
    play("e5", "f7")                            # knight captures the queen

    banner("Game summary")
    log(f"  moves played: {len(game.history)}")
    for i, move in enumerate(game.history, start=1):
        log(f"  {i:>2}. {move.describe()}")
    log(f"  final: {counts()}, next turn: {game.turn.name}")
    log(f"  WHITE in check: {game.is_check(Color.WHITE)}, BLACK in check: {game.is_check(Color.BLACK)}")


if __name__ == "__main__":
    main()`

/* ────────────────────────────── JAVA ────────────────────────────── */

const java = `import java.util.ArrayList;
import java.util.List;

enum Color {
    WHITE, BLACK;

    Color opposite() {
        return this == WHITE ? BLACK : WHITE;
    }
}

enum PieceType { KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN }

/** row 0 is rank 1 (white side), col 0 is file a. */
record Position(int row, int col) {
    static Position parse(String text) {
        if (text.length() {
          != 2 || text.charAt(0) < 'a' || text.charAt(0) > 'h'
        }
                || text.charAt(1) < '1' || text.charAt(1) > '8') {
            throw new IllegalArgumentException("Bad square '" + text + "', expected a1..h8");
        }

        return new Position(text.charAt(1) - '1', text.charAt(0) - 'a');
    }

    boolean isOnBoard() {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    @Override
    public String toString() {
        return "" + (char) ('a' + col) + (row + 1);
    }
}

class Piece {
    final Color color;
    final PieceType type;
    Position position;

    Piece(Color color, PieceType type, Position position) {
        this.color = color;
        this.type = type;
        this.position = position;
    }

    String symbol() {
        String letter = switch (type) {
            case KING -> "K";
            case QUEEN -> "Q";
            case ROOK -> "R";
            case BISHOP -> "B";
            case KNIGHT -> "N";
            case PAWN -> "P";
        };
        return color == Color.WHITE ? letter : letter.toLowerCase();
    }

    String label() {
        return color + " " + type;
    }

    /** Basic movement only: no castling, en passant or promotion. */
    boolean canMoveTo(Board board, Position to) {
        if (to.equals(position) || !to.isOnBoard()) {
          return false;
        }
        Piece target = board.get(to);
        if (target != null && target.color == color) {
          return false;
        }

        int dr = to.row() - position.row();
        int dc = to.col() - position.col();
        boolean straight = dr == 0 || dc == 0;
        boolean diagonal = Math.abs(dr) == Math.abs(dc);

        return switch (type) {
            case KNIGHT -> (Math.abs(dr) == 1 && Math.abs(dc) == 2) || (Math.abs(dr) == 2 && Math.abs(dc) == 1);
            case KING -> Math.max(Math.abs(dr), Math.abs(dc)) == 1;
            case ROOK -> straight && board.isPathClear(position, to);
            case BISHOP -> diagonal && board.isPathClear(position, to);
            case QUEEN -> (straight || diagonal) && board.isPathClear(position, to);
            case PAWN -> pawnCanMove(board, to, target, dr, dc);
        };
    }

    private boolean pawnCanMove(Board board, Position to, Piece target, int dr, int dc) {
        int direction = color == Color.WHITE ? 1 : -1;
        int startRow = color == Color.WHITE ? 1 : 6;
        if (dc == 0) {
            if (dr == direction) {
              return target == null;
            }
            if (dr == 2 * direction && position.row() {
              == startRow) {
            }
                return target == null && board.isPathClear(position, to);
            }
            return false;
        }
        // diagonal step is only legal as a capture (own color already rejected above)
        return Math.abs(dc) == 1 && dr == direction && target != null;
    }
}

class Board {
    static final int SIZE = 8;
    private final Piece[][] grid = new Piece[SIZE][SIZE];

    void place(Piece piece) {
        grid[piece.position.row()][piece.position.col()] = piece;
    }

    Piece get(Position pos) {
        return pos.isOnBoard() ? grid[pos.row()][pos.col()] : null;
    }

    boolean isEmpty(Position pos) {
        return get(pos) == null;
    }

    Piece remove(Position pos) {
        Piece piece = get(pos);
        grid[pos.row()][pos.col()] = null;
        return piece;
    }

    void movePiece(Position start, Position end) {
        Piece piece = remove(start);
        if (piece == null) {
          throw new IllegalArgumentException("No piece on " + start);
        }
        piece.position = end;
        grid[end.row()][end.col()] = piece;
    }

    /** True when every square strictly between start and end is empty. */
    boolean isPathClear(Position start, Position end) {
        int dr = end.row() - start.row();
        int dc = end.col() - start.col();
        if (!(dr == 0 || dc == 0 || Math.abs(dr) {
          == Math.abs(dc))) return false;
        }

        int stepR = Integer.signum(dr);
        int stepC = Integer.signum(dc);
        int r = start.row() + stepR;
        int c = start.col() + stepC;
        while (r != end.row() || c != end.col()) {) {
          if (grid[r][c] != null) {
        }
              return false;
            }
            r += stepR;
            c += stepC;
        }
        return true;
    }

    Piece findKing(Color color) {
        for (Piece piece : piecesOf(color)) {
            if (piece.type == PieceType.KING) {
              return piece;
            }
        }
        return null;
    }

    List<Piece> piecesOf(Color color) {
        List<Piece> result = new ArrayList<>();
        for (Piece[] row : grid) {
            for (Piece piece : row) {
                if (piece != null && piece.color == color) {
                  result.add(piece);
                }
            }
        }
        return result;
    }

    String render() {
        StringBuilder sb = new StringBuilder();
        for (int row = SIZE - 1; row >= 0; row--) {
            sb.append("    ").append(row + 1);
            for (int col = 0; col < SIZE; col++) {
                Piece piece = grid[row][col];
                sb.append(' ').append(piece == null ? "." : piece.symbol());
            }
            sb.append('\\n');
        }
        sb.append("      a b c d e f g h");
        return sb.toString();
    }
}

record Move(Position from, Position to, Piece piece, Piece captured) {
    String describe() {
        String text = piece.label() + " " + from + " -> " + to;
        if (captured != null) {
          text += " x " + captured.label();
        }
        return text;
    }
}

/** Facade: callers only use start, move, turn, isCheck and printBoard. */

class ChessGame {
    private static final PieceType[] BACK_RANK = {
        PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
        PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK,
    };

    private Board board = new Board();
    private Color turn = Color.WHITE;
    private List<Move> history = new ArrayList<>();
    private boolean started = false;

    Board board() {
      return board;
    }

    Color turn() {
      return turn;
    }

    List<Move> history() {
      return List.copyOf(history);
    }

    void start() {
        board = new Board();
        for (int col = 0; col < Board.SIZE; col++) {
            board.place(new Piece(Color.WHITE, BACK_RANK[col], new Position(0, col)));
            board.place(new Piece(Color.BLACK, BACK_RANK[col], new Position(7, col)));
            board.place(new Piece(Color.WHITE, PieceType.PAWN, new Position(1, col)));
            board.place(new Piece(Color.BLACK, PieceType.PAWN, new Position(6, col)));
        }
        turn = Color.WHITE;
        history = new ArrayList<>();
        started = true;
    }

    Move move(String fromText, String toText) {
        if (!started) {
          throw new IllegalStateException("Call start() before move()");
        }
        Position start = Position.parse(fromText);
        Position end = Position.parse(toText);
        Piece piece = board.get(start);
        if (piece == null) {
          throw new IllegalArgumentException("No piece on " + start);
        }
        if (piece.color != turn) {
            throw new IllegalArgumentException("It is " + turn + "'s turn, but " + start + " holds a " + piece.label());
        }
        if (!piece.canMoveTo(board, end)) {
            throw new IllegalArgumentException("Illegal move: " + piece.type + " cannot go from " + start + " to " + end);
        }

        // Try the move, then undo it if it leaves our own king attacked.
        Piece captured = board.remove(end);
        board.movePiece(start, end);
        if (isCheck(turn)) {
            board.movePiece(end, start);
            if (captured != null) {
              board.place(captured);
            }

            throw new IllegalArgumentException(
                "Illegal move: " + piece.type + " " + start + " -> " + end + " leaves " + turn + " king in check");
        }

        Move move = new Move(start, end, piece, captured);
        history.add(move);
        turn = turn.opposite();
        return move;
    }

    boolean isCheck(Color color) {
        Piece king = board.findKing(color);
        if (king == null) {
          return false;
        }
        for (Piece attacker : board.piecesOf(color.opposite())) {
            if (attacker.canMoveTo(board, king.position)) {
              return true;
            }
        }
        return false;
    }

    void printBoard() {
        System.out.println(board.render());
    }
}

public class Main {
    private static int step = 0;
    private static final ChessGame game = new ChessGame();

    private static void log(String message) {
        System.out.println(message);
    }

    private static void banner(String title) {
        step++;
        log("");
        log("=== STEP " + step + ": " + title + " ===");
    }

    private static String counts() {
        return "WHITE=" + game.board().piecesOf(Color.WHITE).size()
            + " BLACK=" + game.board().piecesOf(Color.BLACK).size();
    }

    private static void play(String fromSq, String toSq, boolean illegalOnPurpose) {
        Color mover = game.turn();
        String suffix = illegalOnPurpose ? " (illegal attempt)" : "";
        banner(mover + " " + fromSq + " -> " + toSq + suffix);
        Piece piece = game.board().get(Position.parse(fromSq));
        log("  mover: " + mover + ", piece on " + fromSq + ": " + (piece != null ? piece.label() : "none"));
        Move move;
        try {
            move = game.move(fromSq, toSq);
        } catch (IllegalArgumentException err) {
            log("  REJECTED: " + err.getMessage());
            log("  board unchanged, next turn: " + game.turn());
            return;
        }
        log("  from: " + move.from() + "  to: " + move.to());
        log("  captured: " + (move.captured() != null ? move.captured().label() : "none"));
        Color opponent = game.turn();
        log("  check: " + (game.isCheck(opponent) ? opponent + " is in check" : "none"));
        log("  pieces left: " + counts());
        log("  next turn: " + game.turn());
        game.printBoard();
    }

    private static void play(String fromSq, String toSq) {
        play(fromSq, toSq, false);
    }

    public static void main(String[] args) {
        banner("Create a game and set up the standard position");
        game.start();
        log("  pieces: " + counts());
        log("  next turn: " + game.turn());
        game.printBoard();

        play("e2", "e4");
        play("e7", "e5");
        play("g1", "f3");
        play("b8", "c6");
        play("a1", "a3", true);   // rook blocked by its own pawn
        play("g8", "f6", true);   // black piece on white's turn
        play("f3", "e5");         // knight captures pawn
        play("c6", "e5");         // knight recaptures
        play("d1", "h5");
        play("d7", "d6");
        play("h5", "f7");         // queen captures pawn with check
        play("a7", "a6", true);   // ignores the check
        play("e5", "f7");         // knight captures the queen

        banner("Game summary");
        List<Move> moves = game.history();
        log("  moves played: " + moves.size());
        for (int i = 0; i < moves.size(); i++) {
            log(String.format("  %2d. %s", i + 1, moves.get(i).describe()));
        }
        log("  final: " + counts() + ", next turn: " + game.turn());
        log("  WHITE in check: " + game.isCheck(Color.WHITE) + ", BLACK in check: " + game.isCheck(Color.BLACK));
    }
}`

/* ────────────────────────────── TYPESCRIPT ────────────────────────────── */

const ts = `function log(message = ''): void {
  console.log(message)
}

enum Color {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
}

function opposite(color: Color): Color {
  return color === Color.WHITE ? Color.BLACK : Color.WHITE
}

enum PieceType {
  KING = 'KING',
  QUEEN = 'QUEEN',
  ROOK = 'ROOK',
  BISHOP = 'BISHOP',
  KNIGHT = 'KNIGHT',
  PAWN = 'PAWN',
}

/** row 0 is rank 1 (white side), col 0 is file a. */

class Position {
  constructor(readonly row: number, readonly col: number) {}

  static parse(text: string): Position {
    if (!/^[a-h][1-8]$/.test(text)) {
      throw new Error("Bad square '" + text + "', expected a1..h8")
    }

    return new Position(Number(text[1]) - 1, text.charCodeAt(0) - 'a'.charCodeAt(0))
  }

  isOnBoard(): boolean {
    return this.row >= 0 && this.row < 8 && this.col >= 0 && this.col < 8
  }

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col
  }

  toString(): string {
    return String.fromCharCode('a'.charCodeAt(0) + this.col) + (this.row + 1)
  }
}

const SYMBOLS: Record<PieceType, string> = {
  [PieceType.KING]: 'K',
  [PieceType.QUEEN]: 'Q',
  [PieceType.ROOK]: 'R',
  [PieceType.BISHOP]: 'B',
  [PieceType.KNIGHT]: 'N',
  [PieceType.PAWN]: 'P',
}

class Piece {
  constructor(
    readonly color: Color,
    readonly type: PieceType,
    public position: Position,
  ) {}

  symbol(): string {
    const letter = SYMBOLS[this.type]
    return this.color === Color.WHITE ? letter : letter.toLowerCase()
  }

  label(): string {
    return this.color + ' ' + this.type
  }

  /** Basic movement only: no castling, en passant or promotion. */
  canMoveTo(board: Board, to: Position): boolean {
    if (to.equals(this.position) || !to.isOnBoard()) {
      return false
    }
    const target = board.get(to)
    if (target !== null && target.color === this.color) {
      return false
    }
    const dr = to.row - this.position.row
    const dc = to.col - this.position.col
    const straight = dr === 0 || dc === 0
    const diagonal = Math.abs(dr) === Math.abs(dc)

    switch (this.type) {
      case PieceType.KNIGHT:
        return (Math.abs(dr) === 1 && Math.abs(dc) === 2) || (Math.abs(dr) === 2 && Math.abs(dc) === 1)
      case PieceType.KING:
        return Math.max(Math.abs(dr), Math.abs(dc)) === 1
      case PieceType.ROOK:
        return straight && board.isPathClear(this.position, to)
      case PieceType.BISHOP:
        return diagonal && board.isPathClear(this.position, to)
      case PieceType.QUEEN:
        return (straight || diagonal) && board.isPathClear(this.position, to)
      case PieceType.PAWN:
        return this.pawnCanMove(board, to, target, dr, dc)
    }
  }

  private pawnCanMove(board: Board, to: Position, target: Piece | null, dr: number, dc: number): boolean {
    const direction = this.color === Color.WHITE ? 1 : -1
    const startRow = this.color === Color.WHITE ? 1 : 6
    if (dc === 0) {
      if (dr === direction) {
        return target === null
      }

      if (dr === 2 * direction && this.position.row === startRow) {
        return target === null && board.isPathClear(this.position, to)
      }
      return false
    }
    // diagonal step is only legal as a capture (own color already rejected above)
    return Math.abs(dc) === 1 && dr === direction && target !== null
  }
}

class Board {
  static readonly SIZE = 8
  private readonly grid: (Piece | null)[][] = Array.from({ length: Board.SIZE }, () =>
    Array<Piece | null>(Board.SIZE).fill(null),
  )

  place(piece: Piece): void {
    this.grid[piece.position.row][piece.position.col] = piece
  }

  get(pos: Position): Piece | null {
    return pos.isOnBoard() ? this.grid[pos.row][pos.col] : null
  }

  isEmpty(pos: Position): boolean {
    return this.get(pos) === null
  }

  remove(pos: Position): Piece | null {
    const piece = this.get(pos)
    this.grid[pos.row][pos.col] = null
    return piece
  }

  movePiece(start: Position, end: Position): void {
    const piece = this.remove(start)
    if (piece === null) {
      throw new Error('No piece on ' + start)
    }
    piece.position = end
    this.grid[end.row][end.col] = piece
  }

  /** True when every square strictly between start and end is empty. */
  isPathClear(start: Position, end: Position): boolean {
    const dr = end.row - start.row
    const dc = end.col - start.col
    if (!(dr === 0 || dc === 0 || Math.abs(dr) {
      === Math.abs(dc))) return false
    }
    const stepR = Math.sign(dr)
    const stepC = Math.sign(dc)
    let r = start.row + stepR
    let c = start.col + stepC
    while (r !== end.row || c !== end.col) {
      if (this.grid[r][c] !== null) {
        return false
      }
      r += stepR
      c += stepC
    }
    return true
  }

  findKing(color: Color): Piece | null {
    return this.piecesOf(color).find(p => p.type === PieceType.KING) ?? null
  }

  piecesOf(color: Color): Piece[] {
    return this.grid.flat().filter((p): p is Piece => p !== null && p.color === color)
  }

  render(): string {
    const lines: string[] = []
    for (let row = Board.SIZE - 1; row >= 0; row--) {
      const cells = this.grid[row].map(p => (p === null ? '.' : p.symbol())).join(' ')
      lines.push('    ' + (row + 1) + ' ' + cells)
    }
    lines.push('      a b c d e f g h')
    return lines.join('\\n')
  }
}

class Move {
  constructor(
    readonly from: Position,
    readonly to: Position,
    readonly piece: Piece,
    readonly captured: Piece | null,
  ) {}

  describe(): string {
    let text = this.piece.label() + ' ' + this.from + ' -> ' + this.to
    if (this.captured !== null) {
      text += ' x ' + this.captured.label()
    }
    return text
  }
}

/** Facade: callers only use start, move, turn, isCheck and printBoard. */

class ChessGame {
  private static readonly BACK_RANK: PieceType[] = [
    PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
    PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK,
  ]

  private _board = new Board()
  private _turn = Color.WHITE
  private _history: Move[] = []
  private started = false

  get board(): Board {
    return this._board
  }

  get turn(): Color {
    return this._turn
  }

  get history(): Move[] {
    return [...this._history]
  }

  start(): void {
    this._board = new Board()
    for (let col = 0; col < Board.SIZE; col++) {
      this._board.place(new Piece(Color.WHITE, ChessGame.BACK_RANK[col], new Position(0, col)))
      this._board.place(new Piece(Color.BLACK, ChessGame.BACK_RANK[col], new Position(7, col)))
      this._board.place(new Piece(Color.WHITE, PieceType.PAWN, new Position(1, col)))
      this._board.place(new Piece(Color.BLACK, PieceType.PAWN, new Position(6, col)))
    }
    this._turn = Color.WHITE
    this._history = []
    this.started = true
  }

  move(fromText: string, toText: string): Move {
    if (!this.started) {
      throw new Error('Call start() before move()')
    }
    const start = Position.parse(fromText)
    const end = Position.parse(toText)
    const piece = this._board.get(start)
    if (piece === null) {
      throw new Error('No piece on ' + start)
    }

    if (piece.color !== this._turn) {
      throw new Error('It is ' + this._turn + "'s turn, but " + start + ' holds a ' + piece.label())
    }

    if (!piece.canMoveTo(this._board, end)) {
      throw new Error('Illegal move: ' + piece.type + ' cannot go from ' + start + ' to ' + end)
    }

    // Try the move, then undo it if it leaves our own king attacked.
    const captured = this._board.remove(end)
    this._board.movePiece(start, end)
    if (this.isCheck(this._turn)) {
      this._board.movePiece(end, start)
      if (captured !== null) {
        this._board.place(captured)
      }

      throw new Error('Illegal move: ' + piece.type + ' ' + start + ' -> ' + end + ' leaves ' + this._turn + ' king in check')
    }

    const move = new Move(start, end, piece, captured)
    this._history.push(move)
    this._turn = opposite(this._turn)
    return move
  }

  isCheck(color: Color): boolean {
    const king = this._board.findKing(color)
    if (king === null) {
      return false
    }
    return this._board.piecesOf(opposite(color)).some(p => p.canMoveTo(this._board, king.position))
  }

  printBoard(): void {
    log(this._board.render())
  }
}

function main(): void {
  let step = 0
  const game = new ChessGame()

  const banner = (title: string): void => {
    step += 1
    log('')
    log('=== STEP ' + step + ': ' + title + ' ===')
  }

  const counts = (): string =>
    'WHITE=' + game.board.piecesOf(Color.WHITE).length + ' BLACK=' + game.board.piecesOf(Color.BLACK).length

  const play = (fromSq: string, toSq: string, illegalOnPurpose = false): void => {
    const mover = game.turn
    const suffix = illegalOnPurpose ? ' (illegal attempt)' : ''
    banner(mover + ' ' + fromSq + ' -> ' + toSq + suffix)
    const piece = game.board.get(Position.parse(fromSq))
    log('  mover: ' + mover + ', piece on ' + fromSq + ': ' + (piece ? piece.label() : 'none'))
    let move: Move
    try {
      move = game.move(fromSq, toSq)
    } catch (err) {
      log('  REJECTED: ' + (err as Error).message)
      log('  board unchanged, next turn: ' + game.turn)
      return
    }

    log('  from: ' + move.from + '  to: ' + move.to)
    log('  captured: ' + (move.captured ? move.captured.label() : 'none'))
    const opponent = game.turn
    log('  check: ' + (game.isCheck(opponent) ? opponent + ' is in check' : 'none'))
    log('  pieces left: ' + counts())
    log('  next turn: ' + game.turn)
    game.printBoard()
  }

  banner('Create a game and set up the standard position')
  game.start()
  log('  pieces: ' + counts())
  log('  next turn: ' + game.turn)
  game.printBoard()

  play('e2', 'e4')
  play('e7', 'e5')
  play('g1', 'f3')
  play('b8', 'c6')
  play('a1', 'a3', true)   // rook blocked by its own pawn
  play('g8', 'f6', true)   // black piece on white's turn
  play('f3', 'e5')         // knight captures pawn
  play('c6', 'e5')         // knight recaptures
  play('d1', 'h5')
  play('d7', 'd6')
  play('h5', 'f7')         // queen captures pawn with check
  play('a7', 'a6', true)   // ignores the check
  play('e5', 'f7')         // knight captures the queen

  banner('Game summary')
  const moves = game.history
  log('  moves played: ' + moves.length)
  moves.forEach((m, i) => log('  ' + String(i + 1).padStart(2, ' ') + '. ' + m.describe()))
  log('  final: ' + counts() + ', next turn: ' + game.turn)
  log('  WHITE in check: ' + game.isCheck(Color.WHITE) + ', BLACK in check: ' + game.isCheck(Color.BLACK))
}

main()`

/* ────────────────────────────── C++ ────────────────────────────── */

const cpp = `#include <bits/stdc++.h>
using namespace std;

void logLine(const string& message = "") {
    cout << message << "\\n";
}

enum class Color { WHITE, BLACK };

enum class PieceType { KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN };

string toString(Color color) {
    return color == Color::WHITE ? "WHITE" : "BLACK";
}

Color opposite(Color color) {
    return color == Color::WHITE ? Color::BLACK : Color::WHITE;
}

string toString(PieceType type) {
    switch (type) {
        case PieceType::KING:   return "KING";
        case PieceType::QUEEN:  return "QUEEN";
        case PieceType::ROOK:   return "ROOK";
        case PieceType::BISHOP: return "BISHOP";
        case PieceType::KNIGHT: return "KNIGHT";
        case PieceType::PAWN:   return "PAWN";
    }
    return "?";
}

// row 0 is rank 1 (white side), col 0 is file a.

struct Position {
    int row;
    int col;

    static Position parse(const string& text) {
        if (text.size() {
          != 2 || text[0] < 'a' || text[0] > 'h' || text[1] < '1' || text[1] > '8') {
        }

            throw invalid_argument("Bad square '" + text + "', expected a1..h8");
        }
        return Position{text[1] - '1', text[0] - 'a'};
    }

    bool isOnBoard() const {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    bool operator==(const Position& other) const {
        return row == other.row && col == other.col;
    }

    string toString() const {
        string text;
        text += static_cast<char>('a' + col);
        text += to_string(row + 1);
        return text;
    }
};

class Board;

class Piece {
public:
    Piece(Color color, PieceType type, Position position)
        : color_(color), type_(type), position_(position) {}

    Color color() const {
      return color_;
    }

    PieceType type() const {
      return type_;
    }

    Position position() const {
      return position_;
    }

    void setPosition(Position position) {
      position_ = position;
    }

    string symbol() const {
        string letter;
        switch (type_) {
            case PieceType::KING:   letter = "K"; break;
            case PieceType::QUEEN:  letter = "Q"; break;
            case PieceType::ROOK:   letter = "R"; break;
            case PieceType::BISHOP: letter = "B"; break;
            case PieceType::KNIGHT: letter = "N"; break;
            case PieceType::PAWN:   letter = "P"; break;
        }
        if (color_ == Color::BLACK) {
          letter[0] = static_cast<char>(tolower(letter[0]));
        }
        return letter;
    }

    string label() const {
        return toString(color_) + " " + toString(type_);
    }

    // Basic movement only: no castling, en passant or promotion.
    bool canMoveTo(const Board& board, Position to) const;

private:
    bool pawnCanMove(const Board& board, Position to, bool hasTarget, int dr, int dc) const;

    Color color_;
    PieceType type_;
    Position position_;
};

using PiecePtr = shared_ptr<Piece>;

class Board {
public:
    static const int SIZE = 8;

    void place(const PiecePtr& piece) {
        Position pos = piece->position();
        grid_[pos.row][pos.col] = piece;
    }

    PiecePtr get(Position pos) const {
        return pos.isOnBoard() ? grid_[pos.row][pos.col] : nullptr;
    }

    bool isEmpty(Position pos) const {
        return get(pos) == nullptr;
    }

    PiecePtr remove(Position pos) {
        PiecePtr piece = get(pos);
        grid_[pos.row][pos.col] = nullptr;
        return piece;
    }

    void movePiece(Position start, Position end) {
        PiecePtr piece = remove(start);
        if (!piece) {
          throw invalid_argument("No piece on " + start.toString());
        }
        piece->setPosition(end);
        grid_[end.row][end.col] = piece;
    }

    // True when every square strictly between start and end is empty.
    bool isPathClear(Position start, Position end) const {
        int dr = end.row - start.row;
        int dc = end.col - start.col;
        if (!(dr == 0 || dc == 0 || abs(dr) {
          == abs(dc))) return false;
        }

        int stepR = (dr > 0) - (dr < 0);
        int stepC = (dc > 0) - (dc < 0);
        int r = start.row + stepR;
        int c = start.col + stepC;
        while (r != end.row || c != end.col) {
            if (grid_[r][c] != nullptr) {
              return false;
            }
            r += stepR;
            c += stepC;
        }
        return true;
    }

    PiecePtr findKing(Color color) const {
        for (const PiecePtr& piece : piecesOf(color)) {
            if (piece->type() {
              == PieceType::KING) return piece;
            }
        }
        return nullptr;
    }

    vector<PiecePtr> piecesOf(Color color) const {
        vector<PiecePtr> result;
        for (int row = 0; row < SIZE; row++) {
            for (int col = 0; col < SIZE; col++) {
                const PiecePtr& piece = grid_[row][col];
                if (piece && piece->color() {
                  == color) result.push_back(piece);
                }
            }
        }
        return result;
    }

    string render() const {
        string out;
        for (int row = SIZE - 1; row >= 0; row--) {
            out += "    " + to_string(row + 1);
            for (int col = 0; col < SIZE; col++) {
                out += " ";
                out += grid_[row][col] ? grid_[row][col]->symbol() : ".";
            }
            out += "\\n";
        }
        out += "      a b c d e f g h";
        return out;
    }

private:
    array<array<PiecePtr, SIZE>, SIZE> grid_{};
};

bool Piece::canMoveTo(const Board& board, Position to) const {
    if (to == position_ || !to.isOnBoard()) {
      return false;
    }
    PiecePtr target = board.get(to);
    if (target && target->color() {
      == color_) return false;
    }
    int dr = to.row - position_.row;
    int dc = to.col - position_.col;
    bool straight = dr == 0 || dc == 0;
    bool diagonal = abs(dr) == abs(dc);

    switch (type_) {
        case PieceType::KNIGHT:
            return (abs(dr) == 1 && abs(dc) == 2) || (abs(dr) == 2 && abs(dc) == 1);
        case PieceType::KING:
            return max(abs(dr), abs(dc)) == 1;
        case PieceType::ROOK:
            return straight && board.isPathClear(position_, to);
        case PieceType::BISHOP:
            return diagonal && board.isPathClear(position_, to);
        case PieceType::QUEEN:
            return (straight || diagonal) && board.isPathClear(position_, to);
        case PieceType::PAWN:
            return pawnCanMove(board, to, target != nullptr, dr, dc);
    }
    return false;
}

bool Piece::pawnCanMove(const Board& board, Position to, bool hasTarget, int dr, int dc) const {
    int direction = color_ == Color::WHITE ? 1 : -1;
    int startRow = color_ == Color::WHITE ? 1 : 6;
    if (dc == 0) {
        if (dr == direction) {
          return !hasTarget;
        }
        if (dr == 2 * direction && position_.row == startRow) {
            return !hasTarget && board.isPathClear(position_, to);
        }
        return false;
    }
    // diagonal step is only legal as a capture (own color already rejected above)
    return abs(dc) == 1 && dr == direction && hasTarget;
}

struct Move {
    Position from;
    Position to;
    PiecePtr piece;
    PiecePtr captured;  // null when nothing was taken

    string describe() const {
        string text = piece->label() + " " + from.toString() + " -> " + to.toString();
        if (captured) {
          text += " x " + captured->label();
        }
        return text;
    }
};

// Facade: callers only use start, move, turn, isCheck and printBoard.

class ChessGame {
public:
    const Board& board() const {
      return board_;
    }

    Color turn() const {
      return turn_;
    }

    const vector<Move>& history() const {
      return history_;
    }

    void start() {
        board_ = Board();
        const PieceType backRank[8] = {
            PieceType::ROOK, PieceType::KNIGHT, PieceType::BISHOP, PieceType::QUEEN,
            PieceType::KING, PieceType::BISHOP, PieceType::KNIGHT, PieceType::ROOK,
        };
        for (int col = 0; col < Board::SIZE; col++) {
            board_.place(make_shared<Piece>(Color::WHITE, backRank[col], Position{0, col}));
            board_.place(make_shared<Piece>(Color::BLACK, backRank[col], Position{7, col}));
            board_.place(make_shared<Piece>(Color::WHITE, PieceType::PAWN, Position{1, col}));
            board_.place(make_shared<Piece>(Color::BLACK, PieceType::PAWN, Position{6, col}));
        }
        turn_ = Color::WHITE;
        history_.clear();
        started_ = true;
    }

    Move move(const string& fromText, const string& toText) {
        if (!started_) {
          throw logic_error("Call start() before move()");
        }
        Position start = Position::parse(fromText);
        Position end = Position::parse(toText);
        PiecePtr piece = board_.get(start);
        if (!piece) {
          throw invalid_argument("No piece on " + start.toString());
        }
        if (piece->color() {
          != turn_) {
        }

            throw invalid_argument("It is " + toString(turn_) + "'s turn, but " + start.toString()
                                   + " holds a " + piece->label());
        }
        if (!piece->canMoveTo(board_, end)) {
            throw invalid_argument("Illegal move: " + toString(piece->type()) + " cannot go from "
                                   + start.toString() + " to " + end.toString());
        }

        // Try the move, then undo it if it leaves our own king attacked.
        PiecePtr captured = board_.remove(end);
        board_.movePiece(start, end);
        if (isCheck(turn_)) {
            board_.movePiece(end, start);
            if (captured) {
              board_.place(captured);
            }

            throw invalid_argument("Illegal move: " + toString(piece->type()) + " " + start.toString()
                                   + " -> " + end.toString() + " leaves " + toString(turn_) + " king in check");
        }

        Move result{start, end, piece, captured};
        history_.push_back(result);
        turn_ = opposite(turn_);
        return result;
    }

    bool isCheck(Color color) const {
        PiecePtr king = board_.findKing(color);
        if (!king) {
          return false;
        }
        for (const PiecePtr& attacker : board_.piecesOf(opposite(color))) {
            if (attacker->canMoveTo(board_, king->position())) {
              return true;
            }
        }
        return false;
    }

    void printBoard() const {
        logLine(board_.render());
    }

private:
    Board board_;
    Color turn_ = Color::WHITE;
    vector<Move> history_;
    bool started_ = false;
};

int step = 0;

void banner(const string& title) {
    step++;
    logLine();
    logLine("=== STEP " + to_string(step) + ": " + title + " ===");
}

string counts(const ChessGame& game) {
    return "WHITE=" + to_string(game.board().piecesOf(Color::WHITE).size())
         + " BLACK=" + to_string(game.board().piecesOf(Color::BLACK).size());
}

void play(ChessGame& game, const string& fromSq, const string& toSq, bool illegalOnPurpose = false) {
    Color mover = game.turn();
    string suffix = illegalOnPurpose ? " (illegal attempt)" : "";
    banner(toString(mover) + " " + fromSq + " -> " + toSq + suffix);
    PiecePtr piece = game.board().get(Position::parse(fromSq));
    logLine("  mover: " + toString(mover) + ", piece on " + fromSq + ": " + (piece ? piece->label() : "none"));
    try {
        Move move = game.move(fromSq, toSq);
        logLine("  from: " + move.from.toString() + "  to: " + move.to.toString());
        logLine("  captured: " + (move.captured ? move.captured->label() : string("none")));
        Color opponent = game.turn();
        logLine("  check: " + (game.isCheck(opponent) ? toString(opponent) + " is in check" : string("none")));
        logLine("  pieces left: " + counts(game));
        logLine("  next turn: " + toString(game.turn()));
        game.printBoard();
    } catch (const invalid_argument& err) {
        logLine(string("  REJECTED: ") + err.what());
        logLine("  board unchanged, next turn: " + toString(game.turn()));
    }
}

int main() {
    ChessGame game;

    banner("Create a game and set up the standard position");
    game.start();
    logLine("  pieces: " + counts(game));
    logLine("  next turn: " + toString(game.turn()));
    game.printBoard();

    play(game, "e2", "e4");
    play(game, "e7", "e5");
    play(game, "g1", "f3");
    play(game, "b8", "c6");
    play(game, "a1", "a3", true);   // rook blocked by its own pawn
    play(game, "g8", "f6", true);   // black piece on white's turn
    play(game, "f3", "e5");         // knight captures pawn
    play(game, "c6", "e5");         // knight recaptures
    play(game, "d1", "h5");
    play(game, "d7", "d6");
    play(game, "h5", "f7");         // queen captures pawn with check
    play(game, "a7", "a6", true);   // ignores the check
    play(game, "e5", "f7");         // knight captures the queen

    banner("Game summary");
    const vector<Move>& moves = game.history();
    logLine("  moves played: " + to_string(moves.size()));
    for (size_t i = 0; i < moves.size(); i++) {
        string number = to_string(i + 1);
        if (number.size() {
          < 2) number = " " + number;
        }
        logLine("  " + number + ". " + moves[i].describe());
    }
    logLine("  final: " + counts(game) + ", next turn: " + toString(game.turn()));
    logLine(string("  WHITE in check: ") + (game.isCheck(Color::WHITE) ? "true" : "false")
            + ", BLACK in check: " + (game.isCheck(Color::BLACK) ? "true" : "false"));
    return 0;
}`

/* ────────────────────────────── GO ────────────────────────────── */

const goCode = `package main

import (
	"errors"
	"fmt"
	"strings"
)

func logLine(message string) {
	fmt.Println(message)
}

type Color int

const (
	White Color = iota
	Black
)

func (c Color) String() string {
	if c == White {
		return "WHITE"
	}
	return "BLACK"
}

func (c Color) Opposite() Color {
	if c == White {
		return Black
	}
	return White
}

type PieceType int

const (
	King PieceType = iota
	Queen
	Rook
	Bishop
	Knight
	Pawn
)

func (t PieceType) String() string {
	return [...]string{"KING", "QUEEN", "ROOK", "BISHOP", "KNIGHT", "PAWN"}[t]
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func sign(x int) int {
	switch {
	case x > 0:
		return 1
	case x < 0:
		return -1
	}
	return 0
}

// Position: Row 0 is rank 1 (white side), Col 0 is file a.

type Position struct {
	Row int
	Col int
}

func ParsePosition(text string) (Position, error) {
	if len(text) != 2 || text[0] < 'a' || text[0] > 'h' || text[1] < '1' || text[1] > '8' {
		return Position{}, fmt.Errorf("Bad square '%s', expected a1..h8", text)
	}
	return Position{Row: int(text[1] - '1'), Col: int(text[0] - 'a')}, nil
}

func (p Position) IsOnBoard() bool {
	return p.Row >= 0 && p.Row < 8 && p.Col >= 0 && p.Col < 8
}

func (p Position) String() string {
	return fmt.Sprintf("%c%d", 'a'+p.Col, p.Row+1)
}

type Piece struct {
	Color    Color
	Type     PieceType
	Position Position
}

func (p *Piece) Symbol() string {
	letter := [...]string{"K", "Q", "R", "B", "N", "P"}[p.Type]
	if p.Color == Black {
		return strings.ToLower(letter)
	}
	return letter
}

func (p *Piece) Label() string {
	return fmt.Sprintf("%s %s", p.Color, p.Type)
}

// CanMoveTo applies basic movement only: no castling, en passant or promotion.
func (p *Piece) CanMoveTo(board *Board, to Position) bool {
	if to == p.Position || !to.IsOnBoard() {
		return false
	}
	target := board.Get(to)
	if target != nil && target.Color == p.Color {
		return false
	}
	dr := to.Row - p.Position.Row
	dc := to.Col - p.Position.Col
	straight := dr == 0 || dc == 0
	diagonal := abs(dr) == abs(dc)

	switch p.Type {
	case Knight:
		return (abs(dr) == 1 && abs(dc) == 2) || (abs(dr) == 2 && abs(dc) == 1)
	case King:
		return maxInt(abs(dr), abs(dc)) == 1
	case Rook:
		return straight && board.IsPathClear(p.Position, to)
	case Bishop:
		return diagonal && board.IsPathClear(p.Position, to)
	case Queen:
		return (straight || diagonal) && board.IsPathClear(p.Position, to)
	case Pawn:
		return p.pawnCanMove(board, to, target != nil, dr, dc)
	}
	return false
}

func (p *Piece) pawnCanMove(board *Board, to Position, hasTarget bool, dr, dc int) bool {
	direction, startRow := 1, 1
	if p.Color == Black {
		direction, startRow = -1, 6
	}
	if dc == 0 {
		if dr == direction {
			return !hasTarget
		}
		if dr == 2*direction && p.Position.Row == startRow {
			return !hasTarget && board.IsPathClear(p.Position, to)
		}
		return false
	}
	// diagonal step is only legal as a capture (own color already rejected above)
	return abs(dc) == 1 && dr == direction && hasTarget
}

const boardSize = 8

type Board struct {
	grid [boardSize][boardSize]*Piece
}

func (b *Board) Place(piece *Piece) {
	b.grid[piece.Position.Row][piece.Position.Col] = piece
}

func (b *Board) Get(pos Position) *Piece {
	if !pos.IsOnBoard() {
		return nil
	}
	return b.grid[pos.Row][pos.Col]
}

func (b *Board) IsEmpty(pos Position) bool {
	return b.Get(pos) == nil
}

func (b *Board) Remove(pos Position) *Piece {
	piece := b.Get(pos)
	if piece != nil {
		b.grid[pos.Row][pos.Col] = nil
	}
	return piece
}

func (b *Board) MovePiece(start, end Position) error {
	piece := b.Remove(start)
	if piece == nil {
		return fmt.Errorf("No piece on %s", start)
	}
	piece.Position = end
	b.grid[end.Row][end.Col] = piece
	return nil
}

// IsPathClear is true when every square strictly between start and end is empty.
func (b *Board) IsPathClear(start, end Position) bool {
	dr := end.Row - start.Row
	dc := end.Col - start.Col
	if !(dr == 0 || dc == 0 || abs(dr) == abs(dc)) {
		return false
	}
	stepR, stepC := sign(dr), sign(dc)
	r, c := start.Row+stepR, start.Col+stepC
	for r != end.Row || c != end.Col {
		if b.grid[r][c] != nil {
			return false
		}
		r += stepR
		c += stepC
	}
	return true
}

func (b *Board) FindKing(color Color) *Piece {
	for _, piece := range b.PiecesOf(color) {
		if piece.Type == King {
			return piece
		}
	}
	return nil
}

func (b *Board) PiecesOf(color Color) []*Piece {
	var result []*Piece
	for row := 0; row < boardSize; row++ {
		for col := 0; col < boardSize; col++ {
			piece := b.grid[row][col]
			if piece != nil && piece.Color == color {
				result = append(result, piece)
			}
		}
	}
	return result
}

func (b *Board) Render() string {
	var sb strings.Builder
	for row := boardSize - 1; row >= 0; row-- {
		sb.WriteString(fmt.Sprintf("    %d", row+1))
		for col := 0; col < boardSize; col++ {
			piece := b.grid[row][col]
			if piece == nil {
				sb.WriteString(" .")
			} else {
				sb.WriteString(" " + piece.Symbol())
			}
		}
		sb.WriteString("\\n")
	}
	sb.WriteString("      a b c d e f g h")
	return sb.String()
}

type Move struct {
	From     Position
	To       Position
	Piece    *Piece
	Captured *Piece // nil when nothing was taken
}

func (m Move) Describe() string {
	text := fmt.Sprintf("%s %s -> %s", m.Piece.Label(), m.From, m.To)
	if m.Captured != nil {
		text += " x " + m.Captured.Label()
	}
	return text
}

var ErrNotStarted = errors.New("call Start() before Move()")

// ChessGame is the facade: callers only use Start, Move, Turn, IsCheck and PrintBoard.

type ChessGame struct {
	board   *Board
	turn    Color
	history []Move
	started bool
}

func NewChessGame() *ChessGame {
	return &ChessGame{board: &Board{}, turn: White}
}

func (g *ChessGame) Board() *Board {
  return g.board
}

func (g *ChessGame) Turn() Color {
  return g.turn
}

func (g *ChessGame) History() []Move {
	return append([]Move(nil), g.history...)
}

func (g *ChessGame) Start() {
	g.board = &Board{}
	backRank := [boardSize]PieceType{Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook}
	for col := 0; col < boardSize; col++ {
		g.board.Place(&Piece{Color: White, Type: backRank[col], Position: Position{0, col}})
		g.board.Place(&Piece{Color: Black, Type: backRank[col], Position: Position{7, col}})
		g.board.Place(&Piece{Color: White, Type: Pawn, Position: Position{1, col}})
		g.board.Place(&Piece{Color: Black, Type: Pawn, Position: Position{6, col}})
	}
	g.turn = White
	g.history = nil
	g.started = true
}

func (g *ChessGame) Move(fromText, toText string) (Move, error) {
	if !g.started {
		return Move{}, ErrNotStarted
	}
	start, err := ParsePosition(fromText)
	if err != nil {
		return Move{}, err
	}
	end, err := ParsePosition(toText)
	if err != nil {
		return Move{}, err
	}
	piece := g.board.Get(start)
	if piece == nil {
		return Move{}, fmt.Errorf("No piece on %s", start)
	}
	if piece.Color != g.turn {
		return Move{}, fmt.Errorf("It is %s's turn, but %s holds a %s", g.turn, start, piece.Label())
	}
	if !piece.CanMoveTo(g.board, end) {
		return Move{}, fmt.Errorf("Illegal move: %s cannot go from %s to %s", piece.Type, start, end)
	}

	// Try the move, then undo it if it leaves our own king attacked.
	captured := g.board.Remove(end)
	if err := g.board.MovePiece(start, end); err != nil {
		return Move{}, err
	}
	if g.IsCheck(g.turn) {
		_ = g.board.MovePiece(end, start)
		if captured != nil {
			g.board.Place(captured)
		}
		return Move{}, fmt.Errorf("Illegal move: %s %s -> %s leaves %s king in check", piece.Type, start, end, g.turn)
	}

	move := Move{From: start, To: end, Piece: piece, Captured: captured}
	g.history = append(g.history, move)
	g.turn = g.turn.Opposite()
	return move, nil
}

func (g *ChessGame) IsCheck(color Color) bool {
	king := g.board.FindKing(color)
	if king == nil {
		return false
	}
	for _, attacker := range g.board.PiecesOf(color.Opposite()) {
		if attacker.CanMoveTo(g.board, king.Position) {
			return true
		}
	}
	return false
}

func (g *ChessGame) PrintBoard() {
	logLine(g.board.Render())
}

var step = 0

func banner(title string) {
	step++
	logLine("")
	logLine(fmt.Sprintf("=== STEP %d: %s ===", step, title))
}

func counts(game *ChessGame) string {
	return fmt.Sprintf("WHITE=%d BLACK=%d",
		len(game.Board().PiecesOf(White)), len(game.Board().PiecesOf(Black)))
}

func play(game *ChessGame, fromSq, toSq string, illegalOnPurpose bool) {
	mover := game.Turn()
	suffix := ""
	if illegalOnPurpose {
		suffix = " (illegal attempt)"
	}
	banner(fmt.Sprintf("%s %s -> %s%s", mover, fromSq, toSq, suffix))

	pieceName := "none"
	if pos, err := ParsePosition(fromSq); err == nil {
		if piece := game.Board().Get(pos); piece != nil {
			pieceName = piece.Label()
		}
	}
	logLine(fmt.Sprintf("  mover: %s, piece on %s: %s", mover, fromSq, pieceName))

	move, err := game.Move(fromSq, toSq)
	if err != nil {
		logLine("  REJECTED: " + err.Error())
		logLine(fmt.Sprintf("  board unchanged, next turn: %s", game.Turn()))
		return
	}
	logLine(fmt.Sprintf("  from: %s  to: %s", move.From, move.To))
	captured := "none"
	if move.Captured != nil {
		captured = move.Captured.Label()
	}
	logLine("  captured: " + captured)
	opponent := game.Turn()
	check := "none"
	if game.IsCheck(opponent) {
		check = fmt.Sprintf("%s is in check", opponent)
	}
	logLine("  check: " + check)
	logLine("  pieces left: " + counts(game))
	logLine(fmt.Sprintf("  next turn: %s", game.Turn()))
	game.PrintBoard()
}

func main() {
	game := NewChessGame()

	banner("Create a game and set up the standard position")
	game.Start()
	logLine("  pieces: " + counts(game))
	logLine(fmt.Sprintf("  next turn: %s", game.Turn()))
	game.PrintBoard()

	play(game, "e2", "e4", false)
	play(game, "e7", "e5", false)
	play(game, "g1", "f3", false)
	play(game, "b8", "c6", false)
	play(game, "a1", "a3", true) // rook blocked by its own pawn
	play(game, "g8", "f6", true) // black piece on white's turn
	play(game, "f3", "e5", false) // knight captures pawn
	play(game, "c6", "e5", false) // knight recaptures
	play(game, "d1", "h5", false)
	play(game, "d7", "d6", false)
	play(game, "h5", "f7", false) // queen captures pawn with check
	play(game, "a7", "a6", true)  // ignores the check
	play(game, "e5", "f7", false) // knight captures the queen

	banner("Game summary")
	moves := game.History()
	logLine(fmt.Sprintf("  moves played: %d", len(moves)))
	for i, m := range moves {
		logLine(fmt.Sprintf("  %2d. %s", i+1, m.Describe()))
	}
	logLine(fmt.Sprintf("  final: %s, next turn: %s", counts(game), game.Turn()))
	logLine(fmt.Sprintf("  WHITE in check: %t, BLACK in check: %t", game.IsCheck(White), game.IsCheck(Black)))
}`

/* ────────────────────────────── C# ────────────────────────────── */

const csharp = `#nullable enable
using System;
using System.Collections.Generic;
using System.Text;

enum Color { WHITE, BLACK }

enum PieceType { KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN }

static class ColorExtensions
{
    public static Color Opposite(this Color color) {
      return color == Color.WHITE ? Color.BLACK : Color.WHITE;
    }
}

/// <summary>Row 0 is rank 1 (white side), Col 0 is file a.</summary>
readonly record struct Position(int Row, int Col)
{
    public static Position Parse(string text)
    {
        if (text.Length != 2 || text[0] < 'a' || text[0] > 'h' || text[1] < '1' || text[1] > '8')
        {
            throw new ArgumentException($"Bad square '{text}', expected a1..h8");
        }

        return new Position(text[1] - '1', text[0] - 'a');
    }

    public bool IsOnBoard() {
      return Row >= 0 && Row < 8 && Col >= 0 && Col < 8;
    }

    public override string ToString() {
      return $"{(char)('a' + Col)}{Row + 1}";
    }
}

class Piece
{
    public Color Color { get; }
    public PieceType Type { get; }
    public Position Position { get; set; }

    public Piece(Color color, PieceType type, Position position)
    {
        Color = color;
        Type = type;
        Position = position;
    }

    public string Symbol()
    {
        string letter = Type switch
        {
            PieceType.KING => "K",
            PieceType.QUEEN => "Q",
            PieceType.ROOK => "R",
            PieceType.BISHOP => "B",
            PieceType.KNIGHT => "N",
            _ => "P",
        };
        return Color == Color.WHITE ? letter : letter.ToLower();
    }

    public string Label() {
      return $"{Color} {Type}";
    }

    /// <summary>Basic movement only: no castling, en passant or promotion.</summary>
    public bool CanMoveTo(Board board, Position to)
    {
        if (to == Position || !to.IsOnBoard()) {
          return false;
        }
        Piece? target = board.Get(to);
        if (target != null && target.Color == Color) {
          return false;
        }
        int dr = to.Row - Position.Row;
        int dc = to.Col - Position.Col;
        bool straight = dr == 0 || dc == 0;
        bool diagonal = Math.Abs(dr) == Math.Abs(dc);

        return Type switch
        {
            PieceType.KNIGHT => (Math.Abs(dr) == 1 && Math.Abs(dc) == 2) || (Math.Abs(dr) == 2 && Math.Abs(dc) == 1),
            PieceType.KING => Math.Max(Math.Abs(dr), Math.Abs(dc)) == 1,
            PieceType.ROOK => straight && board.IsPathClear(Position, to),
            PieceType.BISHOP => diagonal && board.IsPathClear(Position, to),
            PieceType.QUEEN => (straight || diagonal) && board.IsPathClear(Position, to),
            _ => PawnCanMove(board, to, target != null, dr, dc),
        };
    }

    private bool PawnCanMove(Board board, Position to, bool hasTarget, int dr, int dc)
    {
        int direction = Color == Color.WHITE ? 1 : -1;
        int startRow = Color == Color.WHITE ? 1 : 6;
        if (dc == 0)
        {
            if (dr == direction) {
              return !hasTarget;
            }
            if (dr == 2 * direction && Position.Row == startRow)
            {
                return !hasTarget && board.IsPathClear(Position, to);
            }
            return false;
        }
        // diagonal step is only legal as a capture (own color already rejected above)
        return Math.Abs(dc) == 1 && dr == direction && hasTarget;
    }
}

class Board
{
    public const int Size = 8;
    private readonly Piece?[,] grid = new Piece?[Size, Size];

    public void Place(Piece piece) {
      return grid[piece.Position.Row, piece.Position.Col] = piece;
    }

    public Piece? Get(Position pos) {
      return pos.IsOnBoard() ? grid[pos.Row, pos.Col] : null;
    }

    public bool IsEmpty(Position pos) {
      return Get(pos) == null;
    }

    public Piece? Remove(Position pos)
    {
        Piece? piece = Get(pos);
        grid[pos.Row, pos.Col] = null;
        return piece;
    }

    public void MovePiece(Position start, Position end)
    {
        Piece? piece = Remove(start);
        if (piece == null) {
          throw new ArgumentException($"No piece on {start}");
        }
        piece.Position = end;
        grid[end.Row, end.Col] = piece;
    }

    /// <summary>True when every square strictly between start and end is empty.</summary>
    public bool IsPathClear(Position start, Position end)
    {
        int dr = end.Row - start.Row;
        int dc = end.Col - start.Col;
        if (!(dr == 0 || dc == 0 || Math.Abs(dr) {
          == Math.Abs(dc))) return false;
        }

        int stepR = Math.Sign(dr);
        int stepC = Math.Sign(dc);
        int r = start.Row + stepR;
        int c = start.Col + stepC;
        while (r != end.Row || c != end.Col)
        {
            if (grid[r, c] != null) {
              return false;
            }
            r += stepR;
            c += stepC;
        }
        return true;
    }

    public Piece? FindKing(Color color)
    {
        foreach (Piece piece in PiecesOf(color))
        {
            if (piece.Type == PieceType.KING) {
              return piece;
            }
        }
        return null;
    }

    public List<Piece> PiecesOf(Color color)
    {
        var result = new List<Piece>();
        for (int row = 0; row < Size; row++)
        {
            for (int col = 0; col < Size; col++)
            {
                Piece? piece = grid[row, col];
                if (piece != null && piece.Color == color) {
                  result.Add(piece);
                }
            }
        }
        return result;
    }

    public string Render()
    {
        var sb = new StringBuilder();
        for (int row = Size - 1; row >= 0; row--)
        {
            sb.Append("    ").Append(row + 1);
            for (int col = 0; col < Size; col++)
            {
                Piece? piece = grid[row, col];
                sb.Append(' ').Append(piece == null ? "." : piece.Symbol());
            }
            sb.Append('\\n');
        }
        sb.Append("      a b c d e f g h");
        return sb.ToString();
    }
}

record Move(Position From, Position To, Piece Piece, Piece? Captured)
{
    public string Describe()
    {
        string text = $"{Piece.Label()} {From} -> {To}";
        if (Captured != null) {
          text += $" x {Captured.Label()}";
        }
        return text;
    }
}

/// <summary>Facade: callers only use Start, MakeMove, Turn, IsCheck and PrintBoard.</summary>

class ChessGame
{
    private static readonly PieceType[] BackRank =
    {
        PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
        PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK,
    };

    private List<Move> history = new List<Move>();
    private bool started = false;

    public Board Board { get; private set; } = new Board();
    public Color Turn { get; private set; } = Color.WHITE;
    public IReadOnlyList<Move> History => history.AsReadOnly();

    public void Start()
    {
        Board = new Board();
        for (int col = 0; col < Board.Size; col++)
        {
            Board.Place(new Piece(Color.WHITE, BackRank[col], new Position(0, col)));
            Board.Place(new Piece(Color.BLACK, BackRank[col], new Position(7, col)));
            Board.Place(new Piece(Color.WHITE, PieceType.PAWN, new Position(1, col)));
            Board.Place(new Piece(Color.BLACK, PieceType.PAWN, new Position(6, col)));
        }
        Turn = Color.WHITE;
        history = new List<Move>();
        started = true;
    }

    public Move MakeMove(string fromText, string toText)
    {
        if (!started) {
          throw new InvalidOperationException("Call Start() before MakeMove()");
        }
        Position start = Position.Parse(fromText);
        Position end = Position.Parse(toText);
        Piece? piece = Board.Get(start);
        if (piece == null) {
          throw new ArgumentException($"No piece on {start}");
        }
        if (piece.Color != Turn)
        {
            throw new ArgumentException($"It is {Turn}'s turn, but {start} holds a {piece.Label()}");
        }
        if (!piece.CanMoveTo(Board, end))
        {
            throw new ArgumentException($"Illegal move: {piece.Type} cannot go from {start} to {end}");
        }

        // Try the move, then undo it if it leaves our own king attacked.
        Piece? captured = Board.Remove(end);
        Board.MovePiece(start, end);
        if (IsCheck(Turn))
        {
            Board.MovePiece(end, start);
            if (captured != null) {
              Board.Place(captured);
            }

            throw new ArgumentException($"Illegal move: {piece.Type} {start} -> {end} leaves {Turn} king in check");
        }

        var move = new Move(start, end, piece, captured);
        history.Add(move);
        Turn = Turn.Opposite();
        return move;
    }

    public bool IsCheck(Color color)
    {
        Piece? king = Board.FindKing(color);
        if (king == null) {
          return false;
        }
        foreach (Piece attacker in Board.PiecesOf(color.Opposite()))
        {
            if (attacker.CanMoveTo(Board, king.Position)) {
              return true;
            }
        }
        return false;
    }

    public void PrintBoard() {
      return Console.WriteLine(Board.Render());
    }
}

class Program
{
    private static int step = 0;

    private static void Log(string message = "") {
      return Console.WriteLine(message);
    }

    private static void Banner(string title)
    {
        step++;
        Log();
        Log($"=== STEP {step}: {title} ===");
    }

    private static string Counts(ChessGame game) =>
        $"WHITE={game.Board.PiecesOf(Color.WHITE).Count} BLACK={game.Board.PiecesOf(Color.BLACK).Count}";

    private static void Play(ChessGame game, string fromSq, string toSq, bool illegalOnPurpose = false)
    {
        Color mover = game.Turn;
        string suffix = illegalOnPurpose ? " (illegal attempt)" : "";
        Banner($"{mover} {fromSq} -> {toSq}{suffix}");
        Piece? piece = game.Board.Get(Position.Parse(fromSq));
        Log($"  mover: {mover}, piece on {fromSq}: {(piece != null ? piece.Label() : "none")}");
        Move move;
        try
        {
            move = game.MakeMove(fromSq, toSq);
        }
        catch (ArgumentException err)
        {
            Log($"  REJECTED: {err.Message}");
            Log($"  board unchanged, next turn: {game.Turn}");
            return;
        }
        Log($"  from: {move.From}  to: {move.To}");
        Log($"  captured: {(move.Captured != null ? move.Captured.Label() : "none")}");
        Color opponent = game.Turn;
        Log($"  check: {(game.IsCheck(opponent) ? opponent + " is in check" : "none")}");
        Log($"  pieces left: {Counts(game)}");
        Log($"  next turn: {game.Turn}");
        game.PrintBoard();
    }

    static void Main()
    {
        var game = new ChessGame();

        Banner("Create a game and set up the standard position");
        game.Start();
        Log($"  pieces: {Counts(game)}");
        Log($"  next turn: {game.Turn}");
        game.PrintBoard();

        Play(game, "e2", "e4");
        Play(game, "e7", "e5");
        Play(game, "g1", "f3");
        Play(game, "b8", "c6");
        Play(game, "a1", "a3", true);   // rook blocked by its own pawn
        Play(game, "g8", "f6", true);   // black piece on white's turn
        Play(game, "f3", "e5");         // knight captures pawn
        Play(game, "c6", "e5");         // knight recaptures
        Play(game, "d1", "h5");
        Play(game, "d7", "d6");
        Play(game, "h5", "f7");         // queen captures pawn with check
        Play(game, "a7", "a6", true);   // ignores the check
        Play(game, "e5", "f7");         // knight captures the queen

        Banner("Game summary");
        IReadOnlyList<Move> moves = game.History;
        Log($"  moves played: {moves.Count}");
        for (int i = 0; i < moves.Count; i++)
        {
            Log($"  {i + 1,2}. {moves[i].Describe()}");
        }
        Log($"  final: {Counts(game)}, next turn: {game.Turn}");
        Log($"  WHITE in check: {game.IsCheck(Color.WHITE)}, BLACK in check: {game.IsCheck(Color.BLACK)}");
    }
}`

/* ────────────────────────────── SOLUTION ────────────────────────────── */

export const chessGameSolution: ProblemSolution = {
  slug: 'chess-game',
  title: 'Chess Game - Solution',

  overview: {
    introduction: [
      "Chess is a favorite low-level design prompt because everyone knows the rules, so the interview can go straight to modeling. The trap is scope. A full engine needs castling, en passant, promotion, checkmate, stalemate, draw rules, and often an AI. You cannot build that on a whiteboard in 45 minutes, and the interviewer does not expect it. They want to see whether you can pick a sensible slice, model it cleanly, and explain what you left out.",
      "This guide builds a medium-sized slice: the standard starting position, legal basic moves for all six piece types, turn order, captures, and check detection. A move that leaves your own king attacked is rejected. Castling, en passant, promotion, and checkmate are named as extensions and left out of the code on purpose. The result is a few hundred lines per language that you could actually write and explain.",
      "The central design question is where movement rules live. Some candidates put everything in one giant Game class. Others create King, Queen, Rook, Bishop, Knight, and Pawn subclasses that each override one method. Both can work. This solution keeps one Piece class with a PieceType enum and a type-based canMoveTo, and puts shared geometry (is the path between two squares empty?) on Board. That keeps the class count low and makes the rules easy to read in one place. We also discuss when subclasses would win.",
      "The demo in main() plays a real opening (1. e4 e5 2. Nf3 Nc6), shows two illegal attempts, then plays a short tactical sequence with captures and a check, including one attempt to ignore the check. Every step logs who moves, from and to, the piece, any capture, whose turn is next, and a board snapshot. Reading the log top to bottom is the fastest way to confirm the design behaves like chess.",
    ],
    constraints: [
      "Standard 8x8 board with the standard 32-piece starting position (16 per side).",
      "Two players alternate, White first. A move is given as from and to squares in algebraic form such as e2 and e4.",
      "Each of the six piece types moves by its basic rules: pawn (one or two forward from the start row, diagonal capture), rook, bishop, queen (sliding, blocked by pieces in the way), knight (jumps), king (one square).",
      "A piece may capture an enemy piece on its target square but never a friendly piece.",
      "A move is rejected if it is blocked, not the mover's turn, geometrically illegal, or leaves the mover's own king in check.",
      "The game can report whether a given color's king is currently in check.",
      "Out of scope for this version: castling, en passant, pawn promotion, checkmate and stalemate detection, draw rules, clocks, and move undo.",
    ],
    assumptions: [
      "Row 0 is rank 1 (White's back rank) and column 0 is file a. White pawns move toward higher rows, Black pawns toward lower rows.",
      "Illegal input (bad square text, empty square, wrong color, illegal geometry) is reported by an exception or error value, and the game state is left unchanged.",
      "A pawn that reaches the last rank simply stays a pawn. Promotion is listed as an extension.",
      "Check is detected by asking whether any enemy piece could legally move onto the king's square using the same canMoveTo rules.",
      "One process, one game, no concurrency. Persistence, clocks, and networking are follow-up topics.",
      "Console logging stands in for a UI. printBoard renders the board as text with uppercase for White and lowercase for Black.",
    ],
    clarificationQuestions: [
      {
        question: "Which rules are in scope: only basic moves, or also castling, en passant, and promotion?",
        why: "This is the most important scoping question. Basic moves fit in a short interview. Special moves each add state (has the king moved, last double-step pawn). Agree on basic moves first and offer the specials as extensions.",
      },
      {
        question: "Do we need to detect check, checkmate, and stalemate, or only reject illegal moves?",
        why: "Check detection is small once you can ask whether an enemy piece attacks a square. Checkmate and stalemate need move generation for every piece, which is a much bigger piece of work. Confirm where the line is.",
      },
      {
        question: "Is this a two-player hot-seat game, or do we also need an AI opponent or network play?",
        why: "It decides whether ChessGame is the only entry point. With an AI you would add a Player abstraction or a move generator. Assuming hot-seat keeps the facade small.",
      },
      {
        question: "How should illegal moves be reported: exception, error code, or a result object?",
        why: "It defines the public API shape in each language. Exceptions are simple to read in a demo. A Result type is cleaner for a UI that expects bad input often.",
      },
      {
        question: "Do we need move history, undo, or replay?",
        why: "Even a simple history list changes the Move class from a throwaway value to a core entity. Undo needs captured pieces stored on the move, which our Move already does.",
      },
      {
        question: "Should pieces be separate subclasses, or is one Piece class with a type enum acceptable?",
        why: "It invites a design discussion. Showing you can defend either choice, and name when you would switch, is worth more than the choice itself.",
      },
      {
        question: "How will the board be displayed: console text, a GUI, or an API returning a structure?",
        why: "It tells you whether rendering belongs on Board (text) or in a separate view. We keep a simple render method and mention a separate renderer as an extension.",
      },
    ],
  },

  interviewApproach: {
    sections: [
      {
        heading: "The first two minutes: shrink the problem on purpose",
        paragraphs: [
          "Chess is the classic example of a prompt where the biggest risk is over-building. Before drawing anything, restate the scope in your own words: a two-player game on an 8x8 board, six piece types with basic movement, turn order, captures, and check. Then say clearly what you will not do: castling, en passant, promotion, and checkmate detection. Ask the interviewer to confirm. That single exchange shows judgment, which is exactly what this question tests.",
          "Next, write two or three assumptions on the board: coordinate convention (row 0 is rank 1), how errors are reported, and that check is detected by reusing the movement rules. These small decisions prevent confusion later when you code the board render or the pawn direction.",
        ],
        bullets: [
          "Restate the scope and the explicit non-goals, then wait for a yes.",
          "Pick a coordinate convention and write it down (row 0 = rank 1, col 0 = file a).",
          "Decide how errors are reported before you write any method signature.",
          "Announce the plan: entities, responsibilities, relationships, patterns, code, demo.",
        ],
        callout: {
          title: "Interview tip",
          body: "Naming what you will skip is a strength, not a weakness. A candidate who says I will leave castling and promotion as extensions sounds senior. A candidate who tries everything and finishes nothing does not.",
        },
      },
      {
        heading: "Extracting nouns and verbs from the requirements",
        paragraphs: [
          "Read the requirements and underline nouns: game, board, square, piece, pawn, rook, knight, bishop, queen, king, color, move, player, turn. Underline verbs: start, move, capture, check, alternate turns, reject illegal moves, print.",
          "Then ask which nouns deserve to be classes and which are just values. Color and PieceType are fixed sets, so they become enums. A square is just two numbers, so Position is a small immutable value. Piece, Board, and Move are real entities. Game coordinates everything. Player is mentioned in the prompt but in a hot-seat game it is only a Color, so a Player class would be empty ceremony.",
        ],
        bullets: [
          "Enums: Color (WHITE, BLACK) and PieceType (KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN).",
          "Value: Position (row, col) with algebraic text like e2.",
          "Entities: Piece, Board, Move.",
          "Facade: ChessGame with start, move, isCheck, and printBoard.",
          "Verbs become methods: canMoveTo on Piece, isPathClear on Board, move on ChessGame.",
        ],
      },
      {
        heading: "Entity discovery: Piece, Board, Move, and who owns what",
        paragraphs: [
          "Piece holds its color, its type, and its current position, and answers one question: can I legally move to this square, given this board? That method needs the board only to look at the target square and to check that sliding paths are clear. Piece does not mutate the board, which keeps rules testable in isolation.",
          "Board owns the 8x8 grid and the geometry helpers: place, get, isEmpty, remove, movePiece, and isPathClear. It knows nothing about whose turn it is or whether a king is safe. That separation matters: Board is a data structure with spatial queries, while ChessGame is the rules coordinator.",
          "Move is a small record of what happened: from, to, the piece that moved, and the captured piece if any. Storing the captured piece makes history readable and is exactly what an undo feature would need later.",
        ],
        bullets: [
          "Piece: color, type, position, canMoveTo(board, to), symbol, label.",
          "Board: grid plus place, get, isEmpty, remove, movePiece, isPathClear, findKing, piecesOf, render.",
          "Move: from, to, piece, captured, describe.",
          "Position: immutable row and col, parse(text), isOnBoard, toString.",
        ],
      },
      {
        heading: "Assigning responsibilities: one sentence per class",
        paragraphs: [
          "Write one sentence per class. If a sentence needs the word and twice, the class is probably doing two jobs.",
          "ChessGame runs turns: it validates a request, applies the move, rejects it if the mover's king would be attacked, records history, and flips the turn. Board stores pieces and answers spatial questions. Piece knows how its own type moves. Position knows how to parse and print squares. Move records what happened.",
        ],
        bullets: [
          "ChessGame: orchestrate a turn, enforce turn order and king safety, keep history.",
          "Board: hold the grid and answer where is everything and is this path empty.",
          "Piece: decide whether a move shape is legal for its color and type.",
          "Position: validate and format a square.",
          "Move: remember one completed move.",
        ],
      },
      {
        heading: "Relationships and multiplicities",
        paragraphs: [
          "ChessGame composes one Board and a list of Moves: if the game goes away, so do both. The Board composes up to 32 Pieces on the grid. Each Piece is associated with a Color, a PieceType, and a Position. A Move refers to two Positions and one or two Pieces (the mover and the optional captured piece). Board depends on Position because every lookup is by position.",
          "A subtle point: Piece stores its own position and the Board grid also stores the piece in a cell. That is deliberate duplication. The piece needs its position to compute dr and dc, and the board needs the grid for fast lookups. Board.movePiece updates both together so they cannot drift apart.",
        ],
        bullets: [
          "Composition: ChessGame to Board (1 to 1), ChessGame to Move (1 to 0..*), Board to Piece (1 to 0..32).",
          "Association: Piece to Color, PieceType, and Position; Move to Position and Piece.",
          "Dependency: Board uses Position as the key for every query.",
        ],
        callout: {
          title: "Why does Piece know its position?",
          body: "Because canMoveTo needs a starting square and the board is only asked about squares in between. The alternative is to pass the from square in every call. Keeping position on the piece is simpler as long as only Board.movePiece mutates it.",
        },
      },
      {
        heading: "Patterns and OOP choices, and what we rejected",
        paragraphs: [
          "ChessGame is a Facade. Callers need start, move, isCheck, and printBoard. They should not touch the grid or the undo logic. This also gives one natural place to enforce rules that span objects, like try the move, check king safety, undo if unsafe.",
          "Movement rules are a type-based switch inside Piece.canMoveTo. This is a light version of Strategy: the behavior varies by PieceType. We deliberately did not create six subclasses. Each would be about five lines, the rules fit on one screen, and a reader can compare all six at a glance. If one piece grows complex (castling for the king, en passant for the pawn), that is the moment to extract a MovementRule per type.",
        ],
        bullets: [
          "Facade: ChessGame hides board mutation, check detection, and undo.",
          "Type-based rules in Piece instead of six subclasses (name when you would switch).",
          "Rejected: Player class (it would only wrap a Color in hot-seat play).",
          "Rejected: Board knowing about check (it would mix geometry with rules).",
          "Rejected: Singleton game (inject or create one instance; tests stay simple).",
        ],
      },
      {
        heading: "Check detection and the try-then-undo trick",
        paragraphs: [
          "To know whether a king is in check, ask each enemy piece whether it could move onto the king's square. This reuses canMoveTo, so there is no second copy of the rules. It works for pawns too: a pawn's forward move requires an empty target, so it never claims to attack a king straight ahead, while its diagonal capture does attack.",
          "For self-check, ChessGame does not need a separate rule engine. It temporarily applies the move, asks isCheck for the mover, and if the king is attacked, it undoes the move and rejects it. Undo is cheap because we kept the captured piece. This one pattern also covers pinned pieces and the case where you must answer a check, which is exactly what the demo shows when Black tries a7 to a6 while in check.",
        ],
        numbered: [
          "Validate squares, piece presence, turn, and canMoveTo.",
          "Remove any captured piece and move the mover on the board.",
          "If the mover's own king is attacked, move back, restore the captured piece, and reject.",
          "Otherwise record the Move, flip the turn, and return the Move.",
        ],
        callout: {
          title: "Say it out loud",
          body: "Try the move, test king safety, undo if unsafe. It is simple, correct, and avoids writing a separate legal move generator. The cost is a little extra work per move, which is irrelevant at this scale.",
        },
      },
      {
        heading: "From blank whiteboard to finished diagram: the step-by-step path",
        paragraphs: [
          "Work in order to stay calm. Put ChessGame on the left as the entry point, Board in the middle, and Piece next to it with the two enums. Place Move and Position below. Walk through e2 to e4 on the diagram before coding: parse squares, get piece, check turn, canMoveTo, apply, check king safety, record, flip turn.",
          "Then code bottom-up: enums, Position, Piece, Board, Move, ChessGame, and finally the demo. The demo should print a banner per step and a board snapshot per successful move, so a reader can follow the game without a debugger.",
        ],
        numbered: [
          "Restate the scope and the non-goals; ask 5-6 questions; write assumptions.",
          "List nouns and verbs; make enums for fixed sets and a value type for squares.",
          "Choose Piece, Board, Move, Position, ChessGame; one sentence of responsibility each.",
          "Draw composition for board, pieces, and history; associations for enums and positions.",
          "Name the patterns used (Facade, light Strategy) and the options you rejected.",
          "Explain check detection and try-then-undo.",
          "Code bottom-up and demo a real opening plus illegal attempts.",
        ],
      },
    ],
    entities: [
      {
        name: 'ChessGame',
        responsibility: 'Facade for one game: start the standard position, apply moves in turn order, reject illegal moves, report check, and keep history.',
        keyMembers: ['board', 'turn', 'history', 'start()', 'move(from, to)', 'isCheck(color)', 'printBoard()'],
      },
      {
        name: 'Board',
        responsibility: 'Owns the 8x8 grid and spatial queries. Knows pieces and squares, not turns or check.',
        keyMembers: ['grid', 'place()', 'get()', 'isEmpty()', 'remove()', 'movePiece()', 'isPathClear()', 'findKing()', 'piecesOf()', 'render()'],
      },
      {
        name: 'Piece',
        responsibility: 'One chess piece with color, type, and position. Decides whether a move to a target square is legal by its own rules.',
        keyMembers: ['color', 'type', 'position', 'canMoveTo()', 'symbol()', 'label()'],
      },
      {
        name: 'Position',
        responsibility: 'Immutable square (row, col) with algebraic parsing and printing such as e2.',
        keyMembers: ['row', 'col', 'parse()', 'isOnBoard()', 'toString()'],
      },
      {
        name: 'Move',
        responsibility: 'Record of one completed move: from, to, the moved piece, and the captured piece if any.',
        keyMembers: ['from', 'to', 'piece', 'captured', 'describe()'],
      },
      {
        name: 'Color / PieceType',
        responsibility: 'Enums for the two sides (WHITE, BLACK) and the six piece kinds (KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN).',
      },
    ],
  },

  uml: { nodes, edges },
  umlCaption:
    'ChessGame on the left is the only class callers need. It composes one Board and a history of Moves. The Board composes up to 32 Pieces; each Piece has a Color, a PieceType, and a Position. Move records two Positions and the pieces involved. Board answers where things are and whether a path is empty; Piece answers whether its own movement shape is legal.',

  designExplanation: {
    sections: [
      {
        heading: "Architecture overview: geometry, rules, and orchestration",
        paragraphs: [
          "Think of three layers. Geometry (Position, Board) answers where things are and what is between two squares. Rules (Piece, PieceType, Color) answer whether a piece of a given type can go from here to there. Orchestration (ChessGame, Move) answers whose turn it is, whether the move leaves the king safe, and what happened.",
          "This split keeps each question in one place. A bug in how bishops move is a bug in Piece. A bug in path blocking is a bug in Board.isPathClear. A bug in turn handling or self-check is a bug in ChessGame. Tests can target one layer at a time.",
        ],
        bullets: [
          "Geometry: Position and Board (grid, isPathClear).",
          "Rules: Piece.canMoveTo switching on PieceType.",
          "Orchestration: ChessGame.move, isCheck, history.",
          "Output: Board.render and ChessGame.printBoard keep display separate from rules.",
        ],
      },
      {
        heading: "Piece.canMoveTo: six rules in one readable place",
        paragraphs: [
          "canMoveTo starts with checks every piece shares: the target must differ from the current square, be on the board, and not hold a friendly piece. Then it computes dr and dc, the row and column difference, and switches on type.",
          "Knight: the absolute differences are one and two in either order, and nothing blocks it. King: at most one square in any direction. Rook: same row or column and the path is clear. Bishop: equal absolute differences and a clear path. Queen: rook or bishop. Pawn: forward one into an empty square, forward two from the start row through an empty path into an empty square, or one step diagonally forward onto an enemy piece.",
          "Because shared checks happen first, the pawn rule can assume the target is either empty or enemy-owned. A diagonal pawn step requires a target (a capture), while a straight step requires none.",
        ],
        bullets: [
          "Shared guards: not same square, on board, not own piece.",
          "Sliding pieces use Board.isPathClear; knights ignore blockers.",
          "Pawn direction and start row depend on color (White up, Black down).",
          "No castling, en passant, or promotion in this version.",
        ],
        callout: {
          title: "Why a switch and not six subclasses?",
          body: "Each rule is a few lines and they read best side by side. Subclasses make sense once a piece has its own state or long logic, such as a king that tracks whether it has moved for castling.",
        },
      },
      {
        heading: "Board: grid, lookups, and isPathClear",
        paragraphs: [
          "Board stores a two-dimensional array of optional pieces. get returns null (or None, nil) for empty squares and for off-board positions, so callers can ask about any square safely. place inserts a piece at its own position. remove clears a square and returns what was there. movePiece lifts a piece from one square, updates its position, and drops it on the destination.",
          "isPathClear walks one step at a time from the start toward the end, in the direction of sign(dr) and sign(dc), and returns false as soon as it sees an occupied square. It checks only the squares strictly between the endpoints, because the target square is handled by canMoveTo (capture or empty). If the two squares do not share a row, column, or diagonal, it returns false instead of looping forever.",
        ],
        bullets: [
          "get is safe for off-board input; it returns empty.",
          "movePiece updates both the grid and the piece position so they cannot disagree.",
          "isPathClear excludes both endpoints and guards against non-aligned squares.",
          "findKing and piecesOf support check detection without exposing the grid.",
        ],
      },
      {
        heading: "ChessGame: turns, validation, and king safety",
        paragraphs: [
          "move first parses both squares, then runs a short chain of guards: the game must be started, there must be a piece on the from square, it must belong to the player whose turn it is, and canMoveTo must accept the target. Each failure raises a distinct, readable message that the demo logs.",
          "Then comes the try-then-undo step. The game removes any captured piece, moves the mover, and asks isCheck for the mover's color. If the king is attacked, it moves the piece back, restores the captured piece, and rejects the move with a message. Otherwise it records a Move and switches the turn. Because the board is restored exactly, a rejected move has no side effects.",
          "isCheck finds the king of the given color and returns true if any enemy piece can move onto that square according to canMoveTo. printBoard just logs Board.render.",
        ],
        bullets: [
          "Guards in order: started, piece exists, correct color, legal shape, king safe.",
          "Rejected moves leave the board, turn, and history unchanged.",
          "isCheck reuses canMoveTo instead of duplicating attack rules.",
          "Standard setup is built in start(): back rank, pawns, White first.",
        ],
      },
      {
        heading: "Move and Position: small values that make logs readable",
        paragraphs: [
          "Position is immutable and validates algebraic text: a letter from a to h and a digit from 1 to 8. Bad text fails at the boundary with a clear message, so the rest of the code can assume a valid square or use isOnBoard for arithmetic results.",
          "Move stores what a move did, including the captured piece. describe formats a line like WHITE KNIGHT f3 -> e5 x BLACK PAWN. The demo prints this for the history, and an undo feature would use the same fields in reverse.",
        ],
      },
      {
        heading: "Composition vs inheritance: pieces",
        paragraphs: [
          "The textbook chess design has an abstract Piece with six subclasses. It is a fine answer, and you should be ready to draw it. This guide chose a single Piece class because the movement variation here is small and stateless. A switch statement is easy to read, easy to test, and takes fewer lines than six classes plus a factory.",
          "Say when you would switch: once the king needs a hasMoved flag for castling, the pawn needs en passant eligibility, or you add variants (fairy pieces), per-type classes or MovementRule strategy objects pay off. The public API (canMoveTo) does not change, so the refactor is local.",
        ],
      },
      {
        heading: "Alternatives considered and when they would win",
        paragraphs: [
          "Board storing a map from Position to Piece instead of a grid: simpler for sparse boards, slightly harder to render. A grid matches the 8x8 domain and makes path walks trivial.",
          "Computing legal moves by generating every move and filtering: needed for checkmate and for an AI, but heavy for a hot-seat basic version. Validating a requested move is enough here. When you add checkmate, a generateMoves method on Piece or ChessGame plus the same try-then-undo filter is the natural next step.",
          "Result objects instead of exceptions: cleaner for UIs that expect invalid input. Exceptions keep the demo short, and the facade can switch to a MoveResult without touching Piece or Board.",
        ],
      },
    ],
    classResponsibilities: [
      { name: 'ChessGame', responsibility: 'Starts the standard position, enforces turn order and king safety, records history, reports check.' },
      { name: 'Board', responsibility: 'Holds the 8x8 grid; place, get, remove, movePiece, isPathClear, findKing, piecesOf, render.' },
      { name: 'Piece', responsibility: 'Color, type, position; canMoveTo applies the basic movement rule for its type.' },
      { name: 'Position', responsibility: 'Immutable (row, col) with algebraic parse and print.' },
      { name: 'Move', responsibility: 'Immutable record of from, to, moved piece, and captured piece.' },
      { name: 'Color', responsibility: 'WHITE or BLACK; opposite() flips the turn.' },
      { name: 'PieceType', responsibility: 'KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN; selects the movement rule.' },
    ],
    patterns: [
      {
        name: 'Facade (ChessGame)',
        why: 'Callers should not mutate the board or re-implement king safety. One entry point keeps invariants in one place.',
        howApplied: 'ChessGame exposes start, move, isCheck, turn, and printBoard. Board and Piece are reachable for read-only queries, but only move changes game state.',
      },
      {
        name: 'Strategy (light, type-based)',
        why: 'Movement varies by piece type, but the variants are tiny and stateless.',
        howApplied: 'Piece.canMoveTo switches on PieceType. If rules grow, each branch becomes a MovementRule object with the same signature.',
      },
      {
        name: 'Memento-style undo (internal)',
        why: 'Self-check needs to test a move and reverse it without copying the board.',
        howApplied: 'The game keeps the captured piece and the from and to squares, moves back, and restores the capture. A public undo feature would reuse the Move record.',
      },
    ],
    decisions: [
      {
        decision: 'One Piece class with a PieceType enum instead of six subclasses.',
        rationale: 'Rules are short and stateless; side-by-side reading beats six files.',
        tradeoff: 'A growing switch; extract MovementRule objects when castling or en passant arrive.',
        alternativeRejected: 'Abstract Piece with King, Queen, Rook, Bishop, Knight, Pawn subclasses.',
      },
      {
        decision: 'Board owns isPathClear; Piece owns canMoveTo.',
        rationale: 'Geometry is shared by rook, bishop, queen, and double pawn steps. Rules stay on the piece.',
        tradeoff: 'Piece depends on Board for queries (read-only).',
        alternativeRejected: 'Each piece walking the grid itself, duplicating path logic three times.',
      },
      {
        decision: 'Check is detected by reusing canMoveTo from enemy pieces.',
        rationale: 'No second rule set to keep in sync; works for pinned pieces and responses to check.',
        tradeoff: 'Slightly slower than a dedicated attack map, irrelevant at this size.',
        alternativeRejected: 'A separate attacksSquare method per piece type.',
      },
      {
        decision: 'Try the move, test king safety, undo if unsafe.',
        rationale: 'Simple and correct; one mechanism covers pins and answering check.',
        tradeoff: 'Temporary mutation of the board; must restore exactly on rejection.',
        alternativeRejected: 'Cloning the board for each test move (more allocation, more code).',
      },
      {
        decision: 'Illegal moves raise an error and leave state untouched.',
        rationale: 'Keeps move() returning only valid Move values and makes demos readable.',
        tradeoff: 'Callers must catch; a MoveResult type would suit UI code better.',
        alternativeRejected: 'Returning a boolean and losing the reason.',
      },
      {
        decision: 'Piece stores its own position, and Board.movePiece updates it.',
        rationale: 'canMoveTo can compute dr and dc without a from argument.',
        tradeoff: 'Two sources of truth, kept in sync by one method.',
        alternativeRejected: 'Pieces with no position and the board passing from squares everywhere.',
      },
    ],
    solid: {
      heading: 'SOLID, applied to this design',
      paragraphs: [
        "Single Responsibility: Position parses squares, Board stores and queries geometry, Piece decides move shape, Move records history, ChessGame enforces turns and king safety. Each class has one main reason to change.",
        "Open/Closed: new piece rules are added by extending the PieceType switch or, when it grows, by strategy objects. The facade and board stay untouched. Rendering changes stay in render.",
        "Liskov Substitution: if you later add per-type subclasses or MovementRule objects, each must honor the canMoveTo contract: no mutation, no exceptions for ordinary illegal targets, and the shared guards still apply.",
        "Interface Segregation: callers use four ChessGame methods. They never need place, remove, or movePiece.",
        "Dependency Inversion: ChessGame talks to pieces only through canMoveTo and to the board only through its query methods, not through how each type is implemented. Tests can construct a Board with just a few pieces.",
      ],
    },
    extensibility: [
      'Castling: add a hasMoved flag to king and rooks and a castling branch in ChessGame.move that checks empty squares and attacked squares.',
      'En passant: remember the last double-step pawn in ChessGame and allow the diagonal capture to an empty square once.',
      'Promotion: when a pawn reaches the last row, replace it with a chosen piece type in ChessGame.move.',
      'Checkmate and stalemate: generate every legal move with the try-then-undo filter; none and in check means checkmate, none and not in check means stalemate.',
      'Undo and replay: pop a Move from history, move back, and restore its captured piece.',
      'AI or networking: a Player interface that returns a move, or a move generator for search.',
      'Notation: add toSan and fromSan helpers next to Position and Move.',
    ],
  },

  implementationIntro: [
    "The six code samples below share the same classes and the same demo: Color, PieceType, Position, Piece, Board, Move, and ChessGame, followed by a main function that plays a real opening and prints a banner, a log, and a board snapshot for every step. Compare them if you want, or pick the one you will use in the interview.",
    "Naming follows each language: Python uses from_pos and to_pos because from is a keyword, Go capitalizes exported names, and the C# facade method is MakeMove because a method named Move would clash with the Move type. The behavior and the printed output are the same in all six. Illegal moves are reported as exceptions (Go returns an error value), and a rejected move leaves the game exactly as it was.",
  ],

  executionFlow: {
    narrative: [
      "The demo starts with the standard position: 16 pieces per side, White to move. White plays e2 to e4, a pawn double step through an empty e3. Black replies e7 to e5. White develops the knight from g1 to f3, a legal L-shaped jump. Black answers with b8 to c6. Each step logs the mover, the squares, the capture (none so far), the check state, the piece counts, whose turn is next, and the board.",
      "Then two deliberate failures. White tries a1 to a3 with the rook. The geometry is a straight line, but the white pawn on a2 blocks it, so isPathClear says no and the move is rejected. Next, White tries to move Black's knight from g8 to f6. It is White's turn, so the game rejects it before any rule check. In both cases the log says REJECTED, the board is unchanged, and the turn stays with White.",
      "The tactical part: the knight from f3 captures the pawn on e5, Black recaptures with the knight from c6, White brings the queen out from d1 to h5 along a clear diagonal, and Black plays d7 to d6. Then the queen captures the pawn on f7 and gives check. The log reports that Black is in check. Black tries a7 to a6, a legal pawn move on its own, but it does not answer the check, so try-then-undo rejects it. Finally, Black's knight captures the queen on f7, which resolves the check. The summary lists all ten moves with captures.",
    ],
    steps: [
      'Create ChessGame and call start(): place back ranks and pawns for both colors, White to move.',
      'move(from, to): parse both squares and look up the piece on the from square.',
      'Reject if the game has not started, the square is empty, or the piece belongs to the other color.',
      'Ask piece.canMoveTo(board, to): shared guards first, then the rule for its type (sliding pieces call isPathClear).',
      'Apply the move: remove any captured piece, then Board.movePiece updates grid and piece position.',
      'If the mover\'s own king is now attacked, move back, restore the captured piece, and reject.',
      'Otherwise record a Move, flip the turn, and return the Move to the caller.',
      'Log the step: mover, from and to, capture, check state, piece counts, next turn, and a board snapshot.',
    ],
    examples: [
      {
        title: 'Pawn double step',
        input: 'WHITE move e2 -> e4 from the starting position',
        output: 'Move WHITE PAWN e2 -> e4, captured none, next turn BLACK',
        explanation: 'The pawn is on its start row, e3 and e4 are empty, and the straight path is clear, so the two-square advance is legal.',
      },
      {
        title: 'Blocked rook',
        input: 'WHITE move a1 -> a3 on the opening board',
        output: 'REJECTED: Illegal move: ROOK cannot go from a1 to a3',
        explanation: 'The rook moves in a straight line, but the pawn on a2 sits between a1 and a3. isPathClear returns false, so nothing changes.',
      },
      {
        title: 'Wrong turn',
        input: 'WHITE move g8 -> f6 (a black knight)',
        output: 'REJECTED: It is WHITE\'s turn, but g8 holds a BLACK KNIGHT',
        explanation: 'The turn guard runs before movement rules, so the game refuses to move the other side\'s piece.',
      },
      {
        title: 'Capture with a knight',
        input: 'WHITE move f3 -> e5 when a black pawn stands on e5',
        output: 'Move WHITE KNIGHT f3 -> e5 x BLACK PAWN, BLACK count 15',
        explanation: 'A knight jumps and needs no clear path. The target holds an enemy piece, so the capture is allowed and the pawn is removed.',
      },
      {
        title: 'Check and an illegal reply',
        input: 'WHITE h5 -> f7 captures a pawn; then BLACK tries a7 -> a6',
        output: 'check: BLACK is in check; then REJECTED: Illegal move: PAWN a7 -> a6 leaves BLACK king in check',
        explanation: 'The queen on f7 attacks the king on e8. The pawn move is fine in isolation, but after applying it the king is still attacked, so the game undoes it and rejects it. The knight capture on f7 is legal.',
      },
    ],
  },

  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },

  followUps: [
    {
      question: 'How would you add castling?',
      answer:
        "Add a hasMoved flag to King and Rook pieces (or track it in ChessGame). In ChessGame.move, detect a king moving two squares along its back rank, then check that the rook has not moved, the squares between are empty, and the king is not in check and does not pass through or land on an attacked square. If all hold, move both pieces and record it as one Move (or a Move with a secondary rook move). This is the point where per-type rule objects or a King subclass becomes worth it.",
    },
    {
      question: 'How would you support en passant?',
      answer:
        "Remember the last Move in history. If it was a pawn double step, then on the next turn an enemy pawn beside the landing square may capture diagonally onto the skipped square, and the captured pawn is the one that double-stepped, not the one on the target. That requires Move to store which square the captured piece sat on, because it is no longer the target. The option expires after one turn.",
    },
    {
      question: 'How would you handle pawn promotion?',
      answer:
        "When a pawn move ends on the last row, ChessGame replaces the pawn with a new Piece of a chosen type (usually queen) and records the promoted type on the Move. The move signature gains an optional promotion argument, or the game asks a callback. Undo restores the pawn from the Move.",
    },
    {
      question: 'How would you detect checkmate and stalemate?',
      answer:
        "After each move, check whether the side to move has any legal move. Generate candidate moves for each of its pieces by trying every target square with canMoveTo, then apply the same try-then-undo filter. If none survive, it is checkmate when isCheck is true and stalemate otherwise. For a standard board this is at most a few thousand cheap checks, so it is fast enough without optimization.",
    },
    {
      question: 'Why is Piece a single class and not a hierarchy?',
      answer:
        "In this scope each type only differs in a short, stateless rule. A switch is easier to scan than six files. If a piece gains its own state (king hasMoved, pawn en passant) or the rules grow, introduce per-type classes or MovementRule objects behind the same canMoveTo signature. I would say that in the interview rather than pretending one design is the only valid one.",
    },
    {
      question: 'How would you implement undo?',
      answer:
        "Pop the last Move from history, call board.movePiece(to, from), restore the captured piece on the to square if there is one, and flip the turn back. Because Move stores the piece and the captured piece, no extra snapshot is needed. Special moves (castling, en passant, promotion) need extra fields on Move so undo can reverse them.",
    },
    {
      question: 'How would you add an AI opponent?',
      answer:
        "Add a generateLegalMoves method (all candidate moves filtered by king safety) and a Player interface with chooseMove(game). A random player picks any legal move. A minimax player searches with an evaluation function over material and position. ChessGame stays the same because it only needs a from and to pair for each turn.",
    },
    {
      question: 'How would you make this a networked or persisted game?',
      answer:
        "Treat the move list as the source of truth. Store each Move (from, to, optional promotion) with a game id, and rebuild the board by replaying them on start. A server validates each submitted move using the same ChessGame, then broadcasts it. Optimistic concurrency on move number prevents two players from submitting at once.",
    },
    {
      question: 'How would you test the movement rules?',
      answer:
        "Build tiny boards with only the pieces under test and assert canMoveTo for legal and illegal targets: knight jumps, rook blocked by a friend, bishop blocked by an enemy (capture allowed on the blocker), pawn straight blocked, pawn diagonal only with a capture, king one step. Then test ChessGame with scripted openings and the king-safety cases (pinned piece, answering check).",
    },
  ],

  extras: {
    edgeCases: {
      heading: 'Edge cases worth handling (and saying out loud)',
      paragraphs: [
        "Input: bad square text such as z9 or e44 fails in Position.parse with a clear message. Moving from an empty square, moving the opponent's piece, and moving to the same square all fail without changing state.",
        "Movement: a rook, bishop, or queen blocked by any piece is illegal, but may capture an enemy blocker on the target square. A pawn cannot capture straight ahead, cannot move diagonally to an empty square, and cannot double step through a piece. A knight ignores blockers.",
        "King safety: moving a pinned piece, ignoring a check, and moving the king onto an attacked square are all rejected by try-then-undo, and the board is restored exactly, including any captured piece.",
        "Known gaps: no castling, en passant, promotion, checkmate, stalemate, or draw rules. A pawn reaching the last rank stays a pawn. Say this in the interview rather than hoping nobody asks.",
      ],
    },
    commonMistakes: {
      heading: 'Common mistakes to avoid',
      paragraphs: [
        "Trying to build a complete engine. The result is a half-working pile of special cases. Pick a scope, say it out loud, and finish it.",
        "Putting everything in a Game class: grid, rules, parsing, and printing. It runs, but nothing can be tested or extended on its own.",
        "Forgetting path checks for sliding pieces, or checking the target square as part of the path, which wrongly blocks captures.",
        "Getting pawn direction wrong for Black, or allowing the double step from any row.",
        "Letting a failed move leave partial changes: a captured piece removed but not restored, or the turn flipped before validation finished.",
      ],
      bullets: [
        'isPathClear including the target square (blocks every capture by sliders).',
        'Pawn diagonal move allowed onto an empty square.',
        'Pawn forward move allowed onto an occupied square.',
        'Not undoing the board when the self-check test fails.',
        'Mixing up row and column in the algebraic parse (e2 is column 4, row 1).',
      ],
    },
    testing: {
      heading: 'How to test this design',
      paragraphs: [
        "Unit test Position.parse with valid squares (a1, h8) and invalid ones (empty, i1, a9, a). Unit test Piece.canMoveTo on small hand-built boards, one case per rule and one blocked case per sliding piece.",
        "Integration test ChessGame with scripted games: the opening in the demo, a wrong-turn attempt, an illegal geometric attempt, and a self-check attempt. Assert that a rejected move leaves the board, turn, and history identical to before.",
        "A few property-style tests help: after any accepted move, the mover's king is not in check; piece counts only decrease on captures; history length equals the number of accepted moves.",
      ],
      bullets: [
        'Knight: all eight L targets from the center, none from a corner that go off board.',
        'Rook, bishop, queen: clear path, friendly blocker, enemy blocker capture.',
        'Pawn: single step, double step from start only, blocked forward, diagonal only to capture, direction per color.',
        'King: one step in eight directions, never two.',
        'isCheck: queen on a clear file, queen behind a blocker, pawn diagonal attack.',
        'Self-check: pinned piece move rejected, board restored.',
      ],
    },
    complexity: [
      'Position.parse: O(1).',
      'Piece.canMoveTo: O(1) for king, knight, and pawn; O(8) for sliding pieces because isPathClear walks at most 7 squares.',
      'ChessGame.move: O(1) validation plus one isCheck.',
      'isCheck: O(P) where P is at most 16 enemy pieces, each an O(8) path walk, so a few hundred operations at most.',
      'Board.render and piecesOf: O(64).',
      'Space: O(64) for the grid plus O(M) for M moves in history.',
    ],
    extensions: [
      'Castling, en passant, and promotion as special-move branches or MovementRule objects.',
      'Checkmate, stalemate, and draw detection using legal move generation.',
      'Undo and redo, plus PGN import and export.',
      'Standard algebraic notation (Nf3, exd5, O-O).',
      'Player abstraction with human, random, and minimax implementations.',
      'Game clocks and move timers.',
      'Persistence by storing the move list, and networked play with server-side validation.',
    ],
    takeaways: [
      'Scope first: say what you will build and what you will skip.',
      'Enums for fixed sets (Color, PieceType), a small value type for squares.',
      'Board owns geometry; Piece owns movement shape; ChessGame owns turns and king safety.',
      'A type-based switch beats six empty subclasses until rules gain state.',
      'Reuse canMoveTo for check detection instead of writing a second rule set.',
      'Try the move, test king safety, undo if unsafe.',
      'Log every step in the demo: mover, squares, capture, check, next turn, board.',
    ],
  },
}
