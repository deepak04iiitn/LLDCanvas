import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'EventTicketingPlatformService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_events', 'Map<string, Event>'),
    attr('-', '_venues', 'Map<string, Venue>'),
    attr('-', '_seats', 'Map<string, Seat>'),
    attr('-', '_reservations', 'Map<string, Reservation>'),
    attr('-', '_tickets', 'Map<string, Ticket>'),
  ], [
    method('+', 'createEvent', 'name: string', 'Event'),
    method('+', 'createVenue', 'name: string', 'Venue'),
    method('+', 'createSeat', 'name: string', 'Seat'),
    method('+', 'createReservation', 'name: string', 'Reservation'),
    method('+', 'createTicket', 'name: string', 'Ticket'),
    method('+', 'getEvent', 'id: string', 'Event'),
    method('+', 'getVenue', 'id: string', 'Venue'),
    method('+', 'getSeat', 'id: string', 'Seat'),
    method('+', 'getReservation', 'id: string', 'Reservation'),
    method('+', 'getTicket', 'id: string', 'Ticket'),
    method('+', 'closeEvent', 'id: string', 'Event'),
  ], 'facade'),
  cls('n1', 'Event', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Venue', GRID.x(2), GRID.y(0), [
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
  cls('n4', 'Reservation', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Ticket', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("event-ticketing-platform")


class Event:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Event.id is required")
        if not name or not name.strip():
            raise ValueError("Event.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Event.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Event {self.id} has invalid status={self.status}")
        log.info("[Event.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Event {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Event.close] id=%s -> CLOSED", self.id)


class Venue:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Venue.id is required")
        if not name or not name.strip():
            raise ValueError("Venue.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Venue.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Venue {self.id} has invalid status={self.status}")
        log.info("[Venue.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Venue {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Venue.close] id=%s -> CLOSED", self.id)


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


class Ticket:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Ticket.id is required")
        if not name or not name.strip():
            raise ValueError("Ticket.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Ticket.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Ticket {self.id} has invalid status={self.status}")
        log.info("[Ticket.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Ticket {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Ticket.close] id=%s -> CLOSED", self.id)


class EventTicketingPlatformService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._events: Dict[str, Event] = {}
        self._venues: Dict[str, Venue] = {}
        self._seats: Dict[str, Seat] = {}
        self._reservations: Dict[str, Reservation] = {}
        self._tickets: Dict[str, Ticket] = {}
        log.info("[EventTicketingPlatformService.__init__] system ready; managing: Event, Venue, Seat, Reservation, Ticket")

    def create_event(self, name: str) -> Event:
        """UML: EventTicketingPlatformService.create_event(name) -> Event"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Event name is required")
        with self._lock:
            item_id = f"EVE-{self._seq:04d}"
            self._seq += 1
            obj = Event(item_id, cleaned)
            obj.validate()
            self._events[item_id] = obj
            log.info("[EventTicketingPlatformService.create_event] stored %s in _events (count=%s)", item_id, len(self._events))
            return obj

    def get_event(self, item_id: str) -> Event:
        with self._lock:
            obj = self._events.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Event id: {item_id}")
            log.info("[EventTicketingPlatformService.get_event] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_venue(self, name: str) -> Venue:
        """UML: EventTicketingPlatformService.create_venue(name) -> Venue"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Venue name is required")
        with self._lock:
            item_id = f"VEN-{self._seq:04d}"
            self._seq += 1
            obj = Venue(item_id, cleaned)
            obj.validate()
            self._venues[item_id] = obj
            log.info("[EventTicketingPlatformService.create_venue] stored %s in _venues (count=%s)", item_id, len(self._venues))
            return obj

    def get_venue(self, item_id: str) -> Venue:
        with self._lock:
            obj = self._venues.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Venue id: {item_id}")
            log.info("[EventTicketingPlatformService.get_venue] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_seat(self, name: str) -> Seat:
        """UML: EventTicketingPlatformService.create_seat(name) -> Seat"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Seat name is required")
        with self._lock:
            item_id = f"SEA-{self._seq:04d}"
            self._seq += 1
            obj = Seat(item_id, cleaned)
            obj.validate()
            self._seats[item_id] = obj
            log.info("[EventTicketingPlatformService.create_seat] stored %s in _seats (count=%s)", item_id, len(self._seats))
            return obj

    def get_seat(self, item_id: str) -> Seat:
        with self._lock:
            obj = self._seats.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Seat id: {item_id}")
            log.info("[EventTicketingPlatformService.get_seat] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_reservation(self, name: str) -> Reservation:
        """UML: EventTicketingPlatformService.create_reservation(name) -> Reservation"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Reservation name is required")
        with self._lock:
            item_id = f"RES-{self._seq:04d}"
            self._seq += 1
            obj = Reservation(item_id, cleaned)
            obj.validate()
            self._reservations[item_id] = obj
            log.info("[EventTicketingPlatformService.create_reservation] stored %s in _reservations (count=%s)", item_id, len(self._reservations))
            return obj

    def get_reservation(self, item_id: str) -> Reservation:
        with self._lock:
            obj = self._reservations.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Reservation id: {item_id}")
            log.info("[EventTicketingPlatformService.get_reservation] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_ticket(self, name: str) -> Ticket:
        """UML: EventTicketingPlatformService.create_ticket(name) -> Ticket"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Ticket name is required")
        with self._lock:
            item_id = f"TIC-{self._seq:04d}"
            self._seq += 1
            obj = Ticket(item_id, cleaned)
            obj.validate()
            self._tickets[item_id] = obj
            log.info("[EventTicketingPlatformService.create_ticket] stored %s in _tickets (count=%s)", item_id, len(self._tickets))
            return obj

    def get_ticket(self, item_id: str) -> Ticket:
        with self._lock:
            obj = self._tickets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Ticket id: {item_id}")
            log.info("[EventTicketingPlatformService.get_ticket] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_event(self, item_id: str) -> Event:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._events.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Event id: {item_id}")
            log.info("[EventTicketingPlatformService.close_event] closing %s via Event.close()", item_id)
            obj.close()
            return obj

    def list_active_events(self) -> List[Event]:
        with self._lock:
            active = [o for o in self._events.values() if o.status == "ACTIVE"]
            log.info("[EventTicketingPlatformService.list_active_events] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct EventTicketingPlatformService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = EventTicketingPlatformService()

    log.info("========== STEP 2: Create primary Event objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_event("alpha-event")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_event("beta-event")

    log.info("========== STEP 3: Create Venue (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_venue("sample-venue")

    log.info("========== STEP 4: Create Seat (UML class) ==========")
    system.create_seat("sample-seat")

    log.info("========== STEP 5: Create Reservation (UML class) ==========")
    system.create_reservation("sample-reservation")

    log.info("========== STEP 6: Create Ticket (UML class) ==========")
    system.create_ticket("sample-ticket")

    log.info("========== STEP 7: Inspect active Event list ==========")
    system.list_active_events()

    log.info("========== STEP 8: Close first Event ==========")
    system.close_event(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_event(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Event.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_event("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_event: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_events()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Event {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Event(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Event.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Event.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Event.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Event " + id + " invalid status");
    }
    System.out.println("[Event.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Event " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Event.close] id=" + id + " -> CLOSED");
  }
}


class Venue {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Venue(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Venue.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Venue.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Venue.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Venue " + id + " invalid status");
    }
    System.out.println("[Venue.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Venue " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Venue.close] id=" + id + " -> CLOSED");
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


class Ticket {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Ticket(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Ticket.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Ticket.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Ticket.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Ticket " + id + " invalid status");
    }
    System.out.println("[Ticket.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Ticket " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Ticket.close] id=" + id + " -> CLOSED");
  }
}

public class EventTicketingPlatformService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Event> events = new LinkedHashMap<>();
  private final Map<String, Venue> venues = new LinkedHashMap<>();
  private final Map<String, Seat> seats = new LinkedHashMap<>();
  private final Map<String, Reservation> reservations = new LinkedHashMap<>();
  private final Map<String, Ticket> tickets = new LinkedHashMap<>();

  public EventTicketingPlatformService() {
    System.out.println("[EventTicketingPlatformService.__init__] system ready");
  }

  public Event createEvent(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Event name required");
    }
    lock.lock();
    try {
      String id = String.format("EVE-%04d", seq++);
      Event obj = new Event(id, name.trim());
      obj.validate();
      events.put(id, obj);
      System.out.println("[EventTicketingPlatformService.createEvent] stored " + id + " count=" + events.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Event getEvent(String id) {
    lock.lock();
    try {
      Event obj = events.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Event id: " + id);
      }
      System.out.println("[EventTicketingPlatformService.getEvent] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Venue createVenue(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Venue name required");
    }
    lock.lock();
    try {
      String id = String.format("VEN-%04d", seq++);
      Venue obj = new Venue(id, name.trim());
      obj.validate();
      venues.put(id, obj);
      System.out.println("[EventTicketingPlatformService.createVenue] stored " + id + " count=" + venues.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Venue getVenue(String id) {
    lock.lock();
    try {
      Venue obj = venues.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Venue id: " + id);
      }
      System.out.println("[EventTicketingPlatformService.getVenue] found id=" + obj.getId());
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
      System.out.println("[EventTicketingPlatformService.createSeat] stored " + id + " count=" + seats.size());
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
      System.out.println("[EventTicketingPlatformService.getSeat] found id=" + obj.getId());
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
      System.out.println("[EventTicketingPlatformService.createReservation] stored " + id + " count=" + reservations.size());
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
      System.out.println("[EventTicketingPlatformService.getReservation] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Ticket createTicket(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Ticket name required");
    }
    lock.lock();
    try {
      String id = String.format("TIC-%04d", seq++);
      Ticket obj = new Ticket(id, name.trim());
      obj.validate();
      tickets.put(id, obj);
      System.out.println("[EventTicketingPlatformService.createTicket] stored " + id + " count=" + tickets.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Ticket getTicket(String id) {
    lock.lock();
    try {
      Ticket obj = tickets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Ticket id: " + id);
      }
      System.out.println("[EventTicketingPlatformService.getTicket] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Event closeEvent(String id) {
    lock.lock();
    try {
      Event obj = events.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Event id: " + id);
      }
      System.out.println("[EventTicketingPlatformService.closeEvent] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Event> listActiveEvents() {
    lock.lock();
    try {
      List<Event> out = new ArrayList<>();
      for (Event o : events.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[EventTicketingPlatformService.listActiveEvents] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct EventTicketingPlatformService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    EventTicketingPlatformService system = new EventTicketingPlatformService();
    System.out.println("========== STEP 2: Create Event objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Event first = system.createEvent("alpha-event");
    system.createEvent("beta-event");
    System.out.println("========== STEP 3: Create Venue ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createVenue("sample-venue");
    System.out.println("========== STEP 4: Create Seat ==========");
    system.createSeat("sample-seat");
    System.out.println("========== STEP 5: Create Reservation ==========");
    system.createReservation("sample-reservation");
    System.out.println("========== STEP 6: Create Ticket ==========");
    system.createTicket("sample-ticket");
    System.out.println("========== Inspect active list ==========");
    system.listActiveEvents();
    System.out.println("========== Close first Event ==========");
    system.closeEvent(first.getId());
    try {
      system.closeEvent(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getEvent("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Event {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Event.id required')
    }

    if (!name?.trim()) {
      throw new Error('Event.name required')
    }
    console.log(\`[Event.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Event \${this.id} invalid status\`)
    }
    console.log(\`[Event.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Event \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Event.close] id=\${this.id} -> CLOSED\`)
  }
}


class Venue {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Venue.id required')
    }

    if (!name?.trim()) {
      throw new Error('Venue.name required')
    }
    console.log(\`[Venue.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Venue \${this.id} invalid status\`)
    }
    console.log(\`[Venue.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Venue \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Venue.close] id=\${this.id} -> CLOSED\`)
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


class Ticket {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Ticket.id required')
    }

    if (!name?.trim()) {
      throw new Error('Ticket.name required')
    }
    console.log(\`[Ticket.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Ticket \${this.id} invalid status\`)
    }
    console.log(\`[Ticket.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Ticket \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Ticket.close] id=\${this.id} -> CLOSED\`)
  }
}

class EventTicketingPlatformService {
  private seq = 1
  private events = new Map<string, Event>()
  private venues = new Map<string, Venue>()
  private seats = new Map<string, Seat>()
  private reservations = new Map<string, Reservation>()
  private tickets = new Map<string, Ticket>()
  constructor() {
    console.log('[EventTicketingPlatformService.__init__] system ready')
  }

  createEvent(name: string): Event {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Event name required')
    }
    const id = \`EVE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Event(id, cleaned)
    obj.validate()
    this.events.set(id, obj)
    console.log(\`[EventTicketingPlatformService.createEvent] stored \${id} count=\${this.events.size}\`)
    return obj
  }

  getEvent(id: string): Event {
    const obj = this.events.get(id)
    if (!obj) {
      throw new Error(\`unknown Event id: \${id}\`)
    }
    console.log(\`[EventTicketingPlatformService.getEvent] found id=\${obj.id}\`)
    return obj
  }

  createVenue(name: string): Venue {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Venue name required')
    }
    const id = \`VEN-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Venue(id, cleaned)
    obj.validate()
    this.venues.set(id, obj)
    console.log(\`[EventTicketingPlatformService.createVenue] stored \${id} count=\${this.venues.size}\`)
    return obj
  }

  getVenue(id: string): Venue {
    const obj = this.venues.get(id)
    if (!obj) {
      throw new Error(\`unknown Venue id: \${id}\`)
    }
    console.log(\`[EventTicketingPlatformService.getVenue] found id=\${obj.id}\`)
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
    console.log(\`[EventTicketingPlatformService.createSeat] stored \${id} count=\${this.seats.size}\`)
    return obj
  }

  getSeat(id: string): Seat {
    const obj = this.seats.get(id)
    if (!obj) {
      throw new Error(\`unknown Seat id: \${id}\`)
    }
    console.log(\`[EventTicketingPlatformService.getSeat] found id=\${obj.id}\`)
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
    console.log(\`[EventTicketingPlatformService.createReservation] stored \${id} count=\${this.reservations.size}\`)
    return obj
  }

  getReservation(id: string): Reservation {
    const obj = this.reservations.get(id)
    if (!obj) {
      throw new Error(\`unknown Reservation id: \${id}\`)
    }
    console.log(\`[EventTicketingPlatformService.getReservation] found id=\${obj.id}\`)
    return obj
  }

  createTicket(name: string): Ticket {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Ticket name required')
    }
    const id = \`TIC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Ticket(id, cleaned)
    obj.validate()
    this.tickets.set(id, obj)
    console.log(\`[EventTicketingPlatformService.createTicket] stored \${id} count=\${this.tickets.size}\`)
    return obj
  }

  getTicket(id: string): Ticket {
    const obj = this.tickets.get(id)
    if (!obj) {
      throw new Error(\`unknown Ticket id: \${id}\`)
    }
    console.log(\`[EventTicketingPlatformService.getTicket] found id=\${obj.id}\`)
    return obj
  }

  closeEvent(id: string): Event {
    const obj = this.getEvent(id)
    console.log(\`[EventTicketingPlatformService.closeEvent] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveEvents(): Event[] {
    const active = [...this.events.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[EventTicketingPlatformService.listActiveEvents] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct EventTicketingPlatformService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new EventTicketingPlatformService()
  console.log('========== STEP 2: Create Event objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createEvent('alpha-event')
  system.createEvent('beta-event')
  console.log('========== STEP 3: Create Venue ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createVenue('sample-venue')
  console.log('========== STEP 4: Create Seat ==========')
  system.createSeat('sample-seat')
  console.log('========== STEP 5: Create Reservation ==========')
  system.createReservation('sample-reservation')
  console.log('========== STEP 6: Create Ticket ==========')
  system.createTicket('sample-ticket')
  system.listActiveEvents()
  console.log('========== Close first Event ==========')
  system.closeEvent(first.id)
  try {
    system.closeEvent(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getEvent('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Event {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Event(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Event requires id and name");
    }
    cout << "[Event.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Event invalid status");
    }
    cout << "[Event.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Event cannot close");
    }
    status_ = "CLOSED";
    cout << "[Event.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Venue {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Venue(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Venue requires id and name");
    }
    cout << "[Venue.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Venue invalid status");
    }
    cout << "[Venue.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Venue cannot close");
    }
    status_ = "CLOSED";
    cout << "[Venue.close] id=" << id_ << " -> CLOSED" << endl;
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


class Ticket {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Ticket(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Ticket requires id and name");
    }
    cout << "[Ticket.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Ticket invalid status");
    }
    cout << "[Ticket.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Ticket cannot close");
    }
    status_ = "CLOSED";
    cout << "[Ticket.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class EventTicketingPlatformService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Event> events_;
  unordered_map<string, Venue> venues_;
  unordered_map<string, Seat> seats_;
  unordered_map<string, Reservation> reservations_;
  unordered_map<string, Ticket> tickets_;
public:
  EventTicketingPlatformService() {
    cout << "[EventTicketingPlatformService.__init__] system ready" << endl;
  }

  Event createEvent(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Event name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "EVE-%04d", seq_++);
    Event obj{buf, name};
    obj.validate();
    events_.emplace(obj.id(), obj);
    cout << "[EventTicketingPlatformService.createEvent] stored " << obj.id() << endl;
    return obj;
  }

  Event getEvent(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = events_.find(id);
    if (it == events_.end()) {
      throw out_of_range("unknown Event id");
    }
    cout << "[EventTicketingPlatformService.getEvent] found " << id << endl;
    return it->second;
  }

  Venue createVenue(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Venue name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "VEN-%04d", seq_++);
    Venue obj{buf, name};
    obj.validate();
    venues_.emplace(obj.id(), obj);
    cout << "[EventTicketingPlatformService.createVenue] stored " << obj.id() << endl;
    return obj;
  }

  Venue getVenue(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = venues_.find(id);
    if (it == venues_.end()) {
      throw out_of_range("unknown Venue id");
    }
    cout << "[EventTicketingPlatformService.getVenue] found " << id << endl;
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
    cout << "[EventTicketingPlatformService.createSeat] stored " << obj.id() << endl;
    return obj;
  }

  Seat getSeat(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = seats_.find(id);
    if (it == seats_.end()) {
      throw out_of_range("unknown Seat id");
    }
    cout << "[EventTicketingPlatformService.getSeat] found " << id << endl;
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
    cout << "[EventTicketingPlatformService.createReservation] stored " << obj.id() << endl;
    return obj;
  }

  Reservation getReservation(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = reservations_.find(id);
    if (it == reservations_.end()) {
      throw out_of_range("unknown Reservation id");
    }
    cout << "[EventTicketingPlatformService.getReservation] found " << id << endl;
    return it->second;
  }

  Ticket createTicket(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Ticket name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TIC-%04d", seq_++);
    Ticket obj{buf, name};
    obj.validate();
    tickets_.emplace(obj.id(), obj);
    cout << "[EventTicketingPlatformService.createTicket] stored " << obj.id() << endl;
    return obj;
  }

  Ticket getTicket(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = tickets_.find(id);
    if (it == tickets_.end()) {
      throw out_of_range("unknown Ticket id");
    }
    cout << "[EventTicketingPlatformService.getTicket] found " << id << endl;
    return it->second;
  }

  Event closeEvent(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = events_.find(id);
    if (it == events_.end()) {
      throw out_of_range("unknown Event");
    }
    cout << "[EventTicketingPlatformService.closeEvent] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct EventTicketingPlatformService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  EventTicketingPlatformService system;
  cout << "========== STEP 2: Create Event ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createEvent("alpha-event");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createEvent("beta-event");
  system.createVenue("sample-venue");
  system.createSeat("sample-seat");
  system.createReservation("sample-reservation");
  system.createTicket("sample-ticket");
  system.closeEvent(first.id());
  try {
    system.closeEvent(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getEvent("MISSING-ID");
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

type Event struct {
  ID     string
  Name   string
  Status string
}

func NewEvent(id, name string) (*Event, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Event requires id and name")
  }
  obj := &Event{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Event.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Event) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Event invalid status")
  }
  fmt.Printf("[Event.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Event) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Event %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Event.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Venue struct {
  ID     string
  Name   string
  Status string
}

func NewVenue(id, name string) (*Venue, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Venue requires id and name")
  }
  obj := &Venue{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Venue.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Venue) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Venue invalid status")
  }
  fmt.Printf("[Venue.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Venue) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Venue %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Venue.close] id=%s -> CLOSED\\n", o.ID)
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


type Ticket struct {
  ID     string
  Name   string
  Status string
}

func NewTicket(id, name string) (*Ticket, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Ticket requires id and name")
  }
  obj := &Ticket{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Ticket.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Ticket) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Ticket invalid status")
  }
  fmt.Printf("[Ticket.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Ticket) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Ticket %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Ticket.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type EventTicketingPlatformService struct {
  mu  sync.Mutex
  seq int
  events map[string]*Event
  venues map[string]*Venue
  seats map[string]*Seat
  reservations map[string]*Reservation
  tickets map[string]*Ticket
}

func NewEventTicketingPlatformService() *EventTicketingPlatformService {
  fmt.Println("[EventTicketingPlatformService.__init__] system ready")
  return &EventTicketingPlatformService{
    seq: 1,
    events: map[string]*Event{},
    venues: map[string]*Venue{},
    seats: map[string]*Seat{},
    reservations: map[string]*Reservation{},
    tickets: map[string]*Ticket{},
  }
}

func (s *EventTicketingPlatformService) CreateEvent(name string) (*Event, error) {
  if name == "" {
    return nil, fmt.Errorf("Event name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("EVE-%04d", s.seq)
  s.seq++
  obj, err := NewEvent(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.events[id] = obj
  fmt.Printf("[EventTicketingPlatformService.CreateEvent] stored %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) GetEvent(id string) (*Event, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.events[id]
  if !ok {
    return nil, fmt.Errorf("unknown Event id: %s", id)
  }
  fmt.Printf("[EventTicketingPlatformService.GetEvent] found %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) CreateVenue(name string) (*Venue, error) {
  if name == "" {
    return nil, fmt.Errorf("Venue name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("VEN-%04d", s.seq)
  s.seq++
  obj, err := NewVenue(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.venues[id] = obj
  fmt.Printf("[EventTicketingPlatformService.CreateVenue] stored %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) GetVenue(id string) (*Venue, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.venues[id]
  if !ok {
    return nil, fmt.Errorf("unknown Venue id: %s", id)
  }
  fmt.Printf("[EventTicketingPlatformService.GetVenue] found %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) CreateSeat(name string) (*Seat, error) {
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
  fmt.Printf("[EventTicketingPlatformService.CreateSeat] stored %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) GetSeat(id string) (*Seat, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.seats[id]
  if !ok {
    return nil, fmt.Errorf("unknown Seat id: %s", id)
  }
  fmt.Printf("[EventTicketingPlatformService.GetSeat] found %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) CreateReservation(name string) (*Reservation, error) {
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
  fmt.Printf("[EventTicketingPlatformService.CreateReservation] stored %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) GetReservation(id string) (*Reservation, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.reservations[id]
  if !ok {
    return nil, fmt.Errorf("unknown Reservation id: %s", id)
  }
  fmt.Printf("[EventTicketingPlatformService.GetReservation] found %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) CreateTicket(name string) (*Ticket, error) {
  if name == "" {
    return nil, fmt.Errorf("Ticket name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TIC-%04d", s.seq)
  s.seq++
  obj, err := NewTicket(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.tickets[id] = obj
  fmt.Printf("[EventTicketingPlatformService.CreateTicket] stored %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) GetTicket(id string) (*Ticket, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.tickets[id]
  if !ok {
    return nil, fmt.Errorf("unknown Ticket id: %s", id)
  }
  fmt.Printf("[EventTicketingPlatformService.GetTicket] found %s\\n", id)
  return obj, nil
}

func (s *EventTicketingPlatformService) CloseEvent(id string) (*Event, error) {
  obj, err := s.GetEvent(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[EventTicketingPlatformService.CloseEvent] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct EventTicketingPlatformService ==========")
  system := NewEventTicketingPlatformService()
  fmt.Println("========== STEP 2: Create Event ==========")
  first, _ := system.CreateEvent("alpha-event")
  system.CreateEvent("beta-event")
  system.CreateVenue("sample-venue")
  system.CreateSeat("sample-seat")
  system.CreateReservation("sample-reservation")
  system.CreateTicket("sample-ticket")
  system.CloseEvent(first.ID)
  if _, err := system.CloseEvent(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetEvent("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Event {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Event(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Event requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Event.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Event invalid status");
    }
    Console.WriteLine("[Event.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Event " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Event.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Venue {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Venue(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Venue requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Venue.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Venue invalid status");
    }
    Console.WriteLine("[Venue.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Venue " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Venue.close] id=" + Id + " -> CLOSED");
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


sealed class Ticket {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Ticket(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Ticket requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Ticket.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Ticket invalid status");
    }
    Console.WriteLine("[Ticket.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Ticket " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Ticket.close] id=" + Id + " -> CLOSED");
  }
}

sealed class EventTicketingPlatformService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Event> _events = new();
  private readonly Dictionary<string, Venue> _venues = new();
  private readonly Dictionary<string, Seat> _seats = new();
  private readonly Dictionary<string, Reservation> _reservations = new();
  private readonly Dictionary<string, Ticket> _tickets = new();
  public EventTicketingPlatformService() {
    Console.WriteLine("[EventTicketingPlatformService.__init__] system ready");
  }

  public Event CreateEvent(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Event name required");
    }
    lock (_gate) {
      var id = string.Format("EVE-{0:D4}", _seq++);
      var obj = new Event(id, name.Trim());
      obj.Validate();
      _events[id] = obj;
      Console.WriteLine("[EventTicketingPlatformService.CreateEvent] stored " + id);
      return obj;
    }
  }

  public Event GetEvent(string id) {
    lock (_gate) {
      if (!_events.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Event id: " + id);
      }
      Console.WriteLine("[EventTicketingPlatformService.GetEvent] found " + id);
      return obj;
    }
  }

  public Venue CreateVenue(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Venue name required");
    }
    lock (_gate) {
      var id = string.Format("VEN-{0:D4}", _seq++);
      var obj = new Venue(id, name.Trim());
      obj.Validate();
      _venues[id] = obj;
      Console.WriteLine("[EventTicketingPlatformService.CreateVenue] stored " + id);
      return obj;
    }
  }

  public Venue GetVenue(string id) {
    lock (_gate) {
      if (!_venues.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Venue id: " + id);
      }
      Console.WriteLine("[EventTicketingPlatformService.GetVenue] found " + id);
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
      Console.WriteLine("[EventTicketingPlatformService.CreateSeat] stored " + id);
      return obj;
    }
  }

  public Seat GetSeat(string id) {
    lock (_gate) {
      if (!_seats.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Seat id: " + id);
      }
      Console.WriteLine("[EventTicketingPlatformService.GetSeat] found " + id);
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
      Console.WriteLine("[EventTicketingPlatformService.CreateReservation] stored " + id);
      return obj;
    }
  }

  public Reservation GetReservation(string id) {
    lock (_gate) {
      if (!_reservations.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Reservation id: " + id);
      }
      Console.WriteLine("[EventTicketingPlatformService.GetReservation] found " + id);
      return obj;
    }
  }

  public Ticket CreateTicket(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Ticket name required");
    }
    lock (_gate) {
      var id = string.Format("TIC-{0:D4}", _seq++);
      var obj = new Ticket(id, name.Trim());
      obj.Validate();
      _tickets[id] = obj;
      Console.WriteLine("[EventTicketingPlatformService.CreateTicket] stored " + id);
      return obj;
    }
  }

  public Ticket GetTicket(string id) {
    lock (_gate) {
      if (!_tickets.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Ticket id: " + id);
      }
      Console.WriteLine("[EventTicketingPlatformService.GetTicket] found " + id);
      return obj;
    }
  }

  public Event CloseEvent(string id) {
    var obj = GetEvent(id);
    Console.WriteLine("[EventTicketingPlatformService.CloseEvent] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct EventTicketingPlatformService ==========");
    var system = new EventTicketingPlatformService();
    Console.WriteLine("========== STEP 2: Create Event ==========");
    var first = system.CreateEvent("alpha-event");
    system.CreateEvent("beta-event");
    system.CreateVenue("sample-venue");
    system.CreateSeat("sample-seat");
    system.CreateReservation("sample-reservation");
    system.CreateTicket("sample-ticket");
    system.CloseEvent(first.Id);
    try {
      system.CloseEvent(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetEvent("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const eventTicketingPlatformSolution: ProblemSolution = {
  slug: 'event-ticketing-platform',
  title: 'Event Ticketing Platform - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a ticketing platform (like Ticketmaster) for concerts and sports events with seat selection and high-demand sale handling. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Browse events and view available seating sections',
      'Select and reserve seats temporarily during checkout',
      'Release reservation if checkout isn\'t completed in time',
      'Purchase tickets and generate e-tickets with QR codes',
      'Support a virtual waiting room for high-demand on-sales',
      'Resell/transfer a ticket to another user',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Browse events and view available seating sections?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Select and reserve seats temporarily during checkout?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Release reservation if checkout isn\'t completed in time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Purchase tickets and generate e-tickets with QR codes?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support a virtual waiting room for high-demand on-sales?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. EventTicketingPlatformService is the facade stereotype. Event, Venue, Seat, Reservation, Ticket are concrete domain classes with id/name/status and validate/close.',
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
          'Construct EventTicketingPlatformService.',
          'createEvent twice and create the related UML classes.',
          'closeEvent once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'EventTicketingPlatformService', responsibility: 'UML facade - orchestrates Event Ticketing Platform.', keyMembers: ['create*', 'get*', 'closeEvent'] },
    { name: 'Event', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Venue', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Seat', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Reservation', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Ticket', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from EventTicketingPlatformService to Event, Venue, Seat, Reservation, Ticket. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on EventTicketingPlatformService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'EventTicketingPlatformService', responsibility: 'UML facade - orchestrates Event Ticketing Platform.', keyMembers: ['create*', 'get*', 'closeEvent'] },
    { name: 'Event', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Venue', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Seat', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Reservation', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Ticket', responsibility: 'UML class - domain object for Event Ticketing Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'EventTicketingPlatformService exposes create/get/close and owns composed collections.' },
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
      'main constructs EventTicketingPlatformService, creates UML domain objects, closes the primary Event, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct EventTicketingPlatformService.',
      'createEvent for alpha and beta.',
      'create remaining UML classes.',
      'closeEvent(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createEvent("alpha..."); closeEvent(id)',
        output: '[Event.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeEvent(alreadyClosed) or getEvent("MISSING-ID")',
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
