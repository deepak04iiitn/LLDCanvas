import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'DistributedCacheService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_cache_nodes', 'Map<string, CacheNode>'),
    attr('-', '_cache_entries', 'Map<string, CacheEntry>'),
    attr('-', '_values', 'Map<string, value>'),
    attr('-', '_ttls', 'Map<string, TTL>'),
    attr('-', '_last_accesseds', 'Map<string, lastAccessed>'),
  ], [
    method('+', 'createCacheNode', 'name: string', 'CacheNode'),
    method('+', 'createCacheEntry', 'name: string', 'CacheEntry'),
    method('+', 'createvalue', 'name: string', 'value'),
    method('+', 'createTTL', 'name: string', 'TTL'),
    method('+', 'createlastAccessed', 'name: string', 'lastAccessed'),
    method('+', 'getCacheNode', 'id: string', 'CacheNode'),
    method('+', 'getCacheEntry', 'id: string', 'CacheEntry'),
    method('+', 'getvalue', 'id: string', 'value'),
    method('+', 'getTTL', 'id: string', 'TTL'),
    method('+', 'getlastAccessed', 'id: string', 'lastAccessed'),
    method('+', 'closeCacheNode', 'id: string', 'CacheNode'),
  ], 'facade'),
  cls('n1', 'CacheNode', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'CacheEntry', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'value', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'TTL', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'lastAccessed', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("distributed-cache")


class CacheNode:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("CacheNode.id is required")
        if not name or not name.strip():
            raise ValueError("CacheNode.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[CacheNode.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"CacheNode {self.id} has invalid status={self.status}")
        log.info("[CacheNode.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"CacheNode {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[CacheNode.close] id=%s -> CLOSED", self.id)


class CacheEntry:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("CacheEntry.id is required")
        if not name or not name.strip():
            raise ValueError("CacheEntry.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[CacheEntry.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"CacheEntry {self.id} has invalid status={self.status}")
        log.info("[CacheEntry.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"CacheEntry {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[CacheEntry.close] id=%s -> CLOSED", self.id)


class value:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("value.id is required")
        if not name or not name.strip():
            raise ValueError("value.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[value.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"value {self.id} has invalid status={self.status}")
        log.info("[value.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"value {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[value.close] id=%s -> CLOSED", self.id)


class TTL:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("TTL.id is required")
        if not name or not name.strip():
            raise ValueError("TTL.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[TTL.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"TTL {self.id} has invalid status={self.status}")
        log.info("[TTL.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"TTL {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[TTL.close] id=%s -> CLOSED", self.id)


class lastAccessed:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("lastAccessed.id is required")
        if not name or not name.strip():
            raise ValueError("lastAccessed.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[lastAccessed.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"lastAccessed {self.id} has invalid status={self.status}")
        log.info("[lastAccessed.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"lastAccessed {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[lastAccessed.close] id=%s -> CLOSED", self.id)


class DistributedCacheService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._cache_nodes: Dict[str, CacheNode] = {}
        self._cache_entries: Dict[str, CacheEntry] = {}
        self._values: Dict[str, value] = {}
        self._ttls: Dict[str, TTL] = {}
        self._last_accesseds: Dict[str, lastAccessed] = {}
        log.info("[DistributedCacheService.__init__] system ready; managing: CacheNode, CacheEntry, value, TTL, lastAccessed")

    def create_cache_node(self, name: str) -> CacheNode:
        """UML: DistributedCacheService.create_cache_node(name) -> CacheNode"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("CacheNode name is required")
        with self._lock:
            item_id = f"CAC-{self._seq:04d}"
            self._seq += 1
            obj = CacheNode(item_id, cleaned)
            obj.validate()
            self._cache_nodes[item_id] = obj
            log.info("[DistributedCacheService.create_cache_node] stored %s in _cache_nodes (count=%s)", item_id, len(self._cache_nodes))
            return obj

    def get_cache_node(self, item_id: str) -> CacheNode:
        with self._lock:
            obj = self._cache_nodes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown CacheNode id: {item_id}")
            log.info("[DistributedCacheService.get_cache_node] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_cache_entry(self, name: str) -> CacheEntry:
        """UML: DistributedCacheService.create_cache_entry(name) -> CacheEntry"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("CacheEntry name is required")
        with self._lock:
            item_id = f"CAC-{self._seq:04d}"
            self._seq += 1
            obj = CacheEntry(item_id, cleaned)
            obj.validate()
            self._cache_entries[item_id] = obj
            log.info("[DistributedCacheService.create_cache_entry] stored %s in _cache_entries (count=%s)", item_id, len(self._cache_entries))
            return obj

    def get_cache_entry(self, item_id: str) -> CacheEntry:
        with self._lock:
            obj = self._cache_entries.get(item_id)
            if obj is None:
                raise KeyError(f"unknown CacheEntry id: {item_id}")
            log.info("[DistributedCacheService.get_cache_entry] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_value(self, name: str) -> value:
        """UML: DistributedCacheService.create_value(name) -> value"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("value name is required")
        with self._lock:
            item_id = f"VAL-{self._seq:04d}"
            self._seq += 1
            obj = value(item_id, cleaned)
            obj.validate()
            self._values[item_id] = obj
            log.info("[DistributedCacheService.create_value] stored %s in _values (count=%s)", item_id, len(self._values))
            return obj

    def get_value(self, item_id: str) -> value:
        with self._lock:
            obj = self._values.get(item_id)
            if obj is None:
                raise KeyError(f"unknown value id: {item_id}")
            log.info("[DistributedCacheService.get_value] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_ttl(self, name: str) -> TTL:
        """UML: DistributedCacheService.create_ttl(name) -> TTL"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("TTL name is required")
        with self._lock:
            item_id = f"TTL-{self._seq:04d}"
            self._seq += 1
            obj = TTL(item_id, cleaned)
            obj.validate()
            self._ttls[item_id] = obj
            log.info("[DistributedCacheService.create_ttl] stored %s in _ttls (count=%s)", item_id, len(self._ttls))
            return obj

    def get_ttl(self, item_id: str) -> TTL:
        with self._lock:
            obj = self._ttls.get(item_id)
            if obj is None:
                raise KeyError(f"unknown TTL id: {item_id}")
            log.info("[DistributedCacheService.get_ttl] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_last_accessed(self, name: str) -> lastAccessed:
        """UML: DistributedCacheService.create_last_accessed(name) -> lastAccessed"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("lastAccessed name is required")
        with self._lock:
            item_id = f"LAS-{self._seq:04d}"
            self._seq += 1
            obj = lastAccessed(item_id, cleaned)
            obj.validate()
            self._last_accesseds[item_id] = obj
            log.info("[DistributedCacheService.create_last_accessed] stored %s in _last_accesseds (count=%s)", item_id, len(self._last_accesseds))
            return obj

    def get_last_accessed(self, item_id: str) -> lastAccessed:
        with self._lock:
            obj = self._last_accesseds.get(item_id)
            if obj is None:
                raise KeyError(f"unknown lastAccessed id: {item_id}")
            log.info("[DistributedCacheService.get_last_accessed] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_cache_node(self, item_id: str) -> CacheNode:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._cache_nodes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown CacheNode id: {item_id}")
            log.info("[DistributedCacheService.close_cache_node] closing %s via CacheNode.close()", item_id)
            obj.close()
            return obj

    def list_active_cache_nodes(self) -> List[CacheNode]:
        with self._lock:
            active = [o for o in self._cache_nodes.values() if o.status == "ACTIVE"]
            log.info("[DistributedCacheService.list_active_cache_nodes] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct DistributedCacheService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = DistributedCacheService()

    log.info("========== STEP 2: Create primary CacheNode objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_cache_node("alpha-cache_node")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_cache_node("beta-cache_node")

    log.info("========== STEP 3: Create CacheEntry (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_cache_entry("sample-cache_entry")

    log.info("========== STEP 4: Create value (UML class) ==========")
    system.create_value("sample-value")

    log.info("========== STEP 5: Create TTL (UML class) ==========")
    system.create_ttl("sample-ttl")

    log.info("========== STEP 6: Create lastAccessed (UML class) ==========")
    system.create_last_accessed("sample-last_accessed")

    log.info("========== STEP 7: Inspect active CacheNode list ==========")
    system.list_active_cache_nodes()

    log.info("========== STEP 8: Close first CacheNode ==========")
    system.close_cache_node(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_cache_node(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from CacheNode.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_cache_node("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_cache_node: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_cache_nodes()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class CacheNode {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  CacheNode(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("CacheNode.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CacheNode.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[CacheNode.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("CacheNode " + id + " invalid status");
    }
    System.out.println("[CacheNode.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("CacheNode " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[CacheNode.close] id=" + id + " -> CLOSED");
  }
}


class CacheEntry {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  CacheEntry(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("CacheEntry.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CacheEntry.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[CacheEntry.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("CacheEntry " + id + " invalid status");
    }
    System.out.println("[CacheEntry.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("CacheEntry " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[CacheEntry.close] id=" + id + " -> CLOSED");
  }
}


class value {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  value(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("value.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("value.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[value.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("value " + id + " invalid status");
    }
    System.out.println("[value.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("value " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[value.close] id=" + id + " -> CLOSED");
  }
}


class TTL {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  TTL(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("TTL.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TTL.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[TTL.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("TTL " + id + " invalid status");
    }
    System.out.println("[TTL.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("TTL " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[TTL.close] id=" + id + " -> CLOSED");
  }
}


class lastAccessed {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  lastAccessed(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("lastAccessed.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("lastAccessed.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[lastAccessed.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("lastAccessed " + id + " invalid status");
    }
    System.out.println("[lastAccessed.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("lastAccessed " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[lastAccessed.close] id=" + id + " -> CLOSED");
  }
}

public class DistributedCacheService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, CacheNode> cache_nodes = new LinkedHashMap<>();
  private final Map<String, CacheEntry> cache_entries = new LinkedHashMap<>();
  private final Map<String, value> values = new LinkedHashMap<>();
  private final Map<String, TTL> ttls = new LinkedHashMap<>();
  private final Map<String, lastAccessed> last_accesseds = new LinkedHashMap<>();

  public DistributedCacheService() {
    System.out.println("[DistributedCacheService.__init__] system ready");
  }

  public CacheNode createCacheNode(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CacheNode name required");
    }
    lock.lock();
    try {
      String id = String.format("CAC-%04d", seq++);
      CacheNode obj = new CacheNode(id, name.trim());
      obj.validate();
      cache_nodes.put(id, obj);
      System.out.println("[DistributedCacheService.createCacheNode] stored " + id + " count=" + cache_nodes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public CacheNode getCacheNode(String id) {
    lock.lock();
    try {
      CacheNode obj = cache_nodes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown CacheNode id: " + id);
      }
      System.out.println("[DistributedCacheService.getCacheNode] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public CacheEntry createCacheEntry(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("CacheEntry name required");
    }
    lock.lock();
    try {
      String id = String.format("CAC-%04d", seq++);
      CacheEntry obj = new CacheEntry(id, name.trim());
      obj.validate();
      cache_entries.put(id, obj);
      System.out.println("[DistributedCacheService.createCacheEntry] stored " + id + " count=" + cache_entries.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public CacheEntry getCacheEntry(String id) {
    lock.lock();
    try {
      CacheEntry obj = cache_entries.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown CacheEntry id: " + id);
      }
      System.out.println("[DistributedCacheService.getCacheEntry] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public value createvalue(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("value name required");
    }
    lock.lock();
    try {
      String id = String.format("VAL-%04d", seq++);
      value obj = new value(id, name.trim());
      obj.validate();
      values.put(id, obj);
      System.out.println("[DistributedCacheService.createvalue] stored " + id + " count=" + values.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public value getvalue(String id) {
    lock.lock();
    try {
      value obj = values.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown value id: " + id);
      }
      System.out.println("[DistributedCacheService.getvalue] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public TTL createTTL(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TTL name required");
    }
    lock.lock();
    try {
      String id = String.format("TTL-%04d", seq++);
      TTL obj = new TTL(id, name.trim());
      obj.validate();
      ttls.put(id, obj);
      System.out.println("[DistributedCacheService.createTTL] stored " + id + " count=" + ttls.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public TTL getTTL(String id) {
    lock.lock();
    try {
      TTL obj = ttls.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown TTL id: " + id);
      }
      System.out.println("[DistributedCacheService.getTTL] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public lastAccessed createlastAccessed(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("lastAccessed name required");
    }
    lock.lock();
    try {
      String id = String.format("LAS-%04d", seq++);
      lastAccessed obj = new lastAccessed(id, name.trim());
      obj.validate();
      last_accesseds.put(id, obj);
      System.out.println("[DistributedCacheService.createlastAccessed] stored " + id + " count=" + last_accesseds.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public lastAccessed getlastAccessed(String id) {
    lock.lock();
    try {
      lastAccessed obj = last_accesseds.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown lastAccessed id: " + id);
      }
      System.out.println("[DistributedCacheService.getlastAccessed] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public CacheNode closeCacheNode(String id) {
    lock.lock();
    try {
      CacheNode obj = cache_nodes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown CacheNode id: " + id);
      }
      System.out.println("[DistributedCacheService.closeCacheNode] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<CacheNode> listActiveCacheNodes() {
    lock.lock();
    try {
      List<CacheNode> out = new ArrayList<>();
      for (CacheNode o : cache_nodes.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[DistributedCacheService.listActiveCacheNodes] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct DistributedCacheService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    DistributedCacheService system = new DistributedCacheService();
    System.out.println("========== STEP 2: Create CacheNode objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    CacheNode first = system.createCacheNode("alpha-cache_node");
    system.createCacheNode("beta-cache_node");
    System.out.println("========== STEP 3: Create CacheEntry ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createCacheEntry("sample-cache_entry");
    System.out.println("========== STEP 4: Create value ==========");
    system.createvalue("sample-value");
    System.out.println("========== STEP 5: Create TTL ==========");
    system.createTTL("sample-ttl");
    System.out.println("========== STEP 6: Create lastAccessed ==========");
    system.createlastAccessed("sample-last_accessed");
    System.out.println("========== Inspect active list ==========");
    system.listActiveCacheNodes();
    System.out.println("========== Close first CacheNode ==========");
    system.closeCacheNode(first.getId());
    try {
      system.closeCacheNode(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getCacheNode("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class CacheNode {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('CacheNode.id required')
    }

    if (!name?.trim()) {
      throw new Error('CacheNode.name required')
    }
    console.log(\`[CacheNode.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`CacheNode \${this.id} invalid status\`)
    }
    console.log(\`[CacheNode.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`CacheNode \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[CacheNode.close] id=\${this.id} -> CLOSED\`)
  }
}


class CacheEntry {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('CacheEntry.id required')
    }

    if (!name?.trim()) {
      throw new Error('CacheEntry.name required')
    }
    console.log(\`[CacheEntry.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`CacheEntry \${this.id} invalid status\`)
    }
    console.log(\`[CacheEntry.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`CacheEntry \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[CacheEntry.close] id=\${this.id} -> CLOSED\`)
  }
}


class value {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('value.id required')
    }

    if (!name?.trim()) {
      throw new Error('value.name required')
    }
    console.log(\`[value.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`value \${this.id} invalid status\`)
    }
    console.log(\`[value.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`value \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[value.close] id=\${this.id} -> CLOSED\`)
  }
}


class TTL {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('TTL.id required')
    }

    if (!name?.trim()) {
      throw new Error('TTL.name required')
    }
    console.log(\`[TTL.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`TTL \${this.id} invalid status\`)
    }
    console.log(\`[TTL.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`TTL \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[TTL.close] id=\${this.id} -> CLOSED\`)
  }
}


class lastAccessed {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('lastAccessed.id required')
    }

    if (!name?.trim()) {
      throw new Error('lastAccessed.name required')
    }
    console.log(\`[lastAccessed.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`lastAccessed \${this.id} invalid status\`)
    }
    console.log(\`[lastAccessed.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`lastAccessed \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[lastAccessed.close] id=\${this.id} -> CLOSED\`)
  }
}

class DistributedCacheService {
  private seq = 1
  private cache_nodes = new Map<string, CacheNode>()
  private cache_entries = new Map<string, CacheEntry>()
  private values = new Map<string, value>()
  private ttls = new Map<string, TTL>()
  private last_accesseds = new Map<string, lastAccessed>()
  constructor() {
    console.log('[DistributedCacheService.__init__] system ready')
  }

  createCacheNode(name: string): CacheNode {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('CacheNode name required')
    }
    const id = \`CAC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new CacheNode(id, cleaned)
    obj.validate()
    this.cache_nodes.set(id, obj)
    console.log(\`[DistributedCacheService.createCacheNode] stored \${id} count=\${this.cache_nodes.size}\`)
    return obj
  }

  getCacheNode(id: string): CacheNode {
    const obj = this.cache_nodes.get(id)
    if (!obj) {
      throw new Error(\`unknown CacheNode id: \${id}\`)
    }
    console.log(\`[DistributedCacheService.getCacheNode] found id=\${obj.id}\`)
    return obj
  }

  createCacheEntry(name: string): CacheEntry {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('CacheEntry name required')
    }
    const id = \`CAC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new CacheEntry(id, cleaned)
    obj.validate()
    this.cache_entries.set(id, obj)
    console.log(\`[DistributedCacheService.createCacheEntry] stored \${id} count=\${this.cache_entries.size}\`)
    return obj
  }

  getCacheEntry(id: string): CacheEntry {
    const obj = this.cache_entries.get(id)
    if (!obj) {
      throw new Error(\`unknown CacheEntry id: \${id}\`)
    }
    console.log(\`[DistributedCacheService.getCacheEntry] found id=\${obj.id}\`)
    return obj
  }

  createvalue(name: string): value {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('value name required')
    }
    const id = \`VAL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new value(id, cleaned)
    obj.validate()
    this.values.set(id, obj)
    console.log(\`[DistributedCacheService.createvalue] stored \${id} count=\${this.values.size}\`)
    return obj
  }

  getvalue(id: string): value {
    const obj = this.values.get(id)
    if (!obj) {
      throw new Error(\`unknown value id: \${id}\`)
    }
    console.log(\`[DistributedCacheService.getvalue] found id=\${obj.id}\`)
    return obj
  }

  createTTL(name: string): TTL {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('TTL name required')
    }
    const id = \`TTL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new TTL(id, cleaned)
    obj.validate()
    this.ttls.set(id, obj)
    console.log(\`[DistributedCacheService.createTTL] stored \${id} count=\${this.ttls.size}\`)
    return obj
  }

  getTTL(id: string): TTL {
    const obj = this.ttls.get(id)
    if (!obj) {
      throw new Error(\`unknown TTL id: \${id}\`)
    }
    console.log(\`[DistributedCacheService.getTTL] found id=\${obj.id}\`)
    return obj
  }

  createlastAccessed(name: string): lastAccessed {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('lastAccessed name required')
    }
    const id = \`LAS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new lastAccessed(id, cleaned)
    obj.validate()
    this.last_accesseds.set(id, obj)
    console.log(\`[DistributedCacheService.createlastAccessed] stored \${id} count=\${this.last_accesseds.size}\`)
    return obj
  }

  getlastAccessed(id: string): lastAccessed {
    const obj = this.last_accesseds.get(id)
    if (!obj) {
      throw new Error(\`unknown lastAccessed id: \${id}\`)
    }
    console.log(\`[DistributedCacheService.getlastAccessed] found id=\${obj.id}\`)
    return obj
  }

  closeCacheNode(id: string): CacheNode {
    const obj = this.getCacheNode(id)
    console.log(\`[DistributedCacheService.closeCacheNode] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveCacheNodes(): CacheNode[] {
    const active = [...this.cache_nodes.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[DistributedCacheService.listActiveCacheNodes] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct DistributedCacheService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new DistributedCacheService()
  console.log('========== STEP 2: Create CacheNode objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createCacheNode('alpha-cache_node')
  system.createCacheNode('beta-cache_node')
  console.log('========== STEP 3: Create CacheEntry ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createCacheEntry('sample-cache_entry')
  console.log('========== STEP 4: Create value ==========')
  system.createvalue('sample-value')
  console.log('========== STEP 5: Create TTL ==========')
  system.createTTL('sample-ttl')
  console.log('========== STEP 6: Create lastAccessed ==========')
  system.createlastAccessed('sample-last_accessed')
  system.listActiveCacheNodes()
  console.log('========== Close first CacheNode ==========')
  system.closeCacheNode(first.id)
  try {
    system.closeCacheNode(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getCacheNode('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class CacheNode {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  CacheNode(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("CacheNode requires id and name");
    }
    cout << "[CacheNode.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("CacheNode invalid status");
    }
    cout << "[CacheNode.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("CacheNode cannot close");
    }
    status_ = "CLOSED";
    cout << "[CacheNode.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class CacheEntry {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  CacheEntry(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("CacheEntry requires id and name");
    }
    cout << "[CacheEntry.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("CacheEntry invalid status");
    }
    cout << "[CacheEntry.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("CacheEntry cannot close");
    }
    status_ = "CLOSED";
    cout << "[CacheEntry.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class value {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  value(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("value requires id and name");
    }
    cout << "[value.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("value invalid status");
    }
    cout << "[value.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("value cannot close");
    }
    status_ = "CLOSED";
    cout << "[value.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class TTL {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  TTL(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("TTL requires id and name");
    }
    cout << "[TTL.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("TTL invalid status");
    }
    cout << "[TTL.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("TTL cannot close");
    }
    status_ = "CLOSED";
    cout << "[TTL.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class lastAccessed {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  lastAccessed(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("lastAccessed requires id and name");
    }
    cout << "[lastAccessed.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("lastAccessed invalid status");
    }
    cout << "[lastAccessed.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("lastAccessed cannot close");
    }
    status_ = "CLOSED";
    cout << "[lastAccessed.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class DistributedCacheService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, CacheNode> cache_nodes_;
  unordered_map<string, CacheEntry> cache_entries_;
  unordered_map<string, value> values_;
  unordered_map<string, TTL> ttls_;
  unordered_map<string, lastAccessed> last_accesseds_;
public:
  DistributedCacheService() {
    cout << "[DistributedCacheService.__init__] system ready" << endl;
  }

  CacheNode createCacheNode(const string& name) {
    if (name.empty()) {
      throw invalid_argument("CacheNode name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CAC-%04d", seq_++);
    CacheNode obj{buf, name};
    obj.validate();
    cache_nodes_.emplace(obj.id(), obj);
    cout << "[DistributedCacheService.createCacheNode] stored " << obj.id() << endl;
    return obj;
  }

  CacheNode getCacheNode(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cache_nodes_.find(id);
    if (it == cache_nodes_.end()) {
      throw out_of_range("unknown CacheNode id");
    }
    cout << "[DistributedCacheService.getCacheNode] found " << id << endl;
    return it->second;
  }

  CacheEntry createCacheEntry(const string& name) {
    if (name.empty()) {
      throw invalid_argument("CacheEntry name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CAC-%04d", seq_++);
    CacheEntry obj{buf, name};
    obj.validate();
    cache_entries_.emplace(obj.id(), obj);
    cout << "[DistributedCacheService.createCacheEntry] stored " << obj.id() << endl;
    return obj;
  }

  CacheEntry getCacheEntry(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cache_entries_.find(id);
    if (it == cache_entries_.end()) {
      throw out_of_range("unknown CacheEntry id");
    }
    cout << "[DistributedCacheService.getCacheEntry] found " << id << endl;
    return it->second;
  }

  value createvalue(const string& name) {
    if (name.empty()) {
      throw invalid_argument("value name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "VAL-%04d", seq_++);
    value obj{buf, name};
    obj.validate();
    values_.emplace(obj.id(), obj);
    cout << "[DistributedCacheService.createvalue] stored " << obj.id() << endl;
    return obj;
  }

  value getvalue(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = values_.find(id);
    if (it == values_.end()) {
      throw out_of_range("unknown value id");
    }
    cout << "[DistributedCacheService.getvalue] found " << id << endl;
    return it->second;
  }

  TTL createTTL(const string& name) {
    if (name.empty()) {
      throw invalid_argument("TTL name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TTL-%04d", seq_++);
    TTL obj{buf, name};
    obj.validate();
    ttls_.emplace(obj.id(), obj);
    cout << "[DistributedCacheService.createTTL] stored " << obj.id() << endl;
    return obj;
  }

  TTL getTTL(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = ttls_.find(id);
    if (it == ttls_.end()) {
      throw out_of_range("unknown TTL id");
    }
    cout << "[DistributedCacheService.getTTL] found " << id << endl;
    return it->second;
  }

  lastAccessed createlastAccessed(const string& name) {
    if (name.empty()) {
      throw invalid_argument("lastAccessed name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LAS-%04d", seq_++);
    lastAccessed obj{buf, name};
    obj.validate();
    last_accesseds_.emplace(obj.id(), obj);
    cout << "[DistributedCacheService.createlastAccessed] stored " << obj.id() << endl;
    return obj;
  }

  lastAccessed getlastAccessed(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = last_accesseds_.find(id);
    if (it == last_accesseds_.end()) {
      throw out_of_range("unknown lastAccessed id");
    }
    cout << "[DistributedCacheService.getlastAccessed] found " << id << endl;
    return it->second;
  }

  CacheNode closeCacheNode(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = cache_nodes_.find(id);
    if (it == cache_nodes_.end()) {
      throw out_of_range("unknown CacheNode");
    }
    cout << "[DistributedCacheService.closeCacheNode] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct DistributedCacheService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  DistributedCacheService system;
  cout << "========== STEP 2: Create CacheNode ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createCacheNode("alpha-cache_node");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createCacheNode("beta-cache_node");
  system.createCacheEntry("sample-cache_entry");
  system.createvalue("sample-value");
  system.createTTL("sample-ttl");
  system.createlastAccessed("sample-last_accessed");
  system.closeCacheNode(first.id());
  try {
    system.closeCacheNode(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getCacheNode("MISSING-ID");
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

type CacheNode struct {
  ID     string
  Name   string
  Status string
}

func NewCacheNode(id, name string) (*CacheNode, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("CacheNode requires id and name")
  }
  obj := &CacheNode{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[CacheNode.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *CacheNode) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("CacheNode invalid status")
  }
  fmt.Printf("[CacheNode.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *CacheNode) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("CacheNode %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[CacheNode.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type CacheEntry struct {
  ID     string
  Name   string
  Status string
}

func NewCacheEntry(id, name string) (*CacheEntry, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("CacheEntry requires id and name")
  }
  obj := &CacheEntry{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[CacheEntry.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *CacheEntry) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("CacheEntry invalid status")
  }
  fmt.Printf("[CacheEntry.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *CacheEntry) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("CacheEntry %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[CacheEntry.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type value struct {
  ID     string
  Name   string
  Status string
}

func Newvalue(id, name string) (*value, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("value requires id and name")
  }
  obj := &value{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[value.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *value) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("value invalid status")
  }
  fmt.Printf("[value.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *value) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("value %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[value.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type TTL struct {
  ID     string
  Name   string
  Status string
}

func NewTTL(id, name string) (*TTL, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("TTL requires id and name")
  }
  obj := &TTL{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[TTL.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *TTL) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("TTL invalid status")
  }
  fmt.Printf("[TTL.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *TTL) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("TTL %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[TTL.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type lastAccessed struct {
  ID     string
  Name   string
  Status string
}

func NewlastAccessed(id, name string) (*lastAccessed, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("lastAccessed requires id and name")
  }
  obj := &lastAccessed{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[lastAccessed.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *lastAccessed) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("lastAccessed invalid status")
  }
  fmt.Printf("[lastAccessed.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *lastAccessed) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("lastAccessed %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[lastAccessed.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type DistributedCacheService struct {
  mu  sync.Mutex
  seq int
  cache_nodes map[string]*CacheNode
  cache_entries map[string]*CacheEntry
  values map[string]*value
  ttls map[string]*TTL
  last_accesseds map[string]*lastAccessed
}

func NewDistributedCacheService() *DistributedCacheService {
  fmt.Println("[DistributedCacheService.__init__] system ready")
  return &DistributedCacheService{
    seq: 1,
    cache_nodes: map[string]*CacheNode{},
    cache_entries: map[string]*CacheEntry{},
    values: map[string]*value{},
    ttls: map[string]*TTL{},
    last_accesseds: map[string]*lastAccessed{},
  }
}

func (s *DistributedCacheService) CreateCacheNode(name string) (*CacheNode, error) {
  if name == "" {
    return nil, fmt.Errorf("CacheNode name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CAC-%04d", s.seq)
  s.seq++
  obj, err := NewCacheNode(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.cache_nodes[id] = obj
  fmt.Printf("[DistributedCacheService.CreateCacheNode] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) GetCacheNode(id string) (*CacheNode, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.cache_nodes[id]
  if !ok {
    return nil, fmt.Errorf("unknown CacheNode id: %s", id)
  }
  fmt.Printf("[DistributedCacheService.GetCacheNode] found %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) CreateCacheEntry(name string) (*CacheEntry, error) {
  if name == "" {
    return nil, fmt.Errorf("CacheEntry name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CAC-%04d", s.seq)
  s.seq++
  obj, err := NewCacheEntry(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.cache_entries[id] = obj
  fmt.Printf("[DistributedCacheService.CreateCacheEntry] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) GetCacheEntry(id string) (*CacheEntry, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.cache_entries[id]
  if !ok {
    return nil, fmt.Errorf("unknown CacheEntry id: %s", id)
  }
  fmt.Printf("[DistributedCacheService.GetCacheEntry] found %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) Createvalue(name string) (*value, error) {
  if name == "" {
    return nil, fmt.Errorf("value name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("VAL-%04d", s.seq)
  s.seq++
  obj, err := Newvalue(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.values[id] = obj
  fmt.Printf("[DistributedCacheService.Createvalue] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) Getvalue(id string) (*value, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.values[id]
  if !ok {
    return nil, fmt.Errorf("unknown value id: %s", id)
  }
  fmt.Printf("[DistributedCacheService.Getvalue] found %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) CreateTTL(name string) (*TTL, error) {
  if name == "" {
    return nil, fmt.Errorf("TTL name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TTL-%04d", s.seq)
  s.seq++
  obj, err := NewTTL(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.ttls[id] = obj
  fmt.Printf("[DistributedCacheService.CreateTTL] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) GetTTL(id string) (*TTL, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.ttls[id]
  if !ok {
    return nil, fmt.Errorf("unknown TTL id: %s", id)
  }
  fmt.Printf("[DistributedCacheService.GetTTL] found %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) CreatelastAccessed(name string) (*lastAccessed, error) {
  if name == "" {
    return nil, fmt.Errorf("lastAccessed name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LAS-%04d", s.seq)
  s.seq++
  obj, err := NewlastAccessed(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.last_accesseds[id] = obj
  fmt.Printf("[DistributedCacheService.CreatelastAccessed] stored %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) GetlastAccessed(id string) (*lastAccessed, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.last_accesseds[id]
  if !ok {
    return nil, fmt.Errorf("unknown lastAccessed id: %s", id)
  }
  fmt.Printf("[DistributedCacheService.GetlastAccessed] found %s\\n", id)
  return obj, nil
}

func (s *DistributedCacheService) CloseCacheNode(id string) (*CacheNode, error) {
  obj, err := s.GetCacheNode(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[DistributedCacheService.CloseCacheNode] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct DistributedCacheService ==========")
  system := NewDistributedCacheService()
  fmt.Println("========== STEP 2: Create CacheNode ==========")
  first, _ := system.CreateCacheNode("alpha-cache_node")
  system.CreateCacheNode("beta-cache_node")
  system.CreateCacheEntry("sample-cache_entry")
  system.Createvalue("sample-value")
  system.CreateTTL("sample-ttl")
  system.CreatelastAccessed("sample-last_accessed")
  system.CloseCacheNode(first.ID)
  if _, err := system.CloseCacheNode(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetCacheNode("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class CacheNode {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public CacheNode(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CacheNode requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[CacheNode.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("CacheNode invalid status");
    }
    Console.WriteLine("[CacheNode.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("CacheNode " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[CacheNode.close] id=" + Id + " -> CLOSED");
  }
}


sealed class CacheEntry {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public CacheEntry(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CacheEntry requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[CacheEntry.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("CacheEntry invalid status");
    }
    Console.WriteLine("[CacheEntry.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("CacheEntry " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[CacheEntry.close] id=" + Id + " -> CLOSED");
  }
}


sealed class value {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public value(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("value requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[value.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("value invalid status");
    }
    Console.WriteLine("[value.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("value " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[value.close] id=" + Id + " -> CLOSED");
  }
}


sealed class TTL {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public TTL(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TTL requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[TTL.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("TTL invalid status");
    }
    Console.WriteLine("[TTL.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("TTL " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[TTL.close] id=" + Id + " -> CLOSED");
  }
}


sealed class lastAccessed {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public lastAccessed(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("lastAccessed requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[lastAccessed.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("lastAccessed invalid status");
    }
    Console.WriteLine("[lastAccessed.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("lastAccessed " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[lastAccessed.close] id=" + Id + " -> CLOSED");
  }
}

sealed class DistributedCacheService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, CacheNode> _cache_nodes = new();
  private readonly Dictionary<string, CacheEntry> _cache_entries = new();
  private readonly Dictionary<string, value> _values = new();
  private readonly Dictionary<string, TTL> _ttls = new();
  private readonly Dictionary<string, lastAccessed> _last_accesseds = new();
  public DistributedCacheService() {
    Console.WriteLine("[DistributedCacheService.__init__] system ready");
  }

  public CacheNode CreateCacheNode(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CacheNode name required");
    }
    lock (_gate) {
      var id = string.Format("CAC-{0:D4}", _seq++);
      var obj = new CacheNode(id, name.Trim());
      obj.Validate();
      _cache_nodes[id] = obj;
      Console.WriteLine("[DistributedCacheService.CreateCacheNode] stored " + id);
      return obj;
    }
  }

  public CacheNode GetCacheNode(string id) {
    lock (_gate) {
      if (!_cache_nodes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown CacheNode id: " + id);
      }
      Console.WriteLine("[DistributedCacheService.GetCacheNode] found " + id);
      return obj;
    }
  }

  public CacheEntry CreateCacheEntry(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("CacheEntry name required");
    }
    lock (_gate) {
      var id = string.Format("CAC-{0:D4}", _seq++);
      var obj = new CacheEntry(id, name.Trim());
      obj.Validate();
      _cache_entries[id] = obj;
      Console.WriteLine("[DistributedCacheService.CreateCacheEntry] stored " + id);
      return obj;
    }
  }

  public CacheEntry GetCacheEntry(string id) {
    lock (_gate) {
      if (!_cache_entries.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown CacheEntry id: " + id);
      }
      Console.WriteLine("[DistributedCacheService.GetCacheEntry] found " + id);
      return obj;
    }
  }

  public value Createvalue(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("value name required");
    }
    lock (_gate) {
      var id = string.Format("VAL-{0:D4}", _seq++);
      var obj = new value(id, name.Trim());
      obj.Validate();
      _values[id] = obj;
      Console.WriteLine("[DistributedCacheService.Createvalue] stored " + id);
      return obj;
    }
  }

  public value Getvalue(string id) {
    lock (_gate) {
      if (!_values.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown value id: " + id);
      }
      Console.WriteLine("[DistributedCacheService.Getvalue] found " + id);
      return obj;
    }
  }

  public TTL CreateTTL(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TTL name required");
    }
    lock (_gate) {
      var id = string.Format("TTL-{0:D4}", _seq++);
      var obj = new TTL(id, name.Trim());
      obj.Validate();
      _ttls[id] = obj;
      Console.WriteLine("[DistributedCacheService.CreateTTL] stored " + id);
      return obj;
    }
  }

  public TTL GetTTL(string id) {
    lock (_gate) {
      if (!_ttls.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown TTL id: " + id);
      }
      Console.WriteLine("[DistributedCacheService.GetTTL] found " + id);
      return obj;
    }
  }

  public lastAccessed CreatelastAccessed(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("lastAccessed name required");
    }
    lock (_gate) {
      var id = string.Format("LAS-{0:D4}", _seq++);
      var obj = new lastAccessed(id, name.Trim());
      obj.Validate();
      _last_accesseds[id] = obj;
      Console.WriteLine("[DistributedCacheService.CreatelastAccessed] stored " + id);
      return obj;
    }
  }

  public lastAccessed GetlastAccessed(string id) {
    lock (_gate) {
      if (!_last_accesseds.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown lastAccessed id: " + id);
      }
      Console.WriteLine("[DistributedCacheService.GetlastAccessed] found " + id);
      return obj;
    }
  }

  public CacheNode CloseCacheNode(string id) {
    var obj = GetCacheNode(id);
    Console.WriteLine("[DistributedCacheService.CloseCacheNode] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct DistributedCacheService ==========");
    var system = new DistributedCacheService();
    Console.WriteLine("========== STEP 2: Create CacheNode ==========");
    var first = system.CreateCacheNode("alpha-cache_node");
    system.CreateCacheNode("beta-cache_node");
    system.CreateCacheEntry("sample-cache_entry");
    system.Createvalue("sample-value");
    system.CreateTTL("sample-ttl");
    system.CreatelastAccessed("sample-last_accessed");
    system.CloseCacheNode(first.Id);
    try {
      system.CloseCacheNode(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetCacheNode("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const distributedCacheSolution: ProblemSolution = {
  slug: 'distributed-cache',
  title: 'Distributed Cache (Redis-like) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a distributed in-memory cache system supporting key-value operations, TTL, eviction policies, and consistent hashing. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'GET, SET, DEL key-value operations',
      'TTL per key with lazy + active expiry',
      'LRU and LFU eviction when memory limit is reached',
      'Horizontal scaling by adding/removing cache nodes',
      'Data replication across replicas for high availability',
      'Pub-Sub for cache invalidation across nodes',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'GET, SET, DEL key-value operations?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'TTL per key with lazy + active expiry?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'LRU and LFU eviction when memory limit is reached?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Horizontal scaling by adding/removing cache nodes?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Data replication across replicas for high availability?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. DistributedCacheService is the facade stereotype. CacheNode, CacheEntry, value, TTL, lastAccessed are concrete domain classes with id/name/status and validate/close.',
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
          'Construct DistributedCacheService.',
          'createCacheNode twice and create the related UML classes.',
          'closeCacheNode once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'DistributedCacheService', responsibility: 'UML facade - orchestrates Distributed Cache (Redis-like).', keyMembers: ['create*', 'get*', 'closeCacheNode'] },
    { name: 'CacheNode', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'CacheEntry', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'value', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TTL', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'lastAccessed', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from DistributedCacheService to CacheNode, CacheEntry, value, TTL, lastAccessed. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on DistributedCacheService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'DistributedCacheService', responsibility: 'UML facade - orchestrates Distributed Cache (Redis-like).', keyMembers: ['create*', 'get*', 'closeCacheNode'] },
    { name: 'CacheNode', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'CacheEntry', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'value', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TTL', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'lastAccessed', responsibility: 'UML class - domain object for Distributed Cache (Redis-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'DistributedCacheService exposes create/get/close and owns composed collections.' },
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
      'main constructs DistributedCacheService, creates UML domain objects, closes the primary CacheNode, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct DistributedCacheService.',
      'createCacheNode for alpha and beta.',
      'create remaining UML classes.',
      'closeCacheNode(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createCacheNode("alpha..."); closeCacheNode(id)',
        output: '[CacheNode.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeCacheNode(alreadyClosed) or getCacheNode("MISSING-ID")',
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
