import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'TrafficLightSystemService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_traffic_lights', 'Map<string, TrafficLight>'),
    attr('-', '_signals', 'Map<string, Signal>'),
    attr('-', '_yellows', 'Map<string, YELLOW>'),
    attr('-', '_greens', 'Map<string, GREEN>'),
    attr('-', '_roads', 'Map<string, Road>'),
  ], [
    method('+', 'createTrafficLight', 'name: string', 'TrafficLight'),
    method('+', 'createSignal', 'name: string', 'Signal'),
    method('+', 'createYELLOW', 'name: string', 'YELLOW'),
    method('+', 'createGREEN', 'name: string', 'GREEN'),
    method('+', 'createRoad', 'name: string', 'Road'),
    method('+', 'getTrafficLight', 'id: string', 'TrafficLight'),
    method('+', 'getSignal', 'id: string', 'Signal'),
    method('+', 'getYELLOW', 'id: string', 'YELLOW'),
    method('+', 'getGREEN', 'id: string', 'GREEN'),
    method('+', 'getRoad', 'id: string', 'Road'),
    method('+', 'closeTrafficLight', 'id: string', 'TrafficLight'),
  ], 'facade'),
  cls('n1', 'TrafficLight', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Signal', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'YELLOW', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'GREEN', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Road', GRID.x(2), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
]

const edges = [
  edge('e1', 'n0', 'n1', 'composition', 'right', 'left'),
  edge('e2', 'n0', 'n2', 'composition', 'right', 'left'),
  edge('e3', 'n0', 'n3', 'composition', 'right', 'left'),
  edge('e4', 'n0', 'n4', 'composition', 'right', 'left'),
  edge('e5', 'n0', 'n5', 'composition', 'right', 'left'),
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("traffic-light-system")


class TrafficLight:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("TrafficLight.id is required")
        if not name or not name.strip():
            raise ValueError("TrafficLight.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[TrafficLight.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"TrafficLight {self.id} has invalid status={self.status}")
        log.info("[TrafficLight.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"TrafficLight {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[TrafficLight.close] id=%s -> CLOSED", self.id)


class Signal:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Signal.id is required")
        if not name or not name.strip():
            raise ValueError("Signal.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Signal.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Signal {self.id} has invalid status={self.status}")
        log.info("[Signal.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Signal {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Signal.close] id=%s -> CLOSED", self.id)


class YELLOW:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("YELLOW.id is required")
        if not name or not name.strip():
            raise ValueError("YELLOW.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[YELLOW.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"YELLOW {self.id} has invalid status={self.status}")
        log.info("[YELLOW.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"YELLOW {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[YELLOW.close] id=%s -> CLOSED", self.id)


class GREEN:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("GREEN.id is required")
        if not name or not name.strip():
            raise ValueError("GREEN.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[GREEN.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"GREEN {self.id} has invalid status={self.status}")
        log.info("[GREEN.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"GREEN {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[GREEN.close] id=%s -> CLOSED", self.id)


class Road:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Road.id is required")
        if not name or not name.strip():
            raise ValueError("Road.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Road.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Road {self.id} has invalid status={self.status}")
        log.info("[Road.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Road {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Road.close] id=%s -> CLOSED", self.id)


class TrafficLightSystemService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._traffic_lights: Dict[str, TrafficLight] = {}
        self._signals: Dict[str, Signal] = {}
        self._yellows: Dict[str, YELLOW] = {}
        self._greens: Dict[str, GREEN] = {}
        self._roads: Dict[str, Road] = {}
        log.info("[TrafficLightSystemService.__init__] system ready; managing: TrafficLight, Signal, YELLOW, GREEN, Road")

    def create_traffic_light(self, name: str) -> TrafficLight:
        """UML: TrafficLightSystemService.create_traffic_light(name) -> TrafficLight"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("TrafficLight name is required")
        with self._lock:
            item_id = f"TRA-{self._seq:04d}"
            self._seq += 1
            obj = TrafficLight(item_id, cleaned)
            obj.validate()
            self._traffic_lights[item_id] = obj
            log.info("[TrafficLightSystemService.create_traffic_light] stored %s in _traffic_lights (count=%s)", item_id, len(self._traffic_lights))
            return obj

    def get_traffic_light(self, item_id: str) -> TrafficLight:
        with self._lock:
            obj = self._traffic_lights.get(item_id)
            if obj is None:
                raise KeyError(f"unknown TrafficLight id: {item_id}")
            log.info("[TrafficLightSystemService.get_traffic_light] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_signal(self, name: str) -> Signal:
        """UML: TrafficLightSystemService.create_signal(name) -> Signal"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Signal name is required")
        with self._lock:
            item_id = f"SIG-{self._seq:04d}"
            self._seq += 1
            obj = Signal(item_id, cleaned)
            obj.validate()
            self._signals[item_id] = obj
            log.info("[TrafficLightSystemService.create_signal] stored %s in _signals (count=%s)", item_id, len(self._signals))
            return obj

    def get_signal(self, item_id: str) -> Signal:
        with self._lock:
            obj = self._signals.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Signal id: {item_id}")
            log.info("[TrafficLightSystemService.get_signal] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_yellow(self, name: str) -> YELLOW:
        """UML: TrafficLightSystemService.create_yellow(name) -> YELLOW"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("YELLOW name is required")
        with self._lock:
            item_id = f"YEL-{self._seq:04d}"
            self._seq += 1
            obj = YELLOW(item_id, cleaned)
            obj.validate()
            self._yellows[item_id] = obj
            log.info("[TrafficLightSystemService.create_yellow] stored %s in _yellows (count=%s)", item_id, len(self._yellows))
            return obj

    def get_yellow(self, item_id: str) -> YELLOW:
        with self._lock:
            obj = self._yellows.get(item_id)
            if obj is None:
                raise KeyError(f"unknown YELLOW id: {item_id}")
            log.info("[TrafficLightSystemService.get_yellow] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_green(self, name: str) -> GREEN:
        """UML: TrafficLightSystemService.create_green(name) -> GREEN"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("GREEN name is required")
        with self._lock:
            item_id = f"GRE-{self._seq:04d}"
            self._seq += 1
            obj = GREEN(item_id, cleaned)
            obj.validate()
            self._greens[item_id] = obj
            log.info("[TrafficLightSystemService.create_green] stored %s in _greens (count=%s)", item_id, len(self._greens))
            return obj

    def get_green(self, item_id: str) -> GREEN:
        with self._lock:
            obj = self._greens.get(item_id)
            if obj is None:
                raise KeyError(f"unknown GREEN id: {item_id}")
            log.info("[TrafficLightSystemService.get_green] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_road(self, name: str) -> Road:
        """UML: TrafficLightSystemService.create_road(name) -> Road"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Road name is required")
        with self._lock:
            item_id = f"ROA-{self._seq:04d}"
            self._seq += 1
            obj = Road(item_id, cleaned)
            obj.validate()
            self._roads[item_id] = obj
            log.info("[TrafficLightSystemService.create_road] stored %s in _roads (count=%s)", item_id, len(self._roads))
            return obj

    def get_road(self, item_id: str) -> Road:
        with self._lock:
            obj = self._roads.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Road id: {item_id}")
            log.info("[TrafficLightSystemService.get_road] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_traffic_light(self, item_id: str) -> TrafficLight:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._traffic_lights.get(item_id)
            if obj is None:
                raise KeyError(f"unknown TrafficLight id: {item_id}")
            log.info("[TrafficLightSystemService.close_traffic_light] closing %s via TrafficLight.close()", item_id)
            obj.close()
            return obj

    def list_active_traffic_lights(self) -> List[TrafficLight]:
        with self._lock:
            active = [o for o in self._traffic_lights.values() if o.status == "ACTIVE"]
            log.info("[TrafficLightSystemService.list_active_traffic_lights] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct TrafficLightSystemService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = TrafficLightSystemService()

    log.info("========== STEP 2: Create primary TrafficLight objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_traffic_light("alpha-traffic_light")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_traffic_light("beta-traffic_light")

    log.info("========== STEP 3: Create Signal (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_signal("sample-signal")

    log.info("========== STEP 4: Create YELLOW (UML class) ==========")
    system.create_yellow("sample-yellow")

    log.info("========== STEP 5: Create GREEN (UML class) ==========")
    system.create_green("sample-green")

    log.info("========== STEP 6: Create Road (UML class) ==========")
    system.create_road("sample-road")

    log.info("========== STEP 7: Inspect active TrafficLight list ==========")
    system.list_active_traffic_lights()

    log.info("========== STEP 8: Close first TrafficLight ==========")
    system.close_traffic_light(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_traffic_light(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from TrafficLight.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_traffic_light("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_traffic_light: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_traffic_lights()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class TrafficLight {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  TrafficLight(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("TrafficLight.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TrafficLight.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[TrafficLight.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("TrafficLight " + id + " invalid status");
    }
    System.out.println("[TrafficLight.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("TrafficLight " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[TrafficLight.close] id=" + id + " -> CLOSED");
  }
}


class Signal {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Signal(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Signal.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Signal.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Signal.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("Signal " + id + " invalid status");
    }
    System.out.println("[Signal.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Signal " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Signal.close] id=" + id + " -> CLOSED");
  }
}


class YELLOW {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  YELLOW(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("YELLOW.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("YELLOW.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[YELLOW.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("YELLOW " + id + " invalid status");
    }
    System.out.println("[YELLOW.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("YELLOW " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[YELLOW.close] id=" + id + " -> CLOSED");
  }
}


class GREEN {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  GREEN(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("GREEN.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("GREEN.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[GREEN.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("GREEN " + id + " invalid status");
    }
    System.out.println("[GREEN.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("GREEN " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[GREEN.close] id=" + id + " -> CLOSED");
  }
}


class Road {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Road(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Road.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Road.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Road.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("Road " + id + " invalid status");
    }
    System.out.println("[Road.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Road " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Road.close] id=" + id + " -> CLOSED");
  }
}

public class TrafficLightSystemService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, TrafficLight> traffic_lights = new LinkedHashMap<>();
  private final Map<String, Signal> signals = new LinkedHashMap<>();
  private final Map<String, YELLOW> yellows = new LinkedHashMap<>();
  private final Map<String, GREEN> greens = new LinkedHashMap<>();
  private final Map<String, Road> roads = new LinkedHashMap<>();

  public TrafficLightSystemService() {
    System.out.println("[TrafficLightSystemService.__init__] system ready");
  }

  public TrafficLight createTrafficLight(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TrafficLight name required");
    }
    lock.lock();
    try {
      String id = String.format("TRA-%04d", seq++);
      TrafficLight obj = new TrafficLight(id, name.trim());
      obj.validate();
      traffic_lights.put(id, obj);
      System.out.println("[TrafficLightSystemService.createTrafficLight] stored " + id + " count=" + traffic_lights.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public TrafficLight getTrafficLight(String id) {
    lock.lock();
    try {
      TrafficLight obj = traffic_lights.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown TrafficLight id: " + id);
      }
      System.out.println("[TrafficLightSystemService.getTrafficLight] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Signal createSignal(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Signal name required");
    }
    lock.lock();
    try {
      String id = String.format("SIG-%04d", seq++);
      Signal obj = new Signal(id, name.trim());
      obj.validate();
      signals.put(id, obj);
      System.out.println("[TrafficLightSystemService.createSignal] stored " + id + " count=" + signals.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Signal getSignal(String id) {
    lock.lock();
    try {
      Signal obj = signals.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Signal id: " + id);
      }
      System.out.println("[TrafficLightSystemService.getSignal] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public YELLOW createYELLOW(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("YELLOW name required");
    }
    lock.lock();
    try {
      String id = String.format("YEL-%04d", seq++);
      YELLOW obj = new YELLOW(id, name.trim());
      obj.validate();
      yellows.put(id, obj);
      System.out.println("[TrafficLightSystemService.createYELLOW] stored " + id + " count=" + yellows.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public YELLOW getYELLOW(String id) {
    lock.lock();
    try {
      YELLOW obj = yellows.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown YELLOW id: " + id);
      }
      System.out.println("[TrafficLightSystemService.getYELLOW] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public GREEN createGREEN(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("GREEN name required");
    }
    lock.lock();
    try {
      String id = String.format("GRE-%04d", seq++);
      GREEN obj = new GREEN(id, name.trim());
      obj.validate();
      greens.put(id, obj);
      System.out.println("[TrafficLightSystemService.createGREEN] stored " + id + " count=" + greens.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public GREEN getGREEN(String id) {
    lock.lock();
    try {
      GREEN obj = greens.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown GREEN id: " + id);
      }
      System.out.println("[TrafficLightSystemService.getGREEN] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Road createRoad(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Road name required");
    }
    lock.lock();
    try {
      String id = String.format("ROA-%04d", seq++);
      Road obj = new Road(id, name.trim());
      obj.validate();
      roads.put(id, obj);
      System.out.println("[TrafficLightSystemService.createRoad] stored " + id + " count=" + roads.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Road getRoad(String id) {
    lock.lock();
    try {
      Road obj = roads.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Road id: " + id);
      }
      System.out.println("[TrafficLightSystemService.getRoad] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public TrafficLight closeTrafficLight(String id) {
    lock.lock();
    try {
      TrafficLight obj = traffic_lights.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown TrafficLight id: " + id);
      }
      System.out.println("[TrafficLightSystemService.closeTrafficLight] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<TrafficLight> listActiveTrafficLights() {
    lock.lock();
    try {
      List<TrafficLight> out = new ArrayList<>();
      for (TrafficLight o : traffic_lights.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[TrafficLightSystemService.listActiveTrafficLights] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct TrafficLightSystemService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    TrafficLightSystemService system = new TrafficLightSystemService();
    System.out.println("========== STEP 2: Create TrafficLight objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    TrafficLight first = system.createTrafficLight("alpha-traffic_light");
    system.createTrafficLight("beta-traffic_light");
    System.out.println("========== STEP 3: Create Signal ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createSignal("sample-signal");
    System.out.println("========== STEP 4: Create YELLOW ==========");
    system.createYELLOW("sample-yellow");
    System.out.println("========== STEP 5: Create GREEN ==========");
    system.createGREEN("sample-green");
    System.out.println("========== STEP 6: Create Road ==========");
    system.createRoad("sample-road");
    System.out.println("========== Inspect active list ==========");
    system.listActiveTrafficLights();
    System.out.println("========== Close first TrafficLight ==========");
    system.closeTrafficLight(first.getId());
    try {
      system.closeTrafficLight(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getTrafficLight("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class TrafficLight {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('TrafficLight.id required')
    }

    if (!name?.trim()) {
      throw new Error('TrafficLight.name required')
    }
    console.log(\`[TrafficLight.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`TrafficLight \${this.id} invalid status\`)
    }
    console.log(\`[TrafficLight.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`TrafficLight \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[TrafficLight.close] id=\${this.id} -> CLOSED\`)
  }
}


class Signal {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Signal.id required')
    }

    if (!name?.trim()) {
      throw new Error('Signal.name required')
    }
    console.log(\`[Signal.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Signal \${this.id} invalid status\`)
    }
    console.log(\`[Signal.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Signal \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Signal.close] id=\${this.id} -> CLOSED\`)
  }
}


class YELLOW {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('YELLOW.id required')
    }

    if (!name?.trim()) {
      throw new Error('YELLOW.name required')
    }
    console.log(\`[YELLOW.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`YELLOW \${this.id} invalid status\`)
    }
    console.log(\`[YELLOW.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`YELLOW \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[YELLOW.close] id=\${this.id} -> CLOSED\`)
  }
}


class GREEN {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('GREEN.id required')
    }

    if (!name?.trim()) {
      throw new Error('GREEN.name required')
    }
    console.log(\`[GREEN.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`GREEN \${this.id} invalid status\`)
    }
    console.log(\`[GREEN.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`GREEN \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[GREEN.close] id=\${this.id} -> CLOSED\`)
  }
}


class Road {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Road.id required')
    }

    if (!name?.trim()) {
      throw new Error('Road.name required')
    }
    console.log(\`[Road.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Road \${this.id} invalid status\`)
    }
    console.log(\`[Road.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Road \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Road.close] id=\${this.id} -> CLOSED\`)
  }
}

class TrafficLightSystemService {
  private seq = 1
  private traffic_lights = new Map<string, TrafficLight>()
  private signals = new Map<string, Signal>()
  private yellows = new Map<string, YELLOW>()
  private greens = new Map<string, GREEN>()
  private roads = new Map<string, Road>()
  constructor() {
    console.log('[TrafficLightSystemService.__init__] system ready')
  }

  createTrafficLight(name: string): TrafficLight {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('TrafficLight name required')
    }
    const id = \`TRA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new TrafficLight(id, cleaned)
    obj.validate()
    this.traffic_lights.set(id, obj)
    console.log(\`[TrafficLightSystemService.createTrafficLight] stored \${id} count=\${this.traffic_lights.size}\`)
    return obj
  }

  getTrafficLight(id: string): TrafficLight {
    const obj = this.traffic_lights.get(id)
    if (!obj) {
      throw new Error(\`unknown TrafficLight id: \${id}\`)
    }
    console.log(\`[TrafficLightSystemService.getTrafficLight] found id=\${obj.id}\`)
    return obj
  }

  createSignal(name: string): Signal {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Signal name required')
    }
    const id = \`SIG-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Signal(id, cleaned)
    obj.validate()
    this.signals.set(id, obj)
    console.log(\`[TrafficLightSystemService.createSignal] stored \${id} count=\${this.signals.size}\`)
    return obj
  }

  getSignal(id: string): Signal {
    const obj = this.signals.get(id)
    if (!obj) {
      throw new Error(\`unknown Signal id: \${id}\`)
    }
    console.log(\`[TrafficLightSystemService.getSignal] found id=\${obj.id}\`)
    return obj
  }

  createYELLOW(name: string): YELLOW {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('YELLOW name required')
    }
    const id = \`YEL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new YELLOW(id, cleaned)
    obj.validate()
    this.yellows.set(id, obj)
    console.log(\`[TrafficLightSystemService.createYELLOW] stored \${id} count=\${this.yellows.size}\`)
    return obj
  }

  getYELLOW(id: string): YELLOW {
    const obj = this.yellows.get(id)
    if (!obj) {
      throw new Error(\`unknown YELLOW id: \${id}\`)
    }
    console.log(\`[TrafficLightSystemService.getYELLOW] found id=\${obj.id}\`)
    return obj
  }

  createGREEN(name: string): GREEN {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('GREEN name required')
    }
    const id = \`GRE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new GREEN(id, cleaned)
    obj.validate()
    this.greens.set(id, obj)
    console.log(\`[TrafficLightSystemService.createGREEN] stored \${id} count=\${this.greens.size}\`)
    return obj
  }

  getGREEN(id: string): GREEN {
    const obj = this.greens.get(id)
    if (!obj) {
      throw new Error(\`unknown GREEN id: \${id}\`)
    }
    console.log(\`[TrafficLightSystemService.getGREEN] found id=\${obj.id}\`)
    return obj
  }

  createRoad(name: string): Road {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Road name required')
    }
    const id = \`ROA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Road(id, cleaned)
    obj.validate()
    this.roads.set(id, obj)
    console.log(\`[TrafficLightSystemService.createRoad] stored \${id} count=\${this.roads.size}\`)
    return obj
  }

  getRoad(id: string): Road {
    const obj = this.roads.get(id)
    if (!obj) {
      throw new Error(\`unknown Road id: \${id}\`)
    }
    console.log(\`[TrafficLightSystemService.getRoad] found id=\${obj.id}\`)
    return obj
  }

  closeTrafficLight(id: string): TrafficLight {
    const obj = this.getTrafficLight(id)
    console.log(\`[TrafficLightSystemService.closeTrafficLight] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveTrafficLights(): TrafficLight[] {
    const active = [...this.traffic_lights.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[TrafficLightSystemService.listActiveTrafficLights] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct TrafficLightSystemService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new TrafficLightSystemService()
  console.log('========== STEP 2: Create TrafficLight objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createTrafficLight('alpha-traffic_light')
  system.createTrafficLight('beta-traffic_light')
  console.log('========== STEP 3: Create Signal ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createSignal('sample-signal')
  console.log('========== STEP 4: Create YELLOW ==========')
  system.createYELLOW('sample-yellow')
  console.log('========== STEP 5: Create GREEN ==========')
  system.createGREEN('sample-green')
  console.log('========== STEP 6: Create Road ==========')
  system.createRoad('sample-road')
  system.listActiveTrafficLights()
  console.log('========== Close first TrafficLight ==========')
  system.closeTrafficLight(first.id)
  try {
    system.closeTrafficLight(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getTrafficLight('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class TrafficLight {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  TrafficLight(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("TrafficLight requires id and name");
    }
    cout << "[TrafficLight.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("TrafficLight invalid status");
    }
    cout << "[TrafficLight.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("TrafficLight cannot close");
    }
    status_ = "CLOSED";
    cout << "[TrafficLight.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Signal {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Signal(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Signal requires id and name");
    }
    cout << "[Signal.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("Signal invalid status");
    }
    cout << "[Signal.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Signal cannot close");
    }
    status_ = "CLOSED";
    cout << "[Signal.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class YELLOW {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  YELLOW(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("YELLOW requires id and name");
    }
    cout << "[YELLOW.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("YELLOW invalid status");
    }
    cout << "[YELLOW.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("YELLOW cannot close");
    }
    status_ = "CLOSED";
    cout << "[YELLOW.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class GREEN {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  GREEN(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("GREEN requires id and name");
    }
    cout << "[GREEN.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("GREEN invalid status");
    }
    cout << "[GREEN.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("GREEN cannot close");
    }
    status_ = "CLOSED";
    cout << "[GREEN.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Road {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Road(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Road requires id and name");
    }
    cout << "[Road.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("Road invalid status");
    }
    cout << "[Road.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Road cannot close");
    }
    status_ = "CLOSED";
    cout << "[Road.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class TrafficLightSystemService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, TrafficLight> traffic_lights_;
  unordered_map<string, Signal> signals_;
  unordered_map<string, YELLOW> yellows_;
  unordered_map<string, GREEN> greens_;
  unordered_map<string, Road> roads_;
public:
  TrafficLightSystemService() {
    cout << "[TrafficLightSystemService.__init__] system ready" << endl;
  }

  TrafficLight createTrafficLight(const string& name) {
    if (name.empty()) {
      throw invalid_argument("TrafficLight name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TRA-%04d", seq_++);
    TrafficLight obj{buf, name};
    obj.validate();
    traffic_lights_.emplace(obj.id(), obj);
    cout << "[TrafficLightSystemService.createTrafficLight] stored " << obj.id() << endl;
    return obj;
  }

  TrafficLight getTrafficLight(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = traffic_lights_.find(id);
    if (it == traffic_lights_.end()) {
      throw out_of_range("unknown TrafficLight id");
    }
    cout << "[TrafficLightSystemService.getTrafficLight] found " << id << endl;
    return it->second;
  }

  Signal createSignal(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Signal name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SIG-%04d", seq_++);
    Signal obj{buf, name};
    obj.validate();
    signals_.emplace(obj.id(), obj);
    cout << "[TrafficLightSystemService.createSignal] stored " << obj.id() << endl;
    return obj;
  }

  Signal getSignal(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = signals_.find(id);
    if (it == signals_.end()) {
      throw out_of_range("unknown Signal id");
    }
    cout << "[TrafficLightSystemService.getSignal] found " << id << endl;
    return it->second;
  }

  YELLOW createYELLOW(const string& name) {
    if (name.empty()) {
      throw invalid_argument("YELLOW name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "YEL-%04d", seq_++);
    YELLOW obj{buf, name};
    obj.validate();
    yellows_.emplace(obj.id(), obj);
    cout << "[TrafficLightSystemService.createYELLOW] stored " << obj.id() << endl;
    return obj;
  }

  YELLOW getYELLOW(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = yellows_.find(id);
    if (it == yellows_.end()) {
      throw out_of_range("unknown YELLOW id");
    }
    cout << "[TrafficLightSystemService.getYELLOW] found " << id << endl;
    return it->second;
  }

  GREEN createGREEN(const string& name) {
    if (name.empty()) {
      throw invalid_argument("GREEN name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "GRE-%04d", seq_++);
    GREEN obj{buf, name};
    obj.validate();
    greens_.emplace(obj.id(), obj);
    cout << "[TrafficLightSystemService.createGREEN] stored " << obj.id() << endl;
    return obj;
  }

  GREEN getGREEN(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = greens_.find(id);
    if (it == greens_.end()) {
      throw out_of_range("unknown GREEN id");
    }
    cout << "[TrafficLightSystemService.getGREEN] found " << id << endl;
    return it->second;
  }

  Road createRoad(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Road name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ROA-%04d", seq_++);
    Road obj{buf, name};
    obj.validate();
    roads_.emplace(obj.id(), obj);
    cout << "[TrafficLightSystemService.createRoad] stored " << obj.id() << endl;
    return obj;
  }

  Road getRoad(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = roads_.find(id);
    if (it == roads_.end()) {
      throw out_of_range("unknown Road id");
    }
    cout << "[TrafficLightSystemService.getRoad] found " << id << endl;
    return it->second;
  }

  TrafficLight closeTrafficLight(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = traffic_lights_.find(id);
    if (it == traffic_lights_.end()) {
      throw out_of_range("unknown TrafficLight");
    }
    cout << "[TrafficLightSystemService.closeTrafficLight] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct TrafficLightSystemService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  TrafficLightSystemService system;
  cout << "========== STEP 2: Create TrafficLight ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createTrafficLight("alpha-traffic_light");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createTrafficLight("beta-traffic_light");
  system.createSignal("sample-signal");
  system.createYELLOW("sample-yellow");
  system.createGREEN("sample-green");
  system.createRoad("sample-road");
  system.closeTrafficLight(first.id());
  try {
    system.closeTrafficLight(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getTrafficLight("MISSING-ID");
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  return 0;
}
`

const goCode = `package main

import (
  "fmt"
  "sync"
)

type TrafficLight struct {
  ID     string
  Name   string
  Status string
}

func NewTrafficLight(id, name string) (*TrafficLight, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("TrafficLight requires id and name")
  }
  obj := &TrafficLight{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[TrafficLight.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *TrafficLight) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("TrafficLight invalid status")
  }
  fmt.Printf("[TrafficLight.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *TrafficLight) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("TrafficLight %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[TrafficLight.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Signal struct {
  ID     string
  Name   string
  Status string
}

func NewSignal(id, name string) (*Signal, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Signal requires id and name")
  }
  obj := &Signal{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Signal.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Signal) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Signal invalid status")
  }
  fmt.Printf("[Signal.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Signal) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Signal %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Signal.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type YELLOW struct {
  ID     string
  Name   string
  Status string
}

func NewYELLOW(id, name string) (*YELLOW, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("YELLOW requires id and name")
  }
  obj := &YELLOW{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[YELLOW.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *YELLOW) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("YELLOW invalid status")
  }
  fmt.Printf("[YELLOW.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *YELLOW) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("YELLOW %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[YELLOW.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type GREEN struct {
  ID     string
  Name   string
  Status string
}

func NewGREEN(id, name string) (*GREEN, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("GREEN requires id and name")
  }
  obj := &GREEN{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[GREEN.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *GREEN) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("GREEN invalid status")
  }
  fmt.Printf("[GREEN.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *GREEN) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("GREEN %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[GREEN.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Road struct {
  ID     string
  Name   string
  Status string
}

func NewRoad(id, name string) (*Road, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Road requires id and name")
  }
  obj := &Road{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Road.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Road) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Road invalid status")
  }
  fmt.Printf("[Road.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Road) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Road %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Road.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type TrafficLightSystemService struct {
  mu  sync.Mutex
  seq int
  traffic_lights map[string]*TrafficLight
  signals map[string]*Signal
  yellows map[string]*YELLOW
  greens map[string]*GREEN
  roads map[string]*Road
}

func NewTrafficLightSystemService() *TrafficLightSystemService {
  fmt.Println("[TrafficLightSystemService.__init__] system ready")
  return &TrafficLightSystemService{
    seq: 1,
    traffic_lights: map[string]*TrafficLight{},
    signals: map[string]*Signal{},
    yellows: map[string]*YELLOW{},
    greens: map[string]*GREEN{},
    roads: map[string]*Road{},
  }
}

func (s *TrafficLightSystemService) CreateTrafficLight(name string) (*TrafficLight, error) {
  if name == "" {
    return nil, fmt.Errorf("TrafficLight name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TRA-%04d", s.seq)
  s.seq++
  obj, err := NewTrafficLight(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.traffic_lights[id] = obj
  fmt.Printf("[TrafficLightSystemService.CreateTrafficLight] stored %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) GetTrafficLight(id string) (*TrafficLight, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.traffic_lights[id]
  if !ok {
    return nil, fmt.Errorf("unknown TrafficLight id: %s", id)
  }
  fmt.Printf("[TrafficLightSystemService.GetTrafficLight] found %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) CreateSignal(name string) (*Signal, error) {
  if name == "" {
    return nil, fmt.Errorf("Signal name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SIG-%04d", s.seq)
  s.seq++
  obj, err := NewSignal(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.signals[id] = obj
  fmt.Printf("[TrafficLightSystemService.CreateSignal] stored %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) GetSignal(id string) (*Signal, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.signals[id]
  if !ok {
    return nil, fmt.Errorf("unknown Signal id: %s", id)
  }
  fmt.Printf("[TrafficLightSystemService.GetSignal] found %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) CreateYELLOW(name string) (*YELLOW, error) {
  if name == "" {
    return nil, fmt.Errorf("YELLOW name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("YEL-%04d", s.seq)
  s.seq++
  obj, err := NewYELLOW(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.yellows[id] = obj
  fmt.Printf("[TrafficLightSystemService.CreateYELLOW] stored %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) GetYELLOW(id string) (*YELLOW, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.yellows[id]
  if !ok {
    return nil, fmt.Errorf("unknown YELLOW id: %s", id)
  }
  fmt.Printf("[TrafficLightSystemService.GetYELLOW] found %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) CreateGREEN(name string) (*GREEN, error) {
  if name == "" {
    return nil, fmt.Errorf("GREEN name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("GRE-%04d", s.seq)
  s.seq++
  obj, err := NewGREEN(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.greens[id] = obj
  fmt.Printf("[TrafficLightSystemService.CreateGREEN] stored %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) GetGREEN(id string) (*GREEN, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.greens[id]
  if !ok {
    return nil, fmt.Errorf("unknown GREEN id: %s", id)
  }
  fmt.Printf("[TrafficLightSystemService.GetGREEN] found %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) CreateRoad(name string) (*Road, error) {
  if name == "" {
    return nil, fmt.Errorf("Road name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ROA-%04d", s.seq)
  s.seq++
  obj, err := NewRoad(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.roads[id] = obj
  fmt.Printf("[TrafficLightSystemService.CreateRoad] stored %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) GetRoad(id string) (*Road, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.roads[id]
  if !ok {
    return nil, fmt.Errorf("unknown Road id: %s", id)
  }
  fmt.Printf("[TrafficLightSystemService.GetRoad] found %s\\n", id)
  return obj, nil
}

func (s *TrafficLightSystemService) CloseTrafficLight(id string) (*TrafficLight, error) {
  obj, err := s.GetTrafficLight(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[TrafficLightSystemService.CloseTrafficLight] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct TrafficLightSystemService ==========")
  system := NewTrafficLightSystemService()
  fmt.Println("========== STEP 2: Create TrafficLight ==========")
  first, _ := system.CreateTrafficLight("alpha-traffic_light")
  system.CreateTrafficLight("beta-traffic_light")
  system.CreateSignal("sample-signal")
  system.CreateYELLOW("sample-yellow")
  system.CreateGREEN("sample-green")
  system.CreateRoad("sample-road")
  system.CloseTrafficLight(first.ID)
  if _, err := system.CloseTrafficLight(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetTrafficLight("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class TrafficLight {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public TrafficLight(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TrafficLight requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[TrafficLight.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("TrafficLight invalid status");
    }
    Console.WriteLine("[TrafficLight.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("TrafficLight " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[TrafficLight.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Signal {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Signal(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Signal requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Signal.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Signal invalid status");
    }
    Console.WriteLine("[Signal.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Signal " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Signal.close] id=" + Id + " -> CLOSED");
  }
}


sealed class YELLOW {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public YELLOW(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("YELLOW requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[YELLOW.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("YELLOW invalid status");
    }
    Console.WriteLine("[YELLOW.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("YELLOW " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[YELLOW.close] id=" + Id + " -> CLOSED");
  }
}


sealed class GREEN {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public GREEN(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("GREEN requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[GREEN.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("GREEN invalid status");
    }
    Console.WriteLine("[GREEN.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("GREEN " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[GREEN.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Road {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Road(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Road requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Road.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Road invalid status");
    }
    Console.WriteLine("[Road.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Road " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Road.close] id=" + Id + " -> CLOSED");
  }
}

sealed class TrafficLightSystemService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, TrafficLight> _traffic_lights = new();
  private readonly Dictionary<string, Signal> _signals = new();
  private readonly Dictionary<string, YELLOW> _yellows = new();
  private readonly Dictionary<string, GREEN> _greens = new();
  private readonly Dictionary<string, Road> _roads = new();
  public TrafficLightSystemService() {
    Console.WriteLine("[TrafficLightSystemService.__init__] system ready");
  }

  public TrafficLight CreateTrafficLight(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TrafficLight name required");
    }
    lock (_gate) {
      var id = string.Format("TRA-{0:D4}", _seq++);
      var obj = new TrafficLight(id, name.Trim());
      obj.Validate();
      _traffic_lights[id] = obj;
      Console.WriteLine("[TrafficLightSystemService.CreateTrafficLight] stored " + id);
      return obj;
    }
  }

  public TrafficLight GetTrafficLight(string id) {
    lock (_gate) {
      if (!_traffic_lights.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown TrafficLight id: " + id);
      }
      Console.WriteLine("[TrafficLightSystemService.GetTrafficLight] found " + id);
      return obj;
    }
  }

  public Signal CreateSignal(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Signal name required");
    }
    lock (_gate) {
      var id = string.Format("SIG-{0:D4}", _seq++);
      var obj = new Signal(id, name.Trim());
      obj.Validate();
      _signals[id] = obj;
      Console.WriteLine("[TrafficLightSystemService.CreateSignal] stored " + id);
      return obj;
    }
  }

  public Signal GetSignal(string id) {
    lock (_gate) {
      if (!_signals.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Signal id: " + id);
      }
      Console.WriteLine("[TrafficLightSystemService.GetSignal] found " + id);
      return obj;
    }
  }

  public YELLOW CreateYELLOW(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("YELLOW name required");
    }
    lock (_gate) {
      var id = string.Format("YEL-{0:D4}", _seq++);
      var obj = new YELLOW(id, name.Trim());
      obj.Validate();
      _yellows[id] = obj;
      Console.WriteLine("[TrafficLightSystemService.CreateYELLOW] stored " + id);
      return obj;
    }
  }

  public YELLOW GetYELLOW(string id) {
    lock (_gate) {
      if (!_yellows.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown YELLOW id: " + id);
      }
      Console.WriteLine("[TrafficLightSystemService.GetYELLOW] found " + id);
      return obj;
    }
  }

  public GREEN CreateGREEN(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("GREEN name required");
    }
    lock (_gate) {
      var id = string.Format("GRE-{0:D4}", _seq++);
      var obj = new GREEN(id, name.Trim());
      obj.Validate();
      _greens[id] = obj;
      Console.WriteLine("[TrafficLightSystemService.CreateGREEN] stored " + id);
      return obj;
    }
  }

  public GREEN GetGREEN(string id) {
    lock (_gate) {
      if (!_greens.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown GREEN id: " + id);
      }
      Console.WriteLine("[TrafficLightSystemService.GetGREEN] found " + id);
      return obj;
    }
  }

  public Road CreateRoad(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Road name required");
    }
    lock (_gate) {
      var id = string.Format("ROA-{0:D4}", _seq++);
      var obj = new Road(id, name.Trim());
      obj.Validate();
      _roads[id] = obj;
      Console.WriteLine("[TrafficLightSystemService.CreateRoad] stored " + id);
      return obj;
    }
  }

  public Road GetRoad(string id) {
    lock (_gate) {
      if (!_roads.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Road id: " + id);
      }
      Console.WriteLine("[TrafficLightSystemService.GetRoad] found " + id);
      return obj;
    }
  }

  public TrafficLight CloseTrafficLight(string id) {
    var obj = GetTrafficLight(id);
    Console.WriteLine("[TrafficLightSystemService.CloseTrafficLight] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct TrafficLightSystemService ==========");
    var system = new TrafficLightSystemService();
    Console.WriteLine("========== STEP 2: Create TrafficLight ==========");
    var first = system.CreateTrafficLight("alpha-traffic_light");
    system.CreateTrafficLight("beta-traffic_light");
    system.CreateSignal("sample-signal");
    system.CreateYELLOW("sample-yellow");
    system.CreateGREEN("sample-green");
    system.CreateRoad("sample-road");
    system.CloseTrafficLight(first.Id);
    try {
      system.CloseTrafficLight(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetTrafficLight("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const trafficLightSystemSolution: ProblemSolution = {
  slug: 'traffic-light-system',
  title: 'Traffic Light System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a traffic light controller for a multi-road intersection, managing signal cycles and supporting emergency overrides. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Manage Red, Yellow, Green signal cycles for each road at an intersection',
      'Ensure mutually exclusive green signals (no two conflicting roads are green simultaneously)',
      'Support configurable cycle durations per road and per signal',
      'Emergency vehicle override: hold all roads red except the emergency path',
      'Pedestrian crossing requests extending the current red phase',
      'Timer-based automatic transitions with configurable delays',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Manage Red, Yellow, Green signal cycles for each road at an intersection?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Ensure mutually exclusive green signals (no two conflicting roads are green simultaneously)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support configurable cycle durations per road and per signal?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Emergency vehicle override: hold all roads red except the emergency path?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Pedestrian crossing requests extending the current red phase?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. TrafficLightSystemService is the facade stereotype. TrafficLight, Signal, YELLOW, GREEN, Road are concrete domain classes with id/name/status and validate/close.',
          'Composition edges mean the facade stores and lifetime-owns those objects in maps - reflected directly in the code fields.',
        ],
        callout: {
          title: 'Beginner tip',
          body: 'If a class appears on the UML, it must appear in the code with the same name. Do not invent a generic Record type that the diagram never shows.',
        },
      },
      {
        heading: 'Build the demo around the facade API',
        paragraphs: [
          'Call create methods for each UML type, then exercise close on the primary entity and show the two failure paths the diagram implies: illegal state and missing id.',
        ],
        numbered: [
          'Construct TrafficLightSystemService.',
          'createTrafficLight twice and create the related UML classes.',
          'closeTrafficLight once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'TrafficLightSystemService', responsibility: 'UML facade - orchestrates Traffic Light System.', keyMembers: ['create*', 'get*', 'closeTrafficLight'] },
    { name: 'TrafficLight', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Signal', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'YELLOW', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'GREEN', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Road', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from TrafficLightSystemService to TrafficLight, Signal, YELLOW, GREEN, Road. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on TrafficLightSystemService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
        ],
      },
      {
        heading: 'Validation lives on the domain class',
        paragraphs: [
          'validate() and close() sit on each domain type exactly as in the UML method compartments, so invariants stay next to the data they protect.',
        ],
      },
    ],
    classResponsibilities: [
    { name: 'TrafficLightSystemService', responsibility: 'UML facade - orchestrates Traffic Light System.', keyMembers: ['create*', 'get*', 'closeTrafficLight'] },
    { name: 'TrafficLight', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Signal', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'YELLOW', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'GREEN', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Road', responsibility: 'UML class - domain object for Traffic Light System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'TrafficLightSystemService exposes create/get/close and owns composed collections.' },
      { name: 'Composition', why: 'UML filled diamonds mean ownership.', howApplied: 'Domain instances live in facade maps and are not shared elsewhere in the demo.' },
    ],
    decisions: [
      {
        decision: 'Identical class names across UML and all six languages',
        rationale: 'Beginners can map diagram boxes to code without renaming.',
      },
    ],
    solid: {
      paragraphs: [
        'SRP: domain classes validate themselves; the facade only orchestrates. DIP: callers depend on the facade API, not on map internals.',
      ],
    },
    extensibility: [
      'Add new UML classes as new composed types on the facade.',
      'Replace in-memory maps with repositories without changing domain method names.',
    ],
  },
  implementationIntro: [
    'Every language implements the same UML types. Read the logs in main() top to bottom - each line names the class and method that just ran.',
  ],
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    narrative: [
      'main constructs TrafficLightSystemService, creates UML domain objects, closes the primary TrafficLight, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct TrafficLightSystemService.',
      'createTrafficLight for alpha and beta.',
      'create remaining UML classes.',
      'closeTrafficLight(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createTrafficLight("alpha..."); closeTrafficLight(id)',
        output: '[TrafficLight.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeTrafficLight(alreadyClosed) or getTrafficLight("MISSING-ID")',
        output: '[main] expected failure: ...',
        explanation: 'Illegal transitions and missing ids throw; main catches and logs them.',
      },
    ],
  },
  followUps: [
    {
      question: 'How do you prove the code matches the UML?',
      answer: 'Every class box name appears as a type; every facade method in the diagram is callable in main; composition is a real owned map.',
    },
    {
      question: 'Where should new behavior go?',
      answer: 'If the UML shows the method on a domain class, implement it there. Only orchestration belongs on the facade.',
    },
    {
      question: 'How do you keep beginners oriented?',
      answer: 'Log ClassName.methodName on every important step so the console narrates the diagram.',
    },
    {
      question: 'What about inheritance on the UML?',
      answer: 'When a later problem shows a generalization edge, introduce a base type and subclasses with the same names - do not flatten them into one Record.',
    },
    {
      question: 'How do you test this?',
      answer: 'Unit-test domain validate/close; integration-test the facade create/get/close paths including the two failure cases in main.',
    },
  ],
  extras: {
    edgeCases: { paragraphs: ['Empty names, double-close, and unknown ids.'] },
    commonMistakes: {
      paragraphs: ['Inventing a Record class not on the UML, and putting domain validation only in the facade.'],
    },
    complexity: ['Map operations are O(1) average for create/get.'],
    testing: { paragraphs: ['Happy create/close, double-close, missing get.'] },
    extensions: ['Persistence', 'Extra UML associations', 'Domain events'],
    takeaways: ['UML names == code names', 'Facade owns composition', 'Logged main teaches the design'],
  },
}
