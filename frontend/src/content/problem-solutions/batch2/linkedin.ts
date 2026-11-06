import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'LinkedinService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_profiles', 'Map<string, Profile>'),
    attr('-', '_connections', 'Map<string, Connection>'),
    attr('-', '_posts', 'Map<string, Post>'),
    attr('-', '_jobs', 'Map<string, Job>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createProfile', 'name: string', 'Profile'),
    method('+', 'createConnection', 'name: string', 'Connection'),
    method('+', 'createPost', 'name: string', 'Post'),
    method('+', 'createJob', 'name: string', 'Job'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getProfile', 'id: string', 'Profile'),
    method('+', 'getConnection', 'id: string', 'Connection'),
    method('+', 'getPost', 'id: string', 'Post'),
    method('+', 'getJob', 'id: string', 'Job'),
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
  cls('n2', 'Profile', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Connection', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Post', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Job', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("linkedin")


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


class Profile:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Profile.id is required")
        if not name or not name.strip():
            raise ValueError("Profile.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Profile.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Profile {self.id} has invalid status={self.status}")
        log.info("[Profile.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Profile {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Profile.close] id=%s -> CLOSED", self.id)


class Connection:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Connection.id is required")
        if not name or not name.strip():
            raise ValueError("Connection.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Connection.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Connection {self.id} has invalid status={self.status}")
        log.info("[Connection.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Connection {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Connection.close] id=%s -> CLOSED", self.id)


class Post:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Post.id is required")
        if not name or not name.strip():
            raise ValueError("Post.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Post.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Post {self.id} has invalid status={self.status}")
        log.info("[Post.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Post {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Post.close] id=%s -> CLOSED", self.id)


class Job:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Job.id is required")
        if not name or not name.strip():
            raise ValueError("Job.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Job.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Job {self.id} has invalid status={self.status}")
        log.info("[Job.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Job {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Job.close] id=%s -> CLOSED", self.id)


class LinkedinService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._profiles: Dict[str, Profile] = {}
        self._connections: Dict[str, Connection] = {}
        self._posts: Dict[str, Post] = {}
        self._jobs: Dict[str, Job] = {}
        log.info("[LinkedinService.__init__] system ready; managing: User, Profile, Connection, Post, Job")

    def create_user(self, name: str) -> User:
        """UML: LinkedinService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[LinkedinService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[LinkedinService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_profile(self, name: str) -> Profile:
        """UML: LinkedinService.create_profile(name) -> Profile"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Profile name is required")
        with self._lock:
            item_id = f"PRO-{self._seq:04d}"
            self._seq += 1
            obj = Profile(item_id, cleaned)
            obj.validate()
            self._profiles[item_id] = obj
            log.info("[LinkedinService.create_profile] stored %s in _profiles (count=%s)", item_id, len(self._profiles))
            return obj

    def get_profile(self, item_id: str) -> Profile:
        with self._lock:
            obj = self._profiles.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Profile id: {item_id}")
            log.info("[LinkedinService.get_profile] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_connection(self, name: str) -> Connection:
        """UML: LinkedinService.create_connection(name) -> Connection"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Connection name is required")
        with self._lock:
            item_id = f"CON-{self._seq:04d}"
            self._seq += 1
            obj = Connection(item_id, cleaned)
            obj.validate()
            self._connections[item_id] = obj
            log.info("[LinkedinService.create_connection] stored %s in _connections (count=%s)", item_id, len(self._connections))
            return obj

    def get_connection(self, item_id: str) -> Connection:
        with self._lock:
            obj = self._connections.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Connection id: {item_id}")
            log.info("[LinkedinService.get_connection] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_post(self, name: str) -> Post:
        """UML: LinkedinService.create_post(name) -> Post"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Post name is required")
        with self._lock:
            item_id = f"POS-{self._seq:04d}"
            self._seq += 1
            obj = Post(item_id, cleaned)
            obj.validate()
            self._posts[item_id] = obj
            log.info("[LinkedinService.create_post] stored %s in _posts (count=%s)", item_id, len(self._posts))
            return obj

    def get_post(self, item_id: str) -> Post:
        with self._lock:
            obj = self._posts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Post id: {item_id}")
            log.info("[LinkedinService.get_post] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_job(self, name: str) -> Job:
        """UML: LinkedinService.create_job(name) -> Job"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Job name is required")
        with self._lock:
            item_id = f"JOB-{self._seq:04d}"
            self._seq += 1
            obj = Job(item_id, cleaned)
            obj.validate()
            self._jobs[item_id] = obj
            log.info("[LinkedinService.create_job] stored %s in _jobs (count=%s)", item_id, len(self._jobs))
            return obj

    def get_job(self, item_id: str) -> Job:
        with self._lock:
            obj = self._jobs.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Job id: {item_id}")
            log.info("[LinkedinService.get_job] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[LinkedinService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[LinkedinService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct LinkedinService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = LinkedinService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Profile (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_profile("sample-profile")

    log.info("========== STEP 4: Create Connection (UML class) ==========")
    system.create_connection("sample-connection")

    log.info("========== STEP 5: Create Post (UML class) ==========")
    system.create_post("sample-post")

    log.info("========== STEP 6: Create Job (UML class) ==========")
    system.create_job("sample-job")

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


class Profile {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Profile(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Profile.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Profile.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Profile.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Profile " + id + " invalid status");
    }
    System.out.println("[Profile.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Profile " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Profile.close] id=" + id + " -> CLOSED");
  }
}


class Connection {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Connection(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Connection.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Connection.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Connection.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Connection " + id + " invalid status");
    }
    System.out.println("[Connection.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Connection " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Connection.close] id=" + id + " -> CLOSED");
  }
}


class Post {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Post(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Post.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Post.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Post.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Post " + id + " invalid status");
    }
    System.out.println("[Post.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Post " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Post.close] id=" + id + " -> CLOSED");
  }
}


class Job {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Job(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Job.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Job.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Job.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Job " + id + " invalid status");
    }
    System.out.println("[Job.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Job " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Job.close] id=" + id + " -> CLOSED");
  }
}

public class LinkedinService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Profile> profiles = new LinkedHashMap<>();
  private final Map<String, Connection> connections = new LinkedHashMap<>();
  private final Map<String, Post> posts = new LinkedHashMap<>();
  private final Map<String, Job> jobs = new LinkedHashMap<>();

  public LinkedinService() {
    System.out.println("[LinkedinService.__init__] system ready");
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
      System.out.println("[LinkedinService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[LinkedinService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Profile createProfile(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Profile name required");
    }
    lock.lock();
    try {
      String id = String.format("PRO-%04d", seq++);
      Profile obj = new Profile(id, name.trim());
      obj.validate();
      profiles.put(id, obj);
      System.out.println("[LinkedinService.createProfile] stored " + id + " count=" + profiles.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Profile getProfile(String id) {
    lock.lock();
    try {
      Profile obj = profiles.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Profile id: " + id);
      }
      System.out.println("[LinkedinService.getProfile] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Connection createConnection(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Connection name required");
    }
    lock.lock();
    try {
      String id = String.format("CON-%04d", seq++);
      Connection obj = new Connection(id, name.trim());
      obj.validate();
      connections.put(id, obj);
      System.out.println("[LinkedinService.createConnection] stored " + id + " count=" + connections.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Connection getConnection(String id) {
    lock.lock();
    try {
      Connection obj = connections.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Connection id: " + id);
      }
      System.out.println("[LinkedinService.getConnection] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Post createPost(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Post name required");
    }
    lock.lock();
    try {
      String id = String.format("POS-%04d", seq++);
      Post obj = new Post(id, name.trim());
      obj.validate();
      posts.put(id, obj);
      System.out.println("[LinkedinService.createPost] stored " + id + " count=" + posts.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Post getPost(String id) {
    lock.lock();
    try {
      Post obj = posts.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Post id: " + id);
      }
      System.out.println("[LinkedinService.getPost] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Job createJob(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Job name required");
    }
    lock.lock();
    try {
      String id = String.format("JOB-%04d", seq++);
      Job obj = new Job(id, name.trim());
      obj.validate();
      jobs.put(id, obj);
      System.out.println("[LinkedinService.createJob] stored " + id + " count=" + jobs.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Job getJob(String id) {
    lock.lock();
    try {
      Job obj = jobs.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Job id: " + id);
      }
      System.out.println("[LinkedinService.getJob] found id=" + obj.getId());
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
      System.out.println("[LinkedinService.closeUser] closing " + id);
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
      System.out.println("[LinkedinService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct LinkedinService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    LinkedinService system = new LinkedinService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Profile ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createProfile("sample-profile");
    System.out.println("========== STEP 4: Create Connection ==========");
    system.createConnection("sample-connection");
    System.out.println("========== STEP 5: Create Post ==========");
    system.createPost("sample-post");
    System.out.println("========== STEP 6: Create Job ==========");
    system.createJob("sample-job");
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


class Profile {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Profile.id required')
    }

    if (!name?.trim()) {
      throw new Error('Profile.name required')
    }
    console.log(\`[Profile.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Profile \${this.id} invalid status\`)
    }
    console.log(\`[Profile.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Profile \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Profile.close] id=\${this.id} -> CLOSED\`)
  }
}


class Connection {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Connection.id required')
    }

    if (!name?.trim()) {
      throw new Error('Connection.name required')
    }
    console.log(\`[Connection.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Connection \${this.id} invalid status\`)
    }
    console.log(\`[Connection.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Connection \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Connection.close] id=\${this.id} -> CLOSED\`)
  }
}


class Post {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Post.id required')
    }

    if (!name?.trim()) {
      throw new Error('Post.name required')
    }
    console.log(\`[Post.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Post \${this.id} invalid status\`)
    }
    console.log(\`[Post.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Post \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Post.close] id=\${this.id} -> CLOSED\`)
  }
}


class Job {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Job.id required')
    }

    if (!name?.trim()) {
      throw new Error('Job.name required')
    }
    console.log(\`[Job.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Job \${this.id} invalid status\`)
    }
    console.log(\`[Job.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Job \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Job.close] id=\${this.id} -> CLOSED\`)
  }
}

class LinkedinService {
  private seq = 1
  private users = new Map<string, User>()
  private profiles = new Map<string, Profile>()
  private connections = new Map<string, Connection>()
  private posts = new Map<string, Post>()
  private jobs = new Map<string, Job>()
  constructor() {
    console.log('[LinkedinService.__init__] system ready')
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
    console.log(\`[LinkedinService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[LinkedinService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createProfile(name: string): Profile {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Profile name required')
    }
    const id = \`PRO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Profile(id, cleaned)
    obj.validate()
    this.profiles.set(id, obj)
    console.log(\`[LinkedinService.createProfile] stored \${id} count=\${this.profiles.size}\`)
    return obj
  }

  getProfile(id: string): Profile {
    const obj = this.profiles.get(id)
    if (!obj) {
      throw new Error(\`unknown Profile id: \${id}\`)
    }
    console.log(\`[LinkedinService.getProfile] found id=\${obj.id}\`)
    return obj
  }

  createConnection(name: string): Connection {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Connection name required')
    }
    const id = \`CON-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Connection(id, cleaned)
    obj.validate()
    this.connections.set(id, obj)
    console.log(\`[LinkedinService.createConnection] stored \${id} count=\${this.connections.size}\`)
    return obj
  }

  getConnection(id: string): Connection {
    const obj = this.connections.get(id)
    if (!obj) {
      throw new Error(\`unknown Connection id: \${id}\`)
    }
    console.log(\`[LinkedinService.getConnection] found id=\${obj.id}\`)
    return obj
  }

  createPost(name: string): Post {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Post name required')
    }
    const id = \`POS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Post(id, cleaned)
    obj.validate()
    this.posts.set(id, obj)
    console.log(\`[LinkedinService.createPost] stored \${id} count=\${this.posts.size}\`)
    return obj
  }

  getPost(id: string): Post {
    const obj = this.posts.get(id)
    if (!obj) {
      throw new Error(\`unknown Post id: \${id}\`)
    }
    console.log(\`[LinkedinService.getPost] found id=\${obj.id}\`)
    return obj
  }

  createJob(name: string): Job {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Job name required')
    }
    const id = \`JOB-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Job(id, cleaned)
    obj.validate()
    this.jobs.set(id, obj)
    console.log(\`[LinkedinService.createJob] stored \${id} count=\${this.jobs.size}\`)
    return obj
  }

  getJob(id: string): Job {
    const obj = this.jobs.get(id)
    if (!obj) {
      throw new Error(\`unknown Job id: \${id}\`)
    }
    console.log(\`[LinkedinService.getJob] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[LinkedinService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[LinkedinService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct LinkedinService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new LinkedinService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Profile ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createProfile('sample-profile')
  console.log('========== STEP 4: Create Connection ==========')
  system.createConnection('sample-connection')
  console.log('========== STEP 5: Create Post ==========')
  system.createPost('sample-post')
  console.log('========== STEP 6: Create Job ==========')
  system.createJob('sample-job')
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


class Profile {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Profile(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Profile requires id and name");
    }
    cout << "[Profile.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Profile invalid status");
    }
    cout << "[Profile.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Profile cannot close");
    }
    status_ = "CLOSED";
    cout << "[Profile.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Connection {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Connection(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Connection requires id and name");
    }
    cout << "[Connection.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Connection invalid status");
    }
    cout << "[Connection.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Connection cannot close");
    }
    status_ = "CLOSED";
    cout << "[Connection.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Post {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Post(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Post requires id and name");
    }
    cout << "[Post.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Post invalid status");
    }
    cout << "[Post.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Post cannot close");
    }
    status_ = "CLOSED";
    cout << "[Post.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Job {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Job(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Job requires id and name");
    }
    cout << "[Job.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Job invalid status");
    }
    cout << "[Job.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Job cannot close");
    }
    status_ = "CLOSED";
    cout << "[Job.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class LinkedinService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Profile> profiles_;
  unordered_map<string, Connection> connections_;
  unordered_map<string, Post> posts_;
  unordered_map<string, Job> jobs_;
public:
  LinkedinService() {
    cout << "[LinkedinService.__init__] system ready" << endl;
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
    cout << "[LinkedinService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[LinkedinService.getUser] found " << id << endl;
    return it->second;
  }

  Profile createProfile(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Profile name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PRO-%04d", seq_++);
    Profile obj{buf, name};
    obj.validate();
    profiles_.emplace(obj.id(), obj);
    cout << "[LinkedinService.createProfile] stored " << obj.id() << endl;
    return obj;
  }

  Profile getProfile(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = profiles_.find(id);
    if (it == profiles_.end()) {
      throw out_of_range("unknown Profile id");
    }
    cout << "[LinkedinService.getProfile] found " << id << endl;
    return it->second;
  }

  Connection createConnection(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Connection name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CON-%04d", seq_++);
    Connection obj{buf, name};
    obj.validate();
    connections_.emplace(obj.id(), obj);
    cout << "[LinkedinService.createConnection] stored " << obj.id() << endl;
    return obj;
  }

  Connection getConnection(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = connections_.find(id);
    if (it == connections_.end()) {
      throw out_of_range("unknown Connection id");
    }
    cout << "[LinkedinService.getConnection] found " << id << endl;
    return it->second;
  }

  Post createPost(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Post name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "POS-%04d", seq_++);
    Post obj{buf, name};
    obj.validate();
    posts_.emplace(obj.id(), obj);
    cout << "[LinkedinService.createPost] stored " << obj.id() << endl;
    return obj;
  }

  Post getPost(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = posts_.find(id);
    if (it == posts_.end()) {
      throw out_of_range("unknown Post id");
    }
    cout << "[LinkedinService.getPost] found " << id << endl;
    return it->second;
  }

  Job createJob(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Job name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "JOB-%04d", seq_++);
    Job obj{buf, name};
    obj.validate();
    jobs_.emplace(obj.id(), obj);
    cout << "[LinkedinService.createJob] stored " << obj.id() << endl;
    return obj;
  }

  Job getJob(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = jobs_.find(id);
    if (it == jobs_.end()) {
      throw out_of_range("unknown Job id");
    }
    cout << "[LinkedinService.getJob] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[LinkedinService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct LinkedinService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  LinkedinService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createProfile("sample-profile");
  system.createConnection("sample-connection");
  system.createPost("sample-post");
  system.createJob("sample-job");
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


type Profile struct {
  ID     string
  Name   string
  Status string
}

func NewProfile(id, name string) (*Profile, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Profile requires id and name")
  }
  obj := &Profile{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Profile.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Profile) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Profile invalid status")
  }
  fmt.Printf("[Profile.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Profile) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Profile %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Profile.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Connection struct {
  ID     string
  Name   string
  Status string
}

func NewConnection(id, name string) (*Connection, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Connection requires id and name")
  }
  obj := &Connection{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Connection.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Connection) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Connection invalid status")
  }
  fmt.Printf("[Connection.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Connection) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Connection %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Connection.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Post struct {
  ID     string
  Name   string
  Status string
}

func NewPost(id, name string) (*Post, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Post requires id and name")
  }
  obj := &Post{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Post.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Post) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Post invalid status")
  }
  fmt.Printf("[Post.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Post) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Post %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Post.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Job struct {
  ID     string
  Name   string
  Status string
}

func NewJob(id, name string) (*Job, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Job requires id and name")
  }
  obj := &Job{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Job.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Job) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Job invalid status")
  }
  fmt.Printf("[Job.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Job) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Job %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Job.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type LinkedinService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  profiles map[string]*Profile
  connections map[string]*Connection
  posts map[string]*Post
  jobs map[string]*Job
}

func NewLinkedinService() *LinkedinService {
  fmt.Println("[LinkedinService.__init__] system ready")
  return &LinkedinService{
    seq: 1,
    users: map[string]*User{},
    profiles: map[string]*Profile{},
    connections: map[string]*Connection{},
    posts: map[string]*Post{},
    jobs: map[string]*Job{},
  }
}

func (s *LinkedinService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[LinkedinService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[LinkedinService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) CreateProfile(name string) (*Profile, error) {
  if name == "" {
    return nil, fmt.Errorf("Profile name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PRO-%04d", s.seq)
  s.seq++
  obj, err := NewProfile(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.profiles[id] = obj
  fmt.Printf("[LinkedinService.CreateProfile] stored %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) GetProfile(id string) (*Profile, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.profiles[id]
  if !ok {
    return nil, fmt.Errorf("unknown Profile id: %s", id)
  }
  fmt.Printf("[LinkedinService.GetProfile] found %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) CreateConnection(name string) (*Connection, error) {
  if name == "" {
    return nil, fmt.Errorf("Connection name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CON-%04d", s.seq)
  s.seq++
  obj, err := NewConnection(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.connections[id] = obj
  fmt.Printf("[LinkedinService.CreateConnection] stored %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) GetConnection(id string) (*Connection, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.connections[id]
  if !ok {
    return nil, fmt.Errorf("unknown Connection id: %s", id)
  }
  fmt.Printf("[LinkedinService.GetConnection] found %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) CreatePost(name string) (*Post, error) {
  if name == "" {
    return nil, fmt.Errorf("Post name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("POS-%04d", s.seq)
  s.seq++
  obj, err := NewPost(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.posts[id] = obj
  fmt.Printf("[LinkedinService.CreatePost] stored %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) GetPost(id string) (*Post, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.posts[id]
  if !ok {
    return nil, fmt.Errorf("unknown Post id: %s", id)
  }
  fmt.Printf("[LinkedinService.GetPost] found %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) CreateJob(name string) (*Job, error) {
  if name == "" {
    return nil, fmt.Errorf("Job name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("JOB-%04d", s.seq)
  s.seq++
  obj, err := NewJob(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.jobs[id] = obj
  fmt.Printf("[LinkedinService.CreateJob] stored %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) GetJob(id string) (*Job, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.jobs[id]
  if !ok {
    return nil, fmt.Errorf("unknown Job id: %s", id)
  }
  fmt.Printf("[LinkedinService.GetJob] found %s\\n", id)
  return obj, nil
}

func (s *LinkedinService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[LinkedinService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct LinkedinService ==========")
  system := NewLinkedinService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateProfile("sample-profile")
  system.CreateConnection("sample-connection")
  system.CreatePost("sample-post")
  system.CreateJob("sample-job")
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


sealed class Profile {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Profile(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Profile requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Profile.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Profile invalid status");
    }
    Console.WriteLine("[Profile.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Profile " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Profile.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Connection {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Connection(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Connection requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Connection.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Connection invalid status");
    }
    Console.WriteLine("[Connection.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Connection " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Connection.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Post {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Post(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Post requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Post.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Post invalid status");
    }
    Console.WriteLine("[Post.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Post " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Post.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Job {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Job(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Job requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Job.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Job invalid status");
    }
    Console.WriteLine("[Job.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Job " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Job.close] id=" + Id + " -> CLOSED");
  }
}

sealed class LinkedinService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Profile> _profiles = new();
  private readonly Dictionary<string, Connection> _connections = new();
  private readonly Dictionary<string, Post> _posts = new();
  private readonly Dictionary<string, Job> _jobs = new();
  public LinkedinService() {
    Console.WriteLine("[LinkedinService.__init__] system ready");
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
      Console.WriteLine("[LinkedinService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[LinkedinService.GetUser] found " + id);
      return obj;
    }
  }

  public Profile CreateProfile(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Profile name required");
    }
    lock (_gate) {
      var id = string.Format("PRO-{0:D4}", _seq++);
      var obj = new Profile(id, name.Trim());
      obj.Validate();
      _profiles[id] = obj;
      Console.WriteLine("[LinkedinService.CreateProfile] stored " + id);
      return obj;
    }
  }

  public Profile GetProfile(string id) {
    lock (_gate) {
      if (!_profiles.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Profile id: " + id);
      }
      Console.WriteLine("[LinkedinService.GetProfile] found " + id);
      return obj;
    }
  }

  public Connection CreateConnection(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Connection name required");
    }
    lock (_gate) {
      var id = string.Format("CON-{0:D4}", _seq++);
      var obj = new Connection(id, name.Trim());
      obj.Validate();
      _connections[id] = obj;
      Console.WriteLine("[LinkedinService.CreateConnection] stored " + id);
      return obj;
    }
  }

  public Connection GetConnection(string id) {
    lock (_gate) {
      if (!_connections.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Connection id: " + id);
      }
      Console.WriteLine("[LinkedinService.GetConnection] found " + id);
      return obj;
    }
  }

  public Post CreatePost(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Post name required");
    }
    lock (_gate) {
      var id = string.Format("POS-{0:D4}", _seq++);
      var obj = new Post(id, name.Trim());
      obj.Validate();
      _posts[id] = obj;
      Console.WriteLine("[LinkedinService.CreatePost] stored " + id);
      return obj;
    }
  }

  public Post GetPost(string id) {
    lock (_gate) {
      if (!_posts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Post id: " + id);
      }
      Console.WriteLine("[LinkedinService.GetPost] found " + id);
      return obj;
    }
  }

  public Job CreateJob(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Job name required");
    }
    lock (_gate) {
      var id = string.Format("JOB-{0:D4}", _seq++);
      var obj = new Job(id, name.Trim());
      obj.Validate();
      _jobs[id] = obj;
      Console.WriteLine("[LinkedinService.CreateJob] stored " + id);
      return obj;
    }
  }

  public Job GetJob(string id) {
    lock (_gate) {
      if (!_jobs.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Job id: " + id);
      }
      Console.WriteLine("[LinkedinService.GetJob] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[LinkedinService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct LinkedinService ==========");
    var system = new LinkedinService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateProfile("sample-profile");
    system.CreateConnection("sample-connection");
    system.CreatePost("sample-post");
    system.CreateJob("sample-job");
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

export const linkedinSolution: ProblemSolution = {
  slug: 'linkedin',
  title: 'LinkedIn / Professional Network - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a professional networking platform like LinkedIn — profiles, connections, feed, job postings, and messaging. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'User profiles with experience, education, skills, and endorsements',
      'Send and accept connection requests (1st/2nd/3rd degree)',
      'News feed showing posts and activity from connections',
      'Job postings: companies post jobs, users apply',
      'Skill endorsements and recommendations',
      'Direct messaging between connected users',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'User profiles with experience, education, skills, and endorsements?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Send and accept connection requests (1st/2nd/3rd degree)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'News feed showing posts and activity from connections?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Job postings: companies post jobs, users apply?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Skill endorsements and recommendations?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. LinkedinService is the facade stereotype. User, Profile, Connection, Post, Job are concrete domain classes with id/name/status and validate/close.',
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
          'Construct LinkedinService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'LinkedinService', responsibility: 'UML facade - orchestrates LinkedIn / Professional Network.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Profile', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Connection', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Post', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Job', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from LinkedinService to User, Profile, Connection, Post, Job. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on LinkedinService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'LinkedinService', responsibility: 'UML facade - orchestrates LinkedIn / Professional Network.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Profile', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Connection', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Post', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Job', responsibility: 'UML class - domain object for LinkedIn / Professional Network.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'LinkedinService exposes create/get/close and owns composed collections.' },
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
      'main constructs LinkedinService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct LinkedinService.',
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
