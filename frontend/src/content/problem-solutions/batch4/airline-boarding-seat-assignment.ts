import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'AirlineBoardingSeatAssignmentService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_flights', 'Map<string, Flight>'),
    attr('-', '_seat_maps', 'Map<string, SeatMap>'),
    attr('-', '_seats', 'Map<string, Seat>'),
    attr('-', '_statuss', 'Map<string, status>'),
    attr('-', '_passengers', 'Map<string, Passenger>'),
  ], [
    method('+', 'createFlight', 'name: string', 'Flight'),
    method('+', 'createSeatMap', 'name: string', 'SeatMap'),
    method('+', 'createSeat', 'name: string', 'Seat'),
    method('+', 'createstatus', 'name: string', 'status'),
    method('+', 'createPassenger', 'name: string', 'Passenger'),
    method('+', 'getFlight', 'id: string', 'Flight'),
    method('+', 'getSeatMap', 'id: string', 'SeatMap'),
    method('+', 'getSeat', 'id: string', 'Seat'),
    method('+', 'getstatus', 'id: string', 'status'),
    method('+', 'getPassenger', 'id: string', 'Passenger'),
    method('+', 'closeFlight', 'id: string', 'Flight'),
  ], 'facade'),
  cls('n1', 'Flight', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'SeatMap', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Seat', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'status', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Passenger', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("airline-boarding-seat-assignment")


class Flight:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Flight.id is required")
        if not name or not name.strip():
            raise ValueError("Flight.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Flight.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Flight {self.id} has invalid status={self.status}")
        log.info("[Flight.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Flight {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Flight.close] id=%s -> CLOSED", self.id)


class SeatMap:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("SeatMap.id is required")
        if not name or not name.strip():
            raise ValueError("SeatMap.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[SeatMap.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"SeatMap {self.id} has invalid status={self.status}")
        log.info("[SeatMap.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"SeatMap {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[SeatMap.close] id=%s -> CLOSED", self.id)


class Seat:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Seat.id is required")
        if not name or not name.strip():
            raise ValueError("Seat.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Seat.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Seat {self.id} has invalid status={self.status}")
        log.info("[Seat.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Seat {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Seat.close] id=%s -> CLOSED", self.id)


class status:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("status.id is required")
        if not name or not name.strip():
            raise ValueError("status.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[status.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"status {self.id} has invalid status={self.status}")
        log.info("[status.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"status {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[status.close] id=%s -> CLOSED", self.id)


class Passenger:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Passenger.id is required")
        if not name or not name.strip():
            raise ValueError("Passenger.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Passenger.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Passenger {self.id} has invalid status={self.status}")
        log.info("[Passenger.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Passenger {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Passenger.close] id=%s -> CLOSED", self.id)


class AirlineBoardingSeatAssignmentService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._flights: Dict[str, Flight] = {}
        self._seat_maps: Dict[str, SeatMap] = {}
        self._seats: Dict[str, Seat] = {}
        self._statuss: Dict[str, status] = {}
        self._passengers: Dict[str, Passenger] = {}
        log.info("[AirlineBoardingSeatAssignmentService.__init__] system ready; managing: Flight, SeatMap, Seat, status, Passenger")

    def create_flight(self, name: str) -> Flight:
        """UML: AirlineBoardingSeatAssignmentService.create_flight(name) -> Flight"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Flight name is required")
        with self._lock:
            item_id = f"FLI-{self._seq:04d}"
            self._seq += 1
            obj = Flight(item_id, cleaned)
            obj.validate()
            self._flights[item_id] = obj
            log.info("[AirlineBoardingSeatAssignmentService.create_flight] stored %s in _flights (count=%s)", item_id, len(self._flights))
            return obj

    def get_flight(self, item_id: str) -> Flight:
        with self._lock:
            obj = self._flights.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Flight id: {item_id}")
            log.info("[AirlineBoardingSeatAssignmentService.get_flight] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_seat_map(self, name: str) -> SeatMap:
        """UML: AirlineBoardingSeatAssignmentService.create_seat_map(name) -> SeatMap"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("SeatMap name is required")
        with self._lock:
            item_id = f"SEA-{self._seq:04d}"
            self._seq += 1
            obj = SeatMap(item_id, cleaned)
            obj.validate()
            self._seat_maps[item_id] = obj
            log.info("[AirlineBoardingSeatAssignmentService.create_seat_map] stored %s in _seat_maps (count=%s)", item_id, len(self._seat_maps))
            return obj

    def get_seat_map(self, item_id: str) -> SeatMap:
        with self._lock:
            obj = self._seat_maps.get(item_id)
            if obj is None:
                raise KeyError(f"unknown SeatMap id: {item_id}")
            log.info("[AirlineBoardingSeatAssignmentService.get_seat_map] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_seat(self, name: str) -> Seat:
        """UML: AirlineBoardingSeatAssignmentService.create_seat(name) -> Seat"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Seat name is required")
        with self._lock:
            item_id = f"SEA-{self._seq:04d}"
            self._seq += 1
            obj = Seat(item_id, cleaned)
            obj.validate()
            self._seats[item_id] = obj
            log.info("[AirlineBoardingSeatAssignmentService.create_seat] stored %s in _seats (count=%s)", item_id, len(self._seats))
            return obj

    def get_seat(self, item_id: str) -> Seat:
        with self._lock:
            obj = self._seats.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Seat id: {item_id}")
            log.info("[AirlineBoardingSeatAssignmentService.get_seat] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_status(self, name: str) -> status:
        """UML: AirlineBoardingSeatAssignmentService.create_status(name) -> status"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("status name is required")
        with self._lock:
            item_id = f"STA-{self._seq:04d}"
            self._seq += 1
            obj = status(item_id, cleaned)
            obj.validate()
            self._statuss[item_id] = obj
            log.info("[AirlineBoardingSeatAssignmentService.create_status] stored %s in _statuss (count=%s)", item_id, len(self._statuss))
            return obj

    def get_status(self, item_id: str) -> status:
        with self._lock:
            obj = self._statuss.get(item_id)
            if obj is None:
                raise KeyError(f"unknown status id: {item_id}")
            log.info("[AirlineBoardingSeatAssignmentService.get_status] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_passenger(self, name: str) -> Passenger:
        """UML: AirlineBoardingSeatAssignmentService.create_passenger(name) -> Passenger"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Passenger name is required")
        with self._lock:
            item_id = f"PAS-{self._seq:04d}"
            self._seq += 1
            obj = Passenger(item_id, cleaned)
            obj.validate()
            self._passengers[item_id] = obj
            log.info("[AirlineBoardingSeatAssignmentService.create_passenger] stored %s in _passengers (count=%s)", item_id, len(self._passengers))
            return obj

    def get_passenger(self, item_id: str) -> Passenger:
        with self._lock:
            obj = self._passengers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Passenger id: {item_id}")
            log.info("[AirlineBoardingSeatAssignmentService.get_passenger] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_flight(self, item_id: str) -> Flight:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._flights.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Flight id: {item_id}")
            log.info("[AirlineBoardingSeatAssignmentService.close_flight] closing %s via Flight.close()", item_id)
            obj.close()
            return obj

    def list_active_flights(self) -> List[Flight]:
        with self._lock:
            active = [o for o in self._flights.values() if o.status == "ACTIVE"]
            log.info("[AirlineBoardingSeatAssignmentService.list_active_flights] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct AirlineBoardingSeatAssignmentService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = AirlineBoardingSeatAssignmentService()

    log.info("========== STEP 2: Create primary Flight objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_flight("alpha-flight")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_flight("beta-flight")

    log.info("========== STEP 3: Create SeatMap (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_seat_map("sample-seat_map")

    log.info("========== STEP 4: Create Seat (UML class) ==========")
    system.create_seat("sample-seat")

    log.info("========== STEP 5: Create status (UML class) ==========")
    system.create_status("sample-status")

    log.info("========== STEP 6: Create Passenger (UML class) ==========")
    system.create_passenger("sample-passenger")

    log.info("========== STEP 7: Inspect active Flight list ==========")
    system.list_active_flights()

    log.info("========== STEP 8: Close first Flight ==========")
    system.close_flight(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_flight(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Flight.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_flight("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_flight: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_flights()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Flight {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Flight(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Flight.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Flight.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Flight.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Flight " + id + " invalid status");
    }
    System.out.println("[Flight.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Flight " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Flight.close] id=" + id + " -> CLOSED");
  }
}


class SeatMap {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  SeatMap(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("SeatMap.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("SeatMap.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[SeatMap.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("SeatMap " + id + " invalid status");
    }
    System.out.println("[SeatMap.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("SeatMap " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[SeatMap.close] id=" + id + " -> CLOSED");
  }
}


class Seat {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Seat(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Seat.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Seat.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Seat.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Seat " + id + " invalid status");
    }
    System.out.println("[Seat.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Seat " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Seat.close] id=" + id + " -> CLOSED");
  }
}


class status {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  status(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("status.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("status.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[status.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("status " + id + " invalid status");
    }
    System.out.println("[status.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("status " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[status.close] id=" + id + " -> CLOSED");
  }
}


class Passenger {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Passenger(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Passenger.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Passenger.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Passenger.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Passenger " + id + " invalid status");
    }
    System.out.println("[Passenger.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Passenger " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Passenger.close] id=" + id + " -> CLOSED");
  }
}

public class AirlineBoardingSeatAssignmentService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Flight> flights = new LinkedHashMap<>();
  private final Map<String, SeatMap> seat_maps = new LinkedHashMap<>();
  private final Map<String, Seat> seats = new LinkedHashMap<>();
  private final Map<String, status> statuss = new LinkedHashMap<>();
  private final Map<String, Passenger> passengers = new LinkedHashMap<>();

  public AirlineBoardingSeatAssignmentService() {
    System.out.println("[AirlineBoardingSeatAssignmentService.__init__] system ready");
  }

  public Flight createFlight(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Flight name required");
    }
    lock.lock();
    try {
      String id = String.format("FLI-%04d", seq++);
      Flight obj = new Flight(id, name.trim());
      obj.validate();
      flights.put(id, obj);
      System.out.println("[AirlineBoardingSeatAssignmentService.createFlight] stored " + id + " count=" + flights.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Flight getFlight(String id) {
    lock.lock();
    try {
      Flight obj = flights.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Flight id: " + id);
      }
      System.out.println("[AirlineBoardingSeatAssignmentService.getFlight] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public SeatMap createSeatMap(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("SeatMap name required");
    }
    lock.lock();
    try {
      String id = String.format("SEA-%04d", seq++);
      SeatMap obj = new SeatMap(id, name.trim());
      obj.validate();
      seat_maps.put(id, obj);
      System.out.println("[AirlineBoardingSeatAssignmentService.createSeatMap] stored " + id + " count=" + seat_maps.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public SeatMap getSeatMap(String id) {
    lock.lock();
    try {
      SeatMap obj = seat_maps.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown SeatMap id: " + id);
      }
      System.out.println("[AirlineBoardingSeatAssignmentService.getSeatMap] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Seat createSeat(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Seat name required");
    }
    lock.lock();
    try {
      String id = String.format("SEA-%04d", seq++);
      Seat obj = new Seat(id, name.trim());
      obj.validate();
      seats.put(id, obj);
      System.out.println("[AirlineBoardingSeatAssignmentService.createSeat] stored " + id + " count=" + seats.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Seat getSeat(String id) {
    lock.lock();
    try {
      Seat obj = seats.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Seat id: " + id);
      }
      System.out.println("[AirlineBoardingSeatAssignmentService.getSeat] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public status createstatus(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("status name required");
    }
    lock.lock();
    try {
      String id = String.format("STA-%04d", seq++);
      status obj = new status(id, name.trim());
      obj.validate();
      statuss.put(id, obj);
      System.out.println("[AirlineBoardingSeatAssignmentService.createstatus] stored " + id + " count=" + statuss.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public status getstatus(String id) {
    lock.lock();
    try {
      status obj = statuss.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown status id: " + id);
      }
      System.out.println("[AirlineBoardingSeatAssignmentService.getstatus] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Passenger createPassenger(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Passenger name required");
    }
    lock.lock();
    try {
      String id = String.format("PAS-%04d", seq++);
      Passenger obj = new Passenger(id, name.trim());
      obj.validate();
      passengers.put(id, obj);
      System.out.println("[AirlineBoardingSeatAssignmentService.createPassenger] stored " + id + " count=" + passengers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Passenger getPassenger(String id) {
    lock.lock();
    try {
      Passenger obj = passengers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Passenger id: " + id);
      }
      System.out.println("[AirlineBoardingSeatAssignmentService.getPassenger] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Flight closeFlight(String id) {
    lock.lock();
    try {
      Flight obj = flights.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Flight id: " + id);
      }
      System.out.println("[AirlineBoardingSeatAssignmentService.closeFlight] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Flight> listActiveFlights() {
    lock.lock();
    try {
      List<Flight> out = new ArrayList<>();
      for (Flight o : flights.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[AirlineBoardingSeatAssignmentService.listActiveFlights] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct AirlineBoardingSeatAssignmentService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    AirlineBoardingSeatAssignmentService system = new AirlineBoardingSeatAssignmentService();
    System.out.println("========== STEP 2: Create Flight objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Flight first = system.createFlight("alpha-flight");
    system.createFlight("beta-flight");
    System.out.println("========== STEP 3: Create SeatMap ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createSeatMap("sample-seat_map");
    System.out.println("========== STEP 4: Create Seat ==========");
    system.createSeat("sample-seat");
    System.out.println("========== STEP 5: Create status ==========");
    system.createstatus("sample-status");
    System.out.println("========== STEP 6: Create Passenger ==========");
    system.createPassenger("sample-passenger");
    System.out.println("========== Inspect active list ==========");
    system.listActiveFlights();
    System.out.println("========== Close first Flight ==========");
    system.closeFlight(first.getId());
    try {
      system.closeFlight(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getFlight("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Flight {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Flight.id required')
    }

    if (!name?.trim()) {
      throw new Error('Flight.name required')
    }
    console.log(\`[Flight.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Flight \${this.id} invalid status\`)
    }
    console.log(\`[Flight.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Flight \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Flight.close] id=\${this.id} -> CLOSED\`)
  }
}


class SeatMap {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('SeatMap.id required')
    }

    if (!name?.trim()) {
      throw new Error('SeatMap.name required')
    }
    console.log(\`[SeatMap.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`SeatMap \${this.id} invalid status\`)
    }
    console.log(\`[SeatMap.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`SeatMap \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[SeatMap.close] id=\${this.id} -> CLOSED\`)
  }
}


class Seat {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Seat.id required')
    }

    if (!name?.trim()) {
      throw new Error('Seat.name required')
    }
    console.log(\`[Seat.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Seat \${this.id} invalid status\`)
    }
    console.log(\`[Seat.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Seat \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Seat.close] id=\${this.id} -> CLOSED\`)
  }
}


class status {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('status.id required')
    }

    if (!name?.trim()) {
      throw new Error('status.name required')
    }
    console.log(\`[status.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`status \${this.id} invalid status\`)
    }
    console.log(\`[status.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`status \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[status.close] id=\${this.id} -> CLOSED\`)
  }
}


class Passenger {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Passenger.id required')
    }

    if (!name?.trim()) {
      throw new Error('Passenger.name required')
    }
    console.log(\`[Passenger.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Passenger \${this.id} invalid status\`)
    }
    console.log(\`[Passenger.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Passenger \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Passenger.close] id=\${this.id} -> CLOSED\`)
  }
}

class AirlineBoardingSeatAssignmentService {
  private seq = 1
  private flights = new Map<string, Flight>()
  private seat_maps = new Map<string, SeatMap>()
  private seats = new Map<string, Seat>()
  private statuss = new Map<string, status>()
  private passengers = new Map<string, Passenger>()
  constructor() {
    console.log('[AirlineBoardingSeatAssignmentService.__init__] system ready')
  }

  createFlight(name: string): Flight {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Flight name required')
    }
    const id = \`FLI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Flight(id, cleaned)
    obj.validate()
    this.flights.set(id, obj)
    console.log(\`[AirlineBoardingSeatAssignmentService.createFlight] stored \${id} count=\${this.flights.size}\`)
    return obj
  }

  getFlight(id: string): Flight {
    const obj = this.flights.get(id)
    if (!obj) {
      throw new Error(\`unknown Flight id: \${id}\`)
    }
    console.log(\`[AirlineBoardingSeatAssignmentService.getFlight] found id=\${obj.id}\`)
    return obj
  }

  createSeatMap(name: string): SeatMap {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('SeatMap name required')
    }
    const id = \`SEA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new SeatMap(id, cleaned)
    obj.validate()
    this.seat_maps.set(id, obj)
    console.log(\`[AirlineBoardingSeatAssignmentService.createSeatMap] stored \${id} count=\${this.seat_maps.size}\`)
    return obj
  }

  getSeatMap(id: string): SeatMap {
    const obj = this.seat_maps.get(id)
    if (!obj) {
      throw new Error(\`unknown SeatMap id: \${id}\`)
    }
    console.log(\`[AirlineBoardingSeatAssignmentService.getSeatMap] found id=\${obj.id}\`)
    return obj
  }

  createSeat(name: string): Seat {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Seat name required')
    }
    const id = \`SEA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Seat(id, cleaned)
    obj.validate()
    this.seats.set(id, obj)
    console.log(\`[AirlineBoardingSeatAssignmentService.createSeat] stored \${id} count=\${this.seats.size}\`)
    return obj
  }

  getSeat(id: string): Seat {
    const obj = this.seats.get(id)
    if (!obj) {
      throw new Error(\`unknown Seat id: \${id}\`)
    }
    console.log(\`[AirlineBoardingSeatAssignmentService.getSeat] found id=\${obj.id}\`)
    return obj
  }

  createstatus(name: string): status {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('status name required')
    }
    const id = \`STA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new status(id, cleaned)
    obj.validate()
    this.statuss.set(id, obj)
    console.log(\`[AirlineBoardingSeatAssignmentService.createstatus] stored \${id} count=\${this.statuss.size}\`)
    return obj
  }

  getstatus(id: string): status {
    const obj = this.statuss.get(id)
    if (!obj) {
      throw new Error(\`unknown status id: \${id}\`)
    }
    console.log(\`[AirlineBoardingSeatAssignmentService.getstatus] found id=\${obj.id}\`)
    return obj
  }

  createPassenger(name: string): Passenger {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Passenger name required')
    }
    const id = \`PAS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Passenger(id, cleaned)
    obj.validate()
    this.passengers.set(id, obj)
    console.log(\`[AirlineBoardingSeatAssignmentService.createPassenger] stored \${id} count=\${this.passengers.size}\`)
    return obj
  }

  getPassenger(id: string): Passenger {
    const obj = this.passengers.get(id)
    if (!obj) {
      throw new Error(\`unknown Passenger id: \${id}\`)
    }
    console.log(\`[AirlineBoardingSeatAssignmentService.getPassenger] found id=\${obj.id}\`)
    return obj
  }

  closeFlight(id: string): Flight {
    const obj = this.getFlight(id)
    console.log(\`[AirlineBoardingSeatAssignmentService.closeFlight] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveFlights(): Flight[] {
    const active = [...this.flights.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[AirlineBoardingSeatAssignmentService.listActiveFlights] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct AirlineBoardingSeatAssignmentService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new AirlineBoardingSeatAssignmentService()
  console.log('========== STEP 2: Create Flight objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createFlight('alpha-flight')
  system.createFlight('beta-flight')
  console.log('========== STEP 3: Create SeatMap ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createSeatMap('sample-seat_map')
  console.log('========== STEP 4: Create Seat ==========')
  system.createSeat('sample-seat')
  console.log('========== STEP 5: Create status ==========')
  system.createstatus('sample-status')
  console.log('========== STEP 6: Create Passenger ==========')
  system.createPassenger('sample-passenger')
  system.listActiveFlights()
  console.log('========== Close first Flight ==========')
  system.closeFlight(first.id)
  try {
    system.closeFlight(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getFlight('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Flight {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Flight(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Flight requires id and name");
    }
    cout << "[Flight.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Flight invalid status");
    }
    cout << "[Flight.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Flight cannot close");
    }
    status_ = "CLOSED";
    cout << "[Flight.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class SeatMap {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  SeatMap(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("SeatMap requires id and name");
    }
    cout << "[SeatMap.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("SeatMap invalid status");
    }
    cout << "[SeatMap.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("SeatMap cannot close");
    }
    status_ = "CLOSED";
    cout << "[SeatMap.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Seat {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Seat(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Seat requires id and name");
    }
    cout << "[Seat.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Seat invalid status");
    }
    cout << "[Seat.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Seat cannot close");
    }
    status_ = "CLOSED";
    cout << "[Seat.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class status {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  status(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("status requires id and name");
    }
    cout << "[status.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("status invalid status");
    }
    cout << "[status.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("status cannot close");
    }
    status_ = "CLOSED";
    cout << "[status.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Passenger {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Passenger(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Passenger requires id and name");
    }
    cout << "[Passenger.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Passenger invalid status");
    }
    cout << "[Passenger.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Passenger cannot close");
    }
    status_ = "CLOSED";
    cout << "[Passenger.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class AirlineBoardingSeatAssignmentService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Flight> flights_;
  unordered_map<string, SeatMap> seat_maps_;
  unordered_map<string, Seat> seats_;
  unordered_map<string, status> statuss_;
  unordered_map<string, Passenger> passengers_;
public:
  AirlineBoardingSeatAssignmentService() {
    cout << "[AirlineBoardingSeatAssignmentService.__init__] system ready" << endl;
  }

  Flight createFlight(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Flight name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FLI-%04d", seq_++);
    Flight obj{buf, name};
    obj.validate();
    flights_.emplace(obj.id(), obj);
    cout << "[AirlineBoardingSeatAssignmentService.createFlight] stored " << obj.id() << endl;
    return obj;
  }

  Flight getFlight(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = flights_.find(id);
    if (it == flights_.end()) {
      throw out_of_range("unknown Flight id");
    }
    cout << "[AirlineBoardingSeatAssignmentService.getFlight] found " << id << endl;
    return it->second;
  }

  SeatMap createSeatMap(const string& name) {
    if (name.empty()) {
      throw invalid_argument("SeatMap name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SEA-%04d", seq_++);
    SeatMap obj{buf, name};
    obj.validate();
    seat_maps_.emplace(obj.id(), obj);
    cout << "[AirlineBoardingSeatAssignmentService.createSeatMap] stored " << obj.id() << endl;
    return obj;
  }

  SeatMap getSeatMap(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = seat_maps_.find(id);
    if (it == seat_maps_.end()) {
      throw out_of_range("unknown SeatMap id");
    }
    cout << "[AirlineBoardingSeatAssignmentService.getSeatMap] found " << id << endl;
    return it->second;
  }

  Seat createSeat(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Seat name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SEA-%04d", seq_++);
    Seat obj{buf, name};
    obj.validate();
    seats_.emplace(obj.id(), obj);
    cout << "[AirlineBoardingSeatAssignmentService.createSeat] stored " << obj.id() << endl;
    return obj;
  }

  Seat getSeat(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = seats_.find(id);
    if (it == seats_.end()) {
      throw out_of_range("unknown Seat id");
    }
    cout << "[AirlineBoardingSeatAssignmentService.getSeat] found " << id << endl;
    return it->second;
  }

  status createstatus(const string& name) {
    if (name.empty()) {
      throw invalid_argument("status name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "STA-%04d", seq_++);
    status obj{buf, name};
    obj.validate();
    statuss_.emplace(obj.id(), obj);
    cout << "[AirlineBoardingSeatAssignmentService.createstatus] stored " << obj.id() << endl;
    return obj;
  }

  status getstatus(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = statuss_.find(id);
    if (it == statuss_.end()) {
      throw out_of_range("unknown status id");
    }
    cout << "[AirlineBoardingSeatAssignmentService.getstatus] found " << id << endl;
    return it->second;
  }

  Passenger createPassenger(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Passenger name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PAS-%04d", seq_++);
    Passenger obj{buf, name};
    obj.validate();
    passengers_.emplace(obj.id(), obj);
    cout << "[AirlineBoardingSeatAssignmentService.createPassenger] stored " << obj.id() << endl;
    return obj;
  }

  Passenger getPassenger(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = passengers_.find(id);
    if (it == passengers_.end()) {
      throw out_of_range("unknown Passenger id");
    }
    cout << "[AirlineBoardingSeatAssignmentService.getPassenger] found " << id << endl;
    return it->second;
  }

  Flight closeFlight(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = flights_.find(id);
    if (it == flights_.end()) {
      throw out_of_range("unknown Flight");
    }
    cout << "[AirlineBoardingSeatAssignmentService.closeFlight] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct AirlineBoardingSeatAssignmentService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  AirlineBoardingSeatAssignmentService system;
  cout << "========== STEP 2: Create Flight ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createFlight("alpha-flight");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createFlight("beta-flight");
  system.createSeatMap("sample-seat_map");
  system.createSeat("sample-seat");
  system.createstatus("sample-status");
  system.createPassenger("sample-passenger");
  system.closeFlight(first.id());
  try {
    system.closeFlight(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getFlight("MISSING-ID");
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

type Flight struct {
  ID     string
  Name   string
  Status string
}

func NewFlight(id, name string) (*Flight, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Flight requires id and name")
  }
  obj := &Flight{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Flight.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Flight) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Flight invalid status")
  }
  fmt.Printf("[Flight.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Flight) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Flight %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Flight.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type SeatMap struct {
  ID     string
  Name   string
  Status string
}

func NewSeatMap(id, name string) (*SeatMap, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("SeatMap requires id and name")
  }
  obj := &SeatMap{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[SeatMap.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *SeatMap) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("SeatMap invalid status")
  }
  fmt.Printf("[SeatMap.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *SeatMap) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("SeatMap %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[SeatMap.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Seat struct {
  ID     string
  Name   string
  Status string
}

func NewSeat(id, name string) (*Seat, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Seat requires id and name")
  }
  obj := &Seat{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Seat.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Seat) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Seat invalid status")
  }
  fmt.Printf("[Seat.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Seat) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Seat %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Seat.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type status struct {
  ID     string
  Name   string
  Status string
}

func Newstatus(id, name string) (*status, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("status requires id and name")
  }
  obj := &status{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[status.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *status) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("status invalid status")
  }
  fmt.Printf("[status.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *status) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("status %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[status.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Passenger struct {
  ID     string
  Name   string
  Status string
}

func NewPassenger(id, name string) (*Passenger, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Passenger requires id and name")
  }
  obj := &Passenger{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Passenger.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Passenger) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Passenger invalid status")
  }
  fmt.Printf("[Passenger.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Passenger) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Passenger %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Passenger.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type AirlineBoardingSeatAssignmentService struct {
  mu  sync.Mutex
  seq int
  flights map[string]*Flight
  seat_maps map[string]*SeatMap
  seats map[string]*Seat
  statuss map[string]*status
  passengers map[string]*Passenger
}

func NewAirlineBoardingSeatAssignmentService() *AirlineBoardingSeatAssignmentService {
  fmt.Println("[AirlineBoardingSeatAssignmentService.__init__] system ready")
  return &AirlineBoardingSeatAssignmentService{
    seq: 1,
    flights: map[string]*Flight{},
    seat_maps: map[string]*SeatMap{},
    seats: map[string]*Seat{},
    statuss: map[string]*status{},
    passengers: map[string]*Passenger{},
  }
}

func (s *AirlineBoardingSeatAssignmentService) CreateFlight(name string) (*Flight, error) {
  if name == "" {
    return nil, fmt.Errorf("Flight name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FLI-%04d", s.seq)
  s.seq++
  obj, err := NewFlight(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.flights[id] = obj
  fmt.Printf("[AirlineBoardingSeatAssignmentService.CreateFlight] stored %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) GetFlight(id string) (*Flight, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.flights[id]
  if !ok {
    return nil, fmt.Errorf("unknown Flight id: %s", id)
  }
  fmt.Printf("[AirlineBoardingSeatAssignmentService.GetFlight] found %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) CreateSeatMap(name string) (*SeatMap, error) {
  if name == "" {
    return nil, fmt.Errorf("SeatMap name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SEA-%04d", s.seq)
  s.seq++
  obj, err := NewSeatMap(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.seat_maps[id] = obj
  fmt.Printf("[AirlineBoardingSeatAssignmentService.CreateSeatMap] stored %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) GetSeatMap(id string) (*SeatMap, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.seat_maps[id]
  if !ok {
    return nil, fmt.Errorf("unknown SeatMap id: %s", id)
  }
  fmt.Printf("[AirlineBoardingSeatAssignmentService.GetSeatMap] found %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) CreateSeat(name string) (*Seat, error) {
  if name == "" {
    return nil, fmt.Errorf("Seat name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SEA-%04d", s.seq)
  s.seq++
  obj, err := NewSeat(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.seats[id] = obj
  fmt.Printf("[AirlineBoardingSeatAssignmentService.CreateSeat] stored %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) GetSeat(id string) (*Seat, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.seats[id]
  if !ok {
    return nil, fmt.Errorf("unknown Seat id: %s", id)
  }
  fmt.Printf("[AirlineBoardingSeatAssignmentService.GetSeat] found %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) Createstatus(name string) (*status, error) {
  if name == "" {
    return nil, fmt.Errorf("status name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("STA-%04d", s.seq)
  s.seq++
  obj, err := Newstatus(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.statuss[id] = obj
  fmt.Printf("[AirlineBoardingSeatAssignmentService.Createstatus] stored %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) Getstatus(id string) (*status, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.statuss[id]
  if !ok {
    return nil, fmt.Errorf("unknown status id: %s", id)
  }
  fmt.Printf("[AirlineBoardingSeatAssignmentService.Getstatus] found %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) CreatePassenger(name string) (*Passenger, error) {
  if name == "" {
    return nil, fmt.Errorf("Passenger name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PAS-%04d", s.seq)
  s.seq++
  obj, err := NewPassenger(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.passengers[id] = obj
  fmt.Printf("[AirlineBoardingSeatAssignmentService.CreatePassenger] stored %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) GetPassenger(id string) (*Passenger, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.passengers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Passenger id: %s", id)
  }
  fmt.Printf("[AirlineBoardingSeatAssignmentService.GetPassenger] found %s\\n", id)
  return obj, nil
}

func (s *AirlineBoardingSeatAssignmentService) CloseFlight(id string) (*Flight, error) {
  obj, err := s.GetFlight(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[AirlineBoardingSeatAssignmentService.CloseFlight] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct AirlineBoardingSeatAssignmentService ==========")
  system := NewAirlineBoardingSeatAssignmentService()
  fmt.Println("========== STEP 2: Create Flight ==========")
  first, _ := system.CreateFlight("alpha-flight")
  system.CreateFlight("beta-flight")
  system.CreateSeatMap("sample-seat_map")
  system.CreateSeat("sample-seat")
  system.Createstatus("sample-status")
  system.CreatePassenger("sample-passenger")
  system.CloseFlight(first.ID)
  if _, err := system.CloseFlight(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetFlight("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Flight {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Flight(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Flight requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Flight.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Flight invalid status");
    }
    Console.WriteLine("[Flight.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Flight " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Flight.close] id=" + Id + " -> CLOSED");
  }
}


sealed class SeatMap {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public SeatMap(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("SeatMap requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[SeatMap.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("SeatMap invalid status");
    }
    Console.WriteLine("[SeatMap.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("SeatMap " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[SeatMap.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Seat {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Seat(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Seat requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Seat.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Seat invalid status");
    }
    Console.WriteLine("[Seat.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Seat " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Seat.close] id=" + Id + " -> CLOSED");
  }
}


sealed class status {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public status(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("status requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[status.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("status invalid status");
    }
    Console.WriteLine("[status.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("status " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[status.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Passenger {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Passenger(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Passenger requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Passenger.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Passenger invalid status");
    }
    Console.WriteLine("[Passenger.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Passenger " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Passenger.close] id=" + Id + " -> CLOSED");
  }
}

sealed class AirlineBoardingSeatAssignmentService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Flight> _flights = new();
  private readonly Dictionary<string, SeatMap> _seat_maps = new();
  private readonly Dictionary<string, Seat> _seats = new();
  private readonly Dictionary<string, status> _statuss = new();
  private readonly Dictionary<string, Passenger> _passengers = new();
  public AirlineBoardingSeatAssignmentService() {
    Console.WriteLine("[AirlineBoardingSeatAssignmentService.__init__] system ready");
  }

  public Flight CreateFlight(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Flight name required");
    }
    lock (_gate) {
      var id = string.Format("FLI-{0:D4}", _seq++);
      var obj = new Flight(id, name.Trim());
      obj.Validate();
      _flights[id] = obj;
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.CreateFlight] stored " + id);
      return obj;
    }
  }

  public Flight GetFlight(string id) {
    lock (_gate) {
      if (!_flights.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Flight id: " + id);
      }
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.GetFlight] found " + id);
      return obj;
    }
  }

  public SeatMap CreateSeatMap(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("SeatMap name required");
    }
    lock (_gate) {
      var id = string.Format("SEA-{0:D4}", _seq++);
      var obj = new SeatMap(id, name.Trim());
      obj.Validate();
      _seat_maps[id] = obj;
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.CreateSeatMap] stored " + id);
      return obj;
    }
  }

  public SeatMap GetSeatMap(string id) {
    lock (_gate) {
      if (!_seat_maps.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown SeatMap id: " + id);
      }
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.GetSeatMap] found " + id);
      return obj;
    }
  }

  public Seat CreateSeat(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Seat name required");
    }
    lock (_gate) {
      var id = string.Format("SEA-{0:D4}", _seq++);
      var obj = new Seat(id, name.Trim());
      obj.Validate();
      _seats[id] = obj;
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.CreateSeat] stored " + id);
      return obj;
    }
  }

  public Seat GetSeat(string id) {
    lock (_gate) {
      if (!_seats.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Seat id: " + id);
      }
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.GetSeat] found " + id);
      return obj;
    }
  }

  public status Createstatus(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("status name required");
    }
    lock (_gate) {
      var id = string.Format("STA-{0:D4}", _seq++);
      var obj = new status(id, name.Trim());
      obj.Validate();
      _statuss[id] = obj;
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.Createstatus] stored " + id);
      return obj;
    }
  }

  public status Getstatus(string id) {
    lock (_gate) {
      if (!_statuss.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown status id: " + id);
      }
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.Getstatus] found " + id);
      return obj;
    }
  }

  public Passenger CreatePassenger(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Passenger name required");
    }
    lock (_gate) {
      var id = string.Format("PAS-{0:D4}", _seq++);
      var obj = new Passenger(id, name.Trim());
      obj.Validate();
      _passengers[id] = obj;
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.CreatePassenger] stored " + id);
      return obj;
    }
  }

  public Passenger GetPassenger(string id) {
    lock (_gate) {
      if (!_passengers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Passenger id: " + id);
      }
      Console.WriteLine("[AirlineBoardingSeatAssignmentService.GetPassenger] found " + id);
      return obj;
    }
  }

  public Flight CloseFlight(string id) {
    var obj = GetFlight(id);
    Console.WriteLine("[AirlineBoardingSeatAssignmentService.CloseFlight] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct AirlineBoardingSeatAssignmentService ==========");
    var system = new AirlineBoardingSeatAssignmentService();
    Console.WriteLine("========== STEP 2: Create Flight ==========");
    var first = system.CreateFlight("alpha-flight");
    system.CreateFlight("beta-flight");
    system.CreateSeatMap("sample-seat_map");
    system.CreateSeat("sample-seat");
    system.Createstatus("sample-status");
    system.CreatePassenger("sample-passenger");
    system.CloseFlight(first.Id);
    try {
      system.CloseFlight(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetFlight("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const airlineBoardingSeatAssignmentSolution: ProblemSolution = {
  slug: 'airline-boarding-seat-assignment',
  title: 'Airline Boarding & Seat Assignment System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a system that manages flight seat maps, seat selection, boarding groups, and check-in. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Display a seat map showing available/occupied/blocked seats',
      'Let a passenger select or auto-assign a seat by class',
      'Support seat classes: economy, premium, business, first',
      'Assign boarding groups based on class and check-in time',
      'Handle standby passengers and waitlist promotion',
      'Check in a passenger and issue a boarding pass',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Display a seat map showing available/occupied/blocked seats?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Let a passenger select or auto-assign a seat by class?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support seat classes: economy, premium, business, first?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Assign boarding groups based on class and check-in time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Handle standby passengers and waitlist promotion?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. AirlineBoardingSeatAssignmentService is the facade stereotype. Flight, SeatMap, Seat, status, Passenger are concrete domain classes with id/name/status and validate/close.',
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
          'Construct AirlineBoardingSeatAssignmentService.',
          'createFlight twice and create the related UML classes.',
          'closeFlight once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'AirlineBoardingSeatAssignmentService', responsibility: 'UML facade - orchestrates Airline Boarding & Seat Assignment System.', keyMembers: ['create*', 'get*', 'closeFlight'] },
    { name: 'Flight', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'SeatMap', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Seat', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'status', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Passenger', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from AirlineBoardingSeatAssignmentService to Flight, SeatMap, Seat, status, Passenger. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on AirlineBoardingSeatAssignmentService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'AirlineBoardingSeatAssignmentService', responsibility: 'UML facade - orchestrates Airline Boarding & Seat Assignment System.', keyMembers: ['create*', 'get*', 'closeFlight'] },
    { name: 'Flight', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'SeatMap', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Seat', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'status', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Passenger', responsibility: 'UML class - domain object for Airline Boarding & Seat Assignment System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'AirlineBoardingSeatAssignmentService exposes create/get/close and owns composed collections.' },
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
      'main constructs AirlineBoardingSeatAssignmentService, creates UML domain objects, closes the primary Flight, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct AirlineBoardingSeatAssignmentService.',
      'createFlight for alpha and beta.',
      'create remaining UML classes.',
      'closeFlight(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createFlight("alpha..."); closeFlight(id)',
        output: '[Flight.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeFlight(alreadyClosed) or getFlight("MISSING-ID")',
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
