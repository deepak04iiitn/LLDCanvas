import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('bs', 'BookingService', 40, 40, [
    attr('-', 'rooms', 'Map<string, Room>'),
    attr('-', 'bookingIndex', 'Map<string, Booking>'),
    attr('-', 'lock', 'Lock'),
  ], [
    method('+', 'findAvailableRooms', 'interval, minCapacity', 'List<Room>'),
    method('+', 'book', 'roomId, organizer, title, interval, attendees', 'Booking'),
    method('+', 'bookRecurring', '…, recurrence: Recurrence', 'List<Booking>'),
    method('+', 'cancel', 'bookingId: string', 'bool'),
    method('+', 'cancelSeries', 'seriesId: string', 'int'),
    method('+', 'daySchedule', 'roomId, day: Date', 'List<Booking>'),
  ], 'facade'),
  cls('rm', 'Room', 420, 20, [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'capacity', 'int'),
    attr('-', 'bookings', 'List<Booking> (sorted by start)'),
  ], [
    method('+', 'isFree', 'interval: TimeInterval', 'bool'),
    method('+', 'add', 'booking: Booking', 'void'),
    method('+', 'remove', 'bookingId: string', 'bool'),
    method('+', 'overlapping', 'interval: TimeInterval', 'List<Booking>'),
    method('-', 'lowerBound', 'start: Time', 'int'),
  ]),
  cls('bk', 'Booking', 420, 290, [
    attr('-', 'id', 'string'),
    attr('-', 'roomId', 'string'),
    attr('-', 'organizer', 'string'),
    attr('-', 'title', 'string'),
    attr('-', 'interval', 'TimeInterval'),
    attr('-', 'attendees', 'int'),
    attr('-', 'seriesId', 'string?'),
  ], []),
  cls('ti', 'TimeInterval', 780, 40, [
    attr('-', 'start', 'Time'),
    attr('-', 'end', 'Time (exclusive)'),
  ], [
    method('+', 'overlaps', 'other: TimeInterval', 'bool'),
  ], 'value object'),
  cls('rc', 'Recurrence', 780, 230, [
    attr('-', 'frequency', 'Frequency'),
    attr('-', 'every', 'int'),
    attr('-', 'occurrences', 'int'),
  ], [
    method('+', 'expand', 'base: TimeInterval', 'List<TimeInterval>'),
  ]),
  enm('fq', 'Frequency', 780, 420, ['DAILY', 'WEEKLY']),
]

const edges = [
  edge('e1', 'bs', 'rm', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1..*' }),
  edge('e2', 'rm', 'bk', 'aggregation', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'sorted by start' }),
  edge('e3', 'bk', 'ti', 'composition', 'right', 'bottom', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e4', 'rm', 'ti', 'dependency', 'right', 'left', { label: 'checks overlap' }),
  edge('e5', 'bs', 'rc', 'dependency', 'bottom', 'left', { label: 'expands' }),
  edge('e6', 'rc', 'fq', 'dependency', 'bottom', 'top'),
  edge('e7', 'bs', 'bk', 'association', 'bottom@40', 'left', { label: 'indexes by id' }),
]

const py = `from __future__ import annotations
import threading
import uuid
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from enum import Enum
from typing import Dict, List, Optional


class BookingError(Exception):
    pass


class RoomNotFoundError(BookingError):
    pass


class BookingConflictError(BookingError):
    pass


class CapacityExceededError(BookingError):
    pass


@dataclass(frozen=True)
class TimeInterval:
    """Half-open [start, end): back-to-back meetings do not conflict."""
    start: datetime
    end: datetime

    def __post_init__(self) -> None:
        if not self.start < self.end:
            raise ValueError("start must be before end")

    def overlaps(self, other: "TimeInterval") -> bool:
        return self.start < other.end and other.start < self.end


class Frequency(Enum):
    DAILY = 1
    WEEKLY = 7


@dataclass(frozen=True)
class Recurrence:
    frequency: Frequency
    occurrences: int
    every: int = 1

    def expand(self, base: TimeInterval) -> List[TimeInterval]:
        if not 1 <= self.occurrences <= 366 or self.every < 1:
            raise ValueError("invalid recurrence")
        step = timedelta(days=self.frequency.value * self.every)
        if base.end - base.start > step:
            raise ValueError("meeting is longer than the recurrence step")
        return [TimeInterval(base.start + step * i, base.end + step * i)
                for i in range(self.occurrences)]


@dataclass(frozen=True)
class Booking:
    id: str
    room_id: str
    organizer: str
    title: str
    interval: TimeInterval
    attendees: int
    series_id: Optional[str] = None


class Room:
    """Keeps bookings sorted by start. Because they never overlap, ends are sorted too,
    so a new interval can only conflict with its immediate neighbours."""

    def __init__(self, room_id: str, name: str, capacity: int):
        if capacity < 1:
            raise ValueError("capacity must be >= 1")
        self.id, self.name, self.capacity = room_id, name, capacity
        self._bookings: List[Booking] = []

    def _lower_bound(self, start: datetime) -> int:
        """First index whose booking starts at or after 'start' (binary search)."""
        lo, hi = 0, len(self._bookings)
        while lo < hi:
            mid = (lo + hi) // 2
            if self._bookings[mid].interval.start < start:
                lo = mid + 1
            else:
                hi = mid
        return lo

    def is_free(self, iv: TimeInterval) -> bool:
        i = self._lower_bound(iv.start)
        if i > 0 and self._bookings[i - 1].interval.end > iv.start:
            return False  # previous meeting runs into us
        if i < len(self._bookings) and self._bookings[i].interval.start < iv.end:
            return False  # next meeting starts before we end
        return True

    def add(self, booking: Booking) -> None:
        if not self.is_free(booking.interval):
            raise BookingConflictError("room %s is not free" % self.id)
        self._bookings.insert(self._lower_bound(booking.interval.start), booking)

    def remove(self, booking_id: str) -> bool:
        for i, b in enumerate(self._bookings):
            if b.id == booking_id:
                del self._bookings[i]
                return True
        return False

    def overlapping(self, iv: TimeInterval) -> List[Booking]:
        i = self._lower_bound(iv.start)
        if i > 0 and self._bookings[i - 1].interval.end > iv.start:
            i -= 1
        out: List[Booking] = []
        while i < len(self._bookings) and self._bookings[i].interval.start < iv.end:
            out.append(self._bookings[i])
            i += 1
        return out


class BookingService:
    def __init__(self, rooms: List[Room]):
        self._rooms: Dict[str, Room] = {r.id: r for r in rooms}
        self._index: Dict[str, Booking] = {}
        self._lock = threading.Lock()

    def find_available_rooms(self, interval: TimeInterval, min_capacity: int = 1) -> List[Room]:
        with self._lock:
            fits = [r for r in self._rooms.values()
                    if r.capacity >= min_capacity and r.is_free(interval)]
        return sorted(fits, key=lambda r: (r.capacity, r.id))  # best fit first

    def book(self, room_id: str, organizer: str, title: str,
             interval: TimeInterval, attendees: int = 1) -> Booking:
        return self._book_all(room_id, organizer, title, [interval], attendees, None)[0]

    def book_recurring(self, room_id: str, organizer: str, title: str, interval: TimeInterval,
                       recurrence: Recurrence, attendees: int = 1) -> List[Booking]:
        """All-or-nothing: every instance is checked before any is stored."""
        return self._book_all(room_id, organizer, title, recurrence.expand(interval),
                              attendees, str(uuid.uuid4()))

    def cancel(self, booking_id: str) -> bool:
        with self._lock:
            booking = self._index.pop(booking_id, None)
            return booking is not None and self._rooms[booking.room_id].remove(booking_id)

    def cancel_series(self, series_id: str) -> int:
        with self._lock:
            ids = [b.id for b in self._index.values() if b.series_id == series_id]
            for bid in ids:
                self._rooms[self._index.pop(bid).room_id].remove(bid)
            return len(ids)

    def day_schedule(self, room_id: str, day: date) -> List[Booking]:
        start = datetime.combine(day, time.min, tzinfo=timezone.utc)
        window = TimeInterval(start, start + timedelta(days=1))
        with self._lock:
            return self._room(room_id).overlapping(window)

    # ---- internals ----
    def _room(self, room_id: str) -> Room:
        room = self._rooms.get(room_id)
        if room is None:
            raise RoomNotFoundError(room_id)
        return room

    def _book_all(self, room_id, organizer, title, intervals, attendees, series_id) -> List[Booking]:
        with self._lock:
            room = self._room(room_id)
            if not 1 <= attendees <= room.capacity:
                raise CapacityExceededError("room %s holds %d" % (room.id, room.capacity))
            for iv in intervals:
                if not room.is_free(iv):
                    raise BookingConflictError("conflict at %s" % iv.start.isoformat())
            created = [Booking(str(uuid.uuid4()), room.id, organizer, title, iv, attendees, series_id)
                       for iv in intervals]
            for b in created:
                room.add(b)
                self._index[b.id] = b
            return created


def demo() -> None:
    def at(d: int, h: int) -> datetime:
        return datetime(2026, 1, d, h, tzinfo=timezone.utc)

    svc = BookingService([Room("r1", "Focus", 4), Room("r2", "Board", 12)])
    svc.book("r1", "ann", "Standup", TimeInterval(at(5, 9), at(5, 10)), 3)
    print([r.id for r in svc.find_available_rooms(TimeInterval(at(5, 9), at(5, 10)), 3)])  # ['r2']
    try:
        svc.book("r1", "bob", "Clash", TimeInterval(at(5, 9), at(5, 11)))
    except BookingConflictError as e:
        print("rejected:", e)
    series = svc.book_recurring("r2", "cat", "Weekly sync", TimeInterval(at(6, 14), at(6, 15)),
                                Recurrence(Frequency.WEEKLY, 3), 8)
    print([b.interval.start.date().isoformat() for b in series])
    print([b.title for b in svc.day_schedule("r1", date(2026, 1, 5))])
    print("cancelled series:", svc.cancel_series(series[0].series_id))


if __name__ == "__main__":
    demo()
`

const java = `import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

class BookingException extends RuntimeException {
  BookingException(String m) { super(m); }
}
class RoomNotFoundException extends BookingException { RoomNotFoundException(String id) { super("room not found: " + id); } }
class BookingConflictException extends BookingException { BookingConflictException(String m) { super(m); } }
class CapacityExceededException extends BookingException { CapacityExceededException(String m) { super(m); } }

/** Half-open [start, end): back-to-back meetings do not conflict. */
record TimeInterval(Instant start, Instant end) {
  TimeInterval {
    if (!start.isBefore(end)) throw new IllegalArgumentException("start must be before end");
  }
  boolean overlaps(TimeInterval o) { return start.isBefore(o.end) && o.start.isBefore(end); }
}

enum Frequency {
  DAILY(1), WEEKLY(7);
  final int days;
  Frequency(int days) { this.days = days; }
}

record Recurrence(Frequency frequency, int occurrences, int every) {
  List<TimeInterval> expand(TimeInterval base) {
    if (occurrences < 1 || occurrences > 366 || every < 1) throw new IllegalArgumentException("invalid recurrence");
    Duration step = Duration.ofDays((long) frequency.days * every);
    if (Duration.between(base.start(), base.end()).compareTo(step) > 0)
      throw new IllegalArgumentException("meeting is longer than the recurrence step");
    List<TimeInterval> out = new ArrayList<>();
    for (int i = 0; i < occurrences; i++) {
      Duration shift = step.multipliedBy(i);
      out.add(new TimeInterval(base.start().plus(shift), base.end().plus(shift)));
    }
    return out;
  }
}

record Booking(String id, String roomId, String organizer, String title,
               TimeInterval interval, int attendees, String seriesId) {}

/** Bookings sorted by start. They never overlap, so ends are sorted too and a new
 *  interval can only conflict with its immediate neighbours. Guarded by the service lock. */
class Room {
  final String id, name; final int capacity;
  private final List<Booking> bookings = new ArrayList<>();

  Room(String id, String name, int capacity) {
    if (capacity < 1) throw new IllegalArgumentException("capacity must be >= 1");
    this.id = id; this.name = name; this.capacity = capacity;
  }

  private int lowerBound(Instant start) {
    int lo = 0, hi = bookings.size();
    while (lo < hi) {
      int mid = (lo + hi) >>> 1;
      if (bookings.get(mid).interval().start().isBefore(start)) lo = mid + 1; else hi = mid;
    }
    return lo;
  }

  boolean isFree(TimeInterval iv) {
    int i = lowerBound(iv.start());
    if (i > 0 && bookings.get(i - 1).interval().end().isAfter(iv.start())) return false;
    if (i < bookings.size() && bookings.get(i).interval().start().isBefore(iv.end())) return false;
    return true;
  }

  void add(Booking b) {
    if (!isFree(b.interval())) throw new BookingConflictException("room " + id + " is not free");
    bookings.add(lowerBound(b.interval().start()), b);
  }

  boolean remove(String bookingId) { return bookings.removeIf(b -> b.id().equals(bookingId)); }

  List<Booking> overlapping(TimeInterval iv) {
    int i = lowerBound(iv.start());
    if (i > 0 && bookings.get(i - 1).interval().end().isAfter(iv.start())) i--;
    List<Booking> out = new ArrayList<>();
    for (; i < bookings.size() && bookings.get(i).interval().start().isBefore(iv.end()); i++)
      out.add(bookings.get(i));
    return out;
  }
}

class BookingService {
  private final Map<String, Room> rooms = new LinkedHashMap<>();
  private final Map<String, Booking> index = new HashMap<>();

  BookingService(List<Room> rooms) { for (Room r : rooms) this.rooms.put(r.id, r); }

  synchronized List<Room> findAvailableRooms(TimeInterval iv, int minCapacity) {
    return rooms.values().stream()
        .filter(r -> r.capacity >= minCapacity && r.isFree(iv))
        .sorted(Comparator.<Room>comparingInt(r -> r.capacity).thenComparing(r -> r.id)) // best fit first
        .collect(Collectors.toList());
  }

  Booking book(String roomId, String organizer, String title, TimeInterval iv, int attendees) {
    return bookAll(roomId, organizer, title, List.of(iv), attendees, null).get(0);
  }

  /** All-or-nothing: every instance is validated before any is stored. */
  List<Booking> bookRecurring(String roomId, String organizer, String title,
                              TimeInterval iv, Recurrence rule, int attendees) {
    return bookAll(roomId, organizer, title, rule.expand(iv), attendees, UUID.randomUUID().toString());
  }

  synchronized boolean cancel(String bookingId) {
    Booking b = index.remove(bookingId);
    return b != null && rooms.get(b.roomId()).remove(bookingId);
  }

  synchronized int cancelSeries(String seriesId) {
    List<Booking> victims = index.values().stream()
        .filter(b -> seriesId.equals(b.seriesId())).collect(Collectors.toList());
    for (Booking b : victims) { index.remove(b.id()); rooms.get(b.roomId()).remove(b.id()); }
    return victims.size();
  }

  synchronized List<Booking> daySchedule(String roomId, LocalDate day) {
    Instant start = day.atStartOfDay(ZoneOffset.UTC).toInstant();
    return room(roomId).overlapping(new TimeInterval(start, start.plus(Duration.ofDays(1))));
  }

  private Room room(String id) {
    Room r = rooms.get(id);
    if (r == null) throw new RoomNotFoundException(id);
    return r;
  }

  private synchronized List<Booking> bookAll(String roomId, String organizer, String title,
                                             List<TimeInterval> intervals, int attendees, String seriesId) {
    Room room = room(roomId);
    if (attendees < 1 || attendees > room.capacity)
      throw new CapacityExceededException("room " + room.id + " holds " + room.capacity);
    for (TimeInterval iv : intervals)
      if (!room.isFree(iv)) throw new BookingConflictException("conflict at " + iv.start());
    List<Booking> created = new ArrayList<>();
    for (TimeInterval iv : intervals)
      created.add(new Booking(UUID.randomUUID().toString(), room.id, organizer, title, iv, attendees, seriesId));
    for (Booking b : created) { room.add(b); index.put(b.id(), b); }
    return created;
  }
}

class Demo {
  static Instant at(int day, int hour) { return LocalDateTime.of(2026, 1, day, hour, 0).toInstant(ZoneOffset.UTC); }

  public static void main(String[] args) {
    BookingService svc = new BookingService(List.of(new Room("r1", "Focus", 4), new Room("r2", "Board", 12)));
    svc.book("r1", "ann", "Standup", new TimeInterval(at(5, 9), at(5, 10)), 3);
    System.out.println(svc.findAvailableRooms(new TimeInterval(at(5, 9), at(5, 10)), 3).stream().map(r -> r.id).toList());
    try { svc.book("r1", "bob", "Clash", new TimeInterval(at(5, 9), at(5, 11)), 1); }
    catch (BookingConflictException e) { System.out.println("rejected: " + e.getMessage()); }
    List<Booking> series = svc.bookRecurring("r2", "cat", "Weekly sync",
        new TimeInterval(at(6, 14), at(6, 15)), new Recurrence(Frequency.WEEKLY, 3, 1), 8);
    series.forEach(b -> System.out.println(b.interval().start()));
    System.out.println(svc.daySchedule("r1", LocalDate.of(2026, 1, 5)).size());
    System.out.println("cancelled: " + svc.cancelSeries(series.get(0).seriesId()));
  }
}
`

const ts = `class BookingError extends Error {}
class RoomNotFoundError extends BookingError {
  constructor(id: string) { super('room not found: ' + id) }
}
class BookingConflictError extends BookingError {}
class CapacityExceededError extends BookingError {}

/** Half-open [start, end): back-to-back meetings do not conflict. */
class TimeInterval {
  readonly start: number // epoch ms
  readonly end: number
  constructor(start: Date | number, end: Date | number) {
    this.start = +start
    this.end = +end
    if (!(this.start < this.end)) throw new Error('start must be before end')
  }
  overlaps(o: TimeInterval): boolean { return this.start < o.end && o.start < this.end }
}

type Frequency = 'DAILY' | 'WEEKLY'
const DAY_MS = 24 * 60 * 60 * 1000

class Recurrence {
  constructor(
    public readonly frequency: Frequency,
    public readonly occurrences: number,
    public readonly every = 1,
  ) {}

  expand(base: TimeInterval): TimeInterval[] {
    if (this.occurrences < 1 || this.occurrences > 366 || this.every < 1) throw new Error('invalid recurrence')
    const step = (this.frequency === 'WEEKLY' ? 7 : 1) * this.every * DAY_MS
    if (base.end - base.start > step) throw new Error('meeting is longer than the recurrence step')
    return Array.from({ length: this.occurrences }, (_, i) =>
      new TimeInterval(base.start + step * i, base.end + step * i))
  }
}

interface Booking {
  readonly id: string
  readonly roomId: string
  readonly organizer: string
  readonly title: string
  readonly interval: TimeInterval
  readonly attendees: number
  readonly seriesId?: string
}

/** Bookings sorted by start. They never overlap, so ends are sorted too and a new
 *  interval can only conflict with its immediate neighbours. */
class Room {
  private bookings: Booking[] = []
  constructor(public readonly id: string, public readonly name: string, public readonly capacity: number) {
    if (capacity < 1) throw new Error('capacity must be >= 1')
  }

  /** First index whose booking starts at or after 'start' (binary search). */
  private lowerBound(start: number): number {
    let lo = 0, hi = this.bookings.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (this.bookings[mid].interval.start < start) lo = mid + 1
      else hi = mid
    }
    return lo
  }

  isFree(iv: TimeInterval): boolean {
    const i = this.lowerBound(iv.start)
    if (i > 0 && this.bookings[i - 1].interval.end > iv.start) return false
    if (i < this.bookings.length && this.bookings[i].interval.start < iv.end) return false
    return true
  }

  add(b: Booking): void {
    if (!this.isFree(b.interval)) throw new BookingConflictError('room ' + this.id + ' is not free')
    this.bookings.splice(this.lowerBound(b.interval.start), 0, b)
  }

  remove(bookingId: string): boolean {
    const i = this.bookings.findIndex(b => b.id === bookingId)
    if (i < 0) return false
    this.bookings.splice(i, 1)
    return true
  }

  overlapping(iv: TimeInterval): Booking[] {
    let i = this.lowerBound(iv.start)
    if (i > 0 && this.bookings[i - 1].interval.end > iv.start) i--
    const out: Booking[] = []
    for (; i < this.bookings.length && this.bookings[i].interval.start < iv.end; i++) out.push(this.bookings[i])
    return out
  }
}

class BookingService {
  private rooms = new Map<string, Room>()
  private index = new Map<string, Booking>()

  constructor(rooms: Room[]) { rooms.forEach(r => this.rooms.set(r.id, r)) }

  findAvailableRooms(iv: TimeInterval, minCapacity = 1): Room[] {
    return [...this.rooms.values()]
      .filter(r => r.capacity >= minCapacity && r.isFree(iv))
      .sort((a, b) => a.capacity - b.capacity || a.id.localeCompare(b.id)) // best fit first
  }

  book(roomId: string, organizer: string, title: string, iv: TimeInterval, attendees = 1): Booking {
    return this.bookAll(roomId, organizer, title, [iv], attendees)[0]
  }

  /** All-or-nothing: every instance is validated before any is stored. */
  bookRecurring(roomId: string, organizer: string, title: string, iv: TimeInterval,
                rule: Recurrence, attendees = 1): Booking[] {
    return this.bookAll(roomId, organizer, title, rule.expand(iv), attendees, crypto.randomUUID())
  }

  cancel(bookingId: string): boolean {
    const b = this.index.get(bookingId)
    if (!b) return false
    this.index.delete(bookingId)
    return this.rooms.get(b.roomId)!.remove(bookingId)
  }

  cancelSeries(seriesId: string): number {
    const victims = [...this.index.values()].filter(b => b.seriesId === seriesId)
    victims.forEach(b => this.cancel(b.id))
    return victims.length
  }

  daySchedule(roomId: string, day: Date): Booking[] {
    const start = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
    return this.room(roomId).overlapping(new TimeInterval(start, start + DAY_MS))
  }

  private room(id: string): Room {
    const r = this.rooms.get(id)
    if (!r) throw new RoomNotFoundError(id)
    return r
  }

  // JS runs this synchronously, so the check-then-insert below cannot interleave.
  private bookAll(roomId: string, organizer: string, title: string, intervals: TimeInterval[],
                  attendees: number, seriesId?: string): Booking[] {
    const room = this.room(roomId)
    if (attendees < 1 || attendees > room.capacity) {
      throw new CapacityExceededError('room ' + room.id + ' holds ' + room.capacity)
    }
    for (const iv of intervals) {
      if (!room.isFree(iv)) throw new BookingConflictError('conflict at ' + new Date(iv.start).toISOString())
    }
    const created: Booking[] = intervals.map(interval => ({
      id: crypto.randomUUID(), roomId: room.id, organizer, title, interval, attendees, seriesId,
    }))
    for (const b of created) {
      room.add(b)
      this.index.set(b.id, b)
    }
    return created
  }
}

export { BookingService, Room, TimeInterval, Recurrence, BookingConflictError }
export type { Booking, Frequency }
`

const cpp = `#include <algorithm>
#include <chrono>
#include <iostream>
#include <map>
#include <mutex>
#include <stdexcept>
#include <string>
#include <vector>

using Time = std::chrono::system_clock::time_point;
using Hours = std::chrono::hours;

struct BookingError : std::runtime_error { using std::runtime_error::runtime_error; };
struct RoomNotFoundError : BookingError { explicit RoomNotFoundError(const std::string& id) : BookingError("room not found: " + id) {} };
struct BookingConflictError : BookingError { using BookingError::BookingError; };
struct CapacityExceededError : BookingError { using BookingError::BookingError; };

// Half-open [start, end): back-to-back meetings do not conflict.
struct TimeInterval {
  Time start, end;
  TimeInterval(Time s, Time e) : start(s), end(e) {
    if (!(s < e)) throw std::invalid_argument("start must be before end");
  }
  bool overlaps(const TimeInterval& o) const { return start < o.end && o.start < end; }
};

enum class Frequency { Daily, Weekly };

struct Recurrence {
  Frequency frequency;
  int occurrences;
  int every = 1;

  std::vector<TimeInterval> expand(const TimeInterval& base) const {
    if (occurrences < 1 || occurrences > 366 || every < 1) throw std::invalid_argument("invalid recurrence");
    Hours step(24 * every * (frequency == Frequency::Weekly ? 7 : 1));
    if (base.end - base.start > step) throw std::invalid_argument("meeting is longer than the recurrence step");
    std::vector<TimeInterval> out;
    for (int i = 0; i < occurrences; ++i)
      out.emplace_back(base.start + step * i, base.end + step * i);
    return out;
  }
};

struct Booking {
  std::string id, roomId, organizer, title;
  TimeInterval interval;
  int attendees;
  std::string seriesId;  // empty => not part of a series
};

// Bookings sorted by start. They never overlap, so ends are sorted too and a new
// interval can only conflict with its immediate neighbours. Guarded by the service mutex.
class Room {
  std::vector<Booking> bookings_;

  std::vector<Booking>::const_iterator lowerBound(Time start) const {
    return std::lower_bound(bookings_.begin(), bookings_.end(), start,
                            [](const Booking& b, const Time& t) { return b.interval.start < t; });
  }

public:
  std::string id, name;
  int capacity;
  Room(std::string id, std::string name, int capacity)
      : id(std::move(id)), name(std::move(name)), capacity(capacity) {
    if (capacity < 1) throw std::invalid_argument("capacity must be >= 1");
  }

  bool isFree(const TimeInterval& iv) const {
    auto it = lowerBound(iv.start);
    if (it != bookings_.begin() && std::prev(it)->interval.end > iv.start) return false;
    if (it != bookings_.end() && it->interval.start < iv.end) return false;
    return true;
  }

  void add(Booking b) {
    if (!isFree(b.interval)) throw BookingConflictError("room " + id + " is not free");
    auto it = lowerBound(b.interval.start);
    bookings_.insert(it, std::move(b));
  }

  bool remove(const std::string& bookingId) {
    auto it = std::find_if(bookings_.begin(), bookings_.end(),
                           [&](const Booking& b) { return b.id == bookingId; });
    if (it == bookings_.end()) return false;
    bookings_.erase(it);
    return true;
  }

  std::vector<Booking> overlapping(const TimeInterval& iv) const {
    auto it = lowerBound(iv.start);
    if (it != bookings_.begin() && std::prev(it)->interval.end > iv.start) --it;
    std::vector<Booking> out;
    for (; it != bookings_.end() && it->interval.start < iv.end; ++it) out.push_back(*it);
    return out;
  }
};

class BookingService {
  std::map<std::string, Room> rooms_;
  std::map<std::string, Booking> index_;
  std::mutex mu_;
  long long seq_ = 1;

  Room& room(const std::string& id) {
    auto it = rooms_.find(id);
    if (it == rooms_.end()) throw RoomNotFoundError(id);
    return it->second;
  }

  std::vector<Booking> bookAll(const std::string& roomId, const std::string& organizer,
                               const std::string& title, const std::vector<TimeInterval>& intervals,
                               int attendees, const std::string& seriesId) {
    std::lock_guard<std::mutex> lk(mu_);
    Room& r = room(roomId);
    if (attendees < 1 || attendees > r.capacity)
      throw CapacityExceededError("room " + r.id + " holds " + std::to_string(r.capacity));
    for (const auto& iv : intervals)
      if (!r.isFree(iv)) throw BookingConflictError("conflict in room " + r.id);
    std::vector<Booking> created;
    for (const auto& iv : intervals)
      created.push_back(Booking{"b" + std::to_string(seq_++), r.id, organizer, title, iv, attendees, seriesId});
    for (const auto& b : created) { r.add(b); index_.emplace(b.id, b); }
    return created;
  }

public:
  explicit BookingService(std::vector<Room> rooms) {
    for (auto& r : rooms) { std::string id = r.id; rooms_.emplace(id, std::move(r)); }
  }

  std::vector<std::string> findAvailableRooms(const TimeInterval& iv, int minCapacity = 1) {
    std::lock_guard<std::mutex> lk(mu_);
    std::vector<const Room*> fits;
    for (const auto& [id, r] : rooms_)
      if (r.capacity >= minCapacity && r.isFree(iv)) fits.push_back(&r);
    std::sort(fits.begin(), fits.end(), [](const Room* a, const Room* b) {  // best fit first
      return a->capacity != b->capacity ? a->capacity < b->capacity : a->id < b->id;
    });
    std::vector<std::string> ids;
    for (auto* r : fits) ids.push_back(r->id);
    return ids;
  }

  Booking book(const std::string& roomId, const std::string& organizer, const std::string& title,
               const TimeInterval& iv, int attendees = 1) {
    return bookAll(roomId, organizer, title, {iv}, attendees, "").front();
  }

  // All-or-nothing: every instance is validated before any is stored.
  std::vector<Booking> bookRecurring(const std::string& roomId, const std::string& organizer,
                                     const std::string& title, const TimeInterval& iv,
                                     const Recurrence& rule, int attendees = 1) {
    std::string series;
    { std::lock_guard<std::mutex> lk(mu_); series = "s" + std::to_string(seq_++); }
    return bookAll(roomId, organizer, title, rule.expand(iv), attendees, series);
  }

  bool cancel(const std::string& bookingId) {
    std::lock_guard<std::mutex> lk(mu_);
    auto it = index_.find(bookingId);
    if (it == index_.end()) return false;
    bool removed = room(it->second.roomId).remove(bookingId);
    index_.erase(it);
    return removed;
  }

  int cancelSeries(const std::string& seriesId) {
    std::lock_guard<std::mutex> lk(mu_);
    int n = 0;
    for (auto it = index_.begin(); it != index_.end();) {
      if (it->second.seriesId == seriesId) {
        room(it->second.roomId).remove(it->first);
        it = index_.erase(it);
        ++n;
      } else ++it;
    }
    return n;
  }

  // 'dayStart' must be midnight UTC of the requested day.
  std::vector<Booking> daySchedule(const std::string& roomId, Time dayStart) {
    std::lock_guard<std::mutex> lk(mu_);
    return room(roomId).overlapping(TimeInterval(dayStart, dayStart + Hours(24)));
  }
};

static Time at(int day, int hour) {  // 2026-01-<day> <hour>:00 UTC (day 1 = 2026-01-01)
  const long long epoch2026 = 20454;  // days from 1970-01-01 to 2026-01-01
  return Time(std::chrono::duration_cast<Time::duration>(Hours(24 * (epoch2026 + day - 1) + hour)));
}

int main() {
  BookingService svc({Room("r1", "Focus", 4), Room("r2", "Board", 12)});
  svc.book("r1", "ann", "Standup", TimeInterval(at(5, 9), at(5, 10)), 3);
  for (auto& id : svc.findAvailableRooms(TimeInterval(at(5, 9), at(5, 10)), 3)) std::cout << id << "\\n";  // r2
  try { svc.book("r1", "bob", "Clash", TimeInterval(at(5, 9), at(5, 11))); }
  catch (const BookingConflictError& e) { std::cout << "rejected: " << e.what() << "\\n"; }
  auto series = svc.bookRecurring("r2", "cat", "Weekly sync", TimeInterval(at(6, 14), at(6, 15)),
                                  Recurrence{Frequency::Weekly, 3}, 8);
  std::cout << "series size " << series.size() << "\\n";
  std::cout << "day size " << svc.daySchedule("r1", at(5, 0)).size() << "\\n";
  std::cout << "cancelled " << svc.cancelSeries(series.front().seriesId) << "\\n";
}
`

const goCode = `package main

import (
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"
)

var (
	ErrRoomNotFound     = errors.New("room not found")
	ErrConflict         = errors.New("room is not free for that interval")
	ErrCapacityExceeded = errors.New("attendees exceed room capacity")
	ErrBadInterval      = errors.New("start must be before end")
	ErrBadRecurrence    = errors.New("invalid recurrence")
)

// TimeInterval is half-open [Start, End): back-to-back meetings do not conflict.
type TimeInterval struct{ Start, End time.Time }

func NewInterval(start, end time.Time) (TimeInterval, error) {
	if !start.Before(end) {
		return TimeInterval{}, ErrBadInterval
	}
	return TimeInterval{start, end}, nil
}

func (a TimeInterval) Overlaps(b TimeInterval) bool { return a.Start.Before(b.End) && b.Start.Before(a.End) }

type Frequency int

const (
	Daily Frequency = iota
	Weekly
)

type Recurrence struct {
	Frequency   Frequency
	Occurrences int
	Every       int
}

func (r Recurrence) Expand(base TimeInterval) ([]TimeInterval, error) {
	every := r.Every
	if every == 0 {
		every = 1
	}
	if r.Occurrences < 1 || r.Occurrences > 366 || every < 1 {
		return nil, ErrBadRecurrence
	}
	days := every
	if r.Frequency == Weekly {
		days *= 7
	}
	step := time.Duration(days) * 24 * time.Hour
	if base.End.Sub(base.Start) > step {
		return nil, fmt.Errorf("%w: meeting is longer than the step", ErrBadRecurrence)
	}
	out := make([]TimeInterval, 0, r.Occurrences)
	for i := 0; i < r.Occurrences; i++ {
		d := step * time.Duration(i)
		out = append(out, TimeInterval{base.Start.Add(d), base.End.Add(d)})
	}
	return out, nil
}

type Booking struct {
	ID, RoomID, Organizer, Title string
	Interval                     TimeInterval
	Attendees                    int
	SeriesID                     string // empty => one-off
}

// Room keeps bookings sorted by start. They never overlap, so ends are sorted too and a
// new interval can only conflict with its immediate neighbours. Guarded by the service lock.
type Room struct {
	ID, Name string
	Capacity int
	bookings []Booking
}

func (r *Room) lowerBound(start time.Time) int {
	return sort.Search(len(r.bookings), func(i int) bool { return !r.bookings[i].Interval.Start.Before(start) })
}

func (r *Room) IsFree(iv TimeInterval) bool {
	i := r.lowerBound(iv.Start)
	if i > 0 && r.bookings[i-1].Interval.End.After(iv.Start) {
		return false
	}
	if i < len(r.bookings) && r.bookings[i].Interval.Start.Before(iv.End) {
		return false
	}
	return true
}

func (r *Room) add(b Booking) error {
	if !r.IsFree(b.Interval) {
		return ErrConflict
	}
	i := r.lowerBound(b.Interval.Start)
	r.bookings = append(r.bookings, Booking{})
	copy(r.bookings[i+1:], r.bookings[i:])
	r.bookings[i] = b
	return nil
}

func (r *Room) remove(id string) bool {
	for i, b := range r.bookings {
		if b.ID == id {
			r.bookings = append(r.bookings[:i], r.bookings[i+1:]...)
			return true
		}
	}
	return false
}

func (r *Room) overlapping(iv TimeInterval) []Booking {
	i := r.lowerBound(iv.Start)
	if i > 0 && r.bookings[i-1].Interval.End.After(iv.Start) {
		i--
	}
	var out []Booking
	for ; i < len(r.bookings) && r.bookings[i].Interval.Start.Before(iv.End); i++ {
		out = append(out, r.bookings[i])
	}
	return out
}

type BookingService struct {
	mu    sync.Mutex
	rooms map[string]*Room
	index map[string]Booking
}

func NewBookingService(rooms ...*Room) *BookingService {
	s := &BookingService{rooms: map[string]*Room{}, index: map[string]Booking{}}
	for _, r := range rooms {
		s.rooms[r.ID] = r
	}
	return s
}

func (s *BookingService) FindAvailableRooms(iv TimeInterval, minCapacity int) []*Room {
	s.mu.Lock()
	defer s.mu.Unlock()
	var fits []*Room
	for _, r := range s.rooms {
		if r.Capacity >= minCapacity && r.IsFree(iv) {
			fits = append(fits, r)
		}
	}
	sort.Slice(fits, func(i, j int) bool { // best fit first
		if fits[i].Capacity != fits[j].Capacity {
			return fits[i].Capacity < fits[j].Capacity
		}
		return fits[i].ID < fits[j].ID
	})
	return fits
}

func (s *BookingService) Book(roomID, organizer, title string, iv TimeInterval, attendees int) (Booking, error) {
	bs, err := s.bookAll(roomID, organizer, title, []TimeInterval{iv}, attendees, "")
	if err != nil {
		return Booking{}, err
	}
	return bs[0], nil
}

// BookRecurring is all-or-nothing: every instance is validated before any is stored.
func (s *BookingService) BookRecurring(roomID, organizer, title string, iv TimeInterval, rule Recurrence, attendees int) ([]Booking, error) {
	instances, err := rule.Expand(iv)
	if err != nil {
		return nil, err
	}
	return s.bookAll(roomID, organizer, title, instances, attendees, uuid.NewString())
}

func (s *BookingService) Cancel(bookingID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	b, ok := s.index[bookingID]
	if !ok {
		return false
	}
	delete(s.index, bookingID)
	return s.rooms[b.RoomID].remove(bookingID)
}

func (s *BookingService) CancelSeries(seriesID string) int {
	s.mu.Lock()
	defer s.mu.Unlock()
	n := 0
	for id, b := range s.index {
		if b.SeriesID == seriesID {
			s.rooms[b.RoomID].remove(id)
			delete(s.index, id)
			n++
		}
	}
	return n
}

// DaySchedule lists bookings overlapping the UTC calendar day containing 'day'.
func (s *BookingService) DaySchedule(roomID string, day time.Time) ([]Booking, error) {
	start := day.UTC().Truncate(24 * time.Hour)
	s.mu.Lock()
	defer s.mu.Unlock()
	r, ok := s.rooms[roomID]
	if !ok {
		return nil, ErrRoomNotFound
	}
	return r.overlapping(TimeInterval{start, start.Add(24 * time.Hour)}), nil
}

func (s *BookingService) bookAll(roomID, organizer, title string, intervals []TimeInterval, attendees int, seriesID string) ([]Booking, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	r, ok := s.rooms[roomID]
	if !ok {
		return nil, ErrRoomNotFound
	}
	if attendees < 1 || attendees > r.Capacity {
		return nil, ErrCapacityExceeded
	}
	for _, iv := range intervals {
		if !r.IsFree(iv) {
			return nil, fmt.Errorf("%w (starting %s)", ErrConflict, iv.Start.Format(time.RFC3339))
		}
	}
	created := make([]Booking, 0, len(intervals))
	for _, iv := range intervals {
		b := Booking{uuid.NewString(), r.ID, organizer, title, iv, attendees, seriesID}
		if err := r.add(b); err != nil {
			return nil, err
		}
		s.index[b.ID] = b
		created = append(created, b)
	}
	return created, nil
}

func at(day, hour int) time.Time { return time.Date(2026, 1, day, hour, 0, 0, 0, time.UTC) }

func main() {
	svc := NewBookingService(&Room{ID: "r1", Name: "Focus", Capacity: 4}, &Room{ID: "r2", Name: "Board", Capacity: 12})
	iv := func(d1, h1, d2, h2 int) TimeInterval { t, _ := NewInterval(at(d1, h1), at(d2, h2)); return t }

	_, _ = svc.Book("r1", "ann", "Standup", iv(5, 9, 5, 10), 3)
	for _, r := range svc.FindAvailableRooms(iv(5, 9, 5, 10), 3) {
		fmt.Println("free:", r.ID) // r2
	}
	if _, err := svc.Book("r1", "bob", "Clash", iv(5, 9, 5, 11), 1); errors.Is(err, ErrConflict) {
		fmt.Println("rejected:", err)
	}
	series, _ := svc.BookRecurring("r2", "cat", "Weekly sync", iv(6, 14, 6, 15), Recurrence{Frequency: Weekly, Occurrences: 3}, 8)
	day, _ := svc.DaySchedule("r1", at(5, 0))
	fmt.Println("series:", len(series), "day:", len(day), "cancelled:", svc.CancelSeries(series[0].SeriesID))
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

public class BookingException : Exception { public BookingException(string m) : base(m) {} }
public sealed class RoomNotFoundException : BookingException { public RoomNotFoundException(string id) : base("room not found: " + id) {} }
public sealed class BookingConflictException : BookingException { public BookingConflictException(string m) : base(m) {} }
public sealed class CapacityExceededException : BookingException { public CapacityExceededException(string m) : base(m) {} }

/// <summary>Half-open [Start, End): back-to-back meetings do not conflict.</summary>
public sealed record TimeInterval {
  public DateTime Start { get; }
  public DateTime End { get; }
  public TimeInterval(DateTime start, DateTime end) {
    if (start >= end) throw new ArgumentException("start must be before end");
    Start = start; End = end;
  }
  public bool Overlaps(TimeInterval o) => Start < o.End && o.Start < End;
}

public enum Frequency { Daily = 1, Weekly = 7 }

public sealed record Recurrence(Frequency Frequency, int Occurrences, int Every = 1) {
  public IReadOnlyList<TimeInterval> Expand(TimeInterval b) {
    if (Occurrences < 1 || Occurrences > 366 || Every < 1) throw new ArgumentException("invalid recurrence");
    var step = TimeSpan.FromDays((int)Frequency * Every);
    if (b.End - b.Start > step) throw new ArgumentException("meeting is longer than the recurrence step");
    return Enumerable.Range(0, Occurrences)
        .Select(i => new TimeInterval(b.Start + step * i, b.End + step * i)).ToList();
  }
}

public sealed record Booking(string Id, string RoomId, string Organizer, string Title,
                             TimeInterval Interval, int Attendees, string? SeriesId);

/// <summary>Bookings sorted by start. They never overlap, so ends are sorted too and a new
/// interval can only conflict with its immediate neighbours. Guarded by the service lock.</summary>
public sealed class Room {
  public string Id { get; }
  public string Name { get; }
  public int Capacity { get; }
  readonly List<Booking> _bookings = new();

  public Room(string id, string name, int capacity) {
    if (capacity < 1) throw new ArgumentException("capacity must be >= 1");
    Id = id; Name = name; Capacity = capacity;
  }

  int LowerBound(DateTime start) {
    int lo = 0, hi = _bookings.Count;
    while (lo < hi) {
      int mid = (lo + hi) / 2;
      if (_bookings[mid].Interval.Start < start) lo = mid + 1; else hi = mid;
    }
    return lo;
  }

  public bool IsFree(TimeInterval iv) {
    int i = LowerBound(iv.Start);
    if (i > 0 && _bookings[i - 1].Interval.End > iv.Start) return false;
    if (i < _bookings.Count && _bookings[i].Interval.Start < iv.End) return false;
    return true;
  }

  public void Add(Booking b) {
    if (!IsFree(b.Interval)) throw new BookingConflictException("room " + Id + " is not free");
    _bookings.Insert(LowerBound(b.Interval.Start), b);
  }

  public bool Remove(string bookingId) => _bookings.RemoveAll(b => b.Id == bookingId) > 0;

  public List<Booking> Overlapping(TimeInterval iv) {
    int i = LowerBound(iv.Start);
    if (i > 0 && _bookings[i - 1].Interval.End > iv.Start) i--;
    var outList = new List<Booking>();
    for (; i < _bookings.Count && _bookings[i].Interval.Start < iv.End; i++) outList.Add(_bookings[i]);
    return outList;
  }
}

public sealed class BookingService {
  readonly Dictionary<string, Room> _rooms;
  readonly Dictionary<string, Booking> _index = new();
  readonly object _gate = new();

  public BookingService(IEnumerable<Room> rooms) { _rooms = rooms.ToDictionary(r => r.Id); }

  public IReadOnlyList<Room> FindAvailableRooms(TimeInterval iv, int minCapacity = 1) {
    lock (_gate)
      return _rooms.Values.Where(r => r.Capacity >= minCapacity && r.IsFree(iv))
                   .OrderBy(r => r.Capacity).ThenBy(r => r.Id, StringComparer.Ordinal).ToList(); // best fit first
  }

  public Booking Book(string roomId, string organizer, string title, TimeInterval iv, int attendees = 1) =>
    BookAll(roomId, organizer, title, new[] { iv }, attendees, null)[0];

  /// <summary>All-or-nothing: every instance is validated before any is stored.</summary>
  public IReadOnlyList<Booking> BookRecurring(string roomId, string organizer, string title,
                                              TimeInterval iv, Recurrence rule, int attendees = 1) =>
    BookAll(roomId, organizer, title, rule.Expand(iv), attendees, Guid.NewGuid().ToString());

  public bool Cancel(string bookingId) {
    lock (_gate) {
      if (!_index.Remove(bookingId, out var b)) return false;
      return _rooms[b.RoomId].Remove(bookingId);
    }
  }

  public int CancelSeries(string seriesId) {
    lock (_gate) {
      var victims = _index.Values.Where(b => b.SeriesId == seriesId).ToList();
      foreach (var b in victims) { _index.Remove(b.Id); _rooms[b.RoomId].Remove(b.Id); }
      return victims.Count;
    }
  }

  /// <summary>Bookings overlapping the UTC calendar day of 'day'.</summary>
  public IReadOnlyList<Booking> DaySchedule(string roomId, DateTime day) {
    var start = DateTime.SpecifyKind(day.Date, DateTimeKind.Utc);
    lock (_gate) return Room(roomId).Overlapping(new TimeInterval(start, start.AddDays(1)));
  }

  Room Room(string id) => _rooms.TryGetValue(id, out var r) ? r : throw new RoomNotFoundException(id);

  IReadOnlyList<Booking> BookAll(string roomId, string organizer, string title,
                                 IReadOnlyList<TimeInterval> intervals, int attendees, string? seriesId) {
    lock (_gate) {
      var room = Room(roomId);
      if (attendees < 1 || attendees > room.Capacity)
        throw new CapacityExceededException("room " + room.Id + " holds " + room.Capacity);
      foreach (var iv in intervals)
        if (!room.IsFree(iv)) throw new BookingConflictException("conflict at " + iv.Start.ToString("o"));
      var created = intervals.Select(iv =>
        new Booking(Guid.NewGuid().ToString(), room.Id, organizer, title, iv, attendees, seriesId)).ToList();
      foreach (var b in created) { room.Add(b); _index[b.Id] = b; }
      return created;
    }
  }
}

public static class Program {
  static DateTime At(int day, int hour) => new DateTime(2026, 1, day, hour, 0, 0, DateTimeKind.Utc);

  public static void Main() {
    var svc = new BookingService(new[] { new Room("r1", "Focus", 4), new Room("r2", "Board", 12) });
    svc.Book("r1", "ann", "Standup", new TimeInterval(At(5, 9), At(5, 10)), 3);
    Console.WriteLine(string.Join(",", svc.FindAvailableRooms(new TimeInterval(At(5, 9), At(5, 10)), 3).Select(r => r.Id)));
    try { svc.Book("r1", "bob", "Clash", new TimeInterval(At(5, 9), At(5, 11))); }
    catch (BookingConflictException e) { Console.WriteLine("rejected: " + e.Message); }
    var series = svc.BookRecurring("r2", "cat", "Weekly sync", new TimeInterval(At(6, 14), At(6, 15)),
                                   new Recurrence(Frequency.Weekly, 3), 8);
    Console.WriteLine("day size " + svc.DaySchedule("r1", At(5, 0)).Count);
    Console.WriteLine("cancelled " + svc.CancelSeries(series[0].SeriesId!));
  }
}
`

export const meetingRoomBookingSolution: ProblemSolution = {
  slug: 'meeting-room-booking',
  title: 'Meeting Room Booking - Solution',
  overview: {
    introduction:
      'Design a meeting-room reservation system: find rooms that are free for a time window and large enough for the group, book a room without ever double-booking it, cancel bookings, create recurring series, and show a room’s schedule for a day. The core of the interview is the time-interval model and an efficient, correct overlap check on a sorted list of bookings.',
    constraints: [
      'Rooms have a fixed capacity; a booking’s attendee count must not exceed it.',
      'A room can never have two overlapping bookings; back-to-back meetings are allowed.',
      'Users can search for rooms by time window and minimum capacity.',
      'Bookings can be cancelled; cancelling frees the slot immediately.',
      'Recurring bookings (daily/weekly) are expanded into individual instances.',
      'A day schedule lists the bookings of a room for that calendar day in time order.',
    ],
    assumptions: [
      'All times are UTC instants; time-zone handling and DST belong at the API boundary.',
      'Intervals are half-open [start, end), so a meeting ending at 10:00 does not conflict with one starting at 10:00.',
      'Recurring series are all-or-nothing: if any instance conflicts, nothing is booked.',
      'Recurrence is daily or weekly with a fixed occurrence count; calendar rules like “last Friday” are extensions.',
      'Single process with in-memory state; persistence and distributed locking are follow-ups.',
    ],
    clarificationQuestions: [
      'Are end times inclusive or exclusive, and are back-to-back meetings allowed?',
      'Should a recurring series fail entirely if one instance conflicts, or skip the conflicts?',
      'Do we need to cancel a single instance of a series, the whole series, or “this and following”?',
      'How should “best room” be chosen when several fit - smallest capacity, closest, fewest changes?',
      'Do rooms have equipment/features that searches must filter on?',
      'Any limits such as minimum duration, maximum advance booking, or business hours?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Everything reduces to “does this interval collide with anything in this room?”. Pick a half-open interval value object with overlaps(), then keep each room’s bookings sorted by start. Because no two bookings overlap, a new interval can only collide with its immediate predecessor or successor, so a binary search plus two comparisons answers it in O(log n).',
    breakdown: [
      'Define TimeInterval [start, end) with a single overlaps() rule used everywhere.',
      'Model Room (capacity, sorted bookings) and Booking (interval, attendees, optional seriesId).',
      'Room.isFree: binary-search the insertion point, check previous.end > start and next.start < end.',
      'BookingService validates capacity, checks conflicts and indexes bookings by id for cancel.',
      'Recurring: Recurrence.expand yields intervals; validate all first, then insert all (atomic).',
      'Search: filter rooms by capacity and isFree, order by best fit; day schedule: overlap with [00:00, 24:00).',
    ],
    entities: [
      { name: 'BookingService', responsibility: 'Façade: search, book, book recurring, cancel, day schedule; makes multi-step operations atomic.' },
      { name: 'Room', responsibility: 'Capacity plus a start-sorted bookings list; owns the overlap/insert/remove logic.' },
      { name: 'Booking', responsibility: 'Immutable reservation with interval, organizer, attendees and optional series id.' },
      { name: 'TimeInterval', responsibility: 'Half-open interval value object with a validated range and overlaps().' },
      { name: 'Recurrence', responsibility: 'Expands a base interval into daily/weekly instances.' },
      { name: 'Frequency', responsibility: 'DAILY or WEEKLY recurrence step.' },
    ],
    relationships: [
      'BookingService composes Rooms and indexes Bookings by id.',
      'Room aggregates its Bookings in sorted order.',
      'Booking composes a TimeInterval.',
      'BookingService depends on Recurrence to expand series.',
    ],
    patternsAndOop: [
      'Value object: TimeInterval is immutable and compared by value.',
      'Encapsulation: only Room mutates its sorted list, so the sort/no-overlap invariant holds.',
      'Façade: BookingService offers a small API over rooms and indexes.',
      'Sorted-list + binary search for O(log n) conflict detection.',
      'All-or-nothing validation (check everything, then mutate) for recurring series.',
    ],
    stepByStep: [
      'Clarify interval semantics and recurring-conflict policy.',
      'Write TimeInterval.overlaps and justify half-open ranges.',
      'Implement Room.lowerBound, isFree, add, remove.',
      'Implement BookingService.book with capacity + conflict checks under a lock.',
      'Add recurring expansion, cancel / cancelSeries, search and day schedule.',
      'Discuss concurrency, scaling (interval tree, DB constraints) and time zones.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Room maintains the invariant “bookings are sorted by start and never overlap”. That one invariant makes conflict detection logarithmic and the day schedule a simple range scan. BookingService adds the cross-cutting rules (capacity, atomic series, id index) and a single lock so check-then-insert is safe.',
    classResponsibilities: [
      { name: 'BookingService', responsibility: 'Validates, serializes mutations, indexes bookings, and exposes the public API.' },
      { name: 'Room', responsibility: 'Sorted bookings list with isFree/add/remove/overlapping.' },
      { name: 'TimeInterval', responsibility: 'Defines what “overlap” means in exactly one place.' },
      { name: 'Booking', responsibility: 'Immutable record linking room, interval, organizer and optional series.' },
      { name: 'Recurrence', responsibility: 'Pure expansion of a base interval into N instances.' },
    ],
    interfacesAndAbstractions: [
      'Recurrence could become an interface (RecurrenceRule) with Daily/Weekly/Monthly implementations.',
      'Room selection can be abstracted behind a RoomRankingStrategy (smallest fit, nearest, preferred floor).',
    ],
    relationships: [
      'Composition BookingService→Room: rooms live in the service’s registry.',
      'Aggregation Room→Booking: bookings are added and removed over the room’s lifetime.',
      'Composition Booking→TimeInterval: the interval is part of the booking value.',
    ],
    solid: [
      'SRP: interval math, per-room ordering, and cross-room orchestration are separate.',
      'OCP: new recurrence rules or room-ranking strategies plug in without changing Room.',
      'LSP: any RecurrenceRule must return non-overlapping, ordered intervals.',
      'ISP: callers use a small façade, not Room internals.',
      'DIP: ranking and recurrence can be injected as abstractions.',
    ],
    patterns: [
      { name: 'Value Object', why: 'TimeInterval is immutable and defines overlap once.' },
      { name: 'Façade', why: 'BookingService hides rooms, indexes and locking.' },
      { name: 'Strategy (optional)', why: 'Room ranking and recurrence rules vary independently.' },
    ],
    decisions: [
      {
        decision: 'Half-open intervals [start, end).',
        rationale: 'Back-to-back meetings are natural and overlap is a single clean predicate: a.start < b.end && b.start < a.end.',
        tradeoff: 'Inclusive-end APIs need conversion at the boundary.',
      },
      {
        decision: 'Sorted list + binary search per room, checking only neighbours.',
        rationale: 'Non-overlapping bookings sorted by start are also sorted by end, so only the predecessor and successor can conflict: O(log n) check.',
        tradeoff: 'Insert/remove is O(n) because of array shifting; fine for per-room bookings, otherwise use a balanced tree.',
      },
      {
        decision: 'Recurring bookings validated first, then inserted (all-or-nothing).',
        rationale: 'Avoids partially booked series and complicated rollback.',
        tradeoff: 'A single conflicting date blocks the whole series; offer a “skip conflicts” mode if required.',
      },
      {
        decision: 'One service-wide lock.',
        rationale: 'Correctness with minimal code: check-then-insert is atomic and series are consistent.',
        tradeoff: 'Serializes bookings across rooms; use per-room locks (plus ordered locking for multi-room ops) at scale.',
      },
      {
        decision: 'Search ranks by smallest sufficient capacity.',
        rationale: 'Best-fit preserves large rooms for large groups.',
        tradeoff: 'May not match user preference; make it a pluggable strategy.',
      },
    ],
    extensibility:
      'Add amenities as a RoomFilter predicate in search. Add business hours or max duration as pre-booking validators. Add monthly or “nth weekday” rules by implementing new recurrence expanders. Replace the sorted list with an interval tree if you need fast “all rooms free in this window” across thousands of rooms. For a multi-node deployment, enforce non-overlap in the database (exclusion constraint on a room + time range).',
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
      'book() validates attendees against room capacity, then asks Room.isFree(interval).',
      'isFree binary-searches the first booking starting at or after the new start and checks the predecessor’s end and the successor’s start.',
      'If free, the booking is inserted at that index (keeping the list sorted) and added to the id index.',
      'bookRecurring() expands the rule into N intervals, checks every one with isFree, and only then inserts all of them with a shared seriesId.',
      'findAvailableRooms filters by capacity and isFree, then orders by smallest capacity.',
      'cancel(id) removes the booking from its room and the index; cancelSeries removes every booking with the series id.',
      'daySchedule builds the interval [00:00, 24:00) for that day and returns overlapping bookings in start order.',
    ],
    examples: [
      {
        title: 'Overlap rejected, adjacent allowed',
        input: 'Room r1 has 09:00-10:00. Book 09:00-11:00; then book 10:00-11:00',
        output: 'First: BookingConflict. Second: success',
        explanation: 'For 09:00-11:00 the predecessor/successor test finds 09:00-10:00 overlapping (10:00 > 09:00). For 10:00-11:00 the predecessor ends at 10:00, which is not after the new start, so there is no conflict.',
      },
      {
        title: 'Weekly series',
        input: 'bookRecurring(r2, 14:00-15:00 on Jan 6, WEEKLY × 3)',
        output: 'Three bookings: Jan 6, Jan 13, Jan 20, sharing one seriesId',
        explanation: 'expand() shifts the base interval by 7 days per occurrence. All three are checked first, so either all are stored or none.',
      },
      {
        title: 'Search by time and capacity',
        input: 'findAvailableRooms(09:00-10:00, minCapacity=3) with r1 (cap 4, busy) and r2 (cap 12, free)',
        output: '[r2]',
        explanation: 'r1 fails the free check; r2 satisfies capacity and is free. Among free rooms, the smallest capacity is ranked first.',
      },
    ],
  },
  followUps: [
    {
      question: 'Why is checking only the neighbours enough?',
      answer:
        'The list is sorted by start and contains no overlaps, so ends are sorted as well. Any booking starting before the new start has an end ≤ the end of the last such booking; any booking starting at or after it that conflicts must be the first one. So two comparisons suffice.',
    },
    {
      question: 'How do you cancel a single occurrence or “this and all following”?',
      answer:
        'Because each instance is its own Booking with a seriesId, cancelling one is a normal cancel. “This and following” removes bookings with that seriesId whose start ≥ the chosen instance. Store the recurrence rule on a Series object if you also need to regenerate instances.',
    },
    {
      question: 'How would you scale to thousands of rooms and frequent searches?',
      answer:
        'Index bookings per room in a balanced tree or interval tree, and keep a secondary index (capacity buckets). For “free rooms in a window”, query only rooms that meet capacity and test each in O(log n), or maintain a global time-bucketed availability index.',
    },
    {
      question: 'How do you prevent double-booking across multiple servers?',
      answer:
        'Make the database the arbiter: an exclusion constraint on (room_id, tstzrange(start, end)) in PostgreSQL, or a transaction that locks the room row and re-checks overlap. Retry on conflict.',
    },
    {
      question: 'How do you handle time zones and DST for recurring meetings?',
      answer:
        'Store UTC instants for each instance but compute the series in the organizer’s zone (wall-clock 14:00 every Monday) so instances shift correctly across DST. Expand using a time-zone-aware calendar library instead of adding fixed 24-hour steps.',
    },
    {
      question: 'How would you add amenities and a ranking policy?',
      answer:
        'Add a set of features to Room and accept a RoomFilter in search. Inject a RoomRankingStrategy (best-fit, closest to the organizer, fewest recent changes) instead of hard-coding the sort.',
    },
    {
      question: 'How do you test this system?',
      answer:
        'Table-test the overlap predicate (before, after, adjacent, contained, containing, identical). Property-test that random insert/cancel sequences keep the list sorted and non-overlapping. Add concurrent booking tests asserting exactly one winner for the same slot.',
    },
  ],
  extras: {
    edgeCases: [
      'Back-to-back bookings (end == next start) must succeed.',
      'New interval fully contains or is fully contained by an existing booking.',
      'Booking identical to an existing one.',
      'Attendees larger than capacity, or zero.',
      'Recurring series where only the last instance conflicts (nothing is booked).',
      'Meeting longer than the recurrence step (instances would overlap each other).',
      'Cancelling an unknown or already-cancelled id.',
      'Meetings that cross midnight appear in both days’ schedules.',
    ],
    commonMistakes: [
      'Using inclusive end times and rejecting adjacent meetings.',
      'Scanning every booking linearly on each request.',
      'Checking conflicts before acquiring the lock (check-then-act race).',
      'Inserting recurring instances one by one and leaving a partial series on failure.',
      'Writing overlap as four separate cases instead of one predicate.',
      'Forgetting to keep the list sorted after insert or cancel.',
    ],
    complexity:
      'isFree: O(log n). add: O(log n) search + O(n) shift. remove: O(n) scan (O(log n) with a start-time lookup). findAvailableRooms: O(R log n) for R rooms. day schedule: O(log n + k). Recurring series of m instances: O(m log n + m·n).',
    testing: [
      'Overlap matrix: before, after, adjacent, partial left/right, contained, containing, equal.',
      'Insert in random order and assert sorted, non-overlapping invariants.',
      'Recurring series atomicity: conflict on the Nth instance books nothing.',
      'Cancel frees the slot for rebooking.',
      'Search returns only rooms meeting capacity and availability, in best-fit order.',
      'Concurrent booking of the same slot yields exactly one success.',
    ],
    extensions: [
      'Amenity filters and room-ranking strategies.',
      'Approval workflows, buffers between meetings, business hours.',
      'Calendar integration and notifications.',
      'Time-zone-aware recurrence with exceptions.',
      'Database-enforced non-overlap with optimistic retries.',
    ],
    takeaways: [
      'Define overlap once on a half-open interval value object.',
      'Sorted + non-overlapping means only neighbours can conflict.',
      'Validate everything first, then mutate - especially for recurring series.',
      'Make check-then-insert atomic, and push the guarantee into the database when distributed.',
    ],
  },
}
