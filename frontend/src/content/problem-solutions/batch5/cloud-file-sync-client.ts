import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'CloudFileSyncClientService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_file_metadatas', 'Map<string, FileMetadata>'),
    attr('-', '_hashs', 'Map<string, hash>'),
    attr('-', '_versions', 'Map<string, version>'),
    attr('-', '_modified_times', 'Map<string, modifiedTime>'),
    attr('-', '_chunks', 'Map<string, Chunk>'),
  ], [
    method('+', 'createFileMetadata', 'name: string', 'FileMetadata'),
    method('+', 'createhash', 'name: string', 'hash'),
    method('+', 'createversion', 'name: string', 'version'),
    method('+', 'createmodifiedTime', 'name: string', 'modifiedTime'),
    method('+', 'createChunk', 'name: string', 'Chunk'),
    method('+', 'getFileMetadata', 'id: string', 'FileMetadata'),
    method('+', 'gethash', 'id: string', 'hash'),
    method('+', 'getversion', 'id: string', 'version'),
    method('+', 'getmodifiedTime', 'id: string', 'modifiedTime'),
    method('+', 'getChunk', 'id: string', 'Chunk'),
    method('+', 'closeFileMetadata', 'id: string', 'FileMetadata'),
  ], 'facade'),
  cls('n1', 'FileMetadata', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'hash', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'version', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'modifiedTime', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Chunk', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("cloud-file-sync-client")


class FileMetadata:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("FileMetadata.id is required")
        if not name or not name.strip():
            raise ValueError("FileMetadata.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[FileMetadata.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"FileMetadata {self.id} has invalid status={self.status}")
        log.info("[FileMetadata.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"FileMetadata {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[FileMetadata.close] id=%s -> CLOSED", self.id)


class hash:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("hash.id is required")
        if not name or not name.strip():
            raise ValueError("hash.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[hash.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"hash {self.id} has invalid status={self.status}")
        log.info("[hash.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"hash {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[hash.close] id=%s -> CLOSED", self.id)


class version:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("version.id is required")
        if not name or not name.strip():
            raise ValueError("version.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[version.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"version {self.id} has invalid status={self.status}")
        log.info("[version.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"version {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[version.close] id=%s -> CLOSED", self.id)


class modifiedTime:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("modifiedTime.id is required")
        if not name or not name.strip():
            raise ValueError("modifiedTime.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[modifiedTime.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"modifiedTime {self.id} has invalid status={self.status}")
        log.info("[modifiedTime.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"modifiedTime {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[modifiedTime.close] id=%s -> CLOSED", self.id)


class Chunk:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Chunk.id is required")
        if not name or not name.strip():
            raise ValueError("Chunk.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Chunk.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Chunk {self.id} has invalid status={self.status}")
        log.info("[Chunk.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Chunk {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Chunk.close] id=%s -> CLOSED", self.id)


class CloudFileSyncClientService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._file_metadatas: Dict[str, FileMetadata] = {}
        self._hashs: Dict[str, hash] = {}
        self._versions: Dict[str, version] = {}
        self._modified_times: Dict[str, modifiedTime] = {}
        self._chunks: Dict[str, Chunk] = {}
        log.info("[CloudFileSyncClientService.__init__] system ready; managing: FileMetadata, hash, version, modifiedTime, Chunk")

    def create_file_metadata(self, name: str) -> FileMetadata:
        """UML: CloudFileSyncClientService.create_file_metadata(name) -> FileMetadata"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("FileMetadata name is required")
        with self._lock:
            item_id = f"FIL-{self._seq:04d}"
            self._seq += 1
            obj = FileMetadata(item_id, cleaned)
            obj.validate()
            self._file_metadatas[item_id] = obj
            log.info("[CloudFileSyncClientService.create_file_metadata] stored %s in _file_metadatas (count=%s)", item_id, len(self._file_metadatas))
            return obj

    def get_file_metadata(self, item_id: str) -> FileMetadata:
        with self._lock:
            obj = self._file_metadatas.get(item_id)
            if obj is None:
                raise KeyError(f"unknown FileMetadata id: {item_id}")
            log.info("[CloudFileSyncClientService.get_file_metadata] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_hash(self, name: str) -> hash:
        """UML: CloudFileSyncClientService.create_hash(name) -> hash"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("hash name is required")
        with self._lock:
            item_id = f"HAS-{self._seq:04d}"
            self._seq += 1
            obj = hash(item_id, cleaned)
            obj.validate()
            self._hashs[item_id] = obj
            log.info("[CloudFileSyncClientService.create_hash] stored %s in _hashs (count=%s)", item_id, len(self._hashs))
            return obj

    def get_hash(self, item_id: str) -> hash:
        with self._lock:
            obj = self._hashs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown hash id: {item_id}")
            log.info("[CloudFileSyncClientService.get_hash] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_version(self, name: str) -> version:
        """UML: CloudFileSyncClientService.create_version(name) -> version"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("version name is required")
        with self._lock:
            item_id = f"VER-{self._seq:04d}"
            self._seq += 1
            obj = version(item_id, cleaned)
            obj.validate()
            self._versions[item_id] = obj
            log.info("[CloudFileSyncClientService.create_version] stored %s in _versions (count=%s)", item_id, len(self._versions))
            return obj

    def get_version(self, item_id: str) -> version:
        with self._lock:
            obj = self._versions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown version id: {item_id}")
            log.info("[CloudFileSyncClientService.get_version] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_modified_time(self, name: str) -> modifiedTime:
        """UML: CloudFileSyncClientService.create_modified_time(name) -> modifiedTime"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("modifiedTime name is required")
        with self._lock:
            item_id = f"MOD-{self._seq:04d}"
            self._seq += 1
            obj = modifiedTime(item_id, cleaned)
            obj.validate()
            self._modified_times[item_id] = obj
            log.info("[CloudFileSyncClientService.create_modified_time] stored %s in _modified_times (count=%s)", item_id, len(self._modified_times))
            return obj

    def get_modified_time(self, item_id: str) -> modifiedTime:
        with self._lock:
            obj = self._modified_times.get(item_id)
            if obj is None:
                raise KeyError(f"unknown modifiedTime id: {item_id}")
            log.info("[CloudFileSyncClientService.get_modified_time] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_chunk(self, name: str) -> Chunk:
        """UML: CloudFileSyncClientService.create_chunk(name) -> Chunk"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Chunk name is required")
        with self._lock:
            item_id = f"CHU-{self._seq:04d}"
            self._seq += 1
            obj = Chunk(item_id, cleaned)
            obj.validate()
            self._chunks[item_id] = obj
            log.info("[CloudFileSyncClientService.create_chunk] stored %s in _chunks (count=%s)", item_id, len(self._chunks))
            return obj

    def get_chunk(self, item_id: str) -> Chunk:
        with self._lock:
            obj = self._chunks.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Chunk id: {item_id}")
            log.info("[CloudFileSyncClientService.get_chunk] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_file_metadata(self, item_id: str) -> FileMetadata:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._file_metadatas.get(item_id)
            if obj is None:
                raise KeyError(f"unknown FileMetadata id: {item_id}")
            log.info("[CloudFileSyncClientService.close_file_metadata] closing %s via FileMetadata.close()", item_id)
            obj.close()
            return obj

    def list_active_file_metadatas(self) -> List[FileMetadata]:
        with self._lock:
            active = [o for o in self._file_metadatas.values() if o.status == "ACTIVE"]
            log.info("[CloudFileSyncClientService.list_active_file_metadatas] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct CloudFileSyncClientService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = CloudFileSyncClientService()

    log.info("========== STEP 2: Create primary FileMetadata objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_file_metadata("alpha-file_metadata")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_file_metadata("beta-file_metadata")

    log.info("========== STEP 3: Create hash (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_hash("sample-hash")

    log.info("========== STEP 4: Create version (UML class) ==========")
    system.create_version("sample-version")

    log.info("========== STEP 5: Create modifiedTime (UML class) ==========")
    system.create_modified_time("sample-modified_time")

    log.info("========== STEP 6: Create Chunk (UML class) ==========")
    system.create_chunk("sample-chunk")

    log.info("========== STEP 7: Inspect active FileMetadata list ==========")
    system.list_active_file_metadatas()

    log.info("========== STEP 8: Close first FileMetadata ==========")
    system.close_file_metadata(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_file_metadata(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from FileMetadata.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_file_metadata("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_file_metadata: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_file_metadatas()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class FileMetadata {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  FileMetadata(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("FileMetadata.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FileMetadata.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[FileMetadata.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("FileMetadata " + id + " invalid status");
    }
    System.out.println("[FileMetadata.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("FileMetadata " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[FileMetadata.close] id=" + id + " -> CLOSED");
  }
}


class hash {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  hash(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("hash.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("hash.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[hash.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("hash " + id + " invalid status");
    }
    System.out.println("[hash.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("hash " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[hash.close] id=" + id + " -> CLOSED");
  }
}


class version {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  version(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("version.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("version.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[version.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("version " + id + " invalid status");
    }
    System.out.println("[version.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("version " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[version.close] id=" + id + " -> CLOSED");
  }
}


class modifiedTime {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  modifiedTime(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("modifiedTime.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("modifiedTime.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[modifiedTime.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("modifiedTime " + id + " invalid status");
    }
    System.out.println("[modifiedTime.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("modifiedTime " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[modifiedTime.close] id=" + id + " -> CLOSED");
  }
}


class Chunk {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Chunk(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Chunk.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Chunk.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Chunk.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Chunk " + id + " invalid status");
    }
    System.out.println("[Chunk.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Chunk " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Chunk.close] id=" + id + " -> CLOSED");
  }
}

public class CloudFileSyncClientService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, FileMetadata> file_metadatas = new LinkedHashMap<>();
  private final Map<String, hash> hashs = new LinkedHashMap<>();
  private final Map<String, version> versions = new LinkedHashMap<>();
  private final Map<String, modifiedTime> modified_times = new LinkedHashMap<>();
  private final Map<String, Chunk> chunks = new LinkedHashMap<>();

  public CloudFileSyncClientService() {
    System.out.println("[CloudFileSyncClientService.__init__] system ready");
  }

  public FileMetadata createFileMetadata(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FileMetadata name required");
    }
    lock.lock();
    try {
      String id = String.format("FIL-%04d", seq++);
      FileMetadata obj = new FileMetadata(id, name.trim());
      obj.validate();
      file_metadatas.put(id, obj);
      System.out.println("[CloudFileSyncClientService.createFileMetadata] stored " + id + " count=" + file_metadatas.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public FileMetadata getFileMetadata(String id) {
    lock.lock();
    try {
      FileMetadata obj = file_metadatas.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown FileMetadata id: " + id);
      }
      System.out.println("[CloudFileSyncClientService.getFileMetadata] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public hash createhash(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("hash name required");
    }
    lock.lock();
    try {
      String id = String.format("HAS-%04d", seq++);
      hash obj = new hash(id, name.trim());
      obj.validate();
      hashs.put(id, obj);
      System.out.println("[CloudFileSyncClientService.createhash] stored " + id + " count=" + hashs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public hash gethash(String id) {
    lock.lock();
    try {
      hash obj = hashs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown hash id: " + id);
      }
      System.out.println("[CloudFileSyncClientService.gethash] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public version createversion(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("version name required");
    }
    lock.lock();
    try {
      String id = String.format("VER-%04d", seq++);
      version obj = new version(id, name.trim());
      obj.validate();
      versions.put(id, obj);
      System.out.println("[CloudFileSyncClientService.createversion] stored " + id + " count=" + versions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public version getversion(String id) {
    lock.lock();
    try {
      version obj = versions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown version id: " + id);
      }
      System.out.println("[CloudFileSyncClientService.getversion] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public modifiedTime createmodifiedTime(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("modifiedTime name required");
    }
    lock.lock();
    try {
      String id = String.format("MOD-%04d", seq++);
      modifiedTime obj = new modifiedTime(id, name.trim());
      obj.validate();
      modified_times.put(id, obj);
      System.out.println("[CloudFileSyncClientService.createmodifiedTime] stored " + id + " count=" + modified_times.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public modifiedTime getmodifiedTime(String id) {
    lock.lock();
    try {
      modifiedTime obj = modified_times.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown modifiedTime id: " + id);
      }
      System.out.println("[CloudFileSyncClientService.getmodifiedTime] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Chunk createChunk(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Chunk name required");
    }
    lock.lock();
    try {
      String id = String.format("CHU-%04d", seq++);
      Chunk obj = new Chunk(id, name.trim());
      obj.validate();
      chunks.put(id, obj);
      System.out.println("[CloudFileSyncClientService.createChunk] stored " + id + " count=" + chunks.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Chunk getChunk(String id) {
    lock.lock();
    try {
      Chunk obj = chunks.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Chunk id: " + id);
      }
      System.out.println("[CloudFileSyncClientService.getChunk] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public FileMetadata closeFileMetadata(String id) {
    lock.lock();
    try {
      FileMetadata obj = file_metadatas.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown FileMetadata id: " + id);
      }
      System.out.println("[CloudFileSyncClientService.closeFileMetadata] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<FileMetadata> listActiveFileMetadatas() {
    lock.lock();
    try {
      List<FileMetadata> out = new ArrayList<>();
      for (FileMetadata o : file_metadatas.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[CloudFileSyncClientService.listActiveFileMetadatas] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct CloudFileSyncClientService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    CloudFileSyncClientService system = new CloudFileSyncClientService();
    System.out.println("========== STEP 2: Create FileMetadata objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    FileMetadata first = system.createFileMetadata("alpha-file_metadata");
    system.createFileMetadata("beta-file_metadata");
    System.out.println("========== STEP 3: Create hash ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createhash("sample-hash");
    System.out.println("========== STEP 4: Create version ==========");
    system.createversion("sample-version");
    System.out.println("========== STEP 5: Create modifiedTime ==========");
    system.createmodifiedTime("sample-modified_time");
    System.out.println("========== STEP 6: Create Chunk ==========");
    system.createChunk("sample-chunk");
    System.out.println("========== Inspect active list ==========");
    system.listActiveFileMetadatas();
    System.out.println("========== Close first FileMetadata ==========");
    system.closeFileMetadata(first.getId());
    try {
      system.closeFileMetadata(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getFileMetadata("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class FileMetadata {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('FileMetadata.id required')
    }

    if (!name?.trim()) {
      throw new Error('FileMetadata.name required')
    }
    console.log(\`[FileMetadata.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`FileMetadata \${this.id} invalid status\`)
    }
    console.log(\`[FileMetadata.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`FileMetadata \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[FileMetadata.close] id=\${this.id} -> CLOSED\`)
  }
}


class hash {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('hash.id required')
    }

    if (!name?.trim()) {
      throw new Error('hash.name required')
    }
    console.log(\`[hash.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`hash \${this.id} invalid status\`)
    }
    console.log(\`[hash.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`hash \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[hash.close] id=\${this.id} -> CLOSED\`)
  }
}


class version {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('version.id required')
    }

    if (!name?.trim()) {
      throw new Error('version.name required')
    }
    console.log(\`[version.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`version \${this.id} invalid status\`)
    }
    console.log(\`[version.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`version \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[version.close] id=\${this.id} -> CLOSED\`)
  }
}


class modifiedTime {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('modifiedTime.id required')
    }

    if (!name?.trim()) {
      throw new Error('modifiedTime.name required')
    }
    console.log(\`[modifiedTime.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`modifiedTime \${this.id} invalid status\`)
    }
    console.log(\`[modifiedTime.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`modifiedTime \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[modifiedTime.close] id=\${this.id} -> CLOSED\`)
  }
}


class Chunk {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Chunk.id required')
    }

    if (!name?.trim()) {
      throw new Error('Chunk.name required')
    }
    console.log(\`[Chunk.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Chunk \${this.id} invalid status\`)
    }
    console.log(\`[Chunk.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Chunk \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Chunk.close] id=\${this.id} -> CLOSED\`)
  }
}

class CloudFileSyncClientService {
  private seq = 1
  private file_metadatas = new Map<string, FileMetadata>()
  private hashs = new Map<string, hash>()
  private versions = new Map<string, version>()
  private modified_times = new Map<string, modifiedTime>()
  private chunks = new Map<string, Chunk>()
  constructor() {
    console.log('[CloudFileSyncClientService.__init__] system ready')
  }

  createFileMetadata(name: string): FileMetadata {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('FileMetadata name required')
    }
    const id = \`FIL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new FileMetadata(id, cleaned)
    obj.validate()
    this.file_metadatas.set(id, obj)
    console.log(\`[CloudFileSyncClientService.createFileMetadata] stored \${id} count=\${this.file_metadatas.size}\`)
    return obj
  }

  getFileMetadata(id: string): FileMetadata {
    const obj = this.file_metadatas.get(id)
    if (!obj) {
      throw new Error(\`unknown FileMetadata id: \${id}\`)
    }
    console.log(\`[CloudFileSyncClientService.getFileMetadata] found id=\${obj.id}\`)
    return obj
  }

  createhash(name: string): hash {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('hash name required')
    }
    const id = \`HAS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new hash(id, cleaned)
    obj.validate()
    this.hashs.set(id, obj)
    console.log(\`[CloudFileSyncClientService.createhash] stored \${id} count=\${this.hashs.size}\`)
    return obj
  }

  gethash(id: string): hash {
    const obj = this.hashs.get(id)
    if (!obj) {
      throw new Error(\`unknown hash id: \${id}\`)
    }
    console.log(\`[CloudFileSyncClientService.gethash] found id=\${obj.id}\`)
    return obj
  }

  createversion(name: string): version {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('version name required')
    }
    const id = \`VER-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new version(id, cleaned)
    obj.validate()
    this.versions.set(id, obj)
    console.log(\`[CloudFileSyncClientService.createversion] stored \${id} count=\${this.versions.size}\`)
    return obj
  }

  getversion(id: string): version {
    const obj = this.versions.get(id)
    if (!obj) {
      throw new Error(\`unknown version id: \${id}\`)
    }
    console.log(\`[CloudFileSyncClientService.getversion] found id=\${obj.id}\`)
    return obj
  }

  createmodifiedTime(name: string): modifiedTime {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('modifiedTime name required')
    }
    const id = \`MOD-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new modifiedTime(id, cleaned)
    obj.validate()
    this.modified_times.set(id, obj)
    console.log(\`[CloudFileSyncClientService.createmodifiedTime] stored \${id} count=\${this.modified_times.size}\`)
    return obj
  }

  getmodifiedTime(id: string): modifiedTime {
    const obj = this.modified_times.get(id)
    if (!obj) {
      throw new Error(\`unknown modifiedTime id: \${id}\`)
    }
    console.log(\`[CloudFileSyncClientService.getmodifiedTime] found id=\${obj.id}\`)
    return obj
  }

  createChunk(name: string): Chunk {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Chunk name required')
    }
    const id = \`CHU-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Chunk(id, cleaned)
    obj.validate()
    this.chunks.set(id, obj)
    console.log(\`[CloudFileSyncClientService.createChunk] stored \${id} count=\${this.chunks.size}\`)
    return obj
  }

  getChunk(id: string): Chunk {
    const obj = this.chunks.get(id)
    if (!obj) {
      throw new Error(\`unknown Chunk id: \${id}\`)
    }
    console.log(\`[CloudFileSyncClientService.getChunk] found id=\${obj.id}\`)
    return obj
  }

  closeFileMetadata(id: string): FileMetadata {
    const obj = this.getFileMetadata(id)
    console.log(\`[CloudFileSyncClientService.closeFileMetadata] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveFileMetadatas(): FileMetadata[] {
    const active = [...this.file_metadatas.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[CloudFileSyncClientService.listActiveFileMetadatas] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct CloudFileSyncClientService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new CloudFileSyncClientService()
  console.log('========== STEP 2: Create FileMetadata objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createFileMetadata('alpha-file_metadata')
  system.createFileMetadata('beta-file_metadata')
  console.log('========== STEP 3: Create hash ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createhash('sample-hash')
  console.log('========== STEP 4: Create version ==========')
  system.createversion('sample-version')
  console.log('========== STEP 5: Create modifiedTime ==========')
  system.createmodifiedTime('sample-modified_time')
  console.log('========== STEP 6: Create Chunk ==========')
  system.createChunk('sample-chunk')
  system.listActiveFileMetadatas()
  console.log('========== Close first FileMetadata ==========')
  system.closeFileMetadata(first.id)
  try {
    system.closeFileMetadata(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getFileMetadata('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class FileMetadata {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  FileMetadata(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("FileMetadata requires id and name");
    }
    cout << "[FileMetadata.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("FileMetadata invalid status");
    }
    cout << "[FileMetadata.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("FileMetadata cannot close");
    }
    status_ = "CLOSED";
    cout << "[FileMetadata.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class hash {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  hash(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("hash requires id and name");
    }
    cout << "[hash.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("hash invalid status");
    }
    cout << "[hash.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("hash cannot close");
    }
    status_ = "CLOSED";
    cout << "[hash.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class version {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  version(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("version requires id and name");
    }
    cout << "[version.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("version invalid status");
    }
    cout << "[version.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("version cannot close");
    }
    status_ = "CLOSED";
    cout << "[version.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class modifiedTime {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  modifiedTime(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("modifiedTime requires id and name");
    }
    cout << "[modifiedTime.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("modifiedTime invalid status");
    }
    cout << "[modifiedTime.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("modifiedTime cannot close");
    }
    status_ = "CLOSED";
    cout << "[modifiedTime.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Chunk {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Chunk(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Chunk requires id and name");
    }
    cout << "[Chunk.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Chunk invalid status");
    }
    cout << "[Chunk.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Chunk cannot close");
    }
    status_ = "CLOSED";
    cout << "[Chunk.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class CloudFileSyncClientService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, FileMetadata> file_metadatas_;
  unordered_map<string, hash> hashs_;
  unordered_map<string, version> versions_;
  unordered_map<string, modifiedTime> modified_times_;
  unordered_map<string, Chunk> chunks_;
public:
  CloudFileSyncClientService() {
    cout << "[CloudFileSyncClientService.__init__] system ready" << endl;
  }

  FileMetadata createFileMetadata(const string& name) {
    if (name.empty()) {
      throw invalid_argument("FileMetadata name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FIL-%04d", seq_++);
    FileMetadata obj{buf, name};
    obj.validate();
    file_metadatas_.emplace(obj.id(), obj);
    cout << "[CloudFileSyncClientService.createFileMetadata] stored " << obj.id() << endl;
    return obj;
  }

  FileMetadata getFileMetadata(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = file_metadatas_.find(id);
    if (it == file_metadatas_.end()) {
      throw out_of_range("unknown FileMetadata id");
    }
    cout << "[CloudFileSyncClientService.getFileMetadata] found " << id << endl;
    return it->second;
  }

  hash createhash(const string& name) {
    if (name.empty()) {
      throw invalid_argument("hash name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "HAS-%04d", seq_++);
    hash obj{buf, name};
    obj.validate();
    hashs_.emplace(obj.id(), obj);
    cout << "[CloudFileSyncClientService.createhash] stored " << obj.id() << endl;
    return obj;
  }

  hash gethash(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = hashs_.find(id);
    if (it == hashs_.end()) {
      throw out_of_range("unknown hash id");
    }
    cout << "[CloudFileSyncClientService.gethash] found " << id << endl;
    return it->second;
  }

  version createversion(const string& name) {
    if (name.empty()) {
      throw invalid_argument("version name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "VER-%04d", seq_++);
    version obj{buf, name};
    obj.validate();
    versions_.emplace(obj.id(), obj);
    cout << "[CloudFileSyncClientService.createversion] stored " << obj.id() << endl;
    return obj;
  }

  version getversion(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = versions_.find(id);
    if (it == versions_.end()) {
      throw out_of_range("unknown version id");
    }
    cout << "[CloudFileSyncClientService.getversion] found " << id << endl;
    return it->second;
  }

  modifiedTime createmodifiedTime(const string& name) {
    if (name.empty()) {
      throw invalid_argument("modifiedTime name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MOD-%04d", seq_++);
    modifiedTime obj{buf, name};
    obj.validate();
    modified_times_.emplace(obj.id(), obj);
    cout << "[CloudFileSyncClientService.createmodifiedTime] stored " << obj.id() << endl;
    return obj;
  }

  modifiedTime getmodifiedTime(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = modified_times_.find(id);
    if (it == modified_times_.end()) {
      throw out_of_range("unknown modifiedTime id");
    }
    cout << "[CloudFileSyncClientService.getmodifiedTime] found " << id << endl;
    return it->second;
  }

  Chunk createChunk(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Chunk name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CHU-%04d", seq_++);
    Chunk obj{buf, name};
    obj.validate();
    chunks_.emplace(obj.id(), obj);
    cout << "[CloudFileSyncClientService.createChunk] stored " << obj.id() << endl;
    return obj;
  }

  Chunk getChunk(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = chunks_.find(id);
    if (it == chunks_.end()) {
      throw out_of_range("unknown Chunk id");
    }
    cout << "[CloudFileSyncClientService.getChunk] found " << id << endl;
    return it->second;
  }

  FileMetadata closeFileMetadata(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = file_metadatas_.find(id);
    if (it == file_metadatas_.end()) {
      throw out_of_range("unknown FileMetadata");
    }
    cout << "[CloudFileSyncClientService.closeFileMetadata] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct CloudFileSyncClientService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  CloudFileSyncClientService system;
  cout << "========== STEP 2: Create FileMetadata ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createFileMetadata("alpha-file_metadata");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createFileMetadata("beta-file_metadata");
  system.createhash("sample-hash");
  system.createversion("sample-version");
  system.createmodifiedTime("sample-modified_time");
  system.createChunk("sample-chunk");
  system.closeFileMetadata(first.id());
  try {
    system.closeFileMetadata(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getFileMetadata("MISSING-ID");
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

type FileMetadata struct {
  ID     string
  Name   string
  Status string
}

func NewFileMetadata(id, name string) (*FileMetadata, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("FileMetadata requires id and name")
  }
  obj := &FileMetadata{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[FileMetadata.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *FileMetadata) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("FileMetadata invalid status")
  }
  fmt.Printf("[FileMetadata.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *FileMetadata) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("FileMetadata %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[FileMetadata.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type hash struct {
  ID     string
  Name   string
  Status string
}

func Newhash(id, name string) (*hash, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("hash requires id and name")
  }
  obj := &hash{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[hash.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *hash) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("hash invalid status")
  }
  fmt.Printf("[hash.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *hash) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("hash %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[hash.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type version struct {
  ID     string
  Name   string
  Status string
}

func Newversion(id, name string) (*version, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("version requires id and name")
  }
  obj := &version{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[version.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *version) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("version invalid status")
  }
  fmt.Printf("[version.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *version) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("version %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[version.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type modifiedTime struct {
  ID     string
  Name   string
  Status string
}

func NewmodifiedTime(id, name string) (*modifiedTime, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("modifiedTime requires id and name")
  }
  obj := &modifiedTime{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[modifiedTime.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *modifiedTime) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("modifiedTime invalid status")
  }
  fmt.Printf("[modifiedTime.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *modifiedTime) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("modifiedTime %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[modifiedTime.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Chunk struct {
  ID     string
  Name   string
  Status string
}

func NewChunk(id, name string) (*Chunk, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Chunk requires id and name")
  }
  obj := &Chunk{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Chunk.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Chunk) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Chunk invalid status")
  }
  fmt.Printf("[Chunk.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Chunk) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Chunk %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Chunk.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type CloudFileSyncClientService struct {
  mu  sync.Mutex
  seq int
  file_metadatas map[string]*FileMetadata
  hashs map[string]*hash
  versions map[string]*version
  modified_times map[string]*modifiedTime
  chunks map[string]*Chunk
}

func NewCloudFileSyncClientService() *CloudFileSyncClientService {
  fmt.Println("[CloudFileSyncClientService.__init__] system ready")
  return &CloudFileSyncClientService{
    seq: 1,
    file_metadatas: map[string]*FileMetadata{},
    hashs: map[string]*hash{},
    versions: map[string]*version{},
    modified_times: map[string]*modifiedTime{},
    chunks: map[string]*Chunk{},
  }
}

func (s *CloudFileSyncClientService) CreateFileMetadata(name string) (*FileMetadata, error) {
  if name == "" {
    return nil, fmt.Errorf("FileMetadata name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FIL-%04d", s.seq)
  s.seq++
  obj, err := NewFileMetadata(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.file_metadatas[id] = obj
  fmt.Printf("[CloudFileSyncClientService.CreateFileMetadata] stored %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) GetFileMetadata(id string) (*FileMetadata, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.file_metadatas[id]
  if !ok {
    return nil, fmt.Errorf("unknown FileMetadata id: %s", id)
  }
  fmt.Printf("[CloudFileSyncClientService.GetFileMetadata] found %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) Createhash(name string) (*hash, error) {
  if name == "" {
    return nil, fmt.Errorf("hash name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("HAS-%04d", s.seq)
  s.seq++
  obj, err := Newhash(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.hashs[id] = obj
  fmt.Printf("[CloudFileSyncClientService.Createhash] stored %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) Gethash(id string) (*hash, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.hashs[id]
  if !ok {
    return nil, fmt.Errorf("unknown hash id: %s", id)
  }
  fmt.Printf("[CloudFileSyncClientService.Gethash] found %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) Createversion(name string) (*version, error) {
  if name == "" {
    return nil, fmt.Errorf("version name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("VER-%04d", s.seq)
  s.seq++
  obj, err := Newversion(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.versions[id] = obj
  fmt.Printf("[CloudFileSyncClientService.Createversion] stored %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) Getversion(id string) (*version, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.versions[id]
  if !ok {
    return nil, fmt.Errorf("unknown version id: %s", id)
  }
  fmt.Printf("[CloudFileSyncClientService.Getversion] found %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) CreatemodifiedTime(name string) (*modifiedTime, error) {
  if name == "" {
    return nil, fmt.Errorf("modifiedTime name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MOD-%04d", s.seq)
  s.seq++
  obj, err := NewmodifiedTime(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.modified_times[id] = obj
  fmt.Printf("[CloudFileSyncClientService.CreatemodifiedTime] stored %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) GetmodifiedTime(id string) (*modifiedTime, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.modified_times[id]
  if !ok {
    return nil, fmt.Errorf("unknown modifiedTime id: %s", id)
  }
  fmt.Printf("[CloudFileSyncClientService.GetmodifiedTime] found %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) CreateChunk(name string) (*Chunk, error) {
  if name == "" {
    return nil, fmt.Errorf("Chunk name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CHU-%04d", s.seq)
  s.seq++
  obj, err := NewChunk(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.chunks[id] = obj
  fmt.Printf("[CloudFileSyncClientService.CreateChunk] stored %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) GetChunk(id string) (*Chunk, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.chunks[id]
  if !ok {
    return nil, fmt.Errorf("unknown Chunk id: %s", id)
  }
  fmt.Printf("[CloudFileSyncClientService.GetChunk] found %s\\n", id)
  return obj, nil
}

func (s *CloudFileSyncClientService) CloseFileMetadata(id string) (*FileMetadata, error) {
  obj, err := s.GetFileMetadata(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[CloudFileSyncClientService.CloseFileMetadata] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct CloudFileSyncClientService ==========")
  system := NewCloudFileSyncClientService()
  fmt.Println("========== STEP 2: Create FileMetadata ==========")
  first, _ := system.CreateFileMetadata("alpha-file_metadata")
  system.CreateFileMetadata("beta-file_metadata")
  system.Createhash("sample-hash")
  system.Createversion("sample-version")
  system.CreatemodifiedTime("sample-modified_time")
  system.CreateChunk("sample-chunk")
  system.CloseFileMetadata(first.ID)
  if _, err := system.CloseFileMetadata(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetFileMetadata("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class FileMetadata {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public FileMetadata(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FileMetadata requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[FileMetadata.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("FileMetadata invalid status");
    }
    Console.WriteLine("[FileMetadata.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("FileMetadata " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[FileMetadata.close] id=" + Id + " -> CLOSED");
  }
}


sealed class hash {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public hash(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("hash requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[hash.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("hash invalid status");
    }
    Console.WriteLine("[hash.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("hash " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[hash.close] id=" + Id + " -> CLOSED");
  }
}


sealed class version {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public version(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("version requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[version.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("version invalid status");
    }
    Console.WriteLine("[version.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("version " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[version.close] id=" + Id + " -> CLOSED");
  }
}


sealed class modifiedTime {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public modifiedTime(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("modifiedTime requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[modifiedTime.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("modifiedTime invalid status");
    }
    Console.WriteLine("[modifiedTime.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("modifiedTime " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[modifiedTime.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Chunk {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Chunk(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Chunk requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Chunk.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Chunk invalid status");
    }
    Console.WriteLine("[Chunk.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Chunk " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Chunk.close] id=" + Id + " -> CLOSED");
  }
}

sealed class CloudFileSyncClientService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, FileMetadata> _file_metadatas = new();
  private readonly Dictionary<string, hash> _hashs = new();
  private readonly Dictionary<string, version> _versions = new();
  private readonly Dictionary<string, modifiedTime> _modified_times = new();
  private readonly Dictionary<string, Chunk> _chunks = new();
  public CloudFileSyncClientService() {
    Console.WriteLine("[CloudFileSyncClientService.__init__] system ready");
  }

  public FileMetadata CreateFileMetadata(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FileMetadata name required");
    }
    lock (_gate) {
      var id = string.Format("FIL-{0:D4}", _seq++);
      var obj = new FileMetadata(id, name.Trim());
      obj.Validate();
      _file_metadatas[id] = obj;
      Console.WriteLine("[CloudFileSyncClientService.CreateFileMetadata] stored " + id);
      return obj;
    }
  }

  public FileMetadata GetFileMetadata(string id) {
    lock (_gate) {
      if (!_file_metadatas.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown FileMetadata id: " + id);
      }
      Console.WriteLine("[CloudFileSyncClientService.GetFileMetadata] found " + id);
      return obj;
    }
  }

  public hash Createhash(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("hash name required");
    }
    lock (_gate) {
      var id = string.Format("HAS-{0:D4}", _seq++);
      var obj = new hash(id, name.Trim());
      obj.Validate();
      _hashs[id] = obj;
      Console.WriteLine("[CloudFileSyncClientService.Createhash] stored " + id);
      return obj;
    }
  }

  public hash Gethash(string id) {
    lock (_gate) {
      if (!_hashs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown hash id: " + id);
      }
      Console.WriteLine("[CloudFileSyncClientService.Gethash] found " + id);
      return obj;
    }
  }

  public version Createversion(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("version name required");
    }
    lock (_gate) {
      var id = string.Format("VER-{0:D4}", _seq++);
      var obj = new version(id, name.Trim());
      obj.Validate();
      _versions[id] = obj;
      Console.WriteLine("[CloudFileSyncClientService.Createversion] stored " + id);
      return obj;
    }
  }

  public version Getversion(string id) {
    lock (_gate) {
      if (!_versions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown version id: " + id);
      }
      Console.WriteLine("[CloudFileSyncClientService.Getversion] found " + id);
      return obj;
    }
  }

  public modifiedTime CreatemodifiedTime(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("modifiedTime name required");
    }
    lock (_gate) {
      var id = string.Format("MOD-{0:D4}", _seq++);
      var obj = new modifiedTime(id, name.Trim());
      obj.Validate();
      _modified_times[id] = obj;
      Console.WriteLine("[CloudFileSyncClientService.CreatemodifiedTime] stored " + id);
      return obj;
    }
  }

  public modifiedTime GetmodifiedTime(string id) {
    lock (_gate) {
      if (!_modified_times.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown modifiedTime id: " + id);
      }
      Console.WriteLine("[CloudFileSyncClientService.GetmodifiedTime] found " + id);
      return obj;
    }
  }

  public Chunk CreateChunk(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Chunk name required");
    }
    lock (_gate) {
      var id = string.Format("CHU-{0:D4}", _seq++);
      var obj = new Chunk(id, name.Trim());
      obj.Validate();
      _chunks[id] = obj;
      Console.WriteLine("[CloudFileSyncClientService.CreateChunk] stored " + id);
      return obj;
    }
  }

  public Chunk GetChunk(string id) {
    lock (_gate) {
      if (!_chunks.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Chunk id: " + id);
      }
      Console.WriteLine("[CloudFileSyncClientService.GetChunk] found " + id);
      return obj;
    }
  }

  public FileMetadata CloseFileMetadata(string id) {
    var obj = GetFileMetadata(id);
    Console.WriteLine("[CloudFileSyncClientService.CloseFileMetadata] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct CloudFileSyncClientService ==========");
    var system = new CloudFileSyncClientService();
    Console.WriteLine("========== STEP 2: Create FileMetadata ==========");
    var first = system.CreateFileMetadata("alpha-file_metadata");
    system.CreateFileMetadata("beta-file_metadata");
    system.Createhash("sample-hash");
    system.Createversion("sample-version");
    system.CreatemodifiedTime("sample-modified_time");
    system.CreateChunk("sample-chunk");
    system.CloseFileMetadata(first.Id);
    try {
      system.CloseFileMetadata(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetFileMetadata("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const cloudFileSyncClientSolution: ProblemSolution = {
  slug: 'cloud-file-sync-client',
  title: 'Cloud File Sync Client (Dropbox-like) - Complete LLD Guide',
  overview: {
    introduction: [
      'Design the client-side sync engine for a cloud storage service that keeps local and remote folders in sync, handling conflicts. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Detect local file changes (create, edit, delete, move)',
      'Upload changed files to the cloud and download remote changes locally',
      'Chunk large files for efficient partial re-upload on edit',
      'Detect and resolve sync conflicts (same file edited on two devices)',
      'Support selective sync (only sync chosen folders)',
      'Show sync status per file (syncing, synced, conflict, error)',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Detect local file changes (create, edit, delete, move)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Upload changed files to the cloud and download remote changes locally?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Chunk large files for efficient partial re-upload on edit?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Detect and resolve sync conflicts (same file edited on two devices)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support selective sync (only sync chosen folders)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. CloudFileSyncClientService is the facade stereotype. FileMetadata, hash, version, modifiedTime, Chunk are concrete domain classes with id/name/status and validate/close.',
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
          'Construct CloudFileSyncClientService.',
          'createFileMetadata twice and create the related UML classes.',
          'closeFileMetadata once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'CloudFileSyncClientService', responsibility: 'UML facade - orchestrates Cloud File Sync Client (Dropbox-like).', keyMembers: ['create*', 'get*', 'closeFileMetadata'] },
    { name: 'FileMetadata', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'hash', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'version', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'modifiedTime', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Chunk', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from CloudFileSyncClientService to FileMetadata, hash, version, modifiedTime, Chunk. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on CloudFileSyncClientService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'CloudFileSyncClientService', responsibility: 'UML facade - orchestrates Cloud File Sync Client (Dropbox-like).', keyMembers: ['create*', 'get*', 'closeFileMetadata'] },
    { name: 'FileMetadata', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'hash', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'version', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'modifiedTime', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Chunk', responsibility: 'UML class - domain object for Cloud File Sync Client (Dropbox-like).', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'CloudFileSyncClientService exposes create/get/close and owns composed collections.' },
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
      'main constructs CloudFileSyncClientService, creates UML domain objects, closes the primary FileMetadata, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct CloudFileSyncClientService.',
      'createFileMetadata for alpha and beta.',
      'create remaining UML classes.',
      'closeFileMetadata(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createFileMetadata("alpha..."); closeFileMetadata(id)',
        output: '[FileMetadata.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeFileMetadata(alreadyClosed) or getFileMetadata("MISSING-ID")',
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
