import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'StackOverflowService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_questions', 'Map<string, Question>'),
    attr('-', '_answers', 'Map<string, Answer>'),
    attr('-', '_comments', 'Map<string, Comment>'),
    attr('-', '_tags', 'Map<string, Tag>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createQuestion', 'name: string', 'Question'),
    method('+', 'createAnswer', 'name: string', 'Answer'),
    method('+', 'createComment', 'name: string', 'Comment'),
    method('+', 'createTag', 'name: string', 'Tag'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getQuestion', 'id: string', 'Question'),
    method('+', 'getAnswer', 'id: string', 'Answer'),
    method('+', 'getComment', 'id: string', 'Comment'),
    method('+', 'getTag', 'id: string', 'Tag'),
    method('+', 'closeUser', 'id: string', 'User'),
  ], 'facade'),
  cls('n1', 'User', GRID.x(1), GRID.y(0), [
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
  cls('n3', 'Answer', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Comment', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Tag', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("stack-overflow")


class User:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("User.id is required")
        if not name or not name.strip():
            raise ValueError("User.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[User.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"User {self.id} has invalid status={self.status}")
        log.info("[User.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"User {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[User.close] id=%s -> CLOSED", self.id)


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


class Answer:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Answer.id is required")
        if not name or not name.strip():
            raise ValueError("Answer.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Answer.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Answer {self.id} has invalid status={self.status}")
        log.info("[Answer.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Answer {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Answer.close] id=%s -> CLOSED", self.id)


class Comment:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Comment.id is required")
        if not name or not name.strip():
            raise ValueError("Comment.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Comment.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Comment {self.id} has invalid status={self.status}")
        log.info("[Comment.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Comment {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Comment.close] id=%s -> CLOSED", self.id)


class Tag:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Tag.id is required")
        if not name or not name.strip():
            raise ValueError("Tag.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Tag.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Tag {self.id} has invalid status={self.status}")
        log.info("[Tag.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Tag {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Tag.close] id=%s -> CLOSED", self.id)


class StackOverflowService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._questions: Dict[str, Question] = {}
        self._answers: Dict[str, Answer] = {}
        self._comments: Dict[str, Comment] = {}
        self._tags: Dict[str, Tag] = {}
        log.info("[StackOverflowService.__init__] system ready; managing: User, Question, Answer, Comment, Tag")

    def create_user(self, name: str) -> User:
        """UML: StackOverflowService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[StackOverflowService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[StackOverflowService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_question(self, name: str) -> Question:
        """UML: StackOverflowService.create_question(name) -> Question"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Question name is required")
        with self._lock:
            item_id = f"QUE-{self._seq:04d}"
            self._seq += 1
            obj = Question(item_id, cleaned)
            obj.validate()
            self._questions[item_id] = obj
            log.info("[StackOverflowService.create_question] stored %s in _questions (count=%s)", item_id, len(self._questions))
            return obj

    def get_question(self, item_id: str) -> Question:
        with self._lock:
            obj = self._questions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Question id: {item_id}")
            log.info("[StackOverflowService.get_question] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_answer(self, name: str) -> Answer:
        """UML: StackOverflowService.create_answer(name) -> Answer"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Answer name is required")
        with self._lock:
            item_id = f"ANS-{self._seq:04d}"
            self._seq += 1
            obj = Answer(item_id, cleaned)
            obj.validate()
            self._answers[item_id] = obj
            log.info("[StackOverflowService.create_answer] stored %s in _answers (count=%s)", item_id, len(self._answers))
            return obj

    def get_answer(self, item_id: str) -> Answer:
        with self._lock:
            obj = self._answers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Answer id: {item_id}")
            log.info("[StackOverflowService.get_answer] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_comment(self, name: str) -> Comment:
        """UML: StackOverflowService.create_comment(name) -> Comment"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Comment name is required")
        with self._lock:
            item_id = f"COM-{self._seq:04d}"
            self._seq += 1
            obj = Comment(item_id, cleaned)
            obj.validate()
            self._comments[item_id] = obj
            log.info("[StackOverflowService.create_comment] stored %s in _comments (count=%s)", item_id, len(self._comments))
            return obj

    def get_comment(self, item_id: str) -> Comment:
        with self._lock:
            obj = self._comments.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Comment id: {item_id}")
            log.info("[StackOverflowService.get_comment] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_tag(self, name: str) -> Tag:
        """UML: StackOverflowService.create_tag(name) -> Tag"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Tag name is required")
        with self._lock:
            item_id = f"TAG-{self._seq:04d}"
            self._seq += 1
            obj = Tag(item_id, cleaned)
            obj.validate()
            self._tags[item_id] = obj
            log.info("[StackOverflowService.create_tag] stored %s in _tags (count=%s)", item_id, len(self._tags))
            return obj

    def get_tag(self, item_id: str) -> Tag:
        with self._lock:
            obj = self._tags.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Tag id: {item_id}")
            log.info("[StackOverflowService.get_tag] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[StackOverflowService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[StackOverflowService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct StackOverflowService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = StackOverflowService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Question (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_question("sample-question")

    log.info("========== STEP 4: Create Answer (UML class) ==========")
    system.create_answer("sample-answer")

    log.info("========== STEP 5: Create Comment (UML class) ==========")
    system.create_comment("sample-comment")

    log.info("========== STEP 6: Create Tag (UML class) ==========")
    system.create_tag("sample-tag")

    log.info("========== STEP 7: Inspect active User list ==========")
    system.list_active_users()

    log.info("========== STEP 8: Close first User ==========")
    system.close_user(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_user(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from User.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_user("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_user: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_users()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class User {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  User(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("User.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("User.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[User.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("User " + id + " invalid status");
    }
    System.out.println("[User.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("User " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[User.close] id=" + id + " -> CLOSED");
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


class Answer {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Answer(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Answer.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Answer.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Answer.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Answer " + id + " invalid status");
    }
    System.out.println("[Answer.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Answer " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Answer.close] id=" + id + " -> CLOSED");
  }
}


class Comment {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Comment(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Comment.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Comment.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Comment.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Comment " + id + " invalid status");
    }
    System.out.println("[Comment.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Comment " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Comment.close] id=" + id + " -> CLOSED");
  }
}


class Tag {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Tag(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Tag.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Tag.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Tag.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Tag " + id + " invalid status");
    }
    System.out.println("[Tag.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Tag " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Tag.close] id=" + id + " -> CLOSED");
  }
}

public class StackOverflowService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Question> questions = new LinkedHashMap<>();
  private final Map<String, Answer> answers = new LinkedHashMap<>();
  private final Map<String, Comment> comments = new LinkedHashMap<>();
  private final Map<String, Tag> tags = new LinkedHashMap<>();

  public StackOverflowService() {
    System.out.println("[StackOverflowService.__init__] system ready");
  }

  public User createUser(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("User name required");
    }
    lock.lock();
    try {
      String id = String.format("USE-%04d", seq++);
      User obj = new User(id, name.trim());
      obj.validate();
      users.put(id, obj);
      System.out.println("[StackOverflowService.createUser] stored " + id + " count=" + users.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public User getUser(String id) {
    lock.lock();
    try {
      User obj = users.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown User id: " + id);
      }
      System.out.println("[StackOverflowService.getUser] found id=" + obj.getId());
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
      System.out.println("[StackOverflowService.createQuestion] stored " + id + " count=" + questions.size());
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
      System.out.println("[StackOverflowService.getQuestion] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Answer createAnswer(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Answer name required");
    }
    lock.lock();
    try {
      String id = String.format("ANS-%04d", seq++);
      Answer obj = new Answer(id, name.trim());
      obj.validate();
      answers.put(id, obj);
      System.out.println("[StackOverflowService.createAnswer] stored " + id + " count=" + answers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Answer getAnswer(String id) {
    lock.lock();
    try {
      Answer obj = answers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Answer id: " + id);
      }
      System.out.println("[StackOverflowService.getAnswer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Comment createComment(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Comment name required");
    }
    lock.lock();
    try {
      String id = String.format("COM-%04d", seq++);
      Comment obj = new Comment(id, name.trim());
      obj.validate();
      comments.put(id, obj);
      System.out.println("[StackOverflowService.createComment] stored " + id + " count=" + comments.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Comment getComment(String id) {
    lock.lock();
    try {
      Comment obj = comments.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Comment id: " + id);
      }
      System.out.println("[StackOverflowService.getComment] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Tag createTag(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Tag name required");
    }
    lock.lock();
    try {
      String id = String.format("TAG-%04d", seq++);
      Tag obj = new Tag(id, name.trim());
      obj.validate();
      tags.put(id, obj);
      System.out.println("[StackOverflowService.createTag] stored " + id + " count=" + tags.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Tag getTag(String id) {
    lock.lock();
    try {
      Tag obj = tags.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Tag id: " + id);
      }
      System.out.println("[StackOverflowService.getTag] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public User closeUser(String id) {
    lock.lock();
    try {
      User obj = users.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown User id: " + id);
      }
      System.out.println("[StackOverflowService.closeUser] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<User> listActiveUsers() {
    lock.lock();
    try {
      List<User> out = new ArrayList<>();
      for (User o : users.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[StackOverflowService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct StackOverflowService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    StackOverflowService system = new StackOverflowService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Question ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createQuestion("sample-question");
    System.out.println("========== STEP 4: Create Answer ==========");
    system.createAnswer("sample-answer");
    System.out.println("========== STEP 5: Create Comment ==========");
    system.createComment("sample-comment");
    System.out.println("========== STEP 6: Create Tag ==========");
    system.createTag("sample-tag");
    System.out.println("========== Inspect active list ==========");
    system.listActiveUsers();
    System.out.println("========== Close first User ==========");
    system.closeUser(first.getId());
    try {
      system.closeUser(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getUser("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class User {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('User.id required')
    }

    if (!name?.trim()) {
      throw new Error('User.name required')
    }
    console.log(\`[User.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`User \${this.id} invalid status\`)
    }
    console.log(\`[User.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`User \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[User.close] id=\${this.id} -> CLOSED\`)
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


class Answer {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Answer.id required')
    }

    if (!name?.trim()) {
      throw new Error('Answer.name required')
    }
    console.log(\`[Answer.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Answer \${this.id} invalid status\`)
    }
    console.log(\`[Answer.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Answer \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Answer.close] id=\${this.id} -> CLOSED\`)
  }
}


class Comment {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Comment.id required')
    }

    if (!name?.trim()) {
      throw new Error('Comment.name required')
    }
    console.log(\`[Comment.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Comment \${this.id} invalid status\`)
    }
    console.log(\`[Comment.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Comment \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Comment.close] id=\${this.id} -> CLOSED\`)
  }
}


class Tag {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Tag.id required')
    }

    if (!name?.trim()) {
      throw new Error('Tag.name required')
    }
    console.log(\`[Tag.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Tag \${this.id} invalid status\`)
    }
    console.log(\`[Tag.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Tag \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Tag.close] id=\${this.id} -> CLOSED\`)
  }
}

class StackOverflowService {
  private seq = 1
  private users = new Map<string, User>()
  private questions = new Map<string, Question>()
  private answers = new Map<string, Answer>()
  private comments = new Map<string, Comment>()
  private tags = new Map<string, Tag>()
  constructor() {
    console.log('[StackOverflowService.__init__] system ready')
  }

  createUser(name: string): User {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('User name required')
    }
    const id = \`USE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new User(id, cleaned)
    obj.validate()
    this.users.set(id, obj)
    console.log(\`[StackOverflowService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[StackOverflowService.getUser] found id=\${obj.id}\`)
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
    console.log(\`[StackOverflowService.createQuestion] stored \${id} count=\${this.questions.size}\`)
    return obj
  }

  getQuestion(id: string): Question {
    const obj = this.questions.get(id)
    if (!obj) {
      throw new Error(\`unknown Question id: \${id}\`)
    }
    console.log(\`[StackOverflowService.getQuestion] found id=\${obj.id}\`)
    return obj
  }

  createAnswer(name: string): Answer {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Answer name required')
    }
    const id = \`ANS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Answer(id, cleaned)
    obj.validate()
    this.answers.set(id, obj)
    console.log(\`[StackOverflowService.createAnswer] stored \${id} count=\${this.answers.size}\`)
    return obj
  }

  getAnswer(id: string): Answer {
    const obj = this.answers.get(id)
    if (!obj) {
      throw new Error(\`unknown Answer id: \${id}\`)
    }
    console.log(\`[StackOverflowService.getAnswer] found id=\${obj.id}\`)
    return obj
  }

  createComment(name: string): Comment {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Comment name required')
    }
    const id = \`COM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Comment(id, cleaned)
    obj.validate()
    this.comments.set(id, obj)
    console.log(\`[StackOverflowService.createComment] stored \${id} count=\${this.comments.size}\`)
    return obj
  }

  getComment(id: string): Comment {
    const obj = this.comments.get(id)
    if (!obj) {
      throw new Error(\`unknown Comment id: \${id}\`)
    }
    console.log(\`[StackOverflowService.getComment] found id=\${obj.id}\`)
    return obj
  }

  createTag(name: string): Tag {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Tag name required')
    }
    const id = \`TAG-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Tag(id, cleaned)
    obj.validate()
    this.tags.set(id, obj)
    console.log(\`[StackOverflowService.createTag] stored \${id} count=\${this.tags.size}\`)
    return obj
  }

  getTag(id: string): Tag {
    const obj = this.tags.get(id)
    if (!obj) {
      throw new Error(\`unknown Tag id: \${id}\`)
    }
    console.log(\`[StackOverflowService.getTag] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[StackOverflowService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[StackOverflowService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct StackOverflowService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new StackOverflowService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Question ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createQuestion('sample-question')
  console.log('========== STEP 4: Create Answer ==========')
  system.createAnswer('sample-answer')
  console.log('========== STEP 5: Create Comment ==========')
  system.createComment('sample-comment')
  console.log('========== STEP 6: Create Tag ==========')
  system.createTag('sample-tag')
  system.listActiveUsers()
  console.log('========== Close first User ==========')
  system.closeUser(first.id)
  try {
    system.closeUser(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getUser('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class User {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  User(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("User requires id and name");
    }
    cout << "[User.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("User invalid status");
    }
    cout << "[User.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("User cannot close");
    }
    status_ = "CLOSED";
    cout << "[User.close] id=" << id_ << " -> CLOSED" << endl;
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


class Answer {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Answer(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Answer requires id and name");
    }
    cout << "[Answer.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Answer invalid status");
    }
    cout << "[Answer.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Answer cannot close");
    }
    status_ = "CLOSED";
    cout << "[Answer.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Comment {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Comment(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Comment requires id and name");
    }
    cout << "[Comment.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Comment invalid status");
    }
    cout << "[Comment.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Comment cannot close");
    }
    status_ = "CLOSED";
    cout << "[Comment.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Tag {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Tag(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Tag requires id and name");
    }
    cout << "[Tag.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Tag invalid status");
    }
    cout << "[Tag.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Tag cannot close");
    }
    status_ = "CLOSED";
    cout << "[Tag.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class StackOverflowService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Question> questions_;
  unordered_map<string, Answer> answers_;
  unordered_map<string, Comment> comments_;
  unordered_map<string, Tag> tags_;
public:
  StackOverflowService() {
    cout << "[StackOverflowService.__init__] system ready" << endl;
  }

  User createUser(const string& name) {
    if (name.empty()) {
      throw invalid_argument("User name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "USE-%04d", seq_++);
    User obj{buf, name};
    obj.validate();
    users_.emplace(obj.id(), obj);
    cout << "[StackOverflowService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[StackOverflowService.getUser] found " << id << endl;
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
    cout << "[StackOverflowService.createQuestion] stored " << obj.id() << endl;
    return obj;
  }

  Question getQuestion(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = questions_.find(id);
    if (it == questions_.end()) {
      throw out_of_range("unknown Question id");
    }
    cout << "[StackOverflowService.getQuestion] found " << id << endl;
    return it->second;
  }

  Answer createAnswer(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Answer name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ANS-%04d", seq_++);
    Answer obj{buf, name};
    obj.validate();
    answers_.emplace(obj.id(), obj);
    cout << "[StackOverflowService.createAnswer] stored " << obj.id() << endl;
    return obj;
  }

  Answer getAnswer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = answers_.find(id);
    if (it == answers_.end()) {
      throw out_of_range("unknown Answer id");
    }
    cout << "[StackOverflowService.getAnswer] found " << id << endl;
    return it->second;
  }

  Comment createComment(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Comment name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "COM-%04d", seq_++);
    Comment obj{buf, name};
    obj.validate();
    comments_.emplace(obj.id(), obj);
    cout << "[StackOverflowService.createComment] stored " << obj.id() << endl;
    return obj;
  }

  Comment getComment(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = comments_.find(id);
    if (it == comments_.end()) {
      throw out_of_range("unknown Comment id");
    }
    cout << "[StackOverflowService.getComment] found " << id << endl;
    return it->second;
  }

  Tag createTag(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Tag name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TAG-%04d", seq_++);
    Tag obj{buf, name};
    obj.validate();
    tags_.emplace(obj.id(), obj);
    cout << "[StackOverflowService.createTag] stored " << obj.id() << endl;
    return obj;
  }

  Tag getTag(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = tags_.find(id);
    if (it == tags_.end()) {
      throw out_of_range("unknown Tag id");
    }
    cout << "[StackOverflowService.getTag] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[StackOverflowService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct StackOverflowService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  StackOverflowService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createQuestion("sample-question");
  system.createAnswer("sample-answer");
  system.createComment("sample-comment");
  system.createTag("sample-tag");
  system.closeUser(first.id());
  try {
    system.closeUser(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getUser("MISSING-ID");
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

type User struct {
  ID     string
  Name   string
  Status string
}

func NewUser(id, name string) (*User, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("User requires id and name")
  }
  obj := &User{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[User.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *User) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("User invalid status")
  }
  fmt.Printf("[User.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *User) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("User %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[User.close] id=%s -> CLOSED\\n", o.ID)
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


type Answer struct {
  ID     string
  Name   string
  Status string
}

func NewAnswer(id, name string) (*Answer, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Answer requires id and name")
  }
  obj := &Answer{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Answer.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Answer) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Answer invalid status")
  }
  fmt.Printf("[Answer.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Answer) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Answer %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Answer.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Comment struct {
  ID     string
  Name   string
  Status string
}

func NewComment(id, name string) (*Comment, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Comment requires id and name")
  }
  obj := &Comment{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Comment.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Comment) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Comment invalid status")
  }
  fmt.Printf("[Comment.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Comment) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Comment %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Comment.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Tag struct {
  ID     string
  Name   string
  Status string
}

func NewTag(id, name string) (*Tag, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Tag requires id and name")
  }
  obj := &Tag{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Tag.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Tag) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Tag invalid status")
  }
  fmt.Printf("[Tag.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Tag) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Tag %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Tag.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type StackOverflowService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  questions map[string]*Question
  answers map[string]*Answer
  comments map[string]*Comment
  tags map[string]*Tag
}

func NewStackOverflowService() *StackOverflowService {
  fmt.Println("[StackOverflowService.__init__] system ready")
  return &StackOverflowService{
    seq: 1,
    users: map[string]*User{},
    questions: map[string]*Question{},
    answers: map[string]*Answer{},
    comments: map[string]*Comment{},
    tags: map[string]*Tag{},
  }
}

func (s *StackOverflowService) CreateUser(name string) (*User, error) {
  if name == "" {
    return nil, fmt.Errorf("User name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("USE-%04d", s.seq)
  s.seq++
  obj, err := NewUser(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.users[id] = obj
  fmt.Printf("[StackOverflowService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[StackOverflowService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) CreateQuestion(name string) (*Question, error) {
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
  fmt.Printf("[StackOverflowService.CreateQuestion] stored %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) GetQuestion(id string) (*Question, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.questions[id]
  if !ok {
    return nil, fmt.Errorf("unknown Question id: %s", id)
  }
  fmt.Printf("[StackOverflowService.GetQuestion] found %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) CreateAnswer(name string) (*Answer, error) {
  if name == "" {
    return nil, fmt.Errorf("Answer name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ANS-%04d", s.seq)
  s.seq++
  obj, err := NewAnswer(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.answers[id] = obj
  fmt.Printf("[StackOverflowService.CreateAnswer] stored %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) GetAnswer(id string) (*Answer, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.answers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Answer id: %s", id)
  }
  fmt.Printf("[StackOverflowService.GetAnswer] found %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) CreateComment(name string) (*Comment, error) {
  if name == "" {
    return nil, fmt.Errorf("Comment name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("COM-%04d", s.seq)
  s.seq++
  obj, err := NewComment(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.comments[id] = obj
  fmt.Printf("[StackOverflowService.CreateComment] stored %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) GetComment(id string) (*Comment, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.comments[id]
  if !ok {
    return nil, fmt.Errorf("unknown Comment id: %s", id)
  }
  fmt.Printf("[StackOverflowService.GetComment] found %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) CreateTag(name string) (*Tag, error) {
  if name == "" {
    return nil, fmt.Errorf("Tag name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TAG-%04d", s.seq)
  s.seq++
  obj, err := NewTag(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.tags[id] = obj
  fmt.Printf("[StackOverflowService.CreateTag] stored %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) GetTag(id string) (*Tag, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.tags[id]
  if !ok {
    return nil, fmt.Errorf("unknown Tag id: %s", id)
  }
  fmt.Printf("[StackOverflowService.GetTag] found %s\\n", id)
  return obj, nil
}

func (s *StackOverflowService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[StackOverflowService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct StackOverflowService ==========")
  system := NewStackOverflowService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateQuestion("sample-question")
  system.CreateAnswer("sample-answer")
  system.CreateComment("sample-comment")
  system.CreateTag("sample-tag")
  system.CloseUser(first.ID)
  if _, err := system.CloseUser(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetUser("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class User {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public User(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("User requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[User.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("User invalid status");
    }
    Console.WriteLine("[User.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("User " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[User.close] id=" + Id + " -> CLOSED");
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


sealed class Answer {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Answer(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Answer requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Answer.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Answer invalid status");
    }
    Console.WriteLine("[Answer.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Answer " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Answer.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Comment {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Comment(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Comment requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Comment.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Comment invalid status");
    }
    Console.WriteLine("[Comment.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Comment " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Comment.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Tag {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Tag(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Tag requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Tag.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Tag invalid status");
    }
    Console.WriteLine("[Tag.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Tag " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Tag.close] id=" + Id + " -> CLOSED");
  }
}

sealed class StackOverflowService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Question> _questions = new();
  private readonly Dictionary<string, Answer> _answers = new();
  private readonly Dictionary<string, Comment> _comments = new();
  private readonly Dictionary<string, Tag> _tags = new();
  public StackOverflowService() {
    Console.WriteLine("[StackOverflowService.__init__] system ready");
  }

  public User CreateUser(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("User name required");
    }
    lock (_gate) {
      var id = string.Format("USE-{0:D4}", _seq++);
      var obj = new User(id, name.Trim());
      obj.Validate();
      _users[id] = obj;
      Console.WriteLine("[StackOverflowService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[StackOverflowService.GetUser] found " + id);
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
      Console.WriteLine("[StackOverflowService.CreateQuestion] stored " + id);
      return obj;
    }
  }

  public Question GetQuestion(string id) {
    lock (_gate) {
      if (!_questions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Question id: " + id);
      }
      Console.WriteLine("[StackOverflowService.GetQuestion] found " + id);
      return obj;
    }
  }

  public Answer CreateAnswer(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Answer name required");
    }
    lock (_gate) {
      var id = string.Format("ANS-{0:D4}", _seq++);
      var obj = new Answer(id, name.Trim());
      obj.Validate();
      _answers[id] = obj;
      Console.WriteLine("[StackOverflowService.CreateAnswer] stored " + id);
      return obj;
    }
  }

  public Answer GetAnswer(string id) {
    lock (_gate) {
      if (!_answers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Answer id: " + id);
      }
      Console.WriteLine("[StackOverflowService.GetAnswer] found " + id);
      return obj;
    }
  }

  public Comment CreateComment(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Comment name required");
    }
    lock (_gate) {
      var id = string.Format("COM-{0:D4}", _seq++);
      var obj = new Comment(id, name.Trim());
      obj.Validate();
      _comments[id] = obj;
      Console.WriteLine("[StackOverflowService.CreateComment] stored " + id);
      return obj;
    }
  }

  public Comment GetComment(string id) {
    lock (_gate) {
      if (!_comments.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Comment id: " + id);
      }
      Console.WriteLine("[StackOverflowService.GetComment] found " + id);
      return obj;
    }
  }

  public Tag CreateTag(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Tag name required");
    }
    lock (_gate) {
      var id = string.Format("TAG-{0:D4}", _seq++);
      var obj = new Tag(id, name.Trim());
      obj.Validate();
      _tags[id] = obj;
      Console.WriteLine("[StackOverflowService.CreateTag] stored " + id);
      return obj;
    }
  }

  public Tag GetTag(string id) {
    lock (_gate) {
      if (!_tags.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Tag id: " + id);
      }
      Console.WriteLine("[StackOverflowService.GetTag] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[StackOverflowService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct StackOverflowService ==========");
    var system = new StackOverflowService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateQuestion("sample-question");
    system.CreateAnswer("sample-answer");
    system.CreateComment("sample-comment");
    system.CreateTag("sample-tag");
    system.CloseUser(first.Id);
    try {
      system.CloseUser(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetUser("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const stackOverflowSolution: ProblemSolution = {
  slug: 'stack-overflow',
  title: 'Stack Overflow / Q&A Platform - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a developer Q&A platform like Stack Overflow with questions, answers, votes, tags, reputation, and search. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Users post questions with a title, body, and tags',
      'Other users post answers to questions',
      'Upvote and downvote questions and answers',
      'Accept the best answer (only by question owner)',
      'Reputation system: gains/loses points based on votes',
      'Tag-based browsing and search by title/body',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Users post questions with a title, body, and tags?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Other users post answers to questions?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Upvote and downvote questions and answers?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Accept the best answer (only by question owner)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Reputation system: gains/loses points based on votes?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. StackOverflowService is the facade stereotype. User, Question, Answer, Comment, Tag are concrete domain classes with id/name/status and validate/close.',
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
          'Construct StackOverflowService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'StackOverflowService', responsibility: 'UML facade - orchestrates Stack Overflow / Q&A Platform.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Question', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Answer', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Comment', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Tag', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from StackOverflowService to User, Question, Answer, Comment, Tag. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on StackOverflowService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'StackOverflowService', responsibility: 'UML facade - orchestrates Stack Overflow / Q&A Platform.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Question', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Answer', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Comment', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Tag', responsibility: 'UML class - domain object for Stack Overflow / Q&A Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'StackOverflowService exposes create/get/close and owns composed collections.' },
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
      'main constructs StackOverflowService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct StackOverflowService.',
      'createUser for alpha and beta.',
      'create remaining UML classes.',
      'closeUser(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createUser("alpha..."); closeUser(id)',
        output: '[User.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeUser(alreadyClosed) or getUser("MISSING-ID")',
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
