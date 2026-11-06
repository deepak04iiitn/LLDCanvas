import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'NetflixService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_profiles', 'Map<string, Profile>'),
    attr('-', '_subscriptions', 'Map<string, Subscription>'),
    attr('-', '_contents', 'Map<string, Content>'),
    attr('-', '_video_assets', 'Map<string, VideoAsset>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createProfile', 'name: string', 'Profile'),
    method('+', 'createSubscription', 'name: string', 'Subscription'),
    method('+', 'createContent', 'name: string', 'Content'),
    method('+', 'createVideoAsset', 'name: string', 'VideoAsset'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getProfile', 'id: string', 'Profile'),
    method('+', 'getSubscription', 'id: string', 'Subscription'),
    method('+', 'getContent', 'id: string', 'Content'),
    method('+', 'getVideoAsset', 'id: string', 'VideoAsset'),
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
  cls('n3', 'Subscription', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Content', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'VideoAsset', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("netflix")


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


class Subscription:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Subscription.id is required")
        if not name or not name.strip():
            raise ValueError("Subscription.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Subscription.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Subscription {self.id} has invalid status={self.status}")
        log.info("[Subscription.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Subscription {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Subscription.close] id=%s -> CLOSED", self.id)


class Content:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Content.id is required")
        if not name or not name.strip():
            raise ValueError("Content.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Content.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Content {self.id} has invalid status={self.status}")
        log.info("[Content.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Content {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Content.close] id=%s -> CLOSED", self.id)


class VideoAsset:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("VideoAsset.id is required")
        if not name or not name.strip():
            raise ValueError("VideoAsset.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[VideoAsset.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"VideoAsset {self.id} has invalid status={self.status}")
        log.info("[VideoAsset.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"VideoAsset {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[VideoAsset.close] id=%s -> CLOSED", self.id)


class NetflixService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._profiles: Dict[str, Profile] = {}
        self._subscriptions: Dict[str, Subscription] = {}
        self._contents: Dict[str, Content] = {}
        self._video_assets: Dict[str, VideoAsset] = {}
        log.info("[NetflixService.__init__] system ready; managing: User, Profile, Subscription, Content, VideoAsset")

    def create_user(self, name: str) -> User:
        """UML: NetflixService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[NetflixService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[NetflixService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_profile(self, name: str) -> Profile:
        """UML: NetflixService.create_profile(name) -> Profile"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Profile name is required")
        with self._lock:
            item_id = f"PRO-{self._seq:04d}"
            self._seq += 1
            obj = Profile(item_id, cleaned)
            obj.validate()
            self._profiles[item_id] = obj
            log.info("[NetflixService.create_profile] stored %s in _profiles (count=%s)", item_id, len(self._profiles))
            return obj

    def get_profile(self, item_id: str) -> Profile:
        with self._lock:
            obj = self._profiles.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Profile id: {item_id}")
            log.info("[NetflixService.get_profile] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_subscription(self, name: str) -> Subscription:
        """UML: NetflixService.create_subscription(name) -> Subscription"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Subscription name is required")
        with self._lock:
            item_id = f"SUB-{self._seq:04d}"
            self._seq += 1
            obj = Subscription(item_id, cleaned)
            obj.validate()
            self._subscriptions[item_id] = obj
            log.info("[NetflixService.create_subscription] stored %s in _subscriptions (count=%s)", item_id, len(self._subscriptions))
            return obj

    def get_subscription(self, item_id: str) -> Subscription:
        with self._lock:
            obj = self._subscriptions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Subscription id: {item_id}")
            log.info("[NetflixService.get_subscription] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_content(self, name: str) -> Content:
        """UML: NetflixService.create_content(name) -> Content"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Content name is required")
        with self._lock:
            item_id = f"CON-{self._seq:04d}"
            self._seq += 1
            obj = Content(item_id, cleaned)
            obj.validate()
            self._contents[item_id] = obj
            log.info("[NetflixService.create_content] stored %s in _contents (count=%s)", item_id, len(self._contents))
            return obj

    def get_content(self, item_id: str) -> Content:
        with self._lock:
            obj = self._contents.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Content id: {item_id}")
            log.info("[NetflixService.get_content] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_video_asset(self, name: str) -> VideoAsset:
        """UML: NetflixService.create_video_asset(name) -> VideoAsset"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("VideoAsset name is required")
        with self._lock:
            item_id = f"VID-{self._seq:04d}"
            self._seq += 1
            obj = VideoAsset(item_id, cleaned)
            obj.validate()
            self._video_assets[item_id] = obj
            log.info("[NetflixService.create_video_asset] stored %s in _video_assets (count=%s)", item_id, len(self._video_assets))
            return obj

    def get_video_asset(self, item_id: str) -> VideoAsset:
        with self._lock:
            obj = self._video_assets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown VideoAsset id: {item_id}")
            log.info("[NetflixService.get_video_asset] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[NetflixService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[NetflixService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct NetflixService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = NetflixService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Profile (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_profile("sample-profile")

    log.info("========== STEP 4: Create Subscription (UML class) ==========")
    system.create_subscription("sample-subscription")

    log.info("========== STEP 5: Create Content (UML class) ==========")
    system.create_content("sample-content")

    log.info("========== STEP 6: Create VideoAsset (UML class) ==========")
    system.create_video_asset("sample-video_asset")

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


class Subscription {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Subscription(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Subscription.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Subscription.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Subscription.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Subscription " + id + " invalid status");
    }
    System.out.println("[Subscription.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Subscription " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Subscription.close] id=" + id + " -> CLOSED");
  }
}


class Content {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Content(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Content.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Content.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Content.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Content " + id + " invalid status");
    }
    System.out.println("[Content.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Content " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Content.close] id=" + id + " -> CLOSED");
  }
}


class VideoAsset {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  VideoAsset(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("VideoAsset.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("VideoAsset.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[VideoAsset.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("VideoAsset " + id + " invalid status");
    }
    System.out.println("[VideoAsset.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("VideoAsset " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[VideoAsset.close] id=" + id + " -> CLOSED");
  }
}

public class NetflixService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Profile> profiles = new LinkedHashMap<>();
  private final Map<String, Subscription> subscriptions = new LinkedHashMap<>();
  private final Map<String, Content> contents = new LinkedHashMap<>();
  private final Map<String, VideoAsset> video_assets = new LinkedHashMap<>();

  public NetflixService() {
    System.out.println("[NetflixService.__init__] system ready");
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
      System.out.println("[NetflixService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[NetflixService.getUser] found id=" + obj.getId());
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
      System.out.println("[NetflixService.createProfile] stored " + id + " count=" + profiles.size());
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
      System.out.println("[NetflixService.getProfile] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Subscription createSubscription(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Subscription name required");
    }
    lock.lock();
    try {
      String id = String.format("SUB-%04d", seq++);
      Subscription obj = new Subscription(id, name.trim());
      obj.validate();
      subscriptions.put(id, obj);
      System.out.println("[NetflixService.createSubscription] stored " + id + " count=" + subscriptions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Subscription getSubscription(String id) {
    lock.lock();
    try {
      Subscription obj = subscriptions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Subscription id: " + id);
      }
      System.out.println("[NetflixService.getSubscription] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Content createContent(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Content name required");
    }
    lock.lock();
    try {
      String id = String.format("CON-%04d", seq++);
      Content obj = new Content(id, name.trim());
      obj.validate();
      contents.put(id, obj);
      System.out.println("[NetflixService.createContent] stored " + id + " count=" + contents.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Content getContent(String id) {
    lock.lock();
    try {
      Content obj = contents.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Content id: " + id);
      }
      System.out.println("[NetflixService.getContent] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public VideoAsset createVideoAsset(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("VideoAsset name required");
    }
    lock.lock();
    try {
      String id = String.format("VID-%04d", seq++);
      VideoAsset obj = new VideoAsset(id, name.trim());
      obj.validate();
      video_assets.put(id, obj);
      System.out.println("[NetflixService.createVideoAsset] stored " + id + " count=" + video_assets.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public VideoAsset getVideoAsset(String id) {
    lock.lock();
    try {
      VideoAsset obj = video_assets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown VideoAsset id: " + id);
      }
      System.out.println("[NetflixService.getVideoAsset] found id=" + obj.getId());
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
      System.out.println("[NetflixService.closeUser] closing " + id);
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
      System.out.println("[NetflixService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct NetflixService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    NetflixService system = new NetflixService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Profile ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createProfile("sample-profile");
    System.out.println("========== STEP 4: Create Subscription ==========");
    system.createSubscription("sample-subscription");
    System.out.println("========== STEP 5: Create Content ==========");
    system.createContent("sample-content");
    System.out.println("========== STEP 6: Create VideoAsset ==========");
    system.createVideoAsset("sample-video_asset");
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


class Subscription {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Subscription.id required')
    }

    if (!name?.trim()) {
      throw new Error('Subscription.name required')
    }
    console.log(\`[Subscription.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Subscription \${this.id} invalid status\`)
    }
    console.log(\`[Subscription.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Subscription \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Subscription.close] id=\${this.id} -> CLOSED\`)
  }
}


class Content {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Content.id required')
    }

    if (!name?.trim()) {
      throw new Error('Content.name required')
    }
    console.log(\`[Content.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Content \${this.id} invalid status\`)
    }
    console.log(\`[Content.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Content \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Content.close] id=\${this.id} -> CLOSED\`)
  }
}


class VideoAsset {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('VideoAsset.id required')
    }

    if (!name?.trim()) {
      throw new Error('VideoAsset.name required')
    }
    console.log(\`[VideoAsset.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`VideoAsset \${this.id} invalid status\`)
    }
    console.log(\`[VideoAsset.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`VideoAsset \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[VideoAsset.close] id=\${this.id} -> CLOSED\`)
  }
}

class NetflixService {
  private seq = 1
  private users = new Map<string, User>()
  private profiles = new Map<string, Profile>()
  private subscriptions = new Map<string, Subscription>()
  private contents = new Map<string, Content>()
  private video_assets = new Map<string, VideoAsset>()
  constructor() {
    console.log('[NetflixService.__init__] system ready')
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
    console.log(\`[NetflixService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[NetflixService.getUser] found id=\${obj.id}\`)
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
    console.log(\`[NetflixService.createProfile] stored \${id} count=\${this.profiles.size}\`)
    return obj
  }

  getProfile(id: string): Profile {
    const obj = this.profiles.get(id)
    if (!obj) {
      throw new Error(\`unknown Profile id: \${id}\`)
    }
    console.log(\`[NetflixService.getProfile] found id=\${obj.id}\`)
    return obj
  }

  createSubscription(name: string): Subscription {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Subscription name required')
    }
    const id = \`SUB-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Subscription(id, cleaned)
    obj.validate()
    this.subscriptions.set(id, obj)
    console.log(\`[NetflixService.createSubscription] stored \${id} count=\${this.subscriptions.size}\`)
    return obj
  }

  getSubscription(id: string): Subscription {
    const obj = this.subscriptions.get(id)
    if (!obj) {
      throw new Error(\`unknown Subscription id: \${id}\`)
    }
    console.log(\`[NetflixService.getSubscription] found id=\${obj.id}\`)
    return obj
  }

  createContent(name: string): Content {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Content name required')
    }
    const id = \`CON-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Content(id, cleaned)
    obj.validate()
    this.contents.set(id, obj)
    console.log(\`[NetflixService.createContent] stored \${id} count=\${this.contents.size}\`)
    return obj
  }

  getContent(id: string): Content {
    const obj = this.contents.get(id)
    if (!obj) {
      throw new Error(\`unknown Content id: \${id}\`)
    }
    console.log(\`[NetflixService.getContent] found id=\${obj.id}\`)
    return obj
  }

  createVideoAsset(name: string): VideoAsset {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('VideoAsset name required')
    }
    const id = \`VID-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new VideoAsset(id, cleaned)
    obj.validate()
    this.video_assets.set(id, obj)
    console.log(\`[NetflixService.createVideoAsset] stored \${id} count=\${this.video_assets.size}\`)
    return obj
  }

  getVideoAsset(id: string): VideoAsset {
    const obj = this.video_assets.get(id)
    if (!obj) {
      throw new Error(\`unknown VideoAsset id: \${id}\`)
    }
    console.log(\`[NetflixService.getVideoAsset] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[NetflixService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[NetflixService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct NetflixService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new NetflixService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Profile ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createProfile('sample-profile')
  console.log('========== STEP 4: Create Subscription ==========')
  system.createSubscription('sample-subscription')
  console.log('========== STEP 5: Create Content ==========')
  system.createContent('sample-content')
  console.log('========== STEP 6: Create VideoAsset ==========')
  system.createVideoAsset('sample-video_asset')
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


class Subscription {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Subscription(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Subscription requires id and name");
    }
    cout << "[Subscription.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Subscription invalid status");
    }
    cout << "[Subscription.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Subscription cannot close");
    }
    status_ = "CLOSED";
    cout << "[Subscription.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Content {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Content(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Content requires id and name");
    }
    cout << "[Content.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Content invalid status");
    }
    cout << "[Content.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Content cannot close");
    }
    status_ = "CLOSED";
    cout << "[Content.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class VideoAsset {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  VideoAsset(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("VideoAsset requires id and name");
    }
    cout << "[VideoAsset.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("VideoAsset invalid status");
    }
    cout << "[VideoAsset.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("VideoAsset cannot close");
    }
    status_ = "CLOSED";
    cout << "[VideoAsset.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class NetflixService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Profile> profiles_;
  unordered_map<string, Subscription> subscriptions_;
  unordered_map<string, Content> contents_;
  unordered_map<string, VideoAsset> video_assets_;
public:
  NetflixService() {
    cout << "[NetflixService.__init__] system ready" << endl;
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
    cout << "[NetflixService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[NetflixService.getUser] found " << id << endl;
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
    cout << "[NetflixService.createProfile] stored " << obj.id() << endl;
    return obj;
  }

  Profile getProfile(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = profiles_.find(id);
    if (it == profiles_.end()) {
      throw out_of_range("unknown Profile id");
    }
    cout << "[NetflixService.getProfile] found " << id << endl;
    return it->second;
  }

  Subscription createSubscription(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Subscription name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SUB-%04d", seq_++);
    Subscription obj{buf, name};
    obj.validate();
    subscriptions_.emplace(obj.id(), obj);
    cout << "[NetflixService.createSubscription] stored " << obj.id() << endl;
    return obj;
  }

  Subscription getSubscription(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = subscriptions_.find(id);
    if (it == subscriptions_.end()) {
      throw out_of_range("unknown Subscription id");
    }
    cout << "[NetflixService.getSubscription] found " << id << endl;
    return it->second;
  }

  Content createContent(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Content name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CON-%04d", seq_++);
    Content obj{buf, name};
    obj.validate();
    contents_.emplace(obj.id(), obj);
    cout << "[NetflixService.createContent] stored " << obj.id() << endl;
    return obj;
  }

  Content getContent(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = contents_.find(id);
    if (it == contents_.end()) {
      throw out_of_range("unknown Content id");
    }
    cout << "[NetflixService.getContent] found " << id << endl;
    return it->second;
  }

  VideoAsset createVideoAsset(const string& name) {
    if (name.empty()) {
      throw invalid_argument("VideoAsset name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "VID-%04d", seq_++);
    VideoAsset obj{buf, name};
    obj.validate();
    video_assets_.emplace(obj.id(), obj);
    cout << "[NetflixService.createVideoAsset] stored " << obj.id() << endl;
    return obj;
  }

  VideoAsset getVideoAsset(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = video_assets_.find(id);
    if (it == video_assets_.end()) {
      throw out_of_range("unknown VideoAsset id");
    }
    cout << "[NetflixService.getVideoAsset] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[NetflixService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct NetflixService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  NetflixService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createProfile("sample-profile");
  system.createSubscription("sample-subscription");
  system.createContent("sample-content");
  system.createVideoAsset("sample-video_asset");
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


type Subscription struct {
  ID     string
  Name   string
  Status string
}

func NewSubscription(id, name string) (*Subscription, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Subscription requires id and name")
  }
  obj := &Subscription{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Subscription.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Subscription) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Subscription invalid status")
  }
  fmt.Printf("[Subscription.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Subscription) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Subscription %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Subscription.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Content struct {
  ID     string
  Name   string
  Status string
}

func NewContent(id, name string) (*Content, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Content requires id and name")
  }
  obj := &Content{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Content.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Content) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Content invalid status")
  }
  fmt.Printf("[Content.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Content) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Content %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Content.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type VideoAsset struct {
  ID     string
  Name   string
  Status string
}

func NewVideoAsset(id, name string) (*VideoAsset, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("VideoAsset requires id and name")
  }
  obj := &VideoAsset{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[VideoAsset.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *VideoAsset) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("VideoAsset invalid status")
  }
  fmt.Printf("[VideoAsset.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *VideoAsset) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("VideoAsset %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[VideoAsset.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type NetflixService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  profiles map[string]*Profile
  subscriptions map[string]*Subscription
  contents map[string]*Content
  video_assets map[string]*VideoAsset
}

func NewNetflixService() *NetflixService {
  fmt.Println("[NetflixService.__init__] system ready")
  return &NetflixService{
    seq: 1,
    users: map[string]*User{},
    profiles: map[string]*Profile{},
    subscriptions: map[string]*Subscription{},
    contents: map[string]*Content{},
    video_assets: map[string]*VideoAsset{},
  }
}

func (s *NetflixService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[NetflixService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *NetflixService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[NetflixService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *NetflixService) CreateProfile(name string) (*Profile, error) {
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
  fmt.Printf("[NetflixService.CreateProfile] stored %s\\n", id)
  return obj, nil
}

func (s *NetflixService) GetProfile(id string) (*Profile, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.profiles[id]
  if !ok {
    return nil, fmt.Errorf("unknown Profile id: %s", id)
  }
  fmt.Printf("[NetflixService.GetProfile] found %s\\n", id)
  return obj, nil
}

func (s *NetflixService) CreateSubscription(name string) (*Subscription, error) {
  if name == "" {
    return nil, fmt.Errorf("Subscription name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SUB-%04d", s.seq)
  s.seq++
  obj, err := NewSubscription(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.subscriptions[id] = obj
  fmt.Printf("[NetflixService.CreateSubscription] stored %s\\n", id)
  return obj, nil
}

func (s *NetflixService) GetSubscription(id string) (*Subscription, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.subscriptions[id]
  if !ok {
    return nil, fmt.Errorf("unknown Subscription id: %s", id)
  }
  fmt.Printf("[NetflixService.GetSubscription] found %s\\n", id)
  return obj, nil
}

func (s *NetflixService) CreateContent(name string) (*Content, error) {
  if name == "" {
    return nil, fmt.Errorf("Content name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CON-%04d", s.seq)
  s.seq++
  obj, err := NewContent(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.contents[id] = obj
  fmt.Printf("[NetflixService.CreateContent] stored %s\\n", id)
  return obj, nil
}

func (s *NetflixService) GetContent(id string) (*Content, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.contents[id]
  if !ok {
    return nil, fmt.Errorf("unknown Content id: %s", id)
  }
  fmt.Printf("[NetflixService.GetContent] found %s\\n", id)
  return obj, nil
}

func (s *NetflixService) CreateVideoAsset(name string) (*VideoAsset, error) {
  if name == "" {
    return nil, fmt.Errorf("VideoAsset name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("VID-%04d", s.seq)
  s.seq++
  obj, err := NewVideoAsset(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.video_assets[id] = obj
  fmt.Printf("[NetflixService.CreateVideoAsset] stored %s\\n", id)
  return obj, nil
}

func (s *NetflixService) GetVideoAsset(id string) (*VideoAsset, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.video_assets[id]
  if !ok {
    return nil, fmt.Errorf("unknown VideoAsset id: %s", id)
  }
  fmt.Printf("[NetflixService.GetVideoAsset] found %s\\n", id)
  return obj, nil
}

func (s *NetflixService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[NetflixService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct NetflixService ==========")
  system := NewNetflixService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateProfile("sample-profile")
  system.CreateSubscription("sample-subscription")
  system.CreateContent("sample-content")
  system.CreateVideoAsset("sample-video_asset")
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


sealed class Subscription {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Subscription(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Subscription requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Subscription.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Subscription invalid status");
    }
    Console.WriteLine("[Subscription.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Subscription " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Subscription.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Content {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Content(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Content requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Content.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Content invalid status");
    }
    Console.WriteLine("[Content.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Content " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Content.close] id=" + Id + " -> CLOSED");
  }
}


sealed class VideoAsset {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public VideoAsset(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("VideoAsset requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[VideoAsset.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("VideoAsset invalid status");
    }
    Console.WriteLine("[VideoAsset.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("VideoAsset " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[VideoAsset.close] id=" + Id + " -> CLOSED");
  }
}

sealed class NetflixService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Profile> _profiles = new();
  private readonly Dictionary<string, Subscription> _subscriptions = new();
  private readonly Dictionary<string, Content> _contents = new();
  private readonly Dictionary<string, VideoAsset> _video_assets = new();
  public NetflixService() {
    Console.WriteLine("[NetflixService.__init__] system ready");
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
      Console.WriteLine("[NetflixService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[NetflixService.GetUser] found " + id);
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
      Console.WriteLine("[NetflixService.CreateProfile] stored " + id);
      return obj;
    }
  }

  public Profile GetProfile(string id) {
    lock (_gate) {
      if (!_profiles.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Profile id: " + id);
      }
      Console.WriteLine("[NetflixService.GetProfile] found " + id);
      return obj;
    }
  }

  public Subscription CreateSubscription(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Subscription name required");
    }
    lock (_gate) {
      var id = string.Format("SUB-{0:D4}", _seq++);
      var obj = new Subscription(id, name.Trim());
      obj.Validate();
      _subscriptions[id] = obj;
      Console.WriteLine("[NetflixService.CreateSubscription] stored " + id);
      return obj;
    }
  }

  public Subscription GetSubscription(string id) {
    lock (_gate) {
      if (!_subscriptions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Subscription id: " + id);
      }
      Console.WriteLine("[NetflixService.GetSubscription] found " + id);
      return obj;
    }
  }

  public Content CreateContent(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Content name required");
    }
    lock (_gate) {
      var id = string.Format("CON-{0:D4}", _seq++);
      var obj = new Content(id, name.Trim());
      obj.Validate();
      _contents[id] = obj;
      Console.WriteLine("[NetflixService.CreateContent] stored " + id);
      return obj;
    }
  }

  public Content GetContent(string id) {
    lock (_gate) {
      if (!_contents.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Content id: " + id);
      }
      Console.WriteLine("[NetflixService.GetContent] found " + id);
      return obj;
    }
  }

  public VideoAsset CreateVideoAsset(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("VideoAsset name required");
    }
    lock (_gate) {
      var id = string.Format("VID-{0:D4}", _seq++);
      var obj = new VideoAsset(id, name.Trim());
      obj.Validate();
      _video_assets[id] = obj;
      Console.WriteLine("[NetflixService.CreateVideoAsset] stored " + id);
      return obj;
    }
  }

  public VideoAsset GetVideoAsset(string id) {
    lock (_gate) {
      if (!_video_assets.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown VideoAsset id: " + id);
      }
      Console.WriteLine("[NetflixService.GetVideoAsset] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[NetflixService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct NetflixService ==========");
    var system = new NetflixService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateProfile("sample-profile");
    system.CreateSubscription("sample-subscription");
    system.CreateContent("sample-content");
    system.CreateVideoAsset("sample-video_asset");
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

export const netflixSolution: ProblemSolution = {
  slug: 'netflix',
  title: 'Netflix Streaming Service - Complete LLD Guide',
  overview: {
    introduction: [
      'Design Netflix — a video streaming platform supporting content upload, transcoding, personalised recommendations, and adaptive bitrate streaming at global scale. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Users sign up, subscribe to a plan, and manage profiles (up to 5 per account)',
      'Browse and search the content catalog by genre, language, and type',
      'Stream videos with adaptive bitrate (auto-adjust quality based on bandwidth)',
      'Continue watching from where you left off',
      'Personalised recommendations based on watch history',
      'Download content for offline viewing (premium plan)',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Users sign up, subscribe to a plan, and manage profiles (up to 5 per account)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Browse and search the content catalog by genre, language, and type?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Stream videos with adaptive bitrate (auto-adjust quality based on bandwidth)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Continue watching from where you left off?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Personalised recommendations based on watch history?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. NetflixService is the facade stereotype. User, Profile, Subscription, Content, VideoAsset are concrete domain classes with id/name/status and validate/close.',
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
          'Construct NetflixService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'NetflixService', responsibility: 'UML facade - orchestrates Netflix Streaming Service.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Profile', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Subscription', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Content', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'VideoAsset', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from NetflixService to User, Profile, Subscription, Content, VideoAsset. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on NetflixService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'NetflixService', responsibility: 'UML facade - orchestrates Netflix Streaming Service.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Profile', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Subscription', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Content', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'VideoAsset', responsibility: 'UML class - domain object for Netflix Streaming Service.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'NetflixService exposes create/get/close and owns composed collections.' },
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
      'main constructs NetflixService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct NetflixService.',
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
