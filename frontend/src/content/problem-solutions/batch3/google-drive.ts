import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'GoogleDriveService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_files', 'Map<string, File>'),
    attr('-', '_folders', 'Map<string, Folder>'),
    attr('-', '_file_versions', 'Map<string, FileVersion>'),
    attr('-', '_file_blocks', 'Map<string, FileBlock>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createFile', 'name: string', 'File'),
    method('+', 'createFolder', 'name: string', 'Folder'),
    method('+', 'createFileVersion', 'name: string', 'FileVersion'),
    method('+', 'createFileBlock', 'name: string', 'FileBlock'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getFile', 'id: string', 'File'),
    method('+', 'getFolder', 'id: string', 'Folder'),
    method('+', 'getFileVersion', 'id: string', 'FileVersion'),
    method('+', 'getFileBlock', 'id: string', 'FileBlock'),
    method('+', 'closeUser', 'id: string', 'User'),
  ], 'facade'),
  cls('n1', 'User', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'File', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Folder', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'FileVersion', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'FileBlock', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("google-drive")


class User:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("User.id is required")
        if not name or not name.strip():
            raise ValueError("User.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[User.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"User {self.id} has invalid status={self.status}")
        log.info("[User.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"User {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[User.close] id=%s -> CLOSED", self.id)


class File:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("File.id is required")
        if not name or not name.strip():
            raise ValueError("File.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[File.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"File {self.id} has invalid status={self.status}")
        log.info("[File.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"File {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[File.close] id=%s -> CLOSED", self.id)


class Folder:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Folder.id is required")
        if not name or not name.strip():
            raise ValueError("Folder.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Folder.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Folder {self.id} has invalid status={self.status}")
        log.info("[Folder.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Folder {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Folder.close] id=%s -> CLOSED", self.id)


class FileVersion:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("FileVersion.id is required")
        if not name or not name.strip():
            raise ValueError("FileVersion.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[FileVersion.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"FileVersion {self.id} has invalid status={self.status}")
        log.info("[FileVersion.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"FileVersion {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[FileVersion.close] id=%s -> CLOSED", self.id)


class FileBlock:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("FileBlock.id is required")
        if not name or not name.strip():
            raise ValueError("FileBlock.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[FileBlock.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"FileBlock {self.id} has invalid status={self.status}")
        log.info("[FileBlock.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"FileBlock {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[FileBlock.close] id=%s -> CLOSED", self.id)


class GoogleDriveService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._files: Dict[str, File] = {}
        self._folders: Dict[str, Folder] = {}
        self._file_versions: Dict[str, FileVersion] = {}
        self._file_blocks: Dict[str, FileBlock] = {}
        log.info("[GoogleDriveService.__init__] system ready; managing: User, File, Folder, FileVersion, FileBlock")

    def create_user(self, name: str) -> User:
        """UML: GoogleDriveService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[GoogleDriveService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[GoogleDriveService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_file(self, name: str) -> File:
        """UML: GoogleDriveService.create_file(name) -> File"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("File name is required")
        with self._lock:
            item_id = f"FIL-{self._seq:04d}"
            self._seq += 1
            obj = File(item_id, cleaned)
            obj.validate()
            self._files[item_id] = obj
            log.info("[GoogleDriveService.create_file] stored %s in _files (count=%s)", item_id, len(self._files))
            return obj

    def get_file(self, item_id: str) -> File:
        with self._lock:
            obj = self._files.get(item_id)
            if obj is None:
                raise KeyError(f"unknown File id: {item_id}")
            log.info("[GoogleDriveService.get_file] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_folder(self, name: str) -> Folder:
        """UML: GoogleDriveService.create_folder(name) -> Folder"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Folder name is required")
        with self._lock:
            item_id = f"FOL-{self._seq:04d}"
            self._seq += 1
            obj = Folder(item_id, cleaned)
            obj.validate()
            self._folders[item_id] = obj
            log.info("[GoogleDriveService.create_folder] stored %s in _folders (count=%s)", item_id, len(self._folders))
            return obj

    def get_folder(self, item_id: str) -> Folder:
        with self._lock:
            obj = self._folders.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Folder id: {item_id}")
            log.info("[GoogleDriveService.get_folder] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_file_version(self, name: str) -> FileVersion:
        """UML: GoogleDriveService.create_file_version(name) -> FileVersion"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("FileVersion name is required")
        with self._lock:
            item_id = f"FIL-{self._seq:04d}"
            self._seq += 1
            obj = FileVersion(item_id, cleaned)
            obj.validate()
            self._file_versions[item_id] = obj
            log.info("[GoogleDriveService.create_file_version] stored %s in _file_versions (count=%s)", item_id, len(self._file_versions))
            return obj

    def get_file_version(self, item_id: str) -> FileVersion:
        with self._lock:
            obj = self._file_versions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown FileVersion id: {item_id}")
            log.info("[GoogleDriveService.get_file_version] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_file_block(self, name: str) -> FileBlock:
        """UML: GoogleDriveService.create_file_block(name) -> FileBlock"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("FileBlock name is required")
        with self._lock:
            item_id = f"FIL-{self._seq:04d}"
            self._seq += 1
            obj = FileBlock(item_id, cleaned)
            obj.validate()
            self._file_blocks[item_id] = obj
            log.info("[GoogleDriveService.create_file_block] stored %s in _file_blocks (count=%s)", item_id, len(self._file_blocks))
            return obj

    def get_file_block(self, item_id: str) -> FileBlock:
        with self._lock:
            obj = self._file_blocks.get(item_id)
            if obj is None:
                raise KeyError(f"unknown FileBlock id: {item_id}")
            log.info("[GoogleDriveService.get_file_block] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[GoogleDriveService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[GoogleDriveService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct GoogleDriveService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = GoogleDriveService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create File (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_file("sample-file")

    log.info("========== STEP 4: Create Folder (UML class) ==========")
    system.create_folder("sample-folder")

    log.info("========== STEP 5: Create FileVersion (UML class) ==========")
    system.create_file_version("sample-file_version")

    log.info("========== STEP 6: Create FileBlock (UML class) ==========")
    system.create_file_block("sample-file_block")

    log.info("========== STEP 7: Inspect active User list ==========")
    system.list_active_users()

    log.info("========== STEP 8: Close first User ==========")
    system.close_user(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_user(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from User.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_user("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_user: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_users()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class User {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  User(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("User.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("User.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[User.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("User " + id + " invalid status");
    }
    System.out.println("[User.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("User " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[User.close] id=" + id + " -> CLOSED");
  }
}


class File {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  File(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("File.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("File.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[File.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("File " + id + " invalid status");
    }
    System.out.println("[File.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("File " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[File.close] id=" + id + " -> CLOSED");
  }
}


class Folder {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Folder(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Folder.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Folder.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Folder.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Folder " + id + " invalid status");
    }
    System.out.println("[Folder.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Folder " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Folder.close] id=" + id + " -> CLOSED");
  }
}


class FileVersion {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  FileVersion(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("FileVersion.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FileVersion.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[FileVersion.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("FileVersion " + id + " invalid status");
    }
    System.out.println("[FileVersion.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("FileVersion " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[FileVersion.close] id=" + id + " -> CLOSED");
  }
}


class FileBlock {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  FileBlock(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("FileBlock.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FileBlock.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[FileBlock.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("FileBlock " + id + " invalid status");
    }
    System.out.println("[FileBlock.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("FileBlock " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[FileBlock.close] id=" + id + " -> CLOSED");
  }
}

public class GoogleDriveService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, File> files = new LinkedHashMap<>();
  private final Map<String, Folder> folders = new LinkedHashMap<>();
  private final Map<String, FileVersion> file_versions = new LinkedHashMap<>();
  private final Map<String, FileBlock> file_blocks = new LinkedHashMap<>();

  public GoogleDriveService() {
    System.out.println("[GoogleDriveService.__init__] system ready");
  }

  public User createUser(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("User name required");
    }
    lock.lock();
    try {
      String id = String.format("USE-%04d", seq++);
      User obj = new User(id, name.trim());
      obj.validate();
      users.put(id, obj);
      System.out.println("[GoogleDriveService.createUser] stored " + id + " count=" + users.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public User getUser(String id) {
    lock.lock();
    try {
      User obj = users.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown User id: " + id);
      }
      System.out.println("[GoogleDriveService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public File createFile(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("File name required");
    }
    lock.lock();
    try {
      String id = String.format("FIL-%04d", seq++);
      File obj = new File(id, name.trim());
      obj.validate();
      files.put(id, obj);
      System.out.println("[GoogleDriveService.createFile] stored " + id + " count=" + files.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public File getFile(String id) {
    lock.lock();
    try {
      File obj = files.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown File id: " + id);
      }
      System.out.println("[GoogleDriveService.getFile] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Folder createFolder(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Folder name required");
    }
    lock.lock();
    try {
      String id = String.format("FOL-%04d", seq++);
      Folder obj = new Folder(id, name.trim());
      obj.validate();
      folders.put(id, obj);
      System.out.println("[GoogleDriveService.createFolder] stored " + id + " count=" + folders.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Folder getFolder(String id) {
    lock.lock();
    try {
      Folder obj = folders.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Folder id: " + id);
      }
      System.out.println("[GoogleDriveService.getFolder] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public FileVersion createFileVersion(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FileVersion name required");
    }
    lock.lock();
    try {
      String id = String.format("FIL-%04d", seq++);
      FileVersion obj = new FileVersion(id, name.trim());
      obj.validate();
      file_versions.put(id, obj);
      System.out.println("[GoogleDriveService.createFileVersion] stored " + id + " count=" + file_versions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public FileVersion getFileVersion(String id) {
    lock.lock();
    try {
      FileVersion obj = file_versions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown FileVersion id: " + id);
      }
      System.out.println("[GoogleDriveService.getFileVersion] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public FileBlock createFileBlock(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("FileBlock name required");
    }
    lock.lock();
    try {
      String id = String.format("FIL-%04d", seq++);
      FileBlock obj = new FileBlock(id, name.trim());
      obj.validate();
      file_blocks.put(id, obj);
      System.out.println("[GoogleDriveService.createFileBlock] stored " + id + " count=" + file_blocks.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public FileBlock getFileBlock(String id) {
    lock.lock();
    try {
      FileBlock obj = file_blocks.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown FileBlock id: " + id);
      }
      System.out.println("[GoogleDriveService.getFileBlock] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public User closeUser(String id) {
    lock.lock();
    try {
      User obj = users.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown User id: " + id);
      }
      System.out.println("[GoogleDriveService.closeUser] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<User> listActiveUsers() {
    lock.lock();
    try {
      List<User> out = new ArrayList<>();
      for (User o : users.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[GoogleDriveService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct GoogleDriveService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    GoogleDriveService system = new GoogleDriveService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create File ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createFile("sample-file");
    System.out.println("========== STEP 4: Create Folder ==========");
    system.createFolder("sample-folder");
    System.out.println("========== STEP 5: Create FileVersion ==========");
    system.createFileVersion("sample-file_version");
    System.out.println("========== STEP 6: Create FileBlock ==========");
    system.createFileBlock("sample-file_block");
    System.out.println("========== Inspect active list ==========");
    system.listActiveUsers();
    System.out.println("========== Close first User ==========");
    system.closeUser(first.getId());
    try {
      system.closeUser(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getUser("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class User {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('User.id required')
    }

    if (!name?.trim()) {
      throw new Error('User.name required')
    }
    console.log(\`[User.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`User \${this.id} invalid status\`)
    }
    console.log(\`[User.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`User \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[User.close] id=\${this.id} -> CLOSED\`)
  }
}


class File {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('File.id required')
    }

    if (!name?.trim()) {
      throw new Error('File.name required')
    }
    console.log(\`[File.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`File \${this.id} invalid status\`)
    }
    console.log(\`[File.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`File \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[File.close] id=\${this.id} -> CLOSED\`)
  }
}


class Folder {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Folder.id required')
    }

    if (!name?.trim()) {
      throw new Error('Folder.name required')
    }
    console.log(\`[Folder.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Folder \${this.id} invalid status\`)
    }
    console.log(\`[Folder.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Folder \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Folder.close] id=\${this.id} -> CLOSED\`)
  }
}


class FileVersion {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('FileVersion.id required')
    }

    if (!name?.trim()) {
      throw new Error('FileVersion.name required')
    }
    console.log(\`[FileVersion.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`FileVersion \${this.id} invalid status\`)
    }
    console.log(\`[FileVersion.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`FileVersion \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[FileVersion.close] id=\${this.id} -> CLOSED\`)
  }
}


class FileBlock {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('FileBlock.id required')
    }

    if (!name?.trim()) {
      throw new Error('FileBlock.name required')
    }
    console.log(\`[FileBlock.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`FileBlock \${this.id} invalid status\`)
    }
    console.log(\`[FileBlock.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`FileBlock \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[FileBlock.close] id=\${this.id} -> CLOSED\`)
  }
}

class GoogleDriveService {
  private seq = 1
  private users = new Map<string, User>()
  private files = new Map<string, File>()
  private folders = new Map<string, Folder>()
  private file_versions = new Map<string, FileVersion>()
  private file_blocks = new Map<string, FileBlock>()
  constructor() {
    console.log('[GoogleDriveService.__init__] system ready')
  }

  createUser(name: string): User {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('User name required')
    }
    const id = \`USE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new User(id, cleaned)
    obj.validate()
    this.users.set(id, obj)
    console.log(\`[GoogleDriveService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[GoogleDriveService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createFile(name: string): File {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('File name required')
    }
    const id = \`FIL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new File(id, cleaned)
    obj.validate()
    this.files.set(id, obj)
    console.log(\`[GoogleDriveService.createFile] stored \${id} count=\${this.files.size}\`)
    return obj
  }

  getFile(id: string): File {
    const obj = this.files.get(id)
    if (!obj) {
      throw new Error(\`unknown File id: \${id}\`)
    }
    console.log(\`[GoogleDriveService.getFile] found id=\${obj.id}\`)
    return obj
  }

  createFolder(name: string): Folder {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Folder name required')
    }
    const id = \`FOL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Folder(id, cleaned)
    obj.validate()
    this.folders.set(id, obj)
    console.log(\`[GoogleDriveService.createFolder] stored \${id} count=\${this.folders.size}\`)
    return obj
  }

  getFolder(id: string): Folder {
    const obj = this.folders.get(id)
    if (!obj) {
      throw new Error(\`unknown Folder id: \${id}\`)
    }
    console.log(\`[GoogleDriveService.getFolder] found id=\${obj.id}\`)
    return obj
  }

  createFileVersion(name: string): FileVersion {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('FileVersion name required')
    }
    const id = \`FIL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new FileVersion(id, cleaned)
    obj.validate()
    this.file_versions.set(id, obj)
    console.log(\`[GoogleDriveService.createFileVersion] stored \${id} count=\${this.file_versions.size}\`)
    return obj
  }

  getFileVersion(id: string): FileVersion {
    const obj = this.file_versions.get(id)
    if (!obj) {
      throw new Error(\`unknown FileVersion id: \${id}\`)
    }
    console.log(\`[GoogleDriveService.getFileVersion] found id=\${obj.id}\`)
    return obj
  }

  createFileBlock(name: string): FileBlock {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('FileBlock name required')
    }
    const id = \`FIL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new FileBlock(id, cleaned)
    obj.validate()
    this.file_blocks.set(id, obj)
    console.log(\`[GoogleDriveService.createFileBlock] stored \${id} count=\${this.file_blocks.size}\`)
    return obj
  }

  getFileBlock(id: string): FileBlock {
    const obj = this.file_blocks.get(id)
    if (!obj) {
      throw new Error(\`unknown FileBlock id: \${id}\`)
    }
    console.log(\`[GoogleDriveService.getFileBlock] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[GoogleDriveService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[GoogleDriveService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct GoogleDriveService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new GoogleDriveService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create File ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createFile('sample-file')
  console.log('========== STEP 4: Create Folder ==========')
  system.createFolder('sample-folder')
  console.log('========== STEP 5: Create FileVersion ==========')
  system.createFileVersion('sample-file_version')
  console.log('========== STEP 6: Create FileBlock ==========')
  system.createFileBlock('sample-file_block')
  system.listActiveUsers()
  console.log('========== Close first User ==========')
  system.closeUser(first.id)
  try {
    system.closeUser(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getUser('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class User {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  User(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("User requires id and name");
    }
    cout << "[User.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("User invalid status");
    }
    cout << "[User.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("User cannot close");
    }
    status_ = "CLOSED";
    cout << "[User.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class File {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  File(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("File requires id and name");
    }
    cout << "[File.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("File invalid status");
    }
    cout << "[File.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("File cannot close");
    }
    status_ = "CLOSED";
    cout << "[File.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Folder {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Folder(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Folder requires id and name");
    }
    cout << "[Folder.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Folder invalid status");
    }
    cout << "[Folder.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Folder cannot close");
    }
    status_ = "CLOSED";
    cout << "[Folder.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class FileVersion {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  FileVersion(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("FileVersion requires id and name");
    }
    cout << "[FileVersion.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("FileVersion invalid status");
    }
    cout << "[FileVersion.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("FileVersion cannot close");
    }
    status_ = "CLOSED";
    cout << "[FileVersion.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class FileBlock {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  FileBlock(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("FileBlock requires id and name");
    }
    cout << "[FileBlock.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("FileBlock invalid status");
    }
    cout << "[FileBlock.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("FileBlock cannot close");
    }
    status_ = "CLOSED";
    cout << "[FileBlock.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class GoogleDriveService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, File> files_;
  unordered_map<string, Folder> folders_;
  unordered_map<string, FileVersion> file_versions_;
  unordered_map<string, FileBlock> file_blocks_;
public:
  GoogleDriveService() {
    cout << "[GoogleDriveService.__init__] system ready" << endl;
  }

  User createUser(const string& name) {
    if (name.empty()) {
      throw invalid_argument("User name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "USE-%04d", seq_++);
    User obj{buf, name};
    obj.validate();
    users_.emplace(obj.id(), obj);
    cout << "[GoogleDriveService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[GoogleDriveService.getUser] found " << id << endl;
    return it->second;
  }

  File createFile(const string& name) {
    if (name.empty()) {
      throw invalid_argument("File name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FIL-%04d", seq_++);
    File obj{buf, name};
    obj.validate();
    files_.emplace(obj.id(), obj);
    cout << "[GoogleDriveService.createFile] stored " << obj.id() << endl;
    return obj;
  }

  File getFile(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = files_.find(id);
    if (it == files_.end()) {
      throw out_of_range("unknown File id");
    }
    cout << "[GoogleDriveService.getFile] found " << id << endl;
    return it->second;
  }

  Folder createFolder(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Folder name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FOL-%04d", seq_++);
    Folder obj{buf, name};
    obj.validate();
    folders_.emplace(obj.id(), obj);
    cout << "[GoogleDriveService.createFolder] stored " << obj.id() << endl;
    return obj;
  }

  Folder getFolder(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = folders_.find(id);
    if (it == folders_.end()) {
      throw out_of_range("unknown Folder id");
    }
    cout << "[GoogleDriveService.getFolder] found " << id << endl;
    return it->second;
  }

  FileVersion createFileVersion(const string& name) {
    if (name.empty()) {
      throw invalid_argument("FileVersion name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FIL-%04d", seq_++);
    FileVersion obj{buf, name};
    obj.validate();
    file_versions_.emplace(obj.id(), obj);
    cout << "[GoogleDriveService.createFileVersion] stored " << obj.id() << endl;
    return obj;
  }

  FileVersion getFileVersion(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = file_versions_.find(id);
    if (it == file_versions_.end()) {
      throw out_of_range("unknown FileVersion id");
    }
    cout << "[GoogleDriveService.getFileVersion] found " << id << endl;
    return it->second;
  }

  FileBlock createFileBlock(const string& name) {
    if (name.empty()) {
      throw invalid_argument("FileBlock name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FIL-%04d", seq_++);
    FileBlock obj{buf, name};
    obj.validate();
    file_blocks_.emplace(obj.id(), obj);
    cout << "[GoogleDriveService.createFileBlock] stored " << obj.id() << endl;
    return obj;
  }

  FileBlock getFileBlock(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = file_blocks_.find(id);
    if (it == file_blocks_.end()) {
      throw out_of_range("unknown FileBlock id");
    }
    cout << "[GoogleDriveService.getFileBlock] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[GoogleDriveService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct GoogleDriveService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  GoogleDriveService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createFile("sample-file");
  system.createFolder("sample-folder");
  system.createFileVersion("sample-file_version");
  system.createFileBlock("sample-file_block");
  system.closeUser(first.id());
  try {
    system.closeUser(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getUser("MISSING-ID");
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

type User struct {
  ID     string
  Name   string
  Status string
}

func NewUser(id, name string) (*User, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("User requires id and name")
  }
  obj := &User{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[User.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *User) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("User invalid status")
  }
  fmt.Printf("[User.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *User) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("User %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[User.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type File struct {
  ID     string
  Name   string
  Status string
}

func NewFile(id, name string) (*File, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("File requires id and name")
  }
  obj := &File{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[File.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *File) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("File invalid status")
  }
  fmt.Printf("[File.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *File) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("File %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[File.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Folder struct {
  ID     string
  Name   string
  Status string
}

func NewFolder(id, name string) (*Folder, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Folder requires id and name")
  }
  obj := &Folder{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Folder.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Folder) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Folder invalid status")
  }
  fmt.Printf("[Folder.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Folder) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Folder %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Folder.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type FileVersion struct {
  ID     string
  Name   string
  Status string
}

func NewFileVersion(id, name string) (*FileVersion, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("FileVersion requires id and name")
  }
  obj := &FileVersion{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[FileVersion.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *FileVersion) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("FileVersion invalid status")
  }
  fmt.Printf("[FileVersion.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *FileVersion) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("FileVersion %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[FileVersion.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type FileBlock struct {
  ID     string
  Name   string
  Status string
}

func NewFileBlock(id, name string) (*FileBlock, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("FileBlock requires id and name")
  }
  obj := &FileBlock{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[FileBlock.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *FileBlock) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("FileBlock invalid status")
  }
  fmt.Printf("[FileBlock.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *FileBlock) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("FileBlock %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[FileBlock.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type GoogleDriveService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  files map[string]*File
  folders map[string]*Folder
  file_versions map[string]*FileVersion
  file_blocks map[string]*FileBlock
}

func NewGoogleDriveService() *GoogleDriveService {
  fmt.Println("[GoogleDriveService.__init__] system ready")
  return &GoogleDriveService{
    seq: 1,
    users: map[string]*User{},
    files: map[string]*File{},
    folders: map[string]*Folder{},
    file_versions: map[string]*FileVersion{},
    file_blocks: map[string]*FileBlock{},
  }
}

func (s *GoogleDriveService) CreateUser(name string) (*User, error) {
  if name == "" {
    return nil, fmt.Errorf("User name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("USE-%04d", s.seq)
  s.seq++
  obj, err := NewUser(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.users[id] = obj
  fmt.Printf("[GoogleDriveService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[GoogleDriveService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) CreateFile(name string) (*File, error) {
  if name == "" {
    return nil, fmt.Errorf("File name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FIL-%04d", s.seq)
  s.seq++
  obj, err := NewFile(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.files[id] = obj
  fmt.Printf("[GoogleDriveService.CreateFile] stored %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) GetFile(id string) (*File, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.files[id]
  if !ok {
    return nil, fmt.Errorf("unknown File id: %s", id)
  }
  fmt.Printf("[GoogleDriveService.GetFile] found %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) CreateFolder(name string) (*Folder, error) {
  if name == "" {
    return nil, fmt.Errorf("Folder name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FOL-%04d", s.seq)
  s.seq++
  obj, err := NewFolder(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.folders[id] = obj
  fmt.Printf("[GoogleDriveService.CreateFolder] stored %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) GetFolder(id string) (*Folder, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.folders[id]
  if !ok {
    return nil, fmt.Errorf("unknown Folder id: %s", id)
  }
  fmt.Printf("[GoogleDriveService.GetFolder] found %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) CreateFileVersion(name string) (*FileVersion, error) {
  if name == "" {
    return nil, fmt.Errorf("FileVersion name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FIL-%04d", s.seq)
  s.seq++
  obj, err := NewFileVersion(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.file_versions[id] = obj
  fmt.Printf("[GoogleDriveService.CreateFileVersion] stored %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) GetFileVersion(id string) (*FileVersion, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.file_versions[id]
  if !ok {
    return nil, fmt.Errorf("unknown FileVersion id: %s", id)
  }
  fmt.Printf("[GoogleDriveService.GetFileVersion] found %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) CreateFileBlock(name string) (*FileBlock, error) {
  if name == "" {
    return nil, fmt.Errorf("FileBlock name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FIL-%04d", s.seq)
  s.seq++
  obj, err := NewFileBlock(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.file_blocks[id] = obj
  fmt.Printf("[GoogleDriveService.CreateFileBlock] stored %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) GetFileBlock(id string) (*FileBlock, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.file_blocks[id]
  if !ok {
    return nil, fmt.Errorf("unknown FileBlock id: %s", id)
  }
  fmt.Printf("[GoogleDriveService.GetFileBlock] found %s\\n", id)
  return obj, nil
}

func (s *GoogleDriveService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[GoogleDriveService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct GoogleDriveService ==========")
  system := NewGoogleDriveService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateFile("sample-file")
  system.CreateFolder("sample-folder")
  system.CreateFileVersion("sample-file_version")
  system.CreateFileBlock("sample-file_block")
  system.CloseUser(first.ID)
  if _, err := system.CloseUser(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetUser("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class User {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public User(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("User requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[User.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("User invalid status");
    }
    Console.WriteLine("[User.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("User " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[User.close] id=" + Id + " -> CLOSED");
  }
}


sealed class File {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public File(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("File requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[File.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("File invalid status");
    }
    Console.WriteLine("[File.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("File " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[File.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Folder {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Folder(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Folder requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Folder.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Folder invalid status");
    }
    Console.WriteLine("[Folder.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Folder " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Folder.close] id=" + Id + " -> CLOSED");
  }
}


sealed class FileVersion {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public FileVersion(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FileVersion requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[FileVersion.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("FileVersion invalid status");
    }
    Console.WriteLine("[FileVersion.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("FileVersion " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[FileVersion.close] id=" + Id + " -> CLOSED");
  }
}


sealed class FileBlock {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public FileBlock(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FileBlock requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[FileBlock.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("FileBlock invalid status");
    }
    Console.WriteLine("[FileBlock.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("FileBlock " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[FileBlock.close] id=" + Id + " -> CLOSED");
  }
}

sealed class GoogleDriveService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, File> _files = new();
  private readonly Dictionary<string, Folder> _folders = new();
  private readonly Dictionary<string, FileVersion> _file_versions = new();
  private readonly Dictionary<string, FileBlock> _file_blocks = new();
  public GoogleDriveService() {
    Console.WriteLine("[GoogleDriveService.__init__] system ready");
  }

  public User CreateUser(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("User name required");
    }
    lock (_gate) {
      var id = string.Format("USE-{0:D4}", _seq++);
      var obj = new User(id, name.Trim());
      obj.Validate();
      _users[id] = obj;
      Console.WriteLine("[GoogleDriveService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[GoogleDriveService.GetUser] found " + id);
      return obj;
    }
  }

  public File CreateFile(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("File name required");
    }
    lock (_gate) {
      var id = string.Format("FIL-{0:D4}", _seq++);
      var obj = new File(id, name.Trim());
      obj.Validate();
      _files[id] = obj;
      Console.WriteLine("[GoogleDriveService.CreateFile] stored " + id);
      return obj;
    }
  }

  public File GetFile(string id) {
    lock (_gate) {
      if (!_files.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown File id: " + id);
      }
      Console.WriteLine("[GoogleDriveService.GetFile] found " + id);
      return obj;
    }
  }

  public Folder CreateFolder(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Folder name required");
    }
    lock (_gate) {
      var id = string.Format("FOL-{0:D4}", _seq++);
      var obj = new Folder(id, name.Trim());
      obj.Validate();
      _folders[id] = obj;
      Console.WriteLine("[GoogleDriveService.CreateFolder] stored " + id);
      return obj;
    }
  }

  public Folder GetFolder(string id) {
    lock (_gate) {
      if (!_folders.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Folder id: " + id);
      }
      Console.WriteLine("[GoogleDriveService.GetFolder] found " + id);
      return obj;
    }
  }

  public FileVersion CreateFileVersion(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FileVersion name required");
    }
    lock (_gate) {
      var id = string.Format("FIL-{0:D4}", _seq++);
      var obj = new FileVersion(id, name.Trim());
      obj.Validate();
      _file_versions[id] = obj;
      Console.WriteLine("[GoogleDriveService.CreateFileVersion] stored " + id);
      return obj;
    }
  }

  public FileVersion GetFileVersion(string id) {
    lock (_gate) {
      if (!_file_versions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown FileVersion id: " + id);
      }
      Console.WriteLine("[GoogleDriveService.GetFileVersion] found " + id);
      return obj;
    }
  }

  public FileBlock CreateFileBlock(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("FileBlock name required");
    }
    lock (_gate) {
      var id = string.Format("FIL-{0:D4}", _seq++);
      var obj = new FileBlock(id, name.Trim());
      obj.Validate();
      _file_blocks[id] = obj;
      Console.WriteLine("[GoogleDriveService.CreateFileBlock] stored " + id);
      return obj;
    }
  }

  public FileBlock GetFileBlock(string id) {
    lock (_gate) {
      if (!_file_blocks.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown FileBlock id: " + id);
      }
      Console.WriteLine("[GoogleDriveService.GetFileBlock] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[GoogleDriveService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct GoogleDriveService ==========");
    var system = new GoogleDriveService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateFile("sample-file");
    system.CreateFolder("sample-folder");
    system.CreateFileVersion("sample-file_version");
    system.CreateFileBlock("sample-file_block");
    system.CloseUser(first.Id);
    try {
      system.CloseUser(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetUser("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const googleDriveSolution: ProblemSolution = {
  slug: 'google-drive',
  title: 'Google Drive - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a cloud file storage system like Google Drive supporting file upload, sync, sharing, versioning, and collaborative access. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Upload and download files of any type/size',
      'Organise files in a hierarchical folder structure',
      'Share files/folders with view or edit permissions',
      'Real-time collaborative editing for supported file types',
      'Version history — restore any previous version',
      'Sync files across multiple devices automatically',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Upload and download files of any type/size?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Organise files in a hierarchical folder structure?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Share files/folders with view or edit permissions?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Real-time collaborative editing for supported file types?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Version history — restore any previous version?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. GoogleDriveService is the facade stereotype. User, File, Folder, FileVersion, FileBlock are concrete domain classes with id/name/status and validate/close.',
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
          'Construct GoogleDriveService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'GoogleDriveService', responsibility: 'UML facade - orchestrates Google Drive.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'File', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Folder', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'FileVersion', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'FileBlock', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from GoogleDriveService to User, File, Folder, FileVersion, FileBlock. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on GoogleDriveService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'GoogleDriveService', responsibility: 'UML facade - orchestrates Google Drive.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'File', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Folder', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'FileVersion', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'FileBlock', responsibility: 'UML class - domain object for Google Drive.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'GoogleDriveService exposes create/get/close and owns composed collections.' },
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
      'main constructs GoogleDriveService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct GoogleDriveService.',
      'createUser for alpha and beta.',
      'create remaining UML classes.',
      'closeUser(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createUser("alpha..."); closeUser(id)',
        output: '[User.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeUser(alreadyClosed) or getUser("MISSING-ID")',
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
