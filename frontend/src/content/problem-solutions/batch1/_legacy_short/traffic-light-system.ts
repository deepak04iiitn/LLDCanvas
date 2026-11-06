import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('is', 'Intersection', 40, 40, [
    attr('-', 'roads', 'List<Road>'),
    attr('-', 'controller', 'TrafficController'),
  ], [
    method('+', 'tick', 'elapsedMs', 'void'),
    method('+', 'pedestrianRequest', 'roadId', 'void'),
    method('+', 'emergencyOverride', 'roadId', 'void'),
  ]),
  cls('tc', 'TrafficController', 360, 40, [
    attr('-', 'activeRoadIndex', 'int'),
    attr('-', 'phase', 'SignalPhase'),
    attr('-', 'timerMs', 'int'),
    attr('-', 'savedState', 'Snapshot?'),
  ], [
    method('+', 'nextPhase', '', 'void'),
    method('+', 'applyConflictRules', '', 'void'),
    method('+', 'restoreAfterEmergency', '', 'void'),
  ]),
  cls('rd', 'Road', 680, 40, [
    attr('-', 'id', 'string'),
    attr('-', 'light', 'TrafficLight'),
  ], []),
  cls('tl', 'TrafficLight', 360, 200, [
    attr('-', 'signal', 'Signal'),
    attr('-', 'greenMs', 'int'),
    attr('-', 'yellowMs', 'int'),
    attr('-', 'redMs', 'int'),
  ], [
    method('+', 'transition', '', 'void'),
  ]),
  enm('sg', 'Signal', 680, 200, ['RED', 'YELLOW', 'GREEN']),
  enm('ph', 'SignalPhase', 40, 200, ['NORMAL', 'EMERGENCY', 'PEDESTRIAN_HOLD']),
  cls('tm', 'Timer', 680, 320, [
    attr('-', 'remainingMs', 'int'),
  ], [
    method('+', 'advance', 'deltaMs', 'bool'),
  ]),
]

const edges = [
  edge('e1', 'is', 'tc', 'composition', 'right', 'left'),
  edge('e2', 'is', 'rd', 'composition', 'right@70', 'left'),
  edge('e3', 'rd', 'tl', 'composition', 'bottom', 'top'),
  edge('e4', 'tl', 'sg', 'dependency', 'right', 'left'),
  edge('e5', 'tc', 'ph', 'dependency', 'left', 'right'),
  edge('e6', 'tc', 'tm', 'aggregation', 'bottom', 'top'),
]

const py = `from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import List, Optional


class Signal(Enum):
    RED = auto()
    YELLOW = auto()
    GREEN = auto()


class SignalPhase(Enum):
    NORMAL = auto()
    EMERGENCY = auto()
    PEDESTRIAN_HOLD = auto()


@dataclass
class TrafficLight:
    green_ms: int = 30000
    yellow_ms: int = 5000
    red_ms: int = 30000
    signal: Signal = Signal.RED
    _elapsed: int = 0

    def reset_timer(self) -> None:
        self._elapsed = 0

    def transition_if_due(self, delta_ms: int) -> bool:
        self._elapsed += delta_ms
        limit = self._duration()
        if self._elapsed < limit:
            return False
        self._elapsed = 0
        if self.signal == Signal.GREEN:
            self.signal = Signal.YELLOW
        elif self.signal == Signal.YELLOW:
            self.signal = Signal.RED
        else:
            self.signal = Signal.GREEN
        return True

    def _duration(self) -> int:
        if self.signal == Signal.GREEN:
            return self.green_ms
        if self.signal == Signal.YELLOW:
            return self.yellow_ms
        return self.red_ms

    def force(self, signal: Signal) -> None:
        self.signal = signal
        self.reset_timer()


@dataclass
class Road:
    id: str
    light: TrafficLight


@dataclass
class ControllerSnapshot:
    active_index: int
    signals: List[Signal]


class TrafficController:
    def __init__(self, roads: List[Road]):
        if not roads:
            raise ValueError("need roads")
        self.roads = roads
        self.active_index = 0
        self.phase = SignalPhase.NORMAL
        self._snapshot: Optional[ControllerSnapshot] = None
        self._apply_exclusive_green(self.active_index)

    def _apply_exclusive_green(self, index: int) -> None:
        for i, road in enumerate(self.roads):
            if i == index:
                road.light.force(Signal.GREEN)
            else:
                road.light.force(Signal.RED)

    def tick(self, delta_ms: int) -> None:
        if self.phase == SignalPhase.EMERGENCY:
            return
        active = self.roads[self.active_index].light
        if active.transition_if_due(delta_ms):
            if active.signal == Signal.RED:
                self.active_index = (self.active_index + 1) % len(self.roads)
                self._apply_exclusive_green(self.active_index)

    def pedestrian_request(self, road_id: str) -> None:
        idx = next(i for i, r in enumerate(self.roads) if r.id == road_id)
        self.phase = SignalPhase.PEDESTRIAN_HOLD
        for i, road in enumerate(self.roads):
            road.light.force(Signal.RED if i == idx else Signal.RED)
        self.roads[idx].light.force(Signal.RED)
        self.phase = SignalPhase.NORMAL

    def emergency_override(self, road_id: str) -> None:
        idx = next(i for i, r in enumerate(self.roads) if r.id == road_id)
        if self.phase != SignalPhase.EMERGENCY:
            self._snapshot = ControllerSnapshot(
                self.active_index, [r.light.signal for r in self.roads]
            )
        self.phase = SignalPhase.EMERGENCY
        for i, road in enumerate(self.roads):
            road.light.force(Signal.GREEN if i == idx else Signal.RED)

    def restore_after_emergency(self) -> None:
        if not self._snapshot:
            return
        self.active_index = self._snapshot.active_index
        for road, sig in zip(self.roads, self._snapshot.signals):
            road.light.force(sig)
        self._snapshot = None
        self.phase = SignalPhase.NORMAL


@dataclass
class Intersection:
    roads: List[Road]
    controller: TrafficController = field(init=False)

    def __post_init__(self) -> None:
        self.controller = TrafficController(self.roads)

    def tick(self, elapsed_ms: int) -> None:
        self.controller.tick(elapsed_ms)

    def emergency_override(self, road_id: str) -> None:
        self.controller.emergency_override(road_id)

    def clear_emergency(self) -> None:
        self.controller.restore_after_emergency()
`

const java = `enum Signal { RED, YELLOW, GREEN }
enum SignalPhase { NORMAL, EMERGENCY, PEDESTRIAN_HOLD }

class TrafficLight {
  int greenMs=30000, yellowMs=5000, redMs=30000;
  Signal signal = Signal.RED;
  int elapsed;
  boolean transitionIfDue(int delta) {
    elapsed += delta;
    int limit = signal==Signal.GREEN? greenMs : signal==Signal.YELLOW? yellowMs : redMs;
    if (elapsed < limit) return false;
    elapsed=0;
    signal = signal==Signal.GREEN? Signal.YELLOW : signal==Signal.YELLOW? Signal.RED : Signal.GREEN;
    return true;
  }
  void force(Signal s){ signal=s; elapsed=0; }
}

class Road { final String id; final TrafficLight light = new TrafficLight(); Road(String id){ this.id=id; } }

class TrafficController {
  final java.util.List<Road> roads;
  int activeIndex;
  SignalPhase phase = SignalPhase.NORMAL;
  TrafficController(java.util.List<Road> roads){ this.roads=roads; applyExclusive(activeIndex=0); }
  void applyExclusive(int idx){
    for (int i=0;i<roads.size();i++) roads.get(i).light.force(i==idx? Signal.GREEN: Signal.RED);
  }
  void tick(int delta){
    if (phase==SignalPhase.EMERGENCY) return;
    if (roads.get(activeIndex).light.transitionIfDue(delta) && roads.get(activeIndex).light.signal==Signal.RED){
      activeIndex=(activeIndex+1)%roads.size(); applyExclusive(activeIndex);
    }
  }
  void emergencyOverride(String roadId){
    int idx=0; phase=SignalPhase.EMERGENCY;
    for (int i=0;i<roads.size();i++) roads.get(i).light.force(i==idx? Signal.GREEN: Signal.RED);
  }
}

class Intersection {
  final java.util.List<Road> roads;
  final TrafficController controller;
  Intersection(java.util.List<Road> r){ roads=r; controller=new TrafficController(r); }
  void tick(int ms){ controller.tick(ms); }
}
`

const ts = `enum Signal { Red, Yellow, Green }
enum SignalPhase { Normal, Emergency, PedestrianHold }

class TrafficLight {
  signal = Signal.Red
  elapsed = 0
  constructor(public greenMs = 30000, public yellowMs = 5000, public redMs = 30000) {}
  force(s: Signal) { this.signal = s; this.elapsed = 0 }
  transitionIfDue(delta: number) {
    this.elapsed += delta
    const limit = this.signal === Signal.Green ? this.greenMs : this.signal === Signal.Yellow ? this.yellowMs : this.redMs
    if (this.elapsed < limit) return false
    this.elapsed = 0
    this.signal = this.signal === Signal.Green ? Signal.Yellow : this.signal === Signal.Yellow ? Signal.Red : Signal.Green
    return true
  }
}

class Road { constructor(public readonly id: string, public readonly light = new TrafficLight()) {} }

class TrafficController {
  activeIndex = 0
  phase = SignalPhase.Normal
  constructor(public readonly roads: Road[]) { this.applyExclusive(0) }
  applyExclusive(idx: number) {
    this.roads.forEach((r, i) => r.light.force(i === idx ? Signal.Green : Signal.Red))
  }
  tick(delta: number) {
    if (this.phase === SignalPhase.Emergency) return
    const light = this.roads[this.activeIndex].light
    if (light.transitionIfDue(delta) && light.signal === Signal.Red) {
      this.activeIndex = (this.activeIndex + 1) % this.roads.length
      this.applyExclusive(this.activeIndex)
    }
  }
  emergencyOverride(roadId: string) {
    const idx = this.roads.findIndex(r => r.id === roadId)
    this.phase = SignalPhase.Emergency
    this.roads.forEach((r, i) => r.light.force(i === idx ? Signal.Green : Signal.Red))
  }
}

class Intersection {
  controller: TrafficController
  constructor(public readonly roads: Road[]) { this.controller = new TrafficController(roads) }
  tick(ms: number) { this.controller.tick(ms) }
}

export { Intersection, TrafficController, Signal }
`

const cpp = `#include <string>
#include <vector>

enum class Signal { Red, Yellow, Green };
enum class SignalPhase { Normal, Emergency };

struct TrafficLight {
  int greenMs{30000}, yellowMs{5000}, redMs{30000};
  Signal signal{Signal::Red};
  int elapsed{0};
  void force(Signal s){ signal=s; elapsed=0; }
  bool transitionIfDue(int delta){
    elapsed += delta;
    int limit = signal==Signal::Green? greenMs : signal==Signal::Yellow? yellowMs : redMs;
    if (elapsed < limit) return false;
    elapsed=0;
    signal = signal==Signal::Green? Signal::Yellow : signal==Signal::Yellow? Signal::Red : Signal::Green;
    return true;
  }
};

struct Road { std::string id; TrafficLight light; };

class TrafficController {
  std::vector<Road>& roads;
  int active{0};
  SignalPhase phase{SignalPhase::Normal};
public:
  explicit TrafficController(std::vector<Road>& r): roads(r) { applyExclusive(0); }
  void applyExclusive(int idx){
    for (size_t i=0;i<roads.size();++i)
      roads[i].light.force(i==idx? Signal::Green : Signal::Red);
  }
  void tick(int delta){
    if (phase==SignalPhase::Emergency) return;
    if (roads[active].light.transitionIfDue(delta) && roads[active].light.signal==Signal::Red){
      active = (active+1) % (int)roads.size();
      applyExclusive(active);
    }
  }
};
`

const goCode = `package traffic

type Signal int
type SignalPhase int

const (
	Red Signal = iota
	Yellow
	Green
)

const (
	PhaseNormal SignalPhase = iota
	PhaseEmergency
)

type TrafficLight struct {
	GreenMs, YellowMs, RedMs int
	Signal                   Signal
	elapsed                  int
}

func (t *TrafficLight) Force(s Signal) { t.Signal = s; t.elapsed = 0 }

func (t *TrafficLight) TransitionIfDue(delta int) bool {
	t.elapsed += delta
	limit := t.RedMs
	if t.Signal == Green {
		limit = t.GreenMs
	} else if t.Signal == Yellow {
		limit = t.YellowMs
	}
	if t.elapsed < limit {
		return false
	}
	t.elapsed = 0
	switch t.Signal {
	case Green:
		t.Signal = Yellow
	case Yellow:
		t.Signal = Red
	default:
		t.Signal = Green
	}
	return true
}

type Road struct {
	ID    string
	Light TrafficLight
}

type Controller struct {
	Roads       []Road
	ActiveIndex int
	Phase       SignalPhase
}

func (c *Controller) applyExclusive(idx int) {
	for i := range c.Roads {
		if i == idx {
			c.Roads[i].Light.Force(Green)
		} else {
			c.Roads[i].Light.Force(Red)
		}
	}
}

func (c *Controller) Tick(delta int) {
	if c.Phase == PhaseEmergency {
		return
	}
	if c.Roads[c.ActiveIndex].Light.TransitionIfDue(delta) && c.Roads[c.ActiveIndex].Light.Signal == Red {
		c.ActiveIndex = (c.ActiveIndex + 1) % len(c.Roads)
		c.applyExclusive(c.ActiveIndex)
	}
}

type Intersection struct {
	Roads      []Road
	Controller Controller
}

func NewIntersection(roads []Road) *Intersection {
	i := &Intersection{Roads: roads}
	i.Controller = Controller{Roads: roads}
	i.Controller.applyExclusive(0)
	return i
}
`

const csharp = `using System.Collections.Generic;

enum Signal { Red, Yellow, Green }
enum SignalPhase { Normal, Emergency, PedestrianHold }

class TrafficLight {
  public int GreenMs { get; set; } = 30000;
  public int YellowMs { get; set; } = 5000;
  public int RedMs { get; set; } = 30000;
  public Signal Signal { get; private set; } = Signal.Red;
  int _elapsed;
  public void Force(Signal s) { Signal = s; _elapsed = 0; }
  public bool TransitionIfDue(int delta) {
    _elapsed += delta;
    int limit = Signal switch { Signal.Green => GreenMs, Signal.Yellow => YellowMs, _ => RedMs };
    if (_elapsed < limit) return false;
    _elapsed = 0;
    Signal = Signal switch { Signal.Green => Signal.Yellow, Signal.Yellow => Signal.Red, _ => Signal.Green };
    return true;
  }
}

class Road { public string Id; public TrafficLight Light { get; } = new(); public Road(string id)=>Id=id; }

class TrafficController {
  public IList<Road> Roads { get; }
  public int ActiveIndex { get; private set; }
  public SignalPhase Phase { get; private set; } = SignalPhase.Normal;
  public TrafficController(IList<Road> roads) { Roads = roads; ApplyExclusive(ActiveIndex = 0); }
  void ApplyExclusive(int idx) {
    for (int i=0;i<Roads.Count;i++) Roads[i].Light.Force(i==idx? Signal.Green: Signal.Red);
  }
  public void Tick(int delta) {
    if (Phase==SignalPhase.Emergency) return;
    if (Roads[ActiveIndex].Light.TransitionIfDue(delta) && Roads[ActiveIndex].Light.Signal==Signal.Red) {
      ActiveIndex = (ActiveIndex+1) % Roads.Count; ApplyExclusive(ActiveIndex);
    }
  }
  public void EmergencyOverride(string roadId) {
    var idx = 0;
    Phase = SignalPhase.Emergency;
    for (int i=0;i<Roads.Count;i++) Roads[i].Light.Force(i==idx? Signal.Green: Signal.Red);
  }
}

class Intersection {
  public TrafficController Controller { get; }
  public Intersection(IList<Road> roads) => Controller = new TrafficController(roads);
  public void Tick(int ms) => Controller.Tick(ms);
}
`

export const trafficLightSystemSolution: ProblemSolution = {
  slug: 'traffic-light-system',
  title: 'Traffic Light System',
  overview: {
    introduction:
      'An Intersection owns Roads with TrafficLight state machines (GREEN→YELLOW→RED). TrafficController round-robins exclusive green phases, supports pedestrian hold and emergency override with snapshot restore.',
    constraints: ['Mutually exclusive green for conflicting roads', 'Atomic signal transitions'],
    assumptions: ['Simple 4-way modeled as N roads in ring', 'Pedestrian extends red on one approach'],
    clarificationQuestions: ['Left-turn phases?', 'Sensor-actuated vs fixed time?', 'Yellow trap handling?'],
  },
  interviewApproach: {
    howToThink: 'Each light is a small state machine; controller enforces global conflict rules and schedules.',
    breakdown: ['TrafficLight timers', 'Exclusive green', 'Round-robin', 'Emergency snapshot'],
    entities: [
      { name: 'TrafficController', responsibility: 'Global coordination and overrides.' },
      { name: 'TrafficLight', responsibility: 'Local cycle timing.' },
      { name: 'Intersection', responsibility: 'Public API tick/override.' },
    ],
    relationships: ['Road composes TrafficLight.', 'Intersection composes Controller.'],
    patternsAndOop: ['State machine per light', 'Memento-like snapshot for emergency'],
    stepByStep: ['Define Signal enum', 'transition_if_due', 'exclusive green helper', 'emergency + restore'],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary: 'Local timers + global exclusivity rule prevents conflicting greens. Emergency path forces all-red except corridor, then restores snapshot.',
    classResponsibilities: [
      { name: 'TrafficLight', responsibility: 'Cycle durations and transitions.' },
      { name: 'TrafficController', responsibility: 'Scheduler and override handling.' },
    ],
    interfacesAndAbstractions: ['Timer port for testable time advancement.'],
    relationships: ['One controller per intersection.'],
    solid: ['SRP: light does not pick next road', 'OCP: new phases via controller policies'],
    patterns: [{ name: 'State', why: 'GREEN/YELLOW/RED behavior.' }],
    decisions: [{ decision: 'Round-robin between roads', rationale: 'Matches hint; weighted plans for arterials.' }],
    extensibility: 'Conflict matrix for 8-road; actuated extensions via vehicle sensors.',
  },
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    steps: ['Controller sets one GREEN', 'tick advances elapsed', 'On cycle complete rotate index', 'Emergency forces corridor GREEN'],
    examples: [{ title: 'Green expires', input: 'tick 30000ms on green', output: 'YELLOW then timed RED', explanation: 'Local FSM before controller rotates.' }],
  },
  followUps: [
    { question: 'Conflicting roads not in simple ring?', answer: 'Conflict matrix: set of road pairs that cannot both be GREEN; solver picks next compatible phase.' },
    { question: '500ms override NFR?', answer: 'Emergency handler bypasses timer queue, force signals synchronously.' },
    { question: 'Pedestrian crossing?', answer: 'Extend all-red window on requested leg; resume prior phase index.' },
    { question: 'Yellow interval overlap?', answer: 'All-red clearance between conflicting greens; standard safety practice.' },
    { question: 'Hardware failure?', answer: 'Fail-safe to flashing red or all-red; watchdog timer.' },
    { question: 'Testing without real time?', answer: 'Inject fake Timer; assert signal sequence deterministically.' },
  ],
  extras: {
    edgeCases: ['Emergency during yellow', 'Zero-road intersection', 'Restore without snapshot'],
    commonMistakes: ['Two greens on', 'No all-red clearance', 'Controller in each light'],
    complexity: 'tick O(roads); rotate O(1).',
    testing: ['FSM transitions', 'Exclusive green invariant', 'Emergency restore'],
    extensions: ['Adaptive timing', 'Connected vehicle priority'],
    takeaways: ['Two-level: light FSM + controller', 'Exclusive green invariant', 'Snapshot emergency'],
  },
}
