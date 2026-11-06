import type { ProblemSolution } from '../types'
import { abstractCls, attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

void abstractCls

resetUmlIds()

const nodes = [
  cls('lib', 'Library', 40, 40, [
    attr('-', 'catalog', 'Map<isbn, Book>'),
    attr('-', 'items', 'Map<barcode, BookItem>'),
    attr('-', 'members', 'Map<id, Member>'),
    attr('-', 'activeLendings', 'Map<barcode, BookLending>'),
    attr('-', 'waitlists', 'Map<isbn, Queue<BookReservation>>'),
    attr('-', 'observers', 'List<NotificationObserver>'),
    attr('-', 'finePerDay', 'decimal'),
  ], [
    method('+', 'addBookItem', 'book: Book, barcode: string', 'void'),
    method('+', 'updateBook', 'book: Book', 'void'),
    method('+', 'removeBookItem', 'barcode: string', 'void'),
    method('+', 'search', 'title?, author?, subject?, published?', 'List<Book>'),
    method('+', 'checkout', 'memberId, barcode, now', 'BookLending'),
    method('+', 'returnItem', 'barcode, now', 'Fine?'),
    method('+', 'reserve', 'memberId, isbn, now', 'BookReservation'),
    method('+', 'sendDueReminders', 'now', 'int'),
    method('+', 'addObserver', 'o: NotificationObserver', 'void'),
  ]),
  cls('bk', 'Book', 380, 40, [
    attr('-', 'isbn', 'string'),
    attr('-', 'title', 'string'),
    attr('-', 'author', 'string'),
    attr('-', 'subject', 'string'),
    attr('-', 'published', 'Date'),
  ], []),
  cls('bi', 'BookItem', 380, 320, [
    attr('-', 'barcode', 'string'),
    attr('-', 'book', 'Book'),
    attr('-', 'state', 'BookItemState'),
    attr('-', 'dueDate', 'DateTime?'),
    attr('-', 'heldFor', 'string?'),
  ], [
    method('+', 'status', '', 'BookStatus'),
    method('+', 'checkout', 'member, now', 'void'),
    method('+', 'returnItem', '', 'void'),
    method('+', 'hold', 'member', 'void'),
  ]),
  iface('bis', 'BookItemState', 720, 40, [
    method('+', 'status', '', 'BookStatus'),
    method('+', 'checkout', 'item, member, now', 'void'),
    method('+', 'returnItem', 'item', 'void'),
    method('+', 'hold', 'item, member', 'void'),
  ]),
  cls('as', 'AvailableState', 720, 280, [], [
    method('+', 'checkout', 'item, member, now', 'void'),
    method('+', 'hold', 'item, member', 'void'),
  ]),
  cls('ls', 'LoanedState', 720, 450, [], [
    method('+', 'returnItem', 'item', 'void'),
  ]),
  cls('rs', 'ReservedState', 720, 600, [], [
    method('+', 'checkout', 'item, member, now', 'void'),
  ]),
  enm('bst', 'BookStatus', 1060, 40, ['AVAILABLE', 'LOANED', 'RESERVED']),
  enm('rst', 'ReservationStatus', 1060, 230, ['WAITING', 'READY', 'FULFILLED']),
  cls('mb', 'Member', 40, 600, [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'email', 'string'),
    attr('-', 'active', 'List<BookLending>'),
    attr('-', 'fines', 'List<Fine>'),
  ], [
    method('+', 'canBorrow', '', 'bool'),
  ]),
  cls('bl', 'BookLending', 380, 640, [
    attr('-', 'id', 'string'),
    attr('-', 'barcode', 'string'),
    attr('-', 'memberId', 'string'),
    attr('-', 'borrowedAt', 'DateTime'),
    attr('-', 'dueDate', 'DateTime'),
    attr('-', 'returnedAt', 'DateTime?'),
    attr('-', 'reminded', 'bool'),
  ], [
    method('+', 'overdueDays', 'now', 'int'),
  ]),
  cls('br', 'BookReservation', 1060, 420, [
    attr('-', 'id', 'string'),
    attr('-', 'isbn', 'string'),
    attr('-', 'memberId', 'string'),
    attr('-', 'createdAt', 'DateTime'),
    attr('-', 'status', 'ReservationStatus'),
  ], []),
  cls('fn', 'Fine', 1060, 700, [
    attr('-', 'lendingId', 'string'),
    attr('-', 'memberId', 'string'),
    attr('-', 'daysOverdue', 'int'),
    attr('-', 'amount', 'decimal'),
    attr('-', 'paid', 'bool'),
  ], []),
  iface('no', 'NotificationObserver', 40, 940, [
    method('+', 'update', 'member: Member, message: string', 'void'),
  ]),
  cls('cn', 'ConsoleNotifier', 40, 1120, [
    attr('-', 'sent', 'List<string>'),
  ], [
    method('+', 'update', 'member, message', 'void'),
  ]),
]

const edges = [
  edge('e1', 'lib', 'bi', 'composition', 'right@70', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e2', 'lib', 'bk', 'aggregation', 'right@15', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'catalog' }),
  edge('e3', 'bi', 'bk', 'association', 'top', 'bottom', { sourceMultiplicity: '*', targetMultiplicity: '1', label: 'copy of' }),
  edge('e4', 'bi', 'bis', 'aggregation', 'right', 'bottom@30', { label: 'state' }),
  edge('e5', 'as', 'bis', 'realization', 'top', 'bottom'),
  edge('e6', 'ls', 'as', 'realization', 'top', 'bottom@30'),
  edge('e7', 'rs', 'ls', 'realization', 'top', 'bottom@30'),
  edge('e8', 'bi', 'bst', 'dependency', 'right@20', 'left', { label: 'reports' }),
  edge('e9', 'lib', 'mb', 'aggregation', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e10', 'lib', 'bl', 'association', 'bottom@85', 'top', { targetMultiplicity: '0..*', label: 'active' }),
  edge('e11', 'bl', 'mb', 'association', 'left', 'right', { sourceMultiplicity: '*', targetMultiplicity: '1', label: 'borrowed by' }),
  edge('e12', 'lib', 'br', 'aggregation', 'right@90', 'left', { targetMultiplicity: '0..*', label: 'waitlist' }),
  edge('e13', 'br', 'rst', 'dependency', 'top', 'bottom'),
  edge('e14', 'bl', 'fn', 'dependency', 'right', 'left', { label: 'overdue creates' }),
  edge('e15', 'mb', 'fn', 'aggregation', 'bottom@70', 'bottom@70', { targetMultiplicity: '0..*' }),
  edge('e16', 'lib', 'no', 'aggregation', 'bottom@10', 'top', { targetMultiplicity: '0..*', label: 'notifies' }),
  edge('e17', 'cn', 'no', 'realization', 'top', 'bottom'),
]

const py = `from __future__ import annotations
from abc import ABC, abstractmethod
from collections import deque
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from enum import Enum
from typing import Deque, Dict, List, Optional
import math
import uuid

LOAN_DAYS = 14
MAX_ACTIVE_LOANS = 5
FINE_PER_DAY = 1.0
REMINDER_WINDOW_DAYS = 2


class LibraryError(Exception):
    pass


class BookStatus(Enum):
    AVAILABLE = "AVAILABLE"
    LOANED = "LOANED"
    RESERVED = "RESERVED"


class ReservationStatus(Enum):
    WAITING = "WAITING"
    READY = "READY"
    FULFILLED = "FULFILLED"


@dataclass(frozen=True)
class Book:
    isbn: str
    title: str
    author: str
    subject: str
    published: date


@dataclass
class Fine:
    lending_id: str
    member_id: str
    days_overdue: int
    amount: float
    paid: bool = False


@dataclass
class BookReservation:
    id: str
    isbn: str
    member_id: str
    created_at: datetime
    status: ReservationStatus = ReservationStatus.WAITING


@dataclass
class BookLending:
    id: str
    barcode: str
    member_id: str
    borrowed_at: datetime
    due_date: datetime
    returned_at: Optional[datetime] = None
    reminded: bool = False

    def overdue_days(self, now: datetime) -> int:
        if now <= self.due_date:
            return 0
        return math.ceil((now - self.due_date) / timedelta(days=1))


class Member:
    def __init__(self, member_id: str, name: str, email: str):
        self.id, self.name, self.email = member_id, name, email
        self.active: List[BookLending] = []
        self.fines: List[Fine] = []

    def can_borrow(self) -> bool:
        return len(self.active) < MAX_ACTIVE_LOANS


# ---------- Observer: notifications ----------
class NotificationObserver(ABC):
    @abstractmethod
    def update(self, member: Member, message: str) -> None: ...


class ConsoleNotifier(NotificationObserver):
    def __init__(self) -> None:
        self.sent: List[str] = []

    def update(self, member: Member, message: str) -> None:
        line = f"[notify {member.email}] {message}"
        self.sent.append(line)
        print(line)


# ---------- State: BookItem lifecycle ----------
class BookItemState(ABC):
    status: BookStatus

    def checkout(self, item: "BookItem", member: Member, now: datetime) -> None:
        raise LibraryError(f"cannot check out an item that is {self.status.value}")

    def return_item(self, item: "BookItem") -> None:
        raise LibraryError(f"cannot return an item that is {self.status.value}")

    def hold(self, item: "BookItem", member: Member) -> None:
        raise LibraryError(f"cannot hold an item that is {self.status.value}")


class AvailableState(BookItemState):
    status = BookStatus.AVAILABLE

    def checkout(self, item, member, now):
        item.due_date = now + timedelta(days=LOAN_DAYS)
        item.set_state(LoanedState())

    def hold(self, item, member):
        item.held_for = member.id
        item.set_state(ReservedState())


class LoanedState(BookItemState):
    status = BookStatus.LOANED

    def return_item(self, item):
        item.due_date = None
        item.set_state(AvailableState())


class ReservedState(BookItemState):
    status = BookStatus.RESERVED

    def checkout(self, item, member, now):
        if item.held_for != member.id:
            raise LibraryError("item is on hold for another member")
        item.held_for = None
        item.due_date = now + timedelta(days=LOAN_DAYS)
        item.set_state(LoanedState())


class BookItem:
    def __init__(self, barcode: str, book: Book):
        self.barcode = barcode
        self.book = book
        self.due_date: Optional[datetime] = None
        self.held_for: Optional[str] = None
        self._state: BookItemState = AvailableState()

    @property
    def status(self) -> BookStatus:
        return self._state.status

    def set_state(self, s: BookItemState) -> None:
        self._state = s

    def checkout(self, member: Member, now: datetime) -> None:
        self._state.checkout(self, member, now)

    def return_item(self) -> None:
        self._state.return_item(self)

    def hold(self, member: Member) -> None:
        self._state.hold(self, member)


# ---------- Facade ----------
class Library:
    def __init__(self, fine_per_day: float = FINE_PER_DAY):
        self.fine_per_day = fine_per_day
        self._catalog: Dict[str, Book] = {}
        self._items: Dict[str, BookItem] = {}
        self._members: Dict[str, Member] = {}
        self._lendings: Dict[str, BookLending] = {}  # active, by barcode
        self._waitlists: Dict[str, Deque[BookReservation]] = {}
        self._observers: List[NotificationObserver] = []

    # --- admin ---
    def add_book_item(self, book: Book, barcode: str, now: Optional[datetime] = None) -> None:
        if barcode in self._items:
            raise LibraryError("duplicate barcode")
        self._catalog.setdefault(book.isbn, book)
        item = BookItem(barcode, self._catalog[book.isbn])
        self._items[barcode] = item
        self._assign_to_waiter(item)  # a new copy may satisfy a waiting reservation

    def update_book(self, book: Book) -> None:
        if book.isbn not in self._catalog:
            raise LibraryError("unknown isbn")
        self._catalog[book.isbn] = book
        for it in self._items.values():
            if it.book.isbn == book.isbn:
                it.book = book

    def remove_book_item(self, barcode: str) -> None:
        item = self._item(barcode)
        if item.status is not BookStatus.AVAILABLE:
            raise LibraryError("only available copies can be removed")
        del self._items[barcode]

    def register_member(self, member: Member) -> None:
        self._members[member.id] = member

    def add_observer(self, o: NotificationObserver) -> None:
        self._observers.append(o)

    # --- search ---
    def search(self, title: Optional[str] = None, author: Optional[str] = None,
               subject: Optional[str] = None, published: Optional[date] = None) -> List[Book]:
        def hit(b: Book) -> bool:
            return (
                (title is None or title.lower() in b.title.lower())
                and (author is None or author.lower() in b.author.lower())
                and (subject is None or subject.lower() in b.subject.lower())
                and (published is None or b.published == published)
            )
        return [b for b in self._catalog.values() if hit(b)]

    # --- borrowing ---
    def checkout(self, member_id: str, barcode: str, now: datetime) -> BookLending:
        member, item = self._member(member_id), self._item(barcode)
        if not member.can_borrow():
            raise LibraryError("borrow limit reached")
        item.checkout(member, now)  # state decides if legal (reserved => holder only)
        lending = BookLending(str(uuid.uuid4()), barcode, member.id, now, item.due_date)
        self._lendings[barcode] = lending
        member.active.append(lending)
        self._fulfil_reservation(member.id, item.book.isbn)
        return lending

    def return_item(self, barcode: str, now: datetime) -> Optional[Fine]:
        lending = self._lendings.pop(barcode, None)
        if lending is None:
            raise LibraryError("item is not on loan")
        item, member = self._item(barcode), self._member(lending.member_id)
        lending.returned_at = now
        member.active.remove(lending)
        item.return_item()
        fine = None
        days = lending.overdue_days(now)
        if days > 0:
            fine = Fine(lending.id, member.id, days, days * self.fine_per_day)
            member.fines.append(fine)
            self._notify(member, f"Fine of {fine.amount:.2f} for {days} overdue day(s)")
        self._assign_to_waiter(item)
        return fine

    def reserve(self, member_id: str, isbn: str, now: datetime) -> BookReservation:
        member = self._member(member_id)
        copies = [i for i in self._items.values() if i.book.isbn == isbn]
        if not copies:
            raise LibraryError("unknown book")
        if any(i.status is BookStatus.AVAILABLE for i in copies):
            raise LibraryError("a copy is available - borrow it instead")
        queue = self._waitlists.setdefault(isbn, deque())
        if any(r.member_id == member.id and r.status is not ReservationStatus.FULFILLED for r in queue):
            raise LibraryError("already reserved")
        r = BookReservation(str(uuid.uuid4()), isbn, member.id, now)
        queue.append(r)
        return r

    def send_due_reminders(self, now: datetime) -> int:
        sent = 0
        for lending in self._lendings.values():
            remaining = lending.due_date - now
            if not lending.reminded and timedelta(0) <= remaining <= timedelta(days=REMINDER_WINDOW_DAYS):
                self._notify(self._member(lending.member_id),
                             f"'{self._items[lending.barcode].book.title}' is due {lending.due_date:%Y-%m-%d}")
                lending.reminded = True
                sent += 1
        return sent

    # --- helpers ---
    def _assign_to_waiter(self, item: BookItem) -> None:
        if item.status is not BookStatus.AVAILABLE:
            return
        for r in self._waitlists.get(item.book.isbn, ()):
            if r.status is ReservationStatus.WAITING:
                member = self._member(r.member_id)
                item.hold(member)
                r.status = ReservationStatus.READY
                self._notify(member, f"'{item.book.title}' is ready for pickup")
                return

    def _fulfil_reservation(self, member_id: str, isbn: str) -> None:
        for r in self._waitlists.get(isbn, ()):
            if r.member_id == member_id and r.status is ReservationStatus.READY:
                r.status = ReservationStatus.FULFILLED
                return

    def _notify(self, member: Member, message: str) -> None:
        for o in self._observers:
            o.update(member, message)

    def _item(self, barcode: str) -> BookItem:
        if barcode not in self._items:
            raise LibraryError("unknown barcode")
        return self._items[barcode]

    def _member(self, member_id: str) -> Member:
        if member_id not in self._members:
            raise LibraryError("unknown member")
        return self._members[member_id]


def demo() -> None:
    lib = Library()
    lib.add_observer(ConsoleNotifier())
    book = Book("111", "Clean Code", "Robert Martin", "Software", date(2008, 8, 1))
    lib.add_book_item(book, "B-1")
    for m in (Member("m1", "Asha", "asha@x.com"), Member("m2", "Ben", "ben@x.com")):
        lib.register_member(m)

    t0 = datetime(2026, 1, 1)
    lib.checkout("m1", "B-1", t0)
    lib.reserve("m2", "111", t0)                      # only copy is out -> waitlist
    lib.send_due_reminders(t0 + timedelta(days=13))  # 1 day before due
    fine = lib.return_item("B-1", t0 + timedelta(days=17))  # 3 days late
    print("fine:", fine)
    lib.checkout("m2", "B-1", t0 + timedelta(days=17))  # only m2 may take the held copy
    print([b.title for b in lib.search(author="martin")])


if __name__ == "__main__":
    demo()
`

const java = `import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

enum BookStatus { AVAILABLE, LOANED, RESERVED }
enum ReservationStatus { WAITING, READY, FULFILLED }

class LibraryException extends RuntimeException {
  LibraryException(String m) { super(m); }
}

record Book(String isbn, String title, String author, String subject, LocalDate published) {}

class Fine {
  final String lendingId, memberId; final int daysOverdue; final double amount; boolean paid;
  Fine(String lendingId, String memberId, int daysOverdue, double amount) {
    this.lendingId = lendingId; this.memberId = memberId;
    this.daysOverdue = daysOverdue; this.amount = amount;
  }
}

class BookReservation {
  final String id = UUID.randomUUID().toString();
  final String isbn, memberId; final LocalDateTime createdAt;
  ReservationStatus status = ReservationStatus.WAITING;
  BookReservation(String isbn, String memberId, LocalDateTime createdAt) {
    this.isbn = isbn; this.memberId = memberId; this.createdAt = createdAt;
  }
}

class BookLending {
  final String id = UUID.randomUUID().toString();
  final String barcode, memberId; final LocalDateTime borrowedAt, dueDate;
  LocalDateTime returnedAt; boolean reminded;
  BookLending(String barcode, String memberId, LocalDateTime borrowedAt, LocalDateTime dueDate) {
    this.barcode = barcode; this.memberId = memberId;
    this.borrowedAt = borrowedAt; this.dueDate = dueDate;
  }
  int overdueDays(LocalDateTime now) {
    if (!now.isAfter(dueDate)) return 0;
    long hours = Duration.between(dueDate, now).toHours();
    return (int) ((hours + 23) / 24);
  }
}

class Member {
  static final int MAX_ACTIVE = 5;
  final String id, name, email;
  final List<BookLending> active = new ArrayList<>();
  final List<Fine> fines = new ArrayList<>();
  Member(String id, String name, String email) { this.id = id; this.name = name; this.email = email; }
  boolean canBorrow() { return active.size() < MAX_ACTIVE; }
}

// ---------- Observer ----------
interface NotificationObserver { void update(Member member, String message); }

class ConsoleNotifier implements NotificationObserver {
  final List<String> sent = new ArrayList<>();
  public void update(Member m, String msg) {
    String line = "[notify " + m.email + "] " + msg;
    sent.add(line); System.out.println(line);
  }
}

// ---------- State ----------
interface BookItemState {
  BookStatus status();
  default void checkout(BookItem i, Member m, LocalDateTime now) {
    throw new LibraryException("cannot check out an item that is " + status());
  }
  default void returnItem(BookItem i) {
    throw new LibraryException("cannot return an item that is " + status());
  }
  default void hold(BookItem i, Member m) {
    throw new LibraryException("cannot hold an item that is " + status());
  }
}

class AvailableState implements BookItemState {
  public BookStatus status() { return BookStatus.AVAILABLE; }
  public void checkout(BookItem i, Member m, LocalDateTime now) {
    i.dueDate = now.plusDays(Library.LOAN_DAYS); i.setState(new LoanedState());
  }
  public void hold(BookItem i, Member m) { i.heldFor = m.id; i.setState(new ReservedState()); }
}

class LoanedState implements BookItemState {
  public BookStatus status() { return BookStatus.LOANED; }
  public void returnItem(BookItem i) { i.dueDate = null; i.setState(new AvailableState()); }
}

class ReservedState implements BookItemState {
  public BookStatus status() { return BookStatus.RESERVED; }
  public void checkout(BookItem i, Member m, LocalDateTime now) {
    if (!m.id.equals(i.heldFor)) throw new LibraryException("item is on hold for another member");
    i.heldFor = null; i.dueDate = now.plusDays(Library.LOAN_DAYS); i.setState(new LoanedState());
  }
}

class BookItem {
  final String barcode; Book book;
  LocalDateTime dueDate; String heldFor;
  private BookItemState state = new AvailableState();
  BookItem(String barcode, Book book) { this.barcode = barcode; this.book = book; }
  BookStatus status() { return state.status(); }
  void setState(BookItemState s) { state = s; }
  void checkout(Member m, LocalDateTime now) { state.checkout(this, m, now); }
  void returnItem() { state.returnItem(this); }
  void hold(Member m) { state.hold(this, m); }
}

// ---------- Facade ----------
class Library {
  static final int LOAN_DAYS = 14, REMINDER_DAYS = 2;
  private final double finePerDay;
  private final Map<String, Book> catalog = new LinkedHashMap<>();
  private final Map<String, BookItem> items = new LinkedHashMap<>();
  private final Map<String, Member> members = new HashMap<>();
  private final Map<String, BookLending> lendings = new HashMap<>();
  private final Map<String, Deque<BookReservation>> waitlists = new HashMap<>();
  private final List<NotificationObserver> observers = new ArrayList<>();

  Library(double finePerDay) { this.finePerDay = finePerDay; }

  // admin
  void addBookItem(Book book, String barcode) {
    if (items.containsKey(barcode)) throw new LibraryException("duplicate barcode");
    catalog.putIfAbsent(book.isbn(), book);
    BookItem item = new BookItem(barcode, catalog.get(book.isbn()));
    items.put(barcode, item);
    assignToWaiter(item);
  }
  void updateBook(Book book) {
    if (!catalog.containsKey(book.isbn())) throw new LibraryException("unknown isbn");
    catalog.put(book.isbn(), book);
    for (BookItem it : items.values()) if (it.book.isbn().equals(book.isbn())) it.book = book;
  }
  void removeBookItem(String barcode) {
    if (item(barcode).status() != BookStatus.AVAILABLE)
      throw new LibraryException("only available copies can be removed");
    items.remove(barcode);
  }
  void registerMember(Member m) { members.put(m.id, m); }
  void addObserver(NotificationObserver o) { observers.add(o); }

  List<Book> search(String title, String author, String subject, LocalDate published) {
    List<Book> out = new ArrayList<>();
    for (Book b : catalog.values()) {
      if (title != null && !b.title().toLowerCase().contains(title.toLowerCase())) continue;
      if (author != null && !b.author().toLowerCase().contains(author.toLowerCase())) continue;
      if (subject != null && !b.subject().toLowerCase().contains(subject.toLowerCase())) continue;
      if (published != null && !b.published().equals(published)) continue;
      out.add(b);
    }
    return out;
  }

  BookLending checkout(String memberId, String barcode, LocalDateTime now) {
    Member m = member(memberId); BookItem item = item(barcode);
    if (!m.canBorrow()) throw new LibraryException("borrow limit reached");
    item.checkout(m, now);
    BookLending l = new BookLending(barcode, m.id, now, item.dueDate);
    lendings.put(barcode, l); m.active.add(l);
    fulfil(m.id, item.book.isbn());
    return l;
  }

  Fine returnItem(String barcode, LocalDateTime now) {
    BookLending l = lendings.remove(barcode);
    if (l == null) throw new LibraryException("item is not on loan");
    BookItem item = item(barcode); Member m = member(l.memberId);
    l.returnedAt = now; m.active.remove(l); item.returnItem();
    Fine fine = null; int days = l.overdueDays(now);
    if (days > 0) {
      fine = new Fine(l.id, m.id, days, days * finePerDay);
      m.fines.add(fine);
      notify(m, String.format("Fine of %.2f for %d overdue day(s)", fine.amount, days));
    }
    assignToWaiter(item);
    return fine;
  }

  BookReservation reserve(String memberId, String isbn, LocalDateTime now) {
    Member m = member(memberId);
    List<BookItem> copies = items.values().stream().filter(i -> i.book.isbn().equals(isbn)).toList();
    if (copies.isEmpty()) throw new LibraryException("unknown book");
    if (copies.stream().anyMatch(i -> i.status() == BookStatus.AVAILABLE))
      throw new LibraryException("a copy is available - borrow it instead");
    Deque<BookReservation> q = waitlists.computeIfAbsent(isbn, k -> new ArrayDeque<>());
    for (BookReservation r : q)
      if (r.memberId.equals(m.id) && r.status != ReservationStatus.FULFILLED)
        throw new LibraryException("already reserved");
    BookReservation r = new BookReservation(isbn, m.id, now);
    q.add(r);
    return r;
  }

  int sendDueReminders(LocalDateTime now) {
    int sent = 0;
    for (BookLending l : lendings.values()) {
      long days = ChronoUnit.HOURS.between(now, l.dueDate);
      if (!l.reminded && days >= 0 && days <= REMINDER_DAYS * 24L) {
        notify(member(l.memberId), "'" + items.get(l.barcode).book.title() + "' is due " + l.dueDate.toLocalDate());
        l.reminded = true; sent++;
      }
    }
    return sent;
  }

  private void assignToWaiter(BookItem item) {
    if (item.status() != BookStatus.AVAILABLE) return;
    for (BookReservation r : waitlists.getOrDefault(item.book.isbn(), new ArrayDeque<>())) {
      if (r.status == ReservationStatus.WAITING) {
        Member m = member(r.memberId);
        item.hold(m); r.status = ReservationStatus.READY;
        notify(m, "'" + item.book.title() + "' is ready for pickup");
        return;
      }
    }
  }
  private void fulfil(String memberId, String isbn) {
    for (BookReservation r : waitlists.getOrDefault(isbn, new ArrayDeque<>()))
      if (r.memberId.equals(memberId) && r.status == ReservationStatus.READY) {
        r.status = ReservationStatus.FULFILLED; return;
      }
  }
  private void notify(Member m, String msg) { for (NotificationObserver o : observers) o.update(m, msg); }
  private BookItem item(String b) {
    BookItem i = items.get(b); if (i == null) throw new LibraryException("unknown barcode"); return i;
  }
  private Member member(String id) {
    Member m = members.get(id); if (m == null) throw new LibraryException("unknown member"); return m;
  }
}
`

const ts = `type BookStatus = 'AVAILABLE' | 'LOANED' | 'RESERVED'
type ReservationStatus = 'WAITING' | 'READY' | 'FULFILLED'

const LOAN_DAYS = 14
const MAX_ACTIVE = 5
const REMINDER_DAYS = 2
const DAY_MS = 24 * 60 * 60 * 1000

class LibraryError extends Error {}

interface Book { isbn: string; title: string; author: string; subject: string; published: string } // ISO date

interface Fine { lendingId: string; memberId: string; daysOverdue: number; amount: number; paid: boolean }

interface BookReservation {
  id: string; isbn: string; memberId: string; createdAt: Date; status: ReservationStatus
}

class BookLending {
  returnedAt: Date | null = null
  reminded = false
  constructor(
    public readonly id: string,
    public readonly barcode: string,
    public readonly memberId: string,
    public readonly borrowedAt: Date,
    public readonly dueDate: Date,
  ) {}
  overdueDays(now: Date): number {
    if (now <= this.dueDate) return 0
    return Math.ceil((now.getTime() - this.dueDate.getTime()) / DAY_MS)
  }
}

class Member {
  active: BookLending[] = []
  fines: Fine[] = []
  constructor(public readonly id: string, public readonly name: string, public readonly email: string) {}
  canBorrow() { return this.active.length < MAX_ACTIVE }
}

// ---------- Observer ----------
interface NotificationObserver { update(member: Member, message: string): void }

class ConsoleNotifier implements NotificationObserver {
  sent: string[] = []
  update(member: Member, message: string) {
    const line = '[notify ' + member.email + '] ' + message
    this.sent.push(line)
    console.log(line)
  }
}

// ---------- State ----------
interface BookItemState {
  readonly status: BookStatus
  checkout(item: BookItem, member: Member, now: Date): void
  returnItem(item: BookItem): void
  hold(item: BookItem, member: Member): void
}

abstract class BaseState implements BookItemState {
  abstract readonly status: BookStatus
  checkout(_i: BookItem, _m: Member, _now: Date): void { throw new LibraryError('cannot check out when ' + this.status) }
  returnItem(_i: BookItem): void { throw new LibraryError('cannot return when ' + this.status) }
  hold(_i: BookItem, _m: Member): void { throw new LibraryError('cannot hold when ' + this.status) }
}

class AvailableState extends BaseState {
  readonly status: BookStatus = 'AVAILABLE'
  checkout(i: BookItem, _m: Member, now: Date) {
    i.dueDate = new Date(now.getTime() + LOAN_DAYS * DAY_MS)
    i.setState(new LoanedState())
  }
  hold(i: BookItem, m: Member) { i.heldFor = m.id; i.setState(new ReservedState()) }
}

class LoanedState extends BaseState {
  readonly status: BookStatus = 'LOANED'
  returnItem(i: BookItem) { i.dueDate = null; i.setState(new AvailableState()) }
}

class ReservedState extends BaseState {
  readonly status: BookStatus = 'RESERVED'
  checkout(i: BookItem, m: Member, now: Date) {
    if (i.heldFor !== m.id) throw new LibraryError('item is on hold for another member')
    i.heldFor = null
    i.dueDate = new Date(now.getTime() + LOAN_DAYS * DAY_MS)
    i.setState(new LoanedState())
  }
}

class BookItem {
  dueDate: Date | null = null
  heldFor: string | null = null
  private state: BookItemState = new AvailableState()
  constructor(public readonly barcode: string, public book: Book) {}
  get status(): BookStatus { return this.state.status }
  setState(s: BookItemState) { this.state = s }
  checkout(m: Member, now: Date) { this.state.checkout(this, m, now) }
  returnItem() { this.state.returnItem(this) }
  hold(m: Member) { this.state.hold(this, m) }
}

// ---------- Facade ----------
class Library {
  private catalog = new Map<string, Book>()
  private items = new Map<string, BookItem>()
  private members = new Map<string, Member>()
  private lendings = new Map<string, BookLending>()
  private waitlists = new Map<string, BookReservation[]>()
  private observers: NotificationObserver[] = []
  private seq = 0

  constructor(private finePerDay = 1) {}

  // admin
  addBookItem(book: Book, barcode: string) {
    if (this.items.has(barcode)) throw new LibraryError('duplicate barcode')
    if (!this.catalog.has(book.isbn)) this.catalog.set(book.isbn, book)
    const item = new BookItem(barcode, this.catalog.get(book.isbn)!)
    this.items.set(barcode, item)
    this.assignToWaiter(item)
  }
  updateBook(book: Book) {
    if (!this.catalog.has(book.isbn)) throw new LibraryError('unknown isbn')
    this.catalog.set(book.isbn, book)
    for (const it of this.items.values()) if (it.book.isbn === book.isbn) it.book = book
  }
  removeBookItem(barcode: string) {
    if (this.item(barcode).status !== 'AVAILABLE') throw new LibraryError('only available copies can be removed')
    this.items.delete(barcode)
  }
  registerMember(m: Member) { this.members.set(m.id, m) }
  addObserver(o: NotificationObserver) { this.observers.push(o) }

  search(q: { title?: string; author?: string; subject?: string; published?: string }): Book[] {
    const has = (hay: string, needle?: string) => needle === undefined || hay.toLowerCase().includes(needle.toLowerCase())
    return [...this.catalog.values()].filter(b =>
      has(b.title, q.title) && has(b.author, q.author) && has(b.subject, q.subject) &&
      (q.published === undefined || b.published === q.published))
  }

  checkout(memberId: string, barcode: string, now: Date): BookLending {
    const m = this.member(memberId)
    const item = this.item(barcode)
    if (!m.canBorrow()) throw new LibraryError('borrow limit reached')
    item.checkout(m, now)
    const l = new BookLending('L' + ++this.seq, barcode, m.id, now, item.dueDate!)
    this.lendings.set(barcode, l)
    m.active.push(l)
    this.fulfil(m.id, item.book.isbn)
    return l
  }

  returnItem(barcode: string, now: Date): Fine | null {
    const l = this.lendings.get(barcode)
    if (!l) throw new LibraryError('item is not on loan')
    this.lendings.delete(barcode)
    const item = this.item(barcode)
    const m = this.member(l.memberId)
    l.returnedAt = now
    m.active = m.active.filter(x => x !== l)
    item.returnItem()
    let fine: Fine | null = null
    const days = l.overdueDays(now)
    if (days > 0) {
      fine = { lendingId: l.id, memberId: m.id, daysOverdue: days, amount: days * this.finePerDay, paid: false }
      m.fines.push(fine)
      this.notify(m, 'Fine of ' + fine.amount.toFixed(2) + ' for ' + days + ' overdue day(s)')
    }
    this.assignToWaiter(item)
    return fine
  }

  reserve(memberId: string, isbn: string, now: Date): BookReservation {
    const m = this.member(memberId)
    const copies = [...this.items.values()].filter(i => i.book.isbn === isbn)
    if (copies.length === 0) throw new LibraryError('unknown book')
    if (copies.some(i => i.status === 'AVAILABLE')) throw new LibraryError('a copy is available - borrow it instead')
    const q = this.waitlists.get(isbn) ?? []
    if (q.some(r => r.memberId === m.id && r.status !== 'FULFILLED')) throw new LibraryError('already reserved')
    const r: BookReservation = { id: 'R' + ++this.seq, isbn, memberId: m.id, createdAt: now, status: 'WAITING' }
    q.push(r)
    this.waitlists.set(isbn, q)
    return r
  }

  sendDueReminders(now: Date): number {
    let sent = 0
    for (const l of this.lendings.values()) {
      const remaining = l.dueDate.getTime() - now.getTime()
      if (!l.reminded && remaining >= 0 && remaining <= REMINDER_DAYS * DAY_MS) {
        const title = this.items.get(l.barcode)!.book.title
        this.notify(this.member(l.memberId), "'" + title + "' is due " + l.dueDate.toISOString().slice(0, 10))
        l.reminded = true
        sent++
      }
    }
    return sent
  }

  private assignToWaiter(item: BookItem) {
    if (item.status !== 'AVAILABLE') return
    const r = (this.waitlists.get(item.book.isbn) ?? []).find(x => x.status === 'WAITING')
    if (!r) return
    const m = this.member(r.memberId)
    item.hold(m)
    r.status = 'READY'
    this.notify(m, "'" + item.book.title + "' is ready for pickup")
  }
  private fulfil(memberId: string, isbn: string) {
    const r = (this.waitlists.get(isbn) ?? []).find(x => x.memberId === memberId && x.status === 'READY')
    if (r) r.status = 'FULFILLED'
  }
  private notify(m: Member, msg: string) { this.observers.forEach(o => o.update(m, msg)) }
  private item(b: string) { const i = this.items.get(b); if (!i) throw new LibraryError('unknown barcode'); return i }
  private member(id: string) { const m = this.members.get(id); if (!m) throw new LibraryError('unknown member'); return m }
}

export { Library, Member, ConsoleNotifier, LibraryError }
export type { Book, Fine, BookReservation, NotificationObserver }
`

const cpp = `#include <algorithm>
#include <chrono>
#include <deque>
#include <iostream>
#include <map>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

using TimePoint = std::chrono::system_clock::time_point;
using Days = std::chrono::hours;  // 24h per day below

constexpr int LOAN_DAYS = 14;
constexpr int MAX_ACTIVE = 5;
constexpr int REMINDER_DAYS = 2;

enum class BookStatus { Available, Loaned, Reserved };
enum class ReservationStatus { Waiting, Ready, Fulfilled };

struct LibraryError : std::runtime_error { using std::runtime_error::runtime_error; };

struct Book {
  std::string isbn, title, author, subject, published;  // published: ISO yyyy-mm-dd
};

struct Fine { std::string lendingId, memberId; int daysOverdue; double amount; bool paid = false; };

struct BookReservation {
  std::string id, isbn, memberId; TimePoint createdAt;
  ReservationStatus status = ReservationStatus::Waiting;
};

struct BookLending {
  std::string id, barcode, memberId; TimePoint borrowedAt, dueDate;
  bool returned = false, reminded = false;
  int overdueDays(TimePoint now) const {
    if (now <= dueDate) return 0;
    auto hrs = std::chrono::duration_cast<std::chrono::hours>(now - dueDate).count();
    return static_cast<int>((hrs + 23) / 24);
  }
};

struct Member {
  std::string id, name, email;
  std::vector<std::string> active;  // barcodes on loan
  std::vector<Fine> fines;
  bool canBorrow() const { return static_cast<int>(active.size()) < MAX_ACTIVE; }
};

// ---------- Observer ----------
class NotificationObserver {
public:
  virtual ~NotificationObserver() = default;
  virtual void update(const Member& member, const std::string& message) = 0;
};

class ConsoleNotifier : public NotificationObserver {
public:
  std::vector<std::string> sent;
  void update(const Member& m, const std::string& msg) override {
    sent.push_back("[notify " + m.email + "] " + msg);
    std::cout << sent.back() << "\\n";
  }
};

// ---------- State ----------
class BookItem;
class BookItemState {
public:
  virtual ~BookItemState() = default;
  virtual BookStatus status() const = 0;
  virtual void checkout(BookItem&, const std::string&, TimePoint) { throw LibraryError("illegal checkout in this state"); }
  virtual void returnItem(BookItem&) { throw LibraryError("illegal return in this state"); }
  virtual void hold(BookItem&, const std::string&) { throw LibraryError("illegal hold in this state"); }
};

class BookItem {
public:
  std::string barcode; Book book; TimePoint dueDate{}; std::string heldFor;
  BookItem(std::string code, Book b);
  BookStatus status() const { return state_->status(); }
  void setState(std::unique_ptr<BookItemState> s) { state_ = std::move(s); }
  void checkout(const std::string& memberId, TimePoint now) { state_->checkout(*this, memberId, now); }
  void returnItem() { state_->returnItem(*this); }
  void hold(const std::string& memberId) { state_->hold(*this, memberId); }
private:
  std::unique_ptr<BookItemState> state_;
};

class AvailableState : public BookItemState {
public:
  BookStatus status() const override { return BookStatus::Available; }
  void checkout(BookItem& i, const std::string&, TimePoint now) override;
  void hold(BookItem& i, const std::string& memberId) override;
};
class LoanedState : public BookItemState {
public:
  BookStatus status() const override { return BookStatus::Loaned; }
  void returnItem(BookItem& i) override;
};
class ReservedState : public BookItemState {
public:
  BookStatus status() const override { return BookStatus::Reserved; }
  void checkout(BookItem& i, const std::string& memberId, TimePoint now) override;
};

BookItem::BookItem(std::string code, Book b)
  : barcode(std::move(code)), book(std::move(b)), state_(std::make_unique<AvailableState>()) {}

// NOTE: setState is always the last statement (it destroys the current state object).
void AvailableState::checkout(BookItem& i, const std::string&, TimePoint now) {
  i.dueDate = now + Days(24 * LOAN_DAYS);
  i.setState(std::make_unique<LoanedState>());
}
void AvailableState::hold(BookItem& i, const std::string& memberId) {
  i.heldFor = memberId;
  i.setState(std::make_unique<ReservedState>());
}
void LoanedState::returnItem(BookItem& i) {
  i.dueDate = TimePoint{};
  i.setState(std::make_unique<AvailableState>());
}
void ReservedState::checkout(BookItem& i, const std::string& memberId, TimePoint now) {
  if (i.heldFor != memberId) throw LibraryError("item is on hold for another member");
  i.heldFor.clear();
  i.dueDate = now + Days(24 * LOAN_DAYS);
  i.setState(std::make_unique<LoanedState>());
}

// ---------- Facade ----------
class Library {
  double finePerDay_;
  std::map<std::string, Book> catalog_;
  std::map<std::string, BookItem> items_;
  std::map<std::string, Member> members_;
  std::map<std::string, BookLending> lendings_;  // active, by barcode
  std::map<std::string, std::deque<BookReservation>> waitlists_;
  std::vector<NotificationObserver*> observers_;
  int seq_ = 0;

  BookItem& item(const std::string& b) {
    auto it = items_.find(b); if (it == items_.end()) throw LibraryError("unknown barcode"); return it->second;
  }
  Member& member(const std::string& id) {
    auto it = members_.find(id); if (it == members_.end()) throw LibraryError("unknown member"); return it->second;
  }
  void notify(const Member& m, const std::string& msg) { for (auto* o : observers_) o->update(m, msg); }

  void assignToWaiter(BookItem& it) {
    if (it.status() != BookStatus::Available) return;
    for (auto& r : waitlists_[it.book.isbn]) {
      if (r.status == ReservationStatus::Waiting) {
        Member& m = member(r.memberId);
        it.hold(m.id); r.status = ReservationStatus::Ready;
        notify(m, "'" + it.book.title + "' is ready for pickup");
        return;
      }
    }
  }
  void fulfil(const std::string& memberId, const std::string& isbn) {
    for (auto& r : waitlists_[isbn])
      if (r.memberId == memberId && r.status == ReservationStatus::Ready) { r.status = ReservationStatus::Fulfilled; return; }
  }

public:
  explicit Library(double finePerDay = 1.0) : finePerDay_(finePerDay) {}
  void addObserver(NotificationObserver* o) { observers_.push_back(o); }
  void registerMember(Member m) { members_[m.id] = std::move(m); }

  // admin
  void addBookItem(const Book& book, const std::string& barcode) {
    if (items_.count(barcode)) throw LibraryError("duplicate barcode");
    auto cat = catalog_.emplace(book.isbn, book).first;
    auto it = items_.emplace(barcode, BookItem(barcode, cat->second)).first;
    assignToWaiter(it->second);
  }
  void updateBook(const Book& book) {
    if (!catalog_.count(book.isbn)) throw LibraryError("unknown isbn");
    catalog_[book.isbn] = book;
    for (auto& [code, it] : items_) if (it.book.isbn == book.isbn) it.book = book;
  }
  void removeBookItem(const std::string& barcode) {
    if (item(barcode).status() != BookStatus::Available) throw LibraryError("only available copies can be removed");
    items_.erase(barcode);
  }

  static bool contains(std::string hay, std::string needle) {
    auto low = [](std::string s) { std::transform(s.begin(), s.end(), s.begin(), ::tolower); return s; };
    return low(hay).find(low(needle)) != std::string::npos;
  }
  // empty string = "no filter"
  std::vector<Book> search(const std::string& title = "", const std::string& author = "",
                           const std::string& subject = "", const std::string& published = "") const {
    std::vector<Book> out;
    for (auto& [isbn, b] : catalog_) {
      if (!title.empty() && !contains(b.title, title)) continue;
      if (!author.empty() && !contains(b.author, author)) continue;
      if (!subject.empty() && !contains(b.subject, subject)) continue;
      if (!published.empty() && b.published != published) continue;
      out.push_back(b);
    }
    return out;
  }

  BookLending checkout(const std::string& memberId, const std::string& barcode, TimePoint now) {
    Member& m = member(memberId); BookItem& it = item(barcode);
    if (!m.canBorrow()) throw LibraryError("borrow limit reached");
    it.checkout(m.id, now);
    BookLending l{"L" + std::to_string(++seq_), barcode, m.id, now, it.dueDate};
    lendings_[barcode] = l; m.active.push_back(barcode);
    fulfil(m.id, it.book.isbn);
    return l;
  }

  std::unique_ptr<Fine> returnItem(const std::string& barcode, TimePoint now) {
    auto lit = lendings_.find(barcode);
    if (lit == lendings_.end()) throw LibraryError("item is not on loan");
    BookLending l = lit->second; lendings_.erase(lit);
    BookItem& it = item(barcode); Member& m = member(l.memberId);
    m.active.erase(std::remove(m.active.begin(), m.active.end(), barcode), m.active.end());
    it.returnItem();
    std::unique_ptr<Fine> fine;
    if (int days = l.overdueDays(now); days > 0) {
      fine = std::make_unique<Fine>(Fine{l.id, m.id, days, days * finePerDay_});
      m.fines.push_back(*fine);
      notify(m, "Fine of " + std::to_string(fine->amount) + " for " + std::to_string(days) + " overdue day(s)");
    }
    assignToWaiter(it);
    return fine;
  }

  BookReservation reserve(const std::string& memberId, const std::string& isbn, TimePoint now) {
    Member& m = member(memberId);
    bool any = false, available = false;
    for (auto& [code, it] : items_)
      if (it.book.isbn == isbn) { any = true; if (it.status() == BookStatus::Available) available = true; }
    if (!any) throw LibraryError("unknown book");
    if (available) throw LibraryError("a copy is available - borrow it instead");
    auto& q = waitlists_[isbn];
    for (auto& r : q)
      if (r.memberId == m.id && r.status != ReservationStatus::Fulfilled) throw LibraryError("already reserved");
    q.push_back({"R" + std::to_string(++seq_), isbn, m.id, now});
    return q.back();
  }

  int sendDueReminders(TimePoint now) {
    int sent = 0;
    for (auto& [code, l] : lendings_) {
      auto remaining = std::chrono::duration_cast<std::chrono::hours>(l.dueDate - now).count();
      if (!l.reminded && remaining >= 0 && remaining <= REMINDER_DAYS * 24) {
        notify(member(l.memberId), "'" + item(code).book.title + "' is due soon");
        l.reminded = true; ++sent;
      }
    }
    return sent;
  }
};
`

const goCode = `package library

import (
  "errors"
  "fmt"
  "math"
  "strings"
  "time"
)

const (
  LoanDays      = 14
  MaxActive     = 5
  ReminderDays  = 2
  FinePerDayDef = 1.0
)

type BookStatus string

const (
  Available BookStatus = "AVAILABLE"
  Loaned    BookStatus = "LOANED"
  Reserved  BookStatus = "RESERVED"
)

type ReservationStatus string

const (
  Waiting   ReservationStatus = "WAITING"
  Ready     ReservationStatus = "READY"
  Fulfilled ReservationStatus = "FULFILLED"
)

type Book struct {
  ISBN, Title, Author, Subject string
  Published                    string // ISO yyyy-mm-dd
}

type Fine struct {
  LendingID, MemberID string
  DaysOverdue         int
  Amount              float64
  Paid                bool
}

type BookReservation struct {
  ID, ISBN, MemberID string
  CreatedAt          time.Time
  Status             ReservationStatus
}

type BookLending struct {
  ID, Barcode, MemberID string
  BorrowedAt, DueDate   time.Time
  ReturnedAt            *time.Time
  Reminded              bool
}

func (l *BookLending) OverdueDays(now time.Time) int {
  if !now.After(l.DueDate) {
    return 0
  }
  return int(math.Ceil(now.Sub(l.DueDate).Hours() / 24))
}

type Member struct {
  ID, Name, Email string
  Active          []*BookLending
  Fines           []Fine
}

func (m *Member) CanBorrow() bool { return len(m.Active) < MaxActive }

// ---------- Observer ----------
type NotificationObserver interface {
  Update(m *Member, message string)
}

type ConsoleNotifier struct{ Sent []string }

func (c *ConsoleNotifier) Update(m *Member, msg string) {
  line := "[notify " + m.Email + "] " + msg
  c.Sent = append(c.Sent, line)
  fmt.Println(line)
}

// ---------- State ----------
type BookItemState interface {
  Status() BookStatus
  Checkout(i *BookItem, m *Member, now time.Time) error
  Return(i *BookItem) error
  Hold(i *BookItem, m *Member) error
}

type baseState struct{ status BookStatus }

func (b baseState) Status() BookStatus { return b.status }
func (b baseState) Checkout(*BookItem, *Member, time.Time) error {
  return fmt.Errorf("cannot check out an item that is %s", b.status)
}
func (b baseState) Return(*BookItem) error {
  return fmt.Errorf("cannot return an item that is %s", b.status)
}
func (b baseState) Hold(*BookItem, *Member) error {
  return fmt.Errorf("cannot hold an item that is %s", b.status)
}

type availableState struct{ baseState }
type loanedState struct{ baseState }
type reservedState struct{ baseState }

func newAvailable() BookItemState { return availableState{baseState{Available}} }
func newLoaned() BookItemState    { return loanedState{baseState{Loaned}} }
func newReserved() BookItemState  { return reservedState{baseState{Reserved}} }

func (availableState) Checkout(i *BookItem, _ *Member, now time.Time) error {
  d := now.AddDate(0, 0, LoanDays)
  i.DueDate = &d
  i.state = newLoaned()
  return nil
}
func (availableState) Hold(i *BookItem, m *Member) error {
  i.HeldFor = m.ID
  i.state = newReserved()
  return nil
}
func (loanedState) Return(i *BookItem) error {
  i.DueDate = nil
  i.state = newAvailable()
  return nil
}
func (reservedState) Checkout(i *BookItem, m *Member, now time.Time) error {
  if i.HeldFor != m.ID {
    return errors.New("item is on hold for another member")
  }
  i.HeldFor = ""
  d := now.AddDate(0, 0, LoanDays)
  i.DueDate = &d
  i.state = newLoaned()
  return nil
}

type BookItem struct {
  Barcode string
  Book    Book
  DueDate *time.Time
  HeldFor string
  state   BookItemState
}

func NewBookItem(barcode string, b Book) *BookItem {
  return &BookItem{Barcode: barcode, Book: b, state: newAvailable()}
}
func (i *BookItem) Status() BookStatus                          { return i.state.Status() }
func (i *BookItem) Checkout(m *Member, now time.Time) error      { return i.state.Checkout(i, m, now) }
func (i *BookItem) ReturnItem() error                            { return i.state.Return(i) }
func (i *BookItem) Hold(m *Member) error                         { return i.state.Hold(i, m) }

// ---------- Facade ----------
type Library struct {
  finePerDay float64
  catalog    map[string]Book
  order      []string
  items      map[string]*BookItem
  members    map[string]*Member
  lendings   map[string]*BookLending
  waitlists  map[string][]*BookReservation
  observers  []NotificationObserver
  seq        int
}

func NewLibrary(finePerDay float64) *Library {
  return &Library{
    finePerDay: finePerDay, catalog: map[string]Book{}, items: map[string]*BookItem{},
    members: map[string]*Member{}, lendings: map[string]*BookLending{},
    waitlists: map[string][]*BookReservation{},
  }
}

func (l *Library) AddObserver(o NotificationObserver) { l.observers = append(l.observers, o) }
func (l *Library) RegisterMember(m *Member)           { l.members[m.ID] = m }

func (l *Library) AddBookItem(b Book, barcode string) error {
  if _, ok := l.items[barcode]; ok {
    return errors.New("duplicate barcode")
  }
  if _, ok := l.catalog[b.ISBN]; !ok {
    l.catalog[b.ISBN] = b
    l.order = append(l.order, b.ISBN)
  }
  it := NewBookItem(barcode, l.catalog[b.ISBN])
  l.items[barcode] = it
  l.assignToWaiter(it)
  return nil
}

func (l *Library) UpdateBook(b Book) error {
  if _, ok := l.catalog[b.ISBN]; !ok {
    return errors.New("unknown isbn")
  }
  l.catalog[b.ISBN] = b
  for _, it := range l.items {
    if it.Book.ISBN == b.ISBN {
      it.Book = b
    }
  }
  return nil
}

func (l *Library) RemoveBookItem(barcode string) error {
  it, ok := l.items[barcode]
  if !ok {
    return errors.New("unknown barcode")
  }
  if it.Status() != Available {
    return errors.New("only available copies can be removed")
  }
  delete(l.items, barcode)
  return nil
}

// Empty string means "no filter".
func (l *Library) Search(title, author, subject, published string) []Book {
  has := func(hay, needle string) bool {
    return needle == "" || strings.Contains(strings.ToLower(hay), strings.ToLower(needle))
  }
  var out []Book
  for _, isbn := range l.order {
    b := l.catalog[isbn]
    if has(b.Title, title) && has(b.Author, author) && has(b.Subject, subject) &&
      (published == "" || b.Published == published) {
      out = append(out, b)
    }
  }
  return out
}

func (l *Library) Checkout(memberID, barcode string, now time.Time) (*BookLending, error) {
  m, ok := l.members[memberID]
  if !ok {
    return nil, errors.New("unknown member")
  }
  it, ok := l.items[barcode]
  if !ok {
    return nil, errors.New("unknown barcode")
  }
  if !m.CanBorrow() {
    return nil, errors.New("borrow limit reached")
  }
  if err := it.Checkout(m, now); err != nil {
    return nil, err
  }
  l.seq++
  ln := &BookLending{ID: fmt.Sprintf("L%d", l.seq), Barcode: barcode, MemberID: m.ID, BorrowedAt: now, DueDate: *it.DueDate}
  l.lendings[barcode] = ln
  m.Active = append(m.Active, ln)
  l.fulfil(m.ID, it.Book.ISBN)
  return ln, nil
}

func (l *Library) ReturnItem(barcode string, now time.Time) (*Fine, error) {
  ln, ok := l.lendings[barcode]
  if !ok {
    return nil, errors.New("item is not on loan")
  }
  delete(l.lendings, barcode)
  it, m := l.items[barcode], l.members[ln.MemberID]
  ln.ReturnedAt = &now
  for idx, a := range m.Active {
    if a == ln {
      m.Active = append(m.Active[:idx], m.Active[idx+1:]...)
      break
    }
  }
  if err := it.ReturnItem(); err != nil {
    return nil, err
  }
  var fine *Fine
  if days := ln.OverdueDays(now); days > 0 {
    fine = &Fine{LendingID: ln.ID, MemberID: m.ID, DaysOverdue: days, Amount: float64(days) * l.finePerDay}
    m.Fines = append(m.Fines, *fine)
    l.notify(m, fmt.Sprintf("Fine of %.2f for %d overdue day(s)", fine.Amount, days))
  }
  l.assignToWaiter(it)
  return fine, nil
}

func (l *Library) Reserve(memberID, isbn string, now time.Time) (*BookReservation, error) {
  m, ok := l.members[memberID]
  if !ok {
    return nil, errors.New("unknown member")
  }
  any, avail := false, false
  for _, it := range l.items {
    if it.Book.ISBN == isbn {
      any = true
      if it.Status() == Available {
        avail = true
      }
    }
  }
  if !any {
    return nil, errors.New("unknown book")
  }
  if avail {
    return nil, errors.New("a copy is available - borrow it instead")
  }
  for _, r := range l.waitlists[isbn] {
    if r.MemberID == m.ID && r.Status != Fulfilled {
      return nil, errors.New("already reserved")
    }
  }
  l.seq++
  r := &BookReservation{ID: fmt.Sprintf("R%d", l.seq), ISBN: isbn, MemberID: m.ID, CreatedAt: now, Status: Waiting}
  l.waitlists[isbn] = append(l.waitlists[isbn], r)
  return r, nil
}

func (l *Library) SendDueReminders(now time.Time) int {
  sent := 0
  for code, ln := range l.lendings {
    remaining := ln.DueDate.Sub(now)
    if !ln.Reminded && remaining >= 0 && remaining <= ReminderDays*24*time.Hour {
      l.notify(l.members[ln.MemberID], "'"+l.items[code].Book.Title+"' is due "+ln.DueDate.Format("2006-01-02"))
      ln.Reminded = true
      sent++
    }
  }
  return sent
}

func (l *Library) assignToWaiter(it *BookItem) {
  if it.Status() != Available {
    return
  }
  for _, r := range l.waitlists[it.Book.ISBN] {
    if r.Status == Waiting {
      m := l.members[r.MemberID]
      if it.Hold(m) == nil {
        r.Status = Ready
        l.notify(m, "'"+it.Book.Title+"' is ready for pickup")
      }
      return
    }
  }
}

func (l *Library) fulfil(memberID, isbn string) {
  for _, r := range l.waitlists[isbn] {
    if r.MemberID == memberID && r.Status == Ready {
      r.Status = Fulfilled
      return
    }
  }
}

func (l *Library) notify(m *Member, msg string) {
  for _, o := range l.observers {
    o.Update(m, msg)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

public enum BookStatus { Available, Loaned, Reserved }
public enum ReservationStatus { Waiting, Ready, Fulfilled }

public class LibraryException : Exception { public LibraryException(string m) : base(m) {} }

public sealed record Book(string Isbn, string Title, string Author, string Subject, DateOnly Published);

public sealed class Fine {
  public string LendingId { get; init; } = ""; public string MemberId { get; init; } = "";
  public int DaysOverdue { get; init; } public decimal Amount { get; init; } public bool Paid { get; set; }
}

public sealed class BookReservation {
  public string Id { get; } = Guid.NewGuid().ToString();
  public string Isbn { get; init; } = ""; public string MemberId { get; init; } = "";
  public DateTime CreatedAt { get; init; }
  public ReservationStatus Status { get; set; } = ReservationStatus.Waiting;
}

public sealed class BookLending {
  public string Id { get; } = Guid.NewGuid().ToString();
  public string Barcode { get; init; } = ""; public string MemberId { get; init; } = "";
  public DateTime BorrowedAt { get; init; } public DateTime DueDate { get; init; }
  public DateTime? ReturnedAt { get; set; } public bool Reminded { get; set; }
  public int OverdueDays(DateTime now) =>
    now <= DueDate ? 0 : (int)Math.Ceiling((now - DueDate).TotalDays);
}

public sealed class Member {
  public const int MaxActive = 5;
  public string Id { get; } public string Name { get; } public string Email { get; }
  public List<BookLending> Active { get; } = new();
  public List<Fine> Fines { get; } = new();
  public Member(string id, string name, string email) { Id = id; Name = name; Email = email; }
  public bool CanBorrow() => Active.Count < MaxActive;
}

// ---------- Observer ----------
public interface INotificationObserver { void Update(Member member, string message); }

public sealed class ConsoleNotifier : INotificationObserver {
  public List<string> Sent { get; } = new();
  public void Update(Member m, string message) {
    var line = "[notify " + m.Email + "] " + message;
    Sent.Add(line); Console.WriteLine(line);
  }
}

// ---------- State ----------
public interface IBookItemState {
  BookStatus Status { get; }
  void Checkout(BookItem item, Member m, DateTime now);
  void ReturnItem(BookItem item);
  void Hold(BookItem item, Member m);
}

public abstract class BaseState : IBookItemState {
  public abstract BookStatus Status { get; }
  public virtual void Checkout(BookItem i, Member m, DateTime now) =>
    throw new LibraryException("cannot check out an item that is " + Status);
  public virtual void ReturnItem(BookItem i) =>
    throw new LibraryException("cannot return an item that is " + Status);
  public virtual void Hold(BookItem i, Member m) =>
    throw new LibraryException("cannot hold an item that is " + Status);
}

public sealed class AvailableState : BaseState {
  public override BookStatus Status => BookStatus.Available;
  public override void Checkout(BookItem i, Member m, DateTime now) {
    i.DueDate = now.AddDays(Library.LoanDays); i.SetState(new LoanedState());
  }
  public override void Hold(BookItem i, Member m) { i.HeldFor = m.Id; i.SetState(new ReservedState()); }
}

public sealed class LoanedState : BaseState {
  public override BookStatus Status => BookStatus.Loaned;
  public override void ReturnItem(BookItem i) { i.DueDate = null; i.SetState(new AvailableState()); }
}

public sealed class ReservedState : BaseState {
  public override BookStatus Status => BookStatus.Reserved;
  public override void Checkout(BookItem i, Member m, DateTime now) {
    if (i.HeldFor != m.Id) throw new LibraryException("item is on hold for another member");
    i.HeldFor = null; i.DueDate = now.AddDays(Library.LoanDays); i.SetState(new LoanedState());
  }
}

public sealed class BookItem {
  public string Barcode { get; } public Book Book { get; set; }
  public DateTime? DueDate { get; set; } public string? HeldFor { get; set; }
  IBookItemState _state = new AvailableState();
  public BookItem(string barcode, Book book) { Barcode = barcode; Book = book; }
  public BookStatus Status => _state.Status;
  public void SetState(IBookItemState s) => _state = s;
  public void Checkout(Member m, DateTime now) => _state.Checkout(this, m, now);
  public void ReturnItem() => _state.ReturnItem(this);
  public void Hold(Member m) => _state.Hold(this, m);
}

// ---------- Facade ----------
public sealed class Library {
  public const int LoanDays = 14, ReminderDays = 2;
  readonly decimal _finePerDay;
  readonly Dictionary<string, Book> _catalog = new();
  readonly Dictionary<string, BookItem> _items = new();
  readonly Dictionary<string, Member> _members = new();
  readonly Dictionary<string, BookLending> _lendings = new();
  readonly Dictionary<string, List<BookReservation>> _waitlists = new();
  readonly List<INotificationObserver> _observers = new();

  public Library(decimal finePerDay = 1m) { _finePerDay = finePerDay; }
  public void AddObserver(INotificationObserver o) => _observers.Add(o);
  public void RegisterMember(Member m) => _members[m.Id] = m;

  // admin
  public void AddBookItem(Book book, string barcode) {
    if (_items.ContainsKey(barcode)) throw new LibraryException("duplicate barcode");
    _catalog.TryAdd(book.Isbn, book);
    var item = new BookItem(barcode, _catalog[book.Isbn]);
    _items[barcode] = item;
    AssignToWaiter(item);
  }
  public void UpdateBook(Book book) {
    if (!_catalog.ContainsKey(book.Isbn)) throw new LibraryException("unknown isbn");
    _catalog[book.Isbn] = book;
    foreach (var it in _items.Values.Where(i => i.Book.Isbn == book.Isbn)) it.Book = book;
  }
  public void RemoveBookItem(string barcode) {
    if (Item(barcode).Status != BookStatus.Available)
      throw new LibraryException("only available copies can be removed");
    _items.Remove(barcode);
  }

  public List<Book> Search(string? title = null, string? author = null, string? subject = null, DateOnly? published = null) {
    static bool Has(string hay, string? needle) =>
      needle is null || hay.Contains(needle, StringComparison.OrdinalIgnoreCase);
    return _catalog.Values.Where(b =>
      Has(b.Title, title) && Has(b.Author, author) && Has(b.Subject, subject) &&
      (published is null || b.Published == published)).ToList();
  }

  public BookLending Checkout(string memberId, string barcode, DateTime now) {
    var m = Member(memberId); var item = Item(barcode);
    if (!m.CanBorrow()) throw new LibraryException("borrow limit reached");
    item.Checkout(m, now);
    var l = new BookLending { Barcode = barcode, MemberId = m.Id, BorrowedAt = now, DueDate = item.DueDate!.Value };
    _lendings[barcode] = l; m.Active.Add(l);
    Fulfil(m.Id, item.Book.Isbn);
    return l;
  }

  public Fine? ReturnItem(string barcode, DateTime now) {
    if (!_lendings.Remove(barcode, out var l)) throw new LibraryException("item is not on loan");
    var item = Item(barcode); var m = Member(l.MemberId);
    l.ReturnedAt = now; m.Active.Remove(l); item.ReturnItem();
    Fine? fine = null;
    var days = l.OverdueDays(now);
    if (days > 0) {
      fine = new Fine { LendingId = l.Id, MemberId = m.Id, DaysOverdue = days, Amount = days * _finePerDay };
      m.Fines.Add(fine);
      Notify(m, "Fine of " + fine.Amount.ToString("0.00") + " for " + days + " overdue day(s)");
    }
    AssignToWaiter(item);
    return fine;
  }

  public BookReservation Reserve(string memberId, string isbn, DateTime now) {
    var m = Member(memberId);
    var copies = _items.Values.Where(i => i.Book.Isbn == isbn).ToList();
    if (copies.Count == 0) throw new LibraryException("unknown book");
    if (copies.Any(i => i.Status == BookStatus.Available))
      throw new LibraryException("a copy is available - borrow it instead");
    if (!_waitlists.TryGetValue(isbn, out var q)) _waitlists[isbn] = q = new List<BookReservation>();
    if (q.Any(r => r.MemberId == m.Id && r.Status != ReservationStatus.Fulfilled))
      throw new LibraryException("already reserved");
    var r = new BookReservation { Isbn = isbn, MemberId = m.Id, CreatedAt = now };
    q.Add(r);
    return r;
  }

  public int SendDueReminders(DateTime now) {
    int sent = 0;
    foreach (var l in _lendings.Values) {
      var remaining = l.DueDate - now;
      if (!l.Reminded && remaining >= TimeSpan.Zero && remaining <= TimeSpan.FromDays(ReminderDays)) {
        Notify(Member(l.MemberId), "'" + _items[l.Barcode].Book.Title + "' is due " + l.DueDate.ToString("yyyy-MM-dd"));
        l.Reminded = true; sent++;
      }
    }
    return sent;
  }

  void AssignToWaiter(BookItem item) {
    if (item.Status != BookStatus.Available) return;
    if (!_waitlists.TryGetValue(item.Book.Isbn, out var q)) return;
    var r = q.FirstOrDefault(x => x.Status == ReservationStatus.Waiting);
    if (r is null) return;
    var m = Member(r.MemberId);
    item.Hold(m); r.Status = ReservationStatus.Ready;
    Notify(m, "'" + item.Book.Title + "' is ready for pickup");
  }
  void Fulfil(string memberId, string isbn) {
    if (!_waitlists.TryGetValue(isbn, out var q)) return;
    var r = q.FirstOrDefault(x => x.MemberId == memberId && x.Status == ReservationStatus.Ready);
    if (r is not null) r.Status = ReservationStatus.Fulfilled;
  }
  void Notify(Member m, string msg) { foreach (var o in _observers) o.Update(m, msg); }
  BookItem Item(string b) => _items.TryGetValue(b, out var i) ? i : throw new LibraryException("unknown barcode");
  Member Member(string id) => _members.TryGetValue(id, out var m) ? m : throw new LibraryException("unknown member");
}
`

export const libraryManagementSolution: ProblemSolution = {
  slug: 'library-management',
  title: 'Library Management System - Solution',
  overview: {
    introduction:
      'Design a library that catalogues books with multiple physical copies, lets members borrow and return them, reserves a title when every copy is out, charges fines for late returns, and notifies members about due dates and reservations. The interview is about separating the abstract Book from the physical BookItem, modelling the copy lifecycle cleanly, and keeping notifications decoupled from core borrowing logic.',
    constraints: [
      'Members can search by title, author, subject, and publication date.',
      'A title may have many physical copies; each copy is borrowed independently.',
      'A reservation is only allowed when every copy of the title is currently borrowed or on hold.',
      'Overdue returns incur a fine; admins can add, update, and remove books.',
      'Members are notified about upcoming due dates and about reservations becoming available.',
    ],
    assumptions: [
      'Loan period is 14 days; each member can hold at most 5 active loans (both configurable).',
      'Fine is a flat per-day rate on each started overdue day (ceil), computed on return.',
      'Reservations are served first-come-first-served; a returned copy is held for the first waiting member.',
      'Search criteria are ANDed; text criteria are case-insensitive substrings and publication date is an exact match.',
      'Payment of fines is out of scope - a Fine is recorded against the member.',
    ],
    clarificationQuestions: [
      'Are books borrowed for a fixed period, and can loans be renewed?',
      'How long is a reserved copy held before it goes to the next member?',
      'Is the fine flat per day, capped by the book price, or tiered?',
      'Can members with unpaid fines still borrow?',
      'Which notification channels are needed (email, SMS, push), and must they be pluggable?',
      'Do we need reference-only copies that cannot leave the library?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Underline the nouns: books, members, borrowing, reservation, fine, notification. The key insight is that "a book" means two things - the catalog entry (title, author, ISBN) and the physical copy you can hold. Splitting Book from BookItem unlocks multiple copies, per-copy status, and per-copy due dates. Then ask what changes over time (copy status) and what must stay decoupled (notifications).',
    breakdown: [
      'Separate catalog metadata (Book) from physical copies (BookItem).',
      'Model a copy lifecycle (Available → Loaned → Available / Reserved) - a natural State pattern.',
      'Treat a loan (BookLending) and a waitlist entry (BookReservation) as records with their own lifecycle.',
      'Compute fines from the lending record on return; keep the Fine as a separate entity.',
      'Push notifications through an Observer so channels can be added without touching Library.',
      'Expose a single Library façade for search/borrow/return/reserve and admin operations.',
    ],
    entities: [
      { name: 'Library', responsibility: 'Façade over catalog, members, lendings, waitlists; orchestrates workflows.' },
      { name: 'Book', responsibility: 'Immutable catalog metadata shared by all copies of a title.' },
      { name: 'BookItem', responsibility: 'One physical copy; delegates behaviour to its BookItemState.' },
      { name: 'Member', responsibility: 'Holds active loans and fines; enforces borrow limit.' },
      { name: 'BookLending', responsibility: 'Borrow record with due date and overdue calculation.' },
      { name: 'BookReservation', responsibility: 'Waitlist entry for a title with WAITING/READY/FULFILLED status.' },
      { name: 'Fine', responsibility: 'Amount owed by a member for an overdue return.' },
      { name: 'NotificationObserver', responsibility: 'Abstraction for any channel that wants to be told about events.' },
    ],
    relationships: [
      'Library composes BookItems (copies live and die with the library) and aggregates Members.',
      'Many BookItems reference one Book (many-to-one association).',
      'BookItem aggregates a BookItemState that it swaps at runtime.',
      'BookLending links a Member to a BookItem by id; Member keeps its active lendings.',
      'Library aggregates NotificationObservers and notifies them on due-date and reservation events.',
    ],
    patternsAndOop: [
      'State: AvailableState / LoanedState / ReservedState own the legal transitions of a copy.',
      'Observer: ConsoleNotifier (and future Email/SMS) subscribe to Library events.',
      'Façade: Library is the only entry point used by UI/admin code.',
      'Encapsulation: Member.canBorrow and BookLending.overdueDays keep rules next to their data.',
    ],
    stepByStep: [
      'Clarify loan length, borrow limit, fine formula and reservation behaviour.',
      'Sketch Book vs BookItem and the Member / Lending / Reservation records.',
      'Draw the copy state diagram and decide who performs each transition.',
      'Implement checkout and return, including holding the copy for the first waiter.',
      'Add search, fines and reminders; wire the Observer.',
      'Walk through reserve → return → pickup to prove the waitlist path.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Library orchestrates; Book describes; BookItem behaves. A copy’s legal transitions live in State objects so Library never has an if-chain on status. Reservations and lendings are first-class records, fines are derived from lendings, and notifications leave through an Observer.',
    classResponsibilities: [
      { name: 'Library', responsibility: 'Search, borrow, return, reserve, admin CRUD and reminder dispatch.' },
      { name: 'Book', responsibility: 'Catalog metadata: isbn, title, author, subject, publication date.' },
      { name: 'BookItem', responsibility: 'Copy identity (barcode) + current state, due date and hold owner.' },
      { name: 'BookItemState implementations', responsibility: 'Validate and perform transitions for Available, Loaned and Reserved.' },
      { name: 'Member', responsibility: 'Borrow limit and accumulated fines.' },
      { name: 'BookLending', responsibility: 'Due date and overdue-days calculation.' },
      { name: 'BookReservation', responsibility: 'Position/status of a waiting member for a title.' },
      { name: 'Fine', responsibility: 'Record of overdue days and amount.' },
      { name: 'ConsoleNotifier', responsibility: 'Sample observer; swap for Email/SMS.' },
    ],
    interfacesAndAbstractions: [
      'BookItemState isolates behaviour that varies by copy status.',
      'NotificationObserver decouples borrowing logic from delivery channels.',
    ],
    relationships: [
      'Composition Library◆BookItem: copies cannot exist outside the library.',
      'Aggregation Library◇Member / Book / NotificationObserver: independent lifetimes, shared references.',
      'Association BookItem→Book: many copies share one catalog entry.',
      'Realization state classes → BookItemState.',
    ],
    solid: [
      'SRP: Book holds metadata only; BookItem handles copy lifecycle; Library coordinates.',
      'OCP: add a new status (e.g. LOST, IN_REPAIR) by adding a state class, not editing Library.',
      'LSP: every BookItemState can be swapped in a BookItem without breaking callers.',
      'ISP: observers implement a one-method interface.',
      'DIP: Library depends on NotificationObserver, not on email or SMS code.',
    ],
    patterns: [
      { name: 'State', why: 'Copy behaviour (checkout/return/hold) depends on status; eliminates status switch statements.' },
      { name: 'Observer', why: 'Add new notification channels without modifying Library.' },
      { name: 'Façade', why: 'Single entry point for members and admins.' },
    ],
    decisions: [
      {
        decision: 'Split Book (metadata) from BookItem (copy).',
        rationale: 'Supports multiple copies, per-copy status and due dates, and title-level search and reservation.',
        tradeoff: 'One extra class and a join when reporting.',
      },
      {
        decision: 'Hold a returned copy (RESERVED state) for the first waiter instead of making it AVAILABLE.',
        rationale: 'Guarantees FIFO fairness even if someone else walks up to the desk.',
        tradeoff: 'Needs a hold-expiry policy so copies are not blocked forever.',
      },
      {
        decision: 'Compute the fine at return time from BookLending.',
        rationale: 'Simple and deterministic; no background accrual job.',
        tradeoff: 'Members do not see an accruing balance until return; add a read-only projection if needed.',
      },
      {
        decision: 'Inject "now" into operations.',
        rationale: 'Makes due dates, fines and reminders trivially testable.',
      },
    ],
    extensibility:
      'Renewals add a state/transition on BookLending; hold expiry is a scheduled job calling a Library method; new notification channels implement NotificationObserver; reference-only copies add a ReferenceState that rejects checkout; different fine rules extract a FinePolicy strategy.',
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
      'Admin adds a Book with one or more BookItems; each starts in AvailableState.',
      'Member searches the catalog and picks an available copy.',
      'checkout validates the borrow limit, lets the copy’s state move to LOANED and stores a BookLending with a due date.',
      'If every copy is out, reserve adds a WAITING BookReservation to the title’s queue.',
      'On return, the lending closes, the copy goes AVAILABLE, a Fine is created if overdue, and the first waiter gets the copy held (RESERVED) plus a notification.',
      'The held member checks out the copy; the reservation becomes FULFILLED.',
      'A periodic job calls sendDueReminders to notify members whose loans are due soon.',
    ],
    examples: [
      {
        title: 'Reserve when the only copy is borrowed',
        input: 'Asha borrows B-1 (only copy). Ben calls reserve("111").',
        output: 'BookReservation{status=WAITING}',
        explanation:
          'All copies are LOANED, so reservation is allowed. When Asha returns, the copy transitions to RESERVED for Ben and he receives a pickup notification.',
      },
      {
        title: 'Late return with fine',
        input: 'Due 15 Jan; returned 18 Jan 00:00 (3 days late), rate 1.00/day',
        output: 'Fine{daysOverdue=3, amount=3.00}',
        explanation: 'overdueDays = ceil(3 days) = 3, fine = 3 × 1.00 and the member is notified.',
      },
      {
        title: 'Wrong member tries to take a held copy',
        input: 'Copy is RESERVED for Ben; Cara calls checkout.',
        output: 'LibraryError("item is on hold for another member")',
        explanation: 'ReservedState.checkout verifies heldFor equals the member id before allowing the transition.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you support renewing a loan?',
      answer:
        'Add Library.renew(barcode, now): reject if the title has WAITING reservations or the renewal count is exhausted, otherwise extend BookLending.dueDate. Track renewals on BookLending.',
    },
    {
      question: 'What happens if the member never picks up a held copy?',
      answer:
        'Store holdExpiresAt on BookItem and run a scheduler that releases expired holds: set the reservation to EXPIRED, move the copy to the next WAITING reservation or back to AVAILABLE.',
    },
    {
      question: 'How do you make fines pluggable?',
      answer:
        'Extract a FinePolicy interface (flat, tiered, capped at book price) and inject it into Library. BookLending.overdueDays stays a pure date calculation.',
    },
    {
      question: 'How would you search 1M books efficiently?',
      answer:
        'Keep inverted indexes on title tokens, author, subject, and a sorted structure for publication date. In production delegate to a search engine; keep the Library.search signature unchanged.',
    },
    {
      question: 'How do you make borrowing thread-safe?',
      answer:
        'Synchronize per BookItem (or per barcode lock) so two members cannot check out the same copy, and lock the member for the borrow-limit check. The state transition must be atomic with the lending insert.',
    },
    {
      question: 'How would you add new notification channels?',
      answer:
        'Implement NotificationObserver (EmailNotifier, SmsNotifier) and register it with Library.addObserver; wrap slow channels with an async queue so checkout is never blocked by delivery.',
    },
  ],
  extras: {
    edgeCases: [
      'Reserving a title with no copies, or while a copy is available.',
      'Returning an item that is not on loan.',
      'Removing a copy that is loaned or held.',
      'Member at the borrow limit tries to borrow again.',
      'Admin adds a new copy while members are waiting - it should satisfy the first waiter.',
    ],
    commonMistakes: [
      'Merging Book and BookItem into one class.',
      'A giant if/else on status inside Library instead of State objects.',
      'Sending notifications directly from borrowing code with hard-coded channels.',
      'Computing overdue from wall-clock inside the entity, making tests flaky.',
    ],
    complexity:
      'checkout/return are O(1) with hash maps (O(w) to find the first waiter). Search is O(B) for B titles without an index; reminders are O(L) over active loans.',
    testing: [
      'State transition table tests for every (state, action) pair.',
      'Fine calculation at boundary: exactly due, 1 minute late, 3 days late.',
      'Reservation FIFO with two waiters and one returned copy.',
      'Observer receives due-date and reservation notifications.',
    ],
    extensions: [
      'Renewals, hold expiry and lost-book handling.',
      'Digital copies with concurrent licences.',
      'Late-fee payment and blocking borrowing when fines exceed a threshold.',
    ],
    takeaways: [
      'Book vs BookItem is the central modelling decision.',
      'Use State for the copy lifecycle and Observer for notifications - each maps to a requirement.',
      'Inject time so rules around due dates and fines stay testable.',
    ],
  },
}
