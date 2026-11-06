import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()
const nodes = [
  cls('lib', 'Library', 40, 40, [attr('-', 'books', 'Map'), attr('-', 'members', 'Map'), attr('-', 'notifier', 'Notifier')], [method('+', 'borrow', 'member,book', 'Lending'), method('+', 'returnBook', 'lendingId', 'Fine?')]),
  cls('book', 'Book', 360, 20, [attr('-', 'isbn', 'string'), attr('-', 'title', 'string'), attr('-', 'items', 'List<BookItem>')], [method('+', 'availableCount', '', 'int')]),
  cls('item', 'BookItem', 680, 20, [attr('-', 'barcode', 'string'), attr('-', 'state', 'ItemState')], [method('+', 'lend', '', 'void'), method('+', 'returned', '', 'void')]),
  cls('mem', 'Member', 40, 260, [attr('-', 'id', 'string'), attr('-', 'name', 'string')], []),
  cls('lend', 'BookLending', 360, 260, [attr('-', 'dueDate', 'Date'), attr('-', 'returnedAt', 'Date?')], [method('+', 'isOverdue', '', 'bool')]),
  cls('res', 'BookReservation', 680, 260, [attr('-', 'memberId', 'string'), attr('-', 'bookId', 'string')], []),
  iface('not', 'Notifier', 360, 420, [method('+', 'notify', 'event', 'void')]),
  enm('st', 'ItemState', 680, 420, ['AVAILABLE', 'RESERVED', 'LOANED', 'LOST']),
]
const edges = [
  edge('e1', 'lib', 'book', 'composition', 'right', 'left'),
  edge('e2', 'book', 'item', 'composition', 'right', 'left'),
  edge('e3', 'lib', 'mem', 'composition', 'bottom', 'top'),
  edge('e4', 'lend', 'mem', 'association', 'left', 'right'),
  edge('e5', 'lend', 'item', 'association', 'right', 'left'),
  edge('e6', 'lib', 'not', 'aggregation', 'bottom', 'top'),
  edge('e7', 'item', 'st', 'dependency', 'bottom', 'top'),
]

const python = `"""Library Management - interview-ready LLD reference implementation."""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum, auto
from typing import Dict, List, Optional, Callable, Any
import threading, time, uuid, heapq


class ItemState(Enum):
    AVAILABLE = auto(); RESERVED = auto(); LOANED = auto(); LOST = auto()

@dataclass
class BookItem:
    barcode: str
    state: ItemState = ItemState.AVAILABLE
    def lend(self):
        if self.state != ItemState.AVAILABLE: raise RuntimeError('unavailable')
        self.state = ItemState.LOANED
    def returned(self):
        self.state = ItemState.AVAILABLE

@dataclass
class Book:
    id: str; isbn: str; title: str; author: str
    items: List[BookItem] = field(default_factory=list)
    reservations: List[str] = field(default_factory=list)  # member ids FIFO
    def available_item(self) -> Optional[BookItem]:
        return next((i for i in self.items if i.state == ItemState.AVAILABLE), None)

@dataclass
class BookLending:
    id: str; member_id: str; item: BookItem; due: datetime; returned_at: Optional[datetime] = None
    def fine(self, rate: float, now: datetime) -> float:
        if not self.returned_at or self.returned_at <= self.due: return 0.0
        days = (self.returned_at.date() - self.due.date()).days
        return max(0, days) * rate

class Notifier(ABC):
    @abstractmethod
    def notify(self, message: str) -> None: ...

class ConsoleNotifier(Notifier):
    def notify(self, message: str) -> None: print('[notify]', message)

class Library:
    def __init__(self, fine_rate: float = 5.0, notifier: Optional[Notifier] = None):
        self.books: Dict[str, Book] = {}
        self.members: Dict[str, str] = {}
        self.lendings: Dict[str, BookLending] = {}
        self.fine_rate = fine_rate
        self.notifier = notifier or ConsoleNotifier()
        self._lock = threading.Lock()
    def add_book(self, book: Book) -> None: self.books[book.id] = book
    def add_member(self, mid: str, name: str) -> None: self.members[mid] = name
    def search(self, *, title: str = '', author: str = '') -> List[Book]:
        out = []
        for b in self.books.values():
            if title and title.lower() not in b.title.lower(): continue
            if author and author.lower() not in b.author.lower(): continue
            out.append(b)
        return out
    def borrow(self, member_id: str, book_id: str, days: int = 14) -> BookLending:
        with self._lock:
            book = self.books[book_id]
            item = book.available_item()
            if not item: raise RuntimeError('no copies')
            item.lend()
            lending = BookLending(str(uuid.uuid4()), member_id, item, datetime.utcnow()+timedelta(days=days))
            self.lendings[lending.id] = lending
            return lending
    def return_book(self, lending_id: str) -> float:
        with self._lock:
            lending = self.lendings[lending_id]
            lending.returned_at = datetime.utcnow()
            amount = lending.fine(self.fine_rate, lending.returned_at)
            lending.item.returned()
            book = next(b for b in self.books.values() if lending.item in b.items)
            if book.reservations:
                mid = book.reservations.pop(0)
                self.notifier.notify(f'Book {book.title} available for {mid}')
            return amount

`
const java = `// Library Management
import java.util.*;
import java.time.*;
import java.util.concurrent.*;

enum ItemState { AVAILABLE, RESERVED, LOANED, LOST }
class BookItem { String barcode; ItemState state = ItemState.AVAILABLE;
  void lend(){ if(state!=ItemState.AVAILABLE) throw new IllegalStateException(); state=ItemState.LOANED; }
  void returned(){ state=ItemState.AVAILABLE; } }
interface Notifier { void notify(String msg); }
class Library {
  Map<String,Book> books = new HashMap<>(); double fineRate; Notifier notifier;
  Library(double fineRate, Notifier n){ this.fineRate=fineRate; this.notifier=n; }
  // borrow/return mirror the Python design with synchronized methods
}
`
const typescript = `// Library Management
type ItemState = 'AVAILABLE' | 'RESERVED' | 'LOANED' | 'LOST'
class BookItem { constructor(public barcode: string, public state: ItemState = 'AVAILABLE') {}
  lend() { if (this.state !== 'AVAILABLE') throw new Error('unavailable'); this.state = 'LOANED' }
  returned() { this.state = 'AVAILABLE' } }
class Book { reservations: string[] = []; constructor(public id: string, public title: string, public author: string, public items: BookItem[] = []) {}
  available() { return this.items.find(i => i.state === 'AVAILABLE') } }
interface Notifier { notify(msg: string): void }
class Library {
  books = new Map<string, Book>(); members = new Map<string, string>()
  lendings = new Map<string, { id: string; memberId: string; item: BookItem; due: Date; returnedAt?: Date }>()
  constructor(private fineRate = 5, private notifier: Notifier = { notify: console.log }) {}
  borrow(memberId: string, bookId: string) {
    const book = this.books.get(bookId)!; const item = book.available(); if (!item) throw new Error('no copies')
    item.lend(); const id = crypto.randomUUID(); const due = new Date(Date.now()+14*864e5)
    this.lendings.set(id, { id, memberId, item, due }); return this.lendings.get(id)!
  }
  returnBook(lendingId: string) {
    const L = this.lendings.get(lendingId)!; L.returnedAt = new Date()
    const days = Math.max(0, Math.ceil((+L.returnedAt - +L.due)/864e5)); L.item.returned()
    return days * this.fineRate
  }
}
`
const cpp = `// Library Management
#include <bits/stdc++.h>
using namespace std;

enum class ItemState { Available, Reserved, Loaned, Lost };
struct BookItem { string barcode; ItemState state=ItemState::Available;
  void lend(){ if(state!=ItemState::Available) throw runtime_error("unavail"); state=ItemState::Loaned; }
  void returned(){ state=ItemState::Available; } };
struct Library { /* façade: borrow/return/search - same responsibilities as Python */ };
`
const go = `// Library Management
package solution

import (
  "errors"
  "sync"
  "time"
)

type ItemState int
const ( Available ItemState = iota; Reserved; Loaned; Lost )
type BookItem struct{ Barcode string; State ItemState }
func (b *BookItem) Lend() error { if b.State != Available { return errors.New("unavail") }; b.State = Loaned; return nil }
type Library struct{ mu sync.Mutex /* books, members, lendings */ }
`
const csharp = `// Library Management
using System;
using System.Collections.Generic;
using System.Linq;

enum ItemState { Available, Reserved, Loaned, Lost }
sealed class BookItem { public string Barcode {get;} public ItemState State {get; private set;} = ItemState.Available;
  public void Lend(){ if(State!=ItemState.Available) throw new InvalidOperationException(); State=ItemState.Loaned; }
  public void Returned()=> State=ItemState.Available; }
sealed class Library { /* borrow/return/search façade */ }
`

export const libraryManagementSolution: ProblemSolution = {
  slug: 'library-management',
  title: "Library Management System - Solution",
  overview: {
    introduction: "Model books vs physical copies, member borrowing, reservations, and overdue fines. Interviewers want clear state for BookItem and a clean separation between catalog (Book) and inventory (BookItem).",
    constraints: [
    "A member cannot borrow the same physical copy twice",
    "Fines accrue per overdue day",
    "Reservations notify when a copy becomes available",
    ],
    assumptions: [
    "One active borrow per BookItem",
    "Daily fine rate is configurable",
    "Search is in-memory for the interview scope",
    ],
    clarificationQuestions: [
    "Max books per member?",
    "Reservation queue FIFO?",
    "Can admins waive fines?",
    "Lost-book handling?",
    ],
  },
  interviewApproach: {
    howToThink: "Split catalog data (Book) from lendable inventory (BookItem). Borrowing creates BookLending; returning closes it and may trigger Fine + reservation notifications.",
    breakdown: [
    "Identify Book vs BookItem",
    "Member borrow/return flows",
    "Reservation waitlist",
    "Fine calculation",
    "Notification hooks",
    ],
    entities: [
    { name: "Library", responsibility: "Façade for search, borrow, return, admin catalog ops" },
    { name: "Book", responsibility: "Catalog metadata; has many BookItems" },
    { name: "BookItem", responsibility: "Physical copy with state Available/Reserved/Loaned/Lost" },
    { name: "Member", responsibility: "Borrower identity and active lendings" },
    { name: "BookLending", responsibility: "Active loan with due date" },
    { name: "BookReservation", responsibility: "Waitlist entry for a Book" },
    { name: "Fine", responsibility: "Overdue charge record" },
    { name: "Notifier", responsibility: "Observer for due/reservation events" },
    ],
    relationships: [
    "Library composes Books and Members",
    "Book composes BookItems",
    "BookLending associates Member and BookItem",
    "Reservations queue on Book",
    ],
    patternsAndOop: [
    "Observer for notifications",
    "State transitions on BookItem",
    "Strategy optional for search",
    ],
    stepByStep: [
    "Clarify copy vs title",
    "Draw Book→BookItem",
    "Borrow: find Available item, create Lending",
    "Return: close lending, compute fine, notify reservation",
    "Discuss concurrency on same copy",
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary: "Catalog and inventory are separate. Library orchestrates; BookItem owns state; Notifier decouples alerts.",
    classResponsibilities: [
    { name: "Library", responsibility: "Use-case API" },
    { name: "BookItem", responsibility: "State machine for availability" },
    { name: "BookLending", responsibility: "Loan period + return" },
    { name: "Notifier", responsibility: "Fan-out alerts" },
    ],
    interfacesAndAbstractions: [
    "Notifier/Observer for events",
    "SearchStrategy if multiple indexes",
    ],
    relationships: [
    "Composition Book→BookItem",
    "Association Lending→Member/BookItem",
    ],
    solid: [
    "SRP: fine calc not inside Book metadata",
    "OCP: new Notifier implementations",
    "DIP: Library depends on Notifier abstraction",
    ],
    patterns: [
    { name: "Observer", why: "Due dates and reservation availability" },
    { name: "State", why: "BookItem lifecycle" },
    ],
    decisions: [
    { decision: "Book vs BookItem split", rationale: "Same ISBN, many copies", tradeoff: "More classes to draw" },
    { decision: "FIFO reservations", rationale: "Fair and simple", tradeoff: "No priority members in v1" },
    ],
    extensibility: "Add ebooks as a BookItem subtype; plug SMS/Email notifiers; add hold-shelf expiry jobs.",
  },
  implementations: { python, java, typescript, cpp, go, csharp },
  executionFlow: {
    steps: [
    "Admin adds Book + BookItems",
    "Member searches and borrows Available item",
    "On due, overdue return creates Fine",
    "If reserved, next Member is notified",
    ],
    examples: [
    { title: "Borrow then late return", input: "borrow(member, bookId); return 3 days late", output: "Fine = 3 * dailyRate; item Available or Reserved", explanation: "Lending closed; fine recorded; reservation observers notified if waiting." },
    ],
  },
  followUps: [
    { question: "Why not put stock count on Book only?", answer: "You need per-copy state for loans, loss, and barcodes." },
    { question: "How do you prevent double-borrow of one copy?", answer: "Transition Available→Loaned atomically under a lock / DB constraint." },
    { question: "Where does Observer help?", answer: "Return path should not hardcode email/SMS; Notifier list keeps Library closed for new channels." },
    { question: "Search at 100k books?", answer: "Inverted indexes per field; interview in-memory map is fine if you mention scaling." },
    { question: "Lost book?", answer: "BookItem→Lost; close lending; charge replacement; free reservation waitlist policy." },
  ],
  extras: {
  "edgeCases": [
    "Return of already returned item",
    "Borrow when all reserved"
  ],
  "commonMistakes": [
    "Mixing Book and BookItem",
    "Computing fines in UI"
  ],
  "takeaways": [
    "Separate title from copy",
    "State transitions explicit"
  ]
},
}
