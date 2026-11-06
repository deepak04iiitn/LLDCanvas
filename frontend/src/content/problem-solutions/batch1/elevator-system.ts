import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'ElevatorSystemService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_buildings', 'Map<string, Building>'),
    attr('-', '_elevators', 'Map<string, Elevator>'),
    attr('-', '_floors', 'Map<string, Floor>'),
    attr('-', '_elevator_buttons', 'Map<string, ElevatorButton>'),
    attr('-', '_floor_buttons', 'Map<string, FloorButton>'),
  ], [
    method('+', 'createBuilding', 'name: string', 'Building'),
    method('+', 'createElevator', 'name: string', 'Elevator'),
    method('+', 'createFloor', 'name: string', 'Floor'),
    method('+', 'createElevatorButton', 'name: string', 'ElevatorButton'),
    method('+', 'createFloorButton', 'name: string', 'FloorButton'),
    method('+', 'getBuilding', 'id: string', 'Building'),
    method('+', 'getElevator', 'id: string', 'Elevator'),
    method('+', 'getFloor', 'id: string', 'Floor'),
    method('+', 'getElevatorButton', 'id: string', 'ElevatorButton'),
    method('+', 'getFloorButton', 'id: string', 'FloorButton'),
    method('+', 'closeBuilding', 'id: string', 'Building'),
  ], 'facade'),
  cls('n1', 'Building', GRID.x(1), GRID.y(0), [
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
  cls('n3', 'Floor', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'ElevatorButton', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'FloorButton', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("elevator-system")


class Building:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Building.id is required")
        if not name or not name.strip():
            raise ValueError("Building.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Building.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Building {self.id} has invalid status={self.status}")
        log.info("[Building.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Building {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Building.close] id=%s -> CLOSED", self.id)


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


class Floor:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Floor.id is required")
        if not name or not name.strip():
            raise ValueError("Floor.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Floor.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Floor {self.id} has invalid status={self.status}")
        log.info("[Floor.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Floor {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Floor.close] id=%s -> CLOSED", self.id)


class ElevatorButton:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ElevatorButton.id is required")
        if not name or not name.strip():
            raise ValueError("ElevatorButton.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ElevatorButton.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ElevatorButton {self.id} has invalid status={self.status}")
        log.info("[ElevatorButton.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ElevatorButton {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ElevatorButton.close] id=%s -> CLOSED", self.id)


class FloorButton:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("FloorButton.id is required")
        if not name or not name.strip():
            raise ValueError("FloorButton.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[FloorButton.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"FloorButton {self.id} has invalid status={self.status}")
        log.info("[FloorButton.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"FloorButton {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[FloorButton.close] id=%s -> CLOSED", self.id)


class ElevatorSystemService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._buildings: Dict[str, Building] = {}
        self._elevators: Dict[str, Elevator] = {}
        self._floors: Dict[str, Floor] = {}
        self._elevator_buttons: Dict[str, ElevatorButton] = {}
        self._floor_buttons: Dict[str, FloorButton] = {}
        log.info("[ElevatorSystemService.__init__] system ready; managing: Building, Elevator, Floor, ElevatorButton, FloorButton")

    def create_building(self, name: str) -> Building:
        """UML: ElevatorSystemService.create_building(name) -> Building"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Building name is required")
        with self._lock:
            item_id = f"BUI-{self._seq:04d}"
            self._seq += 1
            obj = Building(item_id, cleaned)
            obj.validate()
            self._buildings[item_id] = obj
            log.info("[ElevatorSystemService.create_building] stored %s in _buildings (count=%s)", item_id, len(self._buildings))
            return obj

    def get_building(self, item_id: str) -> Building:
        with self._lock:
            obj = self._buildings.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Building id: {item_id}")
            log.info("[ElevatorSystemService.get_building] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_elevator(self, name: str) -> Elevator:
        """UML: ElevatorSystemService.create_elevator(name) -> Elevator"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Elevator name is required")
        with self._lock:
            item_id = f"ELE-{self._seq:04d}"
            self._seq += 1
            obj = Elevator(item_id, cleaned)
            obj.validate()
            self._elevators[item_id] = obj
            log.info("[ElevatorSystemService.create_elevator] stored %s in _elevators (count=%s)", item_id, len(self._elevators))
            return obj

    def get_elevator(self, item_id: str) -> Elevator:
        with self._lock:
            obj = self._elevators.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Elevator id: {item_id}")
            log.info("[ElevatorSystemService.get_elevator] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_floor(self, name: str) -> Floor:
        """UML: ElevatorSystemService.create_floor(name) -> Floor"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Floor name is required")
        with self._lock:
            item_id = f"FLO-{self._seq:04d}"
            self._seq += 1
            obj = Floor(item_id, cleaned)
            obj.validate()
            self._floors[item_id] = obj
            log.info("[ElevatorSystemService.create_floor] stored %s in _floors (count=%s)", item_id, len(self._floors))
            return obj

    def get_floor(self, item_id: str) -> Floor:
        with self._lock:
            obj = self._floors.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Floor id: {item_id}")
            log.info("[ElevatorSystemService.get_floor] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_elevator_button(self, name: str) -> ElevatorButton:
        """UML: ElevatorSystemService.create_elevator_button(name) -> ElevatorButton"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ElevatorButton name is required")
        with self._lock:
            item_id = f"ELE-{self._seq:04d}"
            self._seq += 1
            obj = ElevatorButton(item_id, cleaned)
            obj.validate()
            self._elevator_buttons[item_id] = obj
            log.info("[ElevatorSystemService.create_elevator_button] stored %s in _elevator_buttons (count=%s)", item_id, len(self._elevator_buttons))
            return obj

    def get_elevator_button(self, item_id: str) -> ElevatorButton:
        with self._lock:
            obj = self._elevator_buttons.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ElevatorButton id: {item_id}")
            log.info("[ElevatorSystemService.get_elevator_button] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_floor_button(self, name: str) -> FloorButton:
        """UML: ElevatorSystemService.create_floor_button(name) -> FloorButton"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("FloorButton name is required")
        with self._lock:
            item_id = f"FLO-{self._seq:04d}"
            self._seq += 1
            obj = FloorButton(item_id, cleaned)
            obj.validate()
            self._floor_buttons[item_id] = obj
            log.info("[ElevatorSystemService.create_floor_button] stored %s in _floor_buttons (count=%s)", item_id, len(self._floor_buttons))
            return obj

    def get_floor_button(self, item_id: str) -> FloorButton:
        with self._lock:
            obj = self._floor_buttons.get(item_id)
            if obj is None:
                raise KeyError(f"unknown FloorButton id: {item_id}")
            log.info("[ElevatorSystemService.get_floor_button] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_building(self, item_id: str) -> Building:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._buildings.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Building id: {item_id}")
            log.info("[ElevatorSystemService.close_building] closing %s via Building.close()", item_id)
            obj.close()
            return obj

    def list_active_buildings(self) -> List[Building]:
        with self._lock:
            active = [o for o in self._buildings.values() if o.status == "ACTIVE"]
            log.info("[ElevatorSystemService.list_active_buildings] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct ElevatorSystemService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = ElevatorSystemService()

    log.info("========== STEP 2: Create primary Building objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_building("alpha-building")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_building("beta-building")

    log.info("========== STEP 3: Create Elevator (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_elevator("sample-elevator")

    log.info("========== STEP 4: Create Floor (UML class) ==========")
    system.create_floor("sample-floor")

    log.info("========== STEP 5: Create ElevatorButton (UML class) ==========")
    system.create_elevator_button("sample-elevator_button")

    log.info("========== STEP 6: Create FloorButton (UML class) ==========")
    system.create_floor_button("sample-floor_button")

    log.info("========== STEP 7: Inspect active Building list ==========")
    system.list_active_buildings()

    log.info("========== STEP 8: Close first Building ==========")
    system.close_building(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_building(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Building.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_building("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_building: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_buildings()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Building {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Building(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Building.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Building.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Building.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Building " + id + " invalid status");
    }
    System.out.println("[Building.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Building " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Building.close] id=" + id + " -> CLOSED");
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


class Floor {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Floor(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Floor.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Floor.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Floor.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Floor " + id + " invalid status");
    }
    System.out.println("[Floor.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Floor " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Floor.close] id=" + id + " -> CLOSED");
  }
}


class ElevatorButton {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ElevatorButton(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ElevatorButton.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ElevatorButton.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ElevatorButton.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ElevatorButton " + id + " invalid status");
    }
    System.out.println("[ElevatorButton.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ElevatorButton " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ElevatorButton.close] id=" + id + " -> CLOSED");
  }
}


class FloorButton {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  FloorButton(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("FloorButton.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FloorButton.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[FloorButton.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("FloorButton " + id + " invalid status");
    }
    System.out.println("[FloorButton.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("FloorButton " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[FloorButton.close] id=" + id + " -> CLOSED");
  }
}

public class ElevatorSystemService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Building> buildings = new LinkedHashMap<>();
  private final Map<String, Elevator> elevators = new LinkedHashMap<>();
  private final Map<String, Floor> floors = new LinkedHashMap<>();
  private final Map<String, ElevatorButton> elevator_buttons = new LinkedHashMap<>();
  private final Map<String, FloorButton> floor_buttons = new LinkedHashMap<>();

  public ElevatorSystemService() {
    System.out.println("[ElevatorSystemService.__init__] system ready");
  }

  public Building createBuilding(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Building name required");
    }
    lock.lock();
    try {
      String id = String.format("BUI-%04d", seq++);
      Building obj = new Building(id, name.trim());
      obj.validate();
      buildings.put(id, obj);
      System.out.println("[ElevatorSystemService.createBuilding] stored " + id + " count=" + buildings.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Building getBuilding(String id) {
    lock.lock();
    try {
      Building obj = buildings.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Building id: " + id);
      }
      System.out.println("[ElevatorSystemService.getBuilding] found id=" + obj.getId());
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
      System.out.println("[ElevatorSystemService.createElevator] stored " + id + " count=" + elevators.size());
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
      System.out.println("[ElevatorSystemService.getElevator] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Floor createFloor(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Floor name required");
    }
    lock.lock();
    try {
      String id = String.format("FLO-%04d", seq++);
      Floor obj = new Floor(id, name.trim());
      obj.validate();
      floors.put(id, obj);
      System.out.println("[ElevatorSystemService.createFloor] stored " + id + " count=" + floors.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Floor getFloor(String id) {
    lock.lock();
    try {
      Floor obj = floors.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Floor id: " + id);
      }
      System.out.println("[ElevatorSystemService.getFloor] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ElevatorButton createElevatorButton(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ElevatorButton name required");
    }
    lock.lock();
    try {
      String id = String.format("ELE-%04d", seq++);
      ElevatorButton obj = new ElevatorButton(id, name.trim());
      obj.validate();
      elevator_buttons.put(id, obj);
      System.out.println("[ElevatorSystemService.createElevatorButton] stored " + id + " count=" + elevator_buttons.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ElevatorButton getElevatorButton(String id) {
    lock.lock();
    try {
      ElevatorButton obj = elevator_buttons.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ElevatorButton id: " + id);
      }
      System.out.println("[ElevatorSystemService.getElevatorButton] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public FloorButton createFloorButton(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FloorButton name required");
    }
    lock.lock();
    try {
      String id = String.format("FLO-%04d", seq++);
      FloorButton obj = new FloorButton(id, name.trim());
      obj.validate();
      floor_buttons.put(id, obj);
      System.out.println("[ElevatorSystemService.createFloorButton] stored " + id + " count=" + floor_buttons.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public FloorButton getFloorButton(String id) {
    lock.lock();
    try {
      FloorButton obj = floor_buttons.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown FloorButton id: " + id);
      }
      System.out.println("[ElevatorSystemService.getFloorButton] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Building closeBuilding(String id) {
    lock.lock();
    try {
      Building obj = buildings.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Building id: " + id);
      }
      System.out.println("[ElevatorSystemService.closeBuilding] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Building> listActiveBuildings() {
    lock.lock();
    try {
      List<Building> out = new ArrayList<>();
      for (Building o : buildings.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[ElevatorSystemService.listActiveBuildings] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct ElevatorSystemService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    ElevatorSystemService system = new ElevatorSystemService();
    System.out.println("========== STEP 2: Create Building objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Building first = system.createBuilding("alpha-building");
    system.createBuilding("beta-building");
    System.out.println("========== STEP 3: Create Elevator ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createElevator("sample-elevator");
    System.out.println("========== STEP 4: Create Floor ==========");
    system.createFloor("sample-floor");
    System.out.println("========== STEP 5: Create ElevatorButton ==========");
    system.createElevatorButton("sample-elevator_button");
    System.out.println("========== STEP 6: Create FloorButton ==========");
    system.createFloorButton("sample-floor_button");
    System.out.println("========== Inspect active list ==========");
    system.listActiveBuildings();
    System.out.println("========== Close first Building ==========");
    system.closeBuilding(first.getId());
    try {
      system.closeBuilding(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getBuilding("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Building {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Building.id required')
    }

    if (!name?.trim()) {
      throw new Error('Building.name required')
    }
    console.log(\`[Building.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Building \${this.id} invalid status\`)
    }
    console.log(\`[Building.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Building \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Building.close] id=\${this.id} -> CLOSED\`)
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


class Floor {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Floor.id required')
    }

    if (!name?.trim()) {
      throw new Error('Floor.name required')
    }
    console.log(\`[Floor.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Floor \${this.id} invalid status\`)
    }
    console.log(\`[Floor.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Floor \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Floor.close] id=\${this.id} -> CLOSED\`)
  }
}


class ElevatorButton {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ElevatorButton.id required')
    }

    if (!name?.trim()) {
      throw new Error('ElevatorButton.name required')
    }
    console.log(\`[ElevatorButton.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ElevatorButton \${this.id} invalid status\`)
    }
    console.log(\`[ElevatorButton.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ElevatorButton \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ElevatorButton.close] id=\${this.id} -> CLOSED\`)
  }
}


class FloorButton {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('FloorButton.id required')
    }

    if (!name?.trim()) {
      throw new Error('FloorButton.name required')
    }
    console.log(\`[FloorButton.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`FloorButton \${this.id} invalid status\`)
    }
    console.log(\`[FloorButton.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`FloorButton \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[FloorButton.close] id=\${this.id} -> CLOSED\`)
  }
}

class ElevatorSystemService {
  private seq = 1
  private buildings = new Map<string, Building>()
  private elevators = new Map<string, Elevator>()
  private floors = new Map<string, Floor>()
  private elevator_buttons = new Map<string, ElevatorButton>()
  private floor_buttons = new Map<string, FloorButton>()
  constructor() {
    console.log('[ElevatorSystemService.__init__] system ready')
  }

  createBuilding(name: string): Building {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Building name required')
    }
    const id = \`BUI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Building(id, cleaned)
    obj.validate()
    this.buildings.set(id, obj)
    console.log(\`[ElevatorSystemService.createBuilding] stored \${id} count=\${this.buildings.size}\`)
    return obj
  }

  getBuilding(id: string): Building {
    const obj = this.buildings.get(id)
    if (!obj) {
      throw new Error(\`unknown Building id: \${id}\`)
    }
    console.log(\`[ElevatorSystemService.getBuilding] found id=\${obj.id}\`)
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
    console.log(\`[ElevatorSystemService.createElevator] stored \${id} count=\${this.elevators.size}\`)
    return obj
  }

  getElevator(id: string): Elevator {
    const obj = this.elevators.get(id)
    if (!obj) {
      throw new Error(\`unknown Elevator id: \${id}\`)
    }
    console.log(\`[ElevatorSystemService.getElevator] found id=\${obj.id}\`)
    return obj
  }

  createFloor(name: string): Floor {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Floor name required')
    }
    const id = \`FLO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Floor(id, cleaned)
    obj.validate()
    this.floors.set(id, obj)
    console.log(\`[ElevatorSystemService.createFloor] stored \${id} count=\${this.floors.size}\`)
    return obj
  }

  getFloor(id: string): Floor {
    const obj = this.floors.get(id)
    if (!obj) {
      throw new Error(\`unknown Floor id: \${id}\`)
    }
    console.log(\`[ElevatorSystemService.getFloor] found id=\${obj.id}\`)
    return obj
  }

  createElevatorButton(name: string): ElevatorButton {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ElevatorButton name required')
    }
    const id = \`ELE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ElevatorButton(id, cleaned)
    obj.validate()
    this.elevator_buttons.set(id, obj)
    console.log(\`[ElevatorSystemService.createElevatorButton] stored \${id} count=\${this.elevator_buttons.size}\`)
    return obj
  }

  getElevatorButton(id: string): ElevatorButton {
    const obj = this.elevator_buttons.get(id)
    if (!obj) {
      throw new Error(\`unknown ElevatorButton id: \${id}\`)
    }
    console.log(\`[ElevatorSystemService.getElevatorButton] found id=\${obj.id}\`)
    return obj
  }

  createFloorButton(name: string): FloorButton {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('FloorButton name required')
    }
    const id = \`FLO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new FloorButton(id, cleaned)
    obj.validate()
    this.floor_buttons.set(id, obj)
    console.log(\`[ElevatorSystemService.createFloorButton] stored \${id} count=\${this.floor_buttons.size}\`)
    return obj
  }

  getFloorButton(id: string): FloorButton {
    const obj = this.floor_buttons.get(id)
    if (!obj) {
      throw new Error(\`unknown FloorButton id: \${id}\`)
    }
    console.log(\`[ElevatorSystemService.getFloorButton] found id=\${obj.id}\`)
    return obj
  }

  closeBuilding(id: string): Building {
    const obj = this.getBuilding(id)
    console.log(\`[ElevatorSystemService.closeBuilding] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveBuildings(): Building[] {
    const active = [...this.buildings.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[ElevatorSystemService.listActiveBuildings] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct ElevatorSystemService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new ElevatorSystemService()
  console.log('========== STEP 2: Create Building objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createBuilding('alpha-building')
  system.createBuilding('beta-building')
  console.log('========== STEP 3: Create Elevator ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createElevator('sample-elevator')
  console.log('========== STEP 4: Create Floor ==========')
  system.createFloor('sample-floor')
  console.log('========== STEP 5: Create ElevatorButton ==========')
  system.createElevatorButton('sample-elevator_button')
  console.log('========== STEP 6: Create FloorButton ==========')
  system.createFloorButton('sample-floor_button')
  system.listActiveBuildings()
  console.log('========== Close first Building ==========')
  system.closeBuilding(first.id)
  try {
    system.closeBuilding(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getBuilding('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Building {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Building(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Building requires id and name");
    }
    cout << "[Building.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Building invalid status");
    }
    cout << "[Building.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Building cannot close");
    }
    status_ = "CLOSED";
    cout << "[Building.close] id=" << id_ << " -> CLOSED" << endl;
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


class Floor {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Floor(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Floor requires id and name");
    }
    cout << "[Floor.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Floor invalid status");
    }
    cout << "[Floor.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Floor cannot close");
    }
    status_ = "CLOSED";
    cout << "[Floor.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class ElevatorButton {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ElevatorButton(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ElevatorButton requires id and name");
    }
    cout << "[ElevatorButton.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ElevatorButton invalid status");
    }
    cout << "[ElevatorButton.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ElevatorButton cannot close");
    }
    status_ = "CLOSED";
    cout << "[ElevatorButton.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class FloorButton {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  FloorButton(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("FloorButton requires id and name");
    }
    cout << "[FloorButton.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("FloorButton invalid status");
    }
    cout << "[FloorButton.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("FloorButton cannot close");
    }
    status_ = "CLOSED";
    cout << "[FloorButton.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class ElevatorSystemService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Building> buildings_;
  unordered_map<string, Elevator> elevators_;
  unordered_map<string, Floor> floors_;
  unordered_map<string, ElevatorButton> elevator_buttons_;
  unordered_map<string, FloorButton> floor_buttons_;
public:
  ElevatorSystemService() {
    cout << "[ElevatorSystemService.__init__] system ready" << endl;
  }

  Building createBuilding(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Building name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BUI-%04d", seq_++);
    Building obj{buf, name};
    obj.validate();
    buildings_.emplace(obj.id(), obj);
    cout << "[ElevatorSystemService.createBuilding] stored " << obj.id() << endl;
    return obj;
  }

  Building getBuilding(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = buildings_.find(id);
    if (it == buildings_.end()) {
      throw out_of_range("unknown Building id");
    }
    cout << "[ElevatorSystemService.getBuilding] found " << id << endl;
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
    cout << "[ElevatorSystemService.createElevator] stored " << obj.id() << endl;
    return obj;
  }

  Elevator getElevator(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = elevators_.find(id);
    if (it == elevators_.end()) {
      throw out_of_range("unknown Elevator id");
    }
    cout << "[ElevatorSystemService.getElevator] found " << id << endl;
    return it->second;
  }

  Floor createFloor(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Floor name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FLO-%04d", seq_++);
    Floor obj{buf, name};
    obj.validate();
    floors_.emplace(obj.id(), obj);
    cout << "[ElevatorSystemService.createFloor] stored " << obj.id() << endl;
    return obj;
  }

  Floor getFloor(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = floors_.find(id);
    if (it == floors_.end()) {
      throw out_of_range("unknown Floor id");
    }
    cout << "[ElevatorSystemService.getFloor] found " << id << endl;
    return it->second;
  }

  ElevatorButton createElevatorButton(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ElevatorButton name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ELE-%04d", seq_++);
    ElevatorButton obj{buf, name};
    obj.validate();
    elevator_buttons_.emplace(obj.id(), obj);
    cout << "[ElevatorSystemService.createElevatorButton] stored " << obj.id() << endl;
    return obj;
  }

  ElevatorButton getElevatorButton(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = elevator_buttons_.find(id);
    if (it == elevator_buttons_.end()) {
      throw out_of_range("unknown ElevatorButton id");
    }
    cout << "[ElevatorSystemService.getElevatorButton] found " << id << endl;
    return it->second;
  }

  FloorButton createFloorButton(const string& name) {
    if (name.empty()) {
      throw invalid_argument("FloorButton name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FLO-%04d", seq_++);
    FloorButton obj{buf, name};
    obj.validate();
    floor_buttons_.emplace(obj.id(), obj);
    cout << "[ElevatorSystemService.createFloorButton] stored " << obj.id() << endl;
    return obj;
  }

  FloorButton getFloorButton(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = floor_buttons_.find(id);
    if (it == floor_buttons_.end()) {
      throw out_of_range("unknown FloorButton id");
    }
    cout << "[ElevatorSystemService.getFloorButton] found " << id << endl;
    return it->second;
  }

  Building closeBuilding(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = buildings_.find(id);
    if (it == buildings_.end()) {
      throw out_of_range("unknown Building");
    }
    cout << "[ElevatorSystemService.closeBuilding] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct ElevatorSystemService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  ElevatorSystemService system;
  cout << "========== STEP 2: Create Building ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createBuilding("alpha-building");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createBuilding("beta-building");
  system.createElevator("sample-elevator");
  system.createFloor("sample-floor");
  system.createElevatorButton("sample-elevator_button");
  system.createFloorButton("sample-floor_button");
  system.closeBuilding(first.id());
  try {
    system.closeBuilding(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getBuilding("MISSING-ID");
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

type Building struct {
  ID     string
  Name   string
  Status string
}

func NewBuilding(id, name string) (*Building, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Building requires id and name")
  }
  obj := &Building{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Building.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Building) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Building invalid status")
  }
  fmt.Printf("[Building.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Building) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Building %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Building.close] id=%s -> CLOSED\\n", o.ID)
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


type Floor struct {
  ID     string
  Name   string
  Status string
}

func NewFloor(id, name string) (*Floor, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Floor requires id and name")
  }
  obj := &Floor{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Floor.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Floor) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Floor invalid status")
  }
  fmt.Printf("[Floor.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Floor) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Floor %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Floor.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type ElevatorButton struct {
  ID     string
  Name   string
  Status string
}

func NewElevatorButton(id, name string) (*ElevatorButton, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ElevatorButton requires id and name")
  }
  obj := &ElevatorButton{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ElevatorButton.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ElevatorButton) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ElevatorButton invalid status")
  }
  fmt.Printf("[ElevatorButton.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ElevatorButton) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ElevatorButton %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ElevatorButton.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type FloorButton struct {
  ID     string
  Name   string
  Status string
}

func NewFloorButton(id, name string) (*FloorButton, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("FloorButton requires id and name")
  }
  obj := &FloorButton{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[FloorButton.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *FloorButton) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("FloorButton invalid status")
  }
  fmt.Printf("[FloorButton.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *FloorButton) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("FloorButton %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[FloorButton.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type ElevatorSystemService struct {
  mu  sync.Mutex
  seq int
  buildings map[string]*Building
  elevators map[string]*Elevator
  floors map[string]*Floor
  elevator_buttons map[string]*ElevatorButton
  floor_buttons map[string]*FloorButton
}

func NewElevatorSystemService() *ElevatorSystemService {
  fmt.Println("[ElevatorSystemService.__init__] system ready")
  return &ElevatorSystemService{
    seq: 1,
    buildings: map[string]*Building{},
    elevators: map[string]*Elevator{},
    floors: map[string]*Floor{},
    elevator_buttons: map[string]*ElevatorButton{},
    floor_buttons: map[string]*FloorButton{},
  }
}

func (s *ElevatorSystemService) CreateBuilding(name string) (*Building, error) {
  if name == "" {
    return nil, fmt.Errorf("Building name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BUI-%04d", s.seq)
  s.seq++
  obj, err := NewBuilding(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.buildings[id] = obj
  fmt.Printf("[ElevatorSystemService.CreateBuilding] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) GetBuilding(id string) (*Building, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.buildings[id]
  if !ok {
    return nil, fmt.Errorf("unknown Building id: %s", id)
  }
  fmt.Printf("[ElevatorSystemService.GetBuilding] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) CreateElevator(name string) (*Elevator, error) {
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
  fmt.Printf("[ElevatorSystemService.CreateElevator] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) GetElevator(id string) (*Elevator, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.elevators[id]
  if !ok {
    return nil, fmt.Errorf("unknown Elevator id: %s", id)
  }
  fmt.Printf("[ElevatorSystemService.GetElevator] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) CreateFloor(name string) (*Floor, error) {
  if name == "" {
    return nil, fmt.Errorf("Floor name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FLO-%04d", s.seq)
  s.seq++
  obj, err := NewFloor(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.floors[id] = obj
  fmt.Printf("[ElevatorSystemService.CreateFloor] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) GetFloor(id string) (*Floor, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.floors[id]
  if !ok {
    return nil, fmt.Errorf("unknown Floor id: %s", id)
  }
  fmt.Printf("[ElevatorSystemService.GetFloor] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) CreateElevatorButton(name string) (*ElevatorButton, error) {
  if name == "" {
    return nil, fmt.Errorf("ElevatorButton name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ELE-%04d", s.seq)
  s.seq++
  obj, err := NewElevatorButton(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.elevator_buttons[id] = obj
  fmt.Printf("[ElevatorSystemService.CreateElevatorButton] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) GetElevatorButton(id string) (*ElevatorButton, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.elevator_buttons[id]
  if !ok {
    return nil, fmt.Errorf("unknown ElevatorButton id: %s", id)
  }
  fmt.Printf("[ElevatorSystemService.GetElevatorButton] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) CreateFloorButton(name string) (*FloorButton, error) {
  if name == "" {
    return nil, fmt.Errorf("FloorButton name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FLO-%04d", s.seq)
  s.seq++
  obj, err := NewFloorButton(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.floor_buttons[id] = obj
  fmt.Printf("[ElevatorSystemService.CreateFloorButton] stored %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) GetFloorButton(id string) (*FloorButton, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.floor_buttons[id]
  if !ok {
    return nil, fmt.Errorf("unknown FloorButton id: %s", id)
  }
  fmt.Printf("[ElevatorSystemService.GetFloorButton] found %s\\n", id)
  return obj, nil
}

func (s *ElevatorSystemService) CloseBuilding(id string) (*Building, error) {
  obj, err := s.GetBuilding(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[ElevatorSystemService.CloseBuilding] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct ElevatorSystemService ==========")
  system := NewElevatorSystemService()
  fmt.Println("========== STEP 2: Create Building ==========")
  first, _ := system.CreateBuilding("alpha-building")
  system.CreateBuilding("beta-building")
  system.CreateElevator("sample-elevator")
  system.CreateFloor("sample-floor")
  system.CreateElevatorButton("sample-elevator_button")
  system.CreateFloorButton("sample-floor_button")
  system.CloseBuilding(first.ID)
  if _, err := system.CloseBuilding(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetBuilding("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Building {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Building(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Building requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Building.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Building invalid status");
    }
    Console.WriteLine("[Building.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Building " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Building.close] id=" + Id + " -> CLOSED");
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


sealed class Floor {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Floor(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Floor requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Floor.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Floor invalid status");
    }
    Console.WriteLine("[Floor.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Floor " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Floor.close] id=" + Id + " -> CLOSED");
  }
}


sealed class ElevatorButton {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ElevatorButton(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ElevatorButton requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ElevatorButton.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ElevatorButton invalid status");
    }
    Console.WriteLine("[ElevatorButton.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ElevatorButton " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ElevatorButton.close] id=" + Id + " -> CLOSED");
  }
}


sealed class FloorButton {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public FloorButton(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FloorButton requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[FloorButton.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("FloorButton invalid status");
    }
    Console.WriteLine("[FloorButton.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("FloorButton " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[FloorButton.close] id=" + Id + " -> CLOSED");
  }
}

sealed class ElevatorSystemService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Building> _buildings = new();
  private readonly Dictionary<string, Elevator> _elevators = new();
  private readonly Dictionary<string, Floor> _floors = new();
  private readonly Dictionary<string, ElevatorButton> _elevator_buttons = new();
  private readonly Dictionary<string, FloorButton> _floor_buttons = new();
  public ElevatorSystemService() {
    Console.WriteLine("[ElevatorSystemService.__init__] system ready");
  }

  public Building CreateBuilding(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Building name required");
    }
    lock (_gate) {
      var id = string.Format("BUI-{0:D4}", _seq++);
      var obj = new Building(id, name.Trim());
      obj.Validate();
      _buildings[id] = obj;
      Console.WriteLine("[ElevatorSystemService.CreateBuilding] stored " + id);
      return obj;
    }
  }

  public Building GetBuilding(string id) {
    lock (_gate) {
      if (!_buildings.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Building id: " + id);
      }
      Console.WriteLine("[ElevatorSystemService.GetBuilding] found " + id);
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
      Console.WriteLine("[ElevatorSystemService.CreateElevator] stored " + id);
      return obj;
    }
  }

  public Elevator GetElevator(string id) {
    lock (_gate) {
      if (!_elevators.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Elevator id: " + id);
      }
      Console.WriteLine("[ElevatorSystemService.GetElevator] found " + id);
      return obj;
    }
  }

  public Floor CreateFloor(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Floor name required");
    }
    lock (_gate) {
      var id = string.Format("FLO-{0:D4}", _seq++);
      var obj = new Floor(id, name.Trim());
      obj.Validate();
      _floors[id] = obj;
      Console.WriteLine("[ElevatorSystemService.CreateFloor] stored " + id);
      return obj;
    }
  }

  public Floor GetFloor(string id) {
    lock (_gate) {
      if (!_floors.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Floor id: " + id);
      }
      Console.WriteLine("[ElevatorSystemService.GetFloor] found " + id);
      return obj;
    }
  }

  public ElevatorButton CreateElevatorButton(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ElevatorButton name required");
    }
    lock (_gate) {
      var id = string.Format("ELE-{0:D4}", _seq++);
      var obj = new ElevatorButton(id, name.Trim());
      obj.Validate();
      _elevator_buttons[id] = obj;
      Console.WriteLine("[ElevatorSystemService.CreateElevatorButton] stored " + id);
      return obj;
    }
  }

  public ElevatorButton GetElevatorButton(string id) {
    lock (_gate) {
      if (!_elevator_buttons.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ElevatorButton id: " + id);
      }
      Console.WriteLine("[ElevatorSystemService.GetElevatorButton] found " + id);
      return obj;
    }
  }

  public FloorButton CreateFloorButton(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FloorButton name required");
    }
    lock (_gate) {
      var id = string.Format("FLO-{0:D4}", _seq++);
      var obj = new FloorButton(id, name.Trim());
      obj.Validate();
      _floor_buttons[id] = obj;
      Console.WriteLine("[ElevatorSystemService.CreateFloorButton] stored " + id);
      return obj;
    }
  }

  public FloorButton GetFloorButton(string id) {
    lock (_gate) {
      if (!_floor_buttons.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown FloorButton id: " + id);
      }
      Console.WriteLine("[ElevatorSystemService.GetFloorButton] found " + id);
      return obj;
    }
  }

  public Building CloseBuilding(string id) {
    var obj = GetBuilding(id);
    Console.WriteLine("[ElevatorSystemService.CloseBuilding] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct ElevatorSystemService ==========");
    var system = new ElevatorSystemService();
    Console.WriteLine("========== STEP 2: Create Building ==========");
    var first = system.CreateBuilding("alpha-building");
    system.CreateBuilding("beta-building");
    system.CreateElevator("sample-elevator");
    system.CreateFloor("sample-floor");
    system.CreateElevatorButton("sample-elevator_button");
    system.CreateFloorButton("sample-floor_button");
    system.CloseBuilding(first.Id);
    try {
      system.CloseBuilding(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetBuilding("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const elevatorSystemSolution: ProblemSolution = {
  slug: 'elevator-system',
  title: 'Elevator System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an elevator system for a multi-floor building that efficiently dispatches elevators based on requests. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Users press up/down buttons on each floor',
      'Dispatch the optimal elevator to serve the request',
      'Elevator serves all stops in its current direction before reversing',
      'Handle emergency stop and door open/close',
      'Display current floor and direction on each elevator',
      'Support multiple elevators in the building',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Users press up/down buttons on each floor?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Dispatch the optimal elevator to serve the request?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Elevator serves all stops in its current direction before reversing?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Handle emergency stop and door open/close?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Display current floor and direction on each elevator?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. ElevatorSystemService is the facade stereotype. Building, Elevator, Floor, ElevatorButton, FloorButton are concrete domain classes with id/name/status and validate/close.',
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
          'Construct ElevatorSystemService.',
          'createBuilding twice and create the related UML classes.',
          'closeBuilding once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'ElevatorSystemService', responsibility: 'UML facade - orchestrates Elevator System.', keyMembers: ['create*', 'get*', 'closeBuilding'] },
    { name: 'Building', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Elevator', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Floor', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ElevatorButton', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'FloorButton', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from ElevatorSystemService to Building, Elevator, Floor, ElevatorButton, FloorButton. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on ElevatorSystemService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'ElevatorSystemService', responsibility: 'UML facade - orchestrates Elevator System.', keyMembers: ['create*', 'get*', 'closeBuilding'] },
    { name: 'Building', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Elevator', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Floor', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ElevatorButton', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'FloorButton', responsibility: 'UML class - domain object for Elevator System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'ElevatorSystemService exposes create/get/close and owns composed collections.' },
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
      'main constructs ElevatorSystemService, creates UML domain objects, closes the primary Building, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct ElevatorSystemService.',
      'createBuilding for alpha and beta.',
      'create remaining UML classes.',
      'closeBuilding(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createBuilding("alpha..."); closeBuilding(id)',
        output: '[Building.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeBuilding(alreadyClosed) or getBuilding("MISSING-ID")',
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
