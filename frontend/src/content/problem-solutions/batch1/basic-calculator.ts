import type { ProblemSolution } from '../types'
import { GRID, abstractCls, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('calc', 'Calculator', GRID.x(0), GRID.y(0), [
    attr('-', 'result', 'double'),
    attr('-', 'history', 'CommandHistory'),
  ], [
    method('+', 'add', 'x: double', 'Calculator'),
    method('+', 'subtract', 'x: double', 'Calculator'),
    method('+', 'multiply', 'x: double', 'Calculator'),
    method('+', 'divide', 'x: double', 'Calculator'),
    method('+', 'undo', '', 'boolean'),
    method('+', 'redo', '', 'boolean'),
    method('+', 'clear', '', 'void'),
  ]),
  cls('hist', 'CommandHistory', GRID.x(0), GRID.y(1), [
    attr('-', 'undoStack', 'List<Command>'),
    attr('-', 'redoStack', 'List<Command>'),
    attr('-', 'maxSize', 'int'),
  ], [
    method('+', 'push', 'c: Command', 'void'),
    method('+', 'takeForUndo', '', 'Command?'),
    method('+', 'takeForRedo', '', 'Command?'),
    method('+', 'clear', '', 'void'),
  ]),
  abstractCls('cmd', 'Command', GRID.x(2.5), GRID.y(1), [
    attr('#', 'operand', 'double'),
    attr('-', 'previous', 'double'),
  ], [
    method('+', 'execute', 'current: double', 'double'),
    method('+', 'undo', '', 'double'),
    method('+', 'describe', '', 'String'),
    method('#', 'compute', 'current: double', 'double', { isAbstract: true }),
  ]),
  cls('add', 'AddCommand', GRID.x(1), GRID.y(2), [], [
    method('#', 'compute', 'current: double', 'double'),
  ]),
  cls('sub', 'SubtractCommand', GRID.x(2), GRID.y(2), [], [
    method('#', 'compute', 'current: double', 'double'),
  ]),
  cls('mul', 'MultiplyCommand', GRID.x(3), GRID.y(2), [], [
    method('#', 'compute', 'current: double', 'double'),
  ]),
  cls('div', 'DivideCommand', GRID.x(4), GRID.y(2), [], [
    method('#', 'compute', 'current: double', 'double'),
  ]),
]

const edges = [
  edge('e1', 'calc', 'hist', 'composition', 'bottom', 'top', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e2', 'calc', 'cmd', 'dependency', 'right', 'top', { label: 'creates & runs' }),
  edge('e3', 'hist', 'cmd', 'aggregation', 'right', 'left', { targetMultiplicity: '0..*', label: 'two stacks' }),
  edge('e4', 'add', 'cmd', 'inheritance', 'top', 'bottom@20'),
  edge('e5', 'sub', 'cmd', 'inheritance', 'top', 'bottom@40'),
  edge('e6', 'mul', 'cmd', 'inheritance', 'top', 'bottom@60'),
  edge('e7', 'div', 'cmd', 'inheritance', 'top', 'bottom@80'),
]

const py = `"""Basic Calculator with Undo/Redo — medium-level LLD interview reference (Python)."""
from __future__ import annotations
import math
from abc import ABC, abstractmethod
from typing import List, Optional


class Command(ABC):
    """One reversible operation. Remembers the value it replaced so undo is exact."""
    symbol = "?"

    def __init__(self, operand: float):
        if not math.isfinite(operand):
            raise ValueError("operand must be a finite number")
        self.operand = operand
        self._previous = 0.0

    def execute(self, current: float) -> float:
        result = self._compute(current)
        if not math.isfinite(result):
            raise OverflowError("result is out of range")
        self._previous = current  # only remembered once the operation is known to be valid
        return result

    def undo(self) -> float:
        return self._previous

    def describe(self) -> str:
        return "%s %g" % (self.symbol, self.operand)

    @abstractmethod
    def _compute(self, current: float) -> float:
        ...


class AddCommand(Command):
    symbol = "+"

    def _compute(self, current: float) -> float:
        return current + self.operand


class SubtractCommand(Command):
    symbol = "-"

    def _compute(self, current: float) -> float:
        return current - self.operand


class MultiplyCommand(Command):
    symbol = "*"

    def _compute(self, current: float) -> float:
        return current * self.operand


class DivideCommand(Command):
    symbol = "/"

    def __init__(self, operand: float):
        if operand == 0:
            raise ZeroDivisionError("Cannot divide by zero")  # rejected before it can reach the history
        super().__init__(operand)

    def _compute(self, current: float) -> float:
        return current / self.operand


class CommandHistory:
    def __init__(self, max_size: int = 100):
        self._undo: List[Command] = []
        self._redo: List[Command] = []
        self._max = max_size

    def push(self, command: Command) -> None:
        self._undo.append(command)
        self._redo.clear()  # a new action invalidates the redo branch
        if len(self._undo) > self._max:
            self._undo.pop(0)  # drop the oldest step

    def take_for_undo(self) -> Optional[Command]:
        if not self._undo:
            return None
        command = self._undo.pop()
        self._redo.append(command)
        return command

    def take_for_redo(self) -> Optional[Command]:
        if not self._redo:
            return None
        command = self._redo.pop()
        self._undo.append(command)
        return command

    def clear(self) -> None:
        self._undo.clear()
        self._redo.clear()

    def descriptions(self) -> List[str]:
        return [c.describe() for c in self._undo]


class Calculator:
    """Pocket-calculator semantics: operations apply to the running result, left to right."""

    def __init__(self, initial: float = 0.0, max_history: int = 100):
        self._result = initial
        self._history = CommandHistory(max_history)

    @property
    def result(self) -> float:
        return self._result

    def add(self, x: float) -> "Calculator":
        return self._run(AddCommand(x))

    def subtract(self, x: float) -> "Calculator":
        return self._run(SubtractCommand(x))

    def multiply(self, x: float) -> "Calculator":
        return self._run(MultiplyCommand(x))

    def divide(self, x: float) -> "Calculator":
        return self._run(DivideCommand(x))

    def undo(self) -> bool:
        command = self._history.take_for_undo()
        if command is None:
            return False
        self._result = command.undo()
        return True

    def redo(self) -> bool:
        command = self._history.take_for_redo()
        if command is None:
            return False
        self._result = command.execute(self._result)
        return True

    def clear(self) -> None:
        self._result = 0.0
        self._history.clear()

    def history(self) -> List[str]:
        return self._history.descriptions()

    def _run(self, command: Command) -> "Calculator":
        self._result = command.execute(self._result)  # may raise; nothing is recorded then
        self._history.push(command)
        return self


if __name__ == "__main__":
    calc = Calculator(5)
    calc.add(3).multiply(2)  # (5 + 3) * 2, left to right
    print("5 + 3 * 2 =", calc.result)           # 16
    calc.undo()
    print("undo ->", calc.result)               # 8
    calc.undo()
    print("undo ->", calc.result)               # 5
    calc.redo()
    print("redo ->", calc.result)               # 8
    calc.divide(4)
    print("/ 4 ->", calc.result)                # 2
    try:
        calc.divide(0)
    except ZeroDivisionError as exc:
        print("error:", exc, "| result still", calc.result)
    calc.add(10)
    print("redo after new op:", calc.redo())    # False
    print("history:", calc.history())
    calc.clear()
    print("cleared ->", calc.result)
`

const java = `// Basic Calculator with Undo/Redo — medium-level LLD interview reference (Java 17+)
import java.util.*;

abstract class Command {
  protected final double operand;
  private double previous;

  protected Command(double operand) {
    if (!Double.isFinite(operand)) {
      throw new IllegalArgumentException("operand must be a finite number");
    }
    this.operand = operand;
  }

  double execute(double current) {
    double result = compute(current);
    if (!Double.isFinite(result)) {
      throw new ArithmeticException("result is out of range");
    }
    previous = current; // only remembered once the operation is known to be valid
    return result;
  }

  double undo() {
    return previous;
  }

  String describe() {
    String num = operand == Math.rint(operand) ? String.valueOf((long) operand) : String.valueOf(operand);
    return symbol() + " " + num;
  }

  protected abstract double compute(double current);
  protected abstract String symbol();
}

class AddCommand extends Command {
  AddCommand(double x) {
    super(x);
  }

  protected double compute(double c) {
    return c + operand;
  }

  protected String symbol() {
    return "+";
  }
}

class SubtractCommand extends Command {
  SubtractCommand(double x) {
    super(x);
  }

  protected double compute(double c) {
    return c - operand;
  }

  protected String symbol() {
    return "-";
  }
}

class MultiplyCommand extends Command {
  MultiplyCommand(double x) {
    super(x);
  }

  protected double compute(double c) {
    return c * operand;
  }

  protected String symbol() {
    return "*";
  }
}

class DivideCommand extends Command {
  DivideCommand(double x) {
    super(x);
    if (x == 0) {
      throw new ArithmeticException("Cannot divide by zero"); // rejected before it reaches the history
    }
  }

  protected double compute(double c) {
    return c / operand;
  }

  protected String symbol() {
    return "/";
  }
}

class CommandHistory {
  private final Deque<Command> undo = new ArrayDeque<>();
  private final Deque<Command> redo = new ArrayDeque<>();
  private final int max;

  CommandHistory(int max) {
    this.max = max;
  }

  void push(Command c) {
    undo.addLast(c);
    redo.clear(); // a new action invalidates the redo branch
    if (undo.size() {
      > max) undo.removeFirst(); // drop the oldest step
    }
  }

  Command takeForUndo() {
    Command c = undo.pollLast();
    if (c != null) {
      redo.addLast(c);
    }
    return c;
  }

  Command takeForRedo() {
    Command c = redo.pollLast();
    if (c != null) {
      undo.addLast(c);
    }
    return c;
  }

  void clear() {
    undo.clear(); redo.clear();
  }

  List<String> descriptions() {
    List<String> out = new ArrayList<>();
    for (Command c : undo) {
      out.add(c.describe());
    }
    return out;
  }
}

/** Pocket-calculator semantics: operations apply to the running result, left to right. */

class Calculator {
  private double result;
  private final CommandHistory history;

  Calculator(double initial, int maxHistory) {
    this.result = initial;
    this.history = new CommandHistory(maxHistory);
  }

  double result() {
    return result;
  }

  Calculator add(double x) {
    return run(new AddCommand(x));
  }

  Calculator subtract(double x) {
    return run(new SubtractCommand(x));
  }

  Calculator multiply(double x) {
    return run(new MultiplyCommand(x));
  }

  Calculator divide(double x) {
    return run(new DivideCommand(x));
  }

  boolean undo() {
    Command c = history.takeForUndo();
    if (c == null) {
      return false;
    }
    result = c.undo();
    return true;
  }

  boolean redo() {
    Command c = history.takeForRedo();
    if (c == null) {
      return false;
    }
    result = c.execute(result);
    return true;
  }

  void clear() {
    result = 0; history.clear();
  }

  List<String> history() {
    return history.descriptions();
  }

  private Calculator run(Command c) {
    result = c.execute(result); // may throw; nothing is recorded then
    history.push(c);
    return this;
  }
}

public class Main {
  public static void main(String[] args) {
    Calculator calc = new Calculator(5, 100);
    calc.add(3).multiply(2); // (5 + 3) * 2, left to right
    System.out.println("5 + 3 * 2 = " + calc.result());          // 16.0
    calc.undo();
    System.out.println("undo -> " + calc.result());              // 8.0
    calc.undo();
    System.out.println("undo -> " + calc.result());              // 5.0
    calc.redo();
    System.out.println("redo -> " + calc.result());              // 8.0
    calc.divide(4);
    System.out.println("/ 4 -> " + calc.result());               // 2.0
    try {
      calc.divide(0);
    } catch (ArithmeticException e) {
      System.out.println("error: " + e.getMessage() + " | result still " + calc.result());
    }
    calc.add(10);
    System.out.println("redo after new op: " + calc.redo());     // false
    System.out.println("history: " + calc.history());
    calc.clear();
    System.out.println("cleared -> " + calc.result());
  }
}
`

const ts = `// Basic Calculator with Undo/Redo — medium-level LLD interview reference (TypeScript)

abstract class Command {
  protected previous = 0

  constructor(protected readonly operand: number, private readonly symbol: string) {
    if (!Number.isFinite(operand)) {
      throw new Error('operand must be a finite number')
    }
  }

  execute(current: number): number {
    const result = this.compute(current)
    if (!Number.isFinite(result)) {
      throw new Error('result is out of range')
    }
    this.previous = current // only remembered once the operation is known to be valid
    return result
  }

  undo(): number { return this.previous }

  describe(): string { return this.symbol + ' ' + this.operand }

  protected abstract compute(current: number): number
}

class AddCommand extends Command {
  constructor(x: number) {
    super(x, '+')
  }

  protected compute(c: number) {
    return c + this.operand
  }
}

class SubtractCommand extends Command {
  constructor(x: number) {
    super(x, '-')
  }

  protected compute(c: number) {
    return c - this.operand
  }
}

class MultiplyCommand extends Command {
  constructor(x: number) {
    super(x, '*')
  }

  protected compute(c: number) {
    return c * this.operand
  }
}

class DivideCommand extends Command {
  constructor(x: number) {
    if (x === 0) {
      throw new Error('Cannot divide by zero') // rejected before it reaches the history
    }

    super(x, '/')
  }

  protected compute(c: number) {
    return c / this.operand
  }
}

class CommandHistory {
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  constructor(private maxSize = 100) {}

  push(c: Command): void {
    this.undoStack.push(c)
    this.redoStack = [] // a new action invalidates the redo branch
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift() // drop the oldest step
    }
  }

  takeForUndo(): Command | undefined {
    const c = this.undoStack.pop()
    if (c) {
      this.redoStack.push(c)
    }
    return c
  }

  takeForRedo(): Command | undefined {
    const c = this.redoStack.pop()
    if (c) {
      this.undoStack.push(c)
    }
    return c
  }

  clear(): void { this.undoStack = []; this.redoStack = [] }
  descriptions(): string[] { return this.undoStack.map(c => c.describe()) }
}

// Pocket-calculator semantics: operations apply to the running result, left to right.

class Calculator {
  private _result: number
  private history: CommandHistory

  constructor(initial = 0, maxHistory = 100) {
    this._result = initial
    this.history = new CommandHistory(maxHistory)
  }

  get result(): number { return this._result }
  add(x: number) {
    return this.run(new AddCommand(x))
  }

  subtract(x: number) {
    return this.run(new SubtractCommand(x))
  }

  multiply(x: number) {
    return this.run(new MultiplyCommand(x))
  }

  divide(x: number) {
    return this.run(new DivideCommand(x))
  }

  undo(): boolean {
    const c = this.history.takeForUndo()
    if (!c) {
      return false
    }
    this._result = c.undo()
    return true
  }

  redo(): boolean {
    const c = this.history.takeForRedo()
    if (!c) {
      return false
    }
    this._result = c.execute(this._result)
    return true
  }

  clear(): void { this._result = 0; this.history.clear() }
  historyList(): string[] { return this.history.descriptions() }

  private run(c: Command): this {
    this._result = c.execute(this._result) // may throw; nothing is recorded then
    this.history.push(c)
    return this
  }
}

// Demo
const calc = new Calculator(5)
calc.add(3).multiply(2) // (5 + 3) * 2, left to right
console.log('5 + 3 * 2 =', calc.result)       // 16
calc.undo()
console.log('undo ->', calc.result)           // 8
calc.undo()
console.log('undo ->', calc.result)           // 5
calc.redo()
console.log('redo ->', calc.result)           // 8
calc.divide(4)
console.log('/ 4 ->', calc.result)            // 2
try {
  calc.divide(0)
} catch (e) {
  console.log('error:', (e as Error).message, '| result still', calc.result)
}
calc.add(10)
console.log('redo after new op:', calc.redo()) // false
console.log('history:', calc.historyList())
calc.clear()
console.log('cleared ->', calc.result)

export { Calculator, Command, CommandHistory }
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

// Basic Calculator with Undo/Redo — medium-level LLD interview reference (C++17)

class Command {
protected:
  double operand_;
  double previous_ = 0.0;
  virtual double compute(double current) const = 0;
  virtual string symbol() const = 0;
public:
  explicit Command(double operand) : operand_(operand) {
    if (!isfinite(operand)) {
      throw invalid_argument("operand must be a finite number");
    }
  }

  virtual ~Command() = default;

  double execute(double current) {
    double result = compute(current);
    if (!isfinite(result)) {
      throw overflow_error("result is out of range");
    }
    previous_ = current;  // only remembered once the operation is known to be valid
    return result;
  }

  double undo() const {
    return previous_;
  }

  string describe() const {
    ostringstream out;
    out << symbol() << " " << operand_;
    return out.str();
  }
};

class AddCommand : public Command {
public:
  explicit AddCommand(double x) : Command(x) {}
protected:
  double compute(double c) const override {
    return c + operand_;
  }

  string symbol() const override {
    return "+";
  }
};

class SubtractCommand : public Command {
public:
  explicit SubtractCommand(double x) : Command(x) {}
protected:
  double compute(double c) const override {
    return c - operand_;
  }

  string symbol() const override {
    return "-";
  }
};

class MultiplyCommand : public Command {
public:
  explicit MultiplyCommand(double x) : Command(x) {}
protected:
  double compute(double c) const override {
    return c * operand_;
  }

  string symbol() const override {
    return "*";
  }
};

class DivideCommand : public Command {
public:
  explicit DivideCommand(double x) : Command(x) {
    if (x == 0) {
      throw domain_error("Cannot divide by zero");  // rejected before it reaches the history
    }
  }
protected:
  double compute(double c) const override {
    return c / operand_;
  }

  string symbol() const override {
    return "/";
  }
};

class CommandHistory {
  vector<unique_ptr<Command>> undo_, redo_;
  size_t max_;
public:
  explicit CommandHistory(size_t max) : max_(max) {}

  void push(unique_ptr<Command> c) {
    undo_.push_back(move(c));
    redo_.clear();  // a new action invalidates the redo branch
    if (undo_.size() {
      > max_) undo_.erase(undo_.begin());  // drop the oldest step
    }
  }

  Command* takeForUndo() {
    if (undo_.empty()) {
      return nullptr;
    }
    redo_.push_back(move(undo_.back()));
    undo_.pop_back();
    return redo_.back().get();
  }

  Command* takeForRedo() {
    if (redo_.empty()) {
      return nullptr;
    }
    undo_.push_back(move(redo_.back()));
    redo_.pop_back();
    return undo_.back().get();
  }

  void clear() {
    undo_.clear(); redo_.clear();
  }

  vector<string> descriptions() const {
    vector<string> out;
    for (auto& c : undo_) {
      out.push_back(c->describe());
    }
    return out;
  }
};

// Pocket-calculator semantics: operations apply to the running result, left to right.

class Calculator {
  double result_;
  CommandHistory history_;

  Calculator& run(unique_ptr<Command> c) {
    result_ = c->execute(result_);  // may throw; nothing is recorded then
    history_.push(move(c));
    return *this;
  }
public:
  explicit Calculator(double initial = 0.0, size_t maxHistory = 100)
      : result_(initial), history_(maxHistory) {}

  double result() const {
    return result_;
  }

  Calculator& add(double x) {
    return run(make_unique<AddCommand>(x));
  }

  Calculator& subtract(double x) {
    return run(make_unique<SubtractCommand>(x));
  }

  Calculator& multiply(double x) {
    return run(make_unique<MultiplyCommand>(x));
  }

  Calculator& divide(double x) {
    return run(make_unique<DivideCommand>(x));
  }

  bool undo() {
    Command* c = history_.takeForUndo();
    if (!c) {
      return false;
    }
    result_ = c->undo();
    return true;
  }

  bool redo() {
    Command* c = history_.takeForRedo();
    if (!c) {
      return false;
    }
    result_ = c->execute(result_);
    return true;
  }

  void clear() {
    result_ = 0.0; history_.clear();
  }

  vector<string> history() const {
    return history_.descriptions();
  }
};

int main() {
  Calculator calc(5);
  calc.add(3).multiply(2);  // (5 + 3) * 2, left to right
  cout << "5 + 3 * 2 = " << calc.result() << endl;  // 16
  calc.undo();
  cout << "undo -> " << calc.result() << endl;      // 8
  calc.undo();
  cout << "undo -> " << calc.result() << endl;      // 5
  calc.redo();
  cout << "redo -> " << calc.result() << endl;      // 8
  calc.divide(4);
  cout << "/ 4 -> " << calc.result() << endl;       // 2
  try {
    calc.divide(0);
  } catch (const exception& e) {
    cout << "error: " << e.what() << " | result still " << calc.result() << endl;
  }
  calc.add(10);
  cout << "redo after new op: " << (calc.redo() ? "true" : "false") << endl;
  cout << "history:";
  for (auto& h : calc.history()) {
    cout << " [" << h << "]";
  }
  cout << endl;
  calc.clear();
  cout << "cleared -> " << calc.result() << endl;
}
`

const goCode = `// Basic Calculator with Undo/Redo — medium-level LLD interview reference (Go)
package main

import (
  "errors"
  "fmt"
  "math"
)

// Command is one reversible operation. It remembers the value it replaced so undo is exact.

type Command interface {
  Execute(current float64) (float64, error)
  Undo() float64
  Describe() string
}

type base struct {
  symbol   string
  operand  float64
  previous float64
}

func (b *base) Undo() float64 {
  return b.previous
}

func (b *base) Describe() string {
  return fmt.Sprintf("%s %g", b.symbol, b.operand)
}

// commit records the previous value only once the result is known to be valid.
func (b *base) commit(current, result float64) (float64, error) {
  if math.IsInf(result, 0) || math.IsNaN(result) {
    return current, errors.New("result is out of range")
  }
  b.previous = current
  return result, nil
}

func validate(x float64) error {
  if math.IsInf(x, 0) || math.IsNaN(x) {
    return errors.New("operand must be a finite number")
  }
  return nil
}

type addCommand struct{ base }

func (c *addCommand) Execute(cur float64) (float64, error) {
  return c.commit(cur, cur+c.operand)
}

type subtractCommand struct{ base }

func (c *subtractCommand) Execute(cur float64) (float64, error) {
  return c.commit(cur, cur-c.operand)
}

type multiplyCommand struct{ base }

func (c *multiplyCommand) Execute(cur float64) (float64, error) {
  return c.commit(cur, cur*c.operand)
}

type divideCommand struct{ base }

func (c *divideCommand) Execute(cur float64) (float64, error) {
  return c.commit(cur, cur/c.operand)
}

func NewAdd(x float64) (Command, error) {
  if err := validate(x); err != nil {
    return nil, err
  }
  return &addCommand{base{symbol: "+", operand: x}}, nil
}

func NewSubtract(x float64) (Command, error) {
  if err := validate(x); err != nil {
    return nil, err
  }
  return &subtractCommand{base{symbol: "-", operand: x}}, nil
}

func NewMultiply(x float64) (Command, error) {
  if err := validate(x); err != nil {
    return nil, err
  }
  return &multiplyCommand{base{symbol: "*", operand: x}}, nil
}

func NewDivide(x float64) (Command, error) {
  if err := validate(x); err != nil {
    return nil, err
  }
  if x == 0 {
    return nil, errors.New("cannot divide by zero") // rejected before it reaches the history
  }
  return &divideCommand{base{symbol: "/", operand: x}}, nil
}

type CommandHistory struct {
  undo []Command
  redo []Command
  max  int
}

func NewCommandHistory(max int) *CommandHistory { return &CommandHistory{max: max} }

func (h *CommandHistory) Push(c Command) {
  h.undo = append(h.undo, c)
  h.redo = nil // a new action invalidates the redo branch
  if len(h.undo) > h.max {
    h.undo = h.undo[1:] // drop the oldest step
  }
}

func (h *CommandHistory) TakeForUndo() Command {
  if len(h.undo) == 0 {
    return nil
  }
  c := h.undo[len(h.undo)-1]
  h.undo = h.undo[:len(h.undo)-1]
  h.redo = append(h.redo, c)
  return c
}

func (h *CommandHistory) TakeForRedo() Command {
  if len(h.redo) == 0 {
    return nil
  }
  c := h.redo[len(h.redo)-1]
  h.redo = h.redo[:len(h.redo)-1]
  h.undo = append(h.undo, c)
  return c
}

func (h *CommandHistory) Clear() {
  h.undo, h.redo = nil, nil
}

func (h *CommandHistory) Descriptions() []string {
  out := make([]string, 0, len(h.undo))
  for _, c := range h.undo {
    out = append(out, c.Describe())
  }
  return out
}

// Calculator uses pocket-calculator semantics: operations apply to the running result, left to right.

type Calculator struct {
  result  float64
  history *CommandHistory
}

func NewCalculator(initial float64, maxHistory int) *Calculator {
  return &Calculator{result: initial, history: NewCommandHistory(maxHistory)}
}

func (c *Calculator) Result() float64 {
  return c.result
}

func (c *Calculator) run(cmd Command, err error) error {
  if err != nil {
    return err // invalid commands are never executed or recorded
  }
  next, err := cmd.Execute(c.result)
  if err != nil {
    return err
  }
  c.result = next
  c.history.Push(cmd)
  return nil
}

func (c *Calculator) Add(x float64) error {
  return c.run(NewAdd(x))
}

func (c *Calculator) Subtract(x float64) error {
  return c.run(NewSubtract(x))
}

func (c *Calculator) Multiply(x float64) error {
  return c.run(NewMultiply(x))
}

func (c *Calculator) Divide(x float64) error {
  return c.run(NewDivide(x))
}

func (c *Calculator) Undo() bool {
  cmd := c.history.TakeForUndo()
  if cmd == nil {
    return false
  }
  c.result = cmd.Undo()
  return true
}

func (c *Calculator) Redo() bool {
  cmd := c.history.TakeForRedo()
  if cmd == nil {
    return false
  }
  next, err := cmd.Execute(c.result)
  if err != nil {
    return false
  }
  c.result = next
  return true
}

func (c *Calculator) Clear() {
  c.result = 0; c.history.Clear()
}

func (c *Calculator) History() []string {
  return c.history.Descriptions()
}

func main() {
  calc := NewCalculator(5, 100)
  calc.Add(3)
  calc.Multiply(2) // (5 + 3) * 2, left to right
  fmt.Println("5 + 3 * 2 =", calc.Result()) // 16
  calc.Undo()
  fmt.Println("undo ->", calc.Result()) // 8
  calc.Undo()
  fmt.Println("undo ->", calc.Result()) // 5
  calc.Redo()
  fmt.Println("redo ->", calc.Result()) // 8
  calc.Divide(4)
  fmt.Println("/ 4 ->", calc.Result()) // 2
  if err := calc.Divide(0); err != nil {
    fmt.Println("error:", err, "| result still", calc.Result())
  }
  calc.Add(10)
  fmt.Println("redo after new op:", calc.Redo()) // false
  fmt.Println("history:", calc.History())
  calc.Clear()
  fmt.Println("cleared ->", calc.Result())
}
`

const csharp = `// Basic Calculator with Undo/Redo — medium-level LLD interview reference (C# 10+)
using System;
using System.Collections.Generic;
using System.Linq;

public abstract class Command {
  protected double Operand { get; }
  private double _previous;
  private readonly string _symbol;

  protected Command(double operand, string symbol) {
    if (!double.IsFinite(operand)) {
      throw new ArgumentException("operand must be a finite number");
    }
    Operand = operand;
    _symbol = symbol;
  }

  public double Execute(double current) {
    double result = Compute(current);
    if (!double.IsFinite(result)) {
      throw new OverflowException("result is out of range");
    }
    _previous = current; // only remembered once the operation is known to be valid
    return result;
  }

  public double Undo() {
    return _previous;
  }

  public string Describe() {
    return _symbol + " " + Operand;
  }

  protected abstract double Compute(double current);
}

public sealed class AddCommand : Command {
  public AddCommand(double x) : base(x, "+") {}
  protected override double Compute(double c) {
    return c + Operand;
  }
}

public sealed class SubtractCommand : Command {
  public SubtractCommand(double x) : base(x, "-") {}
  protected override double Compute(double c) {
    return c - Operand;
  }
}

public sealed class MultiplyCommand : Command {
  public MultiplyCommand(double x) : base(x, "*") {}
  protected override double Compute(double c) {
    return c * Operand;
  }
}

public sealed class DivideCommand : Command {
  public DivideCommand(double x) : base(x, "/") {
    if (x == 0) {
      throw new DivideByZeroException("Cannot divide by zero"); // rejected before it reaches the history
    }
  }

  protected override double Compute(double c) {
    return c / Operand;
  }
}

public sealed class CommandHistory {
  private readonly List<Command> _undo = new();
  private readonly List<Command> _redo = new();
  private readonly int _max;

  public CommandHistory(int max) {
    _max = max;
  }

  public void Push(Command c) {
    _undo.Add(c);
    _redo.Clear(); // a new action invalidates the redo branch
    if (_undo.Count > _max) {
      _undo.RemoveAt(0); // drop the oldest step
    }
  }

  public Command? TakeForUndo() {
    if (_undo.Count == 0) {
      return null;
    }
    var c = _undo[^1];
    _undo.RemoveAt(_undo.Count - 1);
    _redo.Add(c);
    return c;
  }

  public Command? TakeForRedo() {
    if (_redo.Count == 0) {
      return null;
    }
    var c = _redo[^1];
    _redo.RemoveAt(_redo.Count - 1);
    _undo.Add(c);
    return c;
  }

  public void Clear() {
    _undo.Clear(); _redo.Clear();
  }

  public List<string> Descriptions() {
    return _undo.Select(c => c.Describe()).ToList();
  }
}

// Pocket-calculator semantics: operations apply to the running result, left to right.
public sealed class Calculator {
  private readonly CommandHistory _history;
  public double Result { get; private set; }

  public Calculator(double initial = 0, int maxHistory = 100) {
    Result = initial;
    _history = new CommandHistory(maxHistory);
  }

  public Calculator Add(double x) {
    return Run(new AddCommand(x));
  }

  public Calculator Subtract(double x) {
    return Run(new SubtractCommand(x));
  }

  public Calculator Multiply(double x) {
    return Run(new MultiplyCommand(x));
  }

  public Calculator Divide(double x) {
    return Run(new DivideCommand(x));
  }

  public bool Undo() {
    var c = _history.TakeForUndo();
    if (c is null) {
      return false;
    }
    Result = c.Undo();
    return true;
  }

  public bool Redo() {
    var c = _history.TakeForRedo();
    if (c is null) {
      return false;
    }
    Result = c.Execute(Result);
    return true;
  }

  public void Clear() {
    Result = 0; _history.Clear();
  }

  public List<string> History() {
    return _history.Descriptions();
  }

  private Calculator Run(Command c) {
    Result = c.Execute(Result); // may throw; nothing is recorded then
    _history.Push(c);
    return this;
  }
}

public static class Program {
  public static void Main() {
    var calc = new Calculator(5);
    calc.Add(3).Multiply(2); // (5 + 3) * 2, left to right
    Console.WriteLine("5 + 3 * 2 = " + calc.Result);          // 16
    calc.Undo();
    Console.WriteLine("undo -> " + calc.Result);              // 8
    calc.Undo();
    Console.WriteLine("undo -> " + calc.Result);              // 5
    calc.Redo();
    Console.WriteLine("redo -> " + calc.Result);              // 8
    calc.Divide(4);
    Console.WriteLine("/ 4 -> " + calc.Result);               // 2
    try {
      calc.Divide(0);
    } catch (DivideByZeroException e) {
      Console.WriteLine("error: " + e.Message + " | result still " + calc.Result);
    }
    calc.Add(10);
    Console.WriteLine("redo after new op: " + calc.Redo());   // False
    Console.WriteLine("history: [" + string.Join(", ", calc.History()) + "]");
    calc.Clear();
    Console.WriteLine("cleared -> " + calc.Result);
  }
}
`

export const basicCalculatorSolution: ProblemSolution = {
  slug: 'basic-calculator',
  title: 'Design a Basic Calculator with Undo/Redo — Complete LLD Guide',
  overview: {
    introduction: [
      'A calculator is the friendliest possible domain for one of the most useful behavioral patterns in object-oriented design: Command. The task sounds trivial — add, subtract, multiply, divide — until the interviewer asks for undo and redo. Suddenly you need to represent “an operation” as something you can store, reverse, and replay, which is exactly what a Command object is.',
      'This problem is a favorite for early-career and mid-level LLD rounds because the code is small enough to write completely in a whiteboard session, yet it exposes whether you really understand the pattern. Weak answers keep a list of raw numbers and call it “history” — that works for undo, but collapses the moment someone asks for redo, for a log that says what happened, or for a new kind of operation. Strong answers make each operation an object with execute and undo, and let a separate history object manage two stacks.',
      'In this tutorial we start by pinning down the one ambiguity in the prompt (what does 5 + 3 * 2 mean?), identify the nouns and verbs, introduce the Command pattern with a simple justification, separate the history bookkeeping from the arithmetic, and handle the failure cases that make the question interesting: divide by zero, overflow, and what happens to redo after a fresh operation.',
      'We stay within the practice brief: add, subtract, multiply, divide; a running result and history; undo and redo; clear; chained operations; O(1) undo and redo; at least 100 steps of history. Everything is a single in-memory object; parsing full expressions with operator precedence is discussed as an extension, not part of the core design.',
    ],
    constraints: [
      'Supported operations are add, subtract, multiply, and divide on a running result.',
      'Undo restores the exact previous result; redo reapplies an undone operation.',
      'Undo and redo are O(1) per call.',
      'History keeps at least 100 steps; older steps are dropped beyond the cap.',
      'Invalid operations (divide by zero, non-finite operand or result) are rejected and never recorded.',
      'Clear resets the calculator to zero.',
    ],
    assumptions: [
      'Chained operations use pocket-calculator semantics: each operation applies to the running result, left to right, so 5 + 3 * 2 evaluates to 16. Operator precedence would need an expression parser and is an extension.',
      'Numbers are double-precision floating point. Because undo restores the stored previous value rather than inverting the arithmetic, it is exact even when floating-point math is not.',
      'Clear is a full reset: it sets the result to zero and wipes undo and redo history.',
      'A new operation after an undo discards the redo branch, as in every text editor.',
      'Single-threaded use; wrap calls in a lock if the calculator is shared between threads.',
    ],
    clarificationQuestions: [
      {
        question: 'Should 5 + 3 * 2 follow operator precedence (11) or pocket-calculator order (16)?',
        why: 'This is the key ambiguity in the prompt. Running-result semantics are a small Command-pattern exercise; precedence requires tokenizing and parsing. Decide before you design.',
      },
      {
        question: 'Does clear erase the history, or can it itself be undone?',
        why: 'A clearable history is a different data structure from an undoable clear. Clarifying avoids redesigning the stacks halfway through.',
      },
      {
        question: 'What should redo do after a new operation following an undo?',
        why: 'The standard answer is that the redo branch is discarded. Confirming it shows you know the invariant that keeps the two stacks consistent.',
      },
      {
        question: 'What are the limits on history size and number precision?',
        why: 'A bounded history prevents unbounded memory growth. Number type affects how you talk about rounding and overflow.',
      },
      {
        question: 'How should invalid input — divide by zero, NaN, overflow — be handled?',
        why: 'The rule “invalid commands never enter the history” keeps undo and redo trustworthy.',
      },
      {
        question: 'Do we need to log the operations as text, for example to show a tape?',
        why: 'If yes, a describe method on Command becomes a first-class requirement rather than a debugging aid.',
      },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'The first two minutes: restate and list the verbs',
        paragraphs: [
          'Restate the problem: “A calculator holds a running result. Each operation changes it, and I can undo or redo operations in order.” The verbs are add, subtract, multiply, divide, undo, redo, clear. The first four are operations on the result; the last three are operations on the history. That split — operations versus history — is the skeleton of the design.',
          'Then raise the 5 + 3 * 2 question immediately. It shows you read the requirements carefully and gives you permission to choose the simpler semantics. Write the decision on the board: “running result, left to right.”',
        ],
        callout: {
          title: 'Interview tip',
          body: 'Name the pattern early and justify it with the requirement, not the other way round: “Undo and redo mean operations must be stored and reversible, so each operation becomes a Command with execute and undo.”',
        },
      },
      {
        heading: 'Why not just keep a list of previous values?',
        paragraphs: [
          'The tempting first design is a list of results: after every operation, append the new result; undo means moving back one index. It handles undo for four lines of code. It also loses all information about what was done: you cannot show a tape (“+ 3”, “* 2”), you cannot add a unary operation like square root without rethinking it, and redo needs a second index to remember where you came from.',
          'Command solves this by capturing the operation itself. A Command knows how to compute (execute), how to reverse (undo), and how to describe itself. The history then stores Commands, not numbers. Every future feature — a tape, a macro, a new operator — is a new Command or a method on an existing one.',
        ],
      },
      {
        heading: 'From requirements to nouns',
        paragraphs: [
          'Underline the nouns: calculator, operation, operand, result, history, undo stack, redo stack. Calculator owns the running result and exposes the user-facing verbs. Operation becomes the abstract Command class with one subclass per operator. History is its own small class with two stacks.',
          'Resist creating a Number or Result class; a double is enough. Also resist an Operator enum with a switch in Calculator — that is exactly the “god-method” the Command pattern exists to eliminate.',
        ],
        numbered: [
          'Define Command with execute(current), undo(), describe().',
          'Implement four subclasses; each overrides only compute.',
          'Write CommandHistory with an undo stack, a redo stack, and a maximum size.',
          'Write Calculator as the façade that creates commands and moves them between stacks.',
          'Add validation so bad commands never reach the history.',
        ],
      },
      {
        heading: 'Why undo stores the previous value',
        paragraphs: [
          'There are two ways to reverse an operation: invert the math (subtract what you added) or restore a saved value. Inverting looks elegant but fails in two places. Multiplying by zero destroys information, so it has no inverse. And in floating point, adding then subtracting a number does not always return exactly the original.',
          'Saving the previous value is always correct and O(1). The Command captures it during execute: previous = current. Undo simply hands that value back. The same Command can be redone because execute can be called again on the restored result.',
        ],
        callout: {
          title: 'Subtle point',
          body: 'Record the previous value only after the operation succeeds. If compute overflows and you saved first, a failed command could leave stale state behind.',
        },
      },
      {
        heading: 'Two stacks and one invariant',
        paragraphs: [
          'CommandHistory holds an undo stack and a redo stack. Executing a new command pushes onto undo and clears redo. Undo pops from undo, pushes that command onto redo, and returns it. Redo does the reverse. All four are O(1) stack operations.',
          'The invariant is that redo is only valid immediately after one or more undos. Any new operation breaks that chain, so redo is cleared. This is the same rule you see in every text editor, and stating it explicitly is one of the clearest signals that you understand the data structure rather than memorized it.',
          'For the 100-step requirement, cap the undo stack and discard the oldest entry when it overflows. We use a plain list and remove the first element; with a ring buffer this becomes strictly O(1), a detail worth mentioning if asked.',
        ],
      },
      {
        heading: 'Validation: keep bad commands out of history',
        paragraphs: [
          'Divide by zero is the headline failure. Rather than checking inside Calculator, we reject it in the DivideCommand constructor, so a zero divisor cannot even become a command object. The calculator’s run method therefore never sees it, never executes it, and never pushes it. A second guard in execute rejects results that are not finite (overflow, NaN), and only commits the previous value after that guard passes.',
          'The rule “anything in the history was valid and executed” is what makes undo and redo trustworthy. Without it you would need defensive checks on every undo.',
        ],
      },
      {
        heading: 'Step-by-step path to the final diagram',
        paragraphs: [
          'Draw Calculator at the top-left with a composition arrow down to CommandHistory. Draw the abstract Command at the right of the history, with an aggregation arrow from the history labeled “two stacks” and a dependency arrow from Calculator (“creates and runs”). Below Command draw the four subclasses with inheritance arrows. Walk through add, undo, redo, and a failing divide.',
        ],
        numbered: [
          'Clarify precedence, clear semantics, and history limits.',
          'Define Command and implement AddCommand to prove the shape.',
          'Add the other three commands.',
          'Implement CommandHistory and wire undo/redo in Calculator.',
          'Add validation and the history cap.',
          'Discuss expression parsing and macros only after the core works.',
        ],
      },
    ],
    entities: [
      { name: 'Calculator', responsibility: 'Façade over the running result; creates commands, runs them, and moves them between stacks.', keyMembers: ['add', 'undo', 'redo', 'clear'] },
      { name: 'Command', responsibility: 'Abstract reversible operation: execute, undo, describe.', keyMembers: ['execute', 'undo', 'describe'] },
      { name: 'AddCommand / SubtractCommand / MultiplyCommand / DivideCommand', responsibility: 'Concrete arithmetic; each overrides compute only.', keyMembers: ['compute'] },
      { name: 'CommandHistory', responsibility: 'Undo and redo stacks with a size cap.', keyMembers: ['push', 'takeForUndo', 'takeForRedo'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption:
    'Left column: Calculator composes CommandHistory. Right: the abstract Command and its four concrete operations. The history holds Commands in two stacks; Calculator creates and runs them. Spacing follows the 340×260 grid so the four inheritance arrows fan out cleanly.',
  designExplanation: {
    sections: [
      {
        heading: 'Architecture in one paragraph',
        paragraphs: [
          'Calculator is a thin façade: it holds the running result and a CommandHistory. When you call add(3), it builds an AddCommand, asks the command to execute against the current result, and, if that succeeds, stores the new result and pushes the command into history. Undo and redo are just transfers between the history’s two stacks followed by a call to the command’s undo or execute. All arithmetic lives in the commands; all bookkeeping lives in the history.',
        ],
      },
      {
        heading: 'Command: the template and the hook',
        paragraphs: [
          'The base class implements execute and undo once: execute calls the subclass hook compute, validates the result, remembers the previous value, and returns the new result. Subclasses only override compute (one line each). That is a small Template Method inside the Command pattern, and it guarantees every operation validates and records in exactly the same way.',
          'describe returns a short string such as “+ 3”. It costs nothing today and makes history inspection, a printed tape, and debugging trivial.',
        ],
      },
      {
        heading: 'CommandHistory: why a separate class',
        paragraphs: [
          'You could keep two lists inside Calculator, but that mixes two responsibilities and makes the push-clears-redo rule easy to forget in one code path. A dedicated CommandHistory owns the invariant: push always clears redo; takeForUndo and takeForRedo always move exactly one command between stacks. Calculator cannot violate the invariant because it cannot touch the stacks directly.',
        ],
      },
      {
        heading: 'Redo re-executes instead of storing results',
        paragraphs: [
          'When a command is undone, the calculator’s result becomes the command’s saved previous value. Redo calls execute on that same value, which recomputes the same answer and re-saves the same previous value. We never store the “after” result, so there is exactly one source of truth: the command and its operand.',
        ],
      },
      {
        heading: 'What we deliberately did not do',
        paragraphs: [
          'We did not parse expressions, support operator precedence, or add unary functions. We did not make Clear itself a command. We did not add macros or persistence. Each of these has a clean extension path — a parser that emits Commands, a ClearCommand that stores the previous value and history, a serializer that writes describe strings — and none of them requires changing the core.',
        ],
      },
    ],
    classResponsibilities: [
      { name: 'Calculator', responsibility: 'Public API and running result; never contains arithmetic or stack logic.', keyMembers: ['add', 'divide', 'undo', 'redo'] },
      { name: 'Command (abstract)', responsibility: 'Execute/undo/describe contract plus validation and previous-value capture.', keyMembers: ['execute', 'undo', 'compute'] },
      { name: 'Concrete commands', responsibility: 'One arithmetic rule each.', keyMembers: ['compute'] },
      { name: 'CommandHistory', responsibility: 'Undo/redo stacks and the push-clears-redo invariant.', keyMembers: ['push', 'takeForUndo', 'takeForRedo'] },
    ],
    patterns: [
      {
        name: 'Command',
        why: 'Undo and redo require operations to be stored, reversed, and replayed.',
        howApplied: 'Each arithmetic operation is a Command object with execute and undo; history stores Commands, not numbers.',
      },
      {
        name: 'Memento (lightweight)',
        why: 'Undo needs the exact prior state without relying on invertible math.',
        howApplied: 'Each Command captures the previous result during execute and returns it from undo.',
      },
      {
        name: 'Template Method',
        why: 'Every operation must validate and record the same way.',
        howApplied: 'Command.execute is fixed; subclasses implement only compute.',
      },
    ],
    decisions: [
      {
        decision: 'Running-result (left to right) semantics for chained operations.',
        rationale: 'Matches a pocket calculator and keeps the problem focused on the Command pattern.',
        alternativeRejected: 'An expression parser with precedence (shunting-yard) — a separate problem with its own design.',
        tradeoff: '5 + 3 * 2 gives 16, not 11; we state this explicitly.',
      },
      {
        decision: 'Undo restores a saved previous value.',
        rationale: 'Always exact, O(1), and works for non-invertible operations like multiply by zero.',
        alternativeRejected: 'Applying the inverse operation, which breaks for zero and floating-point rounding.',
        tradeoff: 'One extra double per command.',
      },
      {
        decision: 'Validate in constructors and in execute.',
        rationale: 'Invalid operations never exist in history, so undo and redo need no defensive checks.',
        alternativeRejected: 'Validating in Calculator, which duplicates logic and is easy to bypass.',
        tradeoff: 'Constructors can throw, which some teams dislike; a factory method is an alternative.',
      },
      {
        decision: 'Cap history and drop the oldest step.',
        rationale: 'Meets the 100-step requirement and bounds memory.',
        alternativeRejected: 'Unbounded history, which leaks memory in long sessions.',
        tradeoff: 'Removing from the front of a list is O(n); a ring buffer makes it O(1).',
      },
    ],
    solid: {
      paragraphs: [
        'Single Responsibility: commands compute, history manages stacks, the calculator coordinates.',
        'Open/Closed: a power or modulo operation is a new Command subclass and one calculator method; nothing existing changes.',
        'Liskov Substitution: any Command must honor execute/undo semantics — undo returns exactly what execute replaced — so the history can treat them uniformly.',
        'Interface Segregation: Command exposes three small methods; callers of Calculator never see commands.',
        'Dependency Inversion: CommandHistory and Calculator depend on the abstract Command, not on any specific arithmetic class.',
      ],
    },
    extensibility: [
      'Add operations (power, modulo, percent, square root): new Command subclasses.',
      'Add an expression parser that tokenizes input and emits Commands, using the shunting-yard algorithm for precedence.',
      'Add macro commands: a CompositeCommand holding a list of commands that executes and undoes as one step.',
      'Add persistence or a tape view using the describe strings.',
      'Make clear undoable by introducing a ClearCommand that stores the previous result.',
    ],
  },
  implementationIntro: [
    'Each implementation includes the abstract Command with four concrete operations, a CommandHistory with undo and redo stacks and a size cap, and a Calculator façade. The demo chains operations, undoes and redoes them, shows that a rejected divide by zero leaves the result unchanged, shows that a new operation clears redo, and prints the history.',
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
      'The calculator starts at 5. add(3) builds an AddCommand(3), which executes against 5, remembers previous = 5, and returns 8. The calculator stores 8 and pushes the command into history. multiply(2) does the same with MultiplyCommand: previous = 8, result 16. The undo stack now holds [+3, *2] and the redo stack is empty.',
      'undo pops *2, moves it to the redo stack, and sets the result to its saved previous value, 8. A second undo pops +3 and restores 5. redo pops +3 from the redo stack, re-executes it against 5, and returns to 8, pushing the command back onto the undo stack. divide(4) pushes a new command and clears the redo stack, so the result is 2 and *2 can no longer be redone.',
      'divide(0) throws in the DivideCommand constructor, so no command object is created, nothing is executed, and the history is untouched — the result is still 2. A later add(10) gives 12, and redo returns false because there is nothing to redo. clear resets the result to zero and empties both stacks.',
    ],
    steps: [
      'Calculator.add(x) constructs an AddCommand(x); constructors validate the operand.',
      'run(command): call command.execute(result); on success store the new result and push to history.',
      'Command.execute computes, validates the result is finite, saves the previous value, and returns the result.',
      'History.push appends to the undo stack, clears redo, and trims the oldest entry if over the cap.',
      'undo: move one command from undo to redo and set result = command.undo().',
      'redo: move one command from redo to undo and set result = command.execute(result).',
    ],
    examples: [
      {
        title: 'Chained operations',
        input: 'Calculator(5).add(3).multiply(2)',
        output: '16',
        explanation: 'Pocket-calculator semantics: (5 + 3) × 2. Precedence-aware evaluation would give 11 and needs an expression parser.',
      },
      {
        title: 'Undo, undo, redo',
        input: 'After 16: undo, undo, redo',
        output: '8, then 5, then 8',
        explanation: 'Each undo restores the previous value stored in the command; redo re-executes the command on the restored result.',
      },
      {
        title: 'Divide by zero rejected',
        input: 'divide(0) when the result is 2',
        output: 'Error; result stays 2; history unchanged',
        explanation: 'The DivideCommand constructor throws before a command exists, so nothing is executed or recorded.',
      },
      {
        title: 'New operation clears redo',
        input: 'undo, then add(10), then redo',
        output: 'redo returns false',
        explanation: 'History.push clears the redo stack, preserving the invariant that redo is only valid immediately after undos.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you support operator precedence, like 5 + 3 * 2 = 11?',
      answer: 'Add an ExpressionEvaluator that tokenizes the input, converts it to postfix with the shunting-yard algorithm (or parses with recursive descent), and evaluates it. If you still want undo, treat each completed evaluation as a single Command that stores the previous result, or have the parser emit Commands that run against a fresh accumulator. The Command and History classes do not change.',
    },
    {
      question: 'How would you make clear undoable?',
      answer: 'Create a ClearCommand whose execute stores the previous result and a snapshot of the history, then resets both; undo restores them. Alternatively keep clear as a hard reset (as we do) and add a separate “clear entry” that is a normal command. Which one is right depends on the clarification answer you got.',
    },
    {
      question: 'How would you add a macro — for example, a recorded sequence of operations?',
      answer: 'Use the Composite pattern on top of Command: a MacroCommand holds a list of Commands. execute runs them in order and records the first previous value; undo runs undo on the children in reverse order. The history sees a single command, so one undo reverses the whole macro.',
    },
    {
      question: 'Why store the previous value instead of applying the inverse operation?',
      answer: 'Some operations are not invertible: multiplying by zero loses the original value. Floating-point inverses also drift: adding 0.1 and then subtracting 0.1 does not always return exactly the starting value. Restoring a saved value is exact and O(1) for every operation.',
    },
    {
      question: 'Why is the history a separate class instead of two lists in Calculator?',
      answer: 'It centralizes the invariant that every new push clears the redo stack and that undo/redo move exactly one command between stacks. If that logic lived in Calculator, every new code path that executes a command would need to remember it. A dedicated class cannot forget.',
    },
    {
      question: 'How do you make undo O(1) with a bounded history?',
      answer: 'Use a fixed-size ring buffer or a doubly-ended queue for the undo stack: push to the back, pop from the back for undo, and drop from the front when over the cap. Our simple list trims the front with an O(n) removal; with a deque it is O(1). The redo stack is cleared on push, so it needs no cap.',
    },
    {
      question: 'How would you make it thread-safe?',
      answer: 'Guard every public method with a single lock (or make Calculator confined to one thread and communicate by message passing). The operations are tiny, so a coarse lock is fine. Do not lock inside Command; commands are used only while the calculator holds its lock.',
    },
    {
      question: 'How do you test this?',
      answer: 'Table tests for each operation, then sequence tests: execute N operations, undo all, and assert the result returns to the start; redo all and assert you return to the end. Add tests for divide by zero, overflow to infinity, redo cleared after a new operation, and the history cap (execute 101 operations and verify only 100 can be undone).',
    },
  ],
  extras: {
    edgeCases: {
      paragraphs: [
        'Undo and redo on empty stacks must be safe no-ops that return false. Floating-point results can overflow to infinity or become NaN (for example 0 divided by 0 is blocked, but huge multiplications overflow), and those must be rejected without recording history. Dividing by a very small non-zero number is legal.',
      ],
      bullets: [
        'Undo with no history returns false and leaves the result unchanged.',
        'Redo immediately after a fresh operation returns false.',
        'Operand NaN or infinity is rejected in the constructor.',
        'Multiplying by zero then undoing restores the original value.',
        'History cap: the 101st operation drops the oldest step, which can no longer be undone.',
      ],
    },
    commonMistakes: {
      paragraphs: [
        'Common mistakes: storing raw values instead of commands, inverting the math instead of saving the previous value, forgetting to clear redo on a new operation, recording a command before validating it, putting an operator switch statement in Calculator, and treating divide by zero as a Calculator check that other code paths can bypass. A subtler one is mutating the previous value before the compute step succeeds.',
      ],
    },
    complexity: [
      'execute, undo, redo, push: O(1) each (the history cap trim is O(n) with a list, O(1) with a deque or ring buffer).',
      'Memory: O(h) where h is the history cap (default 100), one small object per step.',
    ],
    testing: {
      paragraphs: [
        'The design is deterministic, so every behavior can be covered with simple unit tests. Prefer sequence tests that verify the stack invariants rather than only single operations.',
      ],
      numbered: [
        'Each operator produces the expected result.',
        'N operations followed by N undos return to the initial value; N redos return to the final value.',
        'A new operation after an undo makes redo return false.',
        'divide(0) throws and leaves result and history unchanged.',
        'Overflow to infinity is rejected and not recorded.',
        'Cap: after 101 operations only 100 undos succeed.',
      ],
    },
    extensions: [
      'Expression parser with operator precedence.',
      'Macro (composite) commands.',
      'Undoable clear and a printed tape.',
      'Scientific functions as additional Command subclasses.',
      'Arbitrary-precision decimal arithmetic.',
    ],
    takeaways: [
      'Undo and redo are the reason to use Command: operations become stored, reversible objects.',
      'Save the previous value instead of inverting the math.',
      'Use two stacks and enforce the invariant that a new operation clears redo.',
      'Keep invalid commands out of the history so undo and redo can trust it.',
      'State your chaining semantics (left to right versus precedence) before you design.',
    ],
  },
}
