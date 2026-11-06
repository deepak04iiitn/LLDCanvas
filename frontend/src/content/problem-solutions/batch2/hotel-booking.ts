import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'HotelBookingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_hotels', 'Map<string, Hotel>'),
    attr('-', '_rooms', 'Map<string, Room>'),
    attr('-', '_room_types', 'Map<string, RoomType>'),
    attr('-', '_bookings', 'Map<string, Booking>'),
    attr('-', '_guests', 'Map<string, Guest>'),
  ], [
    method('+', 'createHotel', 'name: string', 'Hotel'),
    method('+', 'createRoom', 'name: string', 'Room'),
    method('+', 'createRoomType', 'name: string', 'RoomType'),
    method('+', 'createBooking', 'name: string', 'Booking'),
    method('+', 'createGuest', 'name: string', 'Guest'),
    method('+', 'getHotel', 'id: string', 'Hotel'),
    method('+', 'getRoom', 'id: string', 'Room'),
    method('+', 'getRoomType', 'id: string', 'RoomType'),
    method('+', 'getBooking', 'id: string', 'Booking'),
    method('+', 'getGuest', 'id: string', 'Guest'),
    method('+', 'closeHotel', 'id: string', 'Hotel'),
  ], 'facade'),
  cls('n1', 'Hotel', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Room', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'RoomType', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Booking', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Guest', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("hotel-booking")


class Hotel:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Hotel.id is required")
        if not name or not name.strip():
            raise ValueError("Hotel.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Hotel.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Hotel {self.id} has invalid status={self.status}")
        log.info("[Hotel.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Hotel {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Hotel.close] id=%s -> CLOSED", self.id)


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


class RoomType:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("RoomType.id is required")
        if not name or not name.strip():
            raise ValueError("RoomType.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[RoomType.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"RoomType {self.id} has invalid status={self.status}")
        log.info("[RoomType.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"RoomType {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[RoomType.close] id=%s -> CLOSED", self.id)


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


class Guest:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Guest.id is required")
        if not name or not name.strip():
            raise ValueError("Guest.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Guest.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Guest {self.id} has invalid status={self.status}")
        log.info("[Guest.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Guest {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Guest.close] id=%s -> CLOSED", self.id)


class HotelBookingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._hotels: Dict[str, Hotel] = {}
        self._rooms: Dict[str, Room] = {}
        self._room_types: Dict[str, RoomType] = {}
        self._bookings: Dict[str, Booking] = {}
        self._guests: Dict[str, Guest] = {}
        log.info("[HotelBookingService.__init__] system ready; managing: Hotel, Room, RoomType, Booking, Guest")

    def create_hotel(self, name: str) -> Hotel:
        """UML: HotelBookingService.create_hotel(name) -> Hotel"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Hotel name is required")
        with self._lock:
            item_id = f"HOT-{self._seq:04d}"
            self._seq += 1
            obj = Hotel(item_id, cleaned)
            obj.validate()
            self._hotels[item_id] = obj
            log.info("[HotelBookingService.create_hotel] stored %s in _hotels (count=%s)", item_id, len(self._hotels))
            return obj

    def get_hotel(self, item_id: str) -> Hotel:
        with self._lock:
            obj = self._hotels.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Hotel id: {item_id}")
            log.info("[HotelBookingService.get_hotel] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_room(self, name: str) -> Room:
        """UML: HotelBookingService.create_room(name) -> Room"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Room name is required")
        with self._lock:
            item_id = f"ROO-{self._seq:04d}"
            self._seq += 1
            obj = Room(item_id, cleaned)
            obj.validate()
            self._rooms[item_id] = obj
            log.info("[HotelBookingService.create_room] stored %s in _rooms (count=%s)", item_id, len(self._rooms))
            return obj

    def get_room(self, item_id: str) -> Room:
        with self._lock:
            obj = self._rooms.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Room id: {item_id}")
            log.info("[HotelBookingService.get_room] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_room_type(self, name: str) -> RoomType:
        """UML: HotelBookingService.create_room_type(name) -> RoomType"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("RoomType name is required")
        with self._lock:
            item_id = f"ROO-{self._seq:04d}"
            self._seq += 1
            obj = RoomType(item_id, cleaned)
            obj.validate()
            self._room_types[item_id] = obj
            log.info("[HotelBookingService.create_room_type] stored %s in _room_types (count=%s)", item_id, len(self._room_types))
            return obj

    def get_room_type(self, item_id: str) -> RoomType:
        with self._lock:
            obj = self._room_types.get(item_id)
            if obj is None:
                raise KeyError(f"unknown RoomType id: {item_id}")
            log.info("[HotelBookingService.get_room_type] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_booking(self, name: str) -> Booking:
        """UML: HotelBookingService.create_booking(name) -> Booking"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Booking name is required")
        with self._lock:
            item_id = f"BOO-{self._seq:04d}"
            self._seq += 1
            obj = Booking(item_id, cleaned)
            obj.validate()
            self._bookings[item_id] = obj
            log.info("[HotelBookingService.create_booking] stored %s in _bookings (count=%s)", item_id, len(self._bookings))
            return obj

    def get_booking(self, item_id: str) -> Booking:
        with self._lock:
            obj = self._bookings.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Booking id: {item_id}")
            log.info("[HotelBookingService.get_booking] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_guest(self, name: str) -> Guest:
        """UML: HotelBookingService.create_guest(name) -> Guest"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Guest name is required")
        with self._lock:
            item_id = f"GUE-{self._seq:04d}"
            self._seq += 1
            obj = Guest(item_id, cleaned)
            obj.validate()
            self._guests[item_id] = obj
            log.info("[HotelBookingService.create_guest] stored %s in _guests (count=%s)", item_id, len(self._guests))
            return obj

    def get_guest(self, item_id: str) -> Guest:
        with self._lock:
            obj = self._guests.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Guest id: {item_id}")
            log.info("[HotelBookingService.get_guest] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_hotel(self, item_id: str) -> Hotel:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._hotels.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Hotel id: {item_id}")
            log.info("[HotelBookingService.close_hotel] closing %s via Hotel.close()", item_id)
            obj.close()
            return obj

    def list_active_hotels(self) -> List[Hotel]:
        with self._lock:
            active = [o for o in self._hotels.values() if o.status == "ACTIVE"]
            log.info("[HotelBookingService.list_active_hotels] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct HotelBookingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = HotelBookingService()

    log.info("========== STEP 2: Create primary Hotel objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_hotel("alpha-hotel")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_hotel("beta-hotel")

    log.info("========== STEP 3: Create Room (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_room("sample-room")

    log.info("========== STEP 4: Create RoomType (UML class) ==========")
    system.create_room_type("sample-room_type")

    log.info("========== STEP 5: Create Booking (UML class) ==========")
    system.create_booking("sample-booking")

    log.info("========== STEP 6: Create Guest (UML class) ==========")
    system.create_guest("sample-guest")

    log.info("========== STEP 7: Inspect active Hotel list ==========")
    system.list_active_hotels()

    log.info("========== STEP 8: Close first Hotel ==========")
    system.close_hotel(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_hotel(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Hotel.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_hotel("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_hotel: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_hotels()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Hotel {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Hotel(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Hotel.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Hotel.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Hotel.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Hotel " + id + " invalid status");
    }
    System.out.println("[Hotel.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Hotel " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Hotel.close] id=" + id + " -> CLOSED");
  }
}


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


class RoomType {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  RoomType(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("RoomType.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("RoomType.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[RoomType.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("RoomType " + id + " invalid status");
    }
    System.out.println("[RoomType.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("RoomType " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[RoomType.close] id=" + id + " -> CLOSED");
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


class Guest {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Guest(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Guest.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Guest.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Guest.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Guest " + id + " invalid status");
    }
    System.out.println("[Guest.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Guest " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Guest.close] id=" + id + " -> CLOSED");
  }
}

public class HotelBookingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Hotel> hotels = new LinkedHashMap<>();
  private final Map<String, Room> rooms = new LinkedHashMap<>();
  private final Map<String, RoomType> room_types = new LinkedHashMap<>();
  private final Map<String, Booking> bookings = new LinkedHashMap<>();
  private final Map<String, Guest> guests = new LinkedHashMap<>();

  public HotelBookingService() {
    System.out.println("[HotelBookingService.__init__] system ready");
  }

  public Hotel createHotel(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Hotel name required");
    }
    lock.lock();
    try {
      String id = String.format("HOT-%04d", seq++);
      Hotel obj = new Hotel(id, name.trim());
      obj.validate();
      hotels.put(id, obj);
      System.out.println("[HotelBookingService.createHotel] stored " + id + " count=" + hotels.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Hotel getHotel(String id) {
    lock.lock();
    try {
      Hotel obj = hotels.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Hotel id: " + id);
      }
      System.out.println("[HotelBookingService.getHotel] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
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
      System.out.println("[HotelBookingService.createRoom] stored " + id + " count=" + rooms.size());
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
      System.out.println("[HotelBookingService.getRoom] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public RoomType createRoomType(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("RoomType name required");
    }
    lock.lock();
    try {
      String id = String.format("ROO-%04d", seq++);
      RoomType obj = new RoomType(id, name.trim());
      obj.validate();
      room_types.put(id, obj);
      System.out.println("[HotelBookingService.createRoomType] stored " + id + " count=" + room_types.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public RoomType getRoomType(String id) {
    lock.lock();
    try {
      RoomType obj = room_types.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown RoomType id: " + id);
      }
      System.out.println("[HotelBookingService.getRoomType] found id=" + obj.getId());
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
      System.out.println("[HotelBookingService.createBooking] stored " + id + " count=" + bookings.size());
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
      System.out.println("[HotelBookingService.getBooking] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Guest createGuest(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Guest name required");
    }
    lock.lock();
    try {
      String id = String.format("GUE-%04d", seq++);
      Guest obj = new Guest(id, name.trim());
      obj.validate();
      guests.put(id, obj);
      System.out.println("[HotelBookingService.createGuest] stored " + id + " count=" + guests.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Guest getGuest(String id) {
    lock.lock();
    try {
      Guest obj = guests.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Guest id: " + id);
      }
      System.out.println("[HotelBookingService.getGuest] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Hotel closeHotel(String id) {
    lock.lock();
    try {
      Hotel obj = hotels.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Hotel id: " + id);
      }
      System.out.println("[HotelBookingService.closeHotel] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Hotel> listActiveHotels() {
    lock.lock();
    try {
      List<Hotel> out = new ArrayList<>();
      for (Hotel o : hotels.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[HotelBookingService.listActiveHotels] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct HotelBookingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    HotelBookingService system = new HotelBookingService();
    System.out.println("========== STEP 2: Create Hotel objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Hotel first = system.createHotel("alpha-hotel");
    system.createHotel("beta-hotel");
    System.out.println("========== STEP 3: Create Room ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createRoom("sample-room");
    System.out.println("========== STEP 4: Create RoomType ==========");
    system.createRoomType("sample-room_type");
    System.out.println("========== STEP 5: Create Booking ==========");
    system.createBooking("sample-booking");
    System.out.println("========== STEP 6: Create Guest ==========");
    system.createGuest("sample-guest");
    System.out.println("========== Inspect active list ==========");
    system.listActiveHotels();
    System.out.println("========== Close first Hotel ==========");
    system.closeHotel(first.getId());
    try {
      system.closeHotel(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getHotel("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Hotel {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Hotel.id required')
    }

    if (!name?.trim()) {
      throw new Error('Hotel.name required')
    }
    console.log(\`[Hotel.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Hotel \${this.id} invalid status\`)
    }
    console.log(\`[Hotel.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Hotel \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Hotel.close] id=\${this.id} -> CLOSED\`)
  }
}


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


class RoomType {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('RoomType.id required')
    }

    if (!name?.trim()) {
      throw new Error('RoomType.name required')
    }
    console.log(\`[RoomType.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`RoomType \${this.id} invalid status\`)
    }
    console.log(\`[RoomType.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`RoomType \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[RoomType.close] id=\${this.id} -> CLOSED\`)
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


class Guest {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Guest.id required')
    }

    if (!name?.trim()) {
      throw new Error('Guest.name required')
    }
    console.log(\`[Guest.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Guest \${this.id} invalid status\`)
    }
    console.log(\`[Guest.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Guest \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Guest.close] id=\${this.id} -> CLOSED\`)
  }
}

class HotelBookingService {
  private seq = 1
  private hotels = new Map<string, Hotel>()
  private rooms = new Map<string, Room>()
  private room_types = new Map<string, RoomType>()
  private bookings = new Map<string, Booking>()
  private guests = new Map<string, Guest>()
  constructor() {
    console.log('[HotelBookingService.__init__] system ready')
  }

  createHotel(name: string): Hotel {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Hotel name required')
    }
    const id = \`HOT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Hotel(id, cleaned)
    obj.validate()
    this.hotels.set(id, obj)
    console.log(\`[HotelBookingService.createHotel] stored \${id} count=\${this.hotels.size}\`)
    return obj
  }

  getHotel(id: string): Hotel {
    const obj = this.hotels.get(id)
    if (!obj) {
      throw new Error(\`unknown Hotel id: \${id}\`)
    }
    console.log(\`[HotelBookingService.getHotel] found id=\${obj.id}\`)
    return obj
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
    console.log(\`[HotelBookingService.createRoom] stored \${id} count=\${this.rooms.size}\`)
    return obj
  }

  getRoom(id: string): Room {
    const obj = this.rooms.get(id)
    if (!obj) {
      throw new Error(\`unknown Room id: \${id}\`)
    }
    console.log(\`[HotelBookingService.getRoom] found id=\${obj.id}\`)
    return obj
  }

  createRoomType(name: string): RoomType {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('RoomType name required')
    }
    const id = \`ROO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new RoomType(id, cleaned)
    obj.validate()
    this.room_types.set(id, obj)
    console.log(\`[HotelBookingService.createRoomType] stored \${id} count=\${this.room_types.size}\`)
    return obj
  }

  getRoomType(id: string): RoomType {
    const obj = this.room_types.get(id)
    if (!obj) {
      throw new Error(\`unknown RoomType id: \${id}\`)
    }
    console.log(\`[HotelBookingService.getRoomType] found id=\${obj.id}\`)
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
    console.log(\`[HotelBookingService.createBooking] stored \${id} count=\${this.bookings.size}\`)
    return obj
  }

  getBooking(id: string): Booking {
    const obj = this.bookings.get(id)
    if (!obj) {
      throw new Error(\`unknown Booking id: \${id}\`)
    }
    console.log(\`[HotelBookingService.getBooking] found id=\${obj.id}\`)
    return obj
  }

  createGuest(name: string): Guest {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Guest name required')
    }
    const id = \`GUE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Guest(id, cleaned)
    obj.validate()
    this.guests.set(id, obj)
    console.log(\`[HotelBookingService.createGuest] stored \${id} count=\${this.guests.size}\`)
    return obj
  }

  getGuest(id: string): Guest {
    const obj = this.guests.get(id)
    if (!obj) {
      throw new Error(\`unknown Guest id: \${id}\`)
    }
    console.log(\`[HotelBookingService.getGuest] found id=\${obj.id}\`)
    return obj
  }

  closeHotel(id: string): Hotel {
    const obj = this.getHotel(id)
    console.log(\`[HotelBookingService.closeHotel] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveHotels(): Hotel[] {
    const active = [...this.hotels.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[HotelBookingService.listActiveHotels] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct HotelBookingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new HotelBookingService()
  console.log('========== STEP 2: Create Hotel objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createHotel('alpha-hotel')
  system.createHotel('beta-hotel')
  console.log('========== STEP 3: Create Room ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createRoom('sample-room')
  console.log('========== STEP 4: Create RoomType ==========')
  system.createRoomType('sample-room_type')
  console.log('========== STEP 5: Create Booking ==========')
  system.createBooking('sample-booking')
  console.log('========== STEP 6: Create Guest ==========')
  system.createGuest('sample-guest')
  system.listActiveHotels()
  console.log('========== Close first Hotel ==========')
  system.closeHotel(first.id)
  try {
    system.closeHotel(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getHotel('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Hotel {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Hotel(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Hotel requires id and name");
    }
    cout << "[Hotel.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Hotel invalid status");
    }
    cout << "[Hotel.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Hotel cannot close");
    }
    status_ = "CLOSED";
    cout << "[Hotel.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


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


class RoomType {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  RoomType(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("RoomType requires id and name");
    }
    cout << "[RoomType.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("RoomType invalid status");
    }
    cout << "[RoomType.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("RoomType cannot close");
    }
    status_ = "CLOSED";
    cout << "[RoomType.close] id=" << id_ << " -> CLOSED" << endl;
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


class Guest {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Guest(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Guest requires id and name");
    }
    cout << "[Guest.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Guest invalid status");
    }
    cout << "[Guest.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Guest cannot close");
    }
    status_ = "CLOSED";
    cout << "[Guest.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class HotelBookingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Hotel> hotels_;
  unordered_map<string, Room> rooms_;
  unordered_map<string, RoomType> room_types_;
  unordered_map<string, Booking> bookings_;
  unordered_map<string, Guest> guests_;
public:
  HotelBookingService() {
    cout << "[HotelBookingService.__init__] system ready" << endl;
  }

  Hotel createHotel(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Hotel name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "HOT-%04d", seq_++);
    Hotel obj{buf, name};
    obj.validate();
    hotels_.emplace(obj.id(), obj);
    cout << "[HotelBookingService.createHotel] stored " << obj.id() << endl;
    return obj;
  }

  Hotel getHotel(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = hotels_.find(id);
    if (it == hotels_.end()) {
      throw out_of_range("unknown Hotel id");
    }
    cout << "[HotelBookingService.getHotel] found " << id << endl;
    return it->second;
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
    cout << "[HotelBookingService.createRoom] stored " << obj.id() << endl;
    return obj;
  }

  Room getRoom(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = rooms_.find(id);
    if (it == rooms_.end()) {
      throw out_of_range("unknown Room id");
    }
    cout << "[HotelBookingService.getRoom] found " << id << endl;
    return it->second;
  }

  RoomType createRoomType(const string& name) {
    if (name.empty()) {
      throw invalid_argument("RoomType name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ROO-%04d", seq_++);
    RoomType obj{buf, name};
    obj.validate();
    room_types_.emplace(obj.id(), obj);
    cout << "[HotelBookingService.createRoomType] stored " << obj.id() << endl;
    return obj;
  }

  RoomType getRoomType(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = room_types_.find(id);
    if (it == room_types_.end()) {
      throw out_of_range("unknown RoomType id");
    }
    cout << "[HotelBookingService.getRoomType] found " << id << endl;
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
    cout << "[HotelBookingService.createBooking] stored " << obj.id() << endl;
    return obj;
  }

  Booking getBooking(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = bookings_.find(id);
    if (it == bookings_.end()) {
      throw out_of_range("unknown Booking id");
    }
    cout << "[HotelBookingService.getBooking] found " << id << endl;
    return it->second;
  }

  Guest createGuest(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Guest name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "GUE-%04d", seq_++);
    Guest obj{buf, name};
    obj.validate();
    guests_.emplace(obj.id(), obj);
    cout << "[HotelBookingService.createGuest] stored " << obj.id() << endl;
    return obj;
  }

  Guest getGuest(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = guests_.find(id);
    if (it == guests_.end()) {
      throw out_of_range("unknown Guest id");
    }
    cout << "[HotelBookingService.getGuest] found " << id << endl;
    return it->second;
  }

  Hotel closeHotel(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = hotels_.find(id);
    if (it == hotels_.end()) {
      throw out_of_range("unknown Hotel");
    }
    cout << "[HotelBookingService.closeHotel] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct HotelBookingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  HotelBookingService system;
  cout << "========== STEP 2: Create Hotel ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createHotel("alpha-hotel");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createHotel("beta-hotel");
  system.createRoom("sample-room");
  system.createRoomType("sample-room_type");
  system.createBooking("sample-booking");
  system.createGuest("sample-guest");
  system.closeHotel(first.id());
  try {
    system.closeHotel(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getHotel("MISSING-ID");
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

type Hotel struct {
  ID     string
  Name   string
  Status string
}

func NewHotel(id, name string) (*Hotel, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Hotel requires id and name")
  }
  obj := &Hotel{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Hotel.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Hotel) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Hotel invalid status")
  }
  fmt.Printf("[Hotel.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Hotel) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Hotel %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Hotel.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


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


type RoomType struct {
  ID     string
  Name   string
  Status string
}

func NewRoomType(id, name string) (*RoomType, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("RoomType requires id and name")
  }
  obj := &RoomType{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[RoomType.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *RoomType) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("RoomType invalid status")
  }
  fmt.Printf("[RoomType.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *RoomType) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("RoomType %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[RoomType.close] id=%s -> CLOSED\\n", o.ID)
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


type Guest struct {
  ID     string
  Name   string
  Status string
}

func NewGuest(id, name string) (*Guest, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Guest requires id and name")
  }
  obj := &Guest{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Guest.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Guest) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Guest invalid status")
  }
  fmt.Printf("[Guest.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Guest) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Guest %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Guest.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type HotelBookingService struct {
  mu  sync.Mutex
  seq int
  hotels map[string]*Hotel
  rooms map[string]*Room
  room_types map[string]*RoomType
  bookings map[string]*Booking
  guests map[string]*Guest
}

func NewHotelBookingService() *HotelBookingService {
  fmt.Println("[HotelBookingService.__init__] system ready")
  return &HotelBookingService{
    seq: 1,
    hotels: map[string]*Hotel{},
    rooms: map[string]*Room{},
    room_types: map[string]*RoomType{},
    bookings: map[string]*Booking{},
    guests: map[string]*Guest{},
  }
}

func (s *HotelBookingService) CreateHotel(name string) (*Hotel, error) {
  if name == "" {
    return nil, fmt.Errorf("Hotel name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("HOT-%04d", s.seq)
  s.seq++
  obj, err := NewHotel(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.hotels[id] = obj
  fmt.Printf("[HotelBookingService.CreateHotel] stored %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) GetHotel(id string) (*Hotel, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.hotels[id]
  if !ok {
    return nil, fmt.Errorf("unknown Hotel id: %s", id)
  }
  fmt.Printf("[HotelBookingService.GetHotel] found %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) CreateRoom(name string) (*Room, error) {
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
  fmt.Printf("[HotelBookingService.CreateRoom] stored %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) GetRoom(id string) (*Room, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.rooms[id]
  if !ok {
    return nil, fmt.Errorf("unknown Room id: %s", id)
  }
  fmt.Printf("[HotelBookingService.GetRoom] found %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) CreateRoomType(name string) (*RoomType, error) {
  if name == "" {
    return nil, fmt.Errorf("RoomType name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ROO-%04d", s.seq)
  s.seq++
  obj, err := NewRoomType(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.room_types[id] = obj
  fmt.Printf("[HotelBookingService.CreateRoomType] stored %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) GetRoomType(id string) (*RoomType, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.room_types[id]
  if !ok {
    return nil, fmt.Errorf("unknown RoomType id: %s", id)
  }
  fmt.Printf("[HotelBookingService.GetRoomType] found %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) CreateBooking(name string) (*Booking, error) {
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
  fmt.Printf("[HotelBookingService.CreateBooking] stored %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) GetBooking(id string) (*Booking, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.bookings[id]
  if !ok {
    return nil, fmt.Errorf("unknown Booking id: %s", id)
  }
  fmt.Printf("[HotelBookingService.GetBooking] found %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) CreateGuest(name string) (*Guest, error) {
  if name == "" {
    return nil, fmt.Errorf("Guest name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("GUE-%04d", s.seq)
  s.seq++
  obj, err := NewGuest(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.guests[id] = obj
  fmt.Printf("[HotelBookingService.CreateGuest] stored %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) GetGuest(id string) (*Guest, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.guests[id]
  if !ok {
    return nil, fmt.Errorf("unknown Guest id: %s", id)
  }
  fmt.Printf("[HotelBookingService.GetGuest] found %s\\n", id)
  return obj, nil
}

func (s *HotelBookingService) CloseHotel(id string) (*Hotel, error) {
  obj, err := s.GetHotel(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[HotelBookingService.CloseHotel] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct HotelBookingService ==========")
  system := NewHotelBookingService()
  fmt.Println("========== STEP 2: Create Hotel ==========")
  first, _ := system.CreateHotel("alpha-hotel")
  system.CreateHotel("beta-hotel")
  system.CreateRoom("sample-room")
  system.CreateRoomType("sample-room_type")
  system.CreateBooking("sample-booking")
  system.CreateGuest("sample-guest")
  system.CloseHotel(first.ID)
  if _, err := system.CloseHotel(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetHotel("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Hotel {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Hotel(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Hotel requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Hotel.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Hotel invalid status");
    }
    Console.WriteLine("[Hotel.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Hotel " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Hotel.close] id=" + Id + " -> CLOSED");
  }
}


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


sealed class RoomType {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public RoomType(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("RoomType requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[RoomType.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("RoomType invalid status");
    }
    Console.WriteLine("[RoomType.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("RoomType " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[RoomType.close] id=" + Id + " -> CLOSED");
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


sealed class Guest {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Guest(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Guest requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Guest.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Guest invalid status");
    }
    Console.WriteLine("[Guest.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Guest " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Guest.close] id=" + Id + " -> CLOSED");
  }
}

sealed class HotelBookingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Hotel> _hotels = new();
  private readonly Dictionary<string, Room> _rooms = new();
  private readonly Dictionary<string, RoomType> _room_types = new();
  private readonly Dictionary<string, Booking> _bookings = new();
  private readonly Dictionary<string, Guest> _guests = new();
  public HotelBookingService() {
    Console.WriteLine("[HotelBookingService.__init__] system ready");
  }

  public Hotel CreateHotel(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Hotel name required");
    }
    lock (_gate) {
      var id = string.Format("HOT-{0:D4}", _seq++);
      var obj = new Hotel(id, name.Trim());
      obj.Validate();
      _hotels[id] = obj;
      Console.WriteLine("[HotelBookingService.CreateHotel] stored " + id);
      return obj;
    }
  }

  public Hotel GetHotel(string id) {
    lock (_gate) {
      if (!_hotels.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Hotel id: " + id);
      }
      Console.WriteLine("[HotelBookingService.GetHotel] found " + id);
      return obj;
    }
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
      Console.WriteLine("[HotelBookingService.CreateRoom] stored " + id);
      return obj;
    }
  }

  public Room GetRoom(string id) {
    lock (_gate) {
      if (!_rooms.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Room id: " + id);
      }
      Console.WriteLine("[HotelBookingService.GetRoom] found " + id);
      return obj;
    }
  }

  public RoomType CreateRoomType(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("RoomType name required");
    }
    lock (_gate) {
      var id = string.Format("ROO-{0:D4}", _seq++);
      var obj = new RoomType(id, name.Trim());
      obj.Validate();
      _room_types[id] = obj;
      Console.WriteLine("[HotelBookingService.CreateRoomType] stored " + id);
      return obj;
    }
  }

  public RoomType GetRoomType(string id) {
    lock (_gate) {
      if (!_room_types.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown RoomType id: " + id);
      }
      Console.WriteLine("[HotelBookingService.GetRoomType] found " + id);
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
      Console.WriteLine("[HotelBookingService.CreateBooking] stored " + id);
      return obj;
    }
  }

  public Booking GetBooking(string id) {
    lock (_gate) {
      if (!_bookings.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Booking id: " + id);
      }
      Console.WriteLine("[HotelBookingService.GetBooking] found " + id);
      return obj;
    }
  }

  public Guest CreateGuest(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Guest name required");
    }
    lock (_gate) {
      var id = string.Format("GUE-{0:D4}", _seq++);
      var obj = new Guest(id, name.Trim());
      obj.Validate();
      _guests[id] = obj;
      Console.WriteLine("[HotelBookingService.CreateGuest] stored " + id);
      return obj;
    }
  }

  public Guest GetGuest(string id) {
    lock (_gate) {
      if (!_guests.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Guest id: " + id);
      }
      Console.WriteLine("[HotelBookingService.GetGuest] found " + id);
      return obj;
    }
  }

  public Hotel CloseHotel(string id) {
    var obj = GetHotel(id);
    Console.WriteLine("[HotelBookingService.CloseHotel] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct HotelBookingService ==========");
    var system = new HotelBookingService();
    Console.WriteLine("========== STEP 2: Create Hotel ==========");
    var first = system.CreateHotel("alpha-hotel");
    system.CreateHotel("beta-hotel");
    system.CreateRoom("sample-room");
    system.CreateRoomType("sample-room_type");
    system.CreateBooking("sample-booking");
    system.CreateGuest("sample-guest");
    system.CloseHotel(first.Id);
    try {
      system.CloseHotel(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetHotel("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const hotelBookingSolution: ProblemSolution = {
  slug: 'hotel-booking',
  title: 'Hotel Booking System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a hotel booking system where users search, book, and manage hotel room reservations with real-time availability. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Search hotels by location, dates, and guest count',
      'View room types, amenities, photos, and pricing',
      'Book one or more rooms for a date range',
      'Modify or cancel existing bookings',
      'Support room type pricing rules (weekends, seasonal)',
      'Process payments and issue booking confirmations',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Search hotels by location, dates, and guest count?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'View room types, amenities, photos, and pricing?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Book one or more rooms for a date range?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Modify or cancel existing bookings?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support room type pricing rules (weekends, seasonal)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. HotelBookingService is the facade stereotype. Hotel, Room, RoomType, Booking, Guest are concrete domain classes with id/name/status and validate/close.',
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
          'Construct HotelBookingService.',
          'createHotel twice and create the related UML classes.',
          'closeHotel once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'HotelBookingService', responsibility: 'UML facade - orchestrates Hotel Booking System.', keyMembers: ['create*', 'get*', 'closeHotel'] },
    { name: 'Hotel', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Room', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'RoomType', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Booking', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Guest', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from HotelBookingService to Hotel, Room, RoomType, Booking, Guest. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on HotelBookingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'HotelBookingService', responsibility: 'UML facade - orchestrates Hotel Booking System.', keyMembers: ['create*', 'get*', 'closeHotel'] },
    { name: 'Hotel', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Room', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'RoomType', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Booking', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Guest', responsibility: 'UML class - domain object for Hotel Booking System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'HotelBookingService exposes create/get/close and owns composed collections.' },
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
      'main constructs HotelBookingService, creates UML domain objects, closes the primary Hotel, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct HotelBookingService.',
      'createHotel for alpha and beta.',
      'create remaining UML classes.',
      'closeHotel(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createHotel("alpha..."); closeHotel(id)',
        output: '[Hotel.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeHotel(alreadyClosed) or getHotel("MISSING-ID")',
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
