import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'FlightReservationService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_airports', 'Map<string, Airport>'),
    attr('-', '_flights', 'Map<string, Flight>'),
    attr('-', '_aircrafts', 'Map<string, Aircraft>'),
    attr('-', '_seats', 'Map<string, Seat>'),
    attr('-', '_flight_instances', 'Map<string, FlightInstance>'),
  ], [
    method('+', 'createAirport', 'name: string', 'Airport'),
    method('+', 'createFlight', 'name: string', 'Flight'),
    method('+', 'createAircraft', 'name: string', 'Aircraft'),
    method('+', 'createSeat', 'name: string', 'Seat'),
    method('+', 'createFlightInstance', 'name: string', 'FlightInstance'),
    method('+', 'getAirport', 'id: string', 'Airport'),
    method('+', 'getFlight', 'id: string', 'Flight'),
    method('+', 'getAircraft', 'id: string', 'Aircraft'),
    method('+', 'getSeat', 'id: string', 'Seat'),
    method('+', 'getFlightInstance', 'id: string', 'FlightInstance'),
    method('+', 'closeAirport', 'id: string', 'Airport'),
  ], 'facade'),
  cls('n1', 'Airport', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Flight', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Aircraft', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Seat', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'FlightInstance', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("flight-reservation")


class Airport:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Airport.id is required")
        if not name or not name.strip():
            raise ValueError("Airport.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Airport.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Airport {self.id} has invalid status={self.status}")
        log.info("[Airport.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Airport {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Airport.close] id=%s -> CLOSED", self.id)


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


class Aircraft:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Aircraft.id is required")
        if not name or not name.strip():
            raise ValueError("Aircraft.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Aircraft.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Aircraft {self.id} has invalid status={self.status}")
        log.info("[Aircraft.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Aircraft {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Aircraft.close] id=%s -> CLOSED", self.id)


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


class FlightInstance:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("FlightInstance.id is required")
        if not name or not name.strip():
            raise ValueError("FlightInstance.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[FlightInstance.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"FlightInstance {self.id} has invalid status={self.status}")
        log.info("[FlightInstance.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"FlightInstance {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[FlightInstance.close] id=%s -> CLOSED", self.id)


class FlightReservationService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._airports: Dict[str, Airport] = {}
        self._flights: Dict[str, Flight] = {}
        self._aircrafts: Dict[str, Aircraft] = {}
        self._seats: Dict[str, Seat] = {}
        self._flight_instances: Dict[str, FlightInstance] = {}
        log.info("[FlightReservationService.__init__] system ready; managing: Airport, Flight, Aircraft, Seat, FlightInstance")

    def create_airport(self, name: str) -> Airport:
        """UML: FlightReservationService.create_airport(name) -> Airport"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Airport name is required")
        with self._lock:
            item_id = f"AIR-{self._seq:04d}"
            self._seq += 1
            obj = Airport(item_id, cleaned)
            obj.validate()
            self._airports[item_id] = obj
            log.info("[FlightReservationService.create_airport] stored %s in _airports (count=%s)", item_id, len(self._airports))
            return obj

    def get_airport(self, item_id: str) -> Airport:
        with self._lock:
            obj = self._airports.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Airport id: {item_id}")
            log.info("[FlightReservationService.get_airport] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_flight(self, name: str) -> Flight:
        """UML: FlightReservationService.create_flight(name) -> Flight"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Flight name is required")
        with self._lock:
            item_id = f"FLI-{self._seq:04d}"
            self._seq += 1
            obj = Flight(item_id, cleaned)
            obj.validate()
            self._flights[item_id] = obj
            log.info("[FlightReservationService.create_flight] stored %s in _flights (count=%s)", item_id, len(self._flights))
            return obj

    def get_flight(self, item_id: str) -> Flight:
        with self._lock:
            obj = self._flights.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Flight id: {item_id}")
            log.info("[FlightReservationService.get_flight] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_aircraft(self, name: str) -> Aircraft:
        """UML: FlightReservationService.create_aircraft(name) -> Aircraft"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Aircraft name is required")
        with self._lock:
            item_id = f"AIR-{self._seq:04d}"
            self._seq += 1
            obj = Aircraft(item_id, cleaned)
            obj.validate()
            self._aircrafts[item_id] = obj
            log.info("[FlightReservationService.create_aircraft] stored %s in _aircrafts (count=%s)", item_id, len(self._aircrafts))
            return obj

    def get_aircraft(self, item_id: str) -> Aircraft:
        with self._lock:
            obj = self._aircrafts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Aircraft id: {item_id}")
            log.info("[FlightReservationService.get_aircraft] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_seat(self, name: str) -> Seat:
        """UML: FlightReservationService.create_seat(name) -> Seat"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Seat name is required")
        with self._lock:
            item_id = f"SEA-{self._seq:04d}"
            self._seq += 1
            obj = Seat(item_id, cleaned)
            obj.validate()
            self._seats[item_id] = obj
            log.info("[FlightReservationService.create_seat] stored %s in _seats (count=%s)", item_id, len(self._seats))
            return obj

    def get_seat(self, item_id: str) -> Seat:
        with self._lock:
            obj = self._seats.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Seat id: {item_id}")
            log.info("[FlightReservationService.get_seat] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_flight_instance(self, name: str) -> FlightInstance:
        """UML: FlightReservationService.create_flight_instance(name) -> FlightInstance"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("FlightInstance name is required")
        with self._lock:
            item_id = f"FLI-{self._seq:04d}"
            self._seq += 1
            obj = FlightInstance(item_id, cleaned)
            obj.validate()
            self._flight_instances[item_id] = obj
            log.info("[FlightReservationService.create_flight_instance] stored %s in _flight_instances (count=%s)", item_id, len(self._flight_instances))
            return obj

    def get_flight_instance(self, item_id: str) -> FlightInstance:
        with self._lock:
            obj = self._flight_instances.get(item_id)
            if obj is None:
                raise KeyError(f"unknown FlightInstance id: {item_id}")
            log.info("[FlightReservationService.get_flight_instance] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_airport(self, item_id: str) -> Airport:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._airports.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Airport id: {item_id}")
            log.info("[FlightReservationService.close_airport] closing %s via Airport.close()", item_id)
            obj.close()
            return obj

    def list_active_airports(self) -> List[Airport]:
        with self._lock:
            active = [o for o in self._airports.values() if o.status == "ACTIVE"]
            log.info("[FlightReservationService.list_active_airports] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct FlightReservationService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = FlightReservationService()

    log.info("========== STEP 2: Create primary Airport objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_airport("alpha-airport")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_airport("beta-airport")

    log.info("========== STEP 3: Create Flight (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_flight("sample-flight")

    log.info("========== STEP 4: Create Aircraft (UML class) ==========")
    system.create_aircraft("sample-aircraft")

    log.info("========== STEP 5: Create Seat (UML class) ==========")
    system.create_seat("sample-seat")

    log.info("========== STEP 6: Create FlightInstance (UML class) ==========")
    system.create_flight_instance("sample-flight_instance")

    log.info("========== STEP 7: Inspect active Airport list ==========")
    system.list_active_airports()

    log.info("========== STEP 8: Close first Airport ==========")
    system.close_airport(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_airport(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Airport.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_airport("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_airport: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_airports()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Airport {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Airport(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Airport.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Airport.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Airport.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Airport " + id + " invalid status");
    }
    System.out.println("[Airport.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Airport " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Airport.close] id=" + id + " -> CLOSED");
  }
}


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


class Aircraft {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Aircraft(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Aircraft.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Aircraft.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Aircraft.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Aircraft " + id + " invalid status");
    }
    System.out.println("[Aircraft.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Aircraft " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Aircraft.close] id=" + id + " -> CLOSED");
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


class FlightInstance {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  FlightInstance(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("FlightInstance.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FlightInstance.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[FlightInstance.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("FlightInstance " + id + " invalid status");
    }
    System.out.println("[FlightInstance.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("FlightInstance " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[FlightInstance.close] id=" + id + " -> CLOSED");
  }
}

public class FlightReservationService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Airport> airports = new LinkedHashMap<>();
  private final Map<String, Flight> flights = new LinkedHashMap<>();
  private final Map<String, Aircraft> aircrafts = new LinkedHashMap<>();
  private final Map<String, Seat> seats = new LinkedHashMap<>();
  private final Map<String, FlightInstance> flight_instances = new LinkedHashMap<>();

  public FlightReservationService() {
    System.out.println("[FlightReservationService.__init__] system ready");
  }

  public Airport createAirport(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Airport name required");
    }
    lock.lock();
    try {
      String id = String.format("AIR-%04d", seq++);
      Airport obj = new Airport(id, name.trim());
      obj.validate();
      airports.put(id, obj);
      System.out.println("[FlightReservationService.createAirport] stored " + id + " count=" + airports.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Airport getAirport(String id) {
    lock.lock();
    try {
      Airport obj = airports.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Airport id: " + id);
      }
      System.out.println("[FlightReservationService.getAirport] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
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
      System.out.println("[FlightReservationService.createFlight] stored " + id + " count=" + flights.size());
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
      System.out.println("[FlightReservationService.getFlight] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Aircraft createAircraft(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Aircraft name required");
    }
    lock.lock();
    try {
      String id = String.format("AIR-%04d", seq++);
      Aircraft obj = new Aircraft(id, name.trim());
      obj.validate();
      aircrafts.put(id, obj);
      System.out.println("[FlightReservationService.createAircraft] stored " + id + " count=" + aircrafts.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Aircraft getAircraft(String id) {
    lock.lock();
    try {
      Aircraft obj = aircrafts.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Aircraft id: " + id);
      }
      System.out.println("[FlightReservationService.getAircraft] found id=" + obj.getId());
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
      System.out.println("[FlightReservationService.createSeat] stored " + id + " count=" + seats.size());
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
      System.out.println("[FlightReservationService.getSeat] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public FlightInstance createFlightInstance(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FlightInstance name required");
    }
    lock.lock();
    try {
      String id = String.format("FLI-%04d", seq++);
      FlightInstance obj = new FlightInstance(id, name.trim());
      obj.validate();
      flight_instances.put(id, obj);
      System.out.println("[FlightReservationService.createFlightInstance] stored " + id + " count=" + flight_instances.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public FlightInstance getFlightInstance(String id) {
    lock.lock();
    try {
      FlightInstance obj = flight_instances.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown FlightInstance id: " + id);
      }
      System.out.println("[FlightReservationService.getFlightInstance] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Airport closeAirport(String id) {
    lock.lock();
    try {
      Airport obj = airports.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Airport id: " + id);
      }
      System.out.println("[FlightReservationService.closeAirport] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Airport> listActiveAirports() {
    lock.lock();
    try {
      List<Airport> out = new ArrayList<>();
      for (Airport o : airports.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[FlightReservationService.listActiveAirports] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct FlightReservationService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    FlightReservationService system = new FlightReservationService();
    System.out.println("========== STEP 2: Create Airport objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Airport first = system.createAirport("alpha-airport");
    system.createAirport("beta-airport");
    System.out.println("========== STEP 3: Create Flight ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createFlight("sample-flight");
    System.out.println("========== STEP 4: Create Aircraft ==========");
    system.createAircraft("sample-aircraft");
    System.out.println("========== STEP 5: Create Seat ==========");
    system.createSeat("sample-seat");
    System.out.println("========== STEP 6: Create FlightInstance ==========");
    system.createFlightInstance("sample-flight_instance");
    System.out.println("========== Inspect active list ==========");
    system.listActiveAirports();
    System.out.println("========== Close first Airport ==========");
    system.closeAirport(first.getId());
    try {
      system.closeAirport(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getAirport("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Airport {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Airport.id required')
    }

    if (!name?.trim()) {
      throw new Error('Airport.name required')
    }
    console.log(\`[Airport.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Airport \${this.id} invalid status\`)
    }
    console.log(\`[Airport.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Airport \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Airport.close] id=\${this.id} -> CLOSED\`)
  }
}


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


class Aircraft {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Aircraft.id required')
    }

    if (!name?.trim()) {
      throw new Error('Aircraft.name required')
    }
    console.log(\`[Aircraft.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Aircraft \${this.id} invalid status\`)
    }
    console.log(\`[Aircraft.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Aircraft \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Aircraft.close] id=\${this.id} -> CLOSED\`)
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


class FlightInstance {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('FlightInstance.id required')
    }

    if (!name?.trim()) {
      throw new Error('FlightInstance.name required')
    }
    console.log(\`[FlightInstance.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`FlightInstance \${this.id} invalid status\`)
    }
    console.log(\`[FlightInstance.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`FlightInstance \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[FlightInstance.close] id=\${this.id} -> CLOSED\`)
  }
}

class FlightReservationService {
  private seq = 1
  private airports = new Map<string, Airport>()
  private flights = new Map<string, Flight>()
  private aircrafts = new Map<string, Aircraft>()
  private seats = new Map<string, Seat>()
  private flight_instances = new Map<string, FlightInstance>()
  constructor() {
    console.log('[FlightReservationService.__init__] system ready')
  }

  createAirport(name: string): Airport {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Airport name required')
    }
    const id = \`AIR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Airport(id, cleaned)
    obj.validate()
    this.airports.set(id, obj)
    console.log(\`[FlightReservationService.createAirport] stored \${id} count=\${this.airports.size}\`)
    return obj
  }

  getAirport(id: string): Airport {
    const obj = this.airports.get(id)
    if (!obj) {
      throw new Error(\`unknown Airport id: \${id}\`)
    }
    console.log(\`[FlightReservationService.getAirport] found id=\${obj.id}\`)
    return obj
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
    console.log(\`[FlightReservationService.createFlight] stored \${id} count=\${this.flights.size}\`)
    return obj
  }

  getFlight(id: string): Flight {
    const obj = this.flights.get(id)
    if (!obj) {
      throw new Error(\`unknown Flight id: \${id}\`)
    }
    console.log(\`[FlightReservationService.getFlight] found id=\${obj.id}\`)
    return obj
  }

  createAircraft(name: string): Aircraft {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Aircraft name required')
    }
    const id = \`AIR-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Aircraft(id, cleaned)
    obj.validate()
    this.aircrafts.set(id, obj)
    console.log(\`[FlightReservationService.createAircraft] stored \${id} count=\${this.aircrafts.size}\`)
    return obj
  }

  getAircraft(id: string): Aircraft {
    const obj = this.aircrafts.get(id)
    if (!obj) {
      throw new Error(\`unknown Aircraft id: \${id}\`)
    }
    console.log(\`[FlightReservationService.getAircraft] found id=\${obj.id}\`)
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
    console.log(\`[FlightReservationService.createSeat] stored \${id} count=\${this.seats.size}\`)
    return obj
  }

  getSeat(id: string): Seat {
    const obj = this.seats.get(id)
    if (!obj) {
      throw new Error(\`unknown Seat id: \${id}\`)
    }
    console.log(\`[FlightReservationService.getSeat] found id=\${obj.id}\`)
    return obj
  }

  createFlightInstance(name: string): FlightInstance {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('FlightInstance name required')
    }
    const id = \`FLI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new FlightInstance(id, cleaned)
    obj.validate()
    this.flight_instances.set(id, obj)
    console.log(\`[FlightReservationService.createFlightInstance] stored \${id} count=\${this.flight_instances.size}\`)
    return obj
  }

  getFlightInstance(id: string): FlightInstance {
    const obj = this.flight_instances.get(id)
    if (!obj) {
      throw new Error(\`unknown FlightInstance id: \${id}\`)
    }
    console.log(\`[FlightReservationService.getFlightInstance] found id=\${obj.id}\`)
    return obj
  }

  closeAirport(id: string): Airport {
    const obj = this.getAirport(id)
    console.log(\`[FlightReservationService.closeAirport] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveAirports(): Airport[] {
    const active = [...this.airports.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[FlightReservationService.listActiveAirports] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct FlightReservationService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new FlightReservationService()
  console.log('========== STEP 2: Create Airport objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createAirport('alpha-airport')
  system.createAirport('beta-airport')
  console.log('========== STEP 3: Create Flight ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createFlight('sample-flight')
  console.log('========== STEP 4: Create Aircraft ==========')
  system.createAircraft('sample-aircraft')
  console.log('========== STEP 5: Create Seat ==========')
  system.createSeat('sample-seat')
  console.log('========== STEP 6: Create FlightInstance ==========')
  system.createFlightInstance('sample-flight_instance')
  system.listActiveAirports()
  console.log('========== Close first Airport ==========')
  system.closeAirport(first.id)
  try {
    system.closeAirport(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getAirport('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Airport {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Airport(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Airport requires id and name");
    }
    cout << "[Airport.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Airport invalid status");
    }
    cout << "[Airport.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Airport cannot close");
    }
    status_ = "CLOSED";
    cout << "[Airport.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


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


class Aircraft {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Aircraft(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Aircraft requires id and name");
    }
    cout << "[Aircraft.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Aircraft invalid status");
    }
    cout << "[Aircraft.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Aircraft cannot close");
    }
    status_ = "CLOSED";
    cout << "[Aircraft.close] id=" << id_ << " -> CLOSED" << endl;
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


class FlightInstance {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  FlightInstance(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("FlightInstance requires id and name");
    }
    cout << "[FlightInstance.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("FlightInstance invalid status");
    }
    cout << "[FlightInstance.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("FlightInstance cannot close");
    }
    status_ = "CLOSED";
    cout << "[FlightInstance.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class FlightReservationService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Airport> airports_;
  unordered_map<string, Flight> flights_;
  unordered_map<string, Aircraft> aircrafts_;
  unordered_map<string, Seat> seats_;
  unordered_map<string, FlightInstance> flight_instances_;
public:
  FlightReservationService() {
    cout << "[FlightReservationService.__init__] system ready" << endl;
  }

  Airport createAirport(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Airport name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "AIR-%04d", seq_++);
    Airport obj{buf, name};
    obj.validate();
    airports_.emplace(obj.id(), obj);
    cout << "[FlightReservationService.createAirport] stored " << obj.id() << endl;
    return obj;
  }

  Airport getAirport(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = airports_.find(id);
    if (it == airports_.end()) {
      throw out_of_range("unknown Airport id");
    }
    cout << "[FlightReservationService.getAirport] found " << id << endl;
    return it->second;
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
    cout << "[FlightReservationService.createFlight] stored " << obj.id() << endl;
    return obj;
  }

  Flight getFlight(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = flights_.find(id);
    if (it == flights_.end()) {
      throw out_of_range("unknown Flight id");
    }
    cout << "[FlightReservationService.getFlight] found " << id << endl;
    return it->second;
  }

  Aircraft createAircraft(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Aircraft name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "AIR-%04d", seq_++);
    Aircraft obj{buf, name};
    obj.validate();
    aircrafts_.emplace(obj.id(), obj);
    cout << "[FlightReservationService.createAircraft] stored " << obj.id() << endl;
    return obj;
  }

  Aircraft getAircraft(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = aircrafts_.find(id);
    if (it == aircrafts_.end()) {
      throw out_of_range("unknown Aircraft id");
    }
    cout << "[FlightReservationService.getAircraft] found " << id << endl;
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
    cout << "[FlightReservationService.createSeat] stored " << obj.id() << endl;
    return obj;
  }

  Seat getSeat(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = seats_.find(id);
    if (it == seats_.end()) {
      throw out_of_range("unknown Seat id");
    }
    cout << "[FlightReservationService.getSeat] found " << id << endl;
    return it->second;
  }

  FlightInstance createFlightInstance(const string& name) {
    if (name.empty()) {
      throw invalid_argument("FlightInstance name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FLI-%04d", seq_++);
    FlightInstance obj{buf, name};
    obj.validate();
    flight_instances_.emplace(obj.id(), obj);
    cout << "[FlightReservationService.createFlightInstance] stored " << obj.id() << endl;
    return obj;
  }

  FlightInstance getFlightInstance(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = flight_instances_.find(id);
    if (it == flight_instances_.end()) {
      throw out_of_range("unknown FlightInstance id");
    }
    cout << "[FlightReservationService.getFlightInstance] found " << id << endl;
    return it->second;
  }

  Airport closeAirport(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = airports_.find(id);
    if (it == airports_.end()) {
      throw out_of_range("unknown Airport");
    }
    cout << "[FlightReservationService.closeAirport] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct FlightReservationService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  FlightReservationService system;
  cout << "========== STEP 2: Create Airport ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createAirport("alpha-airport");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createAirport("beta-airport");
  system.createFlight("sample-flight");
  system.createAircraft("sample-aircraft");
  system.createSeat("sample-seat");
  system.createFlightInstance("sample-flight_instance");
  system.closeAirport(first.id());
  try {
    system.closeAirport(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getAirport("MISSING-ID");
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

type Airport struct {
  ID     string
  Name   string
  Status string
}

func NewAirport(id, name string) (*Airport, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Airport requires id and name")
  }
  obj := &Airport{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Airport.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Airport) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Airport invalid status")
  }
  fmt.Printf("[Airport.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Airport) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Airport %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Airport.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


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


type Aircraft struct {
  ID     string
  Name   string
  Status string
}

func NewAircraft(id, name string) (*Aircraft, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Aircraft requires id and name")
  }
  obj := &Aircraft{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Aircraft.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Aircraft) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Aircraft invalid status")
  }
  fmt.Printf("[Aircraft.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Aircraft) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Aircraft %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Aircraft.close] id=%s -> CLOSED\\n", o.ID)
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


type FlightInstance struct {
  ID     string
  Name   string
  Status string
}

func NewFlightInstance(id, name string) (*FlightInstance, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("FlightInstance requires id and name")
  }
  obj := &FlightInstance{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[FlightInstance.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *FlightInstance) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("FlightInstance invalid status")
  }
  fmt.Printf("[FlightInstance.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *FlightInstance) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("FlightInstance %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[FlightInstance.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type FlightReservationService struct {
  mu  sync.Mutex
  seq int
  airports map[string]*Airport
  flights map[string]*Flight
  aircrafts map[string]*Aircraft
  seats map[string]*Seat
  flight_instances map[string]*FlightInstance
}

func NewFlightReservationService() *FlightReservationService {
  fmt.Println("[FlightReservationService.__init__] system ready")
  return &FlightReservationService{
    seq: 1,
    airports: map[string]*Airport{},
    flights: map[string]*Flight{},
    aircrafts: map[string]*Aircraft{},
    seats: map[string]*Seat{},
    flight_instances: map[string]*FlightInstance{},
  }
}

func (s *FlightReservationService) CreateAirport(name string) (*Airport, error) {
  if name == "" {
    return nil, fmt.Errorf("Airport name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("AIR-%04d", s.seq)
  s.seq++
  obj, err := NewAirport(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.airports[id] = obj
  fmt.Printf("[FlightReservationService.CreateAirport] stored %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) GetAirport(id string) (*Airport, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.airports[id]
  if !ok {
    return nil, fmt.Errorf("unknown Airport id: %s", id)
  }
  fmt.Printf("[FlightReservationService.GetAirport] found %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) CreateFlight(name string) (*Flight, error) {
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
  fmt.Printf("[FlightReservationService.CreateFlight] stored %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) GetFlight(id string) (*Flight, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.flights[id]
  if !ok {
    return nil, fmt.Errorf("unknown Flight id: %s", id)
  }
  fmt.Printf("[FlightReservationService.GetFlight] found %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) CreateAircraft(name string) (*Aircraft, error) {
  if name == "" {
    return nil, fmt.Errorf("Aircraft name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("AIR-%04d", s.seq)
  s.seq++
  obj, err := NewAircraft(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.aircrafts[id] = obj
  fmt.Printf("[FlightReservationService.CreateAircraft] stored %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) GetAircraft(id string) (*Aircraft, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.aircrafts[id]
  if !ok {
    return nil, fmt.Errorf("unknown Aircraft id: %s", id)
  }
  fmt.Printf("[FlightReservationService.GetAircraft] found %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) CreateSeat(name string) (*Seat, error) {
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
  fmt.Printf("[FlightReservationService.CreateSeat] stored %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) GetSeat(id string) (*Seat, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.seats[id]
  if !ok {
    return nil, fmt.Errorf("unknown Seat id: %s", id)
  }
  fmt.Printf("[FlightReservationService.GetSeat] found %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) CreateFlightInstance(name string) (*FlightInstance, error) {
  if name == "" {
    return nil, fmt.Errorf("FlightInstance name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FLI-%04d", s.seq)
  s.seq++
  obj, err := NewFlightInstance(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.flight_instances[id] = obj
  fmt.Printf("[FlightReservationService.CreateFlightInstance] stored %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) GetFlightInstance(id string) (*FlightInstance, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.flight_instances[id]
  if !ok {
    return nil, fmt.Errorf("unknown FlightInstance id: %s", id)
  }
  fmt.Printf("[FlightReservationService.GetFlightInstance] found %s\\n", id)
  return obj, nil
}

func (s *FlightReservationService) CloseAirport(id string) (*Airport, error) {
  obj, err := s.GetAirport(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[FlightReservationService.CloseAirport] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct FlightReservationService ==========")
  system := NewFlightReservationService()
  fmt.Println("========== STEP 2: Create Airport ==========")
  first, _ := system.CreateAirport("alpha-airport")
  system.CreateAirport("beta-airport")
  system.CreateFlight("sample-flight")
  system.CreateAircraft("sample-aircraft")
  system.CreateSeat("sample-seat")
  system.CreateFlightInstance("sample-flight_instance")
  system.CloseAirport(first.ID)
  if _, err := system.CloseAirport(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetAirport("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Airport {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Airport(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Airport requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Airport.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Airport invalid status");
    }
    Console.WriteLine("[Airport.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Airport " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Airport.close] id=" + Id + " -> CLOSED");
  }
}


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


sealed class Aircraft {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Aircraft(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Aircraft requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Aircraft.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Aircraft invalid status");
    }
    Console.WriteLine("[Aircraft.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Aircraft " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Aircraft.close] id=" + Id + " -> CLOSED");
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


sealed class FlightInstance {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public FlightInstance(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FlightInstance requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[FlightInstance.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("FlightInstance invalid status");
    }
    Console.WriteLine("[FlightInstance.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("FlightInstance " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[FlightInstance.close] id=" + Id + " -> CLOSED");
  }
}

sealed class FlightReservationService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Airport> _airports = new();
  private readonly Dictionary<string, Flight> _flights = new();
  private readonly Dictionary<string, Aircraft> _aircrafts = new();
  private readonly Dictionary<string, Seat> _seats = new();
  private readonly Dictionary<string, FlightInstance> _flight_instances = new();
  public FlightReservationService() {
    Console.WriteLine("[FlightReservationService.__init__] system ready");
  }

  public Airport CreateAirport(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Airport name required");
    }
    lock (_gate) {
      var id = string.Format("AIR-{0:D4}", _seq++);
      var obj = new Airport(id, name.Trim());
      obj.Validate();
      _airports[id] = obj;
      Console.WriteLine("[FlightReservationService.CreateAirport] stored " + id);
      return obj;
    }
  }

  public Airport GetAirport(string id) {
    lock (_gate) {
      if (!_airports.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Airport id: " + id);
      }
      Console.WriteLine("[FlightReservationService.GetAirport] found " + id);
      return obj;
    }
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
      Console.WriteLine("[FlightReservationService.CreateFlight] stored " + id);
      return obj;
    }
  }

  public Flight GetFlight(string id) {
    lock (_gate) {
      if (!_flights.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Flight id: " + id);
      }
      Console.WriteLine("[FlightReservationService.GetFlight] found " + id);
      return obj;
    }
  }

  public Aircraft CreateAircraft(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Aircraft name required");
    }
    lock (_gate) {
      var id = string.Format("AIR-{0:D4}", _seq++);
      var obj = new Aircraft(id, name.Trim());
      obj.Validate();
      _aircrafts[id] = obj;
      Console.WriteLine("[FlightReservationService.CreateAircraft] stored " + id);
      return obj;
    }
  }

  public Aircraft GetAircraft(string id) {
    lock (_gate) {
      if (!_aircrafts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Aircraft id: " + id);
      }
      Console.WriteLine("[FlightReservationService.GetAircraft] found " + id);
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
      Console.WriteLine("[FlightReservationService.CreateSeat] stored " + id);
      return obj;
    }
  }

  public Seat GetSeat(string id) {
    lock (_gate) {
      if (!_seats.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Seat id: " + id);
      }
      Console.WriteLine("[FlightReservationService.GetSeat] found " + id);
      return obj;
    }
  }

  public FlightInstance CreateFlightInstance(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FlightInstance name required");
    }
    lock (_gate) {
      var id = string.Format("FLI-{0:D4}", _seq++);
      var obj = new FlightInstance(id, name.Trim());
      obj.Validate();
      _flight_instances[id] = obj;
      Console.WriteLine("[FlightReservationService.CreateFlightInstance] stored " + id);
      return obj;
    }
  }

  public FlightInstance GetFlightInstance(string id) {
    lock (_gate) {
      if (!_flight_instances.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown FlightInstance id: " + id);
      }
      Console.WriteLine("[FlightReservationService.GetFlightInstance] found " + id);
      return obj;
    }
  }

  public Airport CloseAirport(string id) {
    var obj = GetAirport(id);
    Console.WriteLine("[FlightReservationService.CloseAirport] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct FlightReservationService ==========");
    var system = new FlightReservationService();
    Console.WriteLine("========== STEP 2: Create Airport ==========");
    var first = system.CreateAirport("alpha-airport");
    system.CreateAirport("beta-airport");
    system.CreateFlight("sample-flight");
    system.CreateAircraft("sample-aircraft");
    system.CreateSeat("sample-seat");
    system.CreateFlightInstance("sample-flight_instance");
    system.CloseAirport(first.Id);
    try {
      system.CloseAirport(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetAirport("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const flightReservationSolution: ProblemSolution = {
  slug: 'flight-reservation',
  title: 'Flight Reservation System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a flight reservation system like MakeMyTrip — users search flights, book seats, and manage itineraries. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Search flights by origin, destination, date, and passenger count',
      'View flight details: airline, duration, stops, price',
      'Select specific seats from a seat map',
      'Book single or round-trip flights with passenger details',
      'Generate e-ticket with PNR code',
      'Cancel booking with refund based on policy',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Search flights by origin, destination, date, and passenger count?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'View flight details: airline, duration, stops, price?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Select specific seats from a seat map?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Book single or round-trip flights with passenger details?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Generate e-ticket with PNR code?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. FlightReservationService is the facade stereotype. Airport, Flight, Aircraft, Seat, FlightInstance are concrete domain classes with id/name/status and validate/close.',
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
          'Construct FlightReservationService.',
          'createAirport twice and create the related UML classes.',
          'closeAirport once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'FlightReservationService', responsibility: 'UML facade - orchestrates Flight Reservation System.', keyMembers: ['create*', 'get*', 'closeAirport'] },
    { name: 'Airport', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Flight', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Aircraft', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Seat', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'FlightInstance', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from FlightReservationService to Airport, Flight, Aircraft, Seat, FlightInstance. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on FlightReservationService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'FlightReservationService', responsibility: 'UML facade - orchestrates Flight Reservation System.', keyMembers: ['create*', 'get*', 'closeAirport'] },
    { name: 'Airport', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Flight', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Aircraft', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Seat', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'FlightInstance', responsibility: 'UML class - domain object for Flight Reservation System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'FlightReservationService exposes create/get/close and owns composed collections.' },
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
      'main constructs FlightReservationService, creates UML domain objects, closes the primary Airport, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct FlightReservationService.',
      'createAirport for alpha and beta.',
      'create remaining UML classes.',
      'closeAirport(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createAirport("alpha..."); closeAirport(id)',
        output: '[Airport.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeAirport(alreadyClosed) or getAirport("MISSING-ID")',
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
