import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'OnlineCodeJudgeService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_problems', 'Map<string, Problem>'),
    attr('-', '_test_cases', 'Map<string, TestCase>'),
    attr('-', '_submissions', 'Map<string, Submission>'),
    attr('-', '_judges', 'Map<string, Judge>'),
    attr('-', '_execution_results', 'Map<string, ExecutionResult>'),
  ], [
    method('+', 'createProblem', 'name: string', 'Problem'),
    method('+', 'createTestCase', 'name: string', 'TestCase'),
    method('+', 'createSubmission', 'name: string', 'Submission'),
    method('+', 'createJudge', 'name: string', 'Judge'),
    method('+', 'createExecutionResult', 'name: string', 'ExecutionResult'),
    method('+', 'getProblem', 'id: string', 'Problem'),
    method('+', 'getTestCase', 'id: string', 'TestCase'),
    method('+', 'getSubmission', 'id: string', 'Submission'),
    method('+', 'getJudge', 'id: string', 'Judge'),
    method('+', 'getExecutionResult', 'id: string', 'ExecutionResult'),
    method('+', 'closeProblem', 'id: string', 'Problem'),
  ], 'facade'),
  cls('n1', 'Problem', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'TestCase', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Submission', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Judge', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'ExecutionResult', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("online-code-judge")


class Problem:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Problem.id is required")
        if not name or not name.strip():
            raise ValueError("Problem.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Problem.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Problem {self.id} has invalid status={self.status}")
        log.info("[Problem.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Problem {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Problem.close] id=%s -> CLOSED", self.id)


class TestCase:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("TestCase.id is required")
        if not name or not name.strip():
            raise ValueError("TestCase.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[TestCase.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"TestCase {self.id} has invalid status={self.status}")
        log.info("[TestCase.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"TestCase {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[TestCase.close] id=%s -> CLOSED", self.id)


class Submission:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Submission.id is required")
        if not name or not name.strip():
            raise ValueError("Submission.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Submission.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Submission {self.id} has invalid status={self.status}")
        log.info("[Submission.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Submission {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Submission.close] id=%s -> CLOSED", self.id)


class Judge:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Judge.id is required")
        if not name or not name.strip():
            raise ValueError("Judge.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Judge.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Judge {self.id} has invalid status={self.status}")
        log.info("[Judge.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Judge {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Judge.close] id=%s -> CLOSED", self.id)


class ExecutionResult:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ExecutionResult.id is required")
        if not name or not name.strip():
            raise ValueError("ExecutionResult.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ExecutionResult.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ExecutionResult {self.id} has invalid status={self.status}")
        log.info("[ExecutionResult.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ExecutionResult {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ExecutionResult.close] id=%s -> CLOSED", self.id)


class OnlineCodeJudgeService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._problems: Dict[str, Problem] = {}
        self._test_cases: Dict[str, TestCase] = {}
        self._submissions: Dict[str, Submission] = {}
        self._judges: Dict[str, Judge] = {}
        self._execution_results: Dict[str, ExecutionResult] = {}
        log.info("[OnlineCodeJudgeService.__init__] system ready; managing: Problem, TestCase, Submission, Judge, ExecutionResult")

    def create_problem(self, name: str) -> Problem:
        """UML: OnlineCodeJudgeService.create_problem(name) -> Problem"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Problem name is required")
        with self._lock:
            item_id = f"PRO-{self._seq:04d}"
            self._seq += 1
            obj = Problem(item_id, cleaned)
            obj.validate()
            self._problems[item_id] = obj
            log.info("[OnlineCodeJudgeService.create_problem] stored %s in _problems (count=%s)", item_id, len(self._problems))
            return obj

    def get_problem(self, item_id: str) -> Problem:
        with self._lock:
            obj = self._problems.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Problem id: {item_id}")
            log.info("[OnlineCodeJudgeService.get_problem] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_test_case(self, name: str) -> TestCase:
        """UML: OnlineCodeJudgeService.create_test_case(name) -> TestCase"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("TestCase name is required")
        with self._lock:
            item_id = f"TES-{self._seq:04d}"
            self._seq += 1
            obj = TestCase(item_id, cleaned)
            obj.validate()
            self._test_cases[item_id] = obj
            log.info("[OnlineCodeJudgeService.create_test_case] stored %s in _test_cases (count=%s)", item_id, len(self._test_cases))
            return obj

    def get_test_case(self, item_id: str) -> TestCase:
        with self._lock:
            obj = self._test_cases.get(item_id)
            if obj is None:
                raise KeyError(f"unknown TestCase id: {item_id}")
            log.info("[OnlineCodeJudgeService.get_test_case] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_submission(self, name: str) -> Submission:
        """UML: OnlineCodeJudgeService.create_submission(name) -> Submission"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Submission name is required")
        with self._lock:
            item_id = f"SUB-{self._seq:04d}"
            self._seq += 1
            obj = Submission(item_id, cleaned)
            obj.validate()
            self._submissions[item_id] = obj
            log.info("[OnlineCodeJudgeService.create_submission] stored %s in _submissions (count=%s)", item_id, len(self._submissions))
            return obj

    def get_submission(self, item_id: str) -> Submission:
        with self._lock:
            obj = self._submissions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Submission id: {item_id}")
            log.info("[OnlineCodeJudgeService.get_submission] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_judge(self, name: str) -> Judge:
        """UML: OnlineCodeJudgeService.create_judge(name) -> Judge"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Judge name is required")
        with self._lock:
            item_id = f"JUD-{self._seq:04d}"
            self._seq += 1
            obj = Judge(item_id, cleaned)
            obj.validate()
            self._judges[item_id] = obj
            log.info("[OnlineCodeJudgeService.create_judge] stored %s in _judges (count=%s)", item_id, len(self._judges))
            return obj

    def get_judge(self, item_id: str) -> Judge:
        with self._lock:
            obj = self._judges.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Judge id: {item_id}")
            log.info("[OnlineCodeJudgeService.get_judge] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_execution_result(self, name: str) -> ExecutionResult:
        """UML: OnlineCodeJudgeService.create_execution_result(name) -> ExecutionResult"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ExecutionResult name is required")
        with self._lock:
            item_id = f"EXE-{self._seq:04d}"
            self._seq += 1
            obj = ExecutionResult(item_id, cleaned)
            obj.validate()
            self._execution_results[item_id] = obj
            log.info("[OnlineCodeJudgeService.create_execution_result] stored %s in _execution_results (count=%s)", item_id, len(self._execution_results))
            return obj

    def get_execution_result(self, item_id: str) -> ExecutionResult:
        with self._lock:
            obj = self._execution_results.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ExecutionResult id: {item_id}")
            log.info("[OnlineCodeJudgeService.get_execution_result] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_problem(self, item_id: str) -> Problem:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._problems.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Problem id: {item_id}")
            log.info("[OnlineCodeJudgeService.close_problem] closing %s via Problem.close()", item_id)
            obj.close()
            return obj

    def list_active_problems(self) -> List[Problem]:
        with self._lock:
            active = [o for o in self._problems.values() if o.status == "ACTIVE"]
            log.info("[OnlineCodeJudgeService.list_active_problems] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct OnlineCodeJudgeService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = OnlineCodeJudgeService()

    log.info("========== STEP 2: Create primary Problem objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_problem("alpha-problem")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_problem("beta-problem")

    log.info("========== STEP 3: Create TestCase (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_test_case("sample-test_case")

    log.info("========== STEP 4: Create Submission (UML class) ==========")
    system.create_submission("sample-submission")

    log.info("========== STEP 5: Create Judge (UML class) ==========")
    system.create_judge("sample-judge")

    log.info("========== STEP 6: Create ExecutionResult (UML class) ==========")
    system.create_execution_result("sample-execution_result")

    log.info("========== STEP 7: Inspect active Problem list ==========")
    system.list_active_problems()

    log.info("========== STEP 8: Close first Problem ==========")
    system.close_problem(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_problem(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Problem.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_problem("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_problem: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_problems()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Problem {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Problem(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Problem.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Problem.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Problem.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Problem " + id + " invalid status");
    }
    System.out.println("[Problem.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Problem " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Problem.close] id=" + id + " -> CLOSED");
  }
}


class TestCase {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  TestCase(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("TestCase.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TestCase.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[TestCase.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("TestCase " + id + " invalid status");
    }
    System.out.println("[TestCase.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("TestCase " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[TestCase.close] id=" + id + " -> CLOSED");
  }
}


class Submission {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Submission(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Submission.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Submission.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Submission.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Submission " + id + " invalid status");
    }
    System.out.println("[Submission.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Submission " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Submission.close] id=" + id + " -> CLOSED");
  }
}


class Judge {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Judge(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Judge.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Judge.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Judge.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Judge " + id + " invalid status");
    }
    System.out.println("[Judge.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Judge " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Judge.close] id=" + id + " -> CLOSED");
  }
}


class ExecutionResult {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ExecutionResult(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ExecutionResult.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ExecutionResult.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ExecutionResult.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ExecutionResult " + id + " invalid status");
    }
    System.out.println("[ExecutionResult.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ExecutionResult " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ExecutionResult.close] id=" + id + " -> CLOSED");
  }
}

public class OnlineCodeJudgeService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Problem> problems = new LinkedHashMap<>();
  private final Map<String, TestCase> test_cases = new LinkedHashMap<>();
  private final Map<String, Submission> submissions = new LinkedHashMap<>();
  private final Map<String, Judge> judges = new LinkedHashMap<>();
  private final Map<String, ExecutionResult> execution_results = new LinkedHashMap<>();

  public OnlineCodeJudgeService() {
    System.out.println("[OnlineCodeJudgeService.__init__] system ready");
  }

  public Problem createProblem(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Problem name required");
    }
    lock.lock();
    try {
      String id = String.format("PRO-%04d", seq++);
      Problem obj = new Problem(id, name.trim());
      obj.validate();
      problems.put(id, obj);
      System.out.println("[OnlineCodeJudgeService.createProblem] stored " + id + " count=" + problems.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Problem getProblem(String id) {
    lock.lock();
    try {
      Problem obj = problems.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Problem id: " + id);
      }
      System.out.println("[OnlineCodeJudgeService.getProblem] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public TestCase createTestCase(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TestCase name required");
    }
    lock.lock();
    try {
      String id = String.format("TES-%04d", seq++);
      TestCase obj = new TestCase(id, name.trim());
      obj.validate();
      test_cases.put(id, obj);
      System.out.println("[OnlineCodeJudgeService.createTestCase] stored " + id + " count=" + test_cases.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public TestCase getTestCase(String id) {
    lock.lock();
    try {
      TestCase obj = test_cases.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown TestCase id: " + id);
      }
      System.out.println("[OnlineCodeJudgeService.getTestCase] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Submission createSubmission(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Submission name required");
    }
    lock.lock();
    try {
      String id = String.format("SUB-%04d", seq++);
      Submission obj = new Submission(id, name.trim());
      obj.validate();
      submissions.put(id, obj);
      System.out.println("[OnlineCodeJudgeService.createSubmission] stored " + id + " count=" + submissions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Submission getSubmission(String id) {
    lock.lock();
    try {
      Submission obj = submissions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Submission id: " + id);
      }
      System.out.println("[OnlineCodeJudgeService.getSubmission] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Judge createJudge(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Judge name required");
    }
    lock.lock();
    try {
      String id = String.format("JUD-%04d", seq++);
      Judge obj = new Judge(id, name.trim());
      obj.validate();
      judges.put(id, obj);
      System.out.println("[OnlineCodeJudgeService.createJudge] stored " + id + " count=" + judges.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Judge getJudge(String id) {
    lock.lock();
    try {
      Judge obj = judges.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Judge id: " + id);
      }
      System.out.println("[OnlineCodeJudgeService.getJudge] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ExecutionResult createExecutionResult(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ExecutionResult name required");
    }
    lock.lock();
    try {
      String id = String.format("EXE-%04d", seq++);
      ExecutionResult obj = new ExecutionResult(id, name.trim());
      obj.validate();
      execution_results.put(id, obj);
      System.out.println("[OnlineCodeJudgeService.createExecutionResult] stored " + id + " count=" + execution_results.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ExecutionResult getExecutionResult(String id) {
    lock.lock();
    try {
      ExecutionResult obj = execution_results.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ExecutionResult id: " + id);
      }
      System.out.println("[OnlineCodeJudgeService.getExecutionResult] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Problem closeProblem(String id) {
    lock.lock();
    try {
      Problem obj = problems.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Problem id: " + id);
      }
      System.out.println("[OnlineCodeJudgeService.closeProblem] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Problem> listActiveProblems() {
    lock.lock();
    try {
      List<Problem> out = new ArrayList<>();
      for (Problem o : problems.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[OnlineCodeJudgeService.listActiveProblems] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct OnlineCodeJudgeService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    OnlineCodeJudgeService system = new OnlineCodeJudgeService();
    System.out.println("========== STEP 2: Create Problem objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Problem first = system.createProblem("alpha-problem");
    system.createProblem("beta-problem");
    System.out.println("========== STEP 3: Create TestCase ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createTestCase("sample-test_case");
    System.out.println("========== STEP 4: Create Submission ==========");
    system.createSubmission("sample-submission");
    System.out.println("========== STEP 5: Create Judge ==========");
    system.createJudge("sample-judge");
    System.out.println("========== STEP 6: Create ExecutionResult ==========");
    system.createExecutionResult("sample-execution_result");
    System.out.println("========== Inspect active list ==========");
    system.listActiveProblems();
    System.out.println("========== Close first Problem ==========");
    system.closeProblem(first.getId());
    try {
      system.closeProblem(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getProblem("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Problem {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Problem.id required')
    }

    if (!name?.trim()) {
      throw new Error('Problem.name required')
    }
    console.log(\`[Problem.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Problem \${this.id} invalid status\`)
    }
    console.log(\`[Problem.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Problem \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Problem.close] id=\${this.id} -> CLOSED\`)
  }
}


class TestCase {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('TestCase.id required')
    }

    if (!name?.trim()) {
      throw new Error('TestCase.name required')
    }
    console.log(\`[TestCase.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`TestCase \${this.id} invalid status\`)
    }
    console.log(\`[TestCase.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`TestCase \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[TestCase.close] id=\${this.id} -> CLOSED\`)
  }
}


class Submission {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Submission.id required')
    }

    if (!name?.trim()) {
      throw new Error('Submission.name required')
    }
    console.log(\`[Submission.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Submission \${this.id} invalid status\`)
    }
    console.log(\`[Submission.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Submission \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Submission.close] id=\${this.id} -> CLOSED\`)
  }
}


class Judge {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Judge.id required')
    }

    if (!name?.trim()) {
      throw new Error('Judge.name required')
    }
    console.log(\`[Judge.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Judge \${this.id} invalid status\`)
    }
    console.log(\`[Judge.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Judge \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Judge.close] id=\${this.id} -> CLOSED\`)
  }
}


class ExecutionResult {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ExecutionResult.id required')
    }

    if (!name?.trim()) {
      throw new Error('ExecutionResult.name required')
    }
    console.log(\`[ExecutionResult.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ExecutionResult \${this.id} invalid status\`)
    }
    console.log(\`[ExecutionResult.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ExecutionResult \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ExecutionResult.close] id=\${this.id} -> CLOSED\`)
  }
}

class OnlineCodeJudgeService {
  private seq = 1
  private problems = new Map<string, Problem>()
  private test_cases = new Map<string, TestCase>()
  private submissions = new Map<string, Submission>()
  private judges = new Map<string, Judge>()
  private execution_results = new Map<string, ExecutionResult>()
  constructor() {
    console.log('[OnlineCodeJudgeService.__init__] system ready')
  }

  createProblem(name: string): Problem {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Problem name required')
    }
    const id = \`PRO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Problem(id, cleaned)
    obj.validate()
    this.problems.set(id, obj)
    console.log(\`[OnlineCodeJudgeService.createProblem] stored \${id} count=\${this.problems.size}\`)
    return obj
  }

  getProblem(id: string): Problem {
    const obj = this.problems.get(id)
    if (!obj) {
      throw new Error(\`unknown Problem id: \${id}\`)
    }
    console.log(\`[OnlineCodeJudgeService.getProblem] found id=\${obj.id}\`)
    return obj
  }

  createTestCase(name: string): TestCase {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('TestCase name required')
    }
    const id = \`TES-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new TestCase(id, cleaned)
    obj.validate()
    this.test_cases.set(id, obj)
    console.log(\`[OnlineCodeJudgeService.createTestCase] stored \${id} count=\${this.test_cases.size}\`)
    return obj
  }

  getTestCase(id: string): TestCase {
    const obj = this.test_cases.get(id)
    if (!obj) {
      throw new Error(\`unknown TestCase id: \${id}\`)
    }
    console.log(\`[OnlineCodeJudgeService.getTestCase] found id=\${obj.id}\`)
    return obj
  }

  createSubmission(name: string): Submission {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Submission name required')
    }
    const id = \`SUB-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Submission(id, cleaned)
    obj.validate()
    this.submissions.set(id, obj)
    console.log(\`[OnlineCodeJudgeService.createSubmission] stored \${id} count=\${this.submissions.size}\`)
    return obj
  }

  getSubmission(id: string): Submission {
    const obj = this.submissions.get(id)
    if (!obj) {
      throw new Error(\`unknown Submission id: \${id}\`)
    }
    console.log(\`[OnlineCodeJudgeService.getSubmission] found id=\${obj.id}\`)
    return obj
  }

  createJudge(name: string): Judge {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Judge name required')
    }
    const id = \`JUD-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Judge(id, cleaned)
    obj.validate()
    this.judges.set(id, obj)
    console.log(\`[OnlineCodeJudgeService.createJudge] stored \${id} count=\${this.judges.size}\`)
    return obj
  }

  getJudge(id: string): Judge {
    const obj = this.judges.get(id)
    if (!obj) {
      throw new Error(\`unknown Judge id: \${id}\`)
    }
    console.log(\`[OnlineCodeJudgeService.getJudge] found id=\${obj.id}\`)
    return obj
  }

  createExecutionResult(name: string): ExecutionResult {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ExecutionResult name required')
    }
    const id = \`EXE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ExecutionResult(id, cleaned)
    obj.validate()
    this.execution_results.set(id, obj)
    console.log(\`[OnlineCodeJudgeService.createExecutionResult] stored \${id} count=\${this.execution_results.size}\`)
    return obj
  }

  getExecutionResult(id: string): ExecutionResult {
    const obj = this.execution_results.get(id)
    if (!obj) {
      throw new Error(\`unknown ExecutionResult id: \${id}\`)
    }
    console.log(\`[OnlineCodeJudgeService.getExecutionResult] found id=\${obj.id}\`)
    return obj
  }

  closeProblem(id: string): Problem {
    const obj = this.getProblem(id)
    console.log(\`[OnlineCodeJudgeService.closeProblem] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveProblems(): Problem[] {
    const active = [...this.problems.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[OnlineCodeJudgeService.listActiveProblems] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct OnlineCodeJudgeService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new OnlineCodeJudgeService()
  console.log('========== STEP 2: Create Problem objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createProblem('alpha-problem')
  system.createProblem('beta-problem')
  console.log('========== STEP 3: Create TestCase ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createTestCase('sample-test_case')
  console.log('========== STEP 4: Create Submission ==========')
  system.createSubmission('sample-submission')
  console.log('========== STEP 5: Create Judge ==========')
  system.createJudge('sample-judge')
  console.log('========== STEP 6: Create ExecutionResult ==========')
  system.createExecutionResult('sample-execution_result')
  system.listActiveProblems()
  console.log('========== Close first Problem ==========')
  system.closeProblem(first.id)
  try {
    system.closeProblem(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getProblem('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Problem {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Problem(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Problem requires id and name");
    }
    cout << "[Problem.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Problem invalid status");
    }
    cout << "[Problem.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Problem cannot close");
    }
    status_ = "CLOSED";
    cout << "[Problem.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class TestCase {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  TestCase(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("TestCase requires id and name");
    }
    cout << "[TestCase.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("TestCase invalid status");
    }
    cout << "[TestCase.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("TestCase cannot close");
    }
    status_ = "CLOSED";
    cout << "[TestCase.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Submission {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Submission(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Submission requires id and name");
    }
    cout << "[Submission.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Submission invalid status");
    }
    cout << "[Submission.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Submission cannot close");
    }
    status_ = "CLOSED";
    cout << "[Submission.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Judge {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Judge(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Judge requires id and name");
    }
    cout << "[Judge.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Judge invalid status");
    }
    cout << "[Judge.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Judge cannot close");
    }
    status_ = "CLOSED";
    cout << "[Judge.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class ExecutionResult {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ExecutionResult(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ExecutionResult requires id and name");
    }
    cout << "[ExecutionResult.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ExecutionResult invalid status");
    }
    cout << "[ExecutionResult.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ExecutionResult cannot close");
    }
    status_ = "CLOSED";
    cout << "[ExecutionResult.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class OnlineCodeJudgeService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Problem> problems_;
  unordered_map<string, TestCase> test_cases_;
  unordered_map<string, Submission> submissions_;
  unordered_map<string, Judge> judges_;
  unordered_map<string, ExecutionResult> execution_results_;
public:
  OnlineCodeJudgeService() {
    cout << "[OnlineCodeJudgeService.__init__] system ready" << endl;
  }

  Problem createProblem(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Problem name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PRO-%04d", seq_++);
    Problem obj{buf, name};
    obj.validate();
    problems_.emplace(obj.id(), obj);
    cout << "[OnlineCodeJudgeService.createProblem] stored " << obj.id() << endl;
    return obj;
  }

  Problem getProblem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = problems_.find(id);
    if (it == problems_.end()) {
      throw out_of_range("unknown Problem id");
    }
    cout << "[OnlineCodeJudgeService.getProblem] found " << id << endl;
    return it->second;
  }

  TestCase createTestCase(const string& name) {
    if (name.empty()) {
      throw invalid_argument("TestCase name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TES-%04d", seq_++);
    TestCase obj{buf, name};
    obj.validate();
    test_cases_.emplace(obj.id(), obj);
    cout << "[OnlineCodeJudgeService.createTestCase] stored " << obj.id() << endl;
    return obj;
  }

  TestCase getTestCase(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = test_cases_.find(id);
    if (it == test_cases_.end()) {
      throw out_of_range("unknown TestCase id");
    }
    cout << "[OnlineCodeJudgeService.getTestCase] found " << id << endl;
    return it->second;
  }

  Submission createSubmission(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Submission name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SUB-%04d", seq_++);
    Submission obj{buf, name};
    obj.validate();
    submissions_.emplace(obj.id(), obj);
    cout << "[OnlineCodeJudgeService.createSubmission] stored " << obj.id() << endl;
    return obj;
  }

  Submission getSubmission(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = submissions_.find(id);
    if (it == submissions_.end()) {
      throw out_of_range("unknown Submission id");
    }
    cout << "[OnlineCodeJudgeService.getSubmission] found " << id << endl;
    return it->second;
  }

  Judge createJudge(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Judge name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "JUD-%04d", seq_++);
    Judge obj{buf, name};
    obj.validate();
    judges_.emplace(obj.id(), obj);
    cout << "[OnlineCodeJudgeService.createJudge] stored " << obj.id() << endl;
    return obj;
  }

  Judge getJudge(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = judges_.find(id);
    if (it == judges_.end()) {
      throw out_of_range("unknown Judge id");
    }
    cout << "[OnlineCodeJudgeService.getJudge] found " << id << endl;
    return it->second;
  }

  ExecutionResult createExecutionResult(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ExecutionResult name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "EXE-%04d", seq_++);
    ExecutionResult obj{buf, name};
    obj.validate();
    execution_results_.emplace(obj.id(), obj);
    cout << "[OnlineCodeJudgeService.createExecutionResult] stored " << obj.id() << endl;
    return obj;
  }

  ExecutionResult getExecutionResult(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = execution_results_.find(id);
    if (it == execution_results_.end()) {
      throw out_of_range("unknown ExecutionResult id");
    }
    cout << "[OnlineCodeJudgeService.getExecutionResult] found " << id << endl;
    return it->second;
  }

  Problem closeProblem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = problems_.find(id);
    if (it == problems_.end()) {
      throw out_of_range("unknown Problem");
    }
    cout << "[OnlineCodeJudgeService.closeProblem] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct OnlineCodeJudgeService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  OnlineCodeJudgeService system;
  cout << "========== STEP 2: Create Problem ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createProblem("alpha-problem");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createProblem("beta-problem");
  system.createTestCase("sample-test_case");
  system.createSubmission("sample-submission");
  system.createJudge("sample-judge");
  system.createExecutionResult("sample-execution_result");
  system.closeProblem(first.id());
  try {
    system.closeProblem(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getProblem("MISSING-ID");
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

type Problem struct {
  ID     string
  Name   string
  Status string
}

func NewProblem(id, name string) (*Problem, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Problem requires id and name")
  }
  obj := &Problem{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Problem.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Problem) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Problem invalid status")
  }
  fmt.Printf("[Problem.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Problem) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Problem %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Problem.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type TestCase struct {
  ID     string
  Name   string
  Status string
}

func NewTestCase(id, name string) (*TestCase, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("TestCase requires id and name")
  }
  obj := &TestCase{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[TestCase.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *TestCase) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("TestCase invalid status")
  }
  fmt.Printf("[TestCase.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *TestCase) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("TestCase %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[TestCase.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Submission struct {
  ID     string
  Name   string
  Status string
}

func NewSubmission(id, name string) (*Submission, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Submission requires id and name")
  }
  obj := &Submission{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Submission.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Submission) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Submission invalid status")
  }
  fmt.Printf("[Submission.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Submission) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Submission %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Submission.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Judge struct {
  ID     string
  Name   string
  Status string
}

func NewJudge(id, name string) (*Judge, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Judge requires id and name")
  }
  obj := &Judge{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Judge.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Judge) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Judge invalid status")
  }
  fmt.Printf("[Judge.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Judge) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Judge %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Judge.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type ExecutionResult struct {
  ID     string
  Name   string
  Status string
}

func NewExecutionResult(id, name string) (*ExecutionResult, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ExecutionResult requires id and name")
  }
  obj := &ExecutionResult{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ExecutionResult.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ExecutionResult) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ExecutionResult invalid status")
  }
  fmt.Printf("[ExecutionResult.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ExecutionResult) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ExecutionResult %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ExecutionResult.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type OnlineCodeJudgeService struct {
  mu  sync.Mutex
  seq int
  problems map[string]*Problem
  test_cases map[string]*TestCase
  submissions map[string]*Submission
  judges map[string]*Judge
  execution_results map[string]*ExecutionResult
}

func NewOnlineCodeJudgeService() *OnlineCodeJudgeService {
  fmt.Println("[OnlineCodeJudgeService.__init__] system ready")
  return &OnlineCodeJudgeService{
    seq: 1,
    problems: map[string]*Problem{},
    test_cases: map[string]*TestCase{},
    submissions: map[string]*Submission{},
    judges: map[string]*Judge{},
    execution_results: map[string]*ExecutionResult{},
  }
}

func (s *OnlineCodeJudgeService) CreateProblem(name string) (*Problem, error) {
  if name == "" {
    return nil, fmt.Errorf("Problem name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PRO-%04d", s.seq)
  s.seq++
  obj, err := NewProblem(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.problems[id] = obj
  fmt.Printf("[OnlineCodeJudgeService.CreateProblem] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) GetProblem(id string) (*Problem, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.problems[id]
  if !ok {
    return nil, fmt.Errorf("unknown Problem id: %s", id)
  }
  fmt.Printf("[OnlineCodeJudgeService.GetProblem] found %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) CreateTestCase(name string) (*TestCase, error) {
  if name == "" {
    return nil, fmt.Errorf("TestCase name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TES-%04d", s.seq)
  s.seq++
  obj, err := NewTestCase(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.test_cases[id] = obj
  fmt.Printf("[OnlineCodeJudgeService.CreateTestCase] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) GetTestCase(id string) (*TestCase, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.test_cases[id]
  if !ok {
    return nil, fmt.Errorf("unknown TestCase id: %s", id)
  }
  fmt.Printf("[OnlineCodeJudgeService.GetTestCase] found %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) CreateSubmission(name string) (*Submission, error) {
  if name == "" {
    return nil, fmt.Errorf("Submission name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SUB-%04d", s.seq)
  s.seq++
  obj, err := NewSubmission(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.submissions[id] = obj
  fmt.Printf("[OnlineCodeJudgeService.CreateSubmission] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) GetSubmission(id string) (*Submission, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.submissions[id]
  if !ok {
    return nil, fmt.Errorf("unknown Submission id: %s", id)
  }
  fmt.Printf("[OnlineCodeJudgeService.GetSubmission] found %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) CreateJudge(name string) (*Judge, error) {
  if name == "" {
    return nil, fmt.Errorf("Judge name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("JUD-%04d", s.seq)
  s.seq++
  obj, err := NewJudge(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.judges[id] = obj
  fmt.Printf("[OnlineCodeJudgeService.CreateJudge] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) GetJudge(id string) (*Judge, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.judges[id]
  if !ok {
    return nil, fmt.Errorf("unknown Judge id: %s", id)
  }
  fmt.Printf("[OnlineCodeJudgeService.GetJudge] found %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) CreateExecutionResult(name string) (*ExecutionResult, error) {
  if name == "" {
    return nil, fmt.Errorf("ExecutionResult name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("EXE-%04d", s.seq)
  s.seq++
  obj, err := NewExecutionResult(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.execution_results[id] = obj
  fmt.Printf("[OnlineCodeJudgeService.CreateExecutionResult] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) GetExecutionResult(id string) (*ExecutionResult, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.execution_results[id]
  if !ok {
    return nil, fmt.Errorf("unknown ExecutionResult id: %s", id)
  }
  fmt.Printf("[OnlineCodeJudgeService.GetExecutionResult] found %s\\n", id)
  return obj, nil
}

func (s *OnlineCodeJudgeService) CloseProblem(id string) (*Problem, error) {
  obj, err := s.GetProblem(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[OnlineCodeJudgeService.CloseProblem] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct OnlineCodeJudgeService ==========")
  system := NewOnlineCodeJudgeService()
  fmt.Println("========== STEP 2: Create Problem ==========")
  first, _ := system.CreateProblem("alpha-problem")
  system.CreateProblem("beta-problem")
  system.CreateTestCase("sample-test_case")
  system.CreateSubmission("sample-submission")
  system.CreateJudge("sample-judge")
  system.CreateExecutionResult("sample-execution_result")
  system.CloseProblem(first.ID)
  if _, err := system.CloseProblem(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetProblem("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Problem {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Problem(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Problem requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Problem.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Problem invalid status");
    }
    Console.WriteLine("[Problem.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Problem " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Problem.close] id=" + Id + " -> CLOSED");
  }
}


sealed class TestCase {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public TestCase(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TestCase requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[TestCase.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("TestCase invalid status");
    }
    Console.WriteLine("[TestCase.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("TestCase " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[TestCase.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Submission {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Submission(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Submission requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Submission.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Submission invalid status");
    }
    Console.WriteLine("[Submission.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Submission " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Submission.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Judge {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Judge(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Judge requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Judge.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Judge invalid status");
    }
    Console.WriteLine("[Judge.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Judge " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Judge.close] id=" + Id + " -> CLOSED");
  }
}


sealed class ExecutionResult {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ExecutionResult(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ExecutionResult requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ExecutionResult.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ExecutionResult invalid status");
    }
    Console.WriteLine("[ExecutionResult.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ExecutionResult " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ExecutionResult.close] id=" + Id + " -> CLOSED");
  }
}

sealed class OnlineCodeJudgeService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Problem> _problems = new();
  private readonly Dictionary<string, TestCase> _test_cases = new();
  private readonly Dictionary<string, Submission> _submissions = new();
  private readonly Dictionary<string, Judge> _judges = new();
  private readonly Dictionary<string, ExecutionResult> _execution_results = new();
  public OnlineCodeJudgeService() {
    Console.WriteLine("[OnlineCodeJudgeService.__init__] system ready");
  }

  public Problem CreateProblem(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Problem name required");
    }
    lock (_gate) {
      var id = string.Format("PRO-{0:D4}", _seq++);
      var obj = new Problem(id, name.Trim());
      obj.Validate();
      _problems[id] = obj;
      Console.WriteLine("[OnlineCodeJudgeService.CreateProblem] stored " + id);
      return obj;
    }
  }

  public Problem GetProblem(string id) {
    lock (_gate) {
      if (!_problems.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Problem id: " + id);
      }
      Console.WriteLine("[OnlineCodeJudgeService.GetProblem] found " + id);
      return obj;
    }
  }

  public TestCase CreateTestCase(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TestCase name required");
    }
    lock (_gate) {
      var id = string.Format("TES-{0:D4}", _seq++);
      var obj = new TestCase(id, name.Trim());
      obj.Validate();
      _test_cases[id] = obj;
      Console.WriteLine("[OnlineCodeJudgeService.CreateTestCase] stored " + id);
      return obj;
    }
  }

  public TestCase GetTestCase(string id) {
    lock (_gate) {
      if (!_test_cases.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown TestCase id: " + id);
      }
      Console.WriteLine("[OnlineCodeJudgeService.GetTestCase] found " + id);
      return obj;
    }
  }

  public Submission CreateSubmission(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Submission name required");
    }
    lock (_gate) {
      var id = string.Format("SUB-{0:D4}", _seq++);
      var obj = new Submission(id, name.Trim());
      obj.Validate();
      _submissions[id] = obj;
      Console.WriteLine("[OnlineCodeJudgeService.CreateSubmission] stored " + id);
      return obj;
    }
  }

  public Submission GetSubmission(string id) {
    lock (_gate) {
      if (!_submissions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Submission id: " + id);
      }
      Console.WriteLine("[OnlineCodeJudgeService.GetSubmission] found " + id);
      return obj;
    }
  }

  public Judge CreateJudge(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Judge name required");
    }
    lock (_gate) {
      var id = string.Format("JUD-{0:D4}", _seq++);
      var obj = new Judge(id, name.Trim());
      obj.Validate();
      _judges[id] = obj;
      Console.WriteLine("[OnlineCodeJudgeService.CreateJudge] stored " + id);
      return obj;
    }
  }

  public Judge GetJudge(string id) {
    lock (_gate) {
      if (!_judges.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Judge id: " + id);
      }
      Console.WriteLine("[OnlineCodeJudgeService.GetJudge] found " + id);
      return obj;
    }
  }

  public ExecutionResult CreateExecutionResult(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ExecutionResult name required");
    }
    lock (_gate) {
      var id = string.Format("EXE-{0:D4}", _seq++);
      var obj = new ExecutionResult(id, name.Trim());
      obj.Validate();
      _execution_results[id] = obj;
      Console.WriteLine("[OnlineCodeJudgeService.CreateExecutionResult] stored " + id);
      return obj;
    }
  }

  public ExecutionResult GetExecutionResult(string id) {
    lock (_gate) {
      if (!_execution_results.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ExecutionResult id: " + id);
      }
      Console.WriteLine("[OnlineCodeJudgeService.GetExecutionResult] found " + id);
      return obj;
    }
  }

  public Problem CloseProblem(string id) {
    var obj = GetProblem(id);
    Console.WriteLine("[OnlineCodeJudgeService.CloseProblem] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct OnlineCodeJudgeService ==========");
    var system = new OnlineCodeJudgeService();
    Console.WriteLine("========== STEP 2: Create Problem ==========");
    var first = system.CreateProblem("alpha-problem");
    system.CreateProblem("beta-problem");
    system.CreateTestCase("sample-test_case");
    system.CreateSubmission("sample-submission");
    system.CreateJudge("sample-judge");
    system.CreateExecutionResult("sample-execution_result");
    system.CloseProblem(first.Id);
    try {
      system.CloseProblem(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetProblem("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const onlineCodeJudgeSolution: ProblemSolution = {
  slug: 'online-code-judge',
  title: 'Online Code Judge (LeetCode) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an online code execution and judging platform like LeetCode — users submit code, it runs in a sandbox, and results are evaluated. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Problems with description, input/output format, examples, and constraints',
      'Submit code in multiple languages (Python, Java, C++, JavaScript)',
      'Run code against hidden test cases in an isolated sandbox',
      'Judge verdicts: Accepted, Wrong Answer, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error',
      'Show execution time and memory usage for each submission',
      'Global and per-problem leaderboard',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Problems with description, input/output format, examples, and constraints?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Submit code in multiple languages (Python, Java, C++, JavaScript)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Run code against hidden test cases in an isolated sandbox?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Judge verdicts: Accepted, Wrong Answer, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Show execution time and memory usage for each submission?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. OnlineCodeJudgeService is the facade stereotype. Problem, TestCase, Submission, Judge, ExecutionResult are concrete domain classes with id/name/status and validate/close.',
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
          'Construct OnlineCodeJudgeService.',
          'createProblem twice and create the related UML classes.',
          'closeProblem once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'OnlineCodeJudgeService', responsibility: 'UML facade - orchestrates Online Code Judge (LeetCode).', keyMembers: ['create*', 'get*', 'closeProblem'] },
    { name: 'Problem', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TestCase', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Submission', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Judge', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ExecutionResult', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from OnlineCodeJudgeService to Problem, TestCase, Submission, Judge, ExecutionResult. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on OnlineCodeJudgeService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'OnlineCodeJudgeService', responsibility: 'UML facade - orchestrates Online Code Judge (LeetCode).', keyMembers: ['create*', 'get*', 'closeProblem'] },
    { name: 'Problem', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TestCase', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Submission', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Judge', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ExecutionResult', responsibility: 'UML class - domain object for Online Code Judge (LeetCode).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'OnlineCodeJudgeService exposes create/get/close and owns composed collections.' },
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
      'main constructs OnlineCodeJudgeService, creates UML domain objects, closes the primary Problem, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct OnlineCodeJudgeService.',
      'createProblem for alpha and beta.',
      'create remaining UML classes.',
      'closeProblem(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createProblem("alpha..."); closeProblem(id)',
        output: '[Problem.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeProblem(alreadyClosed) or getProblem("MISSING-ID")',
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
