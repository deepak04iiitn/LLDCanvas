import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('atm', 'ATM', 40, 40, [
    attr('-', 'state', 'ATMState'),
    attr('-', 'card', 'Card?'),
    attr('-', 'bank', 'BankingService'),
    attr('-', 'dispenser', 'CashDispenser'),
    attr('-', 'failedPinAttempts', 'int'),
  ], [
    method('+', 'insertCard', 'card: Card', 'void'),
    method('+', 'enterPin', 'pin: string', 'bool'),
    method('+', 'execute', 'cmd: TransactionCommand', 'Receipt'),
    method('+', 'ejectCard', '', 'void'),
  ]),
  enm('as', 'ATMState', 40, 220, ['IDLE', 'CARD_INSERTED', 'PIN_VERIFIED', 'PROCESSING', 'EJECTING']),
  cls('cd', 'Card', 280, 40, [
    attr('-', 'number', 'string'),
    attr('-', 'accountId', 'string'),
    attr('-', 'blocked', 'bool'),
  ], []),
  cls('ac', 'Account', 480, 40, [
    attr('-', 'id', 'string'),
    attr('-', 'balance', 'decimal'),
  ], [
    method('+', 'debit', 'amount', 'void'),
    method('+', 'credit', 'amount', 'void'),
  ]),
  iface('bk', 'BankingService', 280, 180, [
    method('+', 'verifyPin', 'card, pin', 'bool'),
    method('+', 'getBalance', 'accountId', 'decimal'),
    method('+', 'withdraw', 'accountId, amount', 'bool'),
    method('+', 'deposit', 'accountId, amount', 'void'),
  ]),
  cls('disp', 'CashDispenser', 480, 180, [
    attr('-', 'inventory', 'Map<int, int>'),
  ], [
    method('+', 'dispense', 'amount', 'Map<int, int>'),
  ]),
  iface('cmd', 'TransactionCommand', 280, 320, [
    method('+', 'execute', 'atm: ATM', 'Receipt'),
  ]),
  cls('rc', 'Receipt', 480, 320, [
    attr('-', 'type', 'string'),
    attr('-', 'amount', 'decimal'),
    attr('-', 'balance', 'decimal'),
  ], []),
]

const edges = [
  edge('e1', 'atm', 'as', 'dependency', 'bottom', 'top'),
  edge('e2', 'atm', 'cd', 'association', 'right', 'left', { sourceMultiplicity: '0..1' }),
  edge('e3', 'atm', 'bk', 'aggregation', 'bottom@40', 'top'),
  edge('e4', 'atm', 'disp', 'aggregation', 'right@60', 'left'),
  edge('e5', 'cd', 'ac', 'association', 'right', 'left', { label: 'links' }),
  edge('e6', 'cmd', 'atm', 'dependency', 'top', 'bottom', { label: 'executed on' }),
  edge('e7', 'atm', 'rc', 'dependency', 'bottom@80', 'top', { label: 'prints' }),
]

const py = `from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum, auto
from typing import Dict, Optional


class ATMState(Enum):
    IDLE = auto()
    CARD_INSERTED = auto()
    PIN_VERIFIED = auto()
    PROCESSING = auto()
    EJECTING = auto()


@dataclass
class Card:
    number: str
    account_id: str
    blocked: bool = False


@dataclass
class Account:
    id: str
    balance: float

    def debit(self, amount: float) -> None:
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

    def credit(self, amount: float) -> None:
        self.balance += amount


@dataclass
class Receipt:
    txn_type: str
    amount: float
    balance: float


class BankingService(ABC):
    @abstractmethod
    def verify_pin(self, card: Card, pin: str) -> bool: ...
    @abstractmethod
    def get_balance(self, account_id: str) -> float: ...
    @abstractmethod
    def withdraw(self, account_id: str, amount: float) -> bool: ...
    @abstractmethod
    def deposit(self, account_id: str, amount: float) -> None: ...


class InMemoryBank(BankingService):
    def __init__(self, accounts: Dict[str, Account], pins: Dict[str, str]):
        self.accounts = accounts
        self.pins = pins

    def verify_pin(self, card: Card, pin: str) -> bool:
        return self.pins.get(card.number) == pin

    def get_balance(self, account_id: str) -> float:
        return self.accounts[account_id].balance

    def withdraw(self, account_id: str, amount: float) -> bool:
        acc = self.accounts[account_id]
        if amount > acc.balance:
            return False
        acc.debit(amount)
        return True

    def deposit(self, account_id: str, amount: float) -> None:
        self.accounts[account_id].credit(amount)


class CashDispenser:
    DENOMS = [100, 50, 20, 10, 5, 1]

    def __init__(self, inventory: Optional[Dict[int, int]] = None):
        self.inventory = inventory or {d: 10 for d in self.DENOMS}

    def dispense(self, amount: int) -> Dict[int, int]:
        remaining = amount
        out: Dict[int, int] = {}
        for d in self.DENOMS:
            need = min(remaining // d, self.inventory.get(d, 0))
            if need:
                out[d] = need
                remaining -= need * d
                self.inventory[d] -= need
        if remaining:
            raise ValueError("cannot dispense exact amount")
        return out


class TransactionCommand(ABC):
    @abstractmethod
    def execute(self, atm: "ATM") -> Receipt: ...


class WithdrawCommand(TransactionCommand):
    def __init__(self, amount: float):
        self.amount = amount

    def execute(self, atm: "ATM") -> Receipt:
        assert atm.card
        ok = atm.bank.withdraw(atm.card.account_id, self.amount)
        if not ok:
            raise ValueError("withdraw failed")
        atm.dispenser.dispense(int(self.amount))
        bal = atm.bank.get_balance(atm.card.account_id)
        return Receipt("WITHDRAW", self.amount, bal)


class BalanceCommand(TransactionCommand):
    def execute(self, atm: "ATM") -> Receipt:
        assert atm.card
        bal = atm.bank.get_balance(atm.card.account_id)
        return Receipt("BALANCE", 0.0, bal)


class ATM:
    MAX_PIN_FAILS = 3

    def __init__(self, bank: BankingService, dispenser: CashDispenser):
        self.state = ATMState.IDLE
        self.card: Optional[Card] = None
        self.bank = bank
        self.dispenser = dispenser
        self.failed_pin_attempts = 0

    def insert_card(self, card: Card) -> None:
        if self.state != ATMState.IDLE:
            raise RuntimeError("busy")
        if card.blocked:
            raise ValueError("card blocked")
        self.card = card
        self.state = ATMState.CARD_INSERTED

    def enter_pin(self, pin: str) -> bool:
        if self.state != ATMState.CARD_INSERTED or not self.card:
            raise RuntimeError("no card")
        if self.bank.verify_pin(self.card, pin):
            self.failed_pin_attempts = 0
            self.state = ATMState.PIN_VERIFIED
            return True
        self.failed_pin_attempts += 1
        if self.failed_pin_attempts >= self.MAX_PIN_FAILS:
            self.card.blocked = True
            self.eject_card()
        return False

    def execute(self, cmd: TransactionCommand) -> Receipt:
        if self.state != ATMState.PIN_VERIFIED:
            raise RuntimeError("PIN required")
        self.state = ATMState.PROCESSING
        try:
            return cmd.execute(self)
        finally:
            self.state = ATMState.PIN_VERIFIED

    def eject_card(self) -> None:
        self.card = None
        self.state = ATMState.IDLE
`

const java = `enum ATMState { IDLE, CARD_INSERTED, PIN_VERIFIED, PROCESSING, EJECTING }

class Card { String number, accountId; boolean blocked; Card(String n, String a) { number=n; accountId=a; } }

class Account {
  double balance;
  Account(double b) { balance = b; }
  void debit(double a) { if (a > balance) throw new IllegalStateException(); balance -= a; }
  void credit(double a) { balance += a; }
}

class Receipt { final String type; final double amount, balance;
  Receipt(String t, double a, double b) { type=t; amount=a; balance=b; }
}

interface BankingService {
  boolean verifyPin(Card c, String pin);
  double getBalance(String accountId);
  boolean withdraw(String accountId, double amount);
}

interface TransactionCommand { Receipt execute(ATM atm); }

class WithdrawCommand implements TransactionCommand {
  final double amount; WithdrawCommand(double a) { amount = a; }
  public Receipt execute(ATM atm) {
    if (!atm.bank.withdraw(atm.card.accountId, amount)) throw new IllegalStateException();
    atm.dispenser.dispense((int) amount);
    return new Receipt("WITHDRAW", amount, atm.bank.getBalance(atm.card.accountId));
  }
}

class CashDispenser {
  int[] denoms = {100,50,20,10,5,1};
  java.util.Map<Integer,Integer> inv = new java.util.HashMap<>();
  CashDispenser() { for (int d : denoms) inv.put(d, 10); }
  void dispense(int amount) {
    int rem = amount;
    for (int d : denoms) {
      int need = Math.min(rem / d, inv.getOrDefault(d, 0));
      rem -= need * d; inv.put(d, inv.get(d) - need);
    }
    if (rem != 0) throw new IllegalStateException("cannot dispense");
  }
}

class ATM {
  static final int MAX_FAIL = 3;
  ATMState state = ATMState.IDLE;
  Card card;
  final BankingService bank;
  final CashDispenser dispenser = new CashDispenser();
  int failedPin = 0;
  ATM(BankingService b) { bank = b; }
  void insertCard(Card c) { if (state != ATMState.IDLE) throw new IllegalStateException(); card = c; state = ATMState.CARD_INSERTED; }
  boolean enterPin(String pin) {
    if (bank.verifyPin(card, pin)) { failedPin = 0; state = ATMState.PIN_VERIFIED; return true; }
    if (++failedPin >= MAX_FAIL) { card.blocked = true; ejectCard(); }
    return false;
  }
  Receipt execute(TransactionCommand cmd) { state = ATMState.PROCESSING; Receipt r = cmd.execute(this); state = ATMState.PIN_VERIFIED; return r; }
  void ejectCard() { card = null; state = ATMState.IDLE; }
}
`

const ts = `enum ATMState { Idle, CardInserted, PinVerified, Processing }

class Card {
  blocked = false
  constructor(public readonly number: string, public readonly accountId: string) {}
}

interface BankingService {
  verifyPin(card: Card, pin: string): boolean
  getBalance(accountId: string): number
  withdraw(accountId: string, amount: number): boolean
}

class Receipt {
  constructor(public readonly type: string, public readonly amount: number, public readonly balance: number) {}
}

interface TransactionCommand { execute(atm: ATM): Receipt }

class WithdrawCommand implements TransactionCommand {
  constructor(private amount: number) {}
  execute(atm: ATM): Receipt {
    if (!atm.bank.withdraw(atm.card!.accountId, this.amount)) throw new Error('fail')
    atm.dispenser.dispense(this.amount)
    return new Receipt('WITHDRAW', this.amount, atm.bank.getBalance(atm.card!.accountId))
  }
}

class CashDispenser {
  denoms = [100, 50, 20, 10, 5, 1]
  inv = new Map(this.denoms.map(d => [d, 10]))
  dispense(amount: number) {
    let rem = amount
    for (const d of this.denoms) {
      const need = Math.min(Math.floor(rem / d), this.inv.get(d)!)
      rem -= need * d
      this.inv.set(d, this.inv.get(d)! - need)
    }
    if (rem) throw new Error('cannot dispense')
  }
}

class ATM {
  static MAX_FAIL = 3
  state = ATMState.Idle
  card: Card | null = null
  failedPin = 0
  dispenser = new CashDispenser()
  constructor(public bank: BankingService) {}
  insertCard(card: Card) {
    if (this.state !== ATMState.Idle) throw new Error('busy')
    this.card = card
    this.state = ATMState.CardInserted
  }
  enterPin(pin: string): boolean {
    if (this.bank.verifyPin(this.card!, pin)) {
      this.failedPin = 0
      this.state = ATMState.PinVerified
      return true
    }
    if (++this.failedPin >= ATM.MAX_FAIL) {
      this.card!.blocked = true
      this.ejectCard()
    }
    return false
  }
  execute(cmd: TransactionCommand) {
    if (this.state !== ATMState.PinVerified) throw new Error('PIN')
    this.state = ATMState.Processing
    const r = cmd.execute(this)
    this.state = ATMState.PinVerified
    return r
  }
  ejectCard() { this.card = null; this.state = ATMState.Idle }
}

export { ATM, WithdrawCommand, Card }
`

const cpp = `#include <map>
#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

enum class ATMState { Idle, CardInserted, PinVerified, Processing };

struct Card { std::string number, accountId; bool blocked{false}; };

struct Receipt { std::string type; double amount, balance; };

struct Account { double balance; void debit(double a) { if (a>balance) throw std::runtime_error("nsf"); balance-=a; } };

class BankingService {
public:
  virtual ~BankingService() = default;
  virtual bool verifyPin(const Card&, const std::string&) = 0;
  virtual double getBalance(const std::string&) = 0;
  virtual bool withdraw(const std::string&, double) = 0;
};

class CashDispenser {
  std::vector<int> denoms{100,50,20,10,5,1};
  std::map<int,int> inv{{100,10},{50,10},{20,10},{10,10},{5,10},{1,10}};
public:
  void dispense(int amount) {
    int rem = amount;
    for (int d : denoms) {
      int need = std::min(rem/d, inv[d]);
      rem -= need*d; inv[d]-=need;
    }
    if (rem) throw std::runtime_error("dispense");
  }
};

class ATM {
public:
  ATMState state{ATMState::Idle};
  std::optional<Card> card;
  BankingService& bank;
  CashDispenser dispenser;
  int failedPin{0};
  static constexpr int MAX_FAIL = 3;
  explicit ATM(BankingService& b) : bank(b) {}
  void insertCard(const Card& c) { if (state!=ATMState::Idle) throw std::runtime_error("busy"); card=c; state=ATMState::CardInserted; }
  bool enterPin(const std::string& pin) {
    if (!bank.verifyPin(*card, pin)) {
      if (++failedPin >= MAX_FAIL) { card->blocked=true; ejectCard(); }
      return false;
    }
    failedPin=0; state=ATMState::PinVerified; return true;
  }
  void ejectCard() { card.reset(); state=ATMState::Idle; }
};
`

const goCode = `package atm

import "errors"

type ATMState int

const (
	Idle ATMState = iota
	CardInserted
	PinVerified
	Processing
)

type Card struct {
	Number, AccountID string
	Blocked           bool
}

type Receipt struct {
	Type           string
	Amount, Balance float64
}

type BankingService interface {
	VerifyPin(card Card, pin string) bool
	GetBalance(accountID string) float64
	Withdraw(accountID string, amount float64) bool
}

type CashDispenser struct {
	Inv map[int]int
}

func (d *CashDispenser) Dispense(amount int) error {
	denoms := []int{100, 50, 20, 10, 5, 1}
	rem := amount
	for _, denom := range denoms {
		need := rem / denom
		if need > d.Inv[denom] {
			need = d.Inv[denom]
		}
		rem -= need * denom
		d.Inv[denom] -= need
	}
	if rem != 0 {
		return errors.New("cannot dispense")
	}
	return nil
}

type TransactionCommand interface {
	Execute(a *ATM) Receipt
}

type WithdrawCommand struct{ Amount float64 }

func (w WithdrawCommand) Execute(a *ATM) Receipt {
	if !a.Bank.Withdraw(a.Card.AccountID, w.Amount) {
		panic("withdraw failed")
	}
	_ = a.Dispenser.Dispense(int(w.Amount))
	return Receipt{"WITHDRAW", w.Amount, a.Bank.GetBalance(a.Card.AccountID)}
}

type ATM struct {
	State            ATMState
	Card             *Card
	Bank             BankingService
	Dispenser        CashDispenser
	FailedPinAttempts int
}

const maxPinFails = 3

func (a *ATM) InsertCard(c Card) error {
	if a.State != Idle {
		return errors.New("busy")
	}
	a.Card = &c
	a.State = CardInserted
	return nil
}

func (a *ATM) EnterPin(pin string) bool {
	if a.Bank.VerifyPin(*a.Card, pin) {
		a.FailedPinAttempts = 0
		a.State = PinVerified
		return true
	}
	a.FailedPinAttempts++
	if a.FailedPinAttempts >= maxPinFails {
		a.Card.Blocked = true
		a.EjectCard()
	}
	return false
}

func (a *ATM) Execute(cmd TransactionCommand) Receipt {
	a.State = Processing
	r := cmd.Execute(a)
	a.State = PinVerified
	return r
}

func (a *ATM) EjectCard() { a.Card = nil; a.State = Idle }
`

const csharp = `using System;
using System.Collections.Generic;

enum ATMState { Idle, CardInserted, PinVerified, Processing }

class Card { public string Number, AccountId; public bool Blocked; public Card(string n, string a) { Number=n; AccountId=a; } }

class Receipt { public string Type; public double Amount, Balance; public Receipt(string t, double a, double b) { Type=t; Amount=a; Balance=b; } }

interface IBankingService {
  bool VerifyPin(Card card, string pin);
  double GetBalance(string accountId);
  bool Withdraw(string accountId, double amount);
}

interface ITransactionCommand { Receipt Execute(ATM atm); }

class WithdrawCommand : ITransactionCommand {
  readonly double _amount;
  public WithdrawCommand(double amount) => _amount = amount;
  public Receipt Execute(ATM atm) {
    if (!atm.Bank.Withdraw(atm.Card!.AccountId, _amount)) throw new InvalidOperationException();
    atm.Dispenser.Dispense((int)_amount);
    return new Receipt("WITHDRAW", _amount, atm.Bank.GetBalance(atm.Card.AccountId));
  }
}

class CashDispenser {
  readonly int[] _denoms = {100,50,20,10,5,1};
  public Dictionary<int,int> Inv { get; } = new() { [100]=10,[50]=10,[20]=10,[10]=10,[5]=10,[1]=10 };
  public void Dispense(int amount) {
    var rem = amount;
    foreach (var d in _denoms) {
      var need = Math.Min(rem / d, Inv[d]);
      rem -= need * d; Inv[d] -= need;
    }
    if (rem != 0) throw new InvalidOperationException();
  }
}

class ATM {
  public const int MaxPinFails = 3;
  public ATMState State { get; private set; } = ATMState.Idle;
  public Card? Card { get; private set; }
  public IBankingService Bank { get; }
  public CashDispenser Dispenser { get; } = new();
  int _failedPin;
  public ATM(IBankingService bank) => Bank = bank;
  public void InsertCard(Card card) { if (State != ATMState.Idle) throw new InvalidOperationException(); Card = card; State = ATMState.CardInserted; }
  public bool EnterPin(string pin) {
    if (Bank.VerifyPin(Card!, pin)) { _failedPin = 0; State = ATMState.PinVerified; return true; }
    if (++_failedPin >= MaxPinFails) { Card!.Blocked = true; EjectCard(); }
    return false;
  }
  public Receipt Execute(ITransactionCommand cmd) { State = ATMState.Processing; var r = cmd.Execute(this); State = ATMState.PinVerified; return r; }
  public void EjectCard() { Card = null; State = ATMState.Idle; }
}
`

export const atmMachineSolution: ProblemSolution = {
  slug: 'atm-machine',
  title: 'ATM Machine',
  overview: {
    introduction:
      'An ATM session is a state machine: card insert → PIN → transaction → receipt → eject. Banking operations go through a BankingService; cash uses a greedy bill dispenser (chain of denominations). Transactions are Command objects for logging and extension.',
    constraints: [
      'Illegal actions in wrong states must fail fast (no withdraw while Idle).',
      'Three failed PINs block the card.',
      'Withdrawals must be atomic with balance debit and physical dispense.',
    ],
    assumptions: [
      'Single user session at a time per ATM hardware unit.',
      'Bank authorizes balance changes; ATM does not store ledger of record.',
      'Session timeout resets to Idle and ejects card (hook for production).',
    ],
    clarificationQuestions: [
      'Are deposits cash-only or check-with-hold?',
      'Minimum bill denomination and mix rules?',
      'Is PIN verified locally or always at the bank?',
      'Should failed dispense roll back the debit?',
      'Multi-currency support?',
    ],
  },
  interviewApproach: {
    howToThink: 'Model states first, then plug in Bank and Dispenser. Each transaction type is a command executed only in PIN_VERIFIED.',
    breakdown: [
      'States: Idle → CardInserted → PINVerified → Processing.',
      'BankingService interface for verify, balance, withdraw, deposit.',
      'CashDispenser greedy largest-bills-first.',
      'Command per transaction; Receipt DTO.',
    ],
    entities: [
      { name: 'ATM', responsibility: 'State machine and session orchestration.' },
      { name: 'BankingService', responsibility: 'Remote account operations.' },
      { name: 'CashDispenser', responsibility: 'Bill inventory and dispense algorithm.' },
      { name: 'TransactionCommand', responsibility: 'Encapsulates withdraw/balance/deposit.' },
    ],
    relationships: [
      'ATM uses BankingService and CashDispenser.',
      'Commands execute against ATM context (card, bank, dispenser).',
    ],
    patternsAndOop: [
      'State: ATMState guards transitions.',
      'Command: WithdrawCommand, BalanceCommand.',
      'Chain of Responsibility: bill denominations for change/dispense.',
    ],
    stepByStep: [
      'Draw state diagram on whiteboard.',
      'Implement insertCard / enterPin / ejectCard.',
      'Add WithdrawCommand: bank.withdraw then dispenser.dispense.',
      'Discuss rollback if dispense fails.',
      'Mention transaction log append-only store.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'State machine prevents invalid operations. Banking and hardware are ports (interfaces) so tests use in-memory fakes. Commands keep ATM.switch-free as features grow.',
    classResponsibilities: [
      { name: 'ATM', responsibility: 'Session lifecycle and state enforcement.' },
      { name: 'CashDispenser', responsibility: 'Greedy denomination breakdown.' },
      { name: 'TransactionCommand', responsibility: 'Single transaction unit of work.' },
    ],
    interfacesAndAbstractions: ['BankingService isolates TLS/ACID bank API.', 'TransactionCommand for execute/log/undo hooks.'],
    relationships: ['ATM aggregates Bank + Dispenser for one session.'],
    solid: [
      'SRP: dispenser does not verify PIN.',
      'OCP: new transaction = new Command class.',
      'DIP: ATM depends on BankingService interface.',
    ],
    patterns: [
      { name: 'State', why: 'Encode valid inputs per session phase.' },
      { name: 'Command', why: 'Transactions as objects for audit trail.' },
      { name: 'Chain of Responsibility', why: 'Try $100 then $50… for dispense.' },
    ],
    decisions: [
      { decision: 'Block card after 3 PIN failures.', rationale: 'Matches FR; bank may also block server-side.' },
      { decision: 'Greedy dispense.', rationale: 'Minimizes bill count; DP if odd inventory.' },
    ],
    extensibility: 'DepositCommand with envelope slot; PinChangeCommand; hardware facades for CardReader, Printer, Keypad.',
  },
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    steps: [
      'Idle → insertCard → CardInserted.',
      'enterPin → on success PINVerified; on 3 fails block + eject.',
      'execute(WithdrawCommand): bank withdraw, dispenser dispense, Receipt.',
      'ejectCard → Idle.',
    ],
    examples: [
      {
        title: 'Successful withdraw $120',
        input: 'PIN ok, WithdrawCommand(120)',
        output: 'Receipt{WITHDRAW, 120, newBalance}',
        explanation: 'Bank debits; dispenser takes 100+20 from inventory.',
      },
      {
        title: 'Wrong state withdraw',
        input: 'execute while Idle',
        output: 'RuntimeError',
        explanation: 'State guard rejects before touching bank.',
      },
    ],
  },
  followUps: [
    { question: 'Dispense fails after debit - what then?', answer: 'Two-phase: reserve cash, dispense, commit debit; on failure compensating credit + alarm. Log idempotent txn id.' },
    { question: 'Why Command vs methods on ATM?', answer: 'Audit log stores command type + params; supports macro replay and undo for deposits not yet settled.' },
    { question: 'Session timeout?', answer: 'Timer in ATM; on fire → ejectCard and clear PIN state; bank may end session token.' },
    { question: 'Concurrent ATMs same account?', answer: 'Bank enforces serializable balance updates; ATM is thin client.' },
    { question: 'Optimal dispense with limited bills?', answer: 'Bounded knapsack DP instead of greedy when inventory is tight.' },
    { question: 'Security beyond PIN?', answer: 'TLS to bank, tamper-evident logs, no PIN storage, rate limit insertCard.' },
  ],
  extras: {
    edgeCases: ['Insufficient bills but sufficient balance', 'Partial dispense hardware fault', 'Blocked card insert'],
    commonMistakes: ['God ATM with giant switch', 'No state checks', 'Dispenser debits bank internally'],
    complexity: 'Greedy dispense O(#denominations); bank calls O(1) network aside.',
    testing: ['State table tests', 'PIN lockout', 'Dispense with depleted $20 bucket'],
    extensions: ['Check deposit', 'Contactless', 'Multi-account per card'],
    takeaways: ['State machine first', 'Bank vs hardware separation', 'Commands for transactions'],
  },
}
