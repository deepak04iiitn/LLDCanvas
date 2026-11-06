import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('rs', 'ReservationService', 40, 40, [
    attr('-', 'tables', 'List<Table>'),
    attr('-', 'reservations', 'Map<string, Reservation>'),
    attr('-', 'waitlist', 'Queue<WaitlistEntry>'),
    attr('-', 'observers', 'List<ReservationObserver>'),
    attr('-', 'assigner', 'TableAssigner'),
    attr('-', 'slot', 'Duration'),
  ], [
    method('+', 'reserve', 'customer, partySize, start', 'Reservation'),
    method('+', 'modify', 'id, newStart?, newPartySize?', 'Reservation'),
    method('+', 'cancel', 'id', 'void'),
    method('+', 'complete', 'id', 'void'),
    method('+', 'walkIn', 'customer, partySize', 'Reservation | WaitlistEntry'),
    method('+', 'promoteWaitlist', '', 'List<Reservation>'),
    method('+', 'addObserver', 'o: ReservationObserver', 'void'),
  ], 'facade'),
  cls('tb', 'Table', 40, 420, [
    attr('-', 'id', 'string'),
    attr('-', 'capacity', 'int  // 2 | 4 | 6 | 8'),
  ], []),
  cls('rv', 'Reservation', 330, 420, [
    attr('-', 'id', 'string'),
    attr('-', 'customer', 'string'),
    attr('-', 'partySize', 'int'),
    attr('-', 'start', 'DateTime'),
    attr('-', 'end', 'DateTime'),
    attr('-', 'tableId', 'string'),
    attr('-', 'status', 'ReservationStatus'),
  ], [
    method('+', 'overlaps', 'start, end', 'bool'),
    method('+', 'isActive', '', 'bool'),
  ]),
  cls('we', 'WaitlistEntry', 640, 420, [
    attr('-', 'id', 'string'),
    attr('-', 'customer', 'string'),
    attr('-', 'partySize', 'int'),
    attr('-', 'arrivedAt', 'DateTime'),
  ], []),
  enm('st', 'ReservationStatus', 330, 760, ['CONFIRMED', 'SEATED', 'CANCELLED', 'COMPLETED']),
  iface('ta', 'TableAssigner', 480, 40, [
    method('+', 'choose', 'free: List<Table>, partySize: int', 'Table?'),
  ]),
  cls('bf', 'BestFitAssigner', 480, 200, [], [
    method('+', 'choose', 'free, partySize', 'Table?'),
  ]),
  iface('ob', 'ReservationObserver', 800, 40, [
    method('+', 'onEvent', 'e: ReservationEvent', 'void'),
  ]),
  cls('sn', 'StaffNotifier', 1100, 20, [
    attr('-', 'sink', 'Consumer<string>'),
  ], [
    method('+', 'onEvent', 'e', 'void'),
  ]),
  cls('wo', 'WaitlistObserver', 1100, 200, [
    attr('-', 'service', 'ReservationService'),
  ], [
    method('+', 'onEvent', 'e', 'void'),
  ]),
  cls('ev', 'ReservationEvent', 800, 420, [
    attr('-', 'type', 'EventType'),
    attr('-', 'customer', 'string'),
    attr('-', 'partySize', 'int'),
    attr('-', 'tableId', 'string?'),
    attr('-', 'reservationId', 'string?'),
  ], []),
]

const edges = [
  edge('e1', 'rs', 'tb', 'composition', 'bottom@20', 'top', { sourceMultiplicity: '1', targetMultiplicity: '1..*' }),
  edge('e2', 'rs', 'rv', 'composition', 'bottom@55', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e3', 'rs', 'we', 'composition', 'bottom@85', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e4', 'rs', 'ta', 'aggregation', 'right@15', 'left', { label: 'uses' }),
  edge('e5', 'bf', 'ta', 'realization', 'top', 'bottom'),
  edge('e6', 'rs', 'ob', 'aggregation', 'right@45', 'left', { label: 'notifies', targetMultiplicity: '0..*' }),
  edge('e7', 'sn', 'ob', 'realization', 'left', 'right@25'),
  edge('e8', 'wo', 'ob', 'realization', 'top', 'right@75'),
  edge('e9', 'wo', 'rs', 'association', 'bottom', 'bottom', { label: 'promoteWaitlist()' }),
  edge('e10', 'rv', 'st', 'dependency', 'bottom', 'top'),
  edge('e11', 'ob', 'ev', 'dependency', 'bottom', 'top', { label: 'receives' }),
]

const py = `from __future__ import annotations
import itertools
from abc import ABC, abstractmethod
from collections import deque
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from threading import RLock
from typing import Callable, Deque, Dict, List, Optional, Union

VALID_CAPACITIES = (2, 4, 6, 8)
MAX_PARTY = max(VALID_CAPACITIES)


class ReservationStatus(Enum):
    CONFIRMED = "confirmed"
    SEATED = "seated"          # walk-in (or waitlist) party currently at a table
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class EventType(Enum):
    CONFIRMED = "confirmed"
    SEATED = "seated"
    MODIFIED = "modified"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    WAITLISTED = "waitlisted"
    WAITLIST_SEATED = "waitlist_seated"


class NoTableAvailable(Exception):
    pass


@dataclass(frozen=True)
class Table:
    id: str
    capacity: int

    def __post_init__(self) -> None:
        if self.capacity not in VALID_CAPACITIES:
            raise ValueError(f"capacity must be one of {VALID_CAPACITIES}")


@dataclass
class Reservation:
    id: str
    customer: str
    party_size: int
    start: datetime
    end: datetime
    table_id: str
    status: ReservationStatus

    def is_active(self) -> bool:
        return self.status in (ReservationStatus.CONFIRMED, ReservationStatus.SEATED)

    def overlaps(self, start: datetime, end: datetime) -> bool:
        return self.start < end and start < self.end  # half-open intervals [start, end)


@dataclass(frozen=True)
class WaitlistEntry:
    id: str
    customer: str
    party_size: int
    arrived_at: datetime


@dataclass(frozen=True)
class ReservationEvent:
    type: EventType
    customer: str
    party_size: int
    table_id: Optional[str] = None
    reservation_id: Optional[str] = None
    start: Optional[datetime] = None


class ReservationObserver(ABC):
    @abstractmethod
    def on_event(self, event: ReservationEvent) -> None: ...


class TableAssigner(ABC):
    """Strategy: pick one table from tables that are already free for the slot."""

    @abstractmethod
    def choose(self, free: List[Table], party_size: int) -> Optional[Table]: ...


class BestFitAssigner(TableAssigner):
    """Smallest capacity that fits; ties broken by table id for determinism."""

    def choose(self, free: List[Table], party_size: int) -> Optional[Table]:
        fits = [t for t in free if t.capacity >= party_size]
        return min(fits, key=lambda t: (t.capacity, t.id), default=None)


class ReservationService:
    def __init__(
        self,
        tables: List[Table],
        assigner: Optional[TableAssigner] = None,
        clock: Callable[[], datetime] = datetime.now,
        slot: timedelta = timedelta(minutes=90),
    ):
        if not tables:
            raise ValueError("need at least one table")
        self._tables = sorted(tables, key=lambda t: t.id)
        self._assigner = assigner or BestFitAssigner()
        self._clock = clock
        self._slot = slot
        self._reservations: Dict[str, Reservation] = {}
        self._waitlist: Deque[WaitlistEntry] = deque()
        self._observers: List[ReservationObserver] = []
        self._ids = itertools.count(1)
        self._lock = RLock()

    # ---------- observers ----------
    def add_observer(self, observer: ReservationObserver) -> None:
        with self._lock:
            self._observers.append(observer)

    def _notify(self, type_: EventType, r: Optional[Reservation] = None, entry: Optional[WaitlistEntry] = None) -> None:
        who = r or entry
        event = ReservationEvent(
            type_, who.customer, who.party_size,
            table_id=r.table_id if r else None,
            reservation_id=r.id if r else None,
            start=r.start if r else None,
        )
        for o in list(self._observers):  # copy: observers may react by calling the service
            try:
                o.on_event(event)
            except Exception:
                pass  # a faulty observer must not corrupt the booking flow

    # ---------- commands ----------
    def reserve(self, customer: str, party_size: int, start: datetime) -> Reservation:
        self._validate(party_size)
        with self._lock:
            end = start + self._slot
            table = self._assigner.choose(self._free_tables(start, end), party_size)
            if table is None:
                raise NoTableAvailable("no table fits that party at that time")
            r = Reservation(self._next_id("R"), customer, party_size, start, end, table.id, ReservationStatus.CONFIRMED)
            self._reservations[r.id] = r
            self._notify(EventType.CONFIRMED, r)
            return r

    def modify(self, reservation_id: str, new_start: Optional[datetime] = None,
               new_party_size: Optional[int] = None) -> Reservation:
        with self._lock:
            r = self._active(reservation_id)
            start = new_start or r.start
            party = new_party_size or r.party_size
            self._validate(party)
            end = start + self._slot
            # exclude the booking itself so it can keep its own table/time if still valid
            table = self._assigner.choose(self._free_tables(start, end, exclude=r.id), party)
            if table is None:
                raise NoTableAvailable("cannot modify: original booking kept")  # atomic: nothing changed
            r.start, r.end, r.party_size, r.table_id = start, end, party, table.id
            self._notify(EventType.MODIFIED, r)
            return r

    def cancel(self, reservation_id: str) -> None:
        with self._lock:
            r = self._active(reservation_id)
            r.status = ReservationStatus.CANCELLED
            self._notify(EventType.CANCELLED, r)

    def complete(self, reservation_id: str) -> None:
        """Guests left; frees the table for the rest of its slot."""
        with self._lock:
            r = self._active(reservation_id)
            r.status = ReservationStatus.COMPLETED
            self._notify(EventType.COMPLETED, r)

    def walk_in(self, customer: str, party_size: int) -> Union[Reservation, WaitlistEntry]:
        self._validate(party_size)
        with self._lock:
            now = self._clock()
            table = self._assigner.choose(self._free_tables(now, now + self._slot), party_size)
            if table is not None:
                r = Reservation(self._next_id("R"), customer, party_size, now, now + self._slot,
                                table.id, ReservationStatus.SEATED)
                self._reservations[r.id] = r
                self._notify(EventType.SEATED, r)
                return r
            entry = WaitlistEntry(self._next_id("W"), customer, party_size, now)
            self._waitlist.append(entry)
            self._notify(EventType.WAITLISTED, entry=entry)
            return entry

    def leave_waitlist(self, entry_id: str) -> bool:
        with self._lock:
            kept = deque(e for e in self._waitlist if e.id != entry_id)
            removed = len(kept) != len(self._waitlist)
            self._waitlist = kept
            return removed

    def promote_waitlist(self) -> List[Reservation]:
        """FIFO, but a party that cannot fit yet is skipped so smaller parties are not blocked."""
        with self._lock:
            now = self._clock()
            end = now + self._slot
            seated: List[Reservation] = []
            remaining: Deque[WaitlistEntry] = deque()
            for e in self._waitlist:
                table = self._assigner.choose(self._free_tables(now, end), e.party_size)
                if table is None:
                    remaining.append(e)
                    continue
                r = Reservation(self._next_id("R"), e.customer, e.party_size, now, end,
                                table.id, ReservationStatus.SEATED)
                self._reservations[r.id] = r
                seated.append(r)
            self._waitlist = remaining
            for r in seated:
                self._notify(EventType.WAITLIST_SEATED, r)
            return seated

    def waitlist(self) -> List[WaitlistEntry]:
        with self._lock:
            return list(self._waitlist)

    # ---------- helpers ----------
    def _free_tables(self, start: datetime, end: datetime, exclude: Optional[str] = None) -> List[Table]:
        busy = {
            r.table_id for r in self._reservations.values()
            if r.is_active() and r.id != exclude and r.overlaps(start, end)
        }
        return [t for t in self._tables if t.id not in busy]

    def _active(self, reservation_id: str) -> Reservation:
        r = self._reservations.get(reservation_id)
        if r is None or not r.is_active():
            raise KeyError("unknown or inactive reservation")
        return r

    def _next_id(self, prefix: str) -> str:
        return f"{prefix}{next(self._ids)}"

    @staticmethod
    def _validate(party_size: int) -> None:
        if party_size < 1 or party_size > MAX_PARTY:
            raise ValueError(f"party size must be 1..{MAX_PARTY}")


class StaffNotifier(ReservationObserver):
    def __init__(self, sink: Callable[[str], None] = print):
        self._sink = sink

    def on_event(self, e: ReservationEvent) -> None:
        where = f" at table {e.table_id}" if e.table_id else ""
        self._sink(f"[{e.type.value}] {e.customer} (party of {e.party_size}){where}")


class WaitlistObserver(ReservationObserver):
    """Whenever capacity may have been freed, try to seat waiting parties."""

    TRIGGERS = {EventType.CANCELLED, EventType.COMPLETED, EventType.MODIFIED}

    def __init__(self, service: ReservationService):
        self._service = service

    def on_event(self, e: ReservationEvent) -> None:
        if e.type in self.TRIGGERS:
            self._service.promote_waitlist()


def demo() -> None:
    now = [datetime(2026, 11, 5, 19, 0)]
    tables = [Table("T1", 2), Table("T2", 4), Table("T3", 4), Table("T4", 8)]
    svc = ReservationService(tables, clock=lambda: now[0])
    svc.add_observer(StaffNotifier())
    svc.add_observer(WaitlistObserver(svc))

    r = svc.reserve("Asha", 3, datetime(2026, 11, 5, 19, 30))  # best fit -> T2 (4-top)
    print("Asha ->", r.table_id)
    svc.walk_in("Ben", 8)       # T4 free for [19:00, 20:30)
    svc.walk_in("Cara", 8)      # no 8-top left -> waitlisted
    svc.cancel(r.id)            # frees T2 (does not help an 8-top)
    print("waitlist:", [w.customer for w in svc.waitlist()])


if __name__ == "__main__":
    demo()
`

const java = `import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Supplier;

enum ReservationStatus { CONFIRMED, SEATED, CANCELLED, COMPLETED }
enum EventType { CONFIRMED, SEATED, MODIFIED, CANCELLED, COMPLETED, WAITLISTED, WAITLIST_SEATED }

class NoTableAvailableException extends RuntimeException {
  NoTableAvailableException(String m) { super(m); }
}

record Table(String id, int capacity) {
  Table {
    if (capacity != 2 && capacity != 4 && capacity != 6 && capacity != 8)
      throw new IllegalArgumentException("capacity must be 2, 4, 6 or 8");
  }
}

final class Reservation {
  final String id, customer;
  int partySize;
  LocalDateTime start, end;
  String tableId;
  ReservationStatus status;

  Reservation(String id, String customer, int partySize, LocalDateTime start, LocalDateTime end,
              String tableId, ReservationStatus status) {
    this.id = id; this.customer = customer; this.partySize = partySize;
    this.start = start; this.end = end; this.tableId = tableId; this.status = status;
  }
  boolean isActive() { return status == ReservationStatus.CONFIRMED || status == ReservationStatus.SEATED; }
  boolean overlaps(LocalDateTime s, LocalDateTime e) { return start.isBefore(e) && s.isBefore(end); }
}

record WaitlistEntry(String id, String customer, int partySize, LocalDateTime arrivedAt) {}

record ReservationEvent(EventType type, String customer, int partySize,
                        String tableId, String reservationId, LocalDateTime start) {}

interface ReservationObserver { void onEvent(ReservationEvent event); }

interface TableAssigner {
  Optional<Table> choose(List<Table> free, int partySize);
}

class BestFitAssigner implements TableAssigner {
  @Override public Optional<Table> choose(List<Table> free, int partySize) {
    return free.stream()
        .filter(t -> t.capacity() >= partySize)
        .min(Comparator.comparingInt(Table::capacity).thenComparing(Table::id));
  }
}

/** Result of a walk-in: exactly one of the two fields is non-null. */
record WalkInResult(Reservation seated, WaitlistEntry waitlisted) {}

class ReservationService {
  private static final int MAX_PARTY = 8;
  private final List<Table> tables;
  private final TableAssigner assigner;
  private final Supplier<LocalDateTime> clock;
  private final Duration slot;
  private final Map<String, Reservation> reservations = new HashMap<>();
  private Deque<WaitlistEntry> waitlist = new ArrayDeque<>();
  private final List<ReservationObserver> observers = new ArrayList<>();
  private int seq = 0;

  ReservationService(List<Table> tables, TableAssigner assigner, Supplier<LocalDateTime> clock, Duration slot) {
    if (tables.isEmpty()) throw new IllegalArgumentException("need at least one table");
    this.tables = tables.stream().sorted(Comparator.comparing(Table::id)).toList();
    this.assigner = assigner; this.clock = clock; this.slot = slot;
  }
  ReservationService(List<Table> tables) {
    this(tables, new BestFitAssigner(), LocalDateTime::now, Duration.ofMinutes(90));
  }

  synchronized void addObserver(ReservationObserver o) { observers.add(o); }

  synchronized Reservation reserve(String customer, int partySize, LocalDateTime start) {
    validate(partySize);
    LocalDateTime end = start.plus(slot);
    Table table = assigner.choose(freeTables(start, end, null), partySize)
        .orElseThrow(() -> new NoTableAvailableException("no table fits that party at that time"));
    Reservation r = new Reservation(nextId("R"), customer, partySize, start, end, table.id(), ReservationStatus.CONFIRMED);
    reservations.put(r.id, r);
    notifyObservers(EventType.CONFIRMED, r, null);
    return r;
  }

  synchronized Reservation modify(String id, LocalDateTime newStart, Integer newPartySize) {
    Reservation r = active(id);
    LocalDateTime start = newStart != null ? newStart : r.start;
    int party = newPartySize != null ? newPartySize : r.partySize;
    validate(party);
    LocalDateTime end = start.plus(slot);
    Table table = assigner.choose(freeTables(start, end, r.id), party) // exclude itself
        .orElseThrow(() -> new NoTableAvailableException("cannot modify: original booking kept"));
    r.start = start; r.end = end; r.partySize = party; r.tableId = table.id(); // atomic: only after success
    notifyObservers(EventType.MODIFIED, r, null);
    return r;
  }

  synchronized void cancel(String id) {
    Reservation r = active(id);
    r.status = ReservationStatus.CANCELLED;
    notifyObservers(EventType.CANCELLED, r, null);
  }

  synchronized void complete(String id) {
    Reservation r = active(id);
    r.status = ReservationStatus.COMPLETED;
    notifyObservers(EventType.COMPLETED, r, null);
  }

  synchronized WalkInResult walkIn(String customer, int partySize) {
    validate(partySize);
    LocalDateTime now = clock.get();
    Optional<Table> table = assigner.choose(freeTables(now, now.plus(slot), null), partySize);
    if (table.isPresent()) {
      Reservation r = new Reservation(nextId("R"), customer, partySize, now, now.plus(slot),
          table.get().id(), ReservationStatus.SEATED);
      reservations.put(r.id, r);
      notifyObservers(EventType.SEATED, r, null);
      return new WalkInResult(r, null);
    }
    WaitlistEntry e = new WaitlistEntry(nextId("W"), customer, partySize, now);
    waitlist.addLast(e);
    notifyObservers(EventType.WAITLISTED, null, e);
    return new WalkInResult(null, e);
  }

  synchronized boolean leaveWaitlist(String entryId) {
    return waitlist.removeIf(e -> e.id().equals(entryId));
  }

  /** FIFO, but a party that cannot fit yet is skipped so smaller parties are not blocked. */
  synchronized List<Reservation> promoteWaitlist() {
    LocalDateTime now = clock.get(), end = now.plus(slot);
    List<Reservation> seated = new ArrayList<>();
    Deque<WaitlistEntry> remaining = new ArrayDeque<>();
    for (WaitlistEntry e : waitlist) {
      Optional<Table> t = assigner.choose(freeTables(now, end, null), e.partySize());
      if (t.isEmpty()) { remaining.addLast(e); continue; }
      Reservation r = new Reservation(nextId("R"), e.customer(), e.partySize(), now, end,
          t.get().id(), ReservationStatus.SEATED);
      reservations.put(r.id, r);
      seated.add(r);
    }
    waitlist = remaining;
    for (Reservation r : seated) notifyObservers(EventType.WAITLIST_SEATED, r, null);
    return seated;
  }

  synchronized List<WaitlistEntry> waitlist() { return List.copyOf(waitlist); }

  private List<Table> freeTables(LocalDateTime start, LocalDateTime end, String excludeId) {
    Set<String> busy = new HashSet<>();
    for (Reservation r : reservations.values()) {
      if (r.isActive() && !r.id.equals(excludeId) && r.overlaps(start, end)) busy.add(r.tableId);
    }
    return tables.stream().filter(t -> !busy.contains(t.id())).toList();
  }

  private Reservation active(String id) {
    Reservation r = reservations.get(id);
    if (r == null || !r.isActive()) throw new NoSuchElementException("unknown or inactive reservation");
    return r;
  }

  private String nextId(String prefix) { return prefix + (++seq); }

  private static void validate(int partySize) {
    if (partySize < 1 || partySize > MAX_PARTY) throw new IllegalArgumentException("party size must be 1.." + MAX_PARTY);
  }

  private void notifyObservers(EventType type, Reservation r, WaitlistEntry w) {
    String customer = r != null ? r.customer : w.customer();
    int party = r != null ? r.partySize : w.partySize();
    ReservationEvent ev = new ReservationEvent(type, customer, party,
        r != null ? r.tableId : null, r != null ? r.id : null, r != null ? r.start : null);
    for (ReservationObserver o : new ArrayList<>(observers)) { // copy: observers may call back in
      try { o.onEvent(ev); } catch (RuntimeException ignored) { }
    }
  }
}

class StaffNotifier implements ReservationObserver {
  private final Consumer<String> sink;
  StaffNotifier(Consumer<String> sink) { this.sink = sink; }
  @Override public void onEvent(ReservationEvent e) {
    String where = e.tableId() != null ? " at table " + e.tableId() : "";
    sink.accept("[" + e.type() + "] " + e.customer() + " (party of " + e.partySize() + ")" + where);
  }
}

class WaitlistObserver implements ReservationObserver {
  private static final Set<EventType> TRIGGERS = EnumSet.of(EventType.CANCELLED, EventType.COMPLETED, EventType.MODIFIED);
  private final ReservationService service;
  WaitlistObserver(ReservationService service) { this.service = service; }
  @Override public void onEvent(ReservationEvent e) {
    if (TRIGGERS.contains(e.type())) service.promoteWaitlist();
  }
}
`

const ts = `const VALID_CAPACITIES = [2, 4, 6, 8] as const
const MAX_PARTY = 8

type ReservationStatus = 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'COMPLETED'
type EventType =
  | 'CONFIRMED' | 'SEATED' | 'MODIFIED' | 'CANCELLED' | 'COMPLETED' | 'WAITLISTED' | 'WAITLIST_SEATED'

class NoTableAvailableError extends Error {}

class Table {
  constructor(public readonly id: string, public readonly capacity: number) {
    if (!(VALID_CAPACITIES as readonly number[]).includes(capacity)) {
      throw new Error('capacity must be 2, 4, 6 or 8')
    }
  }
}

interface Reservation {
  id: string
  customer: string
  partySize: number
  start: Date
  end: Date
  tableId: string
  status: ReservationStatus
}

interface WaitlistEntry { id: string; customer: string; partySize: number; arrivedAt: Date }

interface ReservationEvent {
  type: EventType
  customer: string
  partySize: number
  tableId?: string
  reservationId?: string
  start?: Date
}

interface ReservationObserver { onEvent(event: ReservationEvent): void }

interface TableAssigner {
  choose(free: Table[], partySize: number): Table | undefined
}

class BestFitAssigner implements TableAssigner {
  choose(free: Table[], partySize: number): Table | undefined {
    return free
      .filter(t => t.capacity >= partySize)
      .sort((a, b) => a.capacity - b.capacity || a.id.localeCompare(b.id))[0]
  }
}

const isActive = (r: Reservation) => r.status === 'CONFIRMED' || r.status === 'SEATED'
const overlaps = (r: Reservation, start: Date, end: Date) => r.start < end && start < r.end // [start, end)

class ReservationService {
  private tables: Table[]
  private reservations = new Map<string, Reservation>()
  private waitlist: WaitlistEntry[] = []
  private observers: ReservationObserver[] = []
  private seq = 0

  constructor(
    tables: Table[],
    private assigner: TableAssigner = new BestFitAssigner(),
    private clock: () => Date = () => new Date(),
    private slotMs = 90 * 60_000,
  ) {
    if (tables.length === 0) throw new Error('need at least one table')
    this.tables = [...tables].sort((a, b) => a.id.localeCompare(b.id))
  }

  addObserver(o: ReservationObserver) { this.observers.push(o) }

  reserve(customer: string, partySize: number, start: Date): Reservation {
    this.validate(partySize)
    const end = new Date(start.getTime() + this.slotMs)
    const table = this.assigner.choose(this.freeTables(start, end), partySize)
    if (!table) throw new NoTableAvailableError('no table fits that party at that time')
    const r: Reservation = {
      id: this.nextId('R'), customer, partySize, start, end, tableId: table.id, status: 'CONFIRMED',
    }
    this.reservations.set(r.id, r)
    this.emit('CONFIRMED', r)
    return r
  }

  modify(id: string, change: { start?: Date; partySize?: number }): Reservation {
    const r = this.active(id)
    const start = change.start ?? r.start
    const partySize = change.partySize ?? r.partySize
    this.validate(partySize)
    const end = new Date(start.getTime() + this.slotMs)
    const table = this.assigner.choose(this.freeTables(start, end, r.id), partySize) // exclude itself
    if (!table) throw new NoTableAvailableError('cannot modify: original booking kept')
    Object.assign(r, { start, end, partySize, tableId: table.id }) // atomic: only after success
    this.emit('MODIFIED', r)
    return r
  }

  cancel(id: string) {
    const r = this.active(id)
    r.status = 'CANCELLED'
    this.emit('CANCELLED', r)
  }

  complete(id: string) {
    const r = this.active(id)
    r.status = 'COMPLETED'
    this.emit('COMPLETED', r)
  }

  walkIn(customer: string, partySize: number): Reservation | WaitlistEntry {
    this.validate(partySize)
    const now = this.clock()
    const end = new Date(now.getTime() + this.slotMs)
    const table = this.assigner.choose(this.freeTables(now, end), partySize)
    if (table) {
      const r: Reservation = {
        id: this.nextId('R'), customer, partySize, start: now, end, tableId: table.id, status: 'SEATED',
      }
      this.reservations.set(r.id, r)
      this.emit('SEATED', r)
      return r
    }
    const entry: WaitlistEntry = { id: this.nextId('W'), customer, partySize, arrivedAt: now }
    this.waitlist.push(entry)
    this.emit('WAITLISTED', undefined, entry)
    return entry
  }

  leaveWaitlist(entryId: string): boolean {
    const before = this.waitlist.length
    this.waitlist = this.waitlist.filter(e => e.id !== entryId)
    return this.waitlist.length !== before
  }

  /** FIFO, but a party that cannot fit yet is skipped so smaller parties are not blocked. */
  promoteWaitlist(): Reservation[] {
    const now = this.clock()
    const end = new Date(now.getTime() + this.slotMs)
    const seated: Reservation[] = []
    const remaining: WaitlistEntry[] = []
    for (const e of this.waitlist) {
      const table = this.assigner.choose(this.freeTables(now, end), e.partySize)
      if (!table) { remaining.push(e); continue }
      const r: Reservation = {
        id: this.nextId('R'), customer: e.customer, partySize: e.partySize,
        start: now, end, tableId: table.id, status: 'SEATED',
      }
      this.reservations.set(r.id, r)
      seated.push(r)
    }
    this.waitlist = remaining
    for (const r of seated) this.emit('WAITLIST_SEATED', r)
    return seated
  }

  getWaitlist(): readonly WaitlistEntry[] { return [...this.waitlist] }

  private freeTables(start: Date, end: Date, excludeId?: string): Table[] {
    const busy = new Set<string>()
    for (const r of this.reservations.values()) {
      if (isActive(r) && r.id !== excludeId && overlaps(r, start, end)) busy.add(r.tableId)
    }
    return this.tables.filter(t => !busy.has(t.id))
  }

  private active(id: string): Reservation {
    const r = this.reservations.get(id)
    if (!r || !isActive(r)) throw new Error('unknown or inactive reservation')
    return r
  }

  private nextId(prefix: string) { return prefix + String(++this.seq) }

  private validate(partySize: number) {
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > MAX_PARTY) {
      throw new Error('party size must be 1..' + MAX_PARTY)
    }
  }

  private emit(type: EventType, r?: Reservation, w?: WaitlistEntry) {
    const who = (r ?? w)!
    const event: ReservationEvent = {
      type, customer: who.customer, partySize: who.partySize,
      tableId: r?.tableId, reservationId: r?.id, start: r?.start,
    }
    for (const o of [...this.observers]) { // copy: observers may call back in
      try { o.onEvent(event) } catch { /* isolate faulty observers */ }
    }
  }
}

class StaffNotifier implements ReservationObserver {
  constructor(private sink: (msg: string) => void = console.log) {}
  onEvent(e: ReservationEvent) {
    const where = e.tableId ? ' at table ' + e.tableId : ''
    this.sink('[' + e.type + '] ' + e.customer + ' (party of ' + e.partySize + ')' + where)
  }
}

class WaitlistObserver implements ReservationObserver {
  private static TRIGGERS = new Set<EventType>(['CANCELLED', 'COMPLETED', 'MODIFIED'])
  constructor(private service: ReservationService) {}
  onEvent(e: ReservationEvent) {
    if (WaitlistObserver.TRIGGERS.has(e.type)) this.service.promoteWaitlist()
  }
}

export { ReservationService, Table, BestFitAssigner, StaffNotifier, WaitlistObserver, NoTableAvailableError }
export type { Reservation, WaitlistEntry, ReservationEvent, ReservationObserver, TableAssigner }
`

const cpp = `#include <algorithm>
#include <deque>
#include <functional>
#include <map>
#include <memory>
#include <mutex>
#include <optional>
#include <set>
#include <stdexcept>
#include <string>
#include <vector>

using Minute = long long;  // minutes since epoch keeps the sample dependency-free

enum class Status { Confirmed, Seated, Cancelled, Completed };
enum class EventType { Confirmed, Seated, Modified, Cancelled, Completed, Waitlisted, WaitlistSeated };

struct NoTableAvailable : std::runtime_error { using std::runtime_error::runtime_error; };

struct Table {
  std::string id; int capacity;
  Table(std::string i, int c) : id(std::move(i)), capacity(c) {
    if (c != 2 && c != 4 && c != 6 && c != 8) throw std::invalid_argument("capacity must be 2/4/6/8");
  }
};

struct Reservation {
  std::string id, customer; int partySize; Minute start, end; std::string tableId; Status status;
  bool active() const { return status == Status::Confirmed || status == Status::Seated; }
  bool overlaps(Minute s, Minute e) const { return start < e && s < end; }  // [start, end)
};

struct WaitlistEntry { std::string id, customer; int partySize; Minute arrivedAt; };

struct ReservationEvent {
  EventType type; std::string customer; int partySize; std::string tableId; std::string reservationId;
};

class ReservationObserver {
public:
  virtual ~ReservationObserver() = default;
  virtual void onEvent(const ReservationEvent& e) = 0;
};

class TableAssigner {
public:
  virtual ~TableAssigner() = default;
  virtual const Table* choose(const std::vector<const Table*>& free, int partySize) const = 0;
};

class BestFitAssigner : public TableAssigner {
public:
  const Table* choose(const std::vector<const Table*>& free, int partySize) const override {
    const Table* best = nullptr;
    for (const Table* t : free) {
      if (t->capacity < partySize) continue;
      if (!best || t->capacity < best->capacity || (t->capacity == best->capacity && t->id < best->id)) best = t;
    }
    return best;
  }
};

struct WalkInResult { std::optional<Reservation> seated; std::optional<WaitlistEntry> waitlisted; };

class ReservationService {
  static constexpr int kMaxParty = 8;
  std::recursive_mutex mu_;
  std::map<std::string, Table> tables_;               // ordered by id
  std::map<std::string, Reservation> reservations_;
  std::deque<WaitlistEntry> waitlist_;
  std::vector<std::shared_ptr<ReservationObserver>> observers_;
  std::unique_ptr<TableAssigner> assigner_;
  std::function<Minute()> clock_;
  Minute slot_;
  int seq_ = 0;

  std::string nextId(const char* p) { return p + std::to_string(++seq_); }
  static void validate(int n) { if (n < 1 || n > kMaxParty) throw std::invalid_argument("party size 1..8"); }

  std::vector<const Table*> freeTables(Minute s, Minute e, const std::string& exclude = "") const {
    std::set<std::string> busy;
    for (const auto& [id, r] : reservations_)
      if (r.active() && id != exclude && r.overlaps(s, e)) busy.insert(r.tableId);
    std::vector<const Table*> out;
    for (const auto& [id, t] : tables_) if (!busy.count(id)) out.push_back(&t);
    return out;
  }

  Reservation& active(const std::string& id) {
    auto it = reservations_.find(id);
    if (it == reservations_.end() || !it->second.active()) throw std::out_of_range("unknown or inactive reservation");
    return it->second;
  }

  void emit(EventType type, const std::string& customer, int party, const std::string& table = "",
            const std::string& rid = "") {
    ReservationEvent ev{type, customer, party, table, rid};
    auto copy = observers_;  // observers may call back into the service
    for (auto& o : copy) { try { o->onEvent(ev); } catch (...) {} }
  }
  void emit(EventType t, const Reservation& r) { emit(t, r.customer, r.partySize, r.tableId, r.id); }

public:
  ReservationService(const std::vector<Table>& tables, Minute slot = 90,
                     std::function<Minute()> clock = [] { return Minute{0}; },
                     std::unique_ptr<TableAssigner> a = std::make_unique<BestFitAssigner>())
      : assigner_(std::move(a)), clock_(std::move(clock)), slot_(slot) {
    if (tables.empty()) throw std::invalid_argument("need at least one table");
    for (const auto& t : tables) tables_.emplace(t.id, t);
  }

  void addObserver(std::shared_ptr<ReservationObserver> o) {
    std::lock_guard<std::recursive_mutex> g(mu_); observers_.push_back(std::move(o));
  }

  Reservation reserve(const std::string& customer, int party, Minute start) {
    validate(party);
    std::lock_guard<std::recursive_mutex> g(mu_);
    const Table* t = assigner_->choose(freeTables(start, start + slot_), party);
    if (!t) throw NoTableAvailable("no table fits that party at that time");
    Reservation r{nextId("R"), customer, party, start, start + slot_, t->id, Status::Confirmed};
    reservations_.emplace(r.id, r);
    emit(EventType::Confirmed, r);
    return r;
  }

  Reservation modify(const std::string& id, std::optional<Minute> newStart, std::optional<int> newParty) {
    std::lock_guard<std::recursive_mutex> g(mu_);
    Reservation& r = active(id);
    Minute start = newStart.value_or(r.start);
    int party = newParty.value_or(r.partySize);
    validate(party);
    const Table* t = assigner_->choose(freeTables(start, start + slot_, r.id), party);  // exclude itself
    if (!t) throw NoTableAvailable("cannot modify: original booking kept");
    r.start = start; r.end = start + slot_; r.partySize = party; r.tableId = t->id;  // only after success
    emit(EventType::Modified, r);
    return r;
  }

  void cancel(const std::string& id) {
    std::lock_guard<std::recursive_mutex> g(mu_);
    Reservation& r = active(id); r.status = Status::Cancelled; emit(EventType::Cancelled, r);
  }

  void complete(const std::string& id) {
    std::lock_guard<std::recursive_mutex> g(mu_);
    Reservation& r = active(id); r.status = Status::Completed; emit(EventType::Completed, r);
  }

  WalkInResult walkIn(const std::string& customer, int party) {
    validate(party);
    std::lock_guard<std::recursive_mutex> g(mu_);
    Minute now = clock_();
    if (const Table* t = assigner_->choose(freeTables(now, now + slot_), party)) {
      Reservation r{nextId("R"), customer, party, now, now + slot_, t->id, Status::Seated};
      reservations_.emplace(r.id, r);
      emit(EventType::Seated, r);
      return {r, std::nullopt};
    }
    WaitlistEntry e{nextId("W"), customer, party, now};
    waitlist_.push_back(e);
    emit(EventType::Waitlisted, customer, party);
    return {std::nullopt, e};
  }

  // FIFO, but a party that cannot fit yet is skipped so smaller parties are not blocked.
  std::vector<Reservation> promoteWaitlist() {
    std::lock_guard<std::recursive_mutex> g(mu_);
    Minute now = clock_();
    std::vector<Reservation> seated;
    std::deque<WaitlistEntry> remaining;
    for (const auto& e : waitlist_) {
      const Table* t = assigner_->choose(freeTables(now, now + slot_), e.partySize);
      if (!t) { remaining.push_back(e); continue; }
      Reservation r{nextId("R"), e.customer, e.partySize, now, now + slot_, t->id, Status::Seated};
      reservations_.emplace(r.id, r);
      seated.push_back(r);
    }
    waitlist_ = std::move(remaining);
    for (const auto& r : seated) emit(EventType::WaitlistSeated, r);
    return seated;
  }

  std::vector<WaitlistEntry> waitlist() {
    std::lock_guard<std::recursive_mutex> g(mu_);
    return {waitlist_.begin(), waitlist_.end()};
  }
};

class StaffNotifier : public ReservationObserver {
  std::function<void(const std::string&)> sink_;
public:
  explicit StaffNotifier(std::function<void(const std::string&)> sink) : sink_(std::move(sink)) {}
  void onEvent(const ReservationEvent& e) override {
    sink_("event " + std::to_string((int)e.type) + ": " + e.customer + " (party of " +
          std::to_string(e.partySize) + ")" + (e.tableId.empty() ? "" : " at table " + e.tableId));
  }
};

class WaitlistObserver : public ReservationObserver {
  ReservationService& service_;
public:
  explicit WaitlistObserver(ReservationService& s) : service_(s) {}
  void onEvent(const ReservationEvent& e) override {
    if (e.type == EventType::Cancelled || e.type == EventType::Completed || e.type == EventType::Modified)
      service_.promoteWaitlist();
  }
};
`

const goCode = `package reservation

import (
  "errors"
  "fmt"
  "sort"
  "sync"
  "time"
)

type Status int

const (
  Confirmed Status = iota
  Seated
  Cancelled
  Completed
)

type EventType int

const (
  EvConfirmed EventType = iota
  EvSeated
  EvModified
  EvCancelled
  EvCompleted
  EvWaitlisted
  EvWaitlistSeated
)

var ErrNoTable = errors.New("no table fits that party at that time")

type Table struct {
  ID       string
  Capacity int
}

func NewTable(id string, capacity int) (Table, error) {
  switch capacity {
  case 2, 4, 6, 8:
    return Table{id, capacity}, nil
  }
  return Table{}, errors.New("capacity must be 2, 4, 6 or 8")
}

type Reservation struct {
  ID, Customer string
  PartySize    int
  Start, End   time.Time
  TableID      string
  Status       Status
}

func (r *Reservation) Active() bool { return r.Status == Confirmed || r.Status == Seated }
func (r *Reservation) Overlaps(s, e time.Time) bool { return r.Start.Before(e) && s.Before(r.End) }

type WaitlistEntry struct {
  ID, Customer string
  PartySize    int
  ArrivedAt    time.Time
}

type Event struct {
  Type          EventType
  Customer      string
  PartySize     int
  TableID       string
  ReservationID string
}

type Observer interface{ OnEvent(Event) }

// TableAssigner is the placement Strategy.
type TableAssigner interface {
  Choose(free []Table, partySize int) (Table, bool)
}

type BestFitAssigner struct{}

func (BestFitAssigner) Choose(free []Table, party int) (Table, bool) {
  var best Table
  found := false
  for _, t := range free {
    if t.Capacity < party {
      continue
    }
    if !found || t.Capacity < best.Capacity || (t.Capacity == best.Capacity && t.ID < best.ID) {
      best, found = t, true
    }
  }
  return best, found
}

type Service struct {
  mu           sync.Mutex
  tables       []Table
  assigner     TableAssigner
  clock        func() time.Time
  slot         time.Duration
  reservations map[string]*Reservation
  waitlist     []WaitlistEntry
  observers    []Observer
  seq          int
}

func NewService(tables []Table, a TableAssigner, clock func() time.Time, slot time.Duration) *Service {
  ts := append([]Table(nil), tables...)
  sort.Slice(ts, func(i, j int) bool { return ts[i].ID < ts[j].ID })
  if a == nil {
    a = BestFitAssigner{}
  }
  if clock == nil {
    clock = time.Now
  }
  if slot == 0 {
    slot = 90 * time.Minute
  }
  return &Service{tables: ts, assigner: a, clock: clock, slot: slot, reservations: map[string]*Reservation{}}
}

func (s *Service) AddObserver(o Observer) { s.mu.Lock(); s.observers = append(s.observers, o); s.mu.Unlock() }

// publish runs OUTSIDE the lock (Go mutexes are not reentrant) so observers can call back in.
func (s *Service) publish(events []Event) {
  s.mu.Lock()
  obs := append([]Observer(nil), s.observers...)
  s.mu.Unlock()
  for _, e := range events {
    for _, o := range obs {
      func() { defer func() { _ = recover() }(); o.OnEvent(e) }()
    }
  }
}

func evOf(t EventType, r *Reservation) Event {
  return Event{t, r.Customer, r.PartySize, r.TableID, r.ID}
}

func (s *Service) nextID(p string) string { s.seq++; return fmt.Sprintf("%s%d", p, s.seq) }

func validate(n int) error {
  if n < 1 || n > 8 {
    return errors.New("party size must be 1..8")
  }
  return nil
}

func (s *Service) freeTables(start, end time.Time, exclude string) []Table {
  busy := map[string]bool{}
  for id, r := range s.reservations {
    if r.Active() && id != exclude && r.Overlaps(start, end) {
      busy[r.TableID] = true
    }
  }
  var out []Table
  for _, t := range s.tables {
    if !busy[t.ID] {
      out = append(out, t)
    }
  }
  return out
}

func (s *Service) Reserve(customer string, party int, start time.Time) (Reservation, error) {
  if err := validate(party); err != nil {
    return Reservation{}, err
  }
  s.mu.Lock()
  end := start.Add(s.slot)
  t, ok := s.assigner.Choose(s.freeTables(start, end, ""), party)
  if !ok {
    s.mu.Unlock()
    return Reservation{}, ErrNoTable
  }
  r := &Reservation{s.nextID("R"), customer, party, start, end, t.ID, Confirmed}
  s.reservations[r.ID] = r
  out, ev := *r, evOf(EvConfirmed, r)
  s.mu.Unlock()
  s.publish([]Event{ev})
  return out, nil
}

func (s *Service) active(id string) (*Reservation, error) {
  r, ok := s.reservations[id]
  if !ok || !r.Active() {
    return nil, errors.New("unknown or inactive reservation")
  }
  return r, nil
}

// Modify: nil arguments keep the current value. Nothing changes if no table fits.
func (s *Service) Modify(id string, newStart *time.Time, newParty *int) (Reservation, error) {
  s.mu.Lock()
  r, err := s.active(id)
  if err != nil {
    s.mu.Unlock()
    return Reservation{}, err
  }
  start, party := r.Start, r.PartySize
  if newStart != nil {
    start = *newStart
  }
  if newParty != nil {
    party = *newParty
  }
  if err := validate(party); err != nil {
    s.mu.Unlock()
    return Reservation{}, err
  }
  end := start.Add(s.slot)
  t, ok := s.assigner.Choose(s.freeTables(start, end, r.ID), party) // exclude itself
  if !ok {
    s.mu.Unlock()
    return Reservation{}, ErrNoTable
  }
  r.Start, r.End, r.PartySize, r.TableID = start, end, party, t.ID
  out, ev := *r, evOf(EvModified, r)
  s.mu.Unlock()
  s.publish([]Event{ev})
  return out, nil
}

func (s *Service) finish(id string, st Status, ev EventType) error {
  s.mu.Lock()
  r, err := s.active(id)
  if err != nil {
    s.mu.Unlock()
    return err
  }
  r.Status = st
  e := evOf(ev, r)
  s.mu.Unlock()
  s.publish([]Event{e})
  return nil
}

func (s *Service) Cancel(id string) error   { return s.finish(id, Cancelled, EvCancelled) }
func (s *Service) Complete(id string) error { return s.finish(id, Completed, EvCompleted) }

type WalkInResult struct {
  Seated     *Reservation
  Waitlisted *WaitlistEntry
}

func (s *Service) WalkIn(customer string, party int) (WalkInResult, error) {
  if err := validate(party); err != nil {
    return WalkInResult{}, err
  }
  s.mu.Lock()
  now := s.clock()
  end := now.Add(s.slot)
  if t, ok := s.assigner.Choose(s.freeTables(now, end, ""), party); ok {
    r := &Reservation{s.nextID("R"), customer, party, now, end, t.ID, Seated}
    s.reservations[r.ID] = r
    out, ev := *r, evOf(EvSeated, r)
    s.mu.Unlock()
    s.publish([]Event{ev})
    return WalkInResult{Seated: &out}, nil
  }
  e := WaitlistEntry{s.nextID("W"), customer, party, now}
  s.waitlist = append(s.waitlist, e)
  s.mu.Unlock()
  s.publish([]Event{{Type: EvWaitlisted, Customer: customer, PartySize: party}})
  return WalkInResult{Waitlisted: &e}, nil
}

// PromoteWaitlist: FIFO, but a party that cannot fit yet is skipped so smaller parties are not blocked.
func (s *Service) PromoteWaitlist() []Reservation {
  s.mu.Lock()
  now := s.clock()
  end := now.Add(s.slot)
  var seated []Reservation
  var remaining []WaitlistEntry
  var events []Event
  for _, e := range s.waitlist {
    t, ok := s.assigner.Choose(s.freeTables(now, end, ""), e.PartySize)
    if !ok {
      remaining = append(remaining, e)
      continue
    }
    r := &Reservation{s.nextID("R"), e.Customer, e.PartySize, now, end, t.ID, Seated}
    s.reservations[r.ID] = r
    seated = append(seated, *r)
    events = append(events, evOf(EvWaitlistSeated, r))
  }
  s.waitlist = remaining
  s.mu.Unlock()
  s.publish(events)
  return seated
}

func (s *Service) Waitlist() []WaitlistEntry {
  s.mu.Lock()
  defer s.mu.Unlock()
  return append([]WaitlistEntry(nil), s.waitlist...)
}

// ---- observers ----

type StaffNotifier struct{ Sink func(string) }

func (n StaffNotifier) OnEvent(e Event) {
  n.Sink(fmt.Sprintf("event %d: %s (party of %d) table=%s", e.Type, e.Customer, e.PartySize, e.TableID))
}

type WaitlistObserver struct{ Service *Service }

func (w WaitlistObserver) OnEvent(e Event) {
  switch e.Type {
  case EvCancelled, EvCompleted, EvModified:
    w.Service.PromoteWaitlist()
  }
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

public enum ReservationStatus { Confirmed, Seated, Cancelled, Completed }
public enum EventType { Confirmed, Seated, Modified, Cancelled, Completed, Waitlisted, WaitlistSeated }

public sealed class NoTableAvailableException : Exception {
  public NoTableAvailableException(string m) : base(m) {}
}

public sealed record Table {
  public string Id { get; }
  public int Capacity { get; }
  public Table(string id, int capacity) {
    if (capacity is not (2 or 4 or 6 or 8)) throw new ArgumentException("capacity must be 2, 4, 6 or 8");
    Id = id; Capacity = capacity;
  }
}

public sealed class Reservation {
  public string Id { get; init; } = "";
  public string Customer { get; init; } = "";
  public int PartySize { get; set; }
  public DateTime Start { get; set; }
  public DateTime End { get; set; }
  public string TableId { get; set; } = "";
  public ReservationStatus Status { get; set; }
  public bool IsActive => Status is ReservationStatus.Confirmed or ReservationStatus.Seated;
  public bool Overlaps(DateTime s, DateTime e) => Start < e && s < End; // [start, end)
}

public sealed record WaitlistEntry(string Id, string Customer, int PartySize, DateTime ArrivedAt);

public sealed record ReservationEvent(EventType Type, string Customer, int PartySize, string? TableId, string? ReservationId);

public interface IReservationObserver { void OnEvent(ReservationEvent e); }

public interface ITableAssigner {
  Table? Choose(IReadOnlyList<Table> free, int partySize);
}

public sealed class BestFitAssigner : ITableAssigner {
  public Table? Choose(IReadOnlyList<Table> free, int partySize) =>
    free.Where(t => t.Capacity >= partySize)
        .OrderBy(t => t.Capacity).ThenBy(t => t.Id, StringComparer.Ordinal)
        .FirstOrDefault();
}

public sealed record WalkInResult(Reservation? Seated, WaitlistEntry? Waitlisted);

public sealed class ReservationService {
  const int MaxParty = 8;
  readonly List<Table> _tables;
  readonly ITableAssigner _assigner;
  readonly Func<DateTime> _clock;
  readonly TimeSpan _slot;
  readonly Dictionary<string, Reservation> _reservations = new();
  List<WaitlistEntry> _waitlist = new();
  readonly List<IReservationObserver> _observers = new();
  readonly object _gate = new(); // Monitor is reentrant: observers may call back in
  int _seq;

  public ReservationService(IEnumerable<Table> tables, ITableAssigner? assigner = null,
                            Func<DateTime>? clock = null, TimeSpan? slot = null) {
    _tables = tables.OrderBy(t => t.Id, StringComparer.Ordinal).ToList();
    if (_tables.Count == 0) throw new ArgumentException("need at least one table");
    _assigner = assigner ?? new BestFitAssigner();
    _clock = clock ?? (() => DateTime.Now);
    _slot = slot ?? TimeSpan.FromMinutes(90);
  }

  public void AddObserver(IReservationObserver o) { lock (_gate) _observers.Add(o); }

  public Reservation Reserve(string customer, int partySize, DateTime start) {
    Validate(partySize);
    lock (_gate) {
      var end = start + _slot;
      var table = _assigner.Choose(FreeTables(start, end), partySize)
        ?? throw new NoTableAvailableException("no table fits that party at that time");
      var r = new Reservation { Id = NextId("R"), Customer = customer, PartySize = partySize, Start = start,
                                End = end, TableId = table.Id, Status = ReservationStatus.Confirmed };
      _reservations[r.Id] = r;
      Emit(EventType.Confirmed, r);
      return r;
    }
  }

  public Reservation Modify(string id, DateTime? newStart = null, int? newPartySize = null) {
    lock (_gate) {
      var r = Active(id);
      var start = newStart ?? r.Start;
      var party = newPartySize ?? r.PartySize;
      Validate(party);
      var end = start + _slot;
      var table = _assigner.Choose(FreeTables(start, end, r.Id), party) // exclude itself
        ?? throw new NoTableAvailableException("cannot modify: original booking kept");
      r.Start = start; r.End = end; r.PartySize = party; r.TableId = table.Id; // only after success
      Emit(EventType.Modified, r);
      return r;
    }
  }

  public void Cancel(string id) {
    lock (_gate) { var r = Active(id); r.Status = ReservationStatus.Cancelled; Emit(EventType.Cancelled, r); }
  }

  public void Complete(string id) {
    lock (_gate) { var r = Active(id); r.Status = ReservationStatus.Completed; Emit(EventType.Completed, r); }
  }

  public WalkInResult WalkIn(string customer, int partySize) {
    Validate(partySize);
    lock (_gate) {
      var now = _clock();
      var end = now + _slot;
      var table = _assigner.Choose(FreeTables(now, end), partySize);
      if (table is not null) {
        var r = new Reservation { Id = NextId("R"), Customer = customer, PartySize = partySize, Start = now,
                                  End = end, TableId = table.Id, Status = ReservationStatus.Seated };
        _reservations[r.Id] = r;
        Emit(EventType.Seated, r);
        return new WalkInResult(r, null);
      }
      var entry = new WaitlistEntry(NextId("W"), customer, partySize, now);
      _waitlist.Add(entry);
      Notify(new ReservationEvent(EventType.Waitlisted, customer, partySize, null, null));
      return new WalkInResult(null, entry);
    }
  }

  public bool LeaveWaitlist(string entryId) {
    lock (_gate) return _waitlist.RemoveAll(e => e.Id == entryId) > 0;
  }

  // FIFO, but a party that cannot fit yet is skipped so smaller parties are not blocked.
  public IReadOnlyList<Reservation> PromoteWaitlist() {
    lock (_gate) {
      var now = _clock();
      var end = now + _slot;
      var seated = new List<Reservation>();
      var remaining = new List<WaitlistEntry>();
      foreach (var e in _waitlist) {
        var table = _assigner.Choose(FreeTables(now, end), e.PartySize);
        if (table is null) { remaining.Add(e); continue; }
        var r = new Reservation { Id = NextId("R"), Customer = e.Customer, PartySize = e.PartySize, Start = now,
                                  End = end, TableId = table.Id, Status = ReservationStatus.Seated };
        _reservations[r.Id] = r;
        seated.Add(r);
      }
      _waitlist = remaining;
      foreach (var r in seated) Emit(EventType.WaitlistSeated, r);
      return seated;
    }
  }

  public IReadOnlyList<WaitlistEntry> Waitlist() { lock (_gate) return _waitlist.ToList(); }

  List<Table> FreeTables(DateTime start, DateTime end, string? excludeId = null) {
    var busy = _reservations.Values
      .Where(r => r.IsActive && r.Id != excludeId && r.Overlaps(start, end))
      .Select(r => r.TableId).ToHashSet();
    return _tables.Where(t => !busy.Contains(t.Id)).ToList();
  }

  Reservation Active(string id) =>
    _reservations.TryGetValue(id, out var r) && r.IsActive ? r : throw new KeyNotFoundException("unknown or inactive reservation");

  string NextId(string p) => p + (++_seq);

  static void Validate(int n) {
    if (n < 1 || n > MaxParty) throw new ArgumentOutOfRangeException(nameof(n), "party size must be 1..8");
  }

  void Emit(EventType t, Reservation r) => Notify(new ReservationEvent(t, r.Customer, r.PartySize, r.TableId, r.Id));

  void Notify(ReservationEvent ev) {
    foreach (var o in _observers.ToList()) { // copy: observers may call back in
      try { o.OnEvent(ev); } catch (Exception) { }
    }
  }
}

public sealed class StaffNotifier : IReservationObserver {
  readonly Action<string> _sink;
  public StaffNotifier(Action<string> sink) { _sink = sink; }
  public void OnEvent(ReservationEvent e) =>
    _sink($"[{e.Type}] {e.Customer} (party of {e.PartySize})" + (e.TableId is null ? "" : $" at table {e.TableId}"));
}

public sealed class WaitlistObserver : IReservationObserver {
  readonly ReservationService _service;
  public WaitlistObserver(ReservationService service) { _service = service; }
  public void OnEvent(ReservationEvent e) {
    if (e.Type is EventType.Cancelled or EventType.Completed or EventType.Modified)
      _service.PromoteWaitlist();
  }
}
`

export const restaurantTableReservationSolution: ProblemSolution = {
  slug: 'restaurant-table-reservation',
  title: 'Restaurant Table Reservation - Solution',
  overview: {
    introduction:
      'Design a reservation system for a restaurant with tables of capacity 2, 4, 6 and 8. Guests can book a date, time and party size; walk-ins are seated immediately or placed on a waitlist; reservations can be cancelled or modified; each party gets the smallest table that fits; and staff are notified of changes. The interview focuses on a clean availability model (time-slot overlap), a swappable best-fit assignment strategy, atomic modify, and an Observer that promotes the waitlist when capacity frees up.',
    constraints: [
      'Table capacities are fixed to 2, 4, 6 or 8; a party is never seated at a table that is too small.',
      'A table cannot be double-booked: reservation intervals on the same table must not overlap.',
      'Assignment uses best fit - the smallest free table with capacity ≥ party size.',
      'Walk-ins who cannot be seated are queued and seated automatically when a suitable table frees up.',
      'Cancelling or modifying must keep state consistent and notify staff.',
    ],
    assumptions: [
      'Every reservation occupies a table for a fixed slot (90 minutes by default); the slot length is configurable.',
      'Maximum party size is 8; larger groups (joined tables) are an extension.',
      'Waitlist promotion is FIFO, but a party that cannot fit yet is skipped so smaller parties are not blocked.',
      'A walk-in must not take a table that is reserved for a future booking overlapping its slot.',
      'Notification delivery (SMS/push) is abstracted behind an observer; the sample just records or prints messages.',
    ],
    clarificationQuestions: [
      'How long does a party occupy a table - fixed, or based on party size?',
      'Can tables be combined for parties larger than 8?',
      'Is the waitlist strictly FIFO, or can we seat a smaller party ahead of a larger one?',
      'If a modification cannot be satisfied, should we keep the old booking or cancel it?',
      'Who gets notified (staff, guests, both) and about which events?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Start with the scarce resource: tables over time. A table is available for a request iff no active reservation on it overlaps the requested interval. Everything else - best fit, modify, waitlist - builds on a single availability query. Then identify what varies (placement policy) and who needs to react to state changes (staff, waitlist), which are Strategy and Observer.',
    breakdown: [
      'Model Table(id, capacity) and Reservation(table, interval, party, status).',
      'Write one availability function: free tables for [start, end), optionally excluding a booking being modified.',
      'Put placement behind TableAssigner; implement BestFitAssigner (min capacity ≥ party).',
      'Implement reserve/cancel/modify with state transitions and validation.',
      'Handle walk-ins: try to seat now, otherwise enqueue on a waitlist.',
      'Publish domain events; StaffNotifier and WaitlistObserver subscribe.',
    ],
    entities: [
      { name: 'ReservationService', responsibility: 'Facade: owns tables, bookings and waitlist; enforces availability and publishes events.' },
      { name: 'Table', responsibility: 'Identity and capacity (2/4/6/8), validated at creation.' },
      { name: 'Reservation', responsibility: 'Party, time interval, assigned table, status; overlap and active checks.' },
      { name: 'WaitlistEntry', responsibility: 'A walk-in party waiting for a table, ordered by arrival.' },
      { name: 'TableAssigner / BestFitAssigner', responsibility: 'Placement strategy among already-free tables.' },
      { name: 'ReservationObserver', responsibility: 'Callback for domain events.' },
      { name: 'StaffNotifier / WaitlistObserver', responsibility: 'Notify staff; promote waiting parties when capacity frees.' },
    ],
    relationships: [
      'ReservationService composes Tables, Reservations and WaitlistEntries.',
      'ReservationService aggregates one TableAssigner (Strategy) and many ReservationObservers.',
      'BestFitAssigner realizes TableAssigner; StaffNotifier and WaitlistObserver realize ReservationObserver.',
      'WaitlistObserver references the service so it can call promoteWaitlist().',
      'Reservation depends on ReservationStatus; observers receive immutable ReservationEvent values.',
    ],
    patternsAndOop: [
      'Strategy: TableAssigner makes placement policy swappable (best fit, VIP, section-based).',
      'Observer: reservation lifecycle events fan out to staff notifications and waitlist promotion.',
      'Facade: ReservationService is the single entry point for callers.',
      'Encapsulation: only the service changes reservation status and table assignment.',
      'Atomic update: modify computes the new placement first and mutates only on success.',
    ],
    stepByStep: [
      'Clarify slot length, max party size, waitlist fairness and notification expectations.',
      'Define Table, Reservation, WaitlistEntry, status and event types.',
      'Implement freeTables(start, end, exclude) using half-open interval overlap.',
      'Implement BestFitAssigner and plug it into reserve().',
      'Implement cancel/complete (free capacity) and modify (re-assign excluding self).',
      'Add walkIn + waitlist and the WaitlistObserver; discuss concurrency and extensions.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Availability is derived from reservations rather than stored on tables, so there is one source of truth. Placement is a Strategy over the free tables, and state changes are broadcast as events. The waitlist observer closes the loop: any cancel, completion or modification that may free a table triggers a fair promotion pass.',
    classResponsibilities: [
      { name: 'ReservationService', responsibility: 'Validation, availability query, state transitions, waitlist queue, event publication.' },
      { name: 'Table', responsibility: 'Immutable capacity-checked table.' },
      { name: 'Reservation', responsibility: 'Mutable booking with half-open interval overlap logic.' },
      { name: 'BestFitAssigner', responsibility: 'Smallest sufficient capacity, deterministic tie-break by id.' },
      { name: 'WaitlistObserver', responsibility: 'Reacts to CANCELLED / COMPLETED / MODIFIED by promoting waiting parties.' },
      { name: 'StaffNotifier', responsibility: 'Turns events into staff-facing messages.' },
    ],
    interfacesAndAbstractions: [
      'TableAssigner isolates the placement policy from booking mechanics.',
      'ReservationObserver decouples the service from notification and waitlist concerns.',
      'ReservationEvent is an immutable DTO, so observers cannot corrupt service state.',
    ],
    relationships: [
      'Composition Service→Table/Reservation/WaitlistEntry: lifetimes are owned by the service.',
      'Aggregation Service→Assigner/Observers: injected collaborators.',
      'Association WaitlistObserver→Service: the observer calls back to promote.',
      'Dependency Reservation→Status and observers→Event.',
    ],
    solid: [
      'SRP: placement, notification and booking rules live in different classes.',
      'OCP: add a new assigner or observer without editing the service.',
      'LSP: any TableAssigner must return a table from the given free list that satisfies capacity ≥ party (or nothing).',
      'ISP: observers implement a single onEvent method.',
      'DIP: ReservationService depends on the TableAssigner and ReservationObserver abstractions and an injected clock.',
    ],
    patterns: [
      { name: 'Strategy', why: 'Swap best-fit for other policies without touching reserve/modify.' },
      { name: 'Observer', why: 'Notify staff and promote the waitlist without coupling them to booking code.' },
      { name: 'Facade', why: 'Simple API over availability, assignment, waitlist and events.' },
    ],
    decisions: [
      {
        decision: 'Derive table availability from reservations instead of storing a per-table calendar.',
        rationale: 'No duplicated state to keep in sync; modify simply excludes the booking being moved.',
        tradeoff: 'Availability scan is O(R); index reservations per table (sorted intervals) for large histories.',
      },
      {
        decision: 'Best fit as the default policy behind a Strategy.',
        rationale: 'Minimizes wasted seats and keeps large tables available for large parties.',
        tradeoff: 'Can fragment capacity over a day; an optimizer or lookahead could pack better.',
      },
      {
        decision: 'Modify is atomic: find a new placement first, then mutate.',
        rationale: 'The guest never loses their original booking if the change is impossible.',
        tradeoff: 'A move to the same time but a different table frees the old table only after success.',
      },
      {
        decision: 'Waitlist promotion skips parties that cannot fit yet.',
        rationale: 'Improves utilization; a party of 2 should not wait behind a party of 8 when a 2-top frees.',
        tradeoff: 'Slightly less strict fairness; configurable by swapping the promotion policy.',
      },
    ],
    extensibility:
      'Joined tables: introduce a TableGroup that the assigner can return for large parties. Duration by party size: replace the fixed slot with a DurationPolicy. Guest notifications: add another observer. Priority/VIP: new assigner or a priority-aware waitlist.',
  },
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    steps: [
      'reserve(): validate party → compute [start, start+slot) → collect free tables → BestFit chooses → store CONFIRMED → emit event.',
      'walkIn(): same availability check for [now, now+slot); seat immediately (SEATED) or append to the waitlist and emit WAITLISTED.',
      'cancel()/complete(): mark the booking inactive, which frees its table for overlapping queries, and emit an event.',
      'WaitlistObserver sees CANCELLED/COMPLETED/MODIFIED and calls promoteWaitlist(), which seats fitting parties FIFO.',
      'modify(): recompute availability excluding the booking itself; mutate only if a table is found, otherwise raise and keep the original.',
    ],
    examples: [
      {
        title: 'Best-fit assignment',
        input: 'Tables T1(2), T2(4), T3(4), T4(8); reserve("Asha", 3, 19:30)',
        output: 'Reservation{table=T2, 19:30-21:00}',
        explanation:
          'Free tables with capacity ≥ 3 are T2, T3 and T4; the smallest capacity is 4 and the tie breaks to T2. The 8-top stays available for large parties.',
      },
      {
        title: 'Waitlist promotion after a cancellation',
        input: 'Cara (party of 4) walks in when all 4-tops are booked, then Asha cancels her 4-top booking',
        output: 'WAITLISTED event for Cara, then CANCELLED → WAITLIST_SEATED at the freed table',
        explanation:
          'The cancellation event triggers WaitlistObserver, which calls promoteWaitlist(); Cara fits the freed table for [now, now+slot) and is seated. Staff are notified of both events.',
      },
    ],
  },
  followUps: [
    {
      question: 'How do you prevent double-booking under concurrent requests?',
      answer:
        'Make check-then-insert atomic. The sample uses one service lock. At scale, lock per table (or per restaurant) and re-check overlap inside the lock, or use a database constraint/exclusion on (table, time range) with optimistic retry.',
    },
    {
      question: 'How would you support combining tables for larger parties?',
      answer:
        'Model TableGroup as a composite of adjacent tables with combined capacity and let the assigner return a Table or a group. Availability requires all members to be free for the interval.',
    },
    {
      question: 'Why is best fit not always optimal?',
      answer:
        'It is greedy: placing a 2 at a 2-top can block a later 2 that would have fit nowhere else. For better packing, use interval scheduling heuristics or solve a small assignment problem for the evening’s bookings.',
    },
    {
      question: 'How do you make the waitlist fair?',
      answer:
        'Strict FIFO blocks small parties behind a large one. The sample skips non-fitting parties; you can add an aging rule (if a party waited longer than X, reserve the next fitting table for it).',
    },
    {
      question: 'How would you make availability queries faster?',
      answer:
        'Keep reservations per table in a sorted structure (interval tree or sorted list by start). Overlap check becomes O(log n); free-table collection is O(T log n).',
    },
    {
      question: 'How do you notify guests when their waitlist table is ready?',
      answer:
        'Add a GuestNotifier observer that handles WAITLIST_SEATED events and calls an SMS/push gateway asynchronously with retries, so slow notification never blocks booking.',
    },
  ],
  extras: {
    edgeCases: [
      'Back-to-back bookings: one ending at 20:30 and one starting at 20:30 must not conflict (half-open intervals).',
      'Party size outside 1-8 or a table with an invalid capacity.',
      'Modifying to the same time keeps the same table when it is still the best fit (self excluded).',
      'Cancelling an already cancelled or completed reservation.',
      'Waitlisted party whose size no free table can ever satisfy.',
      'Walk-in colliding with an upcoming reservation on the best-fit table.',
    ],
    commonMistakes: [
      'Storing a boolean "occupied" on Table instead of deriving availability from time intervals.',
      'Treating end times as inclusive, which rejects back-to-back bookings.',
      'Mutating the reservation before confirming a new table exists in modify.',
      'Doing waitlist promotion inside cancel() instead of via an observer, coupling unrelated concerns.',
      'Picking the first fitting table instead of the best fit.',
    ],
    complexity:
      'Availability query is O(R) for R active reservations (O(T log n) with per-table interval indexes). Best fit is O(T). Waitlist promotion is O(W × (R + T)) for W waiting parties.',
    testing: [
      'Best-fit table tests: party sizes 1-8 against mixed free sets and tie-breaks.',
      'Interval tests: overlap, adjacent and nested bookings on the same table.',
      'Modify success keeps one booking; modify failure leaves the original untouched.',
      'Waitlist: cancel triggers promotion, skip logic seats smaller parties first when needed.',
      'Observer tests with a recording fake; faulty observer does not break booking.',
    ],
    extensions: [
      'Joined tables, sections and seating preferences.',
      'Duration based on party size or menu.',
      'Guest-facing notifications and no-show handling.',
      'Overbooking policy and deposits.',
    ],
    takeaways: [
      'Availability = no overlapping active reservation on the table.',
      'Best fit is a Strategy over free tables.',
      'Use Observer to connect cancellations to waitlist promotion and staff alerts.',
      'Make modify atomic.',
    ],
  },
}
