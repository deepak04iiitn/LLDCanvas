import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'ElevatorGroupControlSystemService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_elevator_controllers', 'Map<string, ElevatorController>'),
    attr('-', '_elevators', 'Map<string, Elevator>'),
    attr('-', '_current_floors', 'Map<string, currentFloor>'),
    attr('-', '_directions', 'Map<string, direction>'),
    attr('-', '_request_queues', 'Map<string, requestQueue>'),
  ], [
    method('+', 'createElevatorController', 'name: string', 'ElevatorController'),
    method('+', 'createElevator', 'name: string', 'Elevator'),
    method('+', 'createcurrentFloor', 'name: string', 'currentFloor'),
    method('+', 'createdirection', 'name: string', 'direction'),
    method('+', 'createrequestQueue', 'name: string', 'requestQueue'),
    method('+', 'getElevatorController', 'id: string', 'ElevatorController'),
    method('+', 'getElevator', 'id: string', 'Elevator'),
    method('+', 'getcurrentFloor', 'id: string', 'currentFloor'),
    method('+', 'getdirection', 'id: string', 'direction'),
    method('+', 'getrequestQueue', 'id: string', 'requestQueue'),
    method('+', 'closeElevatorController', 'id: string', 'ElevatorController'),
  ], 'facade'),
  cls('n1', 'ElevatorController', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Elevator', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'currentFloor', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'direction', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'requestQueue', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("elevator-group-control-system")


class ElevatorController:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ElevatorController.id is required")
        if not name or not name.strip():
            raise ValueError("ElevatorController.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ElevatorController.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ElevatorController {self.id} has invalid status={self.status}")
        log.info("[ElevatorController.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ElevatorController {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ElevatorController.close] id=%s -> CLOSED", self.id)


class Elevator:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Elevator.id is required")
        if not name or not name.strip():
            raise ValueError("Elevator.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Elevator.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Elevator {self.id} has invalid status={self.status}")
        log.info("[Elevator.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Elevator {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Elevator.close] id=%s -> CLOSED", self.id)


class currentFloor:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("currentFloor.id is required")
        if not name or not name.strip():
            raise ValueError("currentFloor.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[currentFloor.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"currentFloor {self.id} has invalid status={self.status}")
        log.info("[currentFloor.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"currentFloor {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[currentFloor.close] id=%s -> CLOSED", self.id)


class direction:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("direction.id is required")
        if not name or not name.strip():
            raise ValueError("direction.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[direction.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"direction {self.id} has invalid status={self.status}")
        log.info("[direction.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"direction {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[direction.close] id=%s -> CLOSED", self.id)


class requestQueue:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("requestQueue.id is required")
        if not name or not name.strip():
            raise ValueError("requestQueue.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[requestQueue.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"requestQueue {self.id} has invalid status={self.status}")
        log.info("[requestQueue.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"requestQueue {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[requestQueue.close] id=%s -> CLOSED", self.id)


class ElevatorGroupControlSystemService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._elevator_controllers: Dict[str, ElevatorController] = {}
        self._elevators: Dict[str, Elevator] = {}
        self._current_floors: Dict[str, currentFloor] = {}
        self._directions: Dict[str, direction] = {}
        self._request_queues: Dict[str, requestQueue] = {}
        log.info("[ElevatorGroupControlSystemService.__init__] system ready; managing: ElevatorController, Elevator, currentFloor, direction, requestQueue")

    def create_elevator_controller(self, name: str) -> ElevatorController:
        """UML: ElevatorGroupControlSystemService.create_elevator_controller(name) -> ElevatorController"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ElevatorController name is required")
        with self._lock:
            item_id = f"ELE-{self._seq:04d}"
            self._seq += 1
            obj = ElevatorController(item_id, cleaned)
            obj.validate()
            self._elevator_controllers[item_id] = obj
            log.info("[ElevatorGroupControlSystemService.create_elevator_controller] stored %s in _elevator_controllers (count=%s)", item_id, len(self._elevator_controllers))
            return obj

    def get_elevator_controller(self, item_id: str) -> ElevatorController:
        with self._lock:
            obj = self._elevator_controllers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ElevatorController id: {item_id}")
            log.info("[ElevatorGroupControlSystemService.get_elevator_controller] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_elevator(self, name: str) -> Elevator:
        """UML: ElevatorGroupControlSystemService.create_elevator(name) -> Elevator"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Elevator name is required")
        with self._lock:
            item_id = f"ELE-{self._seq:04d}"
            self._seq += 1
            obj = Elevator(item_id, cleaned)
            obj.validate()
            self._elevators[item_id] = obj
            log.info("[ElevatorGroupControlSystemService.create_elevator] stored %s in _elevators (count=%s)", item_id, len(self._elevators))
            return obj

    def get_elevator(self, item_id: str) -> Elevator:
        with self._lock:
            obj = self._elevators.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Elevator id: {item_id}")
            log.info("[ElevatorGroupControlSystemService.get_elevator] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_current_floor(self, name: str) -> currentFloor:
        """UML: ElevatorGroupControlSystemService.create_current_floor(name) -> currentFloor"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("currentFloor name is required")
        with self._lock:
            item_id = f"CUR-{self._seq:04d}"
            self._seq += 1
            obj = currentFloor(item_id, cleaned)
            obj.validate()
            self._current_floors[item_id] = obj
            log.info("[ElevatorGroupControlSystemService.create_current_floor] stored %s in _current_floors (count=%s)", item_id, len(self._current_floors))
            return obj

    def get_current_floor(self, item_id: str) -> currentFloor:
        with self._lock:
            obj = self._current_floors.get(item_id)
            if obj is None:
                raise KeyError(f"unknown currentFloor id: {item_id}")
            log.info("[ElevatorGroupControlSystemService.get_current_floor] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_direction(self, name: str) -> direction:
        """UML: ElevatorGroupControlSystemService.create_direction(name) -> direction"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("direction name is required")
        with self._lock:
            item_id = f"DIR-{self._seq:04d}"
            self._seq += 1
            obj = direction(item_id, cleaned)
            obj.validate()
            self._directions[item_id] = obj
            log.info("[ElevatorGroupControlSystemService.create_direction] stored %s in _directions (count=%s)", item_id, len(self._directions))
            return obj

    def get_direction(self, item_id: str) -> direction:
        with self._lock:
            obj = self._directions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown direction id: {item_id}")
            log.info("[ElevatorGroupControlSystemService.get_direction] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_request_queue(self, name: str) -> requestQueue:
        """UML: ElevatorGroupControlSystemService.create_request_queue(name) -> requestQueue"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("requestQueue name is required")
        with self._lock:
            item_id = f"REQ-{self._seq:04d}"
            self._seq += 1
            obj = requestQueue(item_id, cleaned)
            obj.validate()
            self._request_queues[item_id] = obj
            log.info("[ElevatorGroupControlSystemService.create_request_queue] stored %s in _request_queues (count=%s)", item_id, len(self._request_queues))
            return obj

    def get_request_queue(self, item_id: str) -> requestQueue:
        with self._lock:
            obj = self._request_queues.get(item_id)
            if obj is None:
                raise KeyError(f"unknown requestQueue id: {item_id}")
            log.info("[ElevatorGroupControlSystemService.get_request_queue] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_elevator_controller(self, item_id: str) -> ElevatorController:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._elevator_controllers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ElevatorController id: {item_id}")
            log.info("[ElevatorGroupControlSystemService.close_elevator_controller] closing %s via ElevatorController.close()", item_id)
            obj.close()
            return obj

    def list_active_elevator_controllers(self) -> List[ElevatorController]:
        with self._lock:
            active = [o for o in self._elevator_controllers.values() if o.status == "ACTIVE"]
            log.info("[ElevatorGroupControlSystemService.list_active_elevator_controllers] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct ElevatorGroupControlSystemService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = ElevatorGroupControlSystemService()

    log.info("========== STEP 2: Create primary ElevatorController objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_elevator_controller("alpha-elevator_controller")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_elevator_controller("beta-elevator_controller")

    log.info("========== STEP 3: Create Elevator (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_elevator("sample-elevator")

    log.info("========== STEP 4: Create currentFloor (UML class) ==========")
    system.create_current_floor("sample-current_floor")

    log.info("========== STEP 5: Create direction (UML class) ==========")
    system.create_direction("sample-direction")

    log.info("========== STEP 6: Create requestQueue (UML class) ==========")
    system.create_request_queue("sample-request_queue")

    log.info("========== STEP 7: Inspect active ElevatorController list ==========")
    system.list_active_elevator_controllers()

    log.info("========== STEP 8: Close first ElevatorController ==========")
    system.close_elevator_controller(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_elevator_controller(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from ElevatorController.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_elevator_controller("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_elevator_controller: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_elevator_controllers()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class ElevatorController {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ElevatorController(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ElevatorController.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ElevatorController.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ElevatorController.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ElevatorController " + id + " invalid status");
    }
    System.out.println("[ElevatorController.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ElevatorController " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ElevatorController.close] id=" + id + " -> CLOSED");
  }
}


class Elevator {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Elevator(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Elevator.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Elevator.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Elevator.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Elevator " + id + " invalid status");
    }
    System.out.println("[Elevator.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Elevator " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Elevator.close] id=" + id + " -> CLOSED");
  }
}


class currentFloor {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  currentFloor(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("currentFloor.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("currentFloor.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[currentFloor.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("currentFloor " + id + " invalid status");
    }
    System.out.println("[currentFloor.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("currentFloor " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[currentFloor.close] id=" + id + " -> CLOSED");
  }
}


class direction {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  direction(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("direction.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("direction.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[direction.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("direction " + id + " invalid status");
    }
    System.out.println("[direction.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("direction " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[direction.close] id=" + id + " -> CLOSED");
  }
}


class requestQueue {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  requestQueue(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("requestQueue.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("requestQueue.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[requestQueue.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("requestQueue " + id + " invalid status");
    }
    System.out.println("[requestQueue.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("requestQueue " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[requestQueue.close] id=" + id + " -> CLOSED");
  }
}

public class ElevatorGroupControlSystemService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, ElevatorController> elevator_controllers = new LinkedHashMap<>();
  private final Map<String, Elevator> elevators = new LinkedHashMap<>();
  private final Map<String, currentFloor> current_floors = new LinkedHashMap<>();
  private final Map<String, direction> directions = new LinkedHashMap<>();
  private final Map<String, requestQueue> request_queues = new LinkedHashMap<>();

  public ElevatorGroupControlSystemService() {
    System.out.println("[ElevatorGroupControlSystemService.__init__] system ready");
  }

  public ElevatorController createElevatorController(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ElevatorController name required");
    }
    lock.lock();
    try {
      String id = String.format("ELE-%04d", seq++);
      ElevatorController obj = new ElevatorController(id, name.trim());
      obj.validate();
      elevator_controllers.put(id, obj);
      System.out.println("[ElevatorGroupControlSystemService.createElevatorController] stored " + id + " count=" + elevator_controllers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ElevatorController getElevatorController(String id) {
    lock.lock();
    try {
      ElevatorController obj = elevator_controllers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ElevatorController id: " + id);
      }
      System.out.println("[ElevatorGroupControlSystemService.getElevatorController] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Elevator createElevator(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Elevator name required");
    }
    lock.lock();
    try {
      String id = String.format("ELE-%04d", seq++);
      Elevator obj = new Elevator(id, name.trim());
      obj.validate();
      elevators.put(id, obj);
      System.out.println("[ElevatorGroupControlSystemService.createElevator] stored " + id + " count=" + elevators.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Elevator getElevator(String id) {
    lock.lock();
    try {
      Elevator obj = elevators.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Elevator id: " + id);
      }
      System.out.println("[ElevatorGroupControlSystemService.getElevator] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public currentFloor createcurrentFloor(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("currentFloor name required");
    }
    lock.lock();
    try {
      String id = String.format("CUR-%04d", seq++);
      currentFloor obj = new currentFloor(id, name.trim());
      obj.validate();
      current_floors.put(id, obj);
      System.out.println("[ElevatorGroupControlSystemService.createcurrentFloor] stored " + id + " count=" + current_floors.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public currentFloor getcurrentFloor(String id) {
    lock.lock();
    try {
      currentFloor obj = current_floors.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown currentFloor id: " + id);
      }
      System.out.println("[ElevatorGroupControlSystemService.getcurrentFloor] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public direction createdirection(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("direction name required");
    }
    lock.lock();
    try {
      String id = String.format("DIR-%04d", seq++);
      direction obj = new direction(id, name.trim());
      obj.validate();
      directions.put(id, obj);
      System.out.println("[ElevatorGroupControlSystemService.createdirection] stored " + id + " count=" + directions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public direction getdirection(String id) {
    lock.lock();
    try {
      direction obj = directions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown direction id: " + id);
      }
      System.out.println("[ElevatorGroupControlSystemService.getdirection] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public requestQueue createrequestQueue(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("requestQueue name required");
    }
    lock.lock();
    try {
      String id = String.format("REQ-%04d", seq++);
      requestQueue obj = new requestQueue(id, name.trim());
      obj.validate();
      request_queues.put(id, obj);
      System.out.println("[ElevatorGroupControlSystemService.createrequestQueue] stored " + id + " count=" + request_queues.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public requestQueue getrequestQueue(String id) {
    lock.lock();
    try {
      requestQueue obj = request_queues.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown requestQueue id: " + id);
      }
      System.out.println("[ElevatorGroupControlSystemService.getrequestQueue] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ElevatorController closeElevatorController(String id) {
    lock.lock();
    try {
      ElevatorController obj = elevator_controllers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ElevatorController id: " + id);
      }
      System.out.println("[ElevatorGroupControlSystemService.closeElevatorController] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<ElevatorController> listActiveElevatorControllers() {
    lock.lock();
    try {
      List<ElevatorController> out = new ArrayList<>();
      for (ElevatorController o : elevator_controllers.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[ElevatorGroupControlSystemService.listActiveElevatorControllers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct ElevatorGroupControlSystemService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    ElevatorGroupControlSystemService system = new ElevatorGroupControlSystemService();
    System.out.println("========== STEP 2: Create ElevatorController objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    ElevatorController first = system.createElevatorController("alpha-elevator_controller");
    system.createElevatorController("beta-elevator_controller");
    System.out.println("========== STEP 3: Create Elevator ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createElevator("sample-elevator");
    System.out.println("========== STEP 4: Create currentFloor ==========");
    system.createcurrentFloor("sample-current_floor");
    System.out.println("========== STEP 5: Create direction ==========");
    system.createdirection("sample-direction");
    System.out.println("========== STEP 6: Create requestQueue ==========");
    system.createrequestQueue("sample-request_queue");
    System.out.println("========== Inspect active list ==========");
    system.listActiveElevatorControllers();
    System.out.println("========== Close first ElevatorController ==========");
    system.closeElevatorController(first.getId());
    try {
      system.closeElevatorController(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getElevatorController("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class ElevatorController {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ElevatorController.id required')
    }

    if (!name?.trim()) {
      throw new Error('ElevatorController.name required')
    }
    console.log(\`[ElevatorController.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ElevatorController \${this.id} invalid status\`)
    }
    console.log(\`[ElevatorController.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ElevatorController \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ElevatorController.close] id=\${this.id} -> CLOSED\`)
  }
}


class Elevator {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Elevator.id required')
    }

    if (!name?.trim()) {
      throw new Error('Elevator.name required')
    }
    console.log(\`[Elevator.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Elevator \${this.id} invalid status\`)
    }
    console.log(\`[Elevator.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Elevator \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Elevator.close] id=\${this.id} -> CLOSED\`)
  }
}


class currentFloor {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('currentFloor.id required')
    }

    if (!name?.trim()) {
      throw new Error('currentFloor.name required')
    }
    console.log(\`[currentFloor.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`currentFloor \${this.id} invalid status\`)
    }
    console.log(\`[currentFloor.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`currentFloor \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[currentFloor.close] id=\${this.id} -> CLOSED\`)
  }
}


class direction {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('direction.id required')
    }

    if (!name?.trim()) {
      throw new Error('direction.name required')
    }
    console.log(\`[direction.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`direction \${this.id} invalid status\`)
    }
    console.log(\`[direction.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`direction \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[direction.close] id=\${this.id} -> CLOSED\`)
  }
}


class requestQueue {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('requestQueue.id required')
    }

    if (!name?.trim()) {
      throw new Error('requestQueue.name required')
    }
    console.log(\`[requestQueue.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`requestQueue \${this.id} invalid status\`)
    }
    console.log(\`[requestQueue.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`requestQueue \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[requestQueue.close] id=\${this.id} -> CLOSED\`)
  }
}

class ElevatorGroupControlSystemService {
  private seq = 1
  private elevator_controllers = new Map<string, ElevatorController>()
  private elevators = new Map<string, Elevator>()
  private current_floors = new Map<string, currentFloor>()
  private directions = new Map<string, direction>()
  private request_queues = new Map<string, requestQueue>()
  constructor() {
    console.log('[ElevatorGroupControlSystemService.__init__] system ready')
  }

  createElevatorController(name: string): ElevatorController {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ElevatorController name required')
    }
    const id = \`ELE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ElevatorController(id, cleaned)
    obj.validate()
    this.elevator_controllers.set(id, obj)
    console.log(\`[ElevatorGroupControlSystemService.createElevatorController] stored \${id} count=\${this.elevator_controllers.size}\`)
    return obj
  }

  getElevatorController(id: string): ElevatorController {
    const obj = this.elevator_controllers.get(id)
    if (!obj) {
      throw new Error(\`unknown ElevatorController id: \${id}\`)
    }
    console.log(\`[ElevatorGroupControlSystemService.getElevatorController] found id=\${obj.id}\`)
    return obj
  }

  createElevator(name: string): Elevator {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Elevator name required')
    }
    const id = \`ELE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Elevator(id, cleaned)
    obj.validate()
    this.elevators.set(id, obj)
    console.log(\`[ElevatorGroupControlSystemService.createElevator] stored \${id} count=\${this.elevators.size}\`)
    return obj
  }

  getElevator(id: string): Elevator {
    const obj = this.elevators.get(id)
    if (!obj) {
      throw new Error(\`unknown Elevator id: \${id}\`)
    }
    console.log(\`[ElevatorGroupControlSystemService.getElevator] found id=\${obj.id}\`)
    return obj
  }

  createcurrentFloor(name: string): currentFloor {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('currentFloor name required')
    }
    const id = \`CUR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new currentFloor(id, cleaned)
    obj.validate()
    this.current_floors.set(id, obj)
    console.log(\`[ElevatorGroupControlSystemService.createcurrentFloor] stored \${id} count=\${this.current_floors.size}\`)
    return obj
  }

  getcurrentFloor(id: string): currentFloor {
    const obj = this.current_floors.get(id)
    if (!obj) {
      throw new Error(\`unknown currentFloor id: \${id}\`)
    }
    console.log(\`[ElevatorGroupControlSystemService.getcurrentFloor] found id=\${obj.id}\`)
    return obj
  }

  createdirection(name: string): direction {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('direction name required')
    }
    const id = \`DIR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new direction(id, cleaned)
    obj.validate()
    this.directions.set(id, obj)
    console.log(\`[ElevatorGroupControlSystemService.createdirection] stored \${id} count=\${this.directions.size}\`)
    return obj
  }

  getdirection(id: string): direction {
    const obj = this.directions.get(id)
    if (!obj) {
      throw new Error(\`unknown direction id: \${id}\`)
    }
    console.log(\`[ElevatorGroupControlSystemService.getdirection] found id=\${obj.id}\`)
    return obj
  }

  createrequestQueue(name: string): requestQueue {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('requestQueue name required')
    }
    const id = \`REQ-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new requestQueue(id, cleaned)
    obj.validate()
    this.request_queues.set(id, obj)
    console.log(\`[ElevatorGroupControlSystemService.createrequestQueue] stored \${id} count=\${this.request_queues.size}\`)
    return obj
  }

  getrequestQueue(id: string): requestQueue {
    const obj = this.request_queues.get(id)
    if (!obj) {
      throw new Error(\`unknown requestQueue id: \${id}\`)
    }
    console.log(\`[ElevatorGroupControlSystemService.getrequestQueue] found id=\${obj.id}\`)
    return obj
  }

  closeElevatorController(id: string): ElevatorController {
    const obj = this.getElevatorController(id)
    console.log(\`[ElevatorGroupControlSystemService.closeElevatorController] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveElevatorControllers(): ElevatorController[] {
    const active = [...this.elevator_controllers.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[ElevatorGroupControlSystemService.listActiveElevatorControllers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct ElevatorGroupControlSystemService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new ElevatorGroupControlSystemService()
  console.log('========== STEP 2: Create ElevatorController objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createElevatorController('alpha-elevator_controller')
  system.createElevatorController('beta-elevator_controller')
  console.log('========== STEP 3: Create Elevator ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createElevator('sample-elevator')
  console.log('========== STEP 4: Create currentFloor ==========')
  system.createcurrentFloor('sample-current_floor')
  console.log('========== STEP 5: Create direction ==========')
  system.createdirection('sample-direction')
  console.log('========== STEP 6: Create requestQueue ==========')
  system.createrequestQueue('sample-request_queue')
  system.listActiveElevatorControllers()
  console.log('========== Close first ElevatorController ==========')
  system.closeElevatorController(first.id)
  try {
    system.closeElevatorController(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getElevatorController('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class ElevatorController {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ElevatorController(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ElevatorController requires id and name");
    }
    cout << "[ElevatorController.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ElevatorController invalid status");
    }
    cout << "[ElevatorController.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ElevatorController cannot close");
    }
    status_ = "CLOSED";
    cout << "[ElevatorController.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Elevator {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Elevator(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Elevator requires id and name");
    }
    cout << "[Elevator.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Elevator invalid status");
    }
    cout << "[Elevator.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Elevator cannot close");
    }
    status_ = "CLOSED";
    cout << "[Elevator.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class currentFloor {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  currentFloor(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("currentFloor requires id and name");
    }
    cout << "[currentFloor.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("currentFloor invalid status");
    }
    cout << "[currentFloor.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("currentFloor cannot close");
    }
    status_ = "CLOSED";
    cout << "[currentFloor.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class direction {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  direction(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("direction requires id and name");
    }
    cout << "[direction.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("direction invalid status");
    }
    cout << "[direction.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("direction cannot close");
    }
    status_ = "CLOSED";
    cout << "[direction.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class requestQueue {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  requestQueue(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("requestQueue requires id and name");
    }
    cout << "[requestQueue.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("requestQueue invalid status");
    }
    cout << "[requestQueue.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("requestQueue cannot close");
    }
    status_ = "CLOSED";
    cout << "[requestQueue.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class ElevatorGroupControlSystemService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, ElevatorController> elevator_controllers_;
  unordered_map<string, Elevator> elevators_;
  unordered_map<string, currentFloor> current_floors_;
  unordered_map<string, direction> directions_;
  unordered_map<string, requestQueue> request_queues_;
public:
  ElevatorGroupControlSystemService() {
    cout << "[ElevatorGroupControlSystemService.__init__] system ready" << endl;
  }

  ElevatorController createElevatorController(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ElevatorController name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ELE-%04d", seq_++);
    ElevatorController obj{buf, name};
    obj.validate();
    elevator_controllers_.emplace(obj.id(), obj);
    cout << "[ElevatorGroupControlSystemService.createElevatorController] stored " << obj.id() << endl;
    return obj;
  }

  ElevatorController getElevatorController(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = elevator_controllers_.find(id);
    if (it == elevator_controllers_.end()) {
      throw out_of_range("unknown ElevatorController id");
    }
    cout << "[ElevatorGroupControlSystemService.getElevatorController] found " << id << endl;
    return it->second;
  }

  Elevator createElevator(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Elevator name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ELE-%04d", seq_++);
    Elevator obj{buf, name};
    obj.validate();
    elevators_.emplace(obj.id(), obj);
    cout << "[ElevatorGroupControlSystemService.createElevator] stored " << obj.id() << endl;
    return obj;
  }

  Elevator getElevator(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = elevators_.find(id);
    if (it == elevators_.end()) {
      throw out_of_range("unknown Elevator id");
    }
    cout << "[ElevatorGroupControlSystemService.getElevator] found " << id << endl;
    return it->second;
  }

  currentFloor createcurrentFloor(const string& name) {
    if (name.empty()) {
      throw invalid_argument("currentFloor name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CUR-%04d", seq_++);
    currentFloor obj{buf, name};
    obj.validate();
    current_floors_.emplace(obj.id(), obj);
    cout << "[ElevatorGroupControlSystemService.createcurrentFloor] stored " << obj.id() << endl;
    return obj;
  }

  currentFloor getcurrentFloor(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = current_floors_.find(id);
    if (it == current_floors_.end()) {
      throw out_of_range("unknown currentFloor id");
    }
    cout << "[ElevatorGroupControlSystemService.getcurrentFloor] found " << id << endl;
    return it->second;
  }

  direction createdirection(const string& name) {
    if (name.empty()) {
      throw invalid_argument("direction name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DIR-%04d", seq_++);
    direction obj{buf, name};
    obj.validate();
    directions_.emplace(obj.id(), obj);
    cout << "[ElevatorGroupControlSystemService.createdirection] stored " << obj.id() << endl;
    return obj;
  }

  direction getdirection(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = directions_.find(id);
    if (it == directions_.end()) {
      throw out_of_range("unknown direction id");
    }
    cout << "[ElevatorGroupControlSystemService.getdirection] found " << id << endl;
    return it->second;
  }

  requestQueue createrequestQueue(const string& name) {
    if (name.empty()) {
      throw invalid_argument("requestQueue name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "REQ-%04d", seq_++);
    requestQueue obj{buf, name};
    obj.validate();
    request_queues_.emplace(obj.id(), obj);
    cout << "[ElevatorGroupControlSystemService.createrequestQueue] stored " << obj.id() << endl;
    return obj;
  }

  requestQueue getrequestQueue(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = request_queues_.find(id);
    if (it == request_queues_.end()) {
      throw out_of_range("unknown requestQueue id");
    }
    cout << "[ElevatorGroupControlSystemService.getrequestQueue] found " << id << endl;
    return it->second;
  }

  ElevatorController closeElevatorController(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = elevator_controllers_.find(id);
    if (it == elevator_controllers_.end()) {
      throw out_of_range("unknown ElevatorController");
    }
    cout << "[ElevatorGroupControlSystemService.closeElevatorController] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct ElevatorGroupControlSystemService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  ElevatorGroupControlSystemService system;
  cout << "========== STEP 2: Create ElevatorController ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createElevatorController("alpha-elevator_controller");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createElevatorController("beta-elevator_controller");
  system.createElevator("sample-elevator");
  system.createcurrentFloor("sample-current_floor");
  system.createdirection("sample-direction");
  system.createrequestQueue("sample-request_queue");
  system.closeElevatorController(first.id());
  try {
    system.closeElevatorController(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getElevatorController("MISSING-ID");
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

type ElevatorController struct {
  ID     string
  Name   string
  Status string
}

func NewElevatorController(id, name string) (*ElevatorController, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ElevatorController requires id and name")
  }
  obj := &ElevatorController{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ElevatorController.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ElevatorController) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ElevatorController invalid status")
  }
  fmt.Printf("[ElevatorController.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ElevatorController) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ElevatorController %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ElevatorController.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Elevator struct {
  ID     string
  Name   string
  Status string
}

func NewElevator(id, name string) (*Elevator, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Elevator requires id and name")
  }
  obj := &Elevator{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Elevator.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Elevator) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Elevator invalid status")
  }
  fmt.Printf("[Elevator.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Elevator) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Elevator %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Elevator.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type currentFloor struct {
  ID     string
  Name   string
  Status string
}

func NewcurrentFloor(id, name string) (*currentFloor, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("currentFloor requires id and name")
  }
  obj := &currentFloor{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[currentFloor.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *currentFloor) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("currentFloor invalid status")
  }
  fmt.Printf("[currentFloor.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *currentFloor) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("currentFloor %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[currentFloor.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type direction struct {
  ID     string
  Name   string
  Status string
}

func Newdirection(id, name string) (*direction, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("direction requires id and name")
  }
  obj := &direction{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[direction.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *direction) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("direction invalid status")
  }
  fmt.Printf("[direction.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *direction) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("direction %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[direction.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type requestQueue struct {
  ID     string
  Name   string
  Status string
}

func NewrequestQueue(id, name string) (*requestQueue, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("requestQueue requires id and name")
  }
  obj := &requestQueue{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[requestQueue.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *requestQueue) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("requestQueue invalid status")
  }
  fmt.Printf("[requestQueue.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *requestQueue) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("requestQueue %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[requestQueue.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type ElevatorGroupControlSystemService struct {
  mu  sync.Mutex
  seq int
  elevator_controllers map[string]*ElevatorController
  elevators map[string]*Elevator
  current_floors map[string]*currentFloor
  directions map[string]*direction
  request_queues map[string]*requestQueue
}

func NewElevatorGroupControlSystemService() *ElevatorGroupControlSystemService {
  fmt.Println("[ElevatorGroupControlSystemService.__init__] system ready")
  return &ElevatorGroupControlSystemService{
    seq: 1,
    elevator_controllers: map[string]*ElevatorController{},
    elevators: map[string]*Elevator{},
    current_floors: map[string]*currentFloor{},
    directions: map[string]*direction{},
    request_queues: map[string]*requestQueue{},
  }
}

func (s *ElevatorGroupControlSystemService) CreateElevatorController(name string) (*ElevatorController, error) {
  if name == "" {
    return nil, fmt.Errorf("ElevatorController name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ELE-%04d", s.seq)
  s.seq++
  obj, err := NewElevatorController(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.elevator_controllers[id] = obj
  fmt.Printf("[ElevatorGroupControlSystemService.CreateElevatorController] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) GetElevatorController(id string) (*ElevatorController, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.elevator_controllers[id]
  if !ok {
    return nil, fmt.Errorf("unknown ElevatorController id: %s", id)
  }
  fmt.Printf("[ElevatorGroupControlSystemService.GetElevatorController] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) CreateElevator(name string) (*Elevator, error) {
  if name == "" {
    return nil, fmt.Errorf("Elevator name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ELE-%04d", s.seq)
  s.seq++
  obj, err := NewElevator(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.elevators[id] = obj
  fmt.Printf("[ElevatorGroupControlSystemService.CreateElevator] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) GetElevator(id string) (*Elevator, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.elevators[id]
  if !ok {
    return nil, fmt.Errorf("unknown Elevator id: %s", id)
  }
  fmt.Printf("[ElevatorGroupControlSystemService.GetElevator] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) CreatecurrentFloor(name string) (*currentFloor, error) {
  if name == "" {
    return nil, fmt.Errorf("currentFloor name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CUR-%04d", s.seq)
  s.seq++
  obj, err := NewcurrentFloor(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.current_floors[id] = obj
  fmt.Printf("[ElevatorGroupControlSystemService.CreatecurrentFloor] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) GetcurrentFloor(id string) (*currentFloor, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.current_floors[id]
  if !ok {
    return nil, fmt.Errorf("unknown currentFloor id: %s", id)
  }
  fmt.Printf("[ElevatorGroupControlSystemService.GetcurrentFloor] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) Createdirection(name string) (*direction, error) {
  if name == "" {
    return nil, fmt.Errorf("direction name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DIR-%04d", s.seq)
  s.seq++
  obj, err := Newdirection(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.directions[id] = obj
  fmt.Printf("[ElevatorGroupControlSystemService.Createdirection] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) Getdirection(id string) (*direction, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.directions[id]
  if !ok {
    return nil, fmt.Errorf("unknown direction id: %s", id)
  }
  fmt.Printf("[ElevatorGroupControlSystemService.Getdirection] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) CreaterequestQueue(name string) (*requestQueue, error) {
  if name == "" {
    return nil, fmt.Errorf("requestQueue name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("REQ-%04d", s.seq)
  s.seq++
  obj, err := NewrequestQueue(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.request_queues[id] = obj
  fmt.Printf("[ElevatorGroupControlSystemService.CreaterequestQueue] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) GetrequestQueue(id string) (*requestQueue, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.request_queues[id]
  if !ok {
    return nil, fmt.Errorf("unknown requestQueue id: %s", id)
  }
  fmt.Printf("[ElevatorGroupControlSystemService.GetrequestQueue] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorGroupControlSystemService) CloseElevatorController(id string) (*ElevatorController, error) {
  obj, err := s.GetElevatorController(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[ElevatorGroupControlSystemService.CloseElevatorController] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct ElevatorGroupControlSystemService ==========")
  system := NewElevatorGroupControlSystemService()
  fmt.Println("========== STEP 2: Create ElevatorController ==========")
  first, _ := system.CreateElevatorController("alpha-elevator_controller")
  system.CreateElevatorController("beta-elevator_controller")
  system.CreateElevator("sample-elevator")
  system.CreatecurrentFloor("sample-current_floor")
  system.Createdirection("sample-direction")
  system.CreaterequestQueue("sample-request_queue")
  system.CloseElevatorController(first.ID)
  if _, err := system.CloseElevatorController(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetElevatorController("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class ElevatorController {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ElevatorController(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ElevatorController requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ElevatorController.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ElevatorController invalid status");
    }
    Console.WriteLine("[ElevatorController.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ElevatorController " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ElevatorController.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Elevator {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Elevator(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Elevator requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Elevator.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Elevator invalid status");
    }
    Console.WriteLine("[Elevator.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Elevator " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Elevator.close] id=" + Id + " -> CLOSED");
  }
}


sealed class currentFloor {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public currentFloor(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("currentFloor requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[currentFloor.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("currentFloor invalid status");
    }
    Console.WriteLine("[currentFloor.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("currentFloor " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[currentFloor.close] id=" + Id + " -> CLOSED");
  }
}


sealed class direction {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public direction(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("direction requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[direction.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("direction invalid status");
    }
    Console.WriteLine("[direction.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("direction " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[direction.close] id=" + Id + " -> CLOSED");
  }
}


sealed class requestQueue {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public requestQueue(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("requestQueue requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[requestQueue.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("requestQueue invalid status");
    }
    Console.WriteLine("[requestQueue.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("requestQueue " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[requestQueue.close] id=" + Id + " -> CLOSED");
  }
}

sealed class ElevatorGroupControlSystemService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, ElevatorController> _elevator_controllers = new();
  private readonly Dictionary<string, Elevator> _elevators = new();
  private readonly Dictionary<string, currentFloor> _current_floors = new();
  private readonly Dictionary<string, direction> _directions = new();
  private readonly Dictionary<string, requestQueue> _request_queues = new();
  public ElevatorGroupControlSystemService() {
    Console.WriteLine("[ElevatorGroupControlSystemService.__init__] system ready");
  }

  public ElevatorController CreateElevatorController(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ElevatorController name required");
    }
    lock (_gate) {
      var id = string.Format("ELE-{0:D4}", _seq++);
      var obj = new ElevatorController(id, name.Trim());
      obj.Validate();
      _elevator_controllers[id] = obj;
      Console.WriteLine("[ElevatorGroupControlSystemService.CreateElevatorController] stored " + id);
      return obj;
    }
  }

  public ElevatorController GetElevatorController(string id) {
    lock (_gate) {
      if (!_elevator_controllers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ElevatorController id: " + id);
      }
      Console.WriteLine("[ElevatorGroupControlSystemService.GetElevatorController] found " + id);
      return obj;
    }
  }

  public Elevator CreateElevator(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Elevator name required");
    }
    lock (_gate) {
      var id = string.Format("ELE-{0:D4}", _seq++);
      var obj = new Elevator(id, name.Trim());
      obj.Validate();
      _elevators[id] = obj;
      Console.WriteLine("[ElevatorGroupControlSystemService.CreateElevator] stored " + id);
      return obj;
    }
  }

  public Elevator GetElevator(string id) {
    lock (_gate) {
      if (!_elevators.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Elevator id: " + id);
      }
      Console.WriteLine("[ElevatorGroupControlSystemService.GetElevator] found " + id);
      return obj;
    }
  }

  public currentFloor CreatecurrentFloor(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("currentFloor name required");
    }
    lock (_gate) {
      var id = string.Format("CUR-{0:D4}", _seq++);
      var obj = new currentFloor(id, name.Trim());
      obj.Validate();
      _current_floors[id] = obj;
      Console.WriteLine("[ElevatorGroupControlSystemService.CreatecurrentFloor] stored " + id);
      return obj;
    }
  }

  public currentFloor GetcurrentFloor(string id) {
    lock (_gate) {
      if (!_current_floors.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown currentFloor id: " + id);
      }
      Console.WriteLine("[ElevatorGroupControlSystemService.GetcurrentFloor] found " + id);
      return obj;
    }
  }

  public direction Createdirection(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("direction name required");
    }
    lock (_gate) {
      var id = string.Format("DIR-{0:D4}", _seq++);
      var obj = new direction(id, name.Trim());
      obj.Validate();
      _directions[id] = obj;
      Console.WriteLine("[ElevatorGroupControlSystemService.Createdirection] stored " + id);
      return obj;
    }
  }

  public direction Getdirection(string id) {
    lock (_gate) {
      if (!_directions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown direction id: " + id);
      }
      Console.WriteLine("[ElevatorGroupControlSystemService.Getdirection] found " + id);
      return obj;
    }
  }

  public requestQueue CreaterequestQueue(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("requestQueue name required");
    }
    lock (_gate) {
      var id = string.Format("REQ-{0:D4}", _seq++);
      var obj = new requestQueue(id, name.Trim());
      obj.Validate();
      _request_queues[id] = obj;
      Console.WriteLine("[ElevatorGroupControlSystemService.CreaterequestQueue] stored " + id);
      return obj;
    }
  }

  public requestQueue GetrequestQueue(string id) {
    lock (_gate) {
      if (!_request_queues.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown requestQueue id: " + id);
      }
      Console.WriteLine("[ElevatorGroupControlSystemService.GetrequestQueue] found " + id);
      return obj;
    }
  }

  public ElevatorController CloseElevatorController(string id) {
    var obj = GetElevatorController(id);
    Console.WriteLine("[ElevatorGroupControlSystemService.CloseElevatorController] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct ElevatorGroupControlSystemService ==========");
    var system = new ElevatorGroupControlSystemService();
    Console.WriteLine("========== STEP 2: Create ElevatorController ==========");
    var first = system.CreateElevatorController("alpha-elevator_controller");
    system.CreateElevatorController("beta-elevator_controller");
    system.CreateElevator("sample-elevator");
    system.CreatecurrentFloor("sample-current_floor");
    system.Createdirection("sample-direction");
    system.CreaterequestQueue("sample-request_queue");
    system.CloseElevatorController(first.Id);
    try {
      system.CloseElevatorController(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetElevatorController("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const elevatorGroupControlSystemSolution: ProblemSolution = {
  slug: 'elevator-group-control-system',
  title: 'Elevator Group Control System (Multiple Elevators) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a control system that dispatches the optimal elevator among several to serve a hall call, minimizing wait time. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Handle hall calls (up/down) from any floor',
      'Handle in-cabin floor requests from passengers',
      'Dispatch the best elevator among N cars for a new hall call',
      'Support elevator states: idle, moving up, moving down, door open',
      'Batch requests along an elevator\'s current direction (SCAN-like)',
      'Handle an elevator going out of service',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Handle hall calls (up/down) from any floor?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Handle in-cabin floor requests from passengers?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Dispatch the best elevator among N cars for a new hall call?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support elevator states: idle, moving up, moving down, door open?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Batch requests along an elevator\'s current direction (SCAN-like)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. ElevatorGroupControlSystemService is the facade stereotype. ElevatorController, Elevator, currentFloor, direction, requestQueue are concrete domain classes with id/name/status and validate/close.',
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
          'Construct ElevatorGroupControlSystemService.',
          'createElevatorController twice and create the related UML classes.',
          'closeElevatorController once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'ElevatorGroupControlSystemService', responsibility: 'UML facade - orchestrates Elevator Group Control System (Multiple Elevators).', keyMembers: ['create*', 'get*', 'closeElevatorController'] },
    { name: 'ElevatorController', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Elevator', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'currentFloor', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'direction', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'requestQueue', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from ElevatorGroupControlSystemService to ElevatorController, Elevator, currentFloor, direction, requestQueue. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on ElevatorGroupControlSystemService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'ElevatorGroupControlSystemService', responsibility: 'UML facade - orchestrates Elevator Group Control System (Multiple Elevators).', keyMembers: ['create*', 'get*', 'closeElevatorController'] },
    { name: 'ElevatorController', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Elevator', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'currentFloor', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'direction', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'requestQueue', responsibility: 'UML class - domain object for Elevator Group Control System (Multiple Elevators).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'ElevatorGroupControlSystemService exposes create/get/close and owns composed collections.' },
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
      'main constructs ElevatorGroupControlSystemService, creates UML domain objects, closes the primary ElevatorController, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct ElevatorGroupControlSystemService.',
      'createElevatorController for alpha and beta.',
      'create remaining UML classes.',
      'closeElevatorController(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createElevatorController("alpha..."); closeElevatorController(id)',
        output: '[ElevatorController.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeElevatorController(alreadyClosed) or getElevatorController("MISSING-ID")',
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
