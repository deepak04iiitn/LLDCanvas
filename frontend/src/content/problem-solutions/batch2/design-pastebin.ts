import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'DesignPastebinService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_pastes', 'Map<string, Paste>'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_languages', 'Map<string, Language>'),
    attr('-', '_visibilities', 'Map<string, Visibility>'),
  ], [
    method('+', 'createPaste', 'name: string', 'Paste'),
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createLanguage', 'name: string', 'Language'),
    method('+', 'createVisibility', 'name: string', 'Visibility'),
    method('+', 'getPaste', 'id: string', 'Paste'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getLanguage', 'id: string', 'Language'),
    method('+', 'getVisibility', 'id: string', 'Visibility'),
    method('+', 'closePaste', 'id: string', 'Paste'),
  ], 'facade'),
  cls('n1', 'Paste', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'User', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Language', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Visibility', GRID.x(1), GRID.y(1), [
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
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("design-pastebin")


class Paste:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Paste.id is required")
        if not name or not name.strip():
            raise ValueError("Paste.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Paste.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Paste {self.id} has invalid status={self.status}")
        log.info("[Paste.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Paste {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Paste.close] id=%s -> CLOSED", self.id)


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


class Language:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Language.id is required")
        if not name or not name.strip():
            raise ValueError("Language.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Language.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Language {self.id} has invalid status={self.status}")
        log.info("[Language.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Language {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Language.close] id=%s -> CLOSED", self.id)


class Visibility:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Visibility.id is required")
        if not name or not name.strip():
            raise ValueError("Visibility.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Visibility.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Visibility {self.id} has invalid status={self.status}")
        log.info("[Visibility.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Visibility {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Visibility.close] id=%s -> CLOSED", self.id)


class DesignPastebinService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._pastes: Dict[str, Paste] = {}
        self._users: Dict[str, User] = {}
        self._languages: Dict[str, Language] = {}
        self._visibilities: Dict[str, Visibility] = {}
        log.info("[DesignPastebinService.__init__] system ready; managing: Paste, User, Language, Visibility")

    def create_paste(self, name: str) -> Paste:
        """UML: DesignPastebinService.create_paste(name) -> Paste"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Paste name is required")
        with self._lock:
            item_id = f"PAS-{self._seq:04d}"
            self._seq += 1
            obj = Paste(item_id, cleaned)
            obj.validate()
            self._pastes[item_id] = obj
            log.info("[DesignPastebinService.create_paste] stored %s in _pastes (count=%s)", item_id, len(self._pastes))
            return obj

    def get_paste(self, item_id: str) -> Paste:
        with self._lock:
            obj = self._pastes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Paste id: {item_id}")
            log.info("[DesignPastebinService.get_paste] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_user(self, name: str) -> User:
        """UML: DesignPastebinService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[DesignPastebinService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[DesignPastebinService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_language(self, name: str) -> Language:
        """UML: DesignPastebinService.create_language(name) -> Language"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Language name is required")
        with self._lock:
            item_id = f"LAN-{self._seq:04d}"
            self._seq += 1
            obj = Language(item_id, cleaned)
            obj.validate()
            self._languages[item_id] = obj
            log.info("[DesignPastebinService.create_language] stored %s in _languages (count=%s)", item_id, len(self._languages))
            return obj

    def get_language(self, item_id: str) -> Language:
        with self._lock:
            obj = self._languages.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Language id: {item_id}")
            log.info("[DesignPastebinService.get_language] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_visibility(self, name: str) -> Visibility:
        """UML: DesignPastebinService.create_visibility(name) -> Visibility"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Visibility name is required")
        with self._lock:
            item_id = f"VIS-{self._seq:04d}"
            self._seq += 1
            obj = Visibility(item_id, cleaned)
            obj.validate()
            self._visibilities[item_id] = obj
            log.info("[DesignPastebinService.create_visibility] stored %s in _visibilities (count=%s)", item_id, len(self._visibilities))
            return obj

    def get_visibility(self, item_id: str) -> Visibility:
        with self._lock:
            obj = self._visibilities.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Visibility id: {item_id}")
            log.info("[DesignPastebinService.get_visibility] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_paste(self, item_id: str) -> Paste:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._pastes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Paste id: {item_id}")
            log.info("[DesignPastebinService.close_paste] closing %s via Paste.close()", item_id)
            obj.close()
            return obj

    def list_active_pastes(self) -> List[Paste]:
        with self._lock:
            active = [o for o in self._pastes.values() if o.status == "ACTIVE"]
            log.info("[DesignPastebinService.list_active_pastes] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct DesignPastebinService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = DesignPastebinService()

    log.info("========== STEP 2: Create primary Paste objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_paste("alpha-paste")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_paste("beta-paste")

    log.info("========== STEP 3: Create User (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_user("sample-user")

    log.info("========== STEP 4: Create Language (UML class) ==========")
    system.create_language("sample-language")

    log.info("========== STEP 5: Create Visibility (UML class) ==========")
    system.create_visibility("sample-visibility")

    log.info("========== STEP 6: Inspect active Paste list ==========")
    system.list_active_pastes()

    log.info("========== STEP 7: Close first Paste ==========")
    system.close_paste(first.id)

    log.info("========== STEP 8: Expected failure - close again ==========")
    try:
        system.close_paste(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Paste.close: %s", err)

    log.info("========== STEP 9: Expected failure - missing id ==========")
    try:
        system.get_paste("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_paste: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_pastes()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Paste {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Paste(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Paste.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Paste.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Paste.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Paste " + id + " invalid status");
    }
    System.out.println("[Paste.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Paste " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Paste.close] id=" + id + " -> CLOSED");
  }
}


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


class Language {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Language(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Language.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Language.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Language.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Language " + id + " invalid status");
    }
    System.out.println("[Language.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Language " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Language.close] id=" + id + " -> CLOSED");
  }
}


class Visibility {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Visibility(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Visibility.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Visibility.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Visibility.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Visibility " + id + " invalid status");
    }
    System.out.println("[Visibility.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Visibility " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Visibility.close] id=" + id + " -> CLOSED");
  }
}

public class DesignPastebinService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Paste> pastes = new LinkedHashMap<>();
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Language> languages = new LinkedHashMap<>();
  private final Map<String, Visibility> visibilities = new LinkedHashMap<>();

  public DesignPastebinService() {
    System.out.println("[DesignPastebinService.__init__] system ready");
  }

  public Paste createPaste(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Paste name required");
    }
    lock.lock();
    try {
      String id = String.format("PAS-%04d", seq++);
      Paste obj = new Paste(id, name.trim());
      obj.validate();
      pastes.put(id, obj);
      System.out.println("[DesignPastebinService.createPaste] stored " + id + " count=" + pastes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Paste getPaste(String id) {
    lock.lock();
    try {
      Paste obj = pastes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Paste id: " + id);
      }
      System.out.println("[DesignPastebinService.getPaste] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
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
      System.out.println("[DesignPastebinService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[DesignPastebinService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Language createLanguage(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Language name required");
    }
    lock.lock();
    try {
      String id = String.format("LAN-%04d", seq++);
      Language obj = new Language(id, name.trim());
      obj.validate();
      languages.put(id, obj);
      System.out.println("[DesignPastebinService.createLanguage] stored " + id + " count=" + languages.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Language getLanguage(String id) {
    lock.lock();
    try {
      Language obj = languages.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Language id: " + id);
      }
      System.out.println("[DesignPastebinService.getLanguage] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Visibility createVisibility(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Visibility name required");
    }
    lock.lock();
    try {
      String id = String.format("VIS-%04d", seq++);
      Visibility obj = new Visibility(id, name.trim());
      obj.validate();
      visibilities.put(id, obj);
      System.out.println("[DesignPastebinService.createVisibility] stored " + id + " count=" + visibilities.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Visibility getVisibility(String id) {
    lock.lock();
    try {
      Visibility obj = visibilities.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Visibility id: " + id);
      }
      System.out.println("[DesignPastebinService.getVisibility] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Paste closePaste(String id) {
    lock.lock();
    try {
      Paste obj = pastes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Paste id: " + id);
      }
      System.out.println("[DesignPastebinService.closePaste] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Paste> listActivePastes() {
    lock.lock();
    try {
      List<Paste> out = new ArrayList<>();
      for (Paste o : pastes.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[DesignPastebinService.listActivePastes] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct DesignPastebinService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    DesignPastebinService system = new DesignPastebinService();
    System.out.println("========== STEP 2: Create Paste objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Paste first = system.createPaste("alpha-paste");
    system.createPaste("beta-paste");
    System.out.println("========== STEP 3: Create User ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createUser("sample-user");
    System.out.println("========== STEP 4: Create Language ==========");
    system.createLanguage("sample-language");
    System.out.println("========== STEP 5: Create Visibility ==========");
    system.createVisibility("sample-visibility");
    System.out.println("========== Inspect active list ==========");
    system.listActivePastes();
    System.out.println("========== Close first Paste ==========");
    system.closePaste(first.getId());
    try {
      system.closePaste(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getPaste("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Paste {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Paste.id required')
    }

    if (!name?.trim()) {
      throw new Error('Paste.name required')
    }
    console.log(\`[Paste.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Paste \${this.id} invalid status\`)
    }
    console.log(\`[Paste.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Paste \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Paste.close] id=\${this.id} -> CLOSED\`)
  }
}


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


class Language {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Language.id required')
    }

    if (!name?.trim()) {
      throw new Error('Language.name required')
    }
    console.log(\`[Language.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Language \${this.id} invalid status\`)
    }
    console.log(\`[Language.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Language \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Language.close] id=\${this.id} -> CLOSED\`)
  }
}


class Visibility {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Visibility.id required')
    }

    if (!name?.trim()) {
      throw new Error('Visibility.name required')
    }
    console.log(\`[Visibility.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Visibility \${this.id} invalid status\`)
    }
    console.log(\`[Visibility.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Visibility \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Visibility.close] id=\${this.id} -> CLOSED\`)
  }
}

class DesignPastebinService {
  private seq = 1
  private pastes = new Map<string, Paste>()
  private users = new Map<string, User>()
  private languages = new Map<string, Language>()
  private visibilities = new Map<string, Visibility>()
  constructor() {
    console.log('[DesignPastebinService.__init__] system ready')
  }

  createPaste(name: string): Paste {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Paste name required')
    }
    const id = \`PAS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Paste(id, cleaned)
    obj.validate()
    this.pastes.set(id, obj)
    console.log(\`[DesignPastebinService.createPaste] stored \${id} count=\${this.pastes.size}\`)
    return obj
  }

  getPaste(id: string): Paste {
    const obj = this.pastes.get(id)
    if (!obj) {
      throw new Error(\`unknown Paste id: \${id}\`)
    }
    console.log(\`[DesignPastebinService.getPaste] found id=\${obj.id}\`)
    return obj
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
    console.log(\`[DesignPastebinService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[DesignPastebinService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createLanguage(name: string): Language {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Language name required')
    }
    const id = \`LAN-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Language(id, cleaned)
    obj.validate()
    this.languages.set(id, obj)
    console.log(\`[DesignPastebinService.createLanguage] stored \${id} count=\${this.languages.size}\`)
    return obj
  }

  getLanguage(id: string): Language {
    const obj = this.languages.get(id)
    if (!obj) {
      throw new Error(\`unknown Language id: \${id}\`)
    }
    console.log(\`[DesignPastebinService.getLanguage] found id=\${obj.id}\`)
    return obj
  }

  createVisibility(name: string): Visibility {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Visibility name required')
    }
    const id = \`VIS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Visibility(id, cleaned)
    obj.validate()
    this.visibilities.set(id, obj)
    console.log(\`[DesignPastebinService.createVisibility] stored \${id} count=\${this.visibilities.size}\`)
    return obj
  }

  getVisibility(id: string): Visibility {
    const obj = this.visibilities.get(id)
    if (!obj) {
      throw new Error(\`unknown Visibility id: \${id}\`)
    }
    console.log(\`[DesignPastebinService.getVisibility] found id=\${obj.id}\`)
    return obj
  }

  closePaste(id: string): Paste {
    const obj = this.getPaste(id)
    console.log(\`[DesignPastebinService.closePaste] closing \${id}\`)
    obj.close()
    return obj
  }

  listActivePastes(): Paste[] {
    const active = [...this.pastes.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[DesignPastebinService.listActivePastes] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct DesignPastebinService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new DesignPastebinService()
  console.log('========== STEP 2: Create Paste objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createPaste('alpha-paste')
  system.createPaste('beta-paste')
  console.log('========== STEP 3: Create User ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createUser('sample-user')
  console.log('========== STEP 4: Create Language ==========')
  system.createLanguage('sample-language')
  console.log('========== STEP 5: Create Visibility ==========')
  system.createVisibility('sample-visibility')
  system.listActivePastes()
  console.log('========== Close first Paste ==========')
  system.closePaste(first.id)
  try {
    system.closePaste(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getPaste('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Paste {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Paste(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Paste requires id and name");
    }
    cout << "[Paste.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Paste invalid status");
    }
    cout << "[Paste.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Paste cannot close");
    }
    status_ = "CLOSED";
    cout << "[Paste.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


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


class Language {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Language(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Language requires id and name");
    }
    cout << "[Language.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Language invalid status");
    }
    cout << "[Language.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Language cannot close");
    }
    status_ = "CLOSED";
    cout << "[Language.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Visibility {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Visibility(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Visibility requires id and name");
    }
    cout << "[Visibility.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Visibility invalid status");
    }
    cout << "[Visibility.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Visibility cannot close");
    }
    status_ = "CLOSED";
    cout << "[Visibility.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class DesignPastebinService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Paste> pastes_;
  unordered_map<string, User> users_;
  unordered_map<string, Language> languages_;
  unordered_map<string, Visibility> visibilities_;
public:
  DesignPastebinService() {
    cout << "[DesignPastebinService.__init__] system ready" << endl;
  }

  Paste createPaste(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Paste name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PAS-%04d", seq_++);
    Paste obj{buf, name};
    obj.validate();
    pastes_.emplace(obj.id(), obj);
    cout << "[DesignPastebinService.createPaste] stored " << obj.id() << endl;
    return obj;
  }

  Paste getPaste(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = pastes_.find(id);
    if (it == pastes_.end()) {
      throw out_of_range("unknown Paste id");
    }
    cout << "[DesignPastebinService.getPaste] found " << id << endl;
    return it->second;
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
    cout << "[DesignPastebinService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[DesignPastebinService.getUser] found " << id << endl;
    return it->second;
  }

  Language createLanguage(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Language name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LAN-%04d", seq_++);
    Language obj{buf, name};
    obj.validate();
    languages_.emplace(obj.id(), obj);
    cout << "[DesignPastebinService.createLanguage] stored " << obj.id() << endl;
    return obj;
  }

  Language getLanguage(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = languages_.find(id);
    if (it == languages_.end()) {
      throw out_of_range("unknown Language id");
    }
    cout << "[DesignPastebinService.getLanguage] found " << id << endl;
    return it->second;
  }

  Visibility createVisibility(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Visibility name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "VIS-%04d", seq_++);
    Visibility obj{buf, name};
    obj.validate();
    visibilities_.emplace(obj.id(), obj);
    cout << "[DesignPastebinService.createVisibility] stored " << obj.id() << endl;
    return obj;
  }

  Visibility getVisibility(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = visibilities_.find(id);
    if (it == visibilities_.end()) {
      throw out_of_range("unknown Visibility id");
    }
    cout << "[DesignPastebinService.getVisibility] found " << id << endl;
    return it->second;
  }

  Paste closePaste(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = pastes_.find(id);
    if (it == pastes_.end()) {
      throw out_of_range("unknown Paste");
    }
    cout << "[DesignPastebinService.closePaste] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct DesignPastebinService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  DesignPastebinService system;
  cout << "========== STEP 2: Create Paste ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createPaste("alpha-paste");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createPaste("beta-paste");
  system.createUser("sample-user");
  system.createLanguage("sample-language");
  system.createVisibility("sample-visibility");
  system.closePaste(first.id());
  try {
    system.closePaste(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getPaste("MISSING-ID");
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

type Paste struct {
  ID     string
  Name   string
  Status string
}

func NewPaste(id, name string) (*Paste, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Paste requires id and name")
  }
  obj := &Paste{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Paste.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Paste) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Paste invalid status")
  }
  fmt.Printf("[Paste.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Paste) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Paste %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Paste.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


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


type Language struct {
  ID     string
  Name   string
  Status string
}

func NewLanguage(id, name string) (*Language, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Language requires id and name")
  }
  obj := &Language{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Language.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Language) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Language invalid status")
  }
  fmt.Printf("[Language.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Language) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Language %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Language.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Visibility struct {
  ID     string
  Name   string
  Status string
}

func NewVisibility(id, name string) (*Visibility, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Visibility requires id and name")
  }
  obj := &Visibility{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Visibility.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Visibility) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Visibility invalid status")
  }
  fmt.Printf("[Visibility.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Visibility) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Visibility %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Visibility.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type DesignPastebinService struct {
  mu  sync.Mutex
  seq int
  pastes map[string]*Paste
  users map[string]*User
  languages map[string]*Language
  visibilities map[string]*Visibility
}

func NewDesignPastebinService() *DesignPastebinService {
  fmt.Println("[DesignPastebinService.__init__] system ready")
  return &DesignPastebinService{
    seq: 1,
    pastes: map[string]*Paste{},
    users: map[string]*User{},
    languages: map[string]*Language{},
    visibilities: map[string]*Visibility{},
  }
}

func (s *DesignPastebinService) CreatePaste(name string) (*Paste, error) {
  if name == "" {
    return nil, fmt.Errorf("Paste name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PAS-%04d", s.seq)
  s.seq++
  obj, err := NewPaste(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.pastes[id] = obj
  fmt.Printf("[DesignPastebinService.CreatePaste] stored %s\\n", id)
  return obj, nil
}

func (s *DesignPastebinService) GetPaste(id string) (*Paste, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.pastes[id]
  if !ok {
    return nil, fmt.Errorf("unknown Paste id: %s", id)
  }
  fmt.Printf("[DesignPastebinService.GetPaste] found %s\\n", id)
  return obj, nil
}

func (s *DesignPastebinService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[DesignPastebinService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *DesignPastebinService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[DesignPastebinService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *DesignPastebinService) CreateLanguage(name string) (*Language, error) {
  if name == "" {
    return nil, fmt.Errorf("Language name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LAN-%04d", s.seq)
  s.seq++
  obj, err := NewLanguage(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.languages[id] = obj
  fmt.Printf("[DesignPastebinService.CreateLanguage] stored %s\\n", id)
  return obj, nil
}

func (s *DesignPastebinService) GetLanguage(id string) (*Language, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.languages[id]
  if !ok {
    return nil, fmt.Errorf("unknown Language id: %s", id)
  }
  fmt.Printf("[DesignPastebinService.GetLanguage] found %s\\n", id)
  return obj, nil
}

func (s *DesignPastebinService) CreateVisibility(name string) (*Visibility, error) {
  if name == "" {
    return nil, fmt.Errorf("Visibility name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("VIS-%04d", s.seq)
  s.seq++
  obj, err := NewVisibility(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.visibilities[id] = obj
  fmt.Printf("[DesignPastebinService.CreateVisibility] stored %s\\n", id)
  return obj, nil
}

func (s *DesignPastebinService) GetVisibility(id string) (*Visibility, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.visibilities[id]
  if !ok {
    return nil, fmt.Errorf("unknown Visibility id: %s", id)
  }
  fmt.Printf("[DesignPastebinService.GetVisibility] found %s\\n", id)
  return obj, nil
}

func (s *DesignPastebinService) ClosePaste(id string) (*Paste, error) {
  obj, err := s.GetPaste(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[DesignPastebinService.ClosePaste] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct DesignPastebinService ==========")
  system := NewDesignPastebinService()
  fmt.Println("========== STEP 2: Create Paste ==========")
  first, _ := system.CreatePaste("alpha-paste")
  system.CreatePaste("beta-paste")
  system.CreateUser("sample-user")
  system.CreateLanguage("sample-language")
  system.CreateVisibility("sample-visibility")
  system.ClosePaste(first.ID)
  if _, err := system.ClosePaste(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetPaste("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Paste {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Paste(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Paste requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Paste.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Paste invalid status");
    }
    Console.WriteLine("[Paste.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Paste " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Paste.close] id=" + Id + " -> CLOSED");
  }
}


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


sealed class Language {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Language(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Language requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Language.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Language invalid status");
    }
    Console.WriteLine("[Language.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Language " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Language.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Visibility {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Visibility(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Visibility requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Visibility.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Visibility invalid status");
    }
    Console.WriteLine("[Visibility.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Visibility " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Visibility.close] id=" + Id + " -> CLOSED");
  }
}

sealed class DesignPastebinService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Paste> _pastes = new();
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Language> _languages = new();
  private readonly Dictionary<string, Visibility> _visibilities = new();
  public DesignPastebinService() {
    Console.WriteLine("[DesignPastebinService.__init__] system ready");
  }

  public Paste CreatePaste(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Paste name required");
    }
    lock (_gate) {
      var id = string.Format("PAS-{0:D4}", _seq++);
      var obj = new Paste(id, name.Trim());
      obj.Validate();
      _pastes[id] = obj;
      Console.WriteLine("[DesignPastebinService.CreatePaste] stored " + id);
      return obj;
    }
  }

  public Paste GetPaste(string id) {
    lock (_gate) {
      if (!_pastes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Paste id: " + id);
      }
      Console.WriteLine("[DesignPastebinService.GetPaste] found " + id);
      return obj;
    }
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
      Console.WriteLine("[DesignPastebinService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[DesignPastebinService.GetUser] found " + id);
      return obj;
    }
  }

  public Language CreateLanguage(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Language name required");
    }
    lock (_gate) {
      var id = string.Format("LAN-{0:D4}", _seq++);
      var obj = new Language(id, name.Trim());
      obj.Validate();
      _languages[id] = obj;
      Console.WriteLine("[DesignPastebinService.CreateLanguage] stored " + id);
      return obj;
    }
  }

  public Language GetLanguage(string id) {
    lock (_gate) {
      if (!_languages.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Language id: " + id);
      }
      Console.WriteLine("[DesignPastebinService.GetLanguage] found " + id);
      return obj;
    }
  }

  public Visibility CreateVisibility(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Visibility name required");
    }
    lock (_gate) {
      var id = string.Format("VIS-{0:D4}", _seq++);
      var obj = new Visibility(id, name.Trim());
      obj.Validate();
      _visibilities[id] = obj;
      Console.WriteLine("[DesignPastebinService.CreateVisibility] stored " + id);
      return obj;
    }
  }

  public Visibility GetVisibility(string id) {
    lock (_gate) {
      if (!_visibilities.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Visibility id: " + id);
      }
      Console.WriteLine("[DesignPastebinService.GetVisibility] found " + id);
      return obj;
    }
  }

  public Paste ClosePaste(string id) {
    var obj = GetPaste(id);
    Console.WriteLine("[DesignPastebinService.ClosePaste] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct DesignPastebinService ==========");
    var system = new DesignPastebinService();
    Console.WriteLine("========== STEP 2: Create Paste ==========");
    var first = system.CreatePaste("alpha-paste");
    system.CreatePaste("beta-paste");
    system.CreateUser("sample-user");
    system.CreateLanguage("sample-language");
    system.CreateVisibility("sample-visibility");
    system.ClosePaste(first.Id);
    try {
      system.ClosePaste(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetPaste("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const designPastebinSolution: ProblemSolution = {
  slug: 'design-pastebin',
  title: 'Pastebin / Code Snippet Sharing - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a text/code snippet sharing service like Pastebin — create, share, and expire pastes with syntax highlighting. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Create a paste with title, content, language, and optional expiry',
      'Generate a unique short URL for each paste',
      'Syntax highlighting for 50+ programming languages',
      'Public, unlisted, and private visibility settings',
      'View, fork, and delete pastes',
      'User accounts to manage their own pastes',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Create a paste with title, content, language, and optional expiry?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Generate a unique short URL for each paste?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Syntax highlighting for 50+ programming languages?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Public, unlisted, and private visibility settings?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'View, fork, and delete pastes?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. DesignPastebinService is the facade stereotype. Paste, User, Language, Visibility are concrete domain classes with id/name/status and validate/close.',
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
          'Construct DesignPastebinService.',
          'createPaste twice and create the related UML classes.',
          'closePaste once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'DesignPastebinService', responsibility: 'UML facade - orchestrates Pastebin / Code Snippet Sharing.', keyMembers: ['create*', 'get*', 'closePaste'] },
    { name: 'Paste', responsibility: 'UML class - domain object for Pastebin / Code Snippet Sharing.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'User', responsibility: 'UML class - domain object for Pastebin / Code Snippet Sharing.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Language', responsibility: 'UML class - domain object for Pastebin / Code Snippet Sharing.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Visibility', responsibility: 'UML class - domain object for Pastebin / Code Snippet Sharing.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from DesignPastebinService to Paste, User, Language, Visibility. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on DesignPastebinService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'DesignPastebinService', responsibility: 'UML facade - orchestrates Pastebin / Code Snippet Sharing.', keyMembers: ['create*', 'get*', 'closePaste'] },
    { name: 'Paste', responsibility: 'UML class - domain object for Pastebin / Code Snippet Sharing.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'User', responsibility: 'UML class - domain object for Pastebin / Code Snippet Sharing.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Language', responsibility: 'UML class - domain object for Pastebin / Code Snippet Sharing.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Visibility', responsibility: 'UML class - domain object for Pastebin / Code Snippet Sharing.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'DesignPastebinService exposes create/get/close and owns composed collections.' },
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
      'main constructs DesignPastebinService, creates UML domain objects, closes the primary Paste, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct DesignPastebinService.',
      'createPaste for alpha and beta.',
      'create remaining UML classes.',
      'closePaste(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createPaste("alpha..."); closePaste(id)',
        output: '[Paste.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closePaste(alreadyClosed) or getPaste("MISSING-ID")',
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
