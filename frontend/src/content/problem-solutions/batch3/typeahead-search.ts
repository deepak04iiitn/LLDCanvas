import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'TypeaheadSearchService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_documents', 'Map<string, Document>'),
    attr('-', '_indexs', 'Map<string, Index>'),
    attr('-', '_shards', 'Map<string, Shard>'),
    attr('-', '_inverted_indexs', 'Map<string, InvertedIndex>'),
    attr('-', '_postings', 'Map<string, Posting>'),
  ], [
    method('+', 'createDocument', 'name: string', 'Document'),
    method('+', 'createIndex', 'name: string', 'Index'),
    method('+', 'createShard', 'name: string', 'Shard'),
    method('+', 'createInvertedIndex', 'name: string', 'InvertedIndex'),
    method('+', 'createPosting', 'name: string', 'Posting'),
    method('+', 'getDocument', 'id: string', 'Document'),
    method('+', 'getIndex', 'id: string', 'Index'),
    method('+', 'getShard', 'id: string', 'Shard'),
    method('+', 'getInvertedIndex', 'id: string', 'InvertedIndex'),
    method('+', 'getPosting', 'id: string', 'Posting'),
    method('+', 'closeDocument', 'id: string', 'Document'),
  ], 'facade'),
  cls('n1', 'Document', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Index', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Shard', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'InvertedIndex', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Posting', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("typeahead-search")


class Document:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Document.id is required")
        if not name or not name.strip():
            raise ValueError("Document.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Document.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Document {self.id} has invalid status={self.status}")
        log.info("[Document.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Document {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Document.close] id=%s -> CLOSED", self.id)


class Index:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Index.id is required")
        if not name or not name.strip():
            raise ValueError("Index.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Index.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Index {self.id} has invalid status={self.status}")
        log.info("[Index.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Index {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Index.close] id=%s -> CLOSED", self.id)


class Shard:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Shard.id is required")
        if not name or not name.strip():
            raise ValueError("Shard.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Shard.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Shard {self.id} has invalid status={self.status}")
        log.info("[Shard.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Shard {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Shard.close] id=%s -> CLOSED", self.id)


class InvertedIndex:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("InvertedIndex.id is required")
        if not name or not name.strip():
            raise ValueError("InvertedIndex.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[InvertedIndex.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"InvertedIndex {self.id} has invalid status={self.status}")
        log.info("[InvertedIndex.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"InvertedIndex {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[InvertedIndex.close] id=%s -> CLOSED", self.id)


class Posting:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Posting.id is required")
        if not name or not name.strip():
            raise ValueError("Posting.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Posting.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Posting {self.id} has invalid status={self.status}")
        log.info("[Posting.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Posting {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Posting.close] id=%s -> CLOSED", self.id)


class TypeaheadSearchService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._documents: Dict[str, Document] = {}
        self._indexs: Dict[str, Index] = {}
        self._shards: Dict[str, Shard] = {}
        self._inverted_indexs: Dict[str, InvertedIndex] = {}
        self._postings: Dict[str, Posting] = {}
        log.info("[TypeaheadSearchService.__init__] system ready; managing: Document, Index, Shard, InvertedIndex, Posting")

    def create_document(self, name: str) -> Document:
        """UML: TypeaheadSearchService.create_document(name) -> Document"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Document name is required")
        with self._lock:
            item_id = f"DOC-{self._seq:04d}"
            self._seq += 1
            obj = Document(item_id, cleaned)
            obj.validate()
            self._documents[item_id] = obj
            log.info("[TypeaheadSearchService.create_document] stored %s in _documents (count=%s)", item_id, len(self._documents))
            return obj

    def get_document(self, item_id: str) -> Document:
        with self._lock:
            obj = self._documents.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Document id: {item_id}")
            log.info("[TypeaheadSearchService.get_document] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_index(self, name: str) -> Index:
        """UML: TypeaheadSearchService.create_index(name) -> Index"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Index name is required")
        with self._lock:
            item_id = f"IND-{self._seq:04d}"
            self._seq += 1
            obj = Index(item_id, cleaned)
            obj.validate()
            self._indexs[item_id] = obj
            log.info("[TypeaheadSearchService.create_index] stored %s in _indexs (count=%s)", item_id, len(self._indexs))
            return obj

    def get_index(self, item_id: str) -> Index:
        with self._lock:
            obj = self._indexs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Index id: {item_id}")
            log.info("[TypeaheadSearchService.get_index] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_shard(self, name: str) -> Shard:
        """UML: TypeaheadSearchService.create_shard(name) -> Shard"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Shard name is required")
        with self._lock:
            item_id = f"SHA-{self._seq:04d}"
            self._seq += 1
            obj = Shard(item_id, cleaned)
            obj.validate()
            self._shards[item_id] = obj
            log.info("[TypeaheadSearchService.create_shard] stored %s in _shards (count=%s)", item_id, len(self._shards))
            return obj

    def get_shard(self, item_id: str) -> Shard:
        with self._lock:
            obj = self._shards.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Shard id: {item_id}")
            log.info("[TypeaheadSearchService.get_shard] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_inverted_index(self, name: str) -> InvertedIndex:
        """UML: TypeaheadSearchService.create_inverted_index(name) -> InvertedIndex"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("InvertedIndex name is required")
        with self._lock:
            item_id = f"INV-{self._seq:04d}"
            self._seq += 1
            obj = InvertedIndex(item_id, cleaned)
            obj.validate()
            self._inverted_indexs[item_id] = obj
            log.info("[TypeaheadSearchService.create_inverted_index] stored %s in _inverted_indexs (count=%s)", item_id, len(self._inverted_indexs))
            return obj

    def get_inverted_index(self, item_id: str) -> InvertedIndex:
        with self._lock:
            obj = self._inverted_indexs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown InvertedIndex id: {item_id}")
            log.info("[TypeaheadSearchService.get_inverted_index] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_posting(self, name: str) -> Posting:
        """UML: TypeaheadSearchService.create_posting(name) -> Posting"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Posting name is required")
        with self._lock:
            item_id = f"POS-{self._seq:04d}"
            self._seq += 1
            obj = Posting(item_id, cleaned)
            obj.validate()
            self._postings[item_id] = obj
            log.info("[TypeaheadSearchService.create_posting] stored %s in _postings (count=%s)", item_id, len(self._postings))
            return obj

    def get_posting(self, item_id: str) -> Posting:
        with self._lock:
            obj = self._postings.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Posting id: {item_id}")
            log.info("[TypeaheadSearchService.get_posting] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_document(self, item_id: str) -> Document:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._documents.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Document id: {item_id}")
            log.info("[TypeaheadSearchService.close_document] closing %s via Document.close()", item_id)
            obj.close()
            return obj

    def list_active_documents(self) -> List[Document]:
        with self._lock:
            active = [o for o in self._documents.values() if o.status == "ACTIVE"]
            log.info("[TypeaheadSearchService.list_active_documents] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct TypeaheadSearchService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = TypeaheadSearchService()

    log.info("========== STEP 2: Create primary Document objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_document("alpha-document")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_document("beta-document")

    log.info("========== STEP 3: Create Index (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_index("sample-index")

    log.info("========== STEP 4: Create Shard (UML class) ==========")
    system.create_shard("sample-shard")

    log.info("========== STEP 5: Create InvertedIndex (UML class) ==========")
    system.create_inverted_index("sample-inverted_index")

    log.info("========== STEP 6: Create Posting (UML class) ==========")
    system.create_posting("sample-posting")

    log.info("========== STEP 7: Inspect active Document list ==========")
    system.list_active_documents()

    log.info("========== STEP 8: Close first Document ==========")
    system.close_document(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_document(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Document.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_document("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_document: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_documents()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Document {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Document(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Document.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Document.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Document.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Document " + id + " invalid status");
    }
    System.out.println("[Document.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Document " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Document.close] id=" + id + " -> CLOSED");
  }
}


class Index {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Index(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Index.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Index.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Index.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Index " + id + " invalid status");
    }
    System.out.println("[Index.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Index " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Index.close] id=" + id + " -> CLOSED");
  }
}


class Shard {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Shard(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Shard.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Shard.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Shard.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Shard " + id + " invalid status");
    }
    System.out.println("[Shard.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Shard " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Shard.close] id=" + id + " -> CLOSED");
  }
}


class InvertedIndex {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  InvertedIndex(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("InvertedIndex.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("InvertedIndex.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[InvertedIndex.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("InvertedIndex " + id + " invalid status");
    }
    System.out.println("[InvertedIndex.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("InvertedIndex " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[InvertedIndex.close] id=" + id + " -> CLOSED");
  }
}


class Posting {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Posting(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Posting.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Posting.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Posting.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Posting " + id + " invalid status");
    }
    System.out.println("[Posting.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Posting " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Posting.close] id=" + id + " -> CLOSED");
  }
}

public class TypeaheadSearchService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Document> documents = new LinkedHashMap<>();
  private final Map<String, Index> indexs = new LinkedHashMap<>();
  private final Map<String, Shard> shards = new LinkedHashMap<>();
  private final Map<String, InvertedIndex> inverted_indexs = new LinkedHashMap<>();
  private final Map<String, Posting> postings = new LinkedHashMap<>();

  public TypeaheadSearchService() {
    System.out.println("[TypeaheadSearchService.__init__] system ready");
  }

  public Document createDocument(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Document name required");
    }
    lock.lock();
    try {
      String id = String.format("DOC-%04d", seq++);
      Document obj = new Document(id, name.trim());
      obj.validate();
      documents.put(id, obj);
      System.out.println("[TypeaheadSearchService.createDocument] stored " + id + " count=" + documents.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Document getDocument(String id) {
    lock.lock();
    try {
      Document obj = documents.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Document id: " + id);
      }
      System.out.println("[TypeaheadSearchService.getDocument] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Index createIndex(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Index name required");
    }
    lock.lock();
    try {
      String id = String.format("IND-%04d", seq++);
      Index obj = new Index(id, name.trim());
      obj.validate();
      indexs.put(id, obj);
      System.out.println("[TypeaheadSearchService.createIndex] stored " + id + " count=" + indexs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Index getIndex(String id) {
    lock.lock();
    try {
      Index obj = indexs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Index id: " + id);
      }
      System.out.println("[TypeaheadSearchService.getIndex] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Shard createShard(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Shard name required");
    }
    lock.lock();
    try {
      String id = String.format("SHA-%04d", seq++);
      Shard obj = new Shard(id, name.trim());
      obj.validate();
      shards.put(id, obj);
      System.out.println("[TypeaheadSearchService.createShard] stored " + id + " count=" + shards.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Shard getShard(String id) {
    lock.lock();
    try {
      Shard obj = shards.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Shard id: " + id);
      }
      System.out.println("[TypeaheadSearchService.getShard] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public InvertedIndex createInvertedIndex(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("InvertedIndex name required");
    }
    lock.lock();
    try {
      String id = String.format("INV-%04d", seq++);
      InvertedIndex obj = new InvertedIndex(id, name.trim());
      obj.validate();
      inverted_indexs.put(id, obj);
      System.out.println("[TypeaheadSearchService.createInvertedIndex] stored " + id + " count=" + inverted_indexs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public InvertedIndex getInvertedIndex(String id) {
    lock.lock();
    try {
      InvertedIndex obj = inverted_indexs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown InvertedIndex id: " + id);
      }
      System.out.println("[TypeaheadSearchService.getInvertedIndex] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Posting createPosting(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Posting name required");
    }
    lock.lock();
    try {
      String id = String.format("POS-%04d", seq++);
      Posting obj = new Posting(id, name.trim());
      obj.validate();
      postings.put(id, obj);
      System.out.println("[TypeaheadSearchService.createPosting] stored " + id + " count=" + postings.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Posting getPosting(String id) {
    lock.lock();
    try {
      Posting obj = postings.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Posting id: " + id);
      }
      System.out.println("[TypeaheadSearchService.getPosting] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Document closeDocument(String id) {
    lock.lock();
    try {
      Document obj = documents.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Document id: " + id);
      }
      System.out.println("[TypeaheadSearchService.closeDocument] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Document> listActiveDocuments() {
    lock.lock();
    try {
      List<Document> out = new ArrayList<>();
      for (Document o : documents.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[TypeaheadSearchService.listActiveDocuments] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct TypeaheadSearchService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    TypeaheadSearchService system = new TypeaheadSearchService();
    System.out.println("========== STEP 2: Create Document objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Document first = system.createDocument("alpha-document");
    system.createDocument("beta-document");
    System.out.println("========== STEP 3: Create Index ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createIndex("sample-index");
    System.out.println("========== STEP 4: Create Shard ==========");
    system.createShard("sample-shard");
    System.out.println("========== STEP 5: Create InvertedIndex ==========");
    system.createInvertedIndex("sample-inverted_index");
    System.out.println("========== STEP 6: Create Posting ==========");
    system.createPosting("sample-posting");
    System.out.println("========== Inspect active list ==========");
    system.listActiveDocuments();
    System.out.println("========== Close first Document ==========");
    system.closeDocument(first.getId());
    try {
      system.closeDocument(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getDocument("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Document {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Document.id required')
    }

    if (!name?.trim()) {
      throw new Error('Document.name required')
    }
    console.log(\`[Document.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Document \${this.id} invalid status\`)
    }
    console.log(\`[Document.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Document \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Document.close] id=\${this.id} -> CLOSED\`)
  }
}


class Index {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Index.id required')
    }

    if (!name?.trim()) {
      throw new Error('Index.name required')
    }
    console.log(\`[Index.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Index \${this.id} invalid status\`)
    }
    console.log(\`[Index.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Index \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Index.close] id=\${this.id} -> CLOSED\`)
  }
}


class Shard {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Shard.id required')
    }

    if (!name?.trim()) {
      throw new Error('Shard.name required')
    }
    console.log(\`[Shard.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Shard \${this.id} invalid status\`)
    }
    console.log(\`[Shard.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Shard \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Shard.close] id=\${this.id} -> CLOSED\`)
  }
}


class InvertedIndex {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('InvertedIndex.id required')
    }

    if (!name?.trim()) {
      throw new Error('InvertedIndex.name required')
    }
    console.log(\`[InvertedIndex.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`InvertedIndex \${this.id} invalid status\`)
    }
    console.log(\`[InvertedIndex.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`InvertedIndex \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[InvertedIndex.close] id=\${this.id} -> CLOSED\`)
  }
}


class Posting {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Posting.id required')
    }

    if (!name?.trim()) {
      throw new Error('Posting.name required')
    }
    console.log(\`[Posting.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Posting \${this.id} invalid status\`)
    }
    console.log(\`[Posting.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Posting \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Posting.close] id=\${this.id} -> CLOSED\`)
  }
}

class TypeaheadSearchService {
  private seq = 1
  private documents = new Map<string, Document>()
  private indexs = new Map<string, Index>()
  private shards = new Map<string, Shard>()
  private inverted_indexs = new Map<string, InvertedIndex>()
  private postings = new Map<string, Posting>()
  constructor() {
    console.log('[TypeaheadSearchService.__init__] system ready')
  }

  createDocument(name: string): Document {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Document name required')
    }
    const id = \`DOC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Document(id, cleaned)
    obj.validate()
    this.documents.set(id, obj)
    console.log(\`[TypeaheadSearchService.createDocument] stored \${id} count=\${this.documents.size}\`)
    return obj
  }

  getDocument(id: string): Document {
    const obj = this.documents.get(id)
    if (!obj) {
      throw new Error(\`unknown Document id: \${id}\`)
    }
    console.log(\`[TypeaheadSearchService.getDocument] found id=\${obj.id}\`)
    return obj
  }

  createIndex(name: string): Index {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Index name required')
    }
    const id = \`IND-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Index(id, cleaned)
    obj.validate()
    this.indexs.set(id, obj)
    console.log(\`[TypeaheadSearchService.createIndex] stored \${id} count=\${this.indexs.size}\`)
    return obj
  }

  getIndex(id: string): Index {
    const obj = this.indexs.get(id)
    if (!obj) {
      throw new Error(\`unknown Index id: \${id}\`)
    }
    console.log(\`[TypeaheadSearchService.getIndex] found id=\${obj.id}\`)
    return obj
  }

  createShard(name: string): Shard {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Shard name required')
    }
    const id = \`SHA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Shard(id, cleaned)
    obj.validate()
    this.shards.set(id, obj)
    console.log(\`[TypeaheadSearchService.createShard] stored \${id} count=\${this.shards.size}\`)
    return obj
  }

  getShard(id: string): Shard {
    const obj = this.shards.get(id)
    if (!obj) {
      throw new Error(\`unknown Shard id: \${id}\`)
    }
    console.log(\`[TypeaheadSearchService.getShard] found id=\${obj.id}\`)
    return obj
  }

  createInvertedIndex(name: string): InvertedIndex {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('InvertedIndex name required')
    }
    const id = \`INV-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new InvertedIndex(id, cleaned)
    obj.validate()
    this.inverted_indexs.set(id, obj)
    console.log(\`[TypeaheadSearchService.createInvertedIndex] stored \${id} count=\${this.inverted_indexs.size}\`)
    return obj
  }

  getInvertedIndex(id: string): InvertedIndex {
    const obj = this.inverted_indexs.get(id)
    if (!obj) {
      throw new Error(\`unknown InvertedIndex id: \${id}\`)
    }
    console.log(\`[TypeaheadSearchService.getInvertedIndex] found id=\${obj.id}\`)
    return obj
  }

  createPosting(name: string): Posting {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Posting name required')
    }
    const id = \`POS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Posting(id, cleaned)
    obj.validate()
    this.postings.set(id, obj)
    console.log(\`[TypeaheadSearchService.createPosting] stored \${id} count=\${this.postings.size}\`)
    return obj
  }

  getPosting(id: string): Posting {
    const obj = this.postings.get(id)
    if (!obj) {
      throw new Error(\`unknown Posting id: \${id}\`)
    }
    console.log(\`[TypeaheadSearchService.getPosting] found id=\${obj.id}\`)
    return obj
  }

  closeDocument(id: string): Document {
    const obj = this.getDocument(id)
    console.log(\`[TypeaheadSearchService.closeDocument] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveDocuments(): Document[] {
    const active = [...this.documents.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[TypeaheadSearchService.listActiveDocuments] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct TypeaheadSearchService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new TypeaheadSearchService()
  console.log('========== STEP 2: Create Document objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createDocument('alpha-document')
  system.createDocument('beta-document')
  console.log('========== STEP 3: Create Index ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createIndex('sample-index')
  console.log('========== STEP 4: Create Shard ==========')
  system.createShard('sample-shard')
  console.log('========== STEP 5: Create InvertedIndex ==========')
  system.createInvertedIndex('sample-inverted_index')
  console.log('========== STEP 6: Create Posting ==========')
  system.createPosting('sample-posting')
  system.listActiveDocuments()
  console.log('========== Close first Document ==========')
  system.closeDocument(first.id)
  try {
    system.closeDocument(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getDocument('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Document {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Document(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Document requires id and name");
    }
    cout << "[Document.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Document invalid status");
    }
    cout << "[Document.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Document cannot close");
    }
    status_ = "CLOSED";
    cout << "[Document.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Index {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Index(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Index requires id and name");
    }
    cout << "[Index.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Index invalid status");
    }
    cout << "[Index.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Index cannot close");
    }
    status_ = "CLOSED";
    cout << "[Index.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Shard {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Shard(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Shard requires id and name");
    }
    cout << "[Shard.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Shard invalid status");
    }
    cout << "[Shard.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Shard cannot close");
    }
    status_ = "CLOSED";
    cout << "[Shard.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class InvertedIndex {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  InvertedIndex(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("InvertedIndex requires id and name");
    }
    cout << "[InvertedIndex.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("InvertedIndex invalid status");
    }
    cout << "[InvertedIndex.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("InvertedIndex cannot close");
    }
    status_ = "CLOSED";
    cout << "[InvertedIndex.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Posting {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Posting(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Posting requires id and name");
    }
    cout << "[Posting.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Posting invalid status");
    }
    cout << "[Posting.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Posting cannot close");
    }
    status_ = "CLOSED";
    cout << "[Posting.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class TypeaheadSearchService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Document> documents_;
  unordered_map<string, Index> indexs_;
  unordered_map<string, Shard> shards_;
  unordered_map<string, InvertedIndex> inverted_indexs_;
  unordered_map<string, Posting> postings_;
public:
  TypeaheadSearchService() {
    cout << "[TypeaheadSearchService.__init__] system ready" << endl;
  }

  Document createDocument(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Document name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DOC-%04d", seq_++);
    Document obj{buf, name};
    obj.validate();
    documents_.emplace(obj.id(), obj);
    cout << "[TypeaheadSearchService.createDocument] stored " << obj.id() << endl;
    return obj;
  }

  Document getDocument(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = documents_.find(id);
    if (it == documents_.end()) {
      throw out_of_range("unknown Document id");
    }
    cout << "[TypeaheadSearchService.getDocument] found " << id << endl;
    return it->second;
  }

  Index createIndex(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Index name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "IND-%04d", seq_++);
    Index obj{buf, name};
    obj.validate();
    indexs_.emplace(obj.id(), obj);
    cout << "[TypeaheadSearchService.createIndex] stored " << obj.id() << endl;
    return obj;
  }

  Index getIndex(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = indexs_.find(id);
    if (it == indexs_.end()) {
      throw out_of_range("unknown Index id");
    }
    cout << "[TypeaheadSearchService.getIndex] found " << id << endl;
    return it->second;
  }

  Shard createShard(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Shard name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SHA-%04d", seq_++);
    Shard obj{buf, name};
    obj.validate();
    shards_.emplace(obj.id(), obj);
    cout << "[TypeaheadSearchService.createShard] stored " << obj.id() << endl;
    return obj;
  }

  Shard getShard(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = shards_.find(id);
    if (it == shards_.end()) {
      throw out_of_range("unknown Shard id");
    }
    cout << "[TypeaheadSearchService.getShard] found " << id << endl;
    return it->second;
  }

  InvertedIndex createInvertedIndex(const string& name) {
    if (name.empty()) {
      throw invalid_argument("InvertedIndex name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "INV-%04d", seq_++);
    InvertedIndex obj{buf, name};
    obj.validate();
    inverted_indexs_.emplace(obj.id(), obj);
    cout << "[TypeaheadSearchService.createInvertedIndex] stored " << obj.id() << endl;
    return obj;
  }

  InvertedIndex getInvertedIndex(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = inverted_indexs_.find(id);
    if (it == inverted_indexs_.end()) {
      throw out_of_range("unknown InvertedIndex id");
    }
    cout << "[TypeaheadSearchService.getInvertedIndex] found " << id << endl;
    return it->second;
  }

  Posting createPosting(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Posting name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "POS-%04d", seq_++);
    Posting obj{buf, name};
    obj.validate();
    postings_.emplace(obj.id(), obj);
    cout << "[TypeaheadSearchService.createPosting] stored " << obj.id() << endl;
    return obj;
  }

  Posting getPosting(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = postings_.find(id);
    if (it == postings_.end()) {
      throw out_of_range("unknown Posting id");
    }
    cout << "[TypeaheadSearchService.getPosting] found " << id << endl;
    return it->second;
  }

  Document closeDocument(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = documents_.find(id);
    if (it == documents_.end()) {
      throw out_of_range("unknown Document");
    }
    cout << "[TypeaheadSearchService.closeDocument] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct TypeaheadSearchService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  TypeaheadSearchService system;
  cout << "========== STEP 2: Create Document ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createDocument("alpha-document");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createDocument("beta-document");
  system.createIndex("sample-index");
  system.createShard("sample-shard");
  system.createInvertedIndex("sample-inverted_index");
  system.createPosting("sample-posting");
  system.closeDocument(first.id());
  try {
    system.closeDocument(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getDocument("MISSING-ID");
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

type Document struct {
  ID     string
  Name   string
  Status string
}

func NewDocument(id, name string) (*Document, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Document requires id and name")
  }
  obj := &Document{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Document.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Document) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Document invalid status")
  }
  fmt.Printf("[Document.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Document) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Document %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Document.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Index struct {
  ID     string
  Name   string
  Status string
}

func NewIndex(id, name string) (*Index, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Index requires id and name")
  }
  obj := &Index{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Index.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Index) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Index invalid status")
  }
  fmt.Printf("[Index.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Index) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Index %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Index.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Shard struct {
  ID     string
  Name   string
  Status string
}

func NewShard(id, name string) (*Shard, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Shard requires id and name")
  }
  obj := &Shard{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Shard.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Shard) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Shard invalid status")
  }
  fmt.Printf("[Shard.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Shard) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Shard %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Shard.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type InvertedIndex struct {
  ID     string
  Name   string
  Status string
}

func NewInvertedIndex(id, name string) (*InvertedIndex, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("InvertedIndex requires id and name")
  }
  obj := &InvertedIndex{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[InvertedIndex.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *InvertedIndex) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("InvertedIndex invalid status")
  }
  fmt.Printf("[InvertedIndex.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *InvertedIndex) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("InvertedIndex %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[InvertedIndex.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Posting struct {
  ID     string
  Name   string
  Status string
}

func NewPosting(id, name string) (*Posting, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Posting requires id and name")
  }
  obj := &Posting{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Posting.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Posting) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Posting invalid status")
  }
  fmt.Printf("[Posting.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Posting) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Posting %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Posting.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type TypeaheadSearchService struct {
  mu  sync.Mutex
  seq int
  documents map[string]*Document
  indexs map[string]*Index
  shards map[string]*Shard
  inverted_indexs map[string]*InvertedIndex
  postings map[string]*Posting
}

func NewTypeaheadSearchService() *TypeaheadSearchService {
  fmt.Println("[TypeaheadSearchService.__init__] system ready")
  return &TypeaheadSearchService{
    seq: 1,
    documents: map[string]*Document{},
    indexs: map[string]*Index{},
    shards: map[string]*Shard{},
    inverted_indexs: map[string]*InvertedIndex{},
    postings: map[string]*Posting{},
  }
}

func (s *TypeaheadSearchService) CreateDocument(name string) (*Document, error) {
  if name == "" {
    return nil, fmt.Errorf("Document name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DOC-%04d", s.seq)
  s.seq++
  obj, err := NewDocument(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.documents[id] = obj
  fmt.Printf("[TypeaheadSearchService.CreateDocument] stored %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) GetDocument(id string) (*Document, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.documents[id]
  if !ok {
    return nil, fmt.Errorf("unknown Document id: %s", id)
  }
  fmt.Printf("[TypeaheadSearchService.GetDocument] found %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) CreateIndex(name string) (*Index, error) {
  if name == "" {
    return nil, fmt.Errorf("Index name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("IND-%04d", s.seq)
  s.seq++
  obj, err := NewIndex(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.indexs[id] = obj
  fmt.Printf("[TypeaheadSearchService.CreateIndex] stored %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) GetIndex(id string) (*Index, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.indexs[id]
  if !ok {
    return nil, fmt.Errorf("unknown Index id: %s", id)
  }
  fmt.Printf("[TypeaheadSearchService.GetIndex] found %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) CreateShard(name string) (*Shard, error) {
  if name == "" {
    return nil, fmt.Errorf("Shard name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SHA-%04d", s.seq)
  s.seq++
  obj, err := NewShard(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.shards[id] = obj
  fmt.Printf("[TypeaheadSearchService.CreateShard] stored %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) GetShard(id string) (*Shard, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.shards[id]
  if !ok {
    return nil, fmt.Errorf("unknown Shard id: %s", id)
  }
  fmt.Printf("[TypeaheadSearchService.GetShard] found %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) CreateInvertedIndex(name string) (*InvertedIndex, error) {
  if name == "" {
    return nil, fmt.Errorf("InvertedIndex name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("INV-%04d", s.seq)
  s.seq++
  obj, err := NewInvertedIndex(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.inverted_indexs[id] = obj
  fmt.Printf("[TypeaheadSearchService.CreateInvertedIndex] stored %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) GetInvertedIndex(id string) (*InvertedIndex, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.inverted_indexs[id]
  if !ok {
    return nil, fmt.Errorf("unknown InvertedIndex id: %s", id)
  }
  fmt.Printf("[TypeaheadSearchService.GetInvertedIndex] found %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) CreatePosting(name string) (*Posting, error) {
  if name == "" {
    return nil, fmt.Errorf("Posting name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("POS-%04d", s.seq)
  s.seq++
  obj, err := NewPosting(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.postings[id] = obj
  fmt.Printf("[TypeaheadSearchService.CreatePosting] stored %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) GetPosting(id string) (*Posting, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.postings[id]
  if !ok {
    return nil, fmt.Errorf("unknown Posting id: %s", id)
  }
  fmt.Printf("[TypeaheadSearchService.GetPosting] found %s\\n", id)
  return obj, nil
}

func (s *TypeaheadSearchService) CloseDocument(id string) (*Document, error) {
  obj, err := s.GetDocument(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[TypeaheadSearchService.CloseDocument] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct TypeaheadSearchService ==========")
  system := NewTypeaheadSearchService()
  fmt.Println("========== STEP 2: Create Document ==========")
  first, _ := system.CreateDocument("alpha-document")
  system.CreateDocument("beta-document")
  system.CreateIndex("sample-index")
  system.CreateShard("sample-shard")
  system.CreateInvertedIndex("sample-inverted_index")
  system.CreatePosting("sample-posting")
  system.CloseDocument(first.ID)
  if _, err := system.CloseDocument(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetDocument("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Document {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Document(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Document requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Document.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Document invalid status");
    }
    Console.WriteLine("[Document.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Document " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Document.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Index {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Index(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Index requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Index.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Index invalid status");
    }
    Console.WriteLine("[Index.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Index " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Index.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Shard {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Shard(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Shard requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Shard.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Shard invalid status");
    }
    Console.WriteLine("[Shard.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Shard " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Shard.close] id=" + Id + " -> CLOSED");
  }
}


sealed class InvertedIndex {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public InvertedIndex(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("InvertedIndex requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[InvertedIndex.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("InvertedIndex invalid status");
    }
    Console.WriteLine("[InvertedIndex.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("InvertedIndex " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[InvertedIndex.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Posting {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Posting(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Posting requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Posting.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Posting invalid status");
    }
    Console.WriteLine("[Posting.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Posting " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Posting.close] id=" + Id + " -> CLOSED");
  }
}

sealed class TypeaheadSearchService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Document> _documents = new();
  private readonly Dictionary<string, Index> _indexs = new();
  private readonly Dictionary<string, Shard> _shards = new();
  private readonly Dictionary<string, InvertedIndex> _inverted_indexs = new();
  private readonly Dictionary<string, Posting> _postings = new();
  public TypeaheadSearchService() {
    Console.WriteLine("[TypeaheadSearchService.__init__] system ready");
  }

  public Document CreateDocument(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Document name required");
    }
    lock (_gate) {
      var id = string.Format("DOC-{0:D4}", _seq++);
      var obj = new Document(id, name.Trim());
      obj.Validate();
      _documents[id] = obj;
      Console.WriteLine("[TypeaheadSearchService.CreateDocument] stored " + id);
      return obj;
    }
  }

  public Document GetDocument(string id) {
    lock (_gate) {
      if (!_documents.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Document id: " + id);
      }
      Console.WriteLine("[TypeaheadSearchService.GetDocument] found " + id);
      return obj;
    }
  }

  public Index CreateIndex(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Index name required");
    }
    lock (_gate) {
      var id = string.Format("IND-{0:D4}", _seq++);
      var obj = new Index(id, name.Trim());
      obj.Validate();
      _indexs[id] = obj;
      Console.WriteLine("[TypeaheadSearchService.CreateIndex] stored " + id);
      return obj;
    }
  }

  public Index GetIndex(string id) {
    lock (_gate) {
      if (!_indexs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Index id: " + id);
      }
      Console.WriteLine("[TypeaheadSearchService.GetIndex] found " + id);
      return obj;
    }
  }

  public Shard CreateShard(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Shard name required");
    }
    lock (_gate) {
      var id = string.Format("SHA-{0:D4}", _seq++);
      var obj = new Shard(id, name.Trim());
      obj.Validate();
      _shards[id] = obj;
      Console.WriteLine("[TypeaheadSearchService.CreateShard] stored " + id);
      return obj;
    }
  }

  public Shard GetShard(string id) {
    lock (_gate) {
      if (!_shards.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Shard id: " + id);
      }
      Console.WriteLine("[TypeaheadSearchService.GetShard] found " + id);
      return obj;
    }
  }

  public InvertedIndex CreateInvertedIndex(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("InvertedIndex name required");
    }
    lock (_gate) {
      var id = string.Format("INV-{0:D4}", _seq++);
      var obj = new InvertedIndex(id, name.Trim());
      obj.Validate();
      _inverted_indexs[id] = obj;
      Console.WriteLine("[TypeaheadSearchService.CreateInvertedIndex] stored " + id);
      return obj;
    }
  }

  public InvertedIndex GetInvertedIndex(string id) {
    lock (_gate) {
      if (!_inverted_indexs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown InvertedIndex id: " + id);
      }
      Console.WriteLine("[TypeaheadSearchService.GetInvertedIndex] found " + id);
      return obj;
    }
  }

  public Posting CreatePosting(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Posting name required");
    }
    lock (_gate) {
      var id = string.Format("POS-{0:D4}", _seq++);
      var obj = new Posting(id, name.Trim());
      obj.Validate();
      _postings[id] = obj;
      Console.WriteLine("[TypeaheadSearchService.CreatePosting] stored " + id);
      return obj;
    }
  }

  public Posting GetPosting(string id) {
    lock (_gate) {
      if (!_postings.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Posting id: " + id);
      }
      Console.WriteLine("[TypeaheadSearchService.GetPosting] found " + id);
      return obj;
    }
  }

  public Document CloseDocument(string id) {
    var obj = GetDocument(id);
    Console.WriteLine("[TypeaheadSearchService.CloseDocument] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct TypeaheadSearchService ==========");
    var system = new TypeaheadSearchService();
    Console.WriteLine("========== STEP 2: Create Document ==========");
    var first = system.CreateDocument("alpha-document");
    system.CreateDocument("beta-document");
    system.CreateIndex("sample-index");
    system.CreateShard("sample-shard");
    system.CreateInvertedIndex("sample-inverted_index");
    system.CreatePosting("sample-posting");
    system.CloseDocument(first.Id);
    try {
      system.CloseDocument(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetDocument("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const typeaheadSearchSolution: ProblemSolution = {
  slug: 'typeahead-search',
  title: 'Typeahead / Instant Search - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an instant search feature that returns results across multiple entity types (users, products, articles) as the user types. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Return mixed results (users, products, articles) for any query prefix',
      'Results ranked by relevance, popularity, and personalization',
      'Spell correction for common typos',
      'Faceted filtering: narrow results by category, price, date',
      'Highlighting of matched query terms in results',
      'Index updates appear in search within 5 seconds',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Return mixed results (users, products, articles) for any query prefix?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Results ranked by relevance, popularity, and personalization?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Spell correction for common typos?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Faceted filtering: narrow results by category, price, date?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Highlighting of matched query terms in results?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. TypeaheadSearchService is the facade stereotype. Document, Index, Shard, InvertedIndex, Posting are concrete domain classes with id/name/status and validate/close.',
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
          'Construct TypeaheadSearchService.',
          'createDocument twice and create the related UML classes.',
          'closeDocument once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'TypeaheadSearchService', responsibility: 'UML facade - orchestrates Typeahead / Instant Search.', keyMembers: ['create*', 'get*', 'closeDocument'] },
    { name: 'Document', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Index', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Shard', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'InvertedIndex', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Posting', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from TypeaheadSearchService to Document, Index, Shard, InvertedIndex, Posting. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on TypeaheadSearchService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'TypeaheadSearchService', responsibility: 'UML facade - orchestrates Typeahead / Instant Search.', keyMembers: ['create*', 'get*', 'closeDocument'] },
    { name: 'Document', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Index', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Shard', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'InvertedIndex', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Posting', responsibility: 'UML class - domain object for Typeahead / Instant Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'TypeaheadSearchService exposes create/get/close and owns composed collections.' },
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
      'main constructs TypeaheadSearchService, creates UML domain objects, closes the primary Document, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct TypeaheadSearchService.',
      'createDocument for alpha and beta.',
      'create remaining UML classes.',
      'closeDocument(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createDocument("alpha..."); closeDocument(id)',
        output: '[Document.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeDocument(alreadyClosed) or getDocument("MISSING-ID")',
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
