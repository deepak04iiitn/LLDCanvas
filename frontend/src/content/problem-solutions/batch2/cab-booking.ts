import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'CabBookingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_riders', 'Map<string, Rider>'),
    attr('-', '_drivers', 'Map<string, Driver>'),
    attr('-', '_vehicles', 'Map<string, Vehicle>'),
    attr('-', '_trips', 'Map<string, Trip>'),
    attr('-', '_trip_requests', 'Map<string, TripRequest>'),
  ], [
    method('+', 'createRider', 'name: string', 'Rider'),
    method('+', 'createDriver', 'name: string', 'Driver'),
    method('+', 'createVehicle', 'name: string', 'Vehicle'),
    method('+', 'createTrip', 'name: string', 'Trip'),
    method('+', 'createTripRequest', 'name: string', 'TripRequest'),
    method('+', 'getRider', 'id: string', 'Rider'),
    method('+', 'getDriver', 'id: string', 'Driver'),
    method('+', 'getVehicle', 'id: string', 'Vehicle'),
    method('+', 'getTrip', 'id: string', 'Trip'),
    method('+', 'getTripRequest', 'id: string', 'TripRequest'),
    method('+', 'closeRider', 'id: string', 'Rider'),
  ], 'facade'),
  cls('n1', 'Rider', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Driver', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Vehicle', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Trip', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'TripRequest', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("cab-booking")


class Rider:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Rider.id is required")
        if not name or not name.strip():
            raise ValueError("Rider.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Rider.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Rider {self.id} has invalid status={self.status}")
        log.info("[Rider.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Rider {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Rider.close] id=%s -> CLOSED", self.id)


class Driver:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Driver.id is required")
        if not name or not name.strip():
            raise ValueError("Driver.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Driver.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Driver {self.id} has invalid status={self.status}")
        log.info("[Driver.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Driver {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Driver.close] id=%s -> CLOSED", self.id)


class Vehicle:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Vehicle.id is required")
        if not name or not name.strip():
            raise ValueError("Vehicle.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Vehicle.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Vehicle {self.id} has invalid status={self.status}")
        log.info("[Vehicle.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Vehicle {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Vehicle.close] id=%s -> CLOSED", self.id)


class Trip:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Trip.id is required")
        if not name or not name.strip():
            raise ValueError("Trip.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Trip.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Trip {self.id} has invalid status={self.status}")
        log.info("[Trip.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Trip {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Trip.close] id=%s -> CLOSED", self.id)


class TripRequest:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("TripRequest.id is required")
        if not name or not name.strip():
            raise ValueError("TripRequest.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[TripRequest.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"TripRequest {self.id} has invalid status={self.status}")
        log.info("[TripRequest.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"TripRequest {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[TripRequest.close] id=%s -> CLOSED", self.id)


class CabBookingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._riders: Dict[str, Rider] = {}
        self._drivers: Dict[str, Driver] = {}
        self._vehicles: Dict[str, Vehicle] = {}
        self._trips: Dict[str, Trip] = {}
        self._trip_requests: Dict[str, TripRequest] = {}
        log.info("[CabBookingService.__init__] system ready; managing: Rider, Driver, Vehicle, Trip, TripRequest")

    def create_rider(self, name: str) -> Rider:
        """UML: CabBookingService.create_rider(name) -> Rider"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Rider name is required")
        with self._lock:
            item_id = f"RID-{self._seq:04d}"
            self._seq += 1
            obj = Rider(item_id, cleaned)
            obj.validate()
            self._riders[item_id] = obj
            log.info("[CabBookingService.create_rider] stored %s in _riders (count=%s)", item_id, len(self._riders))
            return obj

    def get_rider(self, item_id: str) -> Rider:
        with self._lock:
            obj = self._riders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Rider id: {item_id}")
            log.info("[CabBookingService.get_rider] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_driver(self, name: str) -> Driver:
        """UML: CabBookingService.create_driver(name) -> Driver"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Driver name is required")
        with self._lock:
            item_id = f"DRI-{self._seq:04d}"
            self._seq += 1
            obj = Driver(item_id, cleaned)
            obj.validate()
            self._drivers[item_id] = obj
            log.info("[CabBookingService.create_driver] stored %s in _drivers (count=%s)", item_id, len(self._drivers))
            return obj

    def get_driver(self, item_id: str) -> Driver:
        with self._lock:
            obj = self._drivers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Driver id: {item_id}")
            log.info("[CabBookingService.get_driver] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_vehicle(self, name: str) -> Vehicle:
        """UML: CabBookingService.create_vehicle(name) -> Vehicle"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Vehicle name is required")
        with self._lock:
            item_id = f"VEH-{self._seq:04d}"
            self._seq += 1
            obj = Vehicle(item_id, cleaned)
            obj.validate()
            self._vehicles[item_id] = obj
            log.info("[CabBookingService.create_vehicle] stored %s in _vehicles (count=%s)", item_id, len(self._vehicles))
            return obj

    def get_vehicle(self, item_id: str) -> Vehicle:
        with self._lock:
            obj = self._vehicles.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Vehicle id: {item_id}")
            log.info("[CabBookingService.get_vehicle] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_trip(self, name: str) -> Trip:
        """UML: CabBookingService.create_trip(name) -> Trip"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Trip name is required")
        with self._lock:
            item_id = f"TRI-{self._seq:04d}"
            self._seq += 1
            obj = Trip(item_id, cleaned)
            obj.validate()
            self._trips[item_id] = obj
            log.info("[CabBookingService.create_trip] stored %s in _trips (count=%s)", item_id, len(self._trips))
            return obj

    def get_trip(self, item_id: str) -> Trip:
        with self._lock:
            obj = self._trips.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Trip id: {item_id}")
            log.info("[CabBookingService.get_trip] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_trip_request(self, name: str) -> TripRequest:
        """UML: CabBookingService.create_trip_request(name) -> TripRequest"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("TripRequest name is required")
        with self._lock:
            item_id = f"TRI-{self._seq:04d}"
            self._seq += 1
            obj = TripRequest(item_id, cleaned)
            obj.validate()
            self._trip_requests[item_id] = obj
            log.info("[CabBookingService.create_trip_request] stored %s in _trip_requests (count=%s)", item_id, len(self._trip_requests))
            return obj

    def get_trip_request(self, item_id: str) -> TripRequest:
        with self._lock:
            obj = self._trip_requests.get(item_id)
            if obj is None:
                raise KeyError(f"unknown TripRequest id: {item_id}")
            log.info("[CabBookingService.get_trip_request] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_rider(self, item_id: str) -> Rider:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._riders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Rider id: {item_id}")
            log.info("[CabBookingService.close_rider] closing %s via Rider.close()", item_id)
            obj.close()
            return obj

    def list_active_riders(self) -> List[Rider]:
        with self._lock:
            active = [o for o in self._riders.values() if o.status == "ACTIVE"]
            log.info("[CabBookingService.list_active_riders] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct CabBookingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = CabBookingService()

    log.info("========== STEP 2: Create primary Rider objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_rider("alpha-rider")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_rider("beta-rider")

    log.info("========== STEP 3: Create Driver (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_driver("sample-driver")

    log.info("========== STEP 4: Create Vehicle (UML class) ==========")
    system.create_vehicle("sample-vehicle")

    log.info("========== STEP 5: Create Trip (UML class) ==========")
    system.create_trip("sample-trip")

    log.info("========== STEP 6: Create TripRequest (UML class) ==========")
    system.create_trip_request("sample-trip_request")

    log.info("========== STEP 7: Inspect active Rider list ==========")
    system.list_active_riders()

    log.info("========== STEP 8: Close first Rider ==========")
    system.close_rider(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_rider(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Rider.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_rider("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_rider: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_riders()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Rider {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Rider(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Rider.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Rider.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Rider.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Rider " + id + " invalid status");
    }
    System.out.println("[Rider.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Rider " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Rider.close] id=" + id + " -> CLOSED");
  }
}


class Driver {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Driver(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Driver.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Driver.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Driver.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Driver " + id + " invalid status");
    }
    System.out.println("[Driver.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Driver " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Driver.close] id=" + id + " -> CLOSED");
  }
}


class Vehicle {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Vehicle(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Vehicle.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Vehicle.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Vehicle.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Vehicle " + id + " invalid status");
    }
    System.out.println("[Vehicle.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Vehicle " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Vehicle.close] id=" + id + " -> CLOSED");
  }
}


class Trip {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Trip(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Trip.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Trip.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Trip.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Trip " + id + " invalid status");
    }
    System.out.println("[Trip.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Trip " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Trip.close] id=" + id + " -> CLOSED");
  }
}


class TripRequest {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  TripRequest(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("TripRequest.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TripRequest.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[TripRequest.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("TripRequest " + id + " invalid status");
    }
    System.out.println("[TripRequest.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("TripRequest " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[TripRequest.close] id=" + id + " -> CLOSED");
  }
}

public class CabBookingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Rider> riders = new LinkedHashMap<>();
  private final Map<String, Driver> drivers = new LinkedHashMap<>();
  private final Map<String, Vehicle> vehicles = new LinkedHashMap<>();
  private final Map<String, Trip> trips = new LinkedHashMap<>();
  private final Map<String, TripRequest> trip_requests = new LinkedHashMap<>();

  public CabBookingService() {
    System.out.println("[CabBookingService.__init__] system ready");
  }

  public Rider createRider(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Rider name required");
    }
    lock.lock();
    try {
      String id = String.format("RID-%04d", seq++);
      Rider obj = new Rider(id, name.trim());
      obj.validate();
      riders.put(id, obj);
      System.out.println("[CabBookingService.createRider] stored " + id + " count=" + riders.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Rider getRider(String id) {
    lock.lock();
    try {
      Rider obj = riders.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Rider id: " + id);
      }
      System.out.println("[CabBookingService.getRider] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Driver createDriver(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Driver name required");
    }
    lock.lock();
    try {
      String id = String.format("DRI-%04d", seq++);
      Driver obj = new Driver(id, name.trim());
      obj.validate();
      drivers.put(id, obj);
      System.out.println("[CabBookingService.createDriver] stored " + id + " count=" + drivers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Driver getDriver(String id) {
    lock.lock();
    try {
      Driver obj = drivers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Driver id: " + id);
      }
      System.out.println("[CabBookingService.getDriver] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Vehicle createVehicle(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Vehicle name required");
    }
    lock.lock();
    try {
      String id = String.format("VEH-%04d", seq++);
      Vehicle obj = new Vehicle(id, name.trim());
      obj.validate();
      vehicles.put(id, obj);
      System.out.println("[CabBookingService.createVehicle] stored " + id + " count=" + vehicles.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Vehicle getVehicle(String id) {
    lock.lock();
    try {
      Vehicle obj = vehicles.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Vehicle id: " + id);
      }
      System.out.println("[CabBookingService.getVehicle] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Trip createTrip(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Trip name required");
    }
    lock.lock();
    try {
      String id = String.format("TRI-%04d", seq++);
      Trip obj = new Trip(id, name.trim());
      obj.validate();
      trips.put(id, obj);
      System.out.println("[CabBookingService.createTrip] stored " + id + " count=" + trips.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Trip getTrip(String id) {
    lock.lock();
    try {
      Trip obj = trips.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Trip id: " + id);
      }
      System.out.println("[CabBookingService.getTrip] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public TripRequest createTripRequest(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TripRequest name required");
    }
    lock.lock();
    try {
      String id = String.format("TRI-%04d", seq++);
      TripRequest obj = new TripRequest(id, name.trim());
      obj.validate();
      trip_requests.put(id, obj);
      System.out.println("[CabBookingService.createTripRequest] stored " + id + " count=" + trip_requests.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public TripRequest getTripRequest(String id) {
    lock.lock();
    try {
      TripRequest obj = trip_requests.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown TripRequest id: " + id);
      }
      System.out.println("[CabBookingService.getTripRequest] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Rider closeRider(String id) {
    lock.lock();
    try {
      Rider obj = riders.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Rider id: " + id);
      }
      System.out.println("[CabBookingService.closeRider] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Rider> listActiveRiders() {
    lock.lock();
    try {
      List<Rider> out = new ArrayList<>();
      for (Rider o : riders.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[CabBookingService.listActiveRiders] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct CabBookingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    CabBookingService system = new CabBookingService();
    System.out.println("========== STEP 2: Create Rider objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Rider first = system.createRider("alpha-rider");
    system.createRider("beta-rider");
    System.out.println("========== STEP 3: Create Driver ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createDriver("sample-driver");
    System.out.println("========== STEP 4: Create Vehicle ==========");
    system.createVehicle("sample-vehicle");
    System.out.println("========== STEP 5: Create Trip ==========");
    system.createTrip("sample-trip");
    System.out.println("========== STEP 6: Create TripRequest ==========");
    system.createTripRequest("sample-trip_request");
    System.out.println("========== Inspect active list ==========");
    system.listActiveRiders();
    System.out.println("========== Close first Rider ==========");
    system.closeRider(first.getId());
    try {
      system.closeRider(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getRider("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Rider {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Rider.id required')
    }

    if (!name?.trim()) {
      throw new Error('Rider.name required')
    }
    console.log(\`[Rider.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Rider \${this.id} invalid status\`)
    }
    console.log(\`[Rider.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Rider \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Rider.close] id=\${this.id} -> CLOSED\`)
  }
}


class Driver {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Driver.id required')
    }

    if (!name?.trim()) {
      throw new Error('Driver.name required')
    }
    console.log(\`[Driver.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Driver \${this.id} invalid status\`)
    }
    console.log(\`[Driver.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Driver \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Driver.close] id=\${this.id} -> CLOSED\`)
  }
}


class Vehicle {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Vehicle.id required')
    }

    if (!name?.trim()) {
      throw new Error('Vehicle.name required')
    }
    console.log(\`[Vehicle.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Vehicle \${this.id} invalid status\`)
    }
    console.log(\`[Vehicle.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Vehicle \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Vehicle.close] id=\${this.id} -> CLOSED\`)
  }
}


class Trip {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Trip.id required')
    }

    if (!name?.trim()) {
      throw new Error('Trip.name required')
    }
    console.log(\`[Trip.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Trip \${this.id} invalid status\`)
    }
    console.log(\`[Trip.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Trip \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Trip.close] id=\${this.id} -> CLOSED\`)
  }
}


class TripRequest {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('TripRequest.id required')
    }

    if (!name?.trim()) {
      throw new Error('TripRequest.name required')
    }
    console.log(\`[TripRequest.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`TripRequest \${this.id} invalid status\`)
    }
    console.log(\`[TripRequest.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`TripRequest \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[TripRequest.close] id=\${this.id} -> CLOSED\`)
  }
}

class CabBookingService {
  private seq = 1
  private riders = new Map<string, Rider>()
  private drivers = new Map<string, Driver>()
  private vehicles = new Map<string, Vehicle>()
  private trips = new Map<string, Trip>()
  private trip_requests = new Map<string, TripRequest>()
  constructor() {
    console.log('[CabBookingService.__init__] system ready')
  }

  createRider(name: string): Rider {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Rider name required')
    }
    const id = \`RID-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Rider(id, cleaned)
    obj.validate()
    this.riders.set(id, obj)
    console.log(\`[CabBookingService.createRider] stored \${id} count=\${this.riders.size}\`)
    return obj
  }

  getRider(id: string): Rider {
    const obj = this.riders.get(id)
    if (!obj) {
      throw new Error(\`unknown Rider id: \${id}\`)
    }
    console.log(\`[CabBookingService.getRider] found id=\${obj.id}\`)
    return obj
  }

  createDriver(name: string): Driver {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Driver name required')
    }
    const id = \`DRI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Driver(id, cleaned)
    obj.validate()
    this.drivers.set(id, obj)
    console.log(\`[CabBookingService.createDriver] stored \${id} count=\${this.drivers.size}\`)
    return obj
  }

  getDriver(id: string): Driver {
    const obj = this.drivers.get(id)
    if (!obj) {
      throw new Error(\`unknown Driver id: \${id}\`)
    }
    console.log(\`[CabBookingService.getDriver] found id=\${obj.id}\`)
    return obj
  }

  createVehicle(name: string): Vehicle {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Vehicle name required')
    }
    const id = \`VEH-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Vehicle(id, cleaned)
    obj.validate()
    this.vehicles.set(id, obj)
    console.log(\`[CabBookingService.createVehicle] stored \${id} count=\${this.vehicles.size}\`)
    return obj
  }

  getVehicle(id: string): Vehicle {
    const obj = this.vehicles.get(id)
    if (!obj) {
      throw new Error(\`unknown Vehicle id: \${id}\`)
    }
    console.log(\`[CabBookingService.getVehicle] found id=\${obj.id}\`)
    return obj
  }

  createTrip(name: string): Trip {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Trip name required')
    }
    const id = \`TRI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Trip(id, cleaned)
    obj.validate()
    this.trips.set(id, obj)
    console.log(\`[CabBookingService.createTrip] stored \${id} count=\${this.trips.size}\`)
    return obj
  }

  getTrip(id: string): Trip {
    const obj = this.trips.get(id)
    if (!obj) {
      throw new Error(\`unknown Trip id: \${id}\`)
    }
    console.log(\`[CabBookingService.getTrip] found id=\${obj.id}\`)
    return obj
  }

  createTripRequest(name: string): TripRequest {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('TripRequest name required')
    }
    const id = \`TRI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new TripRequest(id, cleaned)
    obj.validate()
    this.trip_requests.set(id, obj)
    console.log(\`[CabBookingService.createTripRequest] stored \${id} count=\${this.trip_requests.size}\`)
    return obj
  }

  getTripRequest(id: string): TripRequest {
    const obj = this.trip_requests.get(id)
    if (!obj) {
      throw new Error(\`unknown TripRequest id: \${id}\`)
    }
    console.log(\`[CabBookingService.getTripRequest] found id=\${obj.id}\`)
    return obj
  }

  closeRider(id: string): Rider {
    const obj = this.getRider(id)
    console.log(\`[CabBookingService.closeRider] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveRiders(): Rider[] {
    const active = [...this.riders.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[CabBookingService.listActiveRiders] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct CabBookingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new CabBookingService()
  console.log('========== STEP 2: Create Rider objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createRider('alpha-rider')
  system.createRider('beta-rider')
  console.log('========== STEP 3: Create Driver ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createDriver('sample-driver')
  console.log('========== STEP 4: Create Vehicle ==========')
  system.createVehicle('sample-vehicle')
  console.log('========== STEP 5: Create Trip ==========')
  system.createTrip('sample-trip')
  console.log('========== STEP 6: Create TripRequest ==========')
  system.createTripRequest('sample-trip_request')
  system.listActiveRiders()
  console.log('========== Close first Rider ==========')
  system.closeRider(first.id)
  try {
    system.closeRider(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getRider('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Rider {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Rider(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Rider requires id and name");
    }
    cout << "[Rider.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Rider invalid status");
    }
    cout << "[Rider.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Rider cannot close");
    }
    status_ = "CLOSED";
    cout << "[Rider.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Driver {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Driver(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Driver requires id and name");
    }
    cout << "[Driver.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Driver invalid status");
    }
    cout << "[Driver.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Driver cannot close");
    }
    status_ = "CLOSED";
    cout << "[Driver.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Vehicle {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Vehicle(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Vehicle requires id and name");
    }
    cout << "[Vehicle.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Vehicle invalid status");
    }
    cout << "[Vehicle.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Vehicle cannot close");
    }
    status_ = "CLOSED";
    cout << "[Vehicle.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Trip {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Trip(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Trip requires id and name");
    }
    cout << "[Trip.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Trip invalid status");
    }
    cout << "[Trip.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Trip cannot close");
    }
    status_ = "CLOSED";
    cout << "[Trip.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class TripRequest {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  TripRequest(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("TripRequest requires id and name");
    }
    cout << "[TripRequest.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("TripRequest invalid status");
    }
    cout << "[TripRequest.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("TripRequest cannot close");
    }
    status_ = "CLOSED";
    cout << "[TripRequest.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class CabBookingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Rider> riders_;
  unordered_map<string, Driver> drivers_;
  unordered_map<string, Vehicle> vehicles_;
  unordered_map<string, Trip> trips_;
  unordered_map<string, TripRequest> trip_requests_;
public:
  CabBookingService() {
    cout << "[CabBookingService.__init__] system ready" << endl;
  }

  Rider createRider(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Rider name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "RID-%04d", seq_++);
    Rider obj{buf, name};
    obj.validate();
    riders_.emplace(obj.id(), obj);
    cout << "[CabBookingService.createRider] stored " << obj.id() << endl;
    return obj;
  }

  Rider getRider(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = riders_.find(id);
    if (it == riders_.end()) {
      throw out_of_range("unknown Rider id");
    }
    cout << "[CabBookingService.getRider] found " << id << endl;
    return it->second;
  }

  Driver createDriver(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Driver name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DRI-%04d", seq_++);
    Driver obj{buf, name};
    obj.validate();
    drivers_.emplace(obj.id(), obj);
    cout << "[CabBookingService.createDriver] stored " << obj.id() << endl;
    return obj;
  }

  Driver getDriver(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = drivers_.find(id);
    if (it == drivers_.end()) {
      throw out_of_range("unknown Driver id");
    }
    cout << "[CabBookingService.getDriver] found " << id << endl;
    return it->second;
  }

  Vehicle createVehicle(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Vehicle name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "VEH-%04d", seq_++);
    Vehicle obj{buf, name};
    obj.validate();
    vehicles_.emplace(obj.id(), obj);
    cout << "[CabBookingService.createVehicle] stored " << obj.id() << endl;
    return obj;
  }

  Vehicle getVehicle(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = vehicles_.find(id);
    if (it == vehicles_.end()) {
      throw out_of_range("unknown Vehicle id");
    }
    cout << "[CabBookingService.getVehicle] found " << id << endl;
    return it->second;
  }

  Trip createTrip(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Trip name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TRI-%04d", seq_++);
    Trip obj{buf, name};
    obj.validate();
    trips_.emplace(obj.id(), obj);
    cout << "[CabBookingService.createTrip] stored " << obj.id() << endl;
    return obj;
  }

  Trip getTrip(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = trips_.find(id);
    if (it == trips_.end()) {
      throw out_of_range("unknown Trip id");
    }
    cout << "[CabBookingService.getTrip] found " << id << endl;
    return it->second;
  }

  TripRequest createTripRequest(const string& name) {
    if (name.empty()) {
      throw invalid_argument("TripRequest name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TRI-%04d", seq_++);
    TripRequest obj{buf, name};
    obj.validate();
    trip_requests_.emplace(obj.id(), obj);
    cout << "[CabBookingService.createTripRequest] stored " << obj.id() << endl;
    return obj;
  }

  TripRequest getTripRequest(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = trip_requests_.find(id);
    if (it == trip_requests_.end()) {
      throw out_of_range("unknown TripRequest id");
    }
    cout << "[CabBookingService.getTripRequest] found " << id << endl;
    return it->second;
  }

  Rider closeRider(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = riders_.find(id);
    if (it == riders_.end()) {
      throw out_of_range("unknown Rider");
    }
    cout << "[CabBookingService.closeRider] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct CabBookingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  CabBookingService system;
  cout << "========== STEP 2: Create Rider ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createRider("alpha-rider");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createRider("beta-rider");
  system.createDriver("sample-driver");
  system.createVehicle("sample-vehicle");
  system.createTrip("sample-trip");
  system.createTripRequest("sample-trip_request");
  system.closeRider(first.id());
  try {
    system.closeRider(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getRider("MISSING-ID");
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

type Rider struct {
  ID     string
  Name   string
  Status string
}

func NewRider(id, name string) (*Rider, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Rider requires id and name")
  }
  obj := &Rider{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Rider.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Rider) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Rider invalid status")
  }
  fmt.Printf("[Rider.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Rider) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Rider %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Rider.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Driver struct {
  ID     string
  Name   string
  Status string
}

func NewDriver(id, name string) (*Driver, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Driver requires id and name")
  }
  obj := &Driver{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Driver.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Driver) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Driver invalid status")
  }
  fmt.Printf("[Driver.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Driver) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Driver %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Driver.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Vehicle struct {
  ID     string
  Name   string
  Status string
}

func NewVehicle(id, name string) (*Vehicle, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Vehicle requires id and name")
  }
  obj := &Vehicle{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Vehicle.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Vehicle) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Vehicle invalid status")
  }
  fmt.Printf("[Vehicle.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Vehicle) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Vehicle %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Vehicle.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Trip struct {
  ID     string
  Name   string
  Status string
}

func NewTrip(id, name string) (*Trip, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Trip requires id and name")
  }
  obj := &Trip{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Trip.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Trip) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Trip invalid status")
  }
  fmt.Printf("[Trip.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Trip) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Trip %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Trip.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type TripRequest struct {
  ID     string
  Name   string
  Status string
}

func NewTripRequest(id, name string) (*TripRequest, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("TripRequest requires id and name")
  }
  obj := &TripRequest{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[TripRequest.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *TripRequest) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("TripRequest invalid status")
  }
  fmt.Printf("[TripRequest.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *TripRequest) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("TripRequest %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[TripRequest.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type CabBookingService struct {
  mu  sync.Mutex
  seq int
  riders map[string]*Rider
  drivers map[string]*Driver
  vehicles map[string]*Vehicle
  trips map[string]*Trip
  trip_requests map[string]*TripRequest
}

func NewCabBookingService() *CabBookingService {
  fmt.Println("[CabBookingService.__init__] system ready")
  return &CabBookingService{
    seq: 1,
    riders: map[string]*Rider{},
    drivers: map[string]*Driver{},
    vehicles: map[string]*Vehicle{},
    trips: map[string]*Trip{},
    trip_requests: map[string]*TripRequest{},
  }
}

func (s *CabBookingService) CreateRider(name string) (*Rider, error) {
  if name == "" {
    return nil, fmt.Errorf("Rider name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("RID-%04d", s.seq)
  s.seq++
  obj, err := NewRider(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.riders[id] = obj
  fmt.Printf("[CabBookingService.CreateRider] stored %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) GetRider(id string) (*Rider, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.riders[id]
  if !ok {
    return nil, fmt.Errorf("unknown Rider id: %s", id)
  }
  fmt.Printf("[CabBookingService.GetRider] found %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) CreateDriver(name string) (*Driver, error) {
  if name == "" {
    return nil, fmt.Errorf("Driver name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DRI-%04d", s.seq)
  s.seq++
  obj, err := NewDriver(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.drivers[id] = obj
  fmt.Printf("[CabBookingService.CreateDriver] stored %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) GetDriver(id string) (*Driver, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.drivers[id]
  if !ok {
    return nil, fmt.Errorf("unknown Driver id: %s", id)
  }
  fmt.Printf("[CabBookingService.GetDriver] found %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) CreateVehicle(name string) (*Vehicle, error) {
  if name == "" {
    return nil, fmt.Errorf("Vehicle name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("VEH-%04d", s.seq)
  s.seq++
  obj, err := NewVehicle(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.vehicles[id] = obj
  fmt.Printf("[CabBookingService.CreateVehicle] stored %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) GetVehicle(id string) (*Vehicle, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.vehicles[id]
  if !ok {
    return nil, fmt.Errorf("unknown Vehicle id: %s", id)
  }
  fmt.Printf("[CabBookingService.GetVehicle] found %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) CreateTrip(name string) (*Trip, error) {
  if name == "" {
    return nil, fmt.Errorf("Trip name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TRI-%04d", s.seq)
  s.seq++
  obj, err := NewTrip(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.trips[id] = obj
  fmt.Printf("[CabBookingService.CreateTrip] stored %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) GetTrip(id string) (*Trip, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.trips[id]
  if !ok {
    return nil, fmt.Errorf("unknown Trip id: %s", id)
  }
  fmt.Printf("[CabBookingService.GetTrip] found %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) CreateTripRequest(name string) (*TripRequest, error) {
  if name == "" {
    return nil, fmt.Errorf("TripRequest name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TRI-%04d", s.seq)
  s.seq++
  obj, err := NewTripRequest(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.trip_requests[id] = obj
  fmt.Printf("[CabBookingService.CreateTripRequest] stored %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) GetTripRequest(id string) (*TripRequest, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.trip_requests[id]
  if !ok {
    return nil, fmt.Errorf("unknown TripRequest id: %s", id)
  }
  fmt.Printf("[CabBookingService.GetTripRequest] found %s\\n", id)
  return obj, nil
}

func (s *CabBookingService) CloseRider(id string) (*Rider, error) {
  obj, err := s.GetRider(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[CabBookingService.CloseRider] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct CabBookingService ==========")
  system := NewCabBookingService()
  fmt.Println("========== STEP 2: Create Rider ==========")
  first, _ := system.CreateRider("alpha-rider")
  system.CreateRider("beta-rider")
  system.CreateDriver("sample-driver")
  system.CreateVehicle("sample-vehicle")
  system.CreateTrip("sample-trip")
  system.CreateTripRequest("sample-trip_request")
  system.CloseRider(first.ID)
  if _, err := system.CloseRider(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetRider("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Rider {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Rider(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Rider requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Rider.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Rider invalid status");
    }
    Console.WriteLine("[Rider.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Rider " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Rider.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Driver {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Driver(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Driver requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Driver.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Driver invalid status");
    }
    Console.WriteLine("[Driver.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Driver " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Driver.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Vehicle {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Vehicle(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Vehicle requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Vehicle.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Vehicle invalid status");
    }
    Console.WriteLine("[Vehicle.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Vehicle " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Vehicle.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Trip {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Trip(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Trip requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Trip.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Trip invalid status");
    }
    Console.WriteLine("[Trip.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Trip " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Trip.close] id=" + Id + " -> CLOSED");
  }
}


sealed class TripRequest {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public TripRequest(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TripRequest requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[TripRequest.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("TripRequest invalid status");
    }
    Console.WriteLine("[TripRequest.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("TripRequest " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[TripRequest.close] id=" + Id + " -> CLOSED");
  }
}

sealed class CabBookingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Rider> _riders = new();
  private readonly Dictionary<string, Driver> _drivers = new();
  private readonly Dictionary<string, Vehicle> _vehicles = new();
  private readonly Dictionary<string, Trip> _trips = new();
  private readonly Dictionary<string, TripRequest> _trip_requests = new();
  public CabBookingService() {
    Console.WriteLine("[CabBookingService.__init__] system ready");
  }

  public Rider CreateRider(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Rider name required");
    }
    lock (_gate) {
      var id = string.Format("RID-{0:D4}", _seq++);
      var obj = new Rider(id, name.Trim());
      obj.Validate();
      _riders[id] = obj;
      Console.WriteLine("[CabBookingService.CreateRider] stored " + id);
      return obj;
    }
  }

  public Rider GetRider(string id) {
    lock (_gate) {
      if (!_riders.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Rider id: " + id);
      }
      Console.WriteLine("[CabBookingService.GetRider] found " + id);
      return obj;
    }
  }

  public Driver CreateDriver(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Driver name required");
    }
    lock (_gate) {
      var id = string.Format("DRI-{0:D4}", _seq++);
      var obj = new Driver(id, name.Trim());
      obj.Validate();
      _drivers[id] = obj;
      Console.WriteLine("[CabBookingService.CreateDriver] stored " + id);
      return obj;
    }
  }

  public Driver GetDriver(string id) {
    lock (_gate) {
      if (!_drivers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Driver id: " + id);
      }
      Console.WriteLine("[CabBookingService.GetDriver] found " + id);
      return obj;
    }
  }

  public Vehicle CreateVehicle(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Vehicle name required");
    }
    lock (_gate) {
      var id = string.Format("VEH-{0:D4}", _seq++);
      var obj = new Vehicle(id, name.Trim());
      obj.Validate();
      _vehicles[id] = obj;
      Console.WriteLine("[CabBookingService.CreateVehicle] stored " + id);
      return obj;
    }
  }

  public Vehicle GetVehicle(string id) {
    lock (_gate) {
      if (!_vehicles.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Vehicle id: " + id);
      }
      Console.WriteLine("[CabBookingService.GetVehicle] found " + id);
      return obj;
    }
  }

  public Trip CreateTrip(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Trip name required");
    }
    lock (_gate) {
      var id = string.Format("TRI-{0:D4}", _seq++);
      var obj = new Trip(id, name.Trim());
      obj.Validate();
      _trips[id] = obj;
      Console.WriteLine("[CabBookingService.CreateTrip] stored " + id);
      return obj;
    }
  }

  public Trip GetTrip(string id) {
    lock (_gate) {
      if (!_trips.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Trip id: " + id);
      }
      Console.WriteLine("[CabBookingService.GetTrip] found " + id);
      return obj;
    }
  }

  public TripRequest CreateTripRequest(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TripRequest name required");
    }
    lock (_gate) {
      var id = string.Format("TRI-{0:D4}", _seq++);
      var obj = new TripRequest(id, name.Trim());
      obj.Validate();
      _trip_requests[id] = obj;
      Console.WriteLine("[CabBookingService.CreateTripRequest] stored " + id);
      return obj;
    }
  }

  public TripRequest GetTripRequest(string id) {
    lock (_gate) {
      if (!_trip_requests.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown TripRequest id: " + id);
      }
      Console.WriteLine("[CabBookingService.GetTripRequest] found " + id);
      return obj;
    }
  }

  public Rider CloseRider(string id) {
    var obj = GetRider(id);
    Console.WriteLine("[CabBookingService.CloseRider] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct CabBookingService ==========");
    var system = new CabBookingService();
    Console.WriteLine("========== STEP 2: Create Rider ==========");
    var first = system.CreateRider("alpha-rider");
    system.CreateRider("beta-rider");
    system.CreateDriver("sample-driver");
    system.CreateVehicle("sample-vehicle");
    system.CreateTrip("sample-trip");
    system.CreateTripRequest("sample-trip_request");
    system.CloseRider(first.Id);
    try {
      system.CloseRider(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetRider("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const cabBookingSolution: ProblemSolution = {
  slug: 'cab-booking',
  title: 'Cab Booking System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a ride-hailing platform like Uber (simplified) — users request rides, drivers accept, and the system manages matching and pricing. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Rider requests a ride specifying pickup and drop-off locations',
      'System matches the rider to the nearest available driver',
      'Show estimated fare before confirming the ride',
      'Driver can accept or reject the ride request',
      'Real-time trip tracking for both rider and driver',
      'Fare calculation based on distance, time, and surge pricing',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Rider requests a ride specifying pickup and drop-off locations?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'System matches the rider to the nearest available driver?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Show estimated fare before confirming the ride?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Driver can accept or reject the ride request?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Real-time trip tracking for both rider and driver?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. CabBookingService is the facade stereotype. Rider, Driver, Vehicle, Trip, TripRequest are concrete domain classes with id/name/status and validate/close.',
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
          'Construct CabBookingService.',
          'createRider twice and create the related UML classes.',
          'closeRider once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'CabBookingService', responsibility: 'UML facade - orchestrates Cab Booking System.', keyMembers: ['create*', 'get*', 'closeRider'] },
    { name: 'Rider', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Driver', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Vehicle', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Trip', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TripRequest', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from CabBookingService to Rider, Driver, Vehicle, Trip, TripRequest. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on CabBookingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'CabBookingService', responsibility: 'UML facade - orchestrates Cab Booking System.', keyMembers: ['create*', 'get*', 'closeRider'] },
    { name: 'Rider', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Driver', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Vehicle', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Trip', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TripRequest', responsibility: 'UML class - domain object for Cab Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'CabBookingService exposes create/get/close and owns composed collections.' },
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
      'main constructs CabBookingService, creates UML domain objects, closes the primary Rider, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct CabBookingService.',
      'createRider for alpha and beta.',
      'create remaining UML classes.',
      'closeRider(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createRider("alpha..."); closeRider(id)',
        output: '[Rider.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeRider(alreadyClosed) or getRider("MISSING-ID")',
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
