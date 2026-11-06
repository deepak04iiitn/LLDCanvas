import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'CarRentalService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_vehicles', 'Map<string, Vehicle>'),
    attr('-', '_vehicle_categories', 'Map<string, VehicleCategory>'),
    attr('-', '_locations', 'Map<string, Location>'),
    attr('-', '_reservations', 'Map<string, Reservation>'),
    attr('-', '_payments', 'Map<string, Payment>'),
  ], [
    method('+', 'createVehicle', 'name: string', 'Vehicle'),
    method('+', 'createVehicleCategory', 'name: string', 'VehicleCategory'),
    method('+', 'createLocation', 'name: string', 'Location'),
    method('+', 'createReservation', 'name: string', 'Reservation'),
    method('+', 'createPayment', 'name: string', 'Payment'),
    method('+', 'getVehicle', 'id: string', 'Vehicle'),
    method('+', 'getVehicleCategory', 'id: string', 'VehicleCategory'),
    method('+', 'getLocation', 'id: string', 'Location'),
    method('+', 'getReservation', 'id: string', 'Reservation'),
    method('+', 'getPayment', 'id: string', 'Payment'),
    method('+', 'closeVehicle', 'id: string', 'Vehicle'),
  ], 'facade'),
  cls('n1', 'Vehicle', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'VehicleCategory', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Location', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Reservation', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Payment', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("car-rental")


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


class VehicleCategory:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("VehicleCategory.id is required")
        if not name or not name.strip():
            raise ValueError("VehicleCategory.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[VehicleCategory.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"VehicleCategory {self.id} has invalid status={self.status}")
        log.info("[VehicleCategory.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"VehicleCategory {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[VehicleCategory.close] id=%s -> CLOSED", self.id)


class Location:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Location.id is required")
        if not name or not name.strip():
            raise ValueError("Location.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Location.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Location {self.id} has invalid status={self.status}")
        log.info("[Location.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Location {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Location.close] id=%s -> CLOSED", self.id)


class Reservation:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Reservation.id is required")
        if not name or not name.strip():
            raise ValueError("Reservation.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Reservation.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Reservation {self.id} has invalid status={self.status}")
        log.info("[Reservation.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Reservation {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Reservation.close] id=%s -> CLOSED", self.id)


class Payment:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Payment.id is required")
        if not name or not name.strip():
            raise ValueError("Payment.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Payment.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Payment {self.id} has invalid status={self.status}")
        log.info("[Payment.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Payment {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Payment.close] id=%s -> CLOSED", self.id)


class CarRentalService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._vehicles: Dict[str, Vehicle] = {}
        self._vehicle_categories: Dict[str, VehicleCategory] = {}
        self._locations: Dict[str, Location] = {}
        self._reservations: Dict[str, Reservation] = {}
        self._payments: Dict[str, Payment] = {}
        log.info("[CarRentalService.__init__] system ready; managing: Vehicle, VehicleCategory, Location, Reservation, Payment")

    def create_vehicle(self, name: str) -> Vehicle:
        """UML: CarRentalService.create_vehicle(name) -> Vehicle"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Vehicle name is required")
        with self._lock:
            item_id = f"VEH-{self._seq:04d}"
            self._seq += 1
            obj = Vehicle(item_id, cleaned)
            obj.validate()
            self._vehicles[item_id] = obj
            log.info("[CarRentalService.create_vehicle] stored %s in _vehicles (count=%s)", item_id, len(self._vehicles))
            return obj

    def get_vehicle(self, item_id: str) -> Vehicle:
        with self._lock:
            obj = self._vehicles.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Vehicle id: {item_id}")
            log.info("[CarRentalService.get_vehicle] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_vehicle_category(self, name: str) -> VehicleCategory:
        """UML: CarRentalService.create_vehicle_category(name) -> VehicleCategory"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("VehicleCategory name is required")
        with self._lock:
            item_id = f"VEH-{self._seq:04d}"
            self._seq += 1
            obj = VehicleCategory(item_id, cleaned)
            obj.validate()
            self._vehicle_categories[item_id] = obj
            log.info("[CarRentalService.create_vehicle_category] stored %s in _vehicle_categories (count=%s)", item_id, len(self._vehicle_categories))
            return obj

    def get_vehicle_category(self, item_id: str) -> VehicleCategory:
        with self._lock:
            obj = self._vehicle_categories.get(item_id)
            if obj is None:
                raise KeyError(f"unknown VehicleCategory id: {item_id}")
            log.info("[CarRentalService.get_vehicle_category] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_location(self, name: str) -> Location:
        """UML: CarRentalService.create_location(name) -> Location"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Location name is required")
        with self._lock:
            item_id = f"LOC-{self._seq:04d}"
            self._seq += 1
            obj = Location(item_id, cleaned)
            obj.validate()
            self._locations[item_id] = obj
            log.info("[CarRentalService.create_location] stored %s in _locations (count=%s)", item_id, len(self._locations))
            return obj

    def get_location(self, item_id: str) -> Location:
        with self._lock:
            obj = self._locations.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Location id: {item_id}")
            log.info("[CarRentalService.get_location] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_reservation(self, name: str) -> Reservation:
        """UML: CarRentalService.create_reservation(name) -> Reservation"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Reservation name is required")
        with self._lock:
            item_id = f"RES-{self._seq:04d}"
            self._seq += 1
            obj = Reservation(item_id, cleaned)
            obj.validate()
            self._reservations[item_id] = obj
            log.info("[CarRentalService.create_reservation] stored %s in _reservations (count=%s)", item_id, len(self._reservations))
            return obj

    def get_reservation(self, item_id: str) -> Reservation:
        with self._lock:
            obj = self._reservations.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Reservation id: {item_id}")
            log.info("[CarRentalService.get_reservation] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_payment(self, name: str) -> Payment:
        """UML: CarRentalService.create_payment(name) -> Payment"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Payment name is required")
        with self._lock:
            item_id = f"PAY-{self._seq:04d}"
            self._seq += 1
            obj = Payment(item_id, cleaned)
            obj.validate()
            self._payments[item_id] = obj
            log.info("[CarRentalService.create_payment] stored %s in _payments (count=%s)", item_id, len(self._payments))
            return obj

    def get_payment(self, item_id: str) -> Payment:
        with self._lock:
            obj = self._payments.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Payment id: {item_id}")
            log.info("[CarRentalService.get_payment] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_vehicle(self, item_id: str) -> Vehicle:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._vehicles.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Vehicle id: {item_id}")
            log.info("[CarRentalService.close_vehicle] closing %s via Vehicle.close()", item_id)
            obj.close()
            return obj

    def list_active_vehicles(self) -> List[Vehicle]:
        with self._lock:
            active = [o for o in self._vehicles.values() if o.status == "ACTIVE"]
            log.info("[CarRentalService.list_active_vehicles] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct CarRentalService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = CarRentalService()

    log.info("========== STEP 2: Create primary Vehicle objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_vehicle("alpha-vehicle")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_vehicle("beta-vehicle")

    log.info("========== STEP 3: Create VehicleCategory (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_vehicle_category("sample-vehicle_category")

    log.info("========== STEP 4: Create Location (UML class) ==========")
    system.create_location("sample-location")

    log.info("========== STEP 5: Create Reservation (UML class) ==========")
    system.create_reservation("sample-reservation")

    log.info("========== STEP 6: Create Payment (UML class) ==========")
    system.create_payment("sample-payment")

    log.info("========== STEP 7: Inspect active Vehicle list ==========")
    system.list_active_vehicles()

    log.info("========== STEP 8: Close first Vehicle ==========")
    system.close_vehicle(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_vehicle(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Vehicle.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_vehicle("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_vehicle: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_vehicles()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

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


class VehicleCategory {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  VehicleCategory(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("VehicleCategory.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("VehicleCategory.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[VehicleCategory.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("VehicleCategory " + id + " invalid status");
    }
    System.out.println("[VehicleCategory.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("VehicleCategory " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[VehicleCategory.close] id=" + id + " -> CLOSED");
  }
}


class Location {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Location(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Location.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Location.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Location.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Location " + id + " invalid status");
    }
    System.out.println("[Location.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Location " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Location.close] id=" + id + " -> CLOSED");
  }
}


class Reservation {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Reservation(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Reservation.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Reservation.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Reservation.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Reservation " + id + " invalid status");
    }
    System.out.println("[Reservation.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Reservation " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Reservation.close] id=" + id + " -> CLOSED");
  }
}


class Payment {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Payment(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Payment.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Payment.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Payment.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Payment " + id + " invalid status");
    }
    System.out.println("[Payment.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Payment " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Payment.close] id=" + id + " -> CLOSED");
  }
}

public class CarRentalService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Vehicle> vehicles = new LinkedHashMap<>();
  private final Map<String, VehicleCategory> vehicle_categories = new LinkedHashMap<>();
  private final Map<String, Location> locations = new LinkedHashMap<>();
  private final Map<String, Reservation> reservations = new LinkedHashMap<>();
  private final Map<String, Payment> payments = new LinkedHashMap<>();

  public CarRentalService() {
    System.out.println("[CarRentalService.__init__] system ready");
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
      System.out.println("[CarRentalService.createVehicle] stored " + id + " count=" + vehicles.size());
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
      System.out.println("[CarRentalService.getVehicle] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public VehicleCategory createVehicleCategory(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("VehicleCategory name required");
    }
    lock.lock();
    try {
      String id = String.format("VEH-%04d", seq++);
      VehicleCategory obj = new VehicleCategory(id, name.trim());
      obj.validate();
      vehicle_categories.put(id, obj);
      System.out.println("[CarRentalService.createVehicleCategory] stored " + id + " count=" + vehicle_categories.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public VehicleCategory getVehicleCategory(String id) {
    lock.lock();
    try {
      VehicleCategory obj = vehicle_categories.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown VehicleCategory id: " + id);
      }
      System.out.println("[CarRentalService.getVehicleCategory] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Location createLocation(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Location name required");
    }
    lock.lock();
    try {
      String id = String.format("LOC-%04d", seq++);
      Location obj = new Location(id, name.trim());
      obj.validate();
      locations.put(id, obj);
      System.out.println("[CarRentalService.createLocation] stored " + id + " count=" + locations.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Location getLocation(String id) {
    lock.lock();
    try {
      Location obj = locations.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Location id: " + id);
      }
      System.out.println("[CarRentalService.getLocation] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Reservation createReservation(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Reservation name required");
    }
    lock.lock();
    try {
      String id = String.format("RES-%04d", seq++);
      Reservation obj = new Reservation(id, name.trim());
      obj.validate();
      reservations.put(id, obj);
      System.out.println("[CarRentalService.createReservation] stored " + id + " count=" + reservations.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Reservation getReservation(String id) {
    lock.lock();
    try {
      Reservation obj = reservations.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Reservation id: " + id);
      }
      System.out.println("[CarRentalService.getReservation] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Payment createPayment(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Payment name required");
    }
    lock.lock();
    try {
      String id = String.format("PAY-%04d", seq++);
      Payment obj = new Payment(id, name.trim());
      obj.validate();
      payments.put(id, obj);
      System.out.println("[CarRentalService.createPayment] stored " + id + " count=" + payments.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Payment getPayment(String id) {
    lock.lock();
    try {
      Payment obj = payments.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Payment id: " + id);
      }
      System.out.println("[CarRentalService.getPayment] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Vehicle closeVehicle(String id) {
    lock.lock();
    try {
      Vehicle obj = vehicles.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Vehicle id: " + id);
      }
      System.out.println("[CarRentalService.closeVehicle] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Vehicle> listActiveVehicles() {
    lock.lock();
    try {
      List<Vehicle> out = new ArrayList<>();
      for (Vehicle o : vehicles.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[CarRentalService.listActiveVehicles] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct CarRentalService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    CarRentalService system = new CarRentalService();
    System.out.println("========== STEP 2: Create Vehicle objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Vehicle first = system.createVehicle("alpha-vehicle");
    system.createVehicle("beta-vehicle");
    System.out.println("========== STEP 3: Create VehicleCategory ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createVehicleCategory("sample-vehicle_category");
    System.out.println("========== STEP 4: Create Location ==========");
    system.createLocation("sample-location");
    System.out.println("========== STEP 5: Create Reservation ==========");
    system.createReservation("sample-reservation");
    System.out.println("========== STEP 6: Create Payment ==========");
    system.createPayment("sample-payment");
    System.out.println("========== Inspect active list ==========");
    system.listActiveVehicles();
    System.out.println("========== Close first Vehicle ==========");
    system.closeVehicle(first.getId());
    try {
      system.closeVehicle(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getVehicle("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
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


class VehicleCategory {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('VehicleCategory.id required')
    }

    if (!name?.trim()) {
      throw new Error('VehicleCategory.name required')
    }
    console.log(\`[VehicleCategory.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`VehicleCategory \${this.id} invalid status\`)
    }
    console.log(\`[VehicleCategory.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`VehicleCategory \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[VehicleCategory.close] id=\${this.id} -> CLOSED\`)
  }
}


class Location {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Location.id required')
    }

    if (!name?.trim()) {
      throw new Error('Location.name required')
    }
    console.log(\`[Location.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Location \${this.id} invalid status\`)
    }
    console.log(\`[Location.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Location \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Location.close] id=\${this.id} -> CLOSED\`)
  }
}


class Reservation {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Reservation.id required')
    }

    if (!name?.trim()) {
      throw new Error('Reservation.name required')
    }
    console.log(\`[Reservation.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Reservation \${this.id} invalid status\`)
    }
    console.log(\`[Reservation.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Reservation \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Reservation.close] id=\${this.id} -> CLOSED\`)
  }
}


class Payment {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Payment.id required')
    }

    if (!name?.trim()) {
      throw new Error('Payment.name required')
    }
    console.log(\`[Payment.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Payment \${this.id} invalid status\`)
    }
    console.log(\`[Payment.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Payment \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Payment.close] id=\${this.id} -> CLOSED\`)
  }
}

class CarRentalService {
  private seq = 1
  private vehicles = new Map<string, Vehicle>()
  private vehicle_categories = new Map<string, VehicleCategory>()
  private locations = new Map<string, Location>()
  private reservations = new Map<string, Reservation>()
  private payments = new Map<string, Payment>()
  constructor() {
    console.log('[CarRentalService.__init__] system ready')
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
    console.log(\`[CarRentalService.createVehicle] stored \${id} count=\${this.vehicles.size}\`)
    return obj
  }

  getVehicle(id: string): Vehicle {
    const obj = this.vehicles.get(id)
    if (!obj) {
      throw new Error(\`unknown Vehicle id: \${id}\`)
    }
    console.log(\`[CarRentalService.getVehicle] found id=\${obj.id}\`)
    return obj
  }

  createVehicleCategory(name: string): VehicleCategory {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('VehicleCategory name required')
    }
    const id = \`VEH-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new VehicleCategory(id, cleaned)
    obj.validate()
    this.vehicle_categories.set(id, obj)
    console.log(\`[CarRentalService.createVehicleCategory] stored \${id} count=\${this.vehicle_categories.size}\`)
    return obj
  }

  getVehicleCategory(id: string): VehicleCategory {
    const obj = this.vehicle_categories.get(id)
    if (!obj) {
      throw new Error(\`unknown VehicleCategory id: \${id}\`)
    }
    console.log(\`[CarRentalService.getVehicleCategory] found id=\${obj.id}\`)
    return obj
  }

  createLocation(name: string): Location {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Location name required')
    }
    const id = \`LOC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Location(id, cleaned)
    obj.validate()
    this.locations.set(id, obj)
    console.log(\`[CarRentalService.createLocation] stored \${id} count=\${this.locations.size}\`)
    return obj
  }

  getLocation(id: string): Location {
    const obj = this.locations.get(id)
    if (!obj) {
      throw new Error(\`unknown Location id: \${id}\`)
    }
    console.log(\`[CarRentalService.getLocation] found id=\${obj.id}\`)
    return obj
  }

  createReservation(name: string): Reservation {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Reservation name required')
    }
    const id = \`RES-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Reservation(id, cleaned)
    obj.validate()
    this.reservations.set(id, obj)
    console.log(\`[CarRentalService.createReservation] stored \${id} count=\${this.reservations.size}\`)
    return obj
  }

  getReservation(id: string): Reservation {
    const obj = this.reservations.get(id)
    if (!obj) {
      throw new Error(\`unknown Reservation id: \${id}\`)
    }
    console.log(\`[CarRentalService.getReservation] found id=\${obj.id}\`)
    return obj
  }

  createPayment(name: string): Payment {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Payment name required')
    }
    const id = \`PAY-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Payment(id, cleaned)
    obj.validate()
    this.payments.set(id, obj)
    console.log(\`[CarRentalService.createPayment] stored \${id} count=\${this.payments.size}\`)
    return obj
  }

  getPayment(id: string): Payment {
    const obj = this.payments.get(id)
    if (!obj) {
      throw new Error(\`unknown Payment id: \${id}\`)
    }
    console.log(\`[CarRentalService.getPayment] found id=\${obj.id}\`)
    return obj
  }

  closeVehicle(id: string): Vehicle {
    const obj = this.getVehicle(id)
    console.log(\`[CarRentalService.closeVehicle] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveVehicles(): Vehicle[] {
    const active = [...this.vehicles.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[CarRentalService.listActiveVehicles] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct CarRentalService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new CarRentalService()
  console.log('========== STEP 2: Create Vehicle objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createVehicle('alpha-vehicle')
  system.createVehicle('beta-vehicle')
  console.log('========== STEP 3: Create VehicleCategory ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createVehicleCategory('sample-vehicle_category')
  console.log('========== STEP 4: Create Location ==========')
  system.createLocation('sample-location')
  console.log('========== STEP 5: Create Reservation ==========')
  system.createReservation('sample-reservation')
  console.log('========== STEP 6: Create Payment ==========')
  system.createPayment('sample-payment')
  system.listActiveVehicles()
  console.log('========== Close first Vehicle ==========')
  system.closeVehicle(first.id)
  try {
    system.closeVehicle(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getVehicle('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

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


class VehicleCategory {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  VehicleCategory(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("VehicleCategory requires id and name");
    }
    cout << "[VehicleCategory.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("VehicleCategory invalid status");
    }
    cout << "[VehicleCategory.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("VehicleCategory cannot close");
    }
    status_ = "CLOSED";
    cout << "[VehicleCategory.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Location {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Location(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Location requires id and name");
    }
    cout << "[Location.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Location invalid status");
    }
    cout << "[Location.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Location cannot close");
    }
    status_ = "CLOSED";
    cout << "[Location.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Reservation {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Reservation(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Reservation requires id and name");
    }
    cout << "[Reservation.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Reservation invalid status");
    }
    cout << "[Reservation.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Reservation cannot close");
    }
    status_ = "CLOSED";
    cout << "[Reservation.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Payment {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Payment(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Payment requires id and name");
    }
    cout << "[Payment.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Payment invalid status");
    }
    cout << "[Payment.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Payment cannot close");
    }
    status_ = "CLOSED";
    cout << "[Payment.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class CarRentalService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Vehicle> vehicles_;
  unordered_map<string, VehicleCategory> vehicle_categories_;
  unordered_map<string, Location> locations_;
  unordered_map<string, Reservation> reservations_;
  unordered_map<string, Payment> payments_;
public:
  CarRentalService() {
    cout << "[CarRentalService.__init__] system ready" << endl;
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
    cout << "[CarRentalService.createVehicle] stored " << obj.id() << endl;
    return obj;
  }

  Vehicle getVehicle(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = vehicles_.find(id);
    if (it == vehicles_.end()) {
      throw out_of_range("unknown Vehicle id");
    }
    cout << "[CarRentalService.getVehicle] found " << id << endl;
    return it->second;
  }

  VehicleCategory createVehicleCategory(const string& name) {
    if (name.empty()) {
      throw invalid_argument("VehicleCategory name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "VEH-%04d", seq_++);
    VehicleCategory obj{buf, name};
    obj.validate();
    vehicle_categories_.emplace(obj.id(), obj);
    cout << "[CarRentalService.createVehicleCategory] stored " << obj.id() << endl;
    return obj;
  }

  VehicleCategory getVehicleCategory(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = vehicle_categories_.find(id);
    if (it == vehicle_categories_.end()) {
      throw out_of_range("unknown VehicleCategory id");
    }
    cout << "[CarRentalService.getVehicleCategory] found " << id << endl;
    return it->second;
  }

  Location createLocation(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Location name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LOC-%04d", seq_++);
    Location obj{buf, name};
    obj.validate();
    locations_.emplace(obj.id(), obj);
    cout << "[CarRentalService.createLocation] stored " << obj.id() << endl;
    return obj;
  }

  Location getLocation(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = locations_.find(id);
    if (it == locations_.end()) {
      throw out_of_range("unknown Location id");
    }
    cout << "[CarRentalService.getLocation] found " << id << endl;
    return it->second;
  }

  Reservation createReservation(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Reservation name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "RES-%04d", seq_++);
    Reservation obj{buf, name};
    obj.validate();
    reservations_.emplace(obj.id(), obj);
    cout << "[CarRentalService.createReservation] stored " << obj.id() << endl;
    return obj;
  }

  Reservation getReservation(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = reservations_.find(id);
    if (it == reservations_.end()) {
      throw out_of_range("unknown Reservation id");
    }
    cout << "[CarRentalService.getReservation] found " << id << endl;
    return it->second;
  }

  Payment createPayment(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Payment name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PAY-%04d", seq_++);
    Payment obj{buf, name};
    obj.validate();
    payments_.emplace(obj.id(), obj);
    cout << "[CarRentalService.createPayment] stored " << obj.id() << endl;
    return obj;
  }

  Payment getPayment(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = payments_.find(id);
    if (it == payments_.end()) {
      throw out_of_range("unknown Payment id");
    }
    cout << "[CarRentalService.getPayment] found " << id << endl;
    return it->second;
  }

  Vehicle closeVehicle(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = vehicles_.find(id);
    if (it == vehicles_.end()) {
      throw out_of_range("unknown Vehicle");
    }
    cout << "[CarRentalService.closeVehicle] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct CarRentalService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  CarRentalService system;
  cout << "========== STEP 2: Create Vehicle ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createVehicle("alpha-vehicle");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createVehicle("beta-vehicle");
  system.createVehicleCategory("sample-vehicle_category");
  system.createLocation("sample-location");
  system.createReservation("sample-reservation");
  system.createPayment("sample-payment");
  system.closeVehicle(first.id());
  try {
    system.closeVehicle(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getVehicle("MISSING-ID");
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


type VehicleCategory struct {
  ID     string
  Name   string
  Status string
}

func NewVehicleCategory(id, name string) (*VehicleCategory, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("VehicleCategory requires id and name")
  }
  obj := &VehicleCategory{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[VehicleCategory.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *VehicleCategory) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("VehicleCategory invalid status")
  }
  fmt.Printf("[VehicleCategory.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *VehicleCategory) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("VehicleCategory %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[VehicleCategory.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Location struct {
  ID     string
  Name   string
  Status string
}

func NewLocation(id, name string) (*Location, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Location requires id and name")
  }
  obj := &Location{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Location.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Location) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Location invalid status")
  }
  fmt.Printf("[Location.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Location) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Location %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Location.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Reservation struct {
  ID     string
  Name   string
  Status string
}

func NewReservation(id, name string) (*Reservation, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Reservation requires id and name")
  }
  obj := &Reservation{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Reservation.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Reservation) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Reservation invalid status")
  }
  fmt.Printf("[Reservation.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Reservation) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Reservation %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Reservation.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Payment struct {
  ID     string
  Name   string
  Status string
}

func NewPayment(id, name string) (*Payment, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Payment requires id and name")
  }
  obj := &Payment{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Payment.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Payment) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Payment invalid status")
  }
  fmt.Printf("[Payment.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Payment) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Payment %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Payment.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type CarRentalService struct {
  mu  sync.Mutex
  seq int
  vehicles map[string]*Vehicle
  vehicle_categories map[string]*VehicleCategory
  locations map[string]*Location
  reservations map[string]*Reservation
  payments map[string]*Payment
}

func NewCarRentalService() *CarRentalService {
  fmt.Println("[CarRentalService.__init__] system ready")
  return &CarRentalService{
    seq: 1,
    vehicles: map[string]*Vehicle{},
    vehicle_categories: map[string]*VehicleCategory{},
    locations: map[string]*Location{},
    reservations: map[string]*Reservation{},
    payments: map[string]*Payment{},
  }
}

func (s *CarRentalService) CreateVehicle(name string) (*Vehicle, error) {
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
  fmt.Printf("[CarRentalService.CreateVehicle] stored %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) GetVehicle(id string) (*Vehicle, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.vehicles[id]
  if !ok {
    return nil, fmt.Errorf("unknown Vehicle id: %s", id)
  }
  fmt.Printf("[CarRentalService.GetVehicle] found %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) CreateVehicleCategory(name string) (*VehicleCategory, error) {
  if name == "" {
    return nil, fmt.Errorf("VehicleCategory name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("VEH-%04d", s.seq)
  s.seq++
  obj, err := NewVehicleCategory(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.vehicle_categories[id] = obj
  fmt.Printf("[CarRentalService.CreateVehicleCategory] stored %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) GetVehicleCategory(id string) (*VehicleCategory, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.vehicle_categories[id]
  if !ok {
    return nil, fmt.Errorf("unknown VehicleCategory id: %s", id)
  }
  fmt.Printf("[CarRentalService.GetVehicleCategory] found %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) CreateLocation(name string) (*Location, error) {
  if name == "" {
    return nil, fmt.Errorf("Location name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LOC-%04d", s.seq)
  s.seq++
  obj, err := NewLocation(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.locations[id] = obj
  fmt.Printf("[CarRentalService.CreateLocation] stored %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) GetLocation(id string) (*Location, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.locations[id]
  if !ok {
    return nil, fmt.Errorf("unknown Location id: %s", id)
  }
  fmt.Printf("[CarRentalService.GetLocation] found %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) CreateReservation(name string) (*Reservation, error) {
  if name == "" {
    return nil, fmt.Errorf("Reservation name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("RES-%04d", s.seq)
  s.seq++
  obj, err := NewReservation(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.reservations[id] = obj
  fmt.Printf("[CarRentalService.CreateReservation] stored %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) GetReservation(id string) (*Reservation, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.reservations[id]
  if !ok {
    return nil, fmt.Errorf("unknown Reservation id: %s", id)
  }
  fmt.Printf("[CarRentalService.GetReservation] found %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) CreatePayment(name string) (*Payment, error) {
  if name == "" {
    return nil, fmt.Errorf("Payment name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PAY-%04d", s.seq)
  s.seq++
  obj, err := NewPayment(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.payments[id] = obj
  fmt.Printf("[CarRentalService.CreatePayment] stored %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) GetPayment(id string) (*Payment, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.payments[id]
  if !ok {
    return nil, fmt.Errorf("unknown Payment id: %s", id)
  }
  fmt.Printf("[CarRentalService.GetPayment] found %s\\n", id)
  return obj, nil
}

func (s *CarRentalService) CloseVehicle(id string) (*Vehicle, error) {
  obj, err := s.GetVehicle(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[CarRentalService.CloseVehicle] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct CarRentalService ==========")
  system := NewCarRentalService()
  fmt.Println("========== STEP 2: Create Vehicle ==========")
  first, _ := system.CreateVehicle("alpha-vehicle")
  system.CreateVehicle("beta-vehicle")
  system.CreateVehicleCategory("sample-vehicle_category")
  system.CreateLocation("sample-location")
  system.CreateReservation("sample-reservation")
  system.CreatePayment("sample-payment")
  system.CloseVehicle(first.ID)
  if _, err := system.CloseVehicle(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetVehicle("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

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


sealed class VehicleCategory {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public VehicleCategory(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("VehicleCategory requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[VehicleCategory.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("VehicleCategory invalid status");
    }
    Console.WriteLine("[VehicleCategory.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("VehicleCategory " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[VehicleCategory.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Location {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Location(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Location requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Location.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Location invalid status");
    }
    Console.WriteLine("[Location.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Location " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Location.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Reservation {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Reservation(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Reservation requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Reservation.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Reservation invalid status");
    }
    Console.WriteLine("[Reservation.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Reservation " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Reservation.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Payment {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Payment(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Payment requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Payment.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Payment invalid status");
    }
    Console.WriteLine("[Payment.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Payment " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Payment.close] id=" + Id + " -> CLOSED");
  }
}

sealed class CarRentalService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Vehicle> _vehicles = new();
  private readonly Dictionary<string, VehicleCategory> _vehicle_categories = new();
  private readonly Dictionary<string, Location> _locations = new();
  private readonly Dictionary<string, Reservation> _reservations = new();
  private readonly Dictionary<string, Payment> _payments = new();
  public CarRentalService() {
    Console.WriteLine("[CarRentalService.__init__] system ready");
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
      Console.WriteLine("[CarRentalService.CreateVehicle] stored " + id);
      return obj;
    }
  }

  public Vehicle GetVehicle(string id) {
    lock (_gate) {
      if (!_vehicles.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Vehicle id: " + id);
      }
      Console.WriteLine("[CarRentalService.GetVehicle] found " + id);
      return obj;
    }
  }

  public VehicleCategory CreateVehicleCategory(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("VehicleCategory name required");
    }
    lock (_gate) {
      var id = string.Format("VEH-{0:D4}", _seq++);
      var obj = new VehicleCategory(id, name.Trim());
      obj.Validate();
      _vehicle_categories[id] = obj;
      Console.WriteLine("[CarRentalService.CreateVehicleCategory] stored " + id);
      return obj;
    }
  }

  public VehicleCategory GetVehicleCategory(string id) {
    lock (_gate) {
      if (!_vehicle_categories.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown VehicleCategory id: " + id);
      }
      Console.WriteLine("[CarRentalService.GetVehicleCategory] found " + id);
      return obj;
    }
  }

  public Location CreateLocation(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Location name required");
    }
    lock (_gate) {
      var id = string.Format("LOC-{0:D4}", _seq++);
      var obj = new Location(id, name.Trim());
      obj.Validate();
      _locations[id] = obj;
      Console.WriteLine("[CarRentalService.CreateLocation] stored " + id);
      return obj;
    }
  }

  public Location GetLocation(string id) {
    lock (_gate) {
      if (!_locations.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Location id: " + id);
      }
      Console.WriteLine("[CarRentalService.GetLocation] found " + id);
      return obj;
    }
  }

  public Reservation CreateReservation(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Reservation name required");
    }
    lock (_gate) {
      var id = string.Format("RES-{0:D4}", _seq++);
      var obj = new Reservation(id, name.Trim());
      obj.Validate();
      _reservations[id] = obj;
      Console.WriteLine("[CarRentalService.CreateReservation] stored " + id);
      return obj;
    }
  }

  public Reservation GetReservation(string id) {
    lock (_gate) {
      if (!_reservations.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Reservation id: " + id);
      }
      Console.WriteLine("[CarRentalService.GetReservation] found " + id);
      return obj;
    }
  }

  public Payment CreatePayment(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Payment name required");
    }
    lock (_gate) {
      var id = string.Format("PAY-{0:D4}", _seq++);
      var obj = new Payment(id, name.Trim());
      obj.Validate();
      _payments[id] = obj;
      Console.WriteLine("[CarRentalService.CreatePayment] stored " + id);
      return obj;
    }
  }

  public Payment GetPayment(string id) {
    lock (_gate) {
      if (!_payments.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Payment id: " + id);
      }
      Console.WriteLine("[CarRentalService.GetPayment] found " + id);
      return obj;
    }
  }

  public Vehicle CloseVehicle(string id) {
    var obj = GetVehicle(id);
    Console.WriteLine("[CarRentalService.CloseVehicle] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct CarRentalService ==========");
    var system = new CarRentalService();
    Console.WriteLine("========== STEP 2: Create Vehicle ==========");
    var first = system.CreateVehicle("alpha-vehicle");
    system.CreateVehicle("beta-vehicle");
    system.CreateVehicleCategory("sample-vehicle_category");
    system.CreateLocation("sample-location");
    system.CreateReservation("sample-reservation");
    system.CreatePayment("sample-payment");
    system.CloseVehicle(first.Id);
    try {
      system.CloseVehicle(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetVehicle("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const carRentalSolution: ProblemSolution = {
  slug: 'car-rental',
  title: 'Car Rental System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a car rental platform like Hertz or Avis — users search available cars, book them, and manage reservations. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Browse available cars by type, location, and date range',
      'Reserve a car for a date range with pickup/drop location',
      'Multiple car categories: economy, sedan, SUV, luxury, electric',
      'Dynamic pricing by category, duration, and season',
      'Extend, modify, or cancel reservations',
      'Track vehicle location and mileage',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Browse available cars by type, location, and date range?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Reserve a car for a date range with pickup/drop location?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Multiple car categories: economy, sedan, SUV, luxury, electric?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Dynamic pricing by category, duration, and season?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Extend, modify, or cancel reservations?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. CarRentalService is the facade stereotype. Vehicle, VehicleCategory, Location, Reservation, Payment are concrete domain classes with id/name/status and validate/close.',
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
          'Construct CarRentalService.',
          'createVehicle twice and create the related UML classes.',
          'closeVehicle once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'CarRentalService', responsibility: 'UML facade - orchestrates Car Rental System.', keyMembers: ['create*', 'get*', 'closeVehicle'] },
    { name: 'Vehicle', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'VehicleCategory', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Location', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Reservation', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Payment', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from CarRentalService to Vehicle, VehicleCategory, Location, Reservation, Payment. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on CarRentalService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'CarRentalService', responsibility: 'UML facade - orchestrates Car Rental System.', keyMembers: ['create*', 'get*', 'closeVehicle'] },
    { name: 'Vehicle', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'VehicleCategory', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Location', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Reservation', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Payment', responsibility: 'UML class - domain object for Car Rental System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'CarRentalService exposes create/get/close and owns composed collections.' },
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
      'main constructs CarRentalService, creates UML domain objects, closes the primary Vehicle, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct CarRentalService.',
      'createVehicle for alpha and beta.',
      'create remaining UML classes.',
      'closeVehicle(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createVehicle("alpha..."); closeVehicle(id)',
        output: '[Vehicle.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeVehicle(alreadyClosed) or getVehicle("MISSING-ID")',
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
