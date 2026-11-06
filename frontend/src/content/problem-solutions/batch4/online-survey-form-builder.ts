import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'OnlineSurveyFormBuilderService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_forms', 'Map<string, Form>'),
    attr('-', '_questions', 'Map<string, Question>'),
    attr('-', '_conditional_rules', 'Map<string, ConditionalRule>'),
    attr('-', '_responses', 'Map<string, Response>'),
    attr('-', '_answers', 'Map<string, Answer>'),
  ], [
    method('+', 'createForm', 'name: string', 'Form'),
    method('+', 'createQuestion', 'name: string', 'Question'),
    method('+', 'createConditionalRule', 'name: string', 'ConditionalRule'),
    method('+', 'createResponse', 'name: string', 'Response'),
    method('+', 'createAnswer', 'name: string', 'Answer'),
    method('+', 'getForm', 'id: string', 'Form'),
    method('+', 'getQuestion', 'id: string', 'Question'),
    method('+', 'getConditionalRule', 'id: string', 'ConditionalRule'),
    method('+', 'getResponse', 'id: string', 'Response'),
    method('+', 'getAnswer', 'id: string', 'Answer'),
    method('+', 'closeForm', 'id: string', 'Form'),
  ], 'facade'),
  cls('n1', 'Form', GRID.x(1), GRID.y(0), [
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
  cls('n3', 'ConditionalRule', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Response', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Answer', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("online-survey-form-builder")


class Form:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Form.id is required")
        if not name or not name.strip():
            raise ValueError("Form.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Form.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Form {self.id} has invalid status={self.status}")
        log.info("[Form.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Form {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Form.close] id=%s -> CLOSED", self.id)


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


class ConditionalRule:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ConditionalRule.id is required")
        if not name or not name.strip():
            raise ValueError("ConditionalRule.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ConditionalRule.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ConditionalRule {self.id} has invalid status={self.status}")
        log.info("[ConditionalRule.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ConditionalRule {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ConditionalRule.close] id=%s -> CLOSED", self.id)


class Response:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Response.id is required")
        if not name or not name.strip():
            raise ValueError("Response.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Response.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Response {self.id} has invalid status={self.status}")
        log.info("[Response.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Response {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Response.close] id=%s -> CLOSED", self.id)


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


class OnlineSurveyFormBuilderService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._forms: Dict[str, Form] = {}
        self._questions: Dict[str, Question] = {}
        self._conditional_rules: Dict[str, ConditionalRule] = {}
        self._responses: Dict[str, Response] = {}
        self._answers: Dict[str, Answer] = {}
        log.info("[OnlineSurveyFormBuilderService.__init__] system ready; managing: Form, Question, ConditionalRule, Response, Answer")

    def create_form(self, name: str) -> Form:
        """UML: OnlineSurveyFormBuilderService.create_form(name) -> Form"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Form name is required")
        with self._lock:
            item_id = f"FOR-{self._seq:04d}"
            self._seq += 1
            obj = Form(item_id, cleaned)
            obj.validate()
            self._forms[item_id] = obj
            log.info("[OnlineSurveyFormBuilderService.create_form] stored %s in _forms (count=%s)", item_id, len(self._forms))
            return obj

    def get_form(self, item_id: str) -> Form:
        with self._lock:
            obj = self._forms.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Form id: {item_id}")
            log.info("[OnlineSurveyFormBuilderService.get_form] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_question(self, name: str) -> Question:
        """UML: OnlineSurveyFormBuilderService.create_question(name) -> Question"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Question name is required")
        with self._lock:
            item_id = f"QUE-{self._seq:04d}"
            self._seq += 1
            obj = Question(item_id, cleaned)
            obj.validate()
            self._questions[item_id] = obj
            log.info("[OnlineSurveyFormBuilderService.create_question] stored %s in _questions (count=%s)", item_id, len(self._questions))
            return obj

    def get_question(self, item_id: str) -> Question:
        with self._lock:
            obj = self._questions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Question id: {item_id}")
            log.info("[OnlineSurveyFormBuilderService.get_question] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_conditional_rule(self, name: str) -> ConditionalRule:
        """UML: OnlineSurveyFormBuilderService.create_conditional_rule(name) -> ConditionalRule"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ConditionalRule name is required")
        with self._lock:
            item_id = f"CON-{self._seq:04d}"
            self._seq += 1
            obj = ConditionalRule(item_id, cleaned)
            obj.validate()
            self._conditional_rules[item_id] = obj
            log.info("[OnlineSurveyFormBuilderService.create_conditional_rule] stored %s in _conditional_rules (count=%s)", item_id, len(self._conditional_rules))
            return obj

    def get_conditional_rule(self, item_id: str) -> ConditionalRule:
        with self._lock:
            obj = self._conditional_rules.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ConditionalRule id: {item_id}")
            log.info("[OnlineSurveyFormBuilderService.get_conditional_rule] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_response(self, name: str) -> Response:
        """UML: OnlineSurveyFormBuilderService.create_response(name) -> Response"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Response name is required")
        with self._lock:
            item_id = f"RES-{self._seq:04d}"
            self._seq += 1
            obj = Response(item_id, cleaned)
            obj.validate()
            self._responses[item_id] = obj
            log.info("[OnlineSurveyFormBuilderService.create_response] stored %s in _responses (count=%s)", item_id, len(self._responses))
            return obj

    def get_response(self, item_id: str) -> Response:
        with self._lock:
            obj = self._responses.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Response id: {item_id}")
            log.info("[OnlineSurveyFormBuilderService.get_response] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_answer(self, name: str) -> Answer:
        """UML: OnlineSurveyFormBuilderService.create_answer(name) -> Answer"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Answer name is required")
        with self._lock:
            item_id = f"ANS-{self._seq:04d}"
            self._seq += 1
            obj = Answer(item_id, cleaned)
            obj.validate()
            self._answers[item_id] = obj
            log.info("[OnlineSurveyFormBuilderService.create_answer] stored %s in _answers (count=%s)", item_id, len(self._answers))
            return obj

    def get_answer(self, item_id: str) -> Answer:
        with self._lock:
            obj = self._answers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Answer id: {item_id}")
            log.info("[OnlineSurveyFormBuilderService.get_answer] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_form(self, item_id: str) -> Form:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._forms.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Form id: {item_id}")
            log.info("[OnlineSurveyFormBuilderService.close_form] closing %s via Form.close()", item_id)
            obj.close()
            return obj

    def list_active_forms(self) -> List[Form]:
        with self._lock:
            active = [o for o in self._forms.values() if o.status == "ACTIVE"]
            log.info("[OnlineSurveyFormBuilderService.list_active_forms] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct OnlineSurveyFormBuilderService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = OnlineSurveyFormBuilderService()

    log.info("========== STEP 2: Create primary Form objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_form("alpha-form")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_form("beta-form")

    log.info("========== STEP 3: Create Question (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_question("sample-question")

    log.info("========== STEP 4: Create ConditionalRule (UML class) ==========")
    system.create_conditional_rule("sample-conditional_rule")

    log.info("========== STEP 5: Create Response (UML class) ==========")
    system.create_response("sample-response")

    log.info("========== STEP 6: Create Answer (UML class) ==========")
    system.create_answer("sample-answer")

    log.info("========== STEP 7: Inspect active Form list ==========")
    system.list_active_forms()

    log.info("========== STEP 8: Close first Form ==========")
    system.close_form(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_form(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Form.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_form("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_form: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_forms()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Form {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Form(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Form.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Form.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Form.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Form " + id + " invalid status");
    }
    System.out.println("[Form.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Form " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Form.close] id=" + id + " -> CLOSED");
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


class ConditionalRule {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ConditionalRule(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ConditionalRule.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ConditionalRule.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ConditionalRule.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ConditionalRule " + id + " invalid status");
    }
    System.out.println("[ConditionalRule.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ConditionalRule " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ConditionalRule.close] id=" + id + " -> CLOSED");
  }
}


class Response {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Response(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Response.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Response.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Response.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Response " + id + " invalid status");
    }
    System.out.println("[Response.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Response " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Response.close] id=" + id + " -> CLOSED");
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

public class OnlineSurveyFormBuilderService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Form> forms = new LinkedHashMap<>();
  private final Map<String, Question> questions = new LinkedHashMap<>();
  private final Map<String, ConditionalRule> conditional_rules = new LinkedHashMap<>();
  private final Map<String, Response> responses = new LinkedHashMap<>();
  private final Map<String, Answer> answers = new LinkedHashMap<>();

  public OnlineSurveyFormBuilderService() {
    System.out.println("[OnlineSurveyFormBuilderService.__init__] system ready");
  }

  public Form createForm(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Form name required");
    }
    lock.lock();
    try {
      String id = String.format("FOR-%04d", seq++);
      Form obj = new Form(id, name.trim());
      obj.validate();
      forms.put(id, obj);
      System.out.println("[OnlineSurveyFormBuilderService.createForm] stored " + id + " count=" + forms.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Form getForm(String id) {
    lock.lock();
    try {
      Form obj = forms.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Form id: " + id);
      }
      System.out.println("[OnlineSurveyFormBuilderService.getForm] found id=" + obj.getId());
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
      System.out.println("[OnlineSurveyFormBuilderService.createQuestion] stored " + id + " count=" + questions.size());
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
      System.out.println("[OnlineSurveyFormBuilderService.getQuestion] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ConditionalRule createConditionalRule(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ConditionalRule name required");
    }
    lock.lock();
    try {
      String id = String.format("CON-%04d", seq++);
      ConditionalRule obj = new ConditionalRule(id, name.trim());
      obj.validate();
      conditional_rules.put(id, obj);
      System.out.println("[OnlineSurveyFormBuilderService.createConditionalRule] stored " + id + " count=" + conditional_rules.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ConditionalRule getConditionalRule(String id) {
    lock.lock();
    try {
      ConditionalRule obj = conditional_rules.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ConditionalRule id: " + id);
      }
      System.out.println("[OnlineSurveyFormBuilderService.getConditionalRule] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Response createResponse(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Response name required");
    }
    lock.lock();
    try {
      String id = String.format("RES-%04d", seq++);
      Response obj = new Response(id, name.trim());
      obj.validate();
      responses.put(id, obj);
      System.out.println("[OnlineSurveyFormBuilderService.createResponse] stored " + id + " count=" + responses.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Response getResponse(String id) {
    lock.lock();
    try {
      Response obj = responses.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Response id: " + id);
      }
      System.out.println("[OnlineSurveyFormBuilderService.getResponse] found id=" + obj.getId());
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
      System.out.println("[OnlineSurveyFormBuilderService.createAnswer] stored " + id + " count=" + answers.size());
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
      System.out.println("[OnlineSurveyFormBuilderService.getAnswer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Form closeForm(String id) {
    lock.lock();
    try {
      Form obj = forms.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Form id: " + id);
      }
      System.out.println("[OnlineSurveyFormBuilderService.closeForm] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Form> listActiveForms() {
    lock.lock();
    try {
      List<Form> out = new ArrayList<>();
      for (Form o : forms.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[OnlineSurveyFormBuilderService.listActiveForms] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct OnlineSurveyFormBuilderService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    OnlineSurveyFormBuilderService system = new OnlineSurveyFormBuilderService();
    System.out.println("========== STEP 2: Create Form objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Form first = system.createForm("alpha-form");
    system.createForm("beta-form");
    System.out.println("========== STEP 3: Create Question ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createQuestion("sample-question");
    System.out.println("========== STEP 4: Create ConditionalRule ==========");
    system.createConditionalRule("sample-conditional_rule");
    System.out.println("========== STEP 5: Create Response ==========");
    system.createResponse("sample-response");
    System.out.println("========== STEP 6: Create Answer ==========");
    system.createAnswer("sample-answer");
    System.out.println("========== Inspect active list ==========");
    system.listActiveForms();
    System.out.println("========== Close first Form ==========");
    system.closeForm(first.getId());
    try {
      system.closeForm(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getForm("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Form {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Form.id required')
    }

    if (!name?.trim()) {
      throw new Error('Form.name required')
    }
    console.log(\`[Form.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Form \${this.id} invalid status\`)
    }
    console.log(\`[Form.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Form \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Form.close] id=\${this.id} -> CLOSED\`)
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


class ConditionalRule {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ConditionalRule.id required')
    }

    if (!name?.trim()) {
      throw new Error('ConditionalRule.name required')
    }
    console.log(\`[ConditionalRule.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ConditionalRule \${this.id} invalid status\`)
    }
    console.log(\`[ConditionalRule.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ConditionalRule \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ConditionalRule.close] id=\${this.id} -> CLOSED\`)
  }
}


class Response {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Response.id required')
    }

    if (!name?.trim()) {
      throw new Error('Response.name required')
    }
    console.log(\`[Response.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Response \${this.id} invalid status\`)
    }
    console.log(\`[Response.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Response \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Response.close] id=\${this.id} -> CLOSED\`)
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

class OnlineSurveyFormBuilderService {
  private seq = 1
  private forms = new Map<string, Form>()
  private questions = new Map<string, Question>()
  private conditional_rules = new Map<string, ConditionalRule>()
  private responses = new Map<string, Response>()
  private answers = new Map<string, Answer>()
  constructor() {
    console.log('[OnlineSurveyFormBuilderService.__init__] system ready')
  }

  createForm(name: string): Form {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Form name required')
    }
    const id = \`FOR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Form(id, cleaned)
    obj.validate()
    this.forms.set(id, obj)
    console.log(\`[OnlineSurveyFormBuilderService.createForm] stored \${id} count=\${this.forms.size}\`)
    return obj
  }

  getForm(id: string): Form {
    const obj = this.forms.get(id)
    if (!obj) {
      throw new Error(\`unknown Form id: \${id}\`)
    }
    console.log(\`[OnlineSurveyFormBuilderService.getForm] found id=\${obj.id}\`)
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
    console.log(\`[OnlineSurveyFormBuilderService.createQuestion] stored \${id} count=\${this.questions.size}\`)
    return obj
  }

  getQuestion(id: string): Question {
    const obj = this.questions.get(id)
    if (!obj) {
      throw new Error(\`unknown Question id: \${id}\`)
    }
    console.log(\`[OnlineSurveyFormBuilderService.getQuestion] found id=\${obj.id}\`)
    return obj
  }

  createConditionalRule(name: string): ConditionalRule {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ConditionalRule name required')
    }
    const id = \`CON-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ConditionalRule(id, cleaned)
    obj.validate()
    this.conditional_rules.set(id, obj)
    console.log(\`[OnlineSurveyFormBuilderService.createConditionalRule] stored \${id} count=\${this.conditional_rules.size}\`)
    return obj
  }

  getConditionalRule(id: string): ConditionalRule {
    const obj = this.conditional_rules.get(id)
    if (!obj) {
      throw new Error(\`unknown ConditionalRule id: \${id}\`)
    }
    console.log(\`[OnlineSurveyFormBuilderService.getConditionalRule] found id=\${obj.id}\`)
    return obj
  }

  createResponse(name: string): Response {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Response name required')
    }
    const id = \`RES-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Response(id, cleaned)
    obj.validate()
    this.responses.set(id, obj)
    console.log(\`[OnlineSurveyFormBuilderService.createResponse] stored \${id} count=\${this.responses.size}\`)
    return obj
  }

  getResponse(id: string): Response {
    const obj = this.responses.get(id)
    if (!obj) {
      throw new Error(\`unknown Response id: \${id}\`)
    }
    console.log(\`[OnlineSurveyFormBuilderService.getResponse] found id=\${obj.id}\`)
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
    console.log(\`[OnlineSurveyFormBuilderService.createAnswer] stored \${id} count=\${this.answers.size}\`)
    return obj
  }

  getAnswer(id: string): Answer {
    const obj = this.answers.get(id)
    if (!obj) {
      throw new Error(\`unknown Answer id: \${id}\`)
    }
    console.log(\`[OnlineSurveyFormBuilderService.getAnswer] found id=\${obj.id}\`)
    return obj
  }

  closeForm(id: string): Form {
    const obj = this.getForm(id)
    console.log(\`[OnlineSurveyFormBuilderService.closeForm] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveForms(): Form[] {
    const active = [...this.forms.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[OnlineSurveyFormBuilderService.listActiveForms] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct OnlineSurveyFormBuilderService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new OnlineSurveyFormBuilderService()
  console.log('========== STEP 2: Create Form objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createForm('alpha-form')
  system.createForm('beta-form')
  console.log('========== STEP 3: Create Question ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createQuestion('sample-question')
  console.log('========== STEP 4: Create ConditionalRule ==========')
  system.createConditionalRule('sample-conditional_rule')
  console.log('========== STEP 5: Create Response ==========')
  system.createResponse('sample-response')
  console.log('========== STEP 6: Create Answer ==========')
  system.createAnswer('sample-answer')
  system.listActiveForms()
  console.log('========== Close first Form ==========')
  system.closeForm(first.id)
  try {
    system.closeForm(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getForm('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Form {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Form(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Form requires id and name");
    }
    cout << "[Form.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Form invalid status");
    }
    cout << "[Form.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Form cannot close");
    }
    status_ = "CLOSED";
    cout << "[Form.close] id=" << id_ << " -> CLOSED" << endl;
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


class ConditionalRule {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ConditionalRule(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ConditionalRule requires id and name");
    }
    cout << "[ConditionalRule.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ConditionalRule invalid status");
    }
    cout << "[ConditionalRule.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ConditionalRule cannot close");
    }
    status_ = "CLOSED";
    cout << "[ConditionalRule.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Response {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Response(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Response requires id and name");
    }
    cout << "[Response.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Response invalid status");
    }
    cout << "[Response.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Response cannot close");
    }
    status_ = "CLOSED";
    cout << "[Response.close] id=" << id_ << " -> CLOSED" << endl;
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

class OnlineSurveyFormBuilderService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Form> forms_;
  unordered_map<string, Question> questions_;
  unordered_map<string, ConditionalRule> conditional_rules_;
  unordered_map<string, Response> responses_;
  unordered_map<string, Answer> answers_;
public:
  OnlineSurveyFormBuilderService() {
    cout << "[OnlineSurveyFormBuilderService.__init__] system ready" << endl;
  }

  Form createForm(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Form name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FOR-%04d", seq_++);
    Form obj{buf, name};
    obj.validate();
    forms_.emplace(obj.id(), obj);
    cout << "[OnlineSurveyFormBuilderService.createForm] stored " << obj.id() << endl;
    return obj;
  }

  Form getForm(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = forms_.find(id);
    if (it == forms_.end()) {
      throw out_of_range("unknown Form id");
    }
    cout << "[OnlineSurveyFormBuilderService.getForm] found " << id << endl;
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
    cout << "[OnlineSurveyFormBuilderService.createQuestion] stored " << obj.id() << endl;
    return obj;
  }

  Question getQuestion(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = questions_.find(id);
    if (it == questions_.end()) {
      throw out_of_range("unknown Question id");
    }
    cout << "[OnlineSurveyFormBuilderService.getQuestion] found " << id << endl;
    return it->second;
  }

  ConditionalRule createConditionalRule(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ConditionalRule name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CON-%04d", seq_++);
    ConditionalRule obj{buf, name};
    obj.validate();
    conditional_rules_.emplace(obj.id(), obj);
    cout << "[OnlineSurveyFormBuilderService.createConditionalRule] stored " << obj.id() << endl;
    return obj;
  }

  ConditionalRule getConditionalRule(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = conditional_rules_.find(id);
    if (it == conditional_rules_.end()) {
      throw out_of_range("unknown ConditionalRule id");
    }
    cout << "[OnlineSurveyFormBuilderService.getConditionalRule] found " << id << endl;
    return it->second;
  }

  Response createResponse(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Response name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "RES-%04d", seq_++);
    Response obj{buf, name};
    obj.validate();
    responses_.emplace(obj.id(), obj);
    cout << "[OnlineSurveyFormBuilderService.createResponse] stored " << obj.id() << endl;
    return obj;
  }

  Response getResponse(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = responses_.find(id);
    if (it == responses_.end()) {
      throw out_of_range("unknown Response id");
    }
    cout << "[OnlineSurveyFormBuilderService.getResponse] found " << id << endl;
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
    cout << "[OnlineSurveyFormBuilderService.createAnswer] stored " << obj.id() << endl;
    return obj;
  }

  Answer getAnswer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = answers_.find(id);
    if (it == answers_.end()) {
      throw out_of_range("unknown Answer id");
    }
    cout << "[OnlineSurveyFormBuilderService.getAnswer] found " << id << endl;
    return it->second;
  }

  Form closeForm(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = forms_.find(id);
    if (it == forms_.end()) {
      throw out_of_range("unknown Form");
    }
    cout << "[OnlineSurveyFormBuilderService.closeForm] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct OnlineSurveyFormBuilderService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  OnlineSurveyFormBuilderService system;
  cout << "========== STEP 2: Create Form ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createForm("alpha-form");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createForm("beta-form");
  system.createQuestion("sample-question");
  system.createConditionalRule("sample-conditional_rule");
  system.createResponse("sample-response");
  system.createAnswer("sample-answer");
  system.closeForm(first.id());
  try {
    system.closeForm(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getForm("MISSING-ID");
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

type Form struct {
  ID     string
  Name   string
  Status string
}

func NewForm(id, name string) (*Form, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Form requires id and name")
  }
  obj := &Form{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Form.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Form) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Form invalid status")
  }
  fmt.Printf("[Form.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Form) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Form %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Form.close] id=%s -> CLOSED\\n", o.ID)
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


type ConditionalRule struct {
  ID     string
  Name   string
  Status string
}

func NewConditionalRule(id, name string) (*ConditionalRule, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ConditionalRule requires id and name")
  }
  obj := &ConditionalRule{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ConditionalRule.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ConditionalRule) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ConditionalRule invalid status")
  }
  fmt.Printf("[ConditionalRule.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ConditionalRule) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ConditionalRule %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ConditionalRule.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Response struct {
  ID     string
  Name   string
  Status string
}

func NewResponse(id, name string) (*Response, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Response requires id and name")
  }
  obj := &Response{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Response.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Response) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Response invalid status")
  }
  fmt.Printf("[Response.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Response) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Response %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Response.close] id=%s -> CLOSED\\n", o.ID)
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

type OnlineSurveyFormBuilderService struct {
  mu  sync.Mutex
  seq int
  forms map[string]*Form
  questions map[string]*Question
  conditional_rules map[string]*ConditionalRule
  responses map[string]*Response
  answers map[string]*Answer
}

func NewOnlineSurveyFormBuilderService() *OnlineSurveyFormBuilderService {
  fmt.Println("[OnlineSurveyFormBuilderService.__init__] system ready")
  return &OnlineSurveyFormBuilderService{
    seq: 1,
    forms: map[string]*Form{},
    questions: map[string]*Question{},
    conditional_rules: map[string]*ConditionalRule{},
    responses: map[string]*Response{},
    answers: map[string]*Answer{},
  }
}

func (s *OnlineSurveyFormBuilderService) CreateForm(name string) (*Form, error) {
  if name == "" {
    return nil, fmt.Errorf("Form name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FOR-%04d", s.seq)
  s.seq++
  obj, err := NewForm(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.forms[id] = obj
  fmt.Printf("[OnlineSurveyFormBuilderService.CreateForm] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) GetForm(id string) (*Form, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.forms[id]
  if !ok {
    return nil, fmt.Errorf("unknown Form id: %s", id)
  }
  fmt.Printf("[OnlineSurveyFormBuilderService.GetForm] found %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) CreateQuestion(name string) (*Question, error) {
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
  fmt.Printf("[OnlineSurveyFormBuilderService.CreateQuestion] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) GetQuestion(id string) (*Question, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.questions[id]
  if !ok {
    return nil, fmt.Errorf("unknown Question id: %s", id)
  }
  fmt.Printf("[OnlineSurveyFormBuilderService.GetQuestion] found %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) CreateConditionalRule(name string) (*ConditionalRule, error) {
  if name == "" {
    return nil, fmt.Errorf("ConditionalRule name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CON-%04d", s.seq)
  s.seq++
  obj, err := NewConditionalRule(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.conditional_rules[id] = obj
  fmt.Printf("[OnlineSurveyFormBuilderService.CreateConditionalRule] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) GetConditionalRule(id string) (*ConditionalRule, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.conditional_rules[id]
  if !ok {
    return nil, fmt.Errorf("unknown ConditionalRule id: %s", id)
  }
  fmt.Printf("[OnlineSurveyFormBuilderService.GetConditionalRule] found %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) CreateResponse(name string) (*Response, error) {
  if name == "" {
    return nil, fmt.Errorf("Response name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("RES-%04d", s.seq)
  s.seq++
  obj, err := NewResponse(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.responses[id] = obj
  fmt.Printf("[OnlineSurveyFormBuilderService.CreateResponse] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) GetResponse(id string) (*Response, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.responses[id]
  if !ok {
    return nil, fmt.Errorf("unknown Response id: %s", id)
  }
  fmt.Printf("[OnlineSurveyFormBuilderService.GetResponse] found %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) CreateAnswer(name string) (*Answer, error) {
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
  fmt.Printf("[OnlineSurveyFormBuilderService.CreateAnswer] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) GetAnswer(id string) (*Answer, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.answers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Answer id: %s", id)
  }
  fmt.Printf("[OnlineSurveyFormBuilderService.GetAnswer] found %s\\n", id)
  return obj, nil
}

func (s *OnlineSurveyFormBuilderService) CloseForm(id string) (*Form, error) {
  obj, err := s.GetForm(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[OnlineSurveyFormBuilderService.CloseForm] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct OnlineSurveyFormBuilderService ==========")
  system := NewOnlineSurveyFormBuilderService()
  fmt.Println("========== STEP 2: Create Form ==========")
  first, _ := system.CreateForm("alpha-form")
  system.CreateForm("beta-form")
  system.CreateQuestion("sample-question")
  system.CreateConditionalRule("sample-conditional_rule")
  system.CreateResponse("sample-response")
  system.CreateAnswer("sample-answer")
  system.CloseForm(first.ID)
  if _, err := system.CloseForm(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetForm("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Form {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Form(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Form requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Form.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Form invalid status");
    }
    Console.WriteLine("[Form.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Form " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Form.close] id=" + Id + " -> CLOSED");
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


sealed class ConditionalRule {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ConditionalRule(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ConditionalRule requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ConditionalRule.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ConditionalRule invalid status");
    }
    Console.WriteLine("[ConditionalRule.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ConditionalRule " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ConditionalRule.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Response {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Response(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Response requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Response.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Response invalid status");
    }
    Console.WriteLine("[Response.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Response " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Response.close] id=" + Id + " -> CLOSED");
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

sealed class OnlineSurveyFormBuilderService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Form> _forms = new();
  private readonly Dictionary<string, Question> _questions = new();
  private readonly Dictionary<string, ConditionalRule> _conditional_rules = new();
  private readonly Dictionary<string, Response> _responses = new();
  private readonly Dictionary<string, Answer> _answers = new();
  public OnlineSurveyFormBuilderService() {
    Console.WriteLine("[OnlineSurveyFormBuilderService.__init__] system ready");
  }

  public Form CreateForm(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Form name required");
    }
    lock (_gate) {
      var id = string.Format("FOR-{0:D4}", _seq++);
      var obj = new Form(id, name.Trim());
      obj.Validate();
      _forms[id] = obj;
      Console.WriteLine("[OnlineSurveyFormBuilderService.CreateForm] stored " + id);
      return obj;
    }
  }

  public Form GetForm(string id) {
    lock (_gate) {
      if (!_forms.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Form id: " + id);
      }
      Console.WriteLine("[OnlineSurveyFormBuilderService.GetForm] found " + id);
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
      Console.WriteLine("[OnlineSurveyFormBuilderService.CreateQuestion] stored " + id);
      return obj;
    }
  }

  public Question GetQuestion(string id) {
    lock (_gate) {
      if (!_questions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Question id: " + id);
      }
      Console.WriteLine("[OnlineSurveyFormBuilderService.GetQuestion] found " + id);
      return obj;
    }
  }

  public ConditionalRule CreateConditionalRule(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ConditionalRule name required");
    }
    lock (_gate) {
      var id = string.Format("CON-{0:D4}", _seq++);
      var obj = new ConditionalRule(id, name.Trim());
      obj.Validate();
      _conditional_rules[id] = obj;
      Console.WriteLine("[OnlineSurveyFormBuilderService.CreateConditionalRule] stored " + id);
      return obj;
    }
  }

  public ConditionalRule GetConditionalRule(string id) {
    lock (_gate) {
      if (!_conditional_rules.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ConditionalRule id: " + id);
      }
      Console.WriteLine("[OnlineSurveyFormBuilderService.GetConditionalRule] found " + id);
      return obj;
    }
  }

  public Response CreateResponse(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Response name required");
    }
    lock (_gate) {
      var id = string.Format("RES-{0:D4}", _seq++);
      var obj = new Response(id, name.Trim());
      obj.Validate();
      _responses[id] = obj;
      Console.WriteLine("[OnlineSurveyFormBuilderService.CreateResponse] stored " + id);
      return obj;
    }
  }

  public Response GetResponse(string id) {
    lock (_gate) {
      if (!_responses.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Response id: " + id);
      }
      Console.WriteLine("[OnlineSurveyFormBuilderService.GetResponse] found " + id);
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
      Console.WriteLine("[OnlineSurveyFormBuilderService.CreateAnswer] stored " + id);
      return obj;
    }
  }

  public Answer GetAnswer(string id) {
    lock (_gate) {
      if (!_answers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Answer id: " + id);
      }
      Console.WriteLine("[OnlineSurveyFormBuilderService.GetAnswer] found " + id);
      return obj;
    }
  }

  public Form CloseForm(string id) {
    var obj = GetForm(id);
    Console.WriteLine("[OnlineSurveyFormBuilderService.CloseForm] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct OnlineSurveyFormBuilderService ==========");
    var system = new OnlineSurveyFormBuilderService();
    Console.WriteLine("========== STEP 2: Create Form ==========");
    var first = system.CreateForm("alpha-form");
    system.CreateForm("beta-form");
    system.CreateQuestion("sample-question");
    system.CreateConditionalRule("sample-conditional_rule");
    system.CreateResponse("sample-response");
    system.CreateAnswer("sample-answer");
    system.CloseForm(first.Id);
    try {
      system.CloseForm(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetForm("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const onlineSurveyFormBuilderSolution: ProblemSolution = {
  slug: 'online-survey-form-builder',
  title: 'Online Survey / Form Builder - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a form-building platform (like Google Forms) supporting custom questions, conditional logic, and response analytics. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Build a form with multiple question types (text, multiple-choice, rating, date)',
      'Support conditional/branching logic (show Q5 only if Q3 = "Yes")',
      'Collect and store form responses',
      'Validate responses against question constraints (required, min/max)',
      'Generate response analytics (counts, averages, charts)',
      'Share a form via a public link',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Build a form with multiple question types (text, multiple-choice, rating, date)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Support conditional/branching logic (show Q5 only if Q3 = "Yes")?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Collect and store form responses?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Validate responses against question constraints (required, min/max)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Generate response analytics (counts, averages, charts)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. OnlineSurveyFormBuilderService is the facade stereotype. Form, Question, ConditionalRule, Response, Answer are concrete domain classes with id/name/status and validate/close.',
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
          'Construct OnlineSurveyFormBuilderService.',
          'createForm twice and create the related UML classes.',
          'closeForm once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'OnlineSurveyFormBuilderService', responsibility: 'UML facade - orchestrates Online Survey / Form Builder.', keyMembers: ['create*', 'get*', 'closeForm'] },
    { name: 'Form', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Question', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ConditionalRule', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Response', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Answer', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from OnlineSurveyFormBuilderService to Form, Question, ConditionalRule, Response, Answer. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on OnlineSurveyFormBuilderService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'OnlineSurveyFormBuilderService', responsibility: 'UML facade - orchestrates Online Survey / Form Builder.', keyMembers: ['create*', 'get*', 'closeForm'] },
    { name: 'Form', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Question', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ConditionalRule', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Response', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Answer', responsibility: 'UML class - domain object for Online Survey / Form Builder.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'OnlineSurveyFormBuilderService exposes create/get/close and owns composed collections.' },
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
      'main constructs OnlineSurveyFormBuilderService, creates UML domain objects, closes the primary Form, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct OnlineSurveyFormBuilderService.',
      'createForm for alpha and beta.',
      'create remaining UML classes.',
      'closeForm(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createForm("alpha..."); closeForm(id)',
        output: '[Form.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeForm(alreadyClosed) or getForm("MISSING-ID")',
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
