import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'QuizTriviaEngineService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_quizs', 'Map<string, Quiz>'),
    attr('-', '_questions', 'Map<string, Question>'),
    attr('-', '_choices', 'Map<string, Choice>'),
    attr('-', '_players', 'Map<string, Player>'),
    attr('-', '_rounds', 'Map<string, Round>'),
  ], [
    method('+', 'createQuiz', 'name: string', 'Quiz'),
    method('+', 'createQuestion', 'name: string', 'Question'),
    method('+', 'createChoice', 'name: string', 'Choice'),
    method('+', 'createPlayer', 'name: string', 'Player'),
    method('+', 'createRound', 'name: string', 'Round'),
    method('+', 'getQuiz', 'id: string', 'Quiz'),
    method('+', 'getQuestion', 'id: string', 'Question'),
    method('+', 'getChoice', 'id: string', 'Choice'),
    method('+', 'getPlayer', 'id: string', 'Player'),
    method('+', 'getRound', 'id: string', 'Round'),
    method('+', 'closeQuiz', 'id: string', 'Quiz'),
  ], 'facade'),
  cls('n1', 'Quiz', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Question', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Choice', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Player', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Round', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("quiz-trivia-engine")


class Quiz:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Quiz.id is required")
        if not name or not name.strip():
            raise ValueError("Quiz.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Quiz.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Quiz {self.id} has invalid status={self.status}")
        log.info("[Quiz.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Quiz {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Quiz.close] id=%s -> CLOSED", self.id)


class Question:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Question.id is required")
        if not name or not name.strip():
            raise ValueError("Question.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Question.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Question {self.id} has invalid status={self.status}")
        log.info("[Question.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Question {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Question.close] id=%s -> CLOSED", self.id)


class Choice:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Choice.id is required")
        if not name or not name.strip():
            raise ValueError("Choice.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Choice.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Choice {self.id} has invalid status={self.status}")
        log.info("[Choice.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Choice {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Choice.close] id=%s -> CLOSED", self.id)


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


class Round:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Round.id is required")
        if not name or not name.strip():
            raise ValueError("Round.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Round.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Round {self.id} has invalid status={self.status}")
        log.info("[Round.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Round {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Round.close] id=%s -> CLOSED", self.id)


class QuizTriviaEngineService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._quizs: Dict[str, Quiz] = {}
        self._questions: Dict[str, Question] = {}
        self._choices: Dict[str, Choice] = {}
        self._players: Dict[str, Player] = {}
        self._rounds: Dict[str, Round] = {}
        log.info("[QuizTriviaEngineService.__init__] system ready; managing: Quiz, Question, Choice, Player, Round")

    def create_quiz(self, name: str) -> Quiz:
        """UML: QuizTriviaEngineService.create_quiz(name) -> Quiz"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Quiz name is required")
        with self._lock:
            item_id = f"QUI-{self._seq:04d}"
            self._seq += 1
            obj = Quiz(item_id, cleaned)
            obj.validate()
            self._quizs[item_id] = obj
            log.info("[QuizTriviaEngineService.create_quiz] stored %s in _quizs (count=%s)", item_id, len(self._quizs))
            return obj

    def get_quiz(self, item_id: str) -> Quiz:
        with self._lock:
            obj = self._quizs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Quiz id: {item_id}")
            log.info("[QuizTriviaEngineService.get_quiz] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_question(self, name: str) -> Question:
        """UML: QuizTriviaEngineService.create_question(name) -> Question"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Question name is required")
        with self._lock:
            item_id = f"QUE-{self._seq:04d}"
            self._seq += 1
            obj = Question(item_id, cleaned)
            obj.validate()
            self._questions[item_id] = obj
            log.info("[QuizTriviaEngineService.create_question] stored %s in _questions (count=%s)", item_id, len(self._questions))
            return obj

    def get_question(self, item_id: str) -> Question:
        with self._lock:
            obj = self._questions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Question id: {item_id}")
            log.info("[QuizTriviaEngineService.get_question] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_choice(self, name: str) -> Choice:
        """UML: QuizTriviaEngineService.create_choice(name) -> Choice"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Choice name is required")
        with self._lock:
            item_id = f"CHO-{self._seq:04d}"
            self._seq += 1
            obj = Choice(item_id, cleaned)
            obj.validate()
            self._choices[item_id] = obj
            log.info("[QuizTriviaEngineService.create_choice] stored %s in _choices (count=%s)", item_id, len(self._choices))
            return obj

    def get_choice(self, item_id: str) -> Choice:
        with self._lock:
            obj = self._choices.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Choice id: {item_id}")
            log.info("[QuizTriviaEngineService.get_choice] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_player(self, name: str) -> Player:
        """UML: QuizTriviaEngineService.create_player(name) -> Player"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Player name is required")
        with self._lock:
            item_id = f"PLA-{self._seq:04d}"
            self._seq += 1
            obj = Player(item_id, cleaned)
            obj.validate()
            self._players[item_id] = obj
            log.info("[QuizTriviaEngineService.create_player] stored %s in _players (count=%s)", item_id, len(self._players))
            return obj

    def get_player(self, item_id: str) -> Player:
        with self._lock:
            obj = self._players.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Player id: {item_id}")
            log.info("[QuizTriviaEngineService.get_player] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_round(self, name: str) -> Round:
        """UML: QuizTriviaEngineService.create_round(name) -> Round"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Round name is required")
        with self._lock:
            item_id = f"ROU-{self._seq:04d}"
            self._seq += 1
            obj = Round(item_id, cleaned)
            obj.validate()
            self._rounds[item_id] = obj
            log.info("[QuizTriviaEngineService.create_round] stored %s in _rounds (count=%s)", item_id, len(self._rounds))
            return obj

    def get_round(self, item_id: str) -> Round:
        with self._lock:
            obj = self._rounds.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Round id: {item_id}")
            log.info("[QuizTriviaEngineService.get_round] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_quiz(self, item_id: str) -> Quiz:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._quizs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Quiz id: {item_id}")
            log.info("[QuizTriviaEngineService.close_quiz] closing %s via Quiz.close()", item_id)
            obj.close()
            return obj

    def list_active_quizs(self) -> List[Quiz]:
        with self._lock:
            active = [o for o in self._quizs.values() if o.status == "ACTIVE"]
            log.info("[QuizTriviaEngineService.list_active_quizs] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct QuizTriviaEngineService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = QuizTriviaEngineService()

    log.info("========== STEP 2: Create primary Quiz objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_quiz("alpha-quiz")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_quiz("beta-quiz")

    log.info("========== STEP 3: Create Question (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_question("sample-question")

    log.info("========== STEP 4: Create Choice (UML class) ==========")
    system.create_choice("sample-choice")

    log.info("========== STEP 5: Create Player (UML class) ==========")
    system.create_player("sample-player")

    log.info("========== STEP 6: Create Round (UML class) ==========")
    system.create_round("sample-round")

    log.info("========== STEP 7: Inspect active Quiz list ==========")
    system.list_active_quizs()

    log.info("========== STEP 8: Close first Quiz ==========")
    system.close_quiz(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_quiz(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Quiz.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_quiz("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_quiz: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_quizs()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Quiz {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Quiz(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Quiz.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Quiz.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Quiz.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Quiz " + id + " invalid status");
    }
    System.out.println("[Quiz.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Quiz " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Quiz.close] id=" + id + " -> CLOSED");
  }
}


class Question {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Question(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Question.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Question.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Question.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Question " + id + " invalid status");
    }
    System.out.println("[Question.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Question " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Question.close] id=" + id + " -> CLOSED");
  }
}


class Choice {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Choice(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Choice.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Choice.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Choice.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Choice " + id + " invalid status");
    }
    System.out.println("[Choice.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Choice " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Choice.close] id=" + id + " -> CLOSED");
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


class Round {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Round(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Round.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Round.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Round.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Round " + id + " invalid status");
    }
    System.out.println("[Round.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Round " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Round.close] id=" + id + " -> CLOSED");
  }
}

public class QuizTriviaEngineService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Quiz> quizs = new LinkedHashMap<>();
  private final Map<String, Question> questions = new LinkedHashMap<>();
  private final Map<String, Choice> choices = new LinkedHashMap<>();
  private final Map<String, Player> players = new LinkedHashMap<>();
  private final Map<String, Round> rounds = new LinkedHashMap<>();

  public QuizTriviaEngineService() {
    System.out.println("[QuizTriviaEngineService.__init__] system ready");
  }

  public Quiz createQuiz(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Quiz name required");
    }
    lock.lock();
    try {
      String id = String.format("QUI-%04d", seq++);
      Quiz obj = new Quiz(id, name.trim());
      obj.validate();
      quizs.put(id, obj);
      System.out.println("[QuizTriviaEngineService.createQuiz] stored " + id + " count=" + quizs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Quiz getQuiz(String id) {
    lock.lock();
    try {
      Quiz obj = quizs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Quiz id: " + id);
      }
      System.out.println("[QuizTriviaEngineService.getQuiz] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Question createQuestion(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Question name required");
    }
    lock.lock();
    try {
      String id = String.format("QUE-%04d", seq++);
      Question obj = new Question(id, name.trim());
      obj.validate();
      questions.put(id, obj);
      System.out.println("[QuizTriviaEngineService.createQuestion] stored " + id + " count=" + questions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Question getQuestion(String id) {
    lock.lock();
    try {
      Question obj = questions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Question id: " + id);
      }
      System.out.println("[QuizTriviaEngineService.getQuestion] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Choice createChoice(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Choice name required");
    }
    lock.lock();
    try {
      String id = String.format("CHO-%04d", seq++);
      Choice obj = new Choice(id, name.trim());
      obj.validate();
      choices.put(id, obj);
      System.out.println("[QuizTriviaEngineService.createChoice] stored " + id + " count=" + choices.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Choice getChoice(String id) {
    lock.lock();
    try {
      Choice obj = choices.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Choice id: " + id);
      }
      System.out.println("[QuizTriviaEngineService.getChoice] found id=" + obj.getId());
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
      System.out.println("[QuizTriviaEngineService.createPlayer] stored " + id + " count=" + players.size());
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
      System.out.println("[QuizTriviaEngineService.getPlayer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Round createRound(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Round name required");
    }
    lock.lock();
    try {
      String id = String.format("ROU-%04d", seq++);
      Round obj = new Round(id, name.trim());
      obj.validate();
      rounds.put(id, obj);
      System.out.println("[QuizTriviaEngineService.createRound] stored " + id + " count=" + rounds.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Round getRound(String id) {
    lock.lock();
    try {
      Round obj = rounds.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Round id: " + id);
      }
      System.out.println("[QuizTriviaEngineService.getRound] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Quiz closeQuiz(String id) {
    lock.lock();
    try {
      Quiz obj = quizs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Quiz id: " + id);
      }
      System.out.println("[QuizTriviaEngineService.closeQuiz] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Quiz> listActiveQuizs() {
    lock.lock();
    try {
      List<Quiz> out = new ArrayList<>();
      for (Quiz o : quizs.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[QuizTriviaEngineService.listActiveQuizs] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct QuizTriviaEngineService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    QuizTriviaEngineService system = new QuizTriviaEngineService();
    System.out.println("========== STEP 2: Create Quiz objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Quiz first = system.createQuiz("alpha-quiz");
    system.createQuiz("beta-quiz");
    System.out.println("========== STEP 3: Create Question ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createQuestion("sample-question");
    System.out.println("========== STEP 4: Create Choice ==========");
    system.createChoice("sample-choice");
    System.out.println("========== STEP 5: Create Player ==========");
    system.createPlayer("sample-player");
    System.out.println("========== STEP 6: Create Round ==========");
    system.createRound("sample-round");
    System.out.println("========== Inspect active list ==========");
    system.listActiveQuizs();
    System.out.println("========== Close first Quiz ==========");
    system.closeQuiz(first.getId());
    try {
      system.closeQuiz(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getQuiz("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Quiz {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Quiz.id required')
    }

    if (!name?.trim()) {
      throw new Error('Quiz.name required')
    }
    console.log(\`[Quiz.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Quiz \${this.id} invalid status\`)
    }
    console.log(\`[Quiz.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Quiz \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Quiz.close] id=\${this.id} -> CLOSED\`)
  }
}


class Question {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Question.id required')
    }

    if (!name?.trim()) {
      throw new Error('Question.name required')
    }
    console.log(\`[Question.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Question \${this.id} invalid status\`)
    }
    console.log(\`[Question.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Question \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Question.close] id=\${this.id} -> CLOSED\`)
  }
}


class Choice {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Choice.id required')
    }

    if (!name?.trim()) {
      throw new Error('Choice.name required')
    }
    console.log(\`[Choice.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Choice \${this.id} invalid status\`)
    }
    console.log(\`[Choice.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Choice \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Choice.close] id=\${this.id} -> CLOSED\`)
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


class Round {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Round.id required')
    }

    if (!name?.trim()) {
      throw new Error('Round.name required')
    }
    console.log(\`[Round.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Round \${this.id} invalid status\`)
    }
    console.log(\`[Round.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Round \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Round.close] id=\${this.id} -> CLOSED\`)
  }
}

class QuizTriviaEngineService {
  private seq = 1
  private quizs = new Map<string, Quiz>()
  private questions = new Map<string, Question>()
  private choices = new Map<string, Choice>()
  private players = new Map<string, Player>()
  private rounds = new Map<string, Round>()
  constructor() {
    console.log('[QuizTriviaEngineService.__init__] system ready')
  }

  createQuiz(name: string): Quiz {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Quiz name required')
    }
    const id = \`QUI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Quiz(id, cleaned)
    obj.validate()
    this.quizs.set(id, obj)
    console.log(\`[QuizTriviaEngineService.createQuiz] stored \${id} count=\${this.quizs.size}\`)
    return obj
  }

  getQuiz(id: string): Quiz {
    const obj = this.quizs.get(id)
    if (!obj) {
      throw new Error(\`unknown Quiz id: \${id}\`)
    }
    console.log(\`[QuizTriviaEngineService.getQuiz] found id=\${obj.id}\`)
    return obj
  }

  createQuestion(name: string): Question {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Question name required')
    }
    const id = \`QUE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Question(id, cleaned)
    obj.validate()
    this.questions.set(id, obj)
    console.log(\`[QuizTriviaEngineService.createQuestion] stored \${id} count=\${this.questions.size}\`)
    return obj
  }

  getQuestion(id: string): Question {
    const obj = this.questions.get(id)
    if (!obj) {
      throw new Error(\`unknown Question id: \${id}\`)
    }
    console.log(\`[QuizTriviaEngineService.getQuestion] found id=\${obj.id}\`)
    return obj
  }

  createChoice(name: string): Choice {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Choice name required')
    }
    const id = \`CHO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Choice(id, cleaned)
    obj.validate()
    this.choices.set(id, obj)
    console.log(\`[QuizTriviaEngineService.createChoice] stored \${id} count=\${this.choices.size}\`)
    return obj
  }

  getChoice(id: string): Choice {
    const obj = this.choices.get(id)
    if (!obj) {
      throw new Error(\`unknown Choice id: \${id}\`)
    }
    console.log(\`[QuizTriviaEngineService.getChoice] found id=\${obj.id}\`)
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
    console.log(\`[QuizTriviaEngineService.createPlayer] stored \${id} count=\${this.players.size}\`)
    return obj
  }

  getPlayer(id: string): Player {
    const obj = this.players.get(id)
    if (!obj) {
      throw new Error(\`unknown Player id: \${id}\`)
    }
    console.log(\`[QuizTriviaEngineService.getPlayer] found id=\${obj.id}\`)
    return obj
  }

  createRound(name: string): Round {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Round name required')
    }
    const id = \`ROU-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Round(id, cleaned)
    obj.validate()
    this.rounds.set(id, obj)
    console.log(\`[QuizTriviaEngineService.createRound] stored \${id} count=\${this.rounds.size}\`)
    return obj
  }

  getRound(id: string): Round {
    const obj = this.rounds.get(id)
    if (!obj) {
      throw new Error(\`unknown Round id: \${id}\`)
    }
    console.log(\`[QuizTriviaEngineService.getRound] found id=\${obj.id}\`)
    return obj
  }

  closeQuiz(id: string): Quiz {
    const obj = this.getQuiz(id)
    console.log(\`[QuizTriviaEngineService.closeQuiz] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveQuizs(): Quiz[] {
    const active = [...this.quizs.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[QuizTriviaEngineService.listActiveQuizs] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct QuizTriviaEngineService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new QuizTriviaEngineService()
  console.log('========== STEP 2: Create Quiz objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createQuiz('alpha-quiz')
  system.createQuiz('beta-quiz')
  console.log('========== STEP 3: Create Question ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createQuestion('sample-question')
  console.log('========== STEP 4: Create Choice ==========')
  system.createChoice('sample-choice')
  console.log('========== STEP 5: Create Player ==========')
  system.createPlayer('sample-player')
  console.log('========== STEP 6: Create Round ==========')
  system.createRound('sample-round')
  system.listActiveQuizs()
  console.log('========== Close first Quiz ==========')
  system.closeQuiz(first.id)
  try {
    system.closeQuiz(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getQuiz('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Quiz {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Quiz(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Quiz requires id and name");
    }
    cout << "[Quiz.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Quiz invalid status");
    }
    cout << "[Quiz.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Quiz cannot close");
    }
    status_ = "CLOSED";
    cout << "[Quiz.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Question {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Question(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Question requires id and name");
    }
    cout << "[Question.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Question invalid status");
    }
    cout << "[Question.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Question cannot close");
    }
    status_ = "CLOSED";
    cout << "[Question.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Choice {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Choice(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Choice requires id and name");
    }
    cout << "[Choice.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Choice invalid status");
    }
    cout << "[Choice.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Choice cannot close");
    }
    status_ = "CLOSED";
    cout << "[Choice.close] id=" << id_ << " -> CLOSED" << endl;
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


class Round {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Round(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Round requires id and name");
    }
    cout << "[Round.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Round invalid status");
    }
    cout << "[Round.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Round cannot close");
    }
    status_ = "CLOSED";
    cout << "[Round.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class QuizTriviaEngineService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Quiz> quizs_;
  unordered_map<string, Question> questions_;
  unordered_map<string, Choice> choices_;
  unordered_map<string, Player> players_;
  unordered_map<string, Round> rounds_;
public:
  QuizTriviaEngineService() {
    cout << "[QuizTriviaEngineService.__init__] system ready" << endl;
  }

  Quiz createQuiz(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Quiz name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "QUI-%04d", seq_++);
    Quiz obj{buf, name};
    obj.validate();
    quizs_.emplace(obj.id(), obj);
    cout << "[QuizTriviaEngineService.createQuiz] stored " << obj.id() << endl;
    return obj;
  }

  Quiz getQuiz(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = quizs_.find(id);
    if (it == quizs_.end()) {
      throw out_of_range("unknown Quiz id");
    }
    cout << "[QuizTriviaEngineService.getQuiz] found " << id << endl;
    return it->second;
  }

  Question createQuestion(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Question name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "QUE-%04d", seq_++);
    Question obj{buf, name};
    obj.validate();
    questions_.emplace(obj.id(), obj);
    cout << "[QuizTriviaEngineService.createQuestion] stored " << obj.id() << endl;
    return obj;
  }

  Question getQuestion(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = questions_.find(id);
    if (it == questions_.end()) {
      throw out_of_range("unknown Question id");
    }
    cout << "[QuizTriviaEngineService.getQuestion] found " << id << endl;
    return it->second;
  }

  Choice createChoice(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Choice name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CHO-%04d", seq_++);
    Choice obj{buf, name};
    obj.validate();
    choices_.emplace(obj.id(), obj);
    cout << "[QuizTriviaEngineService.createChoice] stored " << obj.id() << endl;
    return obj;
  }

  Choice getChoice(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = choices_.find(id);
    if (it == choices_.end()) {
      throw out_of_range("unknown Choice id");
    }
    cout << "[QuizTriviaEngineService.getChoice] found " << id << endl;
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
    cout << "[QuizTriviaEngineService.createPlayer] stored " << obj.id() << endl;
    return obj;
  }

  Player getPlayer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = players_.find(id);
    if (it == players_.end()) {
      throw out_of_range("unknown Player id");
    }
    cout << "[QuizTriviaEngineService.getPlayer] found " << id << endl;
    return it->second;
  }

  Round createRound(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Round name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ROU-%04d", seq_++);
    Round obj{buf, name};
    obj.validate();
    rounds_.emplace(obj.id(), obj);
    cout << "[QuizTriviaEngineService.createRound] stored " << obj.id() << endl;
    return obj;
  }

  Round getRound(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = rounds_.find(id);
    if (it == rounds_.end()) {
      throw out_of_range("unknown Round id");
    }
    cout << "[QuizTriviaEngineService.getRound] found " << id << endl;
    return it->second;
  }

  Quiz closeQuiz(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = quizs_.find(id);
    if (it == quizs_.end()) {
      throw out_of_range("unknown Quiz");
    }
    cout << "[QuizTriviaEngineService.closeQuiz] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct QuizTriviaEngineService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  QuizTriviaEngineService system;
  cout << "========== STEP 2: Create Quiz ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createQuiz("alpha-quiz");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createQuiz("beta-quiz");
  system.createQuestion("sample-question");
  system.createChoice("sample-choice");
  system.createPlayer("sample-player");
  system.createRound("sample-round");
  system.closeQuiz(first.id());
  try {
    system.closeQuiz(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getQuiz("MISSING-ID");
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

type Quiz struct {
  ID     string
  Name   string
  Status string
}

func NewQuiz(id, name string) (*Quiz, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Quiz requires id and name")
  }
  obj := &Quiz{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Quiz.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Quiz) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Quiz invalid status")
  }
  fmt.Printf("[Quiz.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Quiz) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Quiz %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Quiz.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Question struct {
  ID     string
  Name   string
  Status string
}

func NewQuestion(id, name string) (*Question, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Question requires id and name")
  }
  obj := &Question{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Question.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Question) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Question invalid status")
  }
  fmt.Printf("[Question.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Question) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Question %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Question.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Choice struct {
  ID     string
  Name   string
  Status string
}

func NewChoice(id, name string) (*Choice, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Choice requires id and name")
  }
  obj := &Choice{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Choice.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Choice) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Choice invalid status")
  }
  fmt.Printf("[Choice.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Choice) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Choice %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Choice.close] id=%s -> CLOSED\\n", o.ID)
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


type Round struct {
  ID     string
  Name   string
  Status string
}

func NewRound(id, name string) (*Round, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Round requires id and name")
  }
  obj := &Round{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Round.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Round) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Round invalid status")
  }
  fmt.Printf("[Round.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Round) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Round %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Round.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type QuizTriviaEngineService struct {
  mu  sync.Mutex
  seq int
  quizs map[string]*Quiz
  questions map[string]*Question
  choices map[string]*Choice
  players map[string]*Player
  rounds map[string]*Round
}

func NewQuizTriviaEngineService() *QuizTriviaEngineService {
  fmt.Println("[QuizTriviaEngineService.__init__] system ready")
  return &QuizTriviaEngineService{
    seq: 1,
    quizs: map[string]*Quiz{},
    questions: map[string]*Question{},
    choices: map[string]*Choice{},
    players: map[string]*Player{},
    rounds: map[string]*Round{},
  }
}

func (s *QuizTriviaEngineService) CreateQuiz(name string) (*Quiz, error) {
  if name == "" {
    return nil, fmt.Errorf("Quiz name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("QUI-%04d", s.seq)
  s.seq++
  obj, err := NewQuiz(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.quizs[id] = obj
  fmt.Printf("[QuizTriviaEngineService.CreateQuiz] stored %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) GetQuiz(id string) (*Quiz, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.quizs[id]
  if !ok {
    return nil, fmt.Errorf("unknown Quiz id: %s", id)
  }
  fmt.Printf("[QuizTriviaEngineService.GetQuiz] found %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) CreateQuestion(name string) (*Question, error) {
  if name == "" {
    return nil, fmt.Errorf("Question name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("QUE-%04d", s.seq)
  s.seq++
  obj, err := NewQuestion(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.questions[id] = obj
  fmt.Printf("[QuizTriviaEngineService.CreateQuestion] stored %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) GetQuestion(id string) (*Question, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.questions[id]
  if !ok {
    return nil, fmt.Errorf("unknown Question id: %s", id)
  }
  fmt.Printf("[QuizTriviaEngineService.GetQuestion] found %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) CreateChoice(name string) (*Choice, error) {
  if name == "" {
    return nil, fmt.Errorf("Choice name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CHO-%04d", s.seq)
  s.seq++
  obj, err := NewChoice(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.choices[id] = obj
  fmt.Printf("[QuizTriviaEngineService.CreateChoice] stored %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) GetChoice(id string) (*Choice, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.choices[id]
  if !ok {
    return nil, fmt.Errorf("unknown Choice id: %s", id)
  }
  fmt.Printf("[QuizTriviaEngineService.GetChoice] found %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) CreatePlayer(name string) (*Player, error) {
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
  fmt.Printf("[QuizTriviaEngineService.CreatePlayer] stored %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) GetPlayer(id string) (*Player, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.players[id]
  if !ok {
    return nil, fmt.Errorf("unknown Player id: %s", id)
  }
  fmt.Printf("[QuizTriviaEngineService.GetPlayer] found %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) CreateRound(name string) (*Round, error) {
  if name == "" {
    return nil, fmt.Errorf("Round name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ROU-%04d", s.seq)
  s.seq++
  obj, err := NewRound(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.rounds[id] = obj
  fmt.Printf("[QuizTriviaEngineService.CreateRound] stored %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) GetRound(id string) (*Round, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.rounds[id]
  if !ok {
    return nil, fmt.Errorf("unknown Round id: %s", id)
  }
  fmt.Printf("[QuizTriviaEngineService.GetRound] found %s\\n", id)
  return obj, nil
}

func (s *QuizTriviaEngineService) CloseQuiz(id string) (*Quiz, error) {
  obj, err := s.GetQuiz(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[QuizTriviaEngineService.CloseQuiz] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct QuizTriviaEngineService ==========")
  system := NewQuizTriviaEngineService()
  fmt.Println("========== STEP 2: Create Quiz ==========")
  first, _ := system.CreateQuiz("alpha-quiz")
  system.CreateQuiz("beta-quiz")
  system.CreateQuestion("sample-question")
  system.CreateChoice("sample-choice")
  system.CreatePlayer("sample-player")
  system.CreateRound("sample-round")
  system.CloseQuiz(first.ID)
  if _, err := system.CloseQuiz(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetQuiz("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Quiz {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Quiz(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Quiz requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Quiz.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Quiz invalid status");
    }
    Console.WriteLine("[Quiz.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Quiz " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Quiz.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Question {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Question(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Question requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Question.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Question invalid status");
    }
    Console.WriteLine("[Question.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Question " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Question.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Choice {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Choice(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Choice requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Choice.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Choice invalid status");
    }
    Console.WriteLine("[Choice.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Choice " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Choice.close] id=" + Id + " -> CLOSED");
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


sealed class Round {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Round(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Round requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Round.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Round invalid status");
    }
    Console.WriteLine("[Round.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Round " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Round.close] id=" + Id + " -> CLOSED");
  }
}

sealed class QuizTriviaEngineService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Quiz> _quizs = new();
  private readonly Dictionary<string, Question> _questions = new();
  private readonly Dictionary<string, Choice> _choices = new();
  private readonly Dictionary<string, Player> _players = new();
  private readonly Dictionary<string, Round> _rounds = new();
  public QuizTriviaEngineService() {
    Console.WriteLine("[QuizTriviaEngineService.__init__] system ready");
  }

  public Quiz CreateQuiz(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Quiz name required");
    }
    lock (_gate) {
      var id = string.Format("QUI-{0:D4}", _seq++);
      var obj = new Quiz(id, name.Trim());
      obj.Validate();
      _quizs[id] = obj;
      Console.WriteLine("[QuizTriviaEngineService.CreateQuiz] stored " + id);
      return obj;
    }
  }

  public Quiz GetQuiz(string id) {
    lock (_gate) {
      if (!_quizs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Quiz id: " + id);
      }
      Console.WriteLine("[QuizTriviaEngineService.GetQuiz] found " + id);
      return obj;
    }
  }

  public Question CreateQuestion(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Question name required");
    }
    lock (_gate) {
      var id = string.Format("QUE-{0:D4}", _seq++);
      var obj = new Question(id, name.Trim());
      obj.Validate();
      _questions[id] = obj;
      Console.WriteLine("[QuizTriviaEngineService.CreateQuestion] stored " + id);
      return obj;
    }
  }

  public Question GetQuestion(string id) {
    lock (_gate) {
      if (!_questions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Question id: " + id);
      }
      Console.WriteLine("[QuizTriviaEngineService.GetQuestion] found " + id);
      return obj;
    }
  }

  public Choice CreateChoice(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Choice name required");
    }
    lock (_gate) {
      var id = string.Format("CHO-{0:D4}", _seq++);
      var obj = new Choice(id, name.Trim());
      obj.Validate();
      _choices[id] = obj;
      Console.WriteLine("[QuizTriviaEngineService.CreateChoice] stored " + id);
      return obj;
    }
  }

  public Choice GetChoice(string id) {
    lock (_gate) {
      if (!_choices.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Choice id: " + id);
      }
      Console.WriteLine("[QuizTriviaEngineService.GetChoice] found " + id);
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
      Console.WriteLine("[QuizTriviaEngineService.CreatePlayer] stored " + id);
      return obj;
    }
  }

  public Player GetPlayer(string id) {
    lock (_gate) {
      if (!_players.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Player id: " + id);
      }
      Console.WriteLine("[QuizTriviaEngineService.GetPlayer] found " + id);
      return obj;
    }
  }

  public Round CreateRound(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Round name required");
    }
    lock (_gate) {
      var id = string.Format("ROU-{0:D4}", _seq++);
      var obj = new Round(id, name.Trim());
      obj.Validate();
      _rounds[id] = obj;
      Console.WriteLine("[QuizTriviaEngineService.CreateRound] stored " + id);
      return obj;
    }
  }

  public Round GetRound(string id) {
    lock (_gate) {
      if (!_rounds.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Round id: " + id);
      }
      Console.WriteLine("[QuizTriviaEngineService.GetRound] found " + id);
      return obj;
    }
  }

  public Quiz CloseQuiz(string id) {
    var obj = GetQuiz(id);
    Console.WriteLine("[QuizTriviaEngineService.CloseQuiz] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct QuizTriviaEngineService ==========");
    var system = new QuizTriviaEngineService();
    Console.WriteLine("========== STEP 2: Create Quiz ==========");
    var first = system.CreateQuiz("alpha-quiz");
    system.CreateQuiz("beta-quiz");
    system.CreateQuestion("sample-question");
    system.CreateChoice("sample-choice");
    system.CreatePlayer("sample-player");
    system.CreateRound("sample-round");
    system.CloseQuiz(first.Id);
    try {
      system.CloseQuiz(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetQuiz("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const quizTriviaEngineSolution: ProblemSolution = {
  slug: 'quiz-trivia-engine',
  title: 'Quiz / Trivia Game Engine - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a quiz engine that manages questions, scoring, and timed rounds for a trivia game. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Load a set of questions with multiple-choice answers',
      'Track a per-player score across rounds',
      'Support a per-question time limit',
      'Award bonus points for faster correct answers',
      'Show the leaderboard after each round',
      'Support single-player and multiplayer modes',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Load a set of questions with multiple-choice answers?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Track a per-player score across rounds?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support a per-question time limit?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Award bonus points for faster correct answers?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Show the leaderboard after each round?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. QuizTriviaEngineService is the facade stereotype. Quiz, Question, Choice, Player, Round are concrete domain classes with id/name/status and validate/close.',
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
          'Construct QuizTriviaEngineService.',
          'createQuiz twice and create the related UML classes.',
          'closeQuiz once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'QuizTriviaEngineService', responsibility: 'UML facade - orchestrates Quiz / Trivia Game Engine.', keyMembers: ['create*', 'get*', 'closeQuiz'] },
    { name: 'Quiz', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Question', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Choice', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Round', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from QuizTriviaEngineService to Quiz, Question, Choice, Player, Round. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on QuizTriviaEngineService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'QuizTriviaEngineService', responsibility: 'UML facade - orchestrates Quiz / Trivia Game Engine.', keyMembers: ['create*', 'get*', 'closeQuiz'] },
    { name: 'Quiz', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Question', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Choice', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Player', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Round', responsibility: 'UML class - domain object for Quiz / Trivia Game Engine.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'QuizTriviaEngineService exposes create/get/close and owns composed collections.' },
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
      'main constructs QuizTriviaEngineService, creates UML domain objects, closes the primary Quiz, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct QuizTriviaEngineService.',
      'createQuiz for alpha and beta.',
      'create remaining UML classes.',
      'closeQuiz(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createQuiz("alpha..."); closeQuiz(id)',
        output: '[Quiz.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeQuiz(alreadyClosed) or getQuiz("MISSING-ID")',
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
