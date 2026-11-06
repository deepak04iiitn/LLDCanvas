import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('ws', 'WalletService', 40, 60, [
    attr('-', 'wallets', 'Map<string, Wallet>'),
    attr('-', 'registryLock', 'Lock'),
  ], [
    method('+', 'createWallet', 'owner: string', 'string'),
    method('+', 'deposit', 'walletId, amount', 'Transaction'),
    method('+', 'withdraw', 'walletId, amount', 'Transaction'),
    method('+', 'getBalance', 'walletId', 'long'),
    method('+', 'getHistory', 'walletId', 'List<Transaction>'),
  ], 'facade'),
  cls('wl', 'Wallet', 400, 40, [
    attr('-', 'id', 'string'),
    attr('-', 'owner', 'string'),
    attr('-', 'ledger', 'Ledger'),
    attr('-', 'lock', 'Lock'),
  ], [
    method('+', 'applyTransaction', 'type, amount', 'Transaction'),
    method('+', 'balance', '', 'long'),
    method('+', 'history', '', 'List<Transaction>'),
  ]),
  cls('lg', 'Ledger', 400, 280, [
    attr('-', 'entries', 'List<Transaction>'),
  ], [
    method('+', 'append', 'tx: Transaction', 'void'),
    method('+', 'entries', '', 'List<Transaction>'),
    method('+', 'balance', '', 'long'),
  ], 'append-only'),
  cls('tx', 'Transaction', 740, 220, [
    attr('-', 'id', 'string'),
    attr('-', 'walletId', 'string'),
    attr('-', 'type', 'TransactionType'),
    attr('-', 'amount', 'long'),
    attr('-', 'balanceAfter', 'long'),
    attr('-', 'timestamp', 'DateTime'),
    attr('-', 'seq', 'long'),
  ], [], 'immutable'),
  enm('tt', 'TransactionType', 740, 30, ['DEPOSIT', 'WITHDRAWAL']),
  cls('ex', 'InsufficientFundsError', 40, 330, [
    attr('-', 'requested', 'long'),
    attr('-', 'available', 'long'),
  ], [], 'exception'),
]

const edges = [
  edge('e1', 'ws', 'wl', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e2', 'wl', 'lg', 'composition', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e3', 'lg', 'tx', 'aggregation', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'appends' }),
  edge('e4', 'tx', 'tt', 'dependency', 'top', 'bottom'),
  edge('e5', 'wl', 'ex', 'dependency', 'bottom@10', 'right', { label: 'throws' }),
]

const py = `from __future__ import annotations
import threading
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Callable, Dict, List

# Money is stored as an integer number of minor units (e.g. cents) - never floats.


class TransactionType(Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"


class InsufficientFundsError(Exception):
    def __init__(self, requested: int, available: int):
        super().__init__("insufficient funds: requested %d, available %d" % (requested, available))
        self.requested, self.available = requested, available


class WalletNotFoundError(KeyError):
    pass


@dataclass(frozen=True)
class Transaction:
    id: str
    wallet_id: str
    type: TransactionType
    amount: int
    balance_after: int
    timestamp: datetime
    seq: int


class Ledger:
    """Append-only list of transactions; the balance is the last entry's balance_after."""

    def __init__(self) -> None:
        self._entries: List[Transaction] = []

    def append(self, tx: Transaction) -> None:
        self._entries.append(tx)

    def entries(self) -> List[Transaction]:
        return list(self._entries)  # defensive copy: callers cannot mutate history

    def balance(self) -> int:
        return self._entries[-1].balance_after if self._entries else 0

    def __len__(self) -> int:
        return len(self._entries)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Wallet:
    def __init__(self, wallet_id: str, owner: str, clock: Callable[[], datetime] = _utc_now):
        self.id = wallet_id
        self.owner = owner
        self._ledger = Ledger()
        self._lock = threading.Lock()  # per-wallet lock: different wallets never contend
        self._clock = clock

    def apply_transaction(self, tx_type: TransactionType, amount: int) -> Transaction:
        """Validate -> compute -> append, all inside one critical section (atomic)."""
        if not isinstance(amount, int) or amount <= 0:
            raise ValueError("amount must be a positive integer (minor units)")
        with self._lock:
            balance = self._ledger.balance()
            if tx_type is TransactionType.WITHDRAWAL:
                if amount > balance:
                    raise InsufficientFundsError(amount, balance)  # no overdraft
                new_balance = balance - amount
            else:
                new_balance = balance + amount
            tx = Transaction(
                id=str(uuid.uuid4()), wallet_id=self.id, type=tx_type, amount=amount,
                balance_after=new_balance, timestamp=self._clock(), seq=len(self._ledger) + 1,
            )
            self._ledger.append(tx)
            return tx

    def balance(self) -> int:
        with self._lock:
            return self._ledger.balance()

    def history(self) -> List[Transaction]:
        with self._lock:
            return self._ledger.entries()  # chronological (append order)


class WalletService:
    def __init__(self) -> None:
        self._wallets: Dict[str, Wallet] = {}
        self._registry_lock = threading.Lock()

    def create_wallet(self, owner: str) -> str:
        wallet = Wallet(str(uuid.uuid4()), owner)
        with self._registry_lock:
            self._wallets[wallet.id] = wallet
        return wallet.id

    def deposit(self, wallet_id: str, amount: int) -> Transaction:
        return self._get(wallet_id).apply_transaction(TransactionType.DEPOSIT, amount)

    def withdraw(self, wallet_id: str, amount: int) -> Transaction:
        return self._get(wallet_id).apply_transaction(TransactionType.WITHDRAWAL, amount)

    def get_balance(self, wallet_id: str) -> int:
        return self._get(wallet_id).balance()

    def get_history(self, wallet_id: str) -> List[Transaction]:
        return self._get(wallet_id).history()

    def _get(self, wallet_id: str) -> Wallet:
        with self._registry_lock:
            wallet = self._wallets.get(wallet_id)
        if wallet is None:
            raise WalletNotFoundError(wallet_id)
        return wallet


def demo() -> None:
    svc = WalletService()
    w = svc.create_wallet("alice")
    svc.deposit(w, 10_000)           # 100.00
    svc.withdraw(w, 2_500)           # 25.00
    try:
        svc.withdraw(w, 9_999)       # more than the 75.00 balance
    except InsufficientFundsError as e:
        print("rejected:", e)
    print("balance:", svc.get_balance(w))
    for t in svc.get_history(w):
        print(t.seq, t.type.value, t.amount, "->", t.balance_after)


if __name__ == "__main__":
    demo()
`

const java = `import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

// Money is a long count of minor units (cents); never double.

enum TransactionType { DEPOSIT, WITHDRAWAL }

class InsufficientFundsException extends RuntimeException {
  final long requested, available;
  InsufficientFundsException(long requested, long available) {
    super("insufficient funds: requested " + requested + ", available " + available);
    this.requested = requested; this.available = available;
  }
}

class WalletNotFoundException extends RuntimeException {
  WalletNotFoundException(String id) { super("wallet not found: " + id); }
}

record Transaction(String id, String walletId, TransactionType type, long amount,
                   long balanceAfter, Instant timestamp, long seq) {}

/** Append-only; guarded by the owning Wallet's lock. */
class Ledger {
  private final List<Transaction> entries = new ArrayList<>();
  void append(Transaction tx) { entries.add(tx); }
  List<Transaction> entries() { return List.copyOf(entries); }
  long balance() { return entries.isEmpty() ? 0 : entries.get(entries.size() - 1).balanceAfter(); }
  int size() { return entries.size(); }
}

class Wallet {
  final String id, owner;
  private final Ledger ledger = new Ledger();
  private final ReentrantLock lock = new ReentrantLock(); // per-wallet lock

  Wallet(String id, String owner) { this.id = id; this.owner = owner; }

  /** Validate -> compute -> append inside one critical section: atomic. */
  Transaction applyTransaction(TransactionType type, long amount) {
    if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
    lock.lock();
    try {
      long balance = ledger.balance();
      long next;
      if (type == TransactionType.WITHDRAWAL) {
        if (amount > balance) throw new InsufficientFundsException(amount, balance); // no overdraft
        next = balance - amount;
      } else {
        next = Math.addExact(balance, amount); // overflow-safe
      }
      Transaction tx = new Transaction(UUID.randomUUID().toString(), id, type, amount,
          next, Instant.now(), ledger.size() + 1L);
      ledger.append(tx);
      return tx;
    } finally { lock.unlock(); }
  }

  long balance() {
    lock.lock();
    try { return ledger.balance(); } finally { lock.unlock(); }
  }

  List<Transaction> history() {
    lock.lock();
    try { return ledger.entries(); } finally { lock.unlock(); }
  }
}

class WalletService {
  private final Map<String, Wallet> wallets = new ConcurrentHashMap<>();

  String createWallet(String owner) {
    Wallet w = new Wallet(UUID.randomUUID().toString(), owner);
    wallets.put(w.id, w);
    return w.id;
  }

  Transaction deposit(String walletId, long amount) {
    return get(walletId).applyTransaction(TransactionType.DEPOSIT, amount);
  }

  Transaction withdraw(String walletId, long amount) {
    return get(walletId).applyTransaction(TransactionType.WITHDRAWAL, amount);
  }

  long getBalance(String walletId) { return get(walletId).balance(); }
  List<Transaction> getHistory(String walletId) { return get(walletId).history(); }

  private Wallet get(String id) {
    Wallet w = wallets.get(id);
    if (w == null) throw new WalletNotFoundException(id);
    return w;
  }
}

class Demo {
  public static void main(String[] args) {
    WalletService svc = new WalletService();
    String w = svc.createWallet("alice");
    svc.deposit(w, 10_000);
    svc.withdraw(w, 2_500);
    try { svc.withdraw(w, 9_999); }
    catch (InsufficientFundsException e) { System.out.println("rejected: " + e.getMessage()); }
    System.out.println("balance: " + svc.getBalance(w));
    for (Transaction t : svc.getHistory(w))
      System.out.println(t.seq() + " " + t.type() + " " + t.amount() + " -> " + t.balanceAfter());
  }
}
`

const ts = `// Money is an integer count of minor units (cents). Never use fractional numbers.

type TransactionType = 'DEPOSIT' | 'WITHDRAWAL'

class InsufficientFundsError extends Error {
  constructor(public readonly requested: number, public readonly available: number) {
    super('insufficient funds: requested ' + requested + ', available ' + available)
  }
}

class WalletNotFoundError extends Error {
  constructor(id: string) { super('wallet not found: ' + id) }
}

interface Transaction {
  readonly id: string
  readonly walletId: string
  readonly type: TransactionType
  readonly amount: number
  readonly balanceAfter: number
  readonly timestamp: Date
  readonly seq: number
}

/** Append-only; readers only ever get copies. */
class Ledger {
  private items: Transaction[] = []
  append(tx: Transaction): void { this.items.push(Object.freeze(tx)) }
  entries(): Transaction[] { return [...this.items] }
  balance(): number { return this.items.length ? this.items[this.items.length - 1].balanceAfter : 0 }
  get size(): number { return this.items.length }
}

/** Serialises async critical sections - the per-wallet lock for single-threaded JS. */
class Mutex {
  private tail: Promise<unknown> = Promise.resolve()
  runExclusive<T>(fn: () => T | Promise<T>): Promise<T> {
    const run = this.tail.then(fn)
    this.tail = run.then(() => undefined, () => undefined)
    return run
  }
}

class Wallet {
  private ledger = new Ledger()
  private mutex = new Mutex()
  constructor(public readonly id: string, public readonly owner: string) {}

  /** Validate -> compute -> append inside one exclusive section: atomic. */
  applyTransaction(type: TransactionType, amount: number): Promise<Transaction> {
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return Promise.reject(new Error('amount must be a positive integer (minor units)'))
    }
    return this.mutex.runExclusive(() => {
      const balance = this.ledger.balance()
      let next: number
      if (type === 'WITHDRAWAL') {
        if (amount > balance) throw new InsufficientFundsError(amount, balance) // no overdraft
        next = balance - amount
      } else {
        next = balance + amount
        if (!Number.isSafeInteger(next)) throw new Error('balance overflow')
      }
      const tx: Transaction = {
        id: crypto.randomUUID(), walletId: this.id, type, amount,
        balanceAfter: next, timestamp: new Date(), seq: this.ledger.size + 1,
      }
      this.ledger.append(tx)
      return tx
    })
  }

  balance(): Promise<number> { return this.mutex.runExclusive(() => this.ledger.balance()) }
  history(): Promise<Transaction[]> { return this.mutex.runExclusive(() => this.ledger.entries()) }
}

class WalletService {
  private wallets = new Map<string, Wallet>()

  createWallet(owner: string): string {
    const w = new Wallet(crypto.randomUUID(), owner)
    this.wallets.set(w.id, w)
    return w.id
  }

  deposit(walletId: string, amount: number) {
    return this.get(walletId).applyTransaction('DEPOSIT', amount)
  }

  withdraw(walletId: string, amount: number) {
    return this.get(walletId).applyTransaction('WITHDRAWAL', amount)
  }

  getBalance(walletId: string) { return this.get(walletId).balance() }
  getHistory(walletId: string) { return this.get(walletId).history() }

  private get(id: string): Wallet {
    const w = this.wallets.get(id)
    if (!w) throw new WalletNotFoundError(id)
    return w
  }
}

export { WalletService, InsufficientFundsError, WalletNotFoundError }
export type { Transaction, TransactionType }
`

const cpp = `#include <chrono>
#include <iostream>
#include <limits>
#include <map>
#include <memory>
#include <mutex>
#include <stdexcept>
#include <string>
#include <vector>

// Money is a long long count of minor units (cents); never double.

enum class TransactionType { Deposit, Withdrawal };

struct InsufficientFundsError : std::runtime_error {
  long long requested, available;
  InsufficientFundsError(long long requested, long long available)
      : std::runtime_error("insufficient funds: requested " + std::to_string(requested) +
                           ", available " + std::to_string(available)),
        requested(requested), available(available) {}
};

struct WalletNotFoundError : std::runtime_error {
  explicit WalletNotFoundError(const std::string& id) : std::runtime_error("wallet not found: " + id) {}
};

struct Transaction {
  std::string id, walletId;
  TransactionType type;
  long long amount, balanceAfter;
  std::chrono::system_clock::time_point timestamp;
  long long seq;
};

// Append-only; guarded by the owning Wallet's mutex.
class Ledger {
  std::vector<Transaction> entries_;
public:
  void append(Transaction tx) { entries_.push_back(std::move(tx)); }
  std::vector<Transaction> entries() const { return entries_; }  // copy
  long long balance() const { return entries_.empty() ? 0 : entries_.back().balanceAfter; }
  size_t size() const { return entries_.size(); }
};

class Wallet {
  std::string id_, owner_;
  Ledger ledger_;
  mutable std::mutex mu_;  // per-wallet lock

public:
  Wallet(std::string id, std::string owner) : id_(std::move(id)), owner_(std::move(owner)) {}
  const std::string& id() const { return id_; }

  // Validate -> compute -> append inside one critical section: atomic.
  Transaction applyTransaction(TransactionType type, long long amount) {
    if (amount <= 0) throw std::invalid_argument("amount must be positive");
    std::lock_guard<std::mutex> lk(mu_);
    long long balance = ledger_.balance();
    long long next;
    if (type == TransactionType::Withdrawal) {
      if (amount > balance) throw InsufficientFundsError(amount, balance);  // no overdraft
      next = balance - amount;
    } else {
      if (amount > std::numeric_limits<long long>::max() - balance)
        throw std::overflow_error("balance overflow");
      next = balance + amount;
    }
    long long seq = static_cast<long long>(ledger_.size()) + 1;
    Transaction tx{id_ + "-" + std::to_string(seq), id_, type, amount, next,
                   std::chrono::system_clock::now(), seq};
    ledger_.append(tx);
    return tx;
  }

  long long balance() const { std::lock_guard<std::mutex> lk(mu_); return ledger_.balance(); }
  std::vector<Transaction> history() const { std::lock_guard<std::mutex> lk(mu_); return ledger_.entries(); }
};

class WalletService {
  std::map<std::string, std::shared_ptr<Wallet>> wallets_;
  std::mutex registryMu_;
  long long next_ = 1;

  std::shared_ptr<Wallet> get(const std::string& id) {
    std::lock_guard<std::mutex> lk(registryMu_);
    auto it = wallets_.find(id);
    if (it == wallets_.end()) throw WalletNotFoundError(id);
    return it->second;
  }

public:
  std::string createWallet(const std::string& owner) {
    std::lock_guard<std::mutex> lk(registryMu_);
    std::string id = "w" + std::to_string(next_++);
    wallets_[id] = std::make_shared<Wallet>(id, owner);
    return id;
  }

  Transaction deposit(const std::string& id, long long amount) {
    return get(id)->applyTransaction(TransactionType::Deposit, amount);
  }
  Transaction withdraw(const std::string& id, long long amount) {
    return get(id)->applyTransaction(TransactionType::Withdrawal, amount);
  }
  long long getBalance(const std::string& id) { return get(id)->balance(); }
  std::vector<Transaction> getHistory(const std::string& id) { return get(id)->history(); }
};

int main() {
  WalletService svc;
  auto w = svc.createWallet("alice");
  svc.deposit(w, 10000);
  svc.withdraw(w, 2500);
  try { svc.withdraw(w, 9999); }
  catch (const InsufficientFundsError& e) { std::cout << "rejected: " << e.what() << "\\n"; }
  std::cout << "balance: " << svc.getBalance(w) << "\\n";
  for (const auto& t : svc.getHistory(w))
    std::cout << t.seq << " " << (t.type == TransactionType::Deposit ? "DEPOSIT" : "WITHDRAWAL")
              << " " << t.amount << " -> " << t.balanceAfter << "\\n";
}
`

const goCode = `package main

import (
	"errors"
	"fmt"
	"math"
	"sync"
	"time"

	"github.com/google/uuid"
)

// Money is an int64 count of minor units (cents); never float64.

type TransactionType int

const (
	Deposit TransactionType = iota
	Withdrawal
)

func (t TransactionType) String() string { return [...]string{"DEPOSIT", "WITHDRAWAL"}[t] }

var (
	ErrInsufficientFunds = errors.New("insufficient funds")
	ErrWalletNotFound    = errors.New("wallet not found")
	ErrInvalidAmount     = errors.New("amount must be positive")
	ErrOverflow          = errors.New("balance overflow")
)

type Transaction struct {
	ID           string
	WalletID     string
	Type         TransactionType
	Amount       int64
	BalanceAfter int64
	Timestamp    time.Time
	Seq          int64
}

// Ledger is append-only; it is guarded by the owning Wallet's mutex.
type Ledger struct{ entries []Transaction }

func (l *Ledger) Append(tx Transaction) { l.entries = append(l.entries, tx) }
func (l *Ledger) Entries() []Transaction {
	return append([]Transaction(nil), l.entries...) // copy: callers cannot mutate history
}
func (l *Ledger) Balance() int64 {
	if len(l.entries) == 0 {
		return 0
	}
	return l.entries[len(l.entries)-1].BalanceAfter
}
func (l *Ledger) Len() int { return len(l.entries) }

type Wallet struct {
	ID, Owner string
	mu        sync.Mutex // per-wallet lock
	ledger    Ledger
}

// ApplyTransaction validates, computes and appends inside one critical section.
func (w *Wallet) ApplyTransaction(t TransactionType, amount int64) (Transaction, error) {
	if amount <= 0 {
		return Transaction{}, ErrInvalidAmount
	}
	w.mu.Lock()
	defer w.mu.Unlock()
	balance := w.ledger.Balance()
	var next int64
	if t == Withdrawal {
		if amount > balance { // no overdraft
			return Transaction{}, fmt.Errorf("%w: requested %d, available %d", ErrInsufficientFunds, amount, balance)
		}
		next = balance - amount
	} else {
		if amount > math.MaxInt64-balance {
			return Transaction{}, ErrOverflow
		}
		next = balance + amount
	}
	tx := Transaction{
		ID: uuid.NewString(), WalletID: w.ID, Type: t, Amount: amount,
		BalanceAfter: next, Timestamp: time.Now().UTC(), Seq: int64(w.ledger.Len()) + 1,
	}
	w.ledger.Append(tx)
	return tx, nil
}

func (w *Wallet) Balance() int64 {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.ledger.Balance()
}

func (w *Wallet) History() []Transaction {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.ledger.Entries()
}

type WalletService struct {
	mu      sync.RWMutex
	wallets map[string]*Wallet
}

func NewWalletService() *WalletService { return &WalletService{wallets: map[string]*Wallet{}} }

func (s *WalletService) CreateWallet(owner string) string {
	w := &Wallet{ID: uuid.NewString(), Owner: owner}
	s.mu.Lock()
	s.wallets[w.ID] = w
	s.mu.Unlock()
	return w.ID
}

func (s *WalletService) get(id string) (*Wallet, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	w, ok := s.wallets[id]
	if !ok {
		return nil, ErrWalletNotFound
	}
	return w, nil
}

func (s *WalletService) Deposit(id string, amount int64) (Transaction, error) {
	w, err := s.get(id)
	if err != nil {
		return Transaction{}, err
	}
	return w.ApplyTransaction(Deposit, amount)
}

func (s *WalletService) Withdraw(id string, amount int64) (Transaction, error) {
	w, err := s.get(id)
	if err != nil {
		return Transaction{}, err
	}
	return w.ApplyTransaction(Withdrawal, amount)
}

func (s *WalletService) GetBalance(id string) (int64, error) {
	w, err := s.get(id)
	if err != nil {
		return 0, err
	}
	return w.Balance(), nil
}

func (s *WalletService) GetHistory(id string) ([]Transaction, error) {
	w, err := s.get(id)
	if err != nil {
		return nil, err
	}
	return w.History(), nil
}

func main() {
	svc := NewWalletService()
	w := svc.CreateWallet("alice")
	_, _ = svc.Deposit(w, 10_000)
	_, _ = svc.Withdraw(w, 2_500)
	if _, err := svc.Withdraw(w, 9_999); errors.Is(err, ErrInsufficientFunds) {
		fmt.Println("rejected:", err)
	}
	bal, _ := svc.GetBalance(w)
	fmt.Println("balance:", bal)
	hist, _ := svc.GetHistory(w)
	for _, t := range hist {
		fmt.Println(t.Seq, t.Type, t.Amount, "->", t.BalanceAfter)
	}
}
`

const csharp = `using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

// Money is a long count of minor units (cents); never double or float.

public enum TransactionType { Deposit, Withdrawal }

public sealed class InsufficientFundsException : Exception {
  public long Requested { get; }
  public long Available { get; }
  public InsufficientFundsException(long requested, long available)
    : base("insufficient funds: requested " + requested + ", available " + available) {
    Requested = requested; Available = available;
  }
}

public sealed class WalletNotFoundException : Exception {
  public WalletNotFoundException(string id) : base("wallet not found: " + id) {}
}

public sealed record Transaction(string Id, string WalletId, TransactionType Type, long Amount,
                                 long BalanceAfter, DateTime Timestamp, long Seq);

/// <summary>Append-only; guarded by the owning Wallet's lock.</summary>
public sealed class Ledger {
  readonly List<Transaction> _entries = new();
  public void Append(Transaction tx) => _entries.Add(tx);
  public IReadOnlyList<Transaction> Entries() => _entries.ToArray(); // copy
  public long Balance() => _entries.Count == 0 ? 0 : _entries[^1].BalanceAfter;
  public int Count => _entries.Count;
}

public sealed class Wallet {
  public string Id { get; }
  public string Owner { get; }
  readonly Ledger _ledger = new();
  readonly object _gate = new(); // per-wallet lock

  public Wallet(string id, string owner) { Id = id; Owner = owner; }

  /// <summary>Validate -> compute -> append inside one critical section: atomic.</summary>
  public Transaction ApplyTransaction(TransactionType type, long amount) {
    if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "amount must be positive");
    lock (_gate) {
      long balance = _ledger.Balance();
      long next;
      if (type == TransactionType.Withdrawal) {
        if (amount > balance) throw new InsufficientFundsException(amount, balance); // no overdraft
        next = balance - amount;
      } else {
        next = checked(balance + amount); // overflow-safe
      }
      var tx = new Transaction(Guid.NewGuid().ToString(), Id, type, amount, next,
                               DateTime.UtcNow, _ledger.Count + 1L);
      _ledger.Append(tx);
      return tx;
    }
  }

  public long Balance() { lock (_gate) return _ledger.Balance(); }
  public IReadOnlyList<Transaction> History() { lock (_gate) return _ledger.Entries(); }
}

public sealed class WalletService {
  readonly ConcurrentDictionary<string, Wallet> _wallets = new();

  public string CreateWallet(string owner) {
    var w = new Wallet(Guid.NewGuid().ToString(), owner);
    _wallets[w.Id] = w;
    return w.Id;
  }

  public Transaction Deposit(string walletId, long amount) =>
    Get(walletId).ApplyTransaction(TransactionType.Deposit, amount);

  public Transaction Withdraw(string walletId, long amount) =>
    Get(walletId).ApplyTransaction(TransactionType.Withdrawal, amount);

  public long GetBalance(string walletId) => Get(walletId).Balance();
  public IReadOnlyList<Transaction> GetHistory(string walletId) => Get(walletId).History();

  Wallet Get(string id) =>
    _wallets.TryGetValue(id, out var w) ? w : throw new WalletNotFoundException(id);
}

public static class Program {
  public static void Main() {
    var svc = new WalletService();
    var w = svc.CreateWallet("alice");
    svc.Deposit(w, 10_000);
    svc.Withdraw(w, 2_500);
    try { svc.Withdraw(w, 9_999); }
    catch (InsufficientFundsException e) { Console.WriteLine("rejected: " + e.Message); }
    Console.WriteLine("balance: " + svc.GetBalance(w));
    foreach (var t in svc.GetHistory(w))
      Console.WriteLine(t.Seq + " " + t.Type + " " + t.Amount + " -> " + t.BalanceAfter);
  }
}
`

export const digitalWalletSolution: ProblemSolution = {
  slug: 'digital-wallet',
  title: 'Digital Wallet - Solution',
  overview: {
    introduction:
      'Design a digital wallet service where users create wallets, deposit and withdraw money, check balance and see a chronological transaction history - with a hard guarantee that a wallet can never be overdrawn, even under concurrent requests. Interviewers look for a correct money model, an append-only ledger as the source of truth, and an atomic apply-transaction step protected by a per-wallet lock.',
    constraints: [
      'A wallet can be created, credited (deposit) and debited (withdraw) in whole minor units.',
      'A withdrawal is allowed only if the balance is sufficient - no overdraft ever.',
      'Balance can be queried at any time and always equals the sum of the ledger.',
      'History is returned in chronological order and entries are never edited or deleted.',
      'Concurrent operations on one wallet must not corrupt the balance or the ledger.',
    ],
    assumptions: [
      'One currency per wallet; multi-currency and FX are out of scope.',
      'Amounts are positive integers in minor units (cents); floats are never used for money.',
      'Transfers between wallets, holds and refunds are follow-ups (they need multi-wallet locking).',
      'Storage is in-memory for the exercise; the same design maps to a database table + transaction.',
      'Wallet ids are generated by the service; authentication/authorization is handled elsewhere.',
    ],
    clarificationQuestions: [
      'Single currency or multi-currency? What precision (minor units)?',
      'Do we need wallet-to-wallet transfers now, and must they be atomic across two wallets?',
      'Is there a maximum balance or per-transaction limit?',
      'Should operations be idempotent (retry-safe) using a client-supplied key?',
      'How long must history be retained, and does it need pagination?',
      'Is the service single-node (in-memory) or backed by a database?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Money systems are about invariants, not features: balance never negative, history never rewritten, every change recorded. Make the ledger the source of truth and derive balance from it. Then make “check balance + record entry” one indivisible step, and scope the lock to a single wallet so unrelated wallets never block each other.',
    breakdown: [
      'Represent money as integer minor units to avoid floating-point errors.',
      'Model an immutable Transaction (type, amount, balanceAfter, timestamp, sequence).',
      'Keep an append-only Ledger per wallet; balance is the last entry’s balanceAfter (O(1)).',
      'Put applyTransaction on Wallet: validate → compute → append under the wallet’s lock.',
      'Expose a thin WalletService façade that looks up wallets and delegates.',
      'Reject invalid amounts and overdrafts with explicit exceptions.',
    ],
    entities: [
      { name: 'WalletService', responsibility: 'Façade: create wallet, deposit, withdraw, balance, history; wallet registry.' },
      { name: 'Wallet', responsibility: 'Owns a ledger and a lock; enforces the no-overdraft invariant in applyTransaction.' },
      { name: 'Ledger', responsibility: 'Append-only transaction list; derives the current balance.' },
      { name: 'Transaction', responsibility: 'Immutable record of one balance change with the resulting balance.' },
      { name: 'TransactionType', responsibility: 'DEPOSIT or WITHDRAWAL.' },
      { name: 'InsufficientFundsError', responsibility: 'Domain error carrying requested and available amounts.' },
    ],
    relationships: [
      'WalletService composes Wallets (registry).',
      'Wallet composes exactly one Ledger.',
      'Ledger aggregates Transactions in append order.',
      'Wallet throws InsufficientFundsError when a withdrawal exceeds the balance.',
    ],
    patternsAndOop: [
      'Event-sourcing-lite: the append-only ledger is the truth; balance is derived.',
      'Encapsulation: the only way to change a balance is Wallet.applyTransaction.',
      'Immutability: Transaction records and defensive-copied history prevent tampering.',
      'Façade: WalletService hides registry lookup and locking from callers.',
      'Fine-grained locking: per-wallet lock for isolation and throughput.',
    ],
    stepByStep: [
      'Clarify currency, transfers and idempotency requirements.',
      'Define money as integer minor units and write the Transaction record.',
      'Implement Ledger.append/balance/entries with defensive copies.',
      'Implement Wallet.applyTransaction under a lock with validation and overdraft check.',
      'Wrap in WalletService (create, deposit, withdraw, balance, history).',
      'Explain concurrency, atomicity, and how it extends to transfers and a database.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Wallet is the aggregate root that guards the invariant “balance ≥ 0”. Every change flows through one method that locks the wallet, validates, and appends an immutable ledger entry containing the new balance. History and balance are just reads of that ledger, so they cannot drift apart.',
    classResponsibilities: [
      { name: 'WalletService', responsibility: 'Entry point; resolves the wallet and delegates; owns a registry guarded separately from wallet locks.' },
      { name: 'Wallet', responsibility: 'Atomic validate+apply, balance and history reads under its own lock.' },
      { name: 'Ledger', responsibility: 'Append-only storage; returns copies so callers cannot mutate history.' },
      { name: 'Transaction', responsibility: 'Immutable audit record with a per-wallet sequence number.' },
      { name: 'InsufficientFundsError', responsibility: 'Explicit, typed failure for overdraft attempts.' },
    ],
    interfacesAndAbstractions: [
      'The Ledger boundary lets you swap the in-memory list for a database table without changing Wallet.',
      'If persistence is added, define a LedgerRepository interface and inject it into Wallet.',
    ],
    relationships: [
      'Composition WalletService→Wallet→Ledger mirrors ownership and lifetime.',
      'Aggregation Ledger→Transaction: transactions are value objects that only ever get appended.',
      'Dependency Wallet→InsufficientFundsError for business-rule failures.',
    ],
    solid: [
      'SRP: Ledger stores, Wallet enforces rules, WalletService routes.',
      'OCP: new transaction types (FEE, REFUND) add enum values and rules without rewriting the ledger.',
      'LSP: any Ledger implementation must preserve append order and immutability.',
      'ISP: callers only see five service operations.',
      'DIP: Wallet can depend on a ledger abstraction when persistence arrives.',
    ],
    patterns: [
      { name: 'Aggregate / Domain model', why: 'Wallet is the single consistency boundary for balance and ledger.' },
      { name: 'Append-only log', why: 'Gives auditability, trivial chronological history and a derived balance.' },
      { name: 'Façade', why: 'WalletService gives callers a minimal API and hides locking.' },
    ],
    decisions: [
      {
        decision: 'Integer minor units instead of floating point or decimal strings.',
        rationale: 'Exact arithmetic; no rounding surprises; trivially comparable.',
        tradeoff: 'Callers must convert at the boundary; currency exponent must be known.',
      },
      {
        decision: 'Store balanceAfter on every ledger entry.',
        rationale: 'Balance read is O(1) and each entry is self-auditing.',
        tradeoff: 'Slight redundancy; must be written inside the same critical section as the append.',
      },
      {
        decision: 'Per-wallet lock rather than one global lock.',
        rationale: 'Operations on different wallets run in parallel; operations on one wallet are strictly serialized.',
        tradeoff: 'Transfers touching two wallets need a lock-ordering rule (by wallet id) to avoid deadlock.',
      },
      {
        decision: 'applyTransaction validates and appends in one critical section.',
        rationale: 'Closes the check-then-act race that would otherwise allow two concurrent withdrawals to overdraw.',
        tradeoff: 'Lock hold time includes ledger append; negligible in memory, matters with I/O (use a DB transaction instead).',
      },
      {
        decision: 'Return copies from history().',
        rationale: 'Preserves the append-only guarantee even if a caller mutates the result.',
        tradeoff: 'O(n) copy per call; add pagination or immutable persistent lists if history is large.',
      },
    ],
    extensibility:
      'Add transfers by locking two wallets in a deterministic order and appending a debit and a credit entry that share a transferId. Add idempotency by storing a client key → transactionId map checked inside the lock. Add persistence by replacing Ledger with a repository and using a database transaction (or optimistic concurrency on the sequence number) for atomicity.',
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
      'createWallet generates an id, creates a Wallet with an empty Ledger and registers it.',
      'deposit/withdraw look up the wallet and call applyTransaction(type, amount).',
      'applyTransaction rejects non-positive amounts, then acquires the wallet’s lock.',
      'Under the lock it reads the balance, rejects an overdraft for withdrawals, and computes the new balance.',
      'It appends an immutable Transaction (with balanceAfter and sequence) to the ledger and releases the lock.',
      'getBalance returns the last entry’s balanceAfter; getHistory returns a copy of the ledger in append order.',
    ],
    examples: [
      {
        title: 'Deposit then withdraw',
        input: 'deposit(w, 10000); withdraw(w, 2500)',
        output: 'Balance 7500; history: [#1 DEPOSIT 10000 → 10000, #2 WITHDRAWAL 2500 → 7500]',
        explanation: 'Each call appends one entry. Balance is just the last entry’s balanceAfter, and history is chronological because the ledger is append-only.',
      },
      {
        title: 'Overdraft rejected',
        input: 'withdraw(w, 9999) when balance is 7500',
        output: 'InsufficientFundsError(requested=9999, available=7500); balance and ledger unchanged',
        explanation: 'The check and the append happen under the same lock, so a failed withdrawal leaves no trace and cannot race another withdrawal.',
      },
      {
        title: 'Concurrent withdrawals',
        input: 'Balance 100; two threads call withdraw(w, 80) simultaneously',
        output: 'Exactly one succeeds (balance 20); the other gets InsufficientFundsError',
        explanation: 'The per-wallet lock serializes them. The second thread sees balance 20 and fails the sufficiency check.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you implement wallet-to-wallet transfers safely?',
      answer:
        'Lock both wallets in a global order (e.g. by id) to prevent deadlock, validate the source balance, then append a debit to the source and a credit to the destination with a shared transferId. On a database, wrap both inserts in one transaction (SELECT … FOR UPDATE in id order).',
    },
    {
      question: 'How do you make deposits and withdrawals idempotent?',
      answer:
        'Accept an idempotency key. Inside the wallet lock, check a map key → transaction; if present return the original result, otherwise apply and record the key. In SQL, use a unique constraint on (wallet_id, idempotency_key).',
    },
    {
      question: 'What changes if the balance lives in a database?',
      answer:
        'Use a transaction with row-level locking or an optimistic version check: UPDATE wallet SET balance = balance - :x WHERE id = :id AND balance >= :x, then insert the ledger row in the same transaction. The sequence number becomes the optimistic concurrency token.',
    },
    {
      question: 'Why store balanceAfter instead of summing the ledger?',
      answer:
        'It makes balance reads O(1) and each row independently auditable. The sum remains a consistency check you can run offline; any mismatch indicates a bug or tampering.',
    },
    {
      question: 'How do you support multiple currencies?',
      answer:
        'Introduce a Money value type (amount + currency) and give each wallet a currency. Mixed-currency operations require an explicit conversion service that records both legs. Never add amounts across currencies.',
    },
    {
      question: 'How would you paginate a large history?',
      answer:
        'Expose getHistory(walletId, afterSeq, limit). Because entries have a monotonically increasing sequence, cursor-based pagination is stable even while new entries are appended.',
    },
    {
      question: 'How would you test the no-overdraft guarantee?',
      answer:
        'Run many threads issuing random deposits/withdrawals on one wallet, then assert the final balance equals deposits minus successful withdrawals, never went negative, and the ledger replay reproduces the balance.',
    },
  ],
  extras: {
    edgeCases: [
      'Zero or negative amounts.',
      'Withdrawing exactly the full balance (allowed) versus one unit more (rejected).',
      'Unknown wallet id.',
      'Integer overflow when adding to a very large balance.',
      'Concurrent deposits and withdrawals on the same wallet.',
      'Mutating the list returned from history().',
      'Empty wallet history and balance of a brand-new wallet (0).',
    ],
    commonMistakes: [
      'Using floating point for money.',
      'Checking the balance outside the lock, then updating inside it (check-then-act race).',
      'Using one global lock for every wallet.',
      'Storing balance separately from the ledger so they can disagree.',
      'Exposing the internal ledger list or allowing edit/delete of transactions.',
      'Recording a ledger entry for a failed withdrawal or leaving partial state after an exception.',
    ],
    complexity:
      'deposit/withdraw: O(1) amortized under the wallet lock. getBalance: O(1). getHistory: O(n) to copy (O(page) with pagination). Space: O(total transactions).',
    testing: [
      'Deposit/withdraw happy path with exact ledger contents.',
      'Overdraft rejected and ledger unchanged.',
      'Invalid amounts rejected.',
      'History order equals call order and sequence numbers are contiguous.',
      'Concurrent stress test on one wallet and across many wallets.',
      'Ledger replay equals reported balance.',
    ],
    extensions: [
      'Transfers, holds/authorizations, refunds and fees.',
      'Idempotency keys and retry-safe APIs.',
      'Multi-currency wallets with FX conversion.',
      'Persistence with optimistic concurrency and event publishing.',
      'Daily limits and fraud checks as pre-apply validators.',
    ],
    takeaways: [
      'Model money as integers and the ledger as the source of truth.',
      'The check and the write must be one atomic step.',
      'Lock per wallet, not globally.',
      'History and balance fall out for free from an append-only log.',
    ],
  },
}
