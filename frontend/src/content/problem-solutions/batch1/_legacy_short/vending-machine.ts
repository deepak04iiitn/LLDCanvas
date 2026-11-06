import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('vm', 'VendingMachine', 40, 40, [
    attr('-', 'state', 'VMState'),
    attr('-', 'balance', 'int'),
    attr('-', 'inventory', 'Inventory'),
    attr('-', 'coinBank', 'CoinBank'),
    attr('-', 'selected', 'Product?'),
  ], [
    method('+', 'insertCoin', 'cents', 'void'),
    method('+', 'selectProduct', 'code', 'void'),
    method('+', 'dispense', '', 'Product'),
    method('+', 'cancel', '', 'int'),
  ]),
  enm('vs', 'VMState', 40, 220, ['IDLE', 'HAS_MONEY', 'PRODUCT_SELECTED', 'DISPENSING', 'RETURNING_CHANGE']),
  cls('inv', 'Inventory', 320, 40, [
    attr('-', 'products', 'Map<string, Product>'),
  ], [
    method('+', 'get', 'code', 'Product?'),
    method('+', 'decrement', 'code', 'bool'),
  ]),
  cls('pr', 'Product', 560, 40, [
    attr('-', 'code', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'priceCents', 'int'),
    attr('-', 'stock', 'int'),
  ], []),
  cls('cb', 'CoinBank', 320, 200, [
    attr('-', 'coins', 'Map<int, int>'),
  ], [
    method('+', 'add', 'denom, count', 'void'),
    method('+', 'makeChange', 'cents', 'Map<int, int>'),
  ]),
  cls('disp', 'Dispenser', 560, 200, [], [
    method('+', 'release', 'product: Product', 'void'),
  ]),
]

const edges = [
  edge('e1', 'vm', 'vs', 'dependency', 'bottom', 'top'),
  edge('e2', 'vm', 'inv', 'aggregation', 'right', 'left'),
  edge('e3', 'inv', 'pr', 'composition', 'right', 'left'),
  edge('e4', 'vm', 'cb', 'aggregation', 'bottom@40', 'top'),
  edge('e5', 'vm', 'disp', 'aggregation', 'right@60', 'left'),
]

const py = `from __future__ import annotations
from dataclasses import dataclass
from enum import Enum, auto
from typing import Dict, Optional


class VMState(Enum):
    IDLE = auto()
    HAS_MONEY = auto()
    PRODUCT_SELECTED = auto()
    DISPENSING = auto()
    RETURNING_CHANGE = auto()


@dataclass
class Product:
    code: str
    name: str
    price_cents: int
    stock: int


class Inventory:
    def __init__(self, products: Dict[str, Product]):
        self.products = products

    def get(self, code: str) -> Optional[Product]:
        return self.products.get(code)

    def decrement(self, code: str) -> bool:
        p = self.products[code]
        if p.stock <= 0:
            return False
        p.stock -= 1
        return True


class CoinBank:
    DENOMS = [100, 50, 25, 10, 5, 1]

    def __init__(self):
        self.coins: Dict[int, int] = {d: 20 for d in self.DENOMS}

    def add(self, cents: int) -> None:
        self.coins[cents] = self.coins.get(cents, 0) + 1

    def make_change(self, cents: int) -> Dict[int, int]:
        remaining = cents
        out: Dict[int, int] = {}
        for d in self.DENOMS:
            take = min(remaining // d, self.coins.get(d, 0))
            if take:
                out[d] = take
                remaining -= take * d
                self.coins[d] -= take
        if remaining:
            raise ValueError("cannot make change")
        return out


class Dispenser:
    def release(self, product: Product) -> None:
        print(f"Dispensed {product.name}")


class VendingMachine:
    LOW_STOCK = 2

    def __init__(self, inventory: Inventory, coin_bank: Optional[CoinBank] = None):
        self.state = VMState.IDLE
        self.balance = 0
        self.inventory = inventory
        self.coin_bank = coin_bank or CoinBank()
        self.dispenser = Dispenser()
        self.selected: Optional[Product] = None

    def insert_coin(self, cents: int) -> None:
        if self.state in (VMState.DISPENSING, VMState.RETURNING_CHANGE):
            raise RuntimeError("busy")
        self.balance += cents
        self.coin_bank.add(cents)
        self.state = VMState.HAS_MONEY if self.state == VMState.IDLE else self.state

    def select_product(self, code: str) -> None:
        if self.state not in (VMState.HAS_MONEY, VMState.IDLE):
            raise RuntimeError("invalid state")
        product = self.inventory.get(code)
        if not product or product.stock <= 0:
            raise ValueError("out of stock")
        if self.balance < product.price_cents:
            raise ValueError("insufficient payment")
        self.selected = product
        self.state = VMState.PRODUCT_SELECTED

    def dispense(self) -> Product:
        if self.state != VMState.PRODUCT_SELECTED or not self.selected:
            raise RuntimeError("nothing selected")
        self.state = VMState.DISPENSING
        if not self.inventory.decrement(self.selected.code):
            raise RuntimeError("stock race")
        self.dispenser.release(self.selected)
        change = self.balance - self.selected.price_cents
        self.balance = 0
        product = self.selected
        self.selected = None
        if change:
            self.state = VMState.RETURNING_CHANGE
            self.coin_bank.make_change(change)
        self.state = VMState.IDLE
        if product.stock <= self.LOW_STOCK:
            print(f"LOW STOCK alert: {product.name}")
        return product

    def cancel(self) -> int:
        refund = self.balance
        self.balance = 0
        self.selected = None
        if refund:
            self.coin_bank.make_change(refund)
        self.state = VMState.IDLE
        return refund
`

const java = `enum VMState { IDLE, HAS_MONEY, PRODUCT_SELECTED, DISPENSING, RETURNING_CHANGE }

class Product { String code, name; int priceCents, stock;
  Product(String c, String n, int p, int s) { code=c; name=n; priceCents=p; stock=s; }
}

class Inventory {
  java.util.Map<String, Product> products;
  Inventory(java.util.Map<String, Product> p) { products = p; }
  Product get(String code) { return products.get(code); }
  boolean decrement(String code) { Product p = products.get(code); if (p.stock<=0) return false; p.stock--; return true; }
}

class CoinBank {
  int[] denoms = {100,50,25,10,5,1};
  java.util.Map<Integer,Integer> coins = new java.util.HashMap<>();
  CoinBank() { for (int d: denoms) coins.put(d, 20); }
  java.util.Map<Integer,Integer> makeChange(int cents) {
    int rem = cents; java.util.Map<Integer,Integer> out = new java.util.HashMap<>();
    for (int d: denoms) {
      int take = Math.min(rem/d, coins.get(d));
      rem -= take*d; coins.put(d, coins.get(d)-take);
      if (take>0) out.put(d, take);
    }
    if (rem!=0) throw new IllegalStateException("change");
    return out;
  }
}

class VendingMachine {
  VMState state = VMState.IDLE;
  int balance;
  Inventory inventory;
  CoinBank coinBank = new CoinBank();
  Product selected;
  VendingMachine(Inventory inv) { inventory = inv; }
  void insertCoin(int cents) { balance += cents; state = VMState.HAS_MONEY; }
  void selectProduct(String code) {
    Product p = inventory.get(code);
    if (p == null || p.stock==0 || balance < p.priceCents) throw new IllegalStateException();
    selected = p; state = VMState.PRODUCT_SELECTED;
  }
  Product dispense() {
    inventory.decrement(selected.code);
    int change = balance - selected.priceCents;
    balance = 0; Product out = selected; selected = null;
    if (change>0) coinBank.makeChange(change);
    state = VMState.IDLE; return out;
  }
  int cancel() { int r = balance; balance=0; selected=null; if (r>0) coinBank.makeChange(r); state=VMState.IDLE; return r; }
}
`

const ts = `enum VMState { Idle, HasMoney, ProductSelected, Dispensing, ReturningChange }

class Product {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly priceCents: number,
    public stock: number,
  ) {}
}

class Inventory {
  constructor(public products: Map<string, Product>) {}
  get(code: string) { return this.products.get(code) }
  decrement(code: string) {
    const p = this.products.get(code)!
    if (p.stock <= 0) return false
    p.stock--
    return true
  }
}

class CoinBank {
  denoms = [100, 50, 25, 10, 5, 1]
  coins = new Map(this.denoms.map(d => [d, 20]))
  makeChange(cents: number) {
    let rem = cents
    for (const d of this.denoms) {
      const take = Math.min(Math.floor(rem / d), this.coins.get(d)!)
      rem -= take * d
      this.coins.set(d, this.coins.get(d)! - take)
    }
    if (rem) throw new Error('change')
  }
}

class VendingMachine {
  state = VMState.Idle
  balance = 0
  coinBank = new CoinBank()
  selected: Product | null = null
  constructor(public inventory: Inventory) {}
  insertCoin(cents: number) { this.balance += cents; this.state = VMState.HasMoney }
  selectProduct(code: string) {
    const p = this.inventory.get(code)
    if (!p || p.stock <= 0 || this.balance < p.priceCents) throw new Error('bad select')
    this.selected = p
    this.state = VMState.ProductSelected
  }
  dispense() {
    this.inventory.decrement(this.selected!.code)
    const change = this.balance - this.selected!.priceCents
    this.balance = 0
    const out = this.selected!
    this.selected = null
    if (change) this.coinBank.makeChange(change)
    this.state = VMState.Idle
    return out
  }
  cancel() {
    const r = this.balance
    this.balance = 0
    if (r) this.coinBank.makeChange(r)
    this.state = VMState.Idle
    return r
  }
}

export { VendingMachine, Product, Inventory }
`

const cpp = `#include <map>
#include <optional>
#include <stdexcept>
#include <string>

enum class VMState { Idle, HasMoney, ProductSelected, Dispensing, ReturningChange };

struct Product { std::string code, name; int priceCents, stock; };

class Inventory {
  std::map<std::string, Product> products;
public:
  explicit Inventory(std::map<std::string, Product> p) : products(std::move(p)) {}
  Product* get(const std::string& code) { auto it = products.find(code); return it==products.end()? nullptr : &it->second; }
  bool decrement(const std::string& code) { auto* p = get(code); if (!p || p->stock<=0) return false; p->stock--; return true; }
};

class CoinBank {
  std::map<int,int> coins{{100,20},{50,20},{25,20},{10,20},{5,20},{1,20}};
  int denoms[6]{100,50,25,10,5,1};
public:
  void makeChange(int cents) {
    int rem = cents;
    for (int d : denoms) {
      int take = std::min(rem/d, coins[d]);
      rem -= take*d; coins[d]-=take;
    }
    if (rem) throw std::runtime_error("change");
  }
};

class VendingMachine {
  VMState state{VMState::Idle};
  int balance{0};
  Inventory inventory;
  CoinBank bank;
  Product* selected{nullptr};
public:
  explicit VendingMachine(Inventory inv) : inventory(std::move(inv)) {}
  void insertCoin(int c) { balance += c; state = VMState::HasMoney; }
  void selectProduct(const std::string& code) {
    selected = inventory.get(code);
    if (!selected || selected->stock<=0 || balance < selected->priceCents) throw std::runtime_error("select");
    state = VMState::ProductSelected;
  }
  Product dispense() {
    inventory.decrement(selected->code);
    int change = balance - selected->priceCents;
    balance = 0;
    Product out = *selected; selected = nullptr;
    if (change) bank.makeChange(change);
    state = VMState::Idle;
    return out;
  }
};
`

const goCode = `package vending

import "errors"

type VMState int

const (
	Idle VMState = iota
	HasMoney
	ProductSelected
	Dispensing
	ReturningChange
)

type Product struct {
	Code, Name string
	PriceCents int
	Stock      int
}

type Inventory struct{ Products map[string]*Product }

func (inv *Inventory) Decrement(code string) bool {
	p := inv.Products[code]
	if p.Stock <= 0 {
		return false
	}
	p.Stock--
	return true
}

type CoinBank struct{ Coins map[int]int }

func (b *CoinBank) MakeChange(cents int) error {
	denoms := []int{100, 50, 25, 10, 5, 1}
	rem := cents
	for _, d := range denoms {
		take := rem / d
		if take > b.Coins[d] {
			take = b.Coins[d]
		}
		rem -= take * d
		b.Coins[d] -= take
	}
	if rem != 0 {
		return errors.New("change")
	}
	return nil
}

type VendingMachine struct {
	State     VMState
	Balance   int
	Inventory *Inventory
	Bank      CoinBank
	Selected  *Product
}

func (v *VendingMachine) InsertCoin(cents int) { v.Balance += cents; v.State = HasMoney }

func (v *VendingMachine) SelectProduct(code string) error {
	p := v.Inventory.Products[code]
	if p == nil || p.Stock == 0 || v.Balance < p.PriceCents {
	 return errors.New("select")
	}
	v.Selected = p
	v.State = ProductSelected
	return nil
}

func (v *VendingMachine) Dispense() (*Product, error) {
	if v.State != ProductSelected {
		return nil, errors.New("state")
	}
	if !v.Inventory.Decrement(v.Selected.Code) {
		return nil, errors.New("stock")
	}
	change := v.Balance - v.Selected.PriceCents
	v.Balance = 0
	out := v.Selected
	v.Selected = nil
	if change > 0 {
		_ = v.Bank.MakeChange(change)
	}
	v.State = Idle
	return out, nil
}
`

const csharp = `using System;
using System.Collections.Generic;

enum VMState { Idle, HasMoney, ProductSelected, Dispensing, ReturningChange }

class Product { public string Code, Name; public int PriceCents, Stock; }

class Inventory {
  public Dictionary<string, Product> Products { get; }
  public Inventory(Dictionary<string, Product> p) => Products = p;
  public bool Decrement(string code) { var p = Products[code]; if (p.Stock<=0) return false; p.Stock--; return true; }
}

class CoinBank {
  public Dictionary<int,int> Coins { get; } = new() { [100]=20,[50]=20,[25]=20,[10]=20,[5]=20,[1]=20 };
  public void MakeChange(int cents) {
    var denoms = new[]{100,50,25,10,5,1};
    var rem = cents;
    foreach (var d in denoms) {
      var take = Math.Min(rem/d, Coins[d]);
      rem -= take*d; Coins[d]-=take;
    }
    if (rem!=0) throw new InvalidOperationException();
  }
}

class VendingMachine {
  public VMState State { get; private set; } = VMState.Idle;
  public int Balance { get; private set; }
  public Inventory Inventory { get; }
  public CoinBank Bank { get; } = new();
  Product? _selected;
  public VendingMachine(Inventory inv) => Inventory = inv;
  public void InsertCoin(int c) { Balance += c; State = VMState.HasMoney; }
  public void SelectProduct(string code) {
    var p = Inventory.Products[code];
    if (p.Stock==0 || Balance < p.PriceCents) throw new InvalidOperationException();
    _selected = p; State = VMState.ProductSelected;
  }
  public Product Dispense() {
    Inventory.Decrement(_selected!.Code);
    var change = Balance - _selected.PriceCents;
    Balance = 0; var outP = _selected; _selected = null;
    if (change>0) Bank.MakeChange(change);
    State = VMState.Idle; return outP;
  }
}
`

export const vendingMachineSolution: ProblemSolution = {
  slug: 'vending-machine',
  title: 'Vending Machine',
  overview: {
    introduction:
      'A vending machine is a state machine over payment and selection. Inventory tracks product stock; CoinBank tracks float and makes optimal change. Dispense is transactional: decrement stock, release product, return change, then return to Idle.',
    constraints: ['Exact change only when bank has denominations.', 'Cancel refunds full balance.', 'Low-stock alert when stock ≤ threshold.'],
    assumptions: ['Cash cents only in demo; digital payment adds PaymentProcessor strategy.', 'Admin restock bypasses state machine (extension).'],
    clarificationQuestions: ['Multi-item purchase in one session?', 'Allow select before payment?', 'Weighted products?', 'Card payments online-only?'],
  },
  interviewApproach: {
    howToThink: 'States gate which methods are legal. Separate inventory, change making, and physical dispense.',
    breakdown: ['VMState transitions', 'Product + Inventory', 'CoinBank greedy change', 'dispense + cancel flows'],
    entities: [
      { name: 'VendingMachine', responsibility: 'State machine façade.' },
      { name: 'Inventory', responsibility: 'Stock lookup and decrement.' },
      { name: 'CoinBank', responsibility: 'Coin float and change algorithm.' },
    ],
    relationships: ['VendingMachine aggregates Inventory and CoinBank.'],
    patternsAndOop: ['State pattern', 'Chain of Responsibility for denominations'],
    stepByStep: ['Draw state diagram', 'insertCoin → select → dispense', 'cancel path', 'low stock hook'],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary: 'State enum prevents illegal sequences. CoinBank encapsulates change policy. Inventory owns stock mutations during dispense.',
    classResponsibilities: [
      { name: 'VendingMachine', responsibility: 'Orchestration and state guards.' },
      { name: 'CoinBank', responsibility: 'Greedy makeChange.' },
    ],
    interfacesAndAbstractions: ['PaymentProcessor for cash vs card.', 'Dispenser hardware adapter.'],
    relationships: ['Composition Product in Inventory map.'],
    solid: ['SRP: change logic not in VendingMachine.select', 'OCP: new payment = new processor'],
    patterns: [
      { name: 'State', why: 'Idle/HasMoney/ProductSelected transitions.' },
      { name: 'Chain of Responsibility', why: 'Largest coin first for change.' },
    ],
    decisions: [{ decision: 'Greedy change', rationale: 'Fewest coins when bank is plentiful.' }],
    extensibility: 'AdminPanel restock; digital PaymentProcessor; transaction rollback on dispense jam.',
  },
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    steps: ['insertCoin → HasMoney', 'selectProduct if balance ≥ price', 'dispense decrements stock and change', 'cancel refunds'],
    examples: [
      { title: 'Buy soda 150¢ with 200¢', input: 'insert 200, select A1(150)', output: 'product + 50¢ change', explanation: 'CoinBank returns 50.' },
    ],
  },
  followUps: [
    { question: 'Dispense jam after stock decrement?', answer: 'Two-phase commit: reserve stock, dispense, confirm; on jam refund and restock.' },
    { question: 'Offline card?', answer: 'Queue authorized tokens; sync when online.' },
    { question: 'Optimal change when greedy fails?', answer: 'DP on denominations with bank limits.' },
    { question: 'Concurrent buyers?', answer: 'Single-threaded machine; one session lock.' },
    { question: 'Admin mode?', answer: 'Separate AdminState with PIN; restock without customer states.' },
    { question: 'Digital wallet?', answer: 'PaymentProcessor.charge; skip CoinBank for change unless hybrid.' },
  ],
  extras: {
    edgeCases: ['Select without enough money', 'Empty coin bank for change', 'Zero stock'],
    commonMistakes: ['No state checks', 'Change from customer coins just inserted incorrectly'],
    complexity: 'Change O(#denoms); inventory O(1).',
    testing: ['State matrix', 'Change edge cases', 'Cancel mid-session'],
    extensions: ['Multi-slot motor controller', 'Telemetry'],
    takeaways: ['State machine first', 'Isolate coin math', 'Transactional dispense'],
  },
}
