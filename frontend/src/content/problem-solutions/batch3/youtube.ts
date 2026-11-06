import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'YoutubeService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_users', 'Map<string, User>'),
    attr('-', '_channels', 'Map<string, Channel>'),
    attr('-', '_videos', 'Map<string, Video>'),
    attr('-', '_video_assets', 'Map<string, VideoAsset>'),
    attr('-', '_comments', 'Map<string, Comment>'),
  ], [
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'createChannel', 'name: string', 'Channel'),
    method('+', 'createVideo', 'name: string', 'Video'),
    method('+', 'createVideoAsset', 'name: string', 'VideoAsset'),
    method('+', 'createComment', 'name: string', 'Comment'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'getChannel', 'id: string', 'Channel'),
    method('+', 'getVideo', 'id: string', 'Video'),
    method('+', 'getVideoAsset', 'id: string', 'VideoAsset'),
    method('+', 'getComment', 'id: string', 'Comment'),
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
  cls('n2', 'Channel', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Video', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'VideoAsset', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Comment', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("youtube")


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


class Channel:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Channel.id is required")
        if not name or not name.strip():
            raise ValueError("Channel.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Channel.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Channel {self.id} has invalid status={self.status}")
        log.info("[Channel.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Channel {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Channel.close] id=%s -> CLOSED", self.id)


class Video:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Video.id is required")
        if not name or not name.strip():
            raise ValueError("Video.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Video.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Video {self.id} has invalid status={self.status}")
        log.info("[Video.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Video {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Video.close] id=%s -> CLOSED", self.id)


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


class Comment:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Comment.id is required")
        if not name or not name.strip():
            raise ValueError("Comment.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Comment.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Comment {self.id} has invalid status={self.status}")
        log.info("[Comment.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Comment {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Comment.close] id=%s -> CLOSED", self.id)


class YoutubeService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._users: Dict[str, User] = {}
        self._channels: Dict[str, Channel] = {}
        self._videos: Dict[str, Video] = {}
        self._video_assets: Dict[str, VideoAsset] = {}
        self._comments: Dict[str, Comment] = {}
        log.info("[YoutubeService.__init__] system ready; managing: User, Channel, Video, VideoAsset, Comment")

    def create_user(self, name: str) -> User:
        """UML: YoutubeService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[YoutubeService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[YoutubeService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_channel(self, name: str) -> Channel:
        """UML: YoutubeService.create_channel(name) -> Channel"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Channel name is required")
        with self._lock:
            item_id = f"CHA-{self._seq:04d}"
            self._seq += 1
            obj = Channel(item_id, cleaned)
            obj.validate()
            self._channels[item_id] = obj
            log.info("[YoutubeService.create_channel] stored %s in _channels (count=%s)", item_id, len(self._channels))
            return obj

    def get_channel(self, item_id: str) -> Channel:
        with self._lock:
            obj = self._channels.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Channel id: {item_id}")
            log.info("[YoutubeService.get_channel] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_video(self, name: str) -> Video:
        """UML: YoutubeService.create_video(name) -> Video"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Video name is required")
        with self._lock:
            item_id = f"VID-{self._seq:04d}"
            self._seq += 1
            obj = Video(item_id, cleaned)
            obj.validate()
            self._videos[item_id] = obj
            log.info("[YoutubeService.create_video] stored %s in _videos (count=%s)", item_id, len(self._videos))
            return obj

    def get_video(self, item_id: str) -> Video:
        with self._lock:
            obj = self._videos.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Video id: {item_id}")
            log.info("[YoutubeService.get_video] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_video_asset(self, name: str) -> VideoAsset:
        """UML: YoutubeService.create_video_asset(name) -> VideoAsset"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("VideoAsset name is required")
        with self._lock:
            item_id = f"VID-{self._seq:04d}"
            self._seq += 1
            obj = VideoAsset(item_id, cleaned)
            obj.validate()
            self._video_assets[item_id] = obj
            log.info("[YoutubeService.create_video_asset] stored %s in _video_assets (count=%s)", item_id, len(self._video_assets))
            return obj

    def get_video_asset(self, item_id: str) -> VideoAsset:
        with self._lock:
            obj = self._video_assets.get(item_id)
            if obj is None:
                raise KeyError(f"unknown VideoAsset id: {item_id}")
            log.info("[YoutubeService.get_video_asset] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_comment(self, name: str) -> Comment:
        """UML: YoutubeService.create_comment(name) -> Comment"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Comment name is required")
        with self._lock:
            item_id = f"COM-{self._seq:04d}"
            self._seq += 1
            obj = Comment(item_id, cleaned)
            obj.validate()
            self._comments[item_id] = obj
            log.info("[YoutubeService.create_comment] stored %s in _comments (count=%s)", item_id, len(self._comments))
            return obj

    def get_comment(self, item_id: str) -> Comment:
        with self._lock:
            obj = self._comments.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Comment id: {item_id}")
            log.info("[YoutubeService.get_comment] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_user(self, item_id: str) -> User:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[YoutubeService.close_user] closing %s via User.close()", item_id)
            obj.close()
            return obj

    def list_active_users(self) -> List[User]:
        with self._lock:
            active = [o for o in self._users.values() if o.status == "ACTIVE"]
            log.info("[YoutubeService.list_active_users] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct YoutubeService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = YoutubeService()

    log.info("========== STEP 2: Create primary User objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_user("alpha-user")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_user("beta-user")

    log.info("========== STEP 3: Create Channel (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_channel("sample-channel")

    log.info("========== STEP 4: Create Video (UML class) ==========")
    system.create_video("sample-video")

    log.info("========== STEP 5: Create VideoAsset (UML class) ==========")
    system.create_video_asset("sample-video_asset")

    log.info("========== STEP 6: Create Comment (UML class) ==========")
    system.create_comment("sample-comment")

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


class Channel {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Channel(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Channel.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Channel.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Channel.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Channel " + id + " invalid status");
    }
    System.out.println("[Channel.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Channel " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Channel.close] id=" + id + " -> CLOSED");
  }
}


class Video {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Video(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Video.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Video.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Video.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Video " + id + " invalid status");
    }
    System.out.println("[Video.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Video " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Video.close] id=" + id + " -> CLOSED");
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


class Comment {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Comment(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Comment.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Comment.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Comment.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Comment " + id + " invalid status");
    }
    System.out.println("[Comment.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Comment " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Comment.close] id=" + id + " -> CLOSED");
  }
}

public class YoutubeService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, User> users = new LinkedHashMap<>();
  private final Map<String, Channel> channels = new LinkedHashMap<>();
  private final Map<String, Video> videos = new LinkedHashMap<>();
  private final Map<String, VideoAsset> video_assets = new LinkedHashMap<>();
  private final Map<String, Comment> comments = new LinkedHashMap<>();

  public YoutubeService() {
    System.out.println("[YoutubeService.__init__] system ready");
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
      System.out.println("[YoutubeService.createUser] stored " + id + " count=" + users.size());
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
      System.out.println("[YoutubeService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Channel createChannel(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Channel name required");
    }
    lock.lock();
    try {
      String id = String.format("CHA-%04d", seq++);
      Channel obj = new Channel(id, name.trim());
      obj.validate();
      channels.put(id, obj);
      System.out.println("[YoutubeService.createChannel] stored " + id + " count=" + channels.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Channel getChannel(String id) {
    lock.lock();
    try {
      Channel obj = channels.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Channel id: " + id);
      }
      System.out.println("[YoutubeService.getChannel] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Video createVideo(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Video name required");
    }
    lock.lock();
    try {
      String id = String.format("VID-%04d", seq++);
      Video obj = new Video(id, name.trim());
      obj.validate();
      videos.put(id, obj);
      System.out.println("[YoutubeService.createVideo] stored " + id + " count=" + videos.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Video getVideo(String id) {
    lock.lock();
    try {
      Video obj = videos.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Video id: " + id);
      }
      System.out.println("[YoutubeService.getVideo] found id=" + obj.getId());
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
      System.out.println("[YoutubeService.createVideoAsset] stored " + id + " count=" + video_assets.size());
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
      System.out.println("[YoutubeService.getVideoAsset] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Comment createComment(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Comment name required");
    }
    lock.lock();
    try {
      String id = String.format("COM-%04d", seq++);
      Comment obj = new Comment(id, name.trim());
      obj.validate();
      comments.put(id, obj);
      System.out.println("[YoutubeService.createComment] stored " + id + " count=" + comments.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Comment getComment(String id) {
    lock.lock();
    try {
      Comment obj = comments.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Comment id: " + id);
      }
      System.out.println("[YoutubeService.getComment] found id=" + obj.getId());
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
      System.out.println("[YoutubeService.closeUser] closing " + id);
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
      System.out.println("[YoutubeService.listActiveUsers] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct YoutubeService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    YoutubeService system = new YoutubeService();
    System.out.println("========== STEP 2: Create User objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    User first = system.createUser("alpha-user");
    system.createUser("beta-user");
    System.out.println("========== STEP 3: Create Channel ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createChannel("sample-channel");
    System.out.println("========== STEP 4: Create Video ==========");
    system.createVideo("sample-video");
    System.out.println("========== STEP 5: Create VideoAsset ==========");
    system.createVideoAsset("sample-video_asset");
    System.out.println("========== STEP 6: Create Comment ==========");
    system.createComment("sample-comment");
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


class Channel {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Channel.id required')
    }

    if (!name?.trim()) {
      throw new Error('Channel.name required')
    }
    console.log(\`[Channel.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Channel \${this.id} invalid status\`)
    }
    console.log(\`[Channel.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Channel \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Channel.close] id=\${this.id} -> CLOSED\`)
  }
}


class Video {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Video.id required')
    }

    if (!name?.trim()) {
      throw new Error('Video.name required')
    }
    console.log(\`[Video.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Video \${this.id} invalid status\`)
    }
    console.log(\`[Video.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Video \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Video.close] id=\${this.id} -> CLOSED\`)
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


class Comment {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Comment.id required')
    }

    if (!name?.trim()) {
      throw new Error('Comment.name required')
    }
    console.log(\`[Comment.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Comment \${this.id} invalid status\`)
    }
    console.log(\`[Comment.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Comment \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Comment.close] id=\${this.id} -> CLOSED\`)
  }
}

class YoutubeService {
  private seq = 1
  private users = new Map<string, User>()
  private channels = new Map<string, Channel>()
  private videos = new Map<string, Video>()
  private video_assets = new Map<string, VideoAsset>()
  private comments = new Map<string, Comment>()
  constructor() {
    console.log('[YoutubeService.__init__] system ready')
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
    console.log(\`[YoutubeService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[YoutubeService.getUser] found id=\${obj.id}\`)
    return obj
  }

  createChannel(name: string): Channel {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Channel name required')
    }
    const id = \`CHA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Channel(id, cleaned)
    obj.validate()
    this.channels.set(id, obj)
    console.log(\`[YoutubeService.createChannel] stored \${id} count=\${this.channels.size}\`)
    return obj
  }

  getChannel(id: string): Channel {
    const obj = this.channels.get(id)
    if (!obj) {
      throw new Error(\`unknown Channel id: \${id}\`)
    }
    console.log(\`[YoutubeService.getChannel] found id=\${obj.id}\`)
    return obj
  }

  createVideo(name: string): Video {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Video name required')
    }
    const id = \`VID-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Video(id, cleaned)
    obj.validate()
    this.videos.set(id, obj)
    console.log(\`[YoutubeService.createVideo] stored \${id} count=\${this.videos.size}\`)
    return obj
  }

  getVideo(id: string): Video {
    const obj = this.videos.get(id)
    if (!obj) {
      throw new Error(\`unknown Video id: \${id}\`)
    }
    console.log(\`[YoutubeService.getVideo] found id=\${obj.id}\`)
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
    console.log(\`[YoutubeService.createVideoAsset] stored \${id} count=\${this.video_assets.size}\`)
    return obj
  }

  getVideoAsset(id: string): VideoAsset {
    const obj = this.video_assets.get(id)
    if (!obj) {
      throw new Error(\`unknown VideoAsset id: \${id}\`)
    }
    console.log(\`[YoutubeService.getVideoAsset] found id=\${obj.id}\`)
    return obj
  }

  createComment(name: string): Comment {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Comment name required')
    }
    const id = \`COM-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Comment(id, cleaned)
    obj.validate()
    this.comments.set(id, obj)
    console.log(\`[YoutubeService.createComment] stored \${id} count=\${this.comments.size}\`)
    return obj
  }

  getComment(id: string): Comment {
    const obj = this.comments.get(id)
    if (!obj) {
      throw new Error(\`unknown Comment id: \${id}\`)
    }
    console.log(\`[YoutubeService.getComment] found id=\${obj.id}\`)
    return obj
  }

  closeUser(id: string): User {
    const obj = this.getUser(id)
    console.log(\`[YoutubeService.closeUser] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveUsers(): User[] {
    const active = [...this.users.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[YoutubeService.listActiveUsers] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct YoutubeService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new YoutubeService()
  console.log('========== STEP 2: Create User objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createUser('alpha-user')
  system.createUser('beta-user')
  console.log('========== STEP 3: Create Channel ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createChannel('sample-channel')
  console.log('========== STEP 4: Create Video ==========')
  system.createVideo('sample-video')
  console.log('========== STEP 5: Create VideoAsset ==========')
  system.createVideoAsset('sample-video_asset')
  console.log('========== STEP 6: Create Comment ==========')
  system.createComment('sample-comment')
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


class Channel {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Channel(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Channel requires id and name");
    }
    cout << "[Channel.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Channel invalid status");
    }
    cout << "[Channel.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Channel cannot close");
    }
    status_ = "CLOSED";
    cout << "[Channel.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Video {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Video(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Video requires id and name");
    }
    cout << "[Video.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Video invalid status");
    }
    cout << "[Video.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Video cannot close");
    }
    status_ = "CLOSED";
    cout << "[Video.close] id=" << id_ << " -> CLOSED" << endl;
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


class Comment {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Comment(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Comment requires id and name");
    }
    cout << "[Comment.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Comment invalid status");
    }
    cout << "[Comment.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Comment cannot close");
    }
    status_ = "CLOSED";
    cout << "[Comment.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class YoutubeService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, User> users_;
  unordered_map<string, Channel> channels_;
  unordered_map<string, Video> videos_;
  unordered_map<string, VideoAsset> video_assets_;
  unordered_map<string, Comment> comments_;
public:
  YoutubeService() {
    cout << "[YoutubeService.__init__] system ready" << endl;
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
    cout << "[YoutubeService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[YoutubeService.getUser] found " << id << endl;
    return it->second;
  }

  Channel createChannel(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Channel name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CHA-%04d", seq_++);
    Channel obj{buf, name};
    obj.validate();
    channels_.emplace(obj.id(), obj);
    cout << "[YoutubeService.createChannel] stored " << obj.id() << endl;
    return obj;
  }

  Channel getChannel(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = channels_.find(id);
    if (it == channels_.end()) {
      throw out_of_range("unknown Channel id");
    }
    cout << "[YoutubeService.getChannel] found " << id << endl;
    return it->second;
  }

  Video createVideo(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Video name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "VID-%04d", seq_++);
    Video obj{buf, name};
    obj.validate();
    videos_.emplace(obj.id(), obj);
    cout << "[YoutubeService.createVideo] stored " << obj.id() << endl;
    return obj;
  }

  Video getVideo(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = videos_.find(id);
    if (it == videos_.end()) {
      throw out_of_range("unknown Video id");
    }
    cout << "[YoutubeService.getVideo] found " << id << endl;
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
    cout << "[YoutubeService.createVideoAsset] stored " << obj.id() << endl;
    return obj;
  }

  VideoAsset getVideoAsset(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = video_assets_.find(id);
    if (it == video_assets_.end()) {
      throw out_of_range("unknown VideoAsset id");
    }
    cout << "[YoutubeService.getVideoAsset] found " << id << endl;
    return it->second;
  }

  Comment createComment(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Comment name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "COM-%04d", seq_++);
    Comment obj{buf, name};
    obj.validate();
    comments_.emplace(obj.id(), obj);
    cout << "[YoutubeService.createComment] stored " << obj.id() << endl;
    return obj;
  }

  Comment getComment(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = comments_.find(id);
    if (it == comments_.end()) {
      throw out_of_range("unknown Comment id");
    }
    cout << "[YoutubeService.getComment] found " << id << endl;
    return it->second;
  }

  User closeUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User");
    }
    cout << "[YoutubeService.closeUser] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct YoutubeService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  YoutubeService system;
  cout << "========== STEP 2: Create User ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createUser("alpha-user");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createUser("beta-user");
  system.createChannel("sample-channel");
  system.createVideo("sample-video");
  system.createVideoAsset("sample-video_asset");
  system.createComment("sample-comment");
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


type Channel struct {
  ID     string
  Name   string
  Status string
}

func NewChannel(id, name string) (*Channel, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Channel requires id and name")
  }
  obj := &Channel{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Channel.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Channel) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Channel invalid status")
  }
  fmt.Printf("[Channel.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Channel) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Channel %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Channel.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Video struct {
  ID     string
  Name   string
  Status string
}

func NewVideo(id, name string) (*Video, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Video requires id and name")
  }
  obj := &Video{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Video.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Video) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Video invalid status")
  }
  fmt.Printf("[Video.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Video) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Video %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Video.close] id=%s -> CLOSED\\n", o.ID)
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


type Comment struct {
  ID     string
  Name   string
  Status string
}

func NewComment(id, name string) (*Comment, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Comment requires id and name")
  }
  obj := &Comment{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Comment.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Comment) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Comment invalid status")
  }
  fmt.Printf("[Comment.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Comment) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Comment %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Comment.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type YoutubeService struct {
  mu  sync.Mutex
  seq int
  users map[string]*User
  channels map[string]*Channel
  videos map[string]*Video
  video_assets map[string]*VideoAsset
  comments map[string]*Comment
}

func NewYoutubeService() *YoutubeService {
  fmt.Println("[YoutubeService.__init__] system ready")
  return &YoutubeService{
    seq: 1,
    users: map[string]*User{},
    channels: map[string]*Channel{},
    videos: map[string]*Video{},
    video_assets: map[string]*VideoAsset{},
    comments: map[string]*Comment{},
  }
}

func (s *YoutubeService) CreateUser(name string) (*User, error) {
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
  fmt.Printf("[YoutubeService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[YoutubeService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) CreateChannel(name string) (*Channel, error) {
  if name == "" {
    return nil, fmt.Errorf("Channel name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CHA-%04d", s.seq)
  s.seq++
  obj, err := NewChannel(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.channels[id] = obj
  fmt.Printf("[YoutubeService.CreateChannel] stored %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) GetChannel(id string) (*Channel, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.channels[id]
  if !ok {
    return nil, fmt.Errorf("unknown Channel id: %s", id)
  }
  fmt.Printf("[YoutubeService.GetChannel] found %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) CreateVideo(name string) (*Video, error) {
  if name == "" {
    return nil, fmt.Errorf("Video name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("VID-%04d", s.seq)
  s.seq++
  obj, err := NewVideo(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.videos[id] = obj
  fmt.Printf("[YoutubeService.CreateVideo] stored %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) GetVideo(id string) (*Video, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.videos[id]
  if !ok {
    return nil, fmt.Errorf("unknown Video id: %s", id)
  }
  fmt.Printf("[YoutubeService.GetVideo] found %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) CreateVideoAsset(name string) (*VideoAsset, error) {
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
  fmt.Printf("[YoutubeService.CreateVideoAsset] stored %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) GetVideoAsset(id string) (*VideoAsset, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.video_assets[id]
  if !ok {
    return nil, fmt.Errorf("unknown VideoAsset id: %s", id)
  }
  fmt.Printf("[YoutubeService.GetVideoAsset] found %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) CreateComment(name string) (*Comment, error) {
  if name == "" {
    return nil, fmt.Errorf("Comment name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("COM-%04d", s.seq)
  s.seq++
  obj, err := NewComment(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.comments[id] = obj
  fmt.Printf("[YoutubeService.CreateComment] stored %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) GetComment(id string) (*Comment, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.comments[id]
  if !ok {
    return nil, fmt.Errorf("unknown Comment id: %s", id)
  }
  fmt.Printf("[YoutubeService.GetComment] found %s\\n", id)
  return obj, nil
}

func (s *YoutubeService) CloseUser(id string) (*User, error) {
  obj, err := s.GetUser(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[YoutubeService.CloseUser] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct YoutubeService ==========")
  system := NewYoutubeService()
  fmt.Println("========== STEP 2: Create User ==========")
  first, _ := system.CreateUser("alpha-user")
  system.CreateUser("beta-user")
  system.CreateChannel("sample-channel")
  system.CreateVideo("sample-video")
  system.CreateVideoAsset("sample-video_asset")
  system.CreateComment("sample-comment")
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


sealed class Channel {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Channel(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Channel requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Channel.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Channel invalid status");
    }
    Console.WriteLine("[Channel.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Channel " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Channel.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Video {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Video(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Video requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Video.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Video invalid status");
    }
    Console.WriteLine("[Video.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Video " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Video.close] id=" + Id + " -> CLOSED");
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


sealed class Comment {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Comment(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Comment requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Comment.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Comment invalid status");
    }
    Console.WriteLine("[Comment.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Comment " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Comment.close] id=" + Id + " -> CLOSED");
  }
}

sealed class YoutubeService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, User> _users = new();
  private readonly Dictionary<string, Channel> _channels = new();
  private readonly Dictionary<string, Video> _videos = new();
  private readonly Dictionary<string, VideoAsset> _video_assets = new();
  private readonly Dictionary<string, Comment> _comments = new();
  public YoutubeService() {
    Console.WriteLine("[YoutubeService.__init__] system ready");
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
      Console.WriteLine("[YoutubeService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[YoutubeService.GetUser] found " + id);
      return obj;
    }
  }

  public Channel CreateChannel(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Channel name required");
    }
    lock (_gate) {
      var id = string.Format("CHA-{0:D4}", _seq++);
      var obj = new Channel(id, name.Trim());
      obj.Validate();
      _channels[id] = obj;
      Console.WriteLine("[YoutubeService.CreateChannel] stored " + id);
      return obj;
    }
  }

  public Channel GetChannel(string id) {
    lock (_gate) {
      if (!_channels.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Channel id: " + id);
      }
      Console.WriteLine("[YoutubeService.GetChannel] found " + id);
      return obj;
    }
  }

  public Video CreateVideo(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Video name required");
    }
    lock (_gate) {
      var id = string.Format("VID-{0:D4}", _seq++);
      var obj = new Video(id, name.Trim());
      obj.Validate();
      _videos[id] = obj;
      Console.WriteLine("[YoutubeService.CreateVideo] stored " + id);
      return obj;
    }
  }

  public Video GetVideo(string id) {
    lock (_gate) {
      if (!_videos.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Video id: " + id);
      }
      Console.WriteLine("[YoutubeService.GetVideo] found " + id);
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
      Console.WriteLine("[YoutubeService.CreateVideoAsset] stored " + id);
      return obj;
    }
  }

  public VideoAsset GetVideoAsset(string id) {
    lock (_gate) {
      if (!_video_assets.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown VideoAsset id: " + id);
      }
      Console.WriteLine("[YoutubeService.GetVideoAsset] found " + id);
      return obj;
    }
  }

  public Comment CreateComment(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Comment name required");
    }
    lock (_gate) {
      var id = string.Format("COM-{0:D4}", _seq++);
      var obj = new Comment(id, name.Trim());
      obj.Validate();
      _comments[id] = obj;
      Console.WriteLine("[YoutubeService.CreateComment] stored " + id);
      return obj;
    }
  }

  public Comment GetComment(string id) {
    lock (_gate) {
      if (!_comments.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Comment id: " + id);
      }
      Console.WriteLine("[YoutubeService.GetComment] found " + id);
      return obj;
    }
  }

  public User CloseUser(string id) {
    var obj = GetUser(id);
    Console.WriteLine("[YoutubeService.CloseUser] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct YoutubeService ==========");
    var system = new YoutubeService();
    Console.WriteLine("========== STEP 2: Create User ==========");
    var first = system.CreateUser("alpha-user");
    system.CreateUser("beta-user");
    system.CreateChannel("sample-channel");
    system.CreateVideo("sample-video");
    system.CreateVideoAsset("sample-video_asset");
    system.CreateComment("sample-comment");
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

export const youtubeSolution: ProblemSolution = {
  slug: 'youtube',
  title: 'YouTube - Complete LLD Guide',
  overview: {
    introduction: [
      'Design YouTube — video upload, transcoding pipeline, search, recommendations, comments, monetization, and global CDN delivery. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Upload videos of any length (up to 12 hours)',
      'Transcode to multiple resolutions: 360p to 4K',
      'Adaptive bitrate streaming (HLS/DASH)',
      'Subscribe to channels, like, comment, share',
      'Search videos by title, description, and tags',
      'Personalised homepage and recommended videos',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Upload videos of any length (up to 12 hours)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Transcode to multiple resolutions: 360p to 4K?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Adaptive bitrate streaming (HLS/DASH)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Subscribe to channels, like, comment, share?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Search videos by title, description, and tags?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. YoutubeService is the facade stereotype. User, Channel, Video, VideoAsset, Comment are concrete domain classes with id/name/status and validate/close.',
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
          'Construct YoutubeService.',
          'createUser twice and create the related UML classes.',
          'closeUser once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'YoutubeService', responsibility: 'UML facade - orchestrates YouTube.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Channel', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Video', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'VideoAsset', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Comment', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from YoutubeService to User, Channel, Video, VideoAsset, Comment. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on YoutubeService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'YoutubeService', responsibility: 'UML facade - orchestrates YouTube.', keyMembers: ['create*', 'get*', 'closeUser'] },
    { name: 'User', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Channel', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Video', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'VideoAsset', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Comment', responsibility: 'UML class - domain object for YouTube.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'YoutubeService exposes create/get/close and owns composed collections.' },
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
      'main constructs YoutubeService, creates UML domain objects, closes the primary User, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct YoutubeService.',
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
