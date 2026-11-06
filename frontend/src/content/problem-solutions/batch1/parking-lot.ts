import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, enm, iface, method, resetUmlIds } from '../uml'

/* ────────────────────────────────────────────────────────────────────────────
 * UML - one coherent design:
 *   Vehicle is a single concrete class carrying a VehicleType enum.
 *   Motorcycle / Car / Bus differ only in DATA (which slots fit, which rate),
 *   so we model them as an enum + lookup rules instead of three empty subclasses.
 *
 * Grid layout (col,row):
 *   row 0:  .            Receipt       .            SlotType
 *   row 1:  FeeCalculator ParkingLot   Floor        ParkingSlot
 *   row 2:  HourlyFee     .            .            Ticket
 *   row 3:  .             .            VehicleType  Vehicle
 * ──────────────────────────────────────────────────────────────────────────── */

resetUmlIds()

const nodes = [
  cls('rc', 'Receipt', GRID.x(1), GRID.y(0), [
    attr('-', 'ticketId', 'String'),
    attr('-', 'licensePlate', 'String'),
    attr('-', 'durationMinutes', 'long'),
    attr('-', 'amount', 'decimal'),
  ], []),
  enm('st', 'SlotType', GRID.x(3), GRID.y(0), ['MOTORCYCLE', 'COMPACT', 'LARGE']),

  iface('fc', 'FeeCalculator', GRID.x(0), GRID.y(1), [
    method('+', 'calculate', 'ticket: Ticket, exitTime: DateTime', 'decimal'),
  ]),
  cls('pl', 'ParkingLot', GRID.x(1), GRID.y(1), [
    attr('-', 'floors', 'List<Floor>'),
    attr('-', 'feeCalculator', 'FeeCalculator'),
    attr('-', 'activeTickets', 'Map<String, Ticket>'),
    attr('-', 'lock', 'Lock'),
  ], [
    method('+', 'parkVehicle', 'vehicle: Vehicle', 'Ticket'),
    method('+', 'exitVehicle', 'ticketId: String', 'Receipt'),
    method('+', 'availability', '', 'Map<int, Map<SlotType, int>>'),
  ]),
  cls('fl', 'Floor', GRID.x(2), GRID.y(1), [
    attr('-', 'number', 'int'),
    attr('-', 'slots', 'List<ParkingSlot>'),
  ], [
    method('+', 'findNearestFreeSlot', 'vehicle: Vehicle', 'ParkingSlot?'),
    method('+', 'freeCounts', '', 'Map<SlotType, int>'),
  ]),
  cls('ps', 'ParkingSlot', GRID.x(3), GRID.y(1), [
    attr('-', 'id', 'String'),
    attr('-', 'floorNumber', 'int'),
    attr('-', 'type', 'SlotType'),
    attr('-', 'occupied', 'bool'),
  ], [
    method('+', 'canFit', 'vehicle: Vehicle', 'bool'),
    method('+', 'occupy', '', 'void'),
    method('+', 'release', '', 'void'),
  ]),

  cls('hfc', 'HourlyFeeCalculator', GRID.x(0), GRID.y(2), [
    attr('-', 'hourlyRates', 'Map<VehicleType, decimal>'),
  ], [
    method('+', 'calculate', 'ticket: Ticket, exitTime: DateTime', 'decimal'),
  ]),
  cls('tk', 'Ticket', GRID.x(3), GRID.y(2), [
    attr('-', 'id', 'String'),
    attr('-', 'vehicle', 'Vehicle'),
    attr('-', 'slot', 'ParkingSlot'),
    attr('-', 'entryTime', 'DateTime'),
  ], [
    method('+', 'minutesParked', 'exitTime: DateTime', 'long'),
  ]),

  enm('vt', 'VehicleType', GRID.x(2), GRID.y(3), ['MOTORCYCLE', 'CAR', 'BUS']),
  cls('vh', 'Vehicle', GRID.x(3), GRID.y(3), [
    attr('-', 'licensePlate', 'String'),
    attr('-', 'type', 'VehicleType'),
  ], []),
]

const edges = [
  edge('e1', 'pl', 'fl', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1..*', label: 'floors' }),
  edge('e2', 'fl', 'ps', 'composition', 'right', 'left', { sourceMultiplicity: '1', targetMultiplicity: '1..*', label: 'slots' }),
  edge('e3', 'ps', 'st', 'association', 'top', 'bottom', { label: 'typed as' }),
  edge('e4', 'pl', 'fc', 'aggregation', 'left', 'right', { sourceMultiplicity: '1', targetMultiplicity: '1', label: 'prices with' }),
  edge('e5', 'hfc', 'fc', 'realization', 'top', 'bottom'),
  edge('e6', 'pl', 'rc', 'dependency', 'top', 'bottom', { label: 'creates' }),
  edge('e7', 'pl', 'tk', 'association', 'bottom', 'left', { sourceMultiplicity: '1', targetMultiplicity: '0..*', label: 'tracks active' }),
  edge('e8', 'tk', 'ps', 'association', 'top', 'bottom', { sourceMultiplicity: '0..1', targetMultiplicity: '1', label: 'occupies' }),
  edge('e9', 'tk', 'vh', 'association', 'bottom', 'top', { sourceMultiplicity: '0..1', targetMultiplicity: '1', label: 'issued for' }),
  edge('e10', 'vh', 'vt', 'association', 'left', 'right', { label: 'is a' }),
]

/* ────────────────────────────── PYTHON ────────────────────────────── */

const py = `from __future__ import annotations

import math
import threading
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Dict, List, Optional, Set


class VehicleType(Enum):
    MOTORCYCLE = "MOTORCYCLE"
    CAR = "CAR"
    BUS = "BUS"


class SlotType(Enum):
    MOTORCYCLE = "MOTORCYCLE"
    COMPACT = "COMPACT"
    LARGE = "LARGE"


# Which slot sizes may host which vehicle. One table = one place to change.
COMPATIBLE_SLOTS: Dict[VehicleType, Set[SlotType]] = {
    VehicleType.MOTORCYCLE: {SlotType.MOTORCYCLE, SlotType.COMPACT, SlotType.LARGE},
    VehicleType.CAR: {SlotType.COMPACT, SlotType.LARGE},
    VehicleType.BUS: {SlotType.LARGE},
}


@dataclass(frozen=True)

class Vehicle:
    license_plate: str
    type: VehicleType

    def __post_init__(self) -> None:
        if not self.license_plate or not self.license_plate.strip():
            raise ValueError("license plate is required")


class ParkingSlot:
    """A single physical bay. It knows its size and whether it is taken - nothing else."""

    def __init__(self, slot_id: str, floor_number: int, slot_type: SlotType) -> None:
        self.id = slot_id
        self.floor_number = floor_number
        self.type = slot_type
        self._occupied = False

    @property
    def occupied(self) -> bool:
        return self._occupied

    def can_fit(self, vehicle: Vehicle) -> bool:
        return (not self._occupied) and self.type in COMPATIBLE_SLOTS[vehicle.type]

    def occupy(self) -> None:
        if self._occupied:
            raise RuntimeError(f"slot {self.id} is already occupied")
        self._occupied = True

    def release(self) -> None:
        if not self._occupied:
            raise RuntimeError(f"slot {self.id} is already free")
        self._occupied = False


@dataclass(frozen=True)

class Ticket:
    id: str
    vehicle: Vehicle
    slot: ParkingSlot
    entry_time: datetime

    def minutes_parked(self, exit_time: datetime) -> int:
        if exit_time < self.entry_time:
            raise ValueError("exit time is before entry time")
        return int((exit_time - self.entry_time).total_seconds() // 60)


@dataclass(frozen=True)

class Receipt:
    ticket_id: str
    license_plate: str
    duration_minutes: int
    amount: float


class FeeCalculator(ABC):
    @abstractmethod
    def calculate(self, ticket: Ticket, exit_time: datetime) -> float:
        ...


class HourlyFeeCalculator(FeeCalculator):
    """Charges per started hour, minimum one hour, rate depends on vehicle type."""

    def __init__(self, hourly_rates: Dict[VehicleType, float]) -> None:
        missing = set(VehicleType) - set(hourly_rates)
        if missing:
            raise ValueError(f"missing hourly rate for: {sorted(m.name for m in missing)}")
        self._hourly_rates = dict(hourly_rates)

    def calculate(self, ticket: Ticket, exit_time: datetime) -> float:
        minutes = ticket.minutes_parked(exit_time)
        billable_hours = max(1, math.ceil(minutes / 60))
        return billable_hours * self._hourly_rates[ticket.vehicle.type]


class Floor:
    def __init__(self, number: int, slots: List[ParkingSlot]) -> None:
        self.number = number
        self._slots = list(slots)  # ordered by distance from the entrance

    def find_nearest_free_slot(self, vehicle: Vehicle) -> Optional[ParkingSlot]:
        for slot in self._slots:
            if slot.can_fit(vehicle):
                return slot
        return None

    def free_counts(self) -> Dict[SlotType, int]:
        counts = {slot_type: 0 for slot_type in SlotType}
        for slot in self._slots:
            if not slot.occupied:
                counts[slot.type] += 1
        return counts


class ParkingLot:
    """Facade: the only class the entry/exit gates talk to. All mutations hold one lock."""

    def __init__(self, floors: List[Floor], fee_calculator: FeeCalculator) -> None:
        if not floors:
            raise ValueError("a parking lot needs at least one floor")
        self._floors = sorted(floors, key=lambda f: f.number)  # floor 1 is nearest
        self._fee_calculator = fee_calculator
        self._active_tickets: Dict[str, Ticket] = {}
        self._parked_plates: Set[str] = set()
        self._next_ticket_number = 1
        self._lock = threading.Lock()

    def park_vehicle(self, vehicle: Vehicle, entry_time: Optional[datetime] = None) -> Ticket:
        entry_time = entry_time or datetime.now(timezone.utc)
        with self._lock:
            if vehicle.license_plate in self._parked_plates:
                raise ValueError(f"vehicle {vehicle.license_plate} is already parked")
            for floor in self._floors:
                slot = floor.find_nearest_free_slot(vehicle)
                if slot is None:
                    continue
                slot.occupy()
                ticket = Ticket(f"T-{self._next_ticket_number:06d}", vehicle, slot, entry_time)
                self._next_ticket_number += 1
                self._active_tickets[ticket.id] = ticket
                self._parked_plates.add(vehicle.license_plate)
                return ticket
            raise RuntimeError(f"no free slot for a {vehicle.type.name}")

    def exit_vehicle(self, ticket_id: str, exit_time: Optional[datetime] = None) -> Receipt:
        exit_time = exit_time or datetime.now(timezone.utc)
        with self._lock:
            ticket = self._active_tickets.get(ticket_id)
            if ticket is None:
                raise KeyError(f"unknown or already used ticket: {ticket_id}")
            # Compute first: if pricing fails we have not mutated anything yet.
            minutes = ticket.minutes_parked(exit_time)
            amount = self._fee_calculator.calculate(ticket, exit_time)
            ticket.slot.release()
            del self._active_tickets[ticket_id]
            self._parked_plates.discard(ticket.vehicle.license_plate)
            return Receipt(ticket.id, ticket.vehicle.license_plate, minutes, amount)

    def availability(self) -> Dict[int, Dict[SlotType, int]]:
        with self._lock:
            return {floor.number: floor.free_counts() for floor in self._floors}


def print_availability(lot: ParkingLot) -> None:
    for floor_number, counts in lot.availability().items():
        summary = ", ".join(f"{t.name}={n}" for t, n in counts.items())
        print(f"  floor {floor_number}: {summary}")


def build_demo_lot() -> ParkingLot:
    floors = [
        Floor(1, [
            ParkingSlot("F1-M1", 1, SlotType.MOTORCYCLE),
            ParkingSlot("F1-C1", 1, SlotType.COMPACT),
            ParkingSlot("F1-L1", 1, SlotType.LARGE),
        ]),
        Floor(2, [
            ParkingSlot("F2-C1", 2, SlotType.COMPACT),
            ParkingSlot("F2-L1", 2, SlotType.LARGE),
        ]),
    ]
    rates = {
        VehicleType.MOTORCYCLE: 10.0,
        VehicleType.CAR: 20.0,
        VehicleType.BUS: 50.0,
    }
    return ParkingLot(floors, HourlyFeeCalculator(rates))


def main() -> None:
    lot = build_demo_lot()
    nine_am = datetime(2026, 1, 5, 9, 0, tzinfo=timezone.utc)

    def at(minutes: int) -> datetime:
        return nine_am + timedelta(minutes=minutes)

    arrivals = [
        Vehicle("KA-01-M-1111", VehicleType.MOTORCYCLE),
        Vehicle("KA-01-C-2222", VehicleType.CAR),
        Vehicle("KA-01-B-3333", VehicleType.BUS),
        Vehicle("KA-01-C-4444", VehicleType.CAR),
    ]
    tickets = [lot.park_vehicle(v, nine_am) for v in arrivals]
    for t in tickets:
        print(f"{t.vehicle.license_plate} -> {t.id} slot {t.slot.id} (floor {t.slot.floor_number})")

    print("Availability after four arrivals:")
    print_availability(lot)

    car_ticket = tickets[1]
    receipt = lot.exit_vehicle(car_ticket.id, at(65))
    print(
        f"Receipt: {receipt.license_plate} stayed {receipt.duration_minutes} min, "
        f"pays {receipt.amount}"
    )

    again = lot.park_vehicle(Vehicle("KA-01-C-5555", VehicleType.CAR), at(70))
    print(f"Freed slot is reused: {again.slot.id}")

    lot.park_vehicle(Vehicle("KA-01-B-6666", VehicleType.BUS), at(75))
    try:
        lot.park_vehicle(Vehicle("KA-01-B-7777", VehicleType.BUS), at(80))
    except RuntimeError as err:
        print("Expected failure:", err)

    try:
        lot.exit_vehicle(car_ticket.id)
    except KeyError as err:
        print("Expected failure:", err)


if __name__ == "__main__":
    main()
`

/* ────────────────────────────── JAVA ────────────────────────────── */

const java = `import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.locks.ReentrantLock;

enum VehicleType { MOTORCYCLE, CAR, BUS }

enum SlotType { MOTORCYCLE, COMPACT, LARGE }

record Vehicle(String licensePlate, VehicleType type) {
    Vehicle {
        if (licensePlate == null || licensePlate.isBlank()) {
            throw new IllegalArgumentException("license plate is required");
        }
        Objects.requireNonNull(type, "vehicle type is required");
    }
}

/** A single physical bay. It knows its size and whether it is taken - nothing else. */

class ParkingSlot {
    private final String id;
    private final int floorNumber;
    private final SlotType type;
    private boolean occupied;

    ParkingSlot(String id, int floorNumber, SlotType type) {
        this.id = id;
        this.floorNumber = floorNumber;
        this.type = type;
    }

    String id() {
      return id;
    }

    int floorNumber() {
      return floorNumber;
    }

    SlotType type() {
      return type;
    }

    boolean isOccupied() {
      return occupied;
    }

    boolean canFit(Vehicle vehicle) {
        if (occupied) {
          return false;
        }

        return switch (vehicle.type()) {
            case MOTORCYCLE -> true;                        // fits anywhere
            case CAR -> type != SlotType.MOTORCYCLE;        // compact or large
            case BUS -> type == SlotType.LARGE;             // large only
        };
    }

    void occupy() {
        if (occupied) {
          throw new IllegalStateException("slot " + id + " is already occupied");
        }
        occupied = true;
    }

    void release() {
        if (!occupied) {
          throw new IllegalStateException("slot " + id + " is already free");
        }
        occupied = false;
    }
}

record Ticket(String id, Vehicle vehicle, ParkingSlot slot, Instant entryTime) {
    long minutesParked(Instant exitTime) {
        if (exitTime.isBefore(entryTime)) {
            throw new IllegalArgumentException("exit time is before entry time");
        }
        return Duration.between(entryTime, exitTime).toMinutes();
    }
}

record Receipt(String ticketId, String licensePlate, long durationMinutes, double amount) {}

interface FeeCalculator {
    double calculate(Ticket ticket, Instant exitTime);
}

/** Charges per started hour, minimum one hour, rate depends on vehicle type. */

class HourlyFeeCalculator implements FeeCalculator {
    private final Map<VehicleType, Double> hourlyRates;

    HourlyFeeCalculator(Map<VehicleType, Double> hourlyRates) {
        for (VehicleType type : VehicleType.values()) {
            if (!hourlyRates.containsKey(type)) {
                throw new IllegalArgumentException("missing hourly rate for " + type);
            }
        }
        this.hourlyRates = new EnumMap<>(hourlyRates);
    }

    @Override
    public double calculate(Ticket ticket, Instant exitTime) {
        long minutes = ticket.minutesParked(exitTime);
        long billableHours = Math.max(1, (minutes + 59) / 60);
        return billableHours * hourlyRates.get(ticket.vehicle().type());
    }
}

class Floor {
    private final int number;
    private final List<ParkingSlot> slots; // ordered by distance from the entrance

    Floor(int number, List<ParkingSlot> slots) {
        this.number = number;
        this.slots = List.copyOf(slots);
    }

    int number() {
      return number;
    }

    Optional<ParkingSlot> findNearestFreeSlot(Vehicle vehicle) {
        for (ParkingSlot slot : slots) {
            if (slot.canFit(vehicle)) {
              return Optional.of(slot);
            }
        }
        return Optional.empty();
    }

    Map<SlotType, Integer> freeCounts() {
        Map<SlotType, Integer> counts = new EnumMap<>(SlotType.class);
        for (SlotType type : SlotType.values()) {
          counts.put(type, 0);
        }
        for (ParkingSlot slot : slots) {
            if (!slot.isOccupied()) {
              counts.merge(slot.type(), 1, Integer::sum);
            }
        }
        return counts;
    }
}

/** Facade: the only class the entry/exit gates talk to. All mutations hold one lock. */

class ParkingLot {
    private final List<Floor> floors;
    private final FeeCalculator feeCalculator;
    private final Map<String, Ticket> activeTickets = new HashMap<>();
    private final Set<String> parkedPlates = new HashSet<>();
    private final ReentrantLock lock = new ReentrantLock();
    private int nextTicketNumber = 1;

    ParkingLot(List<Floor> floors, FeeCalculator feeCalculator) {
        if (floors == null || floors.isEmpty()) {
            throw new IllegalArgumentException("a parking lot needs at least one floor");
        }
        this.floors = floors.stream().sorted(Comparator.comparingInt(Floor::number)).toList();
        this.feeCalculator = Objects.requireNonNull(feeCalculator);
    }

    Ticket parkVehicle(Vehicle vehicle) {
        return parkVehicle(vehicle, Instant.now());
    }

    Ticket parkVehicle(Vehicle vehicle, Instant entryTime) {
        lock.lock();
        try {
            if (parkedPlates.contains(vehicle.licensePlate())) {
                throw new IllegalStateException("vehicle " + vehicle.licensePlate() + " is already parked");
            }
            for (Floor floor : floors) {
                Optional<ParkingSlot> found = floor.findNearestFreeSlot(vehicle);
                if (found.isEmpty()) {
                  continue;
                }
                ParkingSlot slot = found.get();
                slot.occupy();
                String id = String.format("T-%06d", nextTicketNumber++);
                Ticket ticket = new Ticket(id, vehicle, slot, entryTime);
                activeTickets.put(id, ticket);
                parkedPlates.add(vehicle.licensePlate());
                return ticket;
            }

            throw new IllegalStateException("no free slot for a " + vehicle.type());
        } finally {
            lock.unlock();
        }
    }

    Receipt exitVehicle(String ticketId) {
        return exitVehicle(ticketId, Instant.now());
    }

    Receipt exitVehicle(String ticketId, Instant exitTime) {
        lock.lock();
        try {
            Ticket ticket = activeTickets.get(ticketId);
            if (ticket == null) {
                throw new NoSuchElementException("unknown or already used ticket: " + ticketId);
            }
            // Compute first: if pricing fails we have not mutated anything yet.
            long minutes = ticket.minutesParked(exitTime);
            double amount = feeCalculator.calculate(ticket, exitTime);
            ticket.slot().release();
            activeTickets.remove(ticketId);
            parkedPlates.remove(ticket.vehicle().licensePlate());
            return new Receipt(ticket.id(), ticket.vehicle().licensePlate(), minutes, amount);
        } finally {
            lock.unlock();
        }
    }

    Map<Integer, Map<SlotType, Integer>> availability() {
        lock.lock();
        try {
            Map<Integer, Map<SlotType, Integer>> result = new LinkedHashMap<>();
            for (Floor floor : floors) {
              result.put(floor.number(), floor.freeCounts());
            }
            return result;
        } finally {
            lock.unlock();
        }
    }
}

public class ParkingLotDemo {
    public static void main(String[] args) {
        List<Floor> floors = List.of(
            new Floor(1, List.of(
                new ParkingSlot("F1-M1", 1, SlotType.MOTORCYCLE),
                new ParkingSlot("F1-C1", 1, SlotType.COMPACT),
                new ParkingSlot("F1-L1", 1, SlotType.LARGE))),
            new Floor(2, List.of(
                new ParkingSlot("F2-C1", 2, SlotType.COMPACT),
                new ParkingSlot("F2-L1", 2, SlotType.LARGE))));

        Map<VehicleType, Double> rates = Map.of(
            VehicleType.MOTORCYCLE, 10.0, VehicleType.CAR, 20.0, VehicleType.BUS, 50.0);
        ParkingLot lot = new ParkingLot(floors, new HourlyFeeCalculator(rates));

        Instant nineAm = Instant.parse("2026-01-05T09:00:00Z");
        Ticket bike = lot.parkVehicle(new Vehicle("KA-01-M-1111", VehicleType.MOTORCYCLE), nineAm);
        Ticket car = lot.parkVehicle(new Vehicle("KA-01-C-2222", VehicleType.CAR), nineAm);
        Ticket bus = lot.parkVehicle(new Vehicle("KA-01-B-3333", VehicleType.BUS), nineAm);
        Ticket car2 = lot.parkVehicle(new Vehicle("KA-01-C-4444", VehicleType.CAR), nineAm);
        for (Ticket t : List.of(bike, car, bus, car2)) {
            System.out.println(t.vehicle().licensePlate() + " -> " + t.id()
                + " slot " + t.slot().id() + " (floor " + t.slot().floorNumber() + ")");
        }

        System.out.println("Availability after four arrivals: " + lot.availability());

        Receipt receipt = lot.exitVehicle(car.id(), nineAm.plusSeconds(65 * 60));
        System.out.println("Receipt: " + receipt);

        Ticket again = lot.parkVehicle(new Vehicle("KA-01-C-5555", VehicleType.CAR), nineAm.plusSeconds(70 * 60));
        System.out.println("Freed slot is reused: " + again.slot().id());

        lot.parkVehicle(new Vehicle("KA-01-B-6666", VehicleType.BUS), nineAm.plusSeconds(75 * 60));
        try {
            lot.parkVehicle(new Vehicle("KA-01-B-7777", VehicleType.BUS), nineAm.plusSeconds(80 * 60));
        } catch (IllegalStateException e) {
            System.out.println("Expected failure: " + e.getMessage());
        }

        try {
            lot.exitVehicle(car.id());
        } catch (NoSuchElementException e) {
            System.out.println("Expected failure: " + e.getMessage());
        }
    }
}
`

/* ────────────────────────────── TYPESCRIPT ────────────────────────────── */

const ts = `type VehicleType = 'MOTORCYCLE' | 'CAR' | 'BUS'

type SlotType = 'MOTORCYCLE' | 'COMPACT' | 'LARGE'

const ALL_VEHICLE_TYPES: VehicleType[] = ['MOTORCYCLE', 'CAR', 'BUS']
const ALL_SLOT_TYPES: SlotType[] = ['MOTORCYCLE', 'COMPACT', 'LARGE']

/** Which slot sizes may host which vehicle. One table = one place to change. */
const COMPATIBLE_SLOTS: Record<VehicleType, ReadonlySet<SlotType>> = {
  MOTORCYCLE: new Set(['MOTORCYCLE', 'COMPACT', 'LARGE']),
  CAR: new Set(['COMPACT', 'LARGE']),
  BUS: new Set(['LARGE']),
}

class Vehicle {
  constructor(
    public readonly licensePlate: string,
    public readonly type: VehicleType,
  ) {
    if (!licensePlate.trim()) {
      throw new Error('license plate is required')
    }
  }
}

/** A single physical bay - size + occupancy, nothing else. */

class ParkingSlot {
  private _occupied = false

  constructor(
    public readonly id: string,
    public readonly floorNumber: number,
    public readonly type: SlotType,
  ) {}

  get occupied(): boolean {
    return this._occupied
  }

  canFit(vehicle: Vehicle): boolean {
    return !this._occupied && COMPATIBLE_SLOTS[vehicle.type].has(this.type)
  }

  occupy(): void {
    if (this._occupied) {
      throw new Error(\`slot \${this.id} is already occupied\`)
    }
    this._occupied = true
  }

  release(): void {
    if (!this._occupied) {
      throw new Error(\`slot \${this.id} is already free\`)
    }
    this._occupied = false
  }
}

class Ticket {
  constructor(
    public readonly id: string,
    public readonly vehicle: Vehicle,
    public readonly slot: ParkingSlot,
    public readonly entryTime: Date,
  ) {}

  minutesParked(exitTime: Date): number {
    const millis = exitTime.getTime() - this.entryTime.getTime()
    if (millis < 0) {
      throw new Error('exit time is before entry time')
    }
    return Math.floor(millis / 60_000)
  }
}

class Receipt {
  constructor(
    public readonly ticketId: string,
    public readonly licensePlate: string,
    public readonly durationMinutes: number,
    public readonly amount: number,
  ) {}
}

interface FeeCalculator {
  calculate(ticket: Ticket, exitTime: Date): number
}

/** Per started hour, minimum one hour, rate by vehicle type. */

class HourlyFeeCalculator implements FeeCalculator {
  constructor(private readonly hourlyRates: Record<VehicleType, number>) {
    for (const type of ALL_VEHICLE_TYPES) {
      if (hourlyRates[type] === undefined) {
        throw new Error(\`missing hourly rate for \${type}\`)
      }
    }
  }

  calculate(ticket: Ticket, exitTime: Date): number {
    const minutes = ticket.minutesParked(exitTime)
    const billableHours = Math.max(1, Math.ceil(minutes / 60))
    return billableHours * this.hourlyRates[ticket.vehicle.type]
  }
}

class Floor {
  private readonly slots: ParkingSlot[]

  constructor(public readonly number: number, slots: ParkingSlot[]) {
    this.slots = [...slots] // ordered by distance from the entrance
  }

  findNearestFreeSlot(vehicle: Vehicle): ParkingSlot | null {
    return this.slots.find(slot => slot.canFit(vehicle)) ?? null
  }

  freeCounts(): Record<SlotType, number> {
    const counts: Record<SlotType, number> = { MOTORCYCLE: 0, COMPACT: 0, LARGE: 0 }
    for (const slot of this.slots) {
      if (!slot.occupied) {
        counts[slot.type] += 1
      }
    }
    return counts
  }
}

/**
 * Facade: the only class entry/exit gates talk to.
 * Node runs these sync methods one-at-a-time on the event loop, so each call is
 * already atomic. In a multi-threaded runtime (Java / Go / C#), put a mutex here.
 */

class ParkingLot {
  private readonly floors: Floor[]
  private readonly activeTickets = new Map<string, Ticket>()
  private readonly parkedPlates = new Set<string>()
  private nextTicketNumber = 1

  constructor(
    floors: Floor[],
    private readonly feeCalculator: FeeCalculator,
  ) {
    if (floors.length === 0) {
      throw new Error('a parking lot needs at least one floor')
    }
    this.floors = [...floors].sort((a, b) => a.number - b.number)
  }

  parkVehicle(vehicle: Vehicle, entryTime = new Date()): Ticket {
    if (this.parkedPlates.has(vehicle.licensePlate)) {
      throw new Error(\`vehicle \${vehicle.licensePlate} is already parked\`)
    }

    for (const floor of this.floors) {
      const slot = floor.findNearestFreeSlot(vehicle)
      if (!slot) {
        continue
      }

      slot.occupy()
      const id = \`T-\${String(this.nextTicketNumber++).padStart(6, '0')}\`
      const ticket = new Ticket(id, vehicle, slot, entryTime)
      this.activeTickets.set(id, ticket)
      this.parkedPlates.add(vehicle.licensePlate)
      return ticket
    }

    throw new Error(\`no free slot for a \${vehicle.type}\`)
  }

  exitVehicle(ticketId: string, exitTime = new Date()): Receipt {
    const ticket = this.activeTickets.get(ticketId)
    if (!ticket) {
      throw new Error(\`unknown or already used ticket: \${ticketId}\`)
    }

    // Price first - if pricing throws, nothing has been mutated yet.
    const minutes = ticket.minutesParked(exitTime)
    const amount = this.feeCalculator.calculate(ticket, exitTime)

    ticket.slot.release()
    this.activeTickets.delete(ticketId)
    this.parkedPlates.delete(ticket.vehicle.licensePlate)
    return new Receipt(ticket.id, ticket.vehicle.licensePlate, minutes, amount)
  }

  availability(): Map<number, Record<SlotType, number>> {
    const result = new Map<number, Record<SlotType, number>>()
    for (const floor of this.floors) {
      result.set(floor.number, floor.freeCounts())
    }
    return result
  }
}

function printAvailability(lot: ParkingLot): void {
  for (const [floorNumber, counts] of lot.availability()) {
    const summary = ALL_SLOT_TYPES.map(t => \`\${t}=\${counts[t]}\`).join(', ')
    console.log(\`  floor \${floorNumber}: \${summary}\`)
  }
}

function main(): void {
  const floors = [
    new Floor(1, [
      new ParkingSlot('F1-M1', 1, 'MOTORCYCLE'),
      new ParkingSlot('F1-C1', 1, 'COMPACT'),
      new ParkingSlot('F1-L1', 1, 'LARGE'),
    ]),
    new Floor(2, [
      new ParkingSlot('F2-C1', 2, 'COMPACT'),
      new ParkingSlot('F2-L1', 2, 'LARGE'),
    ]),
  ]
  const lot = new ParkingLot(
    floors,
    new HourlyFeeCalculator({ MOTORCYCLE: 10, CAR: 20, BUS: 50 }),
  )

  const nineAm = new Date('2026-01-05T09:00:00Z')
  const at = (minutes: number) => new Date(nineAm.getTime() + minutes * 60_000)

  const bike = lot.parkVehicle(new Vehicle('KA-01-M-1111', 'MOTORCYCLE'), nineAm)
  const car = lot.parkVehicle(new Vehicle('KA-01-C-2222', 'CAR'), nineAm)
  const bus = lot.parkVehicle(new Vehicle('KA-01-B-3333', 'BUS'), nineAm)
  const car2 = lot.parkVehicle(new Vehicle('KA-01-C-4444', 'CAR'), nineAm)

  for (const t of [bike, car, bus, car2]) {
    console.log(
      \`\${t.vehicle.licensePlate} -> \${t.id} slot \${t.slot.id} (floor \${t.slot.floorNumber})\`,
    )
  }

  console.log('Availability after four arrivals:')
  printAvailability(lot)

  const receipt = lot.exitVehicle(car.id, at(65))
  console.log(
    \`Receipt: \${receipt.licensePlate} stayed \${receipt.durationMinutes} min, pays \${receipt.amount}\`,
  )

  const again = lot.parkVehicle(new Vehicle('KA-01-C-5555', 'CAR'), at(70))
  console.log(\`Freed slot is reused: \${again.slot.id}\`)

  lot.parkVehicle(new Vehicle('KA-01-B-6666', 'BUS'), at(75))
  try {
    lot.parkVehicle(new Vehicle('KA-01-B-7777', 'BUS'), at(80))
  } catch (err) {
    console.log('Expected failure:', (err as Error).message)
  }

  try {
    lot.exitVehicle(car.id)
  } catch (err) {
    console.log('Expected failure:', (err as Error).message)
  }
}

main()
`

/* ────────────────────────────── C++ ────────────────────────────── */

const cpp = `#include <bits/stdc++.h>
using namespace std;

using Clock = chrono::system_clock;
using TimePoint = Clock::time_point;

enum class VehicleType { Motorcycle, Car, Bus };

enum class SlotType { Motorcycle, Compact, Large };

string toString(VehicleType t) {
    switch (t) {
        case VehicleType::Motorcycle: return "MOTORCYCLE";
        case VehicleType::Car: return "CAR";
        case VehicleType::Bus: return "BUS";
    }
    return "?";
}

string toString(SlotType t) {
    switch (t) {
        case SlotType::Motorcycle: return "MOTORCYCLE";
        case SlotType::Compact: return "COMPACT";
        case SlotType::Large: return "LARGE";
    }
    return "?";
}

class Vehicle {
public:
    Vehicle(string licensePlate, VehicleType type)
        : licensePlate_(move(licensePlate)), type_(type) {
        if (licensePlate_.empty()) {
          throw invalid_argument("license plate is required");
        }
    }

    const string& licensePlate() const {
      return licensePlate_;
    }

    VehicleType type() const {
      return type_;
    }

private:
    string licensePlate_;
    VehicleType type_;
};

// A single physical bay. It knows its size and whether it is taken - nothing else.

class ParkingSlot {
public:
    ParkingSlot(string id, int floorNumber, SlotType type)
        : id_(move(id)), floorNumber_(floorNumber), type_(type) {}

    const string& id() const {
      return id_;
    }

    int floorNumber() const {
      return floorNumber_;
    }

    SlotType type() const {
      return type_;
    }

    bool occupied() const {
      return occupied_;
    }

    bool canFit(const Vehicle& vehicle) const {
        if (occupied_) {
          return false;
        }
        switch (vehicle.type()) {
            case VehicleType::Motorcycle: return true;                       // fits anywhere
            case VehicleType::Car: return type_ != SlotType::Motorcycle;     // compact or large
            case VehicleType::Bus: return type_ == SlotType::Large;          // large only
        }
        return false;
    }

    void occupy() {
        if (occupied_) {
          throw logic_error("slot " + id_ + " is already occupied");
        }
        occupied_ = true;
    }

    void release() {
        if (!occupied_) {
          throw logic_error("slot " + id_ + " is already free");
        }
        occupied_ = false;
    }

private:
    string id_;
    int floorNumber_;
    SlotType type_;
    bool occupied_ = false;
};

struct Ticket {
    string id;
    Vehicle vehicle;
    shared_ptr<ParkingSlot> slot;
    TimePoint entryTime;

    long minutesParked(TimePoint exitTime) const {
        if (exitTime < entryTime) {
          throw invalid_argument("exit time is before entry time");
        }
        return static_cast<long>(chrono::duration_cast<chrono::minutes>(exitTime - entryTime).count());
    }
};

struct Receipt {
    string ticketId;
    string licensePlate;
    long durationMinutes;
    double amount;
};

class FeeCalculator {
public:
    virtual ~FeeCalculator() = default;
    virtual double calculate(const Ticket& ticket, TimePoint exitTime) const = 0;
};

// Charges per started hour, minimum one hour, rate depends on vehicle type.

class HourlyFeeCalculator : public FeeCalculator {
public:
    explicit HourlyFeeCalculator(map<VehicleType, double> hourlyRates)
        : hourlyRates_(move(hourlyRates)) {
        for (VehicleType t : {VehicleType::Motorcycle, VehicleType::Car, VehicleType::Bus}) {
            if (hourlyRates_.find(t) {
              == hourlyRates_.end()) {
            }

                throw invalid_argument("missing hourly rate for " + toString(t));
            }
        }
    }

    double calculate(const Ticket& ticket, TimePoint exitTime) const override {
        long minutes = ticket.minutesParked(exitTime);
        long billableHours = max(1L, (minutes + 59) / 60);
        return billableHours * hourlyRates_.at(ticket.vehicle.type());
    }

private:
    map<VehicleType, double> hourlyRates_;
};

class Floor {
public:
    Floor(int number, vector<shared_ptr<ParkingSlot>> slots)
        : number_(number), slots_(move(slots)) {}  // ordered by distance from the entrance

    int number() const {
      return number_;
    }

    shared_ptr<ParkingSlot> findNearestFreeSlot(const Vehicle& vehicle) const {
        for (const auto& slot : slots_) {
            if (slot->canFit(vehicle)) {
              return slot;
            }
        }
        return nullptr;
    }

    map<SlotType, int> freeCounts() const {
        map<SlotType, int> counts{{SlotType::Motorcycle, 0}, {SlotType::Compact, 0}, {SlotType::Large, 0}};
        for (const auto& slot : slots_) {
            if (!slot->occupied()) {
              counts[slot->type()] += 1;
            }
        }
        return counts;
    }

private:
    int number_;
    vector<shared_ptr<ParkingSlot>> slots_;
};

// Facade: the only class the entry/exit gates talk to. All mutations hold one mutex.

class ParkingLot {
public:
    ParkingLot(vector<Floor> floors, unique_ptr<FeeCalculator> feeCalculator)
        : floors_(move(floors)), feeCalculator_(move(feeCalculator)) {
        if (floors_.empty()) {
          throw invalid_argument("a parking lot needs at least one floor");
        }
        if (!feeCalculator_) {
          throw invalid_argument("fee calculator is required");
        }
        sort(floors_.begin(), floors_.end(),
                  [](const Floor& a, const Floor& b) { return a.number() < b.number(); });  // floor 1 is nearest
    }

    Ticket parkVehicle(const Vehicle& vehicle, TimePoint entryTime = Clock::now()) {
        lock_guard<mutex> guard(mutex_);
        if (parkedPlates_.count(vehicle.licensePlate()) > 0) {
            throw logic_error("vehicle " + vehicle.licensePlate() + " is already parked");
        }
        for (const Floor& floor : floors_) {
            shared_ptr<ParkingSlot> slot = floor.findNearestFreeSlot(vehicle);
            if (!slot) {
              continue;
            }
            slot->occupy();
            ostringstream idStream;
            idStream << "T-" << setw(6) << setfill('0') << nextTicketNumber_++;
            string id = idStream.str();
            Ticket ticket{id, vehicle, slot, entryTime};
            activeTickets_.emplace(id, ticket);
            parkedPlates_.insert(vehicle.licensePlate());
            return ticket;
        }

        throw runtime_error("no free slot for a " + toString(vehicle.type()));
    }

    Receipt exitVehicle(const string& ticketId, TimePoint exitTime = Clock::now()) {
        lock_guard<mutex> guard(mutex_);
        auto it = activeTickets_.find(ticketId);
        if (it == activeTickets_.end()) {
            throw out_of_range("unknown or already used ticket: " + ticketId);
        }
        const Ticket& ticket = it->second;
        // Compute first: if pricing fails we have not mutated anything yet.
        long minutes = ticket.minutesParked(exitTime);
        double amount = feeCalculator_->calculate(ticket, exitTime);
        ticket.slot->release();
        parkedPlates_.erase(ticket.vehicle.licensePlate());
        Receipt receipt{ticket.id, ticket.vehicle.licensePlate(), minutes, amount};
        activeTickets_.erase(it);
        return receipt;
    }

    map<int, map<SlotType, int>> availability() const {
        lock_guard<mutex> guard(mutex_);
        map<int, map<SlotType, int>> result;
        for (const Floor& floor : floors_) {
          result[floor.number()] = floor.freeCounts();
        }
        return result;
    }

private:
    vector<Floor> floors_;
    unique_ptr<FeeCalculator> feeCalculator_;
    unordered_map<string, Ticket> activeTickets_;
    unordered_set<string> parkedPlates_;
    int nextTicketNumber_ = 1;
    mutable mutex mutex_;
};

void printAvailability(const ParkingLot& lot) {
    for (const auto& [floorNumber, counts] : lot.availability()) {
        cout << "  floor " << floorNumber << ": ";
        for (const auto& [type, count] : counts) {
          cout << toString(type) << "=" << count << " ";
        }
        cout << endl;
    }
}

int main() {
    vector<Floor> floors;
    floors.emplace_back(1, vector<shared_ptr<ParkingSlot>>{
        make_shared<ParkingSlot>("F1-M1", 1, SlotType::Motorcycle),
        make_shared<ParkingSlot>("F1-C1", 1, SlotType::Compact),
        make_shared<ParkingSlot>("F1-L1", 1, SlotType::Large)});
    floors.emplace_back(2, vector<shared_ptr<ParkingSlot>>{
        make_shared<ParkingSlot>("F2-C1", 2, SlotType::Compact),
        make_shared<ParkingSlot>("F2-L1", 2, SlotType::Large)});

    map<VehicleType, double> rates{
        {VehicleType::Motorcycle, 10.0}, {VehicleType::Car, 20.0}, {VehicleType::Bus, 50.0}};
    ParkingLot lot(move(floors), make_unique<HourlyFeeCalculator>(rates));

    TimePoint nineAm = Clock::now();  // any fixed reference works; we only use differences
    auto after = [&](int minutes) {
      return nineAm + chrono::minutes(minutes);
    }

    Ticket bike = lot.parkVehicle(Vehicle("KA-01-M-1111", VehicleType::Motorcycle), nineAm);
    Ticket car = lot.parkVehicle(Vehicle("KA-01-C-2222", VehicleType::Car), nineAm);
    Ticket bus = lot.parkVehicle(Vehicle("KA-01-B-3333", VehicleType::Bus), nineAm);
    Ticket car2 = lot.parkVehicle(Vehicle("KA-01-C-4444", VehicleType::Car), nineAm);
    for (const Ticket& t : {bike, car, bus, car2}) {
        cout << t.vehicle.licensePlate() << " -> " << t.id << " slot " << t.slot->id()
                  << " (floor " << t.slot->floorNumber() << ")" << endl;
    }

    cout << "Availability after four arrivals:" << endl;
    printAvailability(lot);

    Receipt receipt = lot.exitVehicle(car.id, after(65));
    cout << "Receipt: " << receipt.licensePlate << " stayed " << receipt.durationMinutes
              << " min, pays " << receipt.amount << endl;

    Ticket again = lot.parkVehicle(Vehicle("KA-01-C-5555", VehicleType::Car), after(70));
    cout << "Freed slot is reused: " << again.slot->id() << endl;

    lot.parkVehicle(Vehicle("KA-01-B-6666", VehicleType::Bus), after(75));
    try {
        lot.parkVehicle(Vehicle("KA-01-B-7777", VehicleType::Bus), after(80));
    } catch (const runtime_error& e) {
        cout << "Expected failure: " << e.what() << endl;
    }

    try {
        lot.exitVehicle(car.id);
    } catch (const out_of_range& e) {
        cout << "Expected failure: " << e.what() << endl;
    }
    return 0;
}
`

/* ────────────────────────────── GO ────────────────────────────── */

const goCode = `package main

import (
	"errors"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"
)

type VehicleType int

const (
	Motorcycle VehicleType = iota
	Car
	Bus
)

func (t VehicleType) String() string {
	return [...]string{"MOTORCYCLE", "CAR", "BUS"}[t]
}

type SlotType int

const (
	MotorcycleSlot SlotType = iota
	CompactSlot
	LargeSlot
)

func (t SlotType) String() string {
	return [...]string{"MOTORCYCLE", "COMPACT", "LARGE"}[t]
}

var allVehicleTypes = []VehicleType{Motorcycle, Car, Bus}
var allSlotTypes = []SlotType{MotorcycleSlot, CompactSlot, LargeSlot}

var (
	ErrLotFull       = errors.New("no free slot")
	ErrUnknownTicket = errors.New("unknown or already used ticket")
	ErrAlreadyParked = errors.New("vehicle is already parked")
)

type Vehicle struct {
	LicensePlate string
	Type         VehicleType
}

func NewVehicle(licensePlate string, vehicleType VehicleType) (Vehicle, error) {
	if strings.TrimSpace(licensePlate) == "" {
		return Vehicle{}, errors.New("license plate is required")
	}
	return Vehicle{LicensePlate: licensePlate, Type: vehicleType}, nil
}

// ParkingSlot is a single physical bay. It knows its size and whether it is taken - nothing else.

type ParkingSlot struct {
	ID          string
	FloorNumber int
	Type        SlotType
	occupied    bool
}

func NewParkingSlot(id string, floorNumber int, slotType SlotType) *ParkingSlot {
	return &ParkingSlot{ID: id, FloorNumber: floorNumber, Type: slotType}
}

func (s *ParkingSlot) IsOccupied() bool {
  return s.occupied
}

func (s *ParkingSlot) CanFit(v Vehicle) bool {
	if s.occupied {
		return false
	}
	switch v.Type {
	case Motorcycle:
		return true // fits anywhere
	case Car:
		return s.Type != MotorcycleSlot // compact or large
	case Bus:
		return s.Type == LargeSlot // large only
	}
	return false
}

func (s *ParkingSlot) occupy() error {
	if s.occupied {
		return fmt.Errorf("slot %s is already occupied", s.ID)
	}
	s.occupied = true
	return nil
}

func (s *ParkingSlot) release() error {
	if !s.occupied {
		return fmt.Errorf("slot %s is already free", s.ID)
	}
	s.occupied = false
	return nil
}

type Ticket struct {
	ID        string
	Vehicle   Vehicle
	Slot      *ParkingSlot
	EntryTime time.Time
}

func (t Ticket) MinutesParked(exitTime time.Time) (int64, error) {
	if exitTime.Before(t.EntryTime) {
		return 0, errors.New("exit time is before entry time")
	}
	return int64(exitTime.Sub(t.EntryTime).Minutes()), nil
}

type Receipt struct {
	TicketID        string
	LicensePlate    string
	DurationMinutes int64
	Amount          float64
}

type FeeCalculator interface {
	Calculate(ticket Ticket, exitTime time.Time) (float64, error)
}

// HourlyFeeCalculator charges per started hour, minimum one hour, rate depends on vehicle type.

type HourlyFeeCalculator struct {
	hourlyRates map[VehicleType]float64
}

func NewHourlyFeeCalculator(rates map[VehicleType]float64) (*HourlyFeeCalculator, error) {
	copied := make(map[VehicleType]float64, len(rates))
	for _, t := range allVehicleTypes {
		rate, ok := rates[t]
		if !ok {
			return nil, fmt.Errorf("missing hourly rate for %s", t)
		}
		copied[t] = rate
	}
	return &HourlyFeeCalculator{hourlyRates: copied}, nil
}

func (h *HourlyFeeCalculator) Calculate(ticket Ticket, exitTime time.Time) (float64, error) {
	minutes, err := ticket.MinutesParked(exitTime)
	if err != nil {
		return 0, err
	}
	billableHours := (minutes + 59) / 60
	if billableHours < 1 {
		billableHours = 1
	}
	return float64(billableHours) * h.hourlyRates[ticket.Vehicle.Type], nil
}

type Floor struct {
	Number int
	slots  []*ParkingSlot // ordered by distance from the entrance
}

func NewFloor(number int, slots []*ParkingSlot) *Floor {
	return &Floor{Number: number, slots: append([]*ParkingSlot(nil), slots...)}
}

func (f *Floor) FindNearestFreeSlot(v Vehicle) *ParkingSlot {
	for _, slot := range f.slots {
		if slot.CanFit(v) {
			return slot
		}
	}
	return nil
}

func (f *Floor) FreeCounts() map[SlotType]int {
	counts := map[SlotType]int{MotorcycleSlot: 0, CompactSlot: 0, LargeSlot: 0}
	for _, slot := range f.slots {
		if !slot.IsOccupied() {
			counts[slot.Type]++
		}
	}
	return counts
}

// ParkingLot is the facade the entry/exit gates talk to. All mutations hold one mutex.

type ParkingLot struct {
	mu               sync.Mutex
	floors           []*Floor
	feeCalculator    FeeCalculator
	activeTickets    map[string]Ticket
	parkedPlates     map[string]bool
	nextTicketNumber int
}

func NewParkingLot(floors []*Floor, feeCalculator FeeCalculator) (*ParkingLot, error) {
	if len(floors) == 0 {
		return nil, errors.New("a parking lot needs at least one floor")
	}
	if feeCalculator == nil {
		return nil, errors.New("fee calculator is required")
	}
	sorted := append([]*Floor(nil), floors...)
	sort.Slice(sorted, func(i, j int) bool { return sorted[i].Number < sorted[j].Number }) // floor 1 is nearest
	return &ParkingLot{
		floors:           sorted,
		feeCalculator:    feeCalculator,
		activeTickets:    map[string]Ticket{},
		parkedPlates:     map[string]bool{},
		nextTicketNumber: 1,
	}, nil
}

func (p *ParkingLot) ParkVehicle(v Vehicle) (Ticket, error) {
	return p.ParkVehicleAt(v, time.Now())
}

func (p *ParkingLot) ParkVehicleAt(v Vehicle, entryTime time.Time) (Ticket, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	if p.parkedPlates[v.LicensePlate] {
		return Ticket{}, fmt.Errorf("%w: %s", ErrAlreadyParked, v.LicensePlate)
	}
	for _, floor := range p.floors {
		slot := floor.FindNearestFreeSlot(v)
		if slot == nil {
			continue
		}
		if err := slot.occupy(); err != nil {
			return Ticket{}, err
		}
		id := fmt.Sprintf("T-%06d", p.nextTicketNumber)
		p.nextTicketNumber++
		ticket := Ticket{ID: id, Vehicle: v, Slot: slot, EntryTime: entryTime}
		p.activeTickets[id] = ticket
		p.parkedPlates[v.LicensePlate] = true
		return ticket, nil
	}
	return Ticket{}, fmt.Errorf("%w for a %s", ErrLotFull, v.Type)
}

func (p *ParkingLot) ExitVehicle(ticketID string) (Receipt, error) {
	return p.ExitVehicleAt(ticketID, time.Now())
}

func (p *ParkingLot) ExitVehicleAt(ticketID string, exitTime time.Time) (Receipt, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	ticket, ok := p.activeTickets[ticketID]
	if !ok {
		return Receipt{}, fmt.Errorf("%w: %s", ErrUnknownTicket, ticketID)
	}
	// Compute first: if pricing fails we have not mutated anything yet.
	minutes, err := ticket.MinutesParked(exitTime)
	if err != nil {
		return Receipt{}, err
	}
	amount, err := p.feeCalculator.Calculate(ticket, exitTime)
	if err != nil {
		return Receipt{}, err
	}
	if err := ticket.Slot.release(); err != nil {
		return Receipt{}, err
	}
	delete(p.activeTickets, ticketID)
	delete(p.parkedPlates, ticket.Vehicle.LicensePlate)
	return Receipt{
		TicketID:        ticket.ID,
		LicensePlate:    ticket.Vehicle.LicensePlate,
		DurationMinutes: minutes,
		Amount:          amount,
	}, nil
}

func (p *ParkingLot) Availability() map[int]map[SlotType]int {
	p.mu.Lock()
	defer p.mu.Unlock()
	result := make(map[int]map[SlotType]int, len(p.floors))
	for _, floor := range p.floors {
		result[floor.Number] = floor.FreeCounts()
	}
	return result
}

func printAvailability(lot *ParkingLot) {
	availability := lot.Availability()
	floorNumbers := make([]int, 0, len(availability))
	for n := range availability {
		floorNumbers = append(floorNumbers, n)
	}
	sort.Ints(floorNumbers)
	for _, n := range floorNumbers {
		parts := make([]string, 0, len(allSlotTypes))
		for _, t := range allSlotTypes {
			parts = append(parts, fmt.Sprintf("%s=%d", t, availability[n][t]))
		}
		fmt.Println("  floor", n, ":", strings.Join(parts, ", "))
	}
}

func mustVehicle(plate string, t VehicleType) Vehicle {
	v, err := NewVehicle(plate, t)
	if err != nil {
		panic(err)
	}
	return v
}

func mustPark(lot *ParkingLot, v Vehicle, at time.Time) Ticket {
	t, err := lot.ParkVehicleAt(v, at)
	if err != nil {
		panic(err)
	}
	return t
}

func main() {
	floors := []*Floor{
		NewFloor(1, []*ParkingSlot{
			NewParkingSlot("F1-M1", 1, MotorcycleSlot),
			NewParkingSlot("F1-C1", 1, CompactSlot),
			NewParkingSlot("F1-L1", 1, LargeSlot),
		}),
		NewFloor(2, []*ParkingSlot{
			NewParkingSlot("F2-C1", 2, CompactSlot),
			NewParkingSlot("F2-L1", 2, LargeSlot),
		}),
	}
	calculator, err := NewHourlyFeeCalculator(map[VehicleType]float64{Motorcycle: 10, Car: 20, Bus: 50})
	if err != nil {
		panic(err)
	}
	lot, err := NewParkingLot(floors, calculator)
	if err != nil {
		panic(err)
	}

	nineAm := time.Date(2026, time.January, 5, 9, 0, 0, 0, time.UTC)
	after := func(minutes int) time.Time {
		return nineAm.Add(time.Duration(minutes) * time.Minute)
	}

	bike := mustPark(lot, mustVehicle("KA-01-M-1111", Motorcycle), nineAm)
	car := mustPark(lot, mustVehicle("KA-01-C-2222", Car), nineAm)
	bus := mustPark(lot, mustVehicle("KA-01-B-3333", Bus), nineAm)
	car2 := mustPark(lot, mustVehicle("KA-01-C-4444", Car), nineAm)
	for _, t := range []Ticket{bike, car, bus, car2} {
		fmt.Println(t.Vehicle.LicensePlate, "->", t.ID, "slot", t.Slot.ID, "(floor", t.Slot.FloorNumber, ")")
	}

	fmt.Println("Availability after four arrivals:")
	printAvailability(lot)

	receipt, err := lot.ExitVehicleAt(car.ID, after(65))
	if err != nil {
		panic(err)
	}
	fmt.Println(fmt.Sprintf("Receipt: %s stayed %d min, pays %.2f", receipt.LicensePlate, receipt.DurationMinutes, receipt.Amount))

	again := mustPark(lot, mustVehicle("KA-01-C-5555", Car), after(70))
	fmt.Println("Freed slot is reused:", again.Slot.ID)

	mustPark(lot, mustVehicle("KA-01-B-6666", Bus), after(75))
	if _, err := lot.ParkVehicleAt(mustVehicle("KA-01-B-7777", Bus), after(80)); err != nil {
		fmt.Println("Expected failure:", err)
	}

	if _, err := lot.ExitVehicle(car.ID); errors.Is(err, ErrUnknownTicket) {
		fmt.Println("Expected failure:", err)
	}
}
`

/* ────────────────────────────── C# ────────────────────────────── */

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;

public enum VehicleType { Motorcycle, Car, Bus }

public enum SlotType { Motorcycle, Compact, Large }

public sealed class Vehicle
{
    public string LicensePlate { get; }
    public VehicleType Type { get; }

    public Vehicle(string licensePlate, VehicleType type)
    {
        if (string.IsNullOrWhiteSpace(licensePlate))
            throw new ArgumentException("license plate is required", nameof(licensePlate));
        LicensePlate = licensePlate;
        Type = type;
    }
}

// A single physical bay. It knows its size and whether it is taken - nothing else.
public sealed class ParkingSlot
{
    public string Id { get; }
    public int FloorNumber { get; }
    public SlotType Type { get; }
    public bool IsOccupied { get; private set; }

    public ParkingSlot(string id, int floorNumber, SlotType type)
    {
        Id = id;
        FloorNumber = floorNumber;
        Type = type;
    }

    public bool CanFit(Vehicle vehicle)
    {
        if (IsOccupied) {
          return false;
        }
        return vehicle.Type switch
        {
            VehicleType.Motorcycle => true,                     // fits anywhere
            VehicleType.Car => Type != SlotType.Motorcycle,     // compact or large
            VehicleType.Bus => Type == SlotType.Large,          // large only
            _ => false,
        };
    }

    internal void Occupy()
    {
        if (IsOccupied) {
          throw new InvalidOperationException("slot " + Id + " is already occupied");
        }
        IsOccupied = true;
    }

    internal void Release()
    {
        if (!IsOccupied) {
          throw new InvalidOperationException("slot " + Id + " is already free");
        }
        IsOccupied = false;
    }
}

public sealed class Ticket
{
    public string Id { get; }
    public Vehicle Vehicle { get; }
    public ParkingSlot Slot { get; }
    public DateTime EntryTime { get; }

    public Ticket(string id, Vehicle vehicle, ParkingSlot slot, DateTime entryTime)
    {
        Id = id;
        Vehicle = vehicle;
        Slot = slot;
        EntryTime = entryTime;
    }

    public long MinutesParked(DateTime exitTime)
    {
        if (exitTime < EntryTime) {
          throw new ArgumentException("exit time is before entry time");
        }
        return (long)(exitTime - EntryTime).TotalMinutes;
    }
}

public sealed record Receipt(string TicketId, string LicensePlate, long DurationMinutes, decimal Amount);

public interface IFeeCalculator
{
    decimal Calculate(Ticket ticket, DateTime exitTime);
}

// Charges per started hour, minimum one hour, rate depends on vehicle type.
public sealed class HourlyFeeCalculator : IFeeCalculator
{
    private readonly Dictionary<VehicleType, decimal> _hourlyRates;

    public HourlyFeeCalculator(IDictionary<VehicleType, decimal> hourlyRates)
    {
        foreach (VehicleType type in Enum.GetValues(typeof(VehicleType)))
        {
            if (!hourlyRates.ContainsKey(type))
                throw new ArgumentException("missing hourly rate for " + type);
        }
        _hourlyRates = new Dictionary<VehicleType, decimal>(hourlyRates);
    }

    public decimal Calculate(Ticket ticket, DateTime exitTime)
    {
        long minutes = ticket.MinutesParked(exitTime);
        long billableHours = Math.Max(1, (minutes + 59) / 60);
        return billableHours * _hourlyRates[ticket.Vehicle.Type];
    }
}

public sealed class Floor
{
    private readonly List<ParkingSlot> _slots; // ordered by distance from the entrance

    public int Number { get; }

    public Floor(int number, IEnumerable<ParkingSlot> slots)
    {
        Number = number;
        _slots = slots.ToList();
    }

    public ParkingSlot? FindNearestFreeSlot(Vehicle vehicle) =>
        _slots.FirstOrDefault(slot => slot.CanFit(vehicle));

    public Dictionary<SlotType, int> FreeCounts()
    {
        var counts = new Dictionary<SlotType, int>();
        foreach (SlotType type in Enum.GetValues(typeof(SlotType))) counts[type] = 0;
        foreach (var slot in _slots)
        {
            if (!slot.IsOccupied) {
              counts[slot.Type]++;
            }
        }
        return counts;
    }
}

// Facade: the only class the entry/exit gates talk to. All mutations hold one lock.
public sealed class ParkingLot
{
    private readonly List<Floor> _floors;
    private readonly IFeeCalculator _feeCalculator;
    private readonly Dictionary<string, Ticket> _activeTickets = new();
    private readonly HashSet<string> _parkedPlates = new();
    private readonly object _gate = new();
    private int _nextTicketNumber = 1;

    public ParkingLot(IEnumerable<Floor> floors, IFeeCalculator feeCalculator)
    {
        _floors = floors.OrderBy(f => f.Number).ToList(); // floor 1 is nearest
        if (_floors.Count == 0) {
          throw new ArgumentException("a parking lot needs at least one floor");
        }
        _feeCalculator = feeCalculator ?? throw new ArgumentNullException(nameof(feeCalculator));
    }

    public Ticket ParkVehicle(Vehicle vehicle, DateTime? entryTime = null)
    {
        DateTime entry = entryTime ?? DateTime.UtcNow;
        lock (_gate)
        {
            if (_parkedPlates.Contains(vehicle.LicensePlate))
                throw new InvalidOperationException("vehicle " + vehicle.LicensePlate + " is already parked");

            foreach (var floor in _floors)
            {
                var slot = floor.FindNearestFreeSlot(vehicle);
                if (slot is null) {
                  continue;
                }

                slot.Occupy();
                string id = "T-" + _nextTicketNumber.ToString("D6");
                _nextTicketNumber++;
                var ticket = new Ticket(id, vehicle, slot, entry);
                _activeTickets[id] = ticket;
                _parkedPlates.Add(vehicle.LicensePlate);
                return ticket;
            }

            throw new InvalidOperationException("no free slot for a " + vehicle.Type);
        }
    }

    public Receipt ExitVehicle(string ticketId, DateTime? exitTime = null)
    {
        DateTime exit = exitTime ?? DateTime.UtcNow;
        lock (_gate)
        {
            if (!_activeTickets.TryGetValue(ticketId, out var ticket))
                throw new KeyNotFoundException("unknown or already used ticket: " + ticketId);

            // Compute first: if pricing fails we have not mutated anything yet.
            long minutes = ticket.MinutesParked(exit);
            decimal amount = _feeCalculator.Calculate(ticket, exit);
            ticket.Slot.Release();
            _activeTickets.Remove(ticketId);
            _parkedPlates.Remove(ticket.Vehicle.LicensePlate);
            return new Receipt(ticket.Id, ticket.Vehicle.LicensePlate, minutes, amount);
        }
    }

    public Dictionary<int, Dictionary<SlotType, int>> Availability()
    {
        lock (_gate)
        {
            return _floors.ToDictionary(f => f.Number, f => f.FreeCounts());
        }
    }
}

public static class Program
{
    private static void PrintAvailability(ParkingLot lot)
    {
        foreach (var (floorNumber, counts) in lot.Availability().OrderBy(kv => kv.Key))
        {
            string summary = string.Join(", ", counts.Select(kv => kv.Key + "=" + kv.Value));
            Console.WriteLine("  floor " + floorNumber + ": " + summary);
        }
    }

    public static void Main()
    {
        var floors = new List<Floor>
        {
            new Floor(1, new[]
            {
                new ParkingSlot("F1-M1", 1, SlotType.Motorcycle),
                new ParkingSlot("F1-C1", 1, SlotType.Compact),
                new ParkingSlot("F1-L1", 1, SlotType.Large),
            }),
            new Floor(2, new[]
            {
                new ParkingSlot("F2-C1", 2, SlotType.Compact),
                new ParkingSlot("F2-L1", 2, SlotType.Large),
            }),
        };
        var rates = new Dictionary<VehicleType, decimal>
        {
            [VehicleType.Motorcycle] = 10m,
            [VehicleType.Car] = 20m,
            [VehicleType.Bus] = 50m,
        };
        var lot = new ParkingLot(floors, new HourlyFeeCalculator(rates));

        var nineAm = new DateTime(2026, 1, 5, 9, 0, 0, DateTimeKind.Utc);

        var bike = lot.ParkVehicle(new Vehicle("KA-01-M-1111", VehicleType.Motorcycle), nineAm);
        var car = lot.ParkVehicle(new Vehicle("KA-01-C-2222", VehicleType.Car), nineAm);
        var bus = lot.ParkVehicle(new Vehicle("KA-01-B-3333", VehicleType.Bus), nineAm);
        var car2 = lot.ParkVehicle(new Vehicle("KA-01-C-4444", VehicleType.Car), nineAm);
        foreach (var t in new[] { bike, car, bus, car2 })
        {
            Console.WriteLine(t.Vehicle.LicensePlate + " -> " + t.Id + " slot " + t.Slot.Id
                + " (floor " + t.Slot.FloorNumber + ")");
        }

        Console.WriteLine("Availability after four arrivals:");
        PrintAvailability(lot);

        var receipt = lot.ExitVehicle(car.Id, nineAm.AddMinutes(65));
        Console.WriteLine("Receipt: " + receipt);

        var again = lot.ParkVehicle(new Vehicle("KA-01-C-5555", VehicleType.Car), nineAm.AddMinutes(70));
        Console.WriteLine("Freed slot is reused: " + again.Slot.Id);

        lot.ParkVehicle(new Vehicle("KA-01-B-6666", VehicleType.Bus), nineAm.AddMinutes(75));
        try
        {
            lot.ParkVehicle(new Vehicle("KA-01-B-7777", VehicleType.Bus), nineAm.AddMinutes(80));
        }
        catch (InvalidOperationException e)
        {
            Console.WriteLine("Expected failure: " + e.Message);
        }

        try
        {
            lot.ExitVehicle(car.Id);
        }
        catch (KeyNotFoundException e)
        {
            Console.WriteLine("Expected failure: " + e.Message);
        }
    }
}
`

/* ────────────────────────────── SOLUTION ────────────────────────────── */

export const parkingLotSolution: ProblemSolution = {
  slug: 'parking-lot',
  title: 'Parking Lot System - Solution',

  overview: {
    introduction: [
      "Parking lot is one of the most common low-level design interview questions. Almost everyone has used a car park, so you do not spend time explaining the business. You get a short spec: multiple floors, motorcycles, cars, and buses, tickets at entry, and fees at exit. In about 45 minutes you turn that into a small set of classes that someone could implement tomorrow.",
      "The interviewer is not testing whether you know how real garages run. They want to see how you design. Do you ask clarifying questions before you draw? Can you pick nouns and verbs from the requirements and turn them into classes? Do you spread behavior across classes, or put everything in one huge ParkingLot? When fees depend on vehicle type and time parked, do you bury a switch in exit, or pull pricing into its own class because it will change? Those choices matter.",
      "The problem may mention about 10,000 slots, assignment under 100 ms, and thread safety. That does not mean you design a distributed system. You should be able to say briefly why scanning 10,000 slots is fast enough, where the lock goes so two cars never get the same slot, and what you would change at much larger scale. Talk about high availability (replicas, failover, persistence) at the end. Do not draw it on the class diagram.",
      "A solid answer has a few clear classes (ParkingLot, Floor, ParkingSlot, Vehicle, Ticket, Receipt, FeeCalculator), one simple job per class, fee logic you can swap without changing park/exit, one lock around park and exit, and working code with a short demo. Naming two or three options you rejected and why puts you ahead. This guide walks through that flow step by step, like in the interview room.",
    ],
    constraints: [
      "Multiple floors; the whole lot has on the order of 10,000 slots.",
      "Three vehicle types (motorcycle, car, bus) and three slot sizes (motorcycle, compact, large). A vehicle may only park in a slot that fits.",
      "On entry: assign the nearest free compatible slot and give a ticket with the slot and entry time.",
      "On exit: free the slot and charge a fee from time parked and vehicle type.",
      "Callers can ask how many free slots each floor has (often broken down by slot type).",
      "Slot assignment must finish under 100 ms and be thread-safe. Two cars entering at once must never get the same slot.",
      "High availability (replication, failover) is discussed in words only, not drawn as extra classes.",
    ],
    assumptions: [
      "Nearest means lowest floor first, then the first free slot in that floor's list (slots are ordered from the entrance outward). Confirm this with the interviewer instead of building distance math.",
      "A motorcycle may use any slot; a car may use compact or large; a bus needs large. One vehicle uses one slot.",
      "Fees are hourly, rounded up to the next started hour, with at least one hour charged. Rates vary by vehicle type and come from an injected calculator, not hard-coded in ParkingLot.",
      "A ticket proves an active stay. Lost tickets, validation stamps, and payment gateways are out of scope unless the interviewer asks.",
      "The same license plate cannot be inside the lot twice at once.",
      "One process holds all state. Saving to a database or running many nodes is a follow-up discussion, not part of this diagram.",
    ],
    clarificationQuestions: [
      {
        question: "How is nearest available slot defined - closest to the entrance, lowest floor first, or shortest walk to the exit?",
        why: "This picks your assignment algorithm. First free slot in floor order is a simple loop. Real walking distance needs coordinates and more code. Ask so you can use the simple rule and mention how to upgrade later.",
      },
      {
        question: "Can a smaller vehicle use a larger slot (motorcycle in a car slot, car in a bus slot)?",
        why: "This sets the fit rules on ParkingSlot. Allowing overflow can help fill the lot but may leave no large slots for buses. Good to say that trade-off out loud.",
      },
      {
        question: "How is the fee computed - per started hour, per minute, tiered? Is there a grace period or a daily cap?",
        why: "This tells you how big FeeCalculator needs to be. Hourly by vehicle type fits one small class. Promotions or surge pricing are a reason to use a Strategy pattern for fees.",
      },
      {
        question: "Do we need concurrent entry and exit gates, and roughly how many?",
        why: "This justifies a lock. A few gates are fine with one lock on park and exit. Many gates might need per-floor locks or free lists, but you still start with one simple lock.",
      },
      {
        question: "When the lot or the right slot type is full, should we throw, return nothing, or queue the vehicle?",
        why: "You need a clear API for failure. Decide now if parkVehicle throws or returns empty so gate code stays simple.",
      },
      {
        question: "Is availability per floor only, or per floor and slot type? Do display boards need live updates?",
        why: "Pull-style availability (count free slots on demand) is easy. Push-style boards that update instantly suggest Observer. We assume pull here and mention Observer as an extension.",
      },
      {
        question: "Are EV charging, reserved, or handicapped slots in scope for this version?",
        why: "Shows you think ahead. The answer is usually not now, which lets you keep SlotType small and explain where a new type would plug in later.",
      },
    ],
  },

  interviewApproach: {
    sections: [
      {
        heading: "The first two minutes: slow down and set the frame",
        paragraphs: [
          "Strong candidates do not draw boxes right away. Spend the first two minutes repeating the problem in your own words and asking a few questions. For example: we have a multi-floor lot with motorcycles, cars, and buses. A vehicle arrives, we assign the nearest free slot that fits and give a ticket. On leave we free the slot and charge by time and type. We need availability per floor and thread safety at about 10,000 slots. Is that correct? That shows you got the main flow and lets the interviewer fix mistakes early.",
          "Then ask some clarifying questions from the list above, but not all of them. Each answer becomes a one-line assumption on the board. That helps you later when someone asks why you chose a rule.",
          "Say your plan out loud: main flows, then classes, then one job per class, then how they connect, then patterns, then code the happy path. A short roadmap makes the rest of the interview feel organized.",
        ],
        bullets: [
          "Restate the problem in one paragraph and wait for a yes before drawing.",
          "Ask about 5-6 clarifying questions - enough to lock rules, not so many that you seem stuck.",
          "Write each assumption on the board (for example: nearest = lowest floor, then first slot in list).",
          "Announce a short roadmap: flows, entities, responsibilities, relationships, patterns, code.",
        ],
        callout: {
          title: "Interview tip",
          body: "Aim for five or six questions. Too many looks like you cannot decide. Too few looks like you did not think about gaps.",
        },
      },
      {
        heading: "Extracting nouns and verbs from the requirements",
        paragraphs: [
          "Read the requirements and mark nouns and verbs. Nouns suggest classes: parking lot, floor, slot, vehicle, ticket, fee, receipt. Verbs suggest methods: park, assign, issue ticket, exit, release, calculate fee, check availability. At first just list them on the board.",
          "Then ask whose job each verb is. Parking needs all floors, so it belongs on ParkingLot. Finding a free slot on one floor belongs to Floor. Whether a slot fits a vehicle belongs to ParkingSlot. Fees belong to FeeCalculator, not to slots. That question drives most of the design.",
        ],
        bullets: [
          "Classes (things with identity): ParkingLot, Floor, ParkingSlot, Vehicle, Ticket, Receipt.",
          "Fields (data on those things): license plate, entry time, floor number, occupied flag.",
          "Enums (fixed choices): VehicleType (MOTORCYCLE / CAR / BUS), SlotType (MOTORCYCLE / COMPACT / LARGE).",
          "Availability is a query (count free slots), not its own class in this design.",
        ],
      },
      {
        heading: "Entity discovery: deciding what deserves to be a class",
        paragraphs: [
          "ParkingLot is the main class the gates talk to. It exposes park, exit, and availability. It owns the floors, active tickets, and the fee calculator. It is the facade and the right place for the lock because it sees the whole system.",
          "Floor and ParkingSlot model the building. A floor holds an ordered list of slots and finds the nearest free one that fits. A slot knows its id, floor, type, and whether it is taken. It exposes canFit, occupy, and release. It does not know prices or tickets. Keeping the slot small makes the design easier to follow.",
          "Many people over-build Vehicle with Motorcycle, Car, and Bus subclasses. Ask what those classes would override. Here the only differences are slot fit and rate, which are data. One Vehicle with a license plate and VehicleType enum is enough. Add a new type by adding an enum value and updating two small rules.",
        ],
        bullets: [
          "Ticket - proof of an active stay: vehicle, slot reference, entry time (slot reference makes exit fast).",
          "Receipt - result of exit: ticket id, plate, duration, amount; returned to the gate.",
          "FeeCalculator - one-method interface; HourlyFeeCalculator is the first implementation.",
        ],
      },
      {
        heading: "Assigning responsibilities: one sentence per class",
        paragraphs: [
          "Each class should have one clear job in one sentence. If ParkingLot both checks slot fit and computes fees, split that work. Put each validation on the class that owns the data: short checks, clear ownership.",
          "ParkingLot orchestrates. It does not store rate tables, slot fit rules, or receipt formatting. It calls Floor, Ticket, and FeeCalculator. That keeps it from becoming a god class.",
        ],
        bullets: [
          "ParkingLot runs entry, exit, and availability for the whole lot. It enforces duplicate plate and lot full.",
          "Floor searches its slots for the nearest free fit; ParkingSlot tracks occupancy and canFit.",
          "Ticket links vehicle, slot, and entry time; FeeCalculator computes the fee; Receipt summarizes exit.",
          "Validations: blank plate on Vehicle; double occupy on ParkingSlot; exit before entry on Ticket; already parked on ParkingLot.",
        ],
      },
      {
        heading: "Relationships and multiplicities",
        paragraphs: [
          "Draw structure first. ParkingLot has one or more Floors; each Floor has one or more ParkingSlots. That is composition: destroy the lot and the floors and slots go away. In code these are lists owned by the parent.",
          "ParkingLot uses a FeeCalculator but does not create it (aggregation). The lot depends on the FeeCalculator interface, not HourlyFeeCalculator by name. The lot holds active Tickets. Exit creates a Receipt. Each Ticket points to one slot and one vehicle.",
        ],
        bullets: [
          "Composition: ParkingLot to Floor to ParkingSlot (slots live inside floors).",
          "Aggregation: ParkingLot uses FeeCalculator interface; HourlyFeeCalculator implements it.",
          "Association: Ticket links ParkingSlot and Vehicle; enums tie types to slots and vehicles.",
        ],
        callout: {
          title: "Why not let the slot hold the Vehicle?",
          body: "Some designs store the vehicle on the slot. Here the Ticket links vehicle and slot so the slot only tracks free or taken. One object answers who is parked where and since when. That avoids two places getting out of sync.",
        },
      },
      {
        heading: "Patterns and OOP choices - and what we rejected",
        paragraphs: [
          "Strategy fits fee calculation. Pricing changes often (weekends, caps, surge). Hide it behind FeeCalculator.calculate(ticket, exitTime) so ParkingLot stays the same when rates change. A big switch inside exitVehicle works at first but gets messy fast.",
          "Facade fits ParkingLot: three public methods hide floors, slots, tickets, lock, and pricing. For vehicles we use an enum instead of subclasses. We skip Singleton for the lot - create one instance at startup and pass it in; tests stay easier.",
        ],
        bullets: [
          "Rejected Motorcycle/Car/Bus subclasses - they only differ by data; use VehicleType and lookup rules.",
          "Rejected fit rules on Vehicle - slot size is a bay property; change it on ParkingSlot.",
          "Rejected fee logic on Vehicle or ParkingSlot - pricing changes on its own schedule.",
          "Rejected Singleton ParkingLot - inject the instance instead for clearer tests.",
        ],
      },
      {
        heading: "Concurrency and performance: speaking to the NFRs",
        paragraphs: [
          "Two gates can race for the same slot: both see it free and both try to take it. Fix that by making find slot, mark occupied, and issue ticket one atomic step. Use one lock on ParkingLot during parkVehicle, exitVehicle, and availability. It is simple and correct. The locked section is very short.",
          "Say the numbers out loud. Scanning 10,000 slots takes microseconds, well under 100 ms. One lock still handles many operations per second at this size. For high availability, describe persisting tickets and a standby in words. Do not draw replicas on the diagram.",
        ],
        bullets: [
          "Default: one lock on the lot for park, exit, and availability.",
          "If you need more speed later: free lists per floor and slot type, then maybe per-floor locks in a fixed order.",
          "High availability stays verbal: this diagram is in-memory logic; databases and failover sit below it.",
        ],
        callout: {
          title: "Say it, don't build it",
          body: "Interviewers want to hear how you would scale, not a full distributed design. Name the bottleneck, name the fix, move on.",
        },
      },
      {
        heading: "From blank whiteboard to finished diagram: the step-by-step path",
        paragraphs: [
          "Work in order to stay calm. Write assumptions in a corner. Put ParkingLot in the center with park, exit, and availability. To the right: Floor and ParkingSlot with SlotType. Below: Ticket linking slot and vehicle. To the left: FeeCalculator interface and HourlyFeeCalculator. Above: Receipt from exit. Walk through park and exit on the diagram before coding. If the walk-through feels wrong, fix the diagram first.",
          "Then code bottom-up: enums, Vehicle, ParkingSlot, Floor, Ticket, fee classes, then ParkingLot. End with a short demo: park a few cars, print availability, exit one, and show one error case.",
        ],
        numbered: [
          "Restate the problem; ask 5-6 questions; write assumptions on the board.",
          "List flows (park, exit, availability) and mark nouns as classes and verbs as methods.",
          "Pick classes; use fields and enums instead of empty subclasses.",
          "One sentence per class job; put validations on the class that owns the data.",
          "Draw composition for floors and slots, interface for fees, associations for tickets.",
          "Name patterns you use (Strategy, Facade) and options you rejected.",
          "Add the lot lock and say why 10k slots is fast enough.",
          "Code bottom-up; demo happy path plus at least two error cases.",
        ],
      },
    ],
    entities: [
      {
        name: 'ParkingLot',
        responsibility: 'Main entry for the lot: assign slots, issue tickets, handle exit, report availability, and hold the lock.',
        keyMembers: ['floors', 'feeCalculator', 'activeTickets', 'parkVehicle()', 'exitVehicle()', 'availability()'],
      },
      {
        name: 'Floor',
        responsibility: 'Ordered list of slots; finds the nearest free slot that fits and counts free slots by type.',
        keyMembers: ['number', 'slots', 'findNearestFreeSlot()', 'freeCounts()'],
      },
      {
        name: 'ParkingSlot',
        responsibility: 'One parking bay with a size and occupied flag; checks fit and occupy/release rules.',
        keyMembers: ['id', 'floorNumber', 'type', 'occupied', 'canFit()', 'occupy()', 'release()'],
      },
      {
        name: 'Vehicle',
        responsibility: 'License plate plus VehicleType; immutable, validated when created.',
        keyMembers: ['licensePlate', 'type'],
      },
      {
        name: 'Ticket',
        responsibility: 'Proof of an active stay: which vehicle is in which slot since when.',
        keyMembers: ['id', 'vehicle', 'slot', 'entryTime', 'minutesParked()'],
      },
      {
        name: 'Receipt',
        responsibility: 'Exit summary: ticket id, plate, duration, and amount charged.',
        keyMembers: ['ticketId', 'licensePlate', 'durationMinutes', 'amount'],
      },
      {
        name: 'FeeCalculator / HourlyFeeCalculator',
        responsibility: 'Pricing. Interface: fee from ticket and exit time. Hourly version rounds up started hours and uses per-type rates.',
        keyMembers: ['calculate()', 'hourlyRates'],
      },
      {
        name: 'VehicleType / SlotType',
        responsibility: 'Enums for vehicle kinds (MOTORCYCLE/CAR/BUS) and slot sizes (MOTORCYCLE/COMPACT/LARGE).',
      },
    ],
  },

  uml: { nodes, edges },
  umlCaption:
    'Start at ParkingLot in the center. It is the main API gates call. To the right, composition shows Floor and ParkingSlot (each slot has a SlotType). To the left, FeeCalculator is plugged in; HourlyFeeCalculator implements it. Exit produces a Receipt; active stays are Tickets below. Each Ticket ties one vehicle to one slot. Vehicle uses a VehicleType enum, not subclasses.',

  designExplanation: {
    sections: [
      {
        heading: "Architecture overview: three small worlds and one coordinator",
        paragraphs: [
          "Think of three groups plus a coordinator. Space (Floor, ParkingSlot, SlotType) answers where a vehicle can park. Identity (Vehicle, Ticket, Receipt) answers who is parked and since when. Money (FeeCalculator) answers what they owe. ParkingLot only coordinates: get a slot, record a ticket, charge on exit.",
          "That split makes changes local. New pricing touches FeeCalculator. New slot types touch Floor and ParkingSlot. New vehicle types touch the enum and small rule tables. ParkingLot changes only if the entry/exit flow changes. When someone asks what if we add X, you can often point to one box on the diagram.",
        ],
        bullets: [
          "Space: where vehicles can go - Floor, ParkingSlot, SlotType, fit rules.",
          "Identity: who is inside - Vehicle, Ticket, Receipt, set of parked plates.",
          "Money: fees only - FeeCalculator and implementations; swap without changing park/exit.",
          "Concurrency: ParkingLot owns mutable state and uses one lock on public methods so one slot never goes to two tickets.",
        ],
      },
      {
        heading: "ParkingLot: the facade and the only owner of the lock",
        paragraphs: [
          "ParkingLot exposes three methods. parkVehicle locks, rejects a plate already inside, walks floors from lowest to highest, and asks each for the nearest free slot that fits. On success it marks the slot taken, creates a Ticket, and stores it. If nothing fits, it throws so the gate can show lot full.",
          "exitVehicle locks and finds the ticket by id. Missing id means unknown or already used (blocks ticket reuse). It computes duration and fee before changing state. If pricing fails, the slot stays taken and the ticket stays valid. Then it frees the slot, removes ticket and plate, and returns a Receipt. availability uses the same lock so counts match one moment in time.",
        ],
        bullets: [
          "parkVehicle: lock, reject duplicate plate, scan floors low to high, occupy and ticket, or throw full.",
          "exitVehicle: lock, find ticket, compute fee first, release slot, remove ticket and plate, return Receipt.",
          "availability: same lock; per floor, count free slots by SlotType.",
        ],
        callout: {
          title: "Where does the lock go?",
          body: "On ParkingLot, which owns all mutable state. Extra locks on each slot add complexity and deadlock risk without helping at this scale.",
        },
      },
      {
        heading: "Floor and ParkingSlot: space, and nothing but space",
        paragraphs: [
          "Floor wraps an ordered list of slots. findNearestFreeSlot walks the list and returns the first slot that canFit the vehicle. List order is the nearest rule (entrance-first). If nearest changes later, reorder the list or add an index inside Floor only. freeCounts counts free slots by type in one pass.",
          "ParkingSlot stores id, floor number, SlotType, and occupied. canFit checks free and size match. occupy and release change occupied and throw on bad calls (double occupy or double release). No vehicle, time, or price on the slot. Ticket holds the vehicle-slot link so data stays in one place.",
        ],
        bullets: [
          "Fit rules on the bay: motorcycle any slot; car compact or large; bus large only.",
          "Floor list order defines nearest; change it in Floor without editing ParkingLot.",
          "Slots stay simple; Ticket owns who is in which slot.",
        ],
      },
      {
        heading: "Vehicle, Ticket and Receipt: small immutable values",
        paragraphs: [
          "Vehicle is immutable with a non-empty license plate and a VehicleType. Ticket is immutable too: id, vehicle, slot reference, entry time. minutesParked computes stay length and rejects exit time before entry. Fee calculator and receipt both use it so duration lives in one place.",
          "The ticket keeps a reference to the ParkingSlot object, not just an id. On exit the lot calls ticket.slot.release() with no search through all slots. Only ParkingLot changes slots under its lock, so that reference is safe.",
          "Receipt is a simple result for the gate: ticket id, plate, minutes parked, and amount. No internal object references.",
        ],
      },
      {
        heading: "Interactions: what happens on park and on exit",
        paragraphs: [
          "Park: gate calls ParkingLot.parkVehicle(vehicle). Lot locks and checks duplicate plates. For each floor in order it calls findNearestFreeSlot; slots answer canFit. First match: occupy, create Ticket, store it, add plate, unlock, return ticket.",
          "Exit: gate calls exitVehicle(ticketId). Lot locks, finds ticket, gets minutesParked, calls FeeCalculator. Then release slot, remove ticket and plate, return Receipt. Unknown ticket or bad pricing fails before any state change.",
          "Practice explaining these two flows. Park: take slot, then register ticket. Exit: compute fee, then free slot and drop ticket. That order keeps failures from leaving half-updated state.",
        ],
      },
      {
        heading: "Composition vs inheritance: vehicles and fees",
        paragraphs: [
          "Many textbook answers use Vehicle subclasses for motorcycle, car, and bus. Here those classes would only pass different constants. That is data, not behavior. Use Vehicle plus VehicleType. Slot fit rules live on ParkingSlot; rates live in FeeCalculator.",
          "Subclasses make sense when behavior really differs: a bus needing three adjacent slots, an EV starting charging, custom entry steps. Say you would add inheritance when that happens, not before.",
          "Fees change on a different schedule than vehicle type (same car, weekday hourly vs weekend flat). Put pricing behind FeeCalculator and inject it into ParkingLot. That is Strategy: composition instead of subclassing for every rate.",
        ],
      },
      {
        heading: "Alternatives considered and when they would win",
        paragraphs: [
          "Scan vs indexed free lists: scanning 10k slots is simple and fast enough. Free lists per floor and type help at much larger scale or heavy lock contention. One lot lock vs per-floor locks: one lock is easiest to reason about; per-floor locks can raise throughput but need careful lock ordering for availability.",
          "Ticket with slot object vs slot id: object reference makes exit constant-time; id fits printed or stored tickets if the lot keeps a slot map. Vehicle on slot vs on ticket: ticket is the single link. A dashboard can list occupants by iterating active tickets.",
          "Enum lookup vs polymorphism for fit rules: a small switch is fine for three types. If rules grow or vary by lot, add a CompatibilityPolicy interface. Add abstractions when the second real variation appears.",
        ],
      },
    ],
    classResponsibilities: [
      { name: 'ParkingLot', responsibility: 'Runs park, exit, and availability; owns floors, active tickets, parked plates, ticket ids, and the lock.' },
      { name: 'Floor', responsibility: 'Finds nearest free slot that fits in list order; counts free slots by type.' },
      { name: 'ParkingSlot', responsibility: 'Stores size and occupied flag; canFit; occupy and release with error on bad state.' },
      { name: 'Vehicle', responsibility: 'Immutable: validated license plate and VehicleType.' },
      { name: 'Ticket', responsibility: 'Links vehicle, slot, and entry time; minutesParked for any exit time.' },
      { name: 'Receipt', responsibility: 'Exit summary: ticket id, plate, duration, amount.' },
      { name: 'FeeCalculator', responsibility: 'Interface: calculate(ticket, exitTime) returns amount owed.' },
      { name: 'HourlyFeeCalculator', responsibility: 'Bill by started hours (min one hour) times hourly rate per vehicle type.' },
    ],
    patterns: [
      {
        name: 'Strategy (fee calculation)',
        why: 'Pricing changes often and does not follow slot layout. An interface lets you add weekend, flat, or surge rules without editing ParkingLot.',
        howApplied: 'FeeCalculator has calculate(ticket, exitTime). HourlyFeeCalculator uses ceil hours times rate. ParkingLot gets a FeeCalculator in its constructor and calls it on exit. Tests can pass a fake that returns a fixed amount.',
      },
      {
        name: 'Facade (ParkingLot)',
        why: 'Gate code should not touch floors, slots, locks, or tickets. A small public API keeps callers simple and centralizes thread safety.',
        howApplied: 'ParkingLot only exposes parkVehicle, exitVehicle, and availability. Callers get Ticket and Receipt values, not live slot objects.',
      },
      {
        name: 'Observer (mentioned, not built)',
        why: 'Live display boards may need instant updates instead of polling availability().',
        howApplied: 'Not in the core code. You could add listeners on ParkingLot and notify after occupy or release, without changing park/exit signatures.',
      },
    ],
    decisions: [
      {
        decision: 'Single Vehicle class with a VehicleType enum instead of Motorcycle/Car/Bus subclasses.',
        rationale: 'Types only differ by which slots fit and which rate applies. Enum plus small rules is simpler to test and extend.',
        tradeoff: 'If behavior diverges later (multi-slot bus, EV charging), add subclasses or a capability object then.',
        alternativeRejected: 'Abstract Vehicle with three subclasses that only pass constants.',
      },
      {
        decision: 'Nearest = lowest floor first, then first free compatible slot in the floor list.',
        rationale: 'Simple to explain, code, and test; fast enough for 10k slots.',
        tradeoff: 'Not real walking distance; a motorcycle might take a large slot while a smaller one exists later in the list.',
        alternativeRejected: 'Graph or geometry for true distance - too heavy for a typical LLD interview.',
      },
      {
        decision: 'One lock on ParkingLot for park, exit, and availability.',
        rationale: 'Find slot, occupy, and ticket stay atomic with minimal mental overhead; lock time is tiny.',
        tradeoff: 'All gates share one lock; throughput is still fine at stated scale.',
        alternativeRejected: 'Per-slot or per-floor locks - more throughput, more lock-order bugs.',
      },
      {
        decision: 'Ticket holds ParkingSlot reference (not just id) and is the only vehicle-slot link.',
        rationale: 'Exit is fast with no slot search; one place defines who is parked where.',
        tradeoff: 'Persisted or printed tickets may need id lookup in the lot.',
        alternativeRejected: 'Vehicle on slot and ids on ticket - two links to keep in sync.',
      },
      {
        decision: 'FeeCalculator is injected; ParkingLot does not compute fees itself.',
        rationale: 'Pricing changes often; isolation keeps exit code stable and easy to test.',
        tradeoff: 'One more interface for a simple formula today.',
        alternativeRejected: 'Switch on VehicleType inside exitVehicle.',
      },
      {
        decision: 'On exit, compute duration and fee before changing state.',
        rationale: 'If pricing fails, slot and ticket stay valid; no half-finished exit.',
        alternativeRejected: 'Release slot first, then compute fee - can free slot while ticket still looks active on error.',
      },
    ],
    solid: {
      heading: 'SOLID, applied to this design',
      paragraphs: [
        "Single Responsibility: each class has one main reason to change. ParkingSlot if bay rules change; FeeCalculator if pricing changes; Ticket if stay data changes; ParkingLot if entry/exit flow changes. A ParkingLot that also stores rates and fit rules would violate this.",
        "Open/Closed: add pricing by new FeeCalculator classes wired in at startup; ParkingLot code stays the same. Add vehicles by enum value and rule table entries. Slot fit switch is a small edit point; grow it into a policy object if rules multiply.",
        "Liskov Substitution: any FeeCalculator must return a non-negative fee for valid ticket and exit time and must not mutate the ticket. Test fakes must follow the same contract.",
        "Interface Segregation: FeeCalculator has one method. Gates see only ParkingLot's three methods, not occupy or release on slots.",
        "Dependency Inversion: ParkingLot depends on FeeCalculator interface, not HourlyFeeCalculator. main (or tests) picks the concrete calculator. That makes unit tests with a fixed-fee fake straightforward.",
      ],
    },
    extensibility: [
      'New fee rules (weekend, daily cap, surge): new FeeCalculator class, inject at startup; ParkingLot unchanged.',
      'New vehicle type: add VehicleType value, fit rule, and rate in calculator config.',
      'New slot type (EV, handicapped, reserved): add SlotType and fit rules; Floor and ParkingLot APIs stay the same.',
      'Faster assignment: free list or ordered set per type inside Floor; keep findNearestFreeSlot signature.',
      'Live boards: listeners on ParkingLot, events after occupy or release.',
      'Multi-slot vehicles: Floor finds N adjacent slots; Ticket holds multiple slot references.',
      'Persistence or HA: store tickets and occupancy externally; same classes, different storage layer.',
    ],
  },

  implementationIntro: [
    "The six code samples below share the same classes and demo. Pick the language you will use in the interview and compare with the others if you want. Each version has the enums, Vehicle, ParkingSlot, Floor, Ticket, Receipt, FeeCalculator with HourlyFeeCalculator, and ParkingLot with park, exit, and availability.",
    "Three habits repeat in every language: validate inputs early (blank plate, duplicate plate, unknown ticket, exit before entry), compute the fee before freeing the slot on exit, and use one lock on each public ParkingLot method. Entry and exit times can be passed in so the demo can show a 65-minute stay without waiting. TypeScript notes that a single-threaded event loop already serializes each call.",
  ],

  executionFlow: {
    narrative: [
      "The demo uses two floors. Floor 1 has one motorcycle, one compact, and one large slot. Floor 2 has one compact and one large. Hourly rates are 10 for motorcycles, 20 for cars, and 50 for buses. Four vehicles park at 09:00. The motorcycle gets the motorcycle bay on floor 1. The first car skips the motorcycle bay and takes F1-C1. The bus takes F1-L1. The second car finds floor 1 full for cars and gets F2-C1.",
      "Availability shows floor 1 full and floor 2 with one free large slot. At 10:05 the first car exits. Sixty-five minutes rounds up to two hours at 20 per hour, so the receipt is 40. F1-C1 is free again; the next car gets F1-C1, showing exit works and lower floors are tried first.",
      "A second bus takes the last large slot. A third bus gets an error because no large slot is free. Using the first car's ticket again also fails because exit removed it. The demo hits park, exit, availability, lot full, and ticket reuse.",
    ],
    steps: [
      'Build floors with slots in entrance order (demo: two floors) and create ParkingLot with HourlyFeeCalculator.',
      'parkVehicle: lock; reject duplicate plate; walk floors from low to high; ask each for nearest free slot that fits.',
      'On match: occupy slot, create Ticket, store by id, record plate, return ticket.',
      'If no slot fits: throw no free slot error; change nothing.',
      'availability: lock; for each floor, count free slots per SlotType.',
      'exitVehicle: lock; find ticket; compute minutes and fee; then release slot, remove ticket and plate; return Receipt.',
      'Bad or reused ticket id: fail at once with no state change.',
    ],
    examples: [
      {
        title: 'Car is placed on the first compatible slot',
        input: 'park(Car KA-01-C-2222) at 09:00; floor 1 has F1-M1 (motorcycle), F1-C1 (compact), F1-L1 (large) free',
        output: 'Ticket T-000002 → slot F1-C1 (floor 1), entry 09:00',
        explanation: 'A car cannot use F1-M1. F1-C1 is the first free compact slot in order, so it is taken.',
      },
      {
        title: 'Overflow to the next floor',
        input: 'park(Car KA-01-C-4444) at 09:00 after floor 1 has been filled by a motorcycle, a car and a bus',
        output: 'Ticket T-000004 → slot F2-C1 (floor 2)',
        explanation: 'Floor 1 has no free compact or large slot for this car, so the lot tries floor 2 and assigns F2-C1.',
      },
      {
        title: 'Exit after 65 minutes',
        input: 'exit(T-000002) at 10:05 with car rate 20 per hour',
        output: 'Receipt{duration=65 min, amount=40}',
        explanation: '65 minutes bills as 2 started hours. 2 times 20 is 40. F1-C1 is free for the next car.',
      },
      {
        title: 'Lot full for buses',
        input: 'park(Bus KA-01-B-7777) when both large slots (F1-L1 and F2-L1) are occupied',
        output: 'Error: no free slot for a BUS',
        explanation: 'Buses need large slots. Both are full, so park throws and nothing changes. Cars might still park if compact slots are free.',
      },
      {
        title: 'Ticket reuse is rejected',
        input: 'exit(T-000002) a second time',
        output: 'Error: unknown or already used ticket',
        explanation: 'First exit removed the ticket from the active map. Second exit finds no ticket and fails with no side effects.',
      },
    ],
  },

  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },

  followUps: [
    {
      question: 'Scanning slots is O(slots). How would you make assignment faster for a much bigger lot?',
      answer:
        "Keep a free list per floor and slot type (ordered set or heap by slot position). Pick the smallest position on the lowest floor that fits. Updates on occupy and release stay on that structure. Hide it inside Floor.findNearestFreeSlot. For 10k slots a scan is already fast enough and simpler.",
    },
    {
      question: 'One lock for the whole lot sounds crude. How would you scale to many gates?',
      answer:
        "Measure first: the locked section is microseconds, so one lock handles far more traffic than real gates need. If contention shows up, use per-floor locks in a fixed floor order to avoid deadlock. Later, free lists with atomic claim can reduce locking. Each step trades more code for more throughput.",
    },
    {
      question: 'How would a bus that needs several adjacent slots work?',
      answer:
        "Add a slot count (or subclass) when behavior really differs. Floor searches for N consecutive free slots. Ticket holds a list of slots; occupy and release loop over them, all inside one lot lock so you take all or none. ParkingLot's public API stays the same.",
    },
    {
      question: 'Why does Ticket hold the slot object rather than just a slot id?',
      answer:
        "Exit needs the slot immediately; a reference avoids scanning every bay. One object links vehicle and slot. If tickets are printed or stored in a DB, store slot id on the ticket and keep a slot map in the lot. Floor and ParkingSlot stay unchanged.",
    },
    {
      question: 'What if a driver loses the ticket?',
      answer:
        "Exit normally uses ticket id. For lost tickets, map license plate to ticket (extend the parked-plate set to a map) and add lostTicketExit after ID check. Charge normal fee plus penalty via a wrapper FeeCalculator. Slot logic stays the same.",
    },
    {
      question: 'How would you add weekend pricing or a daily cap?',
      answer:
        "Add a new FeeCalculator and inject it. Weekend logic reads entry time and picks rates. Daily cap can wrap another calculator and return min(underlying fee, cap). ParkingLot still only calls calculate; test each calculator with fixed times.",
    },
    {
      question: 'Should ParkingLot be a Singleton?',
      answer:
        "One lot per process is usually a deployment choice, not a Singleton in code. Passing ParkingLot into callers is easier to test. If asked, you can show a thread-safe Singleton, but avoid hiding dependencies everywhere.",
    },
    {
      question: 'How would the design change if there were several lots in a city?',
      answer:
        "Each ParkingLot already stands alone. Add a CityParkingService that holds many lots and routes by location or availability. It only calls availability and parkVehicle on each lot, never internal slot APIs.",
    },
    {
      question: 'High availability: what happens if the process crashes?',
      answer:
        "Discuss outside the diagram: persist slot occupancy and active tickets on each change, rebuild memory on startup. Use standby or replication for failover. These classes stay the logic layer; in multi-node setup the lock becomes a DB transaction or distributed lease.",
    },
    {
      question: 'How would you display live availability on boards?',
      answer:
        "Start with boards polling availability() for a snapshot. If that is too heavy, add listeners on ParkingLot and fire events after occupy or release, ideally after releasing the lock so slow boards do not block gates. Park and exit code stay the same.",
    },
  ],

  extras: {
    edgeCases: {
      heading: 'Edge cases worth handling (and saying out loud)',
      paragraphs: [
        "Capacity: lot full for a vehicle type - clear error, no state change. Motorcycle bays full but large slot free - motorcycle may use large slot; say that buses might lose out later.",
        "Identity: same plate twice, same ticket twice, unknown ticket id - all fail with no side effects. Ticket map lookup also proves the ticket was not already used.",
        "Time: very short stay still pays one hour minimum. Exit before entry is rejected in minutesParked. Production needs a reliable clock; demos pass time in for tests.",
        "Concurrency: two threads for the last compact slot - lock lets one win, other sees full. availability during park sees a full before or after snapshot, never half-updated counts.",
      ],
    },
    commonMistakes: {
      heading: 'Common mistakes to avoid',
      paragraphs: [
        "God class ParkingLot: slots, fit rules, pricing, and tickets all in one place. It may run but is hard to extend or test. Split work across classes.",
        "Empty Vehicle subclasses with no overridden behavior. Use VehicleType unless you can name real polymorphic behavior.",
        "Skipping error paths: no release on exit, ticket reuse, fee after freeing slot. Small checks on each method matter.",
        "Saying thread-safe without pointing to the lock on park, exit, and availability. Do not over-engineer with per-slot locks in a basic LLD.",
        "Building payment, ANPR, reservations, or messaging when the prompt did not ask. Mention those as future extensions.",
      ],
      bullets: [
        'Fee logic inside ParkingSlot or Vehicle.',
        'Static global ParkingLot shared by all tests.',
        'Floating-point money in production (demo uses double; prefer cents or decimal).',
        'Returning live Slot objects from the lot API so callers bypass the lock.',
      ],
    },
    testing: {
      heading: 'How to test this design',
      paragraphs: [
        "Unit test ParkingSlot canFit for every vehicle and slot type, free and occupied, plus double occupy and double release errors. Test HourlyFeeCalculator with fixed times: 0 and 1 minute bill one hour, 60 one hour, 61 two hours, per vehicle rate, and exit before entry fails.",
        "Integration test ParkingLot on a small two-floor fixture like the demo: lower floor first, overflow to floor 2, slot reused after exit, duplicate plate rejected, bad ticket rejected, full lot unchanged. Use a fake FeeCalculator with a fixed fee to separate exit logic from pricing.",
        "Concurrency test: N threads park into N slots - all succeed, all slots different. N+1 thread - exactly one failure. Repeat; missing lock fails this quickly.",
      ],
      bullets: [
        'canFit table: all 9 vehicle/slot combinations times free/occupied.',
        'Fee boundaries: 0, 1, 59, 60, 61, 120, 121 minutes per vehicle type.',
        'Park, exit, park again reuses the same slot.',
        'availability before and after park/exit matches expected counts.',
        'Concurrent park of N vehicles into N slots, then N+1 (exactly one rejection).',
      ],
    },
    complexity: [
      'parkVehicle: O(F × S) worst case scanning F floors of S slots each (10,000 slots ≈ tens of microseconds); with per-type free lists it becomes O(F + log S).',
      'exitVehicle: O(1) - map lookup by ticket id plus a slot release through the ticket\'s direct reference; fee calculation is O(1).',
      'availability: O(F × S) to count; O(F) if each floor maintains running counters updated on occupy/release.',
      'Space: O(S) for slots plus O(A) for A active tickets and parked plates.',
      'Latency vs the 100 ms target: a linear scan over 10k slots plus lock acquisition is several orders of magnitude below it.',
    ],
    extensions: [
      'Reserved, handicapped and EV charging slots as new SlotType values with their own compatibility.',
      'Free lists per (floor, type) for sub-linear assignment, and per-floor locks if contention appears.',
      'Observer-based live display boards and event logs.',
      'Lost-ticket handling by plate lookup with a penalty fee decorator.',
      'Monthly passes and prepaid wallets as alternative FeeCalculators.',
      'Multi-slot vehicles and contiguous allocation for buses.',
      'Persistence and a hot standby for crash recovery (discussed verbally).',
    ],
    takeaways: [
      'Ask a few clear questions and write assumptions on the board.',
      'Mark nouns and verbs in the prompt; ask whose job each verb is.',
      'Small classes: slot owns occupancy, ticket owns vehicle-slot link, calculator owns fees, lot coordinates.',
      'Use enums when types differ by data; use inheritance when behavior differs.',
      'Strategy for fees and Facade for ParkingLot are the main patterns here.',
      'One lock on park, exit, and availability is enough for 10k slots; describe scaling verbally.',
      'On exit, compute fee before freeing the slot; errors should not change state.',
      'Talk about HA in words; keep the diagram focused on classes.',
    ],
  },
}
