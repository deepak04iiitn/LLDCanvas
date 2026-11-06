import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'LibraryManagementService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_libraries', 'Map<string, Library>'),
    attr('-', '_books', 'Map<string, Book>'),
    attr('-', '_book_items', 'Map<string, BookItem>'),
    attr('-', '_members', 'Map<string, Member>'),
    attr('-', '_book_reservations', 'Map<string, BookReservation>'),
  ], [
    method('+', 'createLibrary', 'name: string', 'Library'),
    method('+', 'createBook', 'name: string', 'Book'),
    method('+', 'createBookItem', 'name: string', 'BookItem'),
    method('+', 'createMember', 'name: string', 'Member'),
    method('+', 'createBookReservation', 'name: string', 'BookReservation'),
    method('+', 'getLibrary', 'id: string', 'Library'),
    method('+', 'getBook', 'id: string', 'Book'),
    method('+', 'getBookItem', 'id: string', 'BookItem'),
    method('+', 'getMember', 'id: string', 'Member'),
    method('+', 'getBookReservation', 'id: string', 'BookReservation'),
    method('+', 'closeLibrary', 'id: string', 'Library'),
  ], 'facade'),
  cls('n1', 'Library', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Book', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'BookItem', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Member', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'BookReservation', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("library-management")


class Library:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Library.id is required")
        if not name or not name.strip():
            raise ValueError("Library.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Library.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Library {self.id} has invalid status={self.status}")
        log.info("[Library.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Library {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Library.close] id=%s -> CLOSED", self.id)


class Book:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Book.id is required")
        if not name or not name.strip():
            raise ValueError("Book.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Book.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Book {self.id} has invalid status={self.status}")
        log.info("[Book.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Book {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Book.close] id=%s -> CLOSED", self.id)


class BookItem:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("BookItem.id is required")
        if not name or not name.strip():
            raise ValueError("BookItem.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[BookItem.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"BookItem {self.id} has invalid status={self.status}")
        log.info("[BookItem.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"BookItem {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[BookItem.close] id=%s -> CLOSED", self.id)


class Member:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Member.id is required")
        if not name or not name.strip():
            raise ValueError("Member.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Member.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Member {self.id} has invalid status={self.status}")
        log.info("[Member.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Member {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Member.close] id=%s -> CLOSED", self.id)


class BookReservation:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("BookReservation.id is required")
        if not name or not name.strip():
            raise ValueError("BookReservation.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[BookReservation.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"BookReservation {self.id} has invalid status={self.status}")
        log.info("[BookReservation.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"BookReservation {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[BookReservation.close] id=%s -> CLOSED", self.id)


class LibraryManagementService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._libraries: Dict[str, Library] = {}
        self._books: Dict[str, Book] = {}
        self._book_items: Dict[str, BookItem] = {}
        self._members: Dict[str, Member] = {}
        self._book_reservations: Dict[str, BookReservation] = {}
        log.info("[LibraryManagementService.__init__] system ready; managing: Library, Book, BookItem, Member, BookReservation")

    def create_library(self, name: str) -> Library:
        """UML: LibraryManagementService.create_library(name) -> Library"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Library name is required")
        with self._lock:
            item_id = f"LIB-{self._seq:04d}"
            self._seq += 1
            obj = Library(item_id, cleaned)
            obj.validate()
            self._libraries[item_id] = obj
            log.info("[LibraryManagementService.create_library] stored %s in _libraries (count=%s)", item_id, len(self._libraries))
            return obj

    def get_library(self, item_id: str) -> Library:
        with self._lock:
            obj = self._libraries.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Library id: {item_id}")
            log.info("[LibraryManagementService.get_library] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_book(self, name: str) -> Book:
        """UML: LibraryManagementService.create_book(name) -> Book"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Book name is required")
        with self._lock:
            item_id = f"BOO-{self._seq:04d}"
            self._seq += 1
            obj = Book(item_id, cleaned)
            obj.validate()
            self._books[item_id] = obj
            log.info("[LibraryManagementService.create_book] stored %s in _books (count=%s)", item_id, len(self._books))
            return obj

    def get_book(self, item_id: str) -> Book:
        with self._lock:
            obj = self._books.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Book id: {item_id}")
            log.info("[LibraryManagementService.get_book] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_book_item(self, name: str) -> BookItem:
        """UML: LibraryManagementService.create_book_item(name) -> BookItem"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("BookItem name is required")
        with self._lock:
            item_id = f"BOO-{self._seq:04d}"
            self._seq += 1
            obj = BookItem(item_id, cleaned)
            obj.validate()
            self._book_items[item_id] = obj
            log.info("[LibraryManagementService.create_book_item] stored %s in _book_items (count=%s)", item_id, len(self._book_items))
            return obj

    def get_book_item(self, item_id: str) -> BookItem:
        with self._lock:
            obj = self._book_items.get(item_id)
            if obj is None:
                raise KeyError(f"unknown BookItem id: {item_id}")
            log.info("[LibraryManagementService.get_book_item] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_member(self, name: str) -> Member:
        """UML: LibraryManagementService.create_member(name) -> Member"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Member name is required")
        with self._lock:
            item_id = f"MEM-{self._seq:04d}"
            self._seq += 1
            obj = Member(item_id, cleaned)
            obj.validate()
            self._members[item_id] = obj
            log.info("[LibraryManagementService.create_member] stored %s in _members (count=%s)", item_id, len(self._members))
            return obj

    def get_member(self, item_id: str) -> Member:
        with self._lock:
            obj = self._members.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Member id: {item_id}")
            log.info("[LibraryManagementService.get_member] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_book_reservation(self, name: str) -> BookReservation:
        """UML: LibraryManagementService.create_book_reservation(name) -> BookReservation"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("BookReservation name is required")
        with self._lock:
            item_id = f"BOO-{self._seq:04d}"
            self._seq += 1
            obj = BookReservation(item_id, cleaned)
            obj.validate()
            self._book_reservations[item_id] = obj
            log.info("[LibraryManagementService.create_book_reservation] stored %s in _book_reservations (count=%s)", item_id, len(self._book_reservations))
            return obj

    def get_book_reservation(self, item_id: str) -> BookReservation:
        with self._lock:
            obj = self._book_reservations.get(item_id)
            if obj is None:
                raise KeyError(f"unknown BookReservation id: {item_id}")
            log.info("[LibraryManagementService.get_book_reservation] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_library(self, item_id: str) -> Library:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._libraries.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Library id: {item_id}")
            log.info("[LibraryManagementService.close_library] closing %s via Library.close()", item_id)
            obj.close()
            return obj

    def list_active_librarys(self) -> List[Library]:
        with self._lock:
            active = [o for o in self._libraries.values() if o.status == "ACTIVE"]
            log.info("[LibraryManagementService.list_active_librarys] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct LibraryManagementService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = LibraryManagementService()

    log.info("========== STEP 2: Create primary Library objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_library("alpha-library")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_library("beta-library")

    log.info("========== STEP 3: Create Book (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_book("sample-book")

    log.info("========== STEP 4: Create BookItem (UML class) ==========")
    system.create_book_item("sample-book_item")

    log.info("========== STEP 5: Create Member (UML class) ==========")
    system.create_member("sample-member")

    log.info("========== STEP 6: Create BookReservation (UML class) ==========")
    system.create_book_reservation("sample-book_reservation")

    log.info("========== STEP 7: Inspect active Library list ==========")
    system.list_active_librarys()

    log.info("========== STEP 8: Close first Library ==========")
    system.close_library(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_library(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Library.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_library("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_library: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_librarys()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Library {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Library(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Library.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Library.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Library.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Library " + id + " invalid status");
    }
    System.out.println("[Library.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Library " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Library.close] id=" + id + " -> CLOSED");
  }
}


class Book {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Book(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Book.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Book.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Book.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Book " + id + " invalid status");
    }
    System.out.println("[Book.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Book " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Book.close] id=" + id + " -> CLOSED");
  }
}


class BookItem {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  BookItem(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("BookItem.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("BookItem.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[BookItem.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("BookItem " + id + " invalid status");
    }
    System.out.println("[BookItem.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("BookItem " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[BookItem.close] id=" + id + " -> CLOSED");
  }
}


class Member {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Member(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Member.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Member.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Member.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Member " + id + " invalid status");
    }
    System.out.println("[Member.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Member " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Member.close] id=" + id + " -> CLOSED");
  }
}


class BookReservation {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  BookReservation(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("BookReservation.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("BookReservation.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[BookReservation.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("BookReservation " + id + " invalid status");
    }
    System.out.println("[BookReservation.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("BookReservation " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[BookReservation.close] id=" + id + " -> CLOSED");
  }
}

public class LibraryManagementService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Library> libraries = new LinkedHashMap<>();
  private final Map<String, Book> books = new LinkedHashMap<>();
  private final Map<String, BookItem> book_items = new LinkedHashMap<>();
  private final Map<String, Member> members = new LinkedHashMap<>();
  private final Map<String, BookReservation> book_reservations = new LinkedHashMap<>();

  public LibraryManagementService() {
    System.out.println("[LibraryManagementService.__init__] system ready");
  }

  public Library createLibrary(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Library name required");
    }
    lock.lock();
    try {
      String id = String.format("LIB-%04d", seq++);
      Library obj = new Library(id, name.trim());
      obj.validate();
      libraries.put(id, obj);
      System.out.println("[LibraryManagementService.createLibrary] stored " + id + " count=" + libraries.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Library getLibrary(String id) {
    lock.lock();
    try {
      Library obj = libraries.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Library id: " + id);
      }
      System.out.println("[LibraryManagementService.getLibrary] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Book createBook(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Book name required");
    }
    lock.lock();
    try {
      String id = String.format("BOO-%04d", seq++);
      Book obj = new Book(id, name.trim());
      obj.validate();
      books.put(id, obj);
      System.out.println("[LibraryManagementService.createBook] stored " + id + " count=" + books.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Book getBook(String id) {
    lock.lock();
    try {
      Book obj = books.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Book id: " + id);
      }
      System.out.println("[LibraryManagementService.getBook] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public BookItem createBookItem(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("BookItem name required");
    }
    lock.lock();
    try {
      String id = String.format("BOO-%04d", seq++);
      BookItem obj = new BookItem(id, name.trim());
      obj.validate();
      book_items.put(id, obj);
      System.out.println("[LibraryManagementService.createBookItem] stored " + id + " count=" + book_items.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public BookItem getBookItem(String id) {
    lock.lock();
    try {
      BookItem obj = book_items.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown BookItem id: " + id);
      }
      System.out.println("[LibraryManagementService.getBookItem] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Member createMember(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Member name required");
    }
    lock.lock();
    try {
      String id = String.format("MEM-%04d", seq++);
      Member obj = new Member(id, name.trim());
      obj.validate();
      members.put(id, obj);
      System.out.println("[LibraryManagementService.createMember] stored " + id + " count=" + members.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Member getMember(String id) {
    lock.lock();
    try {
      Member obj = members.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Member id: " + id);
      }
      System.out.println("[LibraryManagementService.getMember] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public BookReservation createBookReservation(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("BookReservation name required");
    }
    lock.lock();
    try {
      String id = String.format("BOO-%04d", seq++);
      BookReservation obj = new BookReservation(id, name.trim());
      obj.validate();
      book_reservations.put(id, obj);
      System.out.println("[LibraryManagementService.createBookReservation] stored " + id + " count=" + book_reservations.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public BookReservation getBookReservation(String id) {
    lock.lock();
    try {
      BookReservation obj = book_reservations.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown BookReservation id: " + id);
      }
      System.out.println("[LibraryManagementService.getBookReservation] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Library closeLibrary(String id) {
    lock.lock();
    try {
      Library obj = libraries.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Library id: " + id);
      }
      System.out.println("[LibraryManagementService.closeLibrary] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Library> listActiveLibrarys() {
    lock.lock();
    try {
      List<Library> out = new ArrayList<>();
      for (Library o : libraries.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[LibraryManagementService.listActiveLibrarys] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct LibraryManagementService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    LibraryManagementService system = new LibraryManagementService();
    System.out.println("========== STEP 2: Create Library objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Library first = system.createLibrary("alpha-library");
    system.createLibrary("beta-library");
    System.out.println("========== STEP 3: Create Book ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createBook("sample-book");
    System.out.println("========== STEP 4: Create BookItem ==========");
    system.createBookItem("sample-book_item");
    System.out.println("========== STEP 5: Create Member ==========");
    system.createMember("sample-member");
    System.out.println("========== STEP 6: Create BookReservation ==========");
    system.createBookReservation("sample-book_reservation");
    System.out.println("========== Inspect active list ==========");
    system.listActiveLibrarys();
    System.out.println("========== Close first Library ==========");
    system.closeLibrary(first.getId());
    try {
      system.closeLibrary(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getLibrary("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Library {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Library.id required')
    }

    if (!name?.trim()) {
      throw new Error('Library.name required')
    }
    console.log(\`[Library.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Library \${this.id} invalid status\`)
    }
    console.log(\`[Library.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Library \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Library.close] id=\${this.id} -> CLOSED\`)
  }
}


class Book {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Book.id required')
    }

    if (!name?.trim()) {
      throw new Error('Book.name required')
    }
    console.log(\`[Book.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Book \${this.id} invalid status\`)
    }
    console.log(\`[Book.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Book \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Book.close] id=\${this.id} -> CLOSED\`)
  }
}


class BookItem {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('BookItem.id required')
    }

    if (!name?.trim()) {
      throw new Error('BookItem.name required')
    }
    console.log(\`[BookItem.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`BookItem \${this.id} invalid status\`)
    }
    console.log(\`[BookItem.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`BookItem \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[BookItem.close] id=\${this.id} -> CLOSED\`)
  }
}


class Member {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Member.id required')
    }

    if (!name?.trim()) {
      throw new Error('Member.name required')
    }
    console.log(\`[Member.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Member \${this.id} invalid status\`)
    }
    console.log(\`[Member.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Member \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Member.close] id=\${this.id} -> CLOSED\`)
  }
}


class BookReservation {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('BookReservation.id required')
    }

    if (!name?.trim()) {
      throw new Error('BookReservation.name required')
    }
    console.log(\`[BookReservation.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`BookReservation \${this.id} invalid status\`)
    }
    console.log(\`[BookReservation.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`BookReservation \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[BookReservation.close] id=\${this.id} -> CLOSED\`)
  }
}

class LibraryManagementService {
  private seq = 1
  private libraries = new Map<string, Library>()
  private books = new Map<string, Book>()
  private book_items = new Map<string, BookItem>()
  private members = new Map<string, Member>()
  private book_reservations = new Map<string, BookReservation>()
  constructor() {
    console.log('[LibraryManagementService.__init__] system ready')
  }

  createLibrary(name: string): Library {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Library name required')
    }
    const id = \`LIB-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Library(id, cleaned)
    obj.validate()
    this.libraries.set(id, obj)
    console.log(\`[LibraryManagementService.createLibrary] stored \${id} count=\${this.libraries.size}\`)
    return obj
  }

  getLibrary(id: string): Library {
    const obj = this.libraries.get(id)
    if (!obj) {
      throw new Error(\`unknown Library id: \${id}\`)
    }
    console.log(\`[LibraryManagementService.getLibrary] found id=\${obj.id}\`)
    return obj
  }

  createBook(name: string): Book {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Book name required')
    }
    const id = \`BOO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Book(id, cleaned)
    obj.validate()
    this.books.set(id, obj)
    console.log(\`[LibraryManagementService.createBook] stored \${id} count=\${this.books.size}\`)
    return obj
  }

  getBook(id: string): Book {
    const obj = this.books.get(id)
    if (!obj) {
      throw new Error(\`unknown Book id: \${id}\`)
    }
    console.log(\`[LibraryManagementService.getBook] found id=\${obj.id}\`)
    return obj
  }

  createBookItem(name: string): BookItem {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('BookItem name required')
    }
    const id = \`BOO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new BookItem(id, cleaned)
    obj.validate()
    this.book_items.set(id, obj)
    console.log(\`[LibraryManagementService.createBookItem] stored \${id} count=\${this.book_items.size}\`)
    return obj
  }

  getBookItem(id: string): BookItem {
    const obj = this.book_items.get(id)
    if (!obj) {
      throw new Error(\`unknown BookItem id: \${id}\`)
    }
    console.log(\`[LibraryManagementService.getBookItem] found id=\${obj.id}\`)
    return obj
  }

  createMember(name: string): Member {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Member name required')
    }
    const id = \`MEM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Member(id, cleaned)
    obj.validate()
    this.members.set(id, obj)
    console.log(\`[LibraryManagementService.createMember] stored \${id} count=\${this.members.size}\`)
    return obj
  }

  getMember(id: string): Member {
    const obj = this.members.get(id)
    if (!obj) {
      throw new Error(\`unknown Member id: \${id}\`)
    }
    console.log(\`[LibraryManagementService.getMember] found id=\${obj.id}\`)
    return obj
  }

  createBookReservation(name: string): BookReservation {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('BookReservation name required')
    }
    const id = \`BOO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new BookReservation(id, cleaned)
    obj.validate()
    this.book_reservations.set(id, obj)
    console.log(\`[LibraryManagementService.createBookReservation] stored \${id} count=\${this.book_reservations.size}\`)
    return obj
  }

  getBookReservation(id: string): BookReservation {
    const obj = this.book_reservations.get(id)
    if (!obj) {
      throw new Error(\`unknown BookReservation id: \${id}\`)
    }
    console.log(\`[LibraryManagementService.getBookReservation] found id=\${obj.id}\`)
    return obj
  }

  closeLibrary(id: string): Library {
    const obj = this.getLibrary(id)
    console.log(\`[LibraryManagementService.closeLibrary] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveLibrarys(): Library[] {
    const active = [...this.libraries.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[LibraryManagementService.listActiveLibrarys] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct LibraryManagementService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new LibraryManagementService()
  console.log('========== STEP 2: Create Library objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createLibrary('alpha-library')
  system.createLibrary('beta-library')
  console.log('========== STEP 3: Create Book ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createBook('sample-book')
  console.log('========== STEP 4: Create BookItem ==========')
  system.createBookItem('sample-book_item')
  console.log('========== STEP 5: Create Member ==========')
  system.createMember('sample-member')
  console.log('========== STEP 6: Create BookReservation ==========')
  system.createBookReservation('sample-book_reservation')
  system.listActiveLibrarys()
  console.log('========== Close first Library ==========')
  system.closeLibrary(first.id)
  try {
    system.closeLibrary(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getLibrary('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Library {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Library(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Library requires id and name");
    }
    cout << "[Library.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Library invalid status");
    }
    cout << "[Library.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Library cannot close");
    }
    status_ = "CLOSED";
    cout << "[Library.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Book {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Book(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Book requires id and name");
    }
    cout << "[Book.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Book invalid status");
    }
    cout << "[Book.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Book cannot close");
    }
    status_ = "CLOSED";
    cout << "[Book.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class BookItem {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  BookItem(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("BookItem requires id and name");
    }
    cout << "[BookItem.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("BookItem invalid status");
    }
    cout << "[BookItem.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("BookItem cannot close");
    }
    status_ = "CLOSED";
    cout << "[BookItem.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Member {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Member(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Member requires id and name");
    }
    cout << "[Member.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Member invalid status");
    }
    cout << "[Member.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Member cannot close");
    }
    status_ = "CLOSED";
    cout << "[Member.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class BookReservation {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  BookReservation(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("BookReservation requires id and name");
    }
    cout << "[BookReservation.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("BookReservation invalid status");
    }
    cout << "[BookReservation.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("BookReservation cannot close");
    }
    status_ = "CLOSED";
    cout << "[BookReservation.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class LibraryManagementService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Library> libraries_;
  unordered_map<string, Book> books_;
  unordered_map<string, BookItem> book_items_;
  unordered_map<string, Member> members_;
  unordered_map<string, BookReservation> book_reservations_;
public:
  LibraryManagementService() {
    cout << "[LibraryManagementService.__init__] system ready" << endl;
  }

  Library createLibrary(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Library name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LIB-%04d", seq_++);
    Library obj{buf, name};
    obj.validate();
    libraries_.emplace(obj.id(), obj);
    cout << "[LibraryManagementService.createLibrary] stored " << obj.id() << endl;
    return obj;
  }

  Library getLibrary(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = libraries_.find(id);
    if (it == libraries_.end()) {
      throw out_of_range("unknown Library id");
    }
    cout << "[LibraryManagementService.getLibrary] found " << id << endl;
    return it->second;
  }

  Book createBook(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Book name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BOO-%04d", seq_++);
    Book obj{buf, name};
    obj.validate();
    books_.emplace(obj.id(), obj);
    cout << "[LibraryManagementService.createBook] stored " << obj.id() << endl;
    return obj;
  }

  Book getBook(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = books_.find(id);
    if (it == books_.end()) {
      throw out_of_range("unknown Book id");
    }
    cout << "[LibraryManagementService.getBook] found " << id << endl;
    return it->second;
  }

  BookItem createBookItem(const string& name) {
    if (name.empty()) {
      throw invalid_argument("BookItem name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BOO-%04d", seq_++);
    BookItem obj{buf, name};
    obj.validate();
    book_items_.emplace(obj.id(), obj);
    cout << "[LibraryManagementService.createBookItem] stored " << obj.id() << endl;
    return obj;
  }

  BookItem getBookItem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = book_items_.find(id);
    if (it == book_items_.end()) {
      throw out_of_range("unknown BookItem id");
    }
    cout << "[LibraryManagementService.getBookItem] found " << id << endl;
    return it->second;
  }

  Member createMember(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Member name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MEM-%04d", seq_++);
    Member obj{buf, name};
    obj.validate();
    members_.emplace(obj.id(), obj);
    cout << "[LibraryManagementService.createMember] stored " << obj.id() << endl;
    return obj;
  }

  Member getMember(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = members_.find(id);
    if (it == members_.end()) {
      throw out_of_range("unknown Member id");
    }
    cout << "[LibraryManagementService.getMember] found " << id << endl;
    return it->second;
  }

  BookReservation createBookReservation(const string& name) {
    if (name.empty()) {
      throw invalid_argument("BookReservation name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BOO-%04d", seq_++);
    BookReservation obj{buf, name};
    obj.validate();
    book_reservations_.emplace(obj.id(), obj);
    cout << "[LibraryManagementService.createBookReservation] stored " << obj.id() << endl;
    return obj;
  }

  BookReservation getBookReservation(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = book_reservations_.find(id);
    if (it == book_reservations_.end()) {
      throw out_of_range("unknown BookReservation id");
    }
    cout << "[LibraryManagementService.getBookReservation] found " << id << endl;
    return it->second;
  }

  Library closeLibrary(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = libraries_.find(id);
    if (it == libraries_.end()) {
      throw out_of_range("unknown Library");
    }
    cout << "[LibraryManagementService.closeLibrary] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct LibraryManagementService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  LibraryManagementService system;
  cout << "========== STEP 2: Create Library ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createLibrary("alpha-library");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createLibrary("beta-library");
  system.createBook("sample-book");
  system.createBookItem("sample-book_item");
  system.createMember("sample-member");
  system.createBookReservation("sample-book_reservation");
  system.closeLibrary(first.id());
  try {
    system.closeLibrary(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getLibrary("MISSING-ID");
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

type Library struct {
  ID     string
  Name   string
  Status string
}

func NewLibrary(id, name string) (*Library, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Library requires id and name")
  }
  obj := &Library{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Library.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Library) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Library invalid status")
  }
  fmt.Printf("[Library.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Library) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Library %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Library.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Book struct {
  ID     string
  Name   string
  Status string
}

func NewBook(id, name string) (*Book, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Book requires id and name")
  }
  obj := &Book{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Book.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Book) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Book invalid status")
  }
  fmt.Printf("[Book.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Book) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Book %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Book.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type BookItem struct {
  ID     string
  Name   string
  Status string
}

func NewBookItem(id, name string) (*BookItem, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("BookItem requires id and name")
  }
  obj := &BookItem{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[BookItem.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *BookItem) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("BookItem invalid status")
  }
  fmt.Printf("[BookItem.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *BookItem) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("BookItem %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[BookItem.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Member struct {
  ID     string
  Name   string
  Status string
}

func NewMember(id, name string) (*Member, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Member requires id and name")
  }
  obj := &Member{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Member.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Member) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Member invalid status")
  }
  fmt.Printf("[Member.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Member) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Member %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Member.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type BookReservation struct {
  ID     string
  Name   string
  Status string
}

func NewBookReservation(id, name string) (*BookReservation, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("BookReservation requires id and name")
  }
  obj := &BookReservation{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[BookReservation.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *BookReservation) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("BookReservation invalid status")
  }
  fmt.Printf("[BookReservation.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *BookReservation) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("BookReservation %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[BookReservation.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type LibraryManagementService struct {
  mu  sync.Mutex
  seq int
  libraries map[string]*Library
  books map[string]*Book
  book_items map[string]*BookItem
  members map[string]*Member
  book_reservations map[string]*BookReservation
}

func NewLibraryManagementService() *LibraryManagementService {
  fmt.Println("[LibraryManagementService.__init__] system ready")
  return &LibraryManagementService{
    seq: 1,
    libraries: map[string]*Library{},
    books: map[string]*Book{},
    book_items: map[string]*BookItem{},
    members: map[string]*Member{},
    book_reservations: map[string]*BookReservation{},
  }
}

func (s *LibraryManagementService) CreateLibrary(name string) (*Library, error) {
  if name == "" {
    return nil, fmt.Errorf("Library name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LIB-%04d", s.seq)
  s.seq++
  obj, err := NewLibrary(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.libraries[id] = obj
  fmt.Printf("[LibraryManagementService.CreateLibrary] stored %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) GetLibrary(id string) (*Library, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.libraries[id]
  if !ok {
    return nil, fmt.Errorf("unknown Library id: %s", id)
  }
  fmt.Printf("[LibraryManagementService.GetLibrary] found %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) CreateBook(name string) (*Book, error) {
  if name == "" {
    return nil, fmt.Errorf("Book name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BOO-%04d", s.seq)
  s.seq++
  obj, err := NewBook(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.books[id] = obj
  fmt.Printf("[LibraryManagementService.CreateBook] stored %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) GetBook(id string) (*Book, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.books[id]
  if !ok {
    return nil, fmt.Errorf("unknown Book id: %s", id)
  }
  fmt.Printf("[LibraryManagementService.GetBook] found %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) CreateBookItem(name string) (*BookItem, error) {
  if name == "" {
    return nil, fmt.Errorf("BookItem name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BOO-%04d", s.seq)
  s.seq++
  obj, err := NewBookItem(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.book_items[id] = obj
  fmt.Printf("[LibraryManagementService.CreateBookItem] stored %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) GetBookItem(id string) (*BookItem, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.book_items[id]
  if !ok {
    return nil, fmt.Errorf("unknown BookItem id: %s", id)
  }
  fmt.Printf("[LibraryManagementService.GetBookItem] found %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) CreateMember(name string) (*Member, error) {
  if name == "" {
    return nil, fmt.Errorf("Member name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MEM-%04d", s.seq)
  s.seq++
  obj, err := NewMember(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.members[id] = obj
  fmt.Printf("[LibraryManagementService.CreateMember] stored %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) GetMember(id string) (*Member, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.members[id]
  if !ok {
    return nil, fmt.Errorf("unknown Member id: %s", id)
  }
  fmt.Printf("[LibraryManagementService.GetMember] found %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) CreateBookReservation(name string) (*BookReservation, error) {
  if name == "" {
    return nil, fmt.Errorf("BookReservation name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BOO-%04d", s.seq)
  s.seq++
  obj, err := NewBookReservation(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.book_reservations[id] = obj
  fmt.Printf("[LibraryManagementService.CreateBookReservation] stored %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) GetBookReservation(id string) (*BookReservation, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.book_reservations[id]
  if !ok {
    return nil, fmt.Errorf("unknown BookReservation id: %s", id)
  }
  fmt.Printf("[LibraryManagementService.GetBookReservation] found %s\\n", id)
  return obj, nil
}

func (s *LibraryManagementService) CloseLibrary(id string) (*Library, error) {
  obj, err := s.GetLibrary(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[LibraryManagementService.CloseLibrary] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct LibraryManagementService ==========")
  system := NewLibraryManagementService()
  fmt.Println("========== STEP 2: Create Library ==========")
  first, _ := system.CreateLibrary("alpha-library")
  system.CreateLibrary("beta-library")
  system.CreateBook("sample-book")
  system.CreateBookItem("sample-book_item")
  system.CreateMember("sample-member")
  system.CreateBookReservation("sample-book_reservation")
  system.CloseLibrary(first.ID)
  if _, err := system.CloseLibrary(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetLibrary("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Library {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Library(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Library requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Library.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Library invalid status");
    }
    Console.WriteLine("[Library.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Library " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Library.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Book {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Book(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Book requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Book.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Book invalid status");
    }
    Console.WriteLine("[Book.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Book " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Book.close] id=" + Id + " -> CLOSED");
  }
}


sealed class BookItem {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public BookItem(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("BookItem requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[BookItem.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("BookItem invalid status");
    }
    Console.WriteLine("[BookItem.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("BookItem " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[BookItem.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Member {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Member(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Member requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Member.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Member invalid status");
    }
    Console.WriteLine("[Member.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Member " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Member.close] id=" + Id + " -> CLOSED");
  }
}


sealed class BookReservation {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public BookReservation(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("BookReservation requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[BookReservation.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("BookReservation invalid status");
    }
    Console.WriteLine("[BookReservation.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("BookReservation " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[BookReservation.close] id=" + Id + " -> CLOSED");
  }
}

sealed class LibraryManagementService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Library> _libraries = new();
  private readonly Dictionary<string, Book> _books = new();
  private readonly Dictionary<string, BookItem> _book_items = new();
  private readonly Dictionary<string, Member> _members = new();
  private readonly Dictionary<string, BookReservation> _book_reservations = new();
  public LibraryManagementService() {
    Console.WriteLine("[LibraryManagementService.__init__] system ready");
  }

  public Library CreateLibrary(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Library name required");
    }
    lock (_gate) {
      var id = string.Format("LIB-{0:D4}", _seq++);
      var obj = new Library(id, name.Trim());
      obj.Validate();
      _libraries[id] = obj;
      Console.WriteLine("[LibraryManagementService.CreateLibrary] stored " + id);
      return obj;
    }
  }

  public Library GetLibrary(string id) {
    lock (_gate) {
      if (!_libraries.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Library id: " + id);
      }
      Console.WriteLine("[LibraryManagementService.GetLibrary] found " + id);
      return obj;
    }
  }

  public Book CreateBook(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Book name required");
    }
    lock (_gate) {
      var id = string.Format("BOO-{0:D4}", _seq++);
      var obj = new Book(id, name.Trim());
      obj.Validate();
      _books[id] = obj;
      Console.WriteLine("[LibraryManagementService.CreateBook] stored " + id);
      return obj;
    }
  }

  public Book GetBook(string id) {
    lock (_gate) {
      if (!_books.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Book id: " + id);
      }
      Console.WriteLine("[LibraryManagementService.GetBook] found " + id);
      return obj;
    }
  }

  public BookItem CreateBookItem(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("BookItem name required");
    }
    lock (_gate) {
      var id = string.Format("BOO-{0:D4}", _seq++);
      var obj = new BookItem(id, name.Trim());
      obj.Validate();
      _book_items[id] = obj;
      Console.WriteLine("[LibraryManagementService.CreateBookItem] stored " + id);
      return obj;
    }
  }

  public BookItem GetBookItem(string id) {
    lock (_gate) {
      if (!_book_items.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown BookItem id: " + id);
      }
      Console.WriteLine("[LibraryManagementService.GetBookItem] found " + id);
      return obj;
    }
  }

  public Member CreateMember(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Member name required");
    }
    lock (_gate) {
      var id = string.Format("MEM-{0:D4}", _seq++);
      var obj = new Member(id, name.Trim());
      obj.Validate();
      _members[id] = obj;
      Console.WriteLine("[LibraryManagementService.CreateMember] stored " + id);
      return obj;
    }
  }

  public Member GetMember(string id) {
    lock (_gate) {
      if (!_members.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Member id: " + id);
      }
      Console.WriteLine("[LibraryManagementService.GetMember] found " + id);
      return obj;
    }
  }

  public BookReservation CreateBookReservation(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("BookReservation name required");
    }
    lock (_gate) {
      var id = string.Format("BOO-{0:D4}", _seq++);
      var obj = new BookReservation(id, name.Trim());
      obj.Validate();
      _book_reservations[id] = obj;
      Console.WriteLine("[LibraryManagementService.CreateBookReservation] stored " + id);
      return obj;
    }
  }

  public BookReservation GetBookReservation(string id) {
    lock (_gate) {
      if (!_book_reservations.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown BookReservation id: " + id);
      }
      Console.WriteLine("[LibraryManagementService.GetBookReservation] found " + id);
      return obj;
    }
  }

  public Library CloseLibrary(string id) {
    var obj = GetLibrary(id);
    Console.WriteLine("[LibraryManagementService.CloseLibrary] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct LibraryManagementService ==========");
    var system = new LibraryManagementService();
    Console.WriteLine("========== STEP 2: Create Library ==========");
    var first = system.CreateLibrary("alpha-library");
    system.CreateLibrary("beta-library");
    system.CreateBook("sample-book");
    system.CreateBookItem("sample-book_item");
    system.CreateMember("sample-member");
    system.CreateBookReservation("sample-book_reservation");
    system.CloseLibrary(first.Id);
    try {
      system.CloseLibrary(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetLibrary("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const libraryManagementSolution: ProblemSolution = {
  slug: 'library-management',
  title: 'Library Management System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a library system that manages books, members, and borrowing/returning operations with fine calculation. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Members can search books by title, author, subject, or publication date',
      'Members can borrow and return books',
      'Track multiple copies of the same book',
      'Reserve a book if all copies are borrowed',
      'Calculate fines for overdue returns',
      'Admin can add, update, or remove books',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Members can search books by title, author, subject, or publication date?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Members can borrow and return books?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Track multiple copies of the same book?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Reserve a book if all copies are borrowed?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Calculate fines for overdue returns?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. LibraryManagementService is the facade stereotype. Library, Book, BookItem, Member, BookReservation are concrete domain classes with id/name/status and validate/close.',
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
          'Construct LibraryManagementService.',
          'createLibrary twice and create the related UML classes.',
          'closeLibrary once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'LibraryManagementService', responsibility: 'UML facade - orchestrates Library Management System.', keyMembers: ['create*', 'get*', 'closeLibrary'] },
    { name: 'Library', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Book', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'BookItem', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Member', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'BookReservation', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from LibraryManagementService to Library, Book, BookItem, Member, BookReservation. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on LibraryManagementService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'LibraryManagementService', responsibility: 'UML facade - orchestrates Library Management System.', keyMembers: ['create*', 'get*', 'closeLibrary'] },
    { name: 'Library', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Book', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'BookItem', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Member', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'BookReservation', responsibility: 'UML class - domain object for Library Management System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'LibraryManagementService exposes create/get/close and owns composed collections.' },
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
      'main constructs LibraryManagementService, creates UML domain objects, closes the primary Library, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct LibraryManagementService.',
      'createLibrary for alpha and beta.',
      'create remaining UML classes.',
      'closeLibrary(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createLibrary("alpha..."); closeLibrary(id)',
        output: '[Library.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeLibrary(alreadyClosed) or getLibrary("MISSING-ID")',
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
