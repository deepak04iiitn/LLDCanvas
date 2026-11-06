import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'TwitterService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_tweets', 'Map<string, Tweet>'),
    attr('-', '_follows', 'Map<string, Follow>'),
    attr('-', '_likes', 'Map<string, Like>'),
    attr('-', '_retweets', 'Map<string, Retweet>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createTweet', 'name: string', 'Tweet'),
    method('+', 'createFollow', 'name: string', 'Follow'),
    method('+', 'createLike', 'name: string', 'Like'),
    method('+', 'createRetweet', 'name: string', 'Retweet'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getTweet', 'id: string', 'Tweet'),
    method('+', 'getFollow', 'id: string', 'Follow'),
    method('+', 'getLike', 'id: string', 'Like'),
    method('+', 'getRetweet', 'id: string', 'Retweet'),
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
  cls('n2', 'Tweet', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Follow', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Like', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Retweet', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("twitter")


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


class Tweet:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Tweet.id is required")
        if not name or not name.strip():
            raise ValueError("Tweet.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Tweet.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Tweet {self.id} has invalid status={self.status}")
        log.info("[Tweet.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Tweet {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Tweet.close] id=%s -> CLOSED", self.id)


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


class Like:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Like.id is required")
        if not name or not name.strip():
            raise ValueError("Like.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Like.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Like {self.id} has invalid status={self.status}")
        log.info("[Like.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Like {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Like.close] id=%s -> CLOSED", self.id)


class Retweet:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Retweet.id is required")
        if not name or not name.strip():
            raise ValueError("Retweet.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Retweet.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Retweet {self.id} has invalid status={self.status}")
        log.info("[Retweet.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Retweet {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Retweet.close] id=%s -> CLOSED", self.id)


class TwitterService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._tweets: Dict[str, Tweet] = {}
        self._follows: Dict[str, Follow] = {}
        self._likes: Dict[str, Like] = {}
        self._retweets: Dict[str, Retweet] = {}
        log.info("[TwitterService.__init__] system ready; managing: User, Tweet, Follow, Like, Retweet")

    def create_user(self, name: str) -> User:
        """UML: TwitterService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[TwitterService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[TwitterService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_tweet(self, name: str) -> Tweet:
        """UML: TwitterService.create_tweet(name) -> Tweet"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Tweet name is required")
        with self._lock:
            item_id = f"TWE-{self._seq:04d}"
            self._seq += 1
            obj = Tweet(item_id, cleaned)
            obj.validate()
            self._tweets[item_id] = obj
            log.info("[TwitterService.create_tweet] stored %s in _tweets (count=%s)", item_id, len(self._tweets))
            return obj

    def get_tweet(self, item_id: str) -> Tweet:
        with self._lock:
            obj = self._tweets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Tweet id: {item_id}")
            log.info("[TwitterService.get_tweet] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_follow(self, name: str) -> Follow:
        """UML: TwitterService.create_follow(name) -> Follow"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Follow name is required")
        with self._lock:
            item_id = f"FOL-{self._seq:04d}"
            self._seq += 1
            obj = Follow(item_id, cleaned)
            obj.validate()
            self._follows[item_id] = obj
            log.info("[TwitterService.create_follow] stored %s in _follows (count=%s)", item_id, len(self._follows))
            return obj

    def get_follow(self, item_id: str) -> Follow:
        with self._lock:
            obj = self._follows.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Follow id: {item_id}")
            log.info("[TwitterService.get_follow] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_like(self, name: str) -> Like:
        """UML: TwitterService.create_like(name) -> Like"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Like name is required")
        with self._lock:
            item_id = f"LIK-{self._seq:04d}"
            self._seq += 1
            obj = Like(item_id, cleaned)
            obj.validate()
            self._likes[item_id] = obj
            log.info("[TwitterService.create_like] stored %s in _likes (count=%s)", item_id, len(self._likes))
            return obj

    def get_like(self, item_id: str) -> Like:
        with self._lock:
            obj = self._likes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Like id: {item_id}")
            log.info("[TwitterService.get_like] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_retweet(self, name: str) -> Retweet:
        """UML: TwitterService.create_retweet(name) -> Retweet"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Retweet name is required")
        with self._lock:
            item_id = f"RET-{self._seq:04d}"
            self._seq += 1
            obj = Retweet(item_id, cleaned)
            obj.validate()
            self._retweets[item_id] = obj
            log.info("[TwitterService.create_retweet] stored %s in _retweets (count=%s)", item_id, len(self._retweets))
            return obj

    def get_retweet(self, item_id: str) -> Retweet:
        with self._lock:
            obj = self._retweets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Retweet id: {item_id}")
            log.info("[TwitterService.get_retweet] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[TwitterService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[TwitterService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct TwitterService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = TwitterService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Tweet (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_tweet("sample-tweet")

    log.info("========== STEP 4: Create Follow (UML class) ==========")
    system.create_follow("sample-follow")

    log.info("========== STEP 5: Create Like (UML class) ==========")
    system.create_like("sample-like")

    log.info("========== STEP 6: Create Retweet (UML class) ==========")
    system.create_retweet("sample-retweet")

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


class Tweet {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Tweet(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Tweet.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Tweet.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Tweet.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Tweet " + id + " invalid status");
    }
    System.out.println("[Tweet.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Tweet " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Tweet.close] id=" + id + " -> CLOSED");
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


class Like {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Like(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Like.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Like.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Like.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Like " + id + " invalid status");
    }
    System.out.println("[Like.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Like " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Like.close] id=" + id + " -> CLOSED");
  }
}


class Retweet {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Retweet(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Retweet.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Retweet.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Retweet.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Retweet " + id + " invalid status");
    }
    System.out.println("[Retweet.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Retweet " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Retweet.close] id=" + id + " -> CLOSED");
  }
}

public class TwitterService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Tweet> tweets = new LinkedHashMap<>();
  private final Map<String, Follow> follows = new LinkedHashMap<>();
  private final Map<String, Like> likes = new LinkedHashMap<>();
  private final Map<String, Retweet> retweets = new LinkedHashMap<>();

  public TwitterService() {
    System.out.println("[TwitterService.__init__] system ready");
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
      System.out.println("[TwitterService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[TwitterService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Tweet createTweet(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Tweet name required");
    }
    lock.lock();
    try {
      String id = String.format("TWE-%04d", seq++);
      Tweet obj = new Tweet(id, name.trim());
      obj.validate();
      tweets.put(id, obj);
      System.out.println("[TwitterService.createTweet] stored " + id + " count=" + tweets.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Tweet getTweet(String id) {
    lock.lock();
    try {
      Tweet obj = tweets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Tweet id: " + id);
      }
      System.out.println("[TwitterService.getTweet] found id=" + obj.getId());
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
      System.out.println("[TwitterService.createFollow] stored " + id + " count=" + follows.size());
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
      System.out.println("[TwitterService.getFollow] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Like createLike(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Like name required");
    }
    lock.lock();
    try {
      String id = String.format("LIK-%04d", seq++);
      Like obj = new Like(id, name.trim());
      obj.validate();
      likes.put(id, obj);
      System.out.println("[TwitterService.createLike] stored " + id + " count=" + likes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Like getLike(String id) {
    lock.lock();
    try {
      Like obj = likes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Like id: " + id);
      }
      System.out.println("[TwitterService.getLike] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Retweet createRetweet(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Retweet name required");
    }
    lock.lock();
    try {
      String id = String.format("RET-%04d", seq++);
      Retweet obj = new Retweet(id, name.trim());
      obj.validate();
      retweets.put(id, obj);
      System.out.println("[TwitterService.createRetweet] stored " + id + " count=" + retweets.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Retweet getRetweet(String id) {
    lock.lock();
    try {
      Retweet obj = retweets.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Retweet id: " + id);
      }
      System.out.println("[TwitterService.getRetweet] found id=" + obj.getId());
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
      System.out.println("[TwitterService.closeUser] closing " + id);
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
      System.out.println("[TwitterService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct TwitterService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    TwitterService system = new TwitterService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Tweet ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createTweet("sample-tweet");
    System.out.println("========== STEP 4: Create Follow ==========");
    system.createFollow("sample-follow");
    System.out.println("========== STEP 5: Create Like ==========");
    system.createLike("sample-like");
    System.out.println("========== STEP 6: Create Retweet ==========");
    system.createRetweet("sample-retweet");
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


class Tweet {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Tweet.id required')
    }

    if (!name?.trim()) {
      throw new Error('Tweet.name required')
    }
    console.log(\`[Tweet.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Tweet \${this.id} invalid status\`)
    }
    console.log(\`[Tweet.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Tweet \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Tweet.close] id=\${this.id} -> CLOSED\`)
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


class Like {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Like.id required')
    }

    if (!name?.trim()) {
      throw new Error('Like.name required')
    }
    console.log(\`[Like.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Like \${this.id} invalid status\`)
    }
    console.log(\`[Like.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Like \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Like.close] id=\${this.id} -> CLOSED\`)
  }
}


class Retweet {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Retweet.id required')
    }

    if (!name?.trim()) {
      throw new Error('Retweet.name required')
    }
    console.log(\`[Retweet.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Retweet \${this.id} invalid status\`)
    }
    console.log(\`[Retweet.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Retweet \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Retweet.close] id=\${this.id} -> CLOSED\`)
  }
}

class TwitterService {
  private seq = 1
  private users = new Map<string, User>()
  private tweets = new Map<string, Tweet>()
  private follows = new Map<string, Follow>()
  private likes = new Map<string, Like>()
  private retweets = new Map<string, Retweet>()
  constructor() {
    console.log('[TwitterService.__init__] system ready')
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
    console.log(\`[TwitterService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[TwitterService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createTweet(name: string): Tweet {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Tweet name required')
    }
    const id = \`TWE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Tweet(id, cleaned)
    obj.validate()
    this.tweets.set(id, obj)
    console.log(\`[TwitterService.createTweet] stored \${id} count=\${this.tweets.size}\`)
    return obj
  }

  getTweet(id: string): Tweet {
    const obj = this.tweets.get(id)
    if (!obj) {
      throw new Error(\`unknown Tweet id: \${id}\`)
    }
    console.log(\`[TwitterService.getTweet] found id=\${obj.id}\`)
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
    console.log(\`[TwitterService.createFollow] stored \${id} count=\${this.follows.size}\`)
    return obj
  }

  getFollow(id: string): Follow {
    const obj = this.follows.get(id)
    if (!obj) {
      throw new Error(\`unknown Follow id: \${id}\`)
    }
    console.log(\`[TwitterService.getFollow] found id=\${obj.id}\`)
    return obj
  }

  createLike(name: string): Like {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Like name required')
    }
    const id = \`LIK-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Like(id, cleaned)
    obj.validate()
    this.likes.set(id, obj)
    console.log(\`[TwitterService.createLike] stored \${id} count=\${this.likes.size}\`)
    return obj
  }

  getLike(id: string): Like {
    const obj = this.likes.get(id)
    if (!obj) {
      throw new Error(\`unknown Like id: \${id}\`)
    }
    console.log(\`[TwitterService.getLike] found id=\${obj.id}\`)
    return obj
  }

  createRetweet(name: string): Retweet {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Retweet name required')
    }
    const id = \`RET-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Retweet(id, cleaned)
    obj.validate()
    this.retweets.set(id, obj)
    console.log(\`[TwitterService.createRetweet] stored \${id} count=\${this.retweets.size}\`)
    return obj
  }

  getRetweet(id: string): Retweet {
    const obj = this.retweets.get(id)
    if (!obj) {
      throw new Error(\`unknown Retweet id: \${id}\`)
    }
    console.log(\`[TwitterService.getRetweet] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[TwitterService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[TwitterService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct TwitterService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new TwitterService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Tweet ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createTweet('sample-tweet')
  console.log('========== STEP 4: Create Follow ==========')
  system.createFollow('sample-follow')
  console.log('========== STEP 5: Create Like ==========')
  system.createLike('sample-like')
  console.log('========== STEP 6: Create Retweet ==========')
  system.createRetweet('sample-retweet')
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


class Tweet {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Tweet(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Tweet requires id and name");
    }
    cout << "[Tweet.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Tweet invalid status");
    }
    cout << "[Tweet.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Tweet cannot close");
    }
    status_ = "CLOSED";
    cout << "[Tweet.close] id=" << id_ << " -> CLOSED" << endl;
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


class Like {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Like(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Like requires id and name");
    }
    cout << "[Like.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Like invalid status");
    }
    cout << "[Like.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Like cannot close");
    }
    status_ = "CLOSED";
    cout << "[Like.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Retweet {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Retweet(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Retweet requires id and name");
    }
    cout << "[Retweet.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Retweet invalid status");
    }
    cout << "[Retweet.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Retweet cannot close");
    }
    status_ = "CLOSED";
    cout << "[Retweet.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class TwitterService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Tweet> tweets_;
  unordered_map<string, Follow> follows_;
  unordered_map<string, Like> likes_;
  unordered_map<string, Retweet> retweets_;
public:
  TwitterService() {
    cout << "[TwitterService.__init__] system ready" << endl;
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
    cout << "[TwitterService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[TwitterService.getUser] found " << id << endl;
    return it->second;
  }

  Tweet createTweet(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Tweet name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "TWE-%04d", seq_++);
    Tweet obj{buf, name};
    obj.validate();
    tweets_.emplace(obj.id(), obj);
    cout << "[TwitterService.createTweet] stored " << obj.id() << endl;
    return obj;
  }

  Tweet getTweet(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = tweets_.find(id);
    if (it == tweets_.end()) {
      throw out_of_range("unknown Tweet id");
    }
    cout << "[TwitterService.getTweet] found " << id << endl;
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
    cout << "[TwitterService.createFollow] stored " << obj.id() << endl;
    return obj;
  }

  Follow getFollow(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = follows_.find(id);
    if (it == follows_.end()) {
      throw out_of_range("unknown Follow id");
    }
    cout << "[TwitterService.getFollow] found " << id << endl;
    return it->second;
  }

  Like createLike(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Like name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LIK-%04d", seq_++);
    Like obj{buf, name};
    obj.validate();
    likes_.emplace(obj.id(), obj);
    cout << "[TwitterService.createLike] stored " << obj.id() << endl;
    return obj;
  }

  Like getLike(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = likes_.find(id);
    if (it == likes_.end()) {
      throw out_of_range("unknown Like id");
    }
    cout << "[TwitterService.getLike] found " << id << endl;
    return it->second;
  }

  Retweet createRetweet(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Retweet name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "RET-%04d", seq_++);
    Retweet obj{buf, name};
    obj.validate();
    retweets_.emplace(obj.id(), obj);
    cout << "[TwitterService.createRetweet] stored " << obj.id() << endl;
    return obj;
  }

  Retweet getRetweet(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = retweets_.find(id);
    if (it == retweets_.end()) {
      throw out_of_range("unknown Retweet id");
    }
    cout << "[TwitterService.getRetweet] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[TwitterService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct TwitterService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  TwitterService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createTweet("sample-tweet");
  system.createFollow("sample-follow");
  system.createLike("sample-like");
  system.createRetweet("sample-retweet");
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


type Tweet struct {
  ID     string
  Name   string
  Status string
}

func NewTweet(id, name string) (*Tweet, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Tweet requires id and name")
  }
  obj := &Tweet{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Tweet.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Tweet) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Tweet invalid status")
  }
  fmt.Printf("[Tweet.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Tweet) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Tweet %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Tweet.close] id=%s -> CLOSED\\n", o.ID)
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


type Like struct {
  ID     string
  Name   string
  Status string
}

func NewLike(id, name string) (*Like, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Like requires id and name")
  }
  obj := &Like{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Like.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Like) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Like invalid status")
  }
  fmt.Printf("[Like.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Like) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Like %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Like.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Retweet struct {
  ID     string
  Name   string
  Status string
}

func NewRetweet(id, name string) (*Retweet, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Retweet requires id and name")
  }
  obj := &Retweet{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Retweet.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Retweet) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Retweet invalid status")
  }
  fmt.Printf("[Retweet.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Retweet) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Retweet %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Retweet.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type TwitterService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  tweets map[string]*Tweet
  follows map[string]*Follow
  likes map[string]*Like
  retweets map[string]*Retweet
}

func NewTwitterService() *TwitterService {
  fmt.Println("[TwitterService.__init__] system ready")
  return &TwitterService{
    seq: 1,
    users: map[string]*User{},
    tweets: map[string]*Tweet{},
    follows: map[string]*Follow{},
    likes: map[string]*Like{},
    retweets: map[string]*Retweet{},
  }
}

func (s *TwitterService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[TwitterService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *TwitterService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[TwitterService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *TwitterService) CreateTweet(name string) (*Tweet, error) {
  if name == "" {
    return nil, fmt.Errorf("Tweet name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("TWE-%04d", s.seq)
  s.seq++
  obj, err := NewTweet(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.tweets[id] = obj
  fmt.Printf("[TwitterService.CreateTweet] stored %s\\n", id)
  return obj, nil
}

func (s *TwitterService) GetTweet(id string) (*Tweet, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.tweets[id]
  if !ok {
    return nil, fmt.Errorf("unknown Tweet id: %s", id)
  }
  fmt.Printf("[TwitterService.GetTweet] found %s\\n", id)
  return obj, nil
}

func (s *TwitterService) CreateFollow(name string) (*Follow, error) {
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
  fmt.Printf("[TwitterService.CreateFollow] stored %s\\n", id)
  return obj, nil
}

func (s *TwitterService) GetFollow(id string) (*Follow, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.follows[id]
  if !ok {
    return nil, fmt.Errorf("unknown Follow id: %s", id)
  }
  fmt.Printf("[TwitterService.GetFollow] found %s\\n", id)
  return obj, nil
}

func (s *TwitterService) CreateLike(name string) (*Like, error) {
  if name == "" {
    return nil, fmt.Errorf("Like name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LIK-%04d", s.seq)
  s.seq++
  obj, err := NewLike(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.likes[id] = obj
  fmt.Printf("[TwitterService.CreateLike] stored %s\\n", id)
  return obj, nil
}

func (s *TwitterService) GetLike(id string) (*Like, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.likes[id]
  if !ok {
    return nil, fmt.Errorf("unknown Like id: %s", id)
  }
  fmt.Printf("[TwitterService.GetLike] found %s\\n", id)
  return obj, nil
}

func (s *TwitterService) CreateRetweet(name string) (*Retweet, error) {
  if name == "" {
    return nil, fmt.Errorf("Retweet name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("RET-%04d", s.seq)
  s.seq++
  obj, err := NewRetweet(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.retweets[id] = obj
  fmt.Printf("[TwitterService.CreateRetweet] stored %s\\n", id)
  return obj, nil
}

func (s *TwitterService) GetRetweet(id string) (*Retweet, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.retweets[id]
  if !ok {
    return nil, fmt.Errorf("unknown Retweet id: %s", id)
  }
  fmt.Printf("[TwitterService.GetRetweet] found %s\\n", id)
  return obj, nil
}

func (s *TwitterService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[TwitterService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct TwitterService ==========")
  system := NewTwitterService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateTweet("sample-tweet")
  system.CreateFollow("sample-follow")
  system.CreateLike("sample-like")
  system.CreateRetweet("sample-retweet")
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


sealed class Tweet {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Tweet(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Tweet requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Tweet.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Tweet invalid status");
    }
    Console.WriteLine("[Tweet.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Tweet " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Tweet.close] id=" + Id + " -> CLOSED");
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


sealed class Like {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Like(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Like requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Like.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Like invalid status");
    }
    Console.WriteLine("[Like.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Like " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Like.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Retweet {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Retweet(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Retweet requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Retweet.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Retweet invalid status");
    }
    Console.WriteLine("[Retweet.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Retweet " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Retweet.close] id=" + Id + " -> CLOSED");
  }
}

sealed class TwitterService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Tweet> _tweets = new();
  private readonly Dictionary<string, Follow> _follows = new();
  private readonly Dictionary<string, Like> _likes = new();
  private readonly Dictionary<string, Retweet> _retweets = new();
  public TwitterService() {
    Console.WriteLine("[TwitterService.__init__] system ready");
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
      Console.WriteLine("[TwitterService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[TwitterService.GetUser] found " + id);
      return obj;
    }
  }

  public Tweet CreateTweet(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Tweet name required");
    }
    lock (_gate) {
      var id = string.Format("TWE-{0:D4}", _seq++);
      var obj = new Tweet(id, name.Trim());
      obj.Validate();
      _tweets[id] = obj;
      Console.WriteLine("[TwitterService.CreateTweet] stored " + id);
      return obj;
    }
  }

  public Tweet GetTweet(string id) {
    lock (_gate) {
      if (!_tweets.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Tweet id: " + id);
      }
      Console.WriteLine("[TwitterService.GetTweet] found " + id);
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
      Console.WriteLine("[TwitterService.CreateFollow] stored " + id);
      return obj;
    }
  }

  public Follow GetFollow(string id) {
    lock (_gate) {
      if (!_follows.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Follow id: " + id);
      }
      Console.WriteLine("[TwitterService.GetFollow] found " + id);
      return obj;
    }
  }

  public Like CreateLike(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Like name required");
    }
    lock (_gate) {
      var id = string.Format("LIK-{0:D4}", _seq++);
      var obj = new Like(id, name.Trim());
      obj.Validate();
      _likes[id] = obj;
      Console.WriteLine("[TwitterService.CreateLike] stored " + id);
      return obj;
    }
  }

  public Like GetLike(string id) {
    lock (_gate) {
      if (!_likes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Like id: " + id);
      }
      Console.WriteLine("[TwitterService.GetLike] found " + id);
      return obj;
    }
  }

  public Retweet CreateRetweet(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Retweet name required");
    }
    lock (_gate) {
      var id = string.Format("RET-{0:D4}", _seq++);
      var obj = new Retweet(id, name.Trim());
      obj.Validate();
      _retweets[id] = obj;
      Console.WriteLine("[TwitterService.CreateRetweet] stored " + id);
      return obj;
    }
  }

  public Retweet GetRetweet(string id) {
    lock (_gate) {
      if (!_retweets.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Retweet id: " + id);
      }
      Console.WriteLine("[TwitterService.GetRetweet] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[TwitterService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct TwitterService ==========");
    var system = new TwitterService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateTweet("sample-tweet");
    system.CreateFollow("sample-follow");
    system.CreateLike("sample-like");
    system.CreateRetweet("sample-retweet");
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

export const twitterSolution: ProblemSolution = {
  slug: 'twitter',
  title: 'Twitter / X - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a Twitter-like social platform supporting tweets, follows, timelines, trending topics, and notifications at massive scale. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Post tweets (text up to 280 chars, images, videos)',
      'Follow and unfollow other users',
      'Home timeline shows tweets from followed users, reverse chronological',
      'Like, retweet, quote-tweet, and reply to tweets',
      'Trending topics based on hashtag frequency',
      'User search and tweet search',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Post tweets (text up to 280 chars, images, videos)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Follow and unfollow other users?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Home timeline shows tweets from followed users, reverse chronological?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Like, retweet, quote-tweet, and reply to tweets?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Trending topics based on hashtag frequency?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. TwitterService is the facade stereotype. User, Tweet, Follow, Like, Retweet are concrete domain classes with id/name/status and validate/close.',
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
          'Construct TwitterService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'TwitterService', responsibility: 'UML facade - orchestrates Twitter / X.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Tweet', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Follow', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Like', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Retweet', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from TwitterService to User, Tweet, Follow, Like, Retweet. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on TwitterService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'TwitterService', responsibility: 'UML facade - orchestrates Twitter / X.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Tweet', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Follow', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Like', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Retweet', responsibility: 'UML class - domain object for Twitter / X.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'TwitterService exposes create/get/close and owns composed collections.' },
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
      'main constructs TwitterService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct TwitterService.',
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
