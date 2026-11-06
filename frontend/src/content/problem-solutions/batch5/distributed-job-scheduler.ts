import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'DistributedJobSchedulerService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_dags', 'Map<string, DAG>'),
    attr('-', '_dagruns', 'Map<string, DAGRun>'),
    attr('-', '_task_instances', 'Map<string, TaskInstance>'),
    attr('-', '_workers', 'Map<string, Worker>'),
  ], [
    method('+', 'createDAG', 'name: string', 'DAG'),
    method('+', 'createDAGRun', 'name: string', 'DAGRun'),
    method('+', 'createTaskInstance', 'name: string', 'TaskInstance'),
    method('+', 'createWorker', 'name: string', 'Worker'),
    method('+', 'getDAG', 'id: string', 'DAG'),
    method('+', 'getDAGRun', 'id: string', 'DAGRun'),
    method('+', 'getTaskInstance', 'id: string', 'TaskInstance'),
    method('+', 'getWorker', 'id: string', 'Worker'),
    method('+', 'closeDAG', 'id: string', 'DAG'),
  ], 'facade'),
  cls('n1', 'DAG', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'DAGRun', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'TaskInstance', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Worker', GRID.x(1), GRID.y(1), [
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
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("distributed-job-scheduler")


class DAG:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("DAG.id is required")
        if not name or not name.strip():
            raise ValueError("DAG.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[DAG.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"DAG {self.id} has invalid status={self.status}")
        log.info("[DAG.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"DAG {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[DAG.close] id=%s -> CLOSED", self.id)


class DAGRun:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("DAGRun.id is required")
        if not name or not name.strip():
            raise ValueError("DAGRun.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[DAGRun.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"DAGRun {self.id} has invalid status={self.status}")
        log.info("[DAGRun.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"DAGRun {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[DAGRun.close] id=%s -> CLOSED", self.id)


class TaskInstance:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("TaskInstance.id is required")
        if not name or not name.strip():
            raise ValueError("TaskInstance.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[TaskInstance.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"TaskInstance {self.id} has invalid status={self.status}")
        log.info("[TaskInstance.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"TaskInstance {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[TaskInstance.close] id=%s -> CLOSED", self.id)


class Worker:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Worker.id is required")
        if not name or not name.strip():
            raise ValueError("Worker.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Worker.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Worker {self.id} has invalid status={self.status}")
        log.info("[Worker.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Worker {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Worker.close] id=%s -> CLOSED", self.id)


class DistributedJobSchedulerService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._dags: Dict[str, DAG] = {}
        self._dagruns: Dict[str, DAGRun] = {}
        self._task_instances: Dict[str, TaskInstance] = {}
        self._workers: Dict[str, Worker] = {}
        log.info("[DistributedJobSchedulerService.__init__] system ready; managing: DAG, DAGRun, TaskInstance, Worker")

    def create_dag(self, name: str) -> DAG:
        """UML: DistributedJobSchedulerService.create_dag(name) -> DAG"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("DAG name is required")
        with self._lock:
            item_id = f"DAG-{self._seq:04d}"
            self._seq += 1
            obj = DAG(item_id, cleaned)
            obj.validate()
            self._dags[item_id] = obj
            log.info("[DistributedJobSchedulerService.create_dag] stored %s in _dags (count=%s)", item_id, len(self._dags))
            return obj

    def get_dag(self, item_id: str) -> DAG:
        with self._lock:
            obj = self._dags.get(item_id)
            if obj is None:
                raise KeyError(f"unknown DAG id: {item_id}")
            log.info("[DistributedJobSchedulerService.get_dag] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_dagrun(self, name: str) -> DAGRun:
        """UML: DistributedJobSchedulerService.create_dagrun(name) -> DAGRun"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("DAGRun name is required")
        with self._lock:
            item_id = f"DAG-{self._seq:04d}"
            self._seq += 1
            obj = DAGRun(item_id, cleaned)
            obj.validate()
            self._dagruns[item_id] = obj
            log.info("[DistributedJobSchedulerService.create_dagrun] stored %s in _dagruns (count=%s)", item_id, len(self._dagruns))
            return obj

    def get_dagrun(self, item_id: str) -> DAGRun:
        with self._lock:
            obj = self._dagruns.get(item_id)
            if obj is None:
                raise KeyError(f"unknown DAGRun id: {item_id}")
            log.info("[DistributedJobSchedulerService.get_dagrun] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_task_instance(self, name: str) -> TaskInstance:
        """UML: DistributedJobSchedulerService.create_task_instance(name) -> TaskInstance"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("TaskInstance name is required")
        with self._lock:
            item_id = f"TAS-{self._seq:04d}"
            self._seq += 1
            obj = TaskInstance(item_id, cleaned)
            obj.validate()
            self._task_instances[item_id] = obj
            log.info("[DistributedJobSchedulerService.create_task_instance] stored %s in _task_instances (count=%s)", item_id, len(self._task_instances))
            return obj

    def get_task_instance(self, item_id: str) -> TaskInstance:
        with self._lock:
            obj = self._task_instances.get(item_id)
            if obj is None:
                raise KeyError(f"unknown TaskInstance id: {item_id}")
            log.info("[DistributedJobSchedulerService.get_task_instance] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_worker(self, name: str) -> Worker:
        """UML: DistributedJobSchedulerService.create_worker(name) -> Worker"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Worker name is required")
        with self._lock:
            item_id = f"WOR-{self._seq:04d}"
            self._seq += 1
            obj = Worker(item_id, cleaned)
            obj.validate()
            self._workers[item_id] = obj
            log.info("[DistributedJobSchedulerService.create_worker] stored %s in _workers (count=%s)", item_id, len(self._workers))
            return obj

    def get_worker(self, item_id: str) -> Worker:
        with self._lock:
            obj = self._workers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Worker id: {item_id}")
            log.info("[DistributedJobSchedulerService.get_worker] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_dag(self, item_id: str) -> DAG:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._dags.get(item_id)
            if obj is None:
                raise KeyError(f"unknown DAG id: {item_id}")
            log.info("[DistributedJobSchedulerService.close_dag] closing %s via DAG.close()", item_id)
            obj.close()
            return obj

    def list_active_dags(self) -> List[DAG]:
        with self._lock:
            active = [o for o in self._dags.values() if o.status == "ACTIVE"]
            log.info("[DistributedJobSchedulerService.list_active_dags] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct DistributedJobSchedulerService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = DistributedJobSchedulerService()

    log.info("========== STEP 2: Create primary DAG objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_dag("alpha-dag")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_dag("beta-dag")

    log.info("========== STEP 3: Create DAGRun (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_dagrun("sample-dagrun")

    log.info("========== STEP 4: Create TaskInstance (UML class) ==========")
    system.create_task_instance("sample-task_instance")

    log.info("========== STEP 5: Create Worker (UML class) ==========")
    system.create_worker("sample-worker")

    log.info("========== STEP 6: Inspect active DAG list ==========")
    system.list_active_dags()

    log.info("========== STEP 7: Close first DAG ==========")
    system.close_dag(first.id)

    log.info("========== STEP 8: Expected failure - close again ==========")
    try:
        system.close_dag(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from DAG.close: %s", err)

    log.info("========== STEP 9: Expected failure - missing id ==========")
    try:
        system.get_dag("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_dag: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_dags()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class DAG {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  DAG(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("DAG.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DAG.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[DAG.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("DAG " + id + " invalid status");
    }
    System.out.println("[DAG.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("DAG " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[DAG.close] id=" + id + " -> CLOSED");
  }
}


class DAGRun {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  DAGRun(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("DAGRun.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DAGRun.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[DAGRun.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("DAGRun " + id + " invalid status");
    }
    System.out.println("[DAGRun.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("DAGRun " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[DAGRun.close] id=" + id + " -> CLOSED");
  }
}


class TaskInstance {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  TaskInstance(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("TaskInstance.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TaskInstance.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[TaskInstance.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("TaskInstance " + id + " invalid status");
    }
    System.out.println("[TaskInstance.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("TaskInstance " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[TaskInstance.close] id=" + id + " -> CLOSED");
  }
}


class Worker {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Worker(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Worker.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Worker.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Worker.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Worker " + id + " invalid status");
    }
    System.out.println("[Worker.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Worker " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Worker.close] id=" + id + " -> CLOSED");
  }
}

public class DistributedJobSchedulerService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, DAG> dags = new LinkedHashMap<>();
  private final Map<String, DAGRun> dagruns = new LinkedHashMap<>();
  private final Map<String, TaskInstance> task_instances = new LinkedHashMap<>();
  private final Map<String, Worker> workers = new LinkedHashMap<>();

  public DistributedJobSchedulerService() {
    System.out.println("[DistributedJobSchedulerService.__init__] system ready");
  }

  public DAG createDAG(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DAG name required");
    }
    lock.lock();
    try {
      String id = String.format("DAG-%04d", seq++);
      DAG obj = new DAG(id, name.trim());
      obj.validate();
      dags.put(id, obj);
      System.out.println("[DistributedJobSchedulerService.createDAG] stored " + id + " count=" + dags.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public DAG getDAG(String id) {
    lock.lock();
    try {
      DAG obj = dags.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown DAG id: " + id);
      }
      System.out.println("[DistributedJobSchedulerService.getDAG] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public DAGRun createDAGRun(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("DAGRun name required");
    }
    lock.lock();
    try {
      String id = String.format("DAG-%04d", seq++);
      DAGRun obj = new DAGRun(id, name.trim());
      obj.validate();
      dagruns.put(id, obj);
      System.out.println("[DistributedJobSchedulerService.createDAGRun] stored " + id + " count=" + dagruns.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public DAGRun getDAGRun(String id) {
    lock.lock();
    try {
      DAGRun obj = dagruns.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown DAGRun id: " + id);
      }
      System.out.println("[DistributedJobSchedulerService.getDAGRun] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public TaskInstance createTaskInstance(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TaskInstance name required");
    }
    lock.lock();
    try {
      String id = String.format("TAS-%04d", seq++);
      TaskInstance obj = new TaskInstance(id, name.trim());
      obj.validate();
      task_instances.put(id, obj);
      System.out.println("[DistributedJobSchedulerService.createTaskInstance] stored " + id + " count=" + task_instances.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public TaskInstance getTaskInstance(String id) {
    lock.lock();
    try {
      TaskInstance obj = task_instances.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown TaskInstance id: " + id);
      }
      System.out.println("[DistributedJobSchedulerService.getTaskInstance] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Worker createWorker(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Worker name required");
    }
    lock.lock();
    try {
      String id = String.format("WOR-%04d", seq++);
      Worker obj = new Worker(id, name.trim());
      obj.validate();
      workers.put(id, obj);
      System.out.println("[DistributedJobSchedulerService.createWorker] stored " + id + " count=" + workers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Worker getWorker(String id) {
    lock.lock();
    try {
      Worker obj = workers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Worker id: " + id);
      }
      System.out.println("[DistributedJobSchedulerService.getWorker] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public DAG closeDAG(String id) {
    lock.lock();
    try {
      DAG obj = dags.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown DAG id: " + id);
      }
      System.out.println("[DistributedJobSchedulerService.closeDAG] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<DAG> listActiveDAGs() {
    lock.lock();
    try {
      List<DAG> out = new ArrayList<>();
      for (DAG o : dags.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[DistributedJobSchedulerService.listActiveDAGs] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct DistributedJobSchedulerService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    DistributedJobSchedulerService system = new DistributedJobSchedulerService();
    System.out.println("========== STEP 2: Create DAG objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    DAG first = system.createDAG("alpha-dag");
    system.createDAG("beta-dag");
    System.out.println("========== STEP 3: Create DAGRun ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createDAGRun("sample-dagrun");
    System.out.println("========== STEP 4: Create TaskInstance ==========");
    system.createTaskInstance("sample-task_instance");
    System.out.println("========== STEP 5: Create Worker ==========");
    system.createWorker("sample-worker");
    System.out.println("========== Inspect active list ==========");
    system.listActiveDAGs();
    System.out.println("========== Close first DAG ==========");
    system.closeDAG(first.getId());
    try {
      system.closeDAG(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getDAG("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class DAG {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('DAG.id required')
    }

    if (!name?.trim()) {
      throw new Error('DAG.name required')
    }
    console.log(\`[DAG.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`DAG \${this.id} invalid status\`)
    }
    console.log(\`[DAG.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`DAG \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[DAG.close] id=\${this.id} -> CLOSED\`)
  }
}


class DAGRun {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('DAGRun.id required')
    }

    if (!name?.trim()) {
      throw new Error('DAGRun.name required')
    }
    console.log(\`[DAGRun.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`DAGRun \${this.id} invalid status\`)
    }
    console.log(\`[DAGRun.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`DAGRun \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[DAGRun.close] id=\${this.id} -> CLOSED\`)
  }
}


class TaskInstance {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('TaskInstance.id required')
    }

    if (!name?.trim()) {
      throw new Error('TaskInstance.name required')
    }
    console.log(\`[TaskInstance.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`TaskInstance \${this.id} invalid status\`)
    }
    console.log(\`[TaskInstance.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`TaskInstance \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[TaskInstance.close] id=\${this.id} -> CLOSED\`)
  }
}


class Worker {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Worker.id required')
    }

    if (!name?.trim()) {
      throw new Error('Worker.name required')
    }
    console.log(\`[Worker.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Worker \${this.id} invalid status\`)
    }
    console.log(\`[Worker.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Worker \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Worker.close] id=\${this.id} -> CLOSED\`)
  }
}

class DistributedJobSchedulerService {
  private seq = 1
  private dags = new Map<string, DAG>()
  private dagruns = new Map<string, DAGRun>()
  private task_instances = new Map<string, TaskInstance>()
  private workers = new Map<string, Worker>()
  constructor() {
    console.log('[DistributedJobSchedulerService.__init__] system ready')
  }

  createDAG(name: string): DAG {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('DAG name required')
    }
    const id = \`DAG-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new DAG(id, cleaned)
    obj.validate()
    this.dags.set(id, obj)
    console.log(\`[DistributedJobSchedulerService.createDAG] stored \${id} count=\${this.dags.size}\`)
    return obj
  }

  getDAG(id: string): DAG {
    const obj = this.dags.get(id)
    if (!obj) {
      throw new Error(\`unknown DAG id: \${id}\`)
    }
    console.log(\`[DistributedJobSchedulerService.getDAG] found id=\${obj.id}\`)
    return obj
  }

  createDAGRun(name: string): DAGRun {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('DAGRun name required')
    }
    const id = \`DAG-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new DAGRun(id, cleaned)
    obj.validate()
    this.dagruns.set(id, obj)
    console.log(\`[DistributedJobSchedulerService.createDAGRun] stored \${id} count=\${this.dagruns.size}\`)
    return obj
  }

  getDAGRun(id: string): DAGRun {
    const obj = this.dagruns.get(id)
    if (!obj) {
      throw new Error(\`unknown DAGRun id: \${id}\`)
    }
    console.log(\`[DistributedJobSchedulerService.getDAGRun] found id=\${obj.id}\`)
    return obj
  }

  createTaskInstance(name: string): TaskInstance {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('TaskInstance name required')
    }
    const id = \`TAS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new TaskInstance(id, cleaned)
    obj.validate()
    this.task_instances.set(id, obj)
    console.log(\`[DistributedJobSchedulerService.createTaskInstance] stored \${id} count=\${this.task_instances.size}\`)
    return obj
  }

  getTaskInstance(id: string): TaskInstance {
    const obj = this.task_instances.get(id)
    if (!obj) {
      throw new Error(\`unknown TaskInstance id: \${id}\`)
    }
    console.log(\`[DistributedJobSchedulerService.getTaskInstance] found id=\${obj.id}\`)
    return obj
  }

  createWorker(name: string): Worker {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Worker name required')
    }
    const id = \`WOR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Worker(id, cleaned)
    obj.validate()
    this.workers.set(id, obj)
    console.log(\`[DistributedJobSchedulerService.createWorker] stored \${id} count=\${this.workers.size}\`)
    return obj
  }

  getWorker(id: string): Worker {
    const obj = this.workers.get(id)
    if (!obj) {
      throw new Error(\`unknown Worker id: \${id}\`)
    }
    console.log(\`[DistributedJobSchedulerService.getWorker] found id=\${obj.id}\`)
    return obj
  }

  closeDAG(id: string): DAG {
    const obj = this.getDAG(id)
    console.log(\`[DistributedJobSchedulerService.closeDAG] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveDAGs(): DAG[] {
    const active = [...this.dags.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[DistributedJobSchedulerService.listActiveDAGs] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct DistributedJobSchedulerService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new DistributedJobSchedulerService()
  console.log('========== STEP 2: Create DAG objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createDAG('alpha-dag')
  system.createDAG('beta-dag')
  console.log('========== STEP 3: Create DAGRun ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createDAGRun('sample-dagrun')
  console.log('========== STEP 4: Create TaskInstance ==========')
  system.createTaskInstance('sample-task_instance')
  console.log('========== STEP 5: Create Worker ==========')
  system.createWorker('sample-worker')
  system.listActiveDAGs()
  console.log('========== Close first DAG ==========')
  system.closeDAG(first.id)
  try {
    system.closeDAG(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getDAG('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class DAG {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  DAG(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("DAG requires id and name");
    }
    cout << "[DAG.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("DAG invalid status");
    }
    cout << "[DAG.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("DAG cannot close");
    }
    status_ = "CLOSED";
    cout << "[DAG.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class DAGRun {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  DAGRun(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("DAGRun requires id and name");
    }
    cout << "[DAGRun.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("DAGRun invalid status");
    }
    cout << "[DAGRun.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("DAGRun cannot close");
    }
    status_ = "CLOSED";
    cout << "[DAGRun.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class TaskInstance {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  TaskInstance(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("TaskInstance requires id and name");
    }
    cout << "[TaskInstance.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("TaskInstance invalid status");
    }
    cout << "[TaskInstance.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("TaskInstance cannot close");
    }
    status_ = "CLOSED";
    cout << "[TaskInstance.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Worker {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Worker(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Worker requires id and name");
    }
    cout << "[Worker.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Worker invalid status");
    }
    cout << "[Worker.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Worker cannot close");
    }
    status_ = "CLOSED";
    cout << "[Worker.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class DistributedJobSchedulerService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, DAG> dags_;
  unordered_map<string, DAGRun> dagruns_;
  unordered_map<string, TaskInstance> task_instances_;
  unordered_map<string, Worker> workers_;
public:
  DistributedJobSchedulerService() {
    cout << "[DistributedJobSchedulerService.__init__] system ready" << endl;
  }

  DAG createDAG(const string& name) {
    if (name.empty()) {
      throw invalid_argument("DAG name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DAG-%04d", seq_++);
    DAG obj{buf, name};
    obj.validate();
    dags_.emplace(obj.id(), obj);
    cout << "[DistributedJobSchedulerService.createDAG] stored " << obj.id() << endl;
    return obj;
  }

  DAG getDAG(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = dags_.find(id);
    if (it == dags_.end()) {
      throw out_of_range("unknown DAG id");
    }
    cout << "[DistributedJobSchedulerService.getDAG] found " << id << endl;
    return it->second;
  }

  DAGRun createDAGRun(const string& name) {
    if (name.empty()) {
      throw invalid_argument("DAGRun name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DAG-%04d", seq_++);
    DAGRun obj{buf, name};
    obj.validate();
    dagruns_.emplace(obj.id(), obj);
    cout << "[DistributedJobSchedulerService.createDAGRun] stored " << obj.id() << endl;
    return obj;
  }

  DAGRun getDAGRun(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = dagruns_.find(id);
    if (it == dagruns_.end()) {
      throw out_of_range("unknown DAGRun id");
    }
    cout << "[DistributedJobSchedulerService.getDAGRun] found " << id << endl;
    return it->second;
  }

  TaskInstance createTaskInstance(const string& name) {
    if (name.empty()) {
      throw invalid_argument("TaskInstance name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TAS-%04d", seq_++);
    TaskInstance obj{buf, name};
    obj.validate();
    task_instances_.emplace(obj.id(), obj);
    cout << "[DistributedJobSchedulerService.createTaskInstance] stored " << obj.id() << endl;
    return obj;
  }

  TaskInstance getTaskInstance(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = task_instances_.find(id);
    if (it == task_instances_.end()) {
      throw out_of_range("unknown TaskInstance id");
    }
    cout << "[DistributedJobSchedulerService.getTaskInstance] found " << id << endl;
    return it->second;
  }

  Worker createWorker(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Worker name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "WOR-%04d", seq_++);
    Worker obj{buf, name};
    obj.validate();
    workers_.emplace(obj.id(), obj);
    cout << "[DistributedJobSchedulerService.createWorker] stored " << obj.id() << endl;
    return obj;
  }

  Worker getWorker(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = workers_.find(id);
    if (it == workers_.end()) {
      throw out_of_range("unknown Worker id");
    }
    cout << "[DistributedJobSchedulerService.getWorker] found " << id << endl;
    return it->second;
  }

  DAG closeDAG(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = dags_.find(id);
    if (it == dags_.end()) {
      throw out_of_range("unknown DAG");
    }
    cout << "[DistributedJobSchedulerService.closeDAG] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct DistributedJobSchedulerService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  DistributedJobSchedulerService system;
  cout << "========== STEP 2: Create DAG ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createDAG("alpha-dag");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createDAG("beta-dag");
  system.createDAGRun("sample-dagrun");
  system.createTaskInstance("sample-task_instance");
  system.createWorker("sample-worker");
  system.closeDAG(first.id());
  try {
    system.closeDAG(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getDAG("MISSING-ID");
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

type DAG struct {
  ID     string
  Name   string
  Status string
}

func NewDAG(id, name string) (*DAG, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("DAG requires id and name")
  }
  obj := &DAG{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[DAG.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *DAG) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("DAG invalid status")
  }
  fmt.Printf("[DAG.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *DAG) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("DAG %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[DAG.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type DAGRun struct {
  ID     string
  Name   string
  Status string
}

func NewDAGRun(id, name string) (*DAGRun, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("DAGRun requires id and name")
  }
  obj := &DAGRun{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[DAGRun.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *DAGRun) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("DAGRun invalid status")
  }
  fmt.Printf("[DAGRun.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *DAGRun) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("DAGRun %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[DAGRun.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type TaskInstance struct {
  ID     string
  Name   string
  Status string
}

func NewTaskInstance(id, name string) (*TaskInstance, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("TaskInstance requires id and name")
  }
  obj := &TaskInstance{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[TaskInstance.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *TaskInstance) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("TaskInstance invalid status")
  }
  fmt.Printf("[TaskInstance.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *TaskInstance) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("TaskInstance %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[TaskInstance.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Worker struct {
  ID     string
  Name   string
  Status string
}

func NewWorker(id, name string) (*Worker, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Worker requires id and name")
  }
  obj := &Worker{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Worker.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Worker) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Worker invalid status")
  }
  fmt.Printf("[Worker.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Worker) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Worker %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Worker.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type DistributedJobSchedulerService struct {
  mu  sync.Mutex
  seq int
  dags map[string]*DAG
  dagruns map[string]*DAGRun
  task_instances map[string]*TaskInstance
  workers map[string]*Worker
}

func NewDistributedJobSchedulerService() *DistributedJobSchedulerService {
  fmt.Println("[DistributedJobSchedulerService.__init__] system ready")
  return &DistributedJobSchedulerService{
    seq: 1,
    dags: map[string]*DAG{},
    dagruns: map[string]*DAGRun{},
    task_instances: map[string]*TaskInstance{},
    workers: map[string]*Worker{},
  }
}

func (s *DistributedJobSchedulerService) CreateDAG(name string) (*DAG, error) {
  if name == "" {
    return nil, fmt.Errorf("DAG name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DAG-%04d", s.seq)
  s.seq++
  obj, err := NewDAG(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.dags[id] = obj
  fmt.Printf("[DistributedJobSchedulerService.CreateDAG] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedJobSchedulerService) GetDAG(id string) (*DAG, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.dags[id]
  if !ok {
    return nil, fmt.Errorf("unknown DAG id: %s", id)
  }
  fmt.Printf("[DistributedJobSchedulerService.GetDAG] found %s\\n", id)
  return obj, nil
}

func (s *DistributedJobSchedulerService) CreateDAGRun(name string) (*DAGRun, error) {
  if name == "" {
    return nil, fmt.Errorf("DAGRun name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DAG-%04d", s.seq)
  s.seq++
  obj, err := NewDAGRun(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.dagruns[id] = obj
  fmt.Printf("[DistributedJobSchedulerService.CreateDAGRun] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedJobSchedulerService) GetDAGRun(id string) (*DAGRun, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.dagruns[id]
  if !ok {
    return nil, fmt.Errorf("unknown DAGRun id: %s", id)
  }
  fmt.Printf("[DistributedJobSchedulerService.GetDAGRun] found %s\\n", id)
  return obj, nil
}

func (s *DistributedJobSchedulerService) CreateTaskInstance(name string) (*TaskInstance, error) {
  if name == "" {
    return nil, fmt.Errorf("TaskInstance name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TAS-%04d", s.seq)
  s.seq++
  obj, err := NewTaskInstance(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.task_instances[id] = obj
  fmt.Printf("[DistributedJobSchedulerService.CreateTaskInstance] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedJobSchedulerService) GetTaskInstance(id string) (*TaskInstance, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.task_instances[id]
  if !ok {
    return nil, fmt.Errorf("unknown TaskInstance id: %s", id)
  }
  fmt.Printf("[DistributedJobSchedulerService.GetTaskInstance] found %s\\n", id)
  return obj, nil
}

func (s *DistributedJobSchedulerService) CreateWorker(name string) (*Worker, error) {
  if name == "" {
    return nil, fmt.Errorf("Worker name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("WOR-%04d", s.seq)
  s.seq++
  obj, err := NewWorker(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.workers[id] = obj
  fmt.Printf("[DistributedJobSchedulerService.CreateWorker] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedJobSchedulerService) GetWorker(id string) (*Worker, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.workers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Worker id: %s", id)
  }
  fmt.Printf("[DistributedJobSchedulerService.GetWorker] found %s\\n", id)
  return obj, nil
}

func (s *DistributedJobSchedulerService) CloseDAG(id string) (*DAG, error) {
  obj, err := s.GetDAG(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[DistributedJobSchedulerService.CloseDAG] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct DistributedJobSchedulerService ==========")
  system := NewDistributedJobSchedulerService()
  fmt.Println("========== STEP 2: Create DAG ==========")
  first, _ := system.CreateDAG("alpha-dag")
  system.CreateDAG("beta-dag")
  system.CreateDAGRun("sample-dagrun")
  system.CreateTaskInstance("sample-task_instance")
  system.CreateWorker("sample-worker")
  system.CloseDAG(first.ID)
  if _, err := system.CloseDAG(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetDAG("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class DAG {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public DAG(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DAG requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[DAG.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("DAG invalid status");
    }
    Console.WriteLine("[DAG.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("DAG " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[DAG.close] id=" + Id + " -> CLOSED");
  }
}


sealed class DAGRun {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public DAGRun(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DAGRun requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[DAGRun.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("DAGRun invalid status");
    }
    Console.WriteLine("[DAGRun.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("DAGRun " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[DAGRun.close] id=" + Id + " -> CLOSED");
  }
}


sealed class TaskInstance {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public TaskInstance(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TaskInstance requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[TaskInstance.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("TaskInstance invalid status");
    }
    Console.WriteLine("[TaskInstance.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("TaskInstance " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[TaskInstance.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Worker {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Worker(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Worker requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Worker.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Worker invalid status");
    }
    Console.WriteLine("[Worker.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Worker " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Worker.close] id=" + Id + " -> CLOSED");
  }
}

sealed class DistributedJobSchedulerService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, DAG> _dags = new();
  private readonly Dictionary<string, DAGRun> _dagruns = new();
  private readonly Dictionary<string, TaskInstance> _task_instances = new();
  private readonly Dictionary<string, Worker> _workers = new();
  public DistributedJobSchedulerService() {
    Console.WriteLine("[DistributedJobSchedulerService.__init__] system ready");
  }

  public DAG CreateDAG(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DAG name required");
    }
    lock (_gate) {
      var id = string.Format("DAG-{0:D4}", _seq++);
      var obj = new DAG(id, name.Trim());
      obj.Validate();
      _dags[id] = obj;
      Console.WriteLine("[DistributedJobSchedulerService.CreateDAG] stored " + id);
      return obj;
    }
  }

  public DAG GetDAG(string id) {
    lock (_gate) {
      if (!_dags.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown DAG id: " + id);
      }
      Console.WriteLine("[DistributedJobSchedulerService.GetDAG] found " + id);
      return obj;
    }
  }

  public DAGRun CreateDAGRun(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("DAGRun name required");
    }
    lock (_gate) {
      var id = string.Format("DAG-{0:D4}", _seq++);
      var obj = new DAGRun(id, name.Trim());
      obj.Validate();
      _dagruns[id] = obj;
      Console.WriteLine("[DistributedJobSchedulerService.CreateDAGRun] stored " + id);
      return obj;
    }
  }

  public DAGRun GetDAGRun(string id) {
    lock (_gate) {
      if (!_dagruns.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown DAGRun id: " + id);
      }
      Console.WriteLine("[DistributedJobSchedulerService.GetDAGRun] found " + id);
      return obj;
    }
  }

  public TaskInstance CreateTaskInstance(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TaskInstance name required");
    }
    lock (_gate) {
      var id = string.Format("TAS-{0:D4}", _seq++);
      var obj = new TaskInstance(id, name.Trim());
      obj.Validate();
      _task_instances[id] = obj;
      Console.WriteLine("[DistributedJobSchedulerService.CreateTaskInstance] stored " + id);
      return obj;
    }
  }

  public TaskInstance GetTaskInstance(string id) {
    lock (_gate) {
      if (!_task_instances.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown TaskInstance id: " + id);
      }
      Console.WriteLine("[DistributedJobSchedulerService.GetTaskInstance] found " + id);
      return obj;
    }
  }

  public Worker CreateWorker(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Worker name required");
    }
    lock (_gate) {
      var id = string.Format("WOR-{0:D4}", _seq++);
      var obj = new Worker(id, name.Trim());
      obj.Validate();
      _workers[id] = obj;
      Console.WriteLine("[DistributedJobSchedulerService.CreateWorker] stored " + id);
      return obj;
    }
  }

  public Worker GetWorker(string id) {
    lock (_gate) {
      if (!_workers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Worker id: " + id);
      }
      Console.WriteLine("[DistributedJobSchedulerService.GetWorker] found " + id);
      return obj;
    }
  }

  public DAG CloseDAG(string id) {
    var obj = GetDAG(id);
    Console.WriteLine("[DistributedJobSchedulerService.CloseDAG] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct DistributedJobSchedulerService ==========");
    var system = new DistributedJobSchedulerService();
    Console.WriteLine("========== STEP 2: Create DAG ==========");
    var first = system.CreateDAG("alpha-dag");
    system.CreateDAG("beta-dag");
    system.CreateDAGRun("sample-dagrun");
    system.CreateTaskInstance("sample-task_instance");
    system.CreateWorker("sample-worker");
    system.CloseDAG(first.Id);
    try {
      system.CloseDAG(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetDAG("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const distributedJobSchedulerSolution: ProblemSolution = {
  slug: 'distributed-job-scheduler',
  title: 'Distributed Job Scheduler (Airflow-like) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a distributed system for scheduling and executing DAGs of interdependent jobs across a cluster of workers. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Define a job as a DAG of tasks with dependencies',
      'Schedule DAG runs on a cron-like or event-triggered basis',
      'Execute tasks on any available worker in a cluster, respecting dependency order',
      'Retry failed tasks with backoff, and support manual re-runs',
      'Track task/DAG run status and provide a monitoring view',
      'Prevent the same task instance from running twice concurrently',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Define a job as a DAG of tasks with dependencies?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Schedule DAG runs on a cron-like or event-triggered basis?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Execute tasks on any available worker in a cluster, respecting dependency order?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Retry failed tasks with backoff, and support manual re-runs?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Track task/DAG run status and provide a monitoring view?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. DistributedJobSchedulerService is the facade stereotype. DAG, DAGRun, TaskInstance, Worker are concrete domain classes with id/name/status and validate/close.',
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
          'Construct DistributedJobSchedulerService.',
          'createDAG twice and create the related UML classes.',
          'closeDAG once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'DistributedJobSchedulerService', responsibility: 'UML facade - orchestrates Distributed Job Scheduler (Airflow-like).', keyMembers: ['create*', 'get*', 'closeDAG'] },
    { name: 'DAG', responsibility: 'UML class - domain object for Distributed Job Scheduler (Airflow-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'DAGRun', responsibility: 'UML class - domain object for Distributed Job Scheduler (Airflow-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TaskInstance', responsibility: 'UML class - domain object for Distributed Job Scheduler (Airflow-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Worker', responsibility: 'UML class - domain object for Distributed Job Scheduler (Airflow-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from DistributedJobSchedulerService to DAG, DAGRun, TaskInstance, Worker. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on DistributedJobSchedulerService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'DistributedJobSchedulerService', responsibility: 'UML facade - orchestrates Distributed Job Scheduler (Airflow-like).', keyMembers: ['create*', 'get*', 'closeDAG'] },
    { name: 'DAG', responsibility: 'UML class - domain object for Distributed Job Scheduler (Airflow-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'DAGRun', responsibility: 'UML class - domain object for Distributed Job Scheduler (Airflow-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TaskInstance', responsibility: 'UML class - domain object for Distributed Job Scheduler (Airflow-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Worker', responsibility: 'UML class - domain object for Distributed Job Scheduler (Airflow-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'DistributedJobSchedulerService exposes create/get/close and owns composed collections.' },
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
      'main constructs DistributedJobSchedulerService, creates UML domain objects, closes the primary DAG, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct DistributedJobSchedulerService.',
      'createDAG for alpha and beta.',
      'create remaining UML classes.',
      'closeDAG(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createDAG("alpha..."); closeDAG(id)',
        output: '[DAG.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeDAG(alreadyClosed) or getDAG("MISSING-ID")',
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
