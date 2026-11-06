import type { ProblemSolution } from '../types'
import { abstractCls, attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  // Left - controller (orchestrator) + mode
  cls('tc', 'TrafficController', 40, 40, [
    attr('-', 'roads', 'List<Road>'),
    attr('-', 'active', 'int'),
    attr('-', 'remaining', 'seconds'),
    attr('-', 'pedestrianHold', 'bool'),
    attr('-', 'mode', 'Mode'),
    attr('-', 'emergencyRoad', 'int?'),
  ], [
    method('+', 'start', '', 'void'),
    method('+', 'tick', 'dt: seconds', 'void'),
    method('+', 'requestPedestrian', 'roadIdx: int', 'void'),
    method('+', 'emergencyOverride', 'roadIdx: int', 'void'),
    method('+', 'clearEmergency', '', 'void'),
    method('+', 'snapshot', '', 'Map<string, LightColor>'),
    method('+', 'isSafe', '', 'bool'),
  ]),
  enm('md', 'Mode', 40, 480, ['NORMAL', 'EMERGENCY']),

  // Road + config
  cls('rd', 'Road', 420, 40, [
    attr('-', 'name', 'string'),
    attr('-', 'light', 'TrafficLight'),
    attr('-', 'config', 'SignalConfig'),
    attr('+', 'pedestrianRequested', 'bool'),
  ], []),
  cls('sc', 'SignalConfig', 420, 340, [
    attr('+', 'green', 'seconds'),
    attr('+', 'yellow', 'seconds'),
    attr('+', 'pedestrianExtension', 'seconds'),
  ], [], 'record'),

  // Light + state hierarchy
  cls('tl', 'TrafficLight', 800, 40, [
    attr('-', 'state', 'LightState'),
    attr('-', 'config', 'SignalConfig'),
  ], [
    method('+', 'color', '', 'LightColor'),
    method('+', 'advance', '', 'void'),
    method('+', 'duration', '', 'seconds'),
  ]),
  abstractCls('ls', 'LightState', 1180, 40, [], [
    method('+', 'color', '', 'LightColor', { isAbstract: true }),
    method('+', 'next', '', 'LightState', { isAbstract: true }),
    method('+', 'duration', 'cfg: SignalConfig', 'seconds', { isAbstract: true }),
  ]),
  enm('lc', 'LightColor', 1560, 40, ['RED', 'YELLOW', 'GREEN']),
  cls('rs', 'RedState', 800, 440, [], [
    method('+', 'next', '', 'GreenState'),
    method('+', 'duration', 'cfg', 'seconds'),
  ]),
  cls('gs', 'GreenState', 1180, 440, [], [
    method('+', 'next', '', 'YellowState'),
    method('+', 'duration', 'cfg', 'seconds'),
  ]),
  cls('ys', 'YellowState', 1560, 440, [], [
    method('+', 'next', '', 'RedState'),
    method('+', 'duration', 'cfg', 'seconds'),
  ]),
]

const edges = [
  edge('e1', 'tc', 'rd', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '2..*' }),
  edge('e2', 'rd', 'tl', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e3', 'tl', 'ls', 'aggregation', 'right', 'left', { label: 'current state' }),
  edge('e4', 'rd', 'sc', 'aggregation', 'bottom', 'top', { label: 'configured by' }),
  edge('e5', 'ls', 'lc', 'dependency', 'right', 'left'),
  edge('e6', 'rs', 'ls', 'inheritance', 'top', 'bottom@10'),
  edge('e7', 'gs', 'ls', 'inheritance', 'top', 'bottom@50'),
  edge('e8', 'ys', 'ls', 'inheritance', 'top', 'bottom@90'),
  edge('e9', 'tc', 'md', 'association', 'bottom', 'top', { label: 'mode' }),
]

const py = `from __future__ import annotations
import math
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional


class LightColor(Enum):
    RED = "red"
    YELLOW = "yellow"
    GREEN = "green"


class Mode(Enum):
    NORMAL = "normal"
    EMERGENCY = "emergency"


@dataclass(frozen=True)
class SignalConfig:
    green: float = 30.0
    yellow: float = 5.0
    pedestrian_extension: float = 10.0  # extra all-red time before this road turns green

    def __post_init__(self):
        if self.green <= 0 or self.yellow <= 0 or self.pedestrian_extension < 0:
            raise ValueError("durations must be positive")


# ---- State pattern: each colour knows its successor and how long it lasts ----
class LightState(ABC):
    color: LightColor

    @abstractmethod
    def next(self) -> "LightState": ...

    @abstractmethod
    def duration(self, cfg: SignalConfig) -> float: ...


class RedState(LightState):
    color = LightColor.RED

    def next(self) -> LightState:
        return GREEN

    def duration(self, cfg: SignalConfig) -> float:
        return math.inf  # red lasts until the controller gives this road its turn


class GreenState(LightState):
    color = LightColor.GREEN

    def next(self) -> LightState:
        return YELLOW

    def duration(self, cfg: SignalConfig) -> float:
        return cfg.green


class YellowState(LightState):
    color = LightColor.YELLOW

    def next(self) -> LightState:
        return RED

    def duration(self, cfg: SignalConfig) -> float:
        return cfg.yellow


RED, GREEN, YELLOW = RedState(), GreenState(), YellowState()


class TrafficLight:
    def __init__(self, config: SignalConfig):
        self.config = config
        self._state: LightState = RED

    @property
    def color(self) -> LightColor:
        return self._state.color

    def advance(self) -> None:
        self._state = self._state.next()

    def duration(self) -> float:
        return self._state.duration(self.config)


class Road:
    def __init__(self, name: str, config: Optional[SignalConfig] = None):
        self.name = name
        self.config = config or SignalConfig()
        self.light = TrafficLight(self.config)
        self.pedestrian_requested = False


class TrafficController:
    """Round-robin controller. A single 'active' pointer guarantees mutually exclusive greens."""

    def __init__(self, roads: List[Road]):
        if len(roads) < 2:
            raise ValueError("an intersection needs at least two roads")
        self._roads = roads
        self._active = 0
        self._remaining = 0.0
        self._hold = False  # all-red pedestrian clearance before roads[_active] turns green
        self._mode = Mode.NORMAL
        self._emergency: Optional[int] = None
        self._started = False

    # ---- lifecycle -------------------------------------------------------
    def start(self) -> None:
        if self._started:
            raise RuntimeError("already started")
        self._started = True
        self._turn_green(0)

    def tick(self, dt: float) -> None:
        """Advance simulated time. In production a scheduler/timer calls this each second."""
        if not self._started:
            raise RuntimeError("call start() first")
        while dt > 0:
            step = min(dt, self._remaining)
            self._remaining -= step
            dt -= step
            if self._remaining <= 0:
                self._on_expire()

    # ---- external requests -------------------------------------------------
    def request_pedestrian(self, idx: int) -> None:
        road = self._roads[idx]
        if self._hold and self._active == idx:
            self._remaining += road.config.pedestrian_extension  # extend the red we are holding
        else:
            road.pedestrian_requested = True  # honoured the next time this road's turn arrives

    def emergency_override(self, idx: int) -> None:
        self._mode, self._emergency = Mode.EMERGENCY, idx
        cur = self._roads[self._active]
        if self._hold:                                   # everything is red -> go straight to emergency road
            self._hold = False
            self._turn_green(idx)
        elif cur.light.color is LightColor.GREEN:
            if self._active == idx:
                self._remaining = math.inf               # hold green until cleared
            else:
                cur.light.advance()                      # GREEN -> YELLOW first (safe exit)
                self._remaining = cur.light.duration()
        # if YELLOW: it will finish and _next_road() will pick the emergency road

    def clear_emergency(self) -> None:
        was, self._mode, self._emergency = self._emergency, Mode.NORMAL, None
        cur = self._roads[self._active]
        if was is not None and self._active == was and cur.light.color is LightColor.GREEN:
            cur.light.advance()                          # resume normal cycle via YELLOW
            self._remaining = cur.light.duration()

    # ---- internals ---------------------------------------------------------
    def _turn_green(self, idx: int) -> None:
        self._active = idx
        light = self._roads[idx].light
        light.advance()  # RED -> GREEN
        self._remaining = math.inf if (self._mode is Mode.EMERGENCY and idx == self._emergency) else light.duration()

    def _on_expire(self) -> None:
        if self._hold:
            self._hold = False
            self._turn_green(self._active)
            return
        light = self._roads[self._active].light
        light.advance()  # GREEN->YELLOW or YELLOW->RED
        if light.color is LightColor.RED:
            self._next_road()
        else:
            self._remaining = light.duration()

    def _next_road(self) -> None:
        if self._mode is Mode.EMERGENCY and self._emergency is not None:
            target = self._emergency
        else:
            target = (self._active + 1) % len(self._roads)
        self._active = target
        road = self._roads[target]
        if road.pedestrian_requested and self._mode is Mode.NORMAL:
            road.pedestrian_requested = False
            self._hold = True                            # all roads stay red: pedestrians cross
            self._remaining = road.config.pedestrian_extension
        else:
            self._turn_green(target)

    # ---- observability -----------------------------------------------------
    def snapshot(self) -> Dict[str, LightColor]:
        return {r.name: r.light.color for r in self._roads}

    def is_safe(self) -> bool:
        return sum(1 for r in self._roads if r.light.color is not LightColor.RED) <= 1


def demo() -> None:
    roads = [Road("North"), Road("East"), Road("South"), Road("West")]
    ctl = TrafficController(roads)
    ctl.start()
    ctl.tick(30)                      # North green -> yellow
    ctl.request_pedestrian(2)         # pedestrians want South's crosswalk
    ctl.tick(5 + 30 + 5)              # North yellow ends, East green+yellow
    print({k: v.name for k, v in ctl.snapshot().items()})
    ctl.emergency_override(3)         # ambulance from the West
    ctl.tick(10)
    print({k: v.name for k, v in ctl.snapshot().items()}, ctl.is_safe())


if __name__ == "__main__":
    demo()
`

const java = `import java.util.*;

enum LightColor { RED, YELLOW, GREEN }
enum Mode { NORMAL, EMERGENCY }

record SignalConfig(double green, double yellow, double pedestrianExtension) {
  SignalConfig {
    if (green <= 0 || yellow <= 0 || pedestrianExtension < 0)
      throw new IllegalArgumentException("durations must be positive");
  }
  static SignalConfig defaults() { return new SignalConfig(30, 5, 10); }
}

/** State pattern: every colour knows its successor and its duration. */
enum LightState {
  RED(LightColor.RED) {
    LightState next() { return GREEN; }
    double duration(SignalConfig c) { return Double.POSITIVE_INFINITY; } // until the controller's turn
  },
  GREEN(LightColor.GREEN) {
    LightState next() { return YELLOW; }
    double duration(SignalConfig c) { return c.green(); }
  },
  YELLOW(LightColor.YELLOW) {
    LightState next() { return RED; }
    double duration(SignalConfig c) { return c.yellow(); }
  };

  final LightColor color;
  LightState(LightColor color) { this.color = color; }
  abstract LightState next();
  abstract double duration(SignalConfig cfg);
}

class TrafficLight {
  private LightState state = LightState.RED;
  private final SignalConfig config;
  TrafficLight(SignalConfig config) { this.config = config; }
  LightColor color() { return state.color; }
  void advance() { state = state.next(); }
  double duration() { return state.duration(config); }
}

class Road {
  final String name;
  final SignalConfig config;
  final TrafficLight light;
  boolean pedestrianRequested;
  Road(String name) { this(name, SignalConfig.defaults()); }
  Road(String name, SignalConfig config) {
    this.name = name; this.config = config; this.light = new TrafficLight(config);
  }
}

/** Round-robin controller. A single 'active' index guarantees mutually exclusive greens. */
class TrafficController {
  private final List<Road> roads;
  private int active;
  private double remaining;
  private boolean hold;                    // all-red pedestrian clearance before roads[active] goes green
  private Mode mode = Mode.NORMAL;
  private Integer emergency;
  private boolean started;

  TrafficController(List<Road> roads) {
    if (roads.size() < 2) throw new IllegalArgumentException("need at least two roads");
    this.roads = List.copyOf(roads);
  }

  void start() {
    if (started) throw new IllegalStateException("already started");
    started = true;
    turnGreen(0);
  }

  /** Advance simulated time; a ScheduledExecutorService would call this every second. */
  void tick(double dt) {
    if (!started) throw new IllegalStateException("call start() first");
    while (dt > 0) {
      double step = Math.min(dt, remaining);
      remaining -= step;
      dt -= step;
      if (remaining <= 0) onExpire();
    }
  }

  void requestPedestrian(int idx) {
    Road r = roads.get(idx);
    if (hold && active == idx) remaining += r.config.pedestrianExtension();
    else r.pedestrianRequested = true;
  }

  void emergencyOverride(int idx) {
    mode = Mode.EMERGENCY; emergency = idx;
    Road cur = roads.get(active);
    if (hold) { hold = false; turnGreen(idx); }
    else if (cur.light.color() == LightColor.GREEN) {
      if (active == idx) remaining = Double.POSITIVE_INFINITY;
      else { cur.light.advance(); remaining = cur.light.duration(); }   // GREEN -> YELLOW first
    }
  }

  void clearEmergency() {
    Integer was = emergency;
    mode = Mode.NORMAL; emergency = null;
    Road cur = roads.get(active);
    if (was != null && active == was && cur.light.color() == LightColor.GREEN) {
      cur.light.advance();
      remaining = cur.light.duration();
    }
  }

  private void turnGreen(int idx) {
    active = idx;
    TrafficLight l = roads.get(idx).light;
    l.advance();                           // RED -> GREEN
    remaining = (mode == Mode.EMERGENCY && emergency != null && emergency == idx)
        ? Double.POSITIVE_INFINITY : l.duration();
  }

  private void onExpire() {
    if (hold) { hold = false; turnGreen(active); return; }
    TrafficLight l = roads.get(active).light;
    l.advance();                           // GREEN->YELLOW or YELLOW->RED
    if (l.color() == LightColor.RED) nextRoad(); else remaining = l.duration();
  }

  private void nextRoad() {
    int target = (mode == Mode.EMERGENCY && emergency != null) ? emergency : (active + 1) % roads.size();
    active = target;
    Road r = roads.get(target);
    if (r.pedestrianRequested && mode == Mode.NORMAL) {
      r.pedestrianRequested = false;
      hold = true;
      remaining = r.config.pedestrianExtension();
    } else turnGreen(target);
  }

  Map<String, LightColor> snapshot() {
    Map<String, LightColor> m = new LinkedHashMap<>();
    for (Road r : roads) m.put(r.name, r.light.color());
    return m;
  }

  boolean isSafe() {
    return roads.stream().filter(r -> r.light.color() != LightColor.RED).count() <= 1;
  }
}

public class Main {
  public static void main(String[] args) {
    TrafficController ctl = new TrafficController(
        List.of(new Road("North"), new Road("East"), new Road("South"), new Road("West")));
    ctl.start();
    ctl.tick(30);
    ctl.requestPedestrian(2);
    ctl.tick(40);
    System.out.println(ctl.snapshot());
    ctl.emergencyOverride(3);
    ctl.tick(10);
    System.out.println(ctl.snapshot() + " safe=" + ctl.isSafe());
  }
}
`

const ts = `export type LightColor = 'RED' | 'YELLOW' | 'GREEN'
export type Mode = 'NORMAL' | 'EMERGENCY'

export class SignalConfig {
  constructor(
    readonly green = 30,
    readonly yellow = 5,
    readonly pedestrianExtension = 10,
  ) {
    if (green <= 0 || yellow <= 0 || pedestrianExtension < 0) throw new Error('durations must be positive')
  }
}

/** State pattern: every colour knows its successor and its duration. */
export abstract class LightState {
  abstract readonly color: LightColor
  abstract next(): LightState
  abstract duration(cfg: SignalConfig): number
}

class RedState extends LightState {
  readonly color = 'RED' as const
  next(): LightState { return GREEN }
  duration(): number { return Infinity } // until the controller gives this road its turn
}
class GreenState extends LightState {
  readonly color = 'GREEN' as const
  next(): LightState { return YELLOW }
  duration(cfg: SignalConfig): number { return cfg.green }
}
class YellowState extends LightState {
  readonly color = 'YELLOW' as const
  next(): LightState { return RED }
  duration(cfg: SignalConfig): number { return cfg.yellow }
}
const RED: LightState = new RedState()
const GREEN: LightState = new GreenState()
const YELLOW: LightState = new YellowState()

export class TrafficLight {
  private state: LightState = RED
  constructor(readonly config: SignalConfig) {}
  get color(): LightColor { return this.state.color }
  advance(): void { this.state = this.state.next() }
  duration(): number { return this.state.duration(this.config) }
}

export class Road {
  readonly light: TrafficLight
  pedestrianRequested = false
  constructor(readonly name: string, readonly config = new SignalConfig()) {
    this.light = new TrafficLight(config)
  }
}

/** Round-robin controller. A single 'active' index guarantees mutually exclusive greens. */
export class TrafficController {
  private active = 0
  private remaining = 0
  private hold = false // all-red pedestrian clearance before roads[active] goes green
  private mode: Mode = 'NORMAL'
  private emergency: number | null = null
  private started = false

  constructor(private roads: Road[]) {
    if (roads.length < 2) throw new Error('need at least two roads')
  }

  start(): void {
    if (this.started) throw new Error('already started')
    this.started = true
    this.turnGreen(0)
  }

  /** Advance simulated time; setInterval(() => ctl.tick(1), 1000) drives it in production. */
  tick(dt: number): void {
    if (!this.started) throw new Error('call start() first')
    while (dt > 0) {
      const step = Math.min(dt, this.remaining)
      this.remaining -= step
      dt -= step
      if (this.remaining <= 0) this.onExpire()
    }
  }

  requestPedestrian(idx: number): void {
    const r = this.roads[idx]
    if (this.hold && this.active === idx) this.remaining += r.config.pedestrianExtension
    else r.pedestrianRequested = true
  }

  emergencyOverride(idx: number): void {
    this.mode = 'EMERGENCY'
    this.emergency = idx
    const cur = this.roads[this.active]
    if (this.hold) {
      this.hold = false
      this.turnGreen(idx)
    } else if (cur.light.color === 'GREEN') {
      if (this.active === idx) this.remaining = Infinity
      else { cur.light.advance(); this.remaining = cur.light.duration() } // GREEN -> YELLOW first
    }
  }

  clearEmergency(): void {
    const was = this.emergency
    this.mode = 'NORMAL'
    this.emergency = null
    const cur = this.roads[this.active]
    if (was !== null && this.active === was && cur.light.color === 'GREEN') {
      cur.light.advance()
      this.remaining = cur.light.duration()
    }
  }

  private turnGreen(idx: number): void {
    this.active = idx
    const l = this.roads[idx].light
    l.advance() // RED -> GREEN
    this.remaining = this.mode === 'EMERGENCY' && this.emergency === idx ? Infinity : l.duration()
  }

  private onExpire(): void {
    if (this.hold) { this.hold = false; this.turnGreen(this.active); return }
    const l = this.roads[this.active].light
    l.advance() // GREEN->YELLOW or YELLOW->RED
    if (l.color === 'RED') this.nextRoad()
    else this.remaining = l.duration()
  }

  private nextRoad(): void {
    const target = this.mode === 'EMERGENCY' && this.emergency !== null
      ? this.emergency
      : (this.active + 1) % this.roads.length
    this.active = target
    const r = this.roads[target]
    if (r.pedestrianRequested && this.mode === 'NORMAL') {
      r.pedestrianRequested = false
      this.hold = true
      this.remaining = r.config.pedestrianExtension
    } else this.turnGreen(target)
  }

  snapshot(): Record<string, LightColor> {
    return Object.fromEntries(this.roads.map(r => [r.name, r.light.color]))
  }

  isSafe(): boolean {
    return this.roads.filter(r => r.light.color !== 'RED').length <= 1
  }
}
`

const cpp = `#include <algorithm>
#include <iostream>
#include <limits>
#include <map>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

constexpr double INF = std::numeric_limits<double>::infinity();

enum class LightColor { Red, Yellow, Green };
enum class Mode { Normal, Emergency };

struct SignalConfig {
  double green = 30, yellow = 5, pedestrianExtension = 10;
  SignalConfig() = default;
  SignalConfig(double g, double y, double p) : green(g), yellow(y), pedestrianExtension(p) {
    if (g <= 0 || y <= 0 || p < 0) throw std::invalid_argument("durations must be positive");
  }
};

// State pattern: every colour knows its successor and its duration.
class LightState {
public:
  virtual ~LightState() = default;
  virtual LightColor color() const = 0;
  virtual const LightState* next() const = 0;
  virtual double duration(const SignalConfig& cfg) const = 0;
};

class RedState : public LightState {
public:
  LightColor color() const override { return LightColor::Red; }
  const LightState* next() const override;
  double duration(const SignalConfig&) const override { return INF; }  // until the controller's turn
};
class GreenState : public LightState {
public:
  LightColor color() const override { return LightColor::Green; }
  const LightState* next() const override;
  double duration(const SignalConfig& c) const override { return c.green; }
};
class YellowState : public LightState {
public:
  LightColor color() const override { return LightColor::Yellow; }
  const LightState* next() const override;
  double duration(const SignalConfig& c) const override { return c.yellow; }
};

inline const RedState RED_STATE{};
inline const GreenState GREEN_STATE{};
inline const YellowState YELLOW_STATE{};
inline const LightState* RedState::next() const { return &GREEN_STATE; }
inline const LightState* GreenState::next() const { return &YELLOW_STATE; }
inline const LightState* YellowState::next() const { return &RED_STATE; }

class TrafficLight {
  const LightState* state_ = &RED_STATE;
  SignalConfig config_;
public:
  explicit TrafficLight(SignalConfig c) : config_(c) {}
  LightColor color() const { return state_->color(); }
  void advance() { state_ = state_->next(); }
  double duration() const { return state_->duration(config_); }
};

struct Road {
  std::string name;
  SignalConfig config;
  TrafficLight light;
  bool pedestrianRequested = false;
  explicit Road(std::string n, SignalConfig c = SignalConfig()) : name(std::move(n)), config(c), light(c) {}
};

// Round-robin controller. A single 'active' index guarantees mutually exclusive greens.
class TrafficController {
  std::vector<Road> roads_;
  int active_ = 0;
  double remaining_ = 0;
  bool hold_ = false;                 // all-red pedestrian clearance before roads_[active_] goes green
  Mode mode_ = Mode::Normal;
  int emergency_ = -1;
  bool started_ = false;

  void turnGreen(int idx) {
    active_ = idx;
    TrafficLight& l = roads_[idx].light;
    l.advance();                      // RED -> GREEN
    remaining_ = (mode_ == Mode::Emergency && emergency_ == idx) ? INF : l.duration();
  }
  void onExpire() {
    if (hold_) { hold_ = false; turnGreen(active_); return; }
    TrafficLight& l = roads_[active_].light;
    l.advance();                      // GREEN->YELLOW or YELLOW->RED
    if (l.color() == LightColor::Red) nextRoad(); else remaining_ = l.duration();
  }
  void nextRoad() {
    int target = (mode_ == Mode::Emergency && emergency_ >= 0) ? emergency_
               : (active_ + 1) % static_cast<int>(roads_.size());
    active_ = target;
    Road& r = roads_[target];
    if (r.pedestrianRequested && mode_ == Mode::Normal) {
      r.pedestrianRequested = false;
      hold_ = true;
      remaining_ = r.config.pedestrianExtension;
    } else turnGreen(target);
  }
public:
  explicit TrafficController(std::vector<Road> roads) : roads_(std::move(roads)) {
    if (roads_.size() < 2) throw std::invalid_argument("need at least two roads");
  }

  void start() {
    if (started_) throw std::logic_error("already started");
    started_ = true;
    turnGreen(0);
  }

  // Advance simulated time; a timer thread would call tick(1.0) every second.
  void tick(double dt) {
    if (!started_) throw std::logic_error("call start() first");
    while (dt > 0) {
      double step = std::min(dt, remaining_);
      remaining_ -= step;
      dt -= step;
      if (remaining_ <= 0) onExpire();
    }
  }

  void requestPedestrian(int idx) {
    Road& r = roads_.at(idx);
    if (hold_ && active_ == idx) remaining_ += r.config.pedestrianExtension;
    else r.pedestrianRequested = true;
  }

  void emergencyOverride(int idx) {
    mode_ = Mode::Emergency; emergency_ = idx;
    Road& cur = roads_[active_];
    if (hold_) { hold_ = false; turnGreen(idx); }
    else if (cur.light.color() == LightColor::Green) {
      if (active_ == idx) remaining_ = INF;
      else { cur.light.advance(); remaining_ = cur.light.duration(); }   // GREEN -> YELLOW first
    }
  }

  void clearEmergency() {
    int was = emergency_;
    mode_ = Mode::Normal; emergency_ = -1;
    Road& cur = roads_[active_];
    if (was >= 0 && active_ == was && cur.light.color() == LightColor::Green) {
      cur.light.advance();
      remaining_ = cur.light.duration();
    }
  }

  std::map<std::string, LightColor> snapshot() const {
    std::map<std::string, LightColor> m;
    for (auto& r : roads_) m[r.name] = r.light.color();
    return m;
  }

  bool isSafe() const {
    return std::count_if(roads_.begin(), roads_.end(),
                         [](const Road& r) { return r.light.color() != LightColor::Red; }) <= 1;
  }
};

static const char* name(LightColor c) {
  return c == LightColor::Red ? "RED" : c == LightColor::Yellow ? "YELLOW" : "GREEN";
}

int main() {
  TrafficController ctl({Road("North"), Road("East"), Road("South"), Road("West")});
  ctl.start();
  ctl.tick(30);
  ctl.requestPedestrian(2);
  ctl.tick(40);
  for (auto& [n, c] : ctl.snapshot()) std::cout << n << "=" << name(c) << " ";
  ctl.emergencyOverride(3);
  ctl.tick(10);
  std::cout << "\\nafter emergency: ";
  for (auto& [n, c] : ctl.snapshot()) std::cout << n << "=" << name(c) << " ";
  std::cout << "safe=" << ctl.isSafe() << std::endl;
}
`

const goCode = `package main

import (
  "errors"
  "fmt"
  "math"
)

type LightColor int

const (
  Red LightColor = iota
  Yellow
  Green
)

func (c LightColor) String() string { return [...]string{"RED", "YELLOW", "GREEN"}[c] }

type Mode int

const (
  Normal Mode = iota
  Emergency
)

type SignalConfig struct {
  Green, Yellow, PedestrianExtension float64
}

func NewSignalConfig(g, y, p float64) (SignalConfig, error) {
  if g <= 0 || y <= 0 || p < 0 {
    return SignalConfig{}, errors.New("durations must be positive")
  }
  return SignalConfig{g, y, p}, nil
}

func DefaultConfig() SignalConfig { return SignalConfig{30, 5, 10} }

// LightState is the State pattern: each colour knows its successor and duration.
type LightState interface {
  Color() LightColor
  Next() LightState
  Duration(cfg SignalConfig) float64
}

type redState struct{}
type greenState struct{}
type yellowState struct{}

var (
  stRed    LightState = redState{}
  stGreen  LightState = greenState{}
  stYellow LightState = yellowState{}
)

func (redState) Color() LightColor                  { return Red }
func (redState) Next() LightState                   { return stGreen }
func (redState) Duration(SignalConfig) float64      { return math.Inf(1) } // until the controller's turn
func (greenState) Color() LightColor                { return Green }
func (greenState) Next() LightState                 { return stYellow }
func (greenState) Duration(c SignalConfig) float64  { return c.Green }
func (yellowState) Color() LightColor               { return Yellow }
func (yellowState) Next() LightState                { return stRed }
func (yellowState) Duration(c SignalConfig) float64 { return c.Yellow }

type TrafficLight struct {
  state  LightState
  config SignalConfig
}

func NewTrafficLight(c SignalConfig) *TrafficLight { return &TrafficLight{state: stRed, config: c} }
func (t *TrafficLight) Color() LightColor           { return t.state.Color() }
func (t *TrafficLight) Advance()                    { t.state = t.state.Next() }
func (t *TrafficLight) Duration() float64           { return t.state.Duration(t.config) }

type Road struct {
  Name                string
  Config              SignalConfig
  Light               *TrafficLight
  PedestrianRequested bool
}

func NewRoad(name string) *Road {
  c := DefaultConfig()
  return &Road{Name: name, Config: c, Light: NewTrafficLight(c)}
}

// TrafficController is round-robin; one 'active' index guarantees mutually exclusive greens.
type TrafficController struct {
  roads     []*Road
  active    int
  remaining float64
  hold      bool // all-red pedestrian clearance before roads[active] goes green
  mode      Mode
  emergency int // -1 = none
  started   bool
}

func NewController(roads []*Road) (*TrafficController, error) {
  if len(roads) < 2 {
    return nil, errors.New("need at least two roads")
  }
  return &TrafficController{roads: roads, emergency: -1}, nil
}

func (c *TrafficController) Start() error {
  if c.started {
    return errors.New("already started")
  }
  c.started = true
  c.turnGreen(0)
  return nil
}

// Tick advances simulated time; a time.Ticker goroutine would call Tick(1) every second.
func (c *TrafficController) Tick(dt float64) error {
  if !c.started {
    return errors.New("call Start() first")
  }
  for dt > 0 {
    step := math.Min(dt, c.remaining)
    c.remaining -= step
    dt -= step
    if c.remaining <= 0 {
      c.onExpire()
    }
  }
  return nil
}

func (c *TrafficController) RequestPedestrian(idx int) {
  r := c.roads[idx]
  if c.hold && c.active == idx {
    c.remaining += r.Config.PedestrianExtension
  } else {
    r.PedestrianRequested = true
  }
}

func (c *TrafficController) EmergencyOverride(idx int) {
  c.mode, c.emergency = Emergency, idx
  cur := c.roads[c.active]
  switch {
  case c.hold:
    c.hold = false
    c.turnGreen(idx)
  case cur.Light.Color() == Green && c.active == idx:
    c.remaining = math.Inf(1)
  case cur.Light.Color() == Green:
    cur.Light.Advance() // GREEN -> YELLOW first
    c.remaining = cur.Light.Duration()
  }
}

func (c *TrafficController) ClearEmergency() {
  was := c.emergency
  c.mode, c.emergency = Normal, -1
  cur := c.roads[c.active]
  if was >= 0 && c.active == was && cur.Light.Color() == Green {
    cur.Light.Advance()
    c.remaining = cur.Light.Duration()
  }
}

func (c *TrafficController) turnGreen(idx int) {
  c.active = idx
  l := c.roads[idx].Light
  l.Advance() // RED -> GREEN
  if c.mode == Emergency && c.emergency == idx {
    c.remaining = math.Inf(1)
  } else {
    c.remaining = l.Duration()
  }
}

func (c *TrafficController) onExpire() {
  if c.hold {
    c.hold = false
    c.turnGreen(c.active)
    return
  }
  l := c.roads[c.active].Light
  l.Advance() // GREEN->YELLOW or YELLOW->RED
  if l.Color() == Red {
    c.nextRoad()
  } else {
    c.remaining = l.Duration()
  }
}

func (c *TrafficController) nextRoad() {
  target := (c.active + 1) % len(c.roads)
  if c.mode == Emergency && c.emergency >= 0 {
    target = c.emergency
  }
  c.active = target
  r := c.roads[target]
  if r.PedestrianRequested && c.mode == Normal {
    r.PedestrianRequested = false
    c.hold = true
    c.remaining = r.Config.PedestrianExtension
  } else {
    c.turnGreen(target)
  }
}

func (c *TrafficController) Snapshot() map[string]LightColor {
  m := map[string]LightColor{}
  for _, r := range c.roads {
    m[r.Name] = r.Light.Color()
  }
  return m
}

func (c *TrafficController) IsSafe() bool {
  n := 0
  for _, r := range c.roads {
    if r.Light.Color() != Red {
      n++
    }
  }
  return n <= 1
}

func main() {
  ctl, _ := NewController([]*Road{NewRoad("North"), NewRoad("East"), NewRoad("South"), NewRoad("West")})
  _ = ctl.Start()
  _ = ctl.Tick(30)
  ctl.RequestPedestrian(2)
  _ = ctl.Tick(40)
  fmt.Println(ctl.Snapshot())
  ctl.EmergencyOverride(3)
  _ = ctl.Tick(10)
  fmt.Println(ctl.Snapshot(), "safe =", ctl.IsSafe())
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

public enum LightColor { Red, Yellow, Green }
public enum Mode { Normal, Emergency }

public sealed class SignalConfig {
  public double Green { get; }
  public double Yellow { get; }
  public double PedestrianExtension { get; }  // extra all-red time before this road turns green

  public SignalConfig(double green = 30, double yellow = 5, double pedestrianExtension = 10) {
    if (green <= 0 || yellow <= 0 || pedestrianExtension < 0)
      throw new ArgumentException("durations must be positive");
    Green = green; Yellow = yellow; PedestrianExtension = pedestrianExtension;
  }
}

/// <summary>State pattern: every colour knows its successor and its duration.</summary>
public abstract class LightState {
  public static readonly LightState Red = new RedState();
  public static readonly LightState Green = new GreenState();
  public static readonly LightState Yellow = new YellowState();

  public abstract LightColor Color { get; }
  public abstract LightState Next();
  public abstract double Duration(SignalConfig cfg);

  sealed class RedState : LightState {
    public override LightColor Color => LightColor.Red;
    public override LightState Next() => Green;
    public override double Duration(SignalConfig cfg) => double.PositiveInfinity; // until the controller's turn
  }
  sealed class GreenState : LightState {
    public override LightColor Color => LightColor.Green;
    public override LightState Next() => Yellow;
    public override double Duration(SignalConfig cfg) => cfg.Green;
  }
  sealed class YellowState : LightState {
    public override LightColor Color => LightColor.Yellow;
    public override LightState Next() => Red;
    public override double Duration(SignalConfig cfg) => cfg.Yellow;
  }
}

public sealed class TrafficLight {
  LightState _state = LightState.Red;
  readonly SignalConfig _config;
  public TrafficLight(SignalConfig config) { _config = config; }
  public LightColor Color => _state.Color;
  public void Advance() => _state = _state.Next();
  public double Duration() => _state.Duration(_config);
}

public sealed class Road {
  public string Name { get; }
  public SignalConfig Config { get; }
  public TrafficLight Light { get; }
  public bool PedestrianRequested { get; set; }
  public Road(string name, SignalConfig? config = null) {
    Name = name; Config = config ?? new SignalConfig(); Light = new TrafficLight(Config);
  }
}

/// <summary>Round-robin controller. A single 'active' index guarantees mutually exclusive greens.</summary>
public sealed class TrafficController {
  readonly IReadOnlyList<Road> _roads;
  int _active;
  double _remaining;
  bool _hold;                    // all-red pedestrian clearance before _roads[_active] goes green
  Mode _mode = Mode.Normal;
  int? _emergency;
  bool _started;

  public TrafficController(IReadOnlyList<Road> roads) {
    if (roads.Count < 2) throw new ArgumentException("need at least two roads");
    _roads = roads;
  }

  public void Start() {
    if (_started) throw new InvalidOperationException("already started");
    _started = true;
    TurnGreen(0);
  }

  /// <summary>Advance simulated time; a System.Threading.Timer would call Tick(1) every second.</summary>
  public void Tick(double dt) {
    if (!_started) throw new InvalidOperationException("call Start() first");
    while (dt > 0) {
      double step = Math.Min(dt, _remaining);
      _remaining -= step;
      dt -= step;
      if (_remaining <= 0) OnExpire();
    }
  }

  public void RequestPedestrian(int idx) {
    var r = _roads[idx];
    if (_hold && _active == idx) _remaining += r.Config.PedestrianExtension;
    else r.PedestrianRequested = true;
  }

  public void EmergencyOverride(int idx) {
    _mode = Mode.Emergency; _emergency = idx;
    var cur = _roads[_active];
    if (_hold) { _hold = false; TurnGreen(idx); }
    else if (cur.Light.Color == LightColor.Green) {
      if (_active == idx) _remaining = double.PositiveInfinity;
      else { cur.Light.Advance(); _remaining = cur.Light.Duration(); }   // GREEN -> YELLOW first
    }
  }

  public void ClearEmergency() {
    var was = _emergency;
    _mode = Mode.Normal; _emergency = null;
    var cur = _roads[_active];
    if (was is not null && _active == was && cur.Light.Color == LightColor.Green) {
      cur.Light.Advance();
      _remaining = cur.Light.Duration();
    }
  }

  void TurnGreen(int idx) {
    _active = idx;
    var l = _roads[idx].Light;
    l.Advance();                // RED -> GREEN
    _remaining = _mode == Mode.Emergency && _emergency == idx ? double.PositiveInfinity : l.Duration();
  }

  void OnExpire() {
    if (_hold) { _hold = false; TurnGreen(_active); return; }
    var l = _roads[_active].Light;
    l.Advance();                // GREEN->YELLOW or YELLOW->RED
    if (l.Color == LightColor.Red) NextRoad(); else _remaining = l.Duration();
  }

  void NextRoad() {
    int target = _mode == Mode.Emergency && _emergency is int e ? e : (_active + 1) % _roads.Count;
    _active = target;
    var r = _roads[target];
    if (r.PedestrianRequested && _mode == Mode.Normal) {
      r.PedestrianRequested = false;
      _hold = true;
      _remaining = r.Config.PedestrianExtension;
    } else TurnGreen(target);
  }

  public Dictionary<string, LightColor> Snapshot() => _roads.ToDictionary(r => r.Name, r => r.Light.Color);
  public bool IsSafe() => _roads.Count(r => r.Light.Color != LightColor.Red) <= 1;
}

public static class Program {
  public static void Main() {
    var ctl = new TrafficController(new[] { new Road("North"), new Road("East"), new Road("South"), new Road("West") });
    ctl.Start();
    ctl.Tick(30);
    ctl.RequestPedestrian(2);
    ctl.Tick(40);
    Console.WriteLine(string.Join(", ", ctl.Snapshot().Select(kv => kv.Key + "=" + kv.Value)));
    ctl.EmergencyOverride(3);
    ctl.Tick(10);
    Console.WriteLine(string.Join(", ", ctl.Snapshot().Select(kv => kv.Key + "=" + kv.Value)) + " safe=" + ctl.IsSafe());
  }
}
`

export const trafficLightSystemSolution: ProblemSolution = {
  slug: 'traffic-light-system',
  title: 'Traffic Light System - Solution',
  overview: {
    introduction:
      'Design the control software for a multi-road intersection. Each road has a light that cycles Red → Green → Yellow → Red, with configurable durations, a guarantee that conflicting roads are never green together, a round-robin schedule, an emergency-vehicle override, and pedestrian requests that extend the red phase. The interview is about modelling the state machine cleanly and centralising the safety invariant.',
    constraints: [
      'Each light cycles Red → Green → Yellow → Red; durations (green, yellow) are configurable per road.',
      'At most one road may be non-red at any time (mutually exclusive greens).',
      'Roads are served in round-robin order.',
      'An emergency override must preempt the normal cycle safely (via yellow) and hold green until cleared.',
      'A pedestrian request extends the red phase for that road so people can cross; the cycle then resumes.',
      'Transitions are time-driven; the design must be testable without real sleeping.',
    ],
    assumptions: [
      'One intersection with N ≥ 2 roads; each road is one conflicting “phase” (compatible phases such as N+S together are an extension).',
      'Time is injected by calling tick(dt) - a scheduler thread calls tick(1) in production.',
      'Pedestrian clearance is an all-red interval inserted immediately before the requesting road’s next green.',
      'Emergency vehicles request override for a specific road; cancellation is explicit via clearEmergency().',
    ],
    clarificationQuestions: [
      'Can non-conflicting directions (North + South) be green together, or is it strictly one road at a time?',
      'Is there an all-red interval between yellow and the next green?',
      'How does the emergency override interact with an in-progress yellow?',
      'Do pedestrian requests extend the current red or insert a dedicated walk phase?',
      'Are sensors (vehicle detection) or adaptive timing in scope?',
    ],
  },
  interviewApproach: {
    howToThink:
      'There are two state machines. The light-level one (Red→Green→Yellow) is a textbook State pattern. The intersection-level one (who has the turn, is an emergency in force, are we in pedestrian clearance) belongs to a controller. Put the safety invariant in exactly one place - the controller’s single “active road” pointer - instead of letting lights coordinate with each other.',
    breakdown: [
      'Model LightColor and a State pattern: Red, Green, Yellow each define next() and duration().',
      'Wrap state in TrafficLight; wrap a light + config in Road.',
      'Build TrafficController with a single active index, remaining time, and tick(dt).',
      'On phase expiry: advance the active light; when it turns red, choose the next road (round-robin or emergency).',
      'Add pedestrian requests as a flag consumed at the road’s next turn (all-red hold for extension seconds).',
      'Add emergency mode: yellow-out the active road, then hold the emergency road green until cleared.',
    ],
    entities: [
      { name: 'TrafficController', responsibility: 'Owns the schedule, enforces exclusive greens, handles pedestrian and emergency requests.' },
      { name: 'Road', responsibility: 'One approach: name, light, config, and a pending pedestrian flag.' },
      { name: 'TrafficLight', responsibility: 'Holds the current LightState and advances it; exposes color and duration.' },
      { name: 'LightState (Red/Green/Yellow)', responsibility: 'State pattern: successor and duration for each colour.' },
      { name: 'SignalConfig', responsibility: 'Configurable green, yellow, and pedestrian extension durations.' },
      { name: 'Mode / LightColor', responsibility: 'Small enums for controller mode and externally visible colours.' },
    ],
    relationships: [
      'TrafficController composes its Roads; each Road composes one TrafficLight.',
      'TrafficLight aggregates the current LightState and shares the road’s SignalConfig.',
      'RedState, GreenState, YellowState inherit from LightState.',
      'TrafficController reads LightColor via lights for snapshots and the safety check.',
    ],
    patternsAndOop: [
      'State: LightState subclasses remove colour switches from TrafficLight.',
      'Mediator-style controller: lights never talk to each other; the controller coordinates them.',
      'Strategy-ready scheduling: round-robin lives in nextRoad() and can be swapped for adaptive scheduling.',
      'Dependency injection of time via tick(dt) keeps the domain deterministic and testable.',
    ],
    stepByStep: [
      'Clarify conflicting phases, all-red intervals, and emergency semantics.',
      'Sketch the Red→Green→Yellow state diagram and the State pattern classes.',
      'Introduce the controller with an active pointer and remaining time.',
      'Walk through expiry handling for green, yellow, and pedestrian hold.',
      'Add emergency override and prove the safety invariant (≤1 non-red).',
      'Discuss timers, concurrency, and scaling to many intersections.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'Light colour transitions are encapsulated in a State hierarchy; coordination between roads is encapsulated in one controller. Because only the controller changes lights and only one road is ever active, mutually exclusive greens hold by construction rather than by checking.',
    classResponsibilities: [
      { name: 'TrafficController', responsibility: 'tick(), round-robin selection, pedestrian hold, emergency override, snapshot/isSafe.' },
      { name: 'Road', responsibility: 'Associates a light with its timing configuration and pedestrian request flag.' },
      { name: 'TrafficLight', responsibility: 'Delegates next/duration to its current LightState.' },
      { name: 'LightState subclasses', responsibility: 'Red (waits for turn), Green (config.green), Yellow (config.yellow).' },
      { name: 'SignalConfig', responsibility: 'Validates and stores durations; per-road so busy roads can get longer greens.' },
    ],
    interfacesAndAbstractions: [
      'LightState: abstraction for colour behaviour; new states (flashing red, left-turn arrow) are new subclasses.',
      'Controller scheduling could be extracted to a SchedulingPolicy interface for adaptive cycles.',
    ],
    relationships: [
      'Composition Controller→Road→Light matches ownership and lifetimes.',
      'Aggregation Light→State: states are shared singletons, not owned.',
      'Association Controller→Mode: a small state enum drives emergency vs normal flow.',
    ],
    solid: [
      'SRP: states define colour behaviour; controller defines intersection behaviour.',
      'OCP: add a new LightState or scheduling policy without touching existing states.',
      'LSP: any LightState can replace another inside TrafficLight.',
      'ISP: LightState exposes just color, next, and duration.',
      'DIP: TrafficLight depends on the LightState abstraction rather than on colour enums with switches.',
    ],
    patterns: [
      { name: 'State', why: 'Each colour owns its successor and duration; no giant switch.' },
      { name: 'Mediator', why: 'The controller is the only coordinator, so lights stay decoupled and the invariant lives in one place.' },
      { name: 'Singleton (flyweight) states', why: 'LightState instances carry no data and can be shared.' },
    ],
    decisions: [
      {
        decision: 'A single active-road pointer in the controller.',
        rationale: 'Exclusive greens are enforced structurally: only one road is ever advanced out of RED.',
        tradeoff: 'Non-conflicting phases (N+S) require generalising “active road” to “active phase”.',
      },
      {
        decision: 'Time driven by tick(dt) instead of sleeping/threads.',
        rationale: 'Deterministic tests and trivial integration with any scheduler.',
        tradeoff: 'Callers must tick regularly; use a monotonic clock for drift-free elapsed time.',
      },
      {
        decision: 'Emergency override goes GREEN → YELLOW → RED before switching.',
        rationale: 'Drivers still get a yellow warning; no instant red/green flip that could cause collisions.',
        tradeoff: 'Adds up to yellow seconds of delay for the ambulance - configurable.',
      },
      {
        decision: 'Pedestrian requests are consumed as an all-red hold at the road’s next turn.',
        rationale: 'Extends that road’s red without disturbing active traffic and keeps the model simple.',
        tradeoff: 'Pedestrians may wait up to a full cycle; a “walk now” variant needs an extra phase.',
      },
    ],
    extensibility:
      'Add adaptive timing by replacing the round-robin choice with a policy that inspects queue sizes, add compatible phases by turning “road” into “phase” (a set of non-conflicting roads), add flashing-red night mode as another LightState, and add fault tolerance by monitoring isSafe() and dropping to flashing red.',
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
      'start() turns road 0 green: its light advances RED→GREEN and remaining = config.green.',
      'tick(dt) consumes remaining time; when it hits 0 the active light advances (GREEN→YELLOW, then YELLOW→RED).',
      'When the active light becomes RED, nextRoad() picks the next road in round-robin order (or the emergency road).',
      'If the chosen road has a pending pedestrian request, the controller holds all-red for pedestrianExtension seconds, then turns it green.',
      'emergencyOverride(i) forces the active green to yellow (or holds green if it is road i) and keeps road i green until clearEmergency().',
    ],
    examples: [
      {
        title: 'Normal round-robin',
        input: 'start(), tick(30), tick(5), tick(30)',
        output: 'North: green→yellow→red; East: green',
        explanation: 'North expires at 30s (yellow), at 35s it turns red and East becomes the active green with its own 30 seconds.',
      },
      {
        title: 'Pedestrian extends red',
        input: 'requestPedestrian(South) while North is green; East later finishes',
        output: 'All lights RED for 10s, then South green',
        explanation: 'When South’s turn arrives its pedestrian flag is set, so the controller inserts a 10 second all-red hold before South goes green.',
      },
      {
        title: 'Ambulance on West',
        input: 'East is green; emergencyOverride(West)',
        output: 'East→yellow→red, West green until cleared',
        explanation: 'East finishes safely via yellow; the next road chosen is West, whose green is held indefinitely. clearEmergency() sends West through yellow and resumes round-robin.',
      },
    ],
  },
  followUps: [
    {
      question: 'How do you guarantee two conflicting roads are never green at once?',
      answer:
        'Only the controller advances lights and it holds a single active index. A road leaves RED only through turnGreen(), and the previous road must already be RED. isSafe() (≤1 non-red) doubles as a runtime assertion and test oracle.',
    },
    {
      question: 'How would you support compatible movements (N and S together)?',
      answer:
        'Replace Road with Phase containing multiple roads/lights that are mutually compatible. The controller rotates phases; lights inside a phase advance together. Conflicts are defined between phases.',
    },
    {
      question: 'How do you run this with real timers?',
      answer:
        'Wrap the controller with a scheduler (ScheduledExecutorService, setInterval, time.Ticker) that calls tick(1) per second - or compute dt from a monotonic clock to avoid drift. Synchronise access if requests arrive on other threads.',
    },
    {
      question: 'How do you make this thread-safe?',
      answer:
        'Serialise all mutations through one lock or a single-threaded event loop/actor. tick, pedestrian requests, and emergency overrides all mutate controller state, so they must not interleave.',
    },
    {
      question: 'How would you add adaptive timing from vehicle sensors?',
      answer:
        'Introduce a SchedulingPolicy interface (nextRoad and greenDuration). The default is round-robin; an adaptive policy reads queue lengths from a SensorService. The controller just asks the policy.',
    },
    {
      question: 'What happens if the controller crashes or the state becomes inconsistent?',
      answer:
        'Add a watchdog that verifies isSafe() and falls back to flashing red/all-red. Persist minimal state (active, remaining, mode) so a restart resumes safely with an all-red interval.',
    },
  ],
  extras: {
    edgeCases: [
      'Emergency override while yellow is already counting down.',
      'Emergency requested for the road that is currently green (just hold it).',
      'Emergency requested during pedestrian clearance (all red already - switch immediately).',
      'Clearing an emergency when the emergency road is not active.',
      'Multiple pedestrian requests for the same road before its turn (single flag, idempotent).',
      'Very large dt in a single tick must process several transitions in order.',
    ],
    commonMistakes: [
      'Letting each light run its own timer and trying to synchronise them.',
      'Switching a green directly to red on emergency (skipping yellow).',
      'Using sleep() in the domain model, making tests slow and flaky.',
      'Representing colour changes with nested if/else instead of State.',
      'Forgetting that infinite red duration is controller-driven, not state-driven.',
    ],
    complexity:
      'Each tick processes O(k) transitions for k expirations; every transition is O(1) (roads accessed by index). isSafe/snapshot are O(N) for N roads. Memory is O(N).',
    testing: [
      'Round-robin order and durations across multiple cycles using fake time.',
      'Invariant test: after every tick isSafe() is true.',
      'Pedestrian request while green, red, and during hold.',
      'Emergency from each possible active phase (green, yellow, hold) and clear.',
      'Config validation: non-positive durations rejected.',
    ],
    extensions: [
      'Phases with compatible roads, left-turn arrows, and flashing night mode.',
      'Adaptive scheduling from sensors; coordinated corridors (green wave).',
      'Remote monitoring/metrics and fail-safe fallback to flashing red.',
      'City-wide manager coordinating many controllers.',
    ],
    takeaways: [
      'Two state machines: light colours (State) and intersection flow (controller).',
      'Enforce the safety invariant structurally in one place.',
      'Inject time with tick(dt) for deterministic tests.',
      'Emergency and pedestrian handling are mode/flag changes, not new classes everywhere.',
    ],
  },
}
