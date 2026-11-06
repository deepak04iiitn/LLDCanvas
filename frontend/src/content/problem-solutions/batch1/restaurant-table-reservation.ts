import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('rs', 'Restaurant', GRID.x(0), GRID.y(0), [
    attr('-', 'tables', 'List<Table>'),
    attr('-', 'reservations', 'Map<int, Reservation>'),
    attr('-', 'waitlist', 'Waitlist'),
    attr('-', 'listeners', 'List<NotificationListener>'),
    attr('-', 'defaultDuration', 'int'),
  ], [
    method('+', 'reserve', 'customer, partySize, start, duration?', 'Reservation'),
    method('+', 'cancel', 'reservationId: int, now: int', 'void'),
    method('+', 'modify', 'reservationId, newStart, newParty, now', 'Reservation'),
    method('+', 'seatWalkIn', 'customer, partySize, now', 'Reservation?'),
    method('+', 'checkOut', 'reservationId: int, now: int', 'void'),
    method('+', 'notifyUpcoming', 'now: int, leadMinutes: int', 'List<Reservation>'),
  ]),
  cls('tb', 'Table', GRID.x(1.5), GRID.y(0), [
    attr('-', 'id', 'String'),
    attr('-', 'capacity', 'int'),
    attr('-', 'bookings', 'List<Reservation>'),
  ], [
    method('+', 'isFree', 'slot: TimeSlot, ignoreId: int', 'boolean'),
    method('+', 'book', 'r: Reservation', 'void'),
    method('+', 'release', 'r: Reservation', 'void'),
  ]),
  cls('rv', 'Reservation', GRID.x(3), GRID.y(0), [
    attr('-', 'id', 'int'),
    attr('-', 'customer', 'Customer'),
    attr('-', 'partySize', 'int'),
    attr('-', 'table', 'Table'),
    attr('-', 'slot', 'TimeSlot'),
    attr('-', 'status', 'ReservationStatus'),
    attr('-', 'notified', 'boolean'),
  ], []),
  cls('wl', 'Waitlist', GRID.x(0), GRID.y(1), [
    attr('-', 'entries', 'List<WaitlistEntry>'),
  ], [
    method('+', 'add', 'e: WaitlistEntry', 'void'),
    method('+', 'remove', 'e: WaitlistEntry', 'void'),
    method('+', 'entries', '', 'List<WaitlistEntry>'),
  ]),
  cls('we', 'WaitlistEntry', GRID.x(1), GRID.y(1), [
    attr('-', 'customer', 'Customer'),
    attr('-', 'partySize', 'int'),
    attr('-', 'joinedAt', 'int'),
  ], []),
  cls('ts', 'TimeSlot', GRID.x(2), GRID.y(1), [
    attr('-', 'start', 'int'),
    attr('-', 'end', 'int'),
  ], [
    method('+', 'overlaps', 'other: TimeSlot', 'boolean'),
  ]),
  cls('cu', 'Customer', GRID.x(3), GRID.y(1), [
    attr('-', 'id', 'String'),
    attr('-', 'name', 'String'),
    attr('-', 'phone', 'String'),
  ], []),
  enm('st', 'ReservationStatus', GRID.x(4), GRID.y(1), ['CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED']),
  iface('nl', 'NotificationListener', GRID.x(0), GRID.y(2), [
    method('+', 'onReservationApproaching', 'r: Reservation', 'void'),
    method('+', 'onWaitlistSeated', 'e: WaitlistEntry, r: Reservation', 'void'),
  ]),
  cls('sn', 'StaffNotifier', GRID.x(1.5), GRID.y(2), [], [
    method('+', 'onReservationApproaching', 'r: Reservation', 'void'),
    method('+', 'onWaitlistSeated', 'e: WaitlistEntry, r: Reservation', 'void'),
  ]),
]

const edges = [
  edge('e1', 'rs', 'tb', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1..*' }),
  edge('e2', 'tb', 'rv', 'association', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'holds' }),
  edge('e3', 'rs', 'wl', 'composition', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e4', 'wl', 'we', 'aggregation', 'right', 'left', { targetMultiplicity: '0..*' }),
  edge('e5', 'rv', 'ts', 'association', 'bottom@30', 'top@70', { label: 'occupies' }),
  edge('e6', 'rv', 'cu', 'association', 'bottom@70', 'top', { label: 'booked by' }),
  edge('e7', 'rv', 'st', 'dependency', 'right', 'top@50'),
  edge('e8', 'rs', 'nl', 'aggregation', 'bottom@20', 'top@30', { label: 'notifies', targetMultiplicity: '0..*' }),
  edge('e9', 'sn', 'nl', 'realization', 'left', 'right'),
]

const py = `"""Restaurant Table Reservation — medium-level LLD interview reference (Python).

Times are integer minutes on a single timeline (for example 19:00 on day 0 = 1140).
A real system would use datetime/Instant; integers keep the demo deterministic.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from threading import RLock
from typing import Dict, List, Optional


class ReservationError(Exception):
    pass


class ReservationStatus(Enum):
    CONFIRMED = "confirmed"
    SEATED = "seated"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


@dataclass(frozen=True)

class Customer:
    id: str
    name: str
    phone: str = ""


@dataclass(frozen=True)

class TimeSlot:
    start: int  # inclusive
    end: int    # exclusive

    def __post_init__(self) -> None:
        if self.end <= self.start:
            raise ValueError("end must be after start")

    def overlaps(self, other: "TimeSlot") -> bool:
        return self.start < other.end and other.start < self.end


@dataclass(eq=False)

class Reservation:
    id: int
    customer: Customer
    party_size: int
    table: "Table"
    slot: TimeSlot
    status: ReservationStatus = ReservationStatus.CONFIRMED
    notified: bool = False


class Table:
    def __init__(self, table_id: str, capacity: int):
        self.id = table_id
        self.capacity = capacity
        self._bookings: List[Reservation] = []  # only active bookings live here

    def is_free(self, slot: TimeSlot, ignore_id: Optional[int] = None) -> bool:
        return all(b.id == ignore_id or not b.slot.overlaps(slot) for b in self._bookings)

    def book(self, reservation: Reservation) -> None:
        self._bookings.append(reservation)

    def release(self, reservation: Reservation) -> None:
        self._bookings.remove(reservation)


@dataclass(frozen=True)

class WaitlistEntry:
    customer: Customer
    party_size: int
    joined_at: int


class Waitlist:
    def __init__(self) -> None:
        self._entries: List[WaitlistEntry] = []

    def add(self, entry: WaitlistEntry) -> None:
        self._entries.append(entry)

    def remove(self, entry: WaitlistEntry) -> None:
        self._entries.remove(entry)

    def entries(self) -> List[WaitlistEntry]:
        return list(self._entries)  # copy: callers may remove while iterating

    def __len__(self) -> int:
        return len(self._entries)


def format_time(minutes: int) -> str:
    m = minutes % 1440
    return "%02d:%02d" % (m // 60, m % 60)


class NotificationListener(ABC):
    @abstractmethod
    def on_reservation_approaching(self, reservation: Reservation) -> None:
        ...

    @abstractmethod
    def on_waitlist_seated(self, entry: WaitlistEntry, reservation: Reservation) -> None:
        ...


class StaffNotifier(NotificationListener):
    def on_reservation_approaching(self, r: Reservation) -> None:
        print("[staff] approaching: %s party of %d at %s (%s)"
              % (r.customer.name, r.party_size, format_time(r.slot.start), r.table.id))

    def on_waitlist_seated(self, entry: WaitlistEntry, r: Reservation) -> None:
        print("[staff] waitlist seated: %s at %s until %s"
              % (entry.customer.name, r.table.id, format_time(r.slot.end)))


class Restaurant:
    def __init__(self, tables: List[Table], default_duration: int = 90):
        if not tables:
            raise ValueError("need at least one table")
        # Sorted by capacity then id, so the first free table that fits is the best fit.
        self._tables = sorted(tables, key=lambda t: (t.capacity, t.id))
        self._duration = default_duration
        self._reservations: Dict[int, Reservation] = {}
        self._waitlist = Waitlist()
        self._listeners: List[NotificationListener] = []
        self._next_id = 1
        self._lock = RLock()

    def add_listener(self, listener: NotificationListener) -> None:
        self._listeners.append(listener)

    def waitlist_size(self) -> int:
        return len(self._waitlist)

    # ---- public API -------------------------------------------------------

    def reserve(self, customer: Customer, party_size: int, start: int,
                duration: Optional[int] = None) -> Reservation:
        slot = self._slot(start, duration)
        with self._lock:
            table = self._find_table(party_size, slot)
            if table is None:
                raise ReservationError("No table for party of %d at %s" % (party_size, format_time(start)))
            return self._create(customer, party_size, table, slot, ReservationStatus.CONFIRMED)

    def cancel(self, reservation_id: int, now: int) -> None:
        with self._lock:
            res = self._get(reservation_id, {ReservationStatus.CONFIRMED})
            res.table.release(res)
            res.status = ReservationStatus.CANCELLED
            self._promote_waitlist(now)

    def check_out(self, reservation_id: int, now: int) -> None:
        with self._lock:
            res = self._get(reservation_id, {ReservationStatus.CONFIRMED, ReservationStatus.SEATED})
            res.table.release(res)
            res.status = ReservationStatus.COMPLETED
            self._promote_waitlist(now)

    def modify(self, reservation_id: int, new_start: int, new_party: int, now: int) -> Reservation:
        with self._lock:
            res = self._get(reservation_id, {ReservationStatus.CONFIRMED})
            duration = res.slot.end - res.slot.start
            new_slot = TimeSlot(new_start, new_start + duration)
            # Ignore this reservation's own booking so it can shift into an overlapping time.
            table = self._find_table(new_party, new_slot, ignore_id=res.id)
            if table is None:
                raise ReservationError("Cannot modify: no table available; original kept")
            if table is not res.table:
                res.table.release(res)
                table.book(res)
                res.table = table
            if new_start != res.slot.start:
                res.notified = False
            res.slot, res.party_size = new_slot, new_party
            self._promote_waitlist(now)
            return res

    def seat_walk_in(self, customer: Customer, party_size: int, now: int) -> Optional[Reservation]:
        if party_size > self._tables[-1].capacity:
            raise ReservationError("No table is large enough for party of %d" % party_size)
        with self._lock:
            slot = self._slot(now, None)
            table = self._find_table(party_size, slot)
            if table is not None:
                return self._create(customer, party_size, table, slot, ReservationStatus.SEATED)
            self._waitlist.add(WaitlistEntry(customer, party_size, now))
            return None

    def notify_upcoming(self, now: int, lead_minutes: int) -> List[Reservation]:
        notified: List[Reservation] = []
        with self._lock:
            for res in self._reservations.values():
                if (res.status is ReservationStatus.CONFIRMED and not res.notified
                        and 0 <= res.slot.start - now <= lead_minutes):
                    res.notified = True
                    notified.append(res)
                    for listener in self._listeners:
                        listener.on_reservation_approaching(res)
        return notified

    # ---- internals (always called with the lock held) ----------------------

    def _slot(self, start: int, duration: Optional[int]) -> TimeSlot:
        return TimeSlot(start, start + (duration or self._duration))

    def _find_table(self, party_size: int, slot: TimeSlot,
                    ignore_id: Optional[int] = None) -> Optional[Table]:
        if party_size < 1:
            raise ValueError("party size must be positive")
        for table in self._tables:
            if table.capacity >= party_size and table.is_free(slot, ignore_id):
                return table
        return None

    def _create(self, customer: Customer, party_size: int, table: Table, slot: TimeSlot,
                status: ReservationStatus) -> Reservation:
        res = Reservation(self._next_id, customer, party_size, table, slot, status)
        self._next_id += 1
        table.book(res)
        self._reservations[res.id] = res
        return res

    def _get(self, reservation_id: int, allowed: set) -> Reservation:
        res = self._reservations.get(reservation_id)
        if res is None or res.status not in allowed:
            raise ReservationError("Reservation %s not found or not in a valid state" % reservation_id)
        return res

    def _promote_waitlist(self, now: int) -> None:
        for entry in self._waitlist.entries():  # arrival order; later, smaller parties may fit first
            slot = self._slot(now, None)
            table = self._find_table(entry.party_size, slot)
            if table is None:
                continue
            self._waitlist.remove(entry)
            res = self._create(entry.customer, entry.party_size, table, slot, ReservationStatus.SEATED)
            for listener in self._listeners:
                listener.on_waitlist_seated(entry, res)


if __name__ == "__main__":
    tables = [Table("T1", 2), Table("T2", 4), Table("T3", 4), Table("T4", 6)]
    restaurant = Restaurant(tables)
    restaurant.add_listener(StaffNotifier())
    seven_pm = 19 * 60

    for name, party in [("Alice", 2), ("Bob", 2), ("Carol", 5), ("Dave", 3)]:
        r = restaurant.reserve(Customer(name.lower(), name), party, seven_pm)
        print("%s -> %s @ %s" % (name, r.table.id, format_time(r.slot.start)))
    bob_id = 2

    restaurant.notify_upcoming(now=seven_pm - 30, lead_minutes=45)

    erin = Customer("erin", "Erin")
    seated = restaurant.seat_walk_in(erin, 2, now=seven_pm + 10)
    print("Erin seated" if seated else "Erin waitlisted (size %d)" % restaurant.waitlist_size())

    restaurant.cancel(1, now=seven_pm + 10)  # Alice cancels -> Erin promoted
    moved = restaurant.modify(bob_id, 21 * 60, 2, now=seven_pm + 10)
    print("Bob moved to %s at %s" % (moved.table.id, format_time(moved.slot.start)))

    try:
        restaurant.reserve(Customer("zed", "Zed"), 9, seven_pm)
    except ReservationError as exc:
        print("Error:", exc)
`

const java = `// Restaurant Table Reservation — medium-level LLD interview reference (Java 17+)
// Times are integer minutes on one timeline (19:00 on day 0 = 1140).
import java.util.*;

enum ReservationStatus { CONFIRMED, SEATED, COMPLETED, CANCELLED }

record Customer(String id, String name, String phone) {}

record TimeSlot(int start, int end) { // [start, end)
  TimeSlot {
    if (end <= start) {
      throw new IllegalArgumentException("end must be after start");
    }
  }

  boolean overlaps(TimeSlot o) {
    return start < o.end && o.start < end;
  }
}

class ReservationException extends RuntimeException {
  ReservationException(String message) {
    super(message);
  }
}

class Reservation {
  final int id;
  final Customer customer;
  int partySize;
  Table table;
  TimeSlot slot;
  ReservationStatus status;
  boolean notified;
  Reservation(int id, Customer customer, int partySize, Table table, TimeSlot slot, ReservationStatus status) {
    this.id = id; this.customer = customer; this.partySize = partySize;
    this.table = table; this.slot = slot; this.status = status;
  }
}

class Table {
  final String id;
  final int capacity;
  private final List<Reservation> bookings = new ArrayList<>(); // only active bookings
  Table(String id, int capacity) {
    this.id = id; this.capacity = capacity;
  }

  boolean isFree(TimeSlot slot, int ignoreId) {
    for (Reservation b : bookings)
      if (b.id != ignoreId && b.slot.overlaps(slot)) {
        return false;
      }
    return true;
  }

  void book(Reservation r) {
    bookings.add(r);
  }

  void release(Reservation r) {
    bookings.remove(r);
  }
}

record WaitlistEntry(Customer customer, int partySize, int joinedAt) {}

class Waitlist {
  private final List<WaitlistEntry> entries = new ArrayList<>();
  void add(WaitlistEntry e) {
    entries.add(e);
  }

  void remove(WaitlistEntry e) {
    entries.remove(e);
  }

  List<WaitlistEntry> entries() { return new ArrayList<>(entries); } // copy: safe to remove while iterating
  int size() {
    return entries.size();
  }
}

interface NotificationListener {
  void onReservationApproaching(Reservation r);
  void onWaitlistSeated(WaitlistEntry entry, Reservation r);
}

class StaffNotifier implements NotificationListener {
  public void onReservationApproaching(Reservation r) {
    System.out.println("[staff] approaching: " + r.customer.name() + " party of " + r.partySize
        + " at " + Main.formatTime(r.slot.start()) + " (" + r.table.id + ")");
  }

  public void onWaitlistSeated(WaitlistEntry e, Reservation r) {
    System.out.println("[staff] waitlist seated: " + e.customer().name() + " at " + r.table.id
        + " until " + Main.formatTime(r.slot.end()));
  }
}

class Restaurant {
  private final List<Table> tables = new ArrayList<>();
  private final int defaultDuration;
  private final Map<Integer, Reservation> reservations = new LinkedHashMap<>();
  private final Waitlist waitlist = new Waitlist();
  private final List<NotificationListener> listeners = new ArrayList<>();
  private int nextId = 1;

  Restaurant(List<Table> tables, int defaultDuration) {
    if (tables.isEmpty()) {
      throw new IllegalArgumentException("need at least one table");
    }
    this.tables.addAll(tables);
    // Sorted by capacity then id, so the first free table that fits is the best fit.
    this.tables.sort(Comparator.comparingInt((Table t) -> t.capacity).thenComparing(t -> t.id));
    this.defaultDuration = defaultDuration;
  }

  void addListener(NotificationListener l) {
    listeners.add(l);
  }

  synchronized int waitlistSize() {
    return waitlist.size();
  }

  synchronized Reservation reserve(Customer customer, int partySize, int start, Integer duration) {
    TimeSlot slot = slot(start, duration);
    Table table = findTable(partySize, slot, -1);
    if (table == null)
      throw new ReservationException("No table for party of " + partySize + " at " + Main.formatTime(start));
    return create(customer, partySize, table, slot, ReservationStatus.CONFIRMED);
  }

  synchronized void cancel(int reservationId, int now) {
    Reservation res = get(reservationId, EnumSet.of(ReservationStatus.CONFIRMED));
    res.table.release(res);
    res.status = ReservationStatus.CANCELLED;
    promoteWaitlist(now);
  }

  synchronized void checkOut(int reservationId, int now) {
    Reservation res = get(reservationId, EnumSet.of(ReservationStatus.CONFIRMED, ReservationStatus.SEATED));
    res.table.release(res);
    res.status = ReservationStatus.COMPLETED;
    promoteWaitlist(now);
  }

  synchronized Reservation modify(int reservationId, int newStart, int newParty, int now) {
    Reservation res = get(reservationId, EnumSet.of(ReservationStatus.CONFIRMED));
    int duration = res.slot.end() - res.slot.start();
    TimeSlot newSlot = new TimeSlot(newStart, newStart + duration);
    // Ignore this reservation's own booking so it can shift into an overlapping time.
    Table table = findTable(newParty, newSlot, res.id);
    if (table == null) {
      throw new ReservationException("Cannot modify: no table available; original kept");
    }
    if (table != res.table) {
      res.table.release(res);
      table.book(res);
      res.table = table;
    }
    if (newStart != res.slot.start()) {
      res.notified = false;
    }
    res.slot = newSlot;
    res.partySize = newParty;
    promoteWaitlist(now);
    return res;
  }

  /** Returns the seated reservation, or null if the party was placed on the waitlist. */
  synchronized Reservation seatWalkIn(Customer customer, int partySize, int now) {
    if (partySize > tables.get(tables.size() {
      - 1).capacity)
    }

      throw new ReservationException("No table is large enough for party of " + partySize);
    TimeSlot slot = slot(now, null);
    Table table = findTable(partySize, slot, -1);
    if (table != null) {
      return create(customer, partySize, table, slot, ReservationStatus.SEATED);
    }
    waitlist.add(new WaitlistEntry(customer, partySize, now));
    return null;
  }

  synchronized List<Reservation> notifyUpcoming(int now, int leadMinutes) {
    List<Reservation> notified = new ArrayList<>();
    for (Reservation res : reservations.values()) {
      int until = res.slot.start() - now;
      if (res.status == ReservationStatus.CONFIRMED && !res.notified && until >= 0 && until <= leadMinutes) {
        res.notified = true;
        notified.add(res);
        for (NotificationListener l : listeners) {
          l.onReservationApproaching(res);
        }
      }
    }
    return notified;
  }

  // ---- internals (always called with the monitor held) ----

  private TimeSlot slot(int start, Integer duration) {
    return new TimeSlot(start, start + (duration != null ? duration : defaultDuration));
  }

  private Table findTable(int partySize, TimeSlot slot, int ignoreId) {
    if (partySize < 1) {
      throw new IllegalArgumentException("party size must be positive");
    }
    for (Table t : tables)
      if (t.capacity >= partySize && t.isFree(slot, ignoreId)) {
        return t;
      }
    return null;
  }

  private Reservation create(Customer c, int party, Table table, TimeSlot slot, ReservationStatus status) {
    Reservation res = new Reservation(nextId++, c, party, table, slot, status);
    table.book(res);
    reservations.put(res.id, res);
    return res;
  }

  private Reservation get(int id, Set<ReservationStatus> allowed) {
    Reservation res = reservations.get(id);
    if (res == null || !allowed.contains(res.status))
      throw new ReservationException("Reservation " + id + " not found or not in a valid state");
    return res;
  }

  private void promoteWaitlist(int now) {
    for (WaitlistEntry entry : waitlist.entries()) { // arrival order; later, smaller parties may fit first
      TimeSlot slot = slot(now, null);
      Table table = findTable(entry.partySize(), slot, -1);
      if (table == null) {
        continue;
      }
      waitlist.remove(entry);
      Reservation res = create(entry.customer(), entry.partySize(), table, slot, ReservationStatus.SEATED);
      for (NotificationListener l : listeners) {
        l.onWaitlistSeated(entry, res);
      }
    }
  }
}

public class Main {
  static String formatTime(int minutes) {
    int m = minutes % 1440;
    return String.format("%02d:%02d", m / 60, m % 60);
  }

  public static void main(String[] args) {
    Restaurant restaurant = new Restaurant(List.of(
        new Table("T1", 2), new Table("T2", 4), new Table("T3", 4), new Table("T4", 6)), 90);
    restaurant.addListener(new StaffNotifier());
    int sevenPm = 19 * 60;

    String[] names = {"Alice", "Bob", "Carol", "Dave"};
    int[] parties = {2, 2, 5, 3};
    for (int i = 0; i < names.length; i++) {
      Reservation r = restaurant.reserve(new Customer(names[i].toLowerCase(), names[i], ""), parties[i], sevenPm, null);
      System.out.println(names[i] + " -> " + r.table.id + " @ " + formatTime(r.slot.start()));
    }
    int bobId = 2;

    restaurant.notifyUpcoming(sevenPm - 30, 45);

    Reservation seated = restaurant.seatWalkIn(new Customer("erin", "Erin", ""), 2, sevenPm + 10);
    System.out.println(seated != null ? "Erin seated" : "Erin waitlisted (size " + restaurant.waitlistSize() + ")");

    restaurant.cancel(1, sevenPm + 10); // Alice cancels -> Erin promoted
    Reservation moved = restaurant.modify(bobId, 21 * 60, 2, sevenPm + 10);
    System.out.println("Bob moved to " + moved.table.id + " at " + formatTime(moved.slot.start()));

    try {
      restaurant.reserve(new Customer("zed", "Zed", ""), 9, sevenPm, null);
    } catch (ReservationException e) {
      System.out.println("Error: " + e.getMessage());
    }
  }
}
`

const ts = `// Restaurant Table Reservation — medium-level LLD interview reference (TypeScript)
// Times are integer minutes on one timeline (19:00 on day 0 = 1140). Single-threaded runtime.

class ReservationError extends Error {}

type ReservationStatus = 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED'

interface Customer { id: string; name: string; phone?: string }

class TimeSlot {
  constructor(public readonly start: number, public readonly end: number) {
    if (end <= start) {
      throw new Error('end must be after start')
    }
  }

  overlaps(o: TimeSlot): boolean { return this.start < o.end && o.start < this.end }
}

class Reservation {
  notified = false
  constructor(
    public readonly id: number,
    public readonly customer: Customer,
    public partySize: number,
    public table: Table,
    public slot: TimeSlot,
    public status: ReservationStatus,
  ) {}
}

class Table {
  private bookings: Reservation[] = [] // only active bookings
  constructor(public readonly id: string, public readonly capacity: number) {}

  isFree(slot: TimeSlot, ignoreId = -1): boolean {
    return this.bookings.every(b => b.id === ignoreId || !b.slot.overlaps(slot))
  }

  book(r: Reservation): void { this.bookings.push(r) }
  release(r: Reservation): void { this.bookings = this.bookings.filter(b => b !== r) }
}

interface WaitlistEntry { customer: Customer; partySize: number; joinedAt: number }

class Waitlist {
  private items: WaitlistEntry[] = []
  add(e: WaitlistEntry) {
    this.items.push(e)
  }

  remove(e: WaitlistEntry) {
    this.items = this.items.filter(x => x !== e)
  }

  entries(): WaitlistEntry[] { return [...this.items] } // copy: safe to remove while iterating
  get size() {
    return this.items.length
  }
}

function formatTime(minutes: number): string {
  const m = minutes % 1440
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
}

interface NotificationListener {
  onReservationApproaching(r: Reservation): void
  onWaitlistSeated(entry: WaitlistEntry, r: Reservation): void
}

class StaffNotifier implements NotificationListener {
  onReservationApproaching(r: Reservation) {
    console.log('[staff] approaching: ' + r.customer.name + ' party of ' + r.partySize +
      ' at ' + formatTime(r.slot.start) + ' (' + r.table.id + ')')
  }

  onWaitlistSeated(entry: WaitlistEntry, r: Reservation) {
    console.log('[staff] waitlist seated: ' + entry.customer.name + ' at ' + r.table.id +
      ' until ' + formatTime(r.slot.end))
  }
}

class Restaurant {
  private tables: Table[]
  private reservations = new Map<number, Reservation>()
  private waitlist = new Waitlist()
  private listeners: NotificationListener[] = []
  private nextId = 1

  constructor(tables: Table[], private defaultDuration = 90) {
    if (tables.length === 0) {
      throw new Error('need at least one table')
    }
    // Sorted by capacity then id, so the first free table that fits is the best fit.
    this.tables = [...tables].sort((a, b) => a.capacity - b.capacity || a.id.localeCompare(b.id))
  }

  addListener(l: NotificationListener) {
    this.listeners.push(l)
  }

  waitlistSize() {
    return this.waitlist.size
  }

  reserve(customer: Customer, partySize: number, start: number, duration?: number): Reservation {
    const slot = this.slot(start, duration)
    const table = this.findTable(partySize, slot)
    if (!table) {
      throw new ReservationError('No table for party of ' + partySize + ' at ' + formatTime(start))
    }
    return this.create(customer, partySize, table, slot, 'CONFIRMED')
  }

  cancel(reservationId: number, now: number): void {
    const res = this.get(reservationId, ['CONFIRMED'])
    res.table.release(res)
    res.status = 'CANCELLED'
    this.promoteWaitlist(now)
  }

  checkOut(reservationId: number, now: number): void {
    const res = this.get(reservationId, ['CONFIRMED', 'SEATED'])
    res.table.release(res)
    res.status = 'COMPLETED'
    this.promoteWaitlist(now)
  }

  modify(reservationId: number, newStart: number, newParty: number, now: number): Reservation {
    const res = this.get(reservationId, ['CONFIRMED'])
    const newSlot = new TimeSlot(newStart, newStart + (res.slot.end - res.slot.start))
    // Ignore this reservation's own booking so it can shift into an overlapping time.
    const table = this.findTable(newParty, newSlot, res.id)
    if (!table) {
      throw new ReservationError('Cannot modify: no table available; original kept')
    }

    if (table !== res.table) {
      res.table.release(res)
      table.book(res)
      res.table = table
    }

    if (newStart !== res.slot.start) {
      res.notified = false
    }
    res.slot = newSlot
    res.partySize = newParty
    this.promoteWaitlist(now)
    return res
  }

  // Returns the seated reservation, or null if the party was placed on the waitlist.
  seatWalkIn(customer: Customer, partySize: number, now: number): Reservation | null {
    if (partySize > this.tables[this.tables.length - 1].capacity) {
      throw new ReservationError('No table is large enough for party of ' + partySize)
    }
    const slot = this.slot(now)
    const table = this.findTable(partySize, slot)
    if (table) {
      return this.create(customer, partySize, table, slot, 'SEATED')
    }
    this.waitlist.add({ customer, partySize, joinedAt: now })
    return null
  }

  notifyUpcoming(now: number, leadMinutes: number): Reservation[] {
    const notified: Reservation[] = []
    for (const res of this.reservations.values()) {
      const until = res.slot.start - now
      if (res.status === 'CONFIRMED' && !res.notified && until >= 0 && until <= leadMinutes) {
        res.notified = true
        notified.push(res)
        this.listeners.forEach(l => l.onReservationApproaching(res))
      }
    }
    return notified
  }

  private slot(start: number, duration?: number): TimeSlot {
    return new TimeSlot(start, start + (duration ?? this.defaultDuration))
  }

  private findTable(partySize: number, slot: TimeSlot, ignoreId = -1): Table | null {
    if (partySize < 1) {
      throw new Error('party size must be positive')
    }
    return this.tables.find(t => t.capacity >= partySize && t.isFree(slot, ignoreId)) ?? null
  }

  private create(c: Customer, party: number, table: Table, slot: TimeSlot, status: ReservationStatus): Reservation {
    const res = new Reservation(this.nextId++, c, party, table, slot, status)
    table.book(res)
    this.reservations.set(res.id, res)
    return res
  }

  private get(id: number, allowed: ReservationStatus[]): Reservation {
    const res = this.reservations.get(id)
    if (!res || !allowed.includes(res.status)) {
      throw new ReservationError('Reservation ' + id + ' not found or not in a valid state')
    }
    return res
  }

  private promoteWaitlist(now: number): void {
    for (const entry of this.waitlist.entries()) { // arrival order; later, smaller parties may fit first
      const slot = this.slot(now)
      const table = this.findTable(entry.partySize, slot)
      if (!table) {
        continue
      }
      this.waitlist.remove(entry)
      const res = this.create(entry.customer, entry.partySize, table, slot, 'SEATED')
      this.listeners.forEach(l => l.onWaitlistSeated(entry, res))
    }
  }
}

// Demo
const restaurant = new Restaurant([new Table('T1', 2), new Table('T2', 4), new Table('T3', 4), new Table('T4', 6)])
restaurant.addListener(new StaffNotifier())
const sevenPm = 19 * 60

const guests: [string, number][] = [['Alice', 2], ['Bob', 2], ['Carol', 5], ['Dave', 3]]
for (const [name, party] of guests) {
  const r = restaurant.reserve({ id: name.toLowerCase(), name }, party, sevenPm)
  console.log(name + ' -> ' + r.table.id + ' @ ' + formatTime(r.slot.start))
}
const bobId = 2

restaurant.notifyUpcoming(sevenPm - 30, 45)

const seated = restaurant.seatWalkIn({ id: 'erin', name: 'Erin' }, 2, sevenPm + 10)
console.log(seated ? 'Erin seated' : 'Erin waitlisted (size ' + restaurant.waitlistSize() + ')')

restaurant.cancel(1, sevenPm + 10) // Alice cancels -> Erin promoted
const moved = restaurant.modify(bobId, 21 * 60, 2, sevenPm + 10)
console.log('Bob moved to ' + moved.table.id + ' at ' + formatTime(moved.slot.start))

try {
  restaurant.reserve({ id: 'zed', name: 'Zed' }, 9, sevenPm)
} catch (e) {
  console.log('Error: ' + (e as Error).message)
}

export { Restaurant, Table, StaffNotifier, ReservationError }
export type { Reservation, NotificationListener, Customer }
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

// Restaurant Table Reservation — medium-level LLD interview reference (C++17)
// Times are integer minutes on one timeline (19:00 on day 0 = 1140).

enum class ReservationStatus { Confirmed, Seated, Completed, Cancelled };

struct Customer {
  string id;
  string name;
};

struct TimeSlot {  // [start, end)
  int start;
  int end;
  TimeSlot(int s, int e) : start(s), end(e) {
    if (e <= s) {
      throw invalid_argument("end must be after start");
    }
  }

  bool overlaps(const TimeSlot& o) const {
    return start < o.end && o.start < end;
  }
};

string formatTime(int minutes) {
  int m = minutes % 1440;
  ostringstream out;
  out << setfill('0') << setw(2) << (m / 60) << ":" << setw(2) << (m % 60);
  return out.str();
}

class Table;

struct Reservation {
  int id;
  Customer customer;
  int partySize;
  Table* table;
  TimeSlot slot;
  ReservationStatus status;
  bool notified = false;
};
using ReservationPtr = shared_ptr<Reservation>;

class Table {
  vector<ReservationPtr> bookings_;  // only active bookings
public:
  string id;
  int capacity;
  Table(string i, int c) : id(move(i)), capacity(c) {}

  bool isFree(const TimeSlot& slot, int ignoreId = -1) const {
    for (auto& b : bookings_)
      if (b->id != ignoreId && b->slot.overlaps(slot)) {
        return false;
      }
    return true;
  }

  void book(const ReservationPtr& r) {
    bookings_.push_back(r);
  }

  void release(const ReservationPtr& r) {
    bookings_.erase(remove(bookings_.begin(), bookings_.end(), r), bookings_.end());
  }
};

struct WaitlistEntry {
  Customer customer;
  int partySize;
  int joinedAt;
};

class Waitlist {
  vector<WaitlistEntry> entries_;
public:
  void add(const WaitlistEntry& e) {
    entries_.push_back(e);
  }

  void removeAt(size_t i) {
    entries_.erase(entries_.begin() + i);
  }

  const vector<WaitlistEntry>& entries() const {
    return entries_;
  }

  size_t size() const {
    return entries_.size();
  }
};

class NotificationListener {
public:
  virtual ~NotificationListener() = default;
  virtual void onReservationApproaching(const Reservation& r) = 0;
  virtual void onWaitlistSeated(const WaitlistEntry& e, const Reservation& r) = 0;
};

class StaffNotifier : public NotificationListener {
public:
  void onReservationApproaching(const Reservation& r) override {
    cout << "[staff] approaching: " << r.customer.name << " party of " << r.partySize
              << " at " << formatTime(r.slot.start) << " (" << r.table->id << ")" << endl;
  }

  void onWaitlistSeated(const WaitlistEntry& e, const Reservation& r) override {
    cout << "[staff] waitlist seated: " << e.customer.name << " at " << r.table->id
              << " until " << formatTime(r.slot.end) << endl;
  }
};

class Restaurant {
  vector<Table> tables_;
  int defaultDuration_;
  map<int, ReservationPtr> reservations_;
  Waitlist waitlist_;
  vector<shared_ptr<NotificationListener>> listeners_;
  int nextId_ = 1;
  mutable recursive_mutex mu_;

  TimeSlot slot(int start, int duration) const {
    return TimeSlot(start, start + (duration > 0 ? duration : defaultDuration_));
  }

  Table* findTable(int partySize, const TimeSlot& s, int ignoreId = -1) {
    if (partySize < 1) {
      throw invalid_argument("party size must be positive");
    }
    for (auto& t : tables_)  // sorted by capacity: first free table that fits is the best fit
      if (t.capacity >= partySize && t.isFree(s, ignoreId)) {
        return &t;
      }
    return nullptr;
  }

  ReservationPtr create(const Customer& c, int party, Table* table, const TimeSlot& s,
                        ReservationStatus status) {
    auto res = make_shared<Reservation>(Reservation{nextId_++, c, party, table, s, status});
    table->book(res);
    reservations_[res->id] = res;
    return res;
  }

  ReservationPtr get(int id, initializer_list<ReservationStatus> allowed) {
    auto it = reservations_.find(id);
    if (it != reservations_.end())
      for (auto st : allowed)
        if (it->second->status == st) {
          return it->second;
        }

    throw runtime_error("Reservation " + to_string(id) + " not found or not in a valid state");
  }

  void promoteWaitlist(int now) {
    size_t i = 0;
    while (i < waitlist_.size()) {  // arrival order; later, smaller parties may fit first
      WaitlistEntry entry = waitlist_.entries()[i];
      TimeSlot s = slot(now, 0);
      Table* table = findTable(entry.partySize, s);
      if (!table) {
        i++; continue;
      }
      waitlist_.removeAt(i);
      auto res = create(entry.customer, entry.partySize, table, s, ReservationStatus::Seated);
      for (auto& l : listeners_) {
        l->onWaitlistSeated(entry, *res);
      }
    }
  }

public:
  Restaurant(vector<Table> tables, int defaultDuration = 90)
      : tables_(move(tables)), defaultDuration_(defaultDuration) {
    if (tables_.empty()) {
      throw invalid_argument("need at least one table");
    }
    sort(tables_.begin(), tables_.end(), [](const Table& a, const Table& b) {
      return a.capacity != b.capacity ? a.capacity < b.capacity : a.id < b.id;
    });
  }

  void addListener(shared_ptr<NotificationListener> l) {
    listeners_.push_back(move(l));
  }

  size_t waitlistSize() const {
    lock_guard<recursive_mutex> g(mu_); return waitlist_.size();
  }

  ReservationPtr reserve(const Customer& c, int partySize, int start, int duration = 0) {
    lock_guard<recursive_mutex> g(mu_);
    TimeSlot s = slot(start, duration);
    Table* table = findTable(partySize, s);
    if (!table) {
      throw runtime_error("No table for party of " + to_string(partySize) +
    }
                                         " at " + formatTime(start));
    return create(c, partySize, table, s, ReservationStatus::Confirmed);
  }

  void cancel(int reservationId, int now) {
    lock_guard<recursive_mutex> g(mu_);
    auto res = get(reservationId, {ReservationStatus::Confirmed});
    res->table->release(res);
    res->status = ReservationStatus::Cancelled;
    promoteWaitlist(now);
  }

  void checkOut(int reservationId, int now) {
    lock_guard<recursive_mutex> g(mu_);
    auto res = get(reservationId, {ReservationStatus::Confirmed, ReservationStatus::Seated});
    res->table->release(res);
    res->status = ReservationStatus::Completed;
    promoteWaitlist(now);
  }

  ReservationPtr modify(int reservationId, int newStart, int newParty, int now) {
    lock_guard<recursive_mutex> g(mu_);
    auto res = get(reservationId, {ReservationStatus::Confirmed});
    TimeSlot newSlot(newStart, newStart + (res->slot.end - res->slot.start));
    // Ignore this reservation's own booking so it can shift into an overlapping time.
    Table* table = findTable(newParty, newSlot, res->id);
    if (!table) {
      throw runtime_error("Cannot modify: no table available; original kept");
    }
    if (table != res->table) {
      res->table->release(res);
      table->book(res);
      res->table = table;
    }
    if (newStart != res->slot.start) {
      res->notified = false;
    }
    res->slot = newSlot;
    res->partySize = newParty;
    promoteWaitlist(now);
    return res;
  }

  // Returns the seated reservation, or nullptr if the party was placed on the waitlist.
  ReservationPtr seatWalkIn(const Customer& c, int partySize, int now) {
    lock_guard<recursive_mutex> g(mu_);
    if (partySize > tables_.back().capacity)
      throw runtime_error("No table is large enough for party of " + to_string(partySize));
    TimeSlot s = slot(now, 0);
    Table* table = findTable(partySize, s);
    if (table) {
      return create(c, partySize, table, s, ReservationStatus::Seated);
    }
    waitlist_.add({c, partySize, now});
    return nullptr;
  }

  vector<ReservationPtr> notifyUpcoming(int now, int leadMinutes) {
    lock_guard<recursive_mutex> g(mu_);
    vector<ReservationPtr> notified;
    for (auto& entry : reservations_) {
      auto& res = entry.second;
      int until = res->slot.start - now;
      if (res->status == ReservationStatus::Confirmed && !res->notified &&
          until >= 0 && until <= leadMinutes) {
        res->notified = true;
        notified.push_back(res);
        for (auto& l : listeners_) {
          l->onReservationApproaching(*res);
        }
      }
    }
    return notified;
  }
};

int main() {
  vector<Table> tables = {Table("T1", 2), Table("T2", 4), Table("T3", 4), Table("T4", 6)};
  Restaurant restaurant(move(tables));
  restaurant.addListener(make_shared<StaffNotifier>());
  int sevenPm = 19 * 60;

  vector<pair<string, int>> guests = {{"Alice", 2}, {"Bob", 2}, {"Carol", 5}, {"Dave", 3}};
  for (auto& g : guests) {
    auto r = restaurant.reserve({g.first, g.first}, g.second, sevenPm);
    cout << g.first << " -> " << r->table->id << " @ " << formatTime(r->slot.start) << endl;
  }
  int bobId = 2;

  restaurant.notifyUpcoming(sevenPm - 30, 45);

  auto seated = restaurant.seatWalkIn({"erin", "Erin"}, 2, sevenPm + 10);
  if (seated) {
    cout << "Erin seated" << endl;
  }
  else {
    cout << "Erin waitlisted (size " << restaurant.waitlistSize() << ")" << endl;
  }

  restaurant.cancel(1, sevenPm + 10);  // Alice cancels -> Erin promoted
  auto moved = restaurant.modify(bobId, 21 * 60, 2, sevenPm + 10);
  cout << "Bob moved to " << moved->table->id << " at " << formatTime(moved->slot.start) << endl;

  try {
    restaurant.reserve({"zed", "Zed"}, 9, sevenPm);
  } catch (const exception& e) {
    cout << "Error: " << e.what() << endl;
  }
}
`

const goCode = `// Restaurant Table Reservation — medium-level LLD interview reference (Go)
// Times are integer minutes on one timeline (19:00 on day 0 = 1140).
package main

import (
  "errors"
  "fmt"
  "sort"
  "sync"
)

type ReservationStatus int

const (
  Confirmed ReservationStatus = iota
  Seated
  Completed
  Cancelled
)

type Customer struct {
  ID   string
  Name string
}

type TimeSlot struct{ Start, End int } // [Start, End)

func (t TimeSlot) Overlaps(o TimeSlot) bool {
  return t.Start < o.End && o.Start < t.End
}

func formatTime(minutes int) string {
  m := minutes % 1440
  return fmt.Sprintf("%02d:%02d", m/60, m%60)
}

type Reservation struct {
  ID        int
  Customer  Customer
  PartySize int
  Table     *Table
  Slot      TimeSlot
  Status    ReservationStatus
  Notified  bool
}

type Table struct {
  ID       string
  Capacity int
  bookings []*Reservation // only active bookings
}

func (t *Table) IsFree(slot TimeSlot, ignoreID int) bool {
  for _, b := range t.bookings {
    if b.ID != ignoreID && b.Slot.Overlaps(slot) {
      return false
    }
  }
  return true
}

func (t *Table) Book(r *Reservation) {
  t.bookings = append(t.bookings, r)
}

func (t *Table) Release(r *Reservation) {
  for i, b := range t.bookings {
    if b == r {
      t.bookings = append(t.bookings[:i:i], t.bookings[i+1:]...)
      return
    }
  }
}

type WaitlistEntry struct {
  Customer  Customer
  PartySize int
  JoinedAt  int
}

type Waitlist struct{ entries []WaitlistEntry }

func (w *Waitlist) Add(e WaitlistEntry) {
  w.entries = append(w.entries, e)
}

func (w *Waitlist) Snapshot() []WaitlistEntry {
  return append([]WaitlistEntry(nil), w.entries...) // copy: safe to remove while iterating
}

func (w *Waitlist) Remove(e WaitlistEntry) {
  for i, x := range w.entries {
    if x == e {
      w.entries = append(w.entries[:i:i], w.entries[i+1:]...)
      return
    }
  }
}

func (w *Waitlist) Size() int {
  return len(w.entries)
}

type NotificationListener interface {
  OnReservationApproaching(r *Reservation)
  OnWaitlistSeated(e WaitlistEntry, r *Reservation)
}

type StaffNotifier struct{}

func (StaffNotifier) OnReservationApproaching(r *Reservation) {
  fmt.Printf("[staff] approaching: %s party of %d at %s (%s)\\n",
    r.Customer.Name, r.PartySize, formatTime(r.Slot.Start), r.Table.ID)
}

func (StaffNotifier) OnWaitlistSeated(e WaitlistEntry, r *Reservation) {
  fmt.Printf("[staff] waitlist seated: %s at %s until %s\\n", e.Customer.Name, r.Table.ID, formatTime(r.Slot.End))
}

type Restaurant struct {
  mu              sync.Mutex
  tables          []*Table
  defaultDuration int
  reservations    map[int]*Reservation
  nextID          int
  waitlist        Waitlist
  listeners       []NotificationListener
}

func NewRestaurant(tables []*Table, defaultDuration int) *Restaurant {
  sorted := append([]*Table(nil), tables...)
  // Sorted by capacity then id, so the first free table that fits is the best fit.
  sort.Slice(sorted, func(i, j int) bool {
    if sorted[i].Capacity != sorted[j].Capacity {
      return sorted[i].Capacity < sorted[j].Capacity
    }
    return sorted[i].ID < sorted[j].ID
  })
  return &Restaurant{tables: sorted, defaultDuration: defaultDuration,
    reservations: map[int]*Reservation{}, nextID: 1}
}

func (r *Restaurant) AddListener(l NotificationListener) {
  r.listeners = append(r.listeners, l)
}

func (r *Restaurant) WaitlistSize() int {
  r.mu.Lock()
  defer r.mu.Unlock()
  return r.waitlist.Size()
}

// ---- internals (always called with the mutex held) ----

func (r *Restaurant) slot(start, duration int) TimeSlot {
  if duration <= 0 {
    duration = r.defaultDuration
  }
  return TimeSlot{start, start + duration}
}

func (r *Restaurant) findTable(party int, slot TimeSlot, ignoreID int) *Table {
  for _, t := range r.tables {
    if t.Capacity >= party && t.IsFree(slot, ignoreID) {
      return t
    }
  }
  return nil
}

func (r *Restaurant) create(c Customer, party int, t *Table, slot TimeSlot, st ReservationStatus) *Reservation {
  res := &Reservation{ID: r.nextID, Customer: c, PartySize: party, Table: t, Slot: slot, Status: st}
  r.nextID++
  t.Book(res)
  r.reservations[res.ID] = res
  return res
}

func (r *Restaurant) get(id int, allowed ...ReservationStatus) (*Reservation, error) {
  res, ok := r.reservations[id]
  if ok {
    for _, st := range allowed {
      if res.Status == st {
        return res, nil
      }
    }
  }
  return nil, fmt.Errorf("reservation %d not found or not in a valid state", id)
}

func (r *Restaurant) promoteWaitlist(now int) {
  for _, entry := range r.waitlist.Snapshot() { // arrival order; later, smaller parties may fit first
    s := r.slot(now, 0)
    table := r.findTable(entry.PartySize, s, -1)
    if table == nil {
      continue
    }
    r.waitlist.Remove(entry)
    res := r.create(entry.Customer, entry.PartySize, table, s, Seated)
    for _, l := range r.listeners {
      l.OnWaitlistSeated(entry, res)
    }
  }
}

// ---- public API ----

func (r *Restaurant) Reserve(c Customer, party, start, duration int) (*Reservation, error) {
  if party < 1 {
    return nil, errors.New("party size must be positive")
  }
  r.mu.Lock()
  defer r.mu.Unlock()
  s := r.slot(start, duration)
  table := r.findTable(party, s, -1)
  if table == nil {
    return nil, fmt.Errorf("no table for party of %d at %s", party, formatTime(start))
  }
  return r.create(c, party, table, s, Confirmed), nil
}

func (r *Restaurant) Cancel(id, now int) error {
  r.mu.Lock()
  defer r.mu.Unlock()
  res, err := r.get(id, Confirmed)
  if err != nil {
    return err
  }
  res.Table.Release(res)
  res.Status = Cancelled
  r.promoteWaitlist(now)
  return nil
}

func (r *Restaurant) CheckOut(id, now int) error {
  r.mu.Lock()
  defer r.mu.Unlock()
  res, err := r.get(id, Confirmed, Seated)
  if err != nil {
    return err
  }
  res.Table.Release(res)
  res.Status = Completed
  r.promoteWaitlist(now)
  return nil
}

func (r *Restaurant) Modify(id, newStart, newParty, now int) (*Reservation, error) {
  if newParty < 1 {
    return nil, errors.New("party size must be positive")
  }
  r.mu.Lock()
  defer r.mu.Unlock()
  res, err := r.get(id, Confirmed)
  if err != nil {
    return nil, err
  }
  newSlot := TimeSlot{newStart, newStart + (res.Slot.End - res.Slot.Start)}
  // Ignore this reservation's own booking so it can shift into an overlapping time.
  table := r.findTable(newParty, newSlot, res.ID)
  if table == nil {
    return nil, errors.New("cannot modify: no table available; original kept")
  }
  if table != res.Table {
    res.Table.Release(res)
    table.Book(res)
    res.Table = table
  }
  if newStart != res.Slot.Start {
    res.Notified = false
  }
  res.Slot, res.PartySize = newSlot, newParty
  r.promoteWaitlist(now)
  return res, nil
}

// SeatWalkIn returns the seated reservation, or nil if the party was placed on the waitlist.
func (r *Restaurant) SeatWalkIn(c Customer, party, now int) (*Reservation, error) {
  r.mu.Lock()
  defer r.mu.Unlock()
  if party < 1 || party > r.tables[len(r.tables)-1].Capacity {
    return nil, fmt.Errorf("no table is large enough for party of %d", party)
  }
  s := r.slot(now, 0)
  if table := r.findTable(party, s, -1); table != nil {
    return r.create(c, party, table, s, Seated), nil
  }
  r.waitlist.Add(WaitlistEntry{c, party, now})
  return nil, nil
}

func (r *Restaurant) NotifyUpcoming(now, lead int) []*Reservation {
  r.mu.Lock()
  defer r.mu.Unlock()
  var notified []*Reservation
  for id := 1; id < r.nextID; id++ { // ids are sequential, so this iterates in booking order
    res := r.reservations[id]
    until := res.Slot.Start - now
    if res.Status == Confirmed && !res.Notified && until >= 0 && until <= lead {
      res.Notified = true
      notified = append(notified, res)
      for _, l := range r.listeners {
        l.OnReservationApproaching(res)
      }
    }
  }
  return notified
}

func main() {
  restaurant := NewRestaurant([]*Table{
    {ID: "T1", Capacity: 2}, {ID: "T2", Capacity: 4}, {ID: "T3", Capacity: 4}, {ID: "T4", Capacity: 6},
  }, 90)
  restaurant.AddListener(StaffNotifier{})
  sevenPM := 19 * 60

  names := []string{"Alice", "Bob", "Carol", "Dave"}
  parties := []int{2, 2, 5, 3}
  for i, name := range names {
    r, err := restaurant.Reserve(Customer{name, name}, parties[i], sevenPM, 0)
    if err != nil {
      panic(err)
    }
    fmt.Printf("%s -> %s @ %s\\n", name, r.Table.ID, formatTime(r.Slot.Start))
  }
  bobID := 2

  restaurant.NotifyUpcoming(sevenPM-30, 45)

  seated, _ := restaurant.SeatWalkIn(Customer{"erin", "Erin"}, 2, sevenPM+10)
  if seated != nil {
    fmt.Println("Erin seated")
  } else {
    fmt.Printf("Erin waitlisted (size %d)\\n", restaurant.WaitlistSize())
  }

  restaurant.Cancel(1, sevenPM+10) // Alice cancels -> Erin promoted
  moved, _ := restaurant.Modify(bobID, 21*60, 2, sevenPM+10)
  fmt.Printf("Bob moved to %s at %s\\n", moved.Table.ID, formatTime(moved.Slot.Start))

  if _, err := restaurant.Reserve(Customer{"zed", "Zed"}, 9, sevenPM, 0); err != nil {
    fmt.Println("Error:", err)
  }
}
`

const csharp = `// Restaurant Table Reservation — medium-level LLD interview reference (C# 10+)
// Times are integer minutes on one timeline (19:00 on day 0 = 1140).
using System;
using System.Collections.Generic;
using System.Linq;

public enum ReservationStatus { Confirmed, Seated, Completed, Cancelled }

public sealed record Customer(string Id, string Name, string Phone = "");

public sealed class TimeSlot { // [Start, End)
  public int Start { get; }
  public int End { get; }
  public TimeSlot(int start, int end) {
    if (end <= start) {
      throw new ArgumentException("end must be after start");
    }
    Start = start;
    End = end;
  }

  public bool Overlaps(TimeSlot o) {
    return Start < o.End && o.Start < End;
  }
}

public class ReservationException : Exception {
  public ReservationException(string message) : base(message) {}
}

public sealed class Reservation {
  public int Id { get; init; }
  public Customer Customer { get; init; } = null!;
  public int PartySize { get; set; }
  public Table Table { get; set; } = null!;
  public TimeSlot Slot { get; set; } = null!;
  public ReservationStatus Status { get; set; }
  public bool Notified { get; set; }
}

public sealed class Table {
  public string Id { get; }
  public int Capacity { get; }
  private readonly List<Reservation> _bookings = new(); // only active bookings
  public Table(string id, int capacity) {
    Id = id; Capacity = capacity;
  }

  public bool IsFree(TimeSlot slot, int ignoreId = -1) =>
    _bookings.All(b => b.Id == ignoreId || !b.Slot.Overlaps(slot));
  public void Book(Reservation r) {
    return _bookings.Add(r);
  }

  public void Release(Reservation r) {
    return _bookings.Remove(r);
  }
}

public sealed record WaitlistEntry(Customer Customer, int PartySize, int JoinedAt);

public sealed class Waitlist {
  private readonly List<WaitlistEntry> _entries = new();
  public void Add(WaitlistEntry e) {
    return _entries.Add(e);
  }

  public void Remove(WaitlistEntry e) {
    return _entries.Remove(e);
  }

  public List<WaitlistEntry> Entries() => new(_entries); // copy: safe to remove while iterating
  public int Count => _entries.Count;
}

public interface INotificationListener {
  void OnReservationApproaching(Reservation r);
  void OnWaitlistSeated(WaitlistEntry entry, Reservation r);
}

public static class Clock {
  public static string Format(int minutes) {
    int m = minutes % 1440;
    return $"{m / 60:00}:{m % 60:00}";
  }
}

public sealed class StaffNotifier : INotificationListener {
  public void OnReservationApproaching(Reservation r) =>
    Console.WriteLine("[staff] approaching: " + r.Customer.Name + " party of " + r.PartySize +
      " at " + Clock.Format(r.Slot.Start) + " (" + r.Table.Id + ")");
  public void OnWaitlistSeated(WaitlistEntry e, Reservation r) =>
    Console.WriteLine("[staff] waitlist seated: " + e.Customer.Name + " at " + r.Table.Id +
      " until " + Clock.Format(r.Slot.End));
}

public sealed class Restaurant {
  private readonly List<Table> _tables;
  private readonly int _defaultDuration;
  private readonly SortedDictionary<int, Reservation> _reservations = new();
  private readonly Waitlist _waitlist = new();
  private readonly List<INotificationListener> _listeners = new();
  private int _nextId = 1;
  private readonly object _gate = new();

  public Restaurant(IEnumerable<Table> tables, int defaultDuration = 90) {
    // Sorted by capacity then id, so the first free table that fits is the best fit.
    _tables = tables.OrderBy(t => t.Capacity).ThenBy(t => t.Id, StringComparer.Ordinal).ToList();
    if (_tables.Count == 0) {
      throw new ArgumentException("need at least one table");
    }
    _defaultDuration = defaultDuration;
  }

  public void AddListener(INotificationListener l) {
    return _listeners.Add(l);
  }

  public int WaitlistSize { get { lock (_gate) return _waitlist.Count; } }

  public Reservation Reserve(Customer customer, int partySize, int start, int? duration = null) {
    lock (_gate) {
      var slot = MakeSlot(start, duration);
      var table = FindTable(partySize, slot);
      if (table is null)
        throw new ReservationException("No table for party of " + partySize + " at " + Clock.Format(start));
      return Create(customer, partySize, table, slot, ReservationStatus.Confirmed);
    }
  }

  public void Cancel(int reservationId, int now) {
    lock (_gate) {
      var res = Get(reservationId, ReservationStatus.Confirmed);
      res.Table.Release(res);
      res.Status = ReservationStatus.Cancelled;
      PromoteWaitlist(now);
    }
  }

  public void CheckOut(int reservationId, int now) {
    lock (_gate) {
      var res = Get(reservationId, ReservationStatus.Confirmed, ReservationStatus.Seated);
      res.Table.Release(res);
      res.Status = ReservationStatus.Completed;
      PromoteWaitlist(now);
    }
  }

  public Reservation Modify(int reservationId, int newStart, int newParty, int now) {
    lock (_gate) {
      var res = Get(reservationId, ReservationStatus.Confirmed);
      var newSlot = new TimeSlot(newStart, newStart + (res.Slot.End - res.Slot.Start));
      // Ignore this reservation's own booking so it can shift into an overlapping time.
      var table = FindTable(newParty, newSlot, res.Id);
      if (table is null) {
        throw new ReservationException("Cannot modify: no table available; original kept");
      }
      if (!ReferenceEquals(table, res.Table)) {
        res.Table.Release(res);
        table.Book(res);
        res.Table = table;
      }
      if (newStart != res.Slot.Start) {
        res.Notified = false;
      }
      res.Slot = newSlot;
      res.PartySize = newParty;
      PromoteWaitlist(now);
      return res;
    }
  }

  /// <summary>Returns the seated reservation, or null if the party was placed on the waitlist.</summary>
  public Reservation? SeatWalkIn(Customer customer, int partySize, int now) {
    lock (_gate) {
      if (partySize > _tables[^1].Capacity)
        throw new ReservationException("No table is large enough for party of " + partySize);
      var slot = MakeSlot(now, null);
      var table = FindTable(partySize, slot);
      if (table is not null) {
        return Create(customer, partySize, table, slot, ReservationStatus.Seated);
      }
      _waitlist.Add(new WaitlistEntry(customer, partySize, now));
      return null;
    }
  }

  public List<Reservation> NotifyUpcoming(int now, int leadMinutes) {
    lock (_gate) {
      var notified = new List<Reservation>();
      foreach (var res in _reservations.Values) {
        int until = res.Slot.Start - now;
        if (res.Status == ReservationStatus.Confirmed && !res.Notified && until >= 0 && until <= leadMinutes) {
          res.Notified = true;
          notified.Add(res);
          foreach (var l in _listeners) l.OnReservationApproaching(res);
        }
      }
      return notified;
    }
  }

  // ---- internals (always called with the lock held) ----

  private TimeSlot MakeSlot(int start, int? duration) =>
    new TimeSlot(start, start + (duration ?? _defaultDuration));

  private Table? FindTable(int partySize, TimeSlot slot, int ignoreId = -1) {
    if (partySize < 1) {
      throw new ArgumentException("party size must be positive");
    }
    return _tables.FirstOrDefault(t => t.Capacity >= partySize && t.IsFree(slot, ignoreId));
  }

  private Reservation Create(Customer c, int party, Table table, TimeSlot slot, ReservationStatus status) {
    var res = new Reservation { Id = _nextId++, Customer = c, PartySize = party, Table = table, Slot = slot, Status = status };
    table.Book(res);
    _reservations[res.Id] = res;
    return res;
  }

  private Reservation Get(int id, params ReservationStatus[] allowed) {
    if (!_reservations.TryGetValue(id, out var res) || !allowed.Contains(res.Status)) {
      throw new ReservationException("Reservation " + id + " not found or not in a valid state");
    }
    return res;
  }

  private void PromoteWaitlist(int now) {
    foreach (var entry in _waitlist.Entries()) { // arrival order; later, smaller parties may fit first
      var slot = MakeSlot(now, null);
      var table = FindTable(entry.PartySize, slot);
      if (table is null) {
        continue;
      }
      _waitlist.Remove(entry);
      var res = Create(entry.Customer, entry.PartySize, table, slot, ReservationStatus.Seated);
      foreach (var l in _listeners) l.OnWaitlistSeated(entry, res);
    }
  }
}

public static class Program {
  public static void Main() {
    var restaurant = new Restaurant(new[] {
      new Table("T1", 2), new Table("T2", 4), new Table("T3", 4), new Table("T4", 6) });
    restaurant.AddListener(new StaffNotifier());
    int sevenPm = 19 * 60;

    var guests = new (string Name, int Party)[] {
      ("Alice", 2), ("Bob", 2), ("Carol", 5), ("Dave", 3)
    }
    foreach (var (name, party) in guests) {
      var r = restaurant.Reserve(new Customer(name.ToLower(), name), party, sevenPm);
      Console.WriteLine(name + " -> " + r.Table.Id + " @ " + Clock.Format(r.Slot.Start));
    }
    int bobId = 2;

    restaurant.NotifyUpcoming(sevenPm - 30, 45);

    var seated = restaurant.SeatWalkIn(new Customer("erin", "Erin"), 2, sevenPm + 10);
    Console.WriteLine(seated is not null ? "Erin seated" : "Erin waitlisted (size " + restaurant.WaitlistSize + ")");

    restaurant.Cancel(1, sevenPm + 10); // Alice cancels -> Erin promoted
    var moved = restaurant.Modify(bobId, 21 * 60, 2, sevenPm + 10);
    Console.WriteLine("Bob moved to " + moved.Table.Id + " at " + Clock.Format(moved.Slot.Start));

    try {
      restaurant.Reserve(new Customer("zed", "Zed"), 9, sevenPm);
    } catch (ReservationException e) {
      Console.WriteLine("Error: " + e.Message);
    }
  }
}
`

export const restaurantTableReservationSolution: ProblemSolution = {
  slug: 'restaurant-table-reservation',
  title: 'Design a Restaurant Table Reservation System — Complete LLD Guide',
  overview: {
    introduction: [
      'A restaurant reservation system looks like a form with a date picker, but underneath it is a scheduling problem: every table is a resource that can be claimed for a stretch of time, and two claims must never overlap. Add party sizes, walk-ins, cancellations, and a waitlist, and you have the classic ingredients of an interval-booking design question — in a domain every interviewer understands instantly.',
      'The question is popular precisely because it has no famous memorized solution. You cannot recite a textbook answer; you have to model tables, time, and people from scratch. Interviewers watch for three things: whether you get overlap detection right (the half-open interval rule), whether you choose tables sensibly (smallest table that fits, so large tables stay available), and whether you keep the waitlist and notification behavior out of the booking core by using the Observer pattern.',
      'In this guide we follow the interview path: clarify time, duration, and walk-in semantics; list the nouns and verbs; decide what owns the schedule (the table does); build a small best-fit assignment; add a FIFO waitlist that promotes parties when capacity frees up; and wire in staff notifications. We then implement the whole thing in six languages with a demo that shows best-fit choice, a waitlist promotion on cancellation, and a reservation being moved to a different table.',
      'We stay within the practice brief: tables of different capacities (2, 4, 6, 8), booking by date, time, and party size, walk-ins with a waitlist, cancel and modify, smallest-fitting-table assignment, no double-booking, and a notification when a reservation is approaching. Everything is in-memory and single process; persistence and distributed locking are follow-ups.',
    ],
    constraints: [
      'Each table has a fixed capacity; a party may only use a table whose capacity is at least its size.',
      'A table can have many reservations, but no two active reservations on one table may overlap in time.',
      'Reservations have a fixed duration (default 90 minutes); the interval is half-open [start, end).',
      'The system picks the smallest free table that fits (best fit).',
      'Walk-ins are seated immediately if a table is free now, otherwise they join a waitlist.',
      'Staff are notified when a confirmed reservation is approaching; waitlisted parties are notified when seated.',
    ],
    assumptions: [
      'Time is modeled as integer minutes on one timeline to keep the demo deterministic; production code would use an Instant/datetime type with a restaurant time zone.',
      'Every reservation has the same default duration unless the caller overrides it.',
      'The waitlist is for walk-ins who want a table right now. Future-dated bookings that cannot be satisfied are rejected, not queued.',
      'When capacity frees up, the waitlist is scanned in arrival order and each party is seated if some table fits; a smaller party behind a large one may be seated first.',
      '“Approaching” is evaluated by calling notifyUpcoming(now, lead); a scheduler or cron job is out of scope.',
      'One restaurant, one process, one coarse lock around mutating operations.',
    ],
    clarificationQuestions: [
      {
        question: 'How long does a reservation last, and can the duration vary?',
        why: 'Duration defines the interval length used in overlap checks. A fixed default with an optional override covers both answers without changing the model.',
      },
      {
        question: 'Is “best fit” the smallest table that fits, or the earliest or nearest one?',
        why: 'Smallest-fit keeps big tables available for big parties. Sorting tables by capacity makes first-fit equal to best-fit, which keeps the code tiny.',
      },
      {
        question: 'Can tables be combined for large parties?',
        why: 'If yes, assignment becomes a search over sets of adjacent tables. We assume no and mention it as an extension.',
      },
      {
        question: 'What does the waitlist hold — walk-ins now, or future bookings that failed?',
        why: 'It changes what “promote” means. We treat the waitlist as walk-ins waiting for any table right now.',
      },
      {
        question: 'Should the waitlist be strict FIFO, or may a smaller party jump ahead if the head cannot fit?',
        why: 'Strict FIFO is fair but wastes capacity; skipping improves utilization but can starve large parties. Make the choice explicit.',
      },
      {
        question: 'What happens when someone modifies a reservation and the new time is unavailable?',
        why: 'The safe answer is that the original booking is kept unchanged. This forces you to search before you mutate.',
      },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'The first two minutes: restate and list the verbs',
        paragraphs: [
          'Restate the problem as: “Tables are resources; reservations claim a table for a time interval; a waitlist holds walk-ins until a table frees up; staff get notified at key moments.” The verbs are reserve, cancel, modify, seat a walk-in, check out, and notify. Those become the public API of a Restaurant façade.',
          'Then ask the clarification questions and write the answers on the board — especially duration, best-fit rule, and what the waitlist means. These answers are design constraints, and having them written down keeps the rest of the interview from drifting.',
        ],
        callout: {
          title: 'Interview tip',
          body: 'Say the overlap rule out loud: two intervals overlap when a.start < b.end AND b.start < a.end. Half-open intervals mean 7:00–8:30 and 8:30–10:00 do not conflict. This one line prevents the most common off-by-one bug in booking systems.',
        },
      },
      {
        heading: 'From requirements to nouns',
        paragraphs: [
          'Underline the nouns: restaurant, table, capacity, reservation, customer, party size, time slot, waitlist, staff. Customer is plain data. TimeSlot is a value object worth its own class because it owns the overlap rule. Reservation links a customer, a party size, a table, a slot, and a status. Waitlist holds entries of customer plus party size plus the time they joined.',
          'Verbs like “assign the smallest table” and “notify staff” are behaviors, not nouns. Assignment is a private method on Restaurant that scans tables in capacity order. Notification is an interface — NotificationListener — because we want the booking logic to be unaware of how staff are told.',
        ],
        numbered: [
          'Model TimeSlot first, with the overlap rule and nothing else.',
          'Give each Table its own list of active bookings and an isFree(slot) method.',
          'Let Restaurant own tables, reservations, the waitlist, and listeners.',
          'Put assignment (best fit) and waitlist promotion in Restaurant as private steps.',
          'Introduce NotificationListener as the Observer seam.',
        ],
      },
      {
        heading: 'Who owns the schedule?',
        paragraphs: [
          'This is the key design decision. You could keep one big list of reservations in Restaurant and filter by table every time. Or you could let each Table know its own bookings. The second option is better: “is this table free for this slot?” is a question about the table, so the table answers it. The check becomes a loop over a handful of bookings for one table instead of a scan over every reservation in the building.',
          'Restaurant still keeps a map from reservation id to Reservation for lookup by id (cancel, modify, check out) and for notifications. That is a deliberate duplication of references, not of data: both structures point at the same Reservation object, and release/book keep them in sync.',
        ],
      },
      {
        heading: 'Best-fit assignment',
        paragraphs: [
          'Sort tables by capacity (then id) once, at construction. To place a party, walk the sorted list and take the first table that has enough seats and is free for the requested slot. Because the list is ordered smallest to largest, the first match is automatically the smallest that fits. A party of two will prefer a two-top, then a four-top, and will only consume a six-top if nothing smaller is free.',
          'This is the whole algorithm — no scoring, no heaps. Mention the alternative (an index by capacity, or per-table interval trees for very large restaurants) and why you did not need it: with at most a few hundred tables and a handful of bookings per table per evening, a linear scan is fast enough.',
        ],
      },
      {
        heading: 'Walk-ins, the waitlist, and the Observer',
        paragraphs: [
          'A walk-in is a reservation that starts now. We try to seat them immediately using the same table search; if nothing fits, they are added to the waitlist. Whenever capacity could have been freed — a cancellation, a check-out, or a modification that moves a booking away — the restaurant calls promoteWaitlist(now). That method walks the waitlist in arrival order, tries to seat each entry, removes seated entries, and notifies listeners.',
          'The Restaurant never prints or texts anyone. It calls onWaitlistSeated and onReservationApproaching on each registered NotificationListener. StaffNotifier is one implementation; an SMS sender or a pager integration would be another, added without touching the booking code. That is Observer in its simplest, most useful form.',
        ],
        callout: {
          title: 'What “medium level” means here',
          body: 'Tables own their schedules, assignment is a sorted scan, promotion is a loop, notification is an interface, and one lock protects all mutations. No interval trees, no persistence, no distributed locks — but correct overlap logic and clean seams for all of them.',
        },
      },
      {
        heading: 'Cancel, modify, and the rule “search before you mutate”',
        paragraphs: [
          'Cancel is simple: release the table, mark the reservation cancelled, promote the waitlist. Modify is where candidates slip. If you release the old booking first and then fail to find a new table, the customer has lost their reservation. Instead, search for a new table while ignoring the reservation’s own booking (so a one-hour shift on the same table is not blocked by itself). Only if a table is found do you move the reservation and update its fields.',
          'This “find first, then commit” pattern generalizes to every update operation you will ever design, and saying so in the interview demonstrates you think about failure atomicity.',
        ],
      },
      {
        heading: 'Step-by-step path to the final diagram',
        paragraphs: [
          'Draw Restaurant on the left with a composition arrow to Table, and Table with an association to Reservation. Hang TimeSlot, Customer, and the status enum off Reservation. Put Waitlist and WaitlistEntry below Restaurant. At the bottom draw NotificationListener with StaffNotifier realizing it. Then walk through a booking, a walk-in that waits, and a cancellation that promotes them.',
        ],
        numbered: [
          'Clarify duration, best-fit, waitlist semantics.',
          'Write TimeSlot.overlaps and Table.isFree.',
          'Implement reserve with best-fit.',
          'Implement cancel and checkOut; then seatWalkIn and promoteWaitlist.',
          'Implement modify with find-first-then-commit.',
          'Add NotificationListener and notifyUpcoming.',
        ],
      },
    ],
    entities: [
      { name: 'Restaurant', responsibility: 'Façade: owns tables, reservations, waitlist, listeners; best-fit assignment; locking.', keyMembers: ['reserve', 'cancel', 'modify', 'seatWalkIn', 'notifyUpcoming'] },
      { name: 'Table', responsibility: 'Fixed capacity and its own active bookings; answers “free for this slot?”.', keyMembers: ['isFree', 'book', 'release'] },
      { name: 'Reservation', responsibility: 'Links customer, party, table, slot, and status.', keyMembers: ['table', 'slot', 'status'] },
      { name: 'TimeSlot', responsibility: 'Half-open interval value with the overlap rule.', keyMembers: ['overlaps'] },
      { name: 'Customer', responsibility: 'Identity and contact data.', keyMembers: ['id', 'name'] },
      { name: 'Waitlist / WaitlistEntry', responsibility: 'FIFO of walk-ins waiting for any table.', keyMembers: ['add', 'remove', 'entries'] },
      { name: 'NotificationListener', responsibility: 'Observer interface for approaching reservations and waitlist seating.', keyMembers: ['onReservationApproaching', 'onWaitlistSeated'] },
      { name: 'ReservationStatus', responsibility: 'CONFIRMED, SEATED, COMPLETED, CANCELLED lifecycle.', keyMembers: [] },
    ],
  },
  uml: { nodes, edges },
  umlCaption:
    'Top row: Restaurant → Table → Reservation (the booking spine). Middle row: Waitlist, its entries, and the value objects that hang off Reservation (TimeSlot, Customer, status). Bottom row: the Observer seam — NotificationListener and StaffNotifier. Spacing follows the 340×260 grid so composition edges stay readable.',
  designExplanation: {
    sections: [
      {
        heading: 'Architecture in one paragraph',
        paragraphs: [
          'Restaurant is the façade and the only class with a lock. Underneath it, Tables are small stateful resources that know their own bookings. Reservations tie everything together and carry a status. The waitlist is a plain FIFO, and listeners are plugged in from outside. Every public operation follows the same shape: lock, validate, search, commit, promote waitlist if capacity changed, unlock.',
        ],
      },
      {
        heading: 'TimeSlot as a value object',
        paragraphs: [
          'Interval logic is easy to get wrong when it is scattered through if statements. Putting it in TimeSlot gives you one method, overlaps, that you can unit test with a table of cases: identical intervals, nested, touching at the edge, disjoint. The constructor rejects end ≤ start, so an invalid interval can never exist.',
          'Half-open [start, end) means the end instant is free. A table booked 19:00–20:30 is available for a booking that starts at 20:30. This matches how restaurants actually turn tables.',
        ],
      },
      {
        heading: 'Reservation lifecycle',
        paragraphs: [
          'A reservation begins as CONFIRMED (advance booking) or SEATED (walk-in or promoted from the waitlist). Cancel is only legal from CONFIRMED. Check-out is legal from CONFIRMED or SEATED and moves to COMPLETED. Both terminal states remove the reservation from the table’s active bookings, so the table’s isFree loop only ever sees live commitments.',
          'Keeping completed and cancelled reservations in the global map (but not on the table) preserves history for reporting while keeping the hot path small.',
        ],
      },
      {
        heading: 'Waitlist promotion',
        paragraphs: [
          'promoteWaitlist copies the waitlist, then for each entry in arrival order computes a slot starting now, calls the same findTable used by reserve, and — if a table fits — removes the entry, creates a SEATED reservation, and notifies listeners. Copying first lets us remove entries while iterating.',
          'We skip entries that do not fit rather than stopping at the first failure. That is why the decision log mentions starvation: a very large party can wait while smaller parties are seated. If fairness matters more, replace the continue with a break.',
        ],
      },
      {
        heading: 'What we deliberately did not do',
        paragraphs: [
          'We did not use interval trees (one table has too few bookings to matter), combine tables, handle time zones or opening hours, persist anything, or schedule notifications ourselves. We also did not make Table or Reservation thread-safe individually: the Restaurant lock covers every mutation, which is simpler and sufficient for a single process.',
        ],
      },
    ],
    classResponsibilities: [
      { name: 'Restaurant', responsibility: 'Public API, best-fit search, state transitions, waitlist promotion, listener fan-out.', keyMembers: ['reserve', 'modify', 'promoteWaitlist'] },
      { name: 'Table', responsibility: 'Schedule for one physical table.', keyMembers: ['isFree', 'book', 'release'] },
      { name: 'TimeSlot', responsibility: 'Interval validity and overlap rule.', keyMembers: ['overlaps'] },
      { name: 'Reservation', responsibility: 'Mutable record of a booking (table, slot, party, status, notified).', keyMembers: ['status', 'notified'] },
      { name: 'Waitlist', responsibility: 'Ordered holding area for walk-ins.', keyMembers: ['add', 'remove', 'entries'] },
      { name: 'NotificationListener / StaffNotifier', responsibility: 'React to events without coupling the core to delivery channels.', keyMembers: ['onWaitlistSeated'] },
    ],
    patterns: [
      {
        name: 'Observer',
        why: 'Staff, SMS, and email notifications are independent concerns that should not live in booking logic.',
        howApplied: 'Restaurant keeps a list of NotificationListener and calls them when a reservation is approaching or a waitlisted party is seated.',
      },
      {
        name: 'Façade',
        why: 'Callers should not coordinate tables, waitlists, and locking themselves.',
        howApplied: 'Restaurant exposes reserve, cancel, modify, seatWalkIn, checkOut, and notifyUpcoming.',
      },
      {
        name: 'Strategy (as an extension seam)',
        why: 'Table selection may later become “window seat first”, “nearest to kitchen”, or “largest first for VIPs”.',
        howApplied: 'Today it is the private findTable. Extract a TableAssigner interface when a second policy appears — we deliberately do not add it before that.',
      },
    ],
    decisions: [
      {
        decision: 'Each Table owns its bookings.',
        rationale: '“Is this table free?” is a question about the table; the loop is over a few bookings, not all reservations.',
        alternativeRejected: 'A global list of reservations filtered by table on every check.',
        tradeoff: 'Reservation and Table reference each other, so book and release must stay in sync (done only inside Restaurant).',
      },
      {
        decision: 'Tables pre-sorted by capacity; first free fit is best fit.',
        rationale: 'No scoring needed; trivially correct and easy to explain.',
        alternativeRejected: 'Scoring tables by wasted seats on every request.',
        tradeoff: 'Does not consider table location or turn-time optimization.',
      },
      {
        decision: 'Waitlist scanning skips parties that do not fit.',
        rationale: 'Higher utilization: a free two-top should not sit empty because a party of six is at the head.',
        alternativeRejected: 'Strict head-of-line FIFO.',
        tradeoff: 'A large party can wait longer; a max-wait escalation rule would address it.',
      },
      {
        decision: 'Modify searches first, then commits.',
        rationale: 'Guarantees the customer never loses their original booking if the new request cannot be met.',
        alternativeRejected: 'Cancel and re-reserve.',
        tradeoff: 'Slightly more code to ignore the reservation’s own booking during the search.',
      },
      {
        decision: 'One coarse lock for all mutations.',
        rationale: 'The no-double-booking requirement spans table search and booking; one lock makes check-then-act atomic.',
        alternativeRejected: 'Per-table locks with ordered acquisition.',
        tradeoff: 'Throughput is bounded; fine for 200 tables.',
      },
    ],
    solid: {
      paragraphs: [
        'Single Responsibility: TimeSlot knows intervals, Table knows its schedule, Restaurant orchestrates, listeners deliver messages.',
        'Open/Closed: new notification channels implement NotificationListener; new assignment policies can replace findTable without changing callers.',
        'Liskov Substitution: any NotificationListener can replace another; the Restaurant never inspects the concrete type.',
        'Interface Segregation: listeners implement only the two events they care about (in larger systems split into separate interfaces).',
        'Dependency Inversion: Restaurant depends on the NotificationListener abstraction, not on StaffNotifier.',
      ],
    },
    extensibility: [
      'Table combining: Table groups with a combined capacity and adjacency; findTable searches single tables first, then groups.',
      'Opening hours and blackout dates: validate slots against a schedule object before searching.',
      'Deposits and no-shows: add a status NO_SHOW and a timeout job that releases unclaimed tables.',
      'Better performance: keep each table’s bookings sorted and binary-search for the neighbors of a slot, or maintain a free-capacity index.',
      'Pluggable assignment: introduce TableAssigner as a Strategy.',
    ],
  },
  implementationIntro: [
    'Each implementation has the same structure: TimeSlot, Customer, Reservation, Table, Waitlist, NotificationListener with a StaffNotifier, and the Restaurant façade. The demo books four guests (note which table each gets), fires approaching-reservation notifications, waitlists a walk-in, cancels a booking to promote the waitlist, moves a reservation to a different table, and finally shows a rejected oversize party.',
  ],
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    narrative: [
      'The restaurant has four tables: T1 (2 seats), T2 (4), T3 (4), T4 (6), sorted by capacity. At 19:00 four reservations arrive. Alice (party of 2) gets T1, the smallest table that fits. Bob (2) finds T1 busy and falls through to T2. Carol (5) skips every table smaller than five and lands on T4. Dave (3) gets T3. Each booking adds the reservation to its table’s list and to the restaurant’s id map.',
      'At 18:30 a scheduler calls notifyUpcoming with a 45-minute lead. Every confirmed, not-yet-notified reservation starting within 45 minutes triggers onReservationApproaching and is flagged so it will not fire twice. At 19:10 Erin, a party of two, walks in. The restaurant searches for a table free from 19:10 to 20:40 and finds none, so Erin goes on the waitlist.',
      'Alice cancels. cancel releases T1, marks her reservation cancelled, and calls promoteWaitlist(19:10). Erin’s entry is first; findTable returns T1; Erin becomes a SEATED reservation and the staff notifier prints it. Bob then asks to move to 21:00. The search ignores his own booking, finds the smallest table free at 21:00 — T1, since Erin’s stay ends at 20:40 — and moves him from T2 to T1. Finally, a party of nine is rejected because no table can ever seat them.',
    ],
    steps: [
      'reserve(customer, party, start): build the slot, lock, scan tables in capacity order for the first that fits and is free, create a CONFIRMED reservation, and book the table.',
      'notifyUpcoming(now, lead): for each CONFIRMED reservation not yet notified and starting within lead minutes, mark notified and call listeners.',
      'seatWalkIn(customer, party, now): search for a table free from now; if found create a SEATED reservation, else add a WaitlistEntry.',
      'cancel / checkOut: release the table, update status, promote the waitlist.',
      'promoteWaitlist(now): copy the waitlist, try each entry in order, seat and notify those that fit.',
      'modify: search ignoring the reservation’s own booking; if found, move and update; otherwise raise and change nothing.',
    ],
    examples: [
      {
        title: 'Best-fit assignment',
        input: 'Tables 2/4/4/6. reserve(Alice, 2), reserve(Bob, 2), reserve(Carol, 5), reserve(Dave, 3) all at 19:00',
        output: 'Alice→T1, Bob→T2, Carol→T4, Dave→T3',
        explanation: 'Each party takes the smallest free table that fits. Bob moves up to a four-top only because the two-top is taken.',
      },
      {
        title: 'Walk-in waitlisted, then promoted',
        input: 'Erin (2) walks in at 19:10 when all tables are held; Alice then cancels',
        output: 'Erin waitlisted (size 1) → [staff] waitlist seated: Erin at T1 until 20:40',
        explanation: 'The cancellation frees T1; promoteWaitlist finds the first fitting entry and seats it with the default 90-minute duration.',
      },
      {
        title: 'Modify to a later time',
        input: 'modify(Bob, newStart=21:00, party=2) while T1 is busy until 20:40',
        output: 'Bob moved to T1 at 21:00',
        explanation: 'Half-open intervals mean T1 is free from 20:40. The search ignores Bob’s own booking on T2 and finds the smaller table.',
      },
      {
        title: 'Party too large',
        input: 'reserve(Zed, party of 9)',
        output: 'Error: No table for party of 9 at 19:00',
        explanation: 'No table has capacity 9, so findTable returns nothing and no state changes.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you make the availability check faster than scanning each table’s bookings?',
      answer: 'Keep each table’s bookings sorted by start time and binary-search for the insertion point of the new slot, then check only the neighbors for overlap. That makes the check O(log n) per table. For very large chains you could also keep a global index of free capacity per time bucket, but that is premature for 200 tables.',
    },
    {
      question: 'How do you guarantee no double-booking under concurrent requests?',
      answer: 'The table search and the booking must happen as one atomic step. Our coarse Restaurant lock makes “find a free table, then book it” indivisible. To scale, use per-table locks acquired in a consistent order, or a database transaction with a unique-overlap constraint (for example an exclusion constraint on table and time range).',
    },
    {
      question: 'How would you support combining tables for a party of ten?',
      answer: 'Introduce a TableGroup (or a composite Table) with a combined capacity and a rule for adjacency. findTable first tries single tables, then tries groups. Booking a group books all its member tables for the same slot, and release frees them together. This is a good place to introduce a Strategy for assignment.',
    },
    {
      question: 'Should the waitlist be FIFO or priority-based?',
      answer: 'Start with FIFO scanning, which is predictable. If the business wants VIPs or reservations-with-issues to jump ahead, make Waitlist a priority queue ordered by a comparator, or let entries carry a priority field. To prevent starvation of large parties, add a maximum wait after which the head blocks smaller parties.',
    },
    {
      question: 'How would you implement no-shows?',
      answer: 'Add a NO_SHOW status and a periodic job that finds CONFIRMED reservations whose start plus a grace period has passed without being seated, releases their table, and promotes the waitlist. The status machine we already have makes this a small addition.',
    },
    {
      question: 'Why not store all reservations in one list and filter by table?',
      answer: 'It works at small scale, but the question “is this table free?” belongs to the table, and a per-table list shrinks the overlap scan from every reservation in the restaurant to a handful. It also makes it natural to later add table-specific rules such as maintenance windows.',
    },
    {
      question: 'How do you test the overlap logic?',
      answer: 'Unit test TimeSlot.overlaps with a table: identical, containing, contained, touching at the boundary (no overlap), partially overlapping from either side, and disjoint. Then property-test Table: after any sequence of book and release operations, no two active bookings overlap.',
    },
    {
      question: 'How would notifications scale beyond a console printer?',
      answer: 'Keep the NotificationListener interface and implement SMS or push listeners that enqueue work on a background queue so slow channels never block bookings. In a larger system the events themselves would be published on a message bus, and listeners would become subscribers.',
    },
  ],
  extras: {
    edgeCases: {
      paragraphs: [
        'The edge cases that matter are boundary times, state transitions, and invalid input. A booking that starts exactly when another ends must succeed. Cancelling twice, or cancelling a completed reservation, must fail cleanly. A party size of zero or larger than every table must be rejected before any state is touched.',
      ],
      bullets: [
        'Back-to-back bookings on one table (end equals next start).',
        'Modify to the same time but a larger party (may need a different table).',
        'Waitlist entry larger than any free table stays queued.',
        'notifyUpcoming called twice must not notify twice.',
        'Check-out of a waitlist-seated reservation frees the table for the next entry.',
      ],
    },
    commonMistakes: {
      paragraphs: [
        'Common mistakes are using closed intervals (so back-to-back bookings falsely conflict), releasing the old booking before verifying the new one in modify, mixing notification output into the Restaurant class, iterating the waitlist while removing from it, and forgetting that a modification that moves a booking away may free capacity for the waitlist. Another is assigning the first table that fits in input order instead of the smallest, which wastes large tables.',
      ],
    },
    complexity: [
      'reserve / seatWalkIn: O(T × B) where T is tables and B is bookings on each table (small); O(T log B) with sorted bookings.',
      'cancel / checkOut: O(B) to remove the booking plus a waitlist promotion pass of O(W × T × B).',
      'notifyUpcoming: O(R) over all reservations; keep an index of confirmed reservations if R is large.',
      'Memory: O(R + W) for reservations and waitlist entries.',
    ],
    testing: {
      paragraphs: [
        'Make time an explicit parameter (as we did with now) so tests never read a real clock. Use a recording NotificationListener to assert exactly which events fired and in what order.',
      ],
      numbered: [
        'TimeSlot.overlaps table: identical, nested, adjacent, disjoint.',
        'Best-fit: parties of 2, 3, 5 on tables 2/4/6 each choose the smallest fit.',
        'Double-booking: same table and overlapping time is rejected, adjacent time accepted.',
        'Waitlist: walk-in waits when full, is seated and notified after cancel.',
        'Modify failure keeps the original reservation intact.',
        'notifyUpcoming fires once per reservation, only inside the lead window.',
      ],
    },
    extensions: [
      'Combined tables for large parties.',
      'Opening hours, blackout dates, and time zones.',
      'No-show handling and deposits.',
      'Priority waitlist and estimated wait times.',
      'Persistent storage with a database overlap constraint.',
    ],
    takeaways: [
      'Model time as half-open intervals and put the overlap rule in one tested method.',
      'Let each Table own its schedule; the Restaurant façade coordinates and locks.',
      'Sort tables by capacity so first-fit is best-fit.',
      'Search first, then commit — especially in modify.',
      'Keep notifications behind an Observer interface so booking logic never prints or sends anything.',
    ],
  },
}
