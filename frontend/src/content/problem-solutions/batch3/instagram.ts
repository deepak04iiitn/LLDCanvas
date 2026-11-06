import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'InstagramService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_posts', 'Map<string, Post>'),
    attr('-', '_medias', 'Map<string, Media>'),
    attr('-', '_stories', 'Map<string, Story>'),
    attr('-', '_follows', 'Map<string, Follow>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createPost', 'name: string', 'Post'),
    method('+', 'createMedia', 'name: string', 'Media'),
    method('+', 'createStory', 'name: string', 'Story'),
    method('+', 'createFollow', 'name: string', 'Follow'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getPost', 'id: string', 'Post'),
    method('+', 'getMedia', 'id: string', 'Media'),
    method('+', 'getStory', 'id: string', 'Story'),
    method('+', 'getFollow', 'id: string', 'Follow'),
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
  cls('n2', 'Post', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Media', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Story', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Follow', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("instagram")


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


class Media:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Media.id is required")
        if not name or not name.strip():
            raise ValueError("Media.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Media.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Media {self.id} has invalid status={self.status}")
        log.info("[Media.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Media {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Media.close] id=%s -> CLOSED", self.id)


class Story:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Story.id is required")
        if not name or not name.strip():
            raise ValueError("Story.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Story.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Story {self.id} has invalid status={self.status}")
        log.info("[Story.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Story {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Story.close] id=%s -> CLOSED", self.id)


class Follow:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Follow.id is required")
        if not name or not name.strip():
            raise ValueError("Follow.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Follow.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Follow {self.id} has invalid status={self.status}")
        log.info("[Follow.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Follow {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Follow.close] id=%s -> CLOSED", self.id)


class InstagramService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._posts: Dict[str, Post] = {}
        self._medias: Dict[str, Media] = {}
        self._stories: Dict[str, Story] = {}
        self._follows: Dict[str, Follow] = {}
        log.info("[InstagramService.__init__] system ready; managing: User, Post, Media, Story, Follow")

    def create_user(self, name: str) -> User:
        """UML: InstagramService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[InstagramService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[InstagramService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_post(self, name: str) -> Post:
        """UML: InstagramService.create_post(name) -> Post"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Post name is required")
        with self._lock:
            item_id = f"POS-{self._seq:04d}"
            self._seq += 1
            obj = Post(item_id, cleaned)
            obj.validate()
            self._posts[item_id] = obj
            log.info("[InstagramService.create_post] stored %s in _posts (count=%s)", item_id, len(self._posts))
            return obj

    def get_post(self, item_id: str) -> Post:
        with self._lock:
            obj = self._posts.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Post id: {item_id}")
            log.info("[InstagramService.get_post] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_media(self, name: str) -> Media:
        """UML: InstagramService.create_media(name) -> Media"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Media name is required")
        with self._lock:
            item_id = f"MED-{self._seq:04d}"
            self._seq += 1
            obj = Media(item_id, cleaned)
            obj.validate()
            self._medias[item_id] = obj
            log.info("[InstagramService.create_media] stored %s in _medias (count=%s)", item_id, len(self._medias))
            return obj

    def get_media(self, item_id: str) -> Media:
        with self._lock:
            obj = self._medias.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Media id: {item_id}")
            log.info("[InstagramService.get_media] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_story(self, name: str) -> Story:
        """UML: InstagramService.create_story(name) -> Story"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Story name is required")
        with self._lock:
            item_id = f"STO-{self._seq:04d}"
            self._seq += 1
            obj = Story(item_id, cleaned)
            obj.validate()
            self._stories[item_id] = obj
            log.info("[InstagramService.create_story] stored %s in _stories (count=%s)", item_id, len(self._stories))
            return obj

    def get_story(self, item_id: str) -> Story:
        with self._lock:
            obj = self._stories.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Story id: {item_id}")
            log.info("[InstagramService.get_story] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_follow(self, name: str) -> Follow:
        """UML: InstagramService.create_follow(name) -> Follow"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Follow name is required")
        with self._lock:
            item_id = f"FOL-{self._seq:04d}"
            self._seq += 1
            obj = Follow(item_id, cleaned)
            obj.validate()
            self._follows[item_id] = obj
            log.info("[InstagramService.create_follow] stored %s in _follows (count=%s)", item_id, len(self._follows))
            return obj

    def get_follow(self, item_id: str) -> Follow:
        with self._lock:
            obj = self._follows.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Follow id: {item_id}")
            log.info("[InstagramService.get_follow] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[InstagramService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[InstagramService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct InstagramService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = InstagramService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Post (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_post("sample-post")

    log.info("========== STEP 4: Create Media (UML class) ==========")
    system.create_media("sample-media")

    log.info("========== STEP 5: Create Story (UML class) ==========")
    system.create_story("sample-story")

    log.info("========== STEP 6: Create Follow (UML class) ==========")
    system.create_follow("sample-follow")

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


class Media {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Media(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Media.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Media.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Media.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Media " + id + " invalid status");
    }
    System.out.println("[Media.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Media " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Media.close] id=" + id + " -> CLOSED");
  }
}


class Story {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Story(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Story.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Story.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Story.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Story " + id + " invalid status");
    }
    System.out.println("[Story.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Story " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Story.close] id=" + id + " -> CLOSED");
  }
}


class Follow {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Follow(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Follow.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Follow.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Follow.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Follow " + id + " invalid status");
    }
    System.out.println("[Follow.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Follow " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Follow.close] id=" + id + " -> CLOSED");
  }
}

public class InstagramService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Post> posts = new LinkedHashMap<>();
  private final Map<String, Media> medias = new LinkedHashMap<>();
  private final Map<String, Story> stories = new LinkedHashMap<>();
  private final Map<String, Follow> follows = new LinkedHashMap<>();

  public InstagramService() {
    System.out.println("[InstagramService.__init__] system ready");
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
      System.out.println("[InstagramService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[InstagramService.getUser] found id=" + obj.getId());
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
      System.out.println("[InstagramService.createPost] stored " + id + " count=" + posts.size());
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
      System.out.println("[InstagramService.getPost] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Media createMedia(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Media name required");
    }
    lock.lock();
    try {
      String id = String.format("MED-%04d", seq++);
      Media obj = new Media(id, name.trim());
      obj.validate();
      medias.put(id, obj);
      System.out.println("[InstagramService.createMedia] stored " + id + " count=" + medias.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Media getMedia(String id) {
    lock.lock();
    try {
      Media obj = medias.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Media id: " + id);
      }
      System.out.println("[InstagramService.getMedia] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Story createStory(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Story name required");
    }
    lock.lock();
    try {
      String id = String.format("STO-%04d", seq++);
      Story obj = new Story(id, name.trim());
      obj.validate();
      stories.put(id, obj);
      System.out.println("[InstagramService.createStory] stored " + id + " count=" + stories.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Story getStory(String id) {
    lock.lock();
    try {
      Story obj = stories.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Story id: " + id);
      }
      System.out.println("[InstagramService.getStory] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Follow createFollow(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Follow name required");
    }
    lock.lock();
    try {
      String id = String.format("FOL-%04d", seq++);
      Follow obj = new Follow(id, name.trim());
      obj.validate();
      follows.put(id, obj);
      System.out.println("[InstagramService.createFollow] stored " + id + " count=" + follows.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Follow getFollow(String id) {
    lock.lock();
    try {
      Follow obj = follows.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Follow id: " + id);
      }
      System.out.println("[InstagramService.getFollow] found id=" + obj.getId());
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
      System.out.println("[InstagramService.closeUser] closing " + id);
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
      System.out.println("[InstagramService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct InstagramService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    InstagramService system = new InstagramService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Post ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createPost("sample-post");
    System.out.println("========== STEP 4: Create Media ==========");
    system.createMedia("sample-media");
    System.out.println("========== STEP 5: Create Story ==========");
    system.createStory("sample-story");
    System.out.println("========== STEP 6: Create Follow ==========");
    system.createFollow("sample-follow");
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


class Media {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Media.id required')
    }

    if (!name?.trim()) {
      throw new Error('Media.name required')
    }
    console.log(\`[Media.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Media \${this.id} invalid status\`)
    }
    console.log(\`[Media.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Media \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Media.close] id=\${this.id} -> CLOSED\`)
  }
}


class Story {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Story.id required')
    }

    if (!name?.trim()) {
      throw new Error('Story.name required')
    }
    console.log(\`[Story.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Story \${this.id} invalid status\`)
    }
    console.log(\`[Story.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Story \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Story.close] id=\${this.id} -> CLOSED\`)
  }
}


class Follow {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Follow.id required')
    }

    if (!name?.trim()) {
      throw new Error('Follow.name required')
    }
    console.log(\`[Follow.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Follow \${this.id} invalid status\`)
    }
    console.log(\`[Follow.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Follow \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Follow.close] id=\${this.id} -> CLOSED\`)
  }
}

class InstagramService {
  private seq = 1
  private users = new Map<string, User>()
  private posts = new Map<string, Post>()
  private medias = new Map<string, Media>()
  private stories = new Map<string, Story>()
  private follows = new Map<string, Follow>()
  constructor() {
    console.log('[InstagramService.__init__] system ready')
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
    console.log(\`[InstagramService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[InstagramService.getUser] found id=\${obj.id}\`)
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
    console.log(\`[InstagramService.createPost] stored \${id} count=\${this.posts.size}\`)
    return obj
  }

  getPost(id: string): Post {
    const obj = this.posts.get(id)
    if (!obj) {
      throw new Error(\`unknown Post id: \${id}\`)
    }
    console.log(\`[InstagramService.getPost] found id=\${obj.id}\`)
    return obj
  }

  createMedia(name: string): Media {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Media name required')
    }
    const id = \`MED-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Media(id, cleaned)
    obj.validate()
    this.medias.set(id, obj)
    console.log(\`[InstagramService.createMedia] stored \${id} count=\${this.medias.size}\`)
    return obj
  }

  getMedia(id: string): Media {
    const obj = this.medias.get(id)
    if (!obj) {
      throw new Error(\`unknown Media id: \${id}\`)
    }
    console.log(\`[InstagramService.getMedia] found id=\${obj.id}\`)
    return obj
  }

  createStory(name: string): Story {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Story name required')
    }
    const id = \`STO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Story(id, cleaned)
    obj.validate()
    this.stories.set(id, obj)
    console.log(\`[InstagramService.createStory] stored \${id} count=\${this.stories.size}\`)
    return obj
  }

  getStory(id: string): Story {
    const obj = this.stories.get(id)
    if (!obj) {
      throw new Error(\`unknown Story id: \${id}\`)
    }
    console.log(\`[InstagramService.getStory] found id=\${obj.id}\`)
    return obj
  }

  createFollow(name: string): Follow {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Follow name required')
    }
    const id = \`FOL-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Follow(id, cleaned)
    obj.validate()
    this.follows.set(id, obj)
    console.log(\`[InstagramService.createFollow] stored \${id} count=\${this.follows.size}\`)
    return obj
  }

  getFollow(id: string): Follow {
    const obj = this.follows.get(id)
    if (!obj) {
      throw new Error(\`unknown Follow id: \${id}\`)
    }
    console.log(\`[InstagramService.getFollow] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[InstagramService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[InstagramService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct InstagramService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new InstagramService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Post ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createPost('sample-post')
  console.log('========== STEP 4: Create Media ==========')
  system.createMedia('sample-media')
  console.log('========== STEP 5: Create Story ==========')
  system.createStory('sample-story')
  console.log('========== STEP 6: Create Follow ==========')
  system.createFollow('sample-follow')
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


class Media {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Media(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Media requires id and name");
    }
    cout << "[Media.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Media invalid status");
    }
    cout << "[Media.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Media cannot close");
    }
    status_ = "CLOSED";
    cout << "[Media.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Story {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Story(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Story requires id and name");
    }
    cout << "[Story.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Story invalid status");
    }
    cout << "[Story.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Story cannot close");
    }
    status_ = "CLOSED";
    cout << "[Story.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Follow {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Follow(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Follow requires id and name");
    }
    cout << "[Follow.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Follow invalid status");
    }
    cout << "[Follow.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Follow cannot close");
    }
    status_ = "CLOSED";
    cout << "[Follow.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class InstagramService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Post> posts_;
  unordered_map<string, Media> medias_;
  unordered_map<string, Story> stories_;
  unordered_map<string, Follow> follows_;
public:
  InstagramService() {
    cout << "[InstagramService.__init__] system ready" << endl;
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
    cout << "[InstagramService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[InstagramService.getUser] found " << id << endl;
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
    cout << "[InstagramService.createPost] stored " << obj.id() << endl;
    return obj;
  }

  Post getPost(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = posts_.find(id);
    if (it == posts_.end()) {
      throw out_of_range("unknown Post id");
    }
    cout << "[InstagramService.getPost] found " << id << endl;
    return it->second;
  }

  Media createMedia(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Media name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MED-%04d", seq_++);
    Media obj{buf, name};
    obj.validate();
    medias_.emplace(obj.id(), obj);
    cout << "[InstagramService.createMedia] stored " << obj.id() << endl;
    return obj;
  }

  Media getMedia(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = medias_.find(id);
    if (it == medias_.end()) {
      throw out_of_range("unknown Media id");
    }
    cout << "[InstagramService.getMedia] found " << id << endl;
    return it->second;
  }

  Story createStory(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Story name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "STO-%04d", seq_++);
    Story obj{buf, name};
    obj.validate();
    stories_.emplace(obj.id(), obj);
    cout << "[InstagramService.createStory] stored " << obj.id() << endl;
    return obj;
  }

  Story getStory(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = stories_.find(id);
    if (it == stories_.end()) {
      throw out_of_range("unknown Story id");
    }
    cout << "[InstagramService.getStory] found " << id << endl;
    return it->second;
  }

  Follow createFollow(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Follow name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "FOL-%04d", seq_++);
    Follow obj{buf, name};
    obj.validate();
    follows_.emplace(obj.id(), obj);
    cout << "[InstagramService.createFollow] stored " << obj.id() << endl;
    return obj;
  }

  Follow getFollow(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = follows_.find(id);
    if (it == follows_.end()) {
      throw out_of_range("unknown Follow id");
    }
    cout << "[InstagramService.getFollow] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[InstagramService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct InstagramService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  InstagramService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createPost("sample-post");
  system.createMedia("sample-media");
  system.createStory("sample-story");
  system.createFollow("sample-follow");
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


type Media struct {
  ID     string
  Name   string
  Status string
}

func NewMedia(id, name string) (*Media, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Media requires id and name")
  }
  obj := &Media{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Media.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Media) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Media invalid status")
  }
  fmt.Printf("[Media.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Media) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Media %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Media.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Story struct {
  ID     string
  Name   string
  Status string
}

func NewStory(id, name string) (*Story, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Story requires id and name")
  }
  obj := &Story{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Story.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Story) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Story invalid status")
  }
  fmt.Printf("[Story.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Story) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Story %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Story.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Follow struct {
  ID     string
  Name   string
  Status string
}

func NewFollow(id, name string) (*Follow, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Follow requires id and name")
  }
  obj := &Follow{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Follow.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Follow) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Follow invalid status")
  }
  fmt.Printf("[Follow.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Follow) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Follow %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Follow.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type InstagramService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  posts map[string]*Post
  medias map[string]*Media
  stories map[string]*Story
  follows map[string]*Follow
}

func NewInstagramService() *InstagramService {
  fmt.Println("[InstagramService.__init__] system ready")
  return &InstagramService{
    seq: 1,
    users: map[string]*User{},
    posts: map[string]*Post{},
    medias: map[string]*Media{},
    stories: map[string]*Story{},
    follows: map[string]*Follow{},
  }
}

func (s *InstagramService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[InstagramService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *InstagramService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[InstagramService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *InstagramService) CreatePost(name string) (*Post, error) {
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
  fmt.Printf("[InstagramService.CreatePost] stored %s\\n", id)
  return obj, nil
}

func (s *InstagramService) GetPost(id string) (*Post, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.posts[id]
  if !ok {
    return nil, fmt.Errorf("unknown Post id: %s", id)
  }
  fmt.Printf("[InstagramService.GetPost] found %s\\n", id)
  return obj, nil
}

func (s *InstagramService) CreateMedia(name string) (*Media, error) {
  if name == "" {
    return nil, fmt.Errorf("Media name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MED-%04d", s.seq)
  s.seq++
  obj, err := NewMedia(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.medias[id] = obj
  fmt.Printf("[InstagramService.CreateMedia] stored %s\\n", id)
  return obj, nil
}

func (s *InstagramService) GetMedia(id string) (*Media, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.medias[id]
  if !ok {
    return nil, fmt.Errorf("unknown Media id: %s", id)
  }
  fmt.Printf("[InstagramService.GetMedia] found %s\\n", id)
  return obj, nil
}

func (s *InstagramService) CreateStory(name string) (*Story, error) {
  if name == "" {
    return nil, fmt.Errorf("Story name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("STO-%04d", s.seq)
  s.seq++
  obj, err := NewStory(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.stories[id] = obj
  fmt.Printf("[InstagramService.CreateStory] stored %s\\n", id)
  return obj, nil
}

func (s *InstagramService) GetStory(id string) (*Story, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.stories[id]
  if !ok {
    return nil, fmt.Errorf("unknown Story id: %s", id)
  }
  fmt.Printf("[InstagramService.GetStory] found %s\\n", id)
  return obj, nil
}

func (s *InstagramService) CreateFollow(name string) (*Follow, error) {
  if name == "" {
    return nil, fmt.Errorf("Follow name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("FOL-%04d", s.seq)
  s.seq++
  obj, err := NewFollow(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.follows[id] = obj
  fmt.Printf("[InstagramService.CreateFollow] stored %s\\n", id)
  return obj, nil
}

func (s *InstagramService) GetFollow(id string) (*Follow, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.follows[id]
  if !ok {
    return nil, fmt.Errorf("unknown Follow id: %s", id)
  }
  fmt.Printf("[InstagramService.GetFollow] found %s\\n", id)
  return obj, nil
}

func (s *InstagramService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[InstagramService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct InstagramService ==========")
  system := NewInstagramService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreatePost("sample-post")
  system.CreateMedia("sample-media")
  system.CreateStory("sample-story")
  system.CreateFollow("sample-follow")
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


sealed class Media {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Media(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Media requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Media.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Media invalid status");
    }
    Console.WriteLine("[Media.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Media " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Media.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Story {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Story(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Story requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Story.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Story invalid status");
    }
    Console.WriteLine("[Story.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Story " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Story.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Follow {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Follow(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Follow requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Follow.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Follow invalid status");
    }
    Console.WriteLine("[Follow.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Follow " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Follow.close] id=" + Id + " -> CLOSED");
  }
}

sealed class InstagramService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Post> _posts = new();
  private readonly Dictionary<string, Media> _medias = new();
  private readonly Dictionary<string, Story> _stories = new();
  private readonly Dictionary<string, Follow> _follows = new();
  public InstagramService() {
    Console.WriteLine("[InstagramService.__init__] system ready");
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
      Console.WriteLine("[InstagramService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[InstagramService.GetUser] found " + id);
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
      Console.WriteLine("[InstagramService.CreatePost] stored " + id);
      return obj;
    }
  }

  public Post GetPost(string id) {
    lock (_gate) {
      if (!_posts.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Post id: " + id);
      }
      Console.WriteLine("[InstagramService.GetPost] found " + id);
      return obj;
    }
  }

  public Media CreateMedia(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Media name required");
    }
    lock (_gate) {
      var id = string.Format("MED-{0:D4}", _seq++);
      var obj = new Media(id, name.Trim());
      obj.Validate();
      _medias[id] = obj;
      Console.WriteLine("[InstagramService.CreateMedia] stored " + id);
      return obj;
    }
  }

  public Media GetMedia(string id) {
    lock (_gate) {
      if (!_medias.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Media id: " + id);
      }
      Console.WriteLine("[InstagramService.GetMedia] found " + id);
      return obj;
    }
  }

  public Story CreateStory(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Story name required");
    }
    lock (_gate) {
      var id = string.Format("STO-{0:D4}", _seq++);
      var obj = new Story(id, name.Trim());
      obj.Validate();
      _stories[id] = obj;
      Console.WriteLine("[InstagramService.CreateStory] stored " + id);
      return obj;
    }
  }

  public Story GetStory(string id) {
    lock (_gate) {
      if (!_stories.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Story id: " + id);
      }
      Console.WriteLine("[InstagramService.GetStory] found " + id);
      return obj;
    }
  }

  public Follow CreateFollow(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Follow name required");
    }
    lock (_gate) {
      var id = string.Format("FOL-{0:D4}", _seq++);
      var obj = new Follow(id, name.Trim());
      obj.Validate();
      _follows[id] = obj;
      Console.WriteLine("[InstagramService.CreateFollow] stored " + id);
      return obj;
    }
  }

  public Follow GetFollow(string id) {
    lock (_gate) {
      if (!_follows.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Follow id: " + id);
      }
      Console.WriteLine("[InstagramService.GetFollow] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[InstagramService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct InstagramService ==========");
    var system = new InstagramService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreatePost("sample-post");
    system.CreateMedia("sample-media");
    system.CreateStory("sample-story");
    system.CreateFollow("sample-follow");
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

export const instagramSolution: ProblemSolution = {
  slug: 'instagram',
  title: 'Instagram - Complete LLD Guide',
  overview: {
    introduction: [
      'Design Instagram — a photo/video sharing social network with feeds, stories, explore, direct messages, and influencer-scale follower graphs. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Upload photos and videos with captions, tags, and location',
      'Follow other users and see their posts in a ranked feed',
      'Stories that disappear after 24 hours',
      'Explore page with trending and personalised content',
      'Like, comment, save, and share posts',
      'Direct messaging between users',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Upload photos and videos with captions, tags, and location?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Follow other users and see their posts in a ranked feed?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Stories that disappear after 24 hours?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Explore page with trending and personalised content?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Like, comment, save, and share posts?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. InstagramService is the facade stereotype. User, Post, Media, Story, Follow are concrete domain classes with id/name/status and validate/close.',
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
          'Construct InstagramService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'InstagramService', responsibility: 'UML facade - orchestrates Instagram.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Post', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Media', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Story', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Follow', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from InstagramService to User, Post, Media, Story, Follow. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on InstagramService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'InstagramService', responsibility: 'UML facade - orchestrates Instagram.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Post', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Media', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Story', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Follow', responsibility: 'UML class - domain object for Instagram.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'InstagramService exposes create/get/close and owns composed collections.' },
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
      'main constructs InstagramService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct InstagramService.',
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
