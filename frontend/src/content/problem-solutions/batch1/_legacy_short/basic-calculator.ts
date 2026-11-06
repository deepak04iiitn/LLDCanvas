import type { ProblemSolution } from '../types'
import { abstractCls, attr, cls, edge, iface, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('calc', 'Calculator', 40, 40, [
    attr('-', 'accumulator', 'Accumulator'),
    attr('-', 'undoStack', 'Stack<Command>'),
    attr('-', 'redoStack', 'Stack<Command>'),
  ], [
    method('+', 'apply', 'op: string, operand: Number', 'Calculator'),
    method('+', 'add', 'x: Number', 'Calculator'),
    method('+', 'subtract', 'x: Number', 'Calculator'),
    method('+', 'multiply', 'x: Number', 'Calculator'),
    method('+', 'divide', 'x: Number', 'Calculator'),
    method('+', 'clear', '', 'Calculator'),
    method('+', 'undo', '', 'bool'),
    method('+', 'redo', '', 'bool'),
    method('+', 'result', '', 'Number'),
  ], 'invoker'),
  iface('cmd', 'Command', 520, 40, [
    method('+', 'execute', '', 'void'),
    method('+', 'undo', '', 'void'),
    method('+', 'describe', '', 'string'),
  ]),
  abstractCls('bin', 'BinaryCommand', 520, 230, [
    attr('#', 'accumulator', 'Accumulator'),
    attr('#', 'operand', 'Number'),
    attr('-', 'previous', 'Number'),
  ], [
    method('+', 'execute', '', 'void'),
    method('+', 'undo', '', 'void'),
    method('#', 'compute', 'a: Number, b: Number', 'Number', { isAbstract: true }),
  ]),
  cls('clr', 'ClearCommand', 900, 200, [
    attr('-', 'previous', 'Number'),
  ], [
    method('+', 'execute', '', 'void'),
    method('+', 'undo', '', 'void'),
  ]),
  cls('acc', 'Accumulator', 40, 470, [
    attr('+', 'value', 'Number'),
  ], [], 'receiver'),
  cls('fac', 'CommandFactory', 900, 420, [], [
    method('+', 'create', 'op, acc, operand', 'Command', { isStatic: true }),
  ]),
  cls('add', 'AddCommand', 300, 650, [], [method('#', 'compute', 'a, b', 'a + b')]),
  cls('sub', 'SubtractCommand', 560, 650, [], [method('#', 'compute', 'a, b', 'a - b')]),
  cls('mul', 'MultiplyCommand', 820, 650, [], [method('#', 'compute', 'a, b', 'a × b')]),
  cls('div', 'DivideCommand', 1080, 650, [], [method('#', 'compute', 'a, b', 'a ÷ b  (b ≠ 0)')]),
]

const edges = [
  edge('e1', 'calc', 'cmd', 'aggregation', 'right', 'left', { label: 'history', targetMultiplicity: '0..*' }),
  edge('e2', 'calc', 'acc', 'association', 'bottom', 'top', { label: 'owns', sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e3', 'bin', 'cmd', 'realization', 'top', 'bottom'),
  edge('e4', 'clr', 'cmd', 'realization', 'top', 'right'),
  edge('e5', 'add', 'bin', 'inheritance', 'top', 'bottom@15'),
  edge('e6', 'sub', 'bin', 'inheritance', 'top', 'bottom@40'),
  edge('e7', 'mul', 'bin', 'inheritance', 'top', 'bottom@65'),
  edge('e8', 'div', 'bin', 'inheritance', 'top', 'bottom@90'),
  edge('e9', 'bin', 'acc', 'association', 'left', 'right', { label: 'mutates' }),
  edge('e10', 'calc', 'fac', 'dependency', 'right@95', 'left', { label: 'creates via' }),
]

const py = `from __future__ import annotations
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Dict, List, Type, Union

Number = Union[int, float, str, Decimal]


def to_decimal(x: Number) -> Decimal:
    # str() first so 0.1 stays 0.1 instead of the binary float expansion
    return x if isinstance(x, Decimal) else Decimal(str(x))


class CalculatorError(Exception):
    pass


class Accumulator:
    """Receiver: the running result. Commands are the only thing that mutate it."""

    def __init__(self) -> None:
        self.value: Decimal = Decimal(0)


class Command(ABC):
    @abstractmethod
    def execute(self) -> None: ...

    @abstractmethod
    def undo(self) -> None: ...

    @abstractmethod
    def describe(self) -> str: ...


class BinaryCommand(Command):
    """Applies 'running <op> operand'. Undo restores the saved previous value,
    which is exact even for operations that are not invertible (x * 0)."""

    symbol = "?"

    def __init__(self, accumulator: Accumulator, operand: Decimal):
        self._acc = accumulator
        self._operand = operand
        self._previous: Decimal | None = None

    def execute(self) -> None:
        nxt = self.compute(self._acc.value, self._operand)  # may raise -> state untouched
        self._previous = self._acc.value
        self._acc.value = nxt

    def undo(self) -> None:
        assert self._previous is not None, "undo before execute"
        self._acc.value = self._previous

    def describe(self) -> str:
        return f"{self.symbol} {self._operand}"

    @abstractmethod
    def compute(self, a: Decimal, b: Decimal) -> Decimal: ...


class AddCommand(BinaryCommand):
    symbol = "+"

    def compute(self, a: Decimal, b: Decimal) -> Decimal:
        return a + b


class SubtractCommand(BinaryCommand):
    symbol = "-"

    def compute(self, a: Decimal, b: Decimal) -> Decimal:
        return a - b


class MultiplyCommand(BinaryCommand):
    symbol = "×"

    def compute(self, a: Decimal, b: Decimal) -> Decimal:
        return a * b


class DivideCommand(BinaryCommand):
    symbol = "÷"

    def compute(self, a: Decimal, b: Decimal) -> Decimal:
        if b == 0:
            raise CalculatorError("division by zero")
        return a / b


class ClearCommand(Command):
    """Clear is a command too, so it can be undone."""

    def __init__(self, accumulator: Accumulator):
        self._acc = accumulator
        self._previous = Decimal(0)

    def execute(self) -> None:
        self._previous = self._acc.value
        self._acc.value = Decimal(0)

    def undo(self) -> None:
        self._acc.value = self._previous

    def describe(self) -> str:
        return "clear"


class CommandFactory:
    _OPS: Dict[str, Type[BinaryCommand]] = {
        "+": AddCommand, "-": SubtractCommand,
        "*": MultiplyCommand, "×": MultiplyCommand,
        "/": DivideCommand, "÷": DivideCommand,
    }

    @staticmethod
    def create(op: str, accumulator: Accumulator, operand: Decimal) -> Command:
        cls = CommandFactory._OPS.get(op)
        if cls is None:
            raise CalculatorError(f"unknown operator {op!r}")
        return cls(accumulator, operand)


class Calculator:
    """Invoker: executes commands and owns the undo/redo stacks. Not thread-safe (one UI user)."""

    def __init__(self) -> None:
        self._acc = Accumulator()
        self._undo: List[Command] = []
        self._redo: List[Command] = []

    @property
    def result(self) -> Decimal:
        return self._acc.value

    def apply(self, op: str, operand: Number) -> "Calculator":
        return self._run(CommandFactory.create(op, self._acc, to_decimal(operand)))

    def add(self, x: Number) -> "Calculator":
        return self.apply("+", x)

    def subtract(self, x: Number) -> "Calculator":
        return self.apply("-", x)

    def multiply(self, x: Number) -> "Calculator":
        return self.apply("×", x)

    def divide(self, x: Number) -> "Calculator":
        return self.apply("÷", x)

    def clear(self) -> "Calculator":
        return self._run(ClearCommand(self._acc))

    def undo(self) -> bool:
        if not self._undo:
            return False
        cmd = self._undo.pop()
        cmd.undo()
        self._redo.append(cmd)
        return True

    def redo(self) -> bool:
        if not self._redo:
            return False
        cmd = self._redo.pop()
        cmd.execute()
        self._undo.append(cmd)
        return True

    def history(self) -> List[str]:
        return [c.describe() for c in self._undo]

    def _run(self, cmd: Command) -> "Calculator":
        cmd.execute()            # if this raises, nothing is pushed and state is unchanged
        self._undo.append(cmd)
        self._redo.clear()       # a new action invalidates the redo branch
        return self


def demo() -> None:
    calc = Calculator().add(10).multiply(3).subtract(5)
    print(calc.result)            # 25
    calc.divide(4)
    print(calc.result)            # 6.25
    calc.undo()
    print(calc.result)            # 25
    calc.redo()
    print(calc.result)            # 6.25
    try:
        calc.divide(0)
    except CalculatorError as e:
        print("error:", e, "result still", calc.result)
    calc.clear()
    calc.undo()
    print(calc.result, calc.history())


if __name__ == "__main__":
    demo()
`

const java = `import java.math.BigDecimal;
import java.math.MathContext;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

class CalculatorException extends RuntimeException {
  CalculatorException(String m) { super(m); }
}

/** Receiver: the running result. */
final class Accumulator {
  BigDecimal value = BigDecimal.ZERO;
}

interface Command {
  void execute();
  void undo();
  String describe();
}

abstract class BinaryCommand implements Command {
  protected final Accumulator acc;
  protected final BigDecimal operand;
  private BigDecimal previous;

  protected BinaryCommand(Accumulator acc, BigDecimal operand) { this.acc = acc; this.operand = operand; }

  protected abstract String symbol();
  protected abstract BigDecimal compute(BigDecimal a, BigDecimal b);

  @Override public void execute() {
    BigDecimal next = compute(acc.value, operand); // may throw -> state untouched
    previous = acc.value;
    acc.value = next;
  }
  @Override public void undo() { acc.value = previous; } // restores exactly, even after x * 0
  @Override public String describe() { return symbol() + " " + operand.toPlainString(); }
}

final class AddCommand extends BinaryCommand {
  AddCommand(Accumulator a, BigDecimal x) { super(a, x); }
  protected String symbol() { return "+"; }
  protected BigDecimal compute(BigDecimal a, BigDecimal b) { return a.add(b); }
}

final class SubtractCommand extends BinaryCommand {
  SubtractCommand(Accumulator a, BigDecimal x) { super(a, x); }
  protected String symbol() { return "-"; }
  protected BigDecimal compute(BigDecimal a, BigDecimal b) { return a.subtract(b); }
}

final class MultiplyCommand extends BinaryCommand {
  MultiplyCommand(Accumulator a, BigDecimal x) { super(a, x); }
  protected String symbol() { return "×"; }
  protected BigDecimal compute(BigDecimal a, BigDecimal b) { return a.multiply(b); }
}

final class DivideCommand extends BinaryCommand {
  DivideCommand(Accumulator a, BigDecimal x) { super(a, x); }
  protected String symbol() { return "÷"; }
  protected BigDecimal compute(BigDecimal a, BigDecimal b) {
    if (b.signum() == 0) throw new CalculatorException("division by zero");
    return a.divide(b, MathContext.DECIMAL64).stripTrailingZeros();
  }
}

final class ClearCommand implements Command {
  private final Accumulator acc;
  private BigDecimal previous = BigDecimal.ZERO;
  ClearCommand(Accumulator acc) { this.acc = acc; }
  @Override public void execute() { previous = acc.value; acc.value = BigDecimal.ZERO; }
  @Override public void undo() { acc.value = previous; }
  @Override public String describe() { return "clear"; }
}

final class CommandFactory {
  private CommandFactory() {}
  static Command create(String op, Accumulator acc, BigDecimal operand) {
    return switch (op) {
      case "+" -> new AddCommand(acc, operand);
      case "-" -> new SubtractCommand(acc, operand);
      case "*", "×" -> new MultiplyCommand(acc, operand);
      case "/", "÷" -> new DivideCommand(acc, operand);
      default -> throw new CalculatorException("unknown operator " + op);
    };
  }
}

/** Invoker with undo/redo stacks. Not thread-safe (single user session). */
final class Calculator {
  private final Accumulator acc = new Accumulator();
  private final Deque<Command> undoStack = new ArrayDeque<>();
  private final Deque<Command> redoStack = new ArrayDeque<>();

  BigDecimal result() { return acc.value; }

  Calculator apply(String op, BigDecimal operand) { return run(CommandFactory.create(op, acc, operand)); }
  Calculator add(double x) { return apply("+", BigDecimal.valueOf(x)); }
  Calculator subtract(double x) { return apply("-", BigDecimal.valueOf(x)); }
  Calculator multiply(double x) { return apply("×", BigDecimal.valueOf(x)); }
  Calculator divide(double x) { return apply("÷", BigDecimal.valueOf(x)); }
  Calculator clear() { return run(new ClearCommand(acc)); }

  boolean undo() {
    if (undoStack.isEmpty()) return false;
    Command c = undoStack.pop();
    c.undo();
    redoStack.push(c);
    return true;
  }

  boolean redo() {
    if (redoStack.isEmpty()) return false;
    Command c = redoStack.pop();
    c.execute();
    undoStack.push(c);
    return true;
  }

  List<String> history() {
    List<String> out = new ArrayList<>();
    for (var it = undoStack.descendingIterator(); it.hasNext(); ) out.add(it.next().describe());
    return out;
  }

  private Calculator run(Command c) {
    c.execute();          // throws before any stack mutation if the operation is invalid
    undoStack.push(c);
    redoStack.clear();    // a new action invalidates the redo branch
    return this;
  }
}
`

const ts = `class CalculatorError extends Error {}

/** Receiver: the running result. */
class Accumulator { value = 0 }

interface Command {
  execute(): void
  undo(): void
  describe(): string
}

abstract class BinaryCommand implements Command {
  private previous = 0
  protected abstract readonly symbol: string
  constructor(protected readonly acc: Accumulator, protected readonly operand: number) {}

  protected abstract compute(a: number, b: number): number

  execute() {
    const next = this.compute(this.acc.value, this.operand) // may throw -> state untouched
    this.previous = this.acc.value
    this.acc.value = next
  }
  undo() { this.acc.value = this.previous } // exact, even after x * 0
  describe() { return this.symbol + ' ' + this.operand }
}

class AddCommand extends BinaryCommand {
  protected readonly symbol = '+'
  protected compute(a: number, b: number) { return a + b }
}
class SubtractCommand extends BinaryCommand {
  protected readonly symbol = '-'
  protected compute(a: number, b: number) { return a - b }
}
class MultiplyCommand extends BinaryCommand {
  protected readonly symbol = '×'
  protected compute(a: number, b: number) { return a * b }
}
class DivideCommand extends BinaryCommand {
  protected readonly symbol = '÷'
  protected compute(a: number, b: number) {
    if (b === 0) throw new CalculatorError('division by zero')
    return a / b
  }
}

class ClearCommand implements Command {
  private previous = 0
  constructor(private acc: Accumulator) {}
  execute() { this.previous = this.acc.value; this.acc.value = 0 }
  undo() { this.acc.value = this.previous }
  describe() { return 'clear' }
}

const CommandFactory = {
  create(op: string, acc: Accumulator, operand: number): Command {
    switch (op) {
      case '+': return new AddCommand(acc, operand)
      case '-': return new SubtractCommand(acc, operand)
      case '*': case '×': return new MultiplyCommand(acc, operand)
      case '/': case '÷': return new DivideCommand(acc, operand)
      default: throw new CalculatorError('unknown operator ' + op)
    }
  },
}

class Calculator {
  private acc = new Accumulator()
  private undoStack: Command[] = []
  private redoStack: Command[] = []

  get result() { return this.acc.value }

  apply(op: string, operand: number): this { return this.run(CommandFactory.create(op, this.acc, operand)) }
  add(x: number) { return this.apply('+', x) }
  subtract(x: number) { return this.apply('-', x) }
  multiply(x: number) { return this.apply('×', x) }
  divide(x: number) { return this.apply('÷', x) }
  clear() { return this.run(new ClearCommand(this.acc)) }

  undo(): boolean {
    const c = this.undoStack.pop()
    if (!c) return false
    c.undo()
    this.redoStack.push(c)
    return true
  }

  redo(): boolean {
    const c = this.redoStack.pop()
    if (!c) return false
    c.execute()
    this.undoStack.push(c)
    return true
  }

  history() { return this.undoStack.map(c => c.describe()) }

  private run(c: Command): this {
    c.execute() // throws before any stack mutation if invalid
    this.undoStack.push(c)
    this.redoStack.length = 0 // a new action invalidates the redo branch
    return this
  }
}

export { Calculator, CalculatorError }
`

const cpp = `#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

struct CalculatorError : std::runtime_error { using std::runtime_error::runtime_error; };

// Receiver: the running result.
struct Accumulator { double value = 0; };

class Command {
public:
  virtual ~Command() = default;
  virtual void execute() = 0;
  virtual void undo() = 0;
  virtual std::string describe() const = 0;
};

class BinaryCommand : public Command {
public:
  BinaryCommand(Accumulator& acc, double operand) : acc_(acc), operand_(operand) {}
  void execute() override {
    double next = compute(acc_.value, operand_);  // may throw -> state untouched
    previous_ = acc_.value;
    acc_.value = next;
  }
  void undo() override { acc_.value = previous_; }  // exact, even after x * 0
  std::string describe() const override { return symbol() + " " + std::to_string(operand_); }
protected:
  virtual double compute(double a, double b) const = 0;
  virtual std::string symbol() const = 0;
  Accumulator& acc_;
  double operand_;
private:
  double previous_ = 0;
};

class AddCommand : public BinaryCommand {
public: using BinaryCommand::BinaryCommand;
protected:
  double compute(double a, double b) const override { return a + b; }
  std::string symbol() const override { return "+"; }
};
class SubtractCommand : public BinaryCommand {
public: using BinaryCommand::BinaryCommand;
protected:
  double compute(double a, double b) const override { return a - b; }
  std::string symbol() const override { return "-"; }
};
class MultiplyCommand : public BinaryCommand {
public: using BinaryCommand::BinaryCommand;
protected:
  double compute(double a, double b) const override { return a * b; }
  std::string symbol() const override { return "*"; }
};
class DivideCommand : public BinaryCommand {
public: using BinaryCommand::BinaryCommand;
protected:
  double compute(double a, double b) const override {
    if (b == 0) throw CalculatorError("division by zero");
    return a / b;
  }
  std::string symbol() const override { return "/"; }
};

class ClearCommand : public Command {
  Accumulator& acc_;
  double previous_ = 0;
public:
  explicit ClearCommand(Accumulator& acc) : acc_(acc) {}
  void execute() override { previous_ = acc_.value; acc_.value = 0; }
  void undo() override { acc_.value = previous_; }
  std::string describe() const override { return "clear"; }
};

struct CommandFactory {
  static std::unique_ptr<Command> create(const std::string& op, Accumulator& acc, double operand) {
    if (op == "+") return std::make_unique<AddCommand>(acc, operand);
    if (op == "-") return std::make_unique<SubtractCommand>(acc, operand);
    if (op == "*") return std::make_unique<MultiplyCommand>(acc, operand);
    if (op == "/") return std::make_unique<DivideCommand>(acc, operand);
    throw CalculatorError("unknown operator " + op);
  }
};

// Invoker. Member order matters: acc_ must outlive the commands that reference it.
class Calculator {
  Accumulator acc_;
  std::vector<std::unique_ptr<Command>> undo_, redo_;

  Calculator& run(std::unique_ptr<Command> c) {
    c->execute();  // throws before any stack mutation if invalid
    undo_.push_back(std::move(c));
    redo_.clear();  // a new action invalidates the redo branch
    return *this;
  }
public:
  Calculator() = default;
  Calculator(const Calculator&) = delete;             // commands hold a reference to acc_
  Calculator& operator=(const Calculator&) = delete;

  double result() const { return acc_.value; }
  Calculator& apply(const std::string& op, double x) { return run(CommandFactory::create(op, acc_, x)); }
  Calculator& add(double x) { return apply("+", x); }
  Calculator& subtract(double x) { return apply("-", x); }
  Calculator& multiply(double x) { return apply("*", x); }
  Calculator& divide(double x) { return apply("/", x); }
  Calculator& clear() { return run(std::make_unique<ClearCommand>(acc_)); }

  bool undo() {
    if (undo_.empty()) return false;
    auto c = std::move(undo_.back()); undo_.pop_back();
    c->undo();
    redo_.push_back(std::move(c));
    return true;
  }
  bool redo() {
    if (redo_.empty()) return false;
    auto c = std::move(redo_.back()); redo_.pop_back();
    c->execute();
    undo_.push_back(std::move(c));
    return true;
  }
  std::vector<std::string> history() const {
    std::vector<std::string> out;
    for (const auto& c : undo_) out.push_back(c->describe());
    return out;
  }
};
`

const goCode = `package calc

import (
  "errors"
  "fmt"
)

var (
  ErrDivideByZero = errors.New("division by zero")
  ErrUnknownOp    = errors.New("unknown operator")
)

// Accumulator is the receiver: the running result.
type Accumulator struct{ Value float64 }

type Command interface {
  Execute() error
  Undo()
  String() string
}

type binaryCommand struct {
  acc      *Accumulator
  symbol   string
  operand  float64
  previous float64
  compute  func(a, b float64) (float64, error)
}

func (c *binaryCommand) Execute() error {
  next, err := c.compute(c.acc.Value, c.operand) // on error nothing changes
  if err != nil {
    return err
  }
  c.previous = c.acc.Value
  c.acc.Value = next
  return nil
}

func (c *binaryCommand) Undo()          { c.acc.Value = c.previous } // exact, even after x * 0
func (c *binaryCommand) String() string { return fmt.Sprintf("%s %g", c.symbol, c.operand) }

type clearCommand struct {
  acc      *Accumulator
  previous float64
}

func (c *clearCommand) Execute() error { c.previous = c.acc.Value; c.acc.Value = 0; return nil }
func (c *clearCommand) Undo()          { c.acc.Value = c.previous }
func (c *clearCommand) String() string { return "clear" }

// NewCommand is the factory: operator symbol -> concrete command.
func NewCommand(op string, acc *Accumulator, operand float64) (Command, error) {
  mk := func(sym string, f func(a, b float64) (float64, error)) Command {
    return &binaryCommand{acc: acc, symbol: sym, operand: operand, compute: f}
  }
  switch op {
  case "+":
    return mk("+", func(a, b float64) (float64, error) { return a + b, nil }), nil
  case "-":
    return mk("-", func(a, b float64) (float64, error) { return a - b, nil }), nil
  case "*", "×":
    return mk("×", func(a, b float64) (float64, error) { return a * b, nil }), nil
  case "/", "÷":
    return mk("÷", func(a, b float64) (float64, error) {
      if b == 0 {
        return 0, ErrDivideByZero
      }
      return a / b, nil
    }), nil
  }
  return nil, fmt.Errorf("%w: %q", ErrUnknownOp, op)
}

// Step lets callers express a chain such as 10 + 5 × 3.
type Step struct {
  Op      string
  Operand float64
}

// Calculator is the invoker. Not safe for concurrent use (single user session).
type Calculator struct {
  acc  Accumulator
  undo []Command
  redo []Command
}

func (c *Calculator) Result() float64 { return c.acc.Value }

func (c *Calculator) run(cmd Command) error {
  if err := cmd.Execute(); err != nil { // nothing is pushed on failure
    return err
  }
  c.undo = append(c.undo, cmd)
  c.redo = nil // a new action invalidates the redo branch
  return nil
}

func (c *Calculator) Apply(op string, operand float64) error {
  cmd, err := NewCommand(op, &c.acc, operand)
  if err != nil {
    return err
  }
  return c.run(cmd)
}

// Chain applies steps left to right and stops at the first error (earlier steps stay applied and undoable).
func (c *Calculator) Chain(steps ...Step) error {
  for _, s := range steps {
    if err := c.Apply(s.Op, s.Operand); err != nil {
      return err
    }
  }
  return nil
}

func (c *Calculator) Clear() error { return c.run(&clearCommand{acc: &c.acc}) }

func (c *Calculator) Undo() bool {
  if len(c.undo) == 0 {
    return false
  }
  cmd := c.undo[len(c.undo)-1]
  c.undo = c.undo[:len(c.undo)-1]
  cmd.Undo()
  c.redo = append(c.redo, cmd)
  return true
}

func (c *Calculator) Redo() bool {
  if len(c.redo) == 0 {
    return false
  }
  cmd := c.redo[len(c.redo)-1]
  c.redo = c.redo[:len(c.redo)-1]
  _ = cmd.Execute() // re-executing a command that succeeded once on the same state cannot fail
  c.undo = append(c.undo, cmd)
  return true
}

func (c *Calculator) History() []string {
  out := make([]string, len(c.undo))
  for i, cmd := range c.undo {
    out[i] = cmd.String()
  }
  return out
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

public sealed class CalculatorException : Exception {
  public CalculatorException(string m) : base(m) {}
}

// Receiver: the running result.
public sealed class Accumulator {
  public decimal Value { get; set; }
}

public interface ICommand {
  void Execute();
  void Undo();
  string Describe();
}

public abstract class BinaryCommand : ICommand {
  protected readonly Accumulator Acc;
  protected readonly decimal Operand;
  decimal _previous;

  protected BinaryCommand(Accumulator acc, decimal operand) { Acc = acc; Operand = operand; }
  protected abstract string Symbol { get; }
  protected abstract decimal Compute(decimal a, decimal b);

  public void Execute() {
    var next = Compute(Acc.Value, Operand); // may throw -> state untouched
    _previous = Acc.Value;
    Acc.Value = next;
  }
  public void Undo() => Acc.Value = _previous; // exact, even after x * 0
  public string Describe() => Symbol + " " + Operand;
}

public sealed class AddCommand : BinaryCommand {
  public AddCommand(Accumulator a, decimal x) : base(a, x) {}
  protected override string Symbol => "+";
  protected override decimal Compute(decimal a, decimal b) => a + b;
}

public sealed class SubtractCommand : BinaryCommand {
  public SubtractCommand(Accumulator a, decimal x) : base(a, x) {}
  protected override string Symbol => "-";
  protected override decimal Compute(decimal a, decimal b) => a - b;
}

public sealed class MultiplyCommand : BinaryCommand {
  public MultiplyCommand(Accumulator a, decimal x) : base(a, x) {}
  protected override string Symbol => "×";
  protected override decimal Compute(decimal a, decimal b) => a * b;
}

public sealed class DivideCommand : BinaryCommand {
  public DivideCommand(Accumulator a, decimal x) : base(a, x) {}
  protected override string Symbol => "÷";
  protected override decimal Compute(decimal a, decimal b) =>
    b == 0 ? throw new CalculatorException("division by zero") : a / b;
}

public sealed class ClearCommand : ICommand {
  readonly Accumulator _acc;
  decimal _previous;
  public ClearCommand(Accumulator acc) { _acc = acc; }
  public void Execute() { _previous = _acc.Value; _acc.Value = 0; }
  public void Undo() => _acc.Value = _previous;
  public string Describe() => "clear";
}

public static class CommandFactory {
  public static ICommand Create(string op, Accumulator acc, decimal operand) => op switch {
    "+" => new AddCommand(acc, operand),
    "-" => new SubtractCommand(acc, operand),
    "*" or "×" => new MultiplyCommand(acc, operand),
    "/" or "÷" => new DivideCommand(acc, operand),
    _ => throw new CalculatorException("unknown operator " + op),
  };
}

// Invoker with undo/redo stacks. Not thread-safe (single user session).
public sealed class Calculator {
  readonly Accumulator _acc = new();
  readonly Stack<ICommand> _undo = new();
  readonly Stack<ICommand> _redo = new();

  public decimal Result => _acc.Value;

  public Calculator Apply(string op, decimal operand) => Run(CommandFactory.Create(op, _acc, operand));
  public Calculator Add(decimal x) => Apply("+", x);
  public Calculator Subtract(decimal x) => Apply("-", x);
  public Calculator Multiply(decimal x) => Apply("×", x);
  public Calculator Divide(decimal x) => Apply("÷", x);
  public Calculator Clear() => Run(new ClearCommand(_acc));

  public bool Undo() {
    if (!_undo.TryPop(out var c)) return false;
    c.Undo();
    _redo.Push(c);
    return true;
  }

  public bool Redo() {
    if (!_redo.TryPop(out var c)) return false;
    c.Execute();
    _undo.Push(c);
    return true;
  }

  public IReadOnlyList<string> History() => _undo.Reverse().Select(c => c.Describe()).ToList();

  Calculator Run(ICommand c) {
    c.Execute();      // throws before any stack mutation if invalid
    _undo.Push(c);
    _redo.Clear();    // a new action invalidates the redo branch
    return this;
  }
}
`

export const basicCalculatorSolution: ProblemSolution = {
  slug: 'basic-calculator',
  title: 'Basic Calculator - Solution',
  overview: {
    introduction:
      'Design a calculator that supports addition, subtraction, multiplication and division, keeps a running result, allows chaining operations, and supports clear plus undo/redo. The interview signal is recognizing that every user action is a reversible operation - the Command pattern - and keeping the invoker (history management) separate from the receiver (the accumulated value) and the operations.',
    constraints: [
      'Four binary operations: +, −, ×, ÷, applied to the running result.',
      'The running result persists between operations and supports chaining (10 + 5 × 3 evaluated left to right).',
      'Undo and redo must restore exact previous states in LIFO order.',
      'Clear resets the result; division by zero must be rejected without corrupting state.',
    ],
    assumptions: [
      'Operations evaluate strictly left to right (a pocket calculator), not with operator precedence; expression parsing is an extension.',
      'Clear is itself undoable (undoing a clear restores the previous result).',
      'Performing a new operation after an undo discards the redo history.',
      'Single user session, so the calculator is not thread-safe.',
      'Decimal arithmetic is used where the language offers it so 0.1 + 0.2 displays as 0.3.',
    ],
    clarificationQuestions: [
      'Left-to-right chaining or standard precedence (2 + 3 × 4)?',
      'Should clear wipe history too, or be undoable?',
      'Is there a limit on undo history size?',
      'How should division by zero and overflow be reported?',
      'Do we need decimals/precision guarantees or are floats acceptable?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Whenever the prompt says undo/redo, think Command pattern: encapsulate each action as an object that can execute() and undo(). Then separate who holds state (Accumulator, the receiver) from who triggers and records actions (Calculator, the invoker) from what each action does (concrete commands).',
    breakdown: [
      'Write the Command interface: execute(), undo(), describe().',
      'Create an Accumulator receiver that holds the running value.',
      'Implement a BinaryCommand base that captures the previous value for exact undo; subclasses supply only the arithmetic.',
      'Add ClearCommand so clear is undoable like everything else.',
      'Build the Calculator invoker with undo and redo stacks and a fluent API for chaining.',
      'Add a small factory mapping operator symbols to commands.',
    ],
    entities: [
      { name: 'Calculator', responsibility: 'Invoker: runs commands, owns undo/redo stacks, exposes the fluent API.' },
      { name: 'Command', responsibility: 'Interface for reversible actions.' },
      { name: 'BinaryCommand', responsibility: 'Template for “running ⊕ operand” with saved previous state.' },
      { name: 'Add/Subtract/Multiply/DivideCommand', responsibility: 'Concrete arithmetic; divide guards zero.' },
      { name: 'ClearCommand', responsibility: 'Resets the accumulator and remembers the old value.' },
      { name: 'Accumulator', responsibility: 'Receiver holding the running result.' },
      { name: 'CommandFactory', responsibility: 'Maps operator symbols to command objects.' },
    ],
    relationships: [
      'Calculator aggregates Commands in its undo and redo stacks.',
      'Calculator owns one Accumulator; commands mutate it through an association.',
      'BinaryCommand and ClearCommand realize Command; the four operations inherit from BinaryCommand.',
      'Calculator depends on CommandFactory to create operations from symbols.',
    ],
    patternsAndOop: [
      'Command: each operation is an object with execute/undo.',
      'Template Method: BinaryCommand fixes the save-previous/execute/undo flow; subclasses implement compute().',
      'Factory: operator symbol → command, so adding an operator is a one-line change.',
      'Memento-lite: commands store the previous value rather than computing an inverse.',
      'Fluent interface: methods return the calculator for chaining.',
    ],
    stepByStep: [
      'Clarify precedence, clear semantics and precision requirements.',
      'Define Command and the Accumulator receiver.',
      'Implement BinaryCommand and the four operations.',
      'Implement Calculator.run: execute → push undo → clear redo.',
      'Implement undo and redo moving commands between stacks.',
      'Demonstrate a chain with undo/redo and a divide-by-zero failure that leaves state unchanged.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Every action is a Command that knows how to apply itself to the Accumulator and how to put the old value back. The Calculator only manages stacks. Because commands store the previous value, undo is exact for operations that have no mathematical inverse (such as multiplying by zero) and for floating-point rounding.',
    classResponsibilities: [
      { name: 'Calculator', responsibility: 'Executes commands, maintains undo/redo stacks, clears redo on new input.' },
      { name: 'Accumulator', responsibility: 'Single piece of mutable state: the running result.' },
      { name: 'BinaryCommand', responsibility: 'Implements execute/undo using a saved previous value; delegates arithmetic.' },
      { name: 'DivideCommand', responsibility: 'Rejects divisor zero before any mutation.' },
      { name: 'ClearCommand', responsibility: 'Makes clear a first-class undoable action.' },
      { name: 'CommandFactory', responsibility: 'Translates symbols to commands.' },
    ],
    interfacesAndAbstractions: [
      'Command is the abstraction the invoker depends on; it does not know any arithmetic.',
      'BinaryCommand.compute is the only extension point for new binary operators.',
    ],
    relationships: [
      'Aggregation Calculator→Command: commands are created externally and held in history.',
      'Association Calculator/Commands→Accumulator: all share the same receiver instance.',
      'Realization and inheritance form a shallow hierarchy that matches the pattern directly.',
      'Dependency Calculator→CommandFactory: only used when applying a symbol.',
    ],
    solid: [
      'SRP: stack management, arithmetic and state are separate classes.',
      'OCP: add a power or modulo operator by adding one BinaryCommand subclass and a factory entry.',
      'LSP: any Command can be pushed, undone and redone interchangeably.',
      'ISP: the interface has only the three methods the invoker needs.',
      'DIP: Calculator depends on Command, not concrete operations.',
    ],
    patterns: [
      { name: 'Command', why: 'Reversible operations are the heart of undo/redo.' },
      { name: 'Template Method', why: 'Shares the capture-previous and restore logic across operations.' },
      { name: 'Factory', why: 'Keeps symbol parsing out of the invoker.' },
    ],
    decisions: [
      {
        decision: 'Undo restores a stored previous value instead of applying an inverse operation.',
        rationale: 'x × 0 and floating-point rounding make inverses lossy or impossible.',
        tradeoff: 'One extra number stored per command; fine for calculator-sized history.',
      },
      {
        decision: 'Execute first, push to the undo stack only on success.',
        rationale: 'A failed divide-by-zero must not leave a phantom history entry or alter state.',
        tradeoff: 'None significant; it simply orders the steps correctly.',
      },
      {
        decision: 'Clear is an undoable command and keeps history.',
        rationale: 'Accidental clears are common; users expect undo to recover them.',
        tradeoff: 'Differs from hardware “C” keys; if the interviewer wants a hard reset, clear both stacks.',
      },
      {
        decision: 'Left-to-right evaluation.',
        rationale: 'Matches the problem statement (“running result”, “chained operations”).',
        tradeoff: 'Precedence needs an expression parser (shunting-yard) in front of the same commands.',
      },
    ],
    extensibility:
      'New operators: add a BinaryCommand subclass. Expression input with precedence: parse to an AST or RPN and emit commands. Persistent history: serialize describe() plus operands. Bounded history: cap the undo stack and drop the oldest entries.',
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
      'apply(op, x) asks CommandFactory for a command bound to the shared Accumulator.',
      'The calculator executes it; BinaryCommand computes the new value first, then saves previous and writes the result.',
      'On success the command is pushed on the undo stack and the redo stack is cleared.',
      'undo() pops the latest command, calls undo() (restoring the saved value) and pushes it onto the redo stack.',
      'redo() pops from the redo stack, re-executes and pushes back onto the undo stack.',
    ],
    examples: [
      {
        title: 'Chained operations with undo/redo',
        input: 'add(10).multiply(3).subtract(5) → undo() → redo() → divide(4)',
        output: '25 → 30 → 25 → 6.25',
        explanation:
          '10 → 30 → 25. Undo restores 30 (the subtract’s saved previous). Redo re-applies subtract 5 to get 25, then divide gives 6.25.',
      },
      {
        title: 'Divide by zero is rejected cleanly',
        input: 'add(8).divide(0)',
        output: 'Error “division by zero”; result stays 8; undo history is [+ 8]',
        explanation:
          'DivideCommand computes before mutating and throws, so the accumulator is untouched and the failed command never reaches the undo stack.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you support operator precedence like 2 + 3 × 4?',
      answer:
        'Add an ExpressionParser (shunting-yard to RPN, or a recursive-descent AST). Evaluate the tree by emitting the same commands, or treat a whole expression as one macro command whose undo restores the prior result.',
    },
    {
      question: 'Why store the previous value instead of applying the inverse?',
      answer:
        'Not every operation is invertible: multiplying by zero loses information, and floating-point division/multiplication accumulates rounding error. Restoring a snapshot is exact and trivial.',
    },
    {
      question: 'How would you cap memory for undo history?',
      answer:
        'Use a bounded deque for the undo stack and discard the oldest command when the limit is exceeded. Redo is naturally bounded by what was undone.',
    },
    {
      question: 'How do you add memory keys (M+, M−, MR)?',
      answer:
        'Add a second receiver field (or a Memory object) and new commands that mutate it. Because they implement Command, undo/redo work without any change to Calculator.',
    },
    {
      question: 'What about precision and overflow?',
      answer:
        'Use decimal types (Python Decimal, Java BigDecimal, C# decimal) for display-accurate results, and define a rounding/scale policy for division. With doubles, format results to a fixed number of significant digits.',
    },
    {
      question: 'Could you implement undo with snapshots of the whole calculator instead?',
      answer:
        'Yes (Memento), which is simpler for a single number but heavier for complex state. Commands keep per-action intent (useful for history display and macros) and store only what changed.',
    },
  ],
  extras: {
    edgeCases: [
      'Divide by zero (operand zero, including 0 ÷ 0).',
      'Undo/redo on empty stacks returns false without error.',
      'New operation after an undo discards redo history.',
      'Undo after multiply-by-zero restores the exact previous value.',
      'Undo of clear restores the pre-clear result.',
      'Unknown operator symbol.',
    ],
    commonMistakes: [
      'Putting a switch over operators inside Calculator instead of using commands.',
      'Pushing to the undo stack before the command succeeds.',
      'Forgetting to clear the redo stack on a new action.',
      'Implementing undo by inverse math (breaks for ×0 and for floats).',
      'Letting commands own separate copies of the result instead of sharing the receiver.',
    ],
    complexity:
      'Each operation, undo and redo is O(1) time. Memory is O(h) for h commands in history (bounded if capped).',
    testing: [
      'Table-driven tests for each operator, including negatives and decimals.',
      'Undo/redo sequence tests: apply N, undo k, redo j, assert result and history.',
      'Divide-by-zero leaves result and stacks unchanged.',
      'Redo cleared after a new operation.',
      'Undo of clear and of multiply-by-zero.',
    ],
    extensions: [
      'Operator precedence and parentheses via an expression parser.',
      'Memory registers and scientific functions as more commands.',
      'Bounded or persistent history.',
      'Macro commands (record and replay a sequence).',
    ],
    takeaways: [
      'Undo/redo ⇒ Command pattern with two stacks.',
      'Receiver holds state; invoker holds history; commands hold intent.',
      'Restore snapshots rather than inverting math.',
      'Fail before mutating or recording.',
    ],
  },
}
