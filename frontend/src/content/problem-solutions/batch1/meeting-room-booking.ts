import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'MeetingRoomBookingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_rooms', 'Map<string, Room>'),
    attr('-', '_bookings', 'Map<string, Booking>'),
    attr('-', '_end_times', 'Map<string, endTime>'),
    attr('-', '_organizers', 'Map<string, organizer>'),
    attr('-', '_buildings', 'Map<string, Building>'),
  ], [
    method('+', 'createRoom', 'name: string', 'Room'),
    method('+', 'createBooking', 'name: string', 'Booking'),
    method('+', 'createendTime', 'name: string', 'endTime'),
    method('+', 'createorganizer', 'name: string', 'organizer'),
    method('+', 'createBuilding', 'name: string', 'Building'),
    method('+', 'getRoom', 'id: string', 'Room'),
    method('+', 'getBooking', 'id: string', 'Booking'),
    method('+', 'getendTime', 'id: string', 'endTime'),
    method('+', 'getorganizer', 'id: string', 'organizer'),
    method('+', 'getBuilding', 'id: string', 'Building'),
    method('+', 'closeRoom', 'id: string', 'Room'),
  ], 'facade'),
  cls('n1', 'Room', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Booking', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'endTime', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'organizer', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Building', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("meeting-room-booking")


class Room:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Room.id is required")
        if not name or not name.strip():
            raise ValueError("Room.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Room.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Room {self.id} has invalid status={self.status}")
        log.info("[Room.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Room {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Room.close] id=%s -> CLOSED", self.id)


class Booking:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Booking.id is required")
        if not name or not name.strip():
            raise ValueError("Booking.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Booking.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Booking {self.id} has invalid status={self.status}")
        log.info("[Booking.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Booking {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Booking.close] id=%s -> CLOSED", self.id)


class endTime:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("endTime.id is required")
        if not name or not name.strip():
            raise ValueError("endTime.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[endTime.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"endTime {self.id} has invalid status={self.status}")
        log.info("[endTime.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"endTime {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[endTime.close] id=%s -> CLOSED", self.id)


class organizer:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("organizer.id is required")
        if not name or not name.strip():
            raise ValueError("organizer.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[organizer.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"organizer {self.id} has invalid status={self.status}")
        log.info("[organizer.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"organizer {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[organizer.close] id=%s -> CLOSED", self.id)


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


class MeetingRoomBookingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._rooms: Dict[str, Room] = {}
        self._bookings: Dict[str, Booking] = {}
        self._end_times: Dict[str, endTime] = {}
        self._organizers: Dict[str, organizer] = {}
        self._buildings: Dict[str, Building] = {}
        log.info("[MeetingRoomBookingService.__init__] system ready; managing: Room, Booking, endTime, organizer, Building")

    def create_room(self, name: str) -> Room:
        """UML: MeetingRoomBookingService.create_room(name) -> Room"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Room name is required")
        with self._lock:
            item_id = f"ROO-{self._seq:04d}"
            self._seq += 1
            obj = Room(item_id, cleaned)
            obj.validate()
            self._rooms[item_id] = obj
            log.info("[MeetingRoomBookingService.create_room] stored %s in _rooms (count=%s)", item_id, len(self._rooms))
            return obj

    def get_room(self, item_id: str) -> Room:
        with self._lock:
            obj = self._rooms.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Room id: {item_id}")
            log.info("[MeetingRoomBookingService.get_room] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_booking(self, name: str) -> Booking:
        """UML: MeetingRoomBookingService.create_booking(name) -> Booking"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Booking name is required")
        with self._lock:
            item_id = f"BOO-{self._seq:04d}"
            self._seq += 1
            obj = Booking(item_id, cleaned)
            obj.validate()
            self._bookings[item_id] = obj
            log.info("[MeetingRoomBookingService.create_booking] stored %s in _bookings (count=%s)", item_id, len(self._bookings))
            return obj

    def get_booking(self, item_id: str) -> Booking:
        with self._lock:
            obj = self._bookings.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Booking id: {item_id}")
            log.info("[MeetingRoomBookingService.get_booking] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_end_time(self, name: str) -> endTime:
        """UML: MeetingRoomBookingService.create_end_time(name) -> endTime"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("endTime name is required")
        with self._lock:
            item_id = f"END-{self._seq:04d}"
            self._seq += 1
            obj = endTime(item_id, cleaned)
            obj.validate()
            self._end_times[item_id] = obj
            log.info("[MeetingRoomBookingService.create_end_time] stored %s in _end_times (count=%s)", item_id, len(self._end_times))
            return obj

    def get_end_time(self, item_id: str) -> endTime:
        with self._lock:
            obj = self._end_times.get(item_id)
            if obj is None:
                raise KeyError(f"unknown endTime id: {item_id}")
            log.info("[MeetingRoomBookingService.get_end_time] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_organizer(self, name: str) -> organizer:
        """UML: MeetingRoomBookingService.create_organizer(name) -> organizer"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("organizer name is required")
        with self._lock:
            item_id = f"ORG-{self._seq:04d}"
            self._seq += 1
            obj = organizer(item_id, cleaned)
            obj.validate()
            self._organizers[item_id] = obj
            log.info("[MeetingRoomBookingService.create_organizer] stored %s in _organizers (count=%s)", item_id, len(self._organizers))
            return obj

    def get_organizer(self, item_id: str) -> organizer:
        with self._lock:
            obj = self._organizers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown organizer id: {item_id}")
            log.info("[MeetingRoomBookingService.get_organizer] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_building(self, name: str) -> Building:
        """UML: MeetingRoomBookingService.create_building(name) -> Building"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Building name is required")
        with self._lock:
            item_id = f"BUI-{self._seq:04d}"
            self._seq += 1
            obj = Building(item_id, cleaned)
            obj.validate()
            self._buildings[item_id] = obj
            log.info("[MeetingRoomBookingService.create_building] stored %s in _buildings (count=%s)", item_id, len(self._buildings))
            return obj

    def get_building(self, item_id: str) -> Building:
        with self._lock:
            obj = self._buildings.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Building id: {item_id}")
            log.info("[MeetingRoomBookingService.get_building] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_room(self, item_id: str) -> Room:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._rooms.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Room id: {item_id}")
            log.info("[MeetingRoomBookingService.close_room] closing %s via Room.close()", item_id)
            obj.close()
            return obj

    def list_active_rooms(self) -> List[Room]:
        with self._lock:
            active = [o for o in self._rooms.values() if o.status == "ACTIVE"]
            log.info("[MeetingRoomBookingService.list_active_rooms] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct MeetingRoomBookingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = MeetingRoomBookingService()

    log.info("========== STEP 2: Create primary Room objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_room("alpha-room")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_room("beta-room")

    log.info("========== STEP 3: Create Booking (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_booking("sample-booking")

    log.info("========== STEP 4: Create endTime (UML class) ==========")
    system.create_end_time("sample-end_time")

    log.info("========== STEP 5: Create organizer (UML class) ==========")
    system.create_organizer("sample-organizer")

    log.info("========== STEP 6: Create Building (UML class) ==========")
    system.create_building("sample-building")

    log.info("========== STEP 7: Inspect active Room list ==========")
    system.list_active_rooms()

    log.info("========== STEP 8: Close first Room ==========")
    system.close_room(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_room(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Room.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_room("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_room: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_rooms()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Room {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Room(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Room.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Room.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Room.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Room " + id + " invalid status");
    }
    System.out.println("[Room.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Room " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Room.close] id=" + id + " -> CLOSED");
  }
}


class Booking {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Booking(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Booking.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Booking.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Booking.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Booking " + id + " invalid status");
    }
    System.out.println("[Booking.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Booking " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Booking.close] id=" + id + " -> CLOSED");
  }
}


class endTime {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  endTime(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("endTime.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("endTime.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[endTime.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("endTime " + id + " invalid status");
    }
    System.out.println("[endTime.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("endTime " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[endTime.close] id=" + id + " -> CLOSED");
  }
}


class organizer {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  organizer(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("organizer.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("organizer.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[organizer.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("organizer " + id + " invalid status");
    }
    System.out.println("[organizer.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("organizer " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[organizer.close] id=" + id + " -> CLOSED");
  }
}


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

public class MeetingRoomBookingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Room> rooms = new LinkedHashMap<>();
  private final Map<String, Booking> bookings = new LinkedHashMap<>();
  private final Map<String, endTime> end_times = new LinkedHashMap<>();
  private final Map<String, organizer> organizers = new LinkedHashMap<>();
  private final Map<String, Building> buildings = new LinkedHashMap<>();

  public MeetingRoomBookingService() {
    System.out.println("[MeetingRoomBookingService.__init__] system ready");
  }

  public Room createRoom(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Room name required");
    }
    lock.lock();
    try {
      String id = String.format("ROO-%04d", seq++);
      Room obj = new Room(id, name.trim());
      obj.validate();
      rooms.put(id, obj);
      System.out.println("[MeetingRoomBookingService.createRoom] stored " + id + " count=" + rooms.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Room getRoom(String id) {
    lock.lock();
    try {
      Room obj = rooms.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Room id: " + id);
      }
      System.out.println("[MeetingRoomBookingService.getRoom] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Booking createBooking(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Booking name required");
    }
    lock.lock();
    try {
      String id = String.format("BOO-%04d", seq++);
      Booking obj = new Booking(id, name.trim());
      obj.validate();
      bookings.put(id, obj);
      System.out.println("[MeetingRoomBookingService.createBooking] stored " + id + " count=" + bookings.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Booking getBooking(String id) {
    lock.lock();
    try {
      Booking obj = bookings.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Booking id: " + id);
      }
      System.out.println("[MeetingRoomBookingService.getBooking] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public endTime createendTime(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("endTime name required");
    }
    lock.lock();
    try {
      String id = String.format("END-%04d", seq++);
      endTime obj = new endTime(id, name.trim());
      obj.validate();
      end_times.put(id, obj);
      System.out.println("[MeetingRoomBookingService.createendTime] stored " + id + " count=" + end_times.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public endTime getendTime(String id) {
    lock.lock();
    try {
      endTime obj = end_times.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown endTime id: " + id);
      }
      System.out.println("[MeetingRoomBookingService.getendTime] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public organizer createorganizer(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("organizer name required");
    }
    lock.lock();
    try {
      String id = String.format("ORG-%04d", seq++);
      organizer obj = new organizer(id, name.trim());
      obj.validate();
      organizers.put(id, obj);
      System.out.println("[MeetingRoomBookingService.createorganizer] stored " + id + " count=" + organizers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public organizer getorganizer(String id) {
    lock.lock();
    try {
      organizer obj = organizers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown organizer id: " + id);
      }
      System.out.println("[MeetingRoomBookingService.getorganizer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
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
      System.out.println("[MeetingRoomBookingService.createBuilding] stored " + id + " count=" + buildings.size());
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
      System.out.println("[MeetingRoomBookingService.getBuilding] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Room closeRoom(String id) {
    lock.lock();
    try {
      Room obj = rooms.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Room id: " + id);
      }
      System.out.println("[MeetingRoomBookingService.closeRoom] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Room> listActiveRooms() {
    lock.lock();
    try {
      List<Room> out = new ArrayList<>();
      for (Room o : rooms.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[MeetingRoomBookingService.listActiveRooms] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct MeetingRoomBookingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    MeetingRoomBookingService system = new MeetingRoomBookingService();
    System.out.println("========== STEP 2: Create Room objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Room first = system.createRoom("alpha-room");
    system.createRoom("beta-room");
    System.out.println("========== STEP 3: Create Booking ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createBooking("sample-booking");
    System.out.println("========== STEP 4: Create endTime ==========");
    system.createendTime("sample-end_time");
    System.out.println("========== STEP 5: Create organizer ==========");
    system.createorganizer("sample-organizer");
    System.out.println("========== STEP 6: Create Building ==========");
    system.createBuilding("sample-building");
    System.out.println("========== Inspect active list ==========");
    system.listActiveRooms();
    System.out.println("========== Close first Room ==========");
    system.closeRoom(first.getId());
    try {
      system.closeRoom(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getRoom("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Room {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Room.id required')
    }

    if (!name?.trim()) {
      throw new Error('Room.name required')
    }
    console.log(\`[Room.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Room \${this.id} invalid status\`)
    }
    console.log(\`[Room.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Room \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Room.close] id=\${this.id} -> CLOSED\`)
  }
}


class Booking {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Booking.id required')
    }

    if (!name?.trim()) {
      throw new Error('Booking.name required')
    }
    console.log(\`[Booking.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Booking \${this.id} invalid status\`)
    }
    console.log(\`[Booking.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Booking \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Booking.close] id=\${this.id} -> CLOSED\`)
  }
}


class endTime {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('endTime.id required')
    }

    if (!name?.trim()) {
      throw new Error('endTime.name required')
    }
    console.log(\`[endTime.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`endTime \${this.id} invalid status\`)
    }
    console.log(\`[endTime.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`endTime \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[endTime.close] id=\${this.id} -> CLOSED\`)
  }
}


class organizer {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('organizer.id required')
    }

    if (!name?.trim()) {
      throw new Error('organizer.name required')
    }
    console.log(\`[organizer.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`organizer \${this.id} invalid status\`)
    }
    console.log(\`[organizer.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`organizer \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[organizer.close] id=\${this.id} -> CLOSED\`)
  }
}


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

class MeetingRoomBookingService {
  private seq = 1
  private rooms = new Map<string, Room>()
  private bookings = new Map<string, Booking>()
  private end_times = new Map<string, endTime>()
  private organizers = new Map<string, organizer>()
  private buildings = new Map<string, Building>()
  constructor() {
    console.log('[MeetingRoomBookingService.__init__] system ready')
  }

  createRoom(name: string): Room {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Room name required')
    }
    const id = \`ROO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Room(id, cleaned)
    obj.validate()
    this.rooms.set(id, obj)
    console.log(\`[MeetingRoomBookingService.createRoom] stored \${id} count=\${this.rooms.size}\`)
    return obj
  }

  getRoom(id: string): Room {
    const obj = this.rooms.get(id)
    if (!obj) {
      throw new Error(\`unknown Room id: \${id}\`)
    }
    console.log(\`[MeetingRoomBookingService.getRoom] found id=\${obj.id}\`)
    return obj
  }

  createBooking(name: string): Booking {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Booking name required')
    }
    const id = \`BOO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Booking(id, cleaned)
    obj.validate()
    this.bookings.set(id, obj)
    console.log(\`[MeetingRoomBookingService.createBooking] stored \${id} count=\${this.bookings.size}\`)
    return obj
  }

  getBooking(id: string): Booking {
    const obj = this.bookings.get(id)
    if (!obj) {
      throw new Error(\`unknown Booking id: \${id}\`)
    }
    console.log(\`[MeetingRoomBookingService.getBooking] found id=\${obj.id}\`)
    return obj
  }

  createendTime(name: string): endTime {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('endTime name required')
    }
    const id = \`END-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new endTime(id, cleaned)
    obj.validate()
    this.end_times.set(id, obj)
    console.log(\`[MeetingRoomBookingService.createendTime] stored \${id} count=\${this.end_times.size}\`)
    return obj
  }

  getendTime(id: string): endTime {
    const obj = this.end_times.get(id)
    if (!obj) {
      throw new Error(\`unknown endTime id: \${id}\`)
    }
    console.log(\`[MeetingRoomBookingService.getendTime] found id=\${obj.id}\`)
    return obj
  }

  createorganizer(name: string): organizer {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('organizer name required')
    }
    const id = \`ORG-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new organizer(id, cleaned)
    obj.validate()
    this.organizers.set(id, obj)
    console.log(\`[MeetingRoomBookingService.createorganizer] stored \${id} count=\${this.organizers.size}\`)
    return obj
  }

  getorganizer(id: string): organizer {
    const obj = this.organizers.get(id)
    if (!obj) {
      throw new Error(\`unknown organizer id: \${id}\`)
    }
    console.log(\`[MeetingRoomBookingService.getorganizer] found id=\${obj.id}\`)
    return obj
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
    console.log(\`[MeetingRoomBookingService.createBuilding] stored \${id} count=\${this.buildings.size}\`)
    return obj
  }

  getBuilding(id: string): Building {
    const obj = this.buildings.get(id)
    if (!obj) {
      throw new Error(\`unknown Building id: \${id}\`)
    }
    console.log(\`[MeetingRoomBookingService.getBuilding] found id=\${obj.id}\`)
    return obj
  }

  closeRoom(id: string): Room {
    const obj = this.getRoom(id)
    console.log(\`[MeetingRoomBookingService.closeRoom] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveRooms(): Room[] {
    const active = [...this.rooms.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[MeetingRoomBookingService.listActiveRooms] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct MeetingRoomBookingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new MeetingRoomBookingService()
  console.log('========== STEP 2: Create Room objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createRoom('alpha-room')
  system.createRoom('beta-room')
  console.log('========== STEP 3: Create Booking ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createBooking('sample-booking')
  console.log('========== STEP 4: Create endTime ==========')
  system.createendTime('sample-end_time')
  console.log('========== STEP 5: Create organizer ==========')
  system.createorganizer('sample-organizer')
  console.log('========== STEP 6: Create Building ==========')
  system.createBuilding('sample-building')
  system.listActiveRooms()
  console.log('========== Close first Room ==========')
  system.closeRoom(first.id)
  try {
    system.closeRoom(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getRoom('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Room {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Room(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Room requires id and name");
    }
    cout << "[Room.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Room invalid status");
    }
    cout << "[Room.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Room cannot close");
    }
    status_ = "CLOSED";
    cout << "[Room.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Booking {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Booking(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Booking requires id and name");
    }
    cout << "[Booking.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Booking invalid status");
    }
    cout << "[Booking.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Booking cannot close");
    }
    status_ = "CLOSED";
    cout << "[Booking.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class endTime {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  endTime(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("endTime requires id and name");
    }
    cout << "[endTime.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("endTime invalid status");
    }
    cout << "[endTime.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("endTime cannot close");
    }
    status_ = "CLOSED";
    cout << "[endTime.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class organizer {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  organizer(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("organizer requires id and name");
    }
    cout << "[organizer.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("organizer invalid status");
    }
    cout << "[organizer.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("organizer cannot close");
    }
    status_ = "CLOSED";
    cout << "[organizer.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


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

class MeetingRoomBookingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Room> rooms_;
  unordered_map<string, Booking> bookings_;
  unordered_map<string, endTime> end_times_;
  unordered_map<string, organizer> organizers_;
  unordered_map<string, Building> buildings_;
public:
  MeetingRoomBookingService() {
    cout << "[MeetingRoomBookingService.__init__] system ready" << endl;
  }

  Room createRoom(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Room name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ROO-%04d", seq_++);
    Room obj{buf, name};
    obj.validate();
    rooms_.emplace(obj.id(), obj);
    cout << "[MeetingRoomBookingService.createRoom] stored " << obj.id() << endl;
    return obj;
  }

  Room getRoom(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = rooms_.find(id);
    if (it == rooms_.end()) {
      throw out_of_range("unknown Room id");
    }
    cout << "[MeetingRoomBookingService.getRoom] found " << id << endl;
    return it->second;
  }

  Booking createBooking(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Booking name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BOO-%04d", seq_++);
    Booking obj{buf, name};
    obj.validate();
    bookings_.emplace(obj.id(), obj);
    cout << "[MeetingRoomBookingService.createBooking] stored " << obj.id() << endl;
    return obj;
  }

  Booking getBooking(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = bookings_.find(id);
    if (it == bookings_.end()) {
      throw out_of_range("unknown Booking id");
    }
    cout << "[MeetingRoomBookingService.getBooking] found " << id << endl;
    return it->second;
  }

  endTime createendTime(const string& name) {
    if (name.empty()) {
      throw invalid_argument("endTime name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "END-%04d", seq_++);
    endTime obj{buf, name};
    obj.validate();
    end_times_.emplace(obj.id(), obj);
    cout << "[MeetingRoomBookingService.createendTime] stored " << obj.id() << endl;
    return obj;
  }

  endTime getendTime(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = end_times_.find(id);
    if (it == end_times_.end()) {
      throw out_of_range("unknown endTime id");
    }
    cout << "[MeetingRoomBookingService.getendTime] found " << id << endl;
    return it->second;
  }

  organizer createorganizer(const string& name) {
    if (name.empty()) {
      throw invalid_argument("organizer name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ORG-%04d", seq_++);
    organizer obj{buf, name};
    obj.validate();
    organizers_.emplace(obj.id(), obj);
    cout << "[MeetingRoomBookingService.createorganizer] stored " << obj.id() << endl;
    return obj;
  }

  organizer getorganizer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = organizers_.find(id);
    if (it == organizers_.end()) {
      throw out_of_range("unknown organizer id");
    }
    cout << "[MeetingRoomBookingService.getorganizer] found " << id << endl;
    return it->second;
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
    cout << "[MeetingRoomBookingService.createBuilding] stored " << obj.id() << endl;
    return obj;
  }

  Building getBuilding(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = buildings_.find(id);
    if (it == buildings_.end()) {
      throw out_of_range("unknown Building id");
    }
    cout << "[MeetingRoomBookingService.getBuilding] found " << id << endl;
    return it->second;
  }

  Room closeRoom(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = rooms_.find(id);
    if (it == rooms_.end()) {
      throw out_of_range("unknown Room");
    }
    cout << "[MeetingRoomBookingService.closeRoom] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct MeetingRoomBookingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  MeetingRoomBookingService system;
  cout << "========== STEP 2: Create Room ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createRoom("alpha-room");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createRoom("beta-room");
  system.createBooking("sample-booking");
  system.createendTime("sample-end_time");
  system.createorganizer("sample-organizer");
  system.createBuilding("sample-building");
  system.closeRoom(first.id());
  try {
    system.closeRoom(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getRoom("MISSING-ID");
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

type Room struct {
  ID     string
  Name   string
  Status string
}

func NewRoom(id, name string) (*Room, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Room requires id and name")
  }
  obj := &Room{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Room.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Room) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Room invalid status")
  }
  fmt.Printf("[Room.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Room) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Room %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Room.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Booking struct {
  ID     string
  Name   string
  Status string
}

func NewBooking(id, name string) (*Booking, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Booking requires id and name")
  }
  obj := &Booking{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Booking.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Booking) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Booking invalid status")
  }
  fmt.Printf("[Booking.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Booking) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Booking %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Booking.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type endTime struct {
  ID     string
  Name   string
  Status string
}

func NewendTime(id, name string) (*endTime, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("endTime requires id and name")
  }
  obj := &endTime{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[endTime.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *endTime) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("endTime invalid status")
  }
  fmt.Printf("[endTime.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *endTime) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("endTime %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[endTime.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type organizer struct {
  ID     string
  Name   string
  Status string
}

func Neworganizer(id, name string) (*organizer, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("organizer requires id and name")
  }
  obj := &organizer{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[organizer.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *organizer) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("organizer invalid status")
  }
  fmt.Printf("[organizer.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *organizer) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("organizer %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[organizer.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


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

type MeetingRoomBookingService struct {
  mu  sync.Mutex
  seq int
  rooms map[string]*Room
  bookings map[string]*Booking
  end_times map[string]*endTime
  organizers map[string]*organizer
  buildings map[string]*Building
}

func NewMeetingRoomBookingService() *MeetingRoomBookingService {
  fmt.Println("[MeetingRoomBookingService.__init__] system ready")
  return &MeetingRoomBookingService{
    seq: 1,
    rooms: map[string]*Room{},
    bookings: map[string]*Booking{},
    end_times: map[string]*endTime{},
    organizers: map[string]*organizer{},
    buildings: map[string]*Building{},
  }
}

func (s *MeetingRoomBookingService) CreateRoom(name string) (*Room, error) {
  if name == "" {
    return nil, fmt.Errorf("Room name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ROO-%04d", s.seq)
  s.seq++
  obj, err := NewRoom(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.rooms[id] = obj
  fmt.Printf("[MeetingRoomBookingService.CreateRoom] stored %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) GetRoom(id string) (*Room, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.rooms[id]
  if !ok {
    return nil, fmt.Errorf("unknown Room id: %s", id)
  }
  fmt.Printf("[MeetingRoomBookingService.GetRoom] found %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) CreateBooking(name string) (*Booking, error) {
  if name == "" {
    return nil, fmt.Errorf("Booking name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BOO-%04d", s.seq)
  s.seq++
  obj, err := NewBooking(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.bookings[id] = obj
  fmt.Printf("[MeetingRoomBookingService.CreateBooking] stored %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) GetBooking(id string) (*Booking, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.bookings[id]
  if !ok {
    return nil, fmt.Errorf("unknown Booking id: %s", id)
  }
  fmt.Printf("[MeetingRoomBookingService.GetBooking] found %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) CreateendTime(name string) (*endTime, error) {
  if name == "" {
    return nil, fmt.Errorf("endTime name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("END-%04d", s.seq)
  s.seq++
  obj, err := NewendTime(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.end_times[id] = obj
  fmt.Printf("[MeetingRoomBookingService.CreateendTime] stored %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) GetendTime(id string) (*endTime, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.end_times[id]
  if !ok {
    return nil, fmt.Errorf("unknown endTime id: %s", id)
  }
  fmt.Printf("[MeetingRoomBookingService.GetendTime] found %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) Createorganizer(name string) (*organizer, error) {
  if name == "" {
    return nil, fmt.Errorf("organizer name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ORG-%04d", s.seq)
  s.seq++
  obj, err := Neworganizer(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.organizers[id] = obj
  fmt.Printf("[MeetingRoomBookingService.Createorganizer] stored %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) Getorganizer(id string) (*organizer, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.organizers[id]
  if !ok {
    return nil, fmt.Errorf("unknown organizer id: %s", id)
  }
  fmt.Printf("[MeetingRoomBookingService.Getorganizer] found %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) CreateBuilding(name string) (*Building, error) {
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
  fmt.Printf("[MeetingRoomBookingService.CreateBuilding] stored %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) GetBuilding(id string) (*Building, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.buildings[id]
  if !ok {
    return nil, fmt.Errorf("unknown Building id: %s", id)
  }
  fmt.Printf("[MeetingRoomBookingService.GetBuilding] found %s\\n", id)
  return obj, nil
}

func (s *MeetingRoomBookingService) CloseRoom(id string) (*Room, error) {
  obj, err := s.GetRoom(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[MeetingRoomBookingService.CloseRoom] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct MeetingRoomBookingService ==========")
  system := NewMeetingRoomBookingService()
  fmt.Println("========== STEP 2: Create Room ==========")
  first, _ := system.CreateRoom("alpha-room")
  system.CreateRoom("beta-room")
  system.CreateBooking("sample-booking")
  system.CreateendTime("sample-end_time")
  system.Createorganizer("sample-organizer")
  system.CreateBuilding("sample-building")
  system.CloseRoom(first.ID)
  if _, err := system.CloseRoom(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetRoom("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Room {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Room(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Room requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Room.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Room invalid status");
    }
    Console.WriteLine("[Room.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Room " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Room.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Booking {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Booking(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Booking requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Booking.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Booking invalid status");
    }
    Console.WriteLine("[Booking.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Booking " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Booking.close] id=" + Id + " -> CLOSED");
  }
}


sealed class endTime {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public endTime(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("endTime requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[endTime.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("endTime invalid status");
    }
    Console.WriteLine("[endTime.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("endTime " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[endTime.close] id=" + Id + " -> CLOSED");
  }
}


sealed class organizer {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public organizer(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("organizer requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[organizer.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("organizer invalid status");
    }
    Console.WriteLine("[organizer.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("organizer " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[organizer.close] id=" + Id + " -> CLOSED");
  }
}


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

sealed class MeetingRoomBookingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Room> _rooms = new();
  private readonly Dictionary<string, Booking> _bookings = new();
  private readonly Dictionary<string, endTime> _end_times = new();
  private readonly Dictionary<string, organizer> _organizers = new();
  private readonly Dictionary<string, Building> _buildings = new();
  public MeetingRoomBookingService() {
    Console.WriteLine("[MeetingRoomBookingService.__init__] system ready");
  }

  public Room CreateRoom(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Room name required");
    }
    lock (_gate) {
      var id = string.Format("ROO-{0:D4}", _seq++);
      var obj = new Room(id, name.Trim());
      obj.Validate();
      _rooms[id] = obj;
      Console.WriteLine("[MeetingRoomBookingService.CreateRoom] stored " + id);
      return obj;
    }
  }

  public Room GetRoom(string id) {
    lock (_gate) {
      if (!_rooms.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Room id: " + id);
      }
      Console.WriteLine("[MeetingRoomBookingService.GetRoom] found " + id);
      return obj;
    }
  }

  public Booking CreateBooking(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Booking name required");
    }
    lock (_gate) {
      var id = string.Format("BOO-{0:D4}", _seq++);
      var obj = new Booking(id, name.Trim());
      obj.Validate();
      _bookings[id] = obj;
      Console.WriteLine("[MeetingRoomBookingService.CreateBooking] stored " + id);
      return obj;
    }
  }

  public Booking GetBooking(string id) {
    lock (_gate) {
      if (!_bookings.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Booking id: " + id);
      }
      Console.WriteLine("[MeetingRoomBookingService.GetBooking] found " + id);
      return obj;
    }
  }

  public endTime CreateendTime(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("endTime name required");
    }
    lock (_gate) {
      var id = string.Format("END-{0:D4}", _seq++);
      var obj = new endTime(id, name.Trim());
      obj.Validate();
      _end_times[id] = obj;
      Console.WriteLine("[MeetingRoomBookingService.CreateendTime] stored " + id);
      return obj;
    }
  }

  public endTime GetendTime(string id) {
    lock (_gate) {
      if (!_end_times.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown endTime id: " + id);
      }
      Console.WriteLine("[MeetingRoomBookingService.GetendTime] found " + id);
      return obj;
    }
  }

  public organizer Createorganizer(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("organizer name required");
    }
    lock (_gate) {
      var id = string.Format("ORG-{0:D4}", _seq++);
      var obj = new organizer(id, name.Trim());
      obj.Validate();
      _organizers[id] = obj;
      Console.WriteLine("[MeetingRoomBookingService.Createorganizer] stored " + id);
      return obj;
    }
  }

  public organizer Getorganizer(string id) {
    lock (_gate) {
      if (!_organizers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown organizer id: " + id);
      }
      Console.WriteLine("[MeetingRoomBookingService.Getorganizer] found " + id);
      return obj;
    }
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
      Console.WriteLine("[MeetingRoomBookingService.CreateBuilding] stored " + id);
      return obj;
    }
  }

  public Building GetBuilding(string id) {
    lock (_gate) {
      if (!_buildings.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Building id: " + id);
      }
      Console.WriteLine("[MeetingRoomBookingService.GetBuilding] found " + id);
      return obj;
    }
  }

  public Room CloseRoom(string id) {
    var obj = GetRoom(id);
    Console.WriteLine("[MeetingRoomBookingService.CloseRoom] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct MeetingRoomBookingService ==========");
    var system = new MeetingRoomBookingService();
    Console.WriteLine("========== STEP 2: Create Room ==========");
    var first = system.CreateRoom("alpha-room");
    system.CreateRoom("beta-room");
    system.CreateBooking("sample-booking");
    system.CreateendTime("sample-end_time");
    system.Createorganizer("sample-organizer");
    system.CreateBuilding("sample-building");
    system.CloseRoom(first.Id);
    try {
      system.CloseRoom(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetRoom("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const meetingRoomBookingSolution: ProblemSolution = {
  slug: 'meeting-room-booking',
  title: 'Meeting Room Booking System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a system that lets employees book meeting rooms, checking for conflicts across a shared calendar. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'List available rooms for a given time range and capacity',
      'Book a room for a specific time slot',
      'Prevent overlapping bookings for the same room',
      'Cancel an existing booking',
      'Support recurring bookings (e.g. every Monday 10-11am)',
      'Show a room\'s full schedule for a given day',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'List available rooms for a given time range and capacity?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Book a room for a specific time slot?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Prevent overlapping bookings for the same room?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Cancel an existing booking?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support recurring bookings (e.g. every Monday 10-11am)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. MeetingRoomBookingService is the facade stereotype. Room, Booking, endTime, organizer, Building are concrete domain classes with id/name/status and validate/close.',
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
          'Construct MeetingRoomBookingService.',
          'createRoom twice and create the related UML classes.',
          'closeRoom once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'MeetingRoomBookingService', responsibility: 'UML facade - orchestrates Meeting Room Booking System.', keyMembers: ['create*', 'get*', 'closeRoom'] },
    { name: 'Room', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Booking', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'endTime', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'organizer', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Building', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from MeetingRoomBookingService to Room, Booking, endTime, organizer, Building. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on MeetingRoomBookingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'MeetingRoomBookingService', responsibility: 'UML facade - orchestrates Meeting Room Booking System.', keyMembers: ['create*', 'get*', 'closeRoom'] },
    { name: 'Room', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Booking', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'endTime', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'organizer', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Building', responsibility: 'UML class - domain object for Meeting Room Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'MeetingRoomBookingService exposes create/get/close and owns composed collections.' },
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
      'main constructs MeetingRoomBookingService, creates UML domain objects, closes the primary Room, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct MeetingRoomBookingService.',
      'createRoom for alpha and beta.',
      'create remaining UML classes.',
      'closeRoom(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createRoom("alpha..."); closeRoom(id)',
        output: '[Room.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeRoom(alreadyClosed) or getRoom("MISSING-ID")',
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
