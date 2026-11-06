import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'PodcastPlatformService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_shows', 'Map<string, Show>'),
    attr('-', '_episodes', 'Map<string, Episode>'),
    attr('-', '_subscriptions', 'Map<string, Subscription>'),
    attr('-', '_playback_states', 'Map<string, PlaybackState>'),
    attr('-', '_episode_ids', 'Map<string, episodeId>'),
  ], [
    method('+', 'createShow', 'name: string', 'Show'),
    method('+', 'createEpisode', 'name: string', 'Episode'),
    method('+', 'createSubscription', 'name: string', 'Subscription'),
    method('+', 'createPlaybackState', 'name: string', 'PlaybackState'),
    method('+', 'createepisodeId', 'name: string', 'episodeId'),
    method('+', 'getShow', 'id: string', 'Show'),
    method('+', 'getEpisode', 'id: string', 'Episode'),
    method('+', 'getSubscription', 'id: string', 'Subscription'),
    method('+', 'getPlaybackState', 'id: string', 'PlaybackState'),
    method('+', 'getepisodeId', 'id: string', 'episodeId'),
    method('+', 'closeShow', 'id: string', 'Show'),
  ], 'facade'),
  cls('n1', 'Show', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Episode', GRID.x(2), GRID.y(0), [
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
  cls('n4', 'PlaybackState', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'episodeId', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("podcast-platform")


class Show:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Show.id is required")
        if not name or not name.strip():
            raise ValueError("Show.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Show.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Show {self.id} has invalid status={self.status}")
        log.info("[Show.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Show {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Show.close] id=%s -> CLOSED", self.id)


class Episode:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Episode.id is required")
        if not name or not name.strip():
            raise ValueError("Episode.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Episode.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Episode {self.id} has invalid status={self.status}")
        log.info("[Episode.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Episode {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Episode.close] id=%s -> CLOSED", self.id)


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


class PlaybackState:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("PlaybackState.id is required")
        if not name or not name.strip():
            raise ValueError("PlaybackState.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[PlaybackState.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"PlaybackState {self.id} has invalid status={self.status}")
        log.info("[PlaybackState.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"PlaybackState {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[PlaybackState.close] id=%s -> CLOSED", self.id)


class episodeId:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("episodeId.id is required")
        if not name or not name.strip():
            raise ValueError("episodeId.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[episodeId.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"episodeId {self.id} has invalid status={self.status}")
        log.info("[episodeId.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"episodeId {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[episodeId.close] id=%s -> CLOSED", self.id)


class PodcastPlatformService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._shows: Dict[str, Show] = {}
        self._episodes: Dict[str, Episode] = {}
        self._subscriptions: Dict[str, Subscription] = {}
        self._playback_states: Dict[str, PlaybackState] = {}
        self._episode_ids: Dict[str, episodeId] = {}
        log.info("[PodcastPlatformService.__init__] system ready; managing: Show, Episode, Subscription, PlaybackState, episodeId")

    def create_show(self, name: str) -> Show:
        """UML: PodcastPlatformService.create_show(name) -> Show"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Show name is required")
        with self._lock:
            item_id = f"SHO-{self._seq:04d}"
            self._seq += 1
            obj = Show(item_id, cleaned)
            obj.validate()
            self._shows[item_id] = obj
            log.info("[PodcastPlatformService.create_show] stored %s in _shows (count=%s)", item_id, len(self._shows))
            return obj

    def get_show(self, item_id: str) -> Show:
        with self._lock:
            obj = self._shows.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Show id: {item_id}")
            log.info("[PodcastPlatformService.get_show] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_episode(self, name: str) -> Episode:
        """UML: PodcastPlatformService.create_episode(name) -> Episode"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Episode name is required")
        with self._lock:
            item_id = f"EPI-{self._seq:04d}"
            self._seq += 1
            obj = Episode(item_id, cleaned)
            obj.validate()
            self._episodes[item_id] = obj
            log.info("[PodcastPlatformService.create_episode] stored %s in _episodes (count=%s)", item_id, len(self._episodes))
            return obj

    def get_episode(self, item_id: str) -> Episode:
        with self._lock:
            obj = self._episodes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Episode id: {item_id}")
            log.info("[PodcastPlatformService.get_episode] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_subscription(self, name: str) -> Subscription:
        """UML: PodcastPlatformService.create_subscription(name) -> Subscription"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Subscription name is required")
        with self._lock:
            item_id = f"SUB-{self._seq:04d}"
            self._seq += 1
            obj = Subscription(item_id, cleaned)
            obj.validate()
            self._subscriptions[item_id] = obj
            log.info("[PodcastPlatformService.create_subscription] stored %s in _subscriptions (count=%s)", item_id, len(self._subscriptions))
            return obj

    def get_subscription(self, item_id: str) -> Subscription:
        with self._lock:
            obj = self._subscriptions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Subscription id: {item_id}")
            log.info("[PodcastPlatformService.get_subscription] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_playback_state(self, name: str) -> PlaybackState:
        """UML: PodcastPlatformService.create_playback_state(name) -> PlaybackState"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("PlaybackState name is required")
        with self._lock:
            item_id = f"PLA-{self._seq:04d}"
            self._seq += 1
            obj = PlaybackState(item_id, cleaned)
            obj.validate()
            self._playback_states[item_id] = obj
            log.info("[PodcastPlatformService.create_playback_state] stored %s in _playback_states (count=%s)", item_id, len(self._playback_states))
            return obj

    def get_playback_state(self, item_id: str) -> PlaybackState:
        with self._lock:
            obj = self._playback_states.get(item_id)
            if obj is None:
                raise KeyError(f"unknown PlaybackState id: {item_id}")
            log.info("[PodcastPlatformService.get_playback_state] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_episode_id(self, name: str) -> episodeId:
        """UML: PodcastPlatformService.create_episode_id(name) -> episodeId"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("episodeId name is required")
        with self._lock:
            item_id = f"EPI-{self._seq:04d}"
            self._seq += 1
            obj = episodeId(item_id, cleaned)
            obj.validate()
            self._episode_ids[item_id] = obj
            log.info("[PodcastPlatformService.create_episode_id] stored %s in _episode_ids (count=%s)", item_id, len(self._episode_ids))
            return obj

    def get_episode_id(self, item_id: str) -> episodeId:
        with self._lock:
            obj = self._episode_ids.get(item_id)
            if obj is None:
                raise KeyError(f"unknown episodeId id: {item_id}")
            log.info("[PodcastPlatformService.get_episode_id] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_show(self, item_id: str) -> Show:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._shows.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Show id: {item_id}")
            log.info("[PodcastPlatformService.close_show] closing %s via Show.close()", item_id)
            obj.close()
            return obj

    def list_active_shows(self) -> List[Show]:
        with self._lock:
            active = [o for o in self._shows.values() if o.status == "ACTIVE"]
            log.info("[PodcastPlatformService.list_active_shows] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct PodcastPlatformService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = PodcastPlatformService()

    log.info("========== STEP 2: Create primary Show objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_show("alpha-show")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_show("beta-show")

    log.info("========== STEP 3: Create Episode (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_episode("sample-episode")

    log.info("========== STEP 4: Create Subscription (UML class) ==========")
    system.create_subscription("sample-subscription")

    log.info("========== STEP 5: Create PlaybackState (UML class) ==========")
    system.create_playback_state("sample-playback_state")

    log.info("========== STEP 6: Create episodeId (UML class) ==========")
    system.create_episode_id("sample-episode_id")

    log.info("========== STEP 7: Inspect active Show list ==========")
    system.list_active_shows()

    log.info("========== STEP 8: Close first Show ==========")
    system.close_show(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_show(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Show.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_show("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_show: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_shows()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Show {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Show(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Show.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Show.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Show.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Show " + id + " invalid status");
    }
    System.out.println("[Show.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Show " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Show.close] id=" + id + " -> CLOSED");
  }
}


class Episode {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Episode(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Episode.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Episode.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Episode.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Episode " + id + " invalid status");
    }
    System.out.println("[Episode.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Episode " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Episode.close] id=" + id + " -> CLOSED");
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


class PlaybackState {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  PlaybackState(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("PlaybackState.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("PlaybackState.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[PlaybackState.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("PlaybackState " + id + " invalid status");
    }
    System.out.println("[PlaybackState.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("PlaybackState " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[PlaybackState.close] id=" + id + " -> CLOSED");
  }
}


class episodeId {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  episodeId(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("episodeId.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("episodeId.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[episodeId.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("episodeId " + id + " invalid status");
    }
    System.out.println("[episodeId.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("episodeId " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[episodeId.close] id=" + id + " -> CLOSED");
  }
}

public class PodcastPlatformService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Show> shows = new LinkedHashMap<>();
  private final Map<String, Episode> episodes = new LinkedHashMap<>();
  private final Map<String, Subscription> subscriptions = new LinkedHashMap<>();
  private final Map<String, PlaybackState> playback_states = new LinkedHashMap<>();
  private final Map<String, episodeId> episode_ids = new LinkedHashMap<>();

  public PodcastPlatformService() {
    System.out.println("[PodcastPlatformService.__init__] system ready");
  }

  public Show createShow(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Show name required");
    }
    lock.lock();
    try {
      String id = String.format("SHO-%04d", seq++);
      Show obj = new Show(id, name.trim());
      obj.validate();
      shows.put(id, obj);
      System.out.println("[PodcastPlatformService.createShow] stored " + id + " count=" + shows.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Show getShow(String id) {
    lock.lock();
    try {
      Show obj = shows.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Show id: " + id);
      }
      System.out.println("[PodcastPlatformService.getShow] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Episode createEpisode(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Episode name required");
    }
    lock.lock();
    try {
      String id = String.format("EPI-%04d", seq++);
      Episode obj = new Episode(id, name.trim());
      obj.validate();
      episodes.put(id, obj);
      System.out.println("[PodcastPlatformService.createEpisode] stored " + id + " count=" + episodes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Episode getEpisode(String id) {
    lock.lock();
    try {
      Episode obj = episodes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Episode id: " + id);
      }
      System.out.println("[PodcastPlatformService.getEpisode] found id=" + obj.getId());
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
      System.out.println("[PodcastPlatformService.createSubscription] stored " + id + " count=" + subscriptions.size());
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
      System.out.println("[PodcastPlatformService.getSubscription] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public PlaybackState createPlaybackState(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("PlaybackState name required");
    }
    lock.lock();
    try {
      String id = String.format("PLA-%04d", seq++);
      PlaybackState obj = new PlaybackState(id, name.trim());
      obj.validate();
      playback_states.put(id, obj);
      System.out.println("[PodcastPlatformService.createPlaybackState] stored " + id + " count=" + playback_states.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public PlaybackState getPlaybackState(String id) {
    lock.lock();
    try {
      PlaybackState obj = playback_states.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown PlaybackState id: " + id);
      }
      System.out.println("[PodcastPlatformService.getPlaybackState] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public episodeId createepisodeId(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("episodeId name required");
    }
    lock.lock();
    try {
      String id = String.format("EPI-%04d", seq++);
      episodeId obj = new episodeId(id, name.trim());
      obj.validate();
      episode_ids.put(id, obj);
      System.out.println("[PodcastPlatformService.createepisodeId] stored " + id + " count=" + episode_ids.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public episodeId getepisodeId(String id) {
    lock.lock();
    try {
      episodeId obj = episode_ids.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown episodeId id: " + id);
      }
      System.out.println("[PodcastPlatformService.getepisodeId] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Show closeShow(String id) {
    lock.lock();
    try {
      Show obj = shows.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Show id: " + id);
      }
      System.out.println("[PodcastPlatformService.closeShow] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Show> listActiveShows() {
    lock.lock();
    try {
      List<Show> out = new ArrayList<>();
      for (Show o : shows.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[PodcastPlatformService.listActiveShows] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct PodcastPlatformService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    PodcastPlatformService system = new PodcastPlatformService();
    System.out.println("========== STEP 2: Create Show objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Show first = system.createShow("alpha-show");
    system.createShow("beta-show");
    System.out.println("========== STEP 3: Create Episode ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createEpisode("sample-episode");
    System.out.println("========== STEP 4: Create Subscription ==========");
    system.createSubscription("sample-subscription");
    System.out.println("========== STEP 5: Create PlaybackState ==========");
    system.createPlaybackState("sample-playback_state");
    System.out.println("========== STEP 6: Create episodeId ==========");
    system.createepisodeId("sample-episode_id");
    System.out.println("========== Inspect active list ==========");
    system.listActiveShows();
    System.out.println("========== Close first Show ==========");
    system.closeShow(first.getId());
    try {
      system.closeShow(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getShow("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Show {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Show.id required')
    }

    if (!name?.trim()) {
      throw new Error('Show.name required')
    }
    console.log(\`[Show.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Show \${this.id} invalid status\`)
    }
    console.log(\`[Show.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Show \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Show.close] id=\${this.id} -> CLOSED\`)
  }
}


class Episode {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Episode.id required')
    }

    if (!name?.trim()) {
      throw new Error('Episode.name required')
    }
    console.log(\`[Episode.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Episode \${this.id} invalid status\`)
    }
    console.log(\`[Episode.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Episode \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Episode.close] id=\${this.id} -> CLOSED\`)
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


class PlaybackState {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('PlaybackState.id required')
    }

    if (!name?.trim()) {
      throw new Error('PlaybackState.name required')
    }
    console.log(\`[PlaybackState.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`PlaybackState \${this.id} invalid status\`)
    }
    console.log(\`[PlaybackState.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`PlaybackState \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[PlaybackState.close] id=\${this.id} -> CLOSED\`)
  }
}


class episodeId {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('episodeId.id required')
    }

    if (!name?.trim()) {
      throw new Error('episodeId.name required')
    }
    console.log(\`[episodeId.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`episodeId \${this.id} invalid status\`)
    }
    console.log(\`[episodeId.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`episodeId \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[episodeId.close] id=\${this.id} -> CLOSED\`)
  }
}

class PodcastPlatformService {
  private seq = 1
  private shows = new Map<string, Show>()
  private episodes = new Map<string, Episode>()
  private subscriptions = new Map<string, Subscription>()
  private playback_states = new Map<string, PlaybackState>()
  private episode_ids = new Map<string, episodeId>()
  constructor() {
    console.log('[PodcastPlatformService.__init__] system ready')
  }

  createShow(name: string): Show {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Show name required')
    }
    const id = \`SHO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Show(id, cleaned)
    obj.validate()
    this.shows.set(id, obj)
    console.log(\`[PodcastPlatformService.createShow] stored \${id} count=\${this.shows.size}\`)
    return obj
  }

  getShow(id: string): Show {
    const obj = this.shows.get(id)
    if (!obj) {
      throw new Error(\`unknown Show id: \${id}\`)
    }
    console.log(\`[PodcastPlatformService.getShow] found id=\${obj.id}\`)
    return obj
  }

  createEpisode(name: string): Episode {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Episode name required')
    }
    const id = \`EPI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Episode(id, cleaned)
    obj.validate()
    this.episodes.set(id, obj)
    console.log(\`[PodcastPlatformService.createEpisode] stored \${id} count=\${this.episodes.size}\`)
    return obj
  }

  getEpisode(id: string): Episode {
    const obj = this.episodes.get(id)
    if (!obj) {
      throw new Error(\`unknown Episode id: \${id}\`)
    }
    console.log(\`[PodcastPlatformService.getEpisode] found id=\${obj.id}\`)
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
    console.log(\`[PodcastPlatformService.createSubscription] stored \${id} count=\${this.subscriptions.size}\`)
    return obj
  }

  getSubscription(id: string): Subscription {
    const obj = this.subscriptions.get(id)
    if (!obj) {
      throw new Error(\`unknown Subscription id: \${id}\`)
    }
    console.log(\`[PodcastPlatformService.getSubscription] found id=\${obj.id}\`)
    return obj
  }

  createPlaybackState(name: string): PlaybackState {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('PlaybackState name required')
    }
    const id = \`PLA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new PlaybackState(id, cleaned)
    obj.validate()
    this.playback_states.set(id, obj)
    console.log(\`[PodcastPlatformService.createPlaybackState] stored \${id} count=\${this.playback_states.size}\`)
    return obj
  }

  getPlaybackState(id: string): PlaybackState {
    const obj = this.playback_states.get(id)
    if (!obj) {
      throw new Error(\`unknown PlaybackState id: \${id}\`)
    }
    console.log(\`[PodcastPlatformService.getPlaybackState] found id=\${obj.id}\`)
    return obj
  }

  createepisodeId(name: string): episodeId {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('episodeId name required')
    }
    const id = \`EPI-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new episodeId(id, cleaned)
    obj.validate()
    this.episode_ids.set(id, obj)
    console.log(\`[PodcastPlatformService.createepisodeId] stored \${id} count=\${this.episode_ids.size}\`)
    return obj
  }

  getepisodeId(id: string): episodeId {
    const obj = this.episode_ids.get(id)
    if (!obj) {
      throw new Error(\`unknown episodeId id: \${id}\`)
    }
    console.log(\`[PodcastPlatformService.getepisodeId] found id=\${obj.id}\`)
    return obj
  }

  closeShow(id: string): Show {
    const obj = this.getShow(id)
    console.log(\`[PodcastPlatformService.closeShow] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveShows(): Show[] {
    const active = [...this.shows.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[PodcastPlatformService.listActiveShows] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct PodcastPlatformService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new PodcastPlatformService()
  console.log('========== STEP 2: Create Show objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createShow('alpha-show')
  system.createShow('beta-show')
  console.log('========== STEP 3: Create Episode ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createEpisode('sample-episode')
  console.log('========== STEP 4: Create Subscription ==========')
  system.createSubscription('sample-subscription')
  console.log('========== STEP 5: Create PlaybackState ==========')
  system.createPlaybackState('sample-playback_state')
  console.log('========== STEP 6: Create episodeId ==========')
  system.createepisodeId('sample-episode_id')
  system.listActiveShows()
  console.log('========== Close first Show ==========')
  system.closeShow(first.id)
  try {
    system.closeShow(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getShow('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Show {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Show(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Show requires id and name");
    }
    cout << "[Show.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Show invalid status");
    }
    cout << "[Show.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Show cannot close");
    }
    status_ = "CLOSED";
    cout << "[Show.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Episode {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Episode(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Episode requires id and name");
    }
    cout << "[Episode.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Episode invalid status");
    }
    cout << "[Episode.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Episode cannot close");
    }
    status_ = "CLOSED";
    cout << "[Episode.close] id=" << id_ << " -> CLOSED" << endl;
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


class PlaybackState {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  PlaybackState(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("PlaybackState requires id and name");
    }
    cout << "[PlaybackState.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("PlaybackState invalid status");
    }
    cout << "[PlaybackState.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("PlaybackState cannot close");
    }
    status_ = "CLOSED";
    cout << "[PlaybackState.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class episodeId {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  episodeId(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("episodeId requires id and name");
    }
    cout << "[episodeId.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("episodeId invalid status");
    }
    cout << "[episodeId.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("episodeId cannot close");
    }
    status_ = "CLOSED";
    cout << "[episodeId.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class PodcastPlatformService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Show> shows_;
  unordered_map<string, Episode> episodes_;
  unordered_map<string, Subscription> subscriptions_;
  unordered_map<string, PlaybackState> playback_states_;
  unordered_map<string, episodeId> episode_ids_;
public:
  PodcastPlatformService() {
    cout << "[PodcastPlatformService.__init__] system ready" << endl;
  }

  Show createShow(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Show name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SHO-%04d", seq_++);
    Show obj{buf, name};
    obj.validate();
    shows_.emplace(obj.id(), obj);
    cout << "[PodcastPlatformService.createShow] stored " << obj.id() << endl;
    return obj;
  }

  Show getShow(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = shows_.find(id);
    if (it == shows_.end()) {
      throw out_of_range("unknown Show id");
    }
    cout << "[PodcastPlatformService.getShow] found " << id << endl;
    return it->second;
  }

  Episode createEpisode(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Episode name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "EPI-%04d", seq_++);
    Episode obj{buf, name};
    obj.validate();
    episodes_.emplace(obj.id(), obj);
    cout << "[PodcastPlatformService.createEpisode] stored " << obj.id() << endl;
    return obj;
  }

  Episode getEpisode(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = episodes_.find(id);
    if (it == episodes_.end()) {
      throw out_of_range("unknown Episode id");
    }
    cout << "[PodcastPlatformService.getEpisode] found " << id << endl;
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
    cout << "[PodcastPlatformService.createSubscription] stored " << obj.id() << endl;
    return obj;
  }

  Subscription getSubscription(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = subscriptions_.find(id);
    if (it == subscriptions_.end()) {
      throw out_of_range("unknown Subscription id");
    }
    cout << "[PodcastPlatformService.getSubscription] found " << id << endl;
    return it->second;
  }

  PlaybackState createPlaybackState(const string& name) {
    if (name.empty()) {
      throw invalid_argument("PlaybackState name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PLA-%04d", seq_++);
    PlaybackState obj{buf, name};
    obj.validate();
    playback_states_.emplace(obj.id(), obj);
    cout << "[PodcastPlatformService.createPlaybackState] stored " << obj.id() << endl;
    return obj;
  }

  PlaybackState getPlaybackState(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = playback_states_.find(id);
    if (it == playback_states_.end()) {
      throw out_of_range("unknown PlaybackState id");
    }
    cout << "[PodcastPlatformService.getPlaybackState] found " << id << endl;
    return it->second;
  }

  episodeId createepisodeId(const string& name) {
    if (name.empty()) {
      throw invalid_argument("episodeId name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "EPI-%04d", seq_++);
    episodeId obj{buf, name};
    obj.validate();
    episode_ids_.emplace(obj.id(), obj);
    cout << "[PodcastPlatformService.createepisodeId] stored " << obj.id() << endl;
    return obj;
  }

  episodeId getepisodeId(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = episode_ids_.find(id);
    if (it == episode_ids_.end()) {
      throw out_of_range("unknown episodeId id");
    }
    cout << "[PodcastPlatformService.getepisodeId] found " << id << endl;
    return it->second;
  }

  Show closeShow(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = shows_.find(id);
    if (it == shows_.end()) {
      throw out_of_range("unknown Show");
    }
    cout << "[PodcastPlatformService.closeShow] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct PodcastPlatformService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  PodcastPlatformService system;
  cout << "========== STEP 2: Create Show ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createShow("alpha-show");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createShow("beta-show");
  system.createEpisode("sample-episode");
  system.createSubscription("sample-subscription");
  system.createPlaybackState("sample-playback_state");
  system.createepisodeId("sample-episode_id");
  system.closeShow(first.id());
  try {
    system.closeShow(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getShow("MISSING-ID");
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

type Show struct {
  ID     string
  Name   string
  Status string
}

func NewShow(id, name string) (*Show, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Show requires id and name")
  }
  obj := &Show{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Show.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Show) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Show invalid status")
  }
  fmt.Printf("[Show.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Show) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Show %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Show.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Episode struct {
  ID     string
  Name   string
  Status string
}

func NewEpisode(id, name string) (*Episode, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Episode requires id and name")
  }
  obj := &Episode{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Episode.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Episode) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Episode invalid status")
  }
  fmt.Printf("[Episode.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Episode) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Episode %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Episode.close] id=%s -> CLOSED\\n", o.ID)
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


type PlaybackState struct {
  ID     string
  Name   string
  Status string
}

func NewPlaybackState(id, name string) (*PlaybackState, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("PlaybackState requires id and name")
  }
  obj := &PlaybackState{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[PlaybackState.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *PlaybackState) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("PlaybackState invalid status")
  }
  fmt.Printf("[PlaybackState.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *PlaybackState) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("PlaybackState %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[PlaybackState.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type episodeId struct {
  ID     string
  Name   string
  Status string
}

func NewepisodeId(id, name string) (*episodeId, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("episodeId requires id and name")
  }
  obj := &episodeId{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[episodeId.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *episodeId) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("episodeId invalid status")
  }
  fmt.Printf("[episodeId.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *episodeId) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("episodeId %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[episodeId.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type PodcastPlatformService struct {
  mu  sync.Mutex
  seq int
  shows map[string]*Show
  episodes map[string]*Episode
  subscriptions map[string]*Subscription
  playback_states map[string]*PlaybackState
  episode_ids map[string]*episodeId
}

func NewPodcastPlatformService() *PodcastPlatformService {
  fmt.Println("[PodcastPlatformService.__init__] system ready")
  return &PodcastPlatformService{
    seq: 1,
    shows: map[string]*Show{},
    episodes: map[string]*Episode{},
    subscriptions: map[string]*Subscription{},
    playback_states: map[string]*PlaybackState{},
    episode_ids: map[string]*episodeId{},
  }
}

func (s *PodcastPlatformService) CreateShow(name string) (*Show, error) {
  if name == "" {
    return nil, fmt.Errorf("Show name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SHO-%04d", s.seq)
  s.seq++
  obj, err := NewShow(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.shows[id] = obj
  fmt.Printf("[PodcastPlatformService.CreateShow] stored %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) GetShow(id string) (*Show, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.shows[id]
  if !ok {
    return nil, fmt.Errorf("unknown Show id: %s", id)
  }
  fmt.Printf("[PodcastPlatformService.GetShow] found %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) CreateEpisode(name string) (*Episode, error) {
  if name == "" {
    return nil, fmt.Errorf("Episode name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("EPI-%04d", s.seq)
  s.seq++
  obj, err := NewEpisode(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.episodes[id] = obj
  fmt.Printf("[PodcastPlatformService.CreateEpisode] stored %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) GetEpisode(id string) (*Episode, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.episodes[id]
  if !ok {
    return nil, fmt.Errorf("unknown Episode id: %s", id)
  }
  fmt.Printf("[PodcastPlatformService.GetEpisode] found %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) CreateSubscription(name string) (*Subscription, error) {
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
  fmt.Printf("[PodcastPlatformService.CreateSubscription] stored %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) GetSubscription(id string) (*Subscription, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.subscriptions[id]
  if !ok {
    return nil, fmt.Errorf("unknown Subscription id: %s", id)
  }
  fmt.Printf("[PodcastPlatformService.GetSubscription] found %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) CreatePlaybackState(name string) (*PlaybackState, error) {
  if name == "" {
    return nil, fmt.Errorf("PlaybackState name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PLA-%04d", s.seq)
  s.seq++
  obj, err := NewPlaybackState(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.playback_states[id] = obj
  fmt.Printf("[PodcastPlatformService.CreatePlaybackState] stored %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) GetPlaybackState(id string) (*PlaybackState, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.playback_states[id]
  if !ok {
    return nil, fmt.Errorf("unknown PlaybackState id: %s", id)
  }
  fmt.Printf("[PodcastPlatformService.GetPlaybackState] found %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) CreateepisodeId(name string) (*episodeId, error) {
  if name == "" {
    return nil, fmt.Errorf("episodeId name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("EPI-%04d", s.seq)
  s.seq++
  obj, err := NewepisodeId(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.episode_ids[id] = obj
  fmt.Printf("[PodcastPlatformService.CreateepisodeId] stored %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) GetepisodeId(id string) (*episodeId, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.episode_ids[id]
  if !ok {
    return nil, fmt.Errorf("unknown episodeId id: %s", id)
  }
  fmt.Printf("[PodcastPlatformService.GetepisodeId] found %s\\n", id)
  return obj, nil
}

func (s *PodcastPlatformService) CloseShow(id string) (*Show, error) {
  obj, err := s.GetShow(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[PodcastPlatformService.CloseShow] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct PodcastPlatformService ==========")
  system := NewPodcastPlatformService()
  fmt.Println("========== STEP 2: Create Show ==========")
  first, _ := system.CreateShow("alpha-show")
  system.CreateShow("beta-show")
  system.CreateEpisode("sample-episode")
  system.CreateSubscription("sample-subscription")
  system.CreatePlaybackState("sample-playback_state")
  system.CreateepisodeId("sample-episode_id")
  system.CloseShow(first.ID)
  if _, err := system.CloseShow(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetShow("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Show {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Show(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Show requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Show.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Show invalid status");
    }
    Console.WriteLine("[Show.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Show " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Show.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Episode {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Episode(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Episode requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Episode.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Episode invalid status");
    }
    Console.WriteLine("[Episode.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Episode " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Episode.close] id=" + Id + " -> CLOSED");
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


sealed class PlaybackState {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public PlaybackState(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("PlaybackState requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[PlaybackState.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("PlaybackState invalid status");
    }
    Console.WriteLine("[PlaybackState.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("PlaybackState " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[PlaybackState.close] id=" + Id + " -> CLOSED");
  }
}


sealed class episodeId {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public episodeId(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("episodeId requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[episodeId.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("episodeId invalid status");
    }
    Console.WriteLine("[episodeId.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("episodeId " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[episodeId.close] id=" + Id + " -> CLOSED");
  }
}

sealed class PodcastPlatformService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Show> _shows = new();
  private readonly Dictionary<string, Episode> _episodes = new();
  private readonly Dictionary<string, Subscription> _subscriptions = new();
  private readonly Dictionary<string, PlaybackState> _playback_states = new();
  private readonly Dictionary<string, episodeId> _episode_ids = new();
  public PodcastPlatformService() {
    Console.WriteLine("[PodcastPlatformService.__init__] system ready");
  }

  public Show CreateShow(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Show name required");
    }
    lock (_gate) {
      var id = string.Format("SHO-{0:D4}", _seq++);
      var obj = new Show(id, name.Trim());
      obj.Validate();
      _shows[id] = obj;
      Console.WriteLine("[PodcastPlatformService.CreateShow] stored " + id);
      return obj;
    }
  }

  public Show GetShow(string id) {
    lock (_gate) {
      if (!_shows.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Show id: " + id);
      }
      Console.WriteLine("[PodcastPlatformService.GetShow] found " + id);
      return obj;
    }
  }

  public Episode CreateEpisode(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Episode name required");
    }
    lock (_gate) {
      var id = string.Format("EPI-{0:D4}", _seq++);
      var obj = new Episode(id, name.Trim());
      obj.Validate();
      _episodes[id] = obj;
      Console.WriteLine("[PodcastPlatformService.CreateEpisode] stored " + id);
      return obj;
    }
  }

  public Episode GetEpisode(string id) {
    lock (_gate) {
      if (!_episodes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Episode id: " + id);
      }
      Console.WriteLine("[PodcastPlatformService.GetEpisode] found " + id);
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
      Console.WriteLine("[PodcastPlatformService.CreateSubscription] stored " + id);
      return obj;
    }
  }

  public Subscription GetSubscription(string id) {
    lock (_gate) {
      if (!_subscriptions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Subscription id: " + id);
      }
      Console.WriteLine("[PodcastPlatformService.GetSubscription] found " + id);
      return obj;
    }
  }

  public PlaybackState CreatePlaybackState(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("PlaybackState name required");
    }
    lock (_gate) {
      var id = string.Format("PLA-{0:D4}", _seq++);
      var obj = new PlaybackState(id, name.Trim());
      obj.Validate();
      _playback_states[id] = obj;
      Console.WriteLine("[PodcastPlatformService.CreatePlaybackState] stored " + id);
      return obj;
    }
  }

  public PlaybackState GetPlaybackState(string id) {
    lock (_gate) {
      if (!_playback_states.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown PlaybackState id: " + id);
      }
      Console.WriteLine("[PodcastPlatformService.GetPlaybackState] found " + id);
      return obj;
    }
  }

  public episodeId CreateepisodeId(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("episodeId name required");
    }
    lock (_gate) {
      var id = string.Format("EPI-{0:D4}", _seq++);
      var obj = new episodeId(id, name.Trim());
      obj.Validate();
      _episode_ids[id] = obj;
      Console.WriteLine("[PodcastPlatformService.CreateepisodeId] stored " + id);
      return obj;
    }
  }

  public episodeId GetepisodeId(string id) {
    lock (_gate) {
      if (!_episode_ids.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown episodeId id: " + id);
      }
      Console.WriteLine("[PodcastPlatformService.GetepisodeId] found " + id);
      return obj;
    }
  }

  public Show CloseShow(string id) {
    var obj = GetShow(id);
    Console.WriteLine("[PodcastPlatformService.CloseShow] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct PodcastPlatformService ==========");
    var system = new PodcastPlatformService();
    Console.WriteLine("========== STEP 2: Create Show ==========");
    var first = system.CreateShow("alpha-show");
    system.CreateShow("beta-show");
    system.CreateEpisode("sample-episode");
    system.CreateSubscription("sample-subscription");
    system.CreatePlaybackState("sample-playback_state");
    system.CreateepisodeId("sample-episode_id");
    system.CloseShow(first.Id);
    try {
      system.CloseShow(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetShow("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const podcastPlatformSolution: ProblemSolution = {
  slug: 'podcast-platform',
  title: 'Podcast Platform - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a podcast platform supporting show subscriptions, episode downloads, playback position sync, and recommendations. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Subscribe to a podcast show to get new episode notifications',
      'Stream or download an episode for offline playback',
      'Resume playback from the last position, synced across devices',
      'Adjust playback speed',
      'Auto-download new episodes for subscribed shows',
      'Recommend shows based on listening history',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Subscribe to a podcast show to get new episode notifications?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Stream or download an episode for offline playback?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Resume playback from the last position, synced across devices?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Adjust playback speed?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Auto-download new episodes for subscribed shows?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. PodcastPlatformService is the facade stereotype. Show, Episode, Subscription, PlaybackState, episodeId are concrete domain classes with id/name/status and validate/close.',
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
          'Construct PodcastPlatformService.',
          'createShow twice and create the related UML classes.',
          'closeShow once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'PodcastPlatformService', responsibility: 'UML facade - orchestrates Podcast Platform.', keyMembers: ['create*', 'get*', 'closeShow'] },
    { name: 'Show', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Episode', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Subscription', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'PlaybackState', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'episodeId', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from PodcastPlatformService to Show, Episode, Subscription, PlaybackState, episodeId. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on PodcastPlatformService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'PodcastPlatformService', responsibility: 'UML facade - orchestrates Podcast Platform.', keyMembers: ['create*', 'get*', 'closeShow'] },
    { name: 'Show', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Episode', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Subscription', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'PlaybackState', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'episodeId', responsibility: 'UML class - domain object for Podcast Platform.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'PodcastPlatformService exposes create/get/close and owns composed collections.' },
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
      'main constructs PodcastPlatformService, creates UML domain objects, closes the primary Show, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct PodcastPlatformService.',
      'createShow for alpha and beta.',
      'create remaining UML classes.',
      'closeShow(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createShow("alpha..."); closeShow(id)',
        output: '[Show.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeShow(alreadyClosed) or getShow("MISSING-ID")',
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
