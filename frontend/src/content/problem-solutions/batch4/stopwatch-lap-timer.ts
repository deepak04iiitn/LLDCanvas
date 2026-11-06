import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'StopwatchLapTimerService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_stopwatchs', 'Map<string, Stopwatch>'),
    attr('-', '_laps', 'Map<string, Lap>'),
    attr('-', '_cumulative_times', 'Map<string, cumulativeTime>'),
  ], [
    method('+', 'createStopwatch', 'name: string', 'Stopwatch'),
    method('+', 'createLap', 'name: string', 'Lap'),
    method('+', 'createcumulativeTime', 'name: string', 'cumulativeTime'),
    method('+', 'getStopwatch', 'id: string', 'Stopwatch'),
    method('+', 'getLap', 'id: string', 'Lap'),
    method('+', 'getcumulativeTime', 'id: string', 'cumulativeTime'),
    method('+', 'closeStopwatch', 'id: string', 'Stopwatch'),
  ], 'facade'),
  cls('n1', 'Stopwatch', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Lap', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'cumulativeTime', GRID.x(0), GRID.y(1), [
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
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("stopwatch-lap-timer")


class Stopwatch:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Stopwatch.id is required")
        if not name or not name.strip():
            raise ValueError("Stopwatch.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Stopwatch.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Stopwatch {self.id} has invalid status={self.status}")
        log.info("[Stopwatch.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Stopwatch {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Stopwatch.close] id=%s -> CLOSED", self.id)


class Lap:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Lap.id is required")
        if not name or not name.strip():
            raise ValueError("Lap.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Lap.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Lap {self.id} has invalid status={self.status}")
        log.info("[Lap.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Lap {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Lap.close] id=%s -> CLOSED", self.id)


class cumulativeTime:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("cumulativeTime.id is required")
        if not name or not name.strip():
            raise ValueError("cumulativeTime.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[cumulativeTime.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"cumulativeTime {self.id} has invalid status={self.status}")
        log.info("[cumulativeTime.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"cumulativeTime {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[cumulativeTime.close] id=%s -> CLOSED", self.id)


class StopwatchLapTimerService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._stopwatchs: Dict[str, Stopwatch] = {}
        self._laps: Dict[str, Lap] = {}
        self._cumulative_times: Dict[str, cumulativeTime] = {}
        log.info("[StopwatchLapTimerService.__init__] system ready; managing: Stopwatch, Lap, cumulativeTime")

    def create_stopwatch(self, name: str) -> Stopwatch:
        """UML: StopwatchLapTimerService.create_stopwatch(name) -> Stopwatch"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Stopwatch name is required")
        with self._lock:
            item_id = f"STO-{self._seq:04d}"
            self._seq += 1
            obj = Stopwatch(item_id, cleaned)
            obj.validate()
            self._stopwatchs[item_id] = obj
            log.info("[StopwatchLapTimerService.create_stopwatch] stored %s in _stopwatchs (count=%s)", item_id, len(self._stopwatchs))
            return obj

    def get_stopwatch(self, item_id: str) -> Stopwatch:
        with self._lock:
            obj = self._stopwatchs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Stopwatch id: {item_id}")
            log.info("[StopwatchLapTimerService.get_stopwatch] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_lap(self, name: str) -> Lap:
        """UML: StopwatchLapTimerService.create_lap(name) -> Lap"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Lap name is required")
        with self._lock:
            item_id = f"LAP-{self._seq:04d}"
            self._seq += 1
            obj = Lap(item_id, cleaned)
            obj.validate()
            self._laps[item_id] = obj
            log.info("[StopwatchLapTimerService.create_lap] stored %s in _laps (count=%s)", item_id, len(self._laps))
            return obj

    def get_lap(self, item_id: str) -> Lap:
        with self._lock:
            obj = self._laps.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Lap id: {item_id}")
            log.info("[StopwatchLapTimerService.get_lap] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_cumulative_time(self, name: str) -> cumulativeTime:
        """UML: StopwatchLapTimerService.create_cumulative_time(name) -> cumulativeTime"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("cumulativeTime name is required")
        with self._lock:
            item_id = f"CUM-{self._seq:04d}"
            self._seq += 1
            obj = cumulativeTime(item_id, cleaned)
            obj.validate()
            self._cumulative_times[item_id] = obj
            log.info("[StopwatchLapTimerService.create_cumulative_time] stored %s in _cumulative_times (count=%s)", item_id, len(self._cumulative_times))
            return obj

    def get_cumulative_time(self, item_id: str) -> cumulativeTime:
        with self._lock:
            obj = self._cumulative_times.get(item_id)
            if obj is None:
                raise KeyError(f"unknown cumulativeTime id: {item_id}")
            log.info("[StopwatchLapTimerService.get_cumulative_time] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_stopwatch(self, item_id: str) -> Stopwatch:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._stopwatchs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Stopwatch id: {item_id}")
            log.info("[StopwatchLapTimerService.close_stopwatch] closing %s via Stopwatch.close()", item_id)
            obj.close()
            return obj

    def list_active_stopwatchs(self) -> List[Stopwatch]:
        with self._lock:
            active = [o for o in self._stopwatchs.values() if o.status == "ACTIVE"]
            log.info("[StopwatchLapTimerService.list_active_stopwatchs] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct StopwatchLapTimerService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = StopwatchLapTimerService()

    log.info("========== STEP 2: Create primary Stopwatch objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_stopwatch("alpha-stopwatch")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_stopwatch("beta-stopwatch")

    log.info("========== STEP 3: Create Lap (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_lap("sample-lap")

    log.info("========== STEP 4: Create cumulativeTime (UML class) ==========")
    system.create_cumulative_time("sample-cumulative_time")

    log.info("========== STEP 5: Inspect active Stopwatch list ==========")
    system.list_active_stopwatchs()

    log.info("========== STEP 6: Close first Stopwatch ==========")
    system.close_stopwatch(first.id)

    log.info("========== STEP 7: Expected failure - close again ==========")
    try:
        system.close_stopwatch(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Stopwatch.close: %s", err)

    log.info("========== STEP 8: Expected failure - missing id ==========")
    try:
        system.get_stopwatch("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_stopwatch: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_stopwatchs()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Stopwatch {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Stopwatch(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Stopwatch.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Stopwatch.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Stopwatch.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Stopwatch " + id + " invalid status");
    }
    System.out.println("[Stopwatch.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Stopwatch " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Stopwatch.close] id=" + id + " -> CLOSED");
  }
}


class Lap {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Lap(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Lap.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Lap.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Lap.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Lap " + id + " invalid status");
    }
    System.out.println("[Lap.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Lap " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Lap.close] id=" + id + " -> CLOSED");
  }
}


class cumulativeTime {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  cumulativeTime(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("cumulativeTime.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("cumulativeTime.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[cumulativeTime.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("cumulativeTime " + id + " invalid status");
    }
    System.out.println("[cumulativeTime.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("cumulativeTime " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[cumulativeTime.close] id=" + id + " -> CLOSED");
  }
}

public class StopwatchLapTimerService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Stopwatch> stopwatchs = new LinkedHashMap<>();
  private final Map<String, Lap> laps = new LinkedHashMap<>();
  private final Map<String, cumulativeTime> cumulative_times = new LinkedHashMap<>();

  public StopwatchLapTimerService() {
    System.out.println("[StopwatchLapTimerService.__init__] system ready");
  }

  public Stopwatch createStopwatch(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Stopwatch name required");
    }
    lock.lock();
    try {
      String id = String.format("STO-%04d", seq++);
      Stopwatch obj = new Stopwatch(id, name.trim());
      obj.validate();
      stopwatchs.put(id, obj);
      System.out.println("[StopwatchLapTimerService.createStopwatch] stored " + id + " count=" + stopwatchs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Stopwatch getStopwatch(String id) {
    lock.lock();
    try {
      Stopwatch obj = stopwatchs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Stopwatch id: " + id);
      }
      System.out.println("[StopwatchLapTimerService.getStopwatch] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Lap createLap(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Lap name required");
    }
    lock.lock();
    try {
      String id = String.format("LAP-%04d", seq++);
      Lap obj = new Lap(id, name.trim());
      obj.validate();
      laps.put(id, obj);
      System.out.println("[StopwatchLapTimerService.createLap] stored " + id + " count=" + laps.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Lap getLap(String id) {
    lock.lock();
    try {
      Lap obj = laps.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Lap id: " + id);
      }
      System.out.println("[StopwatchLapTimerService.getLap] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public cumulativeTime createcumulativeTime(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("cumulativeTime name required");
    }
    lock.lock();
    try {
      String id = String.format("CUM-%04d", seq++);
      cumulativeTime obj = new cumulativeTime(id, name.trim());
      obj.validate();
      cumulative_times.put(id, obj);
      System.out.println("[StopwatchLapTimerService.createcumulativeTime] stored " + id + " count=" + cumulative_times.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public cumulativeTime getcumulativeTime(String id) {
    lock.lock();
    try {
      cumulativeTime obj = cumulative_times.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown cumulativeTime id: " + id);
      }
      System.out.println("[StopwatchLapTimerService.getcumulativeTime] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Stopwatch closeStopwatch(String id) {
    lock.lock();
    try {
      Stopwatch obj = stopwatchs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Stopwatch id: " + id);
      }
      System.out.println("[StopwatchLapTimerService.closeStopwatch] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Stopwatch> listActiveStopwatchs() {
    lock.lock();
    try {
      List<Stopwatch> out = new ArrayList<>();
      for (Stopwatch o : stopwatchs.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[StopwatchLapTimerService.listActiveStopwatchs] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct StopwatchLapTimerService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    StopwatchLapTimerService system = new StopwatchLapTimerService();
    System.out.println("========== STEP 2: Create Stopwatch objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Stopwatch first = system.createStopwatch("alpha-stopwatch");
    system.createStopwatch("beta-stopwatch");
    System.out.println("========== STEP 3: Create Lap ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createLap("sample-lap");
    System.out.println("========== STEP 4: Create cumulativeTime ==========");
    system.createcumulativeTime("sample-cumulative_time");
    System.out.println("========== Inspect active list ==========");
    system.listActiveStopwatchs();
    System.out.println("========== Close first Stopwatch ==========");
    system.closeStopwatch(first.getId());
    try {
      system.closeStopwatch(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getStopwatch("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Stopwatch {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Stopwatch.id required')
    }

    if (!name?.trim()) {
      throw new Error('Stopwatch.name required')
    }
    console.log(\`[Stopwatch.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Stopwatch \${this.id} invalid status\`)
    }
    console.log(\`[Stopwatch.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Stopwatch \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Stopwatch.close] id=\${this.id} -> CLOSED\`)
  }
}


class Lap {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Lap.id required')
    }

    if (!name?.trim()) {
      throw new Error('Lap.name required')
    }
    console.log(\`[Lap.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Lap \${this.id} invalid status\`)
    }
    console.log(\`[Lap.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Lap \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Lap.close] id=\${this.id} -> CLOSED\`)
  }
}


class cumulativeTime {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('cumulativeTime.id required')
    }

    if (!name?.trim()) {
      throw new Error('cumulativeTime.name required')
    }
    console.log(\`[cumulativeTime.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`cumulativeTime \${this.id} invalid status\`)
    }
    console.log(\`[cumulativeTime.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`cumulativeTime \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[cumulativeTime.close] id=\${this.id} -> CLOSED\`)
  }
}

class StopwatchLapTimerService {
  private seq = 1
  private stopwatchs = new Map<string, Stopwatch>()
  private laps = new Map<string, Lap>()
  private cumulative_times = new Map<string, cumulativeTime>()
  constructor() {
    console.log('[StopwatchLapTimerService.__init__] system ready')
  }

  createStopwatch(name: string): Stopwatch {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Stopwatch name required')
    }
    const id = \`STO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Stopwatch(id, cleaned)
    obj.validate()
    this.stopwatchs.set(id, obj)
    console.log(\`[StopwatchLapTimerService.createStopwatch] stored \${id} count=\${this.stopwatchs.size}\`)
    return obj
  }

  getStopwatch(id: string): Stopwatch {
    const obj = this.stopwatchs.get(id)
    if (!obj) {
      throw new Error(\`unknown Stopwatch id: \${id}\`)
    }
    console.log(\`[StopwatchLapTimerService.getStopwatch] found id=\${obj.id}\`)
    return obj
  }

  createLap(name: string): Lap {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Lap name required')
    }
    const id = \`LAP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Lap(id, cleaned)
    obj.validate()
    this.laps.set(id, obj)
    console.log(\`[StopwatchLapTimerService.createLap] stored \${id} count=\${this.laps.size}\`)
    return obj
  }

  getLap(id: string): Lap {
    const obj = this.laps.get(id)
    if (!obj) {
      throw new Error(\`unknown Lap id: \${id}\`)
    }
    console.log(\`[StopwatchLapTimerService.getLap] found id=\${obj.id}\`)
    return obj
  }

  createcumulativeTime(name: string): cumulativeTime {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('cumulativeTime name required')
    }
    const id = \`CUM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new cumulativeTime(id, cleaned)
    obj.validate()
    this.cumulative_times.set(id, obj)
    console.log(\`[StopwatchLapTimerService.createcumulativeTime] stored \${id} count=\${this.cumulative_times.size}\`)
    return obj
  }

  getcumulativeTime(id: string): cumulativeTime {
    const obj = this.cumulative_times.get(id)
    if (!obj) {
      throw new Error(\`unknown cumulativeTime id: \${id}\`)
    }
    console.log(\`[StopwatchLapTimerService.getcumulativeTime] found id=\${obj.id}\`)
    return obj
  }

  closeStopwatch(id: string): Stopwatch {
    const obj = this.getStopwatch(id)
    console.log(\`[StopwatchLapTimerService.closeStopwatch] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveStopwatchs(): Stopwatch[] {
    const active = [...this.stopwatchs.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[StopwatchLapTimerService.listActiveStopwatchs] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct StopwatchLapTimerService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new StopwatchLapTimerService()
  console.log('========== STEP 2: Create Stopwatch objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createStopwatch('alpha-stopwatch')
  system.createStopwatch('beta-stopwatch')
  console.log('========== STEP 3: Create Lap ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createLap('sample-lap')
  console.log('========== STEP 4: Create cumulativeTime ==========')
  system.createcumulativeTime('sample-cumulative_time')
  system.listActiveStopwatchs()
  console.log('========== Close first Stopwatch ==========')
  system.closeStopwatch(first.id)
  try {
    system.closeStopwatch(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getStopwatch('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Stopwatch {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Stopwatch(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Stopwatch requires id and name");
    }
    cout << "[Stopwatch.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Stopwatch invalid status");
    }
    cout << "[Stopwatch.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Stopwatch cannot close");
    }
    status_ = "CLOSED";
    cout << "[Stopwatch.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Lap {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Lap(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Lap requires id and name");
    }
    cout << "[Lap.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Lap invalid status");
    }
    cout << "[Lap.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Lap cannot close");
    }
    status_ = "CLOSED";
    cout << "[Lap.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class cumulativeTime {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  cumulativeTime(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("cumulativeTime requires id and name");
    }
    cout << "[cumulativeTime.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("cumulativeTime invalid status");
    }
    cout << "[cumulativeTime.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("cumulativeTime cannot close");
    }
    status_ = "CLOSED";
    cout << "[cumulativeTime.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class StopwatchLapTimerService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Stopwatch> stopwatchs_;
  unordered_map<string, Lap> laps_;
  unordered_map<string, cumulativeTime> cumulative_times_;
public:
  StopwatchLapTimerService() {
    cout << "[StopwatchLapTimerService.__init__] system ready" << endl;
  }

  Stopwatch createStopwatch(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Stopwatch name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "STO-%04d", seq_++);
    Stopwatch obj{buf, name};
    obj.validate();
    stopwatchs_.emplace(obj.id(), obj);
    cout << "[StopwatchLapTimerService.createStopwatch] stored " << obj.id() << endl;
    return obj;
  }

  Stopwatch getStopwatch(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = stopwatchs_.find(id);
    if (it == stopwatchs_.end()) {
      throw out_of_range("unknown Stopwatch id");
    }
    cout << "[StopwatchLapTimerService.getStopwatch] found " << id << endl;
    return it->second;
  }

  Lap createLap(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Lap name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LAP-%04d", seq_++);
    Lap obj{buf, name};
    obj.validate();
    laps_.emplace(obj.id(), obj);
    cout << "[StopwatchLapTimerService.createLap] stored " << obj.id() << endl;
    return obj;
  }

  Lap getLap(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = laps_.find(id);
    if (it == laps_.end()) {
      throw out_of_range("unknown Lap id");
    }
    cout << "[StopwatchLapTimerService.getLap] found " << id << endl;
    return it->second;
  }

  cumulativeTime createcumulativeTime(const string& name) {
    if (name.empty()) {
      throw invalid_argument("cumulativeTime name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CUM-%04d", seq_++);
    cumulativeTime obj{buf, name};
    obj.validate();
    cumulative_times_.emplace(obj.id(), obj);
    cout << "[StopwatchLapTimerService.createcumulativeTime] stored " << obj.id() << endl;
    return obj;
  }

  cumulativeTime getcumulativeTime(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cumulative_times_.find(id);
    if (it == cumulative_times_.end()) {
      throw out_of_range("unknown cumulativeTime id");
    }
    cout << "[StopwatchLapTimerService.getcumulativeTime] found " << id << endl;
    return it->second;
  }

  Stopwatch closeStopwatch(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = stopwatchs_.find(id);
    if (it == stopwatchs_.end()) {
      throw out_of_range("unknown Stopwatch");
    }
    cout << "[StopwatchLapTimerService.closeStopwatch] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct StopwatchLapTimerService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  StopwatchLapTimerService system;
  cout << "========== STEP 2: Create Stopwatch ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createStopwatch("alpha-stopwatch");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createStopwatch("beta-stopwatch");
  system.createLap("sample-lap");
  system.createcumulativeTime("sample-cumulative_time");
  system.closeStopwatch(first.id());
  try {
    system.closeStopwatch(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getStopwatch("MISSING-ID");
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

type Stopwatch struct {
  ID     string
  Name   string
  Status string
}

func NewStopwatch(id, name string) (*Stopwatch, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Stopwatch requires id and name")
  }
  obj := &Stopwatch{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Stopwatch.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Stopwatch) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Stopwatch invalid status")
  }
  fmt.Printf("[Stopwatch.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Stopwatch) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Stopwatch %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Stopwatch.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Lap struct {
  ID     string
  Name   string
  Status string
}

func NewLap(id, name string) (*Lap, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Lap requires id and name")
  }
  obj := &Lap{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Lap.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Lap) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Lap invalid status")
  }
  fmt.Printf("[Lap.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Lap) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Lap %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Lap.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type cumulativeTime struct {
  ID     string
  Name   string
  Status string
}

func NewcumulativeTime(id, name string) (*cumulativeTime, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("cumulativeTime requires id and name")
  }
  obj := &cumulativeTime{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[cumulativeTime.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *cumulativeTime) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("cumulativeTime invalid status")
  }
  fmt.Printf("[cumulativeTime.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *cumulativeTime) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("cumulativeTime %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[cumulativeTime.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type StopwatchLapTimerService struct {
  mu  sync.Mutex
  seq int
  stopwatchs map[string]*Stopwatch
  laps map[string]*Lap
  cumulative_times map[string]*cumulativeTime
}

func NewStopwatchLapTimerService() *StopwatchLapTimerService {
  fmt.Println("[StopwatchLapTimerService.__init__] system ready")
  return &StopwatchLapTimerService{
    seq: 1,
    stopwatchs: map[string]*Stopwatch{},
    laps: map[string]*Lap{},
    cumulative_times: map[string]*cumulativeTime{},
  }
}

func (s *StopwatchLapTimerService) CreateStopwatch(name string) (*Stopwatch, error) {
  if name == "" {
    return nil, fmt.Errorf("Stopwatch name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("STO-%04d", s.seq)
  s.seq++
  obj, err := NewStopwatch(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.stopwatchs[id] = obj
  fmt.Printf("[StopwatchLapTimerService.CreateStopwatch] stored %s\\n", id)
  return obj, nil
}

func (s *StopwatchLapTimerService) GetStopwatch(id string) (*Stopwatch, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.stopwatchs[id]
  if !ok {
    return nil, fmt.Errorf("unknown Stopwatch id: %s", id)
  }
  fmt.Printf("[StopwatchLapTimerService.GetStopwatch] found %s\\n", id)
  return obj, nil
}

func (s *StopwatchLapTimerService) CreateLap(name string) (*Lap, error) {
  if name == "" {
    return nil, fmt.Errorf("Lap name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LAP-%04d", s.seq)
  s.seq++
  obj, err := NewLap(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.laps[id] = obj
  fmt.Printf("[StopwatchLapTimerService.CreateLap] stored %s\\n", id)
  return obj, nil
}

func (s *StopwatchLapTimerService) GetLap(id string) (*Lap, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.laps[id]
  if !ok {
    return nil, fmt.Errorf("unknown Lap id: %s", id)
  }
  fmt.Printf("[StopwatchLapTimerService.GetLap] found %s\\n", id)
  return obj, nil
}

func (s *StopwatchLapTimerService) CreatecumulativeTime(name string) (*cumulativeTime, error) {
  if name == "" {
    return nil, fmt.Errorf("cumulativeTime name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CUM-%04d", s.seq)
  s.seq++
  obj, err := NewcumulativeTime(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.cumulative_times[id] = obj
  fmt.Printf("[StopwatchLapTimerService.CreatecumulativeTime] stored %s\\n", id)
  return obj, nil
}

func (s *StopwatchLapTimerService) GetcumulativeTime(id string) (*cumulativeTime, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.cumulative_times[id]
  if !ok {
    return nil, fmt.Errorf("unknown cumulativeTime id: %s", id)
  }
  fmt.Printf("[StopwatchLapTimerService.GetcumulativeTime] found %s\\n", id)
  return obj, nil
}

func (s *StopwatchLapTimerService) CloseStopwatch(id string) (*Stopwatch, error) {
  obj, err := s.GetStopwatch(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[StopwatchLapTimerService.CloseStopwatch] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct StopwatchLapTimerService ==========")
  system := NewStopwatchLapTimerService()
  fmt.Println("========== STEP 2: Create Stopwatch ==========")
  first, _ := system.CreateStopwatch("alpha-stopwatch")
  system.CreateStopwatch("beta-stopwatch")
  system.CreateLap("sample-lap")
  system.CreatecumulativeTime("sample-cumulative_time")
  system.CloseStopwatch(first.ID)
  if _, err := system.CloseStopwatch(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetStopwatch("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Stopwatch {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Stopwatch(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Stopwatch requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Stopwatch.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Stopwatch invalid status");
    }
    Console.WriteLine("[Stopwatch.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Stopwatch " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Stopwatch.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Lap {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Lap(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Lap requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Lap.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Lap invalid status");
    }
    Console.WriteLine("[Lap.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Lap " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Lap.close] id=" + Id + " -> CLOSED");
  }
}


sealed class cumulativeTime {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public cumulativeTime(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("cumulativeTime requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[cumulativeTime.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("cumulativeTime invalid status");
    }
    Console.WriteLine("[cumulativeTime.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("cumulativeTime " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[cumulativeTime.close] id=" + Id + " -> CLOSED");
  }
}

sealed class StopwatchLapTimerService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Stopwatch> _stopwatchs = new();
  private readonly Dictionary<string, Lap> _laps = new();
  private readonly Dictionary<string, cumulativeTime> _cumulative_times = new();
  public StopwatchLapTimerService() {
    Console.WriteLine("[StopwatchLapTimerService.__init__] system ready");
  }

  public Stopwatch CreateStopwatch(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Stopwatch name required");
    }
    lock (_gate) {
      var id = string.Format("STO-{0:D4}", _seq++);
      var obj = new Stopwatch(id, name.Trim());
      obj.Validate();
      _stopwatchs[id] = obj;
      Console.WriteLine("[StopwatchLapTimerService.CreateStopwatch] stored " + id);
      return obj;
    }
  }

  public Stopwatch GetStopwatch(string id) {
    lock (_gate) {
      if (!_stopwatchs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Stopwatch id: " + id);
      }
      Console.WriteLine("[StopwatchLapTimerService.GetStopwatch] found " + id);
      return obj;
    }
  }

  public Lap CreateLap(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Lap name required");
    }
    lock (_gate) {
      var id = string.Format("LAP-{0:D4}", _seq++);
      var obj = new Lap(id, name.Trim());
      obj.Validate();
      _laps[id] = obj;
      Console.WriteLine("[StopwatchLapTimerService.CreateLap] stored " + id);
      return obj;
    }
  }

  public Lap GetLap(string id) {
    lock (_gate) {
      if (!_laps.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Lap id: " + id);
      }
      Console.WriteLine("[StopwatchLapTimerService.GetLap] found " + id);
      return obj;
    }
  }

  public cumulativeTime CreatecumulativeTime(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("cumulativeTime name required");
    }
    lock (_gate) {
      var id = string.Format("CUM-{0:D4}", _seq++);
      var obj = new cumulativeTime(id, name.Trim());
      obj.Validate();
      _cumulative_times[id] = obj;
      Console.WriteLine("[StopwatchLapTimerService.CreatecumulativeTime] stored " + id);
      return obj;
    }
  }

  public cumulativeTime GetcumulativeTime(string id) {
    lock (_gate) {
      if (!_cumulative_times.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown cumulativeTime id: " + id);
      }
      Console.WriteLine("[StopwatchLapTimerService.GetcumulativeTime] found " + id);
      return obj;
    }
  }

  public Stopwatch CloseStopwatch(string id) {
    var obj = GetStopwatch(id);
    Console.WriteLine("[StopwatchLapTimerService.CloseStopwatch] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct StopwatchLapTimerService ==========");
    var system = new StopwatchLapTimerService();
    Console.WriteLine("========== STEP 2: Create Stopwatch ==========");
    var first = system.CreateStopwatch("alpha-stopwatch");
    system.CreateStopwatch("beta-stopwatch");
    system.CreateLap("sample-lap");
    system.CreatecumulativeTime("sample-cumulative_time");
    system.CloseStopwatch(first.Id);
    try {
      system.CloseStopwatch(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetStopwatch("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const stopwatchLapTimerSolution: ProblemSolution = {
  slug: 'stopwatch-lap-timer',
  title: 'Stopwatch & Lap Timer - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a stopwatch application supporting start, pause, resume, reset, and lap recording. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Start the stopwatch from zero',
      'Pause and resume without losing elapsed time',
      'Record a lap time while running',
      'List all recorded laps with split and cumulative time',
      'Reset the stopwatch to zero',
      'Identify the fastest and slowest lap',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Start the stopwatch from zero?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Pause and resume without losing elapsed time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Record a lap time while running?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'List all recorded laps with split and cumulative time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Reset the stopwatch to zero?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. StopwatchLapTimerService is the facade stereotype. Stopwatch, Lap, cumulativeTime are concrete domain classes with id/name/status and validate/close.',
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
          'Construct StopwatchLapTimerService.',
          'createStopwatch twice and create the related UML classes.',
          'closeStopwatch once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'StopwatchLapTimerService', responsibility: 'UML facade - orchestrates Stopwatch & Lap Timer.', keyMembers: ['create*', 'get*', 'closeStopwatch'] },
    { name: 'Stopwatch', responsibility: 'UML class - domain object for Stopwatch & Lap Timer.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Lap', responsibility: 'UML class - domain object for Stopwatch & Lap Timer.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'cumulativeTime', responsibility: 'UML class - domain object for Stopwatch & Lap Timer.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from StopwatchLapTimerService to Stopwatch, Lap, cumulativeTime. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on StopwatchLapTimerService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'StopwatchLapTimerService', responsibility: 'UML facade - orchestrates Stopwatch & Lap Timer.', keyMembers: ['create*', 'get*', 'closeStopwatch'] },
    { name: 'Stopwatch', responsibility: 'UML class - domain object for Stopwatch & Lap Timer.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Lap', responsibility: 'UML class - domain object for Stopwatch & Lap Timer.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'cumulativeTime', responsibility: 'UML class - domain object for Stopwatch & Lap Timer.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'StopwatchLapTimerService exposes create/get/close and owns composed collections.' },
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
      'main constructs StopwatchLapTimerService, creates UML domain objects, closes the primary Stopwatch, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct StopwatchLapTimerService.',
      'createStopwatch for alpha and beta.',
      'create remaining UML classes.',
      'closeStopwatch(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createStopwatch("alpha..."); closeStopwatch(id)',
        output: '[Stopwatch.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeStopwatch(alreadyClosed) or getStopwatch("MISSING-ID")',
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
