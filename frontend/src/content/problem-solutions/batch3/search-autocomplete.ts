import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'SearchAutocompleteService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_trie_nodes', 'Map<string, TrieNode>'),
    attr('-', '_search_terms', 'Map<string, SearchTerm>'),
    attr('-', '_query_logs', 'Map<string, QueryLog>'),
    attr('-', '_top_kcaches', 'Map<string, TopKCache>'),
    attr('-', '_personalization_services', 'Map<string, PersonalizationService>'),
  ], [
    method('+', 'createTrieNode', 'name: string', 'TrieNode'),
    method('+', 'createSearchTerm', 'name: string', 'SearchTerm'),
    method('+', 'createQueryLog', 'name: string', 'QueryLog'),
    method('+', 'createTopKCache', 'name: string', 'TopKCache'),
    method('+', 'createPersonalizationService', 'name: string', 'PersonalizationService'),
    method('+', 'getTrieNode', 'id: string', 'TrieNode'),
    method('+', 'getSearchTerm', 'id: string', 'SearchTerm'),
    method('+', 'getQueryLog', 'id: string', 'QueryLog'),
    method('+', 'getTopKCache', 'id: string', 'TopKCache'),
    method('+', 'getPersonalizationService', 'id: string', 'PersonalizationService'),
    method('+', 'closeTrieNode', 'id: string', 'TrieNode'),
  ], 'facade'),
  cls('n1', 'TrieNode', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'SearchTerm', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'QueryLog', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'TopKCache', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'PersonalizationService', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("search-autocomplete")


class TrieNode:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("TrieNode.id is required")
        if not name or not name.strip():
            raise ValueError("TrieNode.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[TrieNode.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"TrieNode {self.id} has invalid status={self.status}")
        log.info("[TrieNode.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"TrieNode {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[TrieNode.close] id=%s -> CLOSED", self.id)


class SearchTerm:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("SearchTerm.id is required")
        if not name or not name.strip():
            raise ValueError("SearchTerm.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[SearchTerm.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"SearchTerm {self.id} has invalid status={self.status}")
        log.info("[SearchTerm.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"SearchTerm {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[SearchTerm.close] id=%s -> CLOSED", self.id)


class QueryLog:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("QueryLog.id is required")
        if not name or not name.strip():
            raise ValueError("QueryLog.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[QueryLog.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"QueryLog {self.id} has invalid status={self.status}")
        log.info("[QueryLog.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"QueryLog {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[QueryLog.close] id=%s -> CLOSED", self.id)


class TopKCache:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("TopKCache.id is required")
        if not name or not name.strip():
            raise ValueError("TopKCache.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[TopKCache.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"TopKCache {self.id} has invalid status={self.status}")
        log.info("[TopKCache.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"TopKCache {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[TopKCache.close] id=%s -> CLOSED", self.id)


class PersonalizationService:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("PersonalizationService.id is required")
        if not name or not name.strip():
            raise ValueError("PersonalizationService.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[PersonalizationService.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"PersonalizationService {self.id} has invalid status={self.status}")
        log.info("[PersonalizationService.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"PersonalizationService {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[PersonalizationService.close] id=%s -> CLOSED", self.id)


class SearchAutocompleteService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._trie_nodes: Dict[str, TrieNode] = {}
        self._search_terms: Dict[str, SearchTerm] = {}
        self._query_logs: Dict[str, QueryLog] = {}
        self._top_kcaches: Dict[str, TopKCache] = {}
        self._personalization_services: Dict[str, PersonalizationService] = {}
        log.info("[SearchAutocompleteService.__init__] system ready; managing: TrieNode, SearchTerm, QueryLog, TopKCache, PersonalizationService")

    def create_trie_node(self, name: str) -> TrieNode:
        """UML: SearchAutocompleteService.create_trie_node(name) -> TrieNode"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("TrieNode name is required")
        with self._lock:
            item_id = f"TRI-{self._seq:04d}"
            self._seq += 1
            obj = TrieNode(item_id, cleaned)
            obj.validate()
            self._trie_nodes[item_id] = obj
            log.info("[SearchAutocompleteService.create_trie_node] stored %s in _trie_nodes (count=%s)", item_id, len(self._trie_nodes))
            return obj

    def get_trie_node(self, item_id: str) -> TrieNode:
        with self._lock:
            obj = self._trie_nodes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown TrieNode id: {item_id}")
            log.info("[SearchAutocompleteService.get_trie_node] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_search_term(self, name: str) -> SearchTerm:
        """UML: SearchAutocompleteService.create_search_term(name) -> SearchTerm"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("SearchTerm name is required")
        with self._lock:
            item_id = f"SEA-{self._seq:04d}"
            self._seq += 1
            obj = SearchTerm(item_id, cleaned)
            obj.validate()
            self._search_terms[item_id] = obj
            log.info("[SearchAutocompleteService.create_search_term] stored %s in _search_terms (count=%s)", item_id, len(self._search_terms))
            return obj

    def get_search_term(self, item_id: str) -> SearchTerm:
        with self._lock:
            obj = self._search_terms.get(item_id)
            if obj is None:
                raise KeyError(f"unknown SearchTerm id: {item_id}")
            log.info("[SearchAutocompleteService.get_search_term] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_query_log(self, name: str) -> QueryLog:
        """UML: SearchAutocompleteService.create_query_log(name) -> QueryLog"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("QueryLog name is required")
        with self._lock:
            item_id = f"QUE-{self._seq:04d}"
            self._seq += 1
            obj = QueryLog(item_id, cleaned)
            obj.validate()
            self._query_logs[item_id] = obj
            log.info("[SearchAutocompleteService.create_query_log] stored %s in _query_logs (count=%s)", item_id, len(self._query_logs))
            return obj

    def get_query_log(self, item_id: str) -> QueryLog:
        with self._lock:
            obj = self._query_logs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown QueryLog id: {item_id}")
            log.info("[SearchAutocompleteService.get_query_log] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_top_kcache(self, name: str) -> TopKCache:
        """UML: SearchAutocompleteService.create_top_kcache(name) -> TopKCache"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("TopKCache name is required")
        with self._lock:
            item_id = f"TOP-{self._seq:04d}"
            self._seq += 1
            obj = TopKCache(item_id, cleaned)
            obj.validate()
            self._top_kcaches[item_id] = obj
            log.info("[SearchAutocompleteService.create_top_kcache] stored %s in _top_kcaches (count=%s)", item_id, len(self._top_kcaches))
            return obj

    def get_top_kcache(self, item_id: str) -> TopKCache:
        with self._lock:
            obj = self._top_kcaches.get(item_id)
            if obj is None:
                raise KeyError(f"unknown TopKCache id: {item_id}")
            log.info("[SearchAutocompleteService.get_top_kcache] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_personalization_service(self, name: str) -> PersonalizationService:
        """UML: SearchAutocompleteService.create_personalization_service(name) -> PersonalizationService"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("PersonalizationService name is required")
        with self._lock:
            item_id = f"PER-{self._seq:04d}"
            self._seq += 1
            obj = PersonalizationService(item_id, cleaned)
            obj.validate()
            self._personalization_services[item_id] = obj
            log.info("[SearchAutocompleteService.create_personalization_service] stored %s in _personalization_services (count=%s)", item_id, len(self._personalization_services))
            return obj

    def get_personalization_service(self, item_id: str) -> PersonalizationService:
        with self._lock:
            obj = self._personalization_services.get(item_id)
            if obj is None:
                raise KeyError(f"unknown PersonalizationService id: {item_id}")
            log.info("[SearchAutocompleteService.get_personalization_service] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_trie_node(self, item_id: str) -> TrieNode:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._trie_nodes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown TrieNode id: {item_id}")
            log.info("[SearchAutocompleteService.close_trie_node] closing %s via TrieNode.close()", item_id)
            obj.close()
            return obj

    def list_active_trie_nodes(self) -> List[TrieNode]:
        with self._lock:
            active = [o for o in self._trie_nodes.values() if o.status == "ACTIVE"]
            log.info("[SearchAutocompleteService.list_active_trie_nodes] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct SearchAutocompleteService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = SearchAutocompleteService()

    log.info("========== STEP 2: Create primary TrieNode objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_trie_node("alpha-trie_node")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_trie_node("beta-trie_node")

    log.info("========== STEP 3: Create SearchTerm (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_search_term("sample-search_term")

    log.info("========== STEP 4: Create QueryLog (UML class) ==========")
    system.create_query_log("sample-query_log")

    log.info("========== STEP 5: Create TopKCache (UML class) ==========")
    system.create_top_kcache("sample-top_kcache")

    log.info("========== STEP 6: Create PersonalizationService (UML class) ==========")
    system.create_personalization_service("sample-personalization_service")

    log.info("========== STEP 7: Inspect active TrieNode list ==========")
    system.list_active_trie_nodes()

    log.info("========== STEP 8: Close first TrieNode ==========")
    system.close_trie_node(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_trie_node(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from TrieNode.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_trie_node("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_trie_node: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_trie_nodes()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class TrieNode {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  TrieNode(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("TrieNode.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TrieNode.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[TrieNode.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("TrieNode " + id + " invalid status");
    }
    System.out.println("[TrieNode.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("TrieNode " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[TrieNode.close] id=" + id + " -> CLOSED");
  }
}


class SearchTerm {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  SearchTerm(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("SearchTerm.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("SearchTerm.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[SearchTerm.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("SearchTerm " + id + " invalid status");
    }
    System.out.println("[SearchTerm.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("SearchTerm " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[SearchTerm.close] id=" + id + " -> CLOSED");
  }
}


class QueryLog {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  QueryLog(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("QueryLog.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("QueryLog.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[QueryLog.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("QueryLog " + id + " invalid status");
    }
    System.out.println("[QueryLog.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("QueryLog " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[QueryLog.close] id=" + id + " -> CLOSED");
  }
}


class TopKCache {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  TopKCache(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("TopKCache.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TopKCache.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[TopKCache.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("TopKCache " + id + " invalid status");
    }
    System.out.println("[TopKCache.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("TopKCache " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[TopKCache.close] id=" + id + " -> CLOSED");
  }
}


class PersonalizationService {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  PersonalizationService(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("PersonalizationService.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("PersonalizationService.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[PersonalizationService.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("PersonalizationService " + id + " invalid status");
    }
    System.out.println("[PersonalizationService.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("PersonalizationService " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[PersonalizationService.close] id=" + id + " -> CLOSED");
  }
}

public class SearchAutocompleteService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, TrieNode> trie_nodes = new LinkedHashMap<>();
  private final Map<String, SearchTerm> search_terms = new LinkedHashMap<>();
  private final Map<String, QueryLog> query_logs = new LinkedHashMap<>();
  private final Map<String, TopKCache> top_kcaches = new LinkedHashMap<>();
  private final Map<String, PersonalizationService> personalization_services = new LinkedHashMap<>();

  public SearchAutocompleteService() {
    System.out.println("[SearchAutocompleteService.__init__] system ready");
  }

  public TrieNode createTrieNode(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TrieNode name required");
    }
    lock.lock();
    try {
      String id = String.format("TRI-%04d", seq++);
      TrieNode obj = new TrieNode(id, name.trim());
      obj.validate();
      trie_nodes.put(id, obj);
      System.out.println("[SearchAutocompleteService.createTrieNode] stored " + id + " count=" + trie_nodes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public TrieNode getTrieNode(String id) {
    lock.lock();
    try {
      TrieNode obj = trie_nodes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown TrieNode id: " + id);
      }
      System.out.println("[SearchAutocompleteService.getTrieNode] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public SearchTerm createSearchTerm(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("SearchTerm name required");
    }
    lock.lock();
    try {
      String id = String.format("SEA-%04d", seq++);
      SearchTerm obj = new SearchTerm(id, name.trim());
      obj.validate();
      search_terms.put(id, obj);
      System.out.println("[SearchAutocompleteService.createSearchTerm] stored " + id + " count=" + search_terms.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public SearchTerm getSearchTerm(String id) {
    lock.lock();
    try {
      SearchTerm obj = search_terms.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown SearchTerm id: " + id);
      }
      System.out.println("[SearchAutocompleteService.getSearchTerm] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public QueryLog createQueryLog(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("QueryLog name required");
    }
    lock.lock();
    try {
      String id = String.format("QUE-%04d", seq++);
      QueryLog obj = new QueryLog(id, name.trim());
      obj.validate();
      query_logs.put(id, obj);
      System.out.println("[SearchAutocompleteService.createQueryLog] stored " + id + " count=" + query_logs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public QueryLog getQueryLog(String id) {
    lock.lock();
    try {
      QueryLog obj = query_logs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown QueryLog id: " + id);
      }
      System.out.println("[SearchAutocompleteService.getQueryLog] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public TopKCache createTopKCache(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("TopKCache name required");
    }
    lock.lock();
    try {
      String id = String.format("TOP-%04d", seq++);
      TopKCache obj = new TopKCache(id, name.trim());
      obj.validate();
      top_kcaches.put(id, obj);
      System.out.println("[SearchAutocompleteService.createTopKCache] stored " + id + " count=" + top_kcaches.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public TopKCache getTopKCache(String id) {
    lock.lock();
    try {
      TopKCache obj = top_kcaches.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown TopKCache id: " + id);
      }
      System.out.println("[SearchAutocompleteService.getTopKCache] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public PersonalizationService createPersonalizationService(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("PersonalizationService name required");
    }
    lock.lock();
    try {
      String id = String.format("PER-%04d", seq++);
      PersonalizationService obj = new PersonalizationService(id, name.trim());
      obj.validate();
      personalization_services.put(id, obj);
      System.out.println("[SearchAutocompleteService.createPersonalizationService] stored " + id + " count=" + personalization_services.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public PersonalizationService getPersonalizationService(String id) {
    lock.lock();
    try {
      PersonalizationService obj = personalization_services.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown PersonalizationService id: " + id);
      }
      System.out.println("[SearchAutocompleteService.getPersonalizationService] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public TrieNode closeTrieNode(String id) {
    lock.lock();
    try {
      TrieNode obj = trie_nodes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown TrieNode id: " + id);
      }
      System.out.println("[SearchAutocompleteService.closeTrieNode] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<TrieNode> listActiveTrieNodes() {
    lock.lock();
    try {
      List<TrieNode> out = new ArrayList<>();
      for (TrieNode o : trie_nodes.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[SearchAutocompleteService.listActiveTrieNodes] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct SearchAutocompleteService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    SearchAutocompleteService system = new SearchAutocompleteService();
    System.out.println("========== STEP 2: Create TrieNode objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    TrieNode first = system.createTrieNode("alpha-trie_node");
    system.createTrieNode("beta-trie_node");
    System.out.println("========== STEP 3: Create SearchTerm ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createSearchTerm("sample-search_term");
    System.out.println("========== STEP 4: Create QueryLog ==========");
    system.createQueryLog("sample-query_log");
    System.out.println("========== STEP 5: Create TopKCache ==========");
    system.createTopKCache("sample-top_kcache");
    System.out.println("========== STEP 6: Create PersonalizationService ==========");
    system.createPersonalizationService("sample-personalization_service");
    System.out.println("========== Inspect active list ==========");
    system.listActiveTrieNodes();
    System.out.println("========== Close first TrieNode ==========");
    system.closeTrieNode(first.getId());
    try {
      system.closeTrieNode(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getTrieNode("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class TrieNode {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('TrieNode.id required')
    }

    if (!name?.trim()) {
      throw new Error('TrieNode.name required')
    }
    console.log(\`[TrieNode.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`TrieNode \${this.id} invalid status\`)
    }
    console.log(\`[TrieNode.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`TrieNode \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[TrieNode.close] id=\${this.id} -> CLOSED\`)
  }
}


class SearchTerm {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('SearchTerm.id required')
    }

    if (!name?.trim()) {
      throw new Error('SearchTerm.name required')
    }
    console.log(\`[SearchTerm.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`SearchTerm \${this.id} invalid status\`)
    }
    console.log(\`[SearchTerm.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`SearchTerm \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[SearchTerm.close] id=\${this.id} -> CLOSED\`)
  }
}


class QueryLog {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('QueryLog.id required')
    }

    if (!name?.trim()) {
      throw new Error('QueryLog.name required')
    }
    console.log(\`[QueryLog.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`QueryLog \${this.id} invalid status\`)
    }
    console.log(\`[QueryLog.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`QueryLog \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[QueryLog.close] id=\${this.id} -> CLOSED\`)
  }
}


class TopKCache {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('TopKCache.id required')
    }

    if (!name?.trim()) {
      throw new Error('TopKCache.name required')
    }
    console.log(\`[TopKCache.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`TopKCache \${this.id} invalid status\`)
    }
    console.log(\`[TopKCache.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`TopKCache \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[TopKCache.close] id=\${this.id} -> CLOSED\`)
  }
}


class PersonalizationService {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('PersonalizationService.id required')
    }

    if (!name?.trim()) {
      throw new Error('PersonalizationService.name required')
    }
    console.log(\`[PersonalizationService.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`PersonalizationService \${this.id} invalid status\`)
    }
    console.log(\`[PersonalizationService.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`PersonalizationService \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[PersonalizationService.close] id=\${this.id} -> CLOSED\`)
  }
}

class SearchAutocompleteService {
  private seq = 1
  private trie_nodes = new Map<string, TrieNode>()
  private search_terms = new Map<string, SearchTerm>()
  private query_logs = new Map<string, QueryLog>()
  private top_kcaches = new Map<string, TopKCache>()
  private personalization_services = new Map<string, PersonalizationService>()
  constructor() {
    console.log('[SearchAutocompleteService.__init__] system ready')
  }

  createTrieNode(name: string): TrieNode {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('TrieNode name required')
    }
    const id = \`TRI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new TrieNode(id, cleaned)
    obj.validate()
    this.trie_nodes.set(id, obj)
    console.log(\`[SearchAutocompleteService.createTrieNode] stored \${id} count=\${this.trie_nodes.size}\`)
    return obj
  }

  getTrieNode(id: string): TrieNode {
    const obj = this.trie_nodes.get(id)
    if (!obj) {
      throw new Error(\`unknown TrieNode id: \${id}\`)
    }
    console.log(\`[SearchAutocompleteService.getTrieNode] found id=\${obj.id}\`)
    return obj
  }

  createSearchTerm(name: string): SearchTerm {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('SearchTerm name required')
    }
    const id = \`SEA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new SearchTerm(id, cleaned)
    obj.validate()
    this.search_terms.set(id, obj)
    console.log(\`[SearchAutocompleteService.createSearchTerm] stored \${id} count=\${this.search_terms.size}\`)
    return obj
  }

  getSearchTerm(id: string): SearchTerm {
    const obj = this.search_terms.get(id)
    if (!obj) {
      throw new Error(\`unknown SearchTerm id: \${id}\`)
    }
    console.log(\`[SearchAutocompleteService.getSearchTerm] found id=\${obj.id}\`)
    return obj
  }

  createQueryLog(name: string): QueryLog {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('QueryLog name required')
    }
    const id = \`QUE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new QueryLog(id, cleaned)
    obj.validate()
    this.query_logs.set(id, obj)
    console.log(\`[SearchAutocompleteService.createQueryLog] stored \${id} count=\${this.query_logs.size}\`)
    return obj
  }

  getQueryLog(id: string): QueryLog {
    const obj = this.query_logs.get(id)
    if (!obj) {
      throw new Error(\`unknown QueryLog id: \${id}\`)
    }
    console.log(\`[SearchAutocompleteService.getQueryLog] found id=\${obj.id}\`)
    return obj
  }

  createTopKCache(name: string): TopKCache {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('TopKCache name required')
    }
    const id = \`TOP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new TopKCache(id, cleaned)
    obj.validate()
    this.top_kcaches.set(id, obj)
    console.log(\`[SearchAutocompleteService.createTopKCache] stored \${id} count=\${this.top_kcaches.size}\`)
    return obj
  }

  getTopKCache(id: string): TopKCache {
    const obj = this.top_kcaches.get(id)
    if (!obj) {
      throw new Error(\`unknown TopKCache id: \${id}\`)
    }
    console.log(\`[SearchAutocompleteService.getTopKCache] found id=\${obj.id}\`)
    return obj
  }

  createPersonalizationService(name: string): PersonalizationService {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('PersonalizationService name required')
    }
    const id = \`PER-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new PersonalizationService(id, cleaned)
    obj.validate()
    this.personalization_services.set(id, obj)
    console.log(\`[SearchAutocompleteService.createPersonalizationService] stored \${id} count=\${this.personalization_services.size}\`)
    return obj
  }

  getPersonalizationService(id: string): PersonalizationService {
    const obj = this.personalization_services.get(id)
    if (!obj) {
      throw new Error(\`unknown PersonalizationService id: \${id}\`)
    }
    console.log(\`[SearchAutocompleteService.getPersonalizationService] found id=\${obj.id}\`)
    return obj
  }

  closeTrieNode(id: string): TrieNode {
    const obj = this.getTrieNode(id)
    console.log(\`[SearchAutocompleteService.closeTrieNode] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveTrieNodes(): TrieNode[] {
    const active = [...this.trie_nodes.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[SearchAutocompleteService.listActiveTrieNodes] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct SearchAutocompleteService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new SearchAutocompleteService()
  console.log('========== STEP 2: Create TrieNode objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createTrieNode('alpha-trie_node')
  system.createTrieNode('beta-trie_node')
  console.log('========== STEP 3: Create SearchTerm ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createSearchTerm('sample-search_term')
  console.log('========== STEP 4: Create QueryLog ==========')
  system.createQueryLog('sample-query_log')
  console.log('========== STEP 5: Create TopKCache ==========')
  system.createTopKCache('sample-top_kcache')
  console.log('========== STEP 6: Create PersonalizationService ==========')
  system.createPersonalizationService('sample-personalization_service')
  system.listActiveTrieNodes()
  console.log('========== Close first TrieNode ==========')
  system.closeTrieNode(first.id)
  try {
    system.closeTrieNode(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getTrieNode('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class TrieNode {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  TrieNode(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("TrieNode requires id and name");
    }
    cout << "[TrieNode.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("TrieNode invalid status");
    }
    cout << "[TrieNode.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("TrieNode cannot close");
    }
    status_ = "CLOSED";
    cout << "[TrieNode.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class SearchTerm {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  SearchTerm(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("SearchTerm requires id and name");
    }
    cout << "[SearchTerm.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("SearchTerm invalid status");
    }
    cout << "[SearchTerm.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("SearchTerm cannot close");
    }
    status_ = "CLOSED";
    cout << "[SearchTerm.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class QueryLog {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  QueryLog(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("QueryLog requires id and name");
    }
    cout << "[QueryLog.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("QueryLog invalid status");
    }
    cout << "[QueryLog.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("QueryLog cannot close");
    }
    status_ = "CLOSED";
    cout << "[QueryLog.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class TopKCache {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  TopKCache(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("TopKCache requires id and name");
    }
    cout << "[TopKCache.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("TopKCache invalid status");
    }
    cout << "[TopKCache.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("TopKCache cannot close");
    }
    status_ = "CLOSED";
    cout << "[TopKCache.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class PersonalizationService {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  PersonalizationService(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("PersonalizationService requires id and name");
    }
    cout << "[PersonalizationService.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("PersonalizationService invalid status");
    }
    cout << "[PersonalizationService.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("PersonalizationService cannot close");
    }
    status_ = "CLOSED";
    cout << "[PersonalizationService.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class SearchAutocompleteService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, TrieNode> trie_nodes_;
  unordered_map<string, SearchTerm> search_terms_;
  unordered_map<string, QueryLog> query_logs_;
  unordered_map<string, TopKCache> top_kcaches_;
  unordered_map<string, PersonalizationService> personalization_services_;
public:
  SearchAutocompleteService() {
    cout << "[SearchAutocompleteService.__init__] system ready" << endl;
  }

  TrieNode createTrieNode(const string& name) {
    if (name.empty()) {
      throw invalid_argument("TrieNode name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TRI-%04d", seq_++);
    TrieNode obj{buf, name};
    obj.validate();
    trie_nodes_.emplace(obj.id(), obj);
    cout << "[SearchAutocompleteService.createTrieNode] stored " << obj.id() << endl;
    return obj;
  }

  TrieNode getTrieNode(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = trie_nodes_.find(id);
    if (it == trie_nodes_.end()) {
      throw out_of_range("unknown TrieNode id");
    }
    cout << "[SearchAutocompleteService.getTrieNode] found " << id << endl;
    return it->second;
  }

  SearchTerm createSearchTerm(const string& name) {
    if (name.empty()) {
      throw invalid_argument("SearchTerm name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SEA-%04d", seq_++);
    SearchTerm obj{buf, name};
    obj.validate();
    search_terms_.emplace(obj.id(), obj);
    cout << "[SearchAutocompleteService.createSearchTerm] stored " << obj.id() << endl;
    return obj;
  }

  SearchTerm getSearchTerm(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = search_terms_.find(id);
    if (it == search_terms_.end()) {
      throw out_of_range("unknown SearchTerm id");
    }
    cout << "[SearchAutocompleteService.getSearchTerm] found " << id << endl;
    return it->second;
  }

  QueryLog createQueryLog(const string& name) {
    if (name.empty()) {
      throw invalid_argument("QueryLog name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "QUE-%04d", seq_++);
    QueryLog obj{buf, name};
    obj.validate();
    query_logs_.emplace(obj.id(), obj);
    cout << "[SearchAutocompleteService.createQueryLog] stored " << obj.id() << endl;
    return obj;
  }

  QueryLog getQueryLog(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = query_logs_.find(id);
    if (it == query_logs_.end()) {
      throw out_of_range("unknown QueryLog id");
    }
    cout << "[SearchAutocompleteService.getQueryLog] found " << id << endl;
    return it->second;
  }

  TopKCache createTopKCache(const string& name) {
    if (name.empty()) {
      throw invalid_argument("TopKCache name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TOP-%04d", seq_++);
    TopKCache obj{buf, name};
    obj.validate();
    top_kcaches_.emplace(obj.id(), obj);
    cout << "[SearchAutocompleteService.createTopKCache] stored " << obj.id() << endl;
    return obj;
  }

  TopKCache getTopKCache(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = top_kcaches_.find(id);
    if (it == top_kcaches_.end()) {
      throw out_of_range("unknown TopKCache id");
    }
    cout << "[SearchAutocompleteService.getTopKCache] found " << id << endl;
    return it->second;
  }

  PersonalizationService createPersonalizationService(const string& name) {
    if (name.empty()) {
      throw invalid_argument("PersonalizationService name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PER-%04d", seq_++);
    PersonalizationService obj{buf, name};
    obj.validate();
    personalization_services_.emplace(obj.id(), obj);
    cout << "[SearchAutocompleteService.createPersonalizationService] stored " << obj.id() << endl;
    return obj;
  }

  PersonalizationService getPersonalizationService(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = personalization_services_.find(id);
    if (it == personalization_services_.end()) {
      throw out_of_range("unknown PersonalizationService id");
    }
    cout << "[SearchAutocompleteService.getPersonalizationService] found " << id << endl;
    return it->second;
  }

  TrieNode closeTrieNode(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = trie_nodes_.find(id);
    if (it == trie_nodes_.end()) {
      throw out_of_range("unknown TrieNode");
    }
    cout << "[SearchAutocompleteService.closeTrieNode] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct SearchAutocompleteService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  SearchAutocompleteService system;
  cout << "========== STEP 2: Create TrieNode ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createTrieNode("alpha-trie_node");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createTrieNode("beta-trie_node");
  system.createSearchTerm("sample-search_term");
  system.createQueryLog("sample-query_log");
  system.createTopKCache("sample-top_kcache");
  system.createPersonalizationService("sample-personalization_service");
  system.closeTrieNode(first.id());
  try {
    system.closeTrieNode(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getTrieNode("MISSING-ID");
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

type TrieNode struct {
  ID     string
  Name   string
  Status string
}

func NewTrieNode(id, name string) (*TrieNode, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("TrieNode requires id and name")
  }
  obj := &TrieNode{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[TrieNode.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *TrieNode) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("TrieNode invalid status")
  }
  fmt.Printf("[TrieNode.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *TrieNode) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("TrieNode %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[TrieNode.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type SearchTerm struct {
  ID     string
  Name   string
  Status string
}

func NewSearchTerm(id, name string) (*SearchTerm, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("SearchTerm requires id and name")
  }
  obj := &SearchTerm{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[SearchTerm.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *SearchTerm) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("SearchTerm invalid status")
  }
  fmt.Printf("[SearchTerm.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *SearchTerm) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("SearchTerm %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[SearchTerm.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type QueryLog struct {
  ID     string
  Name   string
  Status string
}

func NewQueryLog(id, name string) (*QueryLog, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("QueryLog requires id and name")
  }
  obj := &QueryLog{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[QueryLog.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *QueryLog) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("QueryLog invalid status")
  }
  fmt.Printf("[QueryLog.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *QueryLog) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("QueryLog %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[QueryLog.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type TopKCache struct {
  ID     string
  Name   string
  Status string
}

func NewTopKCache(id, name string) (*TopKCache, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("TopKCache requires id and name")
  }
  obj := &TopKCache{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[TopKCache.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *TopKCache) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("TopKCache invalid status")
  }
  fmt.Printf("[TopKCache.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *TopKCache) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("TopKCache %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[TopKCache.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type PersonalizationService struct {
  ID     string
  Name   string
  Status string
}

func NewPersonalizationService(id, name string) (*PersonalizationService, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("PersonalizationService requires id and name")
  }
  obj := &PersonalizationService{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[PersonalizationService.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *PersonalizationService) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("PersonalizationService invalid status")
  }
  fmt.Printf("[PersonalizationService.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *PersonalizationService) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("PersonalizationService %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[PersonalizationService.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type SearchAutocompleteService struct {
  mu  sync.Mutex
  seq int
  trie_nodes map[string]*TrieNode
  search_terms map[string]*SearchTerm
  query_logs map[string]*QueryLog
  top_kcaches map[string]*TopKCache
  personalization_services map[string]*PersonalizationService
}

func NewSearchAutocompleteService() *SearchAutocompleteService {
  fmt.Println("[SearchAutocompleteService.__init__] system ready")
  return &SearchAutocompleteService{
    seq: 1,
    trie_nodes: map[string]*TrieNode{},
    search_terms: map[string]*SearchTerm{},
    query_logs: map[string]*QueryLog{},
    top_kcaches: map[string]*TopKCache{},
    personalization_services: map[string]*PersonalizationService{},
  }
}

func (s *SearchAutocompleteService) CreateTrieNode(name string) (*TrieNode, error) {
  if name == "" {
    return nil, fmt.Errorf("TrieNode name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TRI-%04d", s.seq)
  s.seq++
  obj, err := NewTrieNode(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.trie_nodes[id] = obj
  fmt.Printf("[SearchAutocompleteService.CreateTrieNode] stored %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) GetTrieNode(id string) (*TrieNode, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.trie_nodes[id]
  if !ok {
    return nil, fmt.Errorf("unknown TrieNode id: %s", id)
  }
  fmt.Printf("[SearchAutocompleteService.GetTrieNode] found %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) CreateSearchTerm(name string) (*SearchTerm, error) {
  if name == "" {
    return nil, fmt.Errorf("SearchTerm name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SEA-%04d", s.seq)
  s.seq++
  obj, err := NewSearchTerm(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.search_terms[id] = obj
  fmt.Printf("[SearchAutocompleteService.CreateSearchTerm] stored %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) GetSearchTerm(id string) (*SearchTerm, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.search_terms[id]
  if !ok {
    return nil, fmt.Errorf("unknown SearchTerm id: %s", id)
  }
  fmt.Printf("[SearchAutocompleteService.GetSearchTerm] found %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) CreateQueryLog(name string) (*QueryLog, error) {
  if name == "" {
    return nil, fmt.Errorf("QueryLog name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("QUE-%04d", s.seq)
  s.seq++
  obj, err := NewQueryLog(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.query_logs[id] = obj
  fmt.Printf("[SearchAutocompleteService.CreateQueryLog] stored %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) GetQueryLog(id string) (*QueryLog, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.query_logs[id]
  if !ok {
    return nil, fmt.Errorf("unknown QueryLog id: %s", id)
  }
  fmt.Printf("[SearchAutocompleteService.GetQueryLog] found %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) CreateTopKCache(name string) (*TopKCache, error) {
  if name == "" {
    return nil, fmt.Errorf("TopKCache name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TOP-%04d", s.seq)
  s.seq++
  obj, err := NewTopKCache(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.top_kcaches[id] = obj
  fmt.Printf("[SearchAutocompleteService.CreateTopKCache] stored %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) GetTopKCache(id string) (*TopKCache, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.top_kcaches[id]
  if !ok {
    return nil, fmt.Errorf("unknown TopKCache id: %s", id)
  }
  fmt.Printf("[SearchAutocompleteService.GetTopKCache] found %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) CreatePersonalizationService(name string) (*PersonalizationService, error) {
  if name == "" {
    return nil, fmt.Errorf("PersonalizationService name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PER-%04d", s.seq)
  s.seq++
  obj, err := NewPersonalizationService(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.personalization_services[id] = obj
  fmt.Printf("[SearchAutocompleteService.CreatePersonalizationService] stored %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) GetPersonalizationService(id string) (*PersonalizationService, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.personalization_services[id]
  if !ok {
    return nil, fmt.Errorf("unknown PersonalizationService id: %s", id)
  }
  fmt.Printf("[SearchAutocompleteService.GetPersonalizationService] found %s\\n", id)
  return obj, nil
}

func (s *SearchAutocompleteService) CloseTrieNode(id string) (*TrieNode, error) {
  obj, err := s.GetTrieNode(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[SearchAutocompleteService.CloseTrieNode] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct SearchAutocompleteService ==========")
  system := NewSearchAutocompleteService()
  fmt.Println("========== STEP 2: Create TrieNode ==========")
  first, _ := system.CreateTrieNode("alpha-trie_node")
  system.CreateTrieNode("beta-trie_node")
  system.CreateSearchTerm("sample-search_term")
  system.CreateQueryLog("sample-query_log")
  system.CreateTopKCache("sample-top_kcache")
  system.CreatePersonalizationService("sample-personalization_service")
  system.CloseTrieNode(first.ID)
  if _, err := system.CloseTrieNode(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetTrieNode("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class TrieNode {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public TrieNode(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TrieNode requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[TrieNode.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("TrieNode invalid status");
    }
    Console.WriteLine("[TrieNode.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("TrieNode " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[TrieNode.close] id=" + Id + " -> CLOSED");
  }
}


sealed class SearchTerm {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public SearchTerm(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("SearchTerm requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[SearchTerm.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("SearchTerm invalid status");
    }
    Console.WriteLine("[SearchTerm.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("SearchTerm " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[SearchTerm.close] id=" + Id + " -> CLOSED");
  }
}


sealed class QueryLog {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public QueryLog(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("QueryLog requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[QueryLog.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("QueryLog invalid status");
    }
    Console.WriteLine("[QueryLog.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("QueryLog " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[QueryLog.close] id=" + Id + " -> CLOSED");
  }
}


sealed class TopKCache {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public TopKCache(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TopKCache requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[TopKCache.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("TopKCache invalid status");
    }
    Console.WriteLine("[TopKCache.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("TopKCache " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[TopKCache.close] id=" + Id + " -> CLOSED");
  }
}


sealed class PersonalizationService {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public PersonalizationService(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("PersonalizationService requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[PersonalizationService.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("PersonalizationService invalid status");
    }
    Console.WriteLine("[PersonalizationService.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("PersonalizationService " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[PersonalizationService.close] id=" + Id + " -> CLOSED");
  }
}

sealed class SearchAutocompleteService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, TrieNode> _trie_nodes = new();
  private readonly Dictionary<string, SearchTerm> _search_terms = new();
  private readonly Dictionary<string, QueryLog> _query_logs = new();
  private readonly Dictionary<string, TopKCache> _top_kcaches = new();
  private readonly Dictionary<string, PersonalizationService> _personalization_services = new();
  public SearchAutocompleteService() {
    Console.WriteLine("[SearchAutocompleteService.__init__] system ready");
  }

  public TrieNode CreateTrieNode(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TrieNode name required");
    }
    lock (_gate) {
      var id = string.Format("TRI-{0:D4}", _seq++);
      var obj = new TrieNode(id, name.Trim());
      obj.Validate();
      _trie_nodes[id] = obj;
      Console.WriteLine("[SearchAutocompleteService.CreateTrieNode] stored " + id);
      return obj;
    }
  }

  public TrieNode GetTrieNode(string id) {
    lock (_gate) {
      if (!_trie_nodes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown TrieNode id: " + id);
      }
      Console.WriteLine("[SearchAutocompleteService.GetTrieNode] found " + id);
      return obj;
    }
  }

  public SearchTerm CreateSearchTerm(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("SearchTerm name required");
    }
    lock (_gate) {
      var id = string.Format("SEA-{0:D4}", _seq++);
      var obj = new SearchTerm(id, name.Trim());
      obj.Validate();
      _search_terms[id] = obj;
      Console.WriteLine("[SearchAutocompleteService.CreateSearchTerm] stored " + id);
      return obj;
    }
  }

  public SearchTerm GetSearchTerm(string id) {
    lock (_gate) {
      if (!_search_terms.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown SearchTerm id: " + id);
      }
      Console.WriteLine("[SearchAutocompleteService.GetSearchTerm] found " + id);
      return obj;
    }
  }

  public QueryLog CreateQueryLog(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("QueryLog name required");
    }
    lock (_gate) {
      var id = string.Format("QUE-{0:D4}", _seq++);
      var obj = new QueryLog(id, name.Trim());
      obj.Validate();
      _query_logs[id] = obj;
      Console.WriteLine("[SearchAutocompleteService.CreateQueryLog] stored " + id);
      return obj;
    }
  }

  public QueryLog GetQueryLog(string id) {
    lock (_gate) {
      if (!_query_logs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown QueryLog id: " + id);
      }
      Console.WriteLine("[SearchAutocompleteService.GetQueryLog] found " + id);
      return obj;
    }
  }

  public TopKCache CreateTopKCache(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("TopKCache name required");
    }
    lock (_gate) {
      var id = string.Format("TOP-{0:D4}", _seq++);
      var obj = new TopKCache(id, name.Trim());
      obj.Validate();
      _top_kcaches[id] = obj;
      Console.WriteLine("[SearchAutocompleteService.CreateTopKCache] stored " + id);
      return obj;
    }
  }

  public TopKCache GetTopKCache(string id) {
    lock (_gate) {
      if (!_top_kcaches.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown TopKCache id: " + id);
      }
      Console.WriteLine("[SearchAutocompleteService.GetTopKCache] found " + id);
      return obj;
    }
  }

  public PersonalizationService CreatePersonalizationService(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("PersonalizationService name required");
    }
    lock (_gate) {
      var id = string.Format("PER-{0:D4}", _seq++);
      var obj = new PersonalizationService(id, name.Trim());
      obj.Validate();
      _personalization_services[id] = obj;
      Console.WriteLine("[SearchAutocompleteService.CreatePersonalizationService] stored " + id);
      return obj;
    }
  }

  public PersonalizationService GetPersonalizationService(string id) {
    lock (_gate) {
      if (!_personalization_services.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown PersonalizationService id: " + id);
      }
      Console.WriteLine("[SearchAutocompleteService.GetPersonalizationService] found " + id);
      return obj;
    }
  }

  public TrieNode CloseTrieNode(string id) {
    var obj = GetTrieNode(id);
    Console.WriteLine("[SearchAutocompleteService.CloseTrieNode] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct SearchAutocompleteService ==========");
    var system = new SearchAutocompleteService();
    Console.WriteLine("========== STEP 2: Create TrieNode ==========");
    var first = system.CreateTrieNode("alpha-trie_node");
    system.CreateTrieNode("beta-trie_node");
    system.CreateSearchTerm("sample-search_term");
    system.CreateQueryLog("sample-query_log");
    system.CreateTopKCache("sample-top_kcache");
    system.CreatePersonalizationService("sample-personalization_service");
    system.CloseTrieNode(first.Id);
    try {
      system.CloseTrieNode(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetTrieNode("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const searchAutocompleteSolution: ProblemSolution = {
  slug: 'search-autocomplete',
  title: 'Search Autocomplete System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a real-time search autocomplete system like Google\\ The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Return top-5 completions for any typed prefix in < 100ms',
      'Completions ranked by global search frequency',
      'Personalized suggestions based on user\'s search history',
      'Support 50+ languages and Unicode characters',
      'Filter adult/offensive completions',
      'Real-time updates — trending queries appear within minutes',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Return top-5 completions for any typed prefix in < 100ms?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Completions ranked by global search frequency?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Personalized suggestions based on user\'s search history?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support 50+ languages and Unicode characters?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Filter adult/offensive completions?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. SearchAutocompleteService is the facade stereotype. TrieNode, SearchTerm, QueryLog, TopKCache, PersonalizationService are concrete domain classes with id/name/status and validate/close.',
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
          'Construct SearchAutocompleteService.',
          'createTrieNode twice and create the related UML classes.',
          'closeTrieNode once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'SearchAutocompleteService', responsibility: 'UML facade - orchestrates Search Autocomplete System.', keyMembers: ['create*', 'get*', 'closeTrieNode'] },
    { name: 'TrieNode', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'SearchTerm', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'QueryLog', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TopKCache', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'PersonalizationService', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from SearchAutocompleteService to TrieNode, SearchTerm, QueryLog, TopKCache, PersonalizationService. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on SearchAutocompleteService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'SearchAutocompleteService', responsibility: 'UML facade - orchestrates Search Autocomplete System.', keyMembers: ['create*', 'get*', 'closeTrieNode'] },
    { name: 'TrieNode', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'SearchTerm', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'QueryLog', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'TopKCache', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'PersonalizationService', responsibility: 'UML class - domain object for Search Autocomplete System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'SearchAutocompleteService exposes create/get/close and owns composed collections.' },
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
      'main constructs SearchAutocompleteService, creates UML domain objects, closes the primary TrieNode, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct SearchAutocompleteService.',
      'createTrieNode for alpha and beta.',
      'create remaining UML classes.',
      'closeTrieNode(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createTrieNode("alpha..."); closeTrieNode(id)',
        output: '[TrieNode.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeTrieNode(alreadyClosed) or getTrieNode("MISSING-ID")',
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
