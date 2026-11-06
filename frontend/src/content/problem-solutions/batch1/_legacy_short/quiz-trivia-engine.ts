import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('qg', 'QuizGame', 40, 40, [
    attr('-', 'questions', 'List<Question>'),
    attr('-', 'players', 'Map<string, Player>'),
    attr('-', 'state', 'GameState'),
    attr('-', 'currentIndex', 'int'),
    attr('-', 'startedAt', 'long'),
    attr('-', 'answers', 'Map<string, Answer>'),
    attr('-', 'scoring', 'ScoringStrategy'),
    attr('-', 'clock', 'Clock'),
  ], [
    method('+', 'addPlayer', 'name: string', 'Player'),
    method('+', 'start', '', 'void'),
    method('+', 'submitAnswer', 'playerId, optionIndex', 'void'),
    method('+', 'tick', '', 'GameState'),
    method('+', 'closeQuestion', '', 'QuestionResult'),
    method('+', 'showLeaderboard', '', 'List<LeaderboardEntry>'),
    method('+', 'nextQuestion', '', 'GameState'),
  ], 'state machine'),
  enm('gs', 'GameState', 40, 400, ['WAITING', 'QUESTION_ACTIVE', 'REVEAL', 'LEADERBOARD', 'FINISHED']),
  cls('qs', 'Question', 420, 20, [
    attr('-', 'id', 'string'),
    attr('-', 'text', 'string'),
    attr('-', 'options', 'List<string>'),
    attr('-', 'correctIndex', 'int'),
    attr('-', 'timeLimitMs', 'long'),
  ], [
    method('+', 'fromDict', 'raw: Map', 'Question', { isStatic: true }),
  ]),
  cls('pl', 'Player', 420, 230, [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'score', 'int'),
    attr('-', 'correctCount', 'int'),
    attr('-', 'tieBreakMs', 'long'),
  ], []),
  cls('an', 'Answer', 420, 420, [
    attr('-', 'playerId', 'string'),
    attr('-', 'optionIndex', 'int'),
    attr('-', 'elapsedMs', 'long'),
  ], []),
  iface('ss', 'ScoringStrategy', 760, 20, [
    method('+', 'score', 'q: Question, correct: bool, elapsedMs: long', 'int'),
  ]),
  cls('sb', 'SpeedBonusScoring', 760, 140, [
    attr('-', 'base', 'int'),
    attr('-', 'maxBonus', 'int'),
  ], [
    method('+', 'score', 'q, correct, elapsedMs', 'int'),
  ]),
  cls('lb', 'Leaderboard', 760, 300, [], [
    method('+', 'rank', 'players: Collection<Player>', 'List<LeaderboardEntry>', { isStatic: true }),
  ]),
  cls('le', 'LeaderboardEntry', 760, 430, [
    attr('-', 'rank', 'int'),
    attr('-', 'playerId', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'score', 'int'),
  ], []),
]

const edges = [
  edge('e1', 'qg', 'qs', 'composition', 'right@20', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1..*' }),
  edge('e2', 'qg', 'pl', 'aggregation', 'right@55', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1..*' }),
  edge('e3', 'qg', 'an', 'association', 'right@90', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'current question' }),
  edge('e4', 'qg', 'gs', 'dependency', 'bottom', 'top', { label: 'transitions' }),
  edge('e5', 'qg', 'ss', 'aggregation', 'top', 'left', { label: 'scores with' }),
  edge('e6', 'sb', 'ss', 'realization', 'top', 'bottom'),
  edge('e7', 'qg', 'lb', 'dependency', 'bottom@70', 'left', { label: 'ranks' }),
  edge('e8', 'lb', 'le', 'dependency', 'bottom', 'top'),
  edge('e9', 'an', 'pl', 'association', 'top', 'bottom', { label: 'by' }),
]

const py = `from __future__ import annotations
import threading
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Callable, Dict, List, Optional


class GameState(Enum):
    WAITING = "WAITING"
    QUESTION_ACTIVE = "QUESTION_ACTIVE"
    REVEAL = "REVEAL"
    LEADERBOARD = "LEADERBOARD"
    FINISHED = "FINISHED"


_ALLOWED = {
    GameState.WAITING: {GameState.QUESTION_ACTIVE},
    GameState.QUESTION_ACTIVE: {GameState.REVEAL},
    GameState.REVEAL: {GameState.LEADERBOARD},
    GameState.LEADERBOARD: {GameState.QUESTION_ACTIVE, GameState.FINISHED},
    GameState.FINISHED: set(),
}

Clock = Callable[[], int]  # returns epoch milliseconds


def system_clock() -> int:
    return int(time.time() * 1000)


@dataclass(frozen=True)
class Question:
    id: str
    text: str
    options: List[str]
    correct_index: int
    time_limit_ms: int = 15_000

    def __post_init__(self) -> None:
        if len(self.options) < 2:
            raise ValueError("a question needs at least two options")
        if not 0 <= self.correct_index < len(self.options):
            raise ValueError("correct_index out of range")
        if self.time_limit_ms <= 0:
            raise ValueError("time limit must be positive")

    @staticmethod
    def from_dict(raw: dict) -> "Question":
        return Question(
            id=str(raw.get("id") or uuid.uuid4()),
            text=raw["text"],
            options=list(raw["options"]),
            correct_index=int(raw["correct_index"]),
            time_limit_ms=int(raw.get("time_limit_ms", 15_000)),
        )


@dataclass
class Player:
    id: str
    name: str
    score: int = 0
    correct_count: int = 0
    tie_break_ms: int = 0  # total time spent on correct answers (lower is better)


@dataclass(frozen=True)
class Answer:
    player_id: str
    option_index: int
    elapsed_ms: int


@dataclass(frozen=True)
class QuestionResult:
    question_id: str
    correct_index: int
    points: Dict[str, int]


@dataclass(frozen=True)
class LeaderboardEntry:
    rank: int
    player_id: str
    name: str
    score: int


class ScoringStrategy(ABC):
    @abstractmethod
    def score(self, question: Question, correct: bool, elapsed_ms: int) -> int:
        ...


class SpeedBonusScoring(ScoringStrategy):
    """base points for a correct answer + up to max_bonus for answering quickly."""

    def __init__(self, base: int = 1000, max_bonus: int = 500):
        self.base, self.max_bonus = base, max_bonus

    def score(self, question: Question, correct: bool, elapsed_ms: int) -> int:
        if not correct:
            return 0
        remaining = max(0, question.time_limit_ms - elapsed_ms)
        return self.base + self.max_bonus * remaining // question.time_limit_ms


class Leaderboard:
    @staticmethod
    def rank(players: List[Player]) -> List[LeaderboardEntry]:
        ordered = sorted(players, key=lambda p: (-p.score, p.tie_break_ms, p.name))
        out: List[LeaderboardEntry] = []
        for i, p in enumerate(ordered):
            if out and (ordered[i - 1].score, ordered[i - 1].tie_break_ms) == (p.score, p.tie_break_ms):
                rank = out[-1].rank  # true tie shares a rank
            else:
                rank = i + 1
            out.append(LeaderboardEntry(rank, p.id, p.name, p.score))
        return out


class QuizGame:
    """One game session. One player = single-player mode; many = multiplayer."""

    def __init__(self, questions: List[Question], scoring: Optional[ScoringStrategy] = None,
                 clock: Clock = system_clock):
        if not questions:
            raise ValueError("at least one question is required")
        self._questions = list(questions)
        self._scoring = scoring or SpeedBonusScoring()
        self._clock = clock
        self._players: Dict[str, Player] = {}
        self._state = GameState.WAITING
        self._index = -1
        self._started_at = 0
        self._answers: Dict[str, Answer] = {}
        self._lock = threading.RLock()

    @staticmethod
    def load(raw_questions: List[dict], **kwargs) -> "QuizGame":
        return QuizGame([Question.from_dict(r) for r in raw_questions], **kwargs)

    @property
    def state(self) -> GameState:
        return self._state

    def add_player(self, name: str) -> Player:
        with self._lock:
            if self._state is not GameState.WAITING:
                raise RuntimeError("players can only join while waiting")
            player = Player(id=str(uuid.uuid4()), name=name)
            self._players[player.id] = player
            return player

    def start(self) -> None:
        with self._lock:
            if not self._players:
                raise RuntimeError("need at least one player")
            self._open_question(0)

    def current_question(self) -> Question:
        with self._lock:
            if self._state is not GameState.QUESTION_ACTIVE:
                raise RuntimeError("no active question")
            return self._questions[self._index]

    def submit_answer(self, player_id: str, option_index: int) -> None:
        with self._lock:
            if self._state is not GameState.QUESTION_ACTIVE:
                raise RuntimeError("question is not active")
            if player_id not in self._players:
                raise KeyError("unknown player")
            if player_id in self._answers:
                raise RuntimeError("already answered")
            q = self._questions[self._index]
            if not 0 <= option_index < len(q.options):
                raise ValueError("invalid option")
            elapsed = self._clock() - self._started_at
            if elapsed > q.time_limit_ms:
                raise TimeoutError("time is up")
            self._answers[player_id] = Answer(player_id, option_index, elapsed)
            if len(self._answers) == len(self._players):
                self._close_locked()  # everyone answered: reveal early

    def tick(self) -> GameState:
        """Call from a timer; closes the question when its time limit elapses."""
        with self._lock:
            if self._state is GameState.QUESTION_ACTIVE:
                q = self._questions[self._index]
                if self._clock() - self._started_at >= q.time_limit_ms:
                    self._close_locked()
            return self._state

    def close_question(self) -> QuestionResult:
        with self._lock:
            if self._state is not GameState.QUESTION_ACTIVE:
                raise RuntimeError("no active question")
            return self._close_locked()

    def show_leaderboard(self) -> List[LeaderboardEntry]:
        with self._lock:
            self._move(GameState.LEADERBOARD)
            return self.leaderboard()

    def next_question(self) -> GameState:
        with self._lock:
            if self._state is not GameState.LEADERBOARD:
                raise RuntimeError("show the leaderboard first")
            if self._index + 1 < len(self._questions):
                self._open_question(self._index + 1)
            else:
                self._move(GameState.FINISHED)
            return self._state

    def leaderboard(self) -> List[LeaderboardEntry]:
        with self._lock:
            return Leaderboard.rank(list(self._players.values()))

    # ---- internals ----
    def _move(self, target: GameState) -> None:
        if target not in _ALLOWED[self._state]:
            raise RuntimeError("illegal transition %s -> %s" % (self._state.value, target.value))
        self._state = target

    def _open_question(self, index: int) -> None:
        self._move(GameState.QUESTION_ACTIVE)
        self._index = index
        self._answers = {}
        self._started_at = self._clock()

    def _close_locked(self) -> QuestionResult:
        q = self._questions[self._index]
        points: Dict[str, int] = {}
        for p in self._players.values():
            a = self._answers.get(p.id)
            pts = 0
            if a is not None and a.option_index == q.correct_index:
                pts = self._scoring.score(q, True, a.elapsed_ms)
                p.correct_count += 1
                p.tie_break_ms += a.elapsed_ms
            p.score += pts
            points[p.id] = pts
        self._move(GameState.REVEAL)
        return QuestionResult(q.id, q.correct_index, points)


def demo() -> None:
    now = [0]
    game = QuizGame.load(
        [
            {"id": "q1", "text": "2 + 2?", "options": ["3", "4", "5"], "correct_index": 1,
             "time_limit_ms": 10_000},
            {"id": "q2", "text": "Capital of France?", "options": ["Paris", "Rome"], "correct_index": 0,
             "time_limit_ms": 10_000},
        ],
        clock=lambda: now[0],
    )
    alice, bob = game.add_player("Alice"), game.add_player("Bob")
    game.start()
    now[0] = 2_000
    game.submit_answer(alice.id, 1)   # correct, fast: 1000 + 500*8000//10000 = 1400
    now[0] = 6_000
    game.submit_answer(bob.id, 1)     # correct, slower: 1000 + 500*4000//10000 = 1200
    print(game.close_question() if game.state is GameState.QUESTION_ACTIVE else "auto-revealed")
    print(game.show_leaderboard())
    game.next_question()
    game.tick()
    now[0] += 10_000
    game.tick()                        # time up, nobody answered
    game.show_leaderboard()
    print(game.next_question(), game.leaderboard())


if __name__ == "__main__":
    demo()
`

const java = `import java.util.*;
import java.util.stream.Collectors;

enum GameState { WAITING, QUESTION_ACTIVE, REVEAL, LEADERBOARD, FINISHED }

interface Clock { long nowMs(); }

record Question(String id, String text, List<String> options, int correctIndex, long timeLimitMs) {
  Question {
    if (options == null || options.size() < 2) throw new IllegalArgumentException("need >= 2 options");
    if (correctIndex < 0 || correctIndex >= options.size()) throw new IllegalArgumentException("bad correctIndex");
    if (timeLimitMs <= 0) throw new IllegalArgumentException("time limit must be positive");
    options = List.copyOf(options);
  }
  static Question fromMap(Map<String, Object> raw) {
    @SuppressWarnings("unchecked") List<String> opts = (List<String>) raw.get("options");
    return new Question(
        String.valueOf(raw.getOrDefault("id", UUID.randomUUID().toString())),
        (String) raw.get("text"), opts,
        ((Number) raw.get("correctIndex")).intValue(),
        ((Number) raw.getOrDefault("timeLimitMs", 15_000)).longValue());
  }
}

class Player {
  final String id, name;
  int score, correctCount; long tieBreakMs;
  Player(String id, String name) { this.id = id; this.name = name; }
}

record Answer(String playerId, int optionIndex, long elapsedMs) {}
record QuestionResult(String questionId, int correctIndex, Map<String, Integer> points) {}
record LeaderboardEntry(int rank, String playerId, String name, int score) {}

interface ScoringStrategy { int score(Question q, boolean correct, long elapsedMs); }

class SpeedBonusScoring implements ScoringStrategy {
  private final int base, maxBonus;
  SpeedBonusScoring(int base, int maxBonus) { this.base = base; this.maxBonus = maxBonus; }
  public int score(Question q, boolean correct, long elapsedMs) {
    if (!correct) return 0;
    long remaining = Math.max(0, q.timeLimitMs() - elapsedMs);
    return base + (int) (maxBonus * remaining / q.timeLimitMs());
  }
}

class Leaderboard {
  static List<LeaderboardEntry> rank(Collection<Player> players) {
    List<Player> sorted = players.stream()
        .sorted(Comparator.<Player>comparingInt(p -> -p.score)
            .thenComparingLong(p -> p.tieBreakMs).thenComparing(p -> p.name))
        .collect(Collectors.toList());
    List<LeaderboardEntry> out = new ArrayList<>();
    for (int i = 0; i < sorted.size(); i++) {
      Player p = sorted.get(i);
      int rank = i + 1;
      if (i > 0) {
        Player prev = sorted.get(i - 1);
        if (prev.score == p.score && prev.tieBreakMs == p.tieBreakMs) rank = out.get(i - 1).rank();
      }
      out.add(new LeaderboardEntry(rank, p.id, p.name, p.score));
    }
    return out;
  }
}

class QuizGame {
  private static final Map<GameState, Set<GameState>> ALLOWED = new EnumMap<>(GameState.class);
  static {
    ALLOWED.put(GameState.WAITING, EnumSet.of(GameState.QUESTION_ACTIVE));
    ALLOWED.put(GameState.QUESTION_ACTIVE, EnumSet.of(GameState.REVEAL));
    ALLOWED.put(GameState.REVEAL, EnumSet.of(GameState.LEADERBOARD));
    ALLOWED.put(GameState.LEADERBOARD, EnumSet.of(GameState.QUESTION_ACTIVE, GameState.FINISHED));
    ALLOWED.put(GameState.FINISHED, EnumSet.noneOf(GameState.class));
  }

  private final List<Question> questions;
  private final ScoringStrategy scoring;
  private final Clock clock;
  private final Map<String, Player> players = new LinkedHashMap<>();
  private final Map<String, Answer> answers = new HashMap<>();
  private GameState state = GameState.WAITING;
  private int index = -1;
  private long startedAt;

  QuizGame(List<Question> questions, ScoringStrategy scoring, Clock clock) {
    if (questions.isEmpty()) throw new IllegalArgumentException("at least one question");
    this.questions = List.copyOf(questions); this.scoring = scoring; this.clock = clock;
  }

  synchronized GameState state() { return state; }

  synchronized Player addPlayer(String name) {
    if (state != GameState.WAITING) throw new IllegalStateException("players join while waiting");
    Player p = new Player(UUID.randomUUID().toString(), name);
    players.put(p.id, p);
    return p;
  }

  synchronized void start() {
    if (players.isEmpty()) throw new IllegalStateException("need a player");
    openQuestion(0);
  }

  synchronized Question currentQuestion() {
    if (state != GameState.QUESTION_ACTIVE) throw new IllegalStateException("no active question");
    return questions.get(index);
  }

  synchronized void submitAnswer(String playerId, int optionIndex) {
    if (state != GameState.QUESTION_ACTIVE) throw new IllegalStateException("question not active");
    if (!players.containsKey(playerId)) throw new NoSuchElementException("unknown player");
    if (answers.containsKey(playerId)) throw new IllegalStateException("already answered");
    Question q = questions.get(index);
    if (optionIndex < 0 || optionIndex >= q.options().size()) throw new IllegalArgumentException("bad option");
    long elapsed = clock.nowMs() - startedAt;
    if (elapsed > q.timeLimitMs()) throw new IllegalStateException("time is up");
    answers.put(playerId, new Answer(playerId, optionIndex, elapsed));
    if (answers.size() == players.size()) closeLocked(); // everyone answered
  }

  /** Call from a timer: closes the question once the limit has elapsed. */
  synchronized GameState tick() {
    if (state == GameState.QUESTION_ACTIVE
        && clock.nowMs() - startedAt >= questions.get(index).timeLimitMs()) closeLocked();
    return state;
  }

  synchronized QuestionResult closeQuestion() {
    if (state != GameState.QUESTION_ACTIVE) throw new IllegalStateException("no active question");
    return closeLocked();
  }

  synchronized List<LeaderboardEntry> showLeaderboard() {
    move(GameState.LEADERBOARD);
    return leaderboard();
  }

  synchronized GameState nextQuestion() {
    if (state != GameState.LEADERBOARD) throw new IllegalStateException("show leaderboard first");
    if (index + 1 < questions.size()) openQuestion(index + 1); else move(GameState.FINISHED);
    return state;
  }

  synchronized List<LeaderboardEntry> leaderboard() { return Leaderboard.rank(players.values()); }

  private void move(GameState target) {
    if (!ALLOWED.get(state).contains(target))
      throw new IllegalStateException("illegal transition " + state + " -> " + target);
    state = target;
  }

  private void openQuestion(int i) {
    move(GameState.QUESTION_ACTIVE);
    index = i; answers.clear(); startedAt = clock.nowMs();
  }

  private QuestionResult closeLocked() {
    Question q = questions.get(index);
    Map<String, Integer> points = new LinkedHashMap<>();
    for (Player p : players.values()) {
      Answer a = answers.get(p.id);
      int pts = 0;
      if (a != null && a.optionIndex() == q.correctIndex()) {
        pts = scoring.score(q, true, a.elapsedMs());
        p.correctCount++; p.tieBreakMs += a.elapsedMs();
      }
      p.score += pts; points.put(p.id, pts);
    }
    move(GameState.REVEAL);
    return new QuestionResult(q.id(), q.correctIndex(), points);
  }
}

class Demo {
  public static void main(String[] args) {
    long[] now = {0};
    QuizGame g = new QuizGame(List.of(
        new Question("q1", "2 + 2?", List.of("3", "4", "5"), 1, 10_000),
        new Question("q2", "Capital of France?", List.of("Paris", "Rome"), 0, 10_000)),
        new SpeedBonusScoring(1000, 500), () -> now[0]);
    Player alice = g.addPlayer("Alice"), bob = g.addPlayer("Bob");
    g.start();
    now[0] = 2_000; g.submitAnswer(alice.id, 1);  // 1400
    now[0] = 6_000; g.submitAnswer(bob.id, 1);    // 1200 -> all answered => REVEAL
    System.out.println(g.state() + " " + g.showLeaderboard());
    g.nextQuestion();
    now[0] += 10_000; g.tick();                   // nobody answered
    g.showLeaderboard();
    System.out.println(g.nextQuestion() + " " + g.leaderboard());
  }
}
`

const ts = `type GameState = 'WAITING' | 'QUESTION_ACTIVE' | 'REVEAL' | 'LEADERBOARD' | 'FINISHED'

const ALLOWED: Record<GameState, GameState[]> = {
  WAITING: ['QUESTION_ACTIVE'],
  QUESTION_ACTIVE: ['REVEAL'],
  REVEAL: ['LEADERBOARD'],
  LEADERBOARD: ['QUESTION_ACTIVE', 'FINISHED'],
  FINISHED: [],
}

type Clock = () => number // epoch ms

class Question {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly options: readonly string[],
    public readonly correctIndex: number,
    public readonly timeLimitMs = 15_000,
  ) {
    if (options.length < 2) throw new Error('need at least two options')
    if (correctIndex < 0 || correctIndex >= options.length) throw new Error('bad correctIndex')
    if (timeLimitMs <= 0) throw new Error('time limit must be positive')
  }

  static fromJSON(raw: { id?: string; text: string; options: string[]; correctIndex: number; timeLimitMs?: number }) {
    return new Question(raw.id ?? crypto.randomUUID(), raw.text, raw.options, raw.correctIndex, raw.timeLimitMs)
  }
}

class Player {
  score = 0
  correctCount = 0
  tieBreakMs = 0 // total time on correct answers; lower wins ties
  constructor(public readonly id: string, public readonly name: string) {}
}

interface Answer { playerId: string; optionIndex: number; elapsedMs: number }
interface QuestionResult { questionId: string; correctIndex: number; points: Record<string, number> }
interface LeaderboardEntry { rank: number; playerId: string; name: string; score: number }

interface ScoringStrategy {
  score(q: Question, correct: boolean, elapsedMs: number): number
}

class SpeedBonusScoring implements ScoringStrategy {
  constructor(private base = 1000, private maxBonus = 500) {}
  score(q: Question, correct: boolean, elapsedMs: number): number {
    if (!correct) return 0
    const remaining = Math.max(0, q.timeLimitMs - elapsedMs)
    return this.base + Math.floor((this.maxBonus * remaining) / q.timeLimitMs)
  }
}

class Leaderboard {
  static rank(players: Iterable<Player>): LeaderboardEntry[] {
    const sorted = [...players].sort(
      (a, b) => b.score - a.score || a.tieBreakMs - b.tieBreakMs || a.name.localeCompare(b.name),
    )
    const out: LeaderboardEntry[] = []
    sorted.forEach((p, i) => {
      const prev = sorted[i - 1]
      const tied = prev && prev.score === p.score && prev.tieBreakMs === p.tieBreakMs
      out.push({ rank: tied ? out[i - 1].rank : i + 1, playerId: p.id, name: p.name, score: p.score })
    })
    return out
  }
}

class QuizGame {
  private players = new Map<string, Player>()
  private answers = new Map<string, Answer>()
  private _state: GameState = 'WAITING'
  private index = -1
  private startedAt = 0

  constructor(
    private questions: Question[],
    private scoring: ScoringStrategy = new SpeedBonusScoring(),
    private clock: Clock = Date.now,
  ) {
    if (questions.length === 0) throw new Error('at least one question is required')
  }

  get state(): GameState { return this._state }

  addPlayer(name: string): Player {
    if (this._state !== 'WAITING') throw new Error('players can only join while waiting')
    const p = new Player(crypto.randomUUID(), name)
    this.players.set(p.id, p)
    return p
  }

  start(): void {
    if (this.players.size === 0) throw new Error('need at least one player')
    this.openQuestion(0)
  }

  currentQuestion(): Question {
    if (this._state !== 'QUESTION_ACTIVE') throw new Error('no active question')
    return this.questions[this.index]
  }

  submitAnswer(playerId: string, optionIndex: number): void {
    if (this._state !== 'QUESTION_ACTIVE') throw new Error('question is not active')
    if (!this.players.has(playerId)) throw new Error('unknown player')
    if (this.answers.has(playerId)) throw new Error('already answered')
    const q = this.questions[this.index]
    if (optionIndex < 0 || optionIndex >= q.options.length) throw new Error('invalid option')
    const elapsedMs = this.clock() - this.startedAt
    if (elapsedMs > q.timeLimitMs) throw new Error('time is up')
    this.answers.set(playerId, { playerId, optionIndex, elapsedMs })
    if (this.answers.size === this.players.size) this.closeInternal() // everyone answered
  }

  /** Call from setInterval / setTimeout: closes the question when time runs out. */
  tick(): GameState {
    if (this._state === 'QUESTION_ACTIVE' &&
        this.clock() - this.startedAt >= this.questions[this.index].timeLimitMs) {
      this.closeInternal()
    }
    return this._state
  }

  closeQuestion(): QuestionResult {
    if (this._state !== 'QUESTION_ACTIVE') throw new Error('no active question')
    return this.closeInternal()
  }

  showLeaderboard(): LeaderboardEntry[] {
    this.move('LEADERBOARD')
    return this.leaderboard()
  }

  nextQuestion(): GameState {
    if (this._state !== 'LEADERBOARD') throw new Error('show the leaderboard first')
    if (this.index + 1 < this.questions.length) this.openQuestion(this.index + 1)
    else this.move('FINISHED')
    return this._state
  }

  leaderboard(): LeaderboardEntry[] { return Leaderboard.rank(this.players.values()) }

  private move(target: GameState) {
    if (!ALLOWED[this._state].includes(target)) {
      throw new Error('illegal transition ' + this._state + ' -> ' + target)
    }
    this._state = target
  }

  private openQuestion(i: number) {
    this.move('QUESTION_ACTIVE')
    this.index = i
    this.answers.clear()
    this.startedAt = this.clock()
  }

  private closeInternal(): QuestionResult {
    const q = this.questions[this.index]
    const points: Record<string, number> = {}
    for (const p of this.players.values()) {
      const a = this.answers.get(p.id)
      let pts = 0
      if (a && a.optionIndex === q.correctIndex) {
        pts = this.scoring.score(q, true, a.elapsedMs)
        p.correctCount++
        p.tieBreakMs += a.elapsedMs
      }
      p.score += pts
      points[p.id] = pts
    }
    this.move('REVEAL')
    return { questionId: q.id, correctIndex: q.correctIndex, points }
  }
}

export { QuizGame, Question, SpeedBonusScoring, Leaderboard }
export type { GameState, ScoringStrategy, LeaderboardEntry, QuestionResult }
`

const cpp = `#include <algorithm>
#include <functional>
#include <iostream>
#include <map>
#include <memory>
#include <mutex>
#include <set>
#include <stdexcept>
#include <string>
#include <vector>

enum class GameState { Waiting, QuestionActive, Reveal, Leaderboard, Finished };

static const char* name(GameState s) {
  switch (s) {
    case GameState::Waiting: return "WAITING";
    case GameState::QuestionActive: return "QUESTION_ACTIVE";
    case GameState::Reveal: return "REVEAL";
    case GameState::Leaderboard: return "LEADERBOARD";
    default: return "FINISHED";
  }
}

static bool allowed(GameState from, GameState to) {
  switch (from) {
    case GameState::Waiting: return to == GameState::QuestionActive;
    case GameState::QuestionActive: return to == GameState::Reveal;
    case GameState::Reveal: return to == GameState::Leaderboard;
    case GameState::Leaderboard: return to == GameState::QuestionActive || to == GameState::Finished;
    default: return false;
  }
}

using Clock = std::function<long long()>;  // epoch milliseconds

struct Question {
  std::string id, text;
  std::vector<std::string> options;
  int correctIndex;
  long long timeLimitMs = 15000;

  void validate() const {
    if (options.size() < 2) throw std::invalid_argument("need >= 2 options");
    if (correctIndex < 0 || correctIndex >= static_cast<int>(options.size()))
      throw std::invalid_argument("bad correctIndex");
    if (timeLimitMs <= 0) throw std::invalid_argument("time limit must be positive");
  }
};

struct Player {
  std::string id, name;
  int score = 0, correctCount = 0;
  long long tieBreakMs = 0;  // total time on correct answers; lower wins ties
};

struct Answer { std::string playerId; int optionIndex; long long elapsedMs; };
struct QuestionResult { std::string questionId; int correctIndex; std::map<std::string, int> points; };
struct LeaderboardEntry { int rank; std::string playerId, name; int score; };

struct ScoringStrategy {
  virtual ~ScoringStrategy() = default;
  virtual int score(const Question& q, bool correct, long long elapsedMs) const = 0;
};

class SpeedBonusScoring : public ScoringStrategy {
  int base_, maxBonus_;
public:
  SpeedBonusScoring(int base = 1000, int maxBonus = 500) : base_(base), maxBonus_(maxBonus) {}
  int score(const Question& q, bool correct, long long elapsedMs) const override {
    if (!correct) return 0;
    long long remaining = std::max(0LL, q.timeLimitMs - elapsedMs);
    return base_ + static_cast<int>(maxBonus_ * remaining / q.timeLimitMs);
  }
};

struct Leaderboard {
  static std::vector<LeaderboardEntry> rank(std::vector<Player> players) {
    std::sort(players.begin(), players.end(), [](const Player& a, const Player& b) {
      if (a.score != b.score) return a.score > b.score;
      if (a.tieBreakMs != b.tieBreakMs) return a.tieBreakMs < b.tieBreakMs;
      return a.name < b.name;
    });
    std::vector<LeaderboardEntry> out;
    for (size_t i = 0; i < players.size(); ++i) {
      int r = static_cast<int>(i) + 1;
      if (i > 0 && players[i - 1].score == players[i].score &&
          players[i - 1].tieBreakMs == players[i].tieBreakMs)
        r = out[i - 1].rank;
      out.push_back({r, players[i].id, players[i].name, players[i].score});
    }
    return out;
  }
};

class QuizGame {
  std::vector<Question> questions_;
  std::unique_ptr<ScoringStrategy> scoring_;
  Clock clock_;
  std::vector<Player> players_;
  std::map<std::string, Answer> answers_;
  GameState state_ = GameState::Waiting;
  int index_ = -1;
  long long startedAt_ = 0;
  int nextId_ = 1;
  mutable std::mutex mu_;

public:
  QuizGame(std::vector<Question> questions, std::unique_ptr<ScoringStrategy> scoring, Clock clock)
      : questions_(std::move(questions)), scoring_(std::move(scoring)), clock_(std::move(clock)) {
    if (questions_.empty()) throw std::invalid_argument("at least one question is required");
    for (auto& q : questions_) q.validate();
  }

  GameState state() const { std::lock_guard<std::mutex> lk(mu_); return state_; }

  std::string addPlayer(const std::string& playerName) {
    std::lock_guard<std::mutex> lk(mu_);
    if (state_ != GameState::Waiting) throw std::logic_error("players join while waiting");
    Player p; p.id = "p" + std::to_string(nextId_++); p.name = playerName;
    players_.push_back(p);
    return p.id;
  }

  void start() {
    std::lock_guard<std::mutex> lk(mu_);
    if (players_.empty()) throw std::logic_error("need at least one player");
    openQuestion(0);
  }

  Question currentQuestion() const {
    std::lock_guard<std::mutex> lk(mu_);
    if (state_ != GameState::QuestionActive) throw std::logic_error("no active question");
    return questions_[index_];
  }

  void submitAnswer(const std::string& playerId, int optionIndex) {
    std::lock_guard<std::mutex> lk(mu_);
    if (state_ != GameState::QuestionActive) throw std::logic_error("question not active");
    if (std::none_of(players_.begin(), players_.end(),
                     [&](const Player& p) { return p.id == playerId; }))
      throw std::out_of_range("unknown player");
    if (answers_.count(playerId)) throw std::logic_error("already answered");
    const Question& q = questions_[index_];
    if (optionIndex < 0 || optionIndex >= static_cast<int>(q.options.size()))
      throw std::invalid_argument("bad option");
    long long elapsed = clock_() - startedAt_;
    if (elapsed > q.timeLimitMs) throw std::logic_error("time is up");
    answers_[playerId] = {playerId, optionIndex, elapsed};
    if (answers_.size() == players_.size()) closeLocked();  // everyone answered
  }

  // Call from a timer: closes the question when the limit has elapsed.
  GameState tick() {
    std::lock_guard<std::mutex> lk(mu_);
    if (state_ == GameState::QuestionActive &&
        clock_() - startedAt_ >= questions_[index_].timeLimitMs)
      closeLocked();
    return state_;
  }

  QuestionResult closeQuestion() {
    std::lock_guard<std::mutex> lk(mu_);
    if (state_ != GameState::QuestionActive) throw std::logic_error("no active question");
    return closeLocked();
  }

  std::vector<LeaderboardEntry> showLeaderboard() {
    std::lock_guard<std::mutex> lk(mu_);
    move(GameState::Leaderboard);
    return Leaderboard::rank(players_);
  }

  GameState nextQuestion() {
    std::lock_guard<std::mutex> lk(mu_);
    if (state_ != GameState::Leaderboard) throw std::logic_error("show leaderboard first");
    if (index_ + 1 < static_cast<int>(questions_.size())) openQuestion(index_ + 1);
    else move(GameState::Finished);
    return state_;
  }

  std::vector<LeaderboardEntry> leaderboard() const {
    std::lock_guard<std::mutex> lk(mu_);
    return Leaderboard::rank(players_);
  }

private:
  void move(GameState target) {
    if (!allowed(state_, target))
      throw std::logic_error(std::string("illegal transition ") + name(state_) + " -> " + name(target));
    state_ = target;
  }

  void openQuestion(int i) {
    move(GameState::QuestionActive);
    index_ = i;
    answers_.clear();
    startedAt_ = clock_();
  }

  QuestionResult closeLocked() {
    const Question& q = questions_[index_];
    QuestionResult res{q.id, q.correctIndex, {}};
    for (auto& p : players_) {
      int pts = 0;
      auto it = answers_.find(p.id);
      if (it != answers_.end() && it->second.optionIndex == q.correctIndex) {
        pts = scoring_->score(q, true, it->second.elapsedMs);
        p.correctCount++;
        p.tieBreakMs += it->second.elapsedMs;
      }
      p.score += pts;
      res.points[p.id] = pts;
    }
    move(GameState::Reveal);
    return res;
  }
};

int main() {
  long long now = 0;
  QuizGame g({{"q1", "2 + 2?", {"3", "4", "5"}, 1, 10000},
              {"q2", "Capital of France?", {"Paris", "Rome"}, 0, 10000}},
             std::make_unique<SpeedBonusScoring>(), [&now] { return now; });
  auto alice = g.addPlayer("Alice");
  auto bob = g.addPlayer("Bob");
  g.start();
  now = 2000; g.submitAnswer(alice, 1);  // 1400
  now = 6000; g.submitAnswer(bob, 1);    // 1200 -> REVEAL
  for (auto& e : g.showLeaderboard()) std::cout << e.rank << " " << e.name << " " << e.score << "\\n";
  g.nextQuestion();
  now += 10000; g.tick();                // nobody answered
  g.showLeaderboard();
  std::cout << name(g.nextQuestion()) << "\\n";
}
`

const goCode = `package main

import (
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"
)

type GameState int

const (
	Waiting GameState = iota
	QuestionActive
	Reveal
	LeaderboardState
	Finished
)

func (s GameState) String() string {
	return [...]string{"WAITING", "QUESTION_ACTIVE", "REVEAL", "LEADERBOARD", "FINISHED"}[s]
}

var allowed = map[GameState][]GameState{
	Waiting:          {QuestionActive},
	QuestionActive:   {Reveal},
	Reveal:           {LeaderboardState},
	LeaderboardState: {QuestionActive, Finished},
	Finished:         {},
}

var (
	ErrBadState      = errors.New("illegal state for this operation")
	ErrUnknownPlayer = errors.New("unknown player")
	ErrAnswered      = errors.New("already answered")
	ErrBadOption     = errors.New("invalid option")
	ErrTimeUp        = errors.New("time is up")
)

type Clock func() int64 // epoch ms

func SystemClock() int64 { return time.Now().UnixMilli() }

type Question struct {
	ID           string
	Text         string
	Options      []string
	CorrectIndex int
	TimeLimitMs  int64
}

func NewQuestion(id, text string, options []string, correct int, limitMs int64) (Question, error) {
	if len(options) < 2 {
		return Question{}, errors.New("need at least two options")
	}
	if correct < 0 || correct >= len(options) {
		return Question{}, errors.New("correct index out of range")
	}
	if limitMs <= 0 {
		return Question{}, errors.New("time limit must be positive")
	}
	return Question{id, text, options, correct, limitMs}, nil
}

type Player struct {
	ID, Name     string
	Score        int
	CorrectCount int
	TieBreakMs   int64 // total time on correct answers; lower wins ties
}

type Answer struct {
	PlayerID    string
	OptionIndex int
	ElapsedMs   int64
}

type QuestionResult struct {
	QuestionID   string
	CorrectIndex int
	Points       map[string]int
}

type LeaderboardEntry struct {
	Rank     int
	PlayerID string
	Name     string
	Score    int
}

type ScoringStrategy interface {
	Score(q Question, correct bool, elapsedMs int64) int
}

type SpeedBonusScoring struct{ Base, MaxBonus int }

func (s SpeedBonusScoring) Score(q Question, correct bool, elapsedMs int64) int {
	if !correct {
		return 0
	}
	remaining := q.TimeLimitMs - elapsedMs
	if remaining < 0 {
		remaining = 0
	}
	return s.Base + int(int64(s.MaxBonus)*remaining/q.TimeLimitMs)
}

func Rank(players []*Player) []LeaderboardEntry {
	sorted := append([]*Player(nil), players...)
	sort.SliceStable(sorted, func(i, j int) bool {
		a, b := sorted[i], sorted[j]
		if a.Score != b.Score {
			return a.Score > b.Score
		}
		if a.TieBreakMs != b.TieBreakMs {
			return a.TieBreakMs < b.TieBreakMs
		}
		return a.Name < b.Name
	})
	out := make([]LeaderboardEntry, 0, len(sorted))
	for i, p := range sorted {
		rank := i + 1
		if i > 0 && sorted[i-1].Score == p.Score && sorted[i-1].TieBreakMs == p.TieBreakMs {
			rank = out[i-1].Rank
		}
		out = append(out, LeaderboardEntry{rank, p.ID, p.Name, p.Score})
	}
	return out
}

type QuizGame struct {
	mu        sync.Mutex
	questions []Question
	scoring   ScoringStrategy
	clock     Clock
	players   []*Player
	byID      map[string]*Player
	answers   map[string]Answer
	state     GameState
	index     int
	startedAt int64
}

func NewQuizGame(questions []Question, scoring ScoringStrategy, clock Clock) (*QuizGame, error) {
	if len(questions) == 0 {
		return nil, errors.New("at least one question is required")
	}
	if scoring == nil {
		scoring = SpeedBonusScoring{Base: 1000, MaxBonus: 500}
	}
	if clock == nil {
		clock = SystemClock
	}
	return &QuizGame{
		questions: questions, scoring: scoring, clock: clock,
		byID: map[string]*Player{}, answers: map[string]Answer{}, index: -1,
	}, nil
}

func (g *QuizGame) State() GameState {
	g.mu.Lock()
	defer g.mu.Unlock()
	return g.state
}

func (g *QuizGame) AddPlayer(name string) (*Player, error) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if g.state != Waiting {
		return nil, ErrBadState
	}
	p := &Player{ID: fmt.Sprintf("p%d", len(g.players)+1), Name: name}
	g.players = append(g.players, p)
	g.byID[p.ID] = p
	return p, nil
}

func (g *QuizGame) Start() error {
	g.mu.Lock()
	defer g.mu.Unlock()
	if len(g.players) == 0 {
		return errors.New("need at least one player")
	}
	return g.openQuestion(0)
}

func (g *QuizGame) CurrentQuestion() (Question, error) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if g.state != QuestionActive {
		return Question{}, ErrBadState
	}
	return g.questions[g.index], nil
}

func (g *QuizGame) SubmitAnswer(playerID string, option int) error {
	g.mu.Lock()
	defer g.mu.Unlock()
	if g.state != QuestionActive {
		return ErrBadState
	}
	if _, ok := g.byID[playerID]; !ok {
		return ErrUnknownPlayer
	}
	if _, done := g.answers[playerID]; done {
		return ErrAnswered
	}
	q := g.questions[g.index]
	if option < 0 || option >= len(q.Options) {
		return ErrBadOption
	}
	elapsed := g.clock() - g.startedAt
	if elapsed > q.TimeLimitMs {
		return ErrTimeUp
	}
	g.answers[playerID] = Answer{playerID, option, elapsed}
	if len(g.answers) == len(g.players) { // everyone answered: reveal early
		_, err := g.closeLocked()
		return err
	}
	return nil
}

// Tick is called from a timer and closes the question when the limit elapses.
func (g *QuizGame) Tick() GameState {
	g.mu.Lock()
	defer g.mu.Unlock()
	if g.state == QuestionActive && g.clock()-g.startedAt >= g.questions[g.index].TimeLimitMs {
		_, _ = g.closeLocked()
	}
	return g.state
}

func (g *QuizGame) CloseQuestion() (QuestionResult, error) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if g.state != QuestionActive {
		return QuestionResult{}, ErrBadState
	}
	return g.closeLocked()
}

func (g *QuizGame) ShowLeaderboard() ([]LeaderboardEntry, error) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if err := g.move(LeaderboardState); err != nil {
		return nil, err
	}
	return Rank(g.players), nil
}

func (g *QuizGame) NextQuestion() (GameState, error) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if g.state != LeaderboardState {
		return g.state, ErrBadState
	}
	var err error
	if g.index+1 < len(g.questions) {
		err = g.openQuestion(g.index + 1)
	} else {
		err = g.move(Finished)
	}
	return g.state, err
}

func (g *QuizGame) Leaderboard() []LeaderboardEntry {
	g.mu.Lock()
	defer g.mu.Unlock()
	return Rank(g.players)
}

func (g *QuizGame) move(to GameState) error {
	for _, s := range allowed[g.state] {
		if s == to {
			g.state = to
			return nil
		}
	}
	return fmt.Errorf("illegal transition %s -> %s", g.state, to)
}

func (g *QuizGame) openQuestion(i int) error {
	if err := g.move(QuestionActive); err != nil {
		return err
	}
	g.index = i
	g.answers = map[string]Answer{}
	g.startedAt = g.clock()
	return nil
}

func (g *QuizGame) closeLocked() (QuestionResult, error) {
	q := g.questions[g.index]
	res := QuestionResult{QuestionID: q.ID, CorrectIndex: q.CorrectIndex, Points: map[string]int{}}
	for _, p := range g.players {
		pts := 0
		if a, ok := g.answers[p.ID]; ok && a.OptionIndex == q.CorrectIndex {
			pts = g.scoring.Score(q, true, a.ElapsedMs)
			p.CorrectCount++
			p.TieBreakMs += a.ElapsedMs
		}
		p.Score += pts
		res.Points[p.ID] = pts
	}
	return res, g.move(Reveal)
}

func main() {
	var now int64
	q1, _ := NewQuestion("q1", "2 + 2?", []string{"3", "4", "5"}, 1, 10_000)
	q2, _ := NewQuestion("q2", "Capital of France?", []string{"Paris", "Rome"}, 0, 10_000)
	g, _ := NewQuizGame([]Question{q1, q2}, nil, func() int64 { return now })
	alice, _ := g.AddPlayer("Alice")
	bob, _ := g.AddPlayer("Bob")
	_ = g.Start()
	now = 2_000
	_ = g.SubmitAnswer(alice.ID, 1) // 1400
	now = 6_000
	_ = g.SubmitAnswer(bob.ID, 1) // 1200 -> REVEAL
	board, _ := g.ShowLeaderboard()
	fmt.Println(g.State(), board)
	_, _ = g.NextQuestion()
	now += 10_000
	g.Tick() // nobody answered
	_, _ = g.ShowLeaderboard()
	state, _ := g.NextQuestion()
	fmt.Println(state, g.Leaderboard())
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

public enum GameState { Waiting, QuestionActive, Reveal, Leaderboard, Finished }

public interface IClock { long NowMs { get; } }
public sealed class SystemClock : IClock {
  public long NowMs => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
}

public sealed record Question(string Id, string Text, IReadOnlyList<string> Options, int CorrectIndex, long TimeLimitMs = 15_000) {
  public Question Validate() {
    if (Options.Count < 2) throw new ArgumentException("need >= 2 options");
    if (CorrectIndex < 0 || CorrectIndex >= Options.Count) throw new ArgumentException("bad correct index");
    if (TimeLimitMs <= 0) throw new ArgumentException("time limit must be positive");
    return this;
  }
}

public sealed class Player {
  public string Id { get; }
  public string Name { get; }
  public int Score { get; internal set; }
  public int CorrectCount { get; internal set; }
  public long TieBreakMs { get; internal set; } // total time on correct answers; lower wins ties
  public Player(string id, string name) { Id = id; Name = name; }
}

public sealed record Answer(string PlayerId, int OptionIndex, long ElapsedMs);
public sealed record QuestionResult(string QuestionId, int CorrectIndex, IReadOnlyDictionary<string, int> Points);
public sealed record LeaderboardEntry(int Rank, string PlayerId, string Name, int Score);

public interface IScoringStrategy { int Score(Question q, bool correct, long elapsedMs); }

public sealed class SpeedBonusScoring : IScoringStrategy {
  readonly int _base, _maxBonus;
  public SpeedBonusScoring(int baseScore = 1000, int maxBonus = 500) { _base = baseScore; _maxBonus = maxBonus; }
  public int Score(Question q, bool correct, long elapsedMs) {
    if (!correct) return 0;
    long remaining = Math.Max(0, q.TimeLimitMs - elapsedMs);
    return _base + (int)(_maxBonus * remaining / q.TimeLimitMs);
  }
}

public static class Leaderboard {
  public static List<LeaderboardEntry> Rank(IEnumerable<Player> players) {
    var sorted = players.OrderByDescending(p => p.Score).ThenBy(p => p.TieBreakMs)
                        .ThenBy(p => p.Name, StringComparer.Ordinal).ToList();
    var outList = new List<LeaderboardEntry>();
    for (int i = 0; i < sorted.Count; i++) {
      var p = sorted[i];
      int rank = i + 1;
      if (i > 0 && sorted[i - 1].Score == p.Score && sorted[i - 1].TieBreakMs == p.TieBreakMs)
        rank = outList[i - 1].Rank;
      outList.Add(new LeaderboardEntry(rank, p.Id, p.Name, p.Score));
    }
    return outList;
  }
}

public sealed class QuizGame {
  static readonly Dictionary<GameState, GameState[]> Allowed = new() {
    [GameState.Waiting] = new[] { GameState.QuestionActive },
    [GameState.QuestionActive] = new[] { GameState.Reveal },
    [GameState.Reveal] = new[] { GameState.Leaderboard },
    [GameState.Leaderboard] = new[] { GameState.QuestionActive, GameState.Finished },
    [GameState.Finished] = Array.Empty<GameState>(),
  };

  readonly List<Question> _questions;
  readonly IScoringStrategy _scoring;
  readonly IClock _clock;
  readonly Dictionary<string, Player> _players = new();
  readonly Dictionary<string, Answer> _answers = new();
  readonly object _gate = new();
  GameState _state = GameState.Waiting;
  int _index = -1;
  long _startedAt;

  public QuizGame(IEnumerable<Question> questions, IScoringStrategy? scoring = null, IClock? clock = null) {
    _questions = questions.Select(q => q.Validate()).ToList();
    if (_questions.Count == 0) throw new ArgumentException("at least one question is required");
    _scoring = scoring ?? new SpeedBonusScoring();
    _clock = clock ?? new SystemClock();
  }

  public GameState State { get { lock (_gate) return _state; } }

  public Player AddPlayer(string name) {
    lock (_gate) {
      if (_state != GameState.Waiting) throw new InvalidOperationException("players join while waiting");
      var p = new Player(Guid.NewGuid().ToString(), name);
      _players[p.Id] = p;
      return p;
    }
  }

  public void Start() {
    lock (_gate) {
      if (_players.Count == 0) throw new InvalidOperationException("need at least one player");
      OpenQuestion(0);
    }
  }

  public Question CurrentQuestion() {
    lock (_gate) {
      if (_state != GameState.QuestionActive) throw new InvalidOperationException("no active question");
      return _questions[_index];
    }
  }

  public void SubmitAnswer(string playerId, int optionIndex) {
    lock (_gate) {
      if (_state != GameState.QuestionActive) throw new InvalidOperationException("question not active");
      if (!_players.ContainsKey(playerId)) throw new KeyNotFoundException("unknown player");
      if (_answers.ContainsKey(playerId)) throw new InvalidOperationException("already answered");
      var q = _questions[_index];
      if (optionIndex < 0 || optionIndex >= q.Options.Count) throw new ArgumentOutOfRangeException(nameof(optionIndex));
      long elapsed = _clock.NowMs - _startedAt;
      if (elapsed > q.TimeLimitMs) throw new InvalidOperationException("time is up");
      _answers[playerId] = new Answer(playerId, optionIndex, elapsed);
      if (_answers.Count == _players.Count) CloseLocked(); // everyone answered
    }
  }

  /// <summary>Call from a timer: closes the question when its limit elapses.</summary>
  public GameState Tick() {
    lock (_gate) {
      if (_state == GameState.QuestionActive &&
          _clock.NowMs - _startedAt >= _questions[_index].TimeLimitMs) CloseLocked();
      return _state;
    }
  }

  public QuestionResult CloseQuestion() {
    lock (_gate) {
      if (_state != GameState.QuestionActive) throw new InvalidOperationException("no active question");
      return CloseLocked();
    }
  }

  public List<LeaderboardEntry> ShowLeaderboard() {
    lock (_gate) { Move(GameState.Leaderboard); return Leaderboard.Rank(_players.Values); }
  }

  public GameState NextQuestion() {
    lock (_gate) {
      if (_state != GameState.Leaderboard) throw new InvalidOperationException("show leaderboard first");
      if (_index + 1 < _questions.Count) OpenQuestion(_index + 1); else Move(GameState.Finished);
      return _state;
    }
  }

  public List<LeaderboardEntry> GetLeaderboard() { lock (_gate) return Leaderboard.Rank(_players.Values); }

  void Move(GameState target) {
    if (!Allowed[_state].Contains(target))
      throw new InvalidOperationException("illegal transition " + _state + " -> " + target);
    _state = target;
  }

  void OpenQuestion(int i) {
    Move(GameState.QuestionActive);
    _index = i; _answers.Clear(); _startedAt = _clock.NowMs;
  }

  QuestionResult CloseLocked() {
    var q = _questions[_index];
    var points = new Dictionary<string, int>();
    foreach (var p in _players.Values) {
      int pts = 0;
      if (_answers.TryGetValue(p.Id, out var a) && a.OptionIndex == q.CorrectIndex) {
        pts = _scoring.Score(q, true, a.ElapsedMs);
        p.CorrectCount++; p.TieBreakMs += a.ElapsedMs;
      }
      p.Score += pts; points[p.Id] = pts;
    }
    Move(GameState.Reveal);
    return new QuestionResult(q.Id, q.CorrectIndex, points);
  }
}

public static class Program {
  sealed class FakeClock : IClock { public long NowMs { get; set; } }

  public static void Main() {
    var clock = new FakeClock();
    var game = new QuizGame(new[] {
      new Question("q1", "2 + 2?", new[] { "3", "4", "5" }, 1, 10_000),
      new Question("q2", "Capital of France?", new[] { "Paris", "Rome" }, 0, 10_000),
    }, clock: clock);
    var alice = game.AddPlayer("Alice");
    var bob = game.AddPlayer("Bob");
    game.Start();
    clock.NowMs = 2_000; game.SubmitAnswer(alice.Id, 1);  // 1400
    clock.NowMs = 6_000; game.SubmitAnswer(bob.Id, 1);    // 1200 -> REVEAL
    foreach (var e in game.ShowLeaderboard()) Console.WriteLine(e.Rank + " " + e.Name + " " + e.Score);
    game.NextQuestion();
    clock.NowMs += 10_000; game.Tick();                   // nobody answered
    game.ShowLeaderboard();
    Console.WriteLine(game.NextQuestion());
  }
}
`

export const quizTriviaEngineSolution: ProblemSolution = {
  slug: 'quiz-trivia-engine',
  title: 'Quiz / Trivia Engine - Solution',
  overview: {
    introduction:
      'Model a quiz game that loads multiple-choice questions, accepts answers from one or many players under a per-question time limit, rewards faster correct answers with a bonus, and shows a leaderboard between rounds. The heart of the problem is an explicit game state machine (Waiting → QuestionActive → Reveal → Leaderboard) with a swappable scoring rule - not UI or networking.',
    constraints: [
      'Questions are multiple choice with exactly one correct option and a per-question time limit.',
      'Each player may answer a question at most once, and only while it is active and within the time limit.',
      'Correct answers earn base points plus a bonus that grows the faster the player answers.',
      'Scores are tracked per player and surfaced through a ranked leaderboard.',
      'The same engine supports single-player (one player) and multiplayer (many players).',
      'Game phases follow Waiting → QuestionActive → Reveal → Leaderboard, then either the next question or Finished.',
    ],
    assumptions: [
      'All players answer the same question at the same time (synchronous rounds, Kahoot-style).',
      'Time is measured from when the question opens on the server clock, injected for testability.',
      'A late or missing answer scores zero; wrong answers score zero (no negative marking).',
      'Players join only while the game is Waiting.',
      'Ties on score are broken by total time spent on correct answers (faster wins); players still tied share a rank.',
      'Transport (websockets, UI) is out of scope; a timer calls tick() to enforce time limits.',
    ],
    clarificationQuestions: [
      'Is the game synchronous (everyone on the same question) or can players progress at their own pace?',
      'How is the speed bonus defined - linear in remaining time, tiered, or streak-based?',
      'Is negative marking or partial credit needed?',
      'How should ties on the leaderboard be handled?',
      'Can players join or leave mid-game? What happens to their score on disconnect?',
      'Should the engine support other question types (true/false, multi-select) later?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Draw the lifecycle on the board first - the allowed transitions are the spec. Then ask which object owns each rule: QuizGame owns phase and orchestration, Question owns validity, ScoringStrategy owns points, Leaderboard owns ranking. Single versus multiplayer is just the number of Players, not two code paths.',
    breakdown: [
      'Define the state machine and the only legal transitions between phases.',
      'Model Question (options, correct index, time limit), Player (score, tie-break) and Answer (option + elapsed time).',
      'Extract scoring behind a ScoringStrategy so the bonus formula is swappable.',
      'Make QuizGame the single owner of mutable game state, guarded by a lock for concurrent answers.',
      'Close a question when everyone has answered or when a timer’s tick() sees the limit has elapsed.',
      'Compute points for all players atomically at reveal, then rank them for the leaderboard.',
    ],
    entities: [
      { name: 'QuizGame', responsibility: 'Session aggregate: players, current question, answers, phase transitions, scoring at reveal.' },
      { name: 'GameState', responsibility: 'WAITING, QUESTION_ACTIVE, REVEAL, LEADERBOARD, FINISHED.' },
      { name: 'Question', responsibility: 'Immutable MCQ with validation (≥2 options, valid correct index, positive limit).' },
      { name: 'Player', responsibility: 'Identity plus cumulative score, correct count and tie-break time.' },
      { name: 'Answer', responsibility: 'One player’s choice and how long they took.' },
      { name: 'ScoringStrategy / SpeedBonusScoring', responsibility: 'Maps (question, correctness, elapsed time) to points.' },
      { name: 'Leaderboard', responsibility: 'Pure ranking with deterministic tie-breaks and shared ranks.' },
    ],
    relationships: [
      'QuizGame composes the question list and aggregates Players.',
      'Answers are scoped to the current question and are cleared when the next one opens.',
      'QuizGame depends on ScoringStrategy and a Clock abstraction (injected).',
      'Leaderboard depends on Players but owns no state.',
    ],
    patternsAndOop: [
      'State machine: explicit transition table guards every phase change.',
      'Strategy: ScoringStrategy swaps the speed-bonus formula (streaks, difficulty weights).',
      'Dependency injection: Clock makes time-limit logic deterministic in tests.',
      'Immutability: Question, Answer and result records cannot be changed after creation.',
    ],
    stepByStep: [
      'Clarify rounds, scoring and tie rules.',
      'Sketch the four phases and what triggers each transition.',
      'Implement Question validation and SpeedBonusScoring (pure functions are easy to test).',
      'Implement QuizGame.submitAnswer with all guards: state, player, duplicate, option, time.',
      'Implement close/reveal: score everyone in one pass, then transition to REVEAL.',
      'Implement showLeaderboard and nextQuestion; discuss concurrency and timers.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'QuizGame is a state machine that owns all mutable state for one session. Rules that vary - points, ranking - live in small collaborators. Because transitions go through one guarded function, illegal sequences (answering during Reveal, skipping the leaderboard) are impossible by construction.',
    classResponsibilities: [
      { name: 'QuizGame', responsibility: 'Enforces transitions, records answers, closes questions, applies points, exposes the leaderboard.' },
      { name: 'Question', responsibility: 'Validates and holds MCQ data; also the unit loaded from JSON/DB.' },
      { name: 'Player', responsibility: 'Holds cumulative statistics used for ranking.' },
      { name: 'SpeedBonusScoring', responsibility: 'base + maxBonus × remainingTime / timeLimit for correct answers only.' },
      { name: 'Leaderboard', responsibility: 'Sorts by score, then total correct time, then name; equal keys share a rank.' },
    ],
    interfacesAndAbstractions: [
      'ScoringStrategy isolates the scoring formula from game flow.',
      'Clock (a function or interface) abstracts time so tests can step it manually.',
    ],
    relationships: [
      'Composition QuizGame→Question: the game owns the question set for its lifetime.',
      'Aggregation QuizGame→Player: players are registered in the lobby and referenced by id.',
      'Dependency QuizGame→ScoringStrategy/Clock: replaced without touching game flow.',
    ],
    solid: [
      'SRP: game flow, scoring and ranking are separate responsibilities.',
      'OCP: add streak/difficulty scoring by implementing ScoringStrategy.',
      'LSP: every ScoringStrategy returns a non-negative score and 0 for incorrect answers.',
      'ISP: ScoringStrategy exposes one method; Clock one function.',
      'DIP: QuizGame depends on abstractions for scoring and time.',
    ],
    patterns: [
      { name: 'State', why: 'Phase determines which operations are valid; a transition table keeps rules in one place.' },
      { name: 'Strategy', why: 'Scoring formula changes independently of game orchestration.' },
    ],
    decisions: [
      {
        decision: 'Apply points at reveal, not at submit.',
        rationale: 'All players are scored in one atomic step, so scores never leak early and the leaderboard is consistent with the reveal screen.',
        tradeoff: 'Scores are not “live” during the question; stream provisional points separately if the UI needs them.',
      },
      {
        decision: 'Auto-close a question when every player has answered.',
        rationale: 'Keeps the game snappy in single-player and small groups; a timer’s tick() handles the rest.',
        tradeoff: 'Leaks information if the UI shows “everyone answered”; acceptable for trivia.',
      },
      {
        decision: 'Time-limit enforcement via tick() plus a server-side elapsed check on submit.',
        rationale: 'The engine stays free of threads and timers; the host decides how often to call tick().',
        tradeoff: 'Accuracy depends on how often tick() runs; submissions are still rejected exactly at the limit.',
      },
      {
        decision: 'Integer math in the speed bonus.',
        rationale: 'Deterministic scores across languages and platforms; no floating-point rounding disputes.',
        tradeoff: 'Bonus granularity is limited by integer division; negligible for typical limits.',
      },
      {
        decision: 'Tie-break on total time spent on correct answers.',
        rationale: 'Rewards speed consistently and gives a deterministic ordering.',
        tradeoff: 'Players who answer correctly less often have less total time; combine with score first (as done).',
      },
    ],
    extensibility:
      'New scoring (streak multipliers, difficulty weights, negative marking) means a new ScoringStrategy. New question types extend Question with a polymorphic isCorrect(answer). A host/transport layer can subscribe to state-change events (Observer) without changing the core engine. Per-player pacing would split QuizGame into a shared GameSession and per-player progress objects.',
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
      'Load Question objects (validated) and create QuizGame with a ScoringStrategy and Clock.',
      'Players join while the state is WAITING; start() requires at least one player and opens question 0 (QUESTION_ACTIVE, records startedAt).',
      'submitAnswer checks: phase, known player, not already answered, valid option, elapsed ≤ time limit; then stores an Answer.',
      'When all players have answered, or tick() sees the time limit elapsed, the question closes.',
      'Closing scores every player once (correct → strategy points, else 0), updates tie-break stats and moves to REVEAL.',
      'showLeaderboard() moves to LEADERBOARD and returns ranked entries.',
      'nextQuestion() opens the next question (QUESTION_ACTIVE) or moves to FINISHED after the last one.',
    ],
    examples: [
      {
        title: 'Speed bonus - two players',
        input: 'Limit 10s, base 1000, maxBonus 500. Alice answers correctly at 2s; Bob answers correctly at 6s',
        output: 'Alice 1400, Bob 1200; leaderboard: 1. Alice, 2. Bob',
        explanation: 'Alice: 1000 + 500·8000/10000 = 1400. Bob: 1000 + 500·4000/10000 = 1200. Both answered, so the question closes immediately and moves to REVEAL.',
      },
      {
        title: 'Timeout',
        input: 'Nobody answers; clock advances to 10s; timer calls tick()',
        output: 'State becomes REVEAL; everyone earns 0 for the round',
        explanation: 'tick() sees elapsed ≥ limit and closes the question. Unanswered players are scored as 0.',
      },
      {
        title: 'Illegal action',
        input: 'submitAnswer while state is REVEAL',
        output: 'Error: question is not active',
        explanation: 'The state check is the first guard in submitAnswer, so late traffic cannot change scores after reveal.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you add streak bonuses or difficulty weighting?',
      answer:
        'Create another ScoringStrategy (or decorate SpeedBonusScoring). It needs the player’s current streak, so pass a small PlayerStats view into score(). The game flow does not change.',
    },
    {
      question: 'How do you handle two players answering at the same instant?',
      answer:
        'Hold one lock per game around submit/close. Each submit is O(1); the closing pass is O(players). If throughput matters, shard by game id - different games never share state.',
    },
    {
      question: 'How would you broadcast state changes to clients?',
      answer:
        'Emit domain events (QuestionOpened, Revealed, LeaderboardShown) through an Observer/event bus after each transition. The engine stays transport-agnostic; a websocket layer subscribes and pushes to clients.',
    },
    {
      question: 'How do you let players answer at their own pace?',
      answer:
        'Split QuizGame into a shared GameSession (questions, leaderboard) and a PlayerProgress per player (current index, answers). Scoring stays the same; the leaderboard aggregates progress objects.',
    },
    {
      question: 'How would you add other question types?',
      answer:
        'Make Question polymorphic: MultipleChoice, TrueFalse, MultiSelect each implement isCorrect(response). Answer holds a generic response. ScoringStrategy still receives a boolean (or a partial-credit fraction).',
    },
    {
      question: 'Why not compute points on submit?',
      answer:
        'Doing it at reveal keeps scoring atomic and avoids leaking standings mid-question. If you need immediate feedback, compute provisional points on submit and finalize at reveal.',
    },
    {
      question: 'How do you test the state machine?',
      answer:
        'Table-driven tests over every (state, operation) pair: legal ones succeed, illegal ones throw. Use a fake clock to test exact time-limit boundaries and the bonus formula.',
    },
  ],
  extras: {
    edgeCases: [
      'Answer submitted exactly at the time limit (allowed) versus 1 ms later (rejected).',
      'Duplicate answer from the same player.',
      'Player answers after the question has already closed.',
      'Starting with zero players, or adding a player mid-game.',
      'Single-player mode: the question closes as soon as the only player answers.',
      'Ties on score and on tie-break time share a rank.',
      'Zero-length or negative time limit rejected at construction.',
      'Last question: nextQuestion moves to FINISHED instead of opening another one.',
    ],
    commonMistakes: [
      'Allowing state changes through scattered boolean flags instead of one transition table.',
      'Scoring wrong answers with a speed bonus.',
      'Using floating-point rounding that differs between runs or languages.',
      'Forgetting to clear answers when the next question opens.',
      'Sorting the leaderboard without a deterministic tie-break.',
      'Running timers inside the engine, which makes it hard to test.',
    ],
    complexity:
      'submitAnswer: O(1) (hash lookups, O(players) only on the closing submission). Closing a question: O(P). Leaderboard: O(P log P). Space: O(Q + P) plus O(P) answers for the current question.',
    testing: [
      'SpeedBonusScoring boundary cases: elapsed 0, elapsed = limit, elapsed > limit.',
      'Full happy path through all four phases and FINISHED.',
      'Illegal transitions and operations in the wrong phase.',
      'Auto-close on last answer versus tick-based close.',
      'Leaderboard ordering, tie-breaks and shared ranks.',
      'Concurrent submissions from many players never double-count an answer.',
    ],
    extensions: [
      'Live event stream for UI clients and spectators.',
      'Streaks, power-ups and team scoring.',
      'Question banks with tags, difficulty and random selection.',
      'Persistent game history and per-player analytics.',
    ],
    takeaways: [
      'Write the state machine first - the transitions are the requirements.',
      'Keep scoring and ranking as small, pure, swappable pieces.',
      'Inject the clock; never sleep in the engine.',
      'Single-player and multiplayer are the same design with different player counts.',
    ],
  },
}
