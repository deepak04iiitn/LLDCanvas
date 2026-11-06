import type { ProblemSolution } from '../types'
import { attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('bld', 'Building', 40, 40, [
    attr('-', 'floors', 'int'),
    attr('-', 'elevators', 'List<Elevator>'),
    attr('-', 'controller', 'ElevatorController'),
  ], [
    method('+', 'requestPickup', 'floor, direction', 'void'),
  ]),
  cls('ctrl', 'ElevatorController', 360, 40, [
    attr('-', 'elevators', 'List<Elevator>'),
  ], [
    method('+', 'dispatch', 'floor, direction', 'Elevator'),
    method('+', 'score', 'elevator, floor, dir', 'int'),
  ]),
  cls('el', 'Elevator', 680, 40, [
    attr('-', 'id', 'int'),
    attr('-', 'currentFloor', 'int'),
    attr('-', 'direction', 'Direction'),
    attr('-', 'stops', 'Set<int>'),
    attr('-', 'state', 'ElevatorState'),
  ], [
    method('+', 'addStop', 'floor', 'void'),
    method('+', 'step', '', 'void'),
    method('+', 'openDoors', '', 'void'),
  ]),
  enm('dir', 'Direction', 360, 200, ['UP', 'DOWN', 'IDLE']),
  enm('es', 'ElevatorState', 680, 200, ['MOVING_UP', 'MOVING_DOWN', 'IDLE', 'MAINTENANCE']),
  cls('dr', 'Door', 40, 280, [
    attr('-', 'open', 'bool'),
  ], [
    method('+', 'open', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
]

const edges = [
  edge('e1', 'bld', 'ctrl', 'composition', 'right', 'left'),
  edge('e2', 'bld', 'el', 'composition', 'right@70', 'left'),
  edge('e3', 'ctrl', 'el', 'association', 'right', 'left', { label: 'dispatches' }),
  edge('e4', 'el', 'dir', 'dependency', 'bottom', 'top'),
  edge('e5', 'el', 'es', 'dependency', 'bottom@60', 'top'),
  edge('e6', 'el', 'dr', 'composition', 'left', 'right'),
]

const py = `from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import List, Set


class Direction(Enum):
    UP = auto()
    DOWN = auto()
    IDLE = auto()


class ElevatorState(Enum):
    MOVING_UP = auto()
    MOVING_DOWN = auto()
    IDLE = auto()
    MAINTENANCE = auto()


@dataclass
class Door:
    open: bool = False

    def open_door(self) -> None:
        self.open = True

    def close_door(self) -> None:
        self.open = False


@dataclass
class Elevator:
    id: int
    current_floor: int = 0
    direction: Direction = Direction.IDLE
    state: ElevatorState = ElevatorState.IDLE
    stops: Set[int] = field(default_factory=set)
    door: Door = field(default_factory=Door)

    def add_stop(self, floor: int) -> None:
        self.stops.add(floor)
        if floor > self.current_floor:
            self.direction = Direction.UP
            self.state = ElevatorState.MOVING_UP
        elif floor < self.current_floor:
            self.direction = Direction.DOWN
            self.state = ElevatorState.MOVING_DOWN

    def step(self) -> None:
        if not self.stops:
            self.direction = Direction.IDLE
            self.state = ElevatorState.IDLE
            return
        if self.direction == Direction.UP or (self.direction == Direction.IDLE and max(self.stops) > self.current_floor):
            self.direction = Direction.UP
            self.state = ElevatorState.MOVING_UP
            self.current_floor += 1
        else:
            self.direction = Direction.DOWN
            self.state = ElevatorState.MOVING_DOWN
            self.current_floor -= 1
        if self.current_floor in self.stops:
            self.stops.remove(self.current_floor)
            self.open_doors()
        self._maybe_reverse()

    def _maybe_reverse(self) -> None:
        if self.stops:
            return
        self.direction = Direction.IDLE
        self.state = ElevatorState.IDLE

    def open_doors(self) -> None:
        self.door.open_door()


class ElevatorController:
    def dispatch(self, elevators: List[Elevator], floor: int, direction: Direction) -> Elevator:
        best = min(elevators, key=lambda e: self.score(e, floor, direction))
        best.add_stop(floor)
        return best

    def score(self, e: Elevator, floor: int, direction: Direction) -> int:
        distance = abs(e.current_floor - floor)
        penalty = 0
        if e.direction == Direction.UP and floor < e.current_floor:
            penalty = 50
        if e.direction == Direction.DOWN and floor > e.current_floor:
            penalty = 50
        if e.state == ElevatorState.MAINTENANCE:
            penalty = 10_000
        return distance + penalty + len(e.stops) * 2


@dataclass
class Building:
    floors: int
    elevators: List[Elevator]
    controller: ElevatorController = field(default_factory=ElevatorController)

    def request_pickup(self, floor: int, direction: Direction) -> Elevator:
        return self.controller.dispatch(self.elevators, floor, direction)
`

const java = `enum Direction { UP, DOWN, IDLE }
enum ElevatorState { MOVING_UP, MOVING_DOWN, IDLE, MAINTENANCE }

class Door { boolean open; void openDoor(){ open=true; } void closeDoor(){ open=false; } }

class Elevator {
  final int id;
  int currentFloor;
  Direction direction = Direction.IDLE;
  ElevatorState state = ElevatorState.IDLE;
  java.util.Set<Integer> stops = new java.util.TreeSet<>();
  Door door = new Door();
  Elevator(int id) { this.id = id; }
  void addStop(int floor) {
    stops.add(floor);
    if (floor > currentFloor) { direction = Direction.UP; state = ElevatorState.MOVING_UP; }
    else if (floor < currentFloor) { direction = Direction.DOWN; state = ElevatorState.MOVING_DOWN; }
  }
  void step() {
    if (stops.isEmpty()) { direction = Direction.IDLE; state = ElevatorState.IDLE; return; }
    if (direction == Direction.UP) { currentFloor++; state = ElevatorState.MOVING_UP; }
    else { currentFloor--; state = ElevatorState.MOVING_DOWN; }
    if (stops.remove(currentFloor)) door.openDoor();
  }
}

class ElevatorController {
  int score(Elevator e, int floor, Direction dir) {
    int d = Math.abs(e.currentFloor - floor);
    int penalty = e.stops.size() * 2;
    if (e.state == ElevatorState.MAINTENANCE) penalty += 10_000;
    return d + penalty;
  }
  Elevator dispatch(java.util.List<Elevator> elevators, int floor, Direction dir) {
    Elevator best = elevators.get(0);
    int bestScore = score(best, floor, dir);
    for (Elevator e : elevators) {
      int s = score(e, floor, dir);
      if (s < bestScore) { best = e; bestScore = s; }
    }
    best.addStop(floor);
    return best;
  }
}

class Building {
  final int floors;
  final java.util.List<Elevator> elevators;
  final ElevatorController controller = new ElevatorController();
  Building(int floors, java.util.List<Elevator> elevators) { this.floors = floors; this.elevators = elevators; }
  Elevator requestPickup(int floor, Direction dir) { return controller.dispatch(elevators, floor, dir); }
}
`

const ts = `enum Direction { Up, Down, Idle }
enum ElevatorState { MovingUp, MovingDown, Idle, Maintenance }

class Door { open = false; openDoor() { this.open = true } }

class Elevator {
  direction = Direction.Idle
  state = ElevatorState.Idle
  stops = new Set<number>()
  door = new Door()
  constructor(public readonly id: number, public currentFloor = 0) {}
  addStop(floor: number) {
    this.stops.add(floor)
    if (floor > this.currentFloor) { this.direction = Direction.Up; this.state = ElevatorState.MovingUp }
    else if (floor < this.currentFloor) { this.direction = Direction.Down; this.state = ElevatorState.MovingDown }
  }
  step() {
    if (!this.stops.size) { this.direction = Direction.Idle; this.state = ElevatorState.Idle; return }
    if (this.direction === Direction.Up) { this.currentFloor++; this.state = ElevatorState.MovingUp }
    else { this.currentFloor--; this.state = ElevatorState.MovingDown }
    if (this.stops.has(this.currentFloor)) { this.stops.delete(this.currentFloor); this.door.openDoor() }
  }
}

class ElevatorController {
  score(e: Elevator, floor: number) {
    return Math.abs(e.currentFloor - floor) + e.stops.size * 2 + (e.state === ElevatorState.Maintenance ? 10000 : 0)
  }
  dispatch(elevators: Elevator[], floor: number) {
    const best = elevators.reduce((a, b) => this.score(a, floor) <= this.score(b, floor) ? a : b)
    best.addStop(floor)
    return best
  }
}

class Building {
  controller = new ElevatorController()
  constructor(public readonly floors: number, public readonly elevators: Elevator[]) {}
  requestPickup(floor: number) { return this.controller.dispatch(this.elevators, floor) }
}

export { Building, Elevator, Direction }
`

const cpp = `#include <algorithm>
#include <cmath>
#include <set>
#include <vector>

enum class Direction { Up, Down, Idle };
enum class ElevatorState { MovingUp, MovingDown, Idle, Maintenance };

struct Door { bool open{false}; void openDoor(){ open=true; } };

struct Elevator {
  int id, currentFloor{0};
  Direction direction{Direction::Idle};
  ElevatorState state{ElevatorState::Idle};
  std::set<int> stops;
  Door door;
  explicit Elevator(int id_) : id(id_) {}
  void addStop(int floor) {
    stops.insert(floor);
    if (floor > currentFloor) { direction = Direction::Up; state = ElevatorState::MovingUp; }
    else if (floor < currentFloor) { direction = Direction::Down; state = ElevatorState::MovingDown; }
  }
  void step() {
    if (stops.empty()) { direction = Direction::Idle; state = ElevatorState::Idle; return; }
    if (direction == Direction::Up) ++currentFloor; else --currentFloor;
    if (stops.erase(currentFloor)) door.openDoor();
  }
};

class ElevatorController {
public:
  int score(const Elevator& e, int floor) const {
    return std::abs(e.currentFloor - floor) + (int)e.stops.size() * 2 +
      (e.state == ElevatorState::Maintenance ? 10000 : 0);
  }
  Elevator& dispatch(std::vector<Elevator>& elevators, int floor) {
    auto it = std::min_element(elevators.begin(), elevators.end(), [&](const Elevator& a, const Elevator& b) {
      return score(a, floor) < score(b, floor);
    });
    it->addStop(floor);
    return *it;
  }
};

struct Building {
  int floors;
  std::vector<Elevator> elevators;
  ElevatorController controller;
  Elevator& requestPickup(int floor) { return controller.dispatch(elevators, floor); }
};
`

const goCode = `package elevator

import "math"

type Direction int
type ElevatorState int

const (
	DirUp Direction = iota
	DirDown
	DirIdle
)

const (
	StateMovingUp ElevatorState = iota
	StateMovingDown
	StateIdle
	StateMaintenance
)

type Door struct{ Open bool }

type Elevator struct {
	ID           int
	CurrentFloor int
	Direction    Direction
	State        ElevatorState
	Stops        map[int]struct{}
	Door         Door
}

func (e *Elevator) AddStop(floor int) {
	e.Stops[floor] = struct{}{}
	if floor > e.CurrentFloor {
		e.Direction = DirUp
		e.State = StateMovingUp
	} else if floor < e.CurrentFloor {
		e.Direction = DirDown
		e.State = StateMovingDown
	}
}

func (e *Elevator) Step() {
	if len(e.Stops) == 0 {
		e.Direction = DirIdle
		e.State = StateIdle
		return
	}
	if e.Direction == DirUp {
		e.CurrentFloor++
	} else {
		e.CurrentFloor--
	}
	if _, ok := e.Stops[e.CurrentFloor]; ok {
		delete(e.Stops, e.CurrentFloor)
		e.Door.Open = true
	}
}

type Controller struct{}

func (c Controller) Score(e Elevator, floor int) int {
	penalty := len(e.Stops) * 2
	if e.State == StateMaintenance {
		penalty += 10000
	}
	return int(math.Abs(float64(e.CurrentFloor-floor))) + penalty
}

func (c Controller) Dispatch(elevators []*Elevator, floor int) *Elevator {
	best := elevators[0]
	for _, el := range elevators[1:] {
		if c.Score(*el, floor) < c.Score(*best, floor) {
			best = el
		}
	}
	best.AddStop(floor)
	return best
}

type Building struct {
	Floors     int
	Elevators  []*Elevator
	Controller Controller
}

func (b *Building) RequestPickup(floor int) *Elevator {
	return b.Controller.Dispatch(b.Elevators, floor)
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

enum Direction { Up, Down, Idle }
enum ElevatorState { MovingUp, MovingDown, Idle, Maintenance }

class Door { public bool Open; public void OpenDoor() => Open = true; }

class Elevator {
  public int Id { get; }
  public int CurrentFloor { get; private set; }
  public Direction Direction { get; private set; } = Direction.Idle;
  public ElevatorState State { get; private set; } = ElevatorState.Idle;
  public SortedSet<int> Stops { get; } = new();
  public Door Door { get; } = new();
  public Elevator(int id) => Id = id;
  public void AddStop(int floor) {
    Stops.Add(floor);
    if (floor > CurrentFloor) { Direction = Direction.Up; State = ElevatorState.MovingUp; }
    else if (floor < CurrentFloor) { Direction = Direction.Down; State = ElevatorState.MovingDown; }
  }
  public void Step() {
    if (Stops.Count == 0) { Direction = Direction.Idle; State = ElevatorState.Idle; return; }
    CurrentFloor += Direction == Direction.Up ? 1 : -1;
    if (Stops.Remove(CurrentFloor)) Door.OpenDoor();
  }
}

class ElevatorController {
  public int Score(Elevator e, int floor) =>
    Math.Abs(e.CurrentFloor - floor) + e.Stops.Count * 2 + (e.State == ElevatorState.Maintenance ? 10000 : 0);
  public Elevator Dispatch(IList<Elevator> elevators, int floor) {
    var best = elevators.OrderBy(e => Score(e, floor)).First();
    best.AddStop(floor);
    return best;
  }
}

class Building {
  public int Floors { get; }
  public List<Elevator> Elevators { get; }
  public ElevatorController Controller { get; } = new();
  public Building(int floors, List<Elevator> elevators) { Floors = floors; Elevators = elevators; }
  public Elevator RequestPickup(int floor) => Controller.Dispatch(Elevators, floor);
}
`

export const elevatorSystemSolution: ProblemSolution = {
  slug: 'elevator-system',
  title: 'Elevator System',
  overview: {
    introduction:
      'A Building owns multiple Elevators and an ElevatorController. Pickup requests dispatch to the best car using distance, direction alignment, and pending stops. Each elevator runs SCAN-like movement: serve stops in the current direction, then reverse.',
    constraints: [
      'Only one direction sweep before reversing (SCAN behavior).',
      'Conflicting green paths are N/A; cars are independent but coordinated by controller.',
      'Maintenance cars are excluded from dispatch scoring.',
    ],
    assumptions: [
      'Floor requests are hall calls (up/down) simplified to target floor stops.',
      'One simulation tick moves at most one floor per step().',
      'Emergency stop halts movement and opens doors - extension hook.',
    ],
    clarificationQuestions: [
      'Are requests hall-only or include cabin buttons?',
      'Express elevators serving subset of floors?',
      'Weight capacity and skip stops?',
      'Destination dispatch vs traditional up/down?',
      'How is “optimal” defined - wait time or energy?',
    ],
  },
  interviewApproach: {
    howToThink: 'Split dispatch (which car?) from movement (how car visits stops). Controller scores cars; each Elevator owns a stop set and direction.',
    breakdown: [
      'Entities: Building, ElevatorController, Elevator, Door.',
      'Dispatch: minimize distance + direction penalty + load.',
      'Movement: step toward stops in current direction; reverse when empty ahead.',
      'Display: expose currentFloor + direction on each Elevator.',
    ],
    entities: [
      { name: 'ElevatorController', responsibility: 'Select elevator for pickup request.' },
      { name: 'Elevator', responsibility: 'SCAN stop processing and door control.' },
      { name: 'Building', responsibility: 'Façade for floor requests.' },
    ],
    relationships: ['Building composes elevators and controller.', 'Controller associates with all Elevators.'],
    patternsAndOop: ['State for ElevatorState.', 'Strategy-like scoring function for dispatch.'],
    stepByStep: [
      'Draw Building with N elevators.',
      'Implement addStop + step SCAN loop.',
      'Implement dispatch score.',
      'Discuss fault tolerance: mark MAINTENANCE, exclude from dispatch.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary: 'Controller answers “which elevator?” in O(n) over cars. Each elevator maintains its own stop set for SCAN. Separation keeps dispatch policy swappable.',
    classResponsibilities: [
      { name: 'ElevatorController', responsibility: 'Scoring and assignment.' },
      { name: 'Elevator', responsibility: 'Movement, stops, doors.' },
    ],
    interfacesAndAbstractions: ['Extract DispatchPolicy interface if scoring variants multiply.'],
    relationships: ['Building is root aggregate for simulation.'],
    solid: ['SRP: controller does not move elevators.', 'OCP: new score function without changing Elevator.step.'],
    patterns: [{ name: 'State', why: 'Elevator behavior varies by MOVING_UP/DOWN/IDLE.' }],
    decisions: [
      { decision: 'SCAN with stop set.', rationale: 'Matches FR “serve direction before reverse”; classic disk scheduling analogy.' },
      { decision: 'Simple score = distance + 2×stops.', rationale: 'Interview-friendly; tune weights for direction alignment.' },
    ],
    extensibility: 'Add DestinationDispatchController; energy-aware scoring; priority floors for fire service.',
  },
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    steps: [
      'User requests pickup at floor F.',
      'Controller picks elevator with lowest score, addStop(F).',
      'Simulation loop calls step() on each elevator each tick.',
      'On reaching F, doors open and stop removed.',
    ],
    examples: [
      {
        title: 'Dispatch nearest idle car',
        input: 'Elevator A at 3, B at 10; request floor 4',
        output: 'A assigned (distance 1 vs 6)',
        explanation: 'Lower score wins; A adds stop 4 and moves up.',
      },
    ],
  },
  followUps: [
    { question: 'SCAN vs LOOK?', answer: 'LOOK does not stop at last request if passing; SCAN may go to furthest stop. Mention both; pick one and stay consistent.' },
    { question: '50ms dispatch at 20 cars?', answer: 'O(20) scoring is trivial; optimize stop storage with bitsets per floor.' },
    { question: 'Elevator failure?', answer: 'State MAINTENANCE + high penalty; redistribute stops manually or via controller migration.' },
    { question: 'Peak lunch rush?', answer: 'Banked elevators, weighted scoring toward idle cars near lobby.' },
    { question: 'Thread safety?', answer: 'Controller synchronized; each elevator serializes stop set mutations.' },
    { question: 'How to test?', answer: 'Simulate ticks with deterministic requests; assert visit order matches SCAN.' },
  ],
  extras: {
    edgeCases: ['Request while car passing floor in opposite direction', 'Duplicate stops', 'Maintenance mid-route'],
    commonMistakes: ['Reversing after every floor', 'Global stop list shared by all cars', 'No direction in score'],
    complexity: 'Dispatch O(E); step O(1) per tick per elevator.',
    testing: ['SCAN order tests', 'Dispatch tie-break', 'Maintenance exclusion'],
    extensions: ['Double-deck elevators', 'Sky lobby', 'Predictive dispatch ML'],
    takeaways: ['Dispatch ≠ movement', 'SCAN is the standard interview answer', 'Score function is easy to tune'],
  },
}
